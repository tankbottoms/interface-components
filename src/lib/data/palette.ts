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
 * Deliberately no purple: amber leads, teal holds the links.
 *
 * `dark` is the value the accent takes on dark paper. Most of these are
 * mid-tone strokes that hold up on either ground and so carry no companion, but
 * amber cannot: the brand orange is 2.0:1 on the light sidebar and unreadable at
 * 10px, while the deepened amber that fixes that goes muddy on navy. One hue,
 * two luminances — same trade the pastels already make in theme.css.
 */
export const accentSwatches = [
	{ name: 'Amber', color: '#A86F08', dark: '#F5A312' },
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

export const DEFAULT_ACCENT = '#A86F08';
export const DEFAULT_ACCENT_DARK = '#F5A312';

/**
 * The dark-paper companion for a chosen accent, or the accent itself when it
 * does not need one. Matching is case-insensitive: the swatches are written in
 * caps, but a value round-tripped through localStorage or the DOM may not be.
 */
export function accentDark(color: string): string {
	const hit = accentSwatches.find((a) => a.color.toLowerCase() === color.trim().toLowerCase());
	return hit?.dark ?? color;
}
