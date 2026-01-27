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

		<section class="dashboard-section">
			<h2>Quick Actions</h2>
			<div class="actions">
				<button class="btn-secondary">Edit Profile</button>
				<button class="btn-secondary">Change Password</button>
				<button class="btn-secondary">Account Settings</button>
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
</style>
