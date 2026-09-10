import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Returns true if the string looks like an unresolved SS14 localization key
 * rather than a real human-readable name.
 * Patterns: "company-vessel-blackhawk-kortic-name", "shuttle-omen-name", etc.
 */
function isLocalizationKey(str) {
	if (!str) return true;
	// Localization keys are all-lowercase with hyphens, no spaces, often end in "-name"
	return /^[a-z0-9]+(-[a-z0-9]+){2,}$/.test(str);
}

/**
 * Convert a filename like "blackhawk_kortic.yml" → "Blackhawk Kortic"
 */
function nameFromFilename(filename) {
	return path.basename(filename, '.yml')
		.split(/[_\-\s]+/)
		.map(word => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}

function parseShuttleData(ymlContent) {
	// Extract name from MetaData component
	const nameMatch = ymlContent.match(/- type: MetaData\s+name:\s*(.+)/);
	const name = nameMatch ? nameMatch[1].trim() : null;

	// Extract entity count to determine size
	const entityCountMatch = ymlContent.match(/entityCount:\s*(\d+)/);
	const entityCount = entityCountMatch ? parseInt(entityCountMatch[1]) : 0;

	return { name, entityCount };
}

function determineShuttleSize(entityCount) {
	if (entityCount < 500) return 'small';
	if (entityCount < 1000) return 'medium';
	if (entityCount < 2500) return 'large';
	return 'large';
}

function resolveImagePath(id) {
	const staticDir = path.join(__dirname, '..', 'static');
	const idWithUnderscores = id.replace(/-/g, '_');

	const candidates = [
		`${id}.png`,
		`${id}-0.png`,
		`${idWithUnderscores}.png`,
		`${idWithUnderscores}-0.png`,
	];

	for (const candidate of candidates) {
		if (fs.existsSync(path.join(staticDir, candidate))) {
			return `/${candidate}`;
		}
	}

	return '/atom.png';
}

function createEighthFleetShuttleFromFile(filename, shuttleEventDir) {
	const id = path.basename(filename, '.yml').toLowerCase().replace(/[_\s]/g, '-');
	const ymlPath = path.join(shuttleEventDir, filename);

	let rawName = null;
	let entityCount = 0;

	try {
		const content = fs.readFileSync(ymlPath, 'utf-8');
		const data = parseShuttleData(content);
		rawName = data.name;
		entityCount = data.entityCount;
	} catch (error) {
		console.warn(`Warning: Could not parse ${filename}: ${error.message}`);
	}

	// If the name is a localization key (e.g. "company-vessel-blackhawk-kortic-name")
	// or missing, fall back to a human-readable name derived from the filename.
	const name = (!rawName || isLocalizationKey(rawName))
		? nameFromFilename(filename)
		: rawName;

	if (rawName && isLocalizationKey(rawName)) {
		console.warn(`  ⚠ Unresolved localization key "${rawName}" in ${filename} → using "${name}"`);
	}

	// Determine size based on entity count
	const size = determineShuttleSize(entityCount);

	const imagePath = resolveImagePath(id);

	return {
		id: `eighth-${id}`,
		name,
		description: 'Шаттл Восьмого Экспедиционного флота.',
		price: 0,
		group: 'eighth_fleet',
		size,
		classes: ['expedition'],
		engines: ['apu'],
		image: imagePath,
	};
}

function createPoiStationFromFile(filename, poiDir) {
	const id = path.basename(filename, '.yml').toLowerCase().replace(/[_\s]/g, '-');
	const ymlPath = path.join(poiDir, filename);

	let rawName = null;
	let entityCount = 0;

	try {
		const content = fs.readFileSync(ymlPath, 'utf-8');
		const data = parseShuttleData(content);
		rawName = data.name;
		entityCount = data.entityCount;
	} catch (error) {
		console.warn(`Warning: Could not parse ${filename}: ${error.message}`);
	}

	const name = (!rawName || isLocalizationKey(rawName))
		? nameFromFilename(filename)
		: rawName;

	if (rawName && isLocalizationKey(rawName)) {
		console.warn(`  ⚠ Unresolved localization key "${rawName}" in ${filename} → using "${name}"`);
	}

	const size = determineShuttleSize(entityCount);
	const imagePath = resolveImagePath(id);

	return {
		id: `station-${id}`,
		name,
		description: 'Станция (POI).',
		price: 0,
		group: 'station',
		size,
		classes: ['science'],
		engines: ['apu'],
		image: imagePath
	};
}

function main() {
	const shuttleEventDir = path.join(__dirname, '..', 'ShuttleEvent');
	const poiDir = path.join(__dirname, '..', 'POI');
	const outputPath = path.join(__dirname, '..', 'src', 'lib', 'data', 'shuttles.json');

	const shuttleEventYmlFiles = fs.existsSync(shuttleEventDir)
		? fs.readdirSync(shuttleEventDir).filter(f => f.endsWith('.yml'))
		: [];
	const poiYmlFiles = fs.existsSync(poiDir)
		? fs.readdirSync(poiDir).filter(f => f.endsWith('.yml'))
		: [];

	if (shuttleEventYmlFiles.length === 0 && poiYmlFiles.length === 0) {
		console.error('No ShuttleEvent or POI files found');
		process.exit(1);
	}

	const existingShuttles = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));

	// Keep all non-generated groups (including manually-managed groups)
	const otherShuttles = existingShuttles.filter(s => s.group !== 'eighth_fleet' && s.group !== 'station');

	const newEighthFleetShuttles = shuttleEventYmlFiles.map(f => createEighthFleetShuttleFromFile(f, shuttleEventDir));
	const newPoiStations = poiYmlFiles.map(f => createPoiStationFromFile(f, poiDir));

	const allShuttles = [...otherShuttles, ...newEighthFleetShuttles, ...newPoiStations];

	fs.writeFileSync(outputPath, JSON.stringify(allShuttles, null, 2), 'utf-8');

	console.log(`✓ Обработано ${shuttleEventYmlFiles.length} файлов из ShuttleEvent`);
	console.log(`✓ Создано ${newEighthFleetShuttles.length} шаттлов группы eighth_fleet`);
	console.log(`✓ Обработано ${poiYmlFiles.length} файлов из POI`);
	console.log(`✓ Создано ${newPoiStations.length} станций группы station`);
	console.log(`✓ Сохранено ${otherShuttles.length} шаттлов из других групп`);
	console.log(`✓ Итого: ${allShuttles.length} шаттлов → ${outputPath}`);
}

main();
