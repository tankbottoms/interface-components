import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import path from 'path';
import { execSync } from 'child_process';
import { readFileSync } from 'fs';

function getBuildVersion(): string {
	const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));
	const version = pkg.version || '0.0.0';
	let sha = 'dev';
	try {
		sha = execSync('git rev-parse --short=5 HEAD').toString().trim();
	} catch {}
	return `${version}.${sha}`;
}

export default defineConfig({
	plugins: [sveltekit()],
	define: {
		__BUILD_VERSION__: JSON.stringify(getBuildVersion())
	},
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
