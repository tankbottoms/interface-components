<script lang="ts">
	/**
	 * "What is actually wired up?" — the section that answers, for the mock panel
	 * in the hero, which controls are decorative and which reach out to the
	 * device.
	 *
	 * Three panels, three hooks:
	 *  - Display  → two ranges driving a live CSS `filter` on a preview plate
	 *  - Haptics  → toggle + buttons that fire the platform vibration path
	 *  - Glyph    → a button push that advances a Font Awesome glyph
	 *
	 * All three read their values through the one event the panel system emits:
	 * `magx-panelValueChanged`, dispatched on `document` with the element id in
	 * `detail.panelElementId`. That single listener is the whole integration
	 * surface — there is no per-element subscription API to learn.
	 */
	const GLYPHS = [
		'fa-gauge-high',
		'fa-microchip',
		'fa-server',
		'fa-database',
		'fa-wave-square',
		'fa-bolt',
		'fa-satellite-dish',
		'fa-fingerprint'
	];

	let brightness = $state(100);
	let contrast = $state(100);
	let glyphIndex = $state(0);
	let hapticsOn = $state(true);
	let lastHaptic = $state('none yet');
	let canVibrate = $state(false);

	const glyph = $derived(GLYPHS[glyphIndex % GLYPHS.length]);

	function valueOf(id: string): any {
		return (document.getElementById(id) as any)?.getValue?.();
	}

	/**
	 * Best-effort vibration. Android and desktop Chrome honour
	 * `navigator.vibrate`; iOS Safari ignores it entirely, which is why the panel
	 * elements themselves fall back to the hidden `<input type="checkbox"
	 * switch>` trick to borrow the Taptic Engine.
	 */
	function buzz(pattern: number | number[], label: string) {
		if (!hapticsOn) {
			lastHaptic = `${label} (suppressed — haptics off)`;
			return;
		}
		const ok = typeof navigator !== 'undefined' && navigator.vibrate?.(pattern);
		lastHaptic = ok ? `${label} · navigator.vibrate` : `${label} · switch fallback`;
	}

	/**
	 * The one listener that makes all three panels work.
	 *
	 * This used to live in `onMount`, and the whole body was being dropped from
	 * the production client bundle — which is why the brightness and contrast
	 * sliders moved without touching the picture and the glyph button never
	 * advanced, in the build but never in dev. An effect survives the build.
	 */
	$effect(() => {
		canVibrate = typeof navigator !== 'undefined' && 'vibrate' in navigator;

		const onChange = (e: Event) => {
			const id = (e as CustomEvent).detail?.panelElementId;
			if (id === 'hook-brightness') brightness = Number(valueOf(id) ?? 100);
			else if (id === 'hook-contrast') contrast = Number(valueOf(id) ?? 100);
			else if (id === 'hook-haptics') hapticsOn = Boolean(valueOf(id));
			else if (id === 'hook-glyph') {
				// The button reports both its primary and secondary press through
				// the same id; `Reset` returns to the first glyph, anything else
				// steps forward one.
				const v = valueOf(id);
				const secondary = v === 'secondary' || v?.secondary === true || v?.action === 'secondary';
				glyphIndex = secondary ? 0 : glyphIndex + 1;
				buzz(12, `glyph → ${GLYPHS[glyphIndex % GLYPHS.length]}`);
			} else if (id === 'hook-buzz') buzz([18, 40, 18], 'double tap');
		};

		document.addEventListener('magx-panelValueChanged', onChange);
		return () => document.removeEventListener('magx-panelValueChanged', onChange);
	});
</script>

