<script lang="ts">
	interface Props {
		category: 'container' | 'input' | 'display' | 'control' | 'canvas';
	}

	let { category }: Props = $props();

	const config: Record<string, { icon: string; color: string; bg: string }> = {
		container: {
			icon: 'fa-layer-group',
			color: 'hsl(210, 60%, 45%)',
			bg: 'hsla(210, 60%, 45%, 0.15)'
		},
		input: { icon: 'fa-keyboard', color: 'hsl(140, 50%, 40%)', bg: 'hsla(140, 50%, 40%, 0.15)' },
		display: { icon: 'fa-eye', color: 'hsl(270, 50%, 55%)', bg: 'hsla(270, 50%, 55%, 0.15)' },
		control: { icon: 'fa-sliders', color: 'hsl(30, 70%, 50%)', bg: 'hsla(30, 70%, 50%, 0.15)' },
		canvas: {
			icon: 'fa-chart-line',
			color: 'hsl(190, 60%, 45%)',
			bg: 'hsla(190, 60%, 45%, 0.15)'
		}
	};

	const c = $derived(config[category]);
</script>

<span class="badge" style="color: {c.color}; background: {c.bg}; border-color: {c.color};">
	<i class="fas {c.icon}"></i>
	{category.toUpperCase()}
</span>

<style>
	.badge {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		font-family: var(--font-mono);
		font-size: 0.65rem;
		font-weight: 600;
		padding: 0.15rem 0.45rem;
		border: 1px solid;
		text-transform: uppercase;
		letter-spacing: 0.03em;
		white-space: nowrap;
	}
	.badge i {
		font-size: 0.6rem;
	}
</style>
