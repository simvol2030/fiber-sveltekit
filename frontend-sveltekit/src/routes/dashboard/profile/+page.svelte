<script lang="ts">
	import { api, type User } from '$api/client';
	import { getAuthState } from '$stores/auth.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const auth = getAuthState();
	let user = $derived((data?.user || auth.user) as User | null);

	// Edit Name form
	let editName = $state(data?.user?.name || '');
	let nameError = $state('');
	let nameSuccess = $state('');
	let nameSaving = $state(false);

	// Change Password form
	let currentPassword = $state('');
	let newPassword = $state('');
	let confirmPassword = $state('');
	let passwordError = $state('');
	let passwordSuccess = $state('');
	let passwordSaving = $state(false);

	// Sync editName when data changes
	$effect(() => {
		if (data?.user?.name !== undefined) {
			editName = data.user.name || '';
		}
	});

	async function handleUpdateName(e: Event) {
		e.preventDefault();
		nameError = '';
		nameSuccess = '';
		nameSaving = true;

		try {
			const response = await api.put<User>('/auth/profile', {
				name: editName || null
			});

			if (response.success && response.data) {
				nameSuccess = 'Name updated successfully';
				// Update local data
				if (data) {
					data.user = response.data;
				}
			} else {
				nameError = response.error?.message || 'Failed to update name';
			}
		} catch {
			nameError = 'Network error. Please try again.';
		} finally {
			nameSaving = false;
		}
	}

	async function handleChangePassword(e: Event) {
		e.preventDefault();
		passwordError = '';
		passwordSuccess = '';

		if (newPassword.length < 8) {
			passwordError = 'New password must be at least 8 characters';
			return;
		}

		if (newPassword !== confirmPassword) {
			passwordError = 'Passwords do not match';
			return;
		}

		passwordSaving = true;

		try {
			const response = await api.put('/auth/change-password', {
				currentPassword,
				newPassword
			});

			if (response.success) {
				passwordSuccess = 'Password changed successfully';
				currentPassword = '';
				newPassword = '';
				confirmPassword = '';
			} else {
				passwordError = response.error?.message || 'Failed to change password';
			}
		} catch {
			passwordError = 'Network error. Please try again.';
		} finally {
			passwordSaving = false;
		}
	}
</script>

<svelte:head>
	<title>Profile | App</title>
</svelte:head>

<div class="profile-page">
	<header class="profile-header">
		<h1>Profile</h1>
		<p class="profile-subtitle">Manage your account settings</p>
	</header>

	<!-- Account Info -->
	<section class="profile-card card">
		<h2>Account Information</h2>
		<div class="info-grid">
			<div class="info-item">
				<span class="info-label">Email</span>
				<span class="info-value">{user?.email}</span>
			</div>
			<div class="info-item">
				<span class="info-label">Role</span>
				<span class="info-value">{user?.role === 'admin' ? 'Administrator' : 'User'}</span>
			</div>
			<div class="info-item">
				<span class="info-label">Member Since</span>
				<span class="info-value">
					{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
				</span>
			</div>
			<div class="info-item">
				<span class="info-label">Last Login</span>
				<span class="info-value">
					{user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'N/A'}
				</span>
			</div>
		</div>
	</section>

	<!-- Edit Name -->
	<section class="profile-card card">
		<h2>Edit Name</h2>

		{#if nameError}
			<div class="alert alert-error">{nameError}</div>
		{/if}
		{#if nameSuccess}
			<div class="alert alert-success">{nameSuccess}</div>
		{/if}

		<form onsubmit={handleUpdateName}>
			<div class="form-group">
				<label for="name">Display Name</label>
				<input
					type="text"
					id="name"
					bind:value={editName}
					placeholder="Your name"
					maxlength="100"
					disabled={nameSaving}
				/>
			</div>
			<button type="submit" class="btn-primary" disabled={nameSaving}>
				{nameSaving ? 'Saving...' : 'Save Name'}
			</button>
		</form>
	</section>

	<!-- Change Password -->
	<section class="profile-card card">
		<h2>Change Password</h2>

		{#if passwordError}
			<div class="alert alert-error">{passwordError}</div>
		{/if}
		{#if passwordSuccess}
			<div class="alert alert-success">{passwordSuccess}</div>
		{/if}

		<form onsubmit={handleChangePassword}>
			<div class="form-group">
				<label for="currentPassword">Current Password</label>
				<input
					type="password"
					id="currentPassword"
					bind:value={currentPassword}
					placeholder="Enter current password"
					required
					disabled={passwordSaving}
				/>
			</div>

			<div class="form-group">
				<label for="newPassword">New Password</label>
				<input
					type="password"
					id="newPassword"
					bind:value={newPassword}
					placeholder="At least 8 characters"
					required
					minlength="8"
					disabled={passwordSaving}
				/>
			</div>

			<div class="form-group">
				<label for="confirmPassword">Confirm New Password</label>
				<input
					type="password"
					id="confirmPassword"
					bind:value={confirmPassword}
					placeholder="Confirm new password"
					required
					disabled={passwordSaving}
				/>
			</div>

			<button type="submit" class="btn-primary" disabled={passwordSaving}>
				{passwordSaving ? 'Changing...' : 'Change Password'}
			</button>
		</form>
	</section>

	<div class="profile-back">
		<a href="/dashboard">&larr; Back to Dashboard</a>
	</div>
</div>

<style>
	.profile-page {
		max-width: 640px;
		margin: 0 auto;
	}

	.profile-header {
		margin-bottom: 2rem;
	}

	.profile-header h1 {
		font-size: 2rem;
		margin-bottom: 0.5rem;
	}

	.profile-subtitle {
		color: var(--color-text-secondary);
	}

	.profile-card {
		margin-bottom: 1.5rem;
	}

	.profile-card h2 {
		font-size: 1.25rem;
		margin-bottom: 1rem;
		padding-bottom: 0.75rem;
		border-bottom: 1px solid var(--color-border);
	}

	.info-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.info-item {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.info-label {
		font-size: 0.8125rem;
		color: var(--color-text-secondary);
		font-weight: 500;
	}

	.info-value {
		font-size: 0.9375rem;
		font-weight: 500;
	}

	.profile-back {
		margin-top: 1rem;
		margin-bottom: 2rem;
	}

	@media (max-width: 480px) {
		.info-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
