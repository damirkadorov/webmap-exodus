<script lang="ts">
	import { formatPrice, shuttleConfig, shuttleGroupColors, type Shuttle } from '$lib';
	import { base } from "$app/paths";

	interface Props {
		shuttle: Shuttle;
	}

	let { shuttle }: Props = $props();
	let borderColor = $derived(shuttleGroupColors[shuttle.group] ?? '#0B9FC0');
</script>

<a
	class="shuttle-card hud-corner"
	style="--faction-color: {borderColor}"
	href="{base}/shuttle?id={shuttle.id}"
	aria-label="{shuttle.name} - {shuttleConfig.shipyard[shuttle.group]}"
>
	<!-- Image area -->
	<div class="card-image scanline-overlay">
		<img
			src="{base}{shuttle.image}"
			alt={shuttle.name}
			loading="lazy"
		/>
		<!-- Faction corner tag -->
		<span class="faction-badge" aria-label="Верфь: {shuttleConfig.shipyard[shuttle.group]}">
			{shuttleConfig.shipyard[shuttle.group]}
		</span>
	</div>

	<!-- Info area -->
	<div class="card-info">
		<div class="card-title-row">
			<span class="card-name">{shuttle.name}</span>
		</div>

		{#if shuttle.classes.length > 0}
			<div class="card-classes">
				{#each shuttle.classes.slice(0, 3) as cls (cls)}
					<span class="class-badge">{shuttleConfig.classes[cls]}</span>
				{/each}
				{#if shuttle.classes.length > 3}
					<span class="class-badge">+{shuttle.classes.length - 3}</span>
				{/if}
			</div>
		{/if}

		<div class="card-footer">
			{#if shuttle.price > 0}
				<span class="price-display">
					<span class="price-icon" aria-hidden="true">◈</span>
					{formatPrice(shuttle.price)} кред.
				</span>
			{:else}
				<span class="price-free">Не продаётся</span>
			{/if}
			<span class="card-arrow" aria-hidden="true">→</span>
		</div>
	</div>

	<!-- Bottom faction accent -->
	<div class="card-faction-bar" aria-hidden="true"></div>
</a>

<style>
.shuttle-card {
	display: flex;
	flex-direction: column;
	background: var(--bg-card);
	border: 1px solid var(--border);
	border-radius: var(--radius-xl);
	overflow: hidden;
	text-decoration: none;
	cursor: pointer;
	transition:
		border-color 0.2s ease,
		box-shadow 0.2s ease,
		transform 0.15s ease;
	position: relative;
}

.shuttle-card:hover {
	border-color: var(--navy-bright);
	transform: translateY(-2px);
	box-shadow: 0 4px 16px rgba(29, 28, 26, 0.06);
}

.shuttle-card:active {
	transform: translateY(0) scale(0.99);
}

/* Image */
.card-image {
	width: 100%;
	aspect-ratio: 4 / 3;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(31, 77, 158, 0.03);
	overflow: hidden;
	position: relative;
	border-bottom: 1px solid var(--border-dim);
}

.card-image img {
	max-height: 100%;
	max-width: 100%;
	width: auto;
	height: auto;
	object-fit: contain;
	padding: 12px;
	transition: transform 0.3s ease;
}
.shuttle-card:hover .card-image img {
	transform: scale(1.04);
}

/* Faction badge: pale pastel pill */
.faction-badge {
	position: absolute;
	top: 10px;
	right: 10px;
	font-family: var(--font-mono);
	font-size: 0.62rem;
	letter-spacing: 0.03em;
	color: color-mix(in srgb, var(--faction-color, var(--accent)) 65%, #1d1c1a);
	background: color-mix(in srgb, var(--faction-color, var(--accent)) 10%, #ffffff);
	border: none;
	padding: 3px 10px;
	border-radius: var(--radius-pill);
}

/* Info section */
.card-info {
	display: flex;
	flex-direction: column;
	gap: 8px;
	padding: 12px;
	flex: 1;
}

.card-title-row {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: 8px;
}

.card-name {
	font-family: var(--font-display);
	font-weight: 500;
	font-size: 1.15rem;
	letter-spacing: -0.01em;
	color: var(--text);
	line-height: 1.15;
	transition: color 0.15s;
}
.shuttle-card:hover .card-name { color: var(--accent); }

.card-classes {
	display: flex;
	flex-wrap: wrap;
	gap: 4px;
}

.card-footer {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-top: auto;
	padding-top: 8px;
	border-top: 1px solid var(--border-dim);
}

.price-free {
	font-family: var(--font-mono);
	font-size: 0.72rem;
	color: var(--text-dim);
	letter-spacing: 0.06em;
	text-transform: uppercase;
}

.price-icon {
	opacity: 0.6;
	margin-right: 4px;
}

.card-arrow {
	font-size: 0.9rem;
	color: var(--text-dim);
	transition: color 0.2s, transform 0.2s;
}
.shuttle-card:hover .card-arrow {
	color: var(--accent);
	transform: translateX(3px);
}

/* Bottom ink line in faction color */
.card-faction-bar {
	height: 2px;
	background: var(--faction-color, var(--accent));
	opacity: 0.12;
	transition: opacity 0.2s;
}
.shuttle-card:hover .card-faction-bar { opacity: 0.55; }
</style>
