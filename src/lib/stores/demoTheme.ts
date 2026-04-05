import { writable } from 'svelte/store';

export const demoTheme = writable<'light' | 'dark'>('light');
