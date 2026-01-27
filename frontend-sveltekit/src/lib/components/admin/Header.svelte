<script lang="ts">
	import {
		getAdminState,
		toggleTheme,
		toggleMobileSidebar
	} from '$lib/stores/admin.svelte';
	import { logout, getAuthState } from '$lib/stores/auth.svelte';
	import { goto } from '$app/navigation';

	interface Props {
		title?: string;
	}

	let { title = 'Dashboard' }: Props = $props();

	const admin = getAdminState();
	const auth = getAuthState();

	let showUserMenu = $state(false);

	function toggleUserMenu() {
		showUserMenu = !showUserMenu;
	}

	function closeUserMenu() {
		showUserMenu = false;
	}

	async function handleLogout() {
		await logout();
		goto('/login');
	}
</script>

<header class="admin-header">
	<div class="header-left">
		<button class="menu-btn mobile-only" onclick={toggleMobileSidebar} aria-label="Toggle menu">
			☰
		</button>
		<h1 class="page-title">{title}</h1>
	</div>

	<div class="header-right">
		<button class="theme-toggle" onclick={toggleTheme} aria-label="Toggle theme">
			{admin.theme === 'light' ? '🌙' : '☀️'}
		</button>

		<div class="user-menu-wrapper">
			<button class="user-menu-trigger" onclick={toggleUserMenu}>
				<span class="user-avatar">
					{auth.user?.name?.[0]?.toUpperCase() || auth.user?.email?.[0]?.toUpperCase() || 'A'}
				</span>
				<span class="user-name desktop-only">{auth.user?.name || auth.user?.email}</span>
				<span class="dropdown-arrow">▼</span>
			</button>

			{#if showUserMenu}
				<div class="user-menu">
					<a href="/loginadmin/profile" class="menu-item" onclick={closeUserMenu}>
						<span>👤</span> Profile
					</a>
					<a href="/loginadmin/settings" class="menu-item" onclick={closeUserMenu}>
						<span>⚙️</span> Settings
					</a>
					<hr />
					<button class="menu-item logout" onclick={handleLogout}>
						<span>🚪</span> Logout
					</button>
				</div>
				<div class="menu-overlay" onclick={closeUserMenu} role="presentation"></div>
			{/if}
		</div>
	</div>
</header>

<style>
	.admin-header {
		position: fixed;
		top: 0;
		right: 0;
		left: var(--admin-sidebar-width);
		height: var(--admin-header-height);
		background: var(--admin-header-bg);
		border-bottom: 1px solid var(--admin-header-border);
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 1.5rem;
		z-index: 90;
		transition: left 0.3s ease;
	}

	:global(.sidebar.collapsed) ~ .admin-header {
		left: var(--admin-sidebar-collapsed-width);
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.menu-btn {
		display: none;
		background: transparent;
		border: none;
		font-size: 1.5rem;
		cursor: pointer;
		padding: 0.5rem;
		color: var(--color-text);
	}

	.page-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--color-text);
		margin: 0;
	}

	.header-right {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.theme-toggle {
		background: transparent;
		border: 1px solid var(--color-border);
		border-radius: 8px;
		padding: 0.5rem 0.75rem;
		font-size: 1.25rem;
		cursor: pointer;
		transition: background 0.2s;
	}

	.theme-toggle:hover {
		background: var(--color-bg-secondary);
	}

	.user-menu-wrapper {
		position: relative;
	}

	.user-menu-trigger {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: transparent;
		border: 1px solid var(--color-border);
		border-radius: 8px;
		padding: 0.5rem 0.75rem;
		cursor: pointer;
		transition: background 0.2s;
	}

	.user-menu-trigger:hover {
		background: var(--color-bg-secondary);
	}

	.user-avatar {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		background: var(--admin-sidebar-active);
		color: #fff;
		border-radius: 50%;
		font-weight: 600;
		font-size: 0.875rem;
	}

	.user-name {
		font-weight: 500;
		color: var(--color-text);
		max-width: 150px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.dropdown-arrow {
		font-size: 0.625rem;
		color: var(--color-text-secondary);
	}

	.user-menu {
		position: absolute;
		top: 100%;
		right: 0;
		margin-top: 0.5rem;
		background: var(--admin-card-bg);
		border: 1px solid var(--admin-card-border);
		border-radius: 8px;
		box-shadow: var(--shadow-md);
		min-width: 180px;
		z-index: 100;
		overflow: hidden;
	}

	.user-menu hr {
		border: none;
		border-top: 1px solid var(--color-border);
		margin: 0;
	}

	.menu-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		color: var(--color-text);
		text-decoration: none;
		transition: background 0.2s;
		border: none;
		background: transparent;
		width: 100%;
		cursor: pointer;
		font-size: inherit;
		text-align: left;
	}

	.menu-item:hover {
		background: var(--color-bg-secondary);
	}

	.menu-item.logout {
		color: var(--color-error);
	}

	.menu-overlay {
		position: fixed;
		inset: 0;
		z-index: 99;
	}

	.mobile-only {
		display: none;
	}

	.desktop-only {
		display: inline;
	}

	@media (max-width: 768px) {
		.admin-header {
			left: 0;
		}

		.menu-btn {
			display: block;
		}

		.mobile-only {
			display: block;
		}

		.desktop-only {
			display: none;
		}
	}
</style>
