<script lang="ts">
	/**
	 * Motion & Reaction — the animation half of the house style.
	 *
	 * Two references sit behind this page. The cursor-repel title comes from
	 * finder.atsignhandle.xyz. The live-custom-property discipline comes from
	 * prop-for-that.netlify.app, adopted for its *idea* rather than its
	 * implementation: JS writes numbers, CSS decides what they look like. That
	 * system's oklch colour, `light-dark()` and webfont are not adopted — this
	 * library stays on vanilla CSS, hex, and `data-theme`.
	 */
	import RepelText from '$lib/interface/RepelText.svelte';
	import AnimBar from '$lib/interface/AnimBar.svelte';
	import { pointerRatios, visibility, setValuePct } from '$lib/interface/liveprops';
	import { onTick } from '$lib/anim';
	import { walk, RESERVOIR, windowOf } from '$lib/interface/generate';

	let fps = $state(0);
	let frame = $state(0);
	let seed = $state(3);
	const reshuffle = () => (seed = (seed * 29 + 11) % 99991);

	$effect(() => onTick(() => fps, () => (frame += 1)));

	/** Element refs for the live-property demos. */
	let tiltEl: HTMLDivElement | null = $state(null);
	let glowEl: HTMLDivElement | null = $state(null);
	let revealEl: HTMLDivElement | null = $state(null);
	let meterEl: HTMLDivElement | null = $state(null);

	$effect(() => (tiltEl ? pointerRatios(tiltEl) : undefined));
	$effect(() => (glowEl ? pointerRatios(glowEl) : undefined));
	$effect(() => (revealEl ? visibility(revealEl) : undefined));

	const series = $derived(
		windowOf(walk(48 + RESERVOIR, { seed, min: 8, max: 96, start: 40, step: 9 }), 48, frame)
	);
	const level = $derived(series[series.length - 1] ?? 40);

	// The meter is driven entirely by one property; its geometry lives in CSS.
	$effect(() => setValuePct(meterEl, level));

	const EASINGS = [
		{ name: '--ease-out', value: 'cubic-bezier(.16, 1, .3, 1)', use: 'entrances, reveals' },
		{ name: '--ease-in-out', value: 'cubic-bezier(.65, 0, .35, 1)', use: 'state swaps' },
		{ name: '--ease-spring', value: 'cubic-bezier(.34, 1.56, .64, 1)', use: 'button presses' },
		{ name: '--ease-linear', value: 'linear', use: 'progress, streams' }
	];

	const DURATIONS = [
		{ name: '--dur-fast', value: '120ms', use: 'hover, focus, press' },
		{ name: '--dur-base', value: '240ms', use: 'panels, popovers' },
		{ name: '--dur-slow', value: '480ms', use: 'page-level reveals' }
	];
</script>

<svelte:head>
	<title>Motion &amp; Reaction — Interface Components</title>
</svelte:head>

