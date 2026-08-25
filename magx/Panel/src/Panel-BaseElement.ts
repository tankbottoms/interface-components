import { LitElement, css } from 'lit';
import { property } from 'lit/decorators.js';
import { MagxPanel } from "./Panel";
import { MagxPanelConstants } from './Panel-Constants';

// Interface used for notifying when a value has changed on any of the elements in any panel
export interface MagxPanelValueChangeEvent {
    panelId: string,
    panelElementId: string
}

// Base class for all the panel elements. Eases the development of new panel elements
// Note that you need to call super.firstUpdated() if you overload firstUpdated(), you need
// to bring in to your somponent stylesheet _baseStyle and you need to implement
// getValue() and setValue() methods, which are abstract.
export abstract class MagxPanelBaseElement extends LitElement {

    protected _container : HTMLDivElement | null = null;
    protected doNotRemoveSelected: boolean = false;

    // Title shown on the top of the element
    @property({type: String}) public title: string = "";

    // Used to identify the element, will be set automatically if not given as an attribute
    @property({type: String}) public id: string = "";

    // Constructor
    constructor() {
        super();
        this.title = this.getAttribute("title")?.trim() ?? "";
        this.id = this.getAttribute("id")?.trim() ?? "panel_component_" + Math.round(Math.random() * (1 << 24)).toString(16);
    }

    // Helper to quickly build an element
    protected _createElement(type: string, id: string | null = null, className: string | null = null, parent: HTMLElement | null = null): HTMLElement | null {
        const element = document.createElement(type);
        if (!element) return null;
        
        if (id) { element.id = id; }
        if (className) { element.className = className; }
  
        if (parent) {
            parent.appendChild(element);
        }
  
        return element;
    }
    
    // Helper to remove a visual cue that focus has moved from the element
    protected _removeFocus(): void {
        if (!this.doNotRemoveSelected) {
            this._container?.classList.remove("container_base_selected");
            this._sendEvent(MagxPanelConstants.PANEL_ELEMENT_FOCUS_REMOVED);
        }
    }

    // Helper to show a visual cure that element has gained focus
    protected _addFocus(): void {        
        this._container?.classList.add("container_base_selected");
        this._sendEvent(MagxPanelConstants.PANEL_ELEMENT_FOCUS_GAINED);
    }
    
    // Dispatches event
    protected _sendEvent(eventName: string): void {
        let panelId = "";

        if (this.parentElement && this.parentElement instanceof MagxPanel) {
            panelId = (this.parentElement as MagxPanel).id;
        }
        
        const event = new CustomEvent(eventName, { detail: { panelElementId: this.id, panelId: panelId } });  
        document.dispatchEvent(event);
    }

    // Used to notify on value change
    protected _notifyOnValueChange(): void {
        this._sendEvent(MagxPanelConstants.PANEL_ELEMENT_VALUE_CHANGED);
    }

    // Finds container from the Shadow DOM
    firstUpdated(): void {
        this._container = this.shadowRoot?.getElementById("container") as HTMLDivElement;
    }

    // Returns value of the element (completely dependend on the implementation and element itself, can also return null)
    abstract getValue(): any;

    // Sets the value of the element, also dependend on the element and if it makes sense to set the value in the first place
    abstract setValue(val: any): void;

