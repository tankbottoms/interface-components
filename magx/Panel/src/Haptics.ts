// Haptic feedback utility for magx panel components
// Dual-platform: iOS Safari (checkbox switch rAF toggle) + Android (PWM vibrate)
// Ported from atsignhandle.xyz production haptics engine.
// Reference: https://github.com/lochie/web-haptics

interface Vibration {
    duration: number;
    intensity: number;
    delay?: number;
}

interface HapticPreset {
    pattern: Vibration[];
}

const TOGGLE_MIN = 16;   // ms at intensity 1.0 (every frame)
const TOGGLE_MAX = 184;  // range above min
const PWM_CYCLE = 20;    // ms per PWM cycle for Android

const PRESETS: Record<string, HapticPreset> = {
    light:     { pattern: [{ duration: 30, intensity: 0.5 }, { duration: 20, intensity: 0.3, delay: 30 }] },
    medium:    { pattern: [{ duration: 50, intensity: 0.8 }, { duration: 40, intensity: 0.6, delay: 40 }] },
    heavy:     { pattern: [{ duration: 70, intensity: 1.0 }, { duration: 60, intensity: 1.0, delay: 30 }, { duration: 50, intensity: 0.8, delay: 30 }] },
    success:   { pattern: [{ duration: 60, intensity: 0.7 }, { duration: 80, intensity: 1.0, delay: 40 }, { duration: 40, intensity: 0.5, delay: 40 }] },
    error:     { pattern: [{ duration: 60, intensity: 1.0 }, { duration: 60, intensity: 1.0, delay: 30 }, { duration: 60, intensity: 1.0, delay: 30 }, { duration: 80, intensity: 0.8, delay: 30 }, { duration: 40, intensity: 0.5, delay: 30 }] },
    selection: { pattern: [{ duration: 15, intensity: 0.5 }, { duration: 15, intensity: 0.3, delay: 20 }] },
};

export class MagxHaptics {
    private static _hapticLabel: HTMLLabelElement | null = null;
    private static _isIOS: boolean | null = null;
    private static _isAndroid: boolean | null = null;
    private static _isMobile: boolean | null = null;

    static get isIOS(): boolean {
        if (this._isIOS === null) {
            this._isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        }
        return this._isIOS;
    }

    static get isAndroid(): boolean {
        if (this._isAndroid === null) {
            this._isAndroid = /Android/.test(navigator.userAgent);
        }
        return this._isAndroid;
    }

    static get isMobile(): boolean {
        if (this._isMobile === null) {
            this._isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        }
        return this._isMobile;
    }

    // Create hidden checkbox switch for iOS haptics.
    // Label wraps checkbox — clicking label toggles the switch, triggering native haptic.
    // opacity: 0.01 (not 0) + appearance: auto required for Safari to fire haptics.
    private static _ensureHapticElement(): void {
        if (this._hapticLabel) return;
        const label = document.createElement('label');
        label.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0.01;overflow:hidden;z-index:-1;';
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.setAttribute('switch', '');
        cb.style.cssText = 'position:absolute;width:1px;height:1px;opacity:0.01;appearance:auto;';
        label.appendChild(cb);
        document.body.appendChild(label);
        this._hapticLabel = label;
    }

    // iOS: rAF loop toggling the checkbox at rate proportional to intensity
    private static _runIOSPattern(vibrations: Vibration[]): void {
        this._ensureHapticElement();
        if (!this._hapticLabel) return;

        const phases: { start: number; end: number; type: 'pause' | 'vibrate'; intensity: number }[] = [];
        let offset = 0;
        for (const v of vibrations) {
            const delay = v.delay || 0;
            const intensity = Math.max(0, Math.min(1, v.intensity));
            if (delay > 0) {
                phases.push({ start: offset, end: offset + delay, type: 'pause', intensity: 0 });
                offset += delay;
            }
            phases.push({ start: offset, end: offset + v.duration, type: 'vibrate', intensity });
            offset += v.duration;
        }

        const totalDuration = offset;
        let startTime: number | null = null;
        let lastToggleTime = 0;
        const label = this._hapticLabel;

        function runFrame(time: number) {
            if (!startTime) startTime = time;
            const elapsed = time - startTime;
            if (elapsed >= totalDuration) return;

            let currentPhase: typeof phases[0] | null = null;
            for (const p of phases) {
                if (elapsed >= p.start && elapsed < p.end) { currentPhase = p; break; }
            }

            if (currentPhase && currentPhase.type === 'vibrate') {
                const toggleInterval = TOGGLE_MIN + TOGGLE_MAX * (1 - currentPhase.intensity);
                if (time - lastToggleTime >= toggleInterval || lastToggleTime === 0) {
                    label.click();
                    lastToggleTime = time;
                }
            }

            requestAnimationFrame(runFrame);
        }

        // Initial click immediately (within user gesture context)
        label.click();
        lastToggleTime = performance.now();
        requestAnimationFrame(runFrame);
    }

    // Android: PWM-modulated vibrate pattern for intensity control
    private static _modulateVibration(duration: number, intensity: number): number[] {
        if (intensity >= 1) return [duration];
        if (intensity <= 0) return [];
        const onTime = Math.max(1, Math.round(PWM_CYCLE * intensity));
        const offTime = PWM_CYCLE - onTime;
        const result: number[] = [];
        let remaining = duration;
        while (remaining >= PWM_CYCLE) {
            result.push(onTime, offTime);
            remaining -= PWM_CYCLE;
        }
        if (remaining > 0) {
            const remOn = Math.max(1, Math.round(remaining * intensity));
            result.push(remOn);
            const remOff = remaining - remOn;
            if (remOff > 0) result.push(remOff);
        }
        return result;
    }

    private static _toVibratePattern(vibrations: Vibration[]): number[] {
        const result: number[] = [];
        for (const v of vibrations) {
            const intensity = Math.max(0, Math.min(1, v.intensity));
            const delay = v.delay || 0;
            if (delay > 0) {
                if (result.length > 0 && result.length % 2 === 0) {
                    result[result.length - 1] += delay;
                } else {
                    if (result.length === 0) result.push(0);
                    result.push(delay);
                }
            }
            const modulated = this._modulateVibration(v.duration, intensity);
            if (modulated.length === 0) {
                if (result.length > 0 && result.length % 2 === 0) {
                    result[result.length - 1] += v.duration;
                } else if (v.duration > 0) {
                    result.push(0, v.duration);
                }
                continue;
            }
            result.push(...modulated);
        }
        return result;
    }

    private static _triggerDirect(vibrations: Vibration[]): void {
        if (!vibrations.length || !this.isMobile) return;

        // Android: navigator.vibrate with PWM intensity
        if (typeof navigator.vibrate === 'function') {
            try { navigator.vibrate(this._toVibratePattern(vibrations)); } catch {}
        }

        // iOS: rAF checkbox toggle loop
        if (this.isIOS) {
            this._runIOSPattern(vibrations);
        }
    }

    static trigger(preset: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'selection' = 'light'): void {
        const p = PRESETS[preset];
        if (p) this._triggerDirect(p.pattern);
    }
}
