import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const STORAGE_KEY = 'interface-components-accent';

const defaultAccent = '#7c3aed';

function getInitial(): string {
	if (browser) {
		return localStorage.getItem(STORAGE_KEY) || defaultAccent;
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

export const pastelSwatches = [
	{ name: 'Violet', color: '#7c3aed' },
	{ name: 'Lavender', color: '#a78bfa' },
	{ name: 'Rose', color: '#f472b6' },
	{ name: 'Coral', color: '#fb7185' },
	{ name: 'Peach', color: '#fdba74' },
	{ name: 'Butter', color: '#fde047' },
	{ name: 'Mint', color: '#6ee7b7' },
	{ name: 'Sage', color: '#86efac' },
	{ name: 'Sky', color: '#7dd3fc' },
	{ name: 'Powder', color: '#93c5fd' },
	{ name: 'Lilac', color: '#c4b5fd' },
	{ name: 'Blush', color: '#fda4af' },
];
