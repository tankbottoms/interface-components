<script lang="ts">
	import BarLineCombo from '$lib/interface/charts/BarLineCombo.svelte';
	import StackedBars from '$lib/interface/charts/StackedBars.svelte';
	import Heatmap from '$lib/interface/charts/Heatmap.svelte';
	import AreaChart from '$lib/interface/charts/AreaChart.svelte';
	import MiniSpark from '$lib/interface/charts/MiniSpark.svelte';
	import HBarList from '$lib/interface/charts/HBarList.svelte';
	import Treemap from '$lib/interface/charts/Treemap.svelte';
	import DonutChart from '$lib/interface/charts/DonutChart.svelte';
	import MeterBar from '$lib/interface/charts/MeterBar.svelte';
	import {
		walk,
		spiky,
		diurnal,
		rollingMean,
		heatmapMatrix,
		stacked,
		ranked,
		treeNodes,
		fmtBytes,
		fmtNum,
		fmtCompact,
		rng,
		between,
		intBetween,
		MONTHS,
		WEEKDAYS
	} from '$lib/interface/generate';

	/**
	 * Every dataset below is generated, never fetched. `seed` advances on each
	 * "Reshuffle" so the shapes change but stay inside plausible ranges — the
	 * point of these demos is the presentation, not the numbers.
	 */
	let seed = $state(7);
	const reshuffle = () => (seed = (seed * 31 + 17) % 99991);

	const dayLabels = $derived(Array.from({ length: 30 }, (_, i) => `${i + 1}`));
	const daily = $derived(walk(30, { seed, min: 6, max: 48, start: 22, step: 6 }));
	const dailyMean = $derived(rollingMean(daily, 7));

	const tiers = ['Off-peak', 'Mid-peak', 'On-peak'];
	const monthly = $derived(stacked(MONTHS, 3, { seed: seed + 1, min: 320, max: 1180 }));

	const load = $derived(heatmapMatrix({ seed: seed + 2 }));
	const hours = Array.from({ length: 24 }, (_, h) => `${h}`.padStart(2, '0'));

	const baseline = $derived(diurnal(48, { seed: seed + 3, min: 120, max: 940, period: 24 }));
	const halfHours = Array.from({ length: 48 }, (_, i) =>
		i % 4 === 0 ? `${String(Math.floor(i / 2)).padStart(2, '0')}:00` : ''
	);

	const latP50 = $derived(walk(60, { seed: seed + 4, min: 40, max: 260, start: 90, step: 22 }));
	const latP95 = $derived(latP50.map((v, i) => v * between(rng(seed + 5 + i), 1.5, 2.8)));
	const latTicks = Array.from({ length: 60 }, (_, i) => (i % 10 === 0 ? `−${60 - i}m` : ''));

	const gpus = $derived(
		['spark-1 / GB10', 'spark-2 / GB10', 'node-18 / RTX A4000'].map((name, i) => {
			const r = rng(seed + 40 + i);
			const util = between(r, 8, 97);
			const mem = between(r, 22, 94);
			const pwr = between(r, 30, 88);
			return {
				name,
				util,
				mem,
				pwr,
				memGB: (mem / 100) * (i === 2 ? 16 : 128),
				capGB: i === 2 ? 16 : 128,
				watts: (pwr / 100) * (i === 2 ? 140 : 240),
				temp: between(r, 38, 79),
				trend: walk(40, { seed: seed + 60 + i, min: 5, max: 100, start: util, step: 18 })
			};
		})
	);

	const netIn = $derived(spiky(56, { seed: seed + 8, base: 6, spike: 190, chance: 0.1 }));
	const netOut = $derived(spiky(56, { seed: seed + 9, base: 4, spike: 120, chance: 0.08 }));
	const diskOps = $derived(spiky(56, { seed: seed + 10, base: 30, spike: 640, chance: 0.14 }));
	const volumeUse = $derived(walk(56, { seed: seed + 11, min: 41, max: 78, start: 58, step: 3 }));

	const folders = $derived(
		ranked(
			[
				'/archive/corpus',
				'/media/video',
				'/backup/nightly',
				'/datasets/edgar',
				'/models/gguf',
				'/home/mark',
				'/logs/ingest',
				'/tmp/staging'
			],
			{ seed: seed + 12, top: 62_000_000_000 }
		)
	);

	const namespaces = $derived(
		treeNodes(
			[
				'corpus',
				'video',
				'nightly',
				'edgar',
				'gguf',
				'home',
				'logs',
				'staging',
				'thumbs',
				'index'
			],
			{ seed: seed + 13 }
		)
	);

	const mix = $derived(
		[
			{ label: 'messages', v: 62 },
			{ label: 'tool_use', v: 21 },
			{ label: 'embeddings', v: 11 },
			{ label: 'errors', v: 6 }
		].map((s, i) => ({
			label: s.label,
			value: Math.round(s.v * between(rng(seed + 70 + i), 0.7, 1.35) * 340)
		}))
	);

	const quotas = $derived(
		['5-hour session', 'Weekly (all models)', 'Weekly (Opus)'].map((label, i) => {
			const r = rng(seed + 90 + i);
			return { label, pct: between(r, 12, 96), reset: `${intBetween(r, 1, 71)}h` };
		})
	);

	const chartTokens = ['cyan', 'rose', 'amber', 'indigo', 'green', 'violet', 'peach', 'teal'];
