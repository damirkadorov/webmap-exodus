import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const EXCLUDED_POI_FILES = new Set([
	'hospital.yml',
	'beaconstation_a.yml',
	'beaconstation_wilds.yml'
]);

const MAP_DIRS = [
	'Resources/SharedMaps',
	'Resources/SharedMaps/_Mono/Shuttles/Mieyo',
	'Resources/Maps/_Mono/Shuttles',
	'Resources/Maps/_Exodus/Shuttles',
	'Resources/Maps/_Exodus/ShuttleEvent',
	'Resources/Maps/_Exodus/POI',
	'Resources/Maps/_Exodus/Supercapitals',
	'Resources/Maps/_Exodus/Outpost',
	'Resources/Maps/Shuttles'
];

/**
 * Returns a list of relative map paths that need to be rendered.
 * A map needs rendering if:
 * 1. FORCE_RENDER_ALL is enabled, OR
 * 2. It does not exist in static/ as a PNG, OR
 * 3. Its YAML content SHA256 checksum changed compared to maps_checksums.json.
 */
export function getMapsToRender(monolithDir, currentRepoDir, options = {}) {
	const staticDir = path.join(currentRepoDir, 'static');
	const checksumsPath = path.join(currentRepoDir, 'scripts', 'maps_checksums.json');
	const forceAll = options.forceAll ?? process.env.FORCE_RENDER_ALL === 'true';

	let storedChecksums = {};
	if (fs.existsSync(checksumsPath)) {
		try {
			storedChecksums = JSON.parse(fs.readFileSync(checksumsPath, 'utf-8'));
		} catch (e) {
			console.warn(`Could not read checksums file: ${e.message}`);
		}
	}

	const staticFiles = fs.existsSync(staticDir) ? new Set(fs.readdirSync(staticDir)) : new Set();

	const allMapFiles = [];
	function walk(dir) {
		if (!fs.existsSync(dir)) return;
		for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
			const full = path.join(dir, entry.name);
			if (entry.isDirectory()) {
				walk(full);
			} else if (entry.name.endsWith('.yml')) {
				allMapFiles.push(full);
			}
		}
	}

	for (const d of MAP_DIRS) {
		walk(path.join(monolithDir, d));
	}

	const uniqueMapFiles = [...new Set(allMapFiles)];
	const toRender = [];

	for (const file of uniqueMapFiles) {
		const filename = path.basename(file);
		if (EXCLUDED_POI_FILES.has(filename)) continue;

		const relPath = path.relative(monolithDir, file).replace(/\\/g, '/');
		const baseNoExt = path.basename(file, '.yml');

		const hasImage =
			staticFiles.has(`${baseNoExt}-0.png`) ||
			staticFiles.has(`${baseNoExt}.png`) ||
			(baseNoExt === 'jupiter_hw' && staticFiles.has('jupiter-0.png')) ||
			(baseNoExt === 'damaged_arkansaw' && staticFiles.has('arkansaw-0.png'));

		const content = fs.readFileSync(file);
		const hash = crypto.createHash('sha256').update(content).digest('hex');
		const storedHash = storedChecksums[relPath];

		if (forceAll) {
			toRender.push(relPath);
		} else if (!hasImage) {
			console.log(`[Render Needed] Missing image: ${relPath}`);
			toRender.push(relPath);
		} else if (storedHash && storedHash !== hash) {
			console.log(
				`[Render Needed] Map modified (${storedHash.slice(0, 8)} -> ${hash.slice(0, 8)}): ${relPath}`
			);
			toRender.push(relPath);
		}
	}

	return toRender;
}

const args = process.argv.slice(2);
const isDirectRun = process.argv[1] && /get-maps-to-render(\.[cm]?js)?$/.test(process.argv[1]);
if (isDirectRun) {
	const monolithDir = args[0] || 'monolith';
	const currentRepoDir = args[1] || '.';
	const outputFile = args[2] || path.join(currentRepoDir, 'maps_to_render.txt');

	const maps = getMapsToRender(monolithDir, currentRepoDir);
	console.log(`Maps needing render: ${maps.length}`);

	fs.writeFileSync(outputFile, maps.join('\n') + (maps.length > 0 ? '\n' : ''), 'utf-8');

	const githubOutput = process.env.GITHUB_OUTPUT;
	if (githubOutput) {
		fs.appendFileSync(
			githubOutput,
			`render_needed=${maps.length > 0 ? 'true' : 'false'}\ncount=${maps.length}\n`
		);
	}
}