<div class="ifc">
	<header class="ifc-page-head">
		<div class="ifc-eyebrow">Interface · 05</div>
		<h1 class="ifc-page-title">Motion &amp; Reaction</h1>
		<p class="ifc-page-lede">
			The animation vocabulary that goes with the layout and charting vocabulary. Two references sit
			behind it: the cursor-repel heading from
			<a href="https://finder.atsignhandle.xyz" target="_blank" rel="noopener">finder</a>, and the
			live-custom-property discipline from
			<a href="https://prop-for-that.netlify.app" target="_blank" rel="noopener">prop-for-that</a>.
		</p>
		<p class="ifc-page-lede" style="margin-top:var(--spacing-sm)">
			The second is the important one, and it is a rule rather than an effect:
			<strong>JavaScript writes numbers, CSS decides what they look like.</strong> A pointer handler's
			entire job is to set <code>--live-pointer-x-ratio</code> to a value between 0 and 1. Whether
			that becomes a tilt, a glow, a parallax or nothing at all is a stylesheet decision — so motion
			can be rethemed or switched off without touching script. Adopted as a pattern only: this
			library stays on vanilla CSS, hex colour and <code>data-theme</code>, not oklch,
			<code>light-dark()</code> or a webfont.
		</p>
		<AnimBar
			bind:fps
			{seed}
			{frame}
			onreshuffle={reshuffle}
			note="Drives the reactive meter and stream below"
		/>
	</header>

	<!-- 01 repel title ------------------------------------------------- -->
	<div class="ifc-sec">
		<span class="ifc-sec-tag">01</span>
		<span class="ifc-sec-title">A heading whose letters dodge your cursor</span>
		<span class="ifc-sec-hint">put your pointer on the word below — the letters get out of the way</span>
	</div>
	<p class="ifc-sec-note">
		<strong>What this is.</strong> A page title where every letter is a separate element on a spring.
		Bring the pointer near one and it is pushed away; take the pointer off and it drifts back to
		where it belongs. That is the whole effect — there is nothing to click, no state, and no
		outcome. It exists to make a masthead feel like a physical surface rather than a printed one,
		and it is here because the same three numbers behind it (how far the pointer reaches, how hard
		it pushes, how the thing returns) are the numbers behind every other bit of motion on this page.
	</p>
	<p class="ifc-sec-note" style="margin-top:var(--spacing-sm)">
		<strong>How it is built.</strong> Each glyph is a span carrying its own spring. The pointer
		pushes characters away with a linear falloff inside an 80px radius — the dashed circle that
		follows your cursor below is that radius, drawn; anything inside it is being pushed, anything
		outside it is not. When the pointer leaves, the glyphs settle back under damping rather than
		snapping. One <code>requestAnimationFrame</code> loop walks a flat array of glyphs — no
		per-character listeners and no CSS transitions, because a transition would fight the spring for
		control of <code>transform</code>. Under <code>prefers-reduced-motion</code> the loop never
		starts and the text stays ordinary, selectable type.
	</p>
	<div class="ifc-card repel-stage">
		<div class="ifc-card-title">The reference setting</div>
		<div class="ifc-card-sub">
			radius 80 · strength 18 · stiffness 0.08 · damping 0.78 — the two variants below change one
			group of these and nothing else
		</div>
		<RepelText text="INTERFACE" ring hint="Move your pointer across the letters" />
	</div>
	<p class="ifc-sec-note" style="margin-top:var(--spacing-sm)">
		<strong>What the two cards below are for.</strong> They are the same effect with one group of
		numbers changed, side by side, so the parameters mean something you can feel instead of read.
		Sweep your pointer across all three at the same speed and compare:
		<strong>radius</strong> and <strong>strength</strong> decide how far the pointer's influence
		reaches and how hard it shoves — that is the <em>outbound</em> half;
		<strong>stiffness</strong> and <strong>damping</strong> decide how the glyphs travel home once it
		leaves — the <em>return</em> half. Tuning those two halves separately is the entire craft of
		spring motion.
	</p>
	<div class="ifc-grid ifc-grid-2" style="margin-top:var(--spacing-md)">
		<div class="ifc-card">
			<div class="ifc-card-title">Outbound changed — short reach, hard shove</div>
			<div class="ifc-card-sub">
				radius 46 · strength 26. Compare with the reference: fewer letters react at once, because the
				circle of influence is smaller — but the ones that do react jump nearly half again as far.
			</div>
			<RepelText
				text="COMPONENTS"
				radius={46}
				strength={26}
				size="clamp(1.4rem,5vw,2.6rem)"
				ring
				hint="Sweep across — notice how few letters move"
			/>
		</div>
		<div class="ifc-card">
			<div class="ifc-card-title">Return changed — slow, loose, overshoots</div>
			<div class="ifc-card-sub">
				stiffness 0.04 · damping 0.88. The push is identical to the reference; only the way home
				differs. Move the pointer off and watch — the letters drift back lazily and wobble past
				centre a couple of times before settling.
			</div>
			<RepelText
				text="PATTERNS"
				stiffness={0.04}
				damping={0.88}
				size="clamp(1.4rem,5vw,2.6rem)"
				ring
				hint="Sweep across, then move away and watch them settle"
			/>
		</div>
	</div>

	<!-- 02 live props --------------------------------------------------- -->
	<div class="ifc-sec">
		<span class="ifc-sec-tag">02</span>
		<span class="ifc-sec-title">Live custom properties</span>
		<span class="ifc-sec-hint">JS listens · CSS reacts</span>
	</div>
	<p class="ifc-sec-note">
		Two tiers of naming. <code>--live-*</code> properties change continuously and may be rewritten
		many times per second; <code>--const-*</code> properties latch once and are then left alone. The
		latch is what turns "animate in the first time this is seen" from a JavaScript state machine into
		a single CSS rule. All three demos below share exactly one helper each — the reactions are
		different only because the stylesheets are.
	</p>

	<div class="ifc-grid ifc-grid-3">
		<div class="ifc-card">
			<div class="ifc-card-title">Pointer tilt</div>
			<div class="ifc-card-sub">--live-pointer-x-ratio · --live-pointer-y-ratio</div>
			<div bind:this={tiltEl} class="tilt-stage">
				<div class="tilt-plate">
					<i class="fat fa-microchip"></i>
					<span>tilt</span>
				</div>
			</div>
			<p class="lp-note">
				The handler writes two ratios. The rotation, the depth and the easing back to flat are all
				in the stylesheet — swapping tilt for parallax is a CSS edit.
			</p>
		</div>

		<div class="ifc-card">
			<div class="ifc-card-title">Pointer spotlight</div>
			<div class="ifc-card-sub">same two properties, different rules</div>
			<div bind:this={glowEl} class="glow-stage">
				<span>identical JS</span>
			</div>
			<p class="lp-note">
				Byte-for-byte the same helper as the tile on the left. Only the stylesheet differs, which is
				the entire argument for the pattern.
			</p>
		</div>

		<div class="ifc-card">
			<div class="ifc-card-title">Reveal on entry</div>
			<div class="ifc-card-sub">--live-visible · --const-has-entered</div>
			<div bind:this={revealEl} class="reveal-stage">
				{#each ['scroll', 'observe', 'latch', 'settle'] as word, i (word)}
					<span class="reveal-word" style="--i:{i}">{word}</span>
				{/each}
			</div>
			<p class="lp-note">
				An <code>IntersectionObserver</code> with 21 thresholds turns a boolean callback into a
				signal. The latch keeps the words in place once seen, so scrolling back does not replay it.
			</p>
		</div>
	</div>

	<!-- 03 value-driven ------------------------------------------------- -->
	<div class="ifc-sec">
		<span class="ifc-sec-tag">03</span>
		<span class="ifc-sec-title">Value-driven geometry</span>
		<span class="ifc-sec-hint">one property · four readouts</span>
	</div>
	<p class="ifc-sec-note">
		Application state publishes a single <code>--live-value-pct</code>. A bar, a dial, a gradient
		stop and a text colour all read it. Nothing recalculates in script when the number moves — the
		frame budget goes to the compositor instead. Raise the FPS control above to see it driven at
		rate.
	</p>
	<div bind:this={meterEl} class="ifc-card value-stage">
		<div class="value-row">
			<span class="value-k">bar</span>
			<div class="value-bar"><div class="value-bar-fill"></div></div>
		</div>
		<div class="value-row">
			<span class="value-k">dial</span>
			<div class="value-dial"></div>
		</div>
		<div class="value-row">
			<span class="value-k">gradient</span>
			<div class="value-grad"></div>
		</div>
		<div class="value-row">
			<span class="value-k">readout</span>
			<span class="value-num">{level.toFixed(1)}%</span>
		</div>
	</div>

	<!-- 04 tokens ------------------------------------------------------- -->
	<div class="ifc-sec">
		<span class="ifc-sec-tag">04</span>
		<span class="ifc-sec-title">Easing &amp; duration tokens</span>
		<span class="ifc-sec-hint">hover a row to run it</span>
	</div>
	<p class="ifc-sec-note">
		Four easings and three durations cover everything in this library. The point of naming them is
		consistency across a codebase, not expressiveness: an interface where every transition was
		individually tuned reads as noise. <code>--ease-out</code> does most of the work —
		fast at the start, long settle, which is what makes an entrance feel decided rather than slow.
	</p>
	<div class="ifc-grid ifc-grid-2">
		<div class="ifc-card" style="padding:0">
			<table class="ifc-table">
				<thead>
					<tr><th>Easing</th><th>Curve</th><th>Use</th><th>Preview</th></tr>
				</thead>
				<tbody>
					{#each EASINGS as e (e.name)}
						<tr class="ease-row" style="--ez:{e.value}">
							<td><code>{e.name}</code></td>
							<td class="mono-cell">{e.value}</td>
							<td>{e.use}</td>
							<td><span class="ease-dot"></span></td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<div class="ifc-card" style="padding:0">
			<table class="ifc-table">
				<thead>
					<tr><th>Duration</th><th>Value</th><th>Use</th><th>Preview</th></tr>
				</thead>
				<tbody>
					{#each DURATIONS as d (d.name)}
						<tr class="ease-row" style="--ez:cubic-bezier(.16,1,.3,1);--dz:{d.value}">
							<td><code>{d.name}</code></td>
							<td class="mono-cell">{d.value}</td>
							<td>{d.use}</td>
							<td><span class="ease-dot"></span></td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>

	<div class="ifc-hr"></div>
	<div class="ifc-mono-note">
		Every effect on this page respects <code>prefers-reduced-motion</code>: the repel loop does not
		start, and the transitions collapse to zero duration.
	</div>
</div>

<style>
	.repel-stage {
		display: flex;
		justify-content: center;
		overflow: hidden;
	}

	.lp-note {
		font-size: 0.68rem;
		line-height: 1.55;
		color: var(--ink-soft);
		margin-top: var(--spacing-sm);
	}

	/* --- 02a tilt: two ratios in, a 3D pose out ------------------------ */
	.tilt-stage {
		perspective: 700px;
		height: 150px;
		display: grid;
		place-items: center;
		background: var(--color-bg-alt);
		border: 1px solid var(--rule-soft);
	}
	.tilt-plate {
		--rx: calc((var(--live-pointer-y-ratio, 0.5) - 0.5) * -24deg);
		--ry: calc((var(--live-pointer-x-ratio, 0.5) - 0.5) * 24deg);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		width: 110px;
		height: 110px;
		justify-content: center;
		border: 1px solid var(--rule);
		background: var(--paper-card);
		box-shadow: var(--brutal-shadow);
		transform: rotateX(var(--rx)) rotateY(var(--ry))
			translateZ(calc(var(--live-pointer-inside, 0) * 18px));
		transition: transform 240ms cubic-bezier(0.16, 1, 0.3, 1);
		font-size: 0.62rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--ink-muted);
	}
	.tilt-plate i {
		font-size: 2.2rem;
		color: var(--color-accent);
	}

	/* --- 02b spotlight: same inputs, unrelated output ------------------ */
	.glow-stage {
		position: relative;
		height: 150px;
		display: grid;
		place-items: center;
		overflow: hidden;
		border: 1px solid var(--rule-soft);
		background: var(--color-bg-alt);
		font-size: 0.62rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--ink-soft);
	}
	.glow-stage::before {
		content: '';
		position: absolute;
		inset: 0;
		background: radial-gradient(
			120px circle at calc(var(--live-pointer-x-ratio, 0.5) * 100%)
				calc(var(--live-pointer-y-ratio, 0.5) * 100%),
			var(--color-accent),
			transparent 70%
		);
		opacity: calc(var(--live-pointer-inside, 0) * 0.34);
		transition: opacity 240ms cubic-bezier(0.16, 1, 0.3, 1);
	}
	.glow-stage span {
		position: relative;
	}

	/* --- 02c reveal: ratio drives distance, latch holds it ------------- */
	.reveal-stage {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		align-content: center;
		height: 150px;
		padding: var(--spacing-sm);
		border: 1px solid var(--rule-soft);
		background: var(--color-bg-alt);
	}
	.reveal-word {
		/* Once --const-has-entered latches to 1 the offset is pinned to zero,
		   so scrolling back out does not replay the entrance. */
		--settled: max(var(--live-visible, 0), var(--const-has-entered, 0));
		display: inline-block;
		border: 1px solid var(--rule);
		background: var(--paper-card);
		padding: 3px 8px;
		font-size: 0.66rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		opacity: var(--settled);
		transform: translateY(calc((1 - var(--settled)) * 14px));
		transition:
			opacity 480ms cubic-bezier(0.16, 1, 0.3, 1),
			transform 480ms cubic-bezier(0.16, 1, 0.3, 1);
		transition-delay: calc(var(--i) * 60ms);
	}

	/* --- 03 one property, four readouts -------------------------------- */
	.value-stage {
		display: grid;
		gap: var(--spacing-sm);
	}
	.value-row {
		display: grid;
		grid-template-columns: 5.5rem minmax(0, 1fr);
		align-items: center;
		gap: var(--spacing-sm);
	}
	.value-k {
		font-size: 0.6rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--ink-soft);
	}
	.value-bar {
		height: 14px;
		border: 1px solid var(--rule);
		background: var(--color-bg-alt);
	}
	.value-bar-fill {
		height: 100%;
		width: var(--live-value-pct, 0%);
		background: var(--color-accent);
	}
	.value-dial {
		width: 54px;
		height: 54px;
		border-radius: 50%;
		border: 1px solid var(--rule);
		background: conic-gradient(
			var(--color-accent) var(--live-value-pct, 0%),
			var(--color-bg-alt) 0
		);
	}
	.value-grad {
		height: 14px;
		border: 1px solid var(--rule);
		background: linear-gradient(
			90deg,
			var(--pastel-aqua),
			var(--pastel-mint) var(--live-value-pct, 0%),
			var(--color-bg-alt) var(--live-value-pct, 0%)
		);
	}
	.value-num {
		font-size: 1.1rem;
		font-weight: 800;
		font-variant-numeric: tabular-nums;
		/* Colour is a function of the same number: cool below half, warm above. */
		color: color-mix(
			in srgb,
			var(--stroke-rose) var(--live-value-pct, 0%),
			var(--stroke-aqua)
		);
	}

	/* --- 04 token previews --------------------------------------------- */
	.mono-cell {
		font-size: 0.62rem;
		color: var(--ink-soft);
	}
	.ease-dot {
		display: block;
		width: 10px;
		height: 10px;
		background: var(--color-accent);
		border: 1px solid var(--rule);
		transform: translateX(0);
		transition: transform var(--dz, 480ms) var(--ez, linear);
	}
	.ease-row:hover .ease-dot {
		transform: translateX(64px);
	}

	@media (prefers-reduced-motion: reduce) {
		.tilt-plate,
		.glow-stage::before,
		.reveal-word,
		.ease-dot {
			transition-duration: 0ms;
		}
		.tilt-plate {
			transform: none;
		}
	}
</style>
