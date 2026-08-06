<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import type { ComponentDef } from '$lib/data/components';

	interface Props {
		components: ComponentDef[];
	}

	let { components }: Props = $props();
	let activeId = $state('');

	const panelComponents = $derived(components.filter((c) => c.group === 'panel'));
	const sparklineComponents = $derived(components.filter((c) => c.group === 'sparkline'));

	/**
	 * Interface is a separate section from Components: it lives on its own
	 * routes rather than as anchors on the landing page, so scroll-spy does not
	 * apply to it — the current pathname decides which entry is active.
	 */
	const interfaceLinks = [
		{ href: '/interface/charting', name: 'Charting', icon: 'fa-chart-column' },
		{ href: '/interface/layout', name: 'Layout & Data', icon: 'fa-table-cells-large' },
		{ href: '/interface/documents', name: 'Documents', icon: 'fa-file-lines' },
		{ href: '/interface/palette', name: 'Palette', icon: 'fa-palette' }
	];

	const onHome = $derived($page.url.pathname === '/');
	const path = $derived($page.url.pathname);

	$effect(() => {
		if (!browser || !onHome) return;

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

	/** On the landing page anchors scroll; elsewhere they navigate back to it. */
	function jump(id: string) {
		if (!onHome) {
			window.location.href = `/#${id}`;
			return;
		}
		document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}
</script>

<nav class="sidenav" aria-label="Sections">
	<div class="nav-section">Components</div>

	<div class="nav-group">
		<div class="nav-group-title"><i class="fas fa-layer-group"></i> Panel System</div>
		{#each panelComponents as comp}
			<button
				class="nav-item"
				class:active={onHome && activeId === comp.id}
				onclick={() => jump(comp.id)}
				aria-current={onHome && activeId === comp.id ? 'true' : undefined}
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
				class:active={onHome && activeId === comp.id}
				onclick={() => jump(comp.id)}
				aria-current={onHome && activeId === comp.id ? 'true' : undefined}
			>
				<i class="fas {comp.icon}"></i>
				{comp.name}
			</button>
		{/each}
	</div>

	<div class="nav-section">Interface</div>

	<div class="nav-group">
		<div class="nav-group-title"><i class="fas fa-shapes"></i> Patterns</div>
		{#each interfaceLinks as link}
			<a
				class="nav-item"
				class:active={path.startsWith(link.href)}
				href={link.href}
				aria-current={path.startsWith(link.href) ? 'page' : undefined}
			>
				<i class="fas {link.icon}"></i>
				{link.name}
			</a>
		{/each}
	</div>
</nav>

<style>
	.sidenav {
		padding: 0 var(--spacing-sm);
	}
	.nav-section {
		font-size: 0.62rem;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.16em;
		color: var(--color-accent);
		padding: var(--spacing-xs) var(--spacing-sm);
		border-bottom: 1px solid var(--color-border-light);
		margin-bottom: var(--spacing-sm);
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
		text-decoration: none;
	}
	.nav-item:hover {
		background: var(--color-hover-bg);
		text-decoration: none;
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
