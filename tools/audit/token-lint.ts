/** Every token a component names must exist somewhere in the stylesheets.
 *
 *  The palette is centralised precisely so a colour can be changed in one
 *  place — which means a component only ever refers to a colour by name, and a
 *  name with nothing behind it fails in the worst possible way: silently, in a
 *  browser, as an unstyled element. Cheaper to ask the stylesheets at build
 *  time whether they have ever heard of the name.
 *
 *  Run: bun run tools/audit/token-lint.ts */
import { Glob } from 'bun';

const root = new URL('../../src/', import.meta.url).pathname;

/** Prose is not code. Doc comments name `var(--token)` as a placeholder for
 *  "whatever the token is called", and a lint that cannot tell a sentence from
 *  a stylesheet reports it forever. Block comments are blanked line-for-line so
 *  reported line numbers still point at the right source line. */
const decomment = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));

const files: string[] = [];
for await (const rel of new Glob('**/*.{svelte,css,ts}').scan({ cwd: root, onlyFiles: true }))
	files.push(rel);
files.sort();

/** Declarations are collected across the whole tree rather than per file,
 *  because every one of these files styles the same document: a property set on
 *  `:root` in theme.css is genuinely in scope for a component that reads it,
 *  and a component that declares `--row-h` for its own children is not a theme
 *  colour at all. Per-file scoping would flag both halves of one rule, and a
 *  lint nobody can satisfy gets switched off within a week. */
const known = new Set<string>();
const src = new Map<string, string>();
for (const rel of files) {
	const text = decomment(await Bun.file(root + rel).text());
	src.set(rel, text);
	for (const d of text.matchAll(/(--[a-z0-9-]+)\s*:/gi)) known.add(d[1]!);
	// A custom property can also be declared from script — `setProperty` on an
	// element, or Svelte's `style:--name` directive. Both are declarations; the
	// stylesheet only ever reads what they set.
	for (const d of text.matchAll(/setProperty\(\s*['"`](--[a-z0-9-]+)/gi)) known.add(d[1]!);
	for (const d of text.matchAll(/\bstyle:(--[a-z0-9-]+)/gi)) known.add(d[1]!);
}

const bad: string[] = [];
for (const rel of files) {
	const text = src.get(rel)!;
	const seen = new Set<string>();
	// A name finished by interpolation — `var(--pastel-{series})` — is a family
	// rather than a token, and its members are only known at run time. The
	// prefix is skipped rather than guessed at.
	for (const m of text.matchAll(/var\(\s*(--[a-z0-9-]+)(.?)/gi)) {
		const name = m[1]!;
		if (m[2] === '{' || m[2] === '$') continue;
		if (known.has(name) || seen.has(name)) continue;
		seen.add(name);
		bad.push(`${rel}:${text.slice(0, m.index).split('\n').length}  no such token ${name}`);
	}
}

if (bad.length) {
	for (const b of bad) console.log(b);
	console.log(`tokens: ${bad.length} undeclared`);
	process.exit(1);
}
console.log(`tokens: ok (${known.size} declared, ${files.length} files)`);
