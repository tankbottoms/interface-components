/**
 * Size a panel stage to the panels actually inside it.
 *
 * `magx-panel` positions itself absolutely, so it contributes nothing to its
 * container's height. Every stage therefore needs an explicit height, and a
 * hand-picked number is wrong twice over: too small and the panels spill out
 * and overlap whatever follows, too large and the section is half empty.
 *
 * This measures the real panels — the visible box is `#panel` inside the shadow
 * root, because the host itself collapses to zero width — and writes the
 * resulting height onto the stage. It re-measures after a drag and on resize,
 * since either can move a panel past the previous low-water mark.
 */
export function fitStage(stage: HTMLElement, pad = 16): () => void {
	let raf = 0;

	const measure = () => {
		const top = stage.getBoundingClientRect().top;
		let lowest = 0;
		for (const host of stage.querySelectorAll('magx-panel')) {
			const box = (host as any).shadowRoot?.getElementById('panel') as HTMLElement | null;
			if (!box) continue;
			const r = box.getBoundingClientRect();
			// A collapsed panel reports a real, much shorter box — which is the
			// point: collapsing one should reclaim the space it was holding.
			if (r.height === 0) continue;
			lowest = Math.max(lowest, r.bottom - top);
		}
		if (lowest > 0) stage.style.height = `${Math.ceil(lowest + pad)}px`;
	};

	/** Panels animate into place, so one measurement at t=0 reads the wrong box. */
	const settle = (frames = 30) => {
		cancelAnimationFrame(raf);
		const step = (left: number) => {
			measure();
			if (left > 0) raf = requestAnimationFrame(() => step(left - 1));
		};
		step(frames);
	};

	settle();
	const onUp = () => settle(12);
	const onResize = () => settle(4);
	document.addEventListener('pointerup', onUp);
	// Collapsing is a double-click on the title bar, and changes height a lot.
	stage.addEventListener('dblclick', onUp);
	window.addEventListener('resize', onResize);

	return () => {
		cancelAnimationFrame(raf);
		document.removeEventListener('pointerup', onUp);
		stage.removeEventListener('dblclick', onUp);
		window.removeEventListener('resize', onResize);
	};
}
