<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { initAuth, getAuthState, logout } from '$stores/auth.svelte';
	import { goto } from '$app/navigation';

	let { children } = $props();

	const auth = getAuthState();

	onMount(() => {
		initAuth();
	});

	async function handleLogout() {
		await logout();
		goto('/login');
	}
</script>

<div class="app">
	<header>
		<nav class="container">
			<a href="/" class="logo">App</a>
			<div class="nav-links">
				{#if auth.isLoading}
					<span class="nav-loading">Loading...</span>
				{:else if auth.isAuthenticated}
					<a href="/dashboard">Dashboard</a>
					<span class="user-email">{auth.user?.email}</span>
					<button class="btn-secondary" onclick={() => handleLogout()}>Logout</button>
				{:else}
					<a href="/login">Login</a>
					<a href="/register">Register</a>
				{/if}
			</div>
		</nav>
	</header>

	<main class="container">
		{@render children()}
	</main>

	<footer>
		<div class="container">
			<p>&copy; {new Date().getFullYear()} App. All rights reserved.</p>
		</div>
	</footer>
</div>

<style>
	.app {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	header {
		background: var(--color-bg);
		border-bottom: 1px solid var(--color-border);
		padding: 1rem 0;
	}

	nav {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.logo {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--color-primary);
	}

	.logo:hover {
		text-decoration: none;
	}

	.nav-links {
		display: flex;
		align-items: center;
		gap: 1.5rem;
	}

	.nav-links a {
		color: var(--color-text);
		font-weight: 500;
	}

	.nav-links a:hover {
		color: var(--color-primary);
		text-decoration: none;
	}

	.nav-loading {
		color: var(--color-text-secondary);
		font-size: 0.875rem;
	}

	.user-email {
		color: var(--color-text-secondary);
		font-size: 0.875rem;
	}

	main {
		flex: 1;
		padding: 2rem 1rem;
	}

	footer {
		background: var(--color-bg-secondary);
		border-top: 1px solid var(--color-border);
		padding: 1.5rem 0;
		text-align: center;
	}

	footer p {
		color: var(--color-text-secondary);
		font-size: 0.875rem;
	}
</style>
