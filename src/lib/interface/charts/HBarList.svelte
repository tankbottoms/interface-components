<script lang="ts">
	/**
	 * Ranked horizontal bar list — seaweed's "size by top-level folder". The bar
	 * sits behind the label rather than beside it so long paths stay readable at
	 * narrow widths.
	 */
	let {
		items = [],
		token = 'teal',
		format = (v: number) => v.toFixed(0),
		secondary
	}: {
		items?: { label: string; value: number; count?: number }[];
		token?: string;
		format?: (v: number) => string;
		secondary?: (item: { label: string; value: number; count?: number }) => string;
	} = $props();

	const max = $derived(Math.max(1, ...items.map((i) => i.value)));
</script>

<div class="hbl">
	{#each items as item}
		<div class="hbl-row" title={item.label}>
			<div
				class="hbl-fill"
				style="width:{(item.value / max) * 100}%;background:var(--pastel-{token});border-right:1px solid var(--stroke-{token})"
			></div>
			<span class="hbl-label">{item.label}</span>
			{#if secondary}
				<span class="hbl-sub">{secondary(item)}</span>
			{/if}
			<span class="hbl-value">{format(item.value)}</span>
		</div>
	{/each}
</div>

<style>
	.hbl {
		display: flex;
		flex-direction: column;
		gap: 3px;
	}
	.hbl-row {
		position: relative;
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		border: 1px solid var(--rule-hair);
		padding: 3px 8px;
		font-size: 0.7rem;
		overflow: hidden;
	}
	.hbl-row:hover {
		border-color: var(--rule);
	}
	.hbl-fill {
		position: absolute;
		inset: 0 auto 0 0;
		z-index: 0;
	}
	.hbl-label,
	.hbl-sub,
	.hbl-value {
		position: relative;
		z-index: 1;
	}
	.hbl-label {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.hbl-sub {
		color: var(--ink-note);
		font-size: 0.62rem;
		white-space: nowrap;
	}
	.hbl-value {
		margin-left: auto;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}
</style>
