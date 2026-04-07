<script lang="ts">
	import '$lib/styles/theme.css';
	import '$lib/styles/global.css';
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
</script>

<div class="app-shell">
	<header class="site-header">
		<div class="site-title-group">
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
