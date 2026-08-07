<script lang="ts">
	/**
	 * The hero used to be two PNGs. It is now the actual thing: a live, draggable
	 * panel wired to a live sparkline, next to a grid of real sparkline canvases,
	 * both driven by the same reshuffle button and FPS control. If the components
	 * break, the front page breaks — which is the point.
	 */
	import type { ComponentDef } from '$lib/data/components';
	import DemoControls from './DemoControls.svelte';
	import SparkGrid from './SparkGrid.svelte';
	import { onMount } from 'svelte';
	import { onTick, hexToRgb, cssVar } from '$lib/anim';
	import { walk } from '$lib/interface/generate';

	declare const __BUILD_VERSION__: string;

	interface Props {
		components: ComponentDef[];
	}

	let { components }: Props = $props();

	let fps = $state(0);
	let seed = $state(1);

	/** Panel width in px — the trainer plate below it is locked to the same box. */
	const PANEL_W = 300;

	let heroPanelSpark: HTMLElement | null = $state(null);
	let ready = $state(false);
	let cursor = 52;
	let load = $state(48);

	function sparkOf(el: any) {
		return el?.getSparkline?.() ?? null;
	}

	function paintPanelSpark(s: number) {
		const sp = sparkOf(heroPanelSpark);
		if (!sp) return;
		const accent = hexToRgb(cssVar('--color-accent', '#3792a4'));
		const bg = hexToRgb(cssVar('--color-bg-alt', '#faf8f3'));
		sp.setBackgroundColor({ ...bg, a: 1 });
		sp.setDataPointNum(48);
		sp.setType('line');
		sp.setLineWidth(1.5);
		sp.setLineColor('solid', { ...accent, a: 1 });
		sp.setFill('gradient', { above: { ...accent, a: 0.4 }, below: { ...accent, a: 0.04 } });
		sp.setReferenceLine('average');
		sp.setReferenceLineColor({ r: 150, g: 150, b: 150, a: 0.4 }, 1);
		const data = walk(48, { seed: s, min: 12, max: 88 });
		sp.setData(data);
		sp.renderCanvas();
		cursor = data[data.length - 1];
	}

	onMount(() => {
		const raf = requestAnimationFrame(() => {
			// Give the Lit elements a beat to upgrade before we reach into them.
			setTimeout(() => {
				ready = true;
				paintPanelSpark(seed);
			}, 60);
		});
		return () => cancelAnimationFrame(raf);
	});

	$effect(() => {
		const s = seed;
		if (!ready) return;
		paintPanelSpark(s);
		load = 30 + ((s * 37) % 55);
	});

	$effect(() => {
		if (!ready) return;
		return onTick(
			() => fps,
			() => {
				const sp = sparkOf(heroPanelSpark);
				if (!sp) return;
				cursor = Math.max(10, Math.min(90, cursor + (Math.random() - 0.5) * 14));
				sp.addDatapoint(cursor);
				sp.renderCanvas();
				// The progress bar is a plain reactive prop — Lit picks the change up.
				load = Math.round(cursor);
			}
		);
	});
</script>

