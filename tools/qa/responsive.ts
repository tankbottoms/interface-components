/**
 * Responsive + client-hygiene QA sweep.
 *
 * Loads every route at four viewports and reports, per page:
 *   - horizontal overflow (the layout defect that actually reaches users on a
 *     phone: a page you can drag sideways),
 *   - the specific elements wider than the viewport, so the finding names a
 *     selector rather than a page,
 *   - console errors and failed requests,
 *   - any request leaving the origin.
 *
 * The last one is the point of running this against the built site rather than
 * reading the source: a third-party font, a CDN script or an analytics beacon
 * added by a dependency shows up here and nowhere else.
 *
 * Usage: bun run qa            (expects `bun run preview` on :4173)
 *        BASE=https://… bun run qa
 */
import { chromium, type Browser, type Page } from 'playwright';

const BASE = process.env.BASE ?? 'http://localhost:4173';

const ROUTES = [
	'/',
	'/interface',
	'/interface/charting',
	'/interface/layout',
	'/interface/documents',
	'/interface/wayfinding',
	'/interface/settings',
	'/interface/palette',
	'/interface/consoles',
	'/interface/motion'
];

/** Real device widths, not round numbers — the failures live at the edges. */
const VIEWPORTS = [
	{ name: 'phone', width: 375, height: 812 },
	{ name: 'tablet-portrait', width: 768, height: 1024 },
	{ name: 'tablet-landscape', width: 1024, height: 768 },
	{ name: 'desktop', width: 1440, height: 900 }
];

interface Row {
	route: string;
	viewport: string;
	overflowPx: number;
	offenders: string[];
	errors: string[];
	external: string[];
}

async function audit(page: Page, route: string, vp: (typeof VIEWPORTS)[number]): Promise<Row> {
	const errors: string[] = [];
	const external = new Set<string>();

	const onConsole = (m: { type(): string; text(): string }) => {
		if (m.type() === 'error') errors.push(m.text().slice(0, 160));
	};
	const onFailed = (r: { url(): string }) => errors.push(`REQUEST FAILED ${r.url()}`);
	const onRequest = (r: { url(): string }) => {
		const u = r.url();
		if (/^https?:\/\//.test(u) && !u.startsWith(BASE)) external.add(new URL(u).origin);
	};

	page.on('console', onConsole);
	page.on('requestfailed', onFailed);
	page.on('request', onRequest);

	await page.setViewportSize({ width: vp.width, height: vp.height });
	await page.goto(BASE + route, { waitUntil: 'load' });

	const { overflowPx, offenders } = await page.evaluate(() => {
		const doc = document.documentElement;
		const limit = doc.clientWidth;
		const offenders: string[] = [];
		for (const el of Array.from(document.querySelectorAll('body *'))) {
			const r = el.getBoundingClientRect();
			// A 1px tolerance: sub-pixel rounding on a scaled layout is not a bug.
			if (r.width > limit + 1 || r.right > limit + 1) {
				const id = el.id ? `#${el.id}` : '';
				// getAttribute, not .className: on an SVG element className is an
				// SVGAnimatedString, and the attribute is a plain string everywhere.
				const raw = el.getAttribute('class')?.trim() ?? '';
				const cls = raw ? '.' + raw.split(/\s+/).slice(0, 2).join('.') : '';
				const sel = `${el.tagName.toLowerCase()}${id}${cls}`;
				if (!offenders.includes(sel)) offenders.push(sel);
			}
		}
		return { overflowPx: Math.max(0, doc.scrollWidth - limit), offenders: offenders.slice(0, 6) };
	});

	page.off('console', onConsole);
	page.off('requestfailed', onFailed);
	page.off('request', onRequest);

	return { route, viewport: vp.name, overflowPx, offenders, errors, external: [...external] };
}

const browser: Browser = await chromium.launch();
const page = await browser.newPage();
const rows: Row[] = [];

for (const route of ROUTES) {
	for (const vp of VIEWPORTS) {
		rows.push(await audit(page, route, vp));
	}
}
await browser.close();

const bad = rows.filter((r) => r.overflowPx > 0 || r.errors.length);
const externals = new Set(rows.flatMap((r) => r.external));

console.log(`\nQA sweep — ${ROUTES.length} routes x ${VIEWPORTS.length} viewports = ${rows.length} loads`);
console.log(`base: ${BASE}\n`);

if (!bad.length) {
	console.log('PASS  no horizontal overflow, no console errors, no failed requests');
} else {
	console.log(`FAIL  ${bad.length} of ${rows.length} loads had findings\n`);
	for (const r of bad) {
		console.log(`  ${r.route}  [${r.viewport}]`);
		if (r.overflowPx > 0) console.log(`    overflow ${r.overflowPx}px -> ${r.offenders.join(', ') || '(no single offender)'}`);
		for (const e of r.errors) console.log(`    error: ${e}`);
	}
}

console.log(
	externals.size
		? `\nEXTERNAL ORIGINS CONTACTED: ${[...externals].join(', ')}`
		: '\nno external origins contacted — every byte served from this origin'
);

process.exit(bad.length ? 1 : 0);
