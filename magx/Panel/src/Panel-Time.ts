import { css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { MagxPanelBaseElement } from './Panel-BaseElement';
import { MagxPanelConstants } from './Panel-Constants';
import { MagxHaptics } from './Haptics';

// Element for choosing time. There is a separate element for choosing a date
@customElement(MagxPanelConstants.PANEL_TIME)
export class MagxPanelTime extends MagxPanelBaseElement {
    private _timeInput: HTMLInputElement | null = null;
    private _timeValue: string = "";

    set timeValue(val: string | Date) {
        const valStr = this._createTimeString(val);
        if (this._timeValue !== valStr && this._timeValue !== null) {
            let oldVal = this._timeValue;
            this._timeValue = valStr;
            this.requestUpdate("timeValue", oldVal);
            this._notifyOnValueChange();
        }        
    }
      
    @property()
    get timeValue() { return this._timeValue; }

    // Constructor. Note that the correct time format is "hh:mm:ss" or just "hh:mm"
    constructor() {
        super();
        this._timeValue = this.getAttribute("time")?.trim() ?? this._createTimeString(new Date());
    }   

    // Parses time string from Date or if the argument is string just leaves it as it is
    private _createTimeString = (time: string | Date) => {
        let timeStr: string;
        if (time instanceof Date) {
          const hours = time.getHours();
          const hoursStr = (hours < 10) ? "0" + hours.toString() : hours.toString();
          const minutes = time.getMinutes();
          const minutesStr = (minutes < 10) ? "0" + minutes.toString() : minutes.toString();
          const seconds = time.getSeconds();
          const secondsStr = (seconds < 10) ? "0" + seconds.toString() : seconds.toString();
          timeStr = hoursStr + ":" + minutesStr + ":" + secondsStr;
        } else {
            timeStr = time;
        }
        return timeStr;
    }

    // Called when time value is changed
    private _valueChanged(): void {
        this._timeValue = this._timeInput?.value ?? this._createTimeString(new Date());
        MagxHaptics.trigger('light');
        this._notifyOnValueChange();
    }
        
    // Label+switch overlay fires iOS haptic on tap, hides to let time picker open
    private _hapticTap(e: Event): void {
        const sw = e.target as HTMLInputElement;
        requestAnimationFrame(() => { sw.checked = false; });
        const overlay = this.shadowRoot?.querySelector('.haptic-overlay') as HTMLElement;
        if (overlay) overlay.style.display = 'none';
        const input = this.shadowRoot?.getElementById(this.id) as HTMLInputElement;
        if (input) { input.focus(); input.showPicker?.(); }
    }

    private _handleBlur(): void {
        this._removeFocus();
        const overlay = this.shadowRoot?.querySelector('.haptic-overlay') as HTMLElement;
        if (overlay) overlay.style.display = '';
    }

    // Renders the element
    render() {
        return html`
        <div class="container_base" id="container">
            <div class="label"><b>${this.title}</b></div>
            <div class="input-wrapper">
                <input id=${this.id} class="text_input" type="time" .value=${this.timeValue} @input=${this._valueChanged} @blur=${this._handleBlur} @focus=${this._addFocus}/>
                <label class="haptic-overlay"><input type="checkbox" switch class="haptic-switch" @change=${this._hapticTap} /></label>
            </div>
        </div>
        `;
    }

    // Called before the component is rendered for the first time
    firstUpdated(): void {
        super.firstUpdated();
        this._timeInput = this.shadowRoot?.getElementById(`${this.id}`) as HTMLInputElement;
    }

    // Stylesheet
    static styles = [MagxPanelBaseElement._baseStyle, css`
        input::-webkit-calendar-picker-indicator {
            cursor: pointer;
        }

        .input-wrapper {
            position: relative;
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
    `];

    // Returns the currently chosen time
    getValue(): any {
        return this.timeValue;
    }

    // Sets new time. Date object preferred
    setValue(val: any): void {
        this.timeValue = this._createTimeString(val);
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "magx-panel-time": MagxPanelTime
    }
}