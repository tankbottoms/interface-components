import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { accentSwatches, accentValues, DEFAULT_ACCENT, accentDark } from '$lib/data/palette';

const STORAGE_KEY = 'interface-components-accent';

/**
 * The site opens on mint — the last of the eight elegant pastels — and stays there until
 * someone picks otherwise. It used to reseed on every load, which was lively but
 * meant the mark was a different colour every visit; a library's own chrome is
 * the one thing that should not.
 *
 * The picker's options have changed twice (purple → amber/teal → the eight pastels),
 * so rather than keep a growing list of retired hexes, a stored value is simply
 * checked against the palette that exists *now*. Anything the picker can no
 * longer offer — a purple from the first set, the amber from the second — falls
 * back to mint instead of pinning the header to a colour with no swatch.
 */
function getInitial(): string {
	if (!browser) return DEFAULT_ACCENT;
	const stored = localStorage.getItem(STORAGE_KEY)?.trim().toLowerCase();
	if (stored && accentValues.has(stored)) return stored;
	return DEFAULT_ACCENT;
}

export const accentColor = writable<string>(getInitial());

if (browser) {
	accentColor.subscribe((color) => {
		/*
		 * Two properties, not one. `--color-accent` itself is declared per theme
		 * in theme.css as var(--accent-light) / var(--accent-dark), so the flip is
		 * CSS's job and nothing here has to watch for a theme change. Setting
		 * `--color-accent` inline instead would win over both theme blocks and
		 * pin one hex to both grounds, which is what we are undoing.
		 */
		const el = document.documentElement;
		el.style.setProperty('--accent-light', color);
		el.style.setProperty('--accent-dark', accentDark(color));
		localStorage.setItem(STORAGE_KEY, color);
	});
}

/** Drop the saved preference and go back to the house mint. */
export function clearAccentPreference(): void {
	if (!browser) return;
	accentColor.set(DEFAULT_ACCENT);
	localStorage.removeItem(STORAGE_KEY);
}

export const pastelSwatches = accentSwatches;
