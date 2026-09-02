<script lang="ts">
	import Button from './button.svelte';
	import MultiSelect from './multi-select.svelte';
	import type { ShuttleClass, ShuttleEngine, ShuttleFilters, ShuttleGroup } from '$lib';

	interface Props {
		className?: string;
		filters: ShuttleFilters;
		shipyardOptions: Record<ShuttleGroup, string>;
		classOptions: Record<ShuttleClass, string>;
		engineOptions: Record<ShuttleEngine, string>;
		onReset: () => void;
	}

	let {
		className = '',
		filters,
		shipyardOptions,
		classOptions,
		engineOptions,
		onReset
	}: Props = $props();

	const hasActiveFilters = $derived(
		filters.name !== '' ||
		filters.group !== '' ||
		filters.shuttleClass.length > 0 ||
		filters.engine !== ''
	);
</script>

<aside class="filter-panel {className}" aria-label="Панель поиска">
	<!-- Header -->
	<div class="filter-header">
		<span class="filter-title">
			<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
				<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
			</svg>
			Фильтры
		</span>
		{#if hasActiveFilters}
			<button class="filter-reset-mini" onclick={onReset} aria-label="Сбросить все фильтры">
				Сбросить
			</button>
		{/if}
	</div>

	<!-- Fields -->
	<div class="filter-fields">
		<!-- Name search -->
		<div class="filter-group">
			<label class="filter-label" for="filter-name">Название</label>
			<div class="input-wrap">
				<svg class="input-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
				</svg>
				<input
					type="text"
					id="filter-name"
					name="name"
					placeholder="Название шаттла..."
					bind:value={filters.name}
					autocomplete="off"
				/>
			</div>
		</div>

		<!-- Shipyard -->
		<div class="filter-group">
			<label class="filter-label" for="filter-shipyard">Верфь</label>
			<select id="filter-shipyard" name="shipyard" bind:value={filters.group}>
				<option value="">Любая</option>
				{#each Object.entries(shipyardOptions) as [value, label] (value)}
					<option value={value}>{label}</option>
				{/each}
			</select>
		</div>

		<!-- Class -->
		<div class="filter-group">
			<label class="filter-label" for="filter-class">Категория</label>
			<MultiSelect bind:selected={filters.shuttleClass} options={classOptions} placeholder="Любая" />
		</div>

		<!-- Engine -->
		<div class="filter-group">
			<label class="filter-label" for="filter-engine">Двигатель</label>
			<select id="filter-engine" name="engine" bind:value={filters.engine}>
				<option value="">Любой</option>
				{#each Object.entries(engineOptions) as [value, label] (value)}
					<option value={value}>{label}</option>
				{/each}
			</select>
		</div>
	</div>

	<!-- Full reset button (shown always at bottom) -->
	<div class="filter-footer">
		<Button text="Сбросить фильтры" variant="ghost" className="w-full" onClick={onReset} />
	</div>
</aside>

<style>
.filter-panel {
	background: var(--bg-panel);
	border: 1px solid var(--border);
	border-radius: var(--radius-xl);
	padding: 18px;
	display: flex;
	flex-direction: column;
	gap: 16px;
	min-width: 240px;
	box-shadow: 0 1px 3px rgba(29, 28, 26, 0.04);
}

/* Header */
.filter-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding-bottom: 12px;
	border-bottom: 1px solid var(--border-dim);
}

.filter-title {
	display: flex;
	align-items: center;
	gap: 7px;
	font-family: var(--font-display);
	font-weight: 500;
	font-size: 1.05rem;
	letter-spacing: -0.01em;
	color: var(--text);
}

.filter-reset-mini {
	font-family: var(--font-mono);
	font-size: 0.65rem;
	letter-spacing: 0.1em;
	text-transform: uppercase;
	color: var(--text-dim);
	background: none;
	border: none;
	cursor: pointer;
	padding: 3px 8px;
	border-radius: var(--radius);
	transition: color 0.2s, background 0.2s;
	outline: none;
}
.filter-reset-mini:hover {
	color: var(--accent);
	background: var(--accent-muted);
}

/* Fields */
.filter-fields {
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.filter-group {
	display: flex;
	flex-direction: column;
	gap: 5px;
}

.filter-label {
	font-family: var(--font-mono);
	font-size: 0.67rem;
	letter-spacing: 0.12em;
	text-transform: uppercase;
	color: var(--text-dim);
}

/* Input wrapper with icon */
.input-wrap {
	position: relative;
}
.input-icon {
	position: absolute;
	left: 9px;
	top: 50%;
	transform: translateY(-50%);
	color: var(--text-dim);
	pointer-events: none;
}
.input-wrap input {
	padding-left: 30px;
}

/* Footer */
.filter-footer {
	padding-top: 4px;
	border-top: 1px solid var(--border-dim);
}
</style>
