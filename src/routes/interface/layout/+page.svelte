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
		pick
	} from '$lib/interface/generate';

	let seed = $state(11);
	const reshuffle = () => (seed = (seed * 37 + 5) % 99991);

	const kpis = $derived.by(() => {
		const r = rng(seed);
		return [
			{ label: 'Documents', value: fmtNum(between(r, 18_000, 42_000)), sub: 'indexed' },
			{ label: 'Agencies', value: fmtNum(between(r, 40, 120)), sub: 'sources' },
			{ label: 'Pages', value: fmtNum(between(r, 400_000, 950_000)), sub: 'extracted' },
			{ label: 'Corpus', value: fmtBytes(between(r, 40e9, 120e9)), sub: 'on disk' },
			{ label: 'Enriched', value: `${between(r, 61, 97).toFixed(1)}%`, sub: 'with metadata' }
		];
	});

	const nodes = $derived.by(() => {
		const names = ['spark-1', 'spark-2', 'node-eighteen', 'unraid-one', 'hostinger-vps'];
		return names.map((name, i) => {
			const r = rng(seed + i * 13);
			const up = r() > 0.16;
			return {
				name,
				up,
				role: ['GPU', 'GPU', 'ENRICH', 'STORE', 'EDGE'][i],
				link: pick(r, ['10 Gb/s', '2.5 Gb/s', '1 Gb/s', '1 Gb/s']),
				load: between(r, 3, 96),
				disk: between(r, 18, 93),
				rtt: between(r, 0.3, 42),
				trend: walk(32, { seed: seed + 100 + i, min: 2, max: 100, step: 16 })
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
		return Array.from({ length: 8 }, () => ({
			file: `${pick(r, ['DOJ', 'SEC', 'LASC', 'FTC'])}-${intBetween(r, 1000, 9999)}.pdf`,
			size: between(r, 40_000, 90_000_000),
			pages: intBetween(r, 1, 420),
			ocr: between(r, 74, 99.8),
			state: pick(r, ['indexed', 'queued', 'failed', 'indexed', 'indexed'])
		}));
	});

	const stateToken = (s: string) =>
		s === 'indexed' ? 'b-mint' : s === 'queued' ? 'b-vanilla' : 'b-blush';
</script>

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
		<div class="ifc-btn-row" style="margin-top:var(--spacing-sm)">
			<button class="ifc-btn" onclick={reshuffle}><i class="fas fa-rotate"></i> Reshuffle</button>
			<span class="ifc-mono-note" style="align-self:center">seed {seed}</span>
		</div>
	</header>

	<!-- 01 banners --------------------------------------------------- -->
	<div class="ifc-sec">
		<span class="ifc-sec-tag">01</span>
		<span class="ifc-sec-title">Banners &amp; notices</span>
		<span class="ifc-sec-hint">four intents</span>
	</div>
	<div class="ifc-stack">
		<div class="ifc-banner">
			<i class="fas fa-triangle-exclamation"></i>
			<div>
				<strong>Development build.</strong> Figures on this page are generated on load and do not
				describe any real system.
			</div>
		</div>
		<div class="ifc-banner is-info">
			<i class="fas fa-circle-info"></i>
			<div>Corpus re-indexed 4 minutes ago. Full-text search reflects the latest ingest.</div>
		</div>
		<div class="ifc-banner is-ok">
			<i class="fas fa-circle-check"></i>
			<div>All five nodes reporting. Replication lag under one second.</div>
		</div>
		<div class="ifc-banner is-crit">
			<i class="fas fa-circle-exclamation"></i>
			<div>Two documents failed OCR and were quarantined for manual review.</div>
		</div>
		<div class="ifc-notice">
			<i class="fas fa-wand-magic-sparkles"></i>
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
		{#each kpis as k}
			<div class="ifc-tile">
				<div class="ifc-tile-label">{k.label}</div>
				<div class="ifc-tile-value">{k.value}</div>
				<div class="ifc-tile-sub">{k.sub}</div>
			</div>
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
		<span class="ifc-badge b-mint"><i class="fas fa-check"></i> verified</span>
		<span class="ifc-badge b-blush"><i class="fas fa-xmark"></i> failed</span>
		<span class="ifc-badge b-vanilla"><i class="fas fa-clock"></i> queued</span>
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
					<i class="fas fa-bars"></i> Menu
				</button>
				{#if menuOpen}
					<div class="popover">
						<div class="pop-head">Navigate</div>
						{#each ['Overview', 'Agencies', 'Documents', 'Statutes', 'Parties', 'Timeline'] as item}
							<button class="pop-item"><i class="fas fa-angle-right"></i> {item}</button>
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
					<i class="fas fa-gear"></i> Settings
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
								<a class="ifc-btn" href="/interface/documents"><i class="fas fa-file-lines"></i> Open</a>
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
		{#each nodes as n}
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
				{#each table as row}
					<tr>
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
		box-shadow: var(--brutal-shadow);
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
</style>
