import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const shuttlesPath = resolve(root, 'src/lib/data/shuttles.json');
const shuttles = JSON.parse(readFileSync(shuttlesPath, 'utf8'));

const missing = [];

for (const shuttle of shuttles) {
	const image = typeof shuttle.image === 'string' ? shuttle.image : '';
	const imagePath = resolve(root, 'static', image.replace(/^\/+/, ''));
	if (!image || !existsSync(imagePath)) {
		missing.push({ id: shuttle.id, image });
	}
}

if (missing.length > 0) {
	console.error(`Missing shuttle images: ${missing.length}`);
	for (const item of missing) {
		console.error(`- ${item.id}: ${item.image || '<empty>'}`);
	}
	process.exit(1);
}

console.log(`OK: ${shuttles.length} shuttle images are valid.`);
