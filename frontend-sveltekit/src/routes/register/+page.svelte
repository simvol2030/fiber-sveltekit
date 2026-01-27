<script lang="ts">
	import { register, getAuthState } from '$stores/auth.svelte';
	import { goto } from '$app/navigation';

	const auth = getAuthState();

	let name = $state('');
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
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

		// Validate passwords match
		if (password !== confirmPassword) {
			error = 'Passwords do not match';
			return;
		}

		// Validate password strength
		if (password.length < 8) {
			error = 'Password must be at least 8 characters';
			return;
		}

		isSubmitting = true;

		const result = await register(email, password, name || undefined);

		if (result.success) {
			goto('/dashboard');
		} else {
			error = result.error || 'Registration failed';
		}

		isSubmitting = false;
	}
</script>

<svelte:head>
	<title>Register | App</title>
</svelte:head>

<div class="auth-page">
	<div class="auth-card card">
		<h1>Create Account</h1>
		<p class="subtitle">Sign up to get started with App.</p>

		{#if error}
			<div class="alert alert-error">{error}</div>
		{/if}

		<form onsubmit={handleSubmit}>
			<div class="form-group">
				<label for="name">Name (optional)</label>
				<input
					type="text"
					id="name"
					bind:value={name}
					placeholder="Your name"
					disabled={isSubmitting}
				/>
			</div>

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
					placeholder="At least 8 characters"
					required
					minlength="8"
					disabled={isSubmitting}
				/>
			</div>

			<div class="form-group">
				<label for="confirmPassword">Confirm Password</label>
				<input
					type="password"
					id="confirmPassword"
					bind:value={confirmPassword}
					placeholder="Confirm your password"
					required
					disabled={isSubmitting}
				/>
			</div>

			<button type="submit" class="btn-primary btn-full" disabled={isSubmitting}>
				{isSubmitting ? 'Creating account...' : 'Create Account'}
			</button>
		</form>

		<p class="auth-footer">
			Already have an account? <a href="/login">Sign in</a>
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
