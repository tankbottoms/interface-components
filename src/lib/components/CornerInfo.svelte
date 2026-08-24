<script lang="ts">
	import InfoTip from './InfoTip.svelte';

	/**
	 * The circle-i, parked in a container corner rather than beside a title.
	 *
	 * `InfoTip` answers "what is this" for a thing you can point at — a chart, a
	 * column heading. This answers it for a whole *container*, where there is no
	 * one word to sit next to. The corner is the convention: a reader who has
	 * seen one of these knows where to look on the next panel, which is the
	 * entire value of putting it in a fixed position instead of wherever the
	 * layout has room.
	 *
	 * Top-left by default because that is where the eye lands first and where
	 * card titles already live — the glyph reads as part of the heading rather
	 * than as a stray control. Top-right is for containers whose top-left is
	 * already spoken for (a map's zoom cluster, a viewer's axis gizmo).
	 *
	 * Requires the parent to be `position: relative`; `.ifc-has-corner` on the
	 * container does that and reserves the inset.
	 */
	interface Props {
		title: string;
		body?: string;
		rows?: { k: string; v: string }[];
		corner?: 'tl' | 'tr' | 'bl' | 'br';
		label?: string;
	}

	let { title, body = '', rows = [], corner = 'tl', label = 'About this panel' }: Props = $props();
</script>

<span class="corner-info c-{corner}">
	<InfoTip {title} {body} {rows} {label} />
</span>

<style>
	.corner-info {
		position: absolute;
		z-index: 4;
		line-height: 0;
	}
	.c-tl {
		top: 6px;
		left: 6px;
	}
	.c-tr {
		top: 6px;
		right: 6px;
	}
	.c-bl {
		bottom: 6px;
		left: 6px;
	}
	.c-br {
		bottom: 6px;
		right: 6px;
	}
</style>
