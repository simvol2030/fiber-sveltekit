<script lang="ts">
	import { onMount } from 'svelte';
	import StatCard from '$lib/components/admin/StatCard.svelte';
	import { adminApi, type DashboardStats } from '$lib/api/admin';
	import { toast } from '$lib/stores/admin.svelte';

	let stats = $state<DashboardStats | null>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);

	async function loadStats() {
		loading = true;
		error = null;

		try {
			const response = await adminApi.getDashboard();
			if (response.success && response.data) {
				stats = response.data;
			} else {
				error = response.error?.message || 'Failed to load dashboard';
				toast.error(error);
			}
		} catch (e) {
			error = 'Failed to load dashboard';
			toast.error(error);
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadStats();
	});

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}

	function formatTime(dateString: string): string {
		return new Date(dateString).toLocaleTimeString('en-US', {
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<div class="dashboard">
	{#if loading}
		<div class="loading-state">
			<div class="spinner"></div>
			<span>Loading dashboard...</span>
		</div>
	{:else if error}
		<div class="error-state">
			<span class="error-icon">⚠️</span>
			<span>{error}</span>
			<button class="btn-retry" onclick={loadStats}>Retry</button>
		</div>
	{:else if stats}
		<!-- Stats Grid -->
		<div class="stats-grid">
			<StatCard
				title="Total Users"
				value={stats.totalUsers}
				icon="👥"
				variant="primary"
			/>
			<StatCard
				title="Active Users"
				value={stats.activeUsers}
				icon="✅"
				variant="success"
			/>
			<StatCard
				title="Admin Users"
				value={stats.adminUsers}
				icon="🛡️"
				variant="warning"
			/>
			<StatCard
				title="New Today"
				value={stats.newUsersToday}
				icon="📈"
				change={stats.newUsersThisWeek > 0 ? Math.round((stats.newUsersToday / stats.newUsersThisWeek) * 100) : 0}
				changeLabel="of weekly"
			/>
		</div>

		<!-- Quick Stats -->
		<div class="quick-stats">
			<div class="admin-card">
				<h3 class="card-title">Registration Trends</h3>
				<div class="trend-stats">
					<div class="trend-item">
						<span class="trend-value">{stats.newUsersToday}</span>
						<span class="trend-label">Today</span>
					</div>
					<div class="trend-item">
						<span class="trend-value">{stats.newUsersThisWeek}</span>
						<span class="trend-label">This Week</span>
					</div>
					<div class="trend-item">
						<span class="trend-value">{stats.newUsersThisMonth}</span>
						<span class="trend-label">This Month</span>
					</div>
				</div>
			</div>
		</div>

		<!-- Recent Users & Activity -->
		<div class="dashboard-grid">
			<!-- Recent Users -->
			<div class="admin-card">
				<div class="card-header">
					<h3 class="card-title">Recent Users</h3>
					<a href="/admin/users" class="view-all">View All →</a>
				</div>
				{#if stats.recentUsers.length === 0}
					<p class="empty-message">No users yet</p>
				{:else}
					<div class="recent-list">
						{#each stats.recentUsers as user}
							<div class="recent-item">
								<div class="user-avatar">
									{user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
								</div>
								<div class="user-info">
									<span class="user-name">{user.name || 'No name'}</span>
									<span class="user-email">{user.email}</span>
								</div>
								<span class="user-date">{formatDate(user.createdAt)}</span>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Quick Actions -->
			<div class="admin-card">
				<h3 class="card-title">Quick Actions</h3>
				<div class="quick-actions">
					<a href="/admin/users/new" class="action-link">
						<span class="action-icon">➕</span>
						<span>Add New User</span>
					</a>
					<a href="/admin/users" class="action-link">
						<span class="action-icon">👥</span>
						<span>Manage Users</span>
					</a>
					<a href="/admin/files" class="action-link">
						<span class="action-icon">📁</span>
						<span>View Files</span>
					</a>
					<a href="/admin/settings" class="action-link">
						<span class="action-icon">⚙️</span>
						<span>App Settings</span>
					</a>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.dashboard {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.loading-state,
	.error-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		padding: 4rem 2rem;
		text-align: center;
		color: var(--color-text-secondary);
	}

	.spinner {
		width: 40px;
		height: 40px;
		border: 3px solid var(--color-border);
		border-top-color: var(--color-primary);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.error-icon {
		font-size: 3rem;
	}

	.btn-retry {
		padding: 0.5rem 1rem;
		background: var(--color-primary);
		color: white;
		border: none;
		border-radius: 6px;
		cursor: pointer;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 1.5rem;
	}

	@media (max-width: 1200px) {
		.stats-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (max-width: 640px) {
		.stats-grid {
			grid-template-columns: 1fr;
		}
	}

	.quick-stats .admin-card {
		padding: 1.5rem;
	}

	.card-title {
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-text);
		margin: 0 0 1rem;
	}

	.trend-stats {
		display: flex;
		gap: 2rem;
	}

	.trend-item {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.trend-value {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--color-text);
	}

	.trend-label {
		font-size: 0.75rem;
		color: var(--color-text-secondary);
	}

	.dashboard-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.5rem;
	}

	@media (max-width: 1024px) {
		.dashboard-grid {
			grid-template-columns: 1fr;
		}
	}

	.card-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1rem;
	}

	.card-header .card-title {
		margin: 0;
	}

	.view-all {
		font-size: 0.875rem;
		color: var(--color-primary);
		text-decoration: none;
	}

	.view-all:hover {
		text-decoration: underline;
	}

	.empty-message {
		color: var(--color-text-secondary);
		text-align: center;
		padding: 2rem;
		font-size: 0.875rem;
	}

	.recent-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.recent-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem;
		background: var(--color-bg-secondary);
		border-radius: 8px;
	}

	.user-avatar {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background: var(--color-primary);
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
		font-size: 0.875rem;
	}

	.user-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.user-name {
		font-weight: 500;
		color: var(--color-text);
		font-size: 0.875rem;
	}

	.user-email {
		font-size: 0.75rem;
		color: var(--color-text-secondary);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.user-date {
		font-size: 0.75rem;
		color: var(--color-text-secondary);
		white-space: nowrap;
	}

	.quick-actions {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.action-link {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.875rem 1rem;
		background: var(--color-bg-secondary);
		border-radius: 8px;
		color: var(--color-text);
		text-decoration: none;
		transition: background 0.2s;
	}

	.action-link:hover {
		background: var(--admin-table-row-hover);
	}

	.action-icon {
		font-size: 1.25rem;
	}
</style>
