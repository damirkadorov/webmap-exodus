<script lang="ts">
	import Button from '$lib/button.svelte';
	import ImageModal from '$lib/image-modal.svelte';
	import { formatPrice, getShuttleById, shuttleConfig, shuttleGroupColors } from '$lib';
	import { page } from '$app/state';
	import { browser } from '$app/environment';
	import { base } from "$app/paths";

	let isModalOpen = $state(false);
	const id = browser ? page.url.searchParams.get('id') : '';
	let shuttle = $derived(getShuttleById(id ?? ''));
	let factionColor = $derived(shuttle ? shuttleGroupColors[shuttle.group] ?? '#0B9FC0' : '#0B9FC0');
</script>

{#if !shuttle}
	<div class="not-found-page">
		<div class="not-found-inner">
			<div class="not-found-icon" aria-hidden="true">
				<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
					<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
					<line x1="12" y1="9" x2="12" y2="13"/>
					<line x1="12" y1="17" x2="12.01" y2="17"/>
				</svg>
			</div>
			<span class="not-found-title">Шаттл не найден</span>
			<span class="not-found-sub">Запрошенный шаттл не существует в базе данных</span>
			<Button text="Вернуться в каталог" onClick={() => window.history.back()} />
		</div>
	</div>
{:else}
	<div class="detail-page" style="--faction: {factionColor}">
		<!-- Back nav -->
		<div class="detail-nav">
			<button class="back-btn" onclick={() => window.history.back()} aria-label="Вернуться назад">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<line x1="19" y1="12" x2="5" y2="12"/>
					<polyline points="12 19 5 12 12 5"/>
				</svg>
				Назад
			</button>
			<div class="breadcrumb" aria-label="Навигационная цепочка">
				<span>Каталог</span>
				<span aria-hidden="true">/</span>
				<span class="bc-current">{shuttle.name}</span>
			</div>
		</div>

		<!-- Main content -->
		<div class="detail-content">
			<!-- Left: info panel -->
			<div class="info-panel">
				<!-- Title block -->
				<div class="title-block">
					<div class="title-row">
						<h1 class="shuttle-name">{shuttle.name}</h1>
						<span class="faction-tag" style="color: {factionColor}">
							{shuttleConfig.shipyard[shuttle.group]}
						</span>
					</div>

					{#if shuttle.description}
						<p class="shuttle-desc">{shuttle.description}</p>
					{/if}
				</div>

				<!-- Stats grid -->
				<div class="stats-section">
					<div class="section-divider">Характеристики</div>
					<div class="stats-grid">
						<!-- Price -->
						<div class="stat-block">
							<span class="stat-label">Стоимость</span>
							{#if shuttle.price > 0}
								<span class="stat-value price-display large">
									{formatPrice(shuttle.price)}
									<span style="font-size: 0.6em; opacity: 0.7; margin-left: 2px;">кред.</span>
								</span>
							{:else}
								<span class="stat-value" style="color: var(--text-dim); font-size: 0.85rem;">Не продаётся</span>
							{/if}
						</div>

						<!-- Size -->
						<div class="stat-block">
							<span class="stat-label">Размер</span>
							<span class="stat-value">{shuttleConfig.sizes[shuttle.size] ?? shuttle.size}</span>
						</div>

						<!-- Engines -->
						{#if shuttle.engines && shuttle.engines.length > 0}
							<div class="stat-block" style="grid-column: 1 / -1;">
								<span class="stat-label">
									<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:inline;margin-right:4px">
										<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
									</svg>
									Силовая установка
								</span>
								<div class="engines-list">
									{#each shuttle.engines as eng (eng)}
										<span class="engine-tag">{shuttleConfig.engines[eng] ?? eng}</span>
									{/each}
								</div>
							</div>
						{/if}
					</div>
				</div>

				<!-- Classes -->
				<div class="classes-section">
					<div class="section-divider">Классификация</div>
					{#if shuttle.classes.length === 0}
						<span style="font-size:0.8rem; color: var(--text-dim);">Нет классов</span>
					{:else}
						<div class="classes-list">
							{#each shuttle.classes as cls (cls)}
								<span class="class-badge">{shuttleConfig.classes[cls] ?? cls}</span>
							{/each}
						</div>
					{/if}
				</div>

				<!-- Action -->
				<div class="action-row">
					<Button text="Вернуться в каталог" onClick={() => window.history.back()} />
				</div>
			</div>

			<!-- Right: image panel -->
			<div class="image-panel hud-corner">
				<button
					class="image-viewer scanline-overlay"
					onclick={() => (isModalOpen = true)}
					aria-label="Открыть изображение на весь экран: {shuttle.name}"
					title="Нажмите для просмотра в полном размере"
				>
					<img
						src="{base}{shuttle.image}"
						alt={shuttle.name}
						class="shuttle-img"
					/>
					<div class="zoom-hint" aria-hidden="true">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
							<line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
						</svg>
						Полный размер
					</div>
				</button>
			</div>
		</div>
	</div>

	{#if isModalOpen}
		<ImageModal
			src="{base}{shuttle.image}"
			alt={shuttle.name}
			onClose={() => (isModalOpen = false)}
		/>
	{/if}
{/if}

<style>
/* ── Not found ── */
.not-found-page {
	display: flex;
	align-items: center;
	justify-content: center;
	flex: 1;
	padding: 40px 16px;
}
.not-found-inner {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 14px;
	text-align: center;
	max-width: 360px;
}
.not-found-icon { color: var(--text-dim); opacity: 0.5; }
.not-found-title {
	font-family: var(--font-display);
	font-size: 1.3rem;
	font-weight: 700;
	color: var(--text-muted);
}
.not-found-sub { font-size: 0.85rem; color: var(--text-dim); }

/* ── Detail page ── */
.detail-page {
	display: flex;
	flex-direction: column;
	gap: 20px;
	padding: 20px 16px;
	max-width: 1400px;
	margin: 0 auto;
	width: 100%;
	flex: 1;
}

@media (min-width: 768px) {
	.detail-page { padding: 24px 24px; gap: 24px; }
}

/* Nav row */
.detail-nav {
	display: flex;
	align-items: center;
	gap: 16px;
}

.back-btn {
	display: inline-flex;
	align-items: center;
	gap: 7px;
	padding: 7px 14px;
	background: transparent;
	border: 1px solid var(--border-dim);
	border-radius: var(--radius);
	color: var(--text-muted);
	font-family: var(--font-display);
	font-size: 0.875rem;
	font-weight: 600;
	cursor: pointer;
	outline: none;
	transition: color 0.2s, border-color 0.2s, background 0.2s;
}
.back-btn:hover {
	color: var(--accent);
	border-color: var(--border);
	background: var(--accent-muted);
}

.breadcrumb {
	display: flex;
	align-items: center;
	gap: 8px;
	font-family: var(--font-mono);
	font-size: 0.72rem;
	letter-spacing: 0.06em;
	color: var(--text-dim);
}
.bc-current { color: var(--text-muted); }

/* Content grid */
.detail-content {
	display: flex;
	flex-direction: column;
	gap: 20px;
}

@media (min-width: 768px) {
	.detail-content {
		flex-direction: row;
		align-items: flex-start;
		gap: 24px;
	}
}

/* Info panel */
.info-panel {
	display: flex;
	flex-direction: column;
	gap: 20px;
	background: var(--bg-panel);
	border: 1px solid var(--border-dim);
	border-radius: var(--radius-xl);
	padding: 22px;
	width: 100%;
	box-shadow:
		0 4px 30px rgba(0,0,0,0.35),
		0 0 0 1px color-mix(in srgb, var(--faction, var(--accent)) 10%, transparent);
	position: relative;
	overflow: hidden;
}
/* top glow line in faction color */
.info-panel::before {
	content: '';
	position: absolute;
	top: 0; left: 15%; right: 15%;
	height: 1px;
	background: linear-gradient(90deg, transparent, var(--faction, var(--accent)), transparent);
	opacity: 0.45;
}

@media (min-width: 768px) {
	.info-panel {
		min-width: 320px;
		max-width: 420px;
		width: auto;
		flex-shrink: 0;
	}
}

/* Title block */
.title-block { display: flex; flex-direction: column; gap: 10px; }

.title-row {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: 12px;
	flex-wrap: wrap;
}

.shuttle-name {
	font-family: var(--font-display);
	font-weight: 700;
	font-size: 1.6rem;
	letter-spacing: 0.02em;
	color: var(--text);
	line-height: 1.1;
	margin: 0;
}

.shuttle-desc {
	font-size: 0.875rem;
	line-height: 1.6;
	color: var(--text-muted);
	margin: 0;
}

/* Stats */
.stats-section, .classes-section {
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.stats-grid {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 8px;
}

.engines-list {
	display: flex;
	flex-wrap: wrap;
	gap: 5px;
	margin-top: 4px;
}

.engine-tag {
	font-family: var(--font-mono);
	font-size: 0.72rem;
	letter-spacing: 0.06em;
	color: var(--text-muted);
	padding: 4px 10px;
	border: 1px solid var(--border);
	border-radius: var(--radius-pill);
	background: rgba(65, 182, 251, 0.04);
	display: inline-flex;
	align-items: center;
	gap: 4px;
}

.classes-list {
	display: flex;
	flex-wrap: wrap;
	gap: 6px;
}

/* Action */
.action-row {
	padding-top: 8px;
	border-top: 1px solid var(--border-dim);
}

/* Image panel */
.image-panel {
	flex: 1;
	min-height: 300px;
	background: var(--bg-panel);
	border: 1px solid var(--border-dim);
	border-radius: var(--radius-xl);
	overflow: hidden;
	position: relative;
	box-shadow: 0 4px 30px rgba(0,0,0,0.3);
}

.image-viewer {
	width: 100%;
	height: 100%;
	min-height: 320px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(0, 0, 0, 0.3);
	cursor: zoom-in;
	border: none;
	outline: none;
	padding: 24px;
	position: relative;
	transition: background 0.2s;
}
.image-viewer:hover { background: rgba(0, 0, 0, 0.4); }

.shuttle-img {
	max-width: 100%;
	max-height: 60vh;
	width: auto;
	height: auto;
	object-fit: contain;
	transition: transform 0.3s ease;
	filter: drop-shadow(0 0 30px rgba(65, 182, 251, 0.12));
}
.image-viewer:hover .shuttle-img {
	transform: scale(1.02);
}

.zoom-hint {
	position: absolute;
	bottom: 14px;
	right: 14px;
	display: flex;
	align-items: center;
	gap: 6px;
	font-family: var(--font-mono);
	font-size: 0.65rem;
	letter-spacing: 0.1em;
	text-transform: uppercase;
	color: var(--text-dim);
	background: rgba(5, 8, 16, 0.75);
	border: 1px solid var(--border-dim);
	padding: 6px 12px;
	border-radius: var(--radius-pill);
	backdrop-filter: blur(8px);
	opacity: 0;
	transition: opacity 0.25s;
}
.image-viewer:hover .zoom-hint { opacity: 1; }
</style>