</script>

<svelte:head>
	<title>Charting — Interface Components</title>
</svelte:head>

<div class="ifc">
	<header class="ifc-page-head">
		<div class="ifc-eyebrow">Interface · 01</div>
		<h1 class="ifc-page-title">Charting</h1>
		<p class="ifc-page-lede">
			Static charts and hover behaviour distilled from the house energy sheet, the gpumon
			federation console, the seaweed volume report and the claude-proxy dashboard — rebuilt on the
			interface-components palette. Every chart is inline SVG with no charting dependency, and every
			dataset is synthesised in the browser from seeded generators.
		</p>
		<div class="ifc-btn-row" style="margin-top:var(--spacing-sm)">
			<button class="ifc-btn" onclick={reshuffle}>
				<i class="fas fa-rotate"></i> Reshuffle data
			</button>
			<span class="ifc-mono-note" style="align-self:center">seed {seed}</span>
		</div>
	</header>

	<!-- 01 ------------------------------------------------------------ -->
	<div class="ifc-sec">
		<span class="ifc-sec-tag">01</span>
		<span class="ifc-sec-title">Bars with rolling mean</span>
		<span class="ifc-sec-hint">hover · crosshair + two-value tooltip</span>
	</div>
	<p class="ifc-sec-note">
		Daily totals as pastel bars, with the trailing 7-day mean drawn as a stroke-weight line on top.
		Hovering dims every other bar and reads out both the day and the mean at that point.
	</p>
	<div class="ifc-card">
		<div class="ifc-card-hdr">
			<span class="ifc-card-title">Daily consumption</span>
			<span class="ifc-card-meta">kWh · last 30 days</span>
		</div>
		<BarLineCombo
			values={daily}
			mean={dailyMean}
			labels={dayLabels}
			unit=" kWh"
			barToken="cyan"
			lineToken="coral"
		/>
		<div class="ifc-legend">
			<span class="ifc-legend-item"
				><span class="ifc-legend-key" style="background:var(--pastel-cyan)"></span>Daily total</span
			>
			<span class="ifc-legend-item"
				><span class="ifc-legend-key" style="background:var(--stroke-coral)"></span>7-day mean</span
			>
		</div>
	</div>

	<!-- 02 ------------------------------------------------------------ -->
	<div class="ifc-sec">
		<span class="ifc-sec-tag">02</span>
		<span class="ifc-sec-title">Stacked columns</span>
		<span class="ifc-sec-hint">hover · segment isolate + column total</span>
	</div>
	<div class="ifc-card">
		<div class="ifc-card-hdr">
			<span class="ifc-card-title">Twelve months by tariff tier</span>
			<span class="ifc-card-meta">kWh</span>
		</div>
		<StackedBars
			data={monthly}
			series={tiers}
			tokens={['aqua', 'amber', 'rose']}
			unit=" kWh"
		/>
	</div>

	<!-- 03 ------------------------------------------------------------ -->
	<div class="ifc-sec">
		<span class="ifc-sec-tag">03</span>
		<span class="ifc-sec-title">Load-shape heatmap</span>
		<span class="ifc-sec-hint">hover · cell readout</span>
	</div>
	<p class="ifc-sec-note">
		Hour of day across, weekday down. Intensity is the pastel fill at varying opacity rather than a
		separate colour scale, which keeps the grid inside the palette and readable in both themes.
	</p>
	<div class="ifc-grid ifc-grid-2">
		<div class="ifc-card">
			<div class="ifc-card-hdr">
				<span class="ifc-card-title">Mean load by hour</span>
				<span class="ifc-card-meta">kW</span>
			</div>
			<Heatmap matrix={load} rowLabels={WEEKDAYS} colLabels={hours} token="aqua" unit=" kW" />
		</div>
		<div class="ifc-card">
			<div class="ifc-card-hdr">
				<span class="ifc-card-title">Baseline &amp; always-on floor</span>
				<span class="ifc-card-meta">W · 30-min buckets</span>
			</div>
			<AreaChart
				series={[baseline]}
				labels={halfHours}
				tokens={['mint']}
				unit=" W"
				height={214}
				yFormat={(v) => v.toFixed(0)}
			/>
		</div>
	</div>

	<!-- 04 ------------------------------------------------------------ -->
	<div class="ifc-sec">
		<span class="ifc-sec-tag">04</span>
		<span class="ifc-sec-title">Meters &amp; multi-series lines</span>
		<span class="ifc-sec-hint">gpumon federation console</span>
	</div>
	<div class="ifc-grid ifc-grid-3">
		{#each gpus as g}
			<div class="ifc-card">
				<div class="ifc-card-hdr">
					<span class="ifc-card-title">{g.name}</span>
					<span class="ifc-card-meta">{g.temp.toFixed(0)}°C</span>
				</div>
				<MeterBar label="UTIL" value={g.util} display={`${g.util.toFixed(0)}%`} />
				<MeterBar
					label="MEM"
					value={g.mem}
					display={`${g.memGB.toFixed(0)} / ${g.capGB} GB`}
				/>
				<MeterBar label="PWR" value={g.pwr} display={`${g.watts.toFixed(0)} W`} />
				<div style="margin-top:var(--spacing-sm)">
					<MiniSpark values={g.trend} token="indigo" unit="%" height={40} />
				</div>
			</div>
		{/each}
	</div>

	<div class="ifc-card" style="margin-top:var(--spacing-md)">
		<div class="ifc-card-hdr">
			<span class="ifc-card-title">Inference latency</span>
			<span class="ifc-card-meta">ms · last 60 min</span>
		</div>
		<AreaChart
			series={[latP95, latP50]}
			names={['p95', 'p50']}
			labels={latTicks}
			tokens={['peach', 'teal']}
			unit=" ms"
			fill={false}
			height={180}
			yFormat={(v) => v.toFixed(0)}
		/>
	</div>

	<!-- 05 ------------------------------------------------------------ -->
	<div class="ifc-sec">
		<span class="ifc-sec-tag">05</span>
		<span class="ifc-sec-title">Sparkline tiles</span>
		<span class="ifc-sec-hint">area and bar modes · axis-free</span>
	</div>
	<p class="ifc-sec-note">
		The value is the headline; the shape is context. Spiky generators here model the quiet-then-burst
		profile of a storage node rather than smooth telemetry.
	</p>
	<div class="ifc-grid ifc-grid-4">
		{#each [{ t: 'Network in', v: netIn, tok: 'cyan', u: ' MB/s', m: 'area' }, { t: 'Network out', v: netOut, tok: 'teal', u: ' MB/s', m: 'area' }, { t: 'Disk ops', v: diskOps, tok: 'amber', u: ' IOPS', m: 'bar' }, { t: 'Volume used', v: volumeUse, tok: 'green', u: '%', m: 'area' }] as card}
			<div class="ifc-card">
				<div class="ifc-card-hdr">
					<span class="ifc-card-title">{card.t}</span>
				</div>
				<div class="ifc-tile-value" style="text-align:left">
					{card.v[card.v.length - 1].toFixed(card.u === '%' ? 1 : 0)}<span
						style="font-size:0.62rem;color:var(--ink-soft)">{card.u}</span
					>
				</div>
				<MiniSpark
					values={card.v}
					mode={card.m as 'area' | 'bar'}
					token={card.tok}
					unit={card.u}
					height={48}
				/>
			</div>
		{/each}
	</div>

	<!-- 06 ------------------------------------------------------------ -->
	<div class="ifc-sec">
		<span class="ifc-sec-tag">06</span>
		<span class="ifc-sec-title">Ranked bars &amp; treemap</span>
		<span class="ifc-sec-hint">seaweed volume report, simplified</span>
	</div>
	<div class="ifc-grid ifc-grid-2">
		<div class="ifc-card">
			<div class="ifc-card-hdr">
				<span class="ifc-card-title">Size by top-level folder</span>
				<span class="ifc-card-meta">bar behind label</span>
			</div>
			<HBarList
				items={folders}
				token="teal"
				format={fmtBytes}
				secondary={(i) => `${fmtNum(i.count ?? 0)} files`}
			/>
		</div>
		<div class="ifc-card">
			<div class="ifc-card-hdr">
				<span class="ifc-card-title">Namespace share</span>
				<span class="ifc-card-meta">hover · size + share</span>
			</div>
			<Treemap nodes={namespaces} tokens={chartTokens} height={252} />
		</div>
	</div>

	<!-- 07 ------------------------------------------------------------ -->
	<div class="ifc-sec">
		<span class="ifc-sec-tag">07</span>
		<span class="ifc-sec-title">Composition &amp; quota</span>
		<span class="ifc-sec-hint">donut · progress rails</span>
	</div>
	<div class="ifc-grid ifc-grid-2">
		<div class="ifc-card">
			<div class="ifc-card-hdr">
				<span class="ifc-card-title">Request mix</span>
				<span class="ifc-card-meta">last 24h</span>
			</div>
			<DonutChart slices={mix} tokens={chartTokens} centerLabel="REQUESTS" format={fmtCompact} />
		</div>
		<div class="ifc-card">
			<div class="ifc-card-hdr">
				<span class="ifc-card-title">Quota windows</span>
				<span class="ifc-card-meta">resets</span>
			</div>
			<div class="ifc-stack" style="gap:var(--spacing-sm)">
				{#each quotas as q}
					<div>
						<div class="ifc-inline" style="justify-content:space-between">
							<span style="font-size:0.7rem">{q.label}</span>
							<span class="ifc-mono-note">{q.pct.toFixed(0)}% · resets in {q.reset}</span>
						</div>
						<MeterBar label="" value={q.pct} display={`${q.pct.toFixed(0)}%`} warn={75} crit={92} />
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>
