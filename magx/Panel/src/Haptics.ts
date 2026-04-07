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

    // Debug overlay — shows haptic events on-screen for mobile debugging
    private static _debugEl: HTMLElement | null = null;
    private static _debugLines: string[] = [];
    static DEBUG = false;

    private static _getIOSVersion(): string {
        const m = navigator.userAgent.match(/OS (\d+)[_.](\d+)/);
        if (m) return `${m[1]}.${m[2]}`;
        return 'unknown';
    }

    private static _debug(msg: string): void {
        if (!this.DEBUG) return;
        console.warn(`[MagxHaptics] ${msg}`);
        const ts = String(Date.now() % 100000).padStart(5, '0');
        this._debugLines.push(`${ts} ${msg}`);
        if (this._debugLines.length > 20) this._debugLines.shift();
        if (!this._debugEl && typeof document !== 'undefined') {
            const wrap = document.createElement('div');
            wrap.id = 'haptic-debug';
            wrap.style.cssText = 'position:fixed;bottom:0;left:0;right:0;background:rgba(0,0,0,0.94);color:#0f0;font:10px/1.4 monospace;padding:6px 8px;z-index:99999;max-height:40vh;overflow-y:auto;-webkit-overflow-scrolling:touch;white-space:pre;';

            // iOS version + diagnostic banner
            const iosVer = this._getIOSVersion();
            const ua = navigator.userAgent;
            const isStandalone = (navigator as any).standalone === true;
            const isWKWebView = !ua.includes('Safari/') || ua.includes('CriOS') || ua.includes('FxiOS');
            const banner = document.createElement('div');
            banner.style.cssText = 'color:#ff0;margin-bottom:6px;font:bold 10px monospace;border-bottom:1px solid #333;padding-bottom:4px;';
            banner.textContent = `iOS ${iosVer} | ${isWKWebView ? 'WKWebView (NO haptics)' : 'Safari'} | ${isStandalone ? 'PWA' : 'browser'} | switch haptic requires iOS 18+`;
            wrap.appendChild(banner);

            // Button bar
            const bar = document.createElement('div');
            bar.style.cssText = 'display:flex;gap:6px;align-items:center;margin-bottom:6px;flex-wrap:wrap;';

            // Real visible switch
            const switchLabel = document.createElement('label');
            switchLabel.style.cssText = 'display:flex;align-items:center;gap:4px;color:#ff0;font:bold 11px monospace;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent;';
            const switchCb = document.createElement('input');
            switchCb.type = 'checkbox';
            switchCb.setAttribute('switch', '');
            switchCb.style.cssText = 'appearance:auto;width:44px;height:24px;opacity:1;cursor:pointer;touch-action:manipulation;';
            switchCb.addEventListener('change', () => {
                this._debug(`>> REAL SWITCH tapped: checked=${switchCb.checked}`);
            });
            switchLabel.appendChild(switchCb);
            switchLabel.appendChild(document.createTextNode('TAP'));

            // ios-haptics style: create fresh element per call
            const freshBtn = document.createElement('button');
            freshBtn.textContent = 'FRESH';
            freshBtn.style.cssText = 'background:#222;color:#0f0;border:1px solid #0f0;font:bold 10px monospace;padding:4px 8px;cursor:pointer;touch-action:manipulation;';
            freshBtn.addEventListener('click', () => {
                this._debug('>> FRESH: create+toggle+destroy (ios-haptics style)');
                const l = document.createElement('label');
                l.style.cssText = 'position:fixed;top:-100px;left:-100px;';
                const c = document.createElement('input');
                c.type = 'checkbox';
                c.setAttribute('switch', '');
                c.style.cssText = 'appearance:auto;opacity:0.01;';
                l.appendChild(c);
                document.body.appendChild(l);
                l.click();
                this._debug(`>> FRESH: toggled ${c.checked}`);
                requestAnimationFrame(() => {
                    l.click();
                    this._debug(`>> FRESH: 2nd toggle ${c.checked}`);
                    setTimeout(() => l.remove(), 50);
                });
            });

            // Select all debug text
            const copyBtn = document.createElement('button');
            copyBtn.textContent = 'SELECT ALL';
            copyBtn.style.cssText = 'background:#222;color:#0f0;border:1px solid #0f0;font:bold 10px monospace;padding:4px 8px;cursor:pointer;touch-action:manipulation;';
            copyBtn.addEventListener('click', () => {
                const log = document.getElementById('haptic-debug-log');
                if (log && window.getSelection) {
                    const range = document.createRange();
                    range.selectNodeContents(log);
                    const sel = window.getSelection()!;
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
            });

            bar.appendChild(switchLabel);
            bar.appendChild(freshBtn);
            bar.appendChild(copyBtn);
            wrap.appendChild(bar);

            const log = document.createElement('div');
            log.id = 'haptic-debug-log';
            log.style.cssText = '-webkit-user-select:text;user-select:text;';
            wrap.appendChild(log);
            document.body.appendChild(wrap);
            this._debugEl = log;
        }
        if (this._debugEl) this._debugEl.textContent = this._debugLines.join('\n');
    }

    static get isIOS(): boolean {
        if (this._isIOS === null) {
            const ua = navigator.userAgent;
            const plat = navigator.platform;
            const tp = navigator.maxTouchPoints;
            this._isIOS = /iPad|iPhone|iPod/.test(ua) ||
                (plat === 'MacIntel' && tp > 1);
            this._debug(`isIOS=${this._isIOS} ua=${ua.slice(0,60)} plat=${plat} tp=${tp}`);
        }
        return this._isIOS;
    }

    static get isAndroid(): boolean {
        if (this._isAndroid === null) {
            this._isAndroid = /Android/.test(navigator.userAgent);
            this._debug(`isAndroid=${this._isAndroid}`);
        }
        return this._isAndroid;
    }

    static get isMobile(): boolean {
        if (this._isMobile === null) {
            const hasTouch = 'ontouchstart' in window;
            const tp = navigator.maxTouchPoints;
            this._isMobile = hasTouch || tp > 0;
            this._debug(`isMobile=${this._isMobile} ontouchstart=${hasTouch} maxTP=${tp}`);
        }
        return this._isMobile;
    }

    // Create hidden checkbox switch for iOS haptics.
    // Label wraps checkbox — clicking label toggles the switch, triggering native haptic.
    // opacity: 0.01 (not 0) + appearance: auto required for Safari to fire haptics.
    private static _ensureHapticElement(): void {
        if (this._hapticLabel) {
            this._debug('haptic element: already exists');
            return;
        }
        const label = document.createElement('label');
        label.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0.01;overflow:hidden;z-index:-1;';
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.setAttribute('switch', '');
        cb.style.cssText = 'position:absolute;width:1px;height:1px;opacity:0.01;appearance:auto;';
        cb.addEventListener('change', () => {
            this._debug(`checkbox toggled: checked=${cb.checked}`);
        });
        label.appendChild(cb);
        document.body.appendChild(label);
        this._hapticLabel = label;
        this._debug(`haptic element CREATED, in DOM=${document.body.contains(label)}`);
    }

    // iOS: rAF loop toggling the checkbox at rate proportional to intensity
    private static _runIOSPattern(vibrations: Vibration[]): void {
        this._ensureHapticElement();
        if (!this._hapticLabel) {
            this._debug('iOS: ABORT — no haptic label after ensure');
            return;
        }

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
        let clickCount = 0;
        const label = this._hapticLabel;
        const self = this;

        function runFrame(time: number) {
            if (!startTime) startTime = time;
            const elapsed = time - startTime;
            if (elapsed >= totalDuration) {
                self._debug(`iOS: pattern done, ${clickCount} clicks`);
                return;
            }

            let currentPhase: typeof phases[0] | null = null;
            for (const p of phases) {
                if (elapsed >= p.start && elapsed < p.end) { currentPhase = p; break; }
            }

            if (currentPhase && currentPhase.type === 'vibrate') {
                const toggleInterval = TOGGLE_MIN + TOGGLE_MAX * (1 - currentPhase.intensity);
                if (time - lastToggleTime >= toggleInterval || lastToggleTime === 0) {
                    label.click();
                    clickCount++;
                    lastToggleTime = time;
                }
            }

            requestAnimationFrame(runFrame);
        }

        // Initial click immediately (within user gesture context)
        const cb = label.querySelector('input') as HTMLInputElement;
        const beforeState = cb?.checked;
        this._debug(`iOS: starting pattern, ${phases.length} phases, ${totalDuration}ms, cb=${beforeState}`);
        label.click();
        clickCount++;
        this._debug(`iOS: initial click done, cb=${beforeState}->${cb?.checked}`);
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
        this._debug(`_triggerDirect: ${vibrations.length} vibrations, isMobile=${this.isMobile}`);
        if (!vibrations.length) {
            this._debug('ABORT: no vibrations');
            return;
        }
        if (!this.isMobile) {
            this._debug('ABORT: not mobile');
            return;
        }

        // Android: navigator.vibrate with PWM intensity
        const canVibrate = typeof navigator.vibrate === 'function';
        this._debug(`vibrate API: ${canVibrate}`);
        if (canVibrate) {
            try {
                const pattern = this._toVibratePattern(vibrations);
                this._debug(`vibrate pattern: [${pattern.slice(0,6).join(',')}${pattern.length > 6 ? '...' : ''}]`);
                navigator.vibrate(pattern);
            } catch (e: any) {
                this._debug(`vibrate ERROR: ${e?.message || e}`);
            }
        }

        // iOS: rAF checkbox toggle loop
        this._debug(`isIOS=${this.isIOS} isAndroid=${this.isAndroid}`);
        if (this.isIOS) {
            this._runIOSPattern(vibrations);
        }
    }

    static trigger(preset: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'selection' = 'light'): void {
        this._debug(`trigger('${preset}')`);
        const p = PRESETS[preset];
        if (p) {
            this._triggerDirect(p.pattern);
        } else {
            this._debug(`ABORT: unknown preset '${preset}'`);
        }
    }
}
