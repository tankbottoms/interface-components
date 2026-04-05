<script lang="ts">
	import Badge from './Badge.svelte';
	import PropsTable from './PropsTable.svelte';
	import CodeBlock from './CodeBlock.svelte';
	import type { ComponentDef } from '$lib/data/components';
	import type { Snippet } from 'svelte';

	interface Props {
		component: ComponentDef;
		children?: Snippet;
	}

	let { component, children }: Props = $props();
</script>

<section id={component.id} class="component-card">
	<div class="card-header">
		<div class="card-title">
			<i class="fas {component.icon}"></i>
			<h3>{component.name}</h3>
			<code class="tag-name">&lt;{component.tagName}&gt;</code>
		</div>
		<Badge category={component.category} />
	</div>

	<p class="card-description">{component.description}</p>

	<PropsTable properties={component.properties} />

	{#if children}
		{@render children()}
	{/if}

	<CodeBlock code={component.codeExample} language="html" />

	{#if component.programmaticExample}
		<CodeBlock code={component.programmaticExample} language="typescript" />
	{/if}
</section>

<style>
	.component-card {
		border: 1px solid var(--color-border);
		background: var(--color-bg-secondary);
		padding: var(--spacing-lg);
		margin-bottom: var(--spacing-xl);
		box-shadow: 2px 2px 0 var(--color-shadow);
		scroll-margin-top: calc(var(--header-height) + var(--spacing-md));
	}
	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: var(--spacing-md);
		flex-wrap: wrap;
		gap: var(--spacing-sm);
	}
	.card-title {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
	}
	.card-title i {
		font-size: 1.1rem;
		color: var(--color-accent);
	}
	.card-title h3 {
		font-size: 1rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		margin: 0;
	}
	.tag-name {
		font-size: 0.75rem;
		color: var(--color-text-muted);
	}
	.card-description {
		font-size: 0.85rem;
		line-height: 1.6;
		color: var(--color-text);
		margin-bottom: var(--spacing-md);
	}
</style>
