<script lang="ts">
	interface Props {
		text: string;
		className?: string;
		variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
		disabled?: boolean;
		type?: 'button' | 'submit' | 'reset';
		onClick?: (event: MouseEvent) => void;
	}

	let {
		text,
		className = '',
		variant = 'primary',
		disabled = false,
		type = 'button',
		onClick
	}: Props = $props();
</script>

<button class="btn btn-{variant} {className}" {disabled} {type} onclick={onClick}>
	{text}
</button>

<style>
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		font-family: var(--font-display);
		font-weight: 600;
		font-size: 0.875rem;
		letter-spacing: 0.04em;
		padding: 8px 20px;
		border-radius: var(--radius);
		border: 1px solid transparent;
		cursor: pointer;
		outline: none;
		transition:
			background 0.2s,
			color 0.2s,
			border-color 0.2s,
			box-shadow 0.2s,
			transform 0.12s;
		white-space: nowrap;
		user-select: none;
	}

	.btn:active:not(:disabled) {
		transform: translateY(1px) scale(0.99);
	}

	.btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	/* Primary */
	.btn-primary {
		background: var(--navy);
		color: var(--text);
		border-color: var(--border);
	}
	.btn-primary:hover:not(:disabled) {
		background: var(--navy-bright);
		border-color: var(--accent);
		color: var(--accent);
		box-shadow: 0 0 12px var(--accent-glow);
	}

	/* Secondary */
	.btn-secondary {
		background: transparent;
		color: var(--text-muted);
		border-color: var(--border);
	}
	.btn-secondary:hover:not(:disabled) {
		background: var(--accent-muted);
		color: var(--accent);
		border-color: var(--border-bright);
	}

	/* Ghost */
	.btn-ghost {
		background: transparent;
		color: var(--text-dim);
		border-color: transparent;
	}
	.btn-ghost:hover:not(:disabled) {
		background: var(--accent-muted);
		color: var(--text-muted);
		border-color: var(--border-dim);
	}

	/* Danger */
	.btn-danger {
		background: rgba(220, 50, 50, 0.12);
		color: #e55;
		border-color: rgba(220, 50, 50, 0.3);
	}
	.btn-danger:hover:not(:disabled) {
		background: rgba(220, 50, 50, 0.2);
		border-color: rgba(220, 50, 50, 0.6);
		box-shadow: 0 0 12px rgba(220, 50, 50, 0.2);
	}
</style>
