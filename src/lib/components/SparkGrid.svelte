<script lang="ts">
	/**
	 * A live grid of `magx-sparkline` elements, one per rendering variant.
	 *
	 * This is the component that replaced the old hero *screenshot* of sparkline
	 * variations — every tile here is the real element drawing on a real canvas.
	 * It is used in the hero (a short slice) and in full across the animated
	 * charting section.
	 *
	 * Two things drive it:
	 *  - `seed` — change it and every tile regenerates its synthetic series.
	 *  - `fps`  — 0 draws once and stops; anything higher streams new datapoints
	 *             at that rate through the shared frame pump.
	 *
	 * Element handles are collected by querying the container rather than by
	 * `bind:this` into an array. Array-index bindings inside a keyed `{#each}`
	 * were silently leaving the handles unset, which is what made every tile
	 * render as an empty box: `paint()` was called with `undefined` and bailed.
	 */
	import { onTick, hexToRgb, cssVar } from '$lib/anim';
	import { walk, spiky, diurnal } from '$lib/interface/generate';
	import { chartSeries } from '$lib/data/palette';
	import InfoTip from './InfoTip.svelte';

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
		ref: 'none' | 'middle' | 'average' | 'median' | 'custom' | 'firstdatapoint';
		/** Data-space y position for `ref: 'custom'`. */
		refPos?: number;
		lineWidth?: number;
		endpoint?: boolean;
		/** Fixed y-axis window, instead of tracking the data's own min/max. */
		bounds?: [number, number];
		/** Draw out-of-range points flat against the edge rather than off-canvas. */
		cap?: [boolean, boolean];
		/** Override the default sample count for this tile. */
		points?: number;
	}

	/**
	 * One tile per rendering behaviour the element actually supports — both chart
	 * types crossed with every line type, fill type, reference-line type, plus the
	 * axis controls (`setLowerBound` / `setUpperBound` / `setCap`), stroke weights
	 * and the endpoint marker. The point of the grid is that nothing in the API is
	 * left undocumented by example.
	 */
	const ALL: Variant[] = [
		// ── Line: strokes and fills ──────────────────────────────────────────
		{ label: 'Line · plain', type: 'line', shape: 'walk', series: 0, fill: 'none', line: 'solid', ref: 'none' },
		{ label: 'Line · gradient fill', type: 'line', shape: 'walk', series: 0, fill: 'gradient', line: 'solid', ref: 'average' },
		{ label: 'Line · solid fill', type: 'line', shape: 'walk', series: 3, fill: 'solid', line: 'solid', ref: 'none' },
		{ label: 'Line · split fill', type: 'line', shape: 'diurnal', series: 3, fill: 'abovebelow', line: 'solid', ref: 'middle' },
		{ label: 'Line · split stroke', type: 'line', shape: 'diurnal', series: 1, fill: 'none', line: 'abovebelow', ref: 'middle', lineWidth: 1.75 },
		{ label: 'Line · first/last diff', type: 'line', shape: 'walk', series: 2, fill: 'gradient', line: 'firstlastdiff', ref: 'none' },
		{ label: 'Line · endpoint dot', type: 'line', shape: 'walk', series: 4, fill: 'none', line: 'solid', ref: 'none', lineWidth: 2, endpoint: true },
		{ label: 'Line · heavy stroke', type: 'line', shape: 'walk', series: 5, fill: 'none', line: 'solid', ref: 'none', lineWidth: 3 },
		{ label: 'Line · hairline', type: 'line', shape: 'walk', series: 6, fill: 'none', line: 'solid', ref: 'none', lineWidth: 0.5, points: 90 },

		// ── Line: every reference-line type ──────────────────────────────────
		{ label: 'Ref · middle', type: 'line', shape: 'walk', series: 6, fill: 'gradient', line: 'solid', ref: 'middle' },
		{ label: 'Ref · average', type: 'line', shape: 'walk', series: 7, fill: 'gradient', line: 'solid', ref: 'average' },
		{ label: 'Ref · median', type: 'line', shape: 'diurnal', series: 6, fill: 'gradient', line: 'solid', ref: 'median', lineWidth: 1.5 },
		{ label: 'Ref · first point', type: 'line', shape: 'walk', series: 1, fill: 'abovebelow', line: 'solid', ref: 'firstdatapoint' },
		{ label: 'Ref · custom (50)', type: 'line', shape: 'walk', series: 2, fill: 'abovebelow', line: 'solid', ref: 'custom', refPos: 50 },

		// ── Line: axis control ───────────────────────────────────────────────
		{ label: 'Line · fixed 0–100', type: 'line', shape: 'walk', series: 4, fill: 'gradient', line: 'solid', ref: 'none', bounds: [0, 100] },
		{ label: 'Line · capped 25–75', type: 'line', shape: 'spiky', series: 5, fill: 'solid', line: 'solid', ref: 'none', bounds: [25, 75], cap: [true, true] },

		// ── Line: series shapes ──────────────────────────────────────────────
		{ label: 'Line · diurnal', type: 'line', shape: 'diurnal', series: 7, fill: 'gradient', line: 'solid', ref: 'average' },
		{ label: 'Line · spiky', type: 'line', shape: 'spiky', series: 5, fill: 'none', line: 'solid', ref: 'none', lineWidth: 1 },
		{ label: 'Line · dense', type: 'line', shape: 'walk', series: 0, fill: 'gradient', line: 'solid', ref: 'none', points: 120, lineWidth: 0.75 },

		// ── Bar ──────────────────────────────────────────────────────────────
		{ label: 'Bar · solid', type: 'bar', shape: 'spiky', series: 1, fill: 'solid', line: 'solid', ref: 'none' },
		{ label: 'Bar · gradient', type: 'bar', shape: 'walk', series: 0, fill: 'gradient', line: 'solid', ref: 'none' },
		{ label: 'Bar · split fill', type: 'bar', shape: 'walk', series: 5, fill: 'abovebelow', line: 'solid', ref: 'middle' },
		{ label: 'Bar · ghost', type: 'bar', shape: 'walk', series: 7, fill: 'solid', line: 'solid', ref: 'none', lineWidth: 1 },
		{ label: 'Bar · ref average', type: 'bar', shape: 'walk', series: 3, fill: 'solid', line: 'solid', ref: 'average' },
		{ label: 'Bar · first/last diff', type: 'bar', shape: 'walk', series: 2, fill: 'solid', line: 'firstlastdiff', ref: 'none' },
		{ label: 'Bar · fixed 0–100', type: 'bar', shape: 'diurnal', series: 6, fill: 'solid', line: 'solid', ref: 'none', bounds: [0, 100] },
		{ label: 'Bar · coarse', type: 'bar', shape: 'walk', series: 4, fill: 'solid', line: 'solid', ref: 'median', points: 16 }
	];

	const variants = $derived(limit > 0 ? ALL.slice(0, limit) : ALL);

	/*
	 * Tile captions are two or three words, which names a variant without saying
	 * what it does. These are the setter calls behind each tile, so the tooltip
	 * doubles as the API reference for whatever is on screen.
	 */
	const SHAPE_NOTE: Record<Shape, string> = {
		walk: 'A bounded random walk — the everyday case of a metric drifting.',
		spiky: 'A quiet floor with occasional spikes, like error or retry counts.',
		diurnal: 'A smooth daily cycle with noise on top, like load or temperature.'
	};
	const FILL_NOTE: Record<Variant['fill'], string> = {
		gradient: 'gradient, fading downward',
		solid: 'solid',
		abovebelow: 'split at the reference line',
		none: 'none'
	};
	const LINE_NOTE: Record<Variant['line'], string> = {
		solid: 'one colour',
		abovebelow: 'recoloured across the reference line',
		firstlastdiff: 'green or red by net change'
	};

	function factsFor(v: Variant) {
		const rows = [
			{ k: 'Type', v: v.type === 'bar' ? 'Bar chart' : 'Line chart' },
			{ k: 'Stroke', v: `${LINE_NOTE[v.line]}, ${v.lineWidth ?? 1.25}px` },
			{ k: 'Fill', v: FILL_NOTE[v.fill] },
			{
				k: 'Reference',
				v: v.ref === 'none' ? 'none' : v.ref === 'custom' ? `fixed at ${v.refPos}` : v.ref
			},
			{ k: 'Y axis', v: v.bounds ? `locked ${v.bounds[0]}–${v.bounds[1]}` : 'tracks the data' },
			{ k: 'Points', v: String(v.points ?? POINTS) }
		];
		if (v.cap?.[0] || v.cap?.[1])
			rows.push({ k: 'Cap', v: 'out-of-range points drawn flat at the edge' });
		if (v.endpoint) rows.push({ k: 'Endpoint', v: 'dot marks the latest value' });
		return rows;
	}

	const POINTS = 40;

	let host: HTMLDivElement | null = $state(null);
	let ready = $state(false);

	/** Per-tile walk cursor, so streamed points continue the shape rather than jump. */
	let cursors: number[] = [];

	function tiles(): any[] {
		if (!host) return [];
		return [...host.querySelectorAll('magx-sparkline')];
	}

	function pointsOf(v: Variant): number {
		return v.points ?? POINTS;
	}

	function seriesFor(v: Variant, s: number): number[] {
		const n = pointsOf(v);
		if (v.shape === 'spiky') return spiky(n, { seed: s, base: 6, spike: 90, chance: 0.12 });
		if (v.shape === 'diurnal') return diurnal(n, { seed: s, min: 15, max: 95, period: 18 });
		return walk(n, { seed: s, min: 8, max: 92 });
	}

	/** Applies colour + rendering options, then loads a fresh series. */
	function paint(el: any, v: Variant, s: number): number | undefined {
		if (!el?.setType) return;

		const sw = chartSeries[v.series % chartSeries.length];
		const stroke = hexToRgb(sw.stroke);
		const fill = hexToRgb(sw.fill);
		const alt = hexToRgb(chartSeries[(v.series + 4) % chartSeries.length].stroke);
		const bg = hexToRgb(cssVar('--color-bg-alt', '#faf8f3'));

		el.setBackgroundColor({ ...bg, a: 1 });
		el.setDataPointNum(pointsOf(v));
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

		// Axis controls are always set, never merely skipped: an element is reused
		// across repaints, so leaving a previous bound in place would leak.
		el.setLowerBound(!!v.bounds, v.bounds?.[0] ?? 0);
		el.setUpperBound(!!v.bounds, v.bounds?.[1] ?? 0);
		el.setCap(v.cap?.[0] ?? false, v.cap?.[1] ?? false);

		el.setReferenceLine(v.ref, v.refPos ?? 0);
		if (v.ref !== 'none') el.setReferenceLineColor({ r: 140, g: 140, b: 140, a: 0.45 }, 1);
		if (v.endpoint) el.setEndpoint(2.5, { ...stroke, a: 1 });

		const data = seriesFor(v, s);
		el.setData(data);
		el.renderCanvas();
		return data[data.length - 1];
	}

	function paintAll(s: number) {
		const els = tiles();
		// Each tile is painted in isolation. These variants exist precisely to
		// exercise every combination the element exposes, so one unlucky option
		// pairing must not take the rest of the grid down with it — an unguarded
		// throw here previously left every tile after it empty.
		cursors = variants.map((v, i) => {
			try {
				return paint(els[i], v, s + i * 17) ?? 50;
			} catch (err) {
				console.warn(`[SparkGrid] "${v.label}" failed to paint`, err);
				return 50;
			}
		});
	}

	/**
	 * First paint, and every reshuffle after it.
	 *
	 * This deliberately does *not* use `onMount`. The mount callback was being
	 * dropped from the production client bundle — the built chunk contained
	 * `paint()` and both effects but no mount body at all, so `ready` never
	 * flipped and every tile stayed empty while looking perfectly healthy in the
	 * DOM. An effect survives the build and gives reshuffle for free, since
	 * reading `seed` re-runs it.
	 *
	 * The retry loop is still needed: the element is a Lit custom element that
	 * sizes its canvas from `clientWidth`/`clientHeight`, so painting before
	 * upgrade-and-layout draws into a zero-width canvas.
	 */
	$effect(() => {
		const s = seed;
		const h = host;
		if (!h) return;

		let raf = 0;
		let stop = false;

		const attempt = (tries: number) => {
			if (stop) return;
			const els = tiles();
			const first = els[0] as any;
			const upgraded = typeof first?.setType === 'function';
			const laidOut = (first?.clientWidth ?? 0) > 0;
			// On the last try, paint regardless: the element's own ResizeObserver
			// re-renders it once geometry finally arrives.
			if ((upgraded && laidOut) || tries <= 0) {
				ready = true;
				paintAll(s);
				return;
			}
			raf = requestAnimationFrame(() => attempt(tries - 1));
		};
		attempt(120);

		return () => {
			stop = true;
			if (raf) cancelAnimationFrame(raf);
		};
	});

	// A grid that starts at zero width (narrow parent, late font, hidden section)
	// needs one more paint once it has real geometry.
	$effect(() => {
		const h = host;
		if (!h) return;
		let lastW = h.clientWidth;
		const ro = new ResizeObserver(() => {
			const w = h.clientWidth;
			if (w > 0 && lastW === 0 && ready) paintAll(seed);
			lastW = w;
		});
		ro.observe(h);
		return () => ro.disconnect();
	});

	// Streaming. Reads fps through a getter so the slider retunes the live loop.
	$effect(() => {
		if (!ready) return;
		return onTick(
			() => fps,
			() => {
				const els = tiles();
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

<div class="spark-grid" bind:this={host} style="--tile-min:{minWidth}px">
	{#each variants as v (v.label)}
		<figure class="tile">
			<magx-sparkline
				style="display:block; width:100%; height:{height}px"
				aria-label={v.label}
			></magx-sparkline>
			{#if captions}
				<figcaption>
					<span>{v.label}</span>
					<InfoTip
						title={v.label}
						body={SHAPE_NOTE[v.shape]}
						rows={factsFor(v)}
						label="About {v.label}"
					/>
				</figcaption>
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
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 4px;
		font-family: var(--font-mono);
		font-size: 0.6rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-text-muted);
		margin-top: 4px;
	}
	/* The caption may be longer than a narrow tile; the glyph must not be pushed off. */
	figcaption span {
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	@media (max-width: 768px) {
		.spark-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
</style>
