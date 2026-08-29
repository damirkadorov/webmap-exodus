<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		options: Record<string, string>;
		selected: string[];
		placeholder?: string;
	}

	let { options, selected = $bindable([]), placeholder = 'Любая' }: Props = $props();

	let isOpen = $state(false);
	let container: HTMLElement;

	function toggleDropdown() {
		isOpen = !isOpen;
	}

	function handleOptionClick(value: string) {
		if (selected.includes(value)) {
			selected = selected.filter((v) => v !== value);
		} else {
			selected = [...selected, value];
		}
	}

	function clearAll() {
		selected = [];
	}

	function handleClickOutside(event: MouseEvent) {
		if (container && !container.contains(event.target as Node)) {
			isOpen = false;
		}
	}

	onMount(() => {
		document.addEventListener('click', handleClickOutside);
		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	});

	const displayText = $derived.by(() => {
		if (selected.length === 0) return placeholder;
		if (selected.length <= 2) {
			return selected.map((v) => options[v]).join(', ');
		}
		return `Выбрано: ${selected.length}`;
	});
</script>

<div class="multi-select-wrap" bind:this={container}>
	<button
		type="button"
		class="ms-trigger"
		class:open={isOpen}
		class:has-value={selected.length > 0}
		onclick={toggleDropdown}
		aria-expanded={isOpen}
		aria-haspopup="listbox"
	>
		<span class="ms-value truncate">{displayText}</span>
		<div class="ms-controls">
			{#if selected.length > 0}
				<span
					role="button"
					tabindex="0"
					class="ms-clear"
					onclick={(e) => { e.stopPropagation(); clearAll(); }}
					onkeydown={(e) => e.key === 'Enter' && (e.stopPropagation(), clearAll())}
					aria-label="Очистить"
				>
					<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
						<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
					</svg>
				</span>
				<div class="ms-divider" aria-hidden="true"></div>
			{/if}
			<svg
				class="ms-chevron"
				class:rotated={isOpen}
				width="14" height="14"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
				aria-hidden="true"
			>
				<polyline stroke-linecap="round" stroke-linejoin="round" stroke-width="2" points="6 9 12 15 18 9" />
			</svg>
		</div>
	</button>

	{#if isOpen}
		<div
			role="listbox"
			aria-multiselectable="true"
			aria-label="Выбор категорий"
			class="ms-dropdown"
		>
			{#each Object.entries(options) as [value, label] (value)}
				<button
					type="button"
					role="option"
					aria-selected={selected.includes(value)}
					class="ms-option"
					class:selected={selected.includes(value)}
					onclick={() => handleOptionClick(value)}
				>
					<div class="ms-checkbox" aria-hidden="true">
						{#if selected.includes(value)}
							<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
								<polyline points="20 6 9 17 4 12"/>
							</svg>
						{/if}
					</div>
					<span class="ms-label">{label}</span>
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
.multi-select-wrap {
	position: relative;
	width: 100%;
}

.ms-trigger {
	display: flex;
	align-items: center;
	justify-content: space-between;
	width: 100%;
	padding: 8px 12px;
	background: rgba(8, 13, 26, 0.8);
	border: 1px solid var(--border);
	border-radius: var(--radius);
	color: var(--text-muted);
	font-family: var(--font-body);
	font-size: 0.875rem;
	cursor: pointer;
	outline: none;
	gap: 6px;
	transition: border-color 0.2s, box-shadow 0.2s;
	min-height: 36px;
}
.ms-trigger.open,
.ms-trigger:focus {
	border-color: var(--accent);
	box-shadow: 0 0 0 3px var(--accent-dim);
}
.ms-trigger.has-value {
	color: var(--text);
}

.ms-value {
	flex: 1;
	text-align: left;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.ms-controls {
	display: flex;
	align-items: center;
	gap: 4px;
	flex-shrink: 0;
}

.ms-clear {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 18px;
	height: 18px;
	border-radius: 50%;
	color: var(--text-dim);
	transition: color 0.2s, background 0.2s;
	cursor: pointer;
}
.ms-clear:hover { color: var(--text); background: var(--accent-muted); }

.ms-divider {
	width: 1px;
	height: 12px;
	background: var(--border);
}

.ms-chevron {
	color: var(--text-dim);
	transition: transform 0.2s, color 0.2s;
}
.ms-chevron.rotated { transform: rotate(180deg); }
.ms-trigger.open .ms-chevron { color: var(--accent); }

/* Dropdown */
.ms-dropdown {
	position: absolute;
	top: calc(100% + 6px);
	left: 0;
	right: 0;
	z-index: 200;
	background: var(--bg-panel);
	border: 1px solid var(--border);
	border-radius: var(--radius-lg);
	box-shadow: 0 12px 40px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(65, 182, 251, 0.06);
	max-height: 220px;
	overflow-y: auto;
	padding: 6px;
	scrollbar-width: thin;
	scrollbar-color: var(--navy) transparent;
}

.ms-option {
	display: flex;
	align-items: center;
	gap: 8px;
	width: 100%;
	padding: 8px 10px;
	border-radius: var(--radius);
	border: none;
	background: transparent;
	color: var(--text-muted);
	font-family: var(--font-body);
	font-size: 0.82rem;
	cursor: pointer;
	transition: background 0.15s, color 0.15s;
	text-align: left;
	outline: none;
}
.ms-option:hover { background: var(--accent-muted); color: var(--text); }
.ms-option.selected { color: var(--accent); }

.ms-checkbox {
	width: 16px;
	height: 16px;
	flex-shrink: 0;
	border: 1px solid var(--border);
	border-radius: 5px;
	background: transparent;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: border-color 0.15s, background 0.15s;
}
.ms-option.selected .ms-checkbox {
	border-color: var(--accent);
	background: var(--accent);
	color: #050810;
}

.ms-label { line-height: 1.2; }

/* scrollbar */
.ms-dropdown::-webkit-scrollbar { width: 4px; }
.ms-dropdown::-webkit-scrollbar-track { background: transparent; }
.ms-dropdown::-webkit-scrollbar-thumb { background: var(--navy); border-radius: 99px; }
</style>