<section id="panel-hooks" class="hooks">
	<h2 class="hooks-title"><i class="fas fa-plug-circle-bolt"></i> What the Mock Panel Hooks Into</h2>

	<p class="hooks-intro">
		The panel in the hero is a real control surface, not a mock-up, but it is worth being explicit
		about which of its elements actually reach the device and which are just state. Three do
		something outside the page: the <strong>ranges</strong> drive a live CSS filter,
		the <strong>toggle and buttons</strong> reach the platform haptics path, and a
		<strong>button push</strong> advances a Font Awesome glyph. Everything is read through one
		document-level event — <code>magx-panelValueChanged</code>, carrying
		<code>detail.panelElementId</code> — so wiring a panel into an application means adding a single
		listener, not subscribing element by element.
	</p>

	<div class="hooks-grid">
		<div class="hook">
			<div class="stage">
				<magx-panel title="Display" x="0" y="0" style="--magx-panel-panel-width:250px">
					<magx-panel-range id="hook-brightness" title="Brightness" min="20" max="180" value="100"
					></magx-panel-range>
					<magx-panel-range id="hook-contrast" title="Contrast" min="20" max="180" value="100"
					></magx-panel-range>
					<!--
						The filter is set on the custom-element host, not on the <img>.
						The image lives in the element's shadow root, so a host filter is
						the only way to reach it from the page — and it is the correct
						way: filters inherit into shadow trees.
					-->
					<magx-panel-image
						id="hook-image"
						title="Preview"
						src="/screenshots/trainer-hero.jpg"
						style="filter: grayscale(1) brightness({brightness}%) contrast({contrast}%)"
					></magx-panel-image>
				</magx-panel>
			</div>
			<figure class="preview">
				<img
					src="/screenshots/trainer-hero.jpg"
					alt="Preview plate reacting to the brightness and contrast sliders"
					style="filter: grayscale(1) brightness({brightness}%) contrast({contrast}%)"
					loading="lazy"
				/>
				<figcaption>
					<code>filter: brightness({brightness}%) contrast({contrast}%)</code>
				</figcaption>
			</figure>
			<p class="hook-note">
				Two <code>magx-panel-range</code> elements. The handler reads
				<code>getValue()</code> off the element named in the event and writes it straight into an
				inline <code>filter</code> — applied twice here, once to the
				<code>magx-panel-image</code> inside the panel and once to the plate below it, so you can
				see the same value driving a picture the panel owns and a picture it does not. No per-frame
				work — the browser composites it.
			</p>
		</div>

		<div class="hook">
			<div class="stage">
				<magx-panel title="Haptics" x="0" y="0" style="--magx-panel-panel-width:250px">
					<magx-panel-toggle
						id="hook-haptics"
						title="Feedback"
						labelOn="ON"
						labelOff="OFF"
						checked
					></magx-panel-toggle>
					<magx-panel-button id="hook-buzz" title="Test Buzz" readout secondary="Long"
					></magx-panel-button>
				</magx-panel>
			</div>
			<div class="readout">
				<div class="readout-row">
					<span class="k">navigator.vibrate</span>
					<span class="v">{canVibrate ? 'available' : 'not exposed'}</span>
				</div>
				<div class="readout-row">
					<span class="k">last event</span>
					<span class="v">{lastHaptic}</span>
				</div>
			</div>
			<p class="hook-note">
				Every panel control fires haptics on press. Android and desktop Chrome go through
				<code>navigator.vibrate</code>. iOS Safari ignores that API entirely, so the elements keep a
				hidden <code>&lt;input type="checkbox" switch&gt;</code> in the shadow root and toggle it on
				the next frame — the only way to reach the Taptic Engine from a web page. The toggle above
				gates both paths.
			</p>
		</div>

		<div class="hook">
			<div class="stage">
				<magx-panel title="Glyph" x="0" y="0" style="--magx-panel-panel-width:250px">
					<magx-panel-button id="hook-glyph" title="Next Glyph" readout secondary="Reset"
					></magx-panel-button>
					<magx-panel-progressbar
						title="Set"
						currentValue={(glyphIndex % GLYPHS.length) + 1}
						maxValue={GLYPHS.length}
					></magx-panel-progressbar>
				</magx-panel>
			</div>
			<div class="glyph-plate">
				<i class="fat {glyph}" aria-hidden="true"></i>
				<code>{glyph}</code>
				<span class="glyph-count">
					{(glyphIndex % GLYPHS.length) + 1} of {GLYPHS.length}
				</span>
			</div>
			<ol class="glyph-strip">
				{#each GLYPHS as g, i}
					<li class:on={i === glyphIndex % GLYPHS.length}>
						<i class="fat {g}" aria-hidden="true"></i>
					</li>
				{/each}
			</ol>
			<p class="hook-note">
				<strong>Next Glyph</strong> steps forward through the set and wraps at the end;
				<strong>Reset</strong> (the secondary press) returns to the first. The strip above shows the
				whole enumeration with the current entry filled, so the button's effect is visible without
				cycling through to find out. Icons are the bundled Font Awesome Pro 6.5.1 Thin family
				(<code>fat</code> prefix) — local, never a CDN, and never emoji. The progress bar under the
				button is driven from the same index, which is the cheapest way to show a panel element
				reflecting state owned by the host application rather than by itself.
			</p>
		</div>
	</div>
</section>

<style>
	.hooks {
		margin: var(--spacing-xl) 0;
		padding-top: var(--spacing-xl);
		border-top: 2px solid var(--color-border);
	}
	.hooks-title {
		font-size: 1.1rem;
		font-weight: 700;
		letter-spacing: 0.03em;
		margin-bottom: var(--spacing-sm);
	}
	.hooks-title i {
		color: var(--color-accent);
	}
	/* Full width, per the panel intro copy — not confined to the first column. */
	.hooks-intro {
		font-size: 0.85rem;
		line-height: 1.65;
		color: var(--color-text-muted);
		margin-bottom: var(--spacing-lg);
	}
	.hooks-intro code,
	.hook-note code,
	.preview code {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		padding: 1px 4px;
		background: var(--color-bg-alt);
	}
	.hooks-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(270px, 1fr));
		gap: var(--spacing-lg);
		align-items: start;
	}
	.hook {
		min-width: 0;
	}
	.stage {
		position: relative;
		width: 250px;
		min-height: 170px;
		margin-bottom: var(--spacing-sm);
	}
	.preview {
		border: 1px solid var(--color-border);
		background: var(--color-bg-alt);
		padding: 6px;
	}
	.preview img {
		display: block;
		width: 100%;
		height: auto;
	}
	.preview figcaption {
		margin-top: 4px;
		font-size: 0.6rem;
		color: var(--color-text-muted);
		word-break: break-all;
	}
	.readout {
		border: 1px solid var(--color-border);
		background: var(--color-bg-alt);
		padding: var(--spacing-sm);
		font-family: var(--font-mono);
		font-size: 0.68rem;
	}
	.readout-row {
		display: flex;
		justify-content: space-between;
		gap: var(--spacing-sm);
		padding: 3px 0;
	}
	.readout-row .k {
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
	.readout-row .v {
		color: var(--color-text);
		font-weight: 700;
		text-align: right;
	}
	.glyph-plate {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 8px;
		border: 1px solid var(--color-border);
		background: var(--color-bg-alt);
		padding: var(--spacing-md);
		min-height: 120px;
	}
	.glyph-plate i {
		font-size: 3rem;
		color: var(--color-accent);
		line-height: 1;
	}
	.glyph-count {
		font-family: var(--font-mono);
		font-size: 0.6rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-text-muted);
	}
	/* The whole enumeration, current entry filled. */
	.glyph-strip {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
		list-style: none;
		margin: 6px 0 0;
		padding: 0;
	}
	.glyph-strip li {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 26px;
		height: 26px;
		border: 1px solid var(--color-border);
		background: var(--color-bg-alt);
		color: var(--color-text-muted);
		font-size: 0.8rem;
	}
	.glyph-strip li.on {
		background: var(--color-accent);
		border-color: var(--color-accent);
		color: #fff;
	}
	.hook-note {
		font-size: 0.78rem;
		line-height: 1.6;
		color: var(--color-text-muted);
		margin-top: var(--spacing-sm);
	}

	@media (max-width: 768px) {
		.stage {
			width: 100%;
		}
	}
</style>
