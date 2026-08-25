<script lang="ts">
	import { onMount } from 'svelte';
	import { tourState, startTour, offerTour, tourSeen, forgetTour } from './store';
	import GuidedTour from './GuidedTour.svelte';
	import type { TourDefinition } from './types';

	/**
	 * The badge that starts a tour, plus the unprompted offer.
	 *
	 * Two ways in, deliberately. The badge is always there for someone who wants
	 * it; the offer appears once, after a few seconds of the reader being on the
	 * page, and never again on that browser. A tour offered on load competes with
	 * the page for a first impression and loses; a tour offered after the reader
	 * has looked around is answering a question they have started to have.
	 *
	 * `offerAfter: 0` on the definition disables the unprompted half entirely —
	 * some pages should only ever be toured on request.
	 */
	let { tour, label = 'Show me around' }: { tour: TourDefinition; label?: string } = $props();

	const active = $derived($tourState.tour?.id === tour.id);

	onMount(() => {
		const wait = tour.offerAfter ?? 0;
		if (wait <= 0 || tourSeen(tour.id)) return;
		const t = setTimeout(() => {
			/* Don't interrupt: if some other tour got started meanwhile, stay quiet. */
			if (!$tourState.tour) offerTour(tour);
		}, wait * 1000);
		return () => clearTimeout(t);
	});
</script>

<button
	class="tour-badge"
	class:on={active}
	onclick={() => startTour(tour)}
	title="{tour.steps.length} stops · Esc to leave"
>
	<span class="tb-dust"><i class="fat fa-wand-magic-sparkles"></i></span>
	<span class="tb-label">{label}</span>
	<span class="tb-count">{tour.steps.length}</span>
</button>

<button
	class="tour-reset"
	onclick={() => forgetTour(tour.id)}
	title="Forget that this browser has been offered the tour, so the prompt appears again"
	aria-label="Reset tour offer">
	<i class="fat fa-rotate-left"></i>
</button>

<GuidedTour />

<style>
	.tour-badge {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		font-family: inherit;
		font-size: 0.66rem;
		font-weight: 700;
		letter-spacing: 0.07em;
		text-transform: uppercase;
		color: var(--ink);
		background: var(--paper-card);
		border: 1px solid var(--rule);
		padding: 5px 11px 5px 9px;
		cursor: pointer;
		transition:
			border-color 0.14s ease,
			background 0.14s ease,
			color 0.14s ease;
	}
	.tour-badge:hover,
	.tour-badge.on {
		border-color: var(--color-accent);
		background: color-mix(in srgb, var(--color-accent) 8%, var(--paper));
		color: var(--color-accent);
	}
	.tb-dust {
		color: var(--color-accent);
		font-size: 0.78rem;
	}
	.tb-count {
		font-family: var(--font-mono);
		font-size: 0.58rem;
		color: var(--ink-soft);
		border-left: 1px solid var(--rule-soft);
		padding-left: 7px;
	}
	.tour-reset {
		border: none;
		background: none;
		color: var(--ink-soft);
		opacity: 0.55;
		cursor: pointer;
		font-size: 0.7rem;
		padding: 0 4px;
	}
	.tour-reset:hover {
		opacity: 1;
		color: var(--color-accent);
	}
</style>
