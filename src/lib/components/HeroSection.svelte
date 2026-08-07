<script lang="ts">
	/**
	 * The hero used to be two PNGs. It is now a working dashboard: three
	 * draggable panels between them exercising every element the panel system
	 * ships, eight live sparkline canvases inside those panels, and the full
	 * standalone sparkline grid underneath. One reshuffle button and one FPS
	 * control drive all of it. If the components break, the front page breaks —
	 * which is the point.
	 */
	import type { ComponentDef } from '$lib/data/components';
	import DemoControls from './DemoControls.svelte';
	import SparkGrid from './SparkGrid.svelte';
	import { onTick, hexToRgb, cssVar } from '$lib/anim';
	import { walk, spiky, diurnal } from '$lib/interface/generate';
	import { chartSeries } from '$lib/data/palette';

	declare const __BUILD_VERSION__: string;

	interface Props {
		components: ComponentDef[];
	}

	let { components }: Props = $props();

	let fps = $state(0);
	let seed = $state(1);

	/** Panel width in px — every stage in the dashboard row is locked to it. */
	const PANEL_W = 300;

	/**
	 * Every sparkline in the dashboard, described once.
	 *
	 * `shape` picks the generator so the series actually looks like the thing it
	 * claims to be: CPU and market indices breathe on a cycle, network and disk
	 * sit near idle and spike, seismic is a random walk. `step` is the
	 * per-frame volatility used while streaming.
	 */
	interface Spark {
		id: string;
		shape: 'diurnal' | 'spiky' | 'walk';
		series: number;
		min: number;
		max: number;
		step: number;
	}

	const SPARKS: Spark[] = [
		{ id: 'hs-throughput', shape: 'spiky', series: 0, min: 0, max: 100, step: 18 },
		{ id: 'hs-cpu', shape: 'diurnal', series: 1, min: 8, max: 96, step: 7 },
		{ id: 'hs-net', shape: 'spiky', series: 2, min: 0, max: 100, step: 22 },
		{ id: 'hs-gpu', shape: 'diurnal', series: 3, min: 20, max: 99, step: 5 },
		{ id: 'hs-disk', shape: 'spiky', series: 4, min: 0, max: 90, step: 16 },
		{ id: 'hs-markets', shape: 'walk', series: 5, min: 20, max: 95, step: 6 },
		{ id: 'hs-seismic', shape: 'spiky', series: 6, min: 0, max: 100, step: 26 },
		{ id: 'hs-panic', shape: 'walk', series: 7, min: 5, max: 98, step: 9 }
	];

	const POINTS = 48;

	let ready = $state(false);
	let load = $state(48);
	let clock = $state('--:--:--');

	/** Last value of each series, so streaming continues from where paint left off. */
	let cursors: Record<string, number> = {};

	/* -- world domination toolkit state ---------------------------------- */
	const VECTORS = [
		'Seismic — San Andreas',
		'Volcanic — Yellowstone',
		'Cyclone — Bay of Bengal',
		'Solar flare — L1 relay',
		'Market — short the index'
	];
	let vector = $state(VECTORS[0]);
	let severity = $state(40);
	let armed = $state(false);
	let deniability = $state(true);

	const readiness = $derived(
		Math.round(Math.min(100, severity * 0.7 + (armed ? 28 : 0) + (deniability ? 6 : 0)))
	);
	const posture = $derived(
		!armed ? 'STANDBY' : readiness > 85 ? 'GO' : readiness > 55 ? 'SPOOLING' : 'HOLD'
	);

	function seriesFor(s: Spark, seedIn: number): number[] {
		if (s.shape === 'diurnal')
			return diurnal(POINTS, { seed: seedIn, min: s.min, max: s.max, period: 18, noise: 0.22 });
		if (s.shape === 'spiky')
			return spiky(POINTS, { seed: seedIn, base: 6, spike: s.max * 0.85, chance: 0.16 });
		return walk(POINTS, { seed: seedIn, min: s.min, max: s.max });
	}

	function sparkOf(id: string) {
		return (document.getElementById(id) as any)?.getSparkline?.() ?? null;
	}

	function paintSpark(s: Spark, seedIn: number) {
		const sp = sparkOf(s.id);
		if (!sp) return;
		const sw = chartSeries[s.series % chartSeries.length];
		const stroke = hexToRgb(sw.stroke);
		const fill = hexToRgb(sw.fill);
		const bg = hexToRgb(cssVar('--color-bg-alt', '#faf8f3'));
		sp.setBackgroundColor({ ...bg, a: 1 });
		sp.setDataPointNum(POINTS);
		sp.setType('line');
		sp.setLineWidth(1.5);
		sp.setLineColor('solid', { ...stroke, a: 1 });
		sp.setFill('gradient', { above: { ...fill, a: 0.85 }, below: { ...fill, a: 0.05 } });
		// Both take (active, bound) — passing the bound alone silently activates
		// the axis clamp at 0, which collapses the range and blanks the canvas.
		sp.setLowerBound(true, s.min);
		sp.setUpperBound(true, s.max);
		sp.setReferenceLine('average');
		sp.setReferenceLineColor({ r: 150, g: 150, b: 150, a: 0.4 }, 1);
		const data = seriesFor(s, seedIn);
		sp.setData(data);
		sp.renderCanvas();
		cursors[s.id] = data[data.length - 1];
	}

	function paintAll(seedIn: number) {
		SPARKS.forEach((s, i) => {
			try {
				paintSpark(s, seedIn + i * 131);
			} catch (err) {
				console.warn(`[hero] sparkline "${s.id}" failed to paint`, err);
			}
		});
	}

	/**
	 * First paint, and every reshuffle after it.
	 *
	 * Deliberately not `onMount`: the mount body of this component was being
	 * dropped from the production client bundle, which is exactly how the
	 * sparkline grid ended up rendering eight healthy-looking but empty
	 * canvases. An effect survives the build, and reading `seed` gives
	 * reshuffle for free.
	 */
	$effect(() => {
		const s = seed;
		let raf = 0;
		let stop = false;
		const attempt = (tries: number) => {
			if (stop) return;
			const first = document.getElementById(SPARKS[0].id) as any;
			const upgraded = typeof first?.getSparkline === 'function';
			if (upgraded || tries <= 0) {
				ready = true;
				paintAll(s);
				load = 30 + ((s * 37) % 55);
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

	/**
	 * The toolkit's controls are read through the one event the panel system
	 * emits — `magx-panelValueChanged` on `document`, carrying the element id in
	 * `detail.panelElementId`. Panel elements do not fire native `change` or
	 * `input` events, so an inline `onchange=` on the tag would never run.
	 */
	$effect(() => {
		const val = (id: string) => (document.getElementById(id) as any)?.getValue?.();
		const onChange = (e: Event) => {
			const id = (e as CustomEvent).detail?.panelElementId;
			// The dropdown returns `{ index, label }`, not a bare value.
			if (id === 'wd-vector') vector = val(id)?.label ?? vector;
			else if (id === 'wd-severity') severity = Number(val(id) ?? severity);
			else if (id === 'wd-arm') armed = Boolean(val(id));
			else if (id === 'wd-deny') deniability = Boolean(val(id));
		};
		document.addEventListener('magx-panelValueChanged', onChange);
		return () => document.removeEventListener('magx-panelValueChanged', onChange);
	});

	/** The clock element ticks on real wall time, not on the FPS control. */
	$effect(() => {
		const tick = () => {
			const d = new Date();
			const p = (n: number) => String(n).padStart(2, '0');
			clock = `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
			const el = document.getElementById('hs-clock') as any;
			if (el) el.timeValue = clock;
		};
		tick();
		const iv = setInterval(tick, 1000);
		return () => clearInterval(iv);
	});

	$effect(() => {
		if (!ready) return;
		return onTick(
			() => fps,
			() => {
				for (const s of SPARKS) {
					const sp = sparkOf(s.id);
					if (!sp) continue;
					const cur = cursors[s.id] ?? (s.min + s.max) / 2;
					const next = Math.max(
						s.min,
						Math.min(s.max, cur + (Math.random() - 0.5) * 2 * s.step)
					);
					cursors[s.id] = next;
					sp.addDatapoint(next);
					sp.renderCanvas();
				}
				// The progress bar is a plain reactive prop — Lit picks the change up.
				load = Math.round(cursors['hs-cpu'] ?? load);
			}
		);
	});
</script>

<section class="hero">
	<h1 class="hero-title"><i class="fas fa-cubes"></i> Interface Components</h1>
	<p class="hero-subtitle">
		A collection of draggable panel UI components and sparkline charts built as Lit web components.
		Based on the <a href="https://github.com/mlalma/magx/tree/main" target="_blank" rel="noopener"
			>magx</a
		> project by <a href="https://github.com/mlalma" target="_blank" rel="noopener">mlalma</a> —
		I liked the components enough to build them into a library I could use for my own webapps.
		Everything below this line is live: the panels are draggable, the canvases are real, and the
		controls regenerate and animate the synthetic data in place.
		<span class="build-version">{__BUILD_VERSION__}</span>
	</p>

	<div class="hero-stats">
		<div class="stat">
			<i class="fas fa-box-open"></i>
			<span>{components.length} Components</span>
		</div>
		<div class="stat">
			<i class="fas fa-code"></i>
			<span>TypeScript</span>
		</div>
		<div class="stat">
			<i class="fas fa-feather"></i>
			<span>Lightweight</span>
		</div>
		<div class="stat">
			<i class="fas fa-puzzle-piece"></i>
			<span>Web Components</span>
		</div>
	</div>

	<DemoControls
		bind:fps
		onreshuffle={() => (seed = Math.floor(Math.random() * 100000))}
		note="Reshuffle redraws every canvas from a new seed · FPS streams new points into all eight panel sparklines at once"
	/>

	<div class="hero-dash" style="--panel-w:{PANEL_W}px">
		<!-- Column 1 — one panel using every element the system ships. -->
		<div class="dash-col">
			<div class="panel-stage tall">
				<magx-panel title="Live Panel" x="0" y="0" style="--magx-panel-panel-width:{PANEL_W}px">
					<magx-panel-sparkline id="hs-throughput" title="Throughput — packets/s"
					></magx-panel-sparkline>
					<magx-panel-progressbar title="Load" currentValue={load} maxValue="100"
					></magx-panel-progressbar>
					<magx-panel-range title="Sample Rate" min="1" max="60" value="12"></magx-panel-range>
					<magx-panel-toggle title="Stream" labelOn="LIVE" labelOff="IDLE" checked
					></magx-panel-toggle>
					<magx-panel-checkbox title="Verbose log" checked></magx-panel-checkbox>
					<magx-panel-dropdown title="Source" index="0">
						<option label="node-eleven">node-eleven</option>
						<option label="spark-1">spark-1</option>
						<option label="seaweed">seaweed</option>
					</magx-panel-dropdown>
					<magx-panel-textinput title="Endpoint" value="node-eleven.lan:2292"
					></magx-panel-textinput>
					<magx-panel-textarea title="Notes" rows="2" value="ingest steady since restart"
					></magx-panel-textarea>
					<magx-panel-date title="Since"></magx-panel-date>
					<magx-panel-time id="hs-clock" title="Clock"></magx-panel-time>
					<magx-panel-colorpicker title="Series" value="#3792A4"></magx-panel-colorpicker>
					<magx-panel-filechooser title="Import" placeholder="capture.ndjson"
					></magx-panel-filechooser>
					<magx-panel-image title="Plate" src="/screenshots/trainer-hero.jpg"
					></magx-panel-image>
					<magx-panel-html title="Status">
						<span class="pill">{posture}</span> · {clock}
					</magx-panel-html>
					<magx-panel-button title="Capture" readout secondary="Reset"></magx-panel-button>
				</magx-panel>
			</div>
			<p class="col-note">
				Every element in the library, in one panel: sparkline, progress bar, range, toggle,
				checkbox, dropdown, text input, text area, date, <strong>clock</strong>, colour picker,
				file chooser, image, arbitrary HTML and button. The clock ticks on wall time; the
				throughput chart is a simulated network trace — mostly idle with bursts.
			</p>
		</div>

		<!-- Column 2 — telemetry, all sparkline. -->
		<div class="dash-col">
			<div class="panel-stage mid">
				<magx-panel
					title="Cluster Telemetry"
					x="0"
					y="0"
					style="--magx-panel-panel-width:{PANEL_W}px"
				>
					<magx-panel-sparkline id="hs-cpu" title="CPU — %"></magx-panel-sparkline>
					<magx-panel-sparkline id="hs-net" title="Network — Mb/s"></magx-panel-sparkline>
					<magx-panel-sparkline id="hs-gpu" title="GPU SM — %"></magx-panel-sparkline>
					<magx-panel-sparkline id="hs-disk" title="Disk IO — MB/s"></magx-panel-sparkline>
					<magx-panel-progressbar title="VRAM" currentValue="71" maxValue="100" type="percent"
					></magx-panel-progressbar>
					<magx-panel-dropdown title="Node" index="0">
						<option label="spark-1">spark-1</option>
						<option label="spark-2">spark-2</option>
						<option label="node-eighteen">node-eighteen</option>
					</magx-panel-dropdown>
					<magx-panel-toggle title="Autoscale" labelOn="AUTO" labelOff="PINNED" checked
					></magx-panel-toggle>
				</magx-panel>
			</div>
			<figure class="plate">
				<img
					src="/screenshots/trainer-hero.jpg"
					alt="Pencil drawing of a time-trial bike on an indoor trainer"
					width="300"
					height="300"
					loading="lazy"
				/>
				<figcaption>
					Same box as the panel — drawn for
					<a
						href="https://heart-rate-broadcaster.atsignhandle.workers.dev/about"
						target="_blank"
						rel="noopener">heart-rate-broadcaster</a
					>
				</figcaption>
			</figure>
		</div>

		<!-- Column 3 — the toolkit no responsible person should ship. -->
		<div class="dash-col">
			<div class="panel-stage mid">
				<magx-panel
					title="World Domination Toolkit"
					x="0"
					y="0"
					style="--magx-panel-panel-width:{PANEL_W}px"
				>
					<magx-panel-html title="Posture">
						<span class="pill" class:armed>{posture}</span>
						<span class="tgt">{vector}</span>
					</magx-panel-html>
					<magx-panel-sparkline id="hs-markets" title="Global index"></magx-panel-sparkline>
					<magx-panel-sparkline id="hs-seismic" title="Seismic — Richter"
					></magx-panel-sparkline>
					<magx-panel-sparkline id="hs-panic" title="Panic index"></magx-panel-sparkline>
					<magx-panel-dropdown id="wd-vector" title="Vector" index="0">
						{#each VECTORS as v}
							<option label={v}>{v}</option>
						{/each}
					</magx-panel-dropdown>
					<magx-panel-range id="wd-severity" title="Severity" min="0" max="100" value="40"
					></magx-panel-range>
					<magx-panel-progressbar
						title="Readiness"
						currentValue={readiness}
						maxValue="100"
						type="percent"
					></magx-panel-progressbar>
					<magx-panel-toggle id="wd-arm" title="Arm" labelOn="ARMED" labelOff="SAFE"
					></magx-panel-toggle>
					<magx-panel-checkbox id="wd-deny" title="Plausible deniability" checked
					></magx-panel-checkbox>
					<magx-panel-button title="Execute" mode="countdown" seconds="5" secondary="Abort"
					></magx-panel-button>
				</magx-panel>
			</div>
			<p class="col-note">
				The same elements, arranged as a fictional control console — because a component library
				is only worth anything if it survives being pointed at an absurd problem. Readiness is
				derived from the severity range, the arm toggle and the deniability checkbox; the posture
				word above is derived from readiness. Nothing here reaches anything. Probably.
			</p>
		</div>
	</div>

	<div class="hero-spark">
		<SparkGrid {fps} {seed} height={72} minWidth={150} />
		<p class="hero-spark-note">
			Every rendering variant of the standalone <code>&lt;magx-sparkline&gt;</code> element — line and
			bar, gradient, solid and split fills, above/below stroke colouring, first/last difference,
			endpoint dots, fixed and capped axes, and middle/average/median/first-point/custom reference
			lines. Same set as
			<a href="/#sparkline-animated">Sparkline (Animated)</a>. Colours come from the eight-pastel
			chart series, so they track the site accent and the light/dark theme.
		</p>
	</div>
</section>

<style>
	.hero {
		margin-bottom: var(--spacing-xl);
		padding-bottom: var(--spacing-xl);
		border-bottom: 2px solid var(--color-border);
	}
	.hero-title {
		font-size: 1.5rem;
		font-weight: 700;
		letter-spacing: 0.04em;
		margin-bottom: var(--spacing-sm);
	}
	.hero-title i {
		color: var(--color-accent);
	}
	.hero-subtitle {
		font-size: 0.9rem;
		color: var(--color-text-muted);
		line-height: 1.6;
		margin-bottom: var(--spacing-lg);
	}
	.hero-subtitle a {
		color: var(--color-link);
	}
	.build-version {
		font-size: 0.65rem;
		color: var(--color-text-muted);
		font-family: var(--font-mono);
		letter-spacing: 0.02em;
		opacity: 0.6;
	}
	.hero-stats {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-md);
		margin-bottom: var(--spacing-lg);
	}
	.stat {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
		font-size: 0.8rem;
		font-weight: 600;
		padding: var(--spacing-xs) var(--spacing-sm);
		border: 1px solid var(--color-border);
		background: var(--color-bg-alt);
		box-shadow: 2px 2px 0 var(--color-shadow);
	}
	.stat i {
		color: var(--color-accent);
		font-size: 0.85rem;
	}

	/*
	 * Three panel stages side by side. `auto-fit` rather than a fixed three-up
	 * so the row degrades to two and then one column without a media query —
	 * the panels are a fixed 300px and must never be squeezed.
	 */
	.hero-dash {
		display: grid;
		grid-template-columns: repeat(auto-fit, var(--panel-w));
		justify-content: start;
		gap: var(--spacing-lg);
		align-items: start;
		margin-bottom: var(--spacing-lg);
	}
	.dash-col {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
		width: var(--panel-w);
	}
	/* The panel positions itself absolutely, so it needs a sized stage to sit in. */
	.panel-stage {
		position: relative;
		width: var(--panel-w);
	}
	.panel-stage.tall {
		min-height: 1180px;
	}
	.panel-stage.mid {
		min-height: 640px;
	}
	.col-note {
		font-size: 0.75rem;
		line-height: 1.55;
		color: var(--color-text-muted);
	}
	.plate {
		border: 1px solid var(--color-border);
		background: var(--color-bg-alt);
		padding: 6px;
	}
	.plate img {
		display: block;
		width: 100%;
		height: auto;
		filter: grayscale(1);
	}
	.plate figcaption {
		font-family: var(--font-mono);
		font-size: 0.6rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-text-muted);
		margin-top: 4px;
		line-height: 1.4;
	}
	.plate figcaption a {
		color: var(--color-link);
	}

	/* Light-DOM children of magx-panel-html — not scoped away by Svelte. */
	:global(.hero-dash .pill) {
		font-family: var(--font-mono);
		font-size: 0.6rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		padding: 2px 6px;
		border: 1px solid var(--color-border);
		background: var(--color-bg-alt);
	}
	:global(.hero-dash .pill.armed) {
		background: var(--color-accent);
		color: #fff;
	}
	:global(.hero-dash .tgt) {
		font-size: 0.65rem;
		color: var(--color-text-muted);
	}

	.hero-spark {
		min-width: 0;
	}
	.hero-spark-note {
		font-size: 0.8rem;
		color: var(--color-text-muted);
		line-height: 1.6;
		margin-top: var(--spacing-sm);
	}
	.hero-spark-note a {
		color: var(--color-link);
	}
	.hero-spark-note code {
		font-family: var(--font-mono);
		font-size: 0.75rem;
	}

	@media (max-width: 768px) {
		.hero-dash {
			grid-template-columns: minmax(0, 1fr);
		}
		.dash-col {
			width: 100%;
		}
		.panel-stage {
			width: 100%;
			overflow: hidden;
		}
	}
</style>
