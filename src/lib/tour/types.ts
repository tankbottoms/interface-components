/** One stop on a guided tour. */
export interface TourStep {
	/**
	 * CSS selector for the element the step is about. Resolved at run time, not
	 * at authoring time, so a step may point at something that only exists once
	 * a section has rendered — a missing target skips the step rather than
	 * breaking the tour.
	 */
	target: string;
	/** Short heading — five words at most; it sits at 11px. */
	title: string;
	/** One or two sentences. This is a caption, not documentation. */
	body: string;
	/** Which corner of the target the numbered marker pins to. */
	corner?: 'tl' | 'tr' | 'bl' | 'br';
	/** Preferred side for the popup; falls back when there is no room. */
	place?: 'top' | 'bottom' | 'left' | 'right';
}

export interface TourDefinition {
	/** Stable id — also the localStorage key suffix for "already offered". */
	id: string;
	/** Shown on the launcher badge and the popup's step counter. */
	name: string;
	steps: TourStep[];
	/**
	 * Seconds to wait on a first visit before offering the tour unprompted.
	 * `0` disables the offer; the launcher badge is always available regardless.
	 */
	offerAfter?: number;
}
