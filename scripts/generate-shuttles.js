import fs from 'fs';
import path from 'path';

/**
 * Normalizes string keys and values from FTL localization files.
 */
function loadFtlStrings(localeDir) {
	const strings = {};
	if (!fs.existsSync(localeDir)) return strings;

	function walk(dir) {
		for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
			const full = path.join(dir, entry.name);
			if (entry.isDirectory()) {
				walk(full);
			} else if (entry.name.endsWith('.ftl')) {
				const content = fs.readFileSync(full, 'utf-8').replace(/\r/g, '');
				const lines = content.split('\n');
				let currentKey = null;
				let currentValue = '';

				for (const line of lines) {
					const match = line.match(/^([a-zA-Z0-9_-]+)\s*=\s*(.*)$/);
					if (match) {
						if (currentKey) {
							strings[currentKey] = currentValue.trim();
						}
						currentKey = match[1];
						currentValue = match[2];
					} else if (currentKey && (line.startsWith('    ') || line.startsWith('\t'))) {
						currentValue += ' ' + line.trim();
					} else if (currentKey && line.trim() === '') {
						// blank line inside multiline
					} else {
						if (currentKey) {
							strings[currentKey] = currentValue.trim();
							currentKey = null;
							currentValue = '';
						}
					}
				}
				if (currentKey) {
					strings[currentKey] = currentValue.trim();
				}
			}
		}
	}

	walk(localeDir);
	return strings;
}

/**
 * Cleans an FTL or YAML string from quotes, extra spaces, and FTL variables.
 */
function cleanText(str) {
	if (!str) return '';
	let res = str.trim();
	if (
		(res.startsWith("'") && res.endsWith("'")) ||
		(res.startsWith('"') && res.endsWith('"')) ||
		(res.startsWith('«') && res.endsWith('»'))
	) {
		res = res.slice(1, -1).trim();
	}
	// Remove FTL variables like { $count } or { $command }
	res = res.replace(/\{\s*\$[a-zA-Z0-9_]+\s*\}/g, '').trim();
	return res;
}

/**
 * Simple, robust parser for SS14 vessel prototype YAML files.
 */
function parseVesselYaml(content) {
	const documents = content.split(/^---|\n---/);
	const vessels = [];

	for (const doc of documents) {
		if (!doc.includes('type: vessel')) continue;

		const lines = doc.replace(/\r/g, '').split('\n');
		let inVessel = false;
		let vessel = null;
		let currentListKey = null;

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			const trimmed = line.trim();

			if (!trimmed || trimmed.startsWith('#')) continue;

			if (trimmed.startsWith('- type: vessel')) {
				if (vessel) vessels.push(vessel);
				vessel = { classes: [], engines: [], requiredCompanies: [] };
				inVessel = true;
				currentListKey = null;
				continue;
			}

			if (!inVessel) continue;

			// Another top-level prototype starts
			if (line.startsWith('- type:') && !trimmed.startsWith('- type: vessel')) {
				if (vessel) vessels.push(vessel);
				vessel = null;
				inVessel = false;
				currentListKey = null;
				continue;
			}

			// List item
			const listMatch = line.match(/^\s+-\s+(.+)$/);
			if (listMatch && currentListKey) {
				let val = listMatch[1].trim();
				if (val.includes('#') && !(val.startsWith("'") || val.startsWith('"'))) {
					val = val.split('#')[0].trim();
				}
				val = cleanText(val);
				if (val) {
					if (currentListKey === 'class') vessel.classes.push(val);
					else if (currentListKey === 'engine') vessel.engines.push(val);
					else if (currentListKey === 'requiredCompanies') vessel.requiredCompanies.push(val);
				}
				continue;
			}

			// Key-value pair at indentation 2: '  key: value'
			const kvMatch = line.match(/^\s{2}([a-zA-Z0-9_]+):\s*(.*)$/);
			if (kvMatch) {
				const key = kvMatch[1];
				let val = kvMatch[2].trim();

				if (val.includes('#') && !(val.startsWith("'") || val.startsWith('"'))) {
					val = val.split('#')[0].trim();
				}
				val = cleanText(val);

				if (key === 'class' || key === 'engine' || key === 'requiredCompanies') {
					currentListKey = key;
					if (val && val !== '') {
						if (val.startsWith('[') && val.endsWith(']')) {
							const items = val
								.slice(1, -1)
								.split(',')
								.map((s) => cleanText(s.trim()))
								.filter(Boolean);
							if (key === 'class') vessel.classes.push(...items);
							else if (key === 'engine') vessel.engines.push(...items);
							else if (key === 'requiredCompanies') vessel.requiredCompanies.push(...items);
						} else {
							if (key === 'class') vessel.classes.push(val);
							else if (key === 'engine') vessel.engines.push(val);
							else if (key === 'requiredCompanies') vessel.requiredCompanies.push(val);
						}
					}
				} else {
					currentListKey = null;
					vessel[key] = val;
				}
			}
		}

		if (vessel) vessels.push(vessel);
	}

	return vessels;
}

