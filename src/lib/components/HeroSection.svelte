<script lang="ts">
	import type { ComponentDef } from '$lib/data/components';

	declare const __BUILD_VERSION__: string;

	interface Props {
		components: ComponentDef[];
	}

	let { components }: Props = $props();
</script>

<section class="hero">
	<h1 class="hero-title"><i class="fas fa-cubes"></i> Interface Components</h1>
	<p class="hero-subtitle">
		A collection of draggable panel UI components and sparkline charts built as Lit web components.
		Based on the <a href="https://github.com/mlalma/magx/tree/main" target="_blank" rel="noopener"
			>magx</a
		> project by <a href="https://github.com/mlalma" target="_blank" rel="noopener">mlalma</a> —
		I liked the components enough to build them into a library I could use for my own webapps. <span class="build-version">{__BUILD_VERSION__}</span>
	</p>

	<div class="hero-stats">
		<div class="stat">
			<i class="fas fa-box-open"></i>
			<span>{components.length} Components</span>
		</div>
		<div class="stat">
			<i class="fas fa-code"></i>
			<span>TypeScript</span>
		</div>
		<div class="stat">
			<i class="fas fa-feather"></i>
			<span>Lightweight</span>
		</div>
		<div class="stat">
			<i class="fas fa-puzzle-piece"></i>
			<span>Web Components</span>
		</div>
	</div>

	<div class="hero-screenshots">
		<figure class="screenshot">
			<img src="/screenshots/panel1.png" alt="Panel component showing all element types" />
			<figcaption>Panel with all element types</figcaption>
		</figure>
		<figure class="screenshot">
			<img src="/screenshots/sparkline-examples.png" alt="Sparkline chart variations" />
			<figcaption>Sparkline chart variations</figcaption>
		</figure>
	</div>
</section>

<style>
	.hero {
		margin-bottom: var(--spacing-xl);
		padding-bottom: var(--spacing-xl);
		border-bottom: 2px solid var(--color-border);
	}
	.hero-title {
		font-size: 1.5rem;
		font-weight: 700;
		letter-spacing: 0.04em;
		margin-bottom: var(--spacing-sm);
	}
	.hero-title i {
		color: var(--color-accent);
	}
	.hero-subtitle {
		font-size: 0.9rem;
		color: var(--color-text-muted);
		line-height: 1.6;
		max-width: 600px;
		margin-bottom: var(--spacing-lg);
	}
	.hero-subtitle a {
		color: var(--color-link);
	}
	.build-version {
		font-size: 0.65rem;
		color: var(--color-text-muted);
		font-family: var(--font-mono);
		letter-spacing: 0.02em;
		opacity: 0.6;
	}
	.hero-stats {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-md);
		margin-bottom: var(--spacing-xl);
	}
	.stat {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
		font-size: 0.8rem;
		font-weight: 600;
		padding: var(--spacing-xs) var(--spacing-sm);
		border: 1px solid var(--color-border);
		background: var(--color-bg-alt);
		box-shadow: 2px 2px 0 var(--color-shadow);
	}
	.stat i {
		color: var(--color-accent);
		font-size: 0.85rem;
	}
	.hero-screenshots {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--spacing-lg);
		align-items: start;
	}
	.screenshot {
		border: 1px solid var(--color-border);
		background: var(--color-bg-alt);
		padding: var(--spacing-sm);
	}
	.screenshot img {
		max-width: 100%;
		height: auto;
		display: block;
	}
	.screenshot figcaption {
		font-size: 0.7rem;
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.04em;
		margin-top: var(--spacing-xs);
		text-align: center;
	}

	@media (max-width: 768px) {
		.hero-screenshots {
			grid-template-columns: 1fr;
		}
	}
</style>
