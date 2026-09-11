<script lang="ts">
	import { asset, resolve } from '$app/paths';
	import configJson from '$root/config.json' with { type: 'json' };
</script>

<header class="header no-select">
	<!-- Top accent line -->
	<div class="accent-bar" aria-hidden="true"></div>

	<div class="header-inner">
		<!-- Logo / Brand -->
		<a href={resolve('/')} class="brand" aria-label="Exodus Webmap - Главная">
			<div class="brand-icon">
				<img src={asset('/icon-32x32.png')} alt="" aria-hidden="true" />
			</div>
			<div class="brand-text">
				<span class="brand-name">{configJson.name.split(' - ')[0]}</span>
				<span class="brand-sub">WEBMAP <span class="brand-version">v2</span></span>
			</div>
		</a>

		<!-- Navigation -->
		<nav class="nav" aria-label="Основная навигация">
			<a href={resolve('/')} class="nav-link">
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
					<rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
					<rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
				</svg>
				Каталог
			</a>
			<a
				href={configJson.wiki_url}
				class="nav-link"
				target="_blank"
				rel="external noopener noreferrer"
			>
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
					<path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path
						d="M2 12l10 5 10-5"
					/>
				</svg>
				WIKI
				<svg
					width="10"
					height="10"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
					class="ext-icon"
				>
					<path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><polyline
						points="15 3 21 3 21 9"
					/><line x1="10" y1="14" x2="21" y2="3" />
				</svg>
			</a>
		</nav>
	</div>
</header>

<style>
	.header {
		position: sticky;
		top: 0;
		z-index: 100;
		width: 100%;
		background: rgba(247, 246, 243, 0.92);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		border-bottom: 1px solid var(--border);
	}

	.accent-bar {
		display: none;
	}

	.header-inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 24px;
		height: 58px;
		max-width: 1600px;
		margin: 0 auto;
	}

	/* Brand */
	.brand {
		display: flex;
		align-items: center;
		gap: 10px;
		text-decoration: none;
	}

	.brand-icon {
		width: 36px;
		height: 36px;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background: var(--bg-panel);
		padding: 4px;
		transition: border-color 0.15s;
	}
	.brand:hover .brand-icon {
		border-color: var(--accent);
	}

	.brand-icon img {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}

	.brand-text {
		display: flex;
		flex-direction: column;
		gap: 0;
		line-height: 1;
	}

	.brand-name {
		font-family: var(--font-display);
		font-weight: 500;
		font-size: 1.2rem;
		letter-spacing: -0.01em;
		color: var(--text);
		transition: color 0.15s;
	}
	.brand:hover .brand-name {
		color: var(--accent);
	}

	.brand-sub {
		font-family: var(--font-mono);
		font-size: 0.6rem;
		letter-spacing: 0.18em;
		color: var(--text-dim);
		text-transform: uppercase;
	}
	.brand-version {
		color: var(--accent);
		opacity: 0.7;
	}

	/* Nav */
	.nav {
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.nav-link {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 7px 12px;
		font-family: var(--font-body);
		font-size: 0.875rem;
		font-weight: 600;
		letter-spacing: 0.01em;
		color: var(--text-muted);
		text-decoration: none;
		border-radius: var(--radius);
		transition:
			color 0.15s,
			background 0.15s;
	}
	.nav-link:hover {
		color: var(--text);
		background: rgba(29, 28, 26, 0.05);
	}

	.ext-icon {
		opacity: 0.5;
	}
</style>
