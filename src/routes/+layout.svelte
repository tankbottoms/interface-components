<script lang="ts">
	import '$lib/styles/theme.css';
	import '$lib/styles/global.css';
	import '$lib/styles/interface.css';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import SideNav from '$lib/components/SideNav.svelte';
	import { componentDefs } from '$lib/data/components';
	import { searchQuery } from '$lib/stores/search';
	import { accentColor, pastelSwatches } from '$lib/stores/highlight';
	import { browser } from '$app/environment';
	import { MagxHaptics } from 'magx-panel/Haptics';

	let { children } = $props();
	let pickerOpen = $state(false);
	let justOpened = $state(false);
	/**
	 * Below 768px the sidebar is hidden entirely, which left the Interface
	 * routes unreachable — there is no link to them anywhere else. This drawer
	 * is the mobile route to the same nav.
	 */
	let navOpen = $state(false);

	/**
	 * One glyph, two gestures.
	 *
	 * A tap opens whichever thing is missing: the navigation when the sidebar is
	 * hidden, the highlight picker when it is already on screen. A press and hold
	 * always opens the picker, so the colours stay reachable on a phone where the
	 * tap is spoken for. A separate hamburger was the obvious alternative and it
	 * was what shipped first, but it put two controls in a header that is already
	 * tight at 360px and neither of them read as the site's own mark.
	 */
	const HOLD_MS = 450;
	/** Movement past this many px is a scroll, not a press. */
	const HOLD_SLOP = 10;

	let narrow = $state(false);
	let holdTimer = 0;
	let holdFired = false;
	let holdFrom: { x: number; y: number } | null = null;

	$effect(() => {
		if (!browser) return;
		const mq = window.matchMedia('(max-width: 768px)');
		const sync = () => (narrow = mq.matches);
		sync();
		mq.addEventListener('change', sync);
		return () => mq.removeEventListener('change', sync);
	});

	function openPicker() {
		pickerOpen = true;
		justOpened = true;
		setTimeout(() => (justOpened = false), 300);
	}

	function selectColor(color: string) {
		$accentColor = color;
		pickerOpen = false;
	}

	function glyphDown(e: PointerEvent) {
		holdFired = false;
		holdFrom = { x: e.clientX, y: e.clientY };
		clearTimeout(holdTimer);
		holdTimer = window.setTimeout(() => {
			holdFired = true;
			navOpen = false;
			openPicker();
			/* The hold has no visual until the popup lands, so confirm it by feel. */
			MagxHaptics.trigger('medium');
		}, HOLD_MS);
	}

	function glyphMove(e: PointerEvent) {
		if (!holdFrom) return;
		const dx = e.clientX - holdFrom.x;
		const dy = e.clientY - holdFrom.y;
		if (Math.hypot(dx, dy) > HOLD_SLOP) cancelHold();
	}

	function cancelHold() {
		clearTimeout(holdTimer);
		holdFrom = null;
	}

	function glyphUp(e: PointerEvent) {
		clearTimeout(holdTimer);
		holdFrom = null;
		e.preventDefault();
		e.stopPropagation();
		if (holdFired) return; // the hold already opened the picker
		if (pickerOpen) {
			pickerOpen = false;
		} else if (narrow) {
			navOpen = true;
		} else {
			openPicker();
		}
	}

	$effect(() => {
		if (!browser || !pickerOpen) return;
		const handler = (e: Event) => {
			if (justOpened) return;
			const popup = document.querySelector('.color-picker-popup');
			if (popup && popup.contains(e.target as Node)) return;
			pickerOpen = false;
		};
		document.addEventListener('pointerdown', handler);
		return () => document.removeEventListener('pointerdown', handler);
	});

	/* Escape closes the drawer, and the page behind it must not scroll while open. */
	$effect(() => {
		if (!browser || !navOpen) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') navOpen = false;
		};
		document.addEventListener('keydown', onKey);
		const prev = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			document.removeEventListener('keydown', onKey);
			document.body.style.overflow = prev;
		};
	});
</script>

