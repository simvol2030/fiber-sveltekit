<script lang="ts">
	import { getAuthState } from '$stores/auth.svelte';
	import type { PageData } from './$types';

	// User data from server-side load (already authenticated via +page.server.ts)
	let { data }: { data: PageData } = $props();

	// Also sync with client-side auth state for navigation
	const auth = getAuthState();

	// Prefer server data (SSR), fallback to client state (client-side navigation)
	let user = $derived(data?.user || auth.user);
</script>

<svelte:head>
	<title>Dashboard | App</title>
</svelte:head>

<!-- Server-side auth check ensures user is authenticated before reaching this point -->
<div class="dashboard">
	<header class="dashboard-header">
		<h1>Dashboard</h1>
		<p class="welcome">Welcome back, {user?.name || user?.email}!</p>
	</header>

	<div class="dashboard-content">
		<div class="stats-grid">
			<div class="stat-card card">
				<h3>Account Status</h3>
				<p class="stat-value text-success">Active</p>
			</div>

			<div class="stat-card card">
				<h3>Email</h3>
				<p class="stat-value">{user?.email}</p>
			</div>

			<div class="stat-card card">
				<h3>Member Since</h3>
				<p class="stat-value">
					{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
				</p>
			</div>

			{#if user?.role}
				<div class="stat-card card">
					<h3>Role</h3>
					<p class="stat-value" class:text-success={user.role === 'admin'}>
						{user.role === 'admin' ? 'Administrator' : 'User'}
					</p>
				</div>
			{/if}
		</div>

		{#if user?.role === 'admin'}
			<section class="dashboard-section">
				<a href="/admin" class="admin-panel-link">
					<span class="admin-panel-icon">&#9881;</span>
					<span>
						<strong>Admin Panel</strong>
						<small>Manage users, files and settings</small>
					</span>
					<span class="admin-panel-arrow">&rarr;</span>
				</a>
			</section>
		{/if}

		<section class="dashboard-section">
			<h2>Quick Actions</h2>
			<div class="actions">
				<a href="/dashboard/profile" class="btn-secondary">Edit Profile</a>
				<a href="/dashboard/profile" class="btn-secondary">Change Password</a>
			</div>
		</section>

		<section class="dashboard-section">
			<h2>Recent Activity</h2>
			<div class="activity-list card">
				<p class="no-activity">No recent activity to show.</p>
			</div>
		</section>
	</div>
</div>

<style>
	.dashboard-header {
		margin-bottom: 2rem;
	}

	.dashboard-header h1 {
		font-size: 2rem;
		margin-bottom: 0.5rem;
	}

	.welcome {
		color: var(--color-text-secondary);
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.stat-card h3 {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		margin-bottom: 0.5rem;
		font-weight: 500;
	}

	.stat-value {
		font-size: 1.25rem;
		font-weight: 600;
	}

	.dashboard-section {
		margin-bottom: 2rem;
	}

	.dashboard-section h2 {
		font-size: 1.25rem;
		margin-bottom: 1rem;
	}

	.actions {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.activity-list {
		min-height: 100px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.no-activity {
		color: var(--color-text-secondary);
	}

	.admin-panel-link {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem 1.5rem;
		background: var(--color-bg);
		border: 1px solid var(--admin-badge-admin, #4f46e5);
		border-radius: var(--radius);
		text-decoration: none;
		color: var(--color-text);
		transition: background-color 0.2s, box-shadow 0.2s;
	}

	.admin-panel-link:hover {
		background: var(--color-bg-secondary);
		box-shadow: var(--shadow-md);
		text-decoration: none;
	}

	.admin-panel-link strong {
		display: block;
		font-size: 1rem;
	}

	.admin-panel-link small {
		color: var(--color-text-secondary);
		font-size: 0.8125rem;
	}

	.admin-panel-icon {
		font-size: 1.5rem;
		color: var(--admin-badge-admin, #4f46e5);
	}

	.admin-panel-arrow {
		margin-left: auto;
		font-size: 1.25rem;
		color: var(--color-text-secondary);
	}
</style>