    // Base styles that need to be brought in to panel elements
    protected static _baseStyle = css`
        .container_base {
            margin: var(--magx-panel-container-margin);
            padding: var(--magx-panel-container-padding);
            background-color: var(--magx-panel-container-bg);
            border: var(--magx-panel-common-border);
            position: relative;
            overflow: hidden;
            touch-action: manipulation;
            min-height: 44px;
        }

        /*
         * A popup picker is a child of its container, so the container's own
         * clip would cut the list off two rows in. While a popup is open the
         * clip is lifted and the container is raised above its siblings; it
         * goes straight back afterwards so nothing else leaks out.
         */
        .container_base.is-open {
            overflow: visible;
            z-index: 5;
        }

        .container_base_selected {            
            border: var(--magx-panel-selected-container-border);
	        background-color: var(--magx-panel-selected-container-background);
        }

        .label {            
            margin-bottom: var(--magx-panel-label-margin);
	        user-select: none;
	        -webkit-user-select: none;
	        cursor: default;
	        font: var(--magx-panel-font);
        }

        /*
         * Glyph carrier for the shadow root.
         *
         * The fat utility classes are document-scoped and stop at the shadow
         * boundary, but @font-face is global, so the family and weight are
         * named here and each control supplies its own codepoint in content.
         * Weight 100 is Font Awesome Thin.
         */
        .mgx-i {
            font-family: var(--magx-panel-icon-family, "Font Awesome 6 Pro");
            font-weight: var(--magx-panel-icon-weight, 100);
            font-style: normal;
            font-variant: normal;
            line-height: 1;
            text-rendering: auto;
            -webkit-font-smoothing: antialiased;
            display: inline-block;
            flex: none;
            color: var(--magx-panel-icon-color, #8b9299);
        }

        /*
         * Shared row for a field and its leading glyph.
         *
         * The glyph sits on the same line as the value and inside the same
         * underline, so a field reads as one object rather than as an icon
         * placed next to a box. The rule is drawn here, once, rather than on
         * each control, which is also what lets the date, time and text fields
         * line up with each other when they sit in the same panel.
         */
        .input-wrapper {
            position: relative;
            display: flex;
            align-items: center;
            gap: 6px;
            border-bottom: 1px solid transparent;
            transition: border-color 0.14s ease;
        }

        .input-wrapper:hover {
            border-bottom-color: var(--magx-panel-rule, #e2ded8);
        }

        .input-wrapper:focus-within {
            border-bottom-color: var(--magx-panel-accent, #3792a4);
        }

        .input-wrapper:focus-within .field-glyph {
            color: var(--magx-panel-accent, #3792a4);
        }

        .field-glyph {
            font-size: 10px;
            width: 11px;
            text-align: center;
        }

        /*
         * Text fields carry no box.
         *
         * A field drawn as a filled rectangle competes with the container it
         * sits in, and at this size the two borders end up a few pixels apart
         * and read as a double rule. What is left is a leading glyph, the
         * value, and a hairline that only shows once the field is live: hover
         * says it is editable, focus tints the rule with the accent.
         */
        .text_input {
            box-sizing: border-box;
            width: 100%;
            padding: 0 0 0 2px;
            height: var(--magx-panel-common-height);
            border: 0;
            border-bottom: 1px solid transparent;
            border-radius: 0;
            background: transparent;
            color: var(--magx-panel-text-color);
            font: var(--magx-panel-input-font);
            transition: border-color 0.14s ease;
        }

        .text_input:hover {
            border-bottom-color: var(--magx-panel-rule, #e2ded8);
        }

        .text_input:focus {
            outline: none;
            background: transparent;
            border-bottom-color: var(--magx-panel-accent, #3792a4);
        }

        .text_input::placeholder {
            color: var(--magx-panel-icon-color, #8b9299);
            opacity: 1;
        }

        /*
         * Keyboard focus has to be visible or Tab is useless — you can move
         * through the panel but never see where you are.
         *
         * Several controls here set "outline: none" to kill the platform ring,
         * which was fine while the panel was mouse-only. This puts a ring back
         * on the *container*, not the control, so a checkbox and a text field
         * highlight the same way and the ring never gets clipped by a 20px-tall
         * swatch.
         *
         * :has(:focus-visible) rather than :focus-within on purpose —
         * :focus-within is true for a mouse click as well, and a ring that
         * appears on every click reads as a selection state rather than as a
         * keyboard cue. The second selector covers containers that are
         * themselves the tab stop (the colour picker).
         */
        .container_base:has(:focus-visible),
        .container_base:focus-visible {
            outline: var(--magx-panel-focus-ring, 2px solid #4c9be8);
            outline-offset: -2px;
        }
    `;
}