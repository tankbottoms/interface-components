/**
 * Find a panel element by id — including the ones `getElementById` cannot see.
 *
 * Svelte sets values on a custom element as *properties* when the element
 * declares one, and every `magx-panel-*` declares `id` and `title` as Lit
 * reactive properties. On the first render the element is hydrated from
 * server-rendered HTML, so the attributes are present and everything behaves.
 * Arrive at the same page a second time through client-side navigation and the
 * element is constructed fresh: Svelte assigns `el.id = 'hs-cpu'` as a
 * property, the attribute is never written, and `document.getElementById` —
 * which only ever looks at attributes — returns null.
 *
 * That is the whole reason the hero dashboard came back with eight empty
 * canvases after navigating away and back: the charts were fine, the code
 * simply could not find them any more. Reading `.id` off the elements finds
 * them either way, because the property is set in both cases.
 */
export function magxById(id: string): HTMLElement | null {
	const direct = document.getElementById(id);
	if (direct) return direct;
	// Panel children sit in the light DOM as direct children of the panel.
	for (const el of document.querySelectorAll<HTMLElement>('magx-panel, magx-panel > *')) {
		if (el.id === id) return el;
	}
	return null;
}
