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
		font-family: var(--font-body);
		font-weight: 600;
		font-size: 0.875rem;
		letter-spacing: 0.01em;
		padding: 8px 20px;
		border-radius: var(--radius);
		border: 1px solid transparent;
		cursor: pointer;
		outline: none;
		transition:
			background 0.15s,
			color 0.15s,
			border-color 0.15s,
			transform 0.12s;
		white-space: nowrap;
		user-select: none;
	}

	.btn:active:not(:disabled) {
		transform: scale(0.98);
	}

	.btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	/* Primary: solid ink */
	.btn-primary {
		background: #111111;
		color: #ffffff;
	}
	.btn-primary:hover:not(:disabled) {
		background: #333333;
	}

	/* Secondary */
	.btn-secondary {
		background: transparent;
		color: var(--text);
		border-color: var(--border);
	}
	.btn-secondary:hover:not(:disabled) {
		background: rgba(29, 28, 26, 0.05);
		border-color: var(--text-dim);
	}

	/* Ghost */
	.btn-ghost {
		background: transparent;
		color: var(--text-muted);
		border-color: transparent;
	}
	.btn-ghost:hover:not(:disabled) {
		background: rgba(29, 28, 26, 0.05);
		color: var(--text);
	}

	/* Danger */
	.btn-danger {
		background: #fdebec;
		color: #9f2f2d;
		border-color: transparent;
	}
	.btn-danger:hover:not(:disabled) {
		background: #f9d9db;
	}
</style>
