<script lang="ts">
	import { api } from '$api/client';

	let email = $state('');
	let error = $state('');
	let success = $state(false);
	let isSubmitting = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = '';
		isSubmitting = true;

		try {
			const response = await api.post('/auth/forgot-password', { email });
			if (response.success) {
				success = true;
			} else {
				error = response.error?.message || 'Failed to send reset link';
			}
		} catch {
			error = 'Network error. Please try again.';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<svelte:head>
	<title>Forgot Password | App</title>
</svelte:head>

<div class="auth-page">
	<div class="auth-card card">
		{#if success}
			<div class="success-state">
				<h1>Check Your Email</h1>
				<p class="success-message">
					If an account with that email exists, a password reset link has been sent.
					Please check your inbox and follow the instructions.
				</p>
				<a href="/login" class="btn-primary btn-full">Back to Login</a>
			</div>
		{:else}
			<h1>Forgot Password</h1>
			<p class="subtitle">Enter your email address and we'll send you a reset link.</p>

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

				<button type="submit" class="btn-primary btn-full" disabled={isSubmitting}>
					{isSubmitting ? 'Sending...' : 'Send Reset Link'}
				</button>
			</form>

			<p class="auth-footer">
				<a href="/login">Back to Login</a>
			</p>
		{/if}
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
		display: inline-block;
		text-align: center;
		text-decoration: none;
	}

	.auth-footer {
		text-align: center;
		margin-top: 1.5rem;
		color: var(--color-text-secondary);
	}

	.success-state {
		text-align: center;
	}

	.success-message {
		color: var(--color-text-secondary);
		margin: 1rem 0 1.5rem;
		line-height: 1.6;
	}
</style>
