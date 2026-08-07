<script lang="ts">
	import type { Snippet } from 'svelte';
	import Tooltip from './charts/Tooltip.svelte';

	/**
	 * Wraps any block of markup so that hovering it opens the same white-plate
	 * popover the charts use, carrying detail that would otherwise need a click
	 * through to a detail page.
	 *
	 * The charts each own their tooltip because they need to know which mark is
	 * under the cursor; layout surfaces (KPI tiles, table rows, node cards) have
	 * one payload per element, so they get this instead of hand-rolling the
	 * mousemove plumbing per table.
	 */
	interface Row {
		k: string;
		v: string;
		token?: string;
	}

	interface Props {
		title?: string;
		rows?: Row[];
		note?: string;
		children?: Snippet;
	}

	let { title = '', rows = [], note = '', children }: Props = $props();

	let tip = $state({ x: 0, y: 0, show: false });

	function move(e: MouseEvent) {
		tip = { x: e.clientX, y: e.clientY, show: true };
	}
	function leave() {
		tip = { ...tip, show: false };
	}
</script>

<div
	class="ifc-hoverable"
	role="group"
	onmousemove={move}
	onmouseleave={leave}
	onfocusin={leave}
>
	{@render children?.()}
</div>

<Tooltip x={tip.x} y={tip.y} show={tip.show}>
	{#if title}<div class="ifc-tip-title">{title}</div>{/if}
	{#each rows as row (row.k)}
		<div class="ifc-tip-row">
			{#if row.token}
				<span class="ifc-tip-key" style="background:var(--pastel-{row.token})"></span>
			{/if}
			<span>{row.k}</span>
			<span class="ifc-tip-val">{row.v}</span>
		</div>
	{/each}
	{#if note}<div class="ifc-tip-note">{note}</div>{/if}
</Tooltip>

<style>
	.ifc-hoverable {
		min-width: 0;
	}
	/* The plate itself lives in interface.css; only the trailing note is local. */
	:global(.ifc-tip-note) {
		margin-top: 4px;
		padding-top: 4px;
		border-top: 1px solid var(--rule-hair);
		font-size: 0.6rem;
		color: var(--ink-soft);
		white-space: normal;
		max-width: 28ch;
	}
</style>
