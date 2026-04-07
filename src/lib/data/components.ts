export interface PropertyDef {
	name: string;
	type: string;
	default: string;
	description: string;
}

export interface EventDef {
	name: string;
	detail: string;
	description: string;
}

export interface ComponentDef {
	id: string;
	name: string;
	tagName: string;
	icon: string;
	category: 'container' | 'input' | 'display' | 'control' | 'canvas';
	group: 'panel' | 'sparkline';
	description: string;
	properties: PropertyDef[];
	events: EventDef[];
	codeExample: string;
	programmaticExample?: string;
}

export const componentDefs: ComponentDef[] = [
	{
		id: 'panel',
		name: 'Panel',
		tagName: 'magx-panel',
		icon: 'fa-window-restore',
		category: 'container',
		group: 'panel',
		description:
			'The main container component. A draggable, collapsible floating panel that groups child elements into a unified HUD-style interface. Supports positioning, z-index management, serialization of all child values to/from JSON, and native haptic feedback on mobile (iOS Safari 18+ via switch checkbox, Android via navigator.vibrate).',
		properties: [
			{
				name: 'id',
				type: 'String',
				default: 'auto-generated',
				description: 'Unique identifier for the panel'
			},
			{
				name: 'title',
				type: 'String',
				default: '""',
				description: 'Title displayed in the title bar'
			},
			{ name: 'x', type: 'Number', default: '0', description: 'Initial X position (attribute only)' },
			{ name: 'y', type: 'Number', default: '0', description: 'Initial Y position (attribute only)' },
			{
				name: 'outofbounds',
				type: 'Boolean',
				default: 'true',
				description: 'Restrict panel to parent bounds'
			},
			{
				name: 'closebutton',
				type: 'Boolean',
				default: 'true',
				description: 'Show close button in title bar'
			}
		],
		events: [
			{
				name: 'magx-panelValueChanged',
				detail: '{ panelId, panelElementId }',
				description: 'Fired when any child element value changes'
			}
		],
		codeExample: `<magx-panel id="my-panel" title="Settings" x="50" y="50">
  <magx-panel-textinput title="Name" placeholder="Enter name..."></magx-panel-textinput>
  <magx-panel-range title="Volume" min="0" max="100" step="1" value="50"></magx-panel-range>
  <magx-panel-button title="Apply"></magx-panel-button>
</magx-panel>`,
		programmaticExample: `const panel = new MagxPanel();
panel.title = "My Panel";
const input = new MagxPanelTextInput();
input.title = "Name";
panel.appendChild(input);
document.body.appendChild(panel);
panel.setPosition(50, 50);`
	},
	{
		id: 'button',
		name: 'Button',
		tagName: 'magx-panel-button',
		icon: 'fa-square',
		category: 'control',
		group: 'panel',
		description:
			'A simple clickable button element for panels. Fires a value change event when clicked.',
		properties: [
			{ name: 'title', type: 'String', default: '""', description: 'Button label text' },
			{ name: 'id', type: 'String', default: 'auto-generated', description: 'Unique identifier' }
		],
		events: [
			{
				name: 'magx-panelValueChanged',
				detail: '{ panelId, panelElementId }',
				description: 'Fired on click'
			}
		],
		codeExample: `<magx-panel-button title="Submit" id="btn1"></magx-panel-button>`
	},
	{
		id: 'checkbox',
		name: 'Checkbox',
		tagName: 'magx-panel-checkbox',
		icon: 'fa-square-check',
		category: 'control',
		group: 'panel',
		description:
			'A toggle checkbox element. Returns a boolean value indicating checked state.',
		properties: [
			{ name: 'title', type: 'String', default: '""', description: 'Label text' },
			{
				name: 'checked',
				type: 'Boolean',
				default: 'false',
				description: 'Initial checked state (attribute)'
			},
			{ name: 'id', type: 'String', default: 'auto-generated', description: 'Unique identifier' }
		],
		events: [
			{
				name: 'magx-panelValueChanged',
				detail: '{ panelId, panelElementId }',
				description: 'Fired on toggle'
			}
		],
		codeExample: `<magx-panel-checkbox title="Enable Feature" id="chk1" checked></magx-panel-checkbox>`
	},
	{
		id: 'colorpicker',
		name: 'ColorPicker',
		tagName: 'magx-panel-colorpicker',
		icon: 'fa-palette',
		category: 'control',
		group: 'panel',
		description:
			'A color selection element. Displays a color preview swatch and allows picking a new color via the native color input.',
		properties: [
			{ name: 'title', type: 'String', default: '""', description: 'Label text' },
			{
				name: 'value',
				type: 'String',
				default: '"#000000"',
				description: 'Initial hex color value'
			},
			{ name: 'id', type: 'String', default: 'auto-generated', description: 'Unique identifier' }
		],
		events: [
			{
				name: 'magx-panelValueChanged',
				detail: '{ panelId, panelElementId }',
				description: 'Fired on color change'
			}
		],
		codeExample: `<magx-panel-colorpicker title="Background" id="cp1" value="#7c3aed"></magx-panel-colorpicker>`
	},
	{
		id: 'date',
		name: 'Date',
		tagName: 'magx-panel-date',
		icon: 'fa-calendar',
		category: 'input',
		group: 'panel',
		description:
			'A date picker element that uses the native HTML date input. Returns the selected date as a string.',
		properties: [
			{ name: 'title', type: 'String', default: '""', description: 'Label text' },
			{ name: 'id', type: 'String', default: 'auto-generated', description: 'Unique identifier' }
		],
		events: [
			{
				name: 'magx-panelValueChanged',
				detail: '{ panelId, panelElementId }',
				description: 'Fired on date selection'
			}
		],
		codeExample: `<magx-panel-date title="Start Date" id="date1"></magx-panel-date>`
	},
	{
		id: 'dropdown',
		name: 'DropDown',
		tagName: 'magx-panel-dropdown',
		icon: 'fa-caret-down',
		category: 'control',
		group: 'panel',
		description:
			'A dropdown select element. Options can be defined via HTML option elements or set programmatically. Returns the selected index and label.',
		properties: [
			{ name: 'title', type: 'String', default: '""', description: 'Label text' },
			{
				name: 'index',
				type: 'Number',
				default: '0',
				description: 'Initially selected option index'
			},
			{ name: 'id', type: 'String', default: 'auto-generated', description: 'Unique identifier' }
		],
		events: [
			{
				name: 'magx-panelValueChanged',
				detail: '{ panelId, panelElementId }',
				description: 'Fired on selection change'
			}
		],
		codeExample: `<magx-panel-dropdown title="Mode" id="dd1" index="0">
  <option label="Easy">Easy</option>
  <option label="Normal">Normal</option>
  <option label="Hard">Hard</option>
</magx-panel-dropdown>`,
		programmaticExample: `const dropdown = document.getElementById('dd1');
dropdown.setOptions(['Red', 'Green', 'Blue'], 1);`
	},
	{
		id: 'filechooser',
		name: 'FileChooser',
		tagName: 'magx-panel-filechooser',
		icon: 'fa-file',
		category: 'control',
		group: 'panel',
		description:
			'A file selection element. Displays the chosen filename and provides access to the File object.',
		properties: [
			{ name: 'title', type: 'String', default: '""', description: 'Label text' },
			{
				name: 'placeholderLabel',
				type: 'String',
				default: '""',
				description: 'Text shown when no file selected'
			},
			{ name: 'id', type: 'String', default: 'auto-generated', description: 'Unique identifier' }
		],
		events: [
			{
				name: 'magx-panelValueChanged',
				detail: '{ panelId, panelElementId }',
				description: 'Fired on file selection'
			}
		],
		codeExample: `<magx-panel-filechooser title="Upload" id="fc1" placeholderLabel="Choose a file..."></magx-panel-filechooser>`
	},
	{
		id: 'html',
		name: 'HTML',
		tagName: 'magx-panel-html',
		icon: 'fa-code',
		category: 'display',
		group: 'panel',
		description:
			'Allows embedding arbitrary HTML content inside a panel. Content is provided via slotted children.',
		properties: [
			{ name: 'title', type: 'String', default: '""', description: 'Label text' },
			{ name: 'id', type: 'String', default: 'auto-generated', description: 'Unique identifier' }
		],
		events: [],
		codeExample: `<magx-panel-html title="Custom Content" id="html1">
  <p style="color: red;">Any <b>HTML</b> here</p>
</magx-panel-html>`
	},
	{
		id: 'image',
		name: 'Image',
		tagName: 'magx-panel-image',
		icon: 'fa-image',
		category: 'display',
		group: 'panel',
		description:
			'Displays an image inside the panel. The image URL can be set via attribute or programmatically.',
		properties: [
			{ name: 'title', type: 'String', default: '""', description: 'Label text' },
			{ name: 'src', type: 'String', default: '""', description: 'Image URL (attribute)' },
			{ name: 'id', type: 'String', default: 'auto-generated', description: 'Unique identifier' }
		],
		events: [],
		codeExample: `<magx-panel-image title="Preview" id="img1" src="./photo.jpg"></magx-panel-image>`
	},
	{
		id: 'progressbar',
		name: 'ProgressBar',
		tagName: 'magx-panel-progressbar',
		icon: 'fa-bars-progress',
		category: 'display',
		group: 'panel',
		description:
			'A visual progress bar. Set current and max values to display progress percentage.',
		properties: [
			{ name: 'title', type: 'String', default: '""', description: 'Label text' },
			{
				name: 'currentValue',
				type: 'Number',
				default: '0',
				description: 'Current progress value'
			},
			{ name: 'maxValue', type: 'Number', default: '100', description: 'Maximum value' },
			{ name: 'id', type: 'String', default: 'auto-generated', description: 'Unique identifier' }
		],
		events: [],
		codeExample: `<magx-panel-progressbar title="Loading" id="pb1" currentValue="65" maxValue="100"></magx-panel-progressbar>`,
		programmaticExample: `const bar = document.getElementById('pb1');
bar.currentValue = 75; // Updates visually`
	},
	{
		id: 'range',
		name: 'Range',
		tagName: 'magx-panel-range',
		icon: 'fa-sliders',
		category: 'input',
		group: 'panel',
		description:
			'A slider input element. Displays the current numeric value and allows dragging to change it within min/max bounds.',
		properties: [
			{ name: 'title', type: 'String', default: '""', description: 'Label text' },
			{ name: 'min', type: 'Number', default: '0', description: 'Minimum value' },
			{ name: 'max', type: 'Number', default: '10', description: 'Maximum value' },
			{ name: 'step', type: 'Number', default: '1', description: 'Step increment' },
			{ name: 'value', type: 'Number', default: '0', description: 'Current value' },
			{ name: 'id', type: 'String', default: 'auto-generated', description: 'Unique identifier' }
		],
		events: [
			{
				name: 'magx-panelValueChanged',
				detail: '{ panelId, panelElementId }',
				description: 'Fired on value change'
			}
		],
		codeExample: `<magx-panel-range title="Volume" id="rng1" min="0" max="100" step="5" value="50"></magx-panel-range>`
	},
	{
		id: 'panel-sparkline',
		name: 'Panel Sparkline',
		tagName: 'magx-panel-sparkline',
		icon: 'fa-chart-area',
		category: 'display',
		group: 'panel',
		description:
			'A sparkline chart embedded inside a panel element. Wraps the standalone Sparkline component for use within the Panel system.',
		properties: [
			{ name: 'title', type: 'String', default: '""', description: 'Label text' },
			{ name: 'id', type: 'String', default: 'auto-generated', description: 'Unique identifier' }
		],
		events: [],
		codeExample: `<magx-panel-sparkline title="CPU Usage" id="spark1"></magx-panel-sparkline>`
	},
	{
		id: 'textarea',
		name: 'TextArea',
		tagName: 'magx-panel-textarea',
		icon: 'fa-align-left',
		category: 'input',
		group: 'panel',
		description:
			'A multi-line text input area. Supports placeholder text and returns the current content.',
		properties: [
			{ name: 'title', type: 'String', default: '""', description: 'Label text' },
			{
				name: 'placeholder',
				type: 'String',
				default: '""',
				description: 'Placeholder text'
			},
			{
				name: 'value',
				type: 'String',
				default: '""',
				description: 'Initial text content (attribute)'
			},
			{ name: 'id', type: 'String', default: 'auto-generated', description: 'Unique identifier' }
		],
		events: [
			{
				name: 'magx-panelValueChanged',
				detail: '{ panelId, panelElementId }',
				description: 'Fired on text change'
			}
		],
		codeExample: `<magx-panel-textarea title="Notes" id="ta1" placeholder="Type here..."></magx-panel-textarea>`
	},
	{
		id: 'textinput',
		name: 'TextInput',
		tagName: 'magx-panel-textinput',
		icon: 'fa-i-cursor',
		category: 'input',
		group: 'panel',
		description:
			'A single-line text input. Supports text, number, and password modes with optional min/max validation for numbers.',
		properties: [
			{ name: 'title', type: 'String', default: '""', description: 'Label text' },
			{
				name: 'type',
				type: 'String',
				default: '"text"',
				description: '"text", "number", or "password"'
			},
			{ name: 'placeholder', type: 'String', default: '""', description: 'Placeholder text' },
			{
				name: 'value',
				type: 'String',
				default: '""',
				description: 'Initial value (attribute)'
			},
			{
				name: 'maxlength',
				type: 'Number',
				default: '524288',
				description: 'Maximum character length'
			},
			{
				name: 'min',
				type: 'Number',
				default: 'MIN_VALUE',
				description: 'Min value (number type only)'
			},
			{
				name: 'max',
				type: 'Number',
				default: 'MAX_VALUE',
				description: 'Max value (number type only)'
			},
			{ name: 'id', type: 'String', default: 'auto-generated', description: 'Unique identifier' }
		],
		events: [
			{
				name: 'magx-panelValueChanged',
				detail: '{ panelId, panelElementId }',
				description: 'Fired on input change'
			}
		],
		codeExample: `<magx-panel-textinput title="Username" id="ti1" placeholder="Enter name..." type="text"></magx-panel-textinput>`
	},
	{
		id: 'time',
		name: 'Time',
		tagName: 'magx-panel-time',
		icon: 'fa-clock',
		category: 'input',
		group: 'panel',
		description:
			'A time picker element using the native HTML time input. Returns the selected time string.',
		properties: [
			{ name: 'title', type: 'String', default: '""', description: 'Label text' },
			{ name: 'id', type: 'String', default: 'auto-generated', description: 'Unique identifier' }
		],
		events: [
			{
				name: 'magx-panelValueChanged',
				detail: '{ panelId, panelElementId }',
				description: 'Fired on time change'
			}
		],
		codeExample: `<magx-panel-time title="Alarm" id="time1"></magx-panel-time>`
	},
	{
		id: 'sparkline',
		name: 'Sparkline (Standalone)',
		tagName: 'magx-sparkline',
		icon: 'fa-chart-line',
		category: 'canvas',
		group: 'sparkline',
		description:
			'A standalone canvas-based sparkline component. Supports line charts, bar charts, area fills, reference lines, endpoints, and gradient coloring. Highly configurable with 30+ options for rendering style, bounds, and data management.',
		properties: [
			{ name: 'width', type: 'Number', default: '200', description: 'Canvas width in pixels' },
			{ name: 'height', type: 'Number', default: '50', description: 'Canvas height in pixels' }
		],
		events: [],
		codeExample: `<magx-sparkline id="chart1" style="width: 200px; height: 60px;"></magx-sparkline>`,
		programmaticExample: `const spark = document.getElementById('chart1');
spark.setDataPointNum(30);
spark.setSparklineType(SparklineType.Line);
spark.setLine(Linetype.Straight, 2, { r: 50, g: 50, b: 50, a: 1.0 });
for (let i = 0; i < 30; i++) {
  spark.addDataPoint(Math.random() * 100);
}
spark.renderCanvas();`
	}
];
