<script lang="ts">
	import { rng, between, intBetween, pick, fmtBytes } from '$lib/interface/generate';
	import { fitStage } from '$lib/interface/fitStage';
	import { magxById } from '$lib/interface/magx';

	/**
	 * Document detail layout, modelled on the postcrime `/doc/:id` view:
	 * breadcrumb + tools, meta badge row, title block with a serif citation,
	 * action buttons, enriched metadata, tag groups, extracted insights, and a
	 * split PDF / text-layer pane. All content synthetic.
	 */
	let seed = $state(58);
	const reshuffle = () => (seed = (seed * 41 + 13) % 9973);

	const doc = $derived.by(() => {
		const r = rng(seed);
		const pages = intBetween(r, 8, 214);
		return {
			id: seed,
			agency: 'Department of Justice',
			unit: 'Civil Division · Fraud Section',
			title: 'Complaint in Intervention for Civil Penalties and Treble Damages',
			rawTitle: `doj-civ-${seed}-complaint-in-intervention-FINAL_v3(signed).pdf`,
			citation: `United States ex rel. Doe v. Meridian Health Sys., No. 2:${intBetween(r, 18, 25)}-cv-0${intBetween(r, 1000, 9999)} (C.D. Cal. filed ${pick(r, ['Mar.', 'Jun.', 'Sep.', 'Nov.'])} ${intBetween(r, 1, 28)}, 20${intBetween(r, 18, 25)}).`,
			pages,
			size: between(r, 220_000, 42_000_000),
			filed: `20${intBetween(r, 18, 25)}-${String(intBetween(r, 1, 12)).padStart(2, '0')}-${String(intBetween(r, 1, 28)).padStart(2, '0')}`,
			ocr: between(r, 78, 99.6),
			source: r() > 0.45 ? 'DB' : 'FS',
			dbMs: between(r, 0.4, 8),
			fsMs: between(r, 3, 62),
			scanned: r() > 0.5,
			entities: intBetween(r, 12, 180),
			statutes: ['31 U.S.C. § 3729(a)(1)(A)', '31 U.S.C. § 3730(b)', '42 U.S.C. § 1320a-7b(b)'],
			parties: ['United States of America', 'Meridian Health Systems, Inc.', 'John Doe, Relator'],
			keywords: ['upcoding', 'kickback', 'medical necessity', 'certification', 'materiality'],
			insights: [
				{
					cap: 'Claim theory',
					token: 'aqua',
					body: 'Presentment of claims for services that were medically unnecessary, with certification of compliance alleged to be materially false under Escobar.'
				},
				{
					cap: 'Exposure',
					token: 'peach',
					body: `Treble damages on $${between(r, 4, 88).toFixed(1)}M in alleged overpayments plus per-claim penalties across ${intBetween(r, 900, 40_000).toLocaleString('en-US')} claims.`
				},
				{
					cap: 'Procedural posture',
					token: 'mint',
					body: `Seal partially lifted; government intervened as to counts I–III. ${intBetween(r, 2, 9)} related matters consolidated.`
				}
			]
		};
	});

	const pageText = $derived.by(() => {
		const r = rng(seed + 5);
		const lines = [
			'IN THE UNITED STATES DISTRICT COURT',
			'FOR THE CENTRAL DISTRICT OF CALIFORNIA',
			'',
			'   UNITED STATES OF AMERICA,   )',
			'   ex rel. JOHN DOE,           )   Case No. 2:24-cv-04417',
			'                   Plaintiffs, )',
			'          v.                   )   COMPLAINT IN INTERVENTION',
			'   MERIDIAN HEALTH SYSTEMS,    )',
			'                    Defendant. )',
			'',
			'   1.  The United States brings this action to recover treble damages',
			'and civil penalties under the False Claims Act, 31 U.S.C. §§ 3729-3733.',
			'',
			`   2.  Between 20${intBetween(r, 15, 20)} and 20${intBetween(r, 21, 25)}, Defendant submitted or caused`,
			`to be submitted at least ${intBetween(r, 900, 40_000).toLocaleString('en-US')} claims for reimbursement that were`,
			'false or fraudulent within the meaning of the Act.',
			'',
			'   3.  Defendant certified compliance with conditions of payment that',
			'it knew, or acted in reckless disregard of, to be untrue.'
		];
		return lines.join('\n');
	});

	let stripWs = $state(true);
	let view = $state<'pdf' | 'text'>('pdf');

	const rendered = $derived(
		stripWs
			? pageText
					.split('\n')
					.map((l) => l.replace(/\s+/g, ' ').trim())
					.join('\n')
			: pageText
	);

	/**
	 * Closing section: the same record rebuilt out of panel elements. The Viewer
	 * panel is wired to the page rather than to a copy of it — its dropdown and
	 * toggle drive the split pane in section 04, and its button reseeds the
	 * document. One document-level listener covers all of them.
	 */
	const CP_W = 336;
	let panelStage: HTMLDivElement | null = $state(null);
	$effect(() => (panelStage ? fitStage(panelStage, 12) : undefined));

	$effect(() => {
		const read = (id: string): any => (magxById(id) as any)?.getValue?.();
		const onChange = (e: Event) => {
			const id = (e as CustomEvent).detail?.panelElementId as string;
			if (id === 'dp-view') view = read(id)?.index === 1 ? 'text' : 'pdf';
			else if (id === 'dp-strip') stripWs = !!read(id);
			else if (id === 'dp-next') reshuffle();
		};
		document.addEventListener('magx-panelValueChanged', onChange);
		return () => document.removeEventListener('magx-panelValueChanged', onChange);
	});
