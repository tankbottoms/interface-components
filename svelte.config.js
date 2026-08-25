import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		/*
		 * The magx components live in this repo, not in node_modules, but they
		 * import each other by package name (`import { MagxSparkline } from
		 * 'magx-sparkline'`). Declaring the mapping here rather than as `paths`
		 * in tsconfig.json is what keeps one source of truth: SvelteKit writes
		 * it into the generated .svelte-kit/tsconfig.json *and* hands it to
		 * Vite, so the type-checker and the bundler cannot drift apart. A
		 * hand-written `paths` block replaces the generated map wholesale and
		 * has to restate $lib and $app itself — which is how it silently rots.
		 */
		alias: {
			'magx-panel': './magx/Panel/src',
			'magx-sparkline': './magx/Sparkline/src'
		},
		/*
		 * Hash mode, not nonce: every page here is prerendered, so there is no
		 * server to mint a per-request nonce. SvelteKit hashes its own inline
		 * hydration script at build time and writes the CSP into each page.
		 *
		 * `style-src` keeps 'unsafe-inline' because the pattern pages set swatch
		 * and chart colours through `style=` attributes — that is the palette
		 * being demonstrated, and hashing an attribute is not a thing CSP does.
		 * Scripts, which is where this actually matters, stay hash-only.
		 */
		csp: {
			mode: 'hash',
			directives: {
				'default-src': ['self'],
				'script-src': ['self'],
				'style-src': ['self', 'unsafe-inline'],
				'img-src': ['self', 'data:'],
				'font-src': ['self'],
				'connect-src': ['self'],
				'object-src': ['none'],
				'base-uri': ['self'],
				'form-action': ['self'],
				'frame-ancestors': ['none']
			}
		},
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: '404.html',
			precompress: true
		})
	}
};

export default config;
