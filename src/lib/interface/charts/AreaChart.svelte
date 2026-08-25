<script lang="ts">
	import Tooltip from './Tooltip.svelte';

	/**
	 * Multi-series line/area with a shared crosshair — the gpumon latency and
	 * seaweed throughput charts. Pass one series for a filled area, several for
	 * an overlaid comparison (fill drops to a wash so lines stay readable).
	 */
	let {
		series = [],
		labels = [],
		names = [],
		tokens = [],
		unit = '',
		height = 190,
		fill = true,
		yFormat = (v: number) => (v >= 100 ? v.toFixed(0) : v.toFixed(1))
	}: {
		series?: number[][];
		labels?: string[];
		names?: string[];
		tokens?: string[];
		unit?: string;
		height?: number;
		fill?: boolean;
		yFormat?: (v: number) => string;
	} = $props();

	const W = 720;
	const M = { top: 12, right: 10, bottom: 20, left: 42 };
	const innerW = $derived(W - M.left - M.right);
	const innerH = $derived(height - M.top - M.bottom);

	const count = $derived(series[0]?.length ?? 0);
	const max = $derived(Math.max(1, ...series.flat()) * 1.1);
	const stepX = $derived(count > 1 ? innerW / (count - 1) : innerW);

	const y = (v: number) => M.top + innerH - (v / max) * innerH;
	const x = (i: number) => M.left + i * stepX;

	const line = (vals: number[]) =>
		vals.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
	const area = (vals: number[]) =>
		`${line(vals)} L${x(vals.length - 1).toFixed(1)},${(M.top + innerH).toFixed(1)} L${x(0).toFixed(
			1
		)},${(M.top + innerH).toFixed(1)} Z`;

	const ticks = $derived([0, 0.5, 1].map((f) => f * max));

	let hover = $state(-1);
	let tip = $state({ x: 0, y: 0, show: false });

	function move(e: MouseEvent, target: SVGSVGElement) {
		const r = target.getBoundingClientRect();
		const px = ((e.clientX - r.left) / r.width) * W;
		const i = Math.round((px - M.left) / stepX);
		hover = i >= 0 && i < count ? i : -1;
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
		role="img"
		aria-label="Line chart"
		onmousemove={(e) => move(e, e.currentTarget)}
		onmouseleave={leave}
	>
		<g class="ifc-axis">
			{#each ticks as t}
				<line x1={M.left} x2={W - M.right} y1={y(t)} y2={y(t)} />
				<text x={M.left - 6} y={y(t) + 3} text-anchor="end">{yFormat(t)}</text>
			{/each}
		</g>

		{#each series as vals, s}
			{#if fill}
				<path
					d={area(vals)}
					fill="var(--pastel-{tokens[s] ?? 'cyan'})"
					opacity={series.length > 1 ? 0.45 : 0.85}
				/>
			{/if}
			<path
				d={line(vals)}
				fill="none"
				stroke="var(--stroke-{tokens[s] ?? 'cyan'})"
				stroke-width="1.6"
				stroke-linejoin="round"
			/>
		{/each}

		{#if hover >= 0}
			<line
				x1={x(hover)}
				x2={x(hover)}
				y1={M.top}
				y2={M.top + innerH}
				stroke="var(--ink-soft)"
				stroke-dasharray="2 3"
				stroke-width="0.7"
			/>
			{#each series as vals, s}
				<circle
					cx={x(hover)}
					cy={y(vals[hover])}
					r="3"
					fill="var(--paper-pane)"
					stroke="var(--stroke-{tokens[s] ?? 'cyan'})"
					stroke-width="1.6"
				/>
			{/each}
		{/if}

		<g class="ifc-axis">
			<line x1={M.left} x2={W - M.right} y1={M.top + innerH} y2={M.top + innerH} class="base" />
			{#each labels as l, i}
				{#if labels.length <= 12 || i % Math.ceil(labels.length / 10) === 0}
					<text x={x(i)} y={height - 6} text-anchor="middle">{l}</text>
				{/if}
			{/each}
		</g>
	</svg>

	{#if names.length > 1}
		<div class="ifc-legend">
			{#each names as n, i}
				<span class="ifc-legend-item">
					<span
						class="ifc-legend-key"
						style="background:var(--pastel-{tokens[i] ?? 'cyan'});border-color:var(--stroke-{tokens[
							i
						] ?? 'cyan'})"
					></span>{n}
				</span>
			{/each}
		</div>
	{/if}

	<Tooltip x={tip.x} y={tip.y} show={tip.show}>
		{#if hover >= 0}
			<div class="ifc-tip-title">{labels[hover] ?? `t+${hover}`}</div>
			{#each series as vals, s}
				<div class="ifc-tip-row">
					<span class="ifc-tip-key" style="background:var(--pastel-{tokens[s] ?? 'cyan'})"></span>
					<span>{names[s] ?? `Series ${s + 1}`}</span>
					<span class="ifc-tip-val">{yFormat(vals[hover])}{unit}</span>
				</div>
			{/each}
		{/if}
	</Tooltip>
</div>
