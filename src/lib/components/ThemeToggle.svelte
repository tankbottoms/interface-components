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
		<i class="fas fa-sun"></i>
	{:else}
		<i class="fas fa-moon"></i>
	{/if}
</button>

<style>
	.theme-toggle {
		background: var(--color-bg-alt);
		border: 1px solid var(--color-border);
		color: var(--color-text);
		padding: 0.4rem 0.6rem;
		cursor: pointer;
		font-size: 0.9rem;
		box-shadow: 2px 2px 0 var(--color-shadow);
		font-family: var(--font-mono);
	}
	.theme-toggle:hover {
		background: var(--color-hover-bg);
	}
</style>
