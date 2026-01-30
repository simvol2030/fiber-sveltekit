<script lang="ts">
	import { onMount } from 'svelte';
	import ConfirmDialog from '$lib/components/admin/ConfirmDialog.svelte';
	import { adminApi, type FileInfo } from '$lib/api/admin';
	import { api } from '$lib/api/client';
	import { toast } from '$lib/stores/admin.svelte';

	let files = $state<FileInfo[]>([]);
	let loading = $state(true);
	let currentDir = $state('');
	let totalSize = $state(0);

	// Delete confirmation
	let showDeleteConfirm = $state(false);
	let fileToDelete = $state<FileInfo | null>(null);

	// Upload state
	let showUploadPanel = $state(false);
	let selectedFiles = $state<File[]>([]);
	let uploading = $state(false);
	let uploadProgress = $state<Record<string, number>>({});
	let isDragging = $state(false);
	let fileInput: HTMLInputElement;

	// Derived values for delete confirmation
	const deleteTitle = $derived(
		`Delete ${fileToDelete?.isDir ? 'Folder' : 'File'}`
	);
	const deleteMessage = $derived(
		`Are you sure you want to delete '${fileToDelete?.name || ''}'? ${fileToDelete?.isDir ? 'All contents will be deleted.' : ''} This action cannot be undone.`
	);

	const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
	const maxFileSize = 10 * 1024 * 1024; // 10MB

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

	// Upload functions
	function openUploadPanel() {
		showUploadPanel = true;
		selectedFiles = [];
		uploadProgress = {};
	}

	function closeUploadPanel() {
		if (uploading) return;
		showUploadPanel = false;
		selectedFiles = [];
		uploadProgress = {};
	}

	function handleFileSelect(e: Event) {
		const input = e.target as HTMLInputElement;
		if (input.files) {
			addFiles(Array.from(input.files));
		}
		// Reset input so same file can be selected again
		input.value = '';
	}

	function addFiles(newFiles: File[]) {
		const validated: File[] = [];
		for (const file of newFiles) {
			if (!allowedTypes.includes(file.type)) {
				toast.error(`${file.name}: File type not allowed. Use JPG, PNG, GIF, WebP, or PDF.`);
				continue;
			}
			if (file.size > maxFileSize) {
				toast.error(`${file.name}: File too large. Maximum size is 10MB.`);
				continue;
			}
			// Prevent duplicates
			if (selectedFiles.some(f => f.name === file.name && f.size === file.size)) {
				continue;
			}
			validated.push(file);
		}
		if (validated.length + selectedFiles.length > 10) {
			toast.error('Maximum 10 files per upload.');
			return;
		}
		selectedFiles = [...selectedFiles, ...validated];
	}

	function removeFile(index: number) {
		selectedFiles = selectedFiles.filter((_, i) => i !== index);
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		isDragging = true;
	}

	function handleDragLeave(e: DragEvent) {
		e.preventDefault();
		isDragging = false;
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		isDragging = false;
		if (e.dataTransfer?.files) {
			addFiles(Array.from(e.dataTransfer.files));
		}
	}

	async function handleUpload() {
		if (selectedFiles.length === 0 || uploading) return;
		uploading = true;

		// Ensure we have a valid access token
		const token = api.getAccessToken();
		if (!token) {
			// Try to refresh
			const refreshed = await api.refreshToken();
			if (!refreshed) {
				toast.error('Authentication required. Please log in again.');
				uploading = false;
				return;
			}
		}

		const formData = new FormData();
		for (const file of selectedFiles) {
			formData.append('files', file);
		}

		try {
			const response = await fetch('/api/upload/multiple', {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${api.getAccessToken()}`
				},
				body: formData,
				credentials: 'include'
			});

			const data = await response.json();

			if (data.success) {
				const count = selectedFiles.length;
				toast.success(`${count} file${count > 1 ? 's' : ''} uploaded successfully`);
				closeUploadPanel();
				loadFiles(currentDir);
			} else {
				toast.error(data.error?.message || 'Upload failed');
			}
		} catch {
			toast.error('Upload failed. Please try again.');
		} finally {
			uploading = false;
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
		<div class="page-header-actions">
			<span class="total-size">Total: {formatSize(totalSize)}</span>
			<button class="btn-upload" onclick={openUploadPanel}>
				+ Upload Files
			</button>
		</div>
	</div>

	<!-- Upload Panel -->
	{#if showUploadPanel}
		<div class="upload-panel admin-card">
			<div class="upload-panel-header">
				<h3>Upload Files</h3>
				<button class="upload-close" onclick={closeUploadPanel} disabled={uploading}>
					&times;
				</button>
			</div>

			<!-- Drop Zone -->
			<div
				class="drop-zone"
				class:dragging={isDragging}
				role="button"
				tabindex="0"
				ondragover={handleDragOver}
				ondragleave={handleDragLeave}
				ondrop={handleDrop}
				onclick={() => fileInput.click()}
				onkeydown={(e) => { if (e.key === 'Enter') fileInput.click(); }}
			>
				<span class="drop-icon">📤</span>
				<p class="drop-text">Drop files here or click to browse</p>
				<p class="drop-hint">JPG, PNG, GIF, WebP, PDF — max 10MB each, up to 10 files</p>
			</div>

			<input
				type="file"
				bind:this={fileInput}
				onchange={handleFileSelect}
				multiple
				accept=".jpg,.jpeg,.png,.gif,.webp,.pdf"
				hidden
			/>

			<!-- Selected Files -->
			{#if selectedFiles.length > 0}
				<div class="selected-files">
					{#each selectedFiles as file, i}
						<div class="selected-file">
							<span class="selected-file-name">{file.name}</span>
							<span class="selected-file-size">{formatSize(file.size)}</span>
							{#if !uploading}
								<button class="selected-file-remove" onclick={() => removeFile(i)}>
									&times;
								</button>
							{/if}
						</div>
					{/each}
				</div>

				<div class="upload-actions">
					<button
						class="btn-upload-start"
						onclick={handleUpload}
						disabled={uploading}
					>
						{uploading ? 'Uploading...' : `Upload ${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''}`}
					</button>
				</div>
			{/if}
		</div>
	{/if}

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
		title={deleteTitle}
		message={deleteMessage}
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

	.page-header-actions {
		display: flex;
		align-items: center;
		gap: 0.75rem;
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

	.btn-upload {
		padding: 0.5rem 1.25rem;
		background: var(--color-primary);
		color: white;
		border: none;
		border-radius: 6px;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.2s;
	}

	.btn-upload:hover {
		background: var(--color-primary-hover);
	}

	/* Upload Panel */
	.upload-panel {
		background: var(--admin-card-bg);
		border: 1px solid var(--admin-card-border);
		border-radius: 8px;
		padding: 1.5rem;
	}

	.upload-panel-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1rem;
	}

	.upload-panel-header h3 {
		margin: 0;
		font-size: 1.125rem;
		font-weight: 600;
	}

	.upload-close {
		background: transparent;
		border: none;
		font-size: 1.5rem;
		color: var(--color-text-secondary);
		cursor: pointer;
		padding: 0.25rem 0.5rem;
		line-height: 1;
	}

	.upload-close:hover {
		color: var(--color-text);
	}

	.drop-zone {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 2.5rem 1.5rem;
		border: 2px dashed var(--color-border);
		border-radius: 8px;
		cursor: pointer;
		transition: border-color 0.2s, background 0.2s;
		text-align: center;
	}

	.drop-zone:hover,
	.drop-zone.dragging {
		border-color: var(--color-primary);
		background: rgba(59, 130, 246, 0.05);
	}

	.drop-icon {
		font-size: 2.5rem;
	}

	.drop-text {
		font-weight: 500;
		color: var(--color-text);
	}

	.drop-hint {
		font-size: 0.8125rem;
		color: var(--color-text-secondary);
	}

	.selected-files {
		margin-top: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.selected-file {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.5rem 0.75rem;
		background: var(--color-bg-secondary);
		border-radius: 6px;
	}

	.selected-file-name {
		flex: 1;
		font-size: 0.875rem;
		font-weight: 500;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.selected-file-size {
		font-size: 0.8125rem;
		color: var(--color-text-secondary);
		white-space: nowrap;
	}

	.selected-file-remove {
		background: transparent;
		border: none;
		color: var(--color-error);
		cursor: pointer;
		font-size: 1.25rem;
		padding: 0 0.25rem;
		line-height: 1;
	}

	.upload-actions {
		margin-top: 1rem;
		display: flex;
		justify-content: flex-end;
	}

	.btn-upload-start {
		padding: 0.625rem 1.5rem;
		background: var(--color-primary);
		color: white;
		border: none;
		border-radius: 6px;
		font-weight: 500;
		cursor: pointer;
	}

	.btn-upload-start:hover {
		background: var(--color-primary-hover);
	}

	.btn-upload-start:disabled {
		background: var(--color-secondary);
		cursor: not-allowed;
	}

	/* Breadcrumb */
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

		.page-header {
			flex-direction: column;
			align-items: flex-start;
		}

		.page-header-actions {
			width: 100%;
			justify-content: space-between;
		}
	}
</style>
