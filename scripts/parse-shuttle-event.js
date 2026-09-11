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
	return path
		.basename(filename, '.yml')
		.split(/[_\-\s]+/)
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
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
		`${idWithUnderscores}-0.png`
	];

	for (const candidate of candidates) {
		if (fs.existsSync(path.join(staticDir, candidate))) {
			return `/${candidate}`;
		}
	}

	return '/atom.png';
}

const KNOWN_EIGHTH_FLEET_INFO = {
	'wyvern.yml': {
		hullClass: 'battleship',
		classes: ['fighter'],
		desc: 'Тяжёлый флагманский дредноут Автоматической Системы Защиты.',
		engines: ['rtg', 'apu']
	},
	'horizont.yml': {
		hullClass: 'cruiser',
		classes: ['fighter', 'patrol'],
		desc: 'Тяжёлый ударный крейсер Автоматической Системы Защиты.',
		engines: ['rtg', 'apu']
	},
	'mantaray.yml': {
		hullClass: 'destroyer',
		classes: ['fighter', 'pursuit'],
		desc: 'Торпедный эсминец Автоматической Системы Защиты.',
		engines: ['rtg', 'apu']
	},
	'stratostar.yml': {
		hullClass: 'frigate',
		classes: ['patrol', 'fighter'],
		desc: 'Тяжёлый боевой фрегат Автоматической Системы Защиты.',
		engines: ['rtg', 'apu']
	},
	'azimuth.yml': {
		hullClass: 'frigate',
		classes: ['patrol', 'fighter'],
		desc: 'Штурмовой фрегат Автоматической Системы Защиты.',
		engines: ['rtg', 'apu']
	},
	'concord_x.yml': {
		hullClass: 'corvette',
		classes: ['patrol', 'fighter'],
		desc: 'Тяжёлый корвет Автоматической Системы Защиты.',
		engines: ['rtg', 'apu']
	},
	'zenith_e.yml': {
		hullClass: 'corvette',
		classes: ['patrol'],
		desc: 'Патрульный корвет модификации «Е» Автоматической Системы Защиты.',
		engines: ['rtg', 'apu']
	},
	'zenith.yml': {
		hullClass: 'corvette',
		classes: ['patrol'],
		desc: 'Боевой корвет Автоматической Системы Защиты.',
		engines: ['rtg', 'apu']
	},
	'zenith_a.yml': {
		hullClass: 'corvette',
		classes: ['patrol'],
		desc: 'Патрульный корвет модификации «А» Автоматической Системы Защиты.',
		engines: ['rtg', 'apu']
	},
	'wyrm.yml': {
		hullClass: 'corvette',
		classes: ['fighter', 'pursuit'],
		desc: 'Скоростной ударный корвет Автоматической Системы Защиты.',
		engines: ['rtg', 'apu']
	},
	'crow.yml': {
		hullClass: 'corvette',
		classes: ['fighter', 'patrol'],
		desc: 'Рейдовый корвет Автоматической Системы Защиты.',
		engines: ['rtg', 'apu']
	},
	'nebula.yml': {
		hullClass: 'fighter',
		classes: ['fighter', 'pursuit'],
		desc: 'Тяжёлый истребитель-перехватчик Автоматической Системы Защиты.',
		engines: ['rtg', 'apu']
	},
	'omen.yml': {
		hullClass: 'corvette',
		classes: ['fighter', 'pursuit'],
		desc: 'Ракетно-торпедный корвет Автоматической Системы Защиты.',
		engines: ['rtg', 'apu']
	},
	'razorn.yml': {
		hullClass: 'fighter',
		classes: ['pursuit', 'fighter'],
		desc: 'Лёгкий скоростной истребитель-перехватчик Автоматической Системы Защиты.',
		engines: ['rtg', 'apu']
	}
};

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
	const name = !rawName || isLocalizationKey(rawName) ? nameFromFilename(filename) : rawName;

	if (rawName && isLocalizationKey(rawName)) {
		console.warn(`  ⚠ Unresolved localization key "${rawName}" in ${filename} → using "${name}"`);
	}

	// Determine size based on entity count
	const size = determineShuttleSize(entityCount);

	const imagePath = resolveImagePath(id);
	const known = KNOWN_EIGHTH_FLEET_INFO[filename];

	return {
		id: `eighth-${id}`,
		name,
		description: known?.desc ?? 'Боевой корабль Автоматической Системы Защиты.',
		price: 0,
		group: 'eighth_fleet',
		hullClass: known?.hullClass ?? 'corvette',
		size,
		classes: known?.classes ?? ['fighter'],
		engines: known?.engines ?? ['rtg', 'apu'],
		image: imagePath
	};
}

