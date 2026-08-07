import { css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { MagxPanelBaseElement } from './Panel-BaseElement';
import { MagxPanelConstants } from './Panel-Constants';
import { MagxHaptics } from './Haptics';

export type MagxButtonMode = 'momentary' | 'toggle' | 'countdown';

// Button element with an explicit, visible press contract.
//
// A flat button that only darkens on :active is ambiguous — you cannot tell it
// from a checkbox, and you cannot tell whether your press registered. Each mode
// below answers that differently:
//
//   momentary  press darkens, then releases back. The darken is held for a
//              minimum beat so a fast tap is still visible. Nothing persists.
//   toggle     press darkens and STAYS darkened, with an ON/OFF marker. This is
//              the mode that overlaps a checkbox conceptually — the difference
//              is that a toggle button is an action you leave engaged, where a
//              checkbox is a value you read back.
//   countdown  press darkens and the interior text is replaced by a ticking
//              countdown; when it reaches zero the button undarkens and the
//              original label returns. Use for "armed" destructive actions.
//
// A secondary action is available on every mode via long-press (500ms),
// right-click, or alt-click. When `secondary` is set the button renders a
// readout strip naming both actions and which one fired last.
@customElement(MagxPanelConstants.PANEL_BUTTON)
export class MagxPanelButton extends MagxPanelBaseElement {

    // momentary | toggle | countdown
    @property({type: String}) public mode: MagxButtonMode = 'momentary';

    // Countdown length in seconds (countdown mode only)
    @property({type: Number}) public seconds: number = 3;

    // Label for the secondary (long-press / alt-click / right-click) action.
    // When empty, no secondary action is offered and no readout is drawn.
    @property({type: String}) public secondary: string = '';

    // Force the readout strip on even without a secondary action
    @property({type: Boolean}) public readout: boolean = false;

    @state() private _on: boolean = false;
    @state() private _flash: boolean = false;
    @state() private _ticks: number = 0;
    @state() private _lastAction: string = '';

    private _pressTimer: number | null = null;
    private _tickTimer: number | null = null;
    private _flashTimer: number | null = null;
    private _wasLong: boolean = false;

    constructor() {
        super();
    }

    // --- primary -----------------------------------------------------------

    // iOS haptic comes from the real switch toggle (the user's own touch).
    // Android falls back to navigator.vibrate() via MagxHaptics.
    private _clicked(e: Event): void {
        const sw = e.target as HTMLInputElement;
        requestAnimationFrame(() => { sw.checked = false; });

        // A long press already fired the secondary action; swallow the click.
        if (this._wasLong) {
            this._wasLong = false;
            return;
        }
        if (!MagxHaptics.isIOS && MagxHaptics.isMobile) {
            MagxHaptics.trigger('medium');
        }
        this._fire('primary');
    }

    private _fire(action: 'primary' | 'secondary'): void {
        this._lastAction = action;

        if (action === 'secondary') {
            // Secondary never changes mode state — it is an escape hatch.
            this._pulse();
            this._notifyOnValueChange();
            return;
        }

        if (this.mode === 'toggle') {
            this._on = !this._on;
        } else if (this.mode === 'countdown') {
            this._startCountdown();
        } else {
            this._pulse();
        }
        this._notifyOnValueChange();
    }

    // Hold the darkened state long enough to actually be seen.
    private _pulse(): void {
        this._flash = true;
        if (this._flashTimer !== null) clearTimeout(this._flashTimer);
        this._flashTimer = window.setTimeout(() => {
            this._flash = false;
            this._flashTimer = null;
        }, 220);
    }

    private _startCountdown(): void {
        if (this._ticks > 0) return;
        this._ticks = Math.max(1, Math.round(this.seconds));
        if (this._tickTimer !== null) clearInterval(this._tickTimer);
        this._tickTimer = window.setInterval(() => {
            this._ticks -= 1;
            if (this._ticks <= 0) {
                if (this._tickTimer !== null) clearInterval(this._tickTimer);
                this._tickTimer = null;
                this._ticks = 0;
                MagxHaptics.trigger('light');
                this._lastAction = 'elapsed';
                this._notifyOnValueChange();
            }
        }, 1000);
    }

    // --- secondary ---------------------------------------------------------

    private _pointerdown(e: PointerEvent): void {
        this.doNotRemoveSelected = true;
        if (!this.secondary) return;
        if (e.altKey || e.button === 2) return; // handled by _context/_clickAlt
        this._wasLong = false;
        this._pressTimer = window.setTimeout(() => {
            this._wasLong = true;
            this._pressTimer = null;
            MagxHaptics.trigger('heavy');
            this._fire('secondary');
        }, 500);
    }

    private _pointerup(): void {
        this.doNotRemoveSelected = false;
        if (this._pressTimer !== null) {
            clearTimeout(this._pressTimer);
            this._pressTimer = null;
        }
    }

    // The tab stop is the label, not the hidden switch inside it.
    //
    // That switch exists only because iOS fires a native haptic when a real
    // <label> toggles a real switch — it is a haptic transport, not a control,
    // and it carries no focus ring, so leaving it as the tab stop meant the
    // button could be focused with no way to see that it was. The label takes
    // the focus and forwards the keys.
    //
    // Space and Enter both fire the primary action, as they do on a native
    // <button>. Holding either fires the secondary action, mirroring the
    // long-press: keydown repeats while a key is held, so the first repeat is
    // the signal that this is a hold rather than a tap.
    private _keydown(e: KeyboardEvent): void {
        if (e.key !== ' ' && e.key !== 'Enter') { return; }
        e.preventDefault();

        if (e.repeat) {
            if (!this.secondary || this._wasLong) { return; }
            this._wasLong = true;
            MagxHaptics.trigger('heavy');
            this._fire('secondary');
            return;
        }
        if (this._wasLong) { return; }
        MagxHaptics.trigger('medium');
        this._fire('primary');
    }

    // A hold that fired the secondary action must not also fire the primary one
    // when the key comes back up.
    private _keyup(): void {
        this._wasLong = false;
    }

    private _context(e: Event): void {
        if (!this.secondary) return;
        e.preventDefault();
        this._wasLong = true;
        this._fire('secondary');
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();
        if (this._pressTimer !== null) clearTimeout(this._pressTimer);
        if (this._tickTimer !== null) clearInterval(this._tickTimer);
        if (this._flashTimer !== null) clearTimeout(this._flashTimer);
    }

    // --- render ------------------------------------------------------------

    render() {
        const busy = this._ticks > 0;
        const dark = this._flash || busy || (this.mode === 'toggle' && this._on);
        const label = busy ? `${this._ticks}` : this.title;
        const showReadout = this.readout || !!this.secondary;

        return html`
            <div class="container_base" id="container">
                <label id=${this.id} class="button ${dark ? 'is-dark' : ''} ${busy ? 'is-busy' : ''}"
                    tabindex="0" role="button"
                    aria-pressed=${this.mode === 'toggle' ? String(this._on) : 'undefined'}
                    @keydown=${this._keydown} @keyup=${this._keyup}
                    @blur=${this._removeFocus} @focus=${this._addFocus}
                    @pointerdown=${this._pointerdown} @pointerup=${this._pointerup}
                    @pointercancel=${this._pointerup} @pointerleave=${this._pointerup}
                    @contextmenu=${this._context}>
                    <input type="checkbox" switch tabindex="-1" aria-hidden="true" class="haptic-switch" @change=${this._clicked} />
                    <span class="button-text">${label}</span>
                    ${this.mode === 'toggle'
                        ? html`<span class="mark">${this._on ? 'ON' : 'OFF'}</span>`
                        : ''}
                    ${busy ? html`<span class="mark">HOLD</span>` : ''}
                </label>
                ${showReadout ? html`
                    <div class="readout">
                        <span class="ro ${this._lastAction === 'primary' ? 'hot' : ''}">
                            <b>TAP</b> ${this.title || 'primary'}
                        </span>
                        ${this.secondary ? html`
                            <span class="ro ${this._lastAction === 'secondary' ? 'hot' : ''}">
                                <b>HOLD</b> ${this.secondary}
                            </span>` : ''}
                        <span class="ro last">${this._lastAction || 'idle'}</span>
                    </div>` : ''}
            </div>
        `;
    }

    static styles = [MagxPanelBaseElement._baseStyle, css`
        .button {
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            width: 100%;
            background-color: var(--magx-panel-button-bg);
            color: var(--magx-panel-text-color);
            height: var(--magx-panel-button-height);
            border: var(--magx-panel-button-border);
            font: var(--magx-panel-font);
            cursor: pointer;
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
            user-select: none;
            -webkit-user-select: none;
            box-sizing: border-box;
            transition: background-color 120ms linear, filter 120ms linear;
        }

        .button:hover {
            background-color: var(--magx-panel-button-bg-active);
        }

        /* The held-down look. Darker than :active and it persists for as long
           as the mode says it should, so state is legible without motion. */
        .button.is-dark {
            background-color: var(--magx-panel-button-bg-active);
            filter: brightness(0.72);
        }

        .button.is-busy {
            cursor: progress;
            font-variant-numeric: tabular-nums;
        }

        .button:active {
            background-color: var(--magx-panel-button-bg-active);
            filter: brightness(0.72);
        }

        @media (prefers-reduced-motion: reduce) {
            .button { transition: none; }
        }

        .haptic-switch {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            opacity: 0.01;
            appearance: auto;
            cursor: pointer;
            touch-action: manipulation;
        }

        .button-text {
            position: relative;
            z-index: 0;
            pointer-events: none;
        }

        .mark {
            position: absolute;
            right: 6px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 9px;
            letter-spacing: 0.1em;
            opacity: 0.8;
            pointer-events: none;
        }

        .readout {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            margin-top: 4px;
            font: var(--magx-panel-font);
            font-size: 9px;
            letter-spacing: 0.04em;
        }

        .ro {
            opacity: 0.55;
            white-space: nowrap;
        }

        .ro b {
            opacity: 0.9;
            letter-spacing: 0.1em;
        }

        .ro.hot {
            opacity: 1;
            text-decoration: underline;
        }

        .ro.last {
            margin-left: auto;
            opacity: 0.75;
            text-transform: uppercase;
        }
    `];

    // Toggle mode reports its engaged state; the others report the last action
    // that fired, so a listener can tell primary from secondary.
    getValue(): any {
        if (this.mode === 'toggle') return this._on;
        if (this.mode === 'countdown') return this._ticks;
        return this._lastAction || null;
    }

    setValue(val: any): void {
        if (this.mode === 'toggle') {
            this._on = !!val;
        }
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "magx-panel-button": MagxPanelButton
    }
}
