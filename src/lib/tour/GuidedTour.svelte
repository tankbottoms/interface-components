<script lang="ts">
	import { tourState, nextStep, prevStep, goToStep, endTour, acceptOffer } from './store';
	import FairyDust from './FairyDust.svelte';

	/**
	 * The tour surface: numbered circles, a rounded focus ring, a caption card
	 * and round step controls.
	 *
	 * Deliberately *not* what intro.js and driver.js do. There is no backdrop —
	 * the page keeps its own contrast and the reader can still see the
	 * relationship between the highlighted thing and everything around it, which
	 * is usually the point of the step. Focus is carried by a rounded ring, a
	 * pulse and fairy dust rather than by drowning the other 95% of the screen;
	 * the ring is `pointer-events: none`, so the interface stays live underneath
	 * and a reader can try the control the step is describing without leaving.
	 *
	 * Every step's circle is on screen from the start. Being able to see that
	 * there are six stops, and where they are, is most of what a tour is for —
	 * hiding all but the current one turns wayfinding back into a slideshow.
	 */

	const PAD = 6;
	const CARD_W = 268;
	const GAP = 16;

	interface Box {
		x: number;
		y: number;
		width: number;
		height: number;
	}

	let rects: (Box | null)[] = $state([]);
	let card: Box = $state({ x: 0, y: 0, width: CARD_W, height: 0 });
	let cardEl: HTMLDivElement | null = $state(null);
	let placement: 'top' | 'bottom' | 'left' | 'right' = $state('bottom');

	const tour = $derived($tourState.tour);
	const index = $derived($tourState.index);
	const offering = $derived($tourState.offering);
	const running = $derived(tour !== null && !offering);
	const step = $derived(tour?.steps[index] ?? null);
	const activeRect = $derived(rects[index] ?? null);

	function measure() {
		const t = $tourState.tour;
		if (!t) return;
		rects = t.steps.map((s) => {
			const el = document.querySelector(s.target);
			if (!el) return null;
			const r = el.getBoundingClientRect();
			if (r.width === 0 && r.height === 0) return null;
			return { x: r.x - PAD, y: r.y - PAD, width: r.width + PAD * 2, height: r.height + PAD * 2 };
		});
		position();
	}

	/**
	 * Place the caption. Preference order is the step's own `place`, then below,
	 * above, right, left — first one that fits the viewport wins. If none fit
	 * (a target taller than the screen) the card pins to the bottom edge rather
	 * than hanging off it.
	 */
	function position() {
		const r = rects[$tourState.index];
		if (!r) return;
		const vw = window.innerWidth;
		const vh = window.innerHeight;
		const h = cardEl?.offsetHeight ?? 132;
		const w = Math.min(CARD_W, vw - 24);
		const pref = $tourState.tour?.steps[$tourState.index]?.place;
		const order: ('top' | 'bottom' | 'left' | 'right')[] = pref
			? [pref, 'bottom', 'top', 'right', 'left']
			: ['bottom', 'top', 'right', 'left'];

		for (const p of order) {
			let x = 0;
			let y = 0;
			if (p === 'bottom') {
				x = r.x + r.width / 2 - w / 2;
				y = r.y + r.height + GAP;
			} else if (p === 'top') {
				x = r.x + r.width / 2 - w / 2;
				y = r.y - h - GAP;
			} else if (p === 'right') {
				x = r.x + r.width + GAP;
				y = r.y + r.height / 2 - h / 2;
			} else {
				x = r.x - w - GAP;
				y = r.y + r.height / 2 - h / 2;
			}
			const fits = y >= 8 && y + h <= vh - 8 && x >= 8 && x + w <= vw - 8;
			if (fits || p === order[order.length - 1]) {
				placement = p;
				card = {
					x: Math.min(Math.max(8, x), vw - w - 8),
					y: Math.min(Math.max(8, y), vh - h - 8),
					width: w,
					height: h
				};
				if (fits) return;
			}
		}
	}

	/* Re-measure whenever the tour, the step, or the viewport changes. */
	$effect(() => {
		if (!running) return;
		const i = index;
		void i;

		const el = tour?.steps[index] ? document.querySelector(tour.steps[index].target) : null;
		el?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });

		measure();
		/* The smooth scroll has to land before the rects are final. */
		const timers = [60, 180, 340, 520].map((ms) => setTimeout(measure, ms));
		const onAny = () => measure();
		window.addEventListener('scroll', onAny, { passive: true, capture: true });
		window.addEventListener('resize', onAny);
		return () => {
			timers.forEach(clearTimeout);
			window.removeEventListener('scroll', onAny, { capture: true } as EventListenerOptions);
			window.removeEventListener('resize', onAny);
		};
	});

	function onKey(e: KeyboardEvent) {
		if (!running) return;
		if (e.key === 'Escape') endTour();
		else if (e.key === 'ArrowRight' || e.key === 'Enter') nextStep();
		else if (e.key === 'ArrowLeft') prevStep();
	}

	function markerPos(r: Box, corner: string | undefined) {
		const c = corner ?? 'tl';
		const x = c === 'tr' || c === 'br' ? r.x + r.width : r.x;
		const y = c === 'bl' || c === 'br' ? r.y + r.height : r.y;
		return { x, y };
	}
