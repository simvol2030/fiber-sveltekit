<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		open: boolean;
		title: string;
		size?: 'sm' | 'md' | 'lg';
		onClose: () => void;
		children: Snippet;
		footer?: Snippet;
	}

	let { open, title, size = 'md', onClose, children, footer }: Props = $props();

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			onClose();
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			onClose();
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} />

{#if open}
	<div class="modal-backdrop" onclick={handleBackdropClick} role="presentation">
		<div class="modal modal-{size}" role="dialog" aria-modal="true" aria-labelledby="modal-title">
			<div class="modal-header">
				<h2 id="modal-title" class="modal-title">{title}</h2>
				<button class="modal-close" onclick={onClose} aria-label="Close">✕</button>
			</div>

			<div class="modal-body">
				{@render children()}
			</div>

			{#if footer}
				<div class="modal-footer">
					{@render footer()}
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
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

	.modal {
		background: var(--admin-card-bg);
		border-radius: 12px;
		box-shadow: var(--shadow-md);
		max-height: calc(100vh - 2rem);
		display: flex;
		flex-direction: column;
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

	.modal-sm {
		width: 100%;
		max-width: 400px;
	}

	.modal-md {
		width: 100%;
		max-width: 560px;
	}

	.modal-lg {
		width: 100%;
		max-width: 800px;
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 1.5rem;
		border-bottom: 1px solid var(--admin-card-border);
	}

	.modal-title {
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--color-text);
		margin: 0;
	}

	.modal-close {
		background: transparent;
		border: none;
		font-size: 1.25rem;
		cursor: pointer;
		color: var(--color-text-secondary);
		padding: 0.25rem;
		transition: color 0.2s;
	}

	.modal-close:hover {
		color: var(--color-text);
	}

	.modal-body {
		padding: 1.5rem;
		overflow-y: auto;
	}

	.modal-footer {
		padding: 1rem 1.5rem;
		border-top: 1px solid var(--admin-card-border);
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
	}
</style>
