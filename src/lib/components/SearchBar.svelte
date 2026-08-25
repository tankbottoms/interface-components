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
	<i class="fat fa-search search-icon"></i>
	<input
		type="text"
		class="search-input"
		placeholder="Filter components..."
		{value}
		oninput={handleInput}
	/>
	{#if value}
		<button class="search-clear" onclick={() => oninput('')} aria-label="Clear search">
			<i class="fat fa-times"></i>
		</button>
	{/if}
</div>

<style>
	/*
	 * A filter is not an object on the page — it is an edge you type against.
	 * The four-sided box plus offset shadow drew a container around a control
	 * that contains nothing, and at this size the border was most of what the
	 * eye saw. One hairline underneath does the whole job; focus moves that
	 * hairline to the accent, which is the only state worth a colour.
	 */
	.search-bar {
		display: flex;
		align-items: center;
		border: 0;
		border-bottom: 1px solid var(--color-border);
		background: transparent;
		padding: 0 2px;
		gap: var(--spacing-sm);
		transition: border-color 0.14s ease;
	}
	.search-bar:focus-within {
		border-bottom-color: var(--color-accent);
	}
	.search-bar:focus-within .search-icon {
		color: var(--color-accent);
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
