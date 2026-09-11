<script lang="ts">
	import configJson from '$root/config.json' with { type: 'json' };
</script>

<footer class="footer">
	<div class="footer-inner">
		<div class="footer-left">
			<span class="footer-brand">{configJson.name}</span>
			<span class="footer-desc">
				Неофициальный каталог шаттлов для сервера
				<a href={configJson.wiki_url} target="_blank" rel="external noopener noreferrer"
					>Exodus: Monolith</a
				>
			</span>
		</div>
		<div class="footer-right">
			<span class="footer-credit">Сделано Lokilife</span>
			<span class="footer-copy">Максим Бычков &copy; 2026</span>
		</div>
	</div>
</footer>

<style>
	.footer {
		width: 100%;
		border-top: 1px solid var(--border);
		background: var(--bg);
		margin-top: auto;
	}

	.footer-inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 12px;
		padding: 14px 24px;
		max-width: 1600px;
		margin: 0 auto;
	}

	.footer-left {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.footer-brand {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 0.8rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.footer-desc {
		font-size: 0.75rem;
		color: var(--text-dim);
	}

	.footer-desc a {
		color: var(--accent);
		opacity: 0.8;
	}
	.footer-desc a:hover {
		opacity: 1;
	}

	.footer-right {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 2px;
	}

	.footer-credit {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		color: var(--text-muted);
		letter-spacing: 0.06em;
	}

	.footer-copy {
		font-size: 0.7rem;
		color: var(--text-dim);
	}
</style>
