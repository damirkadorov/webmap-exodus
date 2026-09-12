import configJson from '$root/config.json' with { type: 'json' };
import shuttlesJson from '$lib/data/shuttles.json' with { type: 'json' };

export type ShuttleGroup = keyof typeof configJson.shuttles.shipyard;
export type ShuttleHullClass = keyof typeof configJson.shuttles.hullClasses;
export type ShuttleClass = keyof typeof configJson.shuttles.classes;
export type ShuttleEngine = keyof typeof configJson.shuttles.engines;
export type ShuttleSize = keyof typeof configJson.shuttles.sizes;

export interface Shuttle {
	id: string;
	name: string;
	description: string;
	price: number;
	group: ShuttleGroup;
	hullClass: ShuttleHullClass;
	size: ShuttleSize;
	classes: ShuttleClass[];
	engines: ShuttleEngine[];
	image: string;
}

export type ShuttleSort = 'default' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';

export function normalizeGroup(group: string): ShuttleGroup {
	if (group === 'scrap') return 'scrapyard' as ShuttleGroup;
	if (group === 'mieyo') return 'mms' as ShuttleGroup;
	if (group === 'eighth_fleet') return 'hostile_ai' as ShuttleGroup;
	return group as ShuttleGroup;
}

const rawShuttleData = shuttlesJson as Array<
	Omit<Shuttle, 'group' | 'hullClass'> & { group: string; hullClass?: string }
>;

const shuttleData: Shuttle[] = rawShuttleData.map((shuttle) => ({
	...shuttle,
	group: normalizeGroup(shuttle.group),
	hullClass: (shuttle.hullClass as ShuttleHullClass) || 'shuttle'
}));

export interface ShuttleFilters {
	name: string;
	group: ShuttleGroup | '';
	hullClass: ShuttleHullClass | '';
	shuttleClass: ShuttleClass[];
	engine: ShuttleEngine | '';
	size: ShuttleSize | '';
	onlyForSale: boolean;
	sortBy: ShuttleSort;
}

export const defaultShuttleFilters: ShuttleFilters = {
	name: '',
	group: '',
	hullClass: '',
	shuttleClass: [],
	engine: '',
	size: '',
	onlyForSale: false,
	sortBy: 'default'
};

export function getShuttles(): Shuttle[] {
	return shuttleData;
}

export function getShuttleById(id: string): Shuttle | undefined {
	return shuttleData.find((shuttle) => shuttle.id === id);
}

function matchesSearch(shuttle: Shuttle, query: string): boolean {
	const clean = query.trim().toLowerCase();
	if (!clean) return true;

	if (shuttle.name.toLowerCase().includes(clean)) return true;
	if (shuttle.description && shuttle.description.toLowerCase().includes(clean)) return true;

	const groupLabel = (configJson.shuttles.shipyard as Record<string, string>)[shuttle.group];
	if (groupLabel && groupLabel.toLowerCase().includes(clean)) return true;

	const hullLabel = (configJson.shuttles.hullClasses as Record<string, string>)[shuttle.hullClass];
	if (hullLabel && hullLabel.toLowerCase().includes(clean)) return true;

	for (const cls of shuttle.classes) {
		const classLabel = (configJson.shuttles.classes as Record<string, string>)[cls];
		if (classLabel && classLabel.toLowerCase().includes(clean)) return true;
	}

	for (const eng of shuttle.engines) {
		const engineLabel = (configJson.shuttles.engines as Record<string, string>)[eng];
		if (engineLabel && engineLabel.toLowerCase().includes(clean)) return true;
	}

	return false;
}

export function filterShuttles(shuttles: Shuttle[], filters: ShuttleFilters): Shuttle[] {
	const filtered = shuttles.filter((shuttle) => {
		if (filters.name && !matchesSearch(shuttle, filters.name)) {
			return false;
		}

		if (filters.group) {
			const filterGroup = normalizeGroup(filters.group);
			const shuttleGroup = normalizeGroup(shuttle.group);
			if (shuttleGroup !== filterGroup) {
				return false;
			}
		}

		if (filters.hullClass && shuttle.hullClass !== filters.hullClass) {
			return false;
		}

		if (filters.size && shuttle.size !== filters.size) {
			return false;
		}

		if (filters.onlyForSale && shuttle.price <= 0) {
			return false;
		}

		if (
			filters.shuttleClass.length > 0 &&
			!filters.shuttleClass.every((c) => shuttle.classes.includes(c))
		) {
			return false;
		}

		if (filters.engine && !shuttle.engines.includes(filters.engine)) {
			return false;
		}

		return true;
	});

	if (filters.sortBy === 'price-asc') {
		filtered.sort((a, b) => {
			if (a.price <= 0 && b.price <= 0) return 0;
			if (a.price <= 0) return 1;
			if (b.price <= 0) return -1;
			return a.price - b.price;
		});
	} else if (filters.sortBy === 'price-desc') {
		filtered.sort((a, b) => b.price - a.price);
	} else if (filters.sortBy === 'name-asc') {
		filtered.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
	} else if (filters.sortBy === 'name-desc') {
		filtered.sort((a, b) => b.name.localeCompare(a.name, 'ru'));
	}

	return filtered;
}

export function formatPrice(price: number): string {
	return new Intl.NumberFormat('ru-RU').format(price);
}

export const shuttleConfig = {
	...configJson.shuttles,
	shipyard: {
		...configJson.shuttles.shipyard,
		scrap: configJson.shuttles.shipyard.scrapyard,
		mieyo: configJson.shuttles.shipyard.mms,
		eighth_fleet: configJson.shuttles.shipyard.hostile_ai
	} as Record<string, string>
};

export const shuttleGroupColors: Record<string, string> = {
	...configJson.shipyard,
	scrap: configJson.shipyard.scrapyard,
	mieyo: configJson.shipyard.mms,
	eighth_fleet: configJson.shipyard.hostile_ai
};
