<script lang="ts">
	import { onMount } from 'svelte';
	import ConfirmDialog from '$lib/components/admin/ConfirmDialog.svelte';
	import { adminApi, type FileInfo } from '$lib/api/admin';
	import { toast } from '$lib/stores/admin.svelte';

	let files = $state<FileInfo[]>([]);
	let loading = $state(true);
	let currentDir = $state('');
	let totalSize = $state(0);

	// Delete confirmation
	let showDeleteConfirm = $state(false);
	let fileToDelete = $state<FileInfo | null>(null);

	async function loadFiles(dir: string = '') {
		loading = true;

		try {
			const response = await adminApi.getFiles(dir);
			if (response.success && response.data) {
				files = response.data.files;
				currentDir = response.data.currentDir;
				totalSize = response.data.totalSize;
			} else {
				toast.error(response.error?.message || 'Failed to load files');
			}
		} catch (e) {
			toast.error('Failed to load files');
		} finally {
			loading = false;
		}
	}

	function navigateToDir(path: string) {
		loadFiles(path);
	}

	function navigateUp() {
		if (!currentDir) return;
		const parts = currentDir.split('/');
		parts.pop();
		loadFiles(parts.join('/'));
	}

	function confirmDelete(file: FileInfo) {
		fileToDelete = file;
		showDeleteConfirm = true;
	}

	async function handleDelete() {
		if (!fileToDelete) return;

		try {
			const response = await adminApi.deleteFile(fileToDelete.path);
			if (response.success) {
				toast.success(`${fileToDelete.isDir ? 'Folder' : 'File'} deleted successfully`);
				showDeleteConfirm = false;
				fileToDelete = null;
				loadFiles(currentDir);
			} else {
				toast.error(response.error?.message || 'Failed to delete');
			}
		} catch (e) {
			toast.error('Failed to delete');
		}
	}

	function formatSize(bytes: number): string {
		if (bytes === 0) return '0 B';
		const k = 1024;
		const sizes = ['B', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	}

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleString();
	}

	function getFileIcon(file: FileInfo): string {
		if (file.isDir) return '📁';

		const icons: Record<string, string> = {
			jpg: '🖼️',
			jpeg: '🖼️',
			png: '🖼️',
			gif: '🖼️',
			webp: '🖼️',
			svg: '🖼️',
			pdf: '📄',
			doc: '📝',
			docx: '📝',
			xls: '📊',
			xlsx: '📊',
			zip: '📦',
			mp4: '🎬',
			webm: '🎬',
			mp3: '🎵',
			txt: '📃',
			json: '📋'
		};

		return icons[file.extension.toLowerCase()] || '📄';
	}

	onMount(() => {
		loadFiles();
	});
</script>

