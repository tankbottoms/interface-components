<script lang="ts">
	/**
	 * Three.js viewports — the interface language for a canvas you cannot scroll.
	 *
	 * Every other page here documents a surface made of boxes: a table, a card, a
	 * chart. This one documents the case where the surface is a single canvas that
	 * fills the window, has no scrollbar, no reading order and no room for a
	 * sidebar — and where every control therefore has to sit *on top of* the thing
	 * it controls without covering the part you came to look at.
	 *
	 * Drawn from citygen (github.com/tankbottoms/citygen), which is the reference
	 * implementation: seven docks, six camera stances, a help overlay that numbers
	 * the controls rather than touring them, and a build that refuses to ship if
	 * any of it drifts.
	 */

	const docks = [
		{
			edge: 'Top-left',
			name: 'Tools',
			icon: 'fa-sliders',
			body: 'What is drawn — terrain, water, roads, buildings, trees. The only dock that opens panels, so it is the only dock that ever covers the canvas.'
		},
		{
			edge: 'Top-right',
			name: 'Settings',
			icon: 'fa-gear',
			body: 'How it is drawn — renderer knobs, culling, budgets, saved preferences. Never scene content. Same corner as the gear on every other page in this library.'
		},
		{
			edge: 'Left',
			name: 'Help',
			icon: 'fa-circle-question',
			body: 'One glyph, leftmost, alone. It puts a numbered circle on every other control at once instead of walking you through them one at a time.'
		},
		{
			edge: 'Right',
			name: 'Camera',
			icon: 'fa-cube',
			body: 'Where you stand. Six stances, mutually exclusive, highlighted rather than boxed — a toggle is a colour change, not a new border.'
		},
		{
			edge: 'Bottom-right',
			name: 'Zoom',
			icon: 'fa-magnifying-glass-plus',
			body: 'One scalar per button. Closer, further, home. Nothing here changes two things at once.'
		},
		{
			edge: 'Bottom-left',
			name: 'Overview',
			icon: 'fa-table-columns',
			body: 'The plan inset. It moves down into the control strip on phones, where there is no strip to sit above.'
		},
		{
			edge: 'Overlay',
			name: 'Meter',
			icon: 'fa-chart-line',
			body: 'Frame rate, triangles, draw calls. Left of the right-hand controls, never underneath them — a number you have to move a menu to read is not being reported.'
		}
	];

	const stances = [
		{ name: 'Orbit', cam: 'perspective', pin: 'nothing — you turn freely', use: 'the default; reading massing' },
		{ name: 'Fly through', cam: 'perspective', pin: 'nothing', use: 'WASD at street level, QE for altitude' },
		{ name: 'Flat', cam: 'orthographic', pin: 'pitch 89.9°', use: 'plan; the map, not the model' },
		{ name: 'Isometric', cam: 'orthographic', pin: 'yaw 45°, pitch 35.264°', use: 'the angle where all three axes measure alike' },
		{ name: 'Paraline', cam: 'orthographic', pin: 'yaw 45°, pitch 30°', use: 'the flatter board-drawing convention' },
		{ name: 'Angle', cam: 'orthographic', pin: 'nothing', use: 'parallel lines you can still turn' }
	];

	const audits = [
		{
			script: 'token-lint.ts',
			refuses: 'a var() naming a token no stylesheet declares',
			runs: 'src/**/*.{svelte,css,ts}',
			note: 'Found three dead names on its first run — an unstyled element is silent in a way a missing import never is.'
		},
		{
			script: 'design-lint.ts',
			refuses: 'raw hex outside the token files',
			runs: 'the ux-spec tree',
			note: 'Not yet enforced here: 88 literals across 19 files would fail the build on the first commit. Ported when they are.'
		},
		{
			script: 'badge-lint.ts',
			refuses: 'a badge width that is not on the scale',
			runs: 'the ux-spec tree',
			note: 'One width per column, including the empty and error states.'
		},
		{
			script: 'script-lint.ts',
			refuses: 'an inline script that does not parse',
			runs: 'built HTML',
			note: 'Single-file output has no bundler to catch a syntax error for it.'
		}
	];
	/** The sixteen numbered controls, in the ring order the help overlay uses.
	 *  Wording is verbatim from the reference implementation's own legend, so the
	 *  documentation cannot drift from the thing it documents. */
	const help = [
		{ n: 1, name: 'Fractal', at: 'top', body: 'Which pattern the ground is made of, and how deep it goes. The city starts here.' },
		{ n: 2, name: 'Map', at: 'top', body: 'The plan reading of that pattern — roads and blocks, no terrain — and the three street separations that shape it.' },
		{ n: 3, name: 'Tools', at: 'top', body: 'Five drawers of dials — ground, roads, buildings, trees, planting. A change regrows only from the stage it touched.' },
		{ n: 4, name: 'Palette', at: 'top', body: 'Theme colours — house, monochrome, Miami Vice, or your own four.' },
		{ n: 5, name: 'Export', at: 'top', body: 'Take it with you — a picture of the stage, the plan as line work, or the model itself.' },
		{ n: 6, name: 'Mode', at: 'top right', body: 'Viewing looks; editing makes plots pickable and the brush live.' },
		{ n: 7, name: 'Frame', at: 'top right', body: 'Fit to view, fly past, or take the tour.' },
		{ n: 8, name: 'Rendering', at: 'top right', body: 'Culling, chunking, adaptive frame rate, decimation — and the meter.' },
		{ n: 9, name: 'Closer', at: 'right', body: 'Zoom in, zoom out, back to where you began.' },
		{ n: 10, name: 'Stance', at: 'right', body: 'Orbit, fly, top-down, isometric, paraline, angle.' },
		{ n: 11, name: 'Extent', at: 'right', body: 'How much ground the fractal is given. Each press halves or doubles it.' },
		{ n: 12, name: 'Resolution', at: 'right', body: 'Terrain grid, five rungs coarse to fine. Regenerates the world.' },
		{ n: 13, name: 'Detail', at: 'right', body: 'Polygon budget — thins the scene to keep the frame cheap.' },
		{ n: 14, name: 'Readout', at: 'bottom right', body: 'Frame rate and the triangles this frame cost.' },
		{ n: 15, name: 'Plan', at: 'bottom left', body: 'The city from above. Drag a region to send the view there, or paint with the brush.' },
		{ n: 16, name: 'Layers', at: 'left', body: 'Ground, mark, form, gloss — plus wireframe, normals and water.' },
	];

	/** Every panel the numbered controls open, shot at the size it opens at. */
	const menus = [
		{
			img: 'menu-tools-ground.png',
			title: 'Tools → Ground',
			from: 3,
			body: 'The drawer the ring opens on. Field, octaves, relief, sea level — each a value with a minus and a plus, no sliders, and the value itself editable in place.',
		},
		{
			img: 'menu-tools-roads.png',
			title: 'Tools → Roads',
			from: 3,
			body: 'Same drawer, different tab, and the preview is live: the panel is wide enough that changing a separation shows you the street grid it produces without closing anything.',
		},
		{
			img: 'menu-tools-trees.png',
			title: 'Tools → Planting',
			from: 3,
			body: 'Species, leaf shape, density and level of detail, with the tree drawn beside the dials. One popup, one fixed size, five tabs — the window never resizes as you move between them.',
		},
		{
			img: 'menu-palette.png',
			title: 'Tools → Colours',
			from: 4,
			body: 'Themes as swatch rows rather than names, wide enough to read all four colours inside the badge. Define… writes a fifth; the choice applies to the scene and the chrome together.',
		},
		{
			img: 'menu-examples.png',
			title: 'Tools → Examples',
			from: 3,
			body: 'Whole settings, not single dials: a city, a town, an island, a dense continent. Each one is the state every tab would have to be set to by hand.',
		},
		{
			img: 'menu-render.png',
			title: 'Rendering',
			from: 8,
			body: 'The cost knobs, kept away from the world knobs: culling, chunk size, target frame rate, decimation. Values edit in place and persist to browser storage.',
		},
		{
			img: 'menu-guide.png',
			title: 'Guide',
			from: 3,
			body: 'Prose, not a tour. What the fractal decides, what the roads decide, and what to reach for first — the one panel that is read rather than operated.',
		},
	];
