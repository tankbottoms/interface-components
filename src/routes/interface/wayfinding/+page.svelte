<script lang="ts">
	import CornerInfo from '$lib/components/CornerInfo.svelte';
	import { TourLauncher } from '$lib/tour';
	import type { TourDefinition } from '$lib/tour';

	/**
	 * The page tours itself.
	 *
	 * Every stop below points at something further down this page, so the tour is
	 * not a description of the pattern — it is the pattern, running. That is also
	 * the honest test of it: if walking six stops of a documentation page is
	 * tedious, it will be worse on a dashboard someone actually has work to do on.
	 */
	const tour: TourDefinition = {
		id: 'wayfinding',
		name: 'Wayfinding',
		offerAfter: 8,
		steps: [
			{
				target: '#wf-corner',
				title: 'The corner circle-i',
				body: 'One glyph, parked in the same corner on every container. Hover or tap it for what the panel is and where its numbers come from.',
				corner: 'tl',
				place: 'right'
			},
			{
				target: '#wf-wire',
				title: 'Numbered key locations',
				body: 'Stops are marked all at once, not one at a time. Seeing that there are six — and where they are — is most of what a tour is for.',
				corner: 'tl',
				place: 'bottom'
			},
			{
				target: '#wf-map',
				title: 'Controls over a map',
				body: 'Zoom top-right, layers top-left, scale bottom-left. Fixed corners mean the picture is never the thing you have to search.',
				corner: 'tr',
				place: 'left'
			},
			{
				target: '#wf-viewer',
				title: 'Controls over a viewer',
				body: 'The same cluster language over a canvas: translucent paper, a hairline, glyph-only buttons, and a readout that never covers the model.',
				corner: 'tr',
				place: 'left'
			},
			{
				target: '#wf-offer',
				title: 'The unprompted offer',
				body: 'Eight seconds after the page settles, once per browser. Asked twice is the annoying part, so the offer marks itself seen the moment it appears.',
				corner: 'tl',
				place: 'top'
			},
			{
				target: '#wf-rules',
				title: 'What it refuses to do',
				body: 'No page dimming, no square cut-out, no square buttons, and the interface stays live underneath — you can try the control being described.',
				corner: 'tl',
				place: 'top'
			}
		]
	};

	let layer = $state('roads');
	let shading = $state(true);
	let wires = $state(false);

	const wireBlocks = [
		{ n: 1, label: 'Header · accent + theme', x: 2, y: 2, w: 96, h: 11 },
		{ n: 2, label: 'Filter bar', x: 2, y: 16, w: 96, h: 9 },
		{ n: 3, label: 'KPI strip', x: 2, y: 28, w: 96, h: 14 },
		{ n: 4, label: 'Primary chart', x: 2, y: 45, w: 62, h: 30 },
		{ n: 5, label: 'Legend / detail', x: 67, y: 45, w: 31, h: 30 },
		{ n: 6, label: 'Dense table', x: 2, y: 78, w: 96, h: 20 }
	];
</script>

<svelte:head>
	<title>Wayfinding — Interface Components</title>
</svelte:head>

