<script lang="ts">
	import { onMount } from 'svelte';
	import { adminApi, type AppSetting } from '$lib/api/admin';
	import { toast } from '$lib/stores/admin.svelte';

	let settings = $state<AppSetting[]>([]);
	let loading = $state(true);
	let saving = $state(false);

	// Group settings by their group property
	function getGroupedSettings(): Record<string, AppSetting[]> {
		const groups: Record<string, AppSetting[]> = {};
		settings.forEach((setting) => {
			const group = setting.group || 'other';
			if (!groups[group]) {
				groups[group] = [];
			}
			groups[group].push(setting);
		});
		return groups;
	}

	const groupedSettings = $derived(getGroupedSettings());

	// Track modified values
	let modifiedValues = $state<Record<string, string>>({});

	async function loadSettings() {
		loading = true;

		try {
			const response = await adminApi.getSettings();
			if (response.success && response.data) {
				settings = response.data;
				// Initialize modified values with current values
				modifiedValues = {};
				settings.forEach((s) => {
					modifiedValues[s.key] = s.value;
				});
			} else {
				toast.error(response.error?.message || 'Failed to load settings');
			}
		} catch (e) {
			toast.error('Failed to load settings');
		} finally {
			loading = false;
		}
	}

	function handleChange(key: string, value: string) {
		modifiedValues[key] = value;
	}

	function hasChanges(): boolean {
		return settings.some((s) => s.value !== modifiedValues[s.key]);
	}

	async function saveSettings() {
		saving = true;

		// Get only changed settings
		const changedSettings = settings
			.filter((s) => s.value !== modifiedValues[s.key])
			.map((s) => ({ key: s.key, value: modifiedValues[s.key] }));

		if (changedSettings.length === 0) {
			toast.info('No changes to save');
			saving = false;
			return;
		}

		try {
			const response = await adminApi.updateSettings(changedSettings);
			if (response.success) {
				toast.success('Settings saved successfully');
				// Reload to get updated values
				loadSettings();
			} else {
				toast.error(response.error?.message || 'Failed to save settings');
			}
		} catch (e) {
			toast.error('Failed to save settings');
		} finally {
			saving = false;
		}
	}

	function resetChanges() {
		modifiedValues = {};
		settings.forEach((s) => {
			modifiedValues[s.key] = s.value;
		});
	}

	function getGroupTitle(group: string): string {
		const titles: Record<string, string> = {
			general: 'General Settings',
			auth: 'Authentication',
			other: 'Other Settings'
		};
		return titles[group] || group.charAt(0).toUpperCase() + group.slice(1);
	}

	function getGroupIcon(group: string): string {
		const icons: Record<string, string> = {
			general: '⚙️',
			auth: '🔐',
			other: '📋'
		};
		return icons[group] || '📋';
	}

	onMount(() => {
		loadSettings();
	});
</script>

