// Haptic feedback utility for magx panel components
// Uses Vibration API (Android Chrome, Samsung Internet, etc.)
// iOS Safari does not support the Vibration API — haptics are a no-op there.
// The hidden checkbox switch trick (Safari 17.4+) is unreliable in shadow DOM
// and programmatic contexts, so we skip it to avoid silent failures.

export class MagxHaptics {
    private static _canVibrate: boolean | null = null;
    private static _isMobile: boolean | null = null;

    static get isMobile(): boolean {
        if (this._isMobile === null) {
            this._isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        }
        return this._isMobile;
    }

    static get canVibrate(): boolean {
        if (this._canVibrate === null) {
            this._canVibrate = typeof navigator.vibrate === 'function';
        }
        return this._canVibrate;
    }

    private static _vibrate(pattern: number | number[]): void {
        if (this.canVibrate && this.isMobile) {
            try { navigator.vibrate(pattern); } catch {}
        }
    }

    static trigger(preset: 'light' | 'medium' | 'heavy' | 'success' | 'error' = 'light'): void {
        switch (preset) {
            case 'light':   this._vibrate(10); break;
            case 'medium':  this._vibrate(25); break;
            case 'heavy':   this._vibrate(50); break;
            case 'success': this._vibrate([15, 30, 15]); break;
            case 'error':   this._vibrate([30, 50, 30, 50, 30]); break;
        }
    }
}
