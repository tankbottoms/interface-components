<script lang="ts">
	import type { Snippet } from 'svelte';

	/**
	 * Fixed-position tooltip shared by every chart in the Interface section.
	 * Charts pass viewport coordinates (clientX/clientY); this flips the box to
	 * the left of the cursor when it would otherwise run off the right edge.
	 */
	let {
		x = 0,
		y = 0,
		show = false,
		children
	}: { x?: number; y?: number; show?: boolean; children?: Snippet } = $props();

	let el = $state<HTMLDivElement | null>(null);
	let flip = $state(false);

	$effect(() => {
		if (!show || !el) return;
		flip = x + el.offsetWidth + 24 > window.innerWidth;
	});
</script>

{#if show}
	<div
		bind:this={el}
		class="ifc-tip"
		style="left:{flip ? x - 14 : x + 14}px; top:{y - 12}px; transform:{flip
			? 'translateX(-100%)'
			: 'none'}"
		role="tooltip"
	>
		{@render children?.()}
	</div>
{/if}