<div class="app-shell">
	<header class="site-header">
		<div class="site-title-group">
			<button
				class="icon-picker-trigger"
				onpointerdown={glyphDown}
				onpointermove={glyphMove}
				onpointerup={glyphUp}
				onpointercancel={cancelHold}
				onpointerleave={cancelHold}
				oncontextmenu={(e) => e.preventDefault()}
				aria-label={narrow ? 'Open navigation — hold for highlight colour' : 'Highlight colour'}
				aria-expanded={navOpen || pickerOpen}
				title={narrow ? 'Tap for navigation · hold for colour' : 'Highlight colour · hold to pin open'}
			>
				<i class="fat fa-cubes"></i>
			</button>
			<a href="/" class="site-title">
				<span>Interface Components</span>
			</a>
			{#if pickerOpen}
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<div class="color-picker-popup" onpointerdown={(e) => e.stopPropagation()}>
					<div class="picker-label">Highlight Color</div>
					<div class="picker-swatches">
						{#each pastelSwatches as swatch (swatch.color)}
							<button
								class="picker-swatch"
								class:active={$accentColor === swatch.color}
								style="background: {swatch.color};"
								title={swatch.name}
								onpointerup={() => selectColor(swatch.color)}
							></button>
						{/each}
					</div>
				</div>
			{/if}
		</div>
		<div class="header-controls">
			<SearchBar value={$searchQuery} oninput={(v) => ($searchQuery = v)} />
			<ThemeToggle />
		</div>
	</header>

	{#if navOpen}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="nav-scrim" onclick={() => (navOpen = false)}></div>
		<div class="nav-drawer" role="dialog" aria-modal="true" aria-label="Navigation">
			<div class="nav-drawer-head">
				<span>Navigation</span>
				<button onclick={() => (navOpen = false)} aria-label="Close navigation">
					<i class="fat fa-xmark"></i>
				</button>
			</div>
			<div class="nav-drawer-body">
				<SideNav components={componentDefs} onnavigate={() => (navOpen = false)} />
			</div>
		</div>
	{/if}

	<div class="content-wrapper">
		<aside class="sidebar">
			<SideNav components={componentDefs} />
		</aside>
		<main class="main-content" id="main-content">
			{@render children()}
			<footer class="site-footer">
				<span>Built on <a href="https://github.com/mlalma/magx/tree/main" target="_blank" rel="noopener">magx</a> by <a href="https://github.com/mlalma" target="_blank" rel="noopener">mlalma</a></span>
				<span class="sep">|</span>
				<span>Lit + SvelteKit</span>
				<span class="sep">|</span>
				<!--
					The build stamp lives in the footer of every page, not just the
					home hero, because the question it answers is "is this page the
					one I just deployed, or the one my browser kept?" — and that
					question gets asked from whichever page happens to be open.
				-->
				<span class="build-stamp" title="Build {__BUILD_VERSION__}">v{__BUILD_VERSION__}</span>
			</footer>
		</main>
	</div>
</div>

<style>
	.build-stamp {
		font-family: var(--font-mono);
		letter-spacing: 0.02em;
		/* No ellipsis, no max-width: a half-shown hash is worse than none. */
		white-space: nowrap;
	}
	.site-title-group {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		position: relative;
	}
	.nav-scrim {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.45);
		z-index: 400;
	}
	.nav-drawer {
		position: fixed;
		top: 0;
		left: 0;
		bottom: 0;
		width: min(300px, 86vw);
		background: var(--color-bg);
		border-right: 2px solid var(--color-border-dark);
		z-index: 401;
		display: flex;
		flex-direction: column;
	}
	.nav-drawer-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--spacing-sm) var(--spacing-md);
		border-bottom: 1px solid var(--color-border);
		font-family: var(--font-mono);
		font-size: 0.7rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--color-text-muted);
	}
	.nav-drawer-head button {
		background: none;
		border: none;
		cursor: pointer;
		color: var(--color-text);
		font-size: 1rem;
		padding: 4px 8px;
	}
	.nav-drawer-body {
		flex: 1;
		overflow-y: auto;
		padding: var(--spacing-md) 0;
		-webkit-overflow-scrolling: touch;
	}

	.icon-picker-trigger {
		background: none;
		border: none;
		cursor: pointer;
		font-size: 1.1rem;
		color: var(--color-accent);
		padding: 8px;
		display: flex;
		align-items: center;
		/*
		 * A press and hold on a phone otherwise selects the glyph or raises the
		 * system callout, both of which eat the gesture before it completes.
		 */
		touch-action: manipulation;
		-webkit-tap-highlight-color: transparent;
		-webkit-touch-callout: none;
		user-select: none;
	}
	.icon-picker-trigger:hover {
		opacity: 0.8;
	}
	.color-picker-popup {
		position: absolute;
		top: 100%;
		left: 0;
		margin-top: 8px;
		background: var(--color-bg-secondary);
		border: 2px solid var(--color-border-dark);
		padding: var(--spacing-sm) var(--spacing-md);
		z-index: 300;
		min-width: 200px;
	}
	.picker-label {
		font-size: 0.65rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-text-muted);
		margin-bottom: var(--spacing-xs);
	}
	.picker-swatches {
		display: grid;
		grid-template-columns: repeat(6, 1fr);
		gap: 6px;
	}
	.picker-swatch {
		width: 36px;
		height: 36px;
		border: 2px solid transparent;
		cursor: pointer;
		transition: border-color 0.15s;
		touch-action: manipulation;
		-webkit-tap-highlight-color: transparent;
	}
	.picker-swatch:hover {
		border-color: var(--color-text);
	}
	.picker-swatch.active {
		border-color: var(--color-text);
		box-shadow: 0 0 0 1px var(--color-bg), 0 0 0 3px var(--color-text);
	}
</style>