/**
 * Calculate hullClass from category, classes, and group.
 */
function calculateHullClass(vessel, existingHullClass) {
	if (existingHullClass) return existingHullClass;

	const classes = (vessel.classes || []).map((c) => c.toLowerCase());
	const size = (vessel.size || 'small').toLowerCase();

	if (classes.includes('battleship') || classes.includes('capital')) return 'battleship';
	if (classes.includes('carrier')) return 'carrier';
	if (classes.includes('cruiser')) return 'cruiser';
	if (classes.includes('destroyer')) return 'destroyer';
	if (classes.includes('frigate')) return 'frigate';
	if (classes.includes('corvette')) return 'corvette';

	if (size === 'micro') return 'fighter';
	if (size === 'small') {
		if (classes.includes('fighter') || classes.includes('pursuit')) return 'fighter';
		return 'shuttle';
	}
	if (size === 'medium') {
		return 'corvette';
	}
	if (size === 'large') {
		if (classes.includes('fighter')) return 'destroyer';
		return 'frigate';
	}

	return 'shuttle';
}

// Known shuttles restricted to vouchers only (purchasable: false in upstream)
const VOUCHER_SHUTTLES = new Set([
	'luxury',
	'enceladus',
	'enceladusprime',
	'ferz',
	'osa',
	'scarab',
	'klesh',
	'antares',
	'banshee',
	'cinquedea',
	'ladya',
	'luda',
	'sentinelf',
	'termite',
	'keelback',
	'lancehead',
	'leviathan',
	'bastion',
	'europa',
	'fenrir',
	'ganymede',
	'garm',
	'kalisto',
	'kortik',
	'kortikr',
	'layak',
	'motleyanne',
	'neptune',
	'prowler',
	'saintie',
	'scorpion',
	'vulture',
	'flyssa',
	'saturn',
	'inertia',
	'mock',
	'snakelet',
	'aldebaran',
	'altair',
	'andromeda',
	'calypso',
	'dagger',
	'fujian',
	'mercury',
	'tsfnpolaris',
	'razorback',
	'sentinel',
	'spekter',
	'spica',
	'tarantula',
	'ravager',
	'hunter',
	'hydra',
	'infiltrator',
	'talon',
	'buran',
	'ledokol',
	'kopye',
	'kupol',
	'molotok',
	'sulak',
	'wolfsnake',
	'flyssaabaddon'
]);

/**
 * Resolve the image filename for a vessel.
 */
function resolveImage(vessel, staticDir) {
	// Special map / image remappings
	const REMAPS = {
		Fortunate: '/FortunaUNSA-0.png',
		BlackhawkScarab: '/blackhawk_scarab-0.png',
		FlyssaAbaddon: '/flyssa_abaddon-0.png',
		Arcturus: '/arcturus-0.png',
		'drone-dreadnought': '/Dreadnought-0.png',
		Medusa: '/expedition_medusa-0.png',
		unsaNightHawk: '/nighthawk-0.png',
		Hercules: '/Hercules-0.png'
	};

	if (REMAPS[vessel.id]) return REMAPS[vessel.id];

	const staticFiles = fs.existsSync(staticDir)
		? new Map(fs.readdirSync(staticDir).map((f) => [f.toLowerCase(), f]))
		: new Map();

	const candidates = [];

	if (vessel.shuttlePath) {
		const baseName = path.basename(vessel.shuttlePath, '.yml');
		candidates.push(`${baseName}-0.png`);
		candidates.push(`${baseName}.png`);
	}

	candidates.push(`${vessel.id}-0.png`);
	candidates.push(`${vessel.id.replace(/-/g, '_')}-0.png`);

	for (const cand of candidates) {
		const actual = staticFiles.get(cand.toLowerCase());
		if (actual) {
			return `/${actual}`;
		}
	}

	// Default fallback using shuttlePath basename or vessel id
	if (vessel.shuttlePath) {
		const baseName = path.basename(vessel.shuttlePath, '.yml');
		return `/${baseName}-0.png`;
	}
	return `/${vessel.id.toLowerCase()}-0.png`;
}