function isGenericName(str) {
	if (!str) return true;
	const lower = str.trim().toLowerCase();
	return (
		lower === 'grid' ||
		lower === 'station' ||
		lower === 'shuttle' ||
		lower.startsWith('solution') ||
		lower.includes('blast door') ||
		lower.includes('control') ||
		lower.includes('button') ||
		lower.includes('air alarm') ||
		lower.includes('plushie') ||
		lower.includes('apc')
	);
}

const KNOWN_POI_INFO = {
	'ads_big_ancient_storage.yml': {
		name: 'Правительственная Цитадель',
		desc: 'Древняя укреплённая цитадель сил обороны АСЗ.',
		classes: [],
		engines: ['ame']
	},
	'ads_small_ancient_storage.yml': {
		name: "Древнее Хранилище Кхси'Ра",
		desc: "Древнее хранилище цивилизации Кхси'Ра.",
		classes: [],
		engines: ['ame']
	},
	'anomalouslab.yml': {
		name: 'Лаборатория Аномалий',
		desc: 'Научно-исследовательский аванпост по изучению аномалий.',
		classes: ['science'],
		engines: ['supermatter']
	},
	'arena.yml': {
		name: 'Бойцовская Яма',
		desc: 'Подпольная гладиаторская арена и боевой комплекс.',
		classes: ['mercenary'],
		engines: ['apu']
	},
	'bahama.yml': {
		name: 'Багамская Мама',
		desc: 'Рекреационный и общественный комплекс.',
		classes: ['kitchen', 'civilian'],
		engines: ['apu']
	},
	'beaconstation_a.yml': {
		name: 'INSO-357k Asteroid Cluster',
		desc: 'Астероидный кластер и добывающая станция.',
		classes: ['salvage'],
		engines: ['solar']
	},
	'beaconstation_wilds.yml': {
		name: 'LINEAR-21 Asteroid Cluster',
		desc: 'Удаленный астероидный кластер.',
		classes: ['salvage'],
		engines: ['solar']
	},
	'burnedshuttle.yml': {
		name: 'Погибшая спасательная капсула',
		desc: 'Обгоревшие останки спасательного шаттла.',
		classes: ['scrapyard'],
		engines: ['apu']
	},
	'camelot.yml': {
		name: 'Форт Камелот',
		desc: 'Военный опорный пункт СССП.',
		classes: [],
		engines: ['ame']
	},
	'cargodepot.yml': {
		name: 'Грузовое Депо',
		desc: 'Логистический склад и грузовой перевалочный пункт.',
		classes: ['cargo'],
		engines: ['solar']
	},
	'cargodepotalt.yml': {
		name: 'Грузовое Депо (Альт)',
		desc: 'Альтернативный перевалочный грузовой терминал.',
		classes: ['cargo'],
		engines: ['solar']
	},
	'caseyscasino.yml': {
		name: 'Казино Ксено',
		desc: 'Игорный дом и казино на фронтире.',
		classes: ['civilian'],
		engines: ['apu']
	},
	'cruiseship.yml': {
		name: 'Покинутый круизный корабль',
		desc: 'Роскошный пассажирский лайнер, дрейфующий в космосе.',
		classes: ['scrapyard'],
		engines: ['ame']
	},
	'derelictdrillsite.yml': {
		name: 'Брошенный Буровой Комплекс',
		desc: 'Заброшенный промышленный комплекс глубинного бурения.',
		classes: ['salvage', 'scrapyard'],
		engines: ['apu']
	},
	'fragmentofprison.yml': {
		name: 'Обломок тюремного корабля',
		desc: 'Разрушенный тюремный блок строгого режима.',
		classes: ['scrapyard'],
		engines: ['apu']
	},
	'hospital.yml': {
		name: 'Госпиталь',
		desc: 'Медицинский комплекс экстренной помощи и реанимации.',
		classes: ['medical'],
		engines: ['solar']
	},
	'lpbravo.yml': {
		name: 'Прослушивающий Пункт Браво',
		desc: 'Секретный разведывательный пункт прослушивания.',
		classes: [],
		engines: ['ame']
	},
	'pdvhelios.yml': {
		name: 'ДФ | Крепость Гелиос',
		desc: 'Оборонительный форпост Династии Фаэтон.',
		classes: ['pirate'],
		engines: ['ame']
	},
	'sevastopol.yml': {
		name: 'Дата-центр Севастополь',
		desc: 'Высокотехнологичный серверный дата-центр.',
		classes: ['science'],
		engines: ['supermatter']
	},
	'small_meteo_station.yml': {
		name: 'Метеостанция Синдиката',
		desc: 'Метеостанция Синдиката.',
		classes: ['syndicate'],
		engines: ['solar']
	},
	'trademall.yml': {
		name: 'Торговый Центр',
		desc: 'Крупная космическая фактория и торговый молл.',
		classes: ['civilian', 'cargo'],
		engines: ['solar']
	},
	'tsfmchalcyon.yml': {
		name: 'КВП | Флагман Фалкон',
		desc: 'Тяжелый флагманский крейсер сил правопорядка КВП.',
		classes: [],
		engines: ['ame']
	},
	'tsfmcoutpost.yml': {
		name: 'ДФ-ГРАЖД | Аванпост гражданских ДФ',
		desc: 'Гражданский аванпост под защитой ДФ.',
		classes: ['civilian'],
		engines: ['solar']
	},
	'whale.yml': {
		name: 'ВЭФ | Кашалот',
		desc: 'Тяжелый корабль-осколок АСЗ под управлением воинов Асаким.',
		classes: [],
		engines: ['supermatter']
	}
};

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

	const known = KNOWN_POI_INFO[filename];
	const name =
		known?.name ??
		(!rawName || isLocalizationKey(rawName) || isGenericName(rawName)
			? nameFromFilename(filename)
			: rawName);

	if (rawName && (isLocalizationKey(rawName) || isGenericName(rawName))) {
		console.warn(`  ⚠ Generic/unresolved name "${rawName}" in ${filename} → using "${name}"`);
	}

	const size = determineShuttleSize(entityCount);
	const imagePath = resolveImagePath(id);

	return {
		id: `station-${id}`,
		name,
		description: known?.desc ?? 'Станция (POI).',
		price: 0,
		group: 'station',
		hullClass: 'station',
		size,
		classes: known?.classes ?? ['science'],
		engines: known?.engines ?? ['apu'],
		image: imagePath
	};
}

