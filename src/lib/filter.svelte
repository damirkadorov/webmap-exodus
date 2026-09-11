<script lang="ts">
	import Button from './button.svelte';
	import MultiSelect from './multi-select.svelte';
	import type {
		ShuttleClass,
		ShuttleEngine,
		ShuttleFilters,
		ShuttleGroup,
		ShuttleSize
	} from '$lib';

	interface Props {
		className?: string;
		filters: ShuttleFilters;
		shipyardOptions: Record<ShuttleGroup, string>;
		classOptions: Record<ShuttleClass, string>;
		engineOptions: Record<ShuttleEngine, string>;
		sizeOptions: Record<ShuttleSize, string>;
		onReset: () => void;
	}

	let {
		className = '',
		filters,
		shipyardOptions,
		classOptions,
		engineOptions,
		sizeOptions,
		onReset
	}: Props = $props();

	const hasActiveFilters = $derived(
		filters.name !== '' ||
			filters.group !== '' ||
			filters.shuttleClass.length > 0 ||
			filters.engine !== '' ||
			filters.size !== '' ||
			filters.onlyForSale
	);
</script>

<aside class="filter-panel {className}" aria-label="Панель поиска">
	<!-- Header -->
	<div class="filter-header">
		<span class="filter-title">
			<svg
				width="14"
				height="14"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
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
				<svg
					class="input-icon"
					width="13"
					height="13"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
				</svg>
				<input
					type="text"
					id="filter-name"
					name="name"
					placeholder="Поиск по шаттлам..."
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
					<option {value}>{label}</option>
				{/each}
			</select>
		</div>

		<!-- Size -->
		<div class="filter-group">
			<label class="filter-label" for="filter-size">Размер</label>
			<select id="filter-size" name="size" bind:value={filters.size}>
				<option value="">Любой</option>
				{#each Object.entries(sizeOptions) as [value, label] (value)}
					<option {value}>{label}</option>
				{/each}
			</select>
		</div>

		<!-- Class -->
		<div class="filter-group">
			<label class="filter-label" for="filter-class">Категория</label>
			<MultiSelect
				bind:selected={filters.shuttleClass}
				options={classOptions}
				placeholder="Любая"
			/>
		</div>

		<!-- Engine -->
		<div class="filter-group">
			<label class="filter-label" for="filter-engine">Двигатель</label>
			<select id="filter-engine" name="engine" bind:value={filters.engine}>
				<option value="">Любой</option>
				{#each Object.entries(engineOptions) as [value, label] (value)}
					<option {value}>{label}</option>
				{/each}
			</select>
		</div>

		<!-- Only for sale toggle -->
		<div class="filter-toggle-group">
			<label class="filter-checkbox-label">
				<input type="checkbox" class="filter-checkbox" bind:checked={filters.onlyForSale} />
				<span class="filter-checkbox-text">Только в продаже</span>
			</label>
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
		border: 1px solid var(--border-dim);
		border-radius: var(--radius-xl);
		padding: 18px;
		display: flex;
		flex-direction: column;
		gap: 16px;
		min-width: 240px;
		box-shadow:
			0 4px 28px rgba(0, 0, 0, 0.3),
			0 0 0 1px rgba(65, 182, 251, 0.04) inset;
		position: relative;
		overflow: hidden;
	}
	/* subtle top glow line */
	.filter-panel::before {
		content: '';
		position: absolute;
		top: 0;
		left: 20%;
		right: 20%;
		height: 1px;
		background: linear-gradient(90deg, transparent, var(--accent), transparent);
		opacity: 0.3;
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
		font-weight: 700;
		font-size: 0.95rem;
		letter-spacing: 0.05em;
		text-transform: uppercase;
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
		transition:
			color 0.2s,
			background 0.2s;
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

	/* Toggle checkbox */
	.filter-toggle-group {
		padding-top: 4px;
	}

	.filter-checkbox-label {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		cursor: pointer;
		user-select: none;
	}

	.filter-checkbox {
		width: 15px;
		height: 15px;
		accent-color: var(--accent);
		cursor: pointer;
		border-radius: var(--radius-sm);
	}

	.filter-checkbox-text {
		font-family: var(--font-body);
		font-size: 0.82rem;
		color: var(--text-muted);
		transition: color 0.15s;
	}

	.filter-checkbox:checked + .filter-checkbox-text {
		color: var(--text);
		font-weight: 500;
	}
</style>
