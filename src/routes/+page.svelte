<script lang="ts">
	import Filter from '$lib/filter.svelte';
	import ShuttleView from '$lib/shuttle-view.svelte';
	import {
		defaultShuttleFilters,
		filterShuttles,
		getShuttles,
		shuttleConfig,
		type ShuttleClass,
		type ShuttleEngine,
		type ShuttleGroup,
		type ShuttleSize,
		type ShuttleSort
	} from '$lib';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { SvelteURLSearchParams } from 'svelte/reactivity';

	const shuttles = getShuttles();
	let filters = $state({
		...defaultShuttleFilters
	});

	onMount(() => {
		const params = page.url.searchParams;
		if (params.has('q')) filters.name = params.get('q') ?? '';
		if (params.has('group')) filters.group = (params.get('group') as ShuttleGroup) ?? '';
		if (params.has('size')) filters.size = (params.get('size') as ShuttleSize) ?? '';
		if (params.has('engine')) filters.engine = (params.get('engine') as ShuttleEngine) ?? '';
		if (params.has('class')) {
			const classes = params.get('class')?.split(',').filter(Boolean) as ShuttleClass[];
			if (classes.length) filters.shuttleClass = classes;
		}
		if (params.get('sale') === '1') filters.onlyForSale = true;
		if (params.has('sort')) filters.sortBy = (params.get('sort') as ShuttleSort) ?? 'default';
	});

	$effect(() => {
		if (!browser) return;
		const params = new SvelteURLSearchParams();
		if (filters.name) params.set('q', filters.name);
		if (filters.group) params.set('group', filters.group);
		if (filters.size) params.set('size', filters.size);
		if (filters.engine) params.set('engine', filters.engine);
		if (filters.shuttleClass.length > 0) params.set('class', filters.shuttleClass.join(','));
		if (filters.onlyForSale) params.set('sale', '1');
		if (filters.sortBy !== 'default') params.set('sort', filters.sortBy);

		const search = params.toString();
		const targetUrl = search ? resolve(`/?${search}`) : resolve('/');
		const currentSearch = page.url.search;
		const expectedSearch = search ? `?${search}` : '';
		if (currentSearch !== expectedSearch) {
			goto(targetUrl, { replaceState: true, keepFocus: true, noScroll: true });
		}
	});

	const filteredShuttles = $derived(filterShuttles(shuttles, filters));

	function resetFilters() {
		filters.name = defaultShuttleFilters.name;
		filters.group = defaultShuttleFilters.group;
		filters.size = defaultShuttleFilters.size;
		filters.shuttleClass = [...defaultShuttleFilters.shuttleClass];
		filters.engine = defaultShuttleFilters.engine;
		filters.onlyForSale = defaultShuttleFilters.onlyForSale;
		filters.sortBy = defaultShuttleFilters.sortBy;
	}
</script>

