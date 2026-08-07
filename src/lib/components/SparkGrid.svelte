<script lang="ts">
	/**
	 * A live grid of `magx-sparkline` elements, one per rendering variant.
	 *
	 * This is the component that replaced the old hero *screenshot* of sparkline
	 * variations — every tile here is the real element drawing on a real canvas.
	 * It is used twice: small and quiet in the hero, and large across the animated
	 * charting section.
	 *
	 * Two things drive it:
	 *  - `seed` — change it and every tile regenerates its synthetic series.
	 *  - `fps`  — 0 draws once and stops; anything higher streams new datapoints
	 *             at that rate through the shared frame pump.
	 */
	import { onMount } from 'svelte';
	import { onTick, hexToRgb, cssVar } from '$lib/anim';
	import { walk, spiky, diurnal, rng, between } from '$lib/interface/generate';
	import { chartSeries } from '$lib/data/palette';

	interface Props {
		fps?: number;
		seed?: number;
		/** Tile height in px. The canvas sizes itself from the element box. */
		height?: number;
		/** Minimum tile width fed to the auto-fill grid. */
		minWidth?: number;
		/** Show the caption strip under each tile. */
		captions?: boolean;
		/** Restrict to the first N variants. */
		limit?: number;
	}

	let {
		fps = 0,
		seed = 1,
		height = 64,
		minWidth = 150,
		captions = true,
		limit = 0
	}: Props = $props();

	type Shape = 'walk' | 'spiky' | 'diurnal';

	interface Variant {
		label: string;
		type: 'line' | 'bar';
		shape: Shape;
		/** Index into the eight-pastel chart series. */
		series: number;
		fill: 'gradient' | 'solid' | 'abovebelow' | 'none';
		line: 'solid' | 'abovebelow' | 'firstlastdiff';
		ref: 'none' | 'middle' | 'average' | 'median';
		lineWidth?: number;
		endpoint?: boolean;
	}

	const ALL: Variant[] = [
		{
			label: 'Line · gradient',
			type: 'line',
			shape: 'walk',
			series: 0,
			fill: 'gradient',
			line: 'solid',
			ref: 'average'
		},
		{
			label: 'Bar · solid',
			type: 'bar',
			shape: 'spiky',
			series: 1,
			fill: 'solid',
			line: 'solid',
			ref: 'none'
		},
		{
			label: 'Line · above/below',
			type: 'line',
			shape: 'diurnal',
			series: 3,
			fill: 'abovebelow',
			line: 'abovebelow',
			ref: 'middle'
		},
		{
			label: 'Line · endpoint',
			type: 'line',
			shape: 'walk',
			series: 4,
			fill: 'none',
			line: 'solid',
			ref: 'none',
			lineWidth: 2,
			endpoint: true
		},
		{
			label: 'Bar · above/below',
			type: 'bar',
			shape: 'walk',
			series: 5,
			fill: 'abovebelow',
			line: 'solid',
			ref: 'median'
		},
		{
			label: 'Line · first/last diff',
			type: 'line',
			shape: 'walk',
			series: 2,
			fill: 'gradient',
			line: 'firstlastdiff',
			ref: 'none'
		},
		{
			label: 'Line · median ref',
			type: 'line',
			shape: 'diurnal',
			series: 6,
			fill: 'gradient',
			line: 'solid',
			ref: 'median',
			lineWidth: 1.5
		},
		{
			label: 'Bar · quiet',
			type: 'bar',
			shape: 'walk',
			series: 7,
			fill: 'solid',
			line: 'solid',
			ref: 'none'
		}
	];

	const variants = $derived(limit > 0 ? ALL.slice(0, limit) : ALL);

	const POINTS = 40;

	let els: (HTMLElement | null)[] = $state([]);
	let ready = $state(false);

	/** Per-tile walk cursor, so streamed points continue the shape rather than jump. */
	let cursors: number[] = [];

	function seriesFor(v: Variant, s: number): number[] {
		if (v.shape === 'spiky') return spiky(POINTS, { seed: s, base: 6, spike: 90, chance: 0.12 });
		if (v.shape === 'diurnal') return diurnal(POINTS, { seed: s, min: 15, max: 95, period: 18 });
		return walk(POINTS, { seed: s, min: 8, max: 92 });
	}

	/** Applies colour + rendering options, then loads a fresh series. */
	function paint(el: any, v: Variant, s: number) {
		if (!el?.setType) return;

		const sw = chartSeries[v.series % chartSeries.length];
		const stroke = hexToRgb(sw.stroke);
		const fill = hexToRgb(sw.fill);
		const alt = hexToRgb(chartSeries[(v.series + 4) % chartSeries.length].stroke);
		const bg = hexToRgb(cssVar('--color-bg-alt', '#faf8f3'));

		el.setBackgroundColor({ ...bg, a: 1 });
		el.setDataPointNum(POINTS);
		el.setType(v.type);
		el.setLineWidth(v.lineWidth ?? 1.25);

		if (v.line === 'solid') el.setLineColor('solid', { ...stroke, a: 1 });
		else el.setLineColor(v.line, { above: { ...stroke, a: 1 }, below: { ...alt, a: 1 } });

		if (v.fill === 'gradient')
			el.setFill('gradient', { above: { ...fill, a: 0.85 }, below: { ...fill, a: 0.05 } });
		else if (v.fill === 'solid') el.setFill('solid', { ...fill, a: 0.9 });
		else if (v.fill === 'abovebelow')
			el.setFill('abovebelow', { above: { ...fill, a: 0.9 }, below: { ...alt, a: 0.28 } });
		else el.setFill('solid', { ...fill, a: 0 });

		el.setReferenceLine(v.ref);
		if (v.ref !== 'none') el.setReferenceLineColor({ r: 140, g: 140, b: 140, a: 0.45 }, 1);
		if (v.endpoint) el.setEndpoint(2.5, { ...stroke, a: 1 });

		const data = seriesFor(v, s);
		el.setData(data);
		el.renderCanvas();
		return data[data.length - 1];
	}

	function paintAll(s: number) {
		cursors = variants.map((v, i) => paint(els[i], v, s + i * 17) ?? 50);
	}

	onMount(() => {
		// The canvas reads clientWidth/clientHeight, so wait for layout before the
		// first paint — otherwise every tile renders into a zero-width canvas.
		const raf = requestAnimationFrame(() => {
			ready = true;
			paintAll(seed);
		});
		return () => cancelAnimationFrame(raf);
	});

	// Reshuffle: a new seed repaints every tile from scratch.
	$effect(() => {
		const s = seed;
		if (!ready) return;
		paintAll(s);
	});

	// Streaming. Reads fps through a getter so the slider retunes the live loop.
	$effect(() => {
		if (!ready) return;
		return onTick(
			() => fps,
			() => {
				variants.forEach((v, i) => {
					const el = els[i] as any;
					if (!el?.addDatapoint) return;
					const r = Math.random();
					let next: number;
					if (v.shape === 'spiky') next = r < 0.12 ? 40 + r * 400 : 4 + r * 10;
					else if (v.shape === 'diurnal')
						next = 55 + 34 * Math.sin(performance.now() / 900 + i) + (r - 0.5) * 12;
					else next = Math.max(8, Math.min(92, cursors[i] + (r - 0.5) * 16));
					cursors[i] = next;
					el.addDatapoint(next);
					el.renderCanvas();
				});
			}
		);
	});
</script>

<div class="spark-grid" style="--tile-min:{minWidth}px">
	{#each variants as v, i (v.label)}
		<figure class="tile">
			<magx-sparkline
				bind:this={els[i]}
				style="display:block; width:100%; height:{height}px"
				aria-label={v.label}
			></magx-sparkline>
			{#if captions}
				<figcaption>{v.label}</figcaption>
			{/if}
		</figure>
	{/each}
</div>

<style>
	.spark-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(var(--tile-min), 1fr));
		gap: var(--spacing-sm);
	}
	.tile {
		border: 1px solid var(--color-border);
		background: var(--color-bg-alt);
		padding: 6px;
		min-width: 0;
	}
	figcaption {
		font-family: var(--font-mono);
		font-size: 0.6rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-text-muted);
		margin-top: 4px;
	}

	@media (max-width: 768px) {
		.spark-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
</style>
