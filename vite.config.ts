import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
	plugins: [sveltekit()],
	resolve: {
		alias: {
			'magx-panel': path.resolve('./magx/Panel/src'),
			'magx-sparkline': path.resolve('./magx/Sparkline/src')
		}
	},
	optimizeDeps: {
		include: ['lit']
	},
	ssr: {
		noExternal: [],
		external: ['lit', 'lit/decorators.js', '@lit/reactive-element']
	}
});