<div class="files-page">
	<div class="page-header">
		<h2 class="page-title">Files</h2>
		<span class="total-size">Total: {formatSize(totalSize)}</span>
	</div>

	<!-- Breadcrumb -->
	<div class="breadcrumb">
		<button
			class="breadcrumb-item"
			class:active={!currentDir}
			onclick={() => loadFiles('')}
		>
			🏠 Root
		</button>
		{#if currentDir}
			{#each currentDir.split('/') as part, i}
				<span class="breadcrumb-separator">/</span>
				<button
					class="breadcrumb-item"
					class:active={i === currentDir.split('/').length - 1}
					onclick={() => navigateToDir(currentDir.split('/').slice(0, i + 1).join('/'))}
				>
					{part}
				</button>
			{/each}
		{/if}
	</div>

	<div class="admin-card">
		{#if loading}
			<div class="loading-state">
				<div class="spinner"></div>
				<span>Loading files...</span>
			</div>
		{:else if files.length === 0}
			<div class="empty-state">
				<span class="empty-icon">📂</span>
				<p>No files found</p>
				{#if currentDir}
					<button class="btn-back" onclick={navigateUp}>← Go Back</button>
				{/if}
			</div>
		{:else}
			<div class="files-grid">
				{#if currentDir}
					<button class="file-item file-back" onclick={navigateUp}>
						<span class="file-icon">⬆️</span>
						<span class="file-name">..</span>
						<span class="file-meta">Parent Directory</span>
					</button>
				{/if}

				{#each files as file}
					<div class="file-item" class:is-dir={file.isDir}>
						{#if file.isDir}
							<button class="file-content" onclick={() => navigateToDir(file.path)}>
								<span class="file-icon">{getFileIcon(file)}</span>
								<span class="file-name">{file.name}</span>
								<span class="file-meta">Folder</span>
							</button>
						{:else}
							<a
								href="/uploads/{file.path}"
								target="_blank"
								class="file-content"
								rel="noopener noreferrer"
							>
								<span class="file-icon">{getFileIcon(file)}</span>
								<span class="file-name">{file.name}</span>
								<span class="file-meta">
									{formatSize(file.size)} • {formatDate(file.modTime)}
								</span>
							</a>
						{/if}
						<button
							class="file-delete"
							onclick={() => confirmDelete(file)}
							title="Delete"
						>
							🗑️
						</button>
					</div>
				{/each}
			</div>
		{/if}
	</div>

	<ConfirmDialog
		open={showDeleteConfirm}
		title="Delete {fileToDelete?.isDir ? 'Folder' : 'File'}"
		message="Are you sure you want to delete '{fileToDelete?.name}'? {fileToDelete?.isDir ? 'All contents will be deleted.' : ''} This action cannot be undone."
		confirmLabel="Delete"
		variant="danger"
		onConfirm={handleDelete}
		onCancel={() => {
			showDeleteConfirm = false;
			fileToDelete = null;
		}}
	/>
</div>

<style>
	.files-page {
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

	.total-size {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		background: var(--color-bg-secondary);
		padding: 0.5rem 1rem;
		border-radius: 6px;
	}

	.breadcrumb {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.25rem;
		font-size: 0.875rem;
	}

	.breadcrumb-item {
		background: transparent;
		border: none;
		color: var(--color-text-secondary);
		cursor: pointer;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		transition: background 0.2s, color 0.2s;
	}

	.breadcrumb-item:hover {
		background: var(--color-bg-secondary);
		color: var(--color-text);
	}

	.breadcrumb-item.active {
		color: var(--color-text);
		font-weight: 500;
	}

	.breadcrumb-separator {
		color: var(--color-text-secondary);
	}

	.loading-state,
	.empty-state {
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

	.empty-icon {
		font-size: 3rem;
	}

	.btn-back {
		padding: 0.5rem 1rem;
		background: var(--color-primary);
		color: white;
		border: none;
		border-radius: 6px;
		cursor: pointer;
	}

	.files-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 1rem;
	}

	.file-item {
		display: flex;
		flex-direction: column;
		position: relative;
		background: var(--color-bg-secondary);
		border-radius: 8px;
		overflow: hidden;
		transition: transform 0.2s, box-shadow 0.2s;
	}

	.file-item:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-md);
	}

	.file-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		padding: 1.5rem 1rem;
		text-decoration: none;
		color: inherit;
		background: transparent;
		border: none;
		cursor: pointer;
		text-align: center;
		width: 100%;
	}

	.file-back {
		background: transparent;
		border: 1px dashed var(--color-border);
	}

	.file-icon {
		font-size: 2.5rem;
	}

	.file-name {
		font-weight: 500;
		color: var(--color-text);
		font-size: 0.875rem;
		word-break: break-all;
		max-width: 100%;
	}

	.file-meta {
		font-size: 0.75rem;
		color: var(--color-text-secondary);
	}

	.file-delete {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		background: rgba(239, 68, 68, 0.9);
		border: none;
		border-radius: 4px;
		padding: 0.25rem 0.5rem;
		cursor: pointer;
		opacity: 0;
		transition: opacity 0.2s;
	}

	.file-item:hover .file-delete {
		opacity: 1;
	}

	@media (max-width: 640px) {
		.files-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}
</style>
