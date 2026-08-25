<script lang="ts">
	import MiniSpark from '$lib/interface/charts/MiniSpark.svelte';
	import MeterBar from '$lib/interface/charts/MeterBar.svelte';
	import {
		rng,
		between,
		intBetween,
		walk,
		fmtBytes,
		fmtNum,
		pick,
		RESERVOIR,
		windowOf,
		driftOne
	} from '$lib/interface/generate';
	import { onTick } from '$lib/anim';
	import AnimBar from '$lib/interface/AnimBar.svelte';
	import HoverCard from '$lib/interface/HoverCard.svelte';
	import Tooltip from '$lib/interface/charts/Tooltip.svelte';
	import { fitStage } from '$lib/interface/fitStage';
	import { magxById } from '$lib/interface/magx';

	let seed = $state(11);
	let navOpen = $state<string | null>(null);
	let drillOpen = $state<string | null>(null);
	let softBorders = $state(true);

	/**
	 * The nav dropdown is a *menu*, not a select: entries navigate, they do not set a
	 * value. That is why it closes on choose, closes on Escape, closes on an outside
	 * click, and never remembers what was picked last — the page you are on is the
	 * state, and it is already shown in the crumb.
	 */
	const navGroups = [
		{
			id: 'reports',
			label: 'Reports',
			icon: 'fa-file-lines',
			items: [
				{ name: 'Summary', hint: 'one page, all funds', icon: 'fa-file-invoice' },
				{ name: 'By category', hint: '18 categories', icon: 'fa-layer-group' },
				{ name: 'By counterparty', hint: '412 rows', icon: 'fa-building-columns' },
				{ name: 'Reconciliation', hint: 'unmatched only', icon: 'fa-scale-balanced' }
			]
		},
		{
			id: 'periods',
			label: 'Period',
			icon: 'fa-calendar-range',
			items: [
				{ name: 'Last 30 days', hint: 'rolling', icon: 'fa-clock-rotate-left' },
				{ name: 'Quarter to date', hint: 'Q3 2026', icon: 'fa-calendar-day' },
				{ name: 'Year to date', hint: '2026', icon: 'fa-calendar' },
				{ name: 'All time', hint: 'from 2019-04', icon: 'fa-infinity' }
			]
		},
		{
			id: 'export',
			label: 'Export',
			icon: 'fa-arrow-down-to-line',
			items: [
				{ name: 'CSV', hint: 'current view', icon: 'fa-file-csv' },
				{ name: 'JSON', hint: 'with metadata', icon: 'fa-file-code' },
				{ name: 'Print', hint: 'paginated', icon: 'fa-print' }
			]
		}
	];

	/** Drill-in rows: a summary line that opens a detail block *in place*. */
	const drillRows = [
		{
			id: 'd1',
			name: 'Professional services',
			count: 42,
			total: '$184,220',
			share: 0.31,
			detail: [
				{ k: 'Legal', v: '$96,400', n: 18 },
				{ k: 'Audit', v: '$54,120', n: 11 },
				{ k: 'Advisory', v: '$33,700', n: 13 }
			]
		},
		{
			id: 'd2',
			name: 'Infrastructure',
			count: 128,
			total: '$92,880',
			share: 0.16,
			detail: [
				{ k: 'Compute', v: '$61,040', n: 74 },
				{ k: 'Storage', v: '$19,610', n: 31 },
				{ k: 'Egress', v: '$12,230', n: 23 }
			]
		},
		{
			id: 'd3',
			name: 'Payroll',
			count: 24,
			total: '$318,400',
			share: 0.53,
			detail: [
				{ k: 'Salaries', v: '$268,900', n: 12 },
				{ k: 'Contractors', v: '$38,200', n: 9 },
				{ k: 'Benefits', v: '$11,300', n: 3 }
			]
		}
	];
	let fps = $state(0);
	let frame = $state(0);
	const reshuffle = () => (seed = (seed * 37 + 5) % 99991);

	/**
	 * Layout surfaces animate the same way the charts do: 0 fps is the static
	 * page, above zero the live figures drift and the node sparklines scroll a
	 * window along a reservoir. The structure never moves — only the numbers —
	 * because a layout demo that reflows on every frame is unreadable.
	 */
	$effect(() => onTick(() => fps, () => (frame += 1)));

	const kpis = $derived.by(() => {
		const r = rng(seed);
		const d = (v: number, i: number, amt = 0.05) => driftOne(v, frame, i, amt);
		const docs = d(between(r, 18_000, 42_000), 0);
		const agencies = d(between(r, 40, 120), 1, 0.02);
		const pages = d(between(r, 400_000, 950_000), 2);
		const corpus = d(between(r, 40e9, 120e9), 3, 0.03);
		const enriched = Math.min(99.9, d(between(r, 61, 97), 4, 0.02));
		return [
			{
				label: 'Documents',
				value: fmtNum(docs),
				sub: 'indexed',
				detail: [
					{ k: 'ingested today', v: fmtNum(docs * 0.014), token: 'mint' },
					{ k: 'awaiting OCR', v: fmtNum(docs * 0.006), token: 'peach' },
					{ k: 'quarantined', v: fmtNum(docs * 0.0008), token: 'blush' }
				],
				note: 'Counts every revision, not every unique filing.'
			},
			{
				label: 'Agencies',
				value: fmtNum(agencies),
				sub: 'sources',
				detail: [
					{ k: 'federal', v: fmtNum(agencies * 0.42), token: 'aqua' },
					{ k: 'state', v: fmtNum(agencies * 0.38), token: 'violet' },
					{ k: 'municipal', v: fmtNum(agencies * 0.2), token: 'vanilla' }
				],
				note: 'An agency is a distinct issuing body, not a docket.'
			},
			{
				label: 'Pages',
				value: fmtNum(pages),
				sub: 'extracted',
				detail: [
					{ k: 'text layer', v: fmtNum(pages * 0.71), token: 'mint' },
					{ k: 'OCR', v: fmtNum(pages * 0.27), token: 'peach' },
					{ k: 'image only', v: fmtNum(pages * 0.02), token: 'blush' }
				]
			},
			{
				label: 'Corpus',
				value: fmtBytes(corpus),
				sub: 'on disk',
				detail: [
					{ k: 'originals', v: fmtBytes(corpus * 0.83), token: 'aqua' },
					{ k: 'derivatives', v: fmtBytes(corpus * 0.12), token: 'orchid' },
					{ k: 'index', v: fmtBytes(corpus * 0.05), token: 'teal' }
				],
				note: 'Before replication; the mirror doubles it.'
			},
			{
				label: 'Enriched',
				value: `${enriched.toFixed(1)}%`,
				sub: 'with metadata',
				detail: [
					{ k: 'entities', v: `${(enriched * 0.98).toFixed(1)}%`, token: 'mint' },
					{ k: 'citations', v: `${(enriched * 0.74).toFixed(1)}%`, token: 'aqua' },
					{ k: 'summaries', v: `${(enriched * 0.51).toFixed(1)}%`, token: 'vanilla' }
				]
			}
		];
	});

	const nodes = $derived.by(() => {
		const names = ['spark-1', 'spark-2', 'node-eighteen', 'unraid-one', 'hostinger-vps'];
		return names.map((name, i) => {
			const r = rng(seed + i * 13);
			const up = r() > 0.16;
			const clamp = (v: number) => Math.max(1, Math.min(99, v));
			return {
				name,
				up,
				role: ['GPU', 'GPU', 'ENRICH', 'STORE', 'EDGE'][i],
				link: pick(r, ['10 Gb/s', '2.5 Gb/s', '1 Gb/s', '1 Gb/s']),
				load: clamp(driftOne(between(r, 3, 96), frame, i, 0.14)),
				disk: clamp(driftOne(between(r, 18, 93), frame, i + 1, 0.03)),
				rtt: Math.max(0.2, driftOne(between(r, 0.3, 42), frame, i + 2, 0.2)),
				cores: intBetween(r, 8, 128),
				ramGB: intBetween(r, 16, 512),
				uptimeD: intBetween(r, 1, 480),
				trend: windowOf(
					walk(32 + RESERVOIR, { seed: seed + 100 + i, min: 2, max: 100, step: 16 }),
					32,
					frame
				)
			};
		});
	});

	interface Doc {
		id: number;
		title: string;
		pages: number;
		year: number;
		src: 'DB' | 'FS';
		tags: string[];
		note: string;
	}

	const agencies = $derived.by(() => {
		const groups = [
			{ name: 'Department of Justice', unit: 'Civil Division' },
			{ name: 'Securities & Exchange Commission', unit: 'Division of Enforcement' },
			{ name: 'Superior Court of California', unit: 'County of Los Angeles' }
		];
		return groups.map((g, gi) => {
			const r = rng(seed + 200 + gi * 7);
			const docs: Doc[] = Array.from({ length: intBetween(r, 3, 5) }, (_, di) => ({
				id: intBetween(r, 10, 990),
				title: pick(r, [
					'Complaint for civil penalties',
					'Notice of intent to sue',
					'Response to records request',
					'Stipulated protective order',
					'Declaration in support of motion',
					'Administrative subpoena duces tecum'
				]),
				pages: intBetween(r, 2, 340),
				year: intBetween(r, 2016, 2026),
				src: r() > 0.4 ? 'DB' : 'FS',
				tags: [
					pick(r, ['31 U.S.C. § 3729', '15 U.S.C. § 78j(b)', 'Cal. Gov. Code § 12650']),
					pick(r, ['fraud', 'disclosure', 'retaliation', 'penalties'])
				],
				note: `Extracted ${intBetween(r, 3, 60)} entities · ${intBetween(r, 1, 14)} statutes referenced · OCR confidence ${between(r, 82, 99).toFixed(1)}%`
			}));
			return { ...g, docs, count: docs.length };
		});
	});

	let openGroup = $state(0);
	let openRow = $state<string | null>(null);

	const sources = $derived.by(() => {
		const r = rng(seed + 900);
		return [
			{ label: 'DB', latency: between(r, 0.4, 9), state: 'ok' as const, detail: 'sqlite · wal' },
			{ label: 'FS', latency: between(r, 2, 48), state: r() > 0.7 ? ('warn' as const) : ('ok' as const), detail: 'nfs · unraid-one' },
			{ label: 'IPFS', latency: between(r, 40, 900), state: 'idle' as const, detail: 'gateway' }
		];
	});

	let settingsOpen = $state(false);
	let menuOpen = $state(false);
	let density = $state<'comfortable' | 'compact'>('comfortable');
	let stripWs = $state(true);

	const table = $derived.by(() => {
		const r = rng(seed + 400);
		return Array.from({ length: 8 }, (_, i) => {
			const size = between(r, 40_000, 90_000_000);
			const pages = intBetween(r, 1, 420);
			return {
				file: `${pick(r, ['DOJ', 'SEC', 'LASC', 'FTC'])}-${intBetween(r, 1000, 9999)}.pdf`,
				size,
				pages,
				ocr: Math.min(99.9, driftOne(between(r, 74, 99.8), frame, i, 0.01)),
				state: pick(r, ['indexed', 'queued', 'failed', 'indexed', 'indexed']),
				src: r() > 0.4 ? 'DB' : 'FS',
				ingestMs: Math.round(between(r, 40, 5400)),
				entities: intBetween(r, 4, 260),
				bytesPerPage: size / Math.max(1, pages)
			};
		});
	});

	/**
	 * Table rows cannot be wrapped in `HoverCard` — a `<div>` is not valid inside
	 * `<tbody>` — so the table drives the shared `Tooltip` directly.
	 */
	type TableRow = (typeof table)[number];
	let rowTip = $state<{ x: number; y: number; show: boolean; row: TableRow | null }>({
		x: 0,
		y: 0,
		show: false,
		row: null
	});

	const stateToken = (s: string) =>
		s === 'indexed' ? 'b-mint' : s === 'queued' ? 'b-vanilla' : 'b-blush';

	/**
	 * The closing section rebuilds this page's own surfaces out of panels, and
	 * the controls in them are not a parallel copy of the page state — they drive
	 * it. Changing "Row density" in the panel re-renders the table in section 06;
	 * the fps range is the same `fps` the animate bar at the top writes.
	 *
	 * Binding is two-way and safe in both directions because every panel setter
	 * guards on inequality (`Panel-DropDown.index`, `Panel-Range.value`), so the
	 * value coming back from Svelte after a user change is a no-op rather than a
	 * second notification.
	 */
	const CP_W = 336;
	let panelStage: HTMLDivElement | null = $state(null);
	$effect(() => (panelStage ? fitStage(panelStage, 12) : undefined));

	let panelNode = $state(0);
	const focusNode = $derived(nodes[panelNode] ?? nodes[0]);

	$effect(() => {
		const read = (id: string): any => (magxById(id) as any)?.getValue?.();
		const onChange = (e: Event) => {
			const id = (e as CustomEvent).detail?.panelElementId as string;
			if (id === 'lp-node') panelNode = read(id)?.index ?? 0;
			else if (id === 'lp-density')
				density = read(id)?.index === 1 ? 'compact' : 'comfortable';
			else if (id === 'lp-strip') stripWs = !!read(id);
			else if (id === 'lp-fps') fps = Number(read(id) ?? 0);
			else if (id === 'lp-reshuffle') reshuffle();
		};
		document.addEventListener('magx-panelValueChanged', onChange);
		return () => document.removeEventListener('magx-panelValueChanged', onChange);
	});
