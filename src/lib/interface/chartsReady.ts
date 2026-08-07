/**
 * Wait until panel sparklines can actually be drawn on.
 *
 * `magx-panel-sparkline` only creates its canvas in Lit's `firstUpdated`, and
 * sizes that canvas from the computed width of the slot it landed in. Both of
 * those happen after the element is upgraded, so "the custom element has a
 * `getSparkline` method" is not the same question as "there is a canvas with a
 * box on it". Painting in the gap between the two is a silent no-op:
 * `renderCanvas()` returns early with no canvas, and nothing ever asks again.
 *
 * That gap only opens on client-side navigation. On a cold load the element is
 * still un-upgraded when the first paint is attempted, so a poll waiting on
 * upgrade happens to wait long enough for the canvas too. Come back to the same
 * page through the nav and the class is already registered — the poll passes on
 * frame one, paints into nothing, and the panels show empty charts.
 *
 * So the readiness test has to be the canvas itself.
 */

import { magxById } from './magx';

/** A chart identified either by element id or by a `bind:this` reference. */
export type ChartRef = string | HTMLElement | null | undefined;

function hostOf(ref: ChartRef): any {
	if (!ref) return null;
	return typeof ref === 'string' ? magxById(ref) : ref;
}

/** The live canvas for a panel sparkline, or null if it isn't paintable yet. */
export function chartCanvas(ref: ChartRef): HTMLCanvasElement | null {
	const sp = hostOf(ref)?.getSparkline?.();
	if (!sp) return null;
	const canvas = sp.shadowRoot?.getElementById('sparkline_canvas') as HTMLCanvasElement | null;
	if (!canvas) return null;
	return canvas.width > 0 && canvas.height > 0 ? canvas : null;
}

/**
 * Call `paint` once every listed chart is paintable.
 *
 * Short frames are retried, and `paint` is called anyway when the deadline
 * passes, so a chart that never gets a box still gets its one attempt rather
 * than being dropped in silence.
 */
export function whenCharts(refs: ChartRef[], paint: () => void, tries = 240): () => void {
	let raf = 0;
	let stop = false;

	const attempt = (left: number) => {
		if (stop) return;
		const missing = refs.filter((r) => !chartCanvas(r));
		if (!missing.length || left <= 0) {
			if (missing.length) {
				console.warn('[charts] gave up waiting on', missing);
			}
			paint();
			return;
		}
		raf = requestAnimationFrame(() => attempt(left - 1));
	};

	attempt(tries);

	return () => {
		stop = true;
		if (raf) cancelAnimationFrame(raf);
	};
}
