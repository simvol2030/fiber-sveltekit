<script lang="ts">
	import { onMount } from 'svelte';
	import Sidebar from './Sidebar.svelte';
	import Header from './Header.svelte';
	import Toast from './Toast.svelte';
	import { initTheme, initSidebar, getAdminState } from '$lib/stores/admin.svelte';

	interface Props {
		title?: string;
		children: import('svelte').Snippet;
	}

	let { title = 'Dashboard', children }: Props = $props();

	const admin = getAdminState();

	onMount(() => {
		initTheme();
		initSidebar();
	});
</script>

<div class="admin-layout" class:sidebar-collapsed={admin.sidebarCollapsed}>
	<Sidebar />
	<Header {title} />

	<main class="admin-main">
		<div class="admin-content">
			{@render children()}
		</div>
	</main>

	<Toast />
</div>

<style>
	.admin-layout {
		min-height: 100vh;
		background: var(--admin-content-bg);
	}

	.admin-main {
		margin-left: var(--admin-sidebar-width);
		margin-top: var(--admin-header-height);
		min-height: calc(100vh - var(--admin-header-height));
		transition: margin-left 0.3s ease;
	}

	.admin-layout.sidebar-collapsed .admin-main {
		margin-left: var(--admin-sidebar-collapsed-width);
	}

	.admin-content {
		padding: 1.5rem;
		max-width: 1400px;
		margin: 0 auto;
	}

	@media (max-width: 768px) {
		.admin-main {
			margin-left: 0;
		}

		.admin-layout.sidebar-collapsed .admin-main {
			margin-left: 0;
		}

		.admin-content {
			padding: 1rem;
		}
	}
</style>
