<script lang="ts">
	import { page } from '$app/stores';
	import FormBuilder, { type FormField } from '$lib/components/admin/FormBuilder.svelte';
	import { api } from '$lib/api/client';
	import { toast } from '$lib/stores/admin.svelte';
	import { getAuthState } from '$lib/stores/auth.svelte';

	const auth = getAuthState();

	// Get user from server data
	const serverUser = $derived($page.data.user);
	const user = $derived(auth.user || serverUser);

	let saving = $state(false);
	let activeTab = $state<'profile' | 'password'>('profile');

	const profileSchema: FormField[] = [
		{
			name: 'email',
			label: 'Email',
			type: 'email',
			required: true,
			disabled: true,
			hint: 'Email cannot be changed'
		},
		{
			name: 'name',
			label: 'Name',
			type: 'text',
			placeholder: 'Your name'
		}
	];

	const passwordSchema: FormField[] = [
		{
			name: 'currentPassword',
			label: 'Current Password',
			type: 'password',
			required: true,
			placeholder: 'Enter current password'
		},
		{
			name: 'newPassword',
			label: 'New Password',
			type: 'password',
			required: true,
			placeholder: 'Enter new password',
			validation: {
				minLength: 8,
				message: 'Password must be at least 8 characters'
			}
		},
		{
			name: 'confirmPassword',
			label: 'Confirm New Password',
			type: 'password',
			required: true,
			placeholder: 'Confirm new password'
		}
	];

	const profileData = $derived(
		user
			? {
					email: user.email,
					name: user.name || ''
				}
			: {}
	);

	async function handleProfileSubmit(data: Record<string, unknown>) {
		saving = true;

		try {
			// Note: This endpoint would need to be implemented
			// For now, just show a message
			toast.info('Profile update coming soon');
		} catch (e) {
			toast.error('Failed to update profile');
		} finally {
			saving = false;
		}
	}

	async function handlePasswordSubmit(data: Record<string, unknown>) {
		if (data.newPassword !== data.confirmPassword) {
			toast.error('Passwords do not match');
			return;
		}

		saving = true;

		try {
			// Note: This endpoint would need to be implemented
			// For now, just show a message
			toast.info('Password change coming soon');
		} catch (e) {
			toast.error('Failed to change password');
		} finally {
			saving = false;
		}
	}
</script>

<div class="profile-page">
	<div class="page-header">
		<h2 class="page-title">Profile</h2>
	</div>

	<!-- User Info Card -->
	<div class="admin-card user-card">
		<div class="user-avatar">
			{user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'A'}
		</div>
		<div class="user-info">
			<h3 class="user-name">{user?.name || 'No name set'}</h3>
			<p class="user-email">{user?.email}</p>
			<span class="user-role badge-admin">Administrator</span>
		</div>
	</div>

	<!-- Tabs -->
	<div class="tabs">
		<button
			class="tab"
			class:active={activeTab === 'profile'}
			onclick={() => (activeTab = 'profile')}
		>
			Profile Information
		</button>
		<button
			class="tab"
			class:active={activeTab === 'password'}
			onclick={() => (activeTab = 'password')}
		>
			Change Password
		</button>
	</div>

	<!-- Tab Content -->
	<div class="admin-card">
		{#if activeTab === 'profile'}
			<FormBuilder
				schema={profileSchema}
				initialData={profileData}
				loading={saving}
				submitLabel="Update Profile"
				onSubmit={handleProfileSubmit}
			/>
		{:else}
			<FormBuilder
				schema={passwordSchema}
				loading={saving}
				submitLabel="Change Password"
				onSubmit={handlePasswordSubmit}
			/>
		{/if}
	</div>

	<!-- Additional Info -->
	<div class="admin-card info-card">
		<h4 class="info-title">Account Information</h4>
		<div class="info-grid">
			<div class="info-item">
				<span class="info-label">User ID</span>
				<code class="info-value">{user?.id || '-'}</code>
			</div>
			<div class="info-item">
				<span class="info-label">Role</span>
				<span class="info-value">Administrator</span>
			</div>
			<div class="info-item">
				<span class="info-label">Member Since</span>
				<span class="info-value">
					{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
				</span>
			</div>
		</div>
	</div>
</div>

<style>
	.profile-page {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		max-width: 600px;
	}

	.page-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.page-title {
		font-size: 1.5rem;
		font-weight: 600;
		color: var(--color-text);
		margin: 0;
	}

	.user-card {
		display: flex;
		align-items: center;
		gap: 1.5rem;
	}

	.user-avatar {
		width: 80px;
		height: 80px;
		border-radius: 50%;
		background: var(--color-primary);
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 700;
		font-size: 2rem;
	}

	.user-info {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.user-name {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--color-text);
		margin: 0;
	}

	.user-email {
		color: var(--color-text-secondary);
		margin: 0;
		font-size: 0.875rem;
	}

	.user-role {
		display: inline-flex;
		align-items: center;
		padding: 0.25rem 0.75rem;
		border-radius: 9999px;
		font-size: 0.75rem;
		font-weight: 500;
		margin-top: 0.5rem;
		width: fit-content;
	}

	.badge-admin {
		background: rgba(79, 70, 229, 0.1);
		color: var(--admin-badge-admin);
	}

	.tabs {
		display: flex;
		gap: 0.5rem;
		border-bottom: 1px solid var(--admin-card-border);
		padding-bottom: 0;
	}

	.tab {
		padding: 0.75rem 1.25rem;
		background: transparent;
		border: none;
		border-bottom: 2px solid transparent;
		color: var(--color-text-secondary);
		font-weight: 500;
		cursor: pointer;
		transition: color 0.2s, border-color 0.2s;
		margin-bottom: -1px;
	}

	.tab:hover {
		color: var(--color-text);
	}

	.tab.active {
		color: var(--color-primary);
		border-bottom-color: var(--color-primary);
	}

	.info-card {
		background: var(--color-bg-secondary);
	}

	.info-title {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text);
		margin: 0 0 1rem;
	}

	.info-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem;
	}

	.info-item {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.info-label {
		font-size: 0.75rem;
		color: var(--color-text-secondary);
	}

	.info-value {
		font-size: 0.875rem;
		color: var(--color-text);
	}

	code.info-value {
		font-family: monospace;
		font-size: 0.75rem;
		background: var(--admin-card-bg);
		padding: 0.125rem 0.375rem;
		border-radius: 4px;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	@media (max-width: 640px) {
		.user-card {
			flex-direction: column;
			text-align: center;
		}

		.user-info {
			align-items: center;
		}

		.tabs {
			overflow-x: auto;
		}

		.info-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