</script>

<svelte:window
	onclick={(e) => {
		/* Outside click closes the menu; the trigger stops its own propagation via the check below. */
		if (navOpen && !(e.target as HTMLElement).closest('.lp-navitem')) navOpen = null;
	}}
	onkeydown={(e) => {
		if (e.key === 'Escape') navOpen = null;
	}}
/>

<svelte:head>
	<title>Layout &amp; Data — Interface Components</title>
</svelte:head>

<div class="ifc">
	<header class="ifc-page-head">
		<div class="ifc-eyebrow">Interface · 02</div>
		<h1 class="ifc-page-title">Layout &amp; Data</h1>
		<p class="ifc-page-lede">
			The structural vocabulary shared by postcrime, the house sheet and the federation console:
			banners, KPI strips, section heads, badges, data-source chips, expandable agency rows and
			dense tables. Content is synthesised; the arrangement is the point.
		</p>
		<p class="ifc-page-lede" style="margin-top:var(--spacing-sm)">
			KPI tiles, node cards and table rows carry a white-plate hover popover with the breakdown
			behind the headline figure — the detail you would otherwise have to click through for. The
			same FPS control as the charting page animates the live numbers: structure holds still, values
			move, because a layout demo that reflows every frame cannot be read.
		</p>
		<AnimBar
			bind:fps
			{seed}
			{frame}
			onreshuffle={reshuffle}
			note="Hover any tile, node card or table row for the popover"
		/>
	</header>

	<!-- 01 banners --------------------------------------------------- -->
	<div class="ifc-sec">
		<span class="ifc-sec-tag">01</span>
		<span class="ifc-sec-title">Banners &amp; notices</span>
		<span class="ifc-sec-hint">four intents</span>
	</div>
	<div class="ifc-stack">
		<div class="ifc-banner">
			<i class="fat fa-triangle-exclamation"></i>
			<div>
				<strong>Development build.</strong> Figures on this page are generated on load and do not
				describe any real system.
			</div>
		</div>
		<div class="ifc-banner is-info">
			<i class="fat fa-circle-info"></i>
			<div>Corpus re-indexed 4 minutes ago. Full-text search reflects the latest ingest.</div>
		</div>
		<div class="ifc-banner is-ok">
			<i class="fat fa-circle-check"></i>
			<div>All five nodes reporting. Replication lag under one second.</div>
		</div>
		<div class="ifc-banner is-crit">
			<i class="fat fa-circle-exclamation"></i>
			<div>Two documents failed OCR and were quarantined for manual review.</div>
		</div>
		<div class="ifc-notice">
			<i class="fat fa-wand-magic-sparkles"></i>
			<span>Detected a scanned filing without a text layer.</span>
			<button class="ifc-notice-action ifc-btn">Run OCR →</button>
		</div>
	</div>

	<!-- 02 kpi ------------------------------------------------------- -->
	<div class="ifc-sec">
		<span class="ifc-sec-tag">02</span>
		<span class="ifc-sec-title">KPI tiles &amp; header strip</span>
		<span class="ifc-sec-hint">gap-separated vs hairline-separated</span>
	</div>
	<div class="ifc-tiles">
		{#each kpis as k (k.label)}
			<HoverCard title={k.label} rows={k.detail} note={k.note ?? ''}>
				<div class="ifc-tile">
					<div class="ifc-tile-label">{k.label}</div>
					<div class="ifc-tile-value">{k.value}</div>
					<div class="ifc-tile-sub">{k.sub}</div>
				</div>
			</HoverCard>
		{/each}
	</div>
	<div class="ifc-strip" style="margin-top:var(--spacing-md);border-top:1px solid var(--rule)">
		{#each kpis as k}
			<div>
				<div class="ifc-strip-label">{k.label}</div>
				<div class="ifc-strip-value">{k.value}</div>
			</div>
		{/each}
	</div>

	<!-- 03 badges ---------------------------------------------------- -->
	<div class="ifc-sec">
		<span class="ifc-sec-tag">03</span>
		<span class="ifc-sec-title">Badges, pills &amp; source chips</span>
		<span class="ifc-sec-hint">16 palette tokens</span>
	</div>
	<div class="ifc-inline" style="margin-bottom:var(--spacing-sm)">
		{#each ['aqua', 'mint', 'rose', 'blush', 'peach', 'vanilla', 'violet', 'orchid', 'green', 'amber', 'cyan', 'indigo', 'coral', 'lilac', 'lime', 'teal'] as t}
			<span class="ifc-badge b-{t}">{t}</span>
		{/each}
	</div>
	<div class="ifc-inline" style="margin-bottom:var(--spacing-sm)">
		<span class="ifc-badge is-raised b-aqua">18,402 documents</span>
		<span class="ifc-badge b-mint"><i class="fat fa-check"></i> verified</span>
		<span class="ifc-badge b-blush"><i class="fat fa-xmark"></i> failed</span>
		<span class="ifc-badge b-vanilla"><i class="fat fa-clock"></i> queued</span>
		<span class="ifc-badge">plain</span>
	</div>
	<div class="ifc-pills" style="margin-bottom:var(--spacing-sm)">
		<span class="ifc-pill is-link">31 U.S.C. § 3729</span>
		<span class="ifc-pill is-link">15 U.S.C. § 78j(b)</span>
		<span class="ifc-pill">false claims</span>
		<span class="ifc-pill">qui tam</span>
		<span class="ifc-pill">relator</span>
		<span class="ifc-pill">disclosure</span>
	</div>
	<div class="ifc-inline">
		{#each sources as s}
			<span class="ifc-chip" title={s.detail}>
				<span class="ifc-chip-dot is-{s.state}"></span>
				<span class="ifc-chip-label">{s.label}</span>
				<span class="ifc-chip-lat">{s.latency.toFixed(1)} ms</span>
			</span>
		{/each}
	</div>

	<!-- 04 nav + settings -------------------------------------------- -->
	<div class="ifc-sec">
		<span class="ifc-sec-tag">04</span>
		<span class="ifc-sec-title">Menu &amp; settings popovers</span>
		<span class="ifc-sec-hint">click to toggle</span>
	</div>
	<div class="ifc-card">
		<div class="popbar">
			<div class="pop-anchor">
				<button class="ifc-btn" class:is-active={menuOpen} onclick={() => (menuOpen = !menuOpen)}>
					<i class="fat fa-bars"></i> Menu
				</button>
				{#if menuOpen}
					<div class="popover">
						<div class="pop-head">Navigate</div>
						{#each ['Overview', 'Agencies', 'Documents', 'Statutes', 'Parties', 'Timeline'] as item}
							<button class="pop-item"><i class="fat fa-angle-right"></i> {item}</button>
						{/each}
					</div>
				{/if}
			</div>

			<div class="pop-anchor" style="margin-left:auto">
				<button
					class="ifc-btn"
					class:is-active={settingsOpen}
					onclick={() => (settingsOpen = !settingsOpen)}
				>
					<i class="fat fa-gear"></i> Settings
				</button>
				{#if settingsOpen}
					<div class="popover align-right">
						<div class="pop-head">Display</div>
						<div class="pop-row">
							<span>Density</span>
							<div class="ifc-btn-row">
								<button
									class="ifc-btn"
									class:is-active={density === 'comfortable'}
									onclick={() => (density = 'comfortable')}>Comfy</button
								>
								<button
									class="ifc-btn"
									class:is-active={density === 'compact'}
									onclick={() => (density = 'compact')}>Compact</button
								>
							</div>
						</div>
						<div class="pop-row">
							<span>Strip whitespace</span>
							<button class="ifc-btn" class:is-active={stripWs} onclick={() => (stripWs = !stripWs)}>
								{stripWs ? 'On' : 'Off'}
							</button>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- 05 expandable ------------------------------------------------ -->
	<div class="ifc-sec">
		<span class="ifc-sec-tag">05</span>
		<span class="ifc-sec-title">Lists, sub-lists &amp; expanded rows</span>
		<span class="ifc-sec-hint">agency → filing → detail</span>
	</div>
	{#each agencies as g, gi}
		<div class="ifc-group">
			<button class="ifc-group-hdr" onclick={() => (openGroup = openGroup === gi ? -1 : gi)}>
				<span class="ifc-caret" class:is-open={openGroup === gi}>▸</span>
				{g.name}
				<span class="ifc-row-badges">
					<span class="ifc-badge b-lilac">{g.unit}</span>
					<span class="ifc-badge b-aqua">{g.count} filings</span>
				</span>
			</button>
			{#if openGroup === gi}
				{#each g.docs as d, di}
					{@const key = `${gi}-${di}`}
					<button class="ifc-row" class:is-open={openRow === key} onclick={() => (openRow = openRow === key ? null : key)}>
						<span class="ifc-caret" class:is-open={openRow === key}>▸</span>
						<span class="ifc-row-name">{d.title}</span>
						<span class="ifc-row-badges">
							{#each d.tags as t}
								<span class="ifc-pill">{t}</span>
							{/each}
							<span class="ifc-badge b-vanilla">{d.year}</span>
							<span class="ifc-badge b-{d.src === 'DB' ? 'mint' : 'peach'}">{d.src}</span>
							<span class="ifc-badge">{d.pages} pp</span>
						</span>
					</button>
					{#if openRow === key}
						<div class="ifc-row-detail">
							<div class="ifc-inline" style="margin-bottom:6px">
								<a class="ifc-btn" href="/interface/documents"><i class="fat fa-file-lines"></i> Open</a>
								<span class="ifc-badge b-cyan">doc #{d.id}</span>
								<span class="ifc-chip"
									><span class="ifc-chip-dot"></span><span class="ifc-chip-label">{d.src}</span
									><span class="ifc-chip-lat">{(d.pages / 40).toFixed(1)} ms</span></span
								>
							</div>
							{d.note}
						</div>
					{/if}
				{/each}
			{/if}
		</div>
	{/each}

	<!-- 06 nodes ----------------------------------------------------- -->
	<div class="ifc-sec">
		<span class="ifc-sec-tag">06</span>
		<span class="ifc-sec-title">Node cards &amp; link topology</span>
		<span class="ifc-sec-hint">status dot · speed pill · load meter</span>
	</div>
	<div class="ifc-grid ifc-grid-auto">
		{#each nodes as n (n.name)}
			<HoverCard
				title={n.name}
				rows={[
					{ k: 'role', v: n.role, token: 'aqua' },
					{ k: 'cores', v: `${n.cores}`, token: 'violet' },
					{ k: 'memory', v: `${n.ramGB} GB`, token: 'orchid' },
					{ k: 'load', v: `${n.load.toFixed(1)}%`, token: 'mint' },
					{ k: 'disk', v: `${n.disk.toFixed(1)}%`, token: 'peach' },
					{ k: 'round-trip', v: `${n.rtt.toFixed(2)} ms`, token: 'vanilla' },
					{ k: 'uptime', v: `${n.uptimeD} d` }
				]}
				note={n.up ? 'Reporting on the last heartbeat.' : 'Last heartbeat missed — figures are stale.'}
			>
				<div class="ifc-card">
					<div class="ifc-card-hdr">
						<span class="ifc-chip-dot" class:is-crit={!n.up}></span>
						<span class="ifc-card-title">{n.name}</span>
						<span class="ifc-card-meta">{n.role}</span>
					</div>
					<div class="ifc-inline" style="margin-bottom:6px">
						<span class="ifc-badge b-{n.up ? 'mint' : 'blush'}">{n.up ? 'online' : 'offline'}</span>
						<span class="ifc-badge b-cyan">{n.link}</span>
						<span class="ifc-badge b-vanilla">{n.rtt.toFixed(1)} ms</span>
					</div>
					<MeterBar label="LOAD" value={n.load} display={`${n.load.toFixed(0)}%`} />
					<MeterBar label="DISK" value={n.disk} display={`${n.disk.toFixed(0)}%`} />
					<MiniSpark values={n.trend} token="teal" unit="%" height={34} />
				</div>
			</HoverCard>
		{/each}
	</div>

	<!-- 07 table ----------------------------------------------------- -->
	<div class="ifc-sec">
		<span class="ifc-sec-tag">07</span>
		<span class="ifc-sec-title">Dense table</span>
		<span class="ifc-sec-hint">tabular numerals · hairline rows</span>
	</div>
	<div class="ifc-card" style="padding:0">
		<table class="ifc-table" class:compact={density === 'compact'}>
			<thead>
				<tr>
					<th>File</th>
					<th class="num">Size</th>
					<th class="num">Pages</th>
					<th class="num">OCR</th>
					<th>State</th>
				</tr>
			</thead>
			<tbody>
				{#each table as row (row.file)}
					<tr
						class="is-hoverable"
						onmousemove={(e) => (rowTip = { x: e.clientX, y: e.clientY, show: true, row })}
						onmouseleave={() => (rowTip = { ...rowTip, show: false })}
					>
						<td>{row.file}</td>
						<td class="num">{fmtBytes(row.size)}</td>
						<td class="num">{row.pages}</td>
						<td class="num">{row.ocr.toFixed(1)}%</td>
						<td><span class="ifc-badge {stateToken(row.state)}">{row.state}</span></td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<Tooltip x={rowTip.x} y={rowTip.y} show={rowTip.show && !!rowTip.row}>
		{#if rowTip.row}
			<div class="ifc-tip-title">{rowTip.row.file}</div>
			<div class="ifc-tip-row">
				<span class="ifc-tip-key" style="background:var(--pastel-aqua)"></span>
				<span>source</span><span class="ifc-tip-val">{rowTip.row.src}</span>
			</div>
			<div class="ifc-tip-row">
				<span class="ifc-tip-key" style="background:var(--pastel-mint)"></span>
				<span>per page</span><span class="ifc-tip-val">{fmtBytes(rowTip.row.bytesPerPage)}</span>
			</div>
			<div class="ifc-tip-row">
				<span class="ifc-tip-key" style="background:var(--pastel-peach)"></span>
				<span>ingest</span><span class="ifc-tip-val">{rowTip.row.ingestMs} ms</span>
			</div>
			<div class="ifc-tip-row">
				<span class="ifc-tip-key" style="background:var(--pastel-violet)"></span>
				<span>entities</span><span class="ifc-tip-val">{rowTip.row.entities}</span>
			</div>
		{/if}
	</Tooltip>

	<!-- 08 ------------------------------------------------------------ -->
	<div class="ifc-sec">
		<span class="ifc-sec-tag">08</span>
		<span class="ifc-sec-title">The same surfaces, in panels</span>
		<span class="ifc-sec-hint">drag · collapse · tab</span>
	</div>
	<p class="ifc-sec-note">
		Everything above rebuilt as a panel stack. The three panels are not a separate demo — the
		<em>View</em> controls write the page state directly, so changing row density re-renders the
		table in section 06 and the fps range is the same one the animate bar at the top drives. Click a
		title bar and press <kbd>Tab</kbd> to walk the controls; <kbd>Space</kbd> toggles, arrows step a
		dropdown or a slider, and arrows on the title bar nudge the panel itself.
	</p>
	<div class="ifc-card cp-card">
		<div bind:this={panelStage} class="cp-stage">
			<magx-panel title="Corpus" x="0" y="0" style="--magx-panel-panel-width:{CP_W}px">
				<magx-panel-html title="indexed totals">
					<div class="lp-kv">
						{#each kpis as k (k.label)}
							<div class="lp-row">
								<span class="lp-k">{k.label}</span>
								<b class="lp-v">{k.value}</b>
								<span class="lp-s">{k.sub}</span>
							</div>
						{/each}
					</div>
				</magx-panel-html>
				<magx-panel-html title="sources">
					<div class="lp-kv">
						{#each sources as s (s.label)}
							<div class="lp-row">
								<span class="lp-k">{s.label}</span>
								<b class="lp-v">{s.latency.toFixed(1)} ms</b>
								<span class="lp-s">{s.detail}</span>
							</div>
						{/each}
					</div>
				</magx-panel-html>
			</magx-panel>

			<magx-panel title="Fleet" x="352" y="0" style="--magx-panel-panel-width:{CP_W}px">
				<magx-panel-dropdown id="lp-node" title="Node" index={panelNode}>
					{#each nodes as n (n.name)}<option>{n.name}</option>{/each}
				</magx-panel-dropdown>
				<magx-panel-html title="{focusNode.role} · {focusNode.link}">
					<MeterBar label="LOAD" value={focusNode.load} display="{focusNode.load.toFixed(0)}%" />
					<MeterBar label="DISK" value={focusNode.disk} display="{focusNode.disk.toFixed(0)}%" />
					<div class="lp-kv" style="margin-top:6px">
						<div class="lp-row">
							<span class="lp-k">rtt</span><b class="lp-v">{focusNode.rtt.toFixed(1)} ms</b>
							<span class="lp-s">{focusNode.up ? 'up' : 'unreachable'}</span>
						</div>
						<div class="lp-row">
							<span class="lp-k">cores</span><b class="lp-v">{focusNode.cores}</b>
							<span class="lp-s">{focusNode.ramGB} GB</span>
						</div>
					</div>
				</magx-panel-html>
				<magx-panel-html title="load — last 32 samples">
					<MiniSpark values={focusNode.trend} token="aqua" unit="%" height={64} />
				</magx-panel-html>
			</magx-panel>

			<magx-panel title="View" x="704" y="0" style="--magx-panel-panel-width:{CP_W}px">
				<magx-panel-dropdown id="lp-density" title="Row density" index="0">
					<option>comfortable</option>
					<option>compact</option>
				</magx-panel-dropdown>
				<magx-panel-toggle
					id="lp-strip"
					title="Strip whitespace"
					labelOn="ON"
					labelOff="OFF"
					checked
				></magx-panel-toggle>
				<magx-panel-range id="lp-fps" title="Animate (fps)" min="0" max="30" step="1" value={fps}
				></magx-panel-range>
				<magx-panel-button id="lp-reshuffle" title="Reshuffle" mode="momentary"
				></magx-panel-button>
				<magx-panel-html title="live state">
					<div class="lp-log">
						seed {seed} · frame {frame} · {density} · ws {stripWs ? 'stripped' : 'kept'}
					</div>
				</magx-panel-html>
			</magx-panel>
		</div>
	</div>

	<div class="ifc-sec">
		<span class="ifc-sec-tag">09</span>
		<span class="ifc-sec-title">Soft surfaces</span>
		<span class="ifc-sec-hint">the lighter border · hairline over box</span>
	</div>
	<p class="ifc-sec-note">
		The boxed card is right when a card is a <em>figure</em>: one chart, one thing, clearly
		bounded. It is wrong when twenty of them stack down a report, because twenty boxes read as a
		grid of cages and the reader stops seeing the contents. The soft variant keeps the padding and
		the ground and drops to a hairline, with a single top rule doing the separating —
		<code>.ifc-card.is-soft</code> for report sections and category blocks,
		<code>.ifc-card.is-hair</code> when a box is still wanted but should whisper. Toggle it to see
		the difference at scale; the content below is identical either way.
	</p>
	<div class="ifc-inline" style="margin-bottom:8px">
		<button class="ifc-btn" onclick={() => (softBorders = !softBorders)}>
			<i class="fat {softBorders ? 'fa-square' : 'fa-minus'}"></i>
			{softBorders ? 'Boxed borders' : 'Soft borders'}
		</button>
		<span class="ifc-mono-note">
			{softBorders ? '.ifc-card.is-soft — hairline top rule, no box, no shadow' : '.ifc-card — full rule box'}
		</span>
	</div>
	<div class="lp-soft">
		{#each [['Professional services', '$184,220', 42], ['Infrastructure', '$92,880', 128], ['Payroll', '$318,400', 24]] as [name, total, n]}
			<div class="ifc-card" class:is-soft={softBorders}>
				<div class="ifc-stack-hdr"><span>{name}</span><span class="n">{n} entries</span></div>
				<div class="ifc-stack-row"><span>Recorded</span><span class="num">{total}</span></div>
				<div class="ifc-stack-row"><span>Reconciled</span><span class="num">{total}</span></div>
				<div class="ifc-stack-row ifc-stack-sub"><span>Variance</span><span class="num">$0</span></div>
			</div>
		{/each}
	</div>

	<div class="ifc-sec">
		<span class="ifc-sec-tag">10</span>
		<span class="ifc-sec-title">Nav-bar dropdown</span>
		<span class="ifc-sec-hint">menu, not select · one open at a time</span>
	</div>
	<p class="ifc-sec-note">
		A nav dropdown is a <strong>menu</strong>, not a select: its entries navigate, they do not hold
		a value, so it never shows a check mark and never remembers the last pick — the page you are on
		is the state and the crumb already says so. Opening one closes any other, because two open
		menus is a state nobody meant to reach. It closes on choose, on <kbd>Esc</kbd>, and on a click
		outside; the trigger keeps its accent while open so the reader can see where the panel came
		from. Each row carries a glyph, a name, and a dim hint that says how much is behind it — the
		hint is what turns a list of words into a decision.
	</p>
	<div class="ifc-card lp-navcard">
		<nav class="lp-nav">
			<span class="lp-brand"><i class="fat fa-hexagon-nodes"></i> Ledger</span>
			{#each navGroups as g (g.id)}
				<div class="lp-navitem">
					<button
						class="lp-navbtn"
						class:on={navOpen === g.id}
						aria-expanded={navOpen === g.id}
						onclick={() => (navOpen = navOpen === g.id ? null : g.id)}
					>
						<i class="fat {g.icon}"></i>
						{g.label}
						<i class="fat fa-chevron-down chev"></i>
					</button>
					{#if navOpen === g.id}
						<div class="lp-menu">
							{#each g.items as it (it.name)}
								<button class="lp-menuitem" onclick={() => (navOpen = null)}>
									<i class="fat {it.icon}"></i>
									<span class="mi-name">{it.name}</span>
									<span class="mi-hint">{it.hint}</span>
								</button>
							{/each}
						</div>
					{/if}
				</div>
			{/each}
			<span class="lp-navspacer"></span>
			<button class="ifc-btn is-glyph" title="Settings" aria-label="Settings">
				<i class="fat fa-gear"></i>
			</button>
		</nav>
		<p class="ifc-mono-note" style="margin-top:8px">
			Click a trigger, then another — the first closes itself. Click anywhere outside to dismiss.
		</p>
	</div>

	<div class="ifc-sec">
		<span class="ifc-sec-tag">11</span>
		<span class="ifc-sec-title">Drill-in rows</span>
		<span class="ifc-sec-hint">detail in place · never a new page</span>
	</div>
	<p class="ifc-sec-note">
		A summary row that opens its own breakdown underneath it, rather than navigating away. Two
		things make it work. The <strong>chevron rotates</strong> so the row states plainly that it is
		openable before anyone clicks — a row that only reveals its affordance on hover is invisible on
		a touch screen. And the detail is <strong>indented and hairlined</strong>, not boxed, so it
		reads as part of the parent rather than as a card that happened to appear. The whole row is the
		hit target, and it toggles: clicking an open row closes it. One open at a time keeps the page
		from growing under the reader's scroll position.
	</p>
	<div class="ifc-card is-hair">
		<div class="ifc-stack">
			<div class="ifc-stack-hdr">
				<span>Category</span><span class="n">entries · total</span>
			</div>
			{#each drillRows as r (r.id)}
				<button
					class="lp-drill"
					class:open={drillOpen === r.id}
					aria-expanded={drillOpen === r.id}
					onclick={() => (drillOpen = drillOpen === r.id ? null : r.id)}
				>
					<i class="fat fa-chevron-right dchev"></i>
					<span class="dname">{r.name}</span>
					<span class="dbar"><span style="width:{(r.share * 100).toFixed(0)}%"></span></span>
					<span class="dcount">{r.count}</span>
					<span class="dtotal">{r.total}</span>
				</button>
				{#if drillOpen === r.id}
					<div class="lp-drilldetail">
						{#each r.detail as d (d.k)}
							<div class="dd-row">
								<span class="dd-k">{d.k}</span>
								<span class="dd-n">{d.n}</span>
								<span class="dd-v">{d.v}</span>
							</div>
						{/each}
					</div>
				{/if}
			{/each}
		</div>
	</div>

	<div class="ifc-sec">
		<span class="ifc-sec-tag">12</span>
		<span class="ifc-sec-title">Controls over pictures</span>
		<span class="ifc-sec-hint">maps · three.js viewers</span>
	</div>
	<p class="ifc-sec-note">
		Controls laid over a map or a 3-D viewer are their own surface — translucent paper, a blur
		behind, a hairline, glyph-only buttons, and fixed corners by convention so the picture is never
		the thing you have to search. Those live with the wayfinding patterns, next to the corner
		circle-i they share a corner budget with:
		<a href="/interface/wayfinding">Wayfinding → controls over a map</a>.
	</p>

	<div class="ifc-hr"></div>
	<div class="ifc-mono-note">
		Build footer pattern — version, commit, node, and generation time in one hairline row.
	</div>
	<div class="ifc-inline" style="margin-top:6px">
		<span class="ifc-badge">v{__BUILD_VERSION__}</span>
		<span class="ifc-badge b-teal">static</span>
		<span class="ifc-badge b-vanilla">prerendered</span>
	</div>
</div>

<style>
	/* Panels are absolutely positioned, so the stage needs its own box. The
	   min-width keeps all three side by side before any dragging; `fitStage`
	   supplies the height, and the min-height below is only a pre-measure
	   fallback so the section never flashes at zero. */
	.cp-stage {
		position: relative;
		min-width: 1056px;
		min-height: 320px;
	}
	.lp-kv {
		display: flex;
		flex-direction: column;
		gap: 3px;
	}
	.lp-row {
		display: flex;
		align-items: baseline;
		gap: 6px;
		font-size: 0.68rem;
	}
	.lp-k {
		min-width: 62px;
		opacity: 0.6;
	}
	.lp-v {
		font-variant-numeric: tabular-nums;
	}
	.lp-s {
		margin-left: auto;
		opacity: 0.5;
		font-size: 0.62rem;
	}
	.lp-log {
		font-size: 0.64rem;
		opacity: 0.7;
		font-variant-numeric: tabular-nums;
	}

	.popbar {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
	}
	.pop-anchor {
		position: relative;
	}
	.popover {
		position: absolute;
		top: calc(100% + 6px);
		left: 0;
		z-index: 200;
		min-width: 220px;
		border: 1px solid var(--rule);
		background: var(--paper-pane);
		box-shadow: var(--elev);
		padding: 6px;
	}
	.popover.align-right {
		left: auto;
		right: 0;
	}
	.pop-head {
		font-size: 0.6rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--ink-muted);
		border-bottom: 1px solid var(--rule-hair);
		padding: 0 4px 4px;
		margin-bottom: 4px;
	}
	.pop-item {
		display: flex;
		align-items: center;
		gap: 6px;
		width: 100%;
		border: 0;
		background: none;
		font-family: inherit;
		font-size: 0.72rem;
		color: var(--ink);
		padding: 4px 6px;
		cursor: pointer;
		text-align: left;
	}
	.pop-item:hover {
		background: var(--color-hover-bg);
	}
	.pop-row {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		justify-content: space-between;
		font-size: 0.7rem;
		padding: 4px 6px;
	}
	.ifc-table.compact td,
	.ifc-table.compact th {
		padding-top: 0.15rem;
		padding-bottom: 0.15rem;
	}

	/* --- 09 soft surfaces --- */
	.lp-soft {
		display: grid;
		gap: var(--spacing-sm);
	}

	/* --- 10 nav dropdown --- */
	.lp-nav {
		display: flex;
		align-items: center;
		gap: 2px;
		border-bottom: 1px solid var(--rule);
		padding-bottom: 6px;
	}
	.lp-brand {
		font-family: var(--font-mono);
		font-size: 0.66rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		margin-right: var(--spacing-sm);
		display: inline-flex;
		align-items: center;
		gap: 6px;
	}
	.lp-navspacer {
		flex: 1;
	}
	.lp-navitem {
		position: relative;
	}
	.lp-navbtn {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		border: 1px solid transparent;
		background: none;
		color: var(--ink-muted);
		font-family: var(--font-mono);
		font-size: 0.62rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		padding: 5px 8px;
		cursor: pointer;
	}
	.lp-navbtn:hover {
		color: var(--ink);
		border-color: var(--rule-hair);
	}
	.lp-navbtn.on {
		color: var(--color-accent);
		border-color: var(--rule-soft);
		background: color-mix(in srgb, var(--color-accent) 8%, transparent);
	}
	.lp-navbtn .chev {
		font-size: 0.5rem;
		transition: transform 0.15s ease;
	}
	.lp-navbtn.on .chev {
		transform: rotate(180deg);
	}
	.lp-menu {
		position: absolute;
		top: calc(100% + 5px);
		left: 0;
		z-index: 20;
		min-width: 208px;
		background: var(--tip-paper, var(--paper-card));
		border: 1px solid var(--rule);
		box-shadow: var(--elev);
		padding: 3px;
		animation: lp-menu-in 0.12s ease-out;
	}
	@keyframes lp-menu-in {
		from {
			opacity: 0;
			transform: translateY(-3px);
		}
	}
	.lp-menuitem {
		display: flex;
		align-items: center;
		gap: 8px;
		width: 100%;
		border: none;
		background: none;
		cursor: pointer;
		padding: 6px 7px;
		text-align: left;
		color: var(--ink);
		font-size: 0.72rem;
		font-family: inherit;
	}
	.lp-menuitem i {
		width: 13px;
		color: var(--ink-soft);
		font-size: 0.7rem;
	}
	.lp-menuitem:hover {
		background: color-mix(in srgb, var(--color-accent) 12%, transparent);
	}
	.lp-menuitem:hover i {
		color: var(--color-accent);
	}
	.mi-hint {
		margin-left: auto;
		font-family: var(--font-mono);
		font-size: 0.56rem;
		color: var(--ink-note);
	}

	/* --- 11 drill-in rows --- */
	.lp-drill {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		width: 100%;
		border: none;
		border-bottom: 1px solid var(--rule-hair);
		background: none;
		cursor: pointer;
		padding: 7px 0;
		font-family: inherit;
		font-size: 0.74rem;
		color: var(--ink);
		text-align: left;
	}
	.lp-drill:hover {
		background: color-mix(in srgb, var(--color-accent) 7%, transparent);
	}
	.dchev {
		font-size: 0.6rem;
		width: 12px;
		color: var(--ink-soft);
		transition: transform 0.16s ease;
	}
	.lp-drill.open .dchev {
		transform: rotate(90deg);
		color: var(--color-accent);
	}
	.lp-drill.open {
		border-bottom-color: transparent;
	}
	.dname {
		min-width: 10rem;
	}
	.dbar {
		flex: 1;
		height: 5px;
		background: color-mix(in srgb, var(--ink) 8%, transparent);
		min-width: 40px;
	}
	.dbar > span {
		display: block;
		height: 100%;
		background: var(--color-accent);
		opacity: 0.55;
	}
	.dcount,
	.dtotal {
		font-family: var(--font-mono);
		font-variant-numeric: tabular-nums;
		font-size: 0.66rem;
	}
	.dcount {
		color: var(--ink-note);
		width: 3rem;
		text-align: right;
	}
	.dtotal {
		width: 5.5rem;
		text-align: right;
	}
	.lp-drilldetail {
		margin: 0 0 0 20px;
		border-left: 1px solid var(--rule-soft);
		padding-left: var(--spacing-sm);
		border-bottom: 1px solid var(--rule-hair);
	}
	.dd-row {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		padding: 4px 0;
		font-size: 0.68rem;
		color: var(--ink-muted);
	}
	.dd-k {
		min-width: 8rem;
	}
	.dd-n {
		margin-left: auto;
		font-family: var(--font-mono);
		font-size: 0.6rem;
		color: var(--ink-note);
		width: 3rem;
		text-align: right;
	}
	.dd-v {
		font-family: var(--font-mono);
		font-variant-numeric: tabular-nums;
		width: 5.5rem;
		text-align: right;
		color: var(--ink);
	}

	@media (max-width: 640px) {
		.lp-nav {
			flex-wrap: wrap;
		}
		.dbar,
		.dcount {
			display: none;
		}
	}
</style>
