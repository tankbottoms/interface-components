<script lang="ts">
	import Tooltip from './Tooltip.svelte';
	import type { TreeNode } from '$lib/interface/generate';

	/**
	 * Simplified squarified treemap. seaweed's namespace map is deeply nested;
	 * this flattens to a single level, which is what the layout actually needs
	 * to communicate — relative share, not hierarchy.
	 */
	let {
		nodes = [],
		tokens = [],
		height = 260,
		unit = ' GB',
		format = (v: number) => v.toFixed(1)
	}: {
		nodes?: TreeNode[];
		tokens?: string[];
		height?: number;
		unit?: string;
		format?: (v: number) => string;
	} = $props();

	const W = 720;

	interface Rect {
		node: TreeNode;
		x: number;
		y: number;
		w: number;
		h: number;
		i: number;
	}

	/** Slice-and-dice with alternating orientation: cheap, stable, good enough. */
	const rects = $derived.by((): Rect[] => {
		const total = nodes.reduce((a, n) => a + n.value, 0) || 1;
		const out: Rect[] = [];
		let x = 0;
		let y = 0;
		let w = W;
		let h = height;
		let remaining = total;
		nodes.forEach((node, i) => {
			const frac = node.value / remaining;
			const last = i === nodes.length - 1;
			if (w >= h) {
				const cw = last ? w : w * frac;
				out.push({ node, x, y, w: cw, h, i });
				x += cw;
				w -= cw;
			} else {
				const ch = last ? h : h * frac;
				out.push({ node, x, y, w, h: ch, i });
				y += ch;
				h -= ch;
			}
			remaining -= node.value;
		});
		return out;
	});

	const total = $derived(nodes.reduce((a, n) => a + n.value, 0) || 1);

	let hover = $state(-1);
	let tip = $state({ x: 0, y: 0, show: false });

	function enter(e: MouseEvent, i: number) {
		hover = i;
		tip = { x: e.clientX, y: e.clientY, show: true };
	}
	function leave() {
		hover = -1;
		tip = { ...tip, show: false };
	}
	const tok = (i: number) => tokens[i % (tokens.length || 1)] ?? 'cyan';
</script>

<div class="ifc-chart">
	<svg viewBox="0 0 {W} {height}" role="img" aria-label="Treemap" onmouseleave={leave}>
		{#each rects as r}
			<g role="presentation" onmousemove={(e) => enter(e, r.i)}>
				<rect
					x={r.x}
					y={r.y}
					width={Math.max(0, r.w - 1)}
					height={Math.max(0, r.h - 1)}
					fill="var(--pastel-{tok(r.i)})"
					stroke="var(--stroke-{tok(r.i)})"
					stroke-width={hover === r.i ? 1.8 : 0.6}
					opacity={hover === -1 || hover === r.i ? 1 : 0.55}
				/>
				{#if r.w > 62 && r.h > 26}
					<text x={r.x + 7} y={r.y + 16} font-size="10" font-weight="700" fill="var(--ink)"
						>{r.node.name}</text
					>
					{#if r.h > 40}
						<text x={r.x + 7} y={r.y + 29} font-size="9" fill="var(--ink-note)"
							>{format(r.node.value)}{unit}</text
						>
					{/if}
				{/if}
			</g>
		{/each}
	</svg>

	<Tooltip x={tip.x} y={tip.y} show={tip.show}>
		{#if hover >= 0}
			<div class="ifc-tip-title">{nodes[hover].name}</div>
			<div class="ifc-tip-row">
				<span class="ifc-tip-key" style="background:var(--pastel-{tok(hover)})"></span>
				<span>Size</span>
				<span class="ifc-tip-val">{format(nodes[hover].value)}{unit}</span>
			</div>
			<div class="ifc-tip-row">
				<span class="ifc-tip-key" style="background:transparent;border-style:dashed"></span>
				<span>Share</span>
				<span class="ifc-tip-val">{((nodes[hover].value / total) * 100).toFixed(1)}%</span>
			</div>
		{/if}
	</Tooltip>
</div>
