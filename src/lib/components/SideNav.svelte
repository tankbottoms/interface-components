<script lang="ts">
	import { browser } from '$app/environment';
	import type { ComponentDef } from '$lib/data/components';

	interface Props {
		components: ComponentDef[];
	}

	let { components }: Props = $props();
	let activeId = $state('');

	const panelComponents = $derived(components.filter((c) => c.group === 'panel'));
	const sparklineComponents = $derived(components.filter((c) => c.group === 'sparkline'));

	$effect(() => {
		if (!browser) return;

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						activeId = entry.target.id;
					}
				}
			},
			{ rootMargin: '-20% 0px -60% 0px', root: document.querySelector('.main-content') }
		);

		for (const comp of components) {
			const el = document.getElementById(comp.id);
			if (el) observer.observe(el);
		}

		return () => observer.disconnect();
	});

	function scrollTo(id: string) {
		const el = document.getElementById(id);
		el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}
</script>

<nav class="sidenav" aria-label="Components">
	<div class="nav-group">
		<div class="nav-group-title"><i class="fas fa-layer-group"></i> Panel System</div>
		{#each panelComponents as comp}
			<button
				class="nav-item"
				class:active={activeId === comp.id}
				onclick={() => scrollTo(comp.id)}
				aria-current={activeId === comp.id ? 'true' : undefined}
			>
				<i class="fas {comp.icon}"></i>
				{comp.name}
			</button>
		{/each}
	</div>

	<div class="nav-group">
		<div class="nav-group-title"><i class="fas fa-chart-line"></i> Sparkline</div>
		{#each sparklineComponents as comp}
			<button
				class="nav-item"
				class:active={activeId === comp.id}
				onclick={() => scrollTo(comp.id)}
				aria-current={activeId === comp.id ? 'true' : undefined}
			>
				<i class="fas {comp.icon}"></i>
				{comp.name}
			</button>
		{/each}
	</div>
</nav>

<style>
	.sidenav {
		padding: 0 var(--spacing-sm);
	}
	.nav-group {
		margin-bottom: var(--spacing-lg);
	}
	.nav-group-title {
		font-size: 0.7rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-text-muted);
		padding: var(--spacing-xs) var(--spacing-sm);
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
	}
	.nav-group-title i {
		font-size: 0.65rem;
	}
	.nav-item {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
		width: 100%;
		padding: var(--spacing-xs) var(--spacing-sm);
		padding-left: var(--spacing-lg);
		background: none;
		border: none;
		border-left: 2px solid transparent;
		color: var(--color-text);
		font-family: var(--font-mono);
		font-size: 0.8rem;
		cursor: pointer;
		text-align: left;
	}
	.nav-item:hover {
		background: var(--color-hover-bg);
	}
	.nav-item.active {
		border-left-color: var(--color-accent);
		color: var(--color-accent);
		background: var(--color-hover-bg);
		font-weight: 600;
	}
	.nav-item i {
		font-size: 0.7rem;
		width: 16px;
		text-align: center;
	}
</style>
