<script lang="ts">
	import {
		elegantPastels,
		housePastels,
		chartSeries,
		statusColors,
		accentSwatches,
		DEFAULT_ACCENT,
		DEFAULT_ACCENT_DARK
	} from '$lib/data/palette';
	import { accentColor } from '$lib/stores/highlight';
	import { fitStage } from '$lib/interface/fitStage';
	import { magxById } from '$lib/interface/magx';

	const statusRows = Object.entries(statusColors) as [
		string,
		{ fill: string; stroke: string }
	][];

	/**
	 * Closing section: the palette as a panel-built colour bench. Unlike the
	 * swatch grids above, this one writes — the picker and the swatch dropdown
	 * both set the site accent through the same store the header uses, so a
	 * change here repaints every page immediately.
	 */
	const CP_W = 336;
	let panelStage: HTMLDivElement | null = $state(null);
	$effect(() => (panelStage ? fitStage(panelStage, 12) : undefined));

	let preview = $state(DEFAULT_ACCENT);
	let swatchIndex = $state(0);

	$effect(() => {
		const read = (id: string): any => (magxById(id) as any)?.getValue?.();
		const onChange = (e: Event) => {
			const id = (e as CustomEvent).detail?.panelElementId as string;
			if (id === 'pl-pick') {
				preview = String(read(id) ?? DEFAULT_ACCENT);
			} else if (id === 'pl-swatch') {
				swatchIndex = read(id)?.index ?? 0;
				preview = accentSwatches[swatchIndex]?.color ?? DEFAULT_ACCENT;
			} else if (id === 'pl-apply') {
				accentColor.set(preview);
			} else if (id === 'pl-reset') {
				preview = DEFAULT_ACCENT;
				accentColor.set(DEFAULT_ACCENT);
			}
		};
		document.addEventListener('magx-panelValueChanged', onChange);
		return () => document.removeEventListener('magx-panelValueChanged', onChange);
	});
</script>

<svelte:head>
	<title>Palette — Interface Components</title>
</svelte:head>

