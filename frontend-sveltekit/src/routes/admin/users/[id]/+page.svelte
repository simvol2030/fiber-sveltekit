<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import FormBuilder, { type FormField } from '$lib/components/admin/FormBuilder.svelte';
	import { adminApi, type AdminUser } from '$lib/api/admin';
	import { toast } from '$lib/stores/admin.svelte';
	import { goto } from '$app/navigation';

	let user = $state<AdminUser | null>(null);
	let loading = $state(true);
	let saving = $state(false);

	const userId = $derived($page.params.id);

	const schema: FormField[] = [
		{
			name: 'email',
			label: 'Email',
			type: 'email',
			required: true,
			placeholder: 'user@example.com'
		},
		{
			name: 'password',
			label: 'New Password',
			type: 'password',
			placeholder: 'Leave empty to keep current password',
			validation: {
				minLength: 8,
				message: 'Password must be at least 8 characters'
			},
			hint: 'Only fill if you want to change the password'
		},
		{
			name: 'name',
			label: 'Name',
			type: 'text',
			placeholder: 'Full name (optional)'
		},
		{
			name: 'role',
			label: 'Role',
			type: 'select',
			required: true,
			options: [
				{ value: 'user', label: 'User' },
				{ value: 'admin', label: 'Admin' }
			]
		},
		{
			name: 'isActive',
			label: 'Active',
			type: 'checkbox',
			hint: 'Allow user to log in'
		}
	];

	async function loadUser() {
		loading = true;

		try {
			const response = await adminApi.getUser(userId);
			if (response.success && response.data) {
				user = response.data;
			} else {
				toast.error(response.error?.message || 'Failed to load user');
				goto('/admin/users');
			}
		} catch (e) {
			toast.error('Failed to load user');
			goto('/admin/users');
		} finally {
			loading = false;
		}
	}

	async function handleSubmit(data: Record<string, unknown>) {
		saving = true;

		try {
			const updateData: Record<string, unknown> = {
				email: data.email,
				name: data.name || null,
				role: data.role,
				isActive: data.isActive
			};

			// Only include password if it was changed
			if (data.password) {
				updateData.password = data.password;
			}

			const response = await adminApi.updateUser(userId, updateData);

			if (response.success) {
				toast.success('User updated successfully');
				goto('/admin/users');
			} else {
				toast.error(response.error?.message || 'Failed to update user');
			}
		} catch (e) {
			toast.error('Failed to update user');
		} finally {
			saving = false;
		}
	}

	function handleCancel() {
		goto('/admin/users');
	}

	onMount(() => {
		loadUser();
	});

	const initialData = $derived(
		user
			? {
					email: user.email,
					name: user.name || '',
					role: user.role,
					isActive: user.isActive,
					password: ''
				}
			: {}
	);
</script>

<div class="edit-user-page">
	<div class="page-header">
		<a href="/admin/users" class="back-link">← Back to Users</a>
		<h2 class="page-title">Edit User</h2>
	</div>

	{#if loading}
		<div class="loading-state">
			<div class="spinner"></div>
			<span>Loading user...</span>
		</div>
	{:else if user}
		<div class="admin-card">
			<div class="user-meta">
				<div class="meta-item">
					<span class="meta-label">ID:</span>
					<code class="meta-value">{user.id}</code>
				</div>
				<div class="meta-item">
					<span class="meta-label">Created:</span>
					<span class="meta-value">{new Date(user.createdAt).toLocaleString()}</span>
				</div>
				{#if user.lastLoginAt}
					<div class="meta-item">
						<span class="meta-label">Last Login:</span>
						<span class="meta-value">{new Date(user.lastLoginAt).toLocaleString()}</span>
					</div>
				{/if}
			</div>

			<hr class="divider" />

			<FormBuilder
				{schema}
				{initialData}
				loading={saving}
				submitLabel="Save Changes"
				onSubmit={handleSubmit}
				onCancel={handleCancel}
			/>
		</div>
	{/if}
</div>

<style>
	.edit-user-page {
		max-width: 600px;
	}

	.page-header {
		margin-bottom: 1.5rem;
	}

	.back-link {
		display: inline-block;
		margin-bottom: 0.5rem;
		color: var(--color-text-secondary);
		text-decoration: none;
		font-size: 0.875rem;
	}

	.back-link:hover {
		color: var(--color-primary);
	}

	.page-title {
		font-size: 1.5rem;
		font-weight: 600;
		color: var(--color-text);
		margin: 0;
	}

	.loading-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		padding: 4rem 2rem;
		text-align: center;
		color: var(--color-text-secondary);
	}

	.spinner {
		width: 40px;
		height: 40px;
		border: 3px solid var(--color-border);
		border-top-color: var(--color-primary);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.user-meta {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.meta-item {
		display: flex;
		gap: 0.5rem;
		font-size: 0.875rem;
	}

	.meta-label {
		color: var(--color-text-secondary);
	}

	.meta-value {
		color: var(--color-text);
	}

	code.meta-value {
		font-family: monospace;
		font-size: 0.8rem;
		background: var(--color-bg-secondary);
		padding: 0.125rem 0.375rem;
		border-radius: 4px;
	}

	.divider {
		border: none;
		border-top: 1px solid var(--admin-card-border);
		margin: 1.5rem 0;
	}
</style>