</script>

<svelte:head>
	<title>Viewports — Interface Components</title>
</svelte:head>

<div class="ifc">
	<header class="ifc-page-head">
		<div class="ifc-eyebrow">Interface · 07</div>
		<h1 class="ifc-page-title">Three.js Viewports</h1>
		<p class="ifc-page-lede">
			The one surface in this library that is not made of boxes. A three.js canvas fills the window,
			has no scrollbar and no reading order, so every control sits <em>on top of</em> the thing it
			controls — and the whole design problem is putting them somewhere they do not cover what you
			came to look at. The reference implementation is
			<a href="https://citygen.tankbottoms.workers.dev" target="_blank" rel="noopener">citygen</a>,
			and the rules below are what survived building it.
		</p>
		<p class="ifc-page-lede" style="margin-top:var(--spacing-sm)">
			The governing rule is <strong>every edge means something</strong>. A control's corner is its
			category, and a control that moves corner has changed what it is. Scene content top-left,
			renderer top-right, camera right, zoom bottom-right, help leftmost and alone. Once the edges
			carry meaning you stop reading labels to find a button.
		</p>
	</header>

	<figure class="ifc-fig">
		<img src="/img/citygen/desktop-plain.png" alt="The citygen viewport at desktop width, controls ringing the canvas, census panels beneath it." />
		<figcaption>
			<b>The surface as it ships.</b> One canvas, five edges in use, and nothing floating in the middle
			of the picture. The strip under the glass is state, not control — mode, the hint line, and what you
			have placed by hand. The six panels below the viewport are the census, in ordinary page flow.
		</figcaption>
	</figure>

	<!-- 01 docks -------------------------------------------------------- -->
	<div class="ifc-sec">
		<span class="ifc-sec-tag">01</span>
		<span class="ifc-sec-title">Seven docks, and what each edge is for</span>
		<span class="ifc-sec-hint">position is the category</span>
	</div>
	<p class="ifc-sec-note">
		<strong>Why seven and not one menu.</strong> A single menu would need a label per item and a scan
		per use. Seven docks need neither: the eye goes to the corner, not to the text. The cost is that
		the vocabulary has to be closed and kept — adding an eighth dock is a design decision, not an
		increment.
	</p>
	<div class="ifc-grid ifc-grid-2">
		{#each docks as d}
			<div class="ifc-card">
				<div class="ifc-card-hdr">
					<span class="ifc-card-title"><i class="fat {d.icon}"></i> {d.name}</span>
					<span class="ifc-badge b-teal">{d.edge}</span>
				</div>
				<div class="ifc-card-sub">{d.body}</div>
			</div>
		{/each}
	</div>

	<!-- 02 stances ------------------------------------------------------ -->
	<div class="ifc-sec">
		<span class="ifc-sec-tag">02</span>
		<span class="ifc-sec-title">Six camera stances, one target</span>
		<span class="ifc-sec-hint">switching mode never loses your place</span>
	</div>
	<p class="ifc-sec-note">
		<strong>One focus point, six ways of standing at it.</strong> Every stance orbits the same target,
		so changing camera is a change of vantage rather than of subject — you are still looking at the block
		you were looking at. Three of the six pin their angles, because a drawing convention <em>is</em> a
		pinned pair of angles; the other three pin nothing and let you turn.
	</p>
	<table class="ifc-table">
		<thead>
			<tr><th>Stance</th><th>Camera</th><th>Pinned to</th><th>What it is for</th></tr>
		</thead>
		<tbody>
			{#each stances as s}
				<tr>
					<td><strong>{s.name}</strong></td>
					<td>{s.cam}</td>
					<td>{s.pin}</td>
					<td>{s.use}</td>
				</tr>
			{/each}
		</tbody>
	</table>
	<p class="ifc-sec-note" style="margin-top:var(--spacing-sm)">
		<strong>Home is a fraction of the world, not a number of metres.</strong> Distance is stored as a
		multiple of the scene's half-width — <code>1.9</code> for the perspective pair,
		<code>1.05</code> as the orthographic half-height — and the near plane is
		<code>extent × 0.0008</code>. Every clamp is relative for the same reason: "twelve metres" is a
		wall you hit halfway down a tower and a horizon you never reach on a one-metre plane. Shrink the
		world and the eye keeps its <em>relative</em> place; hard-code the numbers and the app opens
		inside a building.
	</p>

	<!-- 03 collapse ----------------------------------------------------- -->
	<div class="ifc-sec">
		<span class="ifc-sec-tag">03</span>
		<span class="ifc-sec-title">On a phone, docks collapse — they do not reflow</span>
		<span class="ifc-sec-hint">one menu, never two</span>
	</div>
	<p class="ifc-sec-note">
		<strong>The rule.</strong> A crowded dock collapses into its own single glyph that expands on tap.
		It does not get thinner, it does not change shape, and it does not wrap onto a second row. A
		control that changes size between breakpoints has to be re-learned at each one; a control that
		disappears behind a glyph is in the same place it always was.
	</p>
	<p class="ifc-sec-note" style="margin-top:var(--spacing-sm)">
		<strong>And exactly one collapse.</strong> Two collapsing menus on a small screen is a maze —
		the left dock collapses, settings stay pinned top-right, and the bottom strip consolidates into
		the top-left group rather than becoming a second thing to open. The overview inset then moves
		down into the space the strip left behind, because empty corners are the only real estate a
		phone has.
	</p>

	<!-- 04 help --------------------------------------------------------- -->
	<div class="ifc-sec">
		<span class="ifc-sec-tag">04</span>
		<span class="ifc-sec-title">Help is a numbered overlay, not a tour</span>
		<span class="ifc-sec-hint">compare with the guided tour on Wayfinding</span>
	</div>
	<p class="ifc-sec-note">
		<strong>Why the viewport differs from the rest of the library.</strong>
		<a href="/interface/wayfinding">Wayfinding</a> documents a tour that walks a page one stop at a
		time, which works because a page has a reading order. A viewport does not. So help here marks
		<em>every</em> control at once with a small numbered circle — orange, thin-ruled, ordered around
		the ring — over a wireframe of the actual layout. Seeing that there are sixteen controls and
		where they are is most of what the help was for.
	</p>
	<p class="ifc-sec-note" style="margin-top:var(--spacing-sm)">
		Two things it must get right, both learned the hard way: the circles sit
		<strong>above</strong> the inset and the badges, not clipped beneath them; and the numbers for
		controls that expand on tap sit <strong>outside</strong> the ring, where nothing lands on top of
		them.
	</p>

	<figure class="ifc-fig">
		<img src="/img/citygen/desktop-numbered.png" alt="The same viewport with the help overlay on: sixteen small orange numbered circles, one per control cluster." />
		<figcaption>
			<b>The same frame with help raised.</b> Sixteen circles, one per cluster rather than one per
			button — a cluster is the unit a person reaches for. Note where the last three sit: 14 on the
			meter, 15 on the plan inset, 16 on the layer rail. Those three are read-outs and toggles, not
			dials, and they are numbered anyway because <em>unnumbered means unexplained</em>.
		</figcaption>
	</figure>

	<table class="ifc-table">
		<thead>
			<tr><th>#</th><th>Control</th><th>Edge</th><th>What it decides</th></tr>
		</thead>
		<tbody>
			{#each help as h}
				<tr>
					<td class="ifc-num">{h.n}</td>
					<td><strong>{h.name}</strong></td>
					<td class="ifc-num">{h.at}</td>
					<td>{h.body}</td>
				</tr>
			{/each}
		</tbody>
	</table>
	<p class="ifc-sec-note" style="margin-top:var(--spacing-sm)">
		The table above is the overlay's own legend, read out of the implementation rather than
		rewritten for the documentation. Writing it twice is how the two drift apart — and the drift is
		not theoretical: the meter and the inset shipped numbered 13 and 14 against a legend that called
		them 14 and 15, which is exactly the class of error a shared source removes.
	</p>

	<!-- 05 menus --------------------------------------------------------- -->
	<div class="ifc-sec">
		<span class="ifc-sec-tag">05</span>
		<span class="ifc-sec-title">One popup, one size, tabs inside it</span>
		<span class="ifc-sec-hint">the drawer never resizes as you move between tabs</span>
	</div>
	<p class="ifc-sec-note">
		<strong>What this is.</strong> Every dial in the application lives in one of the panels below.
		They are all the same width and height, they all open in the same place, and the tabs inside them
		are glyph + space + word. A panel sized to its own tab makes the window jump every time you move
		across it, which reads as the application losing its place.
	</p>
	<p class="ifc-sec-note" style="margin-top:var(--spacing-sm)">
		<strong>How it is built.</strong> One dialog element, tabs switched by radio, and a routing table
		that maps a tool to its tab — so pressing any tool glyph in the ring opens the shared panel
		<em>already on</em> the right tab. Each panel carries a preview of what its dials do, because a
		number with no picture beside it is a number you have to guess at.
	</p>
	<div class="ifc-fig-grid">
		{#each menus as m}
			<figure class="ifc-fig">
				<img src="/img/citygen/{m.img}" alt={m.title} />
				<figcaption><b>{m.title}</b> <span class="ifc-num">from {m.from}</span> — {m.body}</figcaption>
			</figure>
		{/each}
	</div>

	<!-- 06 hud vs census ------------------------------------------------ -->
	<div class="ifc-sec">
		<span class="ifc-sec-tag">06</span>
		<span class="ifc-sec-title">Two kinds of number: the meter and the census</span>
		<span class="ifc-sec-hint">per-frame vs per-generation</span>
	</div>
	<p class="ifc-sec-note">
		<strong>The meter</strong> is what the frame costs — frame rate, triangles, draw calls, memory.
		It overlays the canvas, updates every frame, and is deliberately tight: name-value pairs with
		little gap, so it can be small enough to leave alone. It sits left of the right-hand controls,
		never behind them.
	</p>
	<p class="ifc-sec-note" style="margin-top:var(--spacing-sm)">
		<strong>The census</strong> is what the world contains — buildings by type, trees by species,
		surface water, land mass, road length. It belongs <em>below</em> the viewport in ordinary page
		flow, because it changes once per generation and is read deliberately rather than watched. Mixing
		the two produces an overlay nobody can read and a table nobody trusts.
	</p>

	<!-- 07 audits ------------------------------------------------------- -->
	<div class="ifc-sec">
		<span class="ifc-sec-tag">07</span>
		<span class="ifc-sec-title">The audits, run before anything is built</span>
		<span class="ifc-sec-hint">bun run audit — wired into build</span>
	</div>
	<p class="ifc-sec-note">
		<strong>Consistency that is only written down drifts.</strong> Every rule on these pages that can
		be checked mechanically is checked mechanically, and the build fails rather than the page looking
		wrong in production. <code>bun run build</code> runs the audits first.
	</p>
	<table class="ifc-table">
		<thead>
			<tr><th>Script</th><th>What it refuses</th><th>Runs on</th><th>Note</th></tr>
		</thead>
		<tbody>
			{#each audits as a}
				<tr>
					<td><code>{a.script}</code></td>
					<td>{a.refuses}</td>
					<td><code>{a.runs}</code></td>
					<td>{a.note}</td>
				</tr>
			{/each}
		</tbody>
	</table>
	<p class="ifc-sec-note" style="margin-top:var(--spacing-sm)">
		<strong>A local declaration is not a violation.</strong> Tokens are collected across the whole
		tree rather than per file, because every file styles the same document — a property declared in
		the stylesheet is genuinely in scope for the component that reads it, and a component that
		declares <code>--row-h</code> for its own children is not naming a theme colour. Per-file scoping
		flags both halves of one rule, and a lint nobody can satisfy is switched off within a week.
	</p>
</div>

<style>
	.ifc-fig {
		margin: var(--spacing-md) 0 0;
	}

	.ifc-fig img {
		display: block;
		width: 100%;
		height: auto;
		border: 1px solid var(--rule);
		background: var(--paper-card);
	}

	.ifc-fig figcaption {
		margin-top: var(--spacing-xs);
		font-size: 11.5px;
		line-height: 1.55;
		color: var(--ink-note);
	}

	.ifc-fig figcaption b {
		color: var(--ink);
		font-weight: 600;
	}

	.ifc-fig-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--spacing-md);
		margin-top: var(--spacing-md);
	}

	.ifc-fig-grid .ifc-fig {
		margin: 0;
	}

	.ifc-num {
		font-family: var(--font-mono);
		font-size: 10.5px;
		color: var(--ink-muted);
		white-space: nowrap;
	}

	@media (max-width: 720px) {
		.ifc-fig-grid {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
