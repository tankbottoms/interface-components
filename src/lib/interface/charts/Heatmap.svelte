<script lang="ts">
	import Tooltip from './Tooltip.svelte';

	/**
	 * Hour × weekday load-shape grid. Intensity is expressed by blending the
	 * pastel fill toward its darkened stroke companion, so the ramp stays
	 * inside the palette instead of introducing an unrelated colour scale.
	 */
	let {
		matrix = [],
		rowLabels = [],
		colLabels = [],
		token = 'aqua',
		unit = '',
		cell = 22
	}: {
		matrix?: number[][];
		rowLabels?: string[];
		colLabels?: string[];
		token?: string;
		unit?: string;
		cell?: number;
	} = $props();

	const gutter = 34;
	const W = $derived(gutter + (matrix[0]?.length ?? 0) * cell + 4);
	const H = $derived(18 + matrix.length * cell + 4);
	const max = $derived(Math.max(0.001, ...matrix.flat()));

	let hover = $state<{ r: number; c: number } | null>(null);
	let tip = $state({ x: 0, y: 0, show: false });

	function enter(e: MouseEvent, r: number, c: number) {
		hover = { r, c };
		tip = { x: e.clientX, y: e.clientY, show: true };
	}
	function leave() {
		hover = null;
		tip = { ...tip, show: false };
	}
</script>

<div class="ifc-chart">
	<svg viewBox="0 0 {W} {H}" role="img" aria-label="Load-shape heatmap" onmouseleave={leave}>
		<g class="ifc-axis">
			{#each colLabels as l, c}
				{#if c % 3 === 0}
					<text x={gutter + c * cell + cell / 2} y="12" text-anchor="middle">{l}</text>
				{/if}
			{/each}
			{#each rowLabels as l, r}
				<text x={gutter - 6} y={18 + r * cell + cell / 2 + 3} text-anchor="end">{l}</text>
			{/each}
		</g>

		{#each matrix as row, r}
			{#each row as v, c}
				<rect
					x={gutter + c * cell}
					y={18 + r * cell}
					width={cell - 1.5}
					height={cell - 1.5}
					fill="var(--stroke-{token})"
					fill-opacity={0.08 + (v / max) * 0.84}
					stroke={hover && hover.r === r && hover.c === c ? 'var(--rule)' : 'var(--rule-hair)'}
					stroke-width={hover && hover.r === r && hover.c === c ? 1.4 : 0.5}
					role="presentation"
					onmousemove={(e) => enter(e, r, c)}
				/>
			{/each}
		{/each}
	</svg>

	<div class="ifc-legend">
		<span class="ifc-legend-item">Low</span>
		{#each [0.15, 0.35, 0.55, 0.75, 1] as f}
			<span
				class="ifc-legend-key"
				style="background:var(--stroke-{token});opacity:{f};border-color:var(--rule-hair)"
			></span>
		{/each}
		<span class="ifc-legend-item">High</span>
	</div>

	<Tooltip x={tip.x} y={tip.y} show={tip.show}>
		{#if hover}
			<div class="ifc-tip-title">{rowLabels[hover.r]} · {colLabels[hover.c]}</div>
			<div class="ifc-tip-row">
				<span class="ifc-tip-key" style="background:var(--pastel-{token})"></span>
				<span>Mean load</span>
				<span class="ifc-tip-val">{matrix[hover.r][hover.c].toFixed(2)}{unit}</span>
			</div>
		{/if}
	</Tooltip>
</div>