<div class="ifc">
	<header class="ifc-page-head">
		<div class="ifc-eyebrow">Interface · 04</div>
		<h1 class="ifc-page-title">Palette</h1>
		<p class="ifc-page-lede">
			Two sources, one system. The eight elegant pastels supply the light fills; the house palette
			supplies the working greens, ambers and cyans the dashboards already use. Every fill carries a
			darkened same-hue companion, because a pastel cannot hold a 1px stroke or a text label on its
			own — that pairing is what makes the charts legible in both themes.
		</p>
	</header>

	<div class="ifc-sec">
		<span class="ifc-sec-tag">01</span>
		<span class="ifc-sec-title">Accent</span>
		<span class="ifc-sec-hint">stroke weight · no purple</span>
	</div>
	<p class="ifc-sec-note">
		The site highlight is <strong>Amber {DEFAULT_ACCENT}</strong> on paper and
		<strong>{DEFAULT_ACCENT_DARK}</strong> on dark — one hue at two luminances, because the brand
		orange that carries a mark on navy falls to 2.0:1 against white and stops being readable at
		10px. It is the only accent here that needs the pair; the rest are mid-tone strokes that hold
		on either ground. Pick any of the thirteen below from the header icon; anyone still holding a
		retired purple is migrated automatically.
	</p>
	<div class="ifc-grid ifc-grid-auto">
		{#each accentSwatches as a}
			<button class="acc" class:on={$accentColor === a.color} onclick={() => ($accentColor = a.color)}>
				<span class="acc-chip" style="background:{a.color}"></span>
				<span class="acc-name">{a.name}</span>
				<span class="acc-hex">{a.color}</span>
			</button>
		{/each}
	</div>

	<div class="ifc-sec">
		<span class="ifc-sec-tag">02</span>
		<span class="ifc-sec-title">Eight elegant pastels</span>
		<span class="ifc-sec-hint">fill / stroke pairs</span>
	</div>
	<div class="ifc-grid ifc-grid-4">
		{#each elegantPastels as s}
			<div class="sw">
				<div class="sw-fill" style="background:{s.fill};border-color:{s.stroke}">
					<span class="sw-stroke" style="background:{s.stroke}"></span>
				</div>
				<div class="sw-name">{s.name}</div>
				<div class="sw-hex">{s.fill} / {s.stroke}</div>
				<div class="sw-token">--pastel-{s.token} · --stroke-{s.token}</div>
			</div>
		{/each}
	</div>

	<div class="ifc-sec">
		<span class="ifc-sec-tag">03</span>
		<span class="ifc-sec-title">House palette</span>
		<span class="ifc-sec-hint">carried over from the reference dashboards</span>
	</div>
	<div class="ifc-grid ifc-grid-4">
		{#each housePastels as s}
			<div class="sw">
				<div class="sw-fill" style="background:{s.fill};border-color:{s.stroke}">
					<span class="sw-stroke" style="background:{s.stroke}"></span>
				</div>
				<div class="sw-name">{s.name}</div>
				<div class="sw-hex">{s.fill} / {s.stroke}</div>
				<div class="sw-token">--pastel-{s.token} · --stroke-{s.token}</div>
			</div>
		{/each}
	</div>

	<div class="ifc-sec">
		<span class="ifc-sec-tag">04</span>
		<span class="ifc-sec-title">Chart series order</span>
		<span class="ifc-sec-hint">hues alternate so neighbours never collide</span>
	</div>
	<div class="series">
		{#each chartSeries as s, i}
			<div class="series-cell" style="background:{s.fill};border-color:{s.stroke}">
				<span class="series-idx">--chart-{i + 1}</span>
				<span class="series-name">{s.name}</span>
			</div>
		{/each}
	</div>

	<div class="ifc-sec">
		<span class="ifc-sec-tag">05</span>
		<span class="ifc-sec-title">Status ramp</span>
		<span class="ifc-sec-hint">meters, chips, badges</span>
	</div>
	<div class="ifc-grid ifc-grid-4">
		{#each statusRows as [name, c]}
			<div class="sw">
				<div class="sw-fill" style="background:{c.fill};border-color:{c.stroke}">
					<span class="sw-stroke" style="background:{c.stroke}"></span>
				</div>
				<div class="sw-name">{name}</div>
				<div class="sw-hex">{c.fill} / {c.stroke}</div>
				<div class="sw-token">--status-{name} · --status-{name}-stroke</div>
			</div>
		{/each}
	</div>

	<!-- 06 ------------------------------------------------------------ -->
	<div class="ifc-sec">
		<span class="ifc-sec-tag">06</span>
		<span class="ifc-sec-title">The same palette, in panels</span>
		<span class="ifc-sec-hint">drag · collapse · tab</span>
	</div>
	<p class="ifc-sec-note">
		A colour bench built from panel elements. This one writes: <em>Apply</em> sets the site accent
		through the same store the header icon uses, so the whole site repaints and the choice is
		persisted. Click a title bar and press <kbd>Tab</kbd> to walk the controls — arrows step the
		swatch list and move the picker along the ramp, <kbd>Space</kbd> fires a button.
	</p>
	<div class="ifc-card cp-card">
		<div bind:this={panelStage} class="cp-stage">
			<magx-panel title="Accent" x="0" y="0" style="--magx-panel-panel-width:{CP_W}px">
				<magx-panel-dropdown id="pl-swatch" title="Swatch" index="0">
					{#each accentSwatches as a (a.color)}<option>{a.name}</option>{/each}
				</magx-panel-dropdown>
				<magx-panel-colorpicker id="pl-pick" title="Fine tune" color={preview}
				></magx-panel-colorpicker>
				<magx-panel-html title="preview">
					<div class="pl-preview" style="background:{preview}"></div>
					<div class="pl-log">{preview} · live accent {$accentColor}</div>
				</magx-panel-html>
				<magx-panel-button id="pl-apply" title="Apply to site" mode="momentary"
				></magx-panel-button>
				<magx-panel-button id="pl-reset" title="Reset to teal" mode="momentary"
				></magx-panel-button>
			</magx-panel>

			<magx-panel title="Pastels" x="352" y="0" style="--magx-panel-panel-width:{CP_W}px">
				<magx-panel-html title="eight elegant · fill / stroke">
					<div class="pl-ramp">
						{#each elegantPastels as s (s.token)}
							<div class="pl-chip" style="background:{s.fill};border-color:{s.stroke}">
								<span class="pl-chip-name">{s.name}</span>
							</div>
						{/each}
					</div>
				</magx-panel-html>
				<magx-panel-html title="house palette">
					<div class="pl-ramp">
						{#each housePastels as s (s.token)}
							<div class="pl-chip" style="background:{s.fill};border-color:{s.stroke}">
								<span class="pl-chip-name">{s.name}</span>
							</div>
						{/each}
					</div>
				</magx-panel-html>
			</magx-panel>

			<magx-panel title="Series &amp; status" x="704" y="0" style="--magx-panel-panel-width:{CP_W}px">
				<magx-panel-html title="chart series order">
					<div class="pl-strip">
						{#each chartSeries as s, i (s.name)}
							<span
								class="pl-cell"
								style="background:{s.fill};border-color:{s.stroke}"
								title="--chart-{i + 1} · {s.name}"
							></span>
						{/each}
					</div>
				</magx-panel-html>
				<magx-panel-html title="status ramp">
					<div class="pl-kv">
						{#each statusRows as [name, c] (name)}
							<div class="pl-row">
								<span class="pl-key" style="background:{c.fill};border-color:{c.stroke}"></span>
								<span>{name}</span>
								<b>{c.fill}</b>
							</div>
						{/each}
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
	.pl-preview {
		height: 34px;
		border: 1px solid var(--rule-soft);
	}
	.pl-log {
		margin-top: 4px;
		font-size: 0.62rem;
		opacity: 0.7;
	}
	.pl-ramp {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 3px;
	}
	.pl-chip {
		border: 1px solid;
		padding: 4px 5px;
		font-size: 0.6rem;
		color: #111;
	}
	.pl-chip-name {
		white-space: nowrap;
	}
	.pl-strip {
		display: flex;
		gap: 2px;
	}
	.pl-cell {
		flex: 1;
		height: 26px;
		border: 1px solid;
	}
	.pl-kv {
		display: flex;
		flex-direction: column;
		gap: 3px;
	}
	.pl-row {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 0.66rem;
	}
	.pl-row b {
		margin-left: auto;
		font-variant-numeric: tabular-nums;
		opacity: 0.7;
	}
	.pl-key {
		width: 12px;
		height: 12px;
		border: 1px solid;
		flex: none;
	}

	.acc {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		border: 1px solid var(--rule-soft);
		background: var(--paper-card);
		padding: 6px 9px;
		font-family: inherit;
		font-size: 0.72rem;
		color: var(--ink);
		cursor: pointer;
		text-align: left;
	}
	.acc:hover {
		border-color: var(--rule);
	}
	.acc.on {
		border-color: var(--rule);
		box-shadow: var(--brutal-shadow);
	}
	.acc-chip {
		width: 22px;
		height: 22px;
		border: 1px solid var(--rule);
		flex-shrink: 0;
	}
	.acc-hex {
		margin-left: auto;
		color: var(--ink-soft);
		font-size: 0.62rem;
	}
	.sw {
		border: 1px solid var(--rule-soft);
		background: var(--paper-card);
		padding: 8px;
	}
	.sw-fill {
		height: 54px;
		border: 1px solid;
		position: relative;
		margin-bottom: 6px;
	}
	.sw-stroke {
		position: absolute;
		inset: auto 0 0 0;
		height: 10px;
	}
	.sw-name {
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0.05em;
		text-transform: uppercase;
	}
	.sw-hex {
		font-size: 0.62rem;
		color: var(--ink-muted);
	}
	.sw-token {
		font-size: 0.58rem;
		color: var(--ink-soft);
		word-break: break-all;
	}
	.series {
		display: grid;
		grid-template-columns: repeat(8, minmax(0, 1fr));
		border: 1px solid var(--rule);
	}
	.series-cell {
		border-left: 1px solid;
		padding: 14px 8px;
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-height: 78px;
	}
	.series-idx {
		font-size: 0.58rem;
		color: var(--ink-note);
		letter-spacing: 0.06em;
	}
	.series-name {
		font-size: 0.68rem;
		font-weight: 700;
		color: var(--ink);
	}
	@media (max-width: 900px) {
		.series {
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}
	}
</style>
