import { css, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { MagxPanelBaseElement } from './Panel-BaseElement';
import { MagxPanelConstants } from './Panel-Constants';
import { MagxHaptics } from './Haptics';

// Simple button element
@customElement(MagxPanelConstants.PANEL_BUTTON)
export class MagxPanelButton extends MagxPanelBaseElement {

    // Constructor
    constructor() {
        super();        
    }

    // Notifies button click as a value change
    // iOS haptic comes from the real switch toggle (user's touch).
    // Android fallback uses navigator.vibrate() via MagxHaptics.
    // Reset switch immediately so button is momentary, not a toggle.
    private _clicked(e: Event): void {
        const sw = e.target as HTMLInputElement;
        requestAnimationFrame(() => { sw.checked = false; });
        if (!MagxHaptics.isIOS && MagxHaptics.isMobile) {
            MagxHaptics.trigger('medium');
        }
        this._notifyOnValueChange();
    }

    // Renders the component
    // The button is a <label> wrapping a hidden switch checkbox.
    // On iOS 18+, tapping the label toggles the switch → native haptic feedback.
    // On Android, _clicked() falls back to navigator.vibrate().
    render() {
        return html`
            <div class="container_base" id="container">
                <label id=${this.id} class="button" @blur=${this._removeFocus} @focus=${this._addFocus}>
                    <input type="checkbox" switch class="haptic-switch" @change=${this._clicked} />
                    <span class="button-text">${this.title}</span>
                </label>
            </div>
        `;
    }

    // Stylesheet
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
        }

        .button:active {
            background-color: var(--magx-panel-button-bg-active);
        }

        .button:hover {
            background-color: var(--magx-panel-button-bg-active);
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
    `];

    // Set and get do not make sense for this component
    getValue(): any { return null; }
    setValue(_val: any): void {}
}

declare global {
    interface HTMLElementTagNameMap {
        "magx-panel-button": MagxPanelButton
    }
}