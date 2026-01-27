<script lang="ts">
	import { getAuthState } from '$stores/auth.svelte';

	const auth = getAuthState();
</script>

<svelte:head>
	<title>Home | App</title>
</svelte:head>

<div class="hero">
	<h1>Welcome to App</h1>
	<p class="subtitle">Production-ready SvelteKit template with authentication</p>

	<div class="features">
		<div class="feature">
			<h3>Svelte 5</h3>
			<p>Built with the latest Svelte 5 runes for reactive state management</p>
		</div>
		<div class="feature">
			<h3>Authentication</h3>
			<p>JWT-based auth with refresh tokens and secure cookies</p>
		</div>
		<div class="feature">
			<h3>TypeScript</h3>
			<p>Full type safety throughout the application</p>
		</div>
	</div>

	<div class="cta">
		{#if auth.isAuthenticated}
			<a href="/dashboard" class="btn-primary">Go to Dashboard</a>
		{:else}
			<a href="/register" class="btn-primary">Get Started</a>
			<a href="/login" class="btn-secondary">Sign In</a>
		{/if}
	</div>
</div>

<style>
	.hero {
		text-align: center;
		padding: 4rem 0;
	}

	h1 {
		font-size: 3rem;
		font-weight: 700;
		margin-bottom: 1rem;
		color: var(--color-text);
	}

	.subtitle {
		font-size: 1.25rem;
		color: var(--color-text-secondary);
		margin-bottom: 3rem;
	}

	.features {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 2rem;
		margin-bottom: 3rem;
	}

	.feature {
		padding: 1.5rem;
		background: var(--color-bg-secondary);
		border-radius: var(--radius);
		text-align: left;
	}

	.feature h3 {
		font-size: 1.25rem;
		margin-bottom: 0.5rem;
		color: var(--color-primary);
	}

	.feature p {
		color: var(--color-text-secondary);
		font-size: 0.95rem;
	}

	.cta {
		display: flex;
		justify-content: center;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.cta a {
		display: inline-block;
		padding: 0.75rem 2rem;
		border-radius: var(--radius);
		font-weight: 500;
		text-decoration: none;
		transition: background-color 0.2s;
	}

	.cta .btn-primary {
		background-color: var(--color-primary);
		color: white;
	}

	.cta .btn-primary:hover {
		background-color: var(--color-primary-hover);
	}

	.cta .btn-secondary {
		background-color: var(--color-bg);
		color: var(--color-text);
		border: 1px solid var(--color-border);
	}

	.cta .btn-secondary:hover {
		background-color: var(--color-bg-secondary);
	}
</style>