<section class="hero">
	<h1 class="hero-title"><i class="fas fa-cubes"></i> Interface Components</h1>
	<p class="hero-subtitle">
		A collection of draggable panel UI components and sparkline charts built as Lit web components.
		Based on the <a href="https://github.com/mlalma/magx/tree/main" target="_blank" rel="noopener"
			>magx</a
		> project by <a href="https://github.com/mlalma" target="_blank" rel="noopener">mlalma</a> —
		I liked the components enough to build them into a library I could use for my own webapps.
		Everything below this line is live: the panel is draggable, the canvases are real, and the
		controls regenerate and animate the synthetic data in place.
		<span class="build-version">{__BUILD_VERSION__}</span>
	</p>

	<div class="hero-stats">
		<div class="stat">
			<i class="fas fa-box-open"></i>
			<span>{components.length} Components</span>
		</div>
		<div class="stat">
			<i class="fas fa-code"></i>
			<span>TypeScript</span>
		</div>
		<div class="stat">
			<i class="fas fa-feather"></i>
			<span>Lightweight</span>
		</div>
		<div class="stat">
			<i class="fas fa-puzzle-piece"></i>
			<span>Web Components</span>
		</div>
	</div>

	<DemoControls
		bind:fps
		onreshuffle={() => (seed = Math.floor(Math.random() * 100000))}
		note="Reshuffle redraws from a new seed · FPS streams new points live"
	/>

	<div class="hero-live">
		<div class="hero-col" style="--panel-w:{PANEL_W}px">
			<div class="panel-stage">
				<magx-panel
					title="Live Panel"
					x="0"
					y="0"
					style="--magx-panel-panel-width:{PANEL_W}px"
				>
					<magx-panel-sparkline bind:this={heroPanelSpark} title="Throughput"
					></magx-panel-sparkline>
					<magx-panel-progressbar title="Load" currentValue={load} maxValue="100"
					></magx-panel-progressbar>
					<magx-panel-range title="Sample Rate" min="1" max="60" value="12"></magx-panel-range>
					<magx-panel-toggle title="Stream" labelOn="LIVE" labelOff="IDLE" checked
					></magx-panel-toggle>
					<magx-panel-dropdown title="Source" index="0">
						<option label="node-eleven">node-eleven</option>
						<option label="spark-1">spark-1</option>
						<option label="seaweed">seaweed</option>
					</magx-panel-dropdown>
					<magx-panel-button title="Capture" readout secondary="Reset"></magx-panel-button>
				</magx-panel>
			</div>
			<figure class="plate">
				<img
					src="/screenshots/trainer-hero.jpg"
					alt="Pencil drawing of a time-trial bike on an indoor trainer"
					width="300"
					height="300"
					loading="lazy"
				/>
				<figcaption>
					Same box as the panel — drawn for
					<a
						href="https://heart-rate-broadcaster.atsignhandle.workers.dev/about"
						target="_blank"
						rel="noopener">heart-rate-broadcaster</a
					>
				</figcaption>
			</figure>
		</div>

		<div class="hero-spark">
			<SparkGrid {fps} {seed} height={72} minWidth={160} />
			<p class="hero-spark-note">
				Eight rendering variants of the same standalone <code>&lt;magx-sparkline&gt;</code> element —
				line and bar, gradient and solid fills, above/below split colouring, endpoint dots, and
				average/median reference lines. Colours come from the eight-pastel chart series, so they
				track the site accent and the light/dark theme.
			</p>
		</div>
	</div>
</section>

<style>
	.hero {
		margin-bottom: var(--spacing-xl);
		padding-bottom: var(--spacing-xl);
		border-bottom: 2px solid var(--color-border);
	}
	.hero-title {
		font-size: 1.5rem;
		font-weight: 700;
		letter-spacing: 0.04em;
		margin-bottom: var(--spacing-sm);
	}
	.hero-title i {
		color: var(--color-accent);
	}
	.hero-subtitle {
		font-size: 0.9rem;
		color: var(--color-text-muted);
		line-height: 1.6;
		margin-bottom: var(--spacing-lg);
	}
	.hero-subtitle a {
		color: var(--color-link);
	}
	.build-version {
		font-size: 0.65rem;
		color: var(--color-text-muted);
		font-family: var(--font-mono);
		letter-spacing: 0.02em;
		opacity: 0.6;
	}
	.hero-stats {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-md);
		margin-bottom: var(--spacing-lg);
	}
	.stat {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
		font-size: 0.8rem;
		font-weight: 600;
		padding: var(--spacing-xs) var(--spacing-sm);
		border: 1px solid var(--color-border);
		background: var(--color-bg-alt);
		box-shadow: 2px 2px 0 var(--color-shadow);
	}
	.stat i {
		color: var(--color-accent);
		font-size: 0.85rem;
	}

	.hero-live {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		gap: var(--spacing-lg);
		align-items: start;
	}
	.hero-col {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
		width: var(--panel-w);
	}
	/* The panel positions itself absolutely, so it needs a sized stage to sit in. */
	.panel-stage {
		position: relative;
		width: var(--panel-w);
		min-height: 430px;
	}
	.plate {
		border: 1px solid var(--color-border);
		background: var(--color-bg-alt);
		padding: 6px;
	}
	.plate img {
		display: block;
		width: 100%;
		height: auto;
		filter: grayscale(1);
	}
	.plate figcaption {
		font-family: var(--font-mono);
		font-size: 0.6rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-text-muted);
		margin-top: 4px;
		line-height: 1.4;
	}
	.plate figcaption a {
		color: var(--color-link);
	}
	.hero-spark {
		min-width: 0;
	}
	.hero-spark-note {
		font-size: 0.8rem;
		color: var(--color-text-muted);
		line-height: 1.6;
		margin-top: var(--spacing-sm);
	}
	.hero-spark-note code {
		font-family: var(--font-mono);
		font-size: 0.75rem;
	}

	@media (max-width: 768px) {
		.hero-live {
			grid-template-columns: minmax(0, 1fr);
		}
		.hero-col {
			width: 100%;
		}
		.panel-stage {
			width: 100%;
			overflow: hidden;
		}
	}
</style>
