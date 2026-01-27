<script lang="ts">
	interface Props {
		open: boolean;
		title: string;
		message: string;
		confirmLabel?: string;
		cancelLabel?: string;
		variant?: 'danger' | 'warning' | 'info';
		onConfirm: () => void;
		onCancel: () => void;
	}

	let {
		open,
		title,
		message,
		confirmLabel = 'Confirm',
		cancelLabel = 'Cancel',
		variant = 'danger',
		onConfirm,
		onCancel
	}: Props = $props();

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			onCancel();
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} />

{#if open}
	<div class="dialog-backdrop" onclick={onCancel} role="presentation">
		<div
			class="dialog"
			role="alertdialog"
			aria-modal="true"
			aria-labelledby="dialog-title"
			aria-describedby="dialog-message"
			onclick={(e) => e.stopPropagation()}
		>
			<div class="dialog-icon dialog-icon-{variant}">
				{#if variant === 'danger'}
					⚠️
				{:else if variant === 'warning'}
					⚠️
				{:else}
					ℹ️
				{/if}
			</div>

			<h2 id="dialog-title" class="dialog-title">{title}</h2>
			<p id="dialog-message" class="dialog-message">{message}</p>

			<div class="dialog-actions">
				<button class="btn-cancel" onclick={onCancel}>
					{cancelLabel}
				</button>
				<button class="btn-confirm btn-{variant}" onclick={onConfirm}>
					{confirmLabel}
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.dialog-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1001;
		padding: 1rem;
		animation: fadeIn 0.2s ease;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.dialog {
		background: var(--admin-card-bg);
		border-radius: 12px;
		box-shadow: var(--shadow-md);
		padding: 1.5rem;
		text-align: center;
		max-width: 400px;
		width: 100%;
		animation: slideUp 0.3s ease;
	}

	@keyframes slideUp {
		from {
			transform: translateY(20px);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	.dialog-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
	}

	.dialog-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--color-text);
		margin: 0 0 0.5rem;
	}

	.dialog-message {
		color: var(--color-text-secondary);
		margin: 0 0 1.5rem;
		line-height: 1.5;
	}

	.dialog-actions {
		display: flex;
		gap: 0.75rem;
		justify-content: center;
	}

	.btn-cancel,
	.btn-confirm {
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.2s, transform 0.1s;
		min-width: 100px;
	}

	.btn-cancel {
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		color: var(--color-text);
	}

	.btn-cancel:hover {
		background: var(--color-border);
	}

	.btn-confirm {
		border: none;
		color: white;
	}

	.btn-danger {
		background: var(--color-error);
	}

	.btn-danger:hover {
		background: #dc2626;
	}

	.btn-warning {
		background: var(--color-warning);
	}

	.btn-warning:hover {
		background: #d97706;
	}

	.btn-info {
		background: var(--color-primary);
	}

	.btn-info:hover {
		background: var(--color-primary-hover);
	}

	.btn-cancel:active,
	.btn-confirm:active {
		transform: scale(0.98);
	}
</style>