<div class="ifc">
	<header class="ifc-page-head">
		<div class="ifc-eyebrow">Interface · 05</div>
		<h1 class="ifc-page-title">Wayfinding</h1>
		<p class="ifc-page-lede">
			Two halves of the same problem. A <strong>corner circle-i</strong> answers a question the
			reader already has, in place, without moving them. A <strong>tour</strong> answers questions
			they have not thought to ask yet, by walking the page in order. Both are built here from the
			same parts — a numbered marker, a soft popup, and a highlight that leaves the interface live
			underneath it.
		</p>
		<div class="wf-launch" id="wf-offer">
			<TourLauncher {tour} />
			<span class="ifc-mono-note">
				offered unprompted after 8s on a first visit · the reset glyph clears that memory
			</span>
		</div>
	</header>

	<div class="ifc-sec">
		<span class="ifc-sec-tag">01</span>
		<span class="ifc-sec-title">The corner circle-i</span>
		<span class="ifc-sec-hint">hover or tap · top-left by convention</span>
	</div>
	<p class="ifc-sec-note">
		A container has no word to hang an explanation off, so the explanation goes in a corner instead
		— and always the <em>same</em> corner, because a reader who has met one of these knows where to
		look on the next panel. Top-left is the default: the eye lands there, card titles already live
		there, and the glyph reads as part of the heading rather than as a stray control. Top-right is
		the fallback for containers whose top-left is spoken for — a map's layer cluster, a viewer's
		axis gizmo.
	</p>
	<div class="ifc-grid ifc-grid-2">
		<div class="ifc-card ifc-has-corner" id="wf-corner">
			<CornerInfo
				title="Throughput, 30 days"
				body="Rolling seven-day mean over daily totals. Days with no ingest are held at the prior value rather than drawn as zero, which would put a false cliff in the line."
				rows={[
					{ k: 'Source', v: 'ingest.daily' },
					{ k: 'Refresh', v: '15 min' },
					{ k: 'Window', v: '30d' }
				]}
			/>
			<div class="ifc-card-hdr">
				<span class="ifc-card-title">Throughput</span>
			</div>
			<p class="ifc-mono-note">
				Corner top-left. The glyph sits inside the card's own padding, so nothing in the body has
				to make room for it.
			</p>
		</div>
		<div class="ifc-card ifc-has-corner">
			<CornerInfo
				corner="tr"
				title="Cost by category"
				body="Categories are assigned once at import; anything unmatched lands in Other rather than being dropped, so the column always sums to the banner figure."
				rows={[
					{ k: 'Basis', v: 'accrual' },
					{ k: 'Rounded', v: 'nearest $1' }
				]}
			/>
			<div class="ifc-card-hdr">
				<span class="ifc-card-title">Cost by category</span>
			</div>
			<p class="ifc-mono-note">
				Corner top-right, for when a title block, a drag handle or a control cluster already owns
				the left.
			</p>
		</div>
	</div>

	<div class="ifc-sec">
		<span class="ifc-sec-tag">02</span>
		<span class="ifc-sec-title">Key locations</span>
		<span class="ifc-sec-hint">wireframe · all stops visible at once</span>
	</div>
	<p class="ifc-sec-note">
		Before the tour runs it is worth knowing what it will cover. Every stop gets a numbered circle
		on its target for the whole duration — not one marker that hops from place to place. The reader
		can see there are six, see that two of them are below the fold, and skip to number five by
		clicking it. A tour that hides its own length is a slideshow, and nobody finishes a slideshow.
	</p>
	<div class="ifc-card wf-wirecard ifc-has-corner" id="wf-wire">
		<CornerInfo
			title="Marker placement"
			body="Markers park in a corner of their target — tl, tr, bl or br — chosen per step so the number never lands on a value, a label or a control."
		/>
		<div class="wf-wire" class:show={wires}>
			{#each wireBlocks as b}
				<div
					class="wb"
					style="left:{b.x}%;top:{b.y}%;width:{b.w}%;height:{b.h}%"
				>
					<span class="wb-n">{b.n}</span>
					<span class="wb-l">{b.label}</span>
				</div>
			{/each}
		</div>
		<div class="wf-row">
			<button class="ifc-btn" onclick={() => (wires = !wires)}>
				<i class="fat {wires ? 'fa-eye-slash' : 'fa-eye'}"></i>
				{wires ? 'Hide numbers' : 'Show numbers'}
			</button>
			<span class="ifc-mono-note">six stops · numbers sit in the block corner, never on content</span>
		</div>
	</div>

	<div class="ifc-sec">
		<span class="ifc-sec-tag">03</span>
		<span class="ifc-sec-title">Controls over a map</span>
		<span class="ifc-sec-hint">fixed corners · translucent paper</span>
	</div>
	<p class="ifc-sec-note">
		A control laid over a picture has two jobs the page chrome never has: stay legible over whatever
		colour happens to be beneath it, and take as little of the picture as possible. So translucent
		paper with a blur behind it, a hairline instead of a border, and glyph-only buttons. Corners are
		assigned by convention — <strong>zoom top-right, layers top-left, scale and attribution bottom</strong>
		— which is the whole trick: the picture is never the thing you have to search.
	</p>
	<div class="ifc-viewport wf-map ifc-has-corner" id="wf-map">
		<CornerInfo
			corner="bl"
			title="Route, last 90 days"
			body="Trip polylines binned to a 40m grid; the heat is trip count, not speed."
			label="About this map"
		/>
		<svg class="wf-canvas" viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
			<rect width="400" height="240" fill="var(--paper-pane, var(--paper-card))" />
			{#each [30, 70, 110, 150, 190] as y}
				<line x1="0" x2="400" y1={y} y2={y} stroke="var(--rule-hair)" />
			{/each}
			{#each [60, 130, 200, 270, 340] as x}
				<line y1="0" y2="240" x1={x} x2={x} stroke="var(--rule-hair)" />
			{/each}
			<path
				d="M20 210 C 90 190, 110 120, 170 110 S 260 130, 300 70 S 360 40, 385 30"
				fill="none"
				stroke="var(--color-accent)"
				stroke-width="2.5"
				stroke-linecap="round"
				opacity="0.85"
			/>
			<circle cx="20" cy="210" r="5" fill="var(--color-accent)" />
			<circle cx="385" cy="30" r="5" fill="none" stroke="var(--color-accent)" stroke-width="2.5" />
		</svg>

		<div class="ovl tl col">
			<div class="ovl-group">
				<button class="ovl-btn" class:on={layer === 'roads'} title="Roads" onclick={() => (layer = 'roads')}>
					<i class="fat fa-road"></i>
				</button>
				<button class="ovl-btn" class:on={layer === 'sat'} title="Satellite" onclick={() => (layer = 'sat')}>
					<i class="fat fa-satellite"></i>
				</button>
				<button class="ovl-btn" class:on={layer === 'heat'} title="Heat" onclick={() => (layer = 'heat')}>
					<i class="fat fa-fire"></i>
				</button>
			</div>
		</div>

		<div class="ovl tr col">
			<div class="ovl-group">
				<button class="ovl-btn" title="Zoom in"><i class="fat fa-plus"></i></button>
				<button class="ovl-btn" title="Zoom out"><i class="fat fa-minus"></i></button>
			</div>
			<div class="ovl-group">
				<button class="ovl-btn" title="Fit to route"><i class="fat fa-expand"></i></button>
			</div>
		</div>

		<div class="ovl bl">
			<div class="ovl-scale"><i></i> 500 m</div>
		</div>

		<div class="ovl br">
			<span class="ovl-chip">{layer} · 90d · 412 trips</span>
		</div>
	</div>

	<div class="ifc-sec">
		<span class="ifc-sec-tag">04</span>
		<span class="ifc-sec-title">Controls over a viewer</span>
		<span class="ifc-sec-hint">three.js / tiles · same cluster language</span>
	</div>
	<p class="ifc-sec-note">
		A 3-D viewer wants the same treatment with one addition: a readout. Camera state is invisible
		until something says what it is, and a reader who has spun a model does not know how to get back
		— so the reset is always a single glyph, and the numbers sit bottom-left where they overlap the
		least interesting part of a centred model.
	</p>
	<div class="ifc-viewport wf-viewer ifc-has-corner" id="wf-viewer">
		<svg class="wf-canvas" viewBox="0 0 400 240" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
			<g transform="translate(200 120)">
				<polygon points="0,-62 76,-20 0,22 -76,-20" fill="var(--color-accent)" opacity={shading ? 0.28 : 0.1} stroke="var(--color-accent)" stroke-width="1.5" />
				<polygon points="-76,-20 0,22 0,84 -76,42" fill="var(--color-accent)" opacity={shading ? 0.16 : 0.06} stroke="var(--color-accent)" stroke-width="1.5" />
				<polygon points="76,-20 0,22 0,84 76,42" fill="var(--color-accent)" opacity={shading ? 0.42 : 0.14} stroke="var(--color-accent)" stroke-width="1.5" />
			</g>
		</svg>

		<div class="ovl tl">
			<div class="ovl-group row">
				<button class="ovl-btn" class:on={shading} title="Shading" onclick={() => (shading = !shading)}>
					<i class="fat fa-cube"></i>
				</button>
				<button class="ovl-btn" title="Wireframe"><i class="fat fa-diagram-project"></i></button>
				<button class="ovl-btn" title="Grid"><i class="fat fa-border-all"></i></button>
			</div>
		</div>

		<div class="ovl tr col">
			<div class="ovl-group">
				<button class="ovl-btn" title="Reset camera"><i class="fat fa-arrows-rotate"></i></button>
				<button class="ovl-btn" title="Top view"><i class="fat fa-square-caret-up"></i></button>
				<button class="ovl-btn" title="Full screen"><i class="fat fa-expand"></i></button>
			</div>
		</div>

		<div class="ovl bl">
			<div class="ovl-readout">
				az <b>128°</b><br />
				el <b>34°</b><br />
				tiles <b>1,204</b>
			</div>
		</div>
	</div>

	<div class="ifc-sec">
		<span class="ifc-sec-tag">05</span>
		<span class="ifc-sec-title">Rules</span>
		<span class="ifc-sec-hint">what the tour refuses to do</span>
	</div>
	<p class="ifc-sec-note">
		Every library in this space — intro.js, driver.js, Shepherd — reaches for the same four moves,
		and all four are wrong for a dense interface. Dimming the page hides the context the step is
		explaining. A rectangular cut-out around a rounded card looks like a bug. Square next/prev
		buttons at the bottom of a torn-open box turn a page into a modal wizard. And a highlight that
		blocks pointer events means the reader cannot try the control while it is being described.
	</p>
	<div class="ifc-card is-hair" id="wf-rules">
		<div class="ifc-stack">
			<div class="ifc-stack-hdr"><span>Refused</span><span>Instead</span></div>
			{#each [
				['Full-page darkening', 'Nothing dims. The ring and its glow do the pointing.'],
				['Square section cut-out', 'A 12px-radius ring with an accent glow that follows the target.'],
				['Square next / prev', 'Round glyph buttons plus clickable step dots.'],
				['One marker at a time', 'Every stop numbered at once, each one clickable.'],
				['Blocked interaction', 'The ring is pointer-events: none — the interface stays live.'],
				['Offered on load', 'Offered after n seconds, once per browser, never twice.']
			] as [bad, good]}
				<div class="ifc-stack-row">
					<span class="wf-bad"><i class="fat fa-xmark"></i> {bad}</span>
					<span class="wf-good">{good}</span>
				</div>
			{/each}
		</div>
	</div>

	<div class="ifc-sec">
		<span class="ifc-sec-tag">06</span>
		<span class="ifc-sec-title">Fairy dust</span>
		<span class="ifc-sec-hint">the focus highlight · accent-tinted</span>
	</div>
	<p class="ifc-sec-note">
		The highlight is a canvas particle field over the whole viewport, drawing in the current accent.
		Two tracers walk the perimeter of the active target from opposite sides so the shape reads even
		when the ring is off-screen mid-scroll, a small burst fires on every step change, and the cursor
		leaves a sparkle so the reader's own pointer is part of the same system. It honours
		<code>prefers-reduced-motion</code> by not starting at all — with motion reduced, the ring and
		the numbers carry the whole job, which they are designed to do anyway.
	</p>
	<p class="ifc-sec-note">
		<strong>Cost:</strong> one canvas, capped at 220 live particles, torn down the moment the tour
		ends. Nothing runs on a page whose tour has not been started.
	</p>
</div>

<style>
	.wf-launch {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		flex-wrap: wrap;
		margin-top: var(--spacing-sm);
	}

	.wf-wirecard .wf-wire {
		position: relative;
		height: 300px;
		border: 1px solid var(--rule-hair);
		background: color-mix(in srgb, var(--ink) 3%, transparent);
	}
	.wb {
		position: absolute;
		border: 1px dashed var(--rule-soft);
		background: color-mix(in srgb, var(--paper-card) 60%, transparent);
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.wb-l {
		font-family: var(--font-mono);
		font-size: 0.58rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--ink-note);
	}
	.wb-n {
		position: absolute;
		top: -9px;
		left: -9px;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		display: grid;
		place-items: center;
		font-family: var(--font-mono);
		font-size: 0.6rem;
		font-weight: 700;
		color: #fff;
		background: var(--color-accent);
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent) 22%, transparent);
		opacity: 0;
		transform: scale(0.6);
		transition: opacity 0.2s ease, transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
	}
	.wf-wire.show .wb-n {
		opacity: 1;
		transform: scale(1);
	}
	.wf-wire.show .wb:nth-child(2) .wb-n { transition-delay: 0.05s; }
	.wf-wire.show .wb:nth-child(3) .wb-n { transition-delay: 0.1s; }
	.wf-wire.show .wb:nth-child(4) .wb-n { transition-delay: 0.15s; }
	.wf-wire.show .wb:nth-child(5) .wb-n { transition-delay: 0.2s; }
	.wf-wire.show .wb:nth-child(6) .wb-n { transition-delay: 0.25s; }

	.wf-row {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		flex-wrap: wrap;
		margin-top: var(--spacing-sm);
	}

	.wf-map,
	.wf-viewer {
		height: 260px;
	}
	.wf-canvas {
		display: block;
		width: 100%;
		height: 100%;
	}

	.wf-bad {
		color: var(--ink-muted);
		display: inline-flex;
		align-items: center;
		gap: 6px;
	}
	.wf-bad i {
		color: var(--stroke-coral);
	}
	.wf-good {
		margin-left: auto;
		text-align: right;
		max-width: 56%;
		color: var(--ink);
	}

	@media (max-width: 640px) {
		.ifc-stack-row {
			flex-direction: column;
			align-items: flex-start;
			gap: 2px;
		}
		.wf-good {
			margin-left: 0;
			text-align: left;
			max-width: 100%;
		}
	}
</style>
