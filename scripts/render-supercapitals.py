#!/usr/bin/env python3
"""
Renders supercapital map YAML files into top-down layout PNGs for webmap-exodus.
"""
import base64
import math
import os
import re
from PIL import Image, ImageDraw

def render_carrier(yml_path, out_png, theme):
    with open(yml_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Parse tilemap
    tilemap_match = re.search(r'tilemap:\n((?:\s+\d+:\s+\w+\n)+)', content)
    tilemap = {}
    if tilemap_match:
        for line in tilemap_match.group(1).strip().split('\n'):
            parts = line.strip().split(': ')
            if len(parts) == 2:
                tilemap[int(parts[0])] = parts[1]

    # Parse tiles
    chunk_pattern = re.compile(r'ind:\s*(-?\d+),(-?\d+)\s+tiles:\s*([A-Za-z0-9+/=]+)')
    floors = {}
    min_x, max_x = float('inf'), float('-inf')
    min_y, max_y = float('inf'), float('-inf')

    for match in chunk_pattern.finditer(content):
        cx, cy = int(match.group(1)), int(match.group(2))
        tiles_b64 = match.group(3)
        raw_bytes = base64.b64decode(tiles_b64)

        idx = 0
        for ty in range(16):
            for tx in range(16):
                if idx + 7 <= len(raw_bytes):
                    tile_id = int.from_bytes(raw_bytes[idx:idx+4], byteorder='little', signed=True)
                    def_name = tilemap.get(tile_id, 'Space')
                    if def_name != 'Space' and tile_id > 0:
                        wx = cx * 16 + tx
                        wy = cy * 16 + ty
                        floors[(wx, wy)] = def_name
                        min_x = min(min_x, wx)
                        max_x = max(max_x, wx)
                        min_y = min(min_y, wy)
                        max_y = max(max_y, wy)
                    idx += 7

    # Parse entities
    blocks = re.split(r'\n(?=- proto:)', content)
    walls = {}
    windows = set()
    doors = set()
    machinery = set()

    for b in blocks:
        proto_match = re.match(r'- proto:\s*(\w+)', b)
        if not proto_match:
            continue
        proto = proto_match.group(1)
        p_lower = proto.lower()

        is_wall = 'wall' in p_lower and not any(x in p_lower for x in ['closet', 'shelf', 'jukebox', 'charger', 'mount', 'atm'])
        is_win = 'window' in p_lower or ('glass' in p_lower and 'airlock' not in p_lower)
        is_door = 'door' in p_lower or 'airlock' in p_lower
        is_mach = any(x in p_lower for x in ['engine', 'generator', 'reactor', 'turret', 'console', 'computer', 'smes', 'thruster'])

        if is_wall or is_win or is_door or is_mach:
            positions = re.findall(r'pos:\s*(-?[\d.]+),(-?[\d.]+)', b)
            for px, py in positions:
                x = int(math.floor(float(px)))
                y = int(math.floor(float(py)))
                min_x = min(min_x, x)
                max_x = max(max_x, x)
                min_y = min(min_y, y)
                max_y = max(max_y, y)

                if is_wall:
                    walls[(x, y)] = 'reinforced' if ('reinforced' in p_lower or 'titanium' in p_lower) else 'solid'
                elif is_win:
                    windows.add((x, y))
                elif is_door:
                    doors.add((x, y))
                elif is_mach:
                    machinery.add((x, y))

    pad = 3
    min_x -= pad
    max_x += pad
    min_y -= pad
    max_y += pad

    ts = 16  # tile size in pixels
    w = int((max_x - min_x + 1) * ts)
    h = int((max_y - min_y + 1) * ts)

    img = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    def to_img(x, y):
        ix = (x - min_x) * ts
        iy = (max_y - y) * ts
        return ix, iy

    # 1. Floor tiles
    for (x, y), tile_type in floors.items():
        ix, iy = to_img(x, y)
        f_col = theme['floor']
        if 'reinforced' in tile_type.lower() or 'diamond' in tile_type.lower():
            f_col = theme['floor_heavy']
        elif 'concrete' in tile_type.lower() or 'mono' in tile_type.lower():
            f_col = theme['floor_alt']
        draw.rectangle([ix, iy, ix + ts - 1, iy + ts - 1], fill=f_col, outline=theme['grid_line'])

    # 2. Machinery / Systems
    for (x, y) in machinery:
        ix, iy = to_img(x, y)
        draw.rectangle([ix + 3, iy + 3, ix + ts - 4, iy + ts - 4], fill=theme['tech'], outline=theme['tech_border'])

    # 3. Windows
    for (x, y) in windows:
        ix, iy = to_img(x, y)
        draw.rectangle([ix + 2, iy + 2, ix + ts - 3, iy + ts - 3], fill=theme['window'], outline=theme['window_border'])

    # 4. Doors / Airlocks
    for (x, y) in doors:
        ix, iy = to_img(x, y)
        draw.rectangle([ix + 2, iy + 2, ix + ts - 3, iy + ts - 3], fill=theme['door'], outline=theme['door_border'])

    # 5. Walls
    for (x, y), w_type in walls.items():
        ix, iy = to_img(x, y)
        w_fill = theme['wall_reinforced'] if w_type == 'reinforced' else theme['wall_solid']
        draw.rectangle([ix, iy, ix + ts - 1, iy + ts - 1], fill=w_fill, outline=theme['wall_border'])

    # 6. Exterior Hull Accent Outline
    for (x, y) in walls:
        for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            neighbor = (x + dx, y + dy)
            if neighbor not in floors and neighbor not in walls:
                ix, iy = to_img(x, y)
                if dx == -1:
                    draw.line([ix, iy, ix, iy + ts - 1], fill=theme['accent'], width=2)
                elif dx == 1:
                    draw.line([ix + ts - 1, iy, ix + ts - 1, iy + ts - 1], fill=theme['accent'], width=2)
                elif dy == -1:
                    draw.line([ix, iy + ts - 1, ix + ts - 1, iy + ts - 1], fill=theme['accent'], width=2)
                elif dy == 1:
                    draw.line([ix, iy, ix + ts - 1, iy], fill=theme['accent'], width=2)

    os.makedirs(os.path.dirname(os.path.abspath(out_png)), exist_ok=True)
    img.save(out_png)
    print(f'Rendered {out_png}: {w}x{h} ({len(floors)} floors, {len(walls)} walls, {len(doors)} doors)')

if __name__ == '__main__':
    jupiter_theme = {
        'floor': (38, 42, 54, 240),
        'floor_heavy': (48, 52, 66, 240),
        'floor_alt': (32, 35, 46, 240),
        'grid_line': (24, 28, 38, 180),
        'wall_solid': (85, 75, 45, 255),
        'wall_reinforced': (135, 115, 55, 255),
        'wall_border': (190, 160, 60, 255),
        'door': (200, 150, 40, 220),
        'door_border': (240, 190, 60, 255),
        'window': (80, 160, 180, 160),
        'window_border': (120, 200, 220, 200),
        'tech': (180, 120, 30, 220),
        'tech_border': (230, 170, 50, 255),
        'accent': (218, 165, 32, 255)
    }

    chengdu_theme = {
        'floor': (30, 38, 52, 240),
        'floor_heavy': (42, 52, 70, 240),
        'floor_alt': (25, 32, 45, 240),
        'grid_line': (18, 24, 36, 180),
        'wall_solid': (45, 75, 115, 255),
        'wall_reinforced': (65, 110, 165, 255),
        'wall_border': (90, 150, 220, 255),
        'door': (30, 140, 220, 220),
        'door_border': (60, 180, 250, 255),
        'window': (70, 170, 210, 160),
        'window_border': (100, 210, 255, 200),
        'tech': (35, 100, 180, 220),
        'tech_border': (60, 160, 240, 255),
        'accent': (0, 161, 252, 255)
    }

    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    upstream_dir = os.path.join('D:', os.sep, 'eexouds', 'upstream', 'Monolith')
    j_map = os.path.join(upstream_dir, 'Resources', 'Maps', '_Exodus', 'Supercapitals', 'jupiter.yml')
    c_map = os.path.join(upstream_dir, 'Resources', 'Maps', '_Exodus', 'Supercapitals', 'chengdu.yml')

    if os.path.exists(j_map):
        render_carrier(j_map, os.path.join(base_dir, 'static', 'jupiter-0.png'), jupiter_theme)
    if os.path.exists(c_map):
        render_carrier(c_map, os.path.join(base_dir, 'static', 'chengdu-0.png'), chengdu_theme)
