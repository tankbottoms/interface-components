<script lang="ts">
	import CornerInfo from '$lib/components/CornerInfo.svelte';

	/**
	 * Everything below is local demo state. The real surfaces read the site's own
	 * stores — theme, accent, density — but the *shape* is what is being
	 * documented, and a page that mutated the live site while you read it would
	 * be a poor way to document it.
	 */
	let popoverOpen = $state(false);
	let surface = $state<'popover' | 'page'>('popover');

	let demoTheme = $state('auto');
	let demoAccent = $state('#3E9B72');
	let demoDensity = $state('comfortable');
	let demoUnits = $state('imperial');
	let demoNumbers = $state(true);
	let demoMotion = $state(true);

	const accents = [
		{ name: 'Aqua', color: '#2E8FA6' },
		{ name: 'Rose', color: '#C75F81' },
		{ name: 'Vanilla', color: '#B39B3C' },
		{ name: 'Mint', color: '#3E9B72' },
		{ name: 'Peach', color: '#C97E45' },
		{ name: 'Violet', color: '#A855C4' }
	];

	/**
	 * The settings taxonomy. Four groups, always in this order, on every site.
	 * The order is not arbitrary: Appearance is what people came for, Data is what
	 * they change second, Behaviour is rarely touched, and About is the one thing
	 * that has to be findable when something has gone wrong.
	 */
	const groups = [
		{
			id: 'appearance',
			label: 'Appearance',
			icon: 'fa-swatchbook',
			hint: 'theme · accent · density',
			note: 'Anything that changes how the page looks without changing what it says.'
		},
		{
			id: 'data',
			label: 'Data',
			icon: 'fa-database',
			hint: 'units · precision · timezone',
			note: 'Anything that changes what the numbers mean. Never mixed with appearance.'
		},
		{
			id: 'behaviour',
			label: 'Behaviour',
			icon: 'fa-sliders',
			hint: 'motion · autoplay · tours',
			note: 'Motion and interruption. Defaults follow the OS; the switch is an override.'
		},
		{
			id: 'about',
			label: 'About',
			icon: 'fa-circle-info',
			hint: 'build · source · reset',
			note: 'Version, commit, data vintage, and the one button that clears preferences.'
		}
	];

	/* --- analytics demo data --- */
	const kpis = [
		{ label: 'Sessions', value: '4,182', sub: '+8.1% vs prior 90d', dir: 'up' },
		{ label: 'Pages / session', value: '3.4', sub: '+0.2', dir: 'up' },
		{ label: 'Median dwell', value: '1m 52s', sub: '−11s', dir: 'down' },
		{ label: 'Return rate', value: '31%', sub: '+3 pts', dir: 'up' }
	];

	/** Deterministic — a generated figure, never a fetch. */
	function series(n: number, seedIn: number): number[] {
		let s = seedIn;
		const out: number[] = [];
		for (let i = 0; i < n; i++) {
			s = (s * 1103515245 + 12345) % 2147483648;
			out.push(0.35 + (s / 2147483648) * 0.5 + Math.sin(i / 7) * 0.12);
		}
		return out;
	}

	function sparkPath(vals: number[], w: number, h: number): string {
		const max = Math.max(...vals);
		const min = Math.min(...vals);
		const span = max - min || 1;
		return vals
			.map((v, i) => {
				const x = (i / (vals.length - 1)) * w;
				const y = h - ((v - min) / span) * (h - 3) - 1.5;
				return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
			})
			.join(' ');
	}

	function sparkFill(vals: number[], w: number, h: number): string {
		return `${sparkPath(vals, w, h)} L${w},${h} L0,${h} Z`;
	}

	const sparks = kpis.map((_, i) => series(32, 17 + i * 91));

	const topPages = [
		{ path: '/interface/charting', views: 1284, share: 1.0, dwell: '2m 41s' },
		{ path: '/interface/layout', views: 942, share: 0.73, dwell: '3m 08s' },
		{ path: '/components/panel', views: 731, share: 0.57, dwell: '1m 55s' },
		{ path: '/interface/palette', views: 610, share: 0.48, dwell: '1m 12s' },
		{ path: '/interface/wayfinding', views: 388, share: 0.3, dwell: '4m 02s' },
		{ path: '/interface/documents', views: 264, share: 0.21, dwell: '2m 19s' }
	];
</script>

<svelte:window
	onclick={(e) => {
		if (popoverOpen && !(e.target as HTMLElement).closest('.st-gearwrap')) popoverOpen = false;
	}}
	onkeydown={(e) => {
		if (e.key === 'Escape') popoverOpen = false;
	}}
