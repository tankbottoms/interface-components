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

	let { children } = $props();
	let pickerOpen = $state(false);
	let justOpened = $state(false);
	/**
	 * Below 768px the sidebar is hidden entirely, which left the Interface
	 * routes unreachable — there is no link to them anywhere else. This drawer
	 * is the mobile route to the same nav.
	 */
	let navOpen = $state(false);

	function selectColor(color: string) {
		$accentColor = color;
		pickerOpen = false;
	}

	function togglePicker(e: Event) {
		e.preventDefault();
		e.stopPropagation();
		if (pickerOpen) {
			pickerOpen = false;
		} else {
			pickerOpen = true;
			justOpened = true;
			setTimeout(() => (justOpened = false), 300);
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
				class="nav-trigger"
				onclick={() => (navOpen = true)}
				aria-label="Open navigation"
				aria-expanded={navOpen}
			>
				<i class="fas fa-bars"></i>
			</button>
			<button class="icon-picker-trigger" onpointerup={togglePicker} title="Change highlight color">
				<i class="fas fa-cubes"></i>
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
					<i class="fas fa-xmark"></i>
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
			</footer>
		</main>
	</div>
</div>

<style>
	.site-title-group {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		position: relative;
	}
	/*
	 * Hidden on desktop, where the persistent sidebar is already visible. It only
	 * appears at the breakpoint that hides that sidebar.
	 */
	.nav-trigger {
		display: none;
		background: none;
		border: none;
		cursor: pointer;
		font-size: 1.05rem;
		color: var(--color-text);
		padding: 8px;
		align-items: center;
		touch-action: manipulation;
		-webkit-tap-highlight-color: transparent;
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

	@media (max-width: 768px) {
		.nav-trigger {
			display: flex;
		}
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
		touch-action: manipulation;
		-webkit-tap-highlight-color: transparent;
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
