<script lang="ts">
	import Tooltip from './Tooltip.svelte';

	/**
	 * Card-sized sparkline in either area or bar mode — the per-metric tiles on
	 * seaweed-stats and the claude-proxy dashboard. Deliberately axis-free:
	 * the current value is the headline, the shape is the context.
	 */
	let {
		values = [],
		mode = 'area',
		token = 'cyan',
		unit = '',
		height = 54,
		format = (v: number) => (v >= 100 ? v.toFixed(0) : v.toFixed(1))
	}: {
		values?: number[];
		mode?: 'area' | 'bar';
		token?: string;
		unit?: string;
		height?: number;
		format?: (v: number) => string;
	} = $props();

	const W = 300;
	const pad = 2;
	const max = $derived(Math.max(1, ...values) * 1.05);
	const n = $derived(values.length);
	const stepX = $derived(n > 1 ? (W - pad * 2) / (n - 1) : W);
	const barStep = $derived(n ? (W - pad * 2) / n : W);

	const y = (v: number) => height - pad - (v / max) * (height - pad * 2);
	const x = (i: number) => pad + i * stepX;

	const line = $derived(
		values.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')
	);
	const area = $derived(
		n ? `${line} L${x(n - 1).toFixed(1)},${height - pad} L${pad},${height - pad} Z` : ''
	);

	let hover = $state(-1);
	let tip = $state({ x: 0, y: 0, show: false });

	function move(e: MouseEvent, target: SVGSVGElement) {
		const r = target.getBoundingClientRect();
		const px = ((e.clientX - r.left) / r.width) * W;
		const i = mode === 'bar' ? Math.floor((px - pad) / barStep) : Math.round((px - pad) / stepX);
		hover = i >= 0 && i < n ? i : -1;
		tip = { x: e.clientX, y: e.clientY, show: hover >= 0 };
	}
	function leave() {
		hover = -1;
		tip = { ...tip, show: false };
	}
</script>

<div class="ifc-chart">
	<svg
		viewBox="0 0 {W} {height}"
		preserveAspectRatio="none"
		role="img"
		aria-label="Sparkline"
		onmousemove={(e) => move(e, e.currentTarget)}
		onmouseleave={leave}
	>
		{#if mode === 'area'}
			<path d={area} fill="var(--pastel-{token})" />
			<path d={line} fill="none" stroke="var(--stroke-{token})" stroke-width="1.4" vector-effect="non-scaling-stroke" />
			{#if hover >= 0}
				<line
					x1={x(hover)}
					x2={x(hover)}
					y1="0"
					y2={height}
					stroke="var(--rule)"
					stroke-width="0.6"
					vector-effect="non-scaling-stroke"
				/>
			{/if}
		{:else}
			{#each values as v, i}
				<rect
					x={pad + i * barStep}
					y={y(v)}
					width={Math.max(0.6, barStep * 0.7)}
					height={Math.max(0.5, height - pad - y(v))}
					fill="var(--pastel-{token})"
					stroke="var(--stroke-{token})"
					stroke-width="0.5"
					vector-effect="non-scaling-stroke"
					opacity={hover === -1 || hover === i ? 1 : 0.45}
				/>
			{/each}
		{/if}
	</svg>

	<Tooltip x={tip.x} y={tip.y} show={tip.show}>
		{#if hover >= 0}
			<div class="ifc-tip-row">
				<span class="ifc-tip-key" style="background:var(--pastel-{token})"></span>
				<span>t−{n - 1 - hover}</span>
				<span class="ifc-tip-val">{format(values[hover])}{unit}</span>
			</div>
		{/if}
	</Tooltip>
</div>
