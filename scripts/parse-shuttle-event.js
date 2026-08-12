import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
	return 'large'; // Very large shuttles
}

function calculatePrice(entityCount) {
	// Base price + entity count based pricing
	const basePrice = 100000;
	const pricePerEntity = 50;
	return basePrice + Math.floor(entityCount * pricePerEntity);
}

function createShuttleFromFile(filename, shuttleEventDir) {
	const id = path.basename(filename, '.yml').toLowerCase().replace(/[_\s]/g, '-');
	const ymlPath = path.join(shuttleEventDir, filename);

	let name = null;
	let entityCount = 0;

	try {
		const content = fs.readFileSync(ymlPath, 'utf-8');
		const data = parseShuttleData(content);
		name = data.name;
		entityCount = data.entityCount;
	} catch (error) {
		console.warn(`Warning: Could not parse ${filename}: ${error.message}`);
	}

	// Fallback to filename if name not found in YML
	if (!name) {
		name = path.basename(filename, '.yml')
			.split(/[_\s]/)
			.map(word => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ');
	}

	// Determine size and price based on entity count
	const size = determineShuttleSize(entityCount);
	const price = calculatePrice(entityCount);

	// Check if PNG file exists for this shuttle in static directory
	const staticDir = path.join(__dirname, '..', 'static');
	const pngName = `${id}.png`;
	const pngPath = path.join(staticDir, pngName);

	// Use shuttle-specific image if it exists, otherwise fallback to placeholder
	const imagePath = fs.existsSync(pngPath) ? `/${pngName}` : '/atom.png';

	return {
		id: `eighth-${id}`,
		name: name,
		description: `Шаттл Восьмого Экспедиционного флота.`,
		price: price,
		group: 'eighth_fleet',
		size: size,
		classes: ['expedition'],
		engines: ['apu'],
		image: imagePath
	};
}

function main() {
	const shuttleEventDir = path.join(__dirname, '..', 'ShuttleEvent');
	const outputPath = path.join(__dirname, '..', 'src', 'lib', 'data', 'shuttles.json');

	if (!fs.existsSync(shuttleEventDir)) {
		console.error('ShuttleEvent directory not found');
		process.exit(1);
	}

	const ymlFiles = fs.readdirSync(shuttleEventDir)
		.filter(f => f.endsWith('.yml'));

	const existingShuttles = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));

	const otherShuttles = existingShuttles.filter(s => s.group !== 'eighth_fleet');

	const newEighthFleetShuttles = ymlFiles.map(f => createShuttleFromFile(f, shuttleEventDir));

	const allShuttles = [...otherShuttles, ...newEighthFleetShuttles];

	fs.writeFileSync(outputPath, JSON.stringify(allShuttles, null, 2), 'utf-8');

	console.log(`✓ Обработано ${ymlFiles.length} файлов из ShuttleEvent`);
	console.log(`✓ Создано ${newEighthFleetShuttles.length} шаттлов группы eighth_fleet`);
	console.log(`✓ Обновлен ${outputPath}`);
}

main();
