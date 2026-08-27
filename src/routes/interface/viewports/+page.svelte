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
		the ring — over a wireframe of the actual layout. Seeing that there are fourteen controls and
		where they are is most of what the help was for.
	</p>
	<p class="ifc-sec-note" style="margin-top:var(--spacing-sm)">
		Two things it must get right, both learned the hard way: the circles sit
		<strong>above</strong> the inset and the badges, not clipped beneath them; and the numbers for
		controls that expand on tap sit <strong>outside</strong> the ring, where nothing lands on top of
		them.
	</p>

	<!-- 05 hud vs census ------------------------------------------------ -->
	<div class="ifc-sec">
		<span class="ifc-sec-tag">05</span>
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

	<!-- 06 audits ------------------------------------------------------- -->
	<div class="ifc-sec">
		<span class="ifc-sec-tag">06</span>
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
