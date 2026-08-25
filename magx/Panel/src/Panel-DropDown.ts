import { css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { MagxPanelBaseElement } from './Panel-BaseElement';
import { MagxPanelConstants } from './Panel-Constants';
import { MagxHaptics } from './Haptics';

// Data structure used with getValue()
export interface MagxSelectValueCallback {
    index: number,
    label: string
}

// True when the browser can put an element in the top layer.
const SUPPORTS_POPOVER = typeof HTMLElement !== "undefined" && "showPopover" in HTMLElement.prototype;

/*
 * Dropdown element for the panel, drawn as a popup picker.
 *
 * The control the user sees is a button plus a floating list, in the same
 * idiom as the map and viewport controls elsewhere: hairline rule, a thin
 * chevron, and hover that outlines rather than fills. A native <select> is
 * still here, hidden, and it is still the source of truth — it owns the
 * options, so setOptions(), setValue(), getValue() and the light-DOM <option>
 * adoption below all work against it unchanged, and a consumer that reads
 * { index, label } sees exactly what it saw before.
 *
 * The list has two clips to get past: the container's own `overflow: hidden`
 * and the panel body's `overflow-y: auto`. Where the Popover API exists the
 * list goes to the top layer and neither applies; the fallback lifts the
 * container clip (`.is-open`) and accepts that a list opened at the very
 * bottom of a long panel may scroll rather than overhang.
 */
@customElement(MagxPanelConstants.PANEL_DROPDOWN)
export class MagxPanelDropdown extends MagxPanelBaseElement {
    private _dropdown: HTMLSelectElement | null = null;
    private _index: number = 0;

    // Popup visibility, and the row the keyboard is currently on. The active
    // row is separate from the selection: arrowing through the open list
    // should not fire a value change until it is committed.
    @state() private _open: boolean = false;
    @state() private _active: number = 0;

    private _onDocPointer: ((e: Event) => void) | null = null;

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

    // Option labels, read live off the hidden select so there is one list, not two
    private get _labels(): Array<string> {
        if (!this._dropdown) { return []; }
        return Array.from(this._dropdown.options).map((o) => o.label || o.innerText);
    }

    private get _currentLabel(): string {
        return this._labels[this._index] ?? "";
    }

    private get _popup(): HTMLElement | null {
        return (this.shadowRoot?.querySelector('.pick-pop') as HTMLElement) ?? null;
    }

    // Opening a picker is a deliberate act, so it gets the same tap feedback
    // the old native picker did.
    private _openPicker(): void {
        if (this._open || this._labels.length === 0) { return; }
        MagxHaptics.trigger('light');
        this._active = this._index;
        this._open = true;
        this._container?.classList.add('is-open');

        if (!SUPPORTS_POPOVER) {
            // The top layer would have handled light dismissal for us.
            this._onDocPointer = (e: Event) => {
                if (e.composedPath().includes(this)) { return; }
                this._closePicker(false);
            };
            document.addEventListener('pointerdown', this._onDocPointer, true);
        }
    }

    private _closePicker(refocus: boolean = true): void {
        if (!this._open) { return; }
        this._open = false;
        this._container?.classList.remove('is-open');

        if (this._onDocPointer) {
            document.removeEventListener('pointerdown', this._onDocPointer, true);
            this._onDocPointer = null;
        }

        if (refocus) {
            const trigger = this.shadowRoot?.getElementById(`${this.id}-trigger`) as HTMLElement;
            trigger?.focus();
        }
    }

    private _toggle(): void {
        this._open ? this._closePicker() : this._openPicker();
    }

    // Commits a row: the hidden select moves, then the normal value path runs
    private _choose(i: number): void {
        if (!this._dropdown) { return; }
        const last = this._dropdown.options.length - 1;
        const next = Math.min(Math.max(0, i), last);
        this._closePicker();
        if (next === this._dropdown.selectedIndex) { return; }
        this._dropdown.selectedIndex = next;
        this._valueChanged();
        this.requestUpdate();
    }

    private _handleBlur(): void {
        this._removeFocus();
    }

    /*
     * Enumerate the options from the keyboard.
     *
     * Closed, the arrows step the value directly and each step fires a change,
     * which is what a panel wants: turn the knob, watch the scene react. Open,
     * the same keys move a highlight and nothing is committed until Enter —
     * scanning a long list should not spray events.
     *
     * Enter and Space open the picker, which is the escape hatch for a list
     * where stepping one at a time is tedious, and Escape closes it without
     * changing anything.
     */
    private _keydown(e: KeyboardEvent): void {
        if (!this._dropdown) { return; }
        const last = this._dropdown.options.length - 1;
        if (last < 0) { return; }

        if (this._open) {
            let next = this._active;
            switch (e.key) {
                case 'ArrowDown':
                case 'ArrowRight': next = Math.min(last, next + 1); break;
                case 'ArrowUp':
                case 'ArrowLeft': next = Math.max(0, next - 1); break;
                case 'Home': next = 0; break;
                case 'End': next = last; break;
                case 'Enter':
                case ' ':
                    e.preventDefault();
                    this._choose(this._active);
                    return;
                case 'Escape':
                case 'Tab':
                    this._closePicker(e.key === 'Escape');
                    return;
                default: return;
            }
            e.preventDefault();
            this._active = next;
            return;
        }

        let next = this._dropdown.selectedIndex;
        switch (e.key) {
            case 'ArrowDown':
            case 'ArrowRight': next = Math.min(last, next + 1); break;
            case 'ArrowUp':
            case 'ArrowLeft': next = Math.max(0, next - 1); break;
            case 'Home': next = 0; break;
            case 'End': next = last; break;
            case 'Enter':
            case ' ':
                e.preventDefault();
                this._openPicker();
                return;
            default: return;
        }

        e.preventDefault();
        if (next === this._dropdown.selectedIndex) { return; }
        this._dropdown.selectedIndex = next;
        this._valueChanged();
        this.requestUpdate();
    }

    // Renders the component
    render() {
        const labels = this._labels;
        return html`
            <div class="container_base ${this._open ? 'is-open' : ''}" id="container">
                <label class="label"><b>${this.title}</b></label>
                <div class="pick-wrapper">
                    <button type="button" class="pick-trigger ${this._open ? 'is-on' : ''}"
                            id="${this.id}-trigger"
                            aria-haspopup="listbox"
                            aria-expanded=${this._open ? 'true' : 'false'}
                            @click=${this._toggle}
                            @keydown=${this._keydown}
                            @blur=${this._handleBlur}
                            @focus=${this._addFocus}>
                        <span class="pick-value">${this._currentLabel}</span>
                        <i class="mgx-i pick-caret" aria-hidden="true"></i>
                    </button>
                    <div class="pick-pop" role="listbox" .popover=${SUPPORTS_POPOVER ? 'manual' : null} ?hidden=${!this._open}>
                        ${labels.map((label, i) => html`
                            <button type="button" role="option" tabindex="-1"
                                    class="pick-opt ${i === this._index ? 'is-on' : ''} ${i === this._active ? 'is-active' : ''}"
                                    aria-selected=${i === this._index ? 'true' : 'false'}
                                    @click=${() => this._choose(i)}
                                    @pointerenter=${() => { this._active = i; }}>
                                <i class="mgx-i pick-tick" aria-hidden="true"></i>
                                <span class="pick-opt-label">${label}</span>
                            </button>
                        `)}
                    </div>
                    <select class="pick-native" id=${this.id} aria-hidden="true" tabindex="-1" .selectedIndex=${this.index}>
                    </select>
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

    // Show/hide and place the list after Lit has written the DOM
    protected updated(changed: Map<PropertyKey, unknown>): void {
        super.updated(changed);
        if (!SUPPORTS_POPOVER) { return; }

        const pop = this._popup;
        if (!pop) { return; }

        const shown = pop.matches(':popover-open');
        if (this._open && !shown) {
            try { pop.showPopover(); } catch { /* SAFETY: already open, or detached mid-update */ }
            this._place();
        } else if (!this._open && shown) {
            try { pop.hidePopover(); } catch { /* SAFETY: already closed */ }
        }
    }

    // Top-layer elements are positioned by us, not by the flow they came from.
    // Below the trigger by default; flipped above when the viewport runs out.
    private _place(): void {
        const pop = this._popup;
        const trigger = this.shadowRoot?.getElementById(`${this.id}-trigger`) as HTMLElement;
        if (!pop || !trigger) { return; }

        const r = trigger.getBoundingClientRect();
        pop.style.minWidth = `${r.width}px`;
        pop.style.left = `${Math.max(4, Math.min(r.left, window.innerWidth - r.width - 4))}px`;

        const h = pop.offsetHeight;
        const below = r.bottom + 4;
        pop.style.top = (below + h > window.innerHeight && r.top - 4 - h > 0)
            ? `${r.top - 4 - h}px`
            : `${below}px`;
    }

    disconnectedCallback(): void {
        this._closePicker(false);
        super.disconnectedCallback();
    }

    // Stylesheet
    static styles = [MagxPanelBaseElement._baseStyle, css`
        .pick-wrapper {
            position: relative;
        }

        /* The hidden select is the option store, never the interface */
        .pick-native {
            position: absolute;
            width: 1px;
            height: 1px;
            opacity: 0;
            pointer-events: none;
            clip-path: inset(50%);
        }

        /*
         * Trigger. No fill of its own — a hairline, the current value, and a
         * thin chevron. Hover and open both outline in the accent rather than
         * filling, so an open picker never looks like a pressed button.
         */
        .pick-trigger {
            box-sizing: border-box;
            display: flex;
            align-items: center;
            gap: 6px;
            width: 100%;
            height: var(--magx-panel-common-height);
            margin-top: 2px;
            padding: 0 6px;
            background: transparent;
            border: 1px solid var(--magx-panel-rule, #e2ded8);
            border-radius: var(--magx-panel-popup-radius, 3px);
            color: var(--magx-panel-text-color);
            font: var(--magx-panel-select-font);
            text-align: left;
            cursor: pointer;
            transition: border-color 0.14s ease, color 0.14s ease;
        }

        .pick-trigger:hover,
        .pick-trigger.is-on {
            border-color: var(--magx-panel-accent, #3792a4);
            color: var(--magx-panel-accent, #3792a4);
        }

        .pick-trigger:hover .mgx-i,
        .pick-trigger.is-on .mgx-i {
            color: var(--magx-panel-accent, #3792a4);
        }

        .pick-trigger:focus {
            outline: none;
        }

        .pick-value {
            flex: 1 1 auto;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        /* fa-chevron-down, thin */
        .pick-caret::before {
            content: "\\f078";
            font-size: 9px;
        }

        .pick-trigger.is-on .pick-caret::before {
            content: "\\f077";
        }

        /*
         * The list. In the top layer it is positioned from script; in the
         * fallback it hangs off the wrapper and relies on .is-open having
         * lifted the container clip.
         */
        .pick-pop {
            position: absolute;
            top: calc(100% + 4px);
            left: 0;
            z-index: 40;
            box-sizing: border-box;
            min-width: 100%;
            max-height: 240px;
            overflow-y: auto;
            margin: 0;
            padding: 0;
            border: 1px solid var(--magx-panel-rule, #e2ded8);
            border-radius: var(--magx-panel-popup-radius, 3px);
            background: var(--magx-panel-popup-bg, #ffffff);
            box-shadow: var(--magx-panel-popup-shadow, 0 6px 18px rgba(28, 30, 32, 0.09));
        }

        .pick-pop[popover] {
            position: fixed;
            inset: auto;
        }

        .pick-pop[popover]:not(:popover-open) {
            display: none;
        }

        .pick-pop[hidden] {
            display: none;
        }

        .pick-opt {
            display: flex;
            align-items: center;
            gap: 6px;
            width: 100%;
            box-sizing: border-box;
            padding: 5px 8px;
            background: transparent;
            border: 0;
            border-top: 1px solid var(--magx-panel-rule-hair, #f1efeb);
            color: var(--magx-panel-text-color);
            font: var(--magx-panel-select-font);
            text-align: left;
            cursor: pointer;
        }

        .pick-opt:first-child {
            border-top: 0;
        }

        .pick-opt.is-active {
            background: var(--magx-panel-popup-alt, #f6f4f1);
        }

        .pick-opt.is-on {
            color: var(--magx-panel-accent, #3792a4);
        }

        .pick-opt-label {
            flex: 1 1 auto;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        /*
         * fa-check, thin. The tick keeps its box on every row so the labels
         * line up whether or not a row is the selected one.
         */
        .pick-tick {
            width: 9px;
            font-size: 9px;
            visibility: hidden;
        }

        .pick-tick::before {
            content: "\\f00c";
        }

        .pick-opt.is-on .pick-tick {
            visibility: visible;
            color: var(--magx-panel-accent, #3792a4);
        }
    `];

    // Returns current selection
    getValue(): any {
        return { index: this.index, label: this._dropdown?.options[this.index]?.label ?? "Unknown" };
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
