<script lang="ts">
	import { api } from '$api/client';
	import { page } from '$app/stores';

	let newPassword = $state('');
	let confirmPassword = $state('');
	let error = $state('');
	let success = $state(false);
	let isSubmitting = $state(false);
	let tokenValid = $state<boolean | null>(null);
	let tokenEmail = $state('');

	const token = $derived($page.url.searchParams.get('token') || '');

	// Validate token on mount
	$effect(() => {
		if (token) {
			validateToken(token);
		} else {
			tokenValid = false;
		}
	});

	async function validateToken(t: string) {
		try {
			const response = await api.post<{ valid: boolean; email: string }>(
				'/auth/validate-reset-token',
				{ token: t }
			);
			if (response.success && response.data?.valid) {
				tokenValid = true;
				tokenEmail = response.data.email;
			} else {
				tokenValid = false;
				error = response.error?.message || 'Invalid or expired reset token';
			}
		} catch {
			tokenValid = false;
			error = 'Failed to validate token';
		}
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = '';

		if (newPassword.length < 8) {
			error = 'Password must be at least 8 characters';
			return;
		}

		if (newPassword !== confirmPassword) {
			error = 'Passwords do not match';
			return;
		}

		isSubmitting = true;

		try {
			const response = await api.post('/auth/reset-password', {
				token,
				newPassword
			});
			if (response.success) {
				success = true;
			} else {
				error = response.error?.message || 'Failed to reset password';
			}
		} catch {
			error = 'Network error. Please try again.';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<svelte:head>
	<title>Reset Password | App</title>
</svelte:head>

<div class="auth-page">
	<div class="auth-card card">
		{#if success}
			<div class="success-state">
				<h1>Password Reset</h1>
				<p class="success-message">
					Your password has been reset successfully. You can now sign in with your new password.
				</p>
				<a href="/login" class="btn-primary btn-full">Go to Login</a>
			</div>
		{:else if tokenValid === null}
			<div class="loading-state">
				<p>Validating reset token...</p>
			</div>
		{:else if tokenValid === false}
			<div class="error-state">
				<h1>Invalid Token</h1>
				<p class="error-description">
					{error || 'This password reset link is invalid or has expired.'}
				</p>
				<a href="/forgot-password" class="btn-primary btn-full">Request New Link</a>
				<p class="auth-footer">
					<a href="/login">Back to Login</a>
				</p>
			</div>
		{:else}
			<h1>Reset Password</h1>
			<p class="subtitle">Enter a new password for {tokenEmail}.</p>

			{#if error}
				<div class="alert alert-error">{error}</div>
			{/if}

			<form onsubmit={handleSubmit}>
				<div class="form-group">
					<label for="newPassword">New Password</label>
					<input
						type="password"
						id="newPassword"
						bind:value={newPassword}
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
						placeholder="Confirm new password"
						required
						disabled={isSubmitting}
					/>
				</div>

				<button type="submit" class="btn-primary btn-full" disabled={isSubmitting}>
					{isSubmitting ? 'Resetting...' : 'Reset Password'}
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

	.success-state,
	.error-state,
	.loading-state {
		text-align: center;
	}

	.success-message,
	.error-description {
		color: var(--color-text-secondary);
		margin: 1rem 0 1.5rem;
		line-height: 1.6;
	}

	.loading-state p {
		color: var(--color-text-secondary);
		padding: 2rem 0;
	}
</style>
