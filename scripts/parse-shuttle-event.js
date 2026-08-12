import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseShuttleName(ymlContent) {
	// Extract name from MetaData component
	const nameMatch = ymlContent.match(/- type: MetaData\s+name:\s*(.+)/);
	if (nameMatch) {
		return nameMatch[1].trim();
	}
	return null;
}

function createShuttleFromFile(filename, shuttleEventDir) {
	const id = path.basename(filename, '.yml').toLowerCase().replace(/[_\s]/g, '-');
	const ymlPath = path.join(shuttleEventDir, filename);

	let name = null;
	try {
		const content = fs.readFileSync(ymlPath, 'utf-8');
		name = parseShuttleName(content);
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
		price: 150000,
		group: 'eighth_fleet',
		size: 'medium',
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
