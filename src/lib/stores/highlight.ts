import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { accentSwatches, DEFAULT_ACCENT, accentDark } from '$lib/data/palette';

const STORAGE_KEY = 'interface-components-accent';

/** Accents retired in the teal rebrand — migrate anyone still holding one. */
const RETIRED = new Set(['#7c3aed', '#a78bfa', '#c4b5fd']);

/**
 * The site opens on amber and stays there until someone picks otherwise. It
 * used to roll between rose, aqua and mint on each load, which was lively but
 * meant the mark was a different colour every visit — a library's own chrome is
 * the one thing that should not reseed.
 */
function getInitial(): string {
	if (!browser) return DEFAULT_ACCENT;
	const stored = localStorage.getItem(STORAGE_KEY);
	if (stored && !RETIRED.has(stored.toLowerCase())) return stored;
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

/** Drop the saved preference and go back to the house amber. */
export function clearAccentPreference(): void {
	if (!browser) return;
	accentColor.set(DEFAULT_ACCENT);
	localStorage.removeItem(STORAGE_KEY);
}

export const pastelSwatches = accentSwatches;
