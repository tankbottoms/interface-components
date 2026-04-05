<script lang="ts">
	import { faProIcons } from '$lib/data/fa-icons';

	type Family = 'thin' | 'light' | 'solid' | 'sharp-thin';

	const families: { id: Family; label: string; classes: string }[] = [
		{ id: 'thin', label: 'Thin', classes: 'fa-thin' },
		{ id: 'light', label: 'Light', classes: 'fa-light' },
		{ id: 'solid', label: 'Solid', classes: 'fa-solid' },
		{ id: 'sharp-thin', label: 'Sharp Thin', classes: 'fa-sharp fa-thin' },
	];

	let activeFamily = $state<Family>('thin');
	let search = $state('');

	const activeClasses = $derived(families.find((f) => f.id === activeFamily)!.classes);

	const filtered = $derived(
		search.length > 0
			? faProIcons.filter((name) => name.includes(search.toLowerCase()))
			: faProIcons
	);
</script>

<section class="fa-card">
	<div class="card-header">
		<div class="card-title">
			<i class="fa-thin fa-icons"></i>
			<h3>Font Awesome Pro</h3>
			<code class="tag-name">6.5.1</code>
		</div>
		<span class="fa-badge">
			<i class="fa-thin fa-font-awesome"></i> {filtered.length} ICONS
		</span>
	</div>

	<p class="card-description">
		Font Awesome Pro 6.5.1 with thin, light, regular, solid, sharp, and duotone families.
		Browse the full catalog at the
		<a
			href="https://fontawesome-explorer.atsignhandle.workers.dev/"
			target="_blank"
			rel="noopener">Font Awesome Explorer</a
		>.
	</p>

	<div class="fa-tabs">
		{#each families as fam (fam.id)}
			<button
				class="fa-tab"
				class:active={activeFamily === fam.id}
				onclick={() => (activeFamily = fam.id)}
			>
				<i class="{fam.classes} fa-star"></i>
				{fam.label}
			</button>
		{/each}
	</div>

	<div class="fa-search">
		<i class="fa-thin fa-magnifying-glass"></i>
		<input type="text" placeholder="Search icons..." bind:value={search} />
	</div>

	<div class="fa-icon-grid">
		{#each filtered as name (name)}
			<div class="fa-icon-cell" title={name}>
				<i class="{activeClasses} fa-{name}"></i>
				<span>{name}</span>
			</div>
		{/each}
	</div>

	{#if filtered.length === 0}
		<div class="fa-empty">No icons match "{search}"</div>
	{/if}

	<div class="fa-footer">
		<div class="fa-usage">
			<div class="fa-usage-label">Usage</div>
			<code class="fa-code-example">&lt;i class="{activeClasses} fa-house"&gt;&lt;/i&gt;</code>
		</div>
		<a
			class="fa-explorer-link"
			href="https://fontawesome-explorer.atsignhandle.workers.dev/"
			target="_blank"
			rel="noopener"
		>
			<i class="fa-thin fa-magnifying-glass"></i> Open Font Awesome Explorer
		</a>
	</div>
</section>

<style>
	.fa-card {
		border: 1px solid var(--color-border);
		background: var(--color-bg-secondary);
		padding: var(--spacing-lg);
		margin-bottom: var(--spacing-xl);
		box-shadow: 2px 2px 0 var(--color-shadow);
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
	.fa-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		font-size: 0.65rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		padding: 0.2rem 0.6rem;
		border: 1px solid;
		color: hsl(270, 60%, 45%);
		background: hsla(270, 60%, 45%, 0.15);
		border-color: hsl(270, 60%, 45%);
	}
	.card-description {
		font-size: 0.85rem;
		line-height: 1.6;
		color: var(--color-text);
		margin-bottom: var(--spacing-md);
	}
	.card-description a {
		color: var(--color-link);
	}
	.fa-tabs {
		display: flex;
		gap: 0;
		margin-bottom: var(--spacing-md);
		border-bottom: 2px solid var(--color-border);
	}
	.fa-tab {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.5rem 1rem;
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		font-family: var(--font-mono);
		background: none;
		border: none;
		border-bottom: 2px solid transparent;
		margin-bottom: -2px;
		color: var(--color-text-muted);
		cursor: pointer;
	}
	.fa-tab:hover {
		color: var(--color-text);
		background: var(--color-bg-alt);
	}
	.fa-tab.active {
		color: var(--color-accent);
		border-bottom-color: var(--color-accent);
	}
	.fa-tab i {
		font-size: 0.85rem;
	}
	.fa-search {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		margin-bottom: var(--spacing-md);
		border: 1px solid var(--color-border);
		background: var(--color-bg-alt);
		padding: 0.4rem 0.6rem;
	}
	.fa-search i {
		color: var(--color-text-muted);
		font-size: 0.85rem;
	}
	.fa-search input {
		flex: 1;
		border: none;
		background: none;
		font-size: 0.8rem;
		font-family: var(--font-mono);
		color: var(--color-text);
		outline: none;
	}
	.fa-search input::placeholder {
		color: var(--color-text-muted);
	}
	.fa-icon-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(72px, 1fr));
		gap: 2px;
		max-height: 480px;
		overflow-y: auto;
		margin-bottom: var(--spacing-md);
		border: 1px solid var(--color-border);
	}
	.fa-icon-cell {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 4px;
		padding: 8px 2px;
		background: var(--color-bg-alt);
		cursor: default;
	}
	.fa-icon-cell:hover {
		background: var(--color-hover-bg, var(--color-bg-secondary));
	}
	.fa-icon-cell i {
		font-size: 1.2rem;
		color: var(--color-text);
	}
	.fa-icon-cell span {
		font-size: 0.5rem;
		color: var(--color-text-muted);
		text-align: center;
		line-height: 1.2;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		max-width: 100%;
	}
	.fa-empty {
		padding: var(--spacing-lg);
		text-align: center;
		color: var(--color-text-muted);
		font-size: 0.85rem;
	}
	.fa-footer {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		flex-wrap: wrap;
		gap: var(--spacing-md);
	}
	.fa-usage-label {
		font-size: 0.7rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-text-muted);
		margin-bottom: var(--spacing-xs);
	}
	.fa-code-example {
		display: inline-block;
		font-size: 0.8rem;
		background: var(--color-bg-alt);
		border: 1px solid var(--color-border);
		padding: var(--spacing-xs) var(--spacing-sm);
	}
	.fa-explorer-link {
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-xs);
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--color-accent);
		border: 1px solid var(--color-accent);
		padding: var(--spacing-xs) var(--spacing-md);
		text-decoration: none;
		box-shadow: 2px 2px 0 var(--color-shadow);
	}
	.fa-explorer-link:hover {
		background: var(--color-accent);
		color: var(--color-bg);
		text-decoration: none;
	}
</style>
