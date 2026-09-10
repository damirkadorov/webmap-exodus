import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Shuttle {
	id: string;
	name: string;
	description: string;
	price: number;
	group: string;
	size: string;
	classes: string[];
	engines: string[];
	image: string;
}

interface ShuttleData {
	name: string | null;
	entityCount: number;
}

function isLocalizationKey(str: string | null): boolean {
	if (!str) return true;
	return /^[a-z0-9]+(-[a-z0-9]+){2,}$/.test(str);
}

function nameFromFilename(filename: string): string {
	return path.basename(filename, '.yml')
		.split(/[_\-\s]+/)
		.map(word => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}

function parseShuttleData(ymlContent: string): ShuttleData {
	const nameMatch = ymlContent.match(/- type: MetaData\s+name:\s*(.+)/);
	const name = nameMatch ? nameMatch[1].trim() : null;

	const entityCountMatch = ymlContent.match(/entityCount:\s*(\d+)/);
	const entityCount = entityCountMatch ? parseInt(entityCountMatch[1]) : 0;

	return { name, entityCount };
}

function determineShuttleSize(entityCount: number): string {
	if (entityCount < 500) return 'small';
	if (entityCount < 1000) return 'medium';
	if (entityCount < 2500) return 'large';
	return 'large';
}

function resolveImagePath(id: string): string {
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

function createEighthFleetShuttleFromFile(filename: string, shuttleEventDir: string): Shuttle {
	const id = path.basename(filename, '.yml').toLowerCase().replace(/[_\s]/g, '-');
	const ymlPath = path.join(shuttleEventDir, filename);

	let rawName: string | null = null;
	let entityCount = 0;

	try {
		const content = fs.readFileSync(ymlPath, 'utf-8');
		const data = parseShuttleData(content);
		rawName = data.name;
		entityCount = data.entityCount;
	} catch (error) {
		console.warn(`Warning: Could not parse ${filename}: ${(error as Error).message}`);
	}

	const name = (!rawName || isLocalizationKey(rawName))
		? nameFromFilename(filename)
		: rawName;

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
		image: imagePath
	};
}

function createPoiStationFromFile(filename: string, poiDir: string): Shuttle {
	const id = path.basename(filename, '.yml').toLowerCase().replace(/[_\s]/g, '-');
	const ymlPath = path.join(poiDir, filename);

	let rawName: string | null = null;
	let entityCount = 0;

	try {
		const content = fs.readFileSync(ymlPath, 'utf-8');
		const data = parseShuttleData(content);
		rawName = data.name;
		entityCount = data.entityCount;
	} catch (error) {
		console.warn(`Warning: Could not parse ${filename}: ${(error as Error).message}`);
	}

	const name = (!rawName || isLocalizationKey(rawName))
		? nameFromFilename(filename)
		: rawName;

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

	const existingShuttles: Shuttle[] = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));
	const otherShuttles = existingShuttles.filter(s => s.group !== 'eighth_fleet' && s.group !== 'station');

	const newEighthFleetShuttles = shuttleEventYmlFiles.map(f => createEighthFleetShuttleFromFile(f, shuttleEventDir));
	const newPoiStations = poiYmlFiles.map(f => createPoiStationFromFile(f, poiDir));

	const allShuttles = [...otherShuttles, ...newEighthFleetShuttles, ...newPoiStations];
	fs.writeFileSync(outputPath, JSON.stringify(allShuttles, null, 2), 'utf-8');
}

main();