<div class="settings-page">
	<div class="page-header">
		<h2 class="page-title">Settings</h2>
		{#if hasChanges()}
			<div class="header-actions">
				<button class="btn-reset" onclick={resetChanges} disabled={saving}>
					Reset
				</button>
				<button class="btn-save" onclick={saveSettings} disabled={saving}>
					{#if saving}
						<span class="spinner"></span>
					{/if}
					Save Changes
				</button>
			</div>
		{/if}
	</div>

	{#if loading}
		<div class="loading-state">
			<div class="spinner large"></div>
			<span>Loading settings...</span>
		</div>
	{:else}
		{#each Object.entries(groupedSettings) as [group, groupSettings]}
			<div class="settings-group">
				<h3 class="group-title">
					<span class="group-icon">{getGroupIcon(group)}</span>
					{getGroupTitle(group)}
				</h3>

				<div class="admin-card">
					{#each groupSettings as setting}
						<div class="setting-item">
							<div class="setting-info">
								<label for={setting.key} class="setting-label">
									{setting.label || setting.key}
								</label>
								<span class="setting-key">{setting.key}</span>
							</div>

							<div class="setting-control">
								{#if setting.type === 'boolean'}
									<label class="toggle">
										<input
											type="checkbox"
											id={setting.key}
											checked={modifiedValues[setting.key] === 'true'}
											onchange={(e) =>
												handleChange(setting.key, e.currentTarget.checked ? 'true' : 'false')}
										/>
										<span class="toggle-slider"></span>
									</label>
								{:else if setting.type === 'number'}
									<input
										type="number"
										id={setting.key}
										value={modifiedValues[setting.key]}
										oninput={(e) => handleChange(setting.key, e.currentTarget.value)}
										class="setting-input"
									/>
								{:else}
									<input
										type="text"
										id={setting.key}
										value={modifiedValues[setting.key]}
										oninput={(e) => handleChange(setting.key, e.currentTarget.value)}
										class="setting-input"
									/>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/each}
	{/if}
</div>

<style>
	.settings-page {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		max-width: 800px;
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

	.header-actions {
		display: flex;
		gap: 0.75rem;
	}

	.btn-reset,
	.btn-save {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.625rem 1.25rem;
		border-radius: 8px;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.2s;
	}

	.btn-reset {
		background: var(--color-bg-secondary);
		border: 1px solid var(--admin-card-border);
		color: var(--color-text);
	}

	.btn-reset:hover:not(:disabled) {
		background: var(--admin-table-row-hover);
	}

	.btn-save {
		background: var(--color-primary);
		border: none;
		color: white;
	}

	.btn-save:hover:not(:disabled) {
		background: var(--color-primary-hover);
	}

	.btn-reset:disabled,
	.btn-save:disabled {
		opacity: 0.7;
		cursor: not-allowed;
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
		width: 20px;
		height: 20px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	.spinner.large {
		width: 40px;
		height: 40px;
		border-width: 3px;
		border-color: var(--color-border);
		border-top-color: var(--color-primary);
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.settings-group {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.group-title {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-text);
		margin: 0;
	}

	.group-icon {
		font-size: 1.25rem;
	}

	.setting-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 1rem 0;
		border-bottom: 1px solid var(--admin-card-border);
	}

	.setting-item:last-child {
		border-bottom: none;
	}

	.setting-info {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.setting-label {
		font-weight: 500;
		color: var(--color-text);
	}

	.setting-key {
		font-size: 0.75rem;
		color: var(--color-text-secondary);
		font-family: monospace;
	}

	.setting-control {
		flex-shrink: 0;
	}

	.setting-input {
		width: 200px;
		padding: 0.5rem 0.75rem;
		border: 1px solid var(--admin-card-border);
		border-radius: 6px;
		background: var(--admin-card-bg);
		color: var(--color-text);
		font-size: 0.875rem;
	}

	.setting-input:focus {
		outline: none;
		border-color: var(--color-primary);
	}

	/* Toggle switch */
	.toggle {
		position: relative;
		display: inline-block;
		width: 48px;
		height: 24px;
	}

	.toggle input {
		opacity: 0;
		width: 0;
		height: 0;
	}

	.toggle-slider {
		position: absolute;
		cursor: pointer;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: var(--color-border);
		border-radius: 24px;
		transition: background 0.3s;
	}

	.toggle-slider::before {
		position: absolute;
		content: '';
		height: 18px;
		width: 18px;
		left: 3px;
		bottom: 3px;
		background: white;
		border-radius: 50%;
		transition: transform 0.3s;
	}

	.toggle input:checked + .toggle-slider {
		background: var(--color-success);
	}

	.toggle input:checked + .toggle-slider::before {
		transform: translateX(24px);
	}

	@media (max-width: 640px) {
		.setting-item {
			flex-direction: column;
			align-items: flex-start;
		}

		.setting-input {
			width: 100%;
		}
	}
</style>
