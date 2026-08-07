/**
 * "CSS reacts, JS just listens" — the one idea worth taking from
 * prop-for-that.netlify.app.
 *
 * JavaScript's whole job is to write numbers onto elements as custom
 * properties. It never decides what those numbers look like. Every visual
 * reaction — the tilt, the glow, the reveal, the fill — is expressed in the
 * stylesheet, which means the motion can be restyled, themed, or disabled
 * without touching a line of script.
 *
 * Naming follows the same two-tier convention:
 *   --live-*   continuously updated, may change many times per second
 *   --const-*  latched once and left alone (e.g. "has this ever been seen")
 *
 * Deliberately NOT adopted from that system: oklch colour, `light-dark()`, and
 * its webfont. This library stays on vanilla CSS, hex, and `data-theme`.
 */
import { browser } from '$app/environment';

type Cleanup = () => void;

/**
 * Writes the pointer's position over an element as 0..1 ratios, plus a 0/1
 * gate for whether the pointer is inside it. Everything downstream is CSS.
 *
 *   --live-pointer-x-ratio   0 at the left edge, 1 at the right
 *   --live-pointer-y-ratio   0 at the top edge, 1 at the bottom
 *   --live-pointer-inside    0 or 1, usable directly as an opacity multiplier
 */
export function pointerRatios(el: HTMLElement): Cleanup {
	if (!browser) return () => {};

	let frame = 0;
	let pending: { x: number; y: number } | null = null;

	// Coalesce to one write per frame: pointermove can fire far more often than
	// the compositor will ever use.
	const flush = () => {
		frame = 0;
		if (!pending) return;
		const r = el.getBoundingClientRect();
		if (!r.width || !r.height) return;
		el.style.setProperty('--live-pointer-x-ratio', ((pending.x - r.left) / r.width).toFixed(4));
		el.style.setProperty('--live-pointer-y-ratio', ((pending.y - r.top) / r.height).toFixed(4));
	};

	const onMove = (e: PointerEvent) => {
		pending = { x: e.clientX, y: e.clientY };
		if (!frame) frame = requestAnimationFrame(flush);
	};
	const onEnter = () => el.style.setProperty('--live-pointer-inside', '1');
	const onLeave = () => {
		el.style.setProperty('--live-pointer-inside', '0');
		// Park at centre so the element relaxes to a neutral pose, not a corner.
		el.style.setProperty('--live-pointer-x-ratio', '0.5');
		el.style.setProperty('--live-pointer-y-ratio', '0.5');
	};

	onLeave();
	el.addEventListener('pointermove', onMove, { passive: true });
	el.addEventListener('pointerenter', onEnter);
	el.addEventListener('pointerleave', onLeave);

	return () => {
		if (frame) cancelAnimationFrame(frame);
		el.removeEventListener('pointermove', onMove);
		el.removeEventListener('pointerenter', onEnter);
		el.removeEventListener('pointerleave', onLeave);
	};
}

/**
 * Writes how much of an element is on screen, and latches the fact that it has
 * been seen at least once.
 *
 *   --live-visible        0..1, the current intersection ratio
 *   --const-has-entered   0 until first seen, then 1 forever
 *
 * The latch is what makes "animate in once" a CSS concern rather than a
 * JavaScript state machine.
 */
export function visibility(el: HTMLElement, threshold = 0.15): Cleanup {
	if (!browser) return () => {};

	el.style.setProperty('--live-visible', '0');
	el.style.setProperty('--const-has-entered', '0');

	const io = new IntersectionObserver(
		(entries) => {
			for (const e of entries) {
				el.style.setProperty('--live-visible', e.intersectionRatio.toFixed(3));
				if (e.intersectionRatio >= threshold) {
					el.style.setProperty('--const-has-entered', '1');
				}
			}
		},
		// A dense threshold list is what turns a boolean callback into a signal.
		{ threshold: Array.from({ length: 21 }, (_, i) => i / 20) }
	);

	io.observe(el);
	return () => io.disconnect();
}

/**
 * Publishes a scalar as a percentage property so bars, meters and dials can be
 * pure CSS. Kept separate from the DOM-event helpers because the value comes
 * from application state, not from the pointer.
 */
export function setValuePct(el: HTMLElement | null, pct: number): void {
	el?.style.setProperty('--live-value-pct', `${Math.max(0, Math.min(100, pct)).toFixed(2)}%`);
}
