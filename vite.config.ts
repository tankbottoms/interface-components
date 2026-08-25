import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { execSync } from 'child_process';
import { readFileSync } from 'fs';

/**
 * `MM.NN.sha5` — major.minor from package.json, then five characters of the
 * commit. The patch segment is deliberately dropped: it is always 0 here (the
 * SHA *is* the patch), and carrying it produced `1.13.0.dfa8b`, which reads as
 * a truncated four-part number rather than a version plus a hash. Three
 * segments, one meaning each.
 */
function getBuildVersion(): string {
	const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));
	const [major = '0', minor = '0'] = String(pkg.version || '0.0.0').split('.');
	let sha = 'dev';
	try {
		sha = execSync('git rev-parse --short=5 HEAD').toString().trim();
	} catch {}
	return `${major}.${minor}.${sha}`;
}

export default defineConfig({
	plugins: [sveltekit()],
	define: {
		__BUILD_VERSION__: JSON.stringify(getBuildVersion())
	},
	optimizeDeps: {
		include: ['lit']
	},
	ssr: {
		noExternal: [],
		external: ['lit', 'lit/decorators.js', '@lit/reactive-element']
	}
});
