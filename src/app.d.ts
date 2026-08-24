/**
 * Ambient declarations for the app.
 *
 * `__BUILD_VERSION__` is not a real binding — Vite's `define` substitutes the
 * `MM.NN.sha5` string at build time (see vite.config.ts). Declaring it here,
 * once and globally, is why no component needs its own `declare const`: Svelte
 * rejects `declare` inside an instance <script>, so a per-file declaration is a
 * parse error waiting for whoever copies the pattern next.
 */
declare const __BUILD_VERSION__: string;

/** Raw-text imports used for the Panel stylesheets. */
declare module '*.css?raw' {
	const content: string;
	export default content;
}

declare namespace App {
	// interface Error {}
	// interface Locals {}
	// interface PageData {}
	// interface Platform {}
}
