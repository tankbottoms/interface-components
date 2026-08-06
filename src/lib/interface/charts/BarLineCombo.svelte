<script lang="ts">
	import Tooltip from './Tooltip.svelte';

	/**
	 * Daily bars with a trailing-mean overlay — the shape used by the house
	 * energy dashboard for "daily consumption + 7-day mean".
	 */
	let {
		values = [],
		mean = [],
		labels = [],
		unit = '',
		barToken = 'cyan',
		lineToken = 'coral',
		height = 200,
		meanLabel = '7-day mean'
	}: {
		values?: number[];
		mean?: number[];
		labels?: string[];
		unit?: string;
		barToken?: string;
		lineToken?: string;
		height?: number;
		meanLabel?: string;
	} = $props();

	const W = 720;
	const M = { top: 12, right: 10, bottom: 22, left: 38 };

	const innerW = $derived(W - M.left - M.right);
	const innerH = $derived(height - M.top - M.bottom);
	const max = $derived(Math.max(1, ...values, ...mean) * 1.08);
	const step = $derived(values.length ? innerW / values.length : 0);
	const barW = $derived(Math.max(1, step * 0.72));

	const y = (v: number) => M.top + innerH - (v / max) * innerH;
	const cx = (i: number) => M.left + i * step + step / 2;

	const meanPath = $derived(
		mean.length
			? mean.map((v, i) => `${i === 0 ? 'M' : 'L'}${cx(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')
			: ''
	);

	const ticks = $derived([0, 0.25, 0.5, 0.75, 1].map((f) => f * max));

	let hover = $state(-1);
	let tip = $state({ x: 0, y: 0, show: false });

	function move(e: MouseEvent, target: SVGSVGElement) {
		const r = target.getBoundingClientRect();
		const px = ((e.clientX - r.left) / r.width) * W;
		const i = Math.floor((px - M.left) / step);
		hover = i >= 0 && i < values.length ? i : -1;
		tip = { x: e.clientX, y: e.clientY, show: hover >= 0 };
	}
	function leave() {
		hover = -1;
		tip = { ...tip, show: false };
	}
	const fmt = (v: number) => (v >= 100 ? v.toFixed(0) : v.toFixed(1));
</script>

<div class="ifc-chart">
	<svg
		viewBox="0 0 {W} {height}"
		role="img"
		aria-label="Bar chart with rolling-mean overlay"
		onmousemove={(e) => move(e, e.currentTarget)}
		onmouseleave={leave}
	>
		<g class="ifc-axis">
			{#each ticks as t}
				<line x1={M.left} x2={W - M.right} y1={y(t)} y2={y(t)} />
				<text x={M.left - 6} y={y(t) + 3} text-anchor="end">{fmt(t)}</text>
			{/each}
		</g>

		{#each values as v, i}
			<rect
				x={cx(i) - barW / 2}
				y={y(v)}
				width={barW}
				height={Math.max(0, M.top + innerH - y(v))}
				fill="var(--pastel-{barToken})"
				stroke="var(--stroke-{barToken})"
				stroke-width={hover === i ? 1.6 : 0.6}
				opacity={hover === -1 || hover === i ? 1 : 0.45}
			/>
		{/each}

		{#if meanPath}
			<path d={meanPath} fill="none" stroke="var(--stroke-{lineToken})" stroke-width="1.8" />
		{/if}

		{#if hover >= 0}
			<line
				x1={cx(hover)}
				x2={cx(hover)}
				y1={M.top}
				y2={M.top + innerH}
				stroke="var(--rule)"
				stroke-dasharray="2 3"
				stroke-width="0.7"
			/>
			{#if mean[hover] !== undefined}
				<circle
					cx={cx(hover)}
					cy={y(mean[hover])}
					r="3"
					fill="var(--paper-pane)"
					stroke="var(--stroke-{lineToken})"
					stroke-width="1.6"
				/>
			{/if}
		{/if}

		<g class="ifc-axis">
			<line x1={M.left} x2={W - M.right} y1={M.top + innerH} y2={M.top + innerH} stroke="var(--rule)" />
			{#each labels as l, i}
				{#if labels.length <= 14 || i % Math.ceil(labels.length / 12) === 0}
					<text x={cx(i)} y={height - 7} text-anchor="middle">{l}</text>
				{/if}
			{/each}
		</g>
	</svg>

	<Tooltip x={tip.x} y={tip.y} show={tip.show}>
		{#if hover >= 0}
			<div class="ifc-tip-title">{labels[hover] ?? `#${hover + 1}`}</div>
			<div class="ifc-tip-row">
				<span class="ifc-tip-key" style="background:var(--pastel-{barToken})"></span>
				<span>Actual</span>
				<span class="ifc-tip-val">{fmt(values[hover])}{unit}</span>
			</div>
			{#if mean[hover] !== undefined}
				<div class="ifc-tip-row">
					<span class="ifc-tip-key" style="background:var(--stroke-{lineToken})"></span>
					<span>{meanLabel}</span>
					<span class="ifc-tip-val">{fmt(mean[hover])}{unit}</span>
				</div>
			{/if}
		{/if}
	</Tooltip>
</div>