/**
 * Main generator function.
 */
export function generateShuttles(monolithDir, repoDir) {
	const configPath = path.join(repoDir, 'config.json');
	const shuttlesJsonPath = path.join(repoDir, 'src/lib/data/shuttles.json');
	const staticDir = path.join(repoDir, 'static');

	const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
	const existingShuttles = fs.existsSync(shuttlesJsonPath)
		? JSON.parse(fs.readFileSync(shuttlesJsonPath, 'utf-8'))
		: [];

	const existingMap = new Map();
	for (const s of existingShuttles) {
		existingMap.set(s.id, s);
	}

	// Load FTL locales
	const ruFtl = loadFtlStrings(path.join(monolithDir, 'Resources/Locale/ru-RU'));
	const enFtl = loadFtlStrings(path.join(monolithDir, 'Resources/Locale/en-US'));

	function translate(val, fallback) {
		if (!val) return fallback || '';
		if (ruFtl[val]) return cleanText(ruFtl[val]);
		if (enFtl[val]) return cleanText(enFtl[val]);
		return cleanText(val);
	}

	// Scan all prototype files
	const protoDir = path.join(monolithDir, 'Resources/Prototypes');
	const allVesselProtos = [];

	function walkPrototypes(dir) {
		if (!fs.existsSync(dir)) return;
		for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
			const full = path.join(dir, entry.name);
			if (entry.isDirectory()) {
				walkPrototypes(full);
			} else if (entry.name.endsWith('.yml')) {
				const content = fs.readFileSync(full, 'utf-8');
				if (content.includes('- type: vessel')) {
					const parsed = parseVesselYaml(content);
					for (const p of parsed) {
						p._file = path.relative(monolithDir, full).replace(/\\/g, '/');
						allVesselProtos.push(p);
					}
				}
			}
		}
	}

	walkPrototypes(protoDir);
	console.log(`✓ Scanned prototypes: found ${allVesselProtos.length} vessel entries`);

	const generatedVessels = [];

	for (const proto of allVesselProtos) {
		// Skip abstract base prototypes
		if (proto.abstract === 'true' || !proto.id || proto.id.startsWith('Base')) continue;

		const existing = existingMap.get(proto.id);

		// Determine group
		let group = (proto.group || 'shipyard').toLowerCase();
		const shuttlePath = proto.shuttlePath || '';
		const relFile = proto._file || '';

		const isCompany =
			shuttlePath.includes('/Companies/') ||
			relFile.includes('/Shipyard/Companies/') ||
			(proto.requiredCompanies &&
				proto.requiredCompanies.length > 0 &&
				!shuttlePath.includes('/Expedition/'));

		if (isCompany) {
			group = 'companies';
		} else if (group === 'scrap') {
			group = 'scrapyard';
		} else if (group === 'mieyo') {
			group = 'mms';
		} else if (group === 'nfsd' || group === 'tsfcm') {
			group = 'security';
		} else if (group === 'civilian') {
			group = 'shipyard';
		}

		// Ensure valid group from config
		if (!config.shuttles.shipyard[group]) {
			group = 'shipyard';
		}

		// Localized name & description
		const name = translate(proto.name, existing?.name || proto.id);
		const description = translate(proto.description, existing?.description || '');

		// Price
		let price = parseInt(proto.price, 10);
		if (isNaN(price)) price = existing?.price || 0;

		// Size
		const size = (proto.category || existing?.size || 'small').toLowerCase();

		// Classes
		let classes = (proto.classes || []).map((c) => c.toLowerCase());
		if (classes.length === 0 && existing?.classes) {
			classes = existing.classes;
		}

		// Engines
		let engines = (proto.engines || []).map((e) => e.toLowerCase());
		if (engines.length === 0 && existing?.engines) {
			engines = existing.engines;
		}

		// Image
		const image = resolveImage(proto, staticDir);

		// HullClass
		const hullClass = calculateHullClass({ ...proto, size, classes }, existing?.hullClass);

		// Voucher
		const voucher =
			proto.purchasable === 'false' ||
			proto.purchasable === false ||
			Boolean(existing?.voucher) ||
			VOUCHER_SHUTTLES.has(proto.id.toLowerCase());

		const vesselEntry = {
			id: proto.id,
			name,
			description,
			price,
			group,
			size,
			classes,
			engines,
			image,
			hullClass,
			voucher
		};

		generatedVessels.push(vesselEntry);
	}

	// Add special non-vessel game rule / boss / capital ships if not present
	const SPECIAL_VESSELS = [
		{
			id: 'drone-dreadnought',
			name: 'Юнит: Дредноут',
			description:
				'Сверхтяжёлый автономный флагманский дредноут вышедшего из-под контроля ИИ. Обладает сокрушительной огневой мощью и колоссальной бронёй.',
			price: 0,
			group: 'hostile_ai',
			size: 'large',
			classes: ['fighter'],
			engines: ['rtg', 'teg'],
			image: '/Dreadnought-0.png',
			hullClass: 'battleship',
			voucher: false
		},
		{
			id: 'FlyssaAbaddon',
			name: 'Флисса «Абаддон»',
			description:
				'Флагманский корабль эскадрона смерти ОБР ЦК «Абаддон». Оснащён передовыми системами подавления, автономными реакторами и мощнейшим вооружением.',
			price: 1500000,
			group: 'security',
			size: 'large',
			classes: ['patrol', 'pursuit', 'fighter'],
			engines: ['plasma', 'uranium'],
			image: '/flyssa_abaddon-0.png',
			hullClass: 'battleship',
			voucher: true
		},
		{
			id: 'Arcturus',
			name: 'ТСФКМ «Арктурус»',
			description:
				'Тяжёлый десантный корабль специального назначения морской пехоты ТСФ (MARSOC). Оснащён передовым вооружением и бронированием для проведения специальных операций.',
			price: 1200000,
			group: 'security',
			size: 'large',
			classes: ['patrol', 'pursuit', 'fighter'],
			engines: ['plasma'],
			image: '/arcturus-0.png',
			hullClass: 'cruiser',
			voucher: false
		}
	];

	for (const special of SPECIAL_VESSELS) {
		const idx = generatedVessels.findIndex((v) => v.id === special.id);
		if (idx >= 0) {
			generatedVessels[idx] = { ...special, ...generatedVessels[idx] };
		} else {
			generatedVessels.push(special);
		}
	}

	// Preserve manually managed groups from existing shuttles:
	// 'eighth_fleet' and 'station' (managed by parse-shuttle-event.js),
	// and 'hostile_ai' drones, plus any custom entries.
	const MANUAL_PRESERVED_GROUPS = new Set(['eighth_fleet', 'station', 'hostile_ai']);
	const generatedIds = new Set(generatedVessels.map((v) => v.id));

	const preservedManual = existingShuttles.filter(
		(s) => MANUAL_PRESERVED_GROUPS.has(s.group) && !generatedIds.has(s.id)
	);

	const merged = [...generatedVessels, ...preservedManual];

	// Stable sort by group then name
	merged.sort((a, b) => {
		if (a.group !== b.group) return a.group.localeCompare(b.group);
		return a.name.localeCompare(b.name, 'ru');
	});

	fs.writeFileSync(shuttlesJsonPath, JSON.stringify(merged, null, '\t') + '\n', 'utf-8');
	console.log(
		`✓ Generated shuttles.json: ${generatedVessels.length} from prototypes + ${preservedManual.length} preserved = ${merged.length} total`
	);
}

// CLI execution
if (process.argv[1] && process.argv[1].endsWith('generate-shuttles.js')) {
	const monolithDir =
		process.argv[2] ||
		(fs.existsSync('D:/eexouds/a/Monolith') ? 'D:/eexouds/a/Monolith' : '../monolith');
	const currentRepoDir = process.argv[3] || '.';
	generateShuttles(monolithDir, currentRepoDir);
}
