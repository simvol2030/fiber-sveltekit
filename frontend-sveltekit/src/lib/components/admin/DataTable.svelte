<script lang="ts">
	import Pagination from './Pagination.svelte';
	import SearchInput from './SearchInput.svelte';

	export interface Column {
		key: string;
		label: string;
		sortable?: boolean;
		format?: 'text' | 'date' | 'datetime' | 'currency' | 'badge' | 'boolean';
		width?: string;
		badgeColors?: Record<string, string>;
	}

	export interface Action {
		label: string;
		icon?: string;
		variant?: 'default' | 'primary' | 'danger';
		onClick: (item: Record<string, unknown>) => void;
	}

	interface Props {
		data: Record<string, unknown>[];
		columns: Column[];
		searchable?: boolean;
		sortable?: boolean;
		pageSize?: number;
		totalItems?: number;
		currentPage?: number;
		totalPages?: number;
		actions?: Action[];
		loading?: boolean;
		emptyMessage?: string;
		onSearch?: (value: string) => void;
		onSort?: (key: string, dir: 'asc' | 'desc') => void;
		onPageChange?: (page: number) => void;
		onExport?: () => void;
	}

	let {
		data,
		columns,
		searchable = true,
		sortable = true,
		pageSize = 10,
		totalItems = 0,
		currentPage = 1,
		totalPages = 1,
		actions = [],
		loading = false,
		emptyMessage = 'No data found',
		onSearch,
		onSort,
		onPageChange,
		onExport
	}: Props = $props();

	let sortKey = $state('');
	let sortDir = $state<'asc' | 'desc'>('asc');
	let searchValue = $state('');

	function handleSort(key: string) {
		if (!sortable) return;

		if (sortKey === key) {
			sortDir = sortDir === 'asc' ? 'desc' : 'asc';
		} else {
			sortKey = key;
			sortDir = 'asc';
		}

		onSort?.(sortKey, sortDir);
	}

	function handleSearch(value: string) {
		searchValue = value;
		onSearch?.(value);
	}

	function formatValue(value: unknown, column: Column): string {
		if (value === null || value === undefined) return '-';

		switch (column.format) {
			case 'date':
				return new Date(value as string).toLocaleDateString();
			case 'datetime':
				return new Date(value as string).toLocaleString();
			case 'currency':
				return new Intl.NumberFormat('en-US', {
					style: 'currency',
					currency: 'USD'
				}).format(value as number);
			case 'boolean':
				return (value as boolean) ? 'Yes' : 'No';
			default:
				return String(value);
		}
	}

	function getBadgeClass(value: unknown, column: Column): string {
		if (!column.badgeColors) {
			// Default badge colors
			const defaults: Record<string, string> = {
				admin: 'badge-admin',
				user: 'badge-user',
				active: 'badge-active',
				inactive: 'badge-inactive',
				true: 'badge-active',
				false: 'badge-inactive'
			};
			return defaults[String(value).toLowerCase()] || 'badge-default';
		}
		return column.badgeColors[String(value)] || 'badge-default';
	}
</script>

