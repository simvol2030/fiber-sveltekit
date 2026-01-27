<script lang="ts">
	import FormBuilder, { type FormField } from '$lib/components/admin/FormBuilder.svelte';
	import { adminApi } from '$lib/api/admin';
	import { toast } from '$lib/stores/admin.svelte';
	import { goto } from '$app/navigation';

	let loading = $state(false);

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
			label: 'Password',
			type: 'password',
			required: true,
			placeholder: 'Enter password',
			validation: {
				minLength: 8,
				message: 'Password must be at least 8 characters'
			}
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

	const initialData = {
		role: 'user',
		isActive: true
	};

	async function handleSubmit(data: Record<string, unknown>) {
		loading = true;

		try {
			const response = await adminApi.createUser({
				email: data.email as string,
				password: data.password as string,
				name: (data.name as string) || undefined,
				role: data.role as 'user' | 'admin',
				isActive: data.isActive as boolean
			});

			if (response.success) {
				toast.success('User created successfully');
				goto('/loginadmin/users');
			} else {
				toast.error(response.error?.message || 'Failed to create user');
			}
		} catch (e) {
			toast.error('Failed to create user');
		} finally {
			loading = false;
		}
	}

	function handleCancel() {
		goto('/loginadmin/users');
	}
</script>

<div class="create-user-page">
	<div class="page-header">
		<a href="/loginadmin/users" class="back-link">← Back to Users</a>
		<h2 class="page-title">Create User</h2>
	</div>

	<div class="admin-card">
		<FormBuilder
			{schema}
			{initialData}
			{loading}
			submitLabel="Create User"
			onSubmit={handleSubmit}
			onCancel={handleCancel}
		/>
	</div>
</div>

<style>
	.create-user-page {
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
</style>
