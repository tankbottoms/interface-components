import { css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { MagxPanelBaseElement } from './Panel-BaseElement';
import { MagxPanelConstants } from './Panel-Constants';
import { MagxHaptics } from './Haptics';

// Square left-to-right sliding toggle switch.
//
// Deliberately shares the checkbox palette (--magx-panel-checkbox /
// --magx-panel-checkbox-checked) so the two read as one family: the checkbox
// answers "is this set?", the toggle answers "is this running?". The knob is
// square, not round, to stay inside the panel's hard-edged geometry.
@customElement(MagxPanelConstants.PANEL_TOGGLE)
export class MagxPanelToggle extends MagxPanelBaseElement {
    @property({type: Boolean}) public _checked: boolean = false;

    // Optional labels shown in place of the title once state is known
    @property({type: String}) public labelOn: string = '';
    @property({type: String}) public labelOff: string = '';

    private _input: HTMLInputElement | null = null;

    set checked(val: boolean) {
        if (this._checked !== val && this._input !== null) {
            const oldVal = this._checked;
            this._checked = val;
            this.requestUpdate('checked', oldVal);
            this._notifyOnValueChange();
        }
    }

    @property()
    get checked() { return this._checked; }

    constructor() {
        super();
    }

    private _valueChanged(): void {
        this._checked = this._input?.checked ?? false;
        MagxHaptics.trigger(this._checked ? 'medium' : 'light');
        this._notifyOnValueChange();
    }

    private _mousedown(): void { this.doNotRemoveSelected = true; }
    private _mouseup(): void { this.doNotRemoveSelected = false; }

    // Haptic overlay: same technique as the checkbox. Tapping the label toggles
    // a real <input switch>, which is what makes iOS fire the Taptic Engine.
    private _hapticTap(e: Event): void {
        const sw = e.target as HTMLInputElement;
        requestAnimationFrame(() => { sw.checked = false; });
        const real = this.shadowRoot?.getElementById(this.id) as HTMLInputElement;
        if (real) {
            real.checked = !real.checked;
            real.dispatchEvent(new Event('change'));
        }
    }

    render() {
        const state = this.checked
            ? (this.labelOn || 'ON')
            : (this.labelOff || 'OFF');
        return html`
            <div class="container_base" id="container" @mousedown=${this._mousedown} @mouseup=${this._mouseup}>
                <label class="toggle_label">${this.title}</label>
                <label class="toggle">
                    <input id="${this.id}" type="checkbox" .checked=${this.checked}
                        @change=${this._valueChanged} @blur=${this._removeFocus} @focus=${this._addFocus} />
                    <span class="track"><span class="knob"></span></span>
                </label>
                <span class="state">${state}</span>
                <label class="haptic-overlay"><input type="checkbox" switch class="haptic-switch" @change=${this._hapticTap} /></label>
            </div>
        `;
    }

    firstUpdated(): void {
        super.firstUpdated();
        this._input = this.shadowRoot?.getElementById(`${this.id}`) as HTMLInputElement;
        this.checked = this.getAttribute('checked') !== null;
    }

    static styles = [MagxPanelBaseElement._baseStyle, css`
        .toggle {
            cursor: pointer;
            display: inline;
        }

        .toggle input[type="checkbox"]:not([switch]) {
            position: absolute;
            left: -99999px;
        }

        .track {
            display: block;
            position: relative;
            width: 34px;
            height: 16px;
            background: var(--magx-panel-checkbox);
            box-sizing: border-box;
        }

        .knob {
            position: absolute;
            top: 2px;
            left: 2px;
            width: 12px;
            height: 12px;
            background: var(--magx-panel-bg, #222);
            transition: left 140ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        .toggle input:checked + .track {
            background: var(--magx-panel-checkbox-checked);
        }

        .toggle input:checked + .track .knob {
            left: 20px;
        }

        @media (prefers-reduced-motion: reduce) {
            .knob { transition: none; }
        }

        .state {
            position: absolute;
            right: 4px;
            top: var(--magx-panel-checkbox-label-top);
            font-size: 9px;
            letter-spacing: 0.08em;
            opacity: 0.75;
            pointer-events: none;
        }

        .haptic-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            cursor: pointer;
            touch-action: manipulation;
            z-index: 1;
            display: block;
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

        .toggle_label {
            position: absolute;
            cursor: pointer;
            top: var(--magx-panel-checkbox-label-top);
            left: 42px;
        }
    `];

    getValue(): any {
        return this.checked;
    }

    setValue(val: any): void {
        this.checked = val;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'magx-panel-toggle': MagxPanelToggle
    }
}
