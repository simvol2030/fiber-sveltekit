<script lang="ts">
	interface Props {
		value: string;
		placeholder?: string;
		onSearch: (value: string) => void;
		debounceMs?: number;
	}

	let {
		value = '',
		placeholder = 'Search...',
		onSearch,
		debounceMs = 300
	}: Props = $props();

	let inputValue = $state(value);
	let debounceTimer: ReturnType<typeof setTimeout>;

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		inputValue = target.value;

		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			onSearch(inputValue);
		}, debounceMs);
	}

	function handleClear() {
		inputValue = '';
		onSearch('');
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			clearTimeout(debounceTimer);
			onSearch(inputValue);
		}
	}
</script>

<div class="search-input">
	<span class="search-icon">🔍</span>
	<input
		type="text"
		{placeholder}
		value={inputValue}
		oninput={handleInput}
		onkeydown={handleKeydown}
		aria-label="Search"
	/>
	{#if inputValue}
		<button class="clear-btn" onclick={handleClear} aria-label="Clear search">
			✕
		</button>
	{/if}
</div>

<style>
	.search-input {
		position: relative;
		display: flex;
		align-items: center;
	}

	.search-icon {
		position: absolute;
		left: 0.75rem;
		font-size: 1rem;
		pointer-events: none;
	}

	input {
		width: 100%;
		padding: 0.625rem 2.5rem 0.625rem 2.5rem;
		border: 1px solid var(--admin-card-border);
		border-radius: 8px;
		background: var(--admin-card-bg);
		color: var(--color-text);
		font-size: 0.875rem;
		transition: border-color 0.2s, box-shadow 0.2s;
	}

	input:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	input::placeholder {
		color: var(--color-text-secondary);
	}

	.clear-btn {
		position: absolute;
		right: 0.5rem;
		background: transparent;
		border: none;
		padding: 0.25rem 0.5rem;
		cursor: pointer;
		color: var(--color-text-secondary);
		font-size: 0.875rem;
		transition: color 0.2s;
	}

	.clear-btn:hover {
		color: var(--color-text);
	}
</style>
