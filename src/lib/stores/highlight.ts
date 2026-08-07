import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { accentSwatches, DEFAULT_ACCENT, randomLoadAccent } from '$lib/data/palette';

const STORAGE_KEY = 'interface-components-accent';

/** Accents retired in the teal rebrand — migrate anyone still holding one. */
const RETIRED = new Set(['#7c3aed', '#a78bfa', '#c4b5fd']);

/**
 * With no saved preference the site picks between rose, aqua and mint on each
 * load. A random accent is deliberately *not* persisted — persisting it would
 * freeze the first roll forever. Only an explicit pick from the header or the
 * palette page is written to storage, and from then on it always wins.
 */
let hadStored = false;

function getInitial(): string {
	if (!browser) return DEFAULT_ACCENT;
	const stored = localStorage.getItem(STORAGE_KEY);
	if (stored && !RETIRED.has(stored.toLowerCase())) {
		hadStored = true;
		return stored;
	}
	return randomLoadAccent();
}

export const accentColor = writable<string>(getInitial());

if (browser) {
	// The first emission is the initial value. If that value was rolled rather
	// than restored, apply it but do not write it back.
	let skipPersist = !hadStored;
	accentColor.subscribe((color) => {
		document.documentElement.style.setProperty('--color-accent', color);
		if (skipPersist) {
			skipPersist = false;
			return;
		}
		localStorage.setItem(STORAGE_KEY, color);
	});
}

/** Drop the saved preference so the site goes back to rolling on each load. */
export function clearAccentPreference(): void {
	if (!browser) return;
	localStorage.removeItem(STORAGE_KEY);
	accentColor.set(randomLoadAccent());
	localStorage.removeItem(STORAGE_KEY);
}

export const pastelSwatches = accentSwatches;
