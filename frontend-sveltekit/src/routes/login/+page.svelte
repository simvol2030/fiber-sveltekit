<script lang="ts">
	import { login, getAuthState } from '$stores/auth.svelte';
	import { goto } from '$app/navigation';

	const auth = getAuthState();

	let email = $state('');
	let password = $state('');
	let error = $state('');
	let isSubmitting = $state(false);

	// Redirect if already authenticated
	$effect(() => {
		if (!auth.isLoading && auth.isAuthenticated) {
			goto('/dashboard');
		}
	});

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = '';
		isSubmitting = true;

		const result = await login(email, password);

		if (result.success) {
			goto('/dashboard');
		} else {
			error = result.error || 'Login failed';
		}

		isSubmitting = false;
	}
</script>

<svelte:head>
	<title>Login | App</title>
</svelte:head>

<div class="auth-page">
	<div class="auth-card card">
		<h1>Sign In</h1>
		<p class="subtitle">Welcome back! Please sign in to continue.</p>

		{#if error}
			<div class="alert alert-error">{error}</div>
		{/if}

		<form onsubmit={handleSubmit}>
			<div class="form-group">
				<label for="email">Email</label>
				<input
					type="email"
					id="email"
					bind:value={email}
					placeholder="you@example.com"
					required
					disabled={isSubmitting}
				/>
			</div>

			<div class="form-group">
				<label for="password">Password</label>
				<input
					type="password"
					id="password"
					bind:value={password}
					placeholder="Your password"
					required
					disabled={isSubmitting}
				/>
			</div>

			<button type="submit" class="btn-primary btn-full" disabled={isSubmitting}>
				{isSubmitting ? 'Signing in...' : 'Sign In'}
			</button>
		</form>

		<p class="auth-footer">
			Don't have an account? <a href="/register">Sign up</a>
		</p>
	</div>
</div>

<style>
	.auth-page {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 60vh;
	}

	.auth-card {
		width: 100%;
		max-width: 400px;
	}

	h1 {
		font-size: 1.75rem;
		margin-bottom: 0.5rem;
		text-align: center;
	}

	.subtitle {
		text-align: center;
		color: var(--color-text-secondary);
		margin-bottom: 1.5rem;
	}

	.btn-full {
		width: 100%;
		margin-top: 0.5rem;
	}

	.auth-footer {
		text-align: center;
		margin-top: 1.5rem;
		color: var(--color-text-secondary);
	}
</style>
