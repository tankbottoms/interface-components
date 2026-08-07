import { browser } from '$app/environment';

/**
 * Frame pump shared by every animated demo on the site.
 *
 * One `requestAnimationFrame` loop drives the callback and throttles it to the
 * requested frames-per-second. The rate is read through a *getter* on every
 * frame, so a slider can change it live without the loop being torn down and
 * rebuilt — which is what lets a chart go from 1 fps to 30 fps without dropping
 * its data. An fps of 0 parks the loop: the rAF keeps turning so resuming is
 * instant, but the callback is never invoked.
 *
 * Returns its own teardown. Call it from an `$effect` and the loop dies with
 * the component.
 */
export function onTick(getFps: () => number, cb: (dt: number) => void): () => void {
	if (!browser) return () => {};

	let raf = 0;
	let last = performance.now();
	let acc = 0;

	const frame = (now: number) => {
		raf = requestAnimationFrame(frame);
		const dt = now - last;
		last = now;

		const fps = getFps();
		if (fps <= 0) {
			acc = 0;
			return;
		}

		acc += dt;
		const step = 1000 / fps;
		if (acc >= step) {
			// Modulo rather than subtract: after a background-tab stall we want the
			// next single frame, not a burst of forty catch-up frames.
			acc %= step;
			cb(dt);
		}
	};

	raf = requestAnimationFrame(frame);
	return () => cancelAnimationFrame(raf);
}

/** `#aabbcc` → `{ r, g, b }`. Falls back to the house teal on anything unparseable. */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
	const h = hex.trim().replace('#', '');
	if (h.length < 6) return { r: 55, g: 146, b: 164 };
	return {
		r: parseInt(h.substring(0, 2), 16),
		g: parseInt(h.substring(2, 4), 16),
		b: parseInt(h.substring(4, 6), 16)
	};
}

/** Reads a CSS custom property off `:root` — how the demos follow the live theme. */
export function cssVar(name: string, fallback = ''): string {
	if (!browser) return fallback;
	const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
	return v || fallback;
}
