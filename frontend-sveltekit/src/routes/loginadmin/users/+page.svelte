<script lang="ts">
	import { onMount } from 'svelte';
	import DataTable, { type Column, type Action } from '$lib/components/admin/DataTable.svelte';
	import ConfirmDialog from '$lib/components/admin/ConfirmDialog.svelte';
	import { adminApi, type AdminUser, type ListParams } from '$lib/api/admin';
	import { toast } from '$lib/stores/admin.svelte';
	import { goto } from '$app/navigation';

	let users = $state<AdminUser[]>([]);
	let loading = $state(true);
	let totalItems = $state(0);
	let totalPages = $state(1);
	let currentPage = $state(1);
	let pageSize = $state(10);
	let searchValue = $state('');
	let sortBy = $state('created_at');
	let sortDir = $state<'asc' | 'desc'>('desc');

	// Delete confirmation
	let showDeleteConfirm = $state(false);
	let userToDelete = $state<AdminUser | null>(null);

	const columns: Column[] = [
		{ key: 'email', label: 'Email', sortable: true },
		{ key: 'name', label: 'Name', sortable: true },
		{ key: 'role', label: 'Role', sortable: true, format: 'badge' },
		{ key: 'isActive', label: 'Status', format: 'boolean' },
		{ key: 'createdAt', label: 'Created', sortable: true, format: 'date' },
		{ key: 'lastLoginAt', label: 'Last Login', format: 'datetime' }
	];

	const actions: Action[] = [
		{
			label: 'Edit',
			icon: '✏️',
			variant: 'primary',
			onClick: (item) => goto(`/loginadmin/users/${item.id}`)
		},
		{
			label: 'Delete',
			icon: '🗑️',
			variant: 'danger',
			onClick: (item) => confirmDelete(item as unknown as AdminUser)
		}
	];

	async function loadUsers() {
		loading = true;

		const params: ListParams = {
			page: currentPage,
			pageSize,
			search: searchValue || undefined,
			sortBy,
			sortDir
		};

		try {
			const response = await adminApi.getUsers(params);
			if (response.success && response.data) {
				users = response.data.items;
				totalItems = response.data.total;
				totalPages = response.data.totalPages;
			} else {
				toast.error(response.error?.message || 'Failed to load users');
			}
		} catch (e) {
			toast.error('Failed to load users');
		} finally {
			loading = false;
		}
	}

	function handleSearch(value: string) {
		searchValue = value;
		currentPage = 1;
		loadUsers();
	}

	function handleSort(key: string, dir: 'asc' | 'desc') {
		sortBy = key;
		sortDir = dir;
		loadUsers();
	}

	function handlePageChange(page: number) {
		currentPage = page;
		loadUsers();
	}

	function confirmDelete(user: AdminUser) {
		userToDelete = user;
		showDeleteConfirm = true;
	}

	async function handleDelete() {
		if (!userToDelete) return;

		try {
			const response = await adminApi.deleteUser(userToDelete.id);
			if (response.success) {
				toast.success('User deleted successfully');
				showDeleteConfirm = false;
				userToDelete = null;
				loadUsers();
			} else {
				toast.error(response.error?.message || 'Failed to delete user');
			}
		} catch (e) {
			toast.error('Failed to delete user');
		}
	}

	function exportCSV() {
		// Generate CSV content
		const headers = ['Email', 'Name', 'Role', 'Status', 'Created', 'Last Login'];
		const rows = users.map((u) => [
			u.email,
			u.name || '',
			u.role,
			u.isActive ? 'Active' : 'Inactive',
			new Date(u.createdAt).toLocaleDateString(),
			u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : ''
		]);

		const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

		// Download
		const blob = new Blob([csv], { type: 'text/csv' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
		a.click();
		URL.revokeObjectURL(url);

		toast.success('CSV exported successfully');
	}

	onMount(() => {
		loadUsers();
	});
</script>

<div class="users-page">
	<div class="page-header">
		<h2 class="page-title">Users</h2>
		<a href="/loginadmin/users/new" class="btn-create">
			<span>➕</span> Add User
		</a>
	</div>

	<DataTable
		data={users}
		{columns}
		{actions}
		{loading}
		{totalItems}
		{currentPage}
		{totalPages}
		{pageSize}
		searchable
		sortable
		emptyMessage="No users found"
		onSearch={handleSearch}
		onSort={handleSort}
		onPageChange={handlePageChange}
		onExport={exportCSV}
	/>

	<ConfirmDialog
		open={showDeleteConfirm}
		title="Delete User"
		message="Are you sure you want to delete {userToDelete?.email}? This action cannot be undone."
		confirmLabel="Delete"
		variant="danger"
		onConfirm={handleDelete}
		onCancel={() => {
			showDeleteConfirm = false;
			userToDelete = null;
		}}
	/>
</div>

<style>
	.users-page {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.page-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.page-title {
		font-size: 1.5rem;
		font-weight: 600;
		color: var(--color-text);
		margin: 0;
	}

	.btn-create {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.25rem;
		background: var(--color-primary);
		color: white;
		border: none;
		border-radius: 8px;
		font-weight: 500;
		text-decoration: none;
		transition: background 0.2s;
	}

	.btn-create:hover {
		background: var(--color-primary-hover);
	}
</style>
