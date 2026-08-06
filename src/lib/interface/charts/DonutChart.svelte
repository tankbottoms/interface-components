<script lang="ts">
	import Tooltip from './Tooltip.svelte';

	/**
	 * Donut with a centred total — the request-mix and storage-split panels.
	 * Segments pull outward on hover rather than changing colour, so the legend
	 * stays truthful.
	 */
	let {
		slices = [],
		tokens = [],
		size = 190,
		centerLabel = '',
		format = (v: number) => Math.round(v).toLocaleString('en-US')
	}: {
		slices?: { label: string; value: number }[];
		tokens?: string[];
		size?: number;
		centerLabel?: string;
		format?: (v: number) => string;
	} = $props();

	const total = $derived(slices.reduce((a, s) => a + s.value, 0) || 1);
	const R = $derived(size / 2 - 6);
	const r0 = $derived(R * 0.58);
	const C = $derived(size / 2);

	interface Arc {
		d: string;
		mid: number;
		i: number;
	}

	const arcs = $derived.by((): Arc[] => {
		let a0 = -Math.PI / 2;
		return slices.map((s, i) => {
			const sweep = (s.value / total) * Math.PI * 2;
			const a1 = a0 + sweep;
			const large = sweep > Math.PI ? 1 : 0;
			const p = (ang: number, rad: number) => [
				(C + Math.cos(ang) * rad).toFixed(2),
				(C + Math.sin(ang) * rad).toFixed(2)
			];
			const [x0, y0] = p(a0, R);
			const [x1, y1] = p(a1, R);
			const [x2, y2] = p(a1, r0);
			const [x3, y3] = p(a0, r0);
			const d = `M${x0},${y0} A${R},${R} 0 ${large} 1 ${x1},${y1} L${x2},${y2} A${r0},${r0} 0 ${large} 0 ${x3},${y3} Z`;
			const mid = a0 + sweep / 2;
			a0 = a1;
			return { d, mid, i };
		});
	});

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

<div class="donut">
	<div class="ifc-chart" style="max-width:{size}px">
		<svg viewBox="0 0 {size} {size}" role="img" aria-label="Donut chart" onmouseleave={leave}>
			{#each arcs as a}
				<path
					d={a.d}
					fill="var(--pastel-{tok(a.i)})"
					stroke="var(--rule)"
					stroke-width={hover === a.i ? 1.6 : 0.7}
					transform={hover === a.i
						? `translate(${Math.cos(a.mid) * 4},${Math.sin(a.mid) * 4})`
						: undefined}
					role="presentation"
					onmousemove={(e) => enter(e, a.i)}
				/>
			{/each}
			<text x={C} y={C - 2} text-anchor="middle" font-size="16" font-weight="700" fill="var(--ink)"
				>{format(total)}</text
			>
			<text x={C} y={C + 12} text-anchor="middle" font-size="8" fill="var(--ink-soft)"
				>{centerLabel}</text
			>
		</svg>
	</div>

	<div class="donut-legend">
		{#each slices as s, i}
			<div class="donut-row" class:dim={hover !== -1 && hover !== i}>
				<span class="ifc-legend-key" style="background:var(--pastel-{tok(i)})"></span>
				<span class="donut-name">{s.label}</span>
				<span class="donut-pct">{((s.value / total) * 100).toFixed(1)}%</span>
			</div>
		{/each}
	</div>

	<Tooltip x={tip.x} y={tip.y} show={tip.show}>
		{#if hover >= 0}
			<div class="ifc-tip-title">{slices[hover].label}</div>
			<div class="ifc-tip-row">
				<span class="ifc-tip-key" style="background:var(--pastel-{tok(hover)})"></span>
				<span>Value</span>
				<span class="ifc-tip-val">{format(slices[hover].value)}</span>
			</div>
		{/if}
	</Tooltip>
</div>

<style>
	.donut {
		display: flex;
		gap: var(--spacing-lg);
		align-items: center;
		flex-wrap: wrap;
	}
	.donut-legend {
		display: flex;
		flex-direction: column;
		gap: 3px;
		font-size: 0.68rem;
		min-width: 150px;
	}
	.donut-row {
		display: flex;
		align-items: center;
		gap: 6px;
	}
	.donut-row.dim {
		opacity: 0.45;
	}
	.donut-name {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.donut-pct {
		margin-left: auto;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
	}
</style>
