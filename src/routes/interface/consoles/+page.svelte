<script lang="ts">
	/**
	 * Panel consoles — the same three Interface subjects (charting, layout & data,
	 * documents) rebuilt entirely out of magx Panel elements instead of bespoke
	 * markup.
	 *
	 * The point is not that panels are a better way to draw a dashboard. It is
	 * that a draggable panel surface is a *different kind* of interface: an
	 * operator console, where the controls and the readouts sit in the same
	 * movable containers and the user arranges them. A GPU control panel and a
	 * document-processing rig are the two clearest cases, so those are the two
	 * built here, plus a cluster-ops surface for the tabular half.
	 *
	 * Everything is wired through the one documented integration point: a single
	 * `magx-panelValueChanged` listener on `document`, keyed by element id.
	 */
	import { onTick, hexToRgb, cssVar } from '$lib/anim';
	import { walk, RESERVOIR, windowOf, driftOne, fmtBytes, fmtCompact } from '$lib/interface/generate';
	import DemoControls from '$lib/components/DemoControls.svelte';
	import { fitStage } from '$lib/interface/fitStage';

	const PANEL_W = 288;

	let seed = $state(11);
	let fps = $state(0);
	let frame = $state(0);
	let ready = $state(false);

	$effect(() => onTick(() => fps, () => (frame += 1)));

	/* ---------- 01 GPU control ------------------------------------------- */
	const DEVICES = ['GPU 0 · A100 80GB', 'GPU 1 · A100 80GB', 'GPU 2 · L40S 48GB', 'GPU 3 · L40S 48GB'];
	let device = $state(0);
	let powerLimit = $state(300);
	let fanPct = $state(62);
	let persistence = $state(true);
	let lastAction = $state('idle');

	const utilRes = $derived(
		walk(56 + RESERVOIR, { seed: seed + device * 7, min: 14, max: 99, start: 70, step: 11 })
	);
	const util = $derived(windowOf(utilRes, 56, frame));
	const utilNow = $derived(Math.round(util[util.length - 1] ?? 70));
	const memPct = $derived(Math.round(driftOne(74, frame, device, 0.09)));
	const powerNow = $derived(Math.round(powerLimit * (0.55 + (utilNow / 100) * 0.42)));
	const tempC = $derived(Math.round(38 + utilNow * 0.34 + (100 - fanPct) * 0.11));

	/* ---------- 02 Cluster ops ------------------------------------------- */
	const REGIONS = ['all regions', 'us-west', 'us-east', 'eu-central'];
	let region = $state(0);
	let degradedOnly = $state(false);
	let query = $state('');

	interface Node {
		host: string;
		region: string;
		load: number;
		disk: number;
		rtt: number;
		state: 'ok' | 'degraded';
	}

	const NODE_SEEDS: Omit<Node, 'load' | 'disk' | 'rtt' | 'state'>[] = [
		{ host: 'spark-1', region: 'us-west' },
		{ host: 'spark-2', region: 'us-west' },
		{ host: 'node-eleven', region: 'us-east' },
		{ host: 'node-eighteen', region: 'us-east' },
		{ host: 'unraid-one', region: 'eu-central' },
		{ host: 'seaweed-a', region: 'eu-central' }
	];

	const nodes: Node[] = $derived(
		NODE_SEEDS.map((n, i) => {
			const load = Math.max(2, Math.min(99, driftOne(34 + ((seed * (i + 3)) % 55), frame, i, 0.22)));
			return {
				...n,
				load,
				disk: Math.max(4, Math.min(99, driftOne(48 + ((seed * (i + 7)) % 42), frame, i + 2, 0.07))),
				rtt: Math.max(0.4, driftOne(1.2 + ((seed * (i + 2)) % 9) / 4, frame, i + 5, 0.3)),
				state: load > 82 ? 'degraded' : 'ok'
			};
		})
	);

	const visibleNodes = $derived(
		nodes
			.filter((n) => region === 0 || n.region === REGIONS[region])
			.filter((n) => !degradedOnly || n.state === 'degraded')
			.filter((n) => !query || n.host.includes(query.toLowerCase()))
	);

	const ingestRes = $derived(walk(48 + RESERVOIR, { seed: seed + 3, min: 120, max: 980, start: 420, step: 90 }));
	const ingest = $derived(windowOf(ingestRes, 48, frame));
	const ingestNow = $derived(Math.round(ingest[ingest.length - 1] ?? 420));

	/* ---------- 03 Document processing ------------------------------------ */
	const ENGINES = ['glm-ocr · 0.9B', 'tesseract · 5.3', 'paddle · v4', 'passthrough'];
	let engine = $state(0);
	let doOcr = $state(true);
	let stage = $state(0);
	let running = $state(false);

	const QUEUE = [
		{ name: '20260709-doj-letter.pdf', pages: 14, src: 'fs' },
		{ name: 'sec-10k-2025.pdf', pages: 212, src: 'db' },
		{ name: 'exhibit-c-scan.tif', pages: 6, src: 'fs' },
		{ name: 'transcript-0418.docx', pages: 38, src: 'db' }
	];

	const docs = $derived(
		QUEUE.map((d, i) => ({
			...d,
			bytes: d.pages * Math.round(driftOne(48_000, frame, i, 0.12)),
			conf: Math.max(52, Math.min(99.4, driftOne(doOcr ? 94 : 71, frame, i + 3, 0.05)))
		}))
	);

	const stageProgress = $derived([
		{ label: 'Fetch', pct: Math.min(100, stage * 34) },
		{ label: doOcr ? 'OCR' : 'Text layer', pct: Math.min(100, Math.max(0, (stage - 1) * 34)) },
		{ label: 'Extract', pct: Math.min(100, Math.max(0, (stage - 2) * 34)) },
		{ label: 'Index', pct: Math.min(100, Math.max(0, (stage - 3) * 50)) }
	]);

	const extracted = $derived(
		`ENGINE ${ENGINES[engine]}\nMODE   ${doOcr ? 'raster → text' : 'embedded text layer'}\n` +
			`PAGES  ${docs[0].pages}   BYTES ${fmtBytes(docs[0].bytes)}\n` +
			`CONF   ${docs[0].conf.toFixed(1)}%\n\n` +
			'IN THE UNITED STATES DISTRICT COURT\nFOR THE EASTERN DISTRICT OF NEW YORK\n\n' +
			'  Plaintiff having moved for an order compelling\n  production of the documents identified in\n' +
			'  Exhibit C, and the Court having considered the\n  submissions of the parties …'
	);

	/* ---------- sparkline plumbing ---------------------------------------- */
	let gpuSpark: HTMLElement | null = $state(null);
	let tempSpark: HTMLElement | null = $state(null);
	let ingestSpark: HTMLElement | null = $state(null);
	let loadSpark: HTMLElement | null = $state(null);
	let confSpark: HTMLElement | null = $state(null);
	let pagesSpark: HTMLElement | null = $state(null);
	let powerSpark: HTMLElement | null = $state(null);
	let cadenceSpark: HTMLElement | null = $state(null);
	let matchSpark: HTMLElement | null = $state(null);
	let rttSpark: HTMLElement | null = $state(null);
	let latencySpark: HTMLElement | null = $state(null);
	let charsSpark: HTMLElement | null = $state(null);

	/*
	 * Every readout on this page that is a rate or a trend gets a chart, not just
	 * a number. Four of these are derived from the same reservoirs the numeric
	 * readouts use, so the chart and the figure beside it can never disagree.
	 */
	const tempRes = $derived(
		walk(56 + RESERVOIR, { seed: seed + 41 + device, min: 34, max: 88, start: 58, step: 5 })
	);
	const temps = $derived(windowOf(tempRes, 56, frame));

	const loadRes = $derived(
		walk(48 + RESERVOIR, { seed: seed + 19, min: 8, max: 98, start: 44, step: 9 })
	);
	const fleetLoad = $derived(windowOf(loadRes, 48, frame));

	/**
	 * Confidence over the last 40 pages rather than one point per queued file —
	 * four datapoints is a line segment, not a chart, and OCR confidence is
	 * genuinely a per-page measure. The band shifts when the OCR toggle does.
	 */
	const confRes = $derived(
		walk(40 + RESERVOIR, {
			seed: seed + (doOcr ? 5 : 61),
			min: doOcr ? 78 : 48,
			max: doOcr ? 99 : 86,
			start: doOcr ? 94 : 71,
			step: 4
		})
	);
	const confTrend = $derived(windowOf(confRes, 40, frame));

	const pagesRes = $derived(
		walk(40 + RESERVOIR, { seed: seed + 77, min: 4, max: 120, start: 46, step: 16 })
	);
	const pageRate = $derived(windowOf(pagesRes, 40, frame));

	/*
	 * A control panel with no chart in it asks the operator to trust a number.
	 * Every panel on this page now carries its own trace, so each one can be read
	 * on its own once it has been dragged away from the others — which is the
	 * whole premise of a surface you are allowed to rearrange.
	 */

	/** Draw follows the limit, so lowering the slider visibly clips the trace. */
	const powerRes = $derived(
		walk(48 + RESERVOIR, { seed: seed + 23 + device, min: 40, max: 100, start: 72, step: 7 })
	);
	const powerTrend = $derived(windowOf(powerRes, 48, frame).map((p) => (p / 100) * powerLimit));

	/**
	 * Sampling jitter. At rest this shows the cadence the sampler will produce
	 * once started, at full scale, rather than a flat zero — a chart that is
	 * empty on arrival reads as broken, and the Rate readout beside it already
	 * says whether sampling is actually running. Above zero it scales with fps,
	 * so moving the slider visibly compresses the trace.
	 */
	const cadenceRes = $derived(
		walk(40 + RESERVOIR, { seed: seed + 91, min: 6, max: 34, start: 18, step: 5 })
	);
	const cadence = $derived(
		windowOf(cadenceRes, 40, frame).map((c) => (fps === 0 ? c : c * (fps / 30)))
	);

	/** How many nodes the current filter admits, over time. */
	const matchRes = $derived(
		walk(40 + RESERVOIR, { seed: seed + 13, min: 0, max: 6, start: 6, step: 2 })
	);
	const matchTrend = $derived(
		windowOf(matchRes, 40, frame).map((m) => Math.min(m, visibleNodes.length || 0.001))
	);

	const rttRes = $derived(
		walk(48 + RESERVOIR, { seed: seed + 57, min: 0.4, max: 9, start: 2.4, step: 1.1 })
	);
	const rttTrend = $derived(windowOf(rttRes, 48, frame));

	/** Stage latency climbs while the pipeline is actually running. */
	const latencyRes = $derived(
		walk(40 + RESERVOIR, { seed: seed + 33 + engine, min: 40, max: 900, start: 180, step: 120 })
	);
	const latency = $derived(
		windowOf(latencyRes, 40, frame).map((l) => l * (running ? 1.8 : 1) * (doOcr ? 1 : 0.4))
	);

	const charsRes = $derived(
		walk(40 + RESERVOIR, { seed: seed + 67, min: 200, max: 4200, start: 1800, step: 600 })
	);
	const chars = $derived(windowOf(charsRes, 40, frame));

	function paint(el: HTMLElement | null, data: number[], token: string) {
		const sp = (el as any)?.getSparkline?.();
		if (!sp) return;

		// A NaN reaching the canvas becomes a non-finite gradient stop, which
		// throws — so drop them here rather than letting one bad sample through.
		const clean = data.filter((n) => Number.isFinite(n));
		if (!clean.length) return;

		const lo = Math.min(...clean);
		const hi = Math.max(...clean);
		/*
		 * A series with no spread — a paused sampler reading a flat zero — gives
		 * the gradient a zero-height box to place its stops in, and the resulting
		 * division throws. A flat line is a legitimate reading, so render it with
		 * a solid fill instead of suppressing the chart.
		 */
		const flat = !(hi > lo);

		const c = hexToRgb(cssVar(token, '#3792a4'));
		const bg = hexToRgb(cssVar('--color-bg-alt', '#faf8f3'));
		sp.setBackgroundColor({ ...bg, a: 1 });
		sp.setDataPointNum(clean.length);
		sp.setType('line');
		sp.setLineWidth(1.5);
		sp.setLineColor('solid', { ...c, a: 1 });
		if (flat) sp.setFill('solid', { ...c, a: 0.16 });
		else sp.setFill('gradient', { above: { ...c, a: 0.38 }, below: { ...c, a: 0.03 } });
		sp.setReferenceLine('average');
		sp.setReferenceLineColor({ r: 150, g: 150, b: 150, a: 0.4 }, 1);
		sp.setData(clean);
		sp.renderCanvas();
	}

	/**
	 * One chart failing must not blank the ones after it. These all run in a
	 * single effect, so an exception thrown partway through used to abandon every
	 * remaining paint — which is exactly how four healthy charts on this page
	 * ended up empty because a fifth had a flat series.
	 */
	function paintSafe(el: HTMLElement | null, data: number[], token: string) {
		try {
			paint(el, data, token);
		} catch (err) {
			console.error('sparkline paint failed', token, err);
		}
	}

	/**
	 * Wait for the Lit elements to upgrade, then let the paint effect run.
	 *
	 * Deliberately not `onMount` — that body was being dropped from the
	 * production client bundle, so `ready` never flipped and every sparkline on
	 * this page stayed an empty canvas in the deployed build while working
	 * perfectly in dev. Poll for the upgrade instead of guessing a delay.
	 */
	$effect(() => {
		let raf = 0;
		let stop = false;
		const attempt = (tries: number) => {
			if (stop) return;
			if (typeof (gpuSpark as any)?.getSparkline === 'function' || tries <= 0) {
				ready = true;
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

	/* Size each console to its panels once they have upgraded and laid out. */
	$effect(() => {
		if (!ready) return;
		const stops = [...document.querySelectorAll<HTMLElement>('.pc-canvas')].map((s) => fitStage(s));
		return () => stops.forEach((f) => f());
	});

	/**
	 * Keep the in-panel Animate slider showing the page rate. Section 01 makes the
	 * point that the panel element and the strip above are the same control, which
	 * only reads as true if moving one moves the other.
	 */
	$effect(() => {
		const rate = fps;
		if (!ready) return;
		(document.getElementById('pc-fps') as any)?.setValue?.(rate);
	});

	$effect(() => {
		if (!ready) return;
		paintSafe(gpuSpark, util, '--stroke-aqua');
		paintSafe(tempSpark, temps, '--stroke-peach');
		paintSafe(ingestSpark, ingest, '--stroke-mint');
		paintSafe(loadSpark, fleetLoad, '--stroke-vanilla');
		paintSafe(confSpark, confTrend, '--stroke-rose');
		paintSafe(pagesSpark, pageRate, '--stroke-violet');
		paintSafe(powerSpark, powerTrend, '--stroke-amber');
		paintSafe(cadenceSpark, cadence, '--stroke-teal');
		paintSafe(matchSpark, matchTrend, '--stroke-lilac');
		paintSafe(rttSpark, rttTrend, '--stroke-coral');
		paintSafe(latencySpark, latency, '--stroke-indigo');
		paintSafe(charsSpark, chars, '--stroke-green');
	});

	/**
	 * The entire integration surface: one listener, keyed by element id. Every
	 * control on this page — three consoles' worth — routes through here.
	 */
	$effect(() => {
		const onChange = (e: Event) => {
			const id = (e as CustomEvent).detail?.panelElementId as string | undefined;
			if (!id) return;
			const el = document.getElementById(id) as any;
			const v = el?.getValue?.();
			if (v === undefined || v === null) return;

			switch (id) {
				case 'pc-device':
					device = v.index ?? 0;
					break;
				case 'pc-power':
					powerLimit = Math.round(v);
					break;
				case 'pc-fan':
					fanPct = Math.round(v);
					break;
				case 'pc-persist':
					persistence = !!v;
					break;
				case 'pc-apply':
					// A countdown button reports ticks remaining, not an action name:
					// non-zero means still arming, zero means it elapsed and committed.
					lastAction =
						Number(v) > 0
							? `arming… ${v}s`
							: `applied ${powerLimit}W / fan ${fanPct}% to ${DEVICES[device]}`;
					break;
				case 'pc-reset':
					powerLimit = 300;
					fanPct = 62;
					// The sliders are the source of truth for their own thumbs, so the
					// reset has to be pushed back into them, not just into local state.
					(document.getElementById('pc-power') as any)?.setValue?.(300);
					(document.getElementById('pc-fan') as any)?.setValue?.(62);
					lastAction = 'reset to defaults';
					break;
				case 'pc-reshuffle':
					seed = (seed * 31 + 17) % 99991;
					break;
				case 'pc-fps':
					fps = Math.round(v);
					break;
				case 'pc-region':
					region = v.index ?? 0;
					break;
				case 'pc-degraded':
					degradedOnly = !!v;
					break;
				case 'pc-query':
					query = String(v).trim().toLowerCase();
					break;
				case 'pc-engine':
					engine = v.index ?? 0;
					break;
				case 'pc-ocr':
					doOcr = !!v;
					break;
				case 'pc-run':
					runPipeline();
					break;
			}
		};
		document.addEventListener('magx-panelValueChanged', onChange);
		return () => document.removeEventListener('magx-panelValueChanged', onChange);
	});

	let pipeTimer: ReturnType<typeof setInterval> | null = null;
	function runPipeline() {
		if (pipeTimer) clearInterval(pipeTimer);
		running = true;
		stage = 0;
		pipeTimer = setInterval(() => {
			stage += 1;
			if (stage >= 5) {
				if (pipeTimer) clearInterval(pipeTimer);
				pipeTimer = null;
				running = false;
			}
		}, 420);
	}
</script>

<svelte:head>
	<title>Panel Consoles — Interface Components</title>
</svelte:head>

<div class="ifc">
	<header class="ifc-page-head">
		<div class="ifc-eyebrow">Interface · 06</div>
		<h1 class="ifc-page-title">Panel Consoles</h1>
		<p class="ifc-page-lede">
			The same three subjects as the rest of this section — charting, layout &amp; data, documents —
			rebuilt out of <code>magx-panel</code> elements rather than bespoke markup. Not because panels
			draw a better dashboard, but because a draggable panel surface is a different
			<em>kind</em> of interface: an operator console, where the controls and the readouts live in the
			same movable containers and the operator decides the arrangement.
		</p>
		<p class="ifc-page-lede" style="margin-top:var(--spacing-sm)">
			Every control below routes through the single documented integration point — one
			<code>magx-panelValueChanged</code> listener on <code>document</code>, switched on element id.
			Three consoles, one handler, no per-element subscription API. Drag any title bar to rearrange;
			double-click it to collapse. The data is synthetic and regenerates from the Reshuffle button in
			the GPU console.
		</p>
	</header>

	<!--
		One rate for the whole page. Every series on all three consoles is derived
		from `frame`, so this single strip animates all six charts at once — the
		in-panel Animate slider in the GPU console writes the same state, which is
		the comparison that section is making.
	-->
	<div class="pc-anim">
		<DemoControls
			bind:fps
			max={30}
			onreshuffle={() => (seed = (seed * 31 + 17) % 99991)}
			note="drives all six charts on this page"
		/>
		<p class="pc-anim-note">
			Animation is off until you press play, because a console that moves while you are reading it is
			harder to read. Every chart below shares this one clock: the sparklines slide, the readouts
			drift, and the fleet table re-sorts, all from the same <code>frame</code> counter. Reshuffle
			reseeds the generators instead of advancing them, so you get a different plausible situation
			rather than the next second of this one.
		</p>
	</div>

	<!-- 01 GPU control ------------------------------------------------- -->
	<div class="ifc-sec">
		<span class="ifc-sec-tag">01</span>
		<span class="ifc-sec-title">GPU control console</span>
		<span class="ifc-sec-hint">charting, as an operator surface</span>
	</div>
	<p class="ifc-sec-note">
		Telemetry on the left, actuators on the right — the arrangement every device console converges
		on, because a control you cannot see the effect of is a control you do not trust. Power limit and
		fan speed feed the temperature model directly, so moving a slider moves the readout. Apply is a
		<code>countdown</code>-mode button — it arms for three seconds and commits when it elapses, which
		is the cheapest way to make an expensive command cost more than a stray click. Reset is a plain
		momentary button and pushes its defaults back into the sliders rather than only into state.
	</p>
	<div class="pc-stage">
		<div class="pc-canvas" style="--w:{PANEL_W}px">
			<magx-panel title="Telemetry" x="0" y="0" style="--magx-panel-panel-width:{PANEL_W}px">
				<magx-panel-html title={DEVICES[device]}>
					<div class="pc-kv">
						<span>utilisation</span><b>{utilNow}%</b>
						<span>temperature</span><b>{tempC} °C</b>
						<span>power draw</span><b>{powerNow} W</b>
						<span>persistence</span><b>{persistence ? 'on' : 'off'}</b>
					</div>
				</magx-panel-html>
				<magx-panel-sparkline bind:this={gpuSpark} title="SM Utilisation — %"
				></magx-panel-sparkline>
				<magx-panel-sparkline bind:this={tempSpark} title="Temperature — °C"
				></magx-panel-sparkline>
				<magx-panel-progressbar title="Memory" currentValue={memPct} maxValue="100"
				></magx-panel-progressbar>
				<magx-panel-progressbar
					title="Power envelope"
					currentValue={powerNow}
					maxValue={powerLimit}
				></magx-panel-progressbar>
			</magx-panel>

			<magx-panel title="Controls" x="304" y="0" style="--magx-panel-panel-width:{PANEL_W}px">
				<magx-panel-dropdown id="pc-device" title="Device" index="0">
					{#each DEVICES as d (d)}<option>{d}</option>{/each}
				</magx-panel-dropdown>
				<magx-panel-range id="pc-power" title="Power limit (W)" min="150" max="400" step="5" value="300"
				></magx-panel-range>
				<magx-panel-range id="pc-fan" title="Fan (%)" min="20" max="100" step="1" value="62"
				></magx-panel-range>
				<magx-panel-toggle
					id="pc-persist"
					title="Persistence mode"
					labelOn="ON"
					labelOff="OFF"
					checked
				></magx-panel-toggle>
				<magx-panel-button id="pc-apply" title="Apply" mode="countdown" seconds="3" readout
				></magx-panel-button>
				<magx-panel-button id="pc-reset" title="Reset to defaults" mode="momentary"
				></magx-panel-button>
				<magx-panel-sparkline bind:this={powerSpark} title="Power draw — W"
				></magx-panel-sparkline>
				<magx-panel-html title="Last action">
					<div class="pc-log">{lastAction}</div>
				</magx-panel-html>
			</magx-panel>

			<magx-panel title="Stream" x="608" y="0" style="--magx-panel-panel-width:{PANEL_W}px">
				<magx-panel-range id="pc-fps" title="Animate (fps)" min="0" max="30" step="1" value="0"
				></magx-panel-range>
				<magx-panel-html title="Rate">
					<div class="pc-log">{fps === 0 ? 'static — sampling paused' : `${fps} fps · frame ${frame}`}</div>
				</magx-panel-html>
				<magx-panel-sparkline bind:this={cadenceSpark} title="Sample cadence — Hz"
				></magx-panel-sparkline>
				<magx-panel-button id="pc-reshuffle" title="Reshuffle data" mode="momentary"
				></magx-panel-button>
				<magx-panel-html title="Note">
					<p class="pc-note">
						The FPS range and the Reshuffle button are the same two controls the rest of the
						Interface section carries in its own strip — here they are panel elements instead,
						which is the whole comparison.
					</p>
				</magx-panel-html>
			</magx-panel>
		</div>
	</div>

	<!-- 02 Cluster ops --------------------------------------------------- -->
	<div class="ifc-sec">
		<span class="ifc-sec-tag">02</span>
		<span class="ifc-sec-title">Cluster operations console</span>
		<span class="ifc-sec-hint">layout &amp; data, as an operator surface</span>
	</div>
	<p class="ifc-sec-note">
		A table inside a panel is the case where this composition strains: panels are narrow by design,
		and a table wants width. The honest answer is to make the rows narrow too — host, one bar, one
		state chip — and put the filters in their own panel rather than as a toolbar above the data. What
		is gained is that the filter panel can be dragged away entirely once it has been set.
	</p>
	<div class="pc-stage">
		<div class="pc-canvas" style="--w:{PANEL_W}px">
			<magx-panel title="Filters" x="0" y="0" style="--magx-panel-panel-width:{PANEL_W}px">
				<magx-panel-dropdown id="pc-region" title="Region" index="0">
					{#each REGIONS as r (r)}<option>{r}</option>{/each}
				</magx-panel-dropdown>
				<magx-panel-textinput id="pc-query" title="Host contains" placeholder="spark, node…"
				></magx-panel-textinput>
				<magx-panel-checkbox id="pc-degraded" title="Degraded only"></magx-panel-checkbox>
				<magx-panel-html title="Result">
					<div class="pc-log">{visibleNodes.length} of {nodes.length} nodes</div>
				</magx-panel-html>
				<magx-panel-sparkline bind:this={matchSpark} title="Matched nodes"
				></magx-panel-sparkline>
			</magx-panel>

			<magx-panel title="Nodes" x="304" y="0" style="--magx-panel-panel-width:{PANEL_W}px">
				<magx-panel-html title="Fleet">
					{#if visibleNodes.length === 0}
						<div class="pc-empty">No node matches those filters.</div>
					{:else}
						<div class="pc-rows">
							{#each visibleNodes as n (n.host)}
								<div class="pc-row">
									<span class="pc-host">{n.host}</span>
									<span class="pc-chip" class:is-bad={n.state === 'degraded'}>{n.state}</span>
									<div class="pc-meter"><i style="width:{n.load.toFixed(1)}%"></i></div>
									<span class="pc-num">{n.load.toFixed(0)}%</span>
								</div>
							{/each}
						</div>
					{/if}
				</magx-panel-html>
				<magx-panel-sparkline bind:this={rttSpark} title="p95 RTT — ms"
				></magx-panel-sparkline>
			</magx-panel>

			<magx-panel title="Throughput" x="608" y="0" style="--magx-panel-panel-width:{PANEL_W}px">
				<magx-panel-sparkline bind:this={ingestSpark} title="Ingest — docs/min"
					></magx-panel-sparkline>
				<magx-panel-sparkline bind:this={loadSpark} title="Fleet load — %"
				></magx-panel-sparkline>
				<magx-panel-html title="Now">
					<div class="pc-kv">
						<span>rate</span><b>{fmtCompact(ingestNow)}/min</b>
						<span>fleet mean</span>
						<b>{(nodes.reduce((a, n) => a + n.load, 0) / nodes.length).toFixed(1)}%</b>
						<span>p95 rtt</span>
						<b>{Math.max(...nodes.map((n) => n.rtt)).toFixed(2)} ms</b>
					</div>
				</magx-panel-html>
				<magx-panel-progressbar
					title="Disk (worst node)"
					currentValue={Math.round(Math.max(...nodes.map((n) => n.disk)))}
					maxValue="100"
				></magx-panel-progressbar>
			</magx-panel>
		</div>
	</div>

	<!-- 03 Document processing ------------------------------------------- -->
	<div class="ifc-sec">
		<span class="ifc-sec-tag">03</span>
		<span class="ifc-sec-title">Document processing rig</span>
		<span class="ifc-sec-hint">documents, as an operator surface</span>
	</div>
	<p class="ifc-sec-note">
		The strongest case for panels. A processing pipeline has a natural panel-per-stage decomposition,
		the settings genuinely are separate from the queue, and the operator wants the extracted-text
		pane large and everything else small — which is exactly what dragging and collapsing give them.
		Press Process to run the stages; the OCR toggle changes both the pipeline labels and the
		confidence figures, because switching to an embedded text layer is a different job.
	</p>
	<div class="pc-stage">
		<div class="pc-canvas" style="--w:{PANEL_W}px">
			<magx-panel title="Queue" x="0" y="0" style="--magx-panel-panel-width:{PANEL_W}px">
				<magx-panel-html title="{docs.length} documents">
					<div class="pc-rows">
						{#each docs as d (d.name)}
							<div class="pc-doc">
								<span class="pc-src">{d.src}</span>
								<span class="pc-fname" title={d.name}>{d.name}</span>
								<span class="pc-num">{d.pages}p</span>
								<span class="pc-num">{fmtBytes(d.bytes)}</span>
							</div>
						{/each}
					</div>
				</magx-panel-html>
				<magx-panel-sparkline bind:this={confSpark} title="Confidence — % / page"
					></magx-panel-sparkline>
				<magx-panel-sparkline bind:this={pagesSpark} title="Pages — /min"
				></magx-panel-sparkline>
			</magx-panel>

			<magx-panel title="Pipeline" x="304" y="0" style="--magx-panel-panel-width:{PANEL_W}px">
				<magx-panel-dropdown id="pc-engine" title="OCR engine" index="0">
					{#each ENGINES as e (e)}<option>{e}</option>{/each}
				</magx-panel-dropdown>
				<magx-panel-toggle id="pc-ocr" title="Rasterise + OCR" labelOn="OCR" labelOff="TEXT" checked
				></magx-panel-toggle>
				{#each stageProgress as s (s.label)}
					<magx-panel-progressbar title={s.label} currentValue={s.pct} maxValue="100"
					></magx-panel-progressbar>
				{/each}
				<magx-panel-button
					id="pc-run"
					title={running ? 'Processing…' : 'Process queue'}
					mode="momentary"
					secondary="Clear queue"
				></magx-panel-button>
				<magx-panel-sparkline bind:this={latencySpark} title="Stage latency — ms"
				></magx-panel-sparkline>
			</magx-panel>

			<magx-panel title="Extracted text" x="608" y="0" style="--magx-panel-panel-width:{PANEL_W}px">
				<magx-panel-html title={docs[0].name}>
					<pre class="pc-pre">{extracted}</pre>
				</magx-panel-html>
				<magx-panel-sparkline bind:this={charsSpark} title="Characters — /page"
				></magx-panel-sparkline>
			</magx-panel>
		</div>
	</div>

	<div class="ifc-hr"></div>
	<div class="ifc-mono-note">
		Panel consoles are a desktop composition — the stages scroll horizontally rather than reflow,
		because a panel whose absolute position is recalculated for a phone is no longer the thing the
		operator arranged. For narrow screens, the flat layouts under Charting and Layout &amp; Data are
		the right form.
	</div>
</div>

<style>
	/* A console is an absolutely-positioned surface; it scrolls rather than
	   reflows, so a dragged arrangement survives a narrow viewport. */
	.pc-stage {
		overflow-x: auto;
		overflow-y: hidden;
		border: 1px solid var(--rule-soft);
		background: var(--color-bg-alt);
		padding: var(--spacing-md);
		margin-bottom: var(--spacing-md);
	}
	.pc-canvas {
		position: relative;
		min-width: calc(var(--w) * 3 + 32px);
		/* Fallback only. `fitStage` overwrites this with the measured extent of
		   the panels, so the section is never half-empty and never spills. */
		min-height: 240px;
	}

	.pc-anim {
		margin-bottom: var(--spacing-lg);
	}
	.pc-anim-note {
		margin: var(--spacing-sm) 0 0;
		font-size: 0.78rem;
		line-height: 1.6;
		color: var(--ink-soft);
	}

	.pc-kv {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 2px 8px;
		font-size: 0.66rem;
	}
	.pc-kv span {
		color: var(--ink-soft);
	}
	.pc-kv b {
		font-variant-numeric: tabular-nums;
	}

	.pc-log {
		font-size: 0.64rem;
		font-variant-numeric: tabular-nums;
		color: var(--ink-muted);
		overflow-wrap: anywhere;
	}
	.pc-note {
		font-size: 0.62rem;
		line-height: 1.5;
		color: var(--ink-soft);
		margin: 0;
	}

	.pc-rows {
		display: grid;
		gap: 3px;
	}
	.pc-row,
	.pc-doc {
		display: grid;
		align-items: center;
		gap: 6px;
		font-size: 0.63rem;
	}
	.pc-row {
		grid-template-columns: minmax(0, 1fr) auto 42px 30px;
	}
	.pc-doc {
		grid-template-columns: 20px minmax(0, 1fr) 26px 46px;
	}

	.pc-host,
	.pc-fname {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.pc-num {
		text-align: right;
		font-variant-numeric: tabular-nums;
		color: var(--ink-soft);
	}

	.pc-chip {
		font-size: 0.53rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		padding: 1px 4px;
		border: 1px solid var(--stroke-mint);
		background: var(--pastel-mint);
		color: #1c2b26;
	}
	.pc-chip.is-bad {
		border-color: var(--stroke-rose);
		background: var(--pastel-rose);
		color: #3a1f28;
	}

	.pc-src {
		font-size: 0.5rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		text-align: center;
		border: 1px solid var(--stroke-aqua);
		background: var(--pastel-aqua);
		color: #17323a;
	}

	.pc-meter {
		height: 7px;
		border: 1px solid var(--rule-soft);
		background: var(--color-bg);
	}
	.pc-meter i {
		display: block;
		height: 100%;
		background: var(--color-accent);
	}

	.pc-empty {
		font-size: 0.64rem;
		color: var(--ink-soft);
		padding: var(--spacing-sm) 0;
	}

	.pc-pre {
		margin: 0;
		font-size: 0.58rem;
		line-height: 1.5;
		white-space: pre-wrap;
		overflow-wrap: anywhere;
		max-height: 300px;
		overflow-y: auto;
		color: var(--ink-muted);
	}
</style>
