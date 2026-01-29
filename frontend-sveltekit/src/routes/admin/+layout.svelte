<script lang="ts">
	import AdminLayout from '$lib/components/admin/AdminLayout.svelte';
	import { page } from '$app/stores';

	let { children } = $props();

	// Get page title from URL
	function getPageTitle(): string {
		const path = $page.url.pathname;

		if (path === '/admin') return 'Dashboard';
		if (path.startsWith('/admin/users/new')) return 'Create User';
		if (path.match(/\/admin\/users\/[^/]+$/)) return 'Edit User';
		if (path.startsWith('/admin/users')) return 'Users';
		if (path.startsWith('/admin/files')) return 'Files';
		if (path.startsWith('/admin/settings')) return 'Settings';
		if (path.startsWith('/admin/profile')) return 'Profile';

		return 'Admin';
	}

	const title = $derived(getPageTitle());
</script>

<AdminLayout {title}>
	{@render children()}
</AdminLayout>

<style>
	/* Admin-specific global styles that don't belong in app.css */
	:global(.admin-page-header) {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1.5rem;
		flex-wrap: wrap;
		gap: 1rem;
	}

	:global(.admin-page-title) {
		font-size: 1.5rem;
		font-weight: 600;
		color: var(--color-text);
		margin: 0;
	}

	:global(.admin-card) {
		background: var(--admin-card-bg);
		border: 1px solid var(--admin-card-border);
		border-radius: 12px;
		padding: 1.5rem;
		box-shadow: var(--admin-card-shadow);
	}

	:global(.admin-grid) {
		display: grid;
		gap: 1.5rem;
	}

	:global(.admin-grid-2) {
		grid-template-columns: repeat(2, 1fr);
	}

	:global(.admin-grid-3) {
		grid-template-columns: repeat(3, 1fr);
	}

	:global(.admin-grid-4) {
		grid-template-columns: repeat(4, 1fr);
	}

	@media (max-width: 1024px) {
		:global(.admin-grid-4) {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (max-width: 768px) {
		:global(.admin-grid-2),
		:global(.admin-grid-3),
		:global(.admin-grid-4) {
			grid-template-columns: 1fr;
		}
	}
</style>
