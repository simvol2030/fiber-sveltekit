<script lang="ts">
	import { page } from '$app/stores';

	// Error messages based on status code
	const errorMessages: Record<number, string> = {
		400: 'Bad Request',
		401: 'Unauthorized',
		403: 'Forbidden',
		404: 'Page Not Found',
		500: 'Internal Server Error',
		502: 'Bad Gateway',
		503: 'Service Unavailable'
	};

	let status = $derived($page.status);
	let message = $derived($page.error?.message || errorMessages[status] || 'Something went wrong');
</script>

<svelte:head>
	<title>Error {status}</title>
</svelte:head>

<div class="error-page">
	<div class="error-content">
		<h1 class="error-status">{status}</h1>
		<p class="error-message">{message}</p>

		<div class="error-actions">
			<a href="/" class="btn btn-primary">Go Home</a>
			<button class="btn btn-secondary" onclick={() => history.back()}>Go Back</button>
		</div>

		{#if status === 404}
			<p class="error-hint">The page you're looking for doesn't exist or has been moved.</p>
		{:else if status === 500}
			<p class="error-hint">We're having some technical difficulties. Please try again later.</p>
		{:else if status === 401}
			<p class="error-hint">You need to be logged in to access this page.</p>
		{:else if status === 403}
			<p class="error-hint">You don't have permission to access this page.</p>
		{/if}
	</div>
</div>

<style>
	.error-page {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		background-color: var(--color-bg-secondary, #f8fafc);
	}

	.error-content {
		text-align: center;
		max-width: 500px;
	}

	.error-status {
		font-size: 8rem;
		font-weight: 700;
		color: var(--color-primary, #3b82f6);
		line-height: 1;
		margin-bottom: 1rem;
	}

	.error-message {
		font-size: 1.5rem;
		color: var(--color-text, #1e293b);
		margin-bottom: 2rem;
	}

	.error-actions {
		display: flex;
		gap: 1rem;
		justify-content: center;
		margin-bottom: 2rem;
	}

	.btn {
		padding: 0.75rem 1.5rem;
		border-radius: var(--radius, 0.5rem);
		font-weight: 500;
		text-decoration: none;
		cursor: pointer;
		border: none;
		font-size: 1rem;
	}

	.btn-primary {
		background-color: var(--color-primary, #3b82f6);
		color: white;
	}

	.btn-primary:hover {
		background-color: var(--color-primary-hover, #2563eb);
	}

	.btn-secondary {
		background-color: var(--color-bg, #ffffff);
		color: var(--color-text, #1e293b);
		border: 1px solid var(--color-border, #e2e8f0);
	}

	.btn-secondary:hover {
		background-color: var(--color-bg-secondary, #f8fafc);
	}

	.error-hint {
		color: var(--color-text-secondary, #64748b);
		font-size: 0.875rem;
	}
</style>