function main() {
	const shuttleEventDir = path.join(__dirname, '..', 'ShuttleEvent');
	const poiDir = path.join(__dirname, '..', 'POI');
	const outputPath = path.join(__dirname, '..', 'src', 'lib', 'data', 'shuttles.json');

	const shuttleEventYmlFiles = fs.existsSync(shuttleEventDir)
		? fs.readdirSync(shuttleEventDir).filter((f) => f.endsWith('.yml'))
		: [];
	const poiYmlFiles = fs.existsSync(poiDir)
		? fs.readdirSync(poiDir).filter((f) => f.endsWith('.yml'))
		: [];

	if (shuttleEventYmlFiles.length === 0 && poiYmlFiles.length === 0) {
		console.error('No ShuttleEvent or POI files found');
		process.exit(1);
	}

	const existingShuttles = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));

	// Keep all non-generated groups (including manually-managed groups)
	const otherShuttles = existingShuttles.filter(
		(s) => s.group !== 'eighth_fleet' && s.group !== 'station'
	);

	const newEighthFleetShuttles = shuttleEventYmlFiles.map((f) =>
		createEighthFleetShuttleFromFile(f, shuttleEventDir)
	);
	const newPoiStations = poiYmlFiles.map((f) => createPoiStationFromFile(f, poiDir));

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