</script>

<svelte:head>
	<title>Documents — Interface Components</title>
</svelte:head>

<div class="ifc">
	<header class="ifc-page-head">
		<div class="ifc-eyebrow">Interface · 03</div>
		<h1 class="ifc-page-title">Documents</h1>
		<p class="ifc-page-lede">
			The document-detail layout: breadcrumb and tools, a metadata badge row, a title block that
			separates the human title from the raw filename and the formal citation, action buttons,
			enriched metadata, tag groups, extracted insights, and a split source/text pane.
		</p>
		<div class="ifc-btn-row" style="margin-top:var(--spacing-sm)">
			<button class="ifc-btn" onclick={reshuffle}><i class="fat fa-rotate"></i> Load another</button>
			<span class="ifc-mono-note" style="align-self:center">doc #{doc.id}</span>
		</div>
	</header>

	<!-- breadcrumbs + tools ------------------------------------------ -->
	<nav class="ifc-crumbs">
		<a href="/interface/layout">Corpus</a>
		<span class="sep">/</span>
		<a href="/interface/layout">{doc.agency}</a>
		<span class="sep">/</span>
		<span class="current">doc/{doc.id}</span>
		<span class="ifc-crumb-tools">
			<span class="ifc-chip"
				><span class="ifc-chip-dot"></span><span class="ifc-chip-label">DB</span><span
					class="ifc-chip-lat">{doc.dbMs.toFixed(1)} ms</span
				></span
			>
			<span class="ifc-chip"
				><span class="ifc-chip-dot" class:is-warn={doc.fsMs > 40}></span><span class="ifc-chip-label"
					>FS</span
				><span class="ifc-chip-lat">{doc.fsMs.toFixed(1)} ms</span></span
			>
			<button class="ifc-btn is-glyph" title="Copy link" aria-label="Copy link"
				><i class="fat fa-link"></i></button
			>
			<button class="ifc-btn is-glyph" title="Print" aria-label="Print"
				><i class="fat fa-print"></i></button
			>
			<button class="ifc-btn is-glyph" title="Settings" aria-label="Settings"
				><i class="fat fa-gear"></i></button
			>
		</span>
	</nav>

	<!-- title block --------------------------------------------------- -->
	<div class="ifc-inline" style="margin-bottom:6px">
		<span class="ifc-badge is-raised b-aqua">{doc.agency}</span>
		<span class="ifc-badge b-lilac">{doc.unit}</span>
		<span class="ifc-badge b-vanilla">filed {doc.filed}</span>
		<span class="ifc-badge">{doc.pages} pp</span>
		<span class="ifc-badge">{fmtBytes(doc.size)}</span>
		<span class="ifc-badge b-{doc.ocr > 95 ? 'mint' : 'peach'}">OCR {doc.ocr.toFixed(1)}%</span>
		<span class="ifc-badge b-{doc.source === 'DB' ? 'mint' : 'peach'}">{doc.source}</span>
	</div>

	<h2 class="doc-title">{doc.title}</h2>
	<div class="doc-raw">{doc.rawTitle}</div>
	<p class="doc-cite">{doc.citation}</p>

	<div class="ifc-btn-row" style="margin:var(--spacing-sm) 0">
		<button class="ifc-btn"><i class="fat fa-file-pdf"></i> PDF</button>
		<button class="ifc-btn"><i class="fat fa-file-lines"></i> Source</button>
		<button class="ifc-btn"><i class="fat fa-brackets-curly"></i> JSON</button>
		<button class="ifc-btn"><i class="fat fa-quote-right"></i> Cite</button>
	</div>

	{#if doc.scanned}
		<div class="ifc-notice" style="margin-bottom:var(--spacing-md)">
			<i class="fat fa-triangle-exclamation"></i>
			<span
				>Scanned filing — text layer produced by OCR at {doc.ocr.toFixed(1)}% mean confidence.</span
			>
			<button class="ifc-notice-action ifc-btn">Reprocess →</button>
		</div>
	{/if}

	<!-- enriched metadata --------------------------------------------- -->
	<div class="ifc-block-hdr">Enriched metadata</div>
	<div class="ifc-grid ifc-grid-2">
		<dl class="ifc-kv">
			<dt>Doc ID</dt>
			<dd>{doc.id}</dd>
			<dt>Agency</dt>
			<dd>{doc.agency}</dd>
			<dt>Unit</dt>
			<dd>{doc.unit}</dd>
			<dt>Filed</dt>
			<dd>{doc.filed}</dd>
		</dl>
		<dl class="ifc-kv">
			<dt>Pages</dt>
			<dd>{doc.pages}</dd>
			<dt>Bytes</dt>
			<dd>{fmtBytes(doc.size)}</dd>
			<dt>Entities</dt>
			<dd>{doc.entities} extracted</dd>
			<dt>Store</dt>
			<dd>{doc.source === 'DB' ? 'sqlite (wal)' : 'nfs · unraid-one'}</dd>
		</dl>
	</div>

	<!-- tag groups ----------------------------------------------------- -->
	<div class="ifc-block-hdr">Statutes</div>
	<div class="ifc-pills">
		{#each doc.statutes as s}<span class="ifc-pill is-link">{s}</span>{/each}
	</div>
	<div class="ifc-block-hdr">Parties</div>
	<div class="ifc-pills">
		{#each doc.parties as p}<span class="ifc-pill">{p}</span>{/each}
	</div>
	<div class="ifc-block-hdr">Keywords</div>
	<div class="ifc-pills">
		{#each doc.keywords as k}<span class="ifc-pill">{k}</span>{/each}
	</div>

	<!-- insights ------------------------------------------------------- -->
	<div class="ifc-block-hdr">Extracted insights</div>
	<div class="ifc-grid ifc-grid-3">
		{#each doc.insights as ins}
			<div class="ifc-card insight" style="border-left:5px solid var(--stroke-{ins.token})">
				<div class="ifc-card-title" style="margin-bottom:4px">{ins.cap}</div>
				<p class="ifc-mono-note">{ins.body}</p>
			</div>
		{/each}
	</div>

	<!-- split pane ------------------------------------------------------ -->
	<div class="ifc-sec">
		<span class="ifc-sec-tag">04</span>
		<span class="ifc-sec-title">Source &amp; text layer</span>
		<span class="ifc-sec-hint">page render beside extracted text</span>
	</div>
	<div class="ifc-btn-row" style="margin-bottom:var(--spacing-sm)">
		<button class="ifc-btn" class:is-active={view === 'pdf'} onclick={() => (view = 'pdf')}>
			<i class="fat fa-file-pdf"></i> Both
		</button>
		<button class="ifc-btn" class:is-active={view === 'text'} onclick={() => (view = 'text')}>
			<i class="fat fa-align-left"></i> Text only
		</button>
		<button class="ifc-btn" class:is-active={stripWs} onclick={() => (stripWs = !stripWs)}>
			<i class="fat fa-scissors"></i> Strip whitespace {stripWs ? 'on' : 'off'}
		</button>
	</div>

	<div class="ifc-split" style={view === 'text' ? 'grid-template-columns:minmax(0,1fr)' : ''}>
		{#if view === 'pdf'}
			<div class="ifc-pane">
				<div class="ifc-pane-hdr">
					<i class="fat fa-file-pdf"></i> Page 1 of {doc.pages}
					<span style="margin-left:auto">{fmtBytes(doc.size)}</span>
				</div>
				<div class="pdf-stage">
					<div class="pdf-page">
						<div class="pdf-caption">UNITED STATES DISTRICT COURT</div>
						<div class="pdf-rule"></div>
						{#each Array(16) as _, i}
							<div class="pdf-line" style="width:{55 + ((i * 37) % 42)}%"></div>
						{/each}
						<div class="pdf-rule"></div>
						{#each Array(6) as _, i}
							<div class="pdf-line" style="width:{40 + ((i * 53) % 50)}%"></div>
						{/each}
						<div class="pdf-folio">— 1 —</div>
					</div>
				</div>
			</div>
		{/if}
		<div class="ifc-pane">
			<div class="ifc-pane-hdr">
				<i class="fat fa-align-left"></i> Text layer
				<span style="margin-left:auto">{stripWs ? 'normalised' : 'verbatim'}</span>
			</div>
			<pre class="ifc-fulltext">{rendered}</pre>
		</div>
	</div>

	<!-- 05 ------------------------------------------------------------ -->
	<div class="ifc-sec">
		<span class="ifc-sec-tag">05</span>
		<span class="ifc-sec-title">The same document, in panels</span>
		<span class="ifc-sec-hint">drag · collapse · tab</span>
	</div>
	<p class="ifc-sec-note">
		A document viewer assembled from panel elements rather than page markup. The controls are live:
		the <em>Pane</em> dropdown and the <em>Normalise whitespace</em> toggle drive the split view in
		section 04 above, and <em>Next document</em> reseeds the whole page. Click a title bar and press
		<kbd>Tab</kbd> to walk the controls — <kbd>Space</kbd> toggles, arrows step the dropdown, and
		arrows on the title bar move the panel.
	</p>
	<div class="ifc-card cp-card">
		<div bind:this={panelStage} class="cp-stage">
			<magx-panel title="Record" x="0" y="0" style="--magx-panel-panel-width:{CP_W}px">
				<magx-panel-html title="doc #{doc.id}">
					<div class="dp-kv">
						<div class="dp-row"><span class="dp-k">agency</span><b>{doc.agency}</b></div>
						<div class="dp-row"><span class="dp-k">unit</span><b>{doc.unit}</b></div>
						<div class="dp-row"><span class="dp-k">filed</span><b>{doc.filed}</b></div>
						<div class="dp-row"><span class="dp-k">pages</span><b>{doc.pages}</b></div>
						<div class="dp-row"><span class="dp-k">size</span><b>{fmtBytes(doc.size)}</b></div>
					</div>
				</magx-panel-html>
				<magx-panel-html title="citation">
					<div class="dp-cite">{doc.citation}</div>
				</magx-panel-html>
			</magx-panel>

			<magx-panel title="Quality" x="352" y="0" style="--magx-panel-panel-width:{CP_W}px">
				<magx-panel-progressbar title="OCR confidence" currentValue={doc.ocr} maxValue="100"
				></magx-panel-progressbar>
				<magx-panel-html title="retrieval">
					<div class="dp-kv">
						<div class="dp-row">
							<span class="dp-k">served from</span><b>{doc.source}</b>
						</div>
						<div class="dp-row">
							<span class="dp-k">db</span><b>{doc.dbMs.toFixed(1)} ms</b>
						</div>
						<div class="dp-row">
							<span class="dp-k">fs</span><b>{doc.fsMs.toFixed(1)} ms</b>
						</div>
						<div class="dp-row">
							<span class="dp-k">entities</span><b>{doc.entities}</b>
						</div>
						<div class="dp-row">
							<span class="dp-k">capture</span><b>{doc.scanned ? 'scanned' : 'born-digital'}</b>
						</div>
					</div>
				</magx-panel-html>
				<magx-panel-html title="statutes cited">
					<div class="dp-tags">
						{#each doc.statutes as s (s)}<span class="ifc-badge b-vanilla">{s}</span>{/each}
					</div>
				</magx-panel-html>
			</magx-panel>

			<magx-panel title="Viewer" x="704" y="0" style="--magx-panel-panel-width:{CP_W}px">
				<magx-panel-dropdown id="dp-view" title="Pane" index="0">
					<option>pdf</option>
					<option>text</option>
				</magx-panel-dropdown>
				<magx-panel-toggle
					id="dp-strip"
					title="Normalise whitespace"
					labelOn="ON"
					labelOff="OFF"
					checked
				></magx-panel-toggle>
				<magx-panel-button id="dp-next" title="Next document" mode="momentary"
				></magx-panel-button>
				<magx-panel-textarea
					id="dp-note"
					title="Reviewer note"
					placeholder="Notes are typed here — Tab in, type, Tab out."
				></magx-panel-textarea>
				<magx-panel-html title="state">
					<div class="dp-log">
						pane {view} · text {stripWs ? 'normalised' : 'verbatim'} · seed {seed}
					</div>
				</magx-panel-html>
			</magx-panel>
		</div>
	</div>
</div>

<style>
	/* Panels are absolutely positioned, so the stage needs its own box.
	   `fitStage` supplies the height; the min-height is only a pre-measure
	   fallback so the section never flashes at zero. */
	.cp-stage {
		position: relative;
		min-width: 1056px;
		min-height: 320px;
	}
	.dp-kv {
		display: flex;
		flex-direction: column;
		gap: 3px;
	}
	.dp-row {
		display: flex;
		align-items: baseline;
		gap: 6px;
		font-size: 0.68rem;
	}
	.dp-row b {
		margin-left: auto;
		text-align: right;
		font-variant-numeric: tabular-nums;
	}
	.dp-k {
		opacity: 0.6;
	}
	.dp-cite {
		font-family: Palatino, 'Palatino Linotype', Georgia, serif;
		font-size: 0.72rem;
		line-height: 1.45;
	}
	.dp-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
	}
	.dp-log {
		font-size: 0.64rem;
		opacity: 0.7;
		font-variant-numeric: tabular-nums;
	}

	.doc-title {
		font-size: 1.25rem;
		font-weight: 800;
		line-height: 1.3;
		margin: 0;
	}
	.doc-raw {
		font-size: 0.66rem;
		color: var(--ink-soft);
		word-break: break-all;
		margin-top: 2px;
	}
	.doc-cite {
		font-family: var(--font-serif);
		font-size: 0.86rem;
		color: var(--ink-note);
		border-left: 3px solid var(--rule-soft);
		padding-left: var(--spacing-sm);
		margin-top: var(--spacing-sm);
		max-width: min(78ch, 100%);
	}
	.insight p {
		margin: 0;
	}
	.pdf-stage {
		background: var(--color-bg-alt);
		padding: var(--spacing-md);
		max-height: 460px;
		overflow: auto;
	}
	.pdf-page {
		background: #fff;
		border: 1px solid var(--rule);
		box-shadow: var(--elev);
		padding: 26px 30px;
		min-height: 380px;
	}
	.pdf-caption {
		font-size: 0.6rem;
		letter-spacing: 0.16em;
		text-align: center;
		color: #333;
		margin-bottom: 10px;
	}
	.pdf-rule {
		border-top: 1px solid #cfcfc8;
		margin: 10px 0;
	}
	.pdf-line {
		height: 5px;
		background: #dedcd4;
		margin-bottom: 7px;
	}
	.pdf-folio {
		text-align: center;
		font-size: 0.6rem;
		color: #777;
		margin-top: 16px;
	}
</style>
