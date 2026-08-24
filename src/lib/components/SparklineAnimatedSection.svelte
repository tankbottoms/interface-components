<script lang="ts">
	/**
	 * The animated counterpart to Sparkline (Standalone).
	 *
	 * Same eight rendering variants, but streaming. The point of the section is
	 * the *rate*: a sparkline at 1 fps reads as a log, at 8 fps as a monitor, and
	 * at 30 fps as an instrument. The three fixed-rate rows below the main grid
	 * exist so those three feel different side by side rather than one at a time.
	 */
	import DemoControls from './DemoControls.svelte';
	import SparkGrid from './SparkGrid.svelte';

	let fps = $state(8);
	let seed = $state(7);

	const RATES = [
		{ fps: 1, label: '1 fps', blurb: 'Reads as a log. Each point is a discrete event you can count.' },
		{ fps: 8, label: '8 fps', blurb: 'Reads as a monitor. Motion is legible without demanding attention.' },
		{ fps: 30, label: '30 fps', blurb: 'Reads as an instrument. Smooth, but it owns the eye — use sparingly.' }
	];
</script>

<section id="sparkline-animated" class="anim">
	<h2 class="anim-title"><i class="fat fa-film"></i> Sparkline (Animated)</h2>

	<p class="anim-intro">
		Every variant from the standalone section, streaming instead of static. One
		<code>requestAnimationFrame</code> loop drives all of them and throttles to the requested rate,
		reading the rate through a getter on each frame — so dragging the slider retunes the running
		animation rather than restarting it, and the charts keep their history. Zero fps parks the loop
		without tearing it down, which is why pausing and resuming is instantaneous. After a background
		tab stall the accumulator is taken modulo the frame step rather than drained, so you get the next
		frame, not forty catch-up frames at once.
	</p>

	<DemoControls
		bind:fps
		onreshuffle={() => (seed = Math.floor(Math.random() * 100000))}
		note="Same data pipeline as the static section — only the clock differs"
	/>

	<SparkGrid {fps} {seed} height={90} minWidth={200} />

	<h3 class="rates-title">Rate comparison</h3>
	<p class="anim-intro">
		The same four variants at three fixed rates, running simultaneously. These ignore the slider
		above on purpose — the comparison only works if all three are on screen at once.
	</p>

	<div class="rates">
		{#each RATES as r (r.fps)}
			<div class="rate">
				<div class="rate-head">
					<span class="rate-label">{r.label}</span>
					<span class="rate-blurb">{r.blurb}</span>
				</div>
				<SparkGrid fps={r.fps} {seed} height={64} minWidth={120} limit={4} captions={false} />
			</div>
		{/each}
	</div>
</section>

<style>
	.anim {
		margin: var(--spacing-xl) 0;
		padding-top: var(--spacing-xl);
		border-top: 2px solid var(--color-border);
	}
	.anim-title {
		font-size: 1.1rem;
		font-weight: 700;
		letter-spacing: 0.03em;
		margin-bottom: var(--spacing-sm);
	}
	.anim-title i {
		color: var(--color-accent);
	}
	/* Full width — these intros are prose, not a sidebar column. */
	.anim-intro {
		font-size: 0.85rem;
		line-height: 1.65;
		color: var(--color-text-muted);
		margin-bottom: var(--spacing-md);
	}
	.anim-intro code {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		padding: 1px 4px;
		background: var(--color-bg-alt);
	}
	.rates-title {
		font-size: 0.8rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--color-text-muted);
		margin: var(--spacing-lg) 0 var(--spacing-sm);
		padding-bottom: 4px;
		border-bottom: 1px solid var(--color-border-light);
	}
	.rates {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
		gap: var(--spacing-lg);
	}
	.rate {
		min-width: 0;
	}
	.rate-head {
		display: flex;
		flex-direction: column;
		gap: 2px;
		margin-bottom: var(--spacing-xs);
	}
	.rate-label {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-accent);
	}
	.rate-blurb {
		font-size: 0.72rem;
		line-height: 1.5;
		color: var(--color-text-muted);
	}
</style>
