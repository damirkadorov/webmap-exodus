import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createShuttleFromFile(filename) {
	const id = path.basename(filename, '.yml').toLowerCase().replace(/[_\s]/g, '-');
	const name = path.basename(filename, '.yml')
		.split(/[_\s]/)
		.map(word => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');

	return {
		id: `eighth-${id}`,
		name: `8ЭФ ${name}`,
		description: `Шаттл Восьмого Экспедиционного флота.`,
		price: 150000,
		group: 'eighth_fleet',
		size: 'medium',
		classes: ['expedition'],
		engines: ['apu'],
		image: '/atom.png'
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

	const newEighthFleetShuttles = ymlFiles.map(createShuttleFromFile);

	const allShuttles = [...otherShuttles, ...newEighthFleetShuttles];

	fs.writeFileSync(outputPath, JSON.stringify(allShuttles, null, 2), 'utf-8');

	console.log(`✓ Обработано ${ymlFiles.length} файлов из ShuttleEvent`);
	console.log(`✓ Создано ${newEighthFleetShuttles.length} шаттлов группы eighth_fleet`);
	console.log(`✓ Обновлен ${outputPath}`);
}

main();
