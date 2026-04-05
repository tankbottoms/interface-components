<script lang="ts">
	import '$lib/styles/theme.css';
	import '$lib/styles/global.css';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import SideNav from '$lib/components/SideNav.svelte';
	import { componentDefs } from '$lib/data/components';
	import { searchQuery } from '$lib/stores/search';

	let { children } = $props();
</script>

<div class="app-shell">
	<header class="site-header">
		<a href="/" class="site-title">
			<i class="fas fa-cubes"></i>
			<span>Interface Components</span>
		</a>
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