<div class="page-layout">
	<!-- Sidebar -->
	<aside class="sidebar-wrap">
		<Filter
			className="md:sticky md:top-[80px]"
			{filters}
			shipyardOptions={shuttleConfig.shipyard}
			classOptions={shuttleConfig.classes}
			engineOptions={shuttleConfig.engines}
			sizeOptions={shuttleConfig.sizes}
			onReset={resetFilters}
		/>
	</aside>

	<!-- Main content -->
	<main class="catalog-main">
		<!-- Results header bar -->
		<div class="results-bar" role="status" aria-live="polite">
			<div class="results-info">
				<span class="results-count">{filteredShuttles.length}</span>
				<span class="results-label">
					{filteredShuttles.length === 1
						? 'шаттл'
						: filteredShuttles.length >= 2 && filteredShuttles.length <= 4
							? 'шаттла'
							: 'шаттлов'}
				</span>
				<span class="results-sep" aria-hidden="true">/</span>
				<span class="results-total">{shuttles.length} всего</span>
			</div>
			<div class="results-controls">
				<label class="sort-label" for="catalog-sort">Сортировка:</label>
				<select id="catalog-sort" class="sort-select" bind:value={filters.sortBy}>
					<option value="default">По умолчанию</option>
					<option value="price-asc">Сначала дешевле</option>
					<option value="price-desc">Сначала дороже</option>
					<option value="name-asc">По названию (А-Я)</option>
					<option value="name-desc">По названию (Я-А)</option>
				</select>
			</div>
		</div>

		<!-- Grid -->
		{#if filteredShuttles.length > 0}
			<div class="shuttle-grid">
				{#each filteredShuttles as shuttle (shuttle.id)}
					<ShuttleView {shuttle} />
				{/each}
			</div>
		{:else}
			<!-- Empty state -->
			<div class="empty-state">
				<div class="empty-icon" aria-hidden="true">
					<svg
						width="48"
						height="48"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
						<line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" />
					</svg>
				</div>
				<span class="empty-title">Шаттлы не найдены</span>
				<span class="empty-sub">Попробуйте изменить параметры поиска</span>
			</div>
		{/if}
	</main>
</div>

<style>
	.page-layout {
		display: flex;
		flex-direction: column;
		gap: 20px;
		padding: 20px 16px;
		width: 100%;
		flex: 1;
		max-width: 1600px;
		margin: 0 auto;
	}

	@media (min-width: 768px) {
		.page-layout {
			flex-direction: row;
			align-items: flex-start;
			padding: 24px 24px;
			gap: 24px;
		}
	}

	/* Sidebar */
	.sidebar-wrap {
		width: 100%;
	}
	@media (min-width: 768px) {
		.sidebar-wrap {
			width: 260px;
			flex-shrink: 0;
		}
	}

	/* Main */
	.catalog-main {
		display: flex;
		flex-direction: column;
		gap: 16px;
		flex: 1;
		min-width: 0;
	}

	/* Results bar */
	.results-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 10px 16px;
		background: var(--bg-panel);
		border: 1px solid var(--border-dim);
		border-radius: var(--radius-lg);
		box-shadow: 0 1px 3px rgba(29, 28, 26, 0.04);
	}

	.results-info {
		display: flex;
		align-items: baseline;
		gap: 6px;
		font-family: var(--font-mono);
		font-size: 0.8rem;
	}

	.results-count {
		font-size: 1.2rem;
		font-weight: 500;
		color: var(--text);
		font-family: var(--font-display);
	}

	.results-label {
		color: var(--text-muted);
	}

	.results-sep {
		color: var(--text-dim);
		margin: 0 2px;
	}

	.results-total {
		color: var(--text-dim);
	}

	.results-controls {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.sort-label {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		letter-spacing: 0.06em;
		color: var(--text-dim);
		white-space: nowrap;
	}

	.sort-select {
		font-family: var(--font-body);
		font-size: 0.8rem;
		color: var(--text);
		background-color: var(--bg);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 4px 28px 4px 8px;
		width: auto;
		min-width: 140px;
		cursor: pointer;
	}

	@media (max-width: 639px) {
		.results-bar {
			flex-direction: column;
			align-items: stretch;
			gap: 10px;
		}
		.results-controls {
			justify-content: space-between;
		}
		.sort-select {
			flex: 1;
		}
	}

	/* Grid */
	.shuttle-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 14px;
	}

	@media (min-width: 640px) {
		.shuttle-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (min-width: 1100px) {
		.shuttle-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	@media (min-width: 1440px) {
		.shuttle-grid {
			grid-template-columns: repeat(4, 1fr);
		}
	}

	/* Empty state */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 12px;
		padding: 64px 24px;
		text-align: center;
	}

	.empty-icon {
		color: var(--text-dim);
		opacity: 0.5;
	}

	.empty-title {
		font-family: var(--font-display);
		font-size: 1.1rem;
		font-weight: 600;
		color: var(--text-muted);
		letter-spacing: 0.02em;
	}

	.empty-sub {
		font-size: 0.85rem;
		color: var(--text-dim);
	}
</style>
