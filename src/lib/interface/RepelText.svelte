<script lang="ts">
	/**
	 * Cursor-repel title, after the "PretextBlock" heading on finder.atsignhandle.xyz.
	 *
	 * Each character is its own span with a spring: the pointer pushes glyphs away
	 * inside a radius, and they fall back to rest when it leaves. The whole thing
	 * is one rAF loop over a flat array — no per-character listeners, no
	 * transitions, because a transition would fight the spring.
	 *
	 * Motion is skipped entirely under `prefers-reduced-motion`, which leaves
	 * plain, selectable text.
	 */
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	interface Props {
		text?: string;
		/** Pixel radius the pointer influences. */
		radius?: number;
		/** How hard a glyph is pushed at the centre of that radius. */
		strength?: number;
		stiffness?: number;
		damping?: number;
		size?: string;
	}

	let {
		text = 'INTERFACE',
		radius = 80,
		strength = 40,
		stiffness = 0.08,
		damping = 0.75,
		size = 'clamp(2.2rem, 9vw, 5.5rem)'
	}: Props = $props();

	interface Glyph {
		el: HTMLSpanElement;
		x: number;
		y: number;
		vx: number;
		vy: number;
	}

	let host: HTMLDivElement | null = $state(null);
	let reduced = $state(false);
	let active = $state(false);

	const chars = $derived([...text]);

	onMount(() => {
		if (!browser || !host) return;
		reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduced) return;

		const glyphs: Glyph[] = [...host.querySelectorAll<HTMLSpanElement>('.rt-char')].map((el) => ({
			el,
			x: 0,
			y: 0,
			vx: 0,
			vy: 0
		}));

		// Pointer position in viewport coordinates; -1e9 parks it out of range.
		let px = -1e9;
		let py = -1e9;

		const onMove = (e: PointerEvent) => {
			px = e.clientX;
			py = e.clientY;
			active = true;
		};
		const onLeave = () => {
			px = -1e9;
			py = -1e9;
			active = false;
		};

		window.addEventListener('pointermove', onMove, { passive: true });
		host.addEventListener('pointerleave', onLeave);

		let raf = requestAnimationFrame(function frame() {
			raf = requestAnimationFrame(frame);
			for (const g of glyphs) {
				// Rest position, read fresh so reflow/resize is handled for free.
				const r = g.el.getBoundingClientRect();
				const cx = r.left + r.width / 2 - g.x;
				const cy = r.top + r.height / 2 - g.y;

				const dx = cx - px;
				const dy = cy - py;
				const dist = Math.hypot(dx, dy);

				let tx = 0;
				let ty = 0;
				if (dist < radius && dist > 0.001) {
					// Linear falloff: full push at the centre, nothing at the edge.
					const push = (1 - dist / radius) * strength;
					tx = (dx / dist) * push;
					ty = (dy / dist) * push;
				}

				// Critically-ish damped spring toward the target offset.
				g.vx = (g.vx + (tx - g.x) * stiffness) * damping;
				g.vy = (g.vy + (ty - g.y) * stiffness) * damping;
				g.x += g.vx;
				g.y += g.vy;

				g.el.style.transform = `translate3d(${g.x.toFixed(2)}px, ${g.y.toFixed(2)}px, 0)`;
			}
		});

		return () => {
			cancelAnimationFrame(raf);
			window.removeEventListener('pointermove', onMove);
			host?.removeEventListener('pointerleave', onLeave);
		};
	});
</script>

<div
	bind:this={host}
	class="rt"
	class:is-active={active}
	style="--rt-size:{size}"
	aria-label={text}
>
	{#each chars as ch, i (i)}
		{#if ch === ' '}
			<span class="rt-space" aria-hidden="true">&nbsp;</span>
		{:else}
			<span class="rt-char" aria-hidden="true">{ch}</span>
		{/if}
	{/each}
</div>

<style>
	.rt {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		font-size: var(--rt-size);
		font-weight: 800;
		letter-spacing: -0.02em;
		line-height: 1;
		user-select: none;
		cursor: crosshair;
		padding: var(--spacing-lg) 0;
	}
	.rt-char {
		display: inline-block;
		will-change: transform;
		color: var(--ink, var(--color-text));
	}
	/* Alternating glyphs pick up the accent so the displacement is legible. */
	.rt-char:nth-child(3n + 2) {
		color: var(--color-accent);
	}
	.rt-space {
		display: inline-block;
		width: 0.3em;
	}

	@media (prefers-reduced-motion: reduce) {
		.rt {
			cursor: default;
		}
		.rt-char {
			transform: none !important;
		}
	}
</style>
