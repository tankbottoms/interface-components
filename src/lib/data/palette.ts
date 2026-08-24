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
 * Site highlight options offered in the header picker.
 *
 * These are the eight elegant pastels *in chart-series order* — the same eight,
 * in the same sequence, that section 04 of the palette page publishes as
 * `--chart-1` … `--chart-8`. One ordered set of hues now drives both the charts
 * and the site chrome, so the accent a reader picks is always a colour they
 * have already seen carrying data on the page.
 *
 * The value taken is the **stroke**, not the pastel fill: an accent has to
 * survive being 1px of 10px text on paper, and the fills are far too light for
 * that. `dark` is the companion the accent takes on dark paper — the same hue
 * lifted in luminance, because the strokes that read on cream go muddy on navy.
 * One hue, two luminances — the same trade the pastels already make in
 * theme.css.
 */
export const accentSwatches = [
	{ name: 'Aqua', color: '#2E8FA6', dark: '#67C9E0' },
	{ name: 'Rose', color: '#C75F81', dark: '#EE9AB4' },
	{ name: 'Vanilla', color: '#B39B3C', dark: '#E3C86A' },
	{ name: 'Mint', color: '#3E9B72', dark: '#6FD6A6' },
	{ name: 'Peach', color: '#C97E45', dark: '#EDA875' },
	{ name: 'Violet', color: '#A855C4', dark: '#D49AE6' },
	{ name: 'Blush', color: '#C77070', dark: '#EDA1A1' },
	{ name: 'Orchid', color: '#9A6BB0', dark: '#C6A2DA' }
];

/** Every accent the picker will accept, lower-cased, for migrating a stored value. */
export const accentValues = new Set(accentSwatches.map((a) => a.color.toLowerCase()));

/** Mint — series 04, and the colour the site opens on. */
export const DEFAULT_ACCENT = '#3E9B72';
export const DEFAULT_ACCENT_DARK = '#6FD6A6';

/**
 * The dark-paper companion for a chosen accent, or the accent itself when it
 * does not need one. Matching is case-insensitive: the swatches are written in
 * caps, but a value round-tripped through localStorage or the DOM may not be.
 */
export function accentDark(color: string): string {
	const hit = accentSwatches.find((a) => a.color.toLowerCase() === color.trim().toLowerCase());
	return hit?.dark ?? color;
}
