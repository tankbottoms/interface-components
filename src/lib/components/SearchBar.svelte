<script lang="ts">
	interface Props {
		value: string;
		oninput: (value: string) => void;
	}

	let { value = '', oninput }: Props = $props();

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		oninput(target.value);
	}
</script>

<div class="search-bar">
	<i class="fas fa-search search-icon"></i>
	<input
		type="text"
		class="search-input"
		placeholder="Filter components..."
		{value}
		oninput={handleInput}
	/>
	{#if value}
		<button class="search-clear" onclick={() => oninput('')} aria-label="Clear search">
			<i class="fas fa-times"></i>
		</button>
	{/if}
</div>

<style>
	.search-bar {
		display: flex;
		align-items: center;
		border: 1px solid var(--color-border);
		background: var(--color-bg);
		box-shadow: 2px 2px 0 var(--color-shadow);
		padding: 0 var(--spacing-sm);
		gap: var(--spacing-sm);
	}
	.search-icon {
		color: var(--color-text-muted);
		font-size: 0.8rem;
	}
	.search-input {
		border: none;
		background: transparent;
		color: var(--color-text);
		font-family: var(--font-mono);
		font-size: 0.85rem;
		padding: 0.4rem 0;
		outline: none;
		width: 200px;
	}
	.search-input::placeholder {
		color: var(--color-text-muted);
	}
	.search-clear {
		background: none;
		border: none;
		color: var(--color-text-muted);
		cursor: pointer;
		font-size: 0.75rem;
		padding: 0.2rem;
	}
</style>