<div class="data-table-wrapper">
	{#if searchable || onExport}
		<div class="table-toolbar">
			{#if searchable}
				<div class="search-wrapper">
					<SearchInput value={searchValue} onSearch={handleSearch} placeholder="Search..." />
				</div>
			{/if}

			{#if onExport}
				<button class="btn-export" onclick={onExport}>
					📥 Export CSV
				</button>
			{/if}
		</div>
	{/if}

	<div class="table-container">
		<table class="data-table">
			<thead>
				<tr>
					{#each columns as column}
						<th
							style={column.width ? `width: ${column.width}` : ''}
							class:sortable={sortable && column.sortable !== false}
							onclick={() => column.sortable !== false && handleSort(column.key)}
						>
							<span class="th-content">
								{column.label}
								{#if sortable && column.sortable !== false}
									<span class="sort-indicator" class:active={sortKey === column.key}>
										{#if sortKey === column.key}
											{sortDir === 'asc' ? '↑' : '↓'}
										{:else}
											↕
										{/if}
									</span>
								{/if}
							</span>
						</th>
					{/each}
					{#if actions.length > 0}
						<th class="actions-column">Actions</th>
					{/if}
				</tr>
			</thead>
			<tbody>
				{#if loading}
					<tr>
						<td colspan={columns.length + (actions.length > 0 ? 1 : 0)} class="loading-cell">
							<div class="loading-content">
								<div class="loading-spinner"></div>
								<span>Loading...</span>
							</div>
						</td>
					</tr>
				{:else if data.length === 0}
					<tr>
						<td colspan={columns.length + (actions.length > 0 ? 1 : 0)} class="empty-cell">
							{emptyMessage}
						</td>
					</tr>
				{:else}
					{#each data as item}
						<tr>
							{#each columns as column}
								<td>
									{#if column.format === 'badge'}
										<span class="badge {getBadgeClass(item[column.key], column)}">
											{formatValue(item[column.key], column)}
										</span>
									{:else if column.format === 'boolean'}
										<span class="badge {item[column.key] ? 'badge-active' : 'badge-inactive'}">
											{formatValue(item[column.key], column)}
										</span>
									{:else}
										{formatValue(item[column.key], column)}
									{/if}
								</td>
							{/each}
							{#if actions.length > 0}
								<td class="actions-cell">
									{#each actions as action}
										<button
											class="action-btn action-{action.variant || 'default'}"
											onclick={() => action.onClick(item)}
											title={action.label}
										>
											{#if action.icon}
												<span>{action.icon}</span>
											{/if}
											<span class="action-label">{action.label}</span>
										</button>
									{/each}
								</td>
							{/if}
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>
	</div>

	{#if onPageChange && totalPages > 1}
		<Pagination
			{currentPage}
			{totalPages}
			{totalItems}
			{pageSize}
			onPageChange={onPageChange}
		/>
	{/if}
</div>

<style>
	.data-table-wrapper {
		background: var(--admin-card-bg);
		border: 1px solid var(--admin-card-border);
		border-radius: 12px;
		overflow: hidden;
	}

	.table-toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 1rem;
		border-bottom: 1px solid var(--admin-table-border);
	}

	.search-wrapper {
		flex: 1;
		max-width: 320px;
	}

	.btn-export {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.625rem 1rem;
		background: var(--color-bg-secondary);
		border: 1px solid var(--admin-card-border);
		border-radius: 8px;
		color: var(--color-text);
		font-size: 0.875rem;
		cursor: pointer;
		transition: background 0.2s;
	}

	.btn-export:hover {
		background: var(--admin-table-row-hover);
	}

	.table-container {
		overflow-x: auto;
	}

	.data-table {
		width: 100%;
		border-collapse: collapse;
	}

	th, td {
		padding: 0.875rem 1rem;
		text-align: left;
	}

	th {
		background: var(--admin-table-header-bg);
		color: var(--color-text-secondary);
		font-weight: 600;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		white-space: nowrap;
		border-bottom: 1px solid var(--admin-table-border);
	}

	th.sortable {
		cursor: pointer;
		user-select: none;
	}

	th.sortable:hover {
		color: var(--color-text);
	}

	.th-content {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.sort-indicator {
		opacity: 0.3;
		font-size: 0.75rem;
	}

	.sort-indicator.active {
		opacity: 1;
		color: var(--color-primary);
	}

	td {
		color: var(--color-text);
		font-size: 0.875rem;
		border-bottom: 1px solid var(--admin-table-border);
	}

	tbody tr:hover {
		background: var(--admin-table-row-hover);
	}

	tbody tr:last-child td {
		border-bottom: none;
	}

	.loading-cell,
	.empty-cell {
		text-align: center;
		padding: 3rem 1rem;
		color: var(--color-text-secondary);
	}

	.loading-content {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
	}

	.loading-spinner {
		width: 20px;
		height: 20px;
		border: 2px solid var(--color-border);
		border-top-color: var(--color-primary);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.actions-column {
		width: 1%;
		white-space: nowrap;
	}

	.actions-cell {
		white-space: nowrap;
	}

	.action-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.375rem 0.75rem;
		border: none;
		border-radius: 6px;
		font-size: 0.75rem;
		cursor: pointer;
		transition: background 0.2s;
		margin-right: 0.5rem;
	}

	.action-btn:last-child {
		margin-right: 0;
	}

	.action-default {
		background: var(--color-bg-secondary);
		color: var(--color-text);
	}

	.action-default:hover {
		background: var(--admin-table-row-hover);
	}

	.action-primary {
		background: var(--color-primary);
		color: white;
	}

	.action-primary:hover {
		background: var(--color-primary-hover);
	}

	.action-danger {
		background: var(--color-error);
		color: white;
	}

	.action-danger:hover {
		background: #dc2626;
	}

	.badge {
		display: inline-flex;
		align-items: center;
		padding: 0.25rem 0.75rem;
		border-radius: 9999px;
		font-size: 0.75rem;
		font-weight: 500;
	}

	.badge-active {
		background: rgba(72, 187, 120, 0.1);
		color: var(--admin-badge-active);
	}

	.badge-inactive {
		background: rgba(160, 174, 192, 0.1);
		color: var(--admin-badge-inactive);
	}

	.badge-admin {
		background: rgba(79, 70, 229, 0.1);
		color: var(--admin-badge-admin);
	}

	.badge-user {
		background: rgba(59, 130, 246, 0.1);
		color: var(--admin-badge-user);
	}

	.badge-default {
		background: var(--color-bg-secondary);
		color: var(--color-text-secondary);
	}

	@media (max-width: 768px) {
		.table-toolbar {
			flex-direction: column;
		}

		.search-wrapper {
			max-width: none;
			width: 100%;
		}

		.btn-export {
			width: 100%;
			justify-content: center;
		}

		.action-label {
			display: none;
		}

		.action-btn {
			padding: 0.5rem;
		}
	}
</style>
