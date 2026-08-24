<script lang="ts">
	/**
	 * Reshuffle + animate strip for the Interface pages.
	 *
	 * Deliberately not the same component as the Components-page `DemoControls`:
	 * that one wears the documentation styling, this one wears the `.ifc` house
	 * style (mono uppercase, hard shadow, ink rules). The behaviour is identical,
	 * and `fps = 0` is the static case rather than a separate mode — every chart
	 * simply holds its frame.
	 */
	interface Props {
		fps?: number;
		seed?: number;
		frame?: number;
		max?: number;
		onreshuffle?: () => void;
		note?: string;
	}

	let {
		fps = $bindable(0),
		seed = 0,
		frame = 0,
		max = 30,
		onreshuffle,
		note = ''
	}: Props = $props();

	/** Remember the rate so pause → play returns to it rather than to 1 fps. */
	let resume = $state(8);

	function toggle() {
		if (fps > 0) {
			resume = fps;
			fps = 0;
		} else {
			fps = resume;
		}
	}
</script>

<div class="ifc-anim">
	{#if onreshuffle}
		<button class="ifc-btn" onclick={onreshuffle}>
			<i class="fat fa-rotate"></i> Reshuffle data
		</button>
	{/if}

	<button class="ifc-btn" class:is-on={fps > 0} onclick={toggle}>
		<i class="fat {fps > 0 ? 'fa-pause' : 'fa-play'}"></i>
		{fps > 0 ? 'Pause' : 'Animate'}
	</button>

	<label class="ifc-anim-rate">
		<span class="k">FPS</span>
		<input type="range" min="0" max={max} step="1" bind:value={fps} aria-label="Frames per second" />
		<span class="v">{fps === 0 ? 'static' : `${fps}`}</span>
	</label>

	<span class="ifc-anim-meta">
		seed {seed}{#if fps > 0} · frame {frame}{/if}
	</span>

	{#if note}
		<span class="ifc-anim-note">{note}</span>
	{/if}
</div>

<style>
	.ifc-anim {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--spacing-sm);
		margin-top: var(--spacing-sm);
	}
	.ifc-anim :global(.ifc-btn.is-on) {
		background: var(--color-accent);
		border-color: var(--color-accent);
		color: #fff;
	}
	.ifc-anim-rate {
		display: flex;
		align-items: center;
		gap: 6px;
		border: 1px solid var(--rule);
		background: var(--paper-card);
		padding: 3px 8px;
		font-size: 0.62rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}
	.ifc-anim-rate .k {
		color: var(--ink-soft);
	}
	.ifc-anim-rate .v {
		min-width: 3.5em;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
	}
	.ifc-anim-rate input[type='range'] {
		width: 110px;
		accent-color: var(--color-accent);
	}
	.ifc-anim-meta {
		font-size: 0.62rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--ink-soft);
		font-variant-numeric: tabular-nums;
	}
	.ifc-anim-note {
		flex-basis: 100%;
		font-size: 0.66rem;
		color: var(--ink-soft);
		line-height: 1.5;
	}
</style>
