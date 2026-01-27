<script lang="ts">
	interface Props {
		title: string;
		value: string | number;
		icon?: string;
		change?: number;
		changeLabel?: string;
		variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
	}

	let {
		title,
		value,
		icon,
		change,
		changeLabel,
		variant = 'default'
	}: Props = $props();

	const isPositiveChange = change !== undefined && change >= 0;
</script>

<div class="stat-card stat-card-{variant}">
	{#if icon}
		<div class="stat-icon">{icon}</div>
	{/if}
	<div class="stat-content">
		<span class="stat-title">{title}</span>
		<span class="stat-value">{value}</span>
		{#if change !== undefined}
			<span class="stat-change" class:positive={isPositiveChange} class:negative={!isPositiveChange}>
				{isPositiveChange ? '↑' : '↓'} {Math.abs(change)}%
				{#if changeLabel}
					<span class="change-label">{changeLabel}</span>
				{/if}
			</span>
		{/if}
	</div>
</div>

<style>
	.stat-card {
		background: var(--admin-card-bg);
		border: 1px solid var(--admin-card-border);
		border-radius: 12px;
		padding: 1.5rem;
		display: flex;
		align-items: flex-start;
		gap: 1rem;
		box-shadow: var(--admin-card-shadow);
		transition: transform 0.2s, box-shadow 0.2s;
	}

	.stat-card:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-md);
	}

	.stat-icon {
		font-size: 2rem;
		line-height: 1;
	}

	.stat-content {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.stat-title {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		font-weight: 500;
	}

	.stat-value {
		font-size: 1.75rem;
		font-weight: 700;
		color: var(--color-text);
	}

	.stat-change {
		font-size: 0.75rem;
		font-weight: 500;
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.stat-change.positive {
		color: var(--color-success);
	}

	.stat-change.negative {
		color: var(--color-error);
	}

	.change-label {
		color: var(--color-text-secondary);
		font-weight: 400;
	}

	/* Variants */
	.stat-card-primary {
		border-left: 4px solid var(--color-primary);
	}

	.stat-card-success {
		border-left: 4px solid var(--color-success);
	}

	.stat-card-warning {
		border-left: 4px solid var(--color-warning);
	}

	.stat-card-error {
		border-left: 4px solid var(--color-error);
	}
</style>