/>

<svelte:head>
	<title>Settings &amp; Analytics — Interface Components</title>
</svelte:head>

<div class="ifc">
	<header class="ifc-page-head">
		<div class="ifc-eyebrow">Interface · 06</div>
		<h1 class="ifc-page-title">Settings &amp; Analytics</h1>
		<p class="ifc-page-lede">
			Two surfaces every site in the house gets for free, and gets in the same shape. A
			<strong>gear</strong> in the top-right that carries theme and site preferences — as a popover
			when there are few, as a page when there are many, with the identical groups either way. And a
			<strong>built-in analytics page</strong>, generated from the site's own traffic, so a dashboard
			can answer questions about itself without a third-party script and without leaving.
		</p>
	</header>

	<div class="ifc-sec">
		<span class="ifc-sec-tag">01</span>
		<span class="ifc-sec-title">The gear</span>
		<span class="ifc-sec-hint">glyph only · top right · never labelled</span>
	</div>
	<p class="ifc-sec-note">
		One glyph, <code>fa-gear</code>, thin, no border, no word next to it. It sits at the right end of
		the header rail because that is where every operating system and every browser has put it for
		twenty years, and a settings control is the one place in an interface where being conventional
		beats being interesting. It carries a <code>title</code> and an <code>aria-label</code>, so the
		word exists for anyone who needs it — it just is not printed on the page. While its surface is
		open the glyph takes the accent, which is how the reader knows which of several header glyphs
		produced the panel.
	</p>
	<div class="ifc-card ifc-has-corner">
		<CornerInfo
			title="Header rail"
			body="Left is identity and where you are. Right is what you can change. Nothing crosses over."
			corner="tr"
		/>
		<div class="st-header">
			<span class="st-brand"><i class="fat fa-hexagon-nodes"></i> Ledger</span>
			<span class="st-crumb">Car 1 · Drive stats · 90d</span>
			<span class="st-spacer"></span>
			<button class="ifc-btn is-glyph" title="Copy link" aria-label="Copy link">
				<i class="fat fa-link"></i>
			</button>
			<button class="ifc-btn is-glyph" title="Print" aria-label="Print">
				<i class="fat fa-print"></i>
			</button>
			<span class="st-gearwrap">
				<button
					class="ifc-btn is-glyph"
					class:is-active={popoverOpen}
					title="Settings"
					aria-label="Settings"
					aria-expanded={popoverOpen}
					onclick={() => (popoverOpen = !popoverOpen)}
				>
					<i class="fat fa-gear"></i>
				</button>
				{#if popoverOpen}
					<div class="st-pop">
						<div class="st-pop-hdr">Settings</div>

						<div class="st-grp">Appearance</div>
						<div class="st-field">
							<span class="st-lbl">Theme</span>
							<div class="st-seg">
								{#each [['auto', 'fa-circle-half-stroke'], ['light', 'fa-sun-bright'], ['dark', 'fa-moon']] as [id, icon]}
									<button
										class="st-segbtn"
										class:on={demoTheme === id}
										onclick={() => (demoTheme = id)}
										title={id}
										aria-label={id}
									>
										<i class="fat {icon}"></i>
									</button>
								{/each}
							</div>
						</div>
						<div class="st-field">
							<span class="st-lbl">Accent</span>
							<div class="st-dots">
								{#each accents as a (a.color)}
									<button
										class="st-dot"
										class:on={demoAccent === a.color}
										style="background:{a.color}"
										onclick={() => (demoAccent = a.color)}
										title={a.name}
										aria-label={a.name}
									></button>
								{/each}
							</div>
						</div>
						<div class="st-field">
							<span class="st-lbl">Density</span>
							<div class="st-seg">
								{#each ['compact', 'comfortable'] as d}
									<button class="st-segbtn wide" class:on={demoDensity === d} onclick={() => (demoDensity = d)}>
										{d}
									</button>
								{/each}
							</div>
						</div>

						<div class="st-grp">Data</div>
						<div class="st-field">
							<span class="st-lbl">Units</span>
							<div class="st-seg">
								{#each ['metric', 'imperial'] as u}
									<button class="st-segbtn wide" class:on={demoUnits === u} onclick={() => (demoUnits = u)}>
										{u}
									</button>
								{/each}
							</div>
						</div>
						<button class="st-field as-row" onclick={() => (demoNumbers = !demoNumbers)}>
							<span class="st-lbl">Thousands separators</span>
							<span class="st-sw" class:on={demoNumbers}></span>
						</button>

						<div class="st-grp">Behaviour</div>
						<button class="st-field as-row" onclick={() => (demoMotion = !demoMotion)}>
							<span class="st-lbl">Animate transitions</span>
							<span class="st-sw" class:on={demoMotion}></span>
						</button>

						<div class="st-pop-ft">
							<span class="ifc-mono-note">v{__BUILD_VERSION__}</span>
							<a href="/interface/settings">All settings →</a>
						</div>
					</div>
				{/if}
			</span>
		</div>
		<p class="ifc-mono-note" style="margin-top:8px">
			Click the gear. Escape or an outside click dismisses it — a settings panel is never modal,
			because nothing in it needs confirming.
		</p>
	</div>

	<div class="ifc-sec">
		<span class="ifc-sec-tag">02</span>
		<span class="ifc-sec-title">Popover or page</span>
		<span class="ifc-sec-hint">same groups · same order · same names</span>
	</div>
	<p class="ifc-sec-note">
		The choice is arithmetic, not taste. <strong>Under about eight controls, use the popover</strong>
		— it keeps the reader on the page they were reading, which is the whole point of a preference.
		<strong>Over that, use a page</strong>, because a popover tall enough to scroll has become a page
		with worse ergonomics and no URL. What must not change between them is the vocabulary: the same
		four groups, in the same order, with the same labels, so someone who learned the popover on one
		site can find the same switch on a settings page on another. The popover always ends with a link
		to the page; the page never links back.
	</p>
	<div class="ifc-btn-row" style="margin-bottom:8px">
		<button class="ifc-btn" class:is-active={surface === 'popover'} onclick={() => (surface = 'popover')}>
			<i class="fat fa-window-restore"></i> Popover
		</button>
		<button class="ifc-btn" class:is-active={surface === 'page'} onclick={() => (surface = 'page')}>
			<i class="fat fa-file-lines"></i> Dedicated page
		</button>
	</div>
	<div class="ifc-card is-hair">
		<div class="ifc-stack">
			<div class="ifc-stack-hdr">
				<span>{surface === 'popover' ? 'Popover — anchored, ~320px, no URL' : 'Page — /settings, full width, linkable'}</span>
				<span class="n">{groups.length} groups</span>
			</div>
			{#each groups as g (g.id)}
				<div class="ifc-stack-row">
					<i class="fat {g.icon}" style="width:14px;color:var(--ink-soft)"></i>
					<span style="min-width:7rem"><strong>{g.label}</strong></span>
					<span class="ifc-mono-note" style="margin:0">{g.note}</span>
					<span class="num">{g.hint}</span>
				</div>
			{/each}
		</div>
		<p class="ifc-mono-note" style="margin-top:8px">
			{surface === 'popover'
				? 'Anchored to the gear, dismissed by Escape or an outside click, state persists to localStorage on change — there is no Save button, because there is nothing to cancel.'
				: 'Its own route, deep-linkable per group anchor, wide enough for an explanatory line under each control. Same store, same keys — the two surfaces are two renderings of one object.'}
		</p>
	</div>

	<div class="ifc-sec">
		<span class="ifc-sec-tag">03</span>
		<span class="ifc-sec-title">Built-in analytics</span>
		<span class="ifc-sec-hint">the site measuring itself</span>
	</div>
	<p class="ifc-sec-note">
		Every site gets an <code>/analytics</code> route built from its own request log — no third-party
		script, no consent banner, nothing leaving the origin. The page is always the same three bands,
		top to bottom: a <strong>KPI strip with sparklines</strong> so each number carries its own trend,
		a <strong>shape-of-traffic chart</strong> over the selected range, and a <strong>dense table</strong>
		of what was actually looked at. Range selection lives in the header as a segmented control and is
		reflected in the query string (<code>?range=90d</code>), so a link to an interesting week is a
		link someone else can open.
	</p>
	<div class="ifc-card">
		<div class="ifc-card-hdr">
			<span class="ifc-card-title"><i class="fat fa-chart-mixed"></i> Analytics</span>
			<span class="ifc-btn-row">
				{#each ['7d', '30d', '90d', '1y'] as r}
					<button class="ifc-btn" class:is-active={r === '90d'}>{r}</button>
				{/each}
			</span>
		</div>
		<div class="st-kpis">
			{#each kpis as k, i (k.label)}
				<div class="st-kpi">
					<div class="st-kpi-lbl">{k.label}</div>
					<div class="st-kpi-val">{k.value}</div>
					<svg class="st-spark" viewBox="0 0 120 26" preserveAspectRatio="none" aria-hidden="true">
						<path class="sp-fill" d={sparkFill(sparks[i], 120, 26)} />
						<path class="sp-line" d={sparkPath(sparks[i], 120, 26)} />
					</svg>
					<div class="st-kpi-sub" class:down={k.dir === 'down'}>
						<i class="fat {k.dir === 'up' ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'}"></i>
						{k.sub}
					</div>
				</div>
			{/each}
		</div>
		<p class="ifc-mono-note" style="margin-top:10px">
			The fill is not decoration. A stroke alone reads as a squiggle; a filled area reads as a
			quantity, and the eye takes the direction from it without stopping to trace the line.
		</p>
	</div>

	<div class="ifc-card is-hair" style="margin-top:var(--spacing-sm)">
		<div class="ifc-block-hdr">Most-read pages · last 90 days</div>
		<table class="ifc-table">
			<thead>
				<tr>
					<th>Path</th>
					<th class="num">Views</th>
					<th>Share</th>
					<th class="num">Median dwell</th>
				</tr>
			</thead>
			<tbody>
				{#each topPages as p (p.path)}
					<tr>
						<td><code>{p.path}</code></td>
						<td class="num">{p.views.toLocaleString()}</td>
						<td>
							<span class="st-bar"><span style="width:{(p.share * 100).toFixed(0)}%"></span></span>
						</td>
						<td class="num">{p.dwell}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<div class="ifc-sec">
		<span class="ifc-sec-tag">04</span>
		<span class="ifc-sec-title">Rules</span>
		<span class="ifc-sec-hint">what these two surfaces refuse</span>
	</div>
	<div class="ifc-card is-hair">
		<div class="ifc-stack">
			<div class="ifc-stack-hdr"><span>Refused</span><span class="n">Instead</span></div>
			{#each [['A Save button in settings', 'Persist on change; a preference has nothing to cancel'], ['A modal settings dialog', 'A dismissible popover — you must be able to see the page you are changing'], ['Theme in one place, accent in another', 'One Appearance group, always, on every site'], ['A third-party analytics script', "The site's own request log, rendered by the site"], ['A KPI number with no trend', 'Every KPI carries a filled sparkline'], ['Range in component state only', 'Range in the query string, so the view is a link']] as [no, yes]}
				<div class="ifc-stack-row">
					<i class="fat fa-xmark" style="width:12px;color:var(--ink-note)"></i>
					<span style="min-width:16rem">{no}</span>
					<span class="ifc-mono-note" style="margin:0 0 0 auto;text-align:right">{yes}</span>
				</div>
			{/each}
		</div>
	</div>

	<div class="ifc-hr"></div>
	<div class="ifc-mono-note">
		Settings surfaces are two renderings of one preference object; analytics is generated from the
		origin's own log. Neither ships a dependency.
	</div>
	<div class="ifc-inline" style="margin-top:6px">
		<span class="ifc-badge">v{__BUILD_VERSION__}</span>
		<span class="ifc-badge b-mint">local-only</span>
		<span class="ifc-badge b-vanilla">no third-party</span>
	</div>
</div>

<style>
	/* --- 01 header rail --- */
	.st-header {
		display: flex;
		align-items: center;
		gap: 4px;
		border-bottom: 1px solid var(--rule);
		padding-bottom: 7px;
	}
	.st-brand {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-family: var(--font-mono);
		font-size: 0.66rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}
	.st-crumb {
		font-family: var(--font-mono);
		font-size: 0.6rem;
		color: var(--ink-note);
		margin-left: var(--spacing-sm);
	}
	.st-spacer {
		flex: 1;
	}
	.st-gearwrap {
		position: relative;
		display: inline-flex;
	}

	/* --- settings popover --- */
	.st-pop {
		position: absolute;
		top: calc(100% + 6px);
		right: 0;
		z-index: 30;
		width: 268px;
		background: var(--tip-paper, var(--paper-card));
		border: 1px solid var(--rule);
		box-shadow: var(--elev);
		padding: var(--spacing-sm);
		animation: st-in 0.12s ease-out;
	}
	@keyframes st-in {
		from {
			opacity: 0;
			transform: translateY(-3px);
		}
	}
	.st-pop-hdr {
		font-family: var(--font-mono);
		font-size: 0.58rem;
		font-weight: 800;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--ink-soft);
		border-bottom: 1px solid var(--rule-soft);
		padding-bottom: 5px;
		margin-bottom: 6px;
	}
	.st-grp {
		font-family: var(--font-mono);
		font-size: 0.54rem;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--ink-note);
		margin: 9px 0 4px;
	}
	.st-grp:first-of-type {
		margin-top: 2px;
	}
	.st-field {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		padding: 3px 0;
		width: 100%;
	}
	.st-field.as-row {
		border: none;
		background: none;
		cursor: pointer;
		font-family: inherit;
		text-align: left;
		padding: 4px 0;
	}
	.st-lbl {
		font-size: 0.68rem;
		color: var(--ink-muted);
	}
	.st-seg,
	.st-dots {
		margin-left: auto;
		display: flex;
	}
	.st-seg {
		border: 1px solid var(--rule-soft);
	}
	.st-segbtn {
		border: none;
		background: none;
		cursor: pointer;
		color: var(--ink-muted);
		font-family: var(--font-mono);
		font-size: 0.56rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		padding: 0;
		width: 26px;
		height: 21px;
		display: grid;
		place-items: center;
	}
	.st-segbtn.wide {
		width: auto;
		padding: 0 7px;
	}
	.st-segbtn + .st-segbtn {
		border-left: 1px solid var(--rule-hair);
	}
	.st-segbtn:hover {
		color: var(--ink);
	}
	.st-segbtn.on {
		color: var(--color-accent);
		background: color-mix(in srgb, var(--color-accent) 14%, transparent);
	}
	.st-dots {
		gap: 4px;
	}
	.st-dot {
		width: 14px;
		height: 14px;
		border: 1px solid var(--rule-soft);
		cursor: pointer;
		padding: 0;
	}
	.st-dot.on {
		outline: 1px solid var(--ink);
		outline-offset: 1px;
	}
	.st-sw {
		margin-left: auto;
		width: 26px;
		height: 14px;
		border: 1px solid var(--rule-soft);
		background: color-mix(in srgb, var(--ink) 6%, transparent);
		position: relative;
		flex: none;
	}
	.st-sw::after {
		content: '';
		position: absolute;
		top: 1px;
		left: 1px;
		width: 10px;
		height: 10px;
		background: var(--ink-soft);
		transition:
			transform 0.14s ease,
			background 0.14s ease;
	}
	.st-sw.on {
		background: color-mix(in srgb, var(--color-accent) 16%, transparent);
		border-color: var(--color-accent);
	}
	.st-sw.on::after {
		transform: translateX(12px);
		background: var(--color-accent);
	}
	.st-pop-ft {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--spacing-sm);
		border-top: 1px solid var(--rule-soft);
		margin-top: 9px;
		padding-top: 6px;
	}
	.st-pop-ft :global(.ifc-mono-note) {
		margin: 0;
	}
	.st-pop-ft a {
		font-family: var(--font-mono);
		font-size: 0.58rem;
		color: var(--color-accent);
		text-decoration: none;
	}

	/* --- 03 analytics --- */
	.st-kpis {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(148px, 1fr));
		gap: var(--spacing-sm);
	}
	.st-kpi {
		border-left: 2px solid var(--rule-soft);
		padding-left: var(--spacing-sm);
	}
	.st-kpi-lbl {
		font-family: var(--font-mono);
		font-size: 0.55rem;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--ink-note);
	}
	.st-kpi-val {
		font-family: var(--font-mono);
		font-variant-numeric: tabular-nums;
		font-size: 1.28rem;
		line-height: 1.2;
		margin: 1px 0 2px;
	}
	.st-spark {
		display: block;
		width: 100%;
		height: 26px;
	}
	.sp-fill {
		fill: color-mix(in srgb, var(--color-accent) 22%, transparent);
	}
	.sp-line {
		fill: none;
		stroke: var(--color-accent);
		stroke-width: 1.1;
	}
	.st-kpi-sub {
		font-family: var(--font-mono);
		font-size: 0.56rem;
		color: var(--ink-soft);
		margin-top: 2px;
	}
	.st-kpi-sub i {
		font-size: 0.55rem;
	}
	.st-kpi-sub.down {
		color: var(--ink-note);
	}
	.st-bar {
		display: block;
		height: 6px;
		min-width: 48px;
		background: color-mix(in srgb, var(--ink) 8%, transparent);
	}
	.st-bar > span {
		display: block;
		height: 100%;
		background: var(--color-accent);
		opacity: 0.55;
	}

	@media (max-width: 640px) {
		.st-crumb {
			display: none;
		}
		.st-pop {
			width: 240px;
		}
	}
</style>
