<script lang="ts">
	/**
	 * A small "what is this" affordance: an info glyph that opens a white card
	 * describing the thing it sits next to.
	 *
	 * Two deliberate choices:
	 *
	 *  - The card is `position: fixed` and placed from the trigger's viewport
	 *    rect. An absolutely positioned popover inherits every `overflow: hidden`
	 *    and stacking context above it, and these triggers live inside cards, a
	 *    scrolling main column, and — for the chart tiles — a grid that clips.
	 *    Fixed escapes all of that for the price of recomputing on open.
	 *
	 *  - It is white in both themes, on purpose. The request was a white
	 *    background, and a tooltip that inverts with the page reads as another
	 *    surface of the page rather than as something laid on top of it.
	 *
	 * Hover opens it on a pointer; tap toggles it on a phone, where there is no
	 * hover to speak of. Focus opens it too, so it is reachable from the keyboard.
	 */
	interface Row {
		k: string;
		v: string;
	}

	interface Props {
		/** Heading of the card. */
		title: string;
		/** One or two sentences of prose. */
		body?: string;
		/** Optional key/value facts rendered as a definition grid. */
		rows?: Row[];
		/** Accessible name for the trigger. */
		label?: string;
	}

	let { title, body = '', rows = [], label = 'Details' }: Props = $props();

	const WIDTH = 260;
	const GAP = 10;

	let open = $state(false);
	let pos = $state({ x: 0, y: 0 });
	let trigger: HTMLButtonElement | null = $state(null);

	/** Clamp the card into the viewport rather than letting it hang off an edge. */
	function place() {
		const el = trigger;
		if (!el) return;
		const r = el.getBoundingClientRect();
		const x = Math.min(Math.max(GAP, r.left + r.width / 2 - WIDTH / 2), window.innerWidth - WIDTH - GAP);
		pos = { x, y: r.bottom + 8 };
	}

	function show() {
		place();
		open = true;
	}

	/* Reposition instead of drifting: the page scrolls under a fixed card. */
	$effect(() => {
		if (!open) return;
		const onMove = () => place();
		window.addEventListener('scroll', onMove, true);
		window.addEventListener('resize', onMove);
		return () => {
			window.removeEventListener('scroll', onMove, true);
			window.removeEventListener('resize', onMove);
		};
	});
</script>

<button
	bind:this={trigger}
	class="infotip-trigger"
	class:is-open={open}
	type="button"
	aria-label={label}
	aria-expanded={open}
	onpointerenter={(e) => e.pointerType === 'mouse' && show()}
	onpointerleave={(e) => e.pointerType === 'mouse' && (open = false)}
	onfocus={show}
	onblur={() => (open = false)}
	onclick={() => (open ? (open = false) : show())}
>
	<i class="fat fa-circle-info"></i>
</button>

{#if open}
	<div class="infotip-card" role="tooltip" style="left:{pos.x}px; top:{pos.y}px; width:{WIDTH}px">
		<div class="infotip-title">{title}</div>
		{#if body}<p class="infotip-body">{body}</p>{/if}
		{#if rows.length}
			<dl class="infotip-rows">
				{#each rows as r (r.k)}
					<dt>{r.k}</dt>
					<dd>{r.v}</dd>
				{/each}
			</dl>
		{/if}
	</div>
{/if}

<style>
	.infotip-trigger {
		background: none;
		border: none;
		padding: 0 2px;
		cursor: pointer;
		font-size: 0.78rem;
		line-height: 1;
		color: var(--color-text-muted);
		opacity: 0.65;
		transition: opacity 0.15s, color 0.15s;
		touch-action: manipulation;
		-webkit-tap-highlight-color: transparent;
	}
	.infotip-trigger:hover,
	.infotip-trigger:focus-visible,
	.infotip-trigger.is-open {
		opacity: 1;
		color: var(--color-accent);
	}

	/* Fixed, white in both themes — see the note at the top of this file. */
	.infotip-card {
		position: fixed;
		z-index: 900;
		background: #ffffff;
		color: #1b1b1b;
		border: 1px solid #d8d4cc;
		box-shadow: 0 6px 20px rgba(0, 0, 0, 0.16);
		padding: 10px 12px;
		pointer-events: none;
	}
	.infotip-title {
		font-family: var(--font-mono);
		font-size: 0.62rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: #6a655c;
		margin-bottom: 5px;
	}
	.infotip-body {
		font-size: 0.74rem;
		line-height: 1.5;
		margin: 0;
	}
	.infotip-rows {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 2px 10px;
		margin: 7px 0 0;
		font-size: 0.68rem;
		line-height: 1.45;
	}
	.infotip-rows dt {
		font-family: var(--font-mono);
		color: #6a655c;
		text-transform: uppercase;
		font-size: 0.6rem;
		letter-spacing: 0.05em;
		padding-top: 1px;
	}
	.infotip-rows dd {
		margin: 0;
		word-break: break-word;
	}
</style>
