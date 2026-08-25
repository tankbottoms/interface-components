<script lang="ts">
	const sections = [
		{
			href: '/interface/charting',
			tag: '01',
			name: 'Charting',
			icon: 'fa-chart-column',
			body: 'Bars with rolling means, stacked columns, load-shape heatmaps, multi-series lines, sparkline tiles, ranked bars, treemaps, donuts and meters — inline SVG, no charting dependency.'
		},
		{
			href: '/interface/layout',
			tag: '02',
			name: 'Layout & Data',
			icon: 'fa-table-cells-large',
			body: 'Banners, KPI tiles and strips, badges, pills, data-source chips, menu and settings popovers, expandable agency rows, node cards and dense tables.'
		},
		{
			href: '/interface/documents',
			tag: '03',
			name: 'Documents',
			icon: 'fa-file-lines',
			body: 'Breadcrumbs and tools, metadata badge rows, title blocks with serif citations, enriched metadata, tag groups, extracted insights, and a split source/text pane.'
		},
		{
			href: '/interface/wayfinding',
			tag: '04',
			name: 'Wayfinding',
			icon: 'fa-location-crosshairs',
			body: 'Corner circle-i affordances, numbered key locations on a page wireframe, control clusters over maps and 3-D viewers, and a guided tour that highlights without darkening the page.'
		},
		{
			href: '/interface/settings',
			tag: '05',
			name: 'Settings & Analytics',
			icon: 'fa-gear',
			body: 'The gear glyph and its two surfaces — anchored popover or dedicated page, same four groups either way — plus the built-in per-site analytics page: KPI strip with filled sparklines, traffic shape, dense table.'
		},
		{
			href: '/interface/palette',
			tag: '06',
			name: 'Palette',
			icon: 'fa-palette',
			body: 'The eight elegant pastels, the house palette, chart series order, the status ramp, and the eight accent options behind the header picker.'
		}
	];
</script>

<svelte:head>
	<title>Interface — Interface Components</title>
</svelte:head>

<div class="ifc">
	<header class="ifc-page-head">
		<div class="ifc-eyebrow">Interface</div>
		<h1 class="ifc-page-title">Interface Patterns</h1>
		<p class="ifc-page-lede">
			A separate section from Components. Where Components documents the magx web components, this
			documents the surrounding interface language — charting, layout, and document presentation —
			drawn from the dashboards it was distilled from and rebuilt on one palette. Every figure here
			is generated, not fetched.
		</p>
	</header>

	<div class="ifc-grid ifc-grid-2">
		{#each sections as s}
			<a class="ifc-card idx" href={s.href}>
				<div class="ifc-card-hdr">
					<span class="ifc-sec-tag">{s.tag}</span>
					<span class="ifc-card-title"><i class="fat {s.icon}"></i> {s.name}</span>
				</div>
				<p class="ifc-mono-note">{s.body}</p>
			</a>
		{/each}
	</div>
</div>

<style>
	.idx {
		display: block;
		color: var(--ink);
		text-decoration: none;
	}
	/*
	 * Hover changes the card the anchor wraps rather than lifting it. `.ifc-card`
	 * is the child, so the rule reaches through — the anchor itself has no box.
	 */
	.idx:hover :global(.ifc-card) {
		border-color: var(--color-accent);
		background: color-mix(in srgb, var(--color-accent) 4%, var(--paper-card));
	}
	.idx:hover {
		text-decoration: none;
	}
	.idx p {
		margin: 6px 0 0;
	}
</style>
