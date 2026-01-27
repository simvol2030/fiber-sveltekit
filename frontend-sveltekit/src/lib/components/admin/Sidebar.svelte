<script lang="ts">
	import { page } from '$app/stores';
	import {
		getAdminState,
		toggleSidebar,
		closeMobileSidebar
	} from '$lib/stores/admin.svelte';
	import { getAuthState } from '$lib/stores/auth.svelte';

	const admin = getAdminState();
	const auth = getAuthState();

	interface MenuItem {
		icon: string;
		label: string;
		href: string;
	}

	const menuItems: MenuItem[] = [
		{ icon: '📊', label: 'Dashboard', href: '/loginadmin' },
		{ icon: '👥', label: 'Users', href: '/loginadmin/users' },
		{ icon: '📁', label: 'Files', href: '/loginadmin/files' },
		{ icon: '⚙️', label: 'Settings', href: '/loginadmin/settings' },
		{ icon: '👤', label: 'Profile', href: '/loginadmin/profile' }
	];

	function isActive(href: string): boolean {
		const currentPath = $page.url.pathname;
		if (href === '/loginadmin') {
			return currentPath === '/loginadmin';
		}
		return currentPath.startsWith(href);
	}

	function handleLinkClick() {
		closeMobileSidebar();
	}
</script>

<aside class="sidebar" class:collapsed={admin.sidebarCollapsed} class:mobile-open={admin.sidebarMobileOpen}>
	<div class="sidebar-header">
		<a href="/loginadmin" class="logo" onclick={handleLinkClick}>
			{#if admin.sidebarCollapsed}
				<span class="logo-icon">A</span>
			{:else}
				<span class="logo-text">Admin Panel</span>
			{/if}
		</a>
		<button class="toggle-btn desktop-only" onclick={toggleSidebar} aria-label="Toggle sidebar">
			{admin.sidebarCollapsed ? '→' : '←'}
		</button>
		<button class="toggle-btn mobile-only" onclick={closeMobileSidebar} aria-label="Close sidebar">
			✕
		</button>
	</div>

	<nav class="sidebar-nav">
		<ul>
			{#each menuItems as item}
				<li>
					<a
						href={item.href}
						class="nav-item"
						class:active={isActive(item.href)}
						onclick={handleLinkClick}
						title={admin.sidebarCollapsed ? item.label : undefined}
					>
						<span class="nav-icon">{item.icon}</span>
						{#if !admin.sidebarCollapsed}
							<span class="nav-label">{item.label}</span>
						{/if}
					</a>
				</li>
			{/each}
		</ul>
	</nav>

	<div class="sidebar-footer">
		{#if !admin.sidebarCollapsed}
			<div class="user-info">
				<span class="user-email">{auth.user?.email}</span>
				<span class="user-role">Administrator</span>
			</div>
		{/if}
		<a href="/" class="back-link" title="Back to site">
			<span class="nav-icon">🏠</span>
			{#if !admin.sidebarCollapsed}
				<span class="nav-label">Back to Site</span>
			{/if}
		</a>
	</div>
</aside>

<!-- Mobile overlay -->
{#if admin.sidebarMobileOpen}
	<div class="sidebar-overlay" onclick={closeMobileSidebar} role="presentation"></div>
{/if}

<style>
	.sidebar {
		position: fixed;
		left: 0;
		top: 0;
		bottom: 0;
		width: var(--admin-sidebar-width);
		background: var(--admin-sidebar-bg);
		display: flex;
		flex-direction: column;
		transition: width 0.3s ease, transform 0.3s ease;
		z-index: 100;
	}

	.sidebar.collapsed {
		width: var(--admin-sidebar-collapsed-width);
	}

	.sidebar-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		min-height: var(--admin-header-height);
	}

	.logo {
		color: #fff;
		font-weight: 700;
		font-size: 1.25rem;
		text-decoration: none;
	}

	.logo-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		background: var(--admin-sidebar-active);
		border-radius: 8px;
		font-size: 1rem;
	}

	.toggle-btn {
		background: transparent;
		border: none;
		color: var(--admin-sidebar-text);
		cursor: pointer;
		padding: 0.5rem;
		font-size: 1rem;
		border-radius: 4px;
		transition: background 0.2s, color 0.2s;
	}

	.toggle-btn:hover {
		background: rgba(255, 255, 255, 0.1);
		color: #fff;
	}

	.mobile-only {
		display: none;
	}

	.sidebar-nav {
		flex: 1;
		overflow-y: auto;
		padding: 1rem 0;
	}

	.sidebar-nav ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.nav-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		color: var(--admin-sidebar-text);
		text-decoration: none;
		transition: background 0.2s, color 0.2s;
		margin: 0.25rem 0.5rem;
		border-radius: 8px;
	}

	.nav-item:hover {
		background: rgba(255, 255, 255, 0.05);
		color: var(--admin-sidebar-text-hover);
	}

	.nav-item.active {
		background: var(--admin-sidebar-active-bg);
		color: var(--admin-sidebar-active);
	}

	.nav-icon {
		font-size: 1.25rem;
		width: 24px;
		text-align: center;
	}

	.nav-label {
		font-weight: 500;
		white-space: nowrap;
	}

	.collapsed .nav-item {
		justify-content: center;
		padding: 0.75rem;
	}

	.sidebar-footer {
		border-top: 1px solid rgba(255, 255, 255, 0.1);
		padding: 1rem;
	}

	.user-info {
		display: flex;
		flex-direction: column;
		margin-bottom: 1rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	.user-email {
		color: #fff;
		font-size: 0.875rem;
		font-weight: 500;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.user-role {
		color: var(--admin-sidebar-text);
		font-size: 0.75rem;
	}

	.back-link {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		color: var(--admin-sidebar-text);
		text-decoration: none;
		padding: 0.5rem;
		border-radius: 8px;
		transition: background 0.2s, color 0.2s;
	}

	.back-link:hover {
		background: rgba(255, 255, 255, 0.05);
		color: var(--admin-sidebar-text-hover);
	}

	.collapsed .back-link {
		justify-content: center;
	}

	.sidebar-overlay {
		display: none;
	}

	/* Mobile styles */
	@media (max-width: 768px) {
		.sidebar {
			transform: translateX(-100%);
		}

		.sidebar.mobile-open {
			transform: translateX(0);
		}

		.sidebar.collapsed {
			width: var(--admin-sidebar-width);
		}

		.desktop-only {
			display: none;
		}

		.mobile-only {
			display: block;
		}

		.sidebar-overlay {
			display: block;
			position: fixed;
			inset: 0;
			background: rgba(0, 0, 0, 0.5);
			z-index: 99;
		}
	}
</style>
