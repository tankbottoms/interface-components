<script lang="ts">
	import { browser } from '$app/environment';

	let dark = $state(false);

	function init() {
		if (!browser) return;
		const stored = localStorage.getItem('theme');
		if (stored) {
			dark = stored === 'dark';
		} else {
			dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		}
		apply();
	}

	function toggle() {
		dark = !dark;
		apply();
	}

	function apply() {
		if (!browser) return;
		document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
		localStorage.setItem('theme', dark ? 'dark' : 'light');
	}

	$effect(() => {
		init();
	});
</script>

<button class="theme-toggle" onclick={toggle} aria-label="Toggle theme">
	{#if dark}
		<i class="fat fa-sun"></i>
	{:else}
		<i class="fat fa-moon"></i>
	{/if}
</button>

<style>
	/*
	 * A bare glyph, not a badge. It used to carry the same filled box, hairline
	 * border and 2px offset shadow every button on the site wears, which read as
	 * a control you submit rather than a switch you flip — and it was the only
	 * bordered thing sitting beside the borderless cubes mark. gpumon floats its
	 * hamburger and gear the same way: lines only, colour on hover.
	 */
	.theme-toggle {
		background: none;
		border: 0;
		color: var(--color-text-muted);
		padding: 4px 6px;
		cursor: pointer;
		font-size: 1rem;
		line-height: 1;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-family: var(--font-mono);
		transition: color 0.12s ease;
		-webkit-tap-highlight-color: transparent;
	}
	.theme-toggle:hover {
		color: var(--color-accent);
	}
</style>
