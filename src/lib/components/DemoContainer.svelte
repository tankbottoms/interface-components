<script lang="ts">
	import type { Snippet } from 'svelte';
	import { demoTheme } from '$lib/stores/demoTheme';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	const isDark = $derived($demoTheme === 'dark');

	function toggle() {
		demoTheme.update((t) => (t === 'dark' ? 'light' : 'dark'));
	}
</script>

<div class="demo-container">
	<div class="demo-label">
		<i class="fas fa-play"></i> LIVE DEMO
		<button class="demo-theme-toggle" onclick={toggle} aria-label="Toggle demo theme">
			{#if isDark}
				<i class="fas fa-sun"></i> Light
			{:else}
				<i class="fas fa-moon"></i> Dark
			{/if}
		</button>
	</div>
	<div class="demo-area">
		{@render children()}
	</div>
</div>

<style>
	.demo-container {
		margin-top: var(--spacing-md);
	}
	.demo-label {
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-text-muted);
		margin-bottom: var(--spacing-sm);
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
	}
	.demo-label i {
		font-size: 0.7rem;
	}
	.demo-theme-toggle {
		margin-left: auto;
		background: var(--color-bg-alt);
		border: 1px solid var(--color-border);
		color: var(--color-text-muted);
		padding: 0.2rem 0.5rem;
		cursor: pointer;
		font-size: 0.7rem;
		font-weight: 600;
		font-family: var(--font-mono);
		text-transform: uppercase;
		letter-spacing: 0.04em;
		display: flex;
		align-items: center;
		gap: 0.3rem;
	}
	.demo-theme-toggle:hover {
		color: var(--color-text);
		background: var(--color-hover-bg);
	}
	.demo-area {
		position: relative;
		min-height: 200px;
		border: 1px solid var(--color-border);
		background: var(--color-bg-alt);
		padding: var(--spacing-md);
		overflow: hidden;
	}
</style>
