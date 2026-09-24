import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const EXCLUDED_POI_FILES = new Set([
	'hospital.yml',
	'beaconstation_a.yml',
	'beaconstation_wilds.yml',
	'beaconstation_empty.yml',
	'azimuth_lobby.yml',
	'jupiter.yml',
	'pdvhelios_hw.yml',
	'tsfmchalcyon_hw.yml',
	'surface_outpost_desert.yml',
	'usspbaikal.yml',
	'zetanode.yml',
	'caelestinus_central.yml',
	'colonial.yml'
]);

const MAP_DIRS = [
	'Resources/SharedMaps',
	'Resources/SharedMaps/_Mono/Shuttles/Mieyo',
	'Resources/Maps/_Mono/Shuttles',
	'Resources/Maps/_Mono/POI',
	'Resources/Maps/_Mono/Outpost',
	'Resources/Maps/_Exodus/Shuttles',
	'Resources/Maps/_Exodus/ShuttleEvent',
	'Resources/Maps/_Exodus/POI',
	'Resources/Maps/_Exodus/Supercapitals',
	'Resources/Maps/_Exodus/Outpost',
	'Resources/Maps/Shuttles'
];

/**
 * Updates scripts/maps_checksums.json with the current SHA256 hashes of all maps in Monolith.
 */
export function updateMapsChecksums(monolithDir, currentRepoDir) {
	const checksumsPath = path.join(currentRepoDir, 'scripts', 'maps_checksums.json');

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
	const checksums = {};

	for (const file of uniqueMapFiles) {
		const filename = path.basename(file);
		if (EXCLUDED_POI_FILES.has(filename)) continue;

		const relPath = path.relative(monolithDir, file).replace(/\\/g, '/');
		const content = fs.readFileSync(file);
		const hash = crypto.createHash('sha256').update(content).digest('hex');
		checksums[relPath] = hash;
	}

	// Sort keys for stable diffs
	const sortedChecksums = {};
	for (const key of Object.keys(checksums).sort()) {
		sortedChecksums[key] = checksums[key];
	}

	fs.writeFileSync(checksumsPath, JSON.stringify(sortedChecksums, null, '\t') + '\n', 'utf-8');
	console.log(
		`✓ Updated checksums for ${Object.keys(sortedChecksums).length} maps in ${checksumsPath}`
	);
}

const args = process.argv.slice(2);
const isDirectRun = process.argv[1] && /update-maps-checksums(\.[cm]?js)?$/.test(process.argv[1]);
if (isDirectRun) {
	const monolithDir = args[0] || 'monolith';
	const currentRepoDir = args[1] || '.';
	updateMapsChecksums(monolithDir, currentRepoDir);
}
