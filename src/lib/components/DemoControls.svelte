<script lang="ts">
	/**
	 * The control strip that sits above every live demo: reshuffle the synthetic
	 * data, and drive the animation rate.
	 *
	 * `fps` is bindable and doubles as the play/pause state — 0 means static, and
	 * pausing stashes the previous rate so play returns you to it rather than to
	 * some arbitrary default.
	 */
	interface Props {
		fps?: number;
		max?: number;
		onreshuffle?: () => void;
		/** Hide the shuffle button for demos whose data is not regenerable. */
		shuffle?: boolean;
		note?: string;
	}

	let {
		fps = $bindable(0),
		max = 30,
		onreshuffle,
		shuffle = true,
		note = ''
	}: Props = $props();

	let resume = $state(8);

	function togglePlay() {
		if (fps > 0) {
			resume = fps;
			fps = 0;
		} else {
			fps = resume || 8;
		}
	}
</script>

<div class="demo-controls">
	{#if shuffle}
		<button type="button" class="ctl" onclick={() => onreshuffle?.()}>
			<i class="fat fa-shuffle"></i> Reshuffle
		</button>
	{/if}

	<button type="button" class="ctl" onclick={togglePlay} aria-pressed={fps > 0}>
		<i class="fat {fps > 0 ? 'fa-pause' : 'fa-play'}"></i>
		{fps > 0 ? 'Pause' : 'Animate'}
	</button>

	<label class="fps">
		<span class="fps-label">FPS</span>
		<input type="range" min="0" {max} step="1" bind:value={fps} aria-label="Frames per second" />
		<output class="fps-value">{fps === 0 ? 'static' : `${fps} fps`}</output>
	</label>

	{#if note}
		<span class="note">{note}</span>
	{/if}
</div>

<style>
	.demo-controls {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--spacing-sm);
		padding: var(--spacing-xs) var(--spacing-sm);
		border: 1px solid var(--color-border);
		background: var(--color-bg-alt);
		margin-bottom: var(--spacing-sm);
	}
	.ctl {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-family: var(--font-mono);
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		padding: 4px 10px;
		border: 1px solid var(--color-border);
		background: var(--color-bg);
		color: var(--color-text);
		cursor: pointer;
		box-shadow: 2px 2px 0 var(--color-shadow);
	}
	.ctl:hover {
		background: var(--color-accent);
		color: #fff;
		border-color: var(--color-accent);
	}
	.ctl:active {
		box-shadow: none;
		transform: translate(2px, 2px);
	}
	.ctl i {
		font-size: 0.7rem;
	}
	.fps {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		font-family: var(--font-mono);
		font-size: 0.65rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-text-muted);
	}
	.fps input[type='range'] {
		width: 120px;
		accent-color: var(--color-accent);
	}
	.fps-value {
		min-width: 4.5em;
		color: var(--color-text);
		font-weight: 700;
	}
	.note {
		font-size: 0.65rem;
		color: var(--color-text-muted);
		margin-left: auto;
	}

	@media (max-width: 768px) {
		.note {
			margin-left: 0;
			flex-basis: 100%;
		}
	}
</style>