</script>

<svelte:window onkeydown={onKey} />

{#if tour && offering}
	<!-- The soft offer. A card in the corner, never a modal: someone who came to
	     read should not have to dismiss anything before they can. -->
	<div class="tour-offer" role="dialog" aria-label="Guided tour offer">
		<div class="offer-glyph"><i class="fat fa-wand-magic-sparkles"></i></div>
		<div class="offer-copy">
			<div class="offer-title">Show you around?</div>
			<div class="offer-body">
				{tour.steps.length} stops through the controls on this page — about a minute.
			</div>
		</div>
		<div class="offer-acts">
			<button class="offer-yes" onclick={acceptOffer}>Show me</button>
			<button class="offer-no" onclick={endTour}>No thanks</button>
		</div>
	</div>
{/if}

{#if tour && running}
	<FairyDust rect={activeRect} burst={index} />

	<!-- Numbered circles: every stop, always. -->
	{#each tour.steps as s, i}
		{@const r = rects[i]}
		{#if r}
			{@const p = markerPos(r, s.corner)}
			<button
				class="tour-marker"
				class:is-active={i === index}
				class:is-done={i < index}
				style="left:{p.x}px;top:{p.y}px"
				onclick={() => goToStep(i)}
				aria-label="{s.title} — step {i + 1} of {tour.steps.length}"
				aria-current={i === index ? 'step' : undefined}
			>
				{i + 1}
			</button>
		{/if}
	{/each}

	<!-- Focus ring. Rounded and glowing, never a filled scrim. -->
	{#if activeRect}
		<div
			class="tour-ring"
			style="left:{activeRect.x}px;top:{activeRect.y}px;width:{activeRect.width}px;height:{activeRect.height}px"
			aria-hidden="true"
		></div>
	{/if}

	{#if step}
		<div
			class="tour-card place-{placement}"
			bind:this={cardEl}
			style="left:{card.x}px;top:{card.y}px;width:{card.width}px"
			role="dialog"
			aria-live="polite"
			aria-label={step.title}
		>
			<div class="tc-head">
				<span class="tc-num">{index + 1}</span>
				<span class="tc-title">{step.title}</span>
				<button class="tc-close" onclick={endTour} aria-label="End tour"
					><i class="fat fa-xmark"></i></button
				>
			</div>
			<p class="tc-body">{step.body}</p>
			<div class="tc-foot">
				<div class="tc-dots">
					{#each tour.steps as s, i}
						<button
							class="tc-dot"
							class:on={i === index}
							onclick={() => goToStep(i)}
							aria-label="Go to step {i + 1}: {s.title}"
						></button>
					{/each}
				</div>
				<div class="tc-nav">
					<button
						class="tc-round"
						onclick={prevStep}
						disabled={index === 0}
						aria-label="Previous step"><i class="fat fa-angle-left"></i></button
					>
					<button class="tc-round is-primary" onclick={nextStep} aria-label="Next step">
						{#if index === tour.steps.length - 1}
							<i class="fat fa-check"></i>
						{:else}
							<i class="fat fa-angle-right"></i>
						{/if}
					</button>
				</div>
			</div>
		</div>
	{/if}
{/if}

<style>
	/* --- offer ------------------------------------------------------- */
	.tour-offer {
		position: fixed;
		right: 18px;
		bottom: 18px;
		z-index: 9999;
		width: 268px;
		display: grid;
		grid-template-columns: 26px 1fr;
		gap: 8px 10px;
		padding: 12px 13px;
		background: var(--tip-paper, #fff);
		border: 1px solid var(--rule);
		box-shadow: var(--brutal-shadow);
		animation: offer-in 0.32s cubic-bezier(0.2, 0.9, 0.3, 1.2);
	}
	@keyframes offer-in {
		from {
			opacity: 0;
			transform: translateY(12px) scale(0.96);
		}
	}
	.offer-glyph {
		color: var(--color-accent);
		font-size: 0.95rem;
		text-align: center;
	}
	.offer-title {
		font-size: 0.74rem;
		font-weight: 800;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--ink);
	}
	.offer-body {
		font-size: 0.68rem;
		line-height: 1.5;
		color: var(--ink-muted);
		margin-top: 3px;
	}
	.offer-acts {
		grid-column: 2;
		display: flex;
		gap: 6px;
	}
	.offer-yes,
	.offer-no {
		font-family: inherit;
		font-size: 0.64rem;
		font-weight: 700;
		letter-spacing: 0.07em;
		text-transform: uppercase;
		padding: 5px 11px;
		border-radius: 999px;
		cursor: pointer;
		border: 1px solid var(--rule);
	}
	.offer-yes {
		background: var(--color-accent);
		border-color: var(--color-accent);
		color: #fff;
	}
	.offer-no {
		background: none;
		color: var(--ink-soft);
	}
	.offer-no:hover {
		color: var(--ink);
	}

	/* --- numbered markers -------------------------------------------- */
	.tour-marker {
		position: fixed;
		z-index: 9999;
		width: 22px;
		height: 22px;
		margin: -11px 0 0 -11px;
		border-radius: 50%;
		border: 1px solid var(--color-accent);
		background: var(--tip-paper, #fff);
		color: var(--color-accent);
		font-family: var(--font-mono);
		font-size: 0.62rem;
		font-weight: 800;
		line-height: 1;
		display: grid;
		place-items: center;
		cursor: pointer;
		padding: 0;
		transition:
			transform 0.18s cubic-bezier(0.2, 0.9, 0.3, 1.3),
			background 0.18s ease,
			color 0.18s ease;
	}
	.tour-marker:hover {
		transform: scale(1.14);
	}
	.tour-marker.is-done {
		opacity: 0.5;
	}
	.tour-marker.is-active {
		background: var(--color-accent);
		color: #fff;
		transform: scale(1.22);
		box-shadow: 0 0 0 0 color-mix(in srgb, var(--color-accent) 60%, transparent);
		animation: marker-pulse 1.9s ease-out infinite;
	}
	@keyframes marker-pulse {
		70% {
			box-shadow: 0 0 0 11px color-mix(in srgb, var(--color-accent) 0%, transparent);
		}
		100% {
			box-shadow: 0 0 0 0 color-mix(in srgb, var(--color-accent) 0%, transparent);
		}
	}

	/* --- focus ring --------------------------------------------------- */
	.tour-ring {
		position: fixed;
		z-index: 9997;
		pointer-events: none;
		border: 1.5px solid var(--color-accent);
		border-radius: 12px;
		box-shadow:
			0 0 0 3px color-mix(in srgb, var(--color-accent) 14%, transparent),
			0 0 22px 2px color-mix(in srgb, var(--color-accent) 22%, transparent),
			inset 0 0 18px color-mix(in srgb, var(--color-accent) 7%, transparent);
		transition:
			left 0.34s cubic-bezier(0.3, 0.8, 0.3, 1),
			top 0.34s cubic-bezier(0.3, 0.8, 0.3, 1),
			width 0.34s cubic-bezier(0.3, 0.8, 0.3, 1),
			height 0.34s cubic-bezier(0.3, 0.8, 0.3, 1);
	}

	/* --- caption card -------------------------------------------------- */
	.tour-card {
		position: fixed;
		z-index: 9999;
		background: var(--tip-paper, #fff);
		border: 1px solid var(--rule);
		box-shadow: var(--brutal-shadow);
		padding: 10px 12px 9px;
		color: #1a1a1a;
	}
	.tc-head {
		display: flex;
		align-items: center;
		gap: 7px;
	}
	.tc-num {
		width: 17px;
		height: 17px;
		border-radius: 50%;
		background: var(--color-accent);
		color: #fff;
		font-family: var(--font-mono);
		font-size: 0.56rem;
		font-weight: 800;
		display: grid;
		place-items: center;
		flex: 0 0 auto;
	}
	.tc-title {
		font-size: 0.7rem;
		font-weight: 800;
		letter-spacing: 0.05em;
		text-transform: uppercase;
	}
	.tc-close {
		margin-left: auto;
		border: none;
		background: none;
		color: #8a8a8a;
		cursor: pointer;
		font-size: 0.72rem;
		padding: 0 2px;
	}
	.tc-close:hover {
		color: #1a1a1a;
	}
	.tc-body {
		font-size: 0.68rem;
		line-height: 1.55;
		color: #4a4a4a;
		margin: 6px 0 9px;
	}
	.tc-foot {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.tc-dots {
		display: flex;
		gap: 5px;
	}
	.tc-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		border: none;
		padding: 0;
		background: #d4d4d4;
		cursor: pointer;
	}
	.tc-dot.on {
		background: var(--color-accent);
		transform: scale(1.3);
	}
	.tc-nav {
		margin-left: auto;
		display: flex;
		gap: 6px;
	}
	.tc-round {
		width: 26px;
		height: 26px;
		border-radius: 50%;
		border: 1px solid #d8d8d8;
		background: #fff;
		color: #3a3a3a;
		cursor: pointer;
		display: grid;
		place-items: center;
		font-size: 0.7rem;
		transition:
			transform 0.14s ease,
			background 0.14s ease;
	}
	.tc-round:hover:not(:disabled) {
		transform: scale(1.09);
	}
	.tc-round:disabled {
		opacity: 0.35;
		cursor: default;
	}
	.tc-round.is-primary {
		background: var(--color-accent);
		border-color: var(--color-accent);
		color: #fff;
	}

	@media (prefers-reduced-motion: reduce) {
		.tour-marker.is-active {
			animation: none;
		}
		.tour-ring,
		.tour-offer {
			transition: none;
			animation: none;
		}
	}
</style>
