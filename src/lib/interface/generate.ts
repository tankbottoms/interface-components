/**
 * Synthetic data for the Interface section.
 *
 * Every demo on these pages is fed from here — nothing is hard-coded and
 * nothing calls a network. Generators are seeded so a given demo renders the
 * same shape on the server and on the client (hydration would otherwise
 * mismatch), but each generator takes a `seed` so callers can ask for a fresh
 * shape on demand.
 */

/** Mulberry32 — small, fast, and stable across runtimes. */
export function rng(seed: number): () => number {
	let a = seed >>> 0;
	return function () {
		a |= 0;
		a = (a + 0x6d2b79f5) | 0;
		let t = Math.imul(a ^ (a >>> 15), 1 | a);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/** Uniform value in [min, max]. */
export function between(r: () => number, min: number, max: number): number {
	return min + r() * (max - min);
}

/** Integer in [min, max] inclusive. */
export function intBetween(r: () => number, min: number, max: number): number {
	return Math.floor(between(r, min, max + 1));
}

export function pick<T>(r: () => number, items: readonly T[]): T {
	return items[Math.floor(r() * items.length)];
}

/**
 * Random walk clamped to a range. Produces the "plausible telemetry" shape
 * used by most of the reference dashboards — drifting, not noisy.
 */
export function walk(
	count: number,
	opts: { seed?: number; min?: number; max?: number; start?: number; step?: number } = {}
): number[] {
	const { seed = 1, min = 0, max = 100, step = (max - min) / 12 } = opts;
	const r = rng(seed);
	let v = opts.start ?? (min + max) / 2;
	const out: number[] = [];
	for (let i = 0; i < count; i++) {
		v += (r() - 0.5) * 2 * step;
		v = Math.max(min, Math.min(max, v));
		out.push(v);
	}
	return out;
}

/**
 * Mostly-quiet series punctuated by spikes — the shape of network and disk
 * rate charts on seaweed-stats.
 */
export function spiky(
	count: number,
	opts: { seed?: number; base?: number; spike?: number; chance?: number } = {}
): number[] {
	const { seed = 1, base = 4, spike = 100, chance = 0.08 } = opts;
	const r = rng(seed);
	const out: number[] = [];
	for (let i = 0; i < count; i++) {
		const noise = base * between(r, 0.2, 1.4);
		out.push(r() < chance ? noise + spike * between(r, 0.35, 1) : noise);
	}
	return out;
}

/**
 * Daily-cycle series: a sine diurnal curve plus noise. Used for energy,
 * occupancy and load-shape demos.
 */
export function diurnal(
	count: number,
	opts: { seed?: number; min?: number; max?: number; period?: number; noise?: number } = {}
): number[] {
	const { seed = 1, min = 20, max = 120, period = 24, noise = 0.18 } = opts;
	const r = rng(seed);
	const mid = (min + max) / 2;
	const amp = (max - min) / 2;
	return Array.from({ length: count }, (_, i) => {
		const phase = (i / period) * Math.PI * 2;
		const v = mid + amp * Math.sin(phase - Math.PI / 2) * 0.8;
		return Math.max(min, Math.min(max, v + (r() - 0.5) * 2 * amp * noise));
	});
}

/** Trailing mean, used for the 7-day overlay on the daily-consumption chart. */
export function rollingMean(values: number[], window: number): number[] {
	return values.map((_, i) => {
		const from = Math.max(0, i - window + 1);
		const slice = values.slice(from, i + 1);
		return slice.reduce((a, b) => a + b, 0) / slice.length;
	});
}

/** hour × weekday matrix for the load-shape heatmap. */
export function heatmapMatrix(
	opts: { seed?: number; rows?: number; cols?: number } = {}
): number[][] {
	const { seed = 1, rows = 7, cols = 24 } = opts;
	const r = rng(seed);
	return Array.from({ length: rows }, (_, day) =>
		Array.from({ length: cols }, (_, hour) => {
			// Two humps: a small morning one, a large evening one, with the
			// weekend mornings shifted later.
			const weekend = day === 0 || day === 6;
			const morning = Math.exp(-(((hour - (weekend ? 10 : 7)) / 2.2) ** 2)) * 0.45;
			const evening = Math.exp(-(((hour - 19) / 2.6) ** 2));
			return Math.max(0, (morning + evening) * between(r, 0.7, 1.15) + between(r, 0, 0.08));
		})
	);
}

export interface StackedPoint {
	label: string;
	values: number[];
}

/** Monthly stacked totals, e.g. kWh split by cost tier. */
export function stacked(
	labels: string[],
	seriesCount: number,
	opts: { seed?: number; min?: number; max?: number } = {}
): StackedPoint[] {
	const { seed = 1, min = 200, max = 1500 } = opts;
	const r = rng(seed);
	return labels.map((label, i) => {
		const total = between(r, min, max) * (0.7 + 0.3 * Math.sin((i / labels.length) * Math.PI * 2));
		// The first series takes the bulk; remainder splits across the rest.
		const primary = total * between(r, 0.6, 0.92);
		const rest = total - primary;
		const values = [primary];
		for (let s = 1; s < seriesCount; s++) {
			values.push(s === seriesCount - 1 ? rest / (seriesCount - 1) : rest / (seriesCount - 1));
		}
		return { label, values };
	});
}

export interface RankedItem {
	label: string;
	value: number;
	count: number;
}

/** Long-tail ranked list — the "size by top-level folder" bar list. */
export function ranked(labels: string[], opts: { seed?: number; top?: number } = {}): RankedItem[] {
	const { seed = 1, top = 62_000_000_000 } = opts;
	const r = rng(seed);
	let v = top;
	return labels.map((label) => {
		const value = v;
		v *= between(r, 0.02, 0.55);
		return { label, value, count: Math.round(value / between(r, 20_000, 90_000)) };
	});
}

export interface TreeNode {
	name: string;
	value: number;
}

export function treeNodes(names: string[], opts: { seed?: number } = {}): TreeNode[] {
	const r = rng(opts.seed ?? 1);
	return names
		.map((name) => ({ name, value: between(r, 0.4, 70) }))
		.sort((a, b) => b.value - a.value);
}

/* ------------------------------------------------------------------ *
 * Formatting helpers — mono dashboards live or die on aligned numbers.
 * ------------------------------------------------------------------ */

export function fmtBytes(n: number): string {
	const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
	let i = 0;
	let v = n;
	while (v >= 1024 && i < units.length - 1) {
		v /= 1024;
		i++;
	}
	return `${v >= 100 ? v.toFixed(0) : v.toFixed(1)} ${units[i]}`;
}

export function fmtNum(n: number): string {
	return Math.round(n).toLocaleString('en-US');
}

export function fmtCompact(n: number): string {
	if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
	if (n >= 1000) return `${(n / 1000).toFixed(n >= 10_000 ? 0 : 1)}k`;
	return n.toFixed(0);
}

export const MONTHS = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
