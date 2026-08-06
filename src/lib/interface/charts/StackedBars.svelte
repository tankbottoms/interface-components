<script lang="ts">
	import Tooltip from './Tooltip.svelte';
	import type { StackedPoint } from '$lib/interface/generate';

	/**
	 * Stacked monthly columns — house's "12-month consumption by cost tier".
	 * Hovering a segment isolates it and reports both the segment and the
	 * column total.
	 */
	let {
		data = [],
		series = [],
		tokens = [],
		unit = '',
		height = 220
	}: {
		data?: StackedPoint[];
		series?: string[];
		tokens?: string[];
		unit?: string;
		height?: number;
	} = $props();

	const W = 720;
	const M = { top: 12, right: 10, bottom: 22, left: 44 };
	const innerW = $derived(W - M.left - M.right);
	const innerH = $derived(height - M.top - M.bottom);

	const totals = $derived(data.map((d) => d.values.reduce((a, b) => a + b, 0)));
	const max = $derived(Math.max(1, ...totals) * 1.08);
	const step = $derived(data.length ? innerW / data.length : 0);
	const barW = $derived(Math.max(1, step * 0.66));

	const y = (v: number) => M.top + innerH - (v / max) * innerH;
	const cx = (i: number) => M.left + i * step + step / 2;

	/** Cumulative offsets so each segment sits atop the previous. */
	const stacks = $derived(
		data.map((d) => {
			let acc = 0;
			return d.values.map((v) => {
				const y0 = acc;
				acc += v;
				return { v, y0, y1: acc };
			});
		})
	);

	const ticks = $derived([0, 0.5, 1].map((f) => f * max));

	let hoverCol = $state(-1);
	let hoverSeg = $state(-1);
	let tip = $state({ x: 0, y: 0, show: false });

	function enter(e: MouseEvent, col: number, seg: number) {
		hoverCol = col;
		hoverSeg = seg;
		tip = { x: e.clientX, y: e.clientY, show: true };
	}
	function leave() {
		hoverCol = -1;
		hoverSeg = -1;
		tip = { ...tip, show: false };
	}
	const fmt = (v: number) => Math.round(v).toLocaleString('en-US');
</script>

<div class="ifc-chart">
	<svg viewBox="0 0 {W} {height}" role="img" aria-label="Stacked bar chart" onmouseleave={leave}>
		<g class="ifc-axis">
			{#each ticks as t}
				<line x1={M.left} x2={W - M.right} y1={y(t)} y2={y(t)} />
				<text x={M.left - 6} y={y(t) + 3} text-anchor="end">{fmt(t)}</text>
			{/each}
		</g>

		{#each stacks as col, i}
			{#each col as seg, s}
				<rect
					x={cx(i) - barW / 2}
					y={y(seg.y1)}
					width={barW}
					height={Math.max(0, y(seg.y0) - y(seg.y1))}
					fill="var(--pastel-{tokens[s] ?? 'cyan'})"
					stroke="var(--stroke-{tokens[s] ?? 'cyan'})"
					stroke-width="0.7"
					opacity={hoverCol === -1 || (hoverCol === i && hoverSeg === s) ? 1 : 0.4}
					role="presentation"
					onmousemove={(e) => enter(e, i, s)}
				/>
			{/each}
		{/each}

		<g class="ifc-axis">
			<line x1={M.left} x2={W - M.right} y1={M.top + innerH} y2={M.top + innerH} stroke="var(--rule)" />
			{#each data as d, i}
				<text x={cx(i)} y={height - 7} text-anchor="middle">{d.label}</text>
			{/each}
		</g>
	</svg>

	<div class="ifc-legend">
		{#each series as s, i}
			<span class="ifc-legend-item">
				<span
					class="ifc-legend-key"
					style="background:var(--pastel-{tokens[i] ?? 'cyan'});border-color:var(--stroke-{tokens[
						i
					] ?? 'cyan'})"
				></span>{s}
			</span>
		{/each}
	</div>

	<Tooltip x={tip.x} y={tip.y} show={tip.show}>
		{#if hoverCol >= 0}
			<div class="ifc-tip-title">{data[hoverCol].label}</div>
			<div class="ifc-tip-row">
				<span
					class="ifc-tip-key"
					style="background:var(--pastel-{tokens[hoverSeg] ?? 'cyan'})"
				></span>
				<span>{series[hoverSeg] ?? `Series ${hoverSeg + 1}`}</span>
				<span class="ifc-tip-val">{fmt(data[hoverCol].values[hoverSeg])}{unit}</span>
			</div>
			<div class="ifc-tip-row">
				<span class="ifc-tip-key" style="background:transparent;border-style:dashed"></span>
				<span>Total</span>
				<span class="ifc-tip-val">{fmt(totals[hoverCol])}{unit}</span>
			</div>
		{/if}
	</Tooltip>
</div>
