<script lang="ts">
	import {
		elegantPastels,
		housePastels,
		chartSeries,
		statusColors,
		accentSwatches,
		DEFAULT_ACCENT
	} from '$lib/data/palette';
	import { accentColor } from '$lib/stores/highlight';

	const statusRows = Object.entries(statusColors) as [
		string,
		{ fill: string; stroke: string }
	][];
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
		The site highlight is <strong>Teal {DEFAULT_ACCENT}</strong> — the darkened companion of the
		palette's aqua, and the accent the house sheet already uses. It reads as a link, survives on
		cream paper and on dark, and is not purple. Pick any of the twelve below from the header icon;
		anyone still holding a retired purple is migrated to teal automatically.
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
</div>

<style>
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
