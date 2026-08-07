/**
 * Interface Components palette.
 *
 * Two sources are blended here:
 *  1. "8 Elegant Pastels" — the supplied swatch sheet.
 *  2. The atsignhandle house style (postcrime / gpumon / seaweed-stats / house)
 *     — cream paper, ink rules, muted pastel category fills.
 *
 * Pastels are *fills*. They are far too light to carry text or 1px strokes, so
 * every fill is paired with a `stroke` (a darkened, same-hue companion) used for
 * chart lines, borders and legend keys. That pairing is what keeps the charts
 * readable in both light and dark themes.
 */

export interface Swatch {
	/** Human label shown in the picker / palette page. */
	name: string;
	/** Pastel fill — areas, bars, badge backgrounds. */
	fill: string;
	/** Darkened companion — lines, strokes, legend keys, text on pastel. */
	stroke: string;
	/** CSS custom property name (without the leading `--`). */
	token: string;
	/** Where the colour came from. */
	origin: 'pastels' | 'house' | 'postcrime' | 'gpumon';
}

/** The supplied "8 Elegant Pastels" sheet, in sheet order. */
export const elegantPastels: Swatch[] = [
	{ name: 'Orchid Mist', fill: '#F4E1FC', stroke: '#9A6BB0', token: 'pastel-orchid', origin: 'pastels' },
	{ name: 'Violet', fill: '#F0BEFA', stroke: '#A855C4', token: 'pastel-violet', origin: 'pastels' },
	{ name: 'Peach', fill: '#FCDCC7', stroke: '#C97E45', token: 'pastel-peach', origin: 'pastels' },
	{ name: 'Vanilla', fill: '#FCF7DC', stroke: '#B39B3C', token: 'pastel-vanilla', origin: 'pastels' },
	{ name: 'Blush', fill: '#FFE6E6', stroke: '#C77070', token: 'pastel-blush', origin: 'pastels' },
	{ name: 'Rose', fill: '#FFC2D0', stroke: '#C75F81', token: 'pastel-rose', origin: 'pastels' },
	{ name: 'Aqua', fill: '#AFEFFD', stroke: '#2E8FA6', token: 'pastel-aqua', origin: 'pastels' },
	{ name: 'Mint', fill: '#E0FFF1', stroke: '#3E9B72', token: 'pastel-mint', origin: 'pastels' }
];

/**
 * House-style pastels carried over from the reference dashboards so charts
 * ported from them keep their category identity.
 */
export const housePastels: Swatch[] = [
	{ name: 'Indigo', fill: '#BDBEDC', stroke: '#6E6FA8', token: 'pastel-indigo', origin: 'gpumon' },
	{ name: 'Cyan', fill: '#80DEEA', stroke: '#3792A4', token: 'pastel-cyan', origin: 'gpumon' },
	{ name: 'Green', fill: '#A5D6A7', stroke: '#5E9463', token: 'pastel-green', origin: 'gpumon' },
	{ name: 'Amber', fill: '#FFD54F', stroke: '#B08A2A', token: 'pastel-amber', origin: 'gpumon' },
	{ name: 'Coral', fill: '#EF9A9A', stroke: '#C06060', token: 'pastel-coral', origin: 'gpumon' },
	{ name: 'Lilac', fill: '#D1C4E9', stroke: '#7E63B0', token: 'pastel-lilac', origin: 'postcrime' },
	{ name: 'Teal', fill: '#B2DFDB', stroke: '#3E8F86', token: 'pastel-teal', origin: 'gpumon' },
	{ name: 'Lime', fill: '#D4F1A8', stroke: '#6F9435', token: 'pastel-lime', origin: 'postcrime' }
];

/** Everything, for the palette reference page. */
export const allSwatches: Swatch[] = [...elegantPastels, ...housePastels];

/**
 * Ordered categorical series for charts — the eight elegant pastels, reordered
 * so neighbouring series never share a hue family. That reordering is the single
 * biggest legibility win in a stacked or multi-line chart, and it is why the
 * series order is not simply the palette order: aqua, rose, vanilla and mint
 * lead because they are the four most separable hues in the set.
 */
export const chartSeries: Swatch[] = [
	elegantPastels[6], // aqua
	elegantPastels[5], // rose
	elegantPastels[3], // vanilla
	elegantPastels[7], // mint
	elegantPastels[2], // peach
	elegantPastels[1], // violet
	elegantPastels[4], // blush
	elegantPastels[0] // orchid
];

/** Semantic status colours (ok / warn / crit / idle), house-style. */
export const statusColors = {
	ok: { fill: '#A5D6A7', stroke: '#5E9463' },
	warn: { fill: '#FFD54F', stroke: '#B08A2A' },
	crit: { fill: '#EF9A9A', stroke: '#C06060' },
	idle: { fill: '#BDBEDC', stroke: '#6E6FA8' }
} as const;

/**
 * Site highlight options offered in the header picker. These are *strokes*, not
 * pastel fills — an accent has to survive being 1px of text on paper.
 * Deliberately no purple: teal leads.
 */
export const accentSwatches = [
	{ name: 'Teal', color: '#3792A4' },
	{ name: 'Deep Aqua', color: '#2E8FA6' },
	{ name: 'Pine', color: '#3E8F86' },
	{ name: 'Moss', color: '#5E9463' },
	{ name: 'Olive', color: '#6F9435' },
	{ name: 'Ochre', color: '#B08A2A' },
	{ name: 'Clay', color: '#C97E45' },
	{ name: 'Terracotta', color: '#C06060' },
	{ name: 'Raspberry', color: '#C75F81' },
	{ name: 'Slate Blue', color: '#4A72B0' },
	{ name: 'Indigo', color: '#6E6FA8' },
	{ name: 'Graphite', color: '#4A4A46' }
];

export const DEFAULT_ACCENT = '#3792A4';

/**
 * The three accents the site picks between on load — rose, aqua and mint from
 * the eight elegant pastels, in their stroke form so they can hold a link or a
 * 1px rule. Rotating on load keeps the palette feeling alive without letting the
 * page land on something illegible; a saved preference always wins over this.
 */
export const loadAccents = [
	{ name: 'Rose', color: '#C75F81', token: 'rose' },
	{ name: 'Aqua', color: '#2E8FA6', token: 'aqua' },
	{ name: 'Mint', color: '#3E9B72', token: 'mint' }
] as const;

/** Picks one of the three load accents at random. */
export function randomLoadAccent(): string {
	return loadAccents[Math.floor(Math.random() * loadAccents.length)].color;
}
