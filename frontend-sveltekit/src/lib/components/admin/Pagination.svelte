<script lang="ts">
	interface Props {
		currentPage: number;
		totalPages: number;
		totalItems: number;
		pageSize: number;
		onPageChange: (page: number) => void;
	}

	let { currentPage, totalPages, totalItems, pageSize, onPageChange }: Props = $props();

	const startItem = $derived((currentPage - 1) * pageSize + 1);
	const endItem = $derived(Math.min(currentPage * pageSize, totalItems));

	function getVisiblePages(): (number | string)[] {
		const pages: (number | string)[] = [];
		const delta = 2;

		if (totalPages <= 7) {
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i);
			}
		} else {
			pages.push(1);

			if (currentPage > delta + 2) {
				pages.push('...');
			}

			const start = Math.max(2, currentPage - delta);
			const end = Math.min(totalPages - 1, currentPage + delta);

			for (let i = start; i <= end; i++) {
				pages.push(i);
			}

			if (currentPage < totalPages - delta - 1) {
				pages.push('...');
			}

			pages.push(totalPages);
		}

		return pages;
	}

	const visiblePages = $derived(getVisiblePages());
</script>

{#if totalPages > 1}
	<div class="pagination">
		<div class="pagination-info">
			Showing {startItem} to {endItem} of {totalItems} items
		</div>

		<div class="pagination-controls">
			<button
				class="page-btn"
				disabled={currentPage === 1}
				onclick={() => onPageChange(currentPage - 1)}
				aria-label="Previous page"
			>
				←
			</button>

			{#each visiblePages as page}
				{#if page === '...'}
					<span class="page-ellipsis">...</span>
				{:else}
					<button
						class="page-btn"
						class:active={page === currentPage}
						onclick={() => onPageChange(page as number)}
						aria-label="Page {page}"
						aria-current={page === currentPage ? 'page' : undefined}
					>
						{page}
					</button>
				{/if}
			{/each}

			<button
				class="page-btn"
				disabled={currentPage === totalPages}
				onclick={() => onPageChange(currentPage + 1)}
				aria-label="Next page"
			>
				→
			</button>
		</div>
	</div>
{/if}

<style>
	.pagination {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 0;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.pagination-info {
		color: var(--color-text-secondary);
		font-size: 0.875rem;
	}

	.pagination-controls {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.page-btn {
		min-width: 36px;
		height: 36px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0 0.5rem;
		background: var(--admin-card-bg);
		border: 1px solid var(--admin-card-border);
		border-radius: 6px;
		color: var(--color-text);
		font-size: 0.875rem;
		cursor: pointer;
		transition: background 0.2s, border-color 0.2s;
	}

	.page-btn:hover:not(:disabled) {
		background: var(--color-bg-secondary);
		border-color: var(--color-primary);
	}

	.page-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.page-btn.active {
		background: var(--color-primary);
		border-color: var(--color-primary);
		color: white;
	}

	.page-ellipsis {
		padding: 0 0.5rem;
		color: var(--color-text-secondary);
	}

	@media (max-width: 640px) {
		.pagination {
			justify-content: center;
		}

		.pagination-info {
			width: 100%;
			text-align: center;
		}
	}
</style>
