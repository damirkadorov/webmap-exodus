<script lang="ts">
	import Filter from '$lib/filter.svelte';
	import ShuttleView from '$lib/shuttle-view.svelte';
	import { defaultShuttleFilters, filterShuttles, getShuttles, shuttleConfig } from '$lib';

	const shuttles = getShuttles();
	let filters = $state({
		...defaultShuttleFilters
	});

	const filteredShuttles = $derived(filterShuttles(shuttles, filters));

	function resetFilters() {
		filters.name = defaultShuttleFilters.name;
		filters.group = defaultShuttleFilters.group;
		filters.shuttleClass = defaultShuttleFilters.shuttleClass;
		filters.engine = defaultShuttleFilters.engine;
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
					{filteredShuttles.length === 1 ? 'шаттл' :
					filteredShuttles.length >= 2 && filteredShuttles.length <= 4 ? 'шаттла' : 'шаттлов'}
				</span>
				<span class="results-sep" aria-hidden="true">/</span>
				<span class="results-total">{shuttles.length} всего</span>
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
					<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
						<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
						<line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
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
	box-shadow: 0 2px 12px rgba(0,0,0,0.2);
}

.results-info {
	display: flex;
	align-items: baseline;
	gap: 6px;
	font-family: var(--font-mono);
	font-size: 0.8rem;
}

.results-count {
	font-size: 1.1rem;
	font-weight: 700;
	color: var(--accent);
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
