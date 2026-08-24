import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/environment';
import type { TourDefinition } from './types';

const SEEN_PREFIX = 'ifc-tour-seen:';

interface TourState {
	tour: TourDefinition | null;
	index: number;
	/** True while the "would you like a tour?" prompt is showing. */
	offering: boolean;
}

const initial: TourState = { tour: null, index: 0, offering: false };

export const tourState = writable<TourState>(initial);

export const tourActive = derived(tourState, ($s) => $s.tour !== null && !$s.offering);
export const currentStep = derived(tourState, ($s) =>
	$s.tour ? ($s.tour.steps[$s.index] ?? null) : null
);

/**
 * Has this visitor already been offered this tour? The flag is written the
 * moment the offer is *made*, not when the tour finishes — being asked twice is
 * the annoying part, and someone who dismissed the prompt has still been asked.
 */
export function tourSeen(id: string): boolean {
	if (!browser) return true;
	try {
		return localStorage.getItem(SEEN_PREFIX + id) === '1';
	} catch {
		return true;
	}
}

export function markTourSeen(id: string): void {
	if (!browser) return;
	try {
		localStorage.setItem(SEEN_PREFIX + id, '1');
	} catch {
		/* private mode — the offer simply repeats next visit */
	}
}

export function forgetTour(id: string): void {
	if (!browser) return;
	try {
		localStorage.removeItem(SEEN_PREFIX + id);
	} catch {
		/* ignore */
	}
}

/** Show the soft prompt rather than starting straight away. */
export function offerTour(tour: TourDefinition): void {
	if (get(tourState).tour) return;
	markTourSeen(tour.id);
	tourState.set({ tour, index: 0, offering: true });
}

export function startTour(tour: TourDefinition, index = 0): void {
	markTourSeen(tour.id);
	tourState.set({ tour, index, offering: false });
}

/** Accept a pending offer. */
export function acceptOffer(): void {
	tourState.update((s) => (s.tour ? { ...s, offering: false, index: 0 } : s));
}

export function endTour(): void {
	tourState.set(initial);
}

export function nextStep(): void {
	tourState.update((s) => {
		if (!s.tour) return s;
		if (s.index >= s.tour.steps.length - 1) return initial;
		return { ...s, index: s.index + 1 };
	});
}

export function prevStep(): void {
	tourState.update((s) => (s.tour ? { ...s, index: Math.max(0, s.index - 1) } : s));
}

export function goToStep(i: number): void {
	tourState.update((s) => {
		if (!s.tour) return s;
		return { ...s, index: Math.min(Math.max(0, i), s.tour.steps.length - 1), offering: false };
	});
}
