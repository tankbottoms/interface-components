import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { accentSwatches, DEFAULT_ACCENT } from '$lib/data/palette';

const STORAGE_KEY = 'interface-components-accent';

/** Accents retired in the teal rebrand — migrate anyone still holding one. */
const RETIRED = new Set(['#7c3aed', '#a78bfa', '#c4b5fd']);

const defaultAccent = DEFAULT_ACCENT;

function getInitial(): string {
	if (browser) {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (!stored || RETIRED.has(stored.toLowerCase())) return defaultAccent;
		return stored;
	}
	return defaultAccent;
}

export const accentColor = writable<string>(getInitial());

if (browser) {
	accentColor.subscribe((color) => {
		localStorage.setItem(STORAGE_KEY, color);
		document.documentElement.style.setProperty('--color-accent', color);
	});
}

export const pastelSwatches = accentSwatches;
