import { css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { MagxPanelBaseElement } from './Panel-BaseElement';
import { MagxPanelConstants } from './Panel-Constants';
import { MagxHaptics } from './Haptics';

// Data structure used with getValue()
export interface MagxSelectValueCallback {
    index: number,
    label: string
}

// Dropdown element for the panel
@customElement(MagxPanelConstants.PANEL_DROPDOWN)
export class MagxPanelDropdown extends MagxPanelBaseElement {
    private _dropdown: HTMLSelectElement | null = null;
    private _index: number = 0;

    set index(val: number) {
        if (this._index !== val && this._dropdown !== null) {
            this._index = val;
            this.requestUpdate();        
            this._notifyOnValueChange();
        }        
    }
      
    @property()
    get index(): number { return this._index; }

    // Constructor
    constructor() {
        super();
        try {
            this._index = parseInt(this.getAttribute("index") ?? "0");
        } catch {
            this._index = 0;
        }
    }

    // Sends value changed event when user selects new item on dropdown
    private _valueChanged(): void {
        this._index = this._dropdown?.selectedIndex ?? 0;
        MagxHaptics.trigger('light');
        this._notifyOnValueChange();
    }

    // Sets / replaces the available options on dropdown
    public setOptions(items: Array<string>, new_index: number = 0): void {
        if (!this._dropdown) { return; }

        while (this._dropdown.options.length > 0) {
            this._dropdown.remove(0);
        }

        for (var i = 0; i < items.length; i++) {
            const option = this._createElement("option") as HTMLOptionElement;
            option.label = items[i];
            option.innerText = items[i];          
            this._dropdown.add(option);
        }      

        this.index = Math.min(Math.max(0, new_index), (this._dropdown.options.length ?? 1) - 1);
        this._dropdown.selectedIndex = this.index;
        this._notifyOnValueChange();
        this.requestUpdate();
    }

    // Label+switch overlay fires iOS haptic on tap, hides to let select open
    private _hapticTap(e: Event): void {
        const sw = e.target as HTMLInputElement;
        requestAnimationFrame(() => { sw.checked = false; });
        const overlay = this.shadowRoot?.querySelector('.haptic-overlay') as HTMLElement;
        if (overlay) overlay.style.display = 'none';
        const select = this.shadowRoot?.getElementById(this.id) as HTMLSelectElement;
        if (select) { select.focus(); select.showPicker?.(); }
    }

    private _handleBlur(): void {
        this._removeFocus();
        const overlay = this.shadowRoot?.querySelector('.haptic-overlay') as HTMLElement;
        if (overlay) overlay.style.display = '';
    }

    // Renders the component
    render() {
        return html`
            <div class="container_base" id="container">
                <label class="label"><b>${this.title}</b></label>
                <div class="select-wrapper">
                    <select class="select" id=${this.id} @change=${this._valueChanged} .selectedIndex=${this.index} @blur=${this._handleBlur} @focus=${this._addFocus}>
                    </select>
                    <label class="haptic-overlay"><input type="checkbox" switch class="haptic-switch" @change=${this._hapticTap} /></label>
                </div>
                <slot id="to_be_removed"></slot>
            </div>
        `;
    }

    // Called before the component is rendered for the first time
    // Uses bit of trickery to initialize the dropdown's options since setting <slot></slot> direclty inside select doesn't seem to work
    firstUpdated(): void {
        super.firstUpdated();
        this._dropdown = this.shadowRoot?.getElementById(`${this.id}`) as HTMLSelectElement;

        const slotNode = this.shadowRoot?.getElementById("to_be_removed") as HTMLSlotElement;
        const options = slotNode.assignedElements();
        options.forEach((node: Node, _index: number, _array: Node[]) => {
            if (node instanceof HTMLOptionElement) {
                this._dropdown?.add(node);
            }
        });                  
        this._container?.removeChild(slotNode);        
        this._dropdown.selectedIndex = this._index;
        this.requestUpdate();        
    }

    // Stylesheet
    static styles = [MagxPanelBaseElement._baseStyle, css`
        .select {
            margin-top: 2px;
            background: var(--magx-panel-select-bg) no-repeat right;
            background-color: var(--magx-panel-text-bg);
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
            color: var(--magx-panel-text-color);
            width: 100%;
            height: var(--magx-panel-common-height);
            border: var(--magx-panel-button-border);
            -webkit-border-radius: 0;
            -moz-border-radius: 0;
            border-radius: 0;
            padding: 0 5px;
            -moz-outline: none;
            font: var(--magx-panel-select-font);
        }
        
        .select option {
            font: var(--magx-panel-select-font);
        }

        .select::-ms-expand {
            display: none;
        }

        .select:focus {
            outline: none;
        }

        .select:hover {
            cursor: pointer;
        }

        .select-wrapper {
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

    // Returns current selection
    getValue(): any {
        return { index: this.index, label: this._dropdown?.options[this.index].label ?? "Unknown" };
    }

    // Sets the currently active dropdown element
    setValue(val: any): void {
        if (!this._dropdown) { return; }

        if (typeof val === "string") {
            try {
                val = parseInt(val);
                this.index = Math.min(Math.max(0, Math.round(val)), (this._dropdown?.options.length ?? 1) - 1);
                this._dropdown.selectedIndex = this.index;
            } catch {
                return;
            }
        } else if (typeof val === "number") {
            this.index = Math.min(Math.max(0, Math.round(val)), (this._dropdown?.options.length ?? 1) - 1);
            this._dropdown.selectedIndex = this.index;
        }        
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "magx-panel-dropdown": MagxPanelDropdown
    }
}