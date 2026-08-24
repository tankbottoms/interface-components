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
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: '404.html',
			precompress: true
		})
	}
};

export default config;
