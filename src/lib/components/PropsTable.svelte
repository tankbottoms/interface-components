<script lang="ts">
	interface Prop {
		name: string;
		type: string;
		default: string;
		description: string;
	}

	interface Props {
		properties: Prop[];
	}

	let { properties }: Props = $props();
</script>

{#if properties.length > 0}
	<div class="props-section">
		<h4 class="props-heading"><i class="fas fa-cog"></i> PROPERTIES</h4>
		<div class="props-table-wrapper">
			<table class="props-table">
				<thead>
					<tr>
						<th>Name</th>
						<th>Type</th>
						<th>Default</th>
						<th>Description</th>
					</tr>
				</thead>
				<tbody>
					{#each properties as prop}
						<tr>
							<td><code>{prop.name}</code></td>
							<td><code>{prop.type}</code></td>
							<td><code>{prop.default}</code></td>
							<td>{prop.description}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
{/if}

<style>
	.props-section {
		margin-top: var(--spacing-md);
	}
	.props-heading {
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
	.props-heading i {
		font-size: 0.7rem;
	}
	.props-table-wrapper {
		overflow-x: auto;
	}
	.props-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.8rem;
	}
	.props-table th {
		text-align: left;
		padding: var(--spacing-xs) var(--spacing-sm);
		border-bottom: 2px solid var(--color-border-dark);
		font-weight: 600;
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--color-text-muted);
	}
	.props-table td {
		padding: var(--spacing-xs) var(--spacing-sm);
		border-bottom: 1px solid var(--color-border-light);
		vertical-align: top;
	}
	.props-table code {
		font-size: 0.75rem;
		color: var(--color-accent);
	}

	@media (max-width: 768px) {
		/*
		 * Four columns in a 390px viewport leaves the description about four
		 * characters per line, which is how a six-row table came out taller than
		 * the panel it documents. Below the breakpoint each row becomes a block:
		 * the property name, a small type/default byline, then the prose at full
		 * width. Same markup, same source of truth — only the layout changes.
		 */
		.props-table thead {
			display: none;
		}
		.props-table,
		.props-table tbody,
		.props-table tr,
		.props-table td {
			display: block;
			width: 100%;
		}
		.props-table tr {
			padding: var(--spacing-xs) 0;
			border-bottom: 1px solid var(--color-border-light);
		}
		.props-table td {
			border: none;
			padding: 0;
		}
		.props-table td:nth-child(2),
		.props-table td:nth-child(3) {
			display: inline;
			width: auto;
			font-size: 0.68rem;
			color: var(--color-text-muted);
		}
		.props-table td:nth-child(2)::before {
			content: 'type ';
		}
		.props-table td:nth-child(3)::before {
			content: ' · default ';
		}
		.props-table td:nth-child(4) {
			margin-top: 4px;
			line-height: 1.55;
		}
	}
</style>
