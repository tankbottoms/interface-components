// Client-only: register all magx Lit custom elements and inject Panel CSS
// esbuild strips @customElement class decorators, so we register manually.

import panelCssLight from 'magx-panel/../public/Panel.css?raw';
import panelCssDark from 'magx-panel/../public/Panel-Black.css?raw';
import { demoTheme } from '$lib/stores/demoTheme';
import { MagxPanel } from 'magx-panel/Panel';
import { MagxPanelButton } from 'magx-panel/Panel-Button';
import { MagxPanelCheckbox } from 'magx-panel/Panel-Checkbox';
import { MagxPanelColorPicker } from 'magx-panel/Panel-ColorPicker';
import { MagxPanelDate } from 'magx-panel/Panel-Date';
import { MagxPanelDropdown } from 'magx-panel/Panel-DropDown';
import { MagxPanelFileChooser } from 'magx-panel/Panel-FileChooser';
import { MagxPanelHTML } from 'magx-panel/Panel-HTML';
import { MagxPanelImage } from 'magx-panel/Panel-Image';
import { MagxPanelProgressBar } from 'magx-panel/Panel-ProgressBar';
import { MagxPanelRange } from 'magx-panel/Panel-Range';
import { MagxPanelSparkline } from 'magx-panel/Panel-Sparkline';
import { MagxPanelTextArea } from 'magx-panel/Panel-TextArea';
import { MagxPanelTextInput } from 'magx-panel/Panel-TextInput';
import { MagxPanelTime } from 'magx-panel/Panel-Time';
import { MagxSparkline } from 'magx-sparkline/Sparkline';

// Inject Panel CSS (default to light)
const style = document.createElement('style');
style.id = 'magx-panel-css';
style.textContent = panelCssLight;
document.head.appendChild(style);

// Swap Panel CSS when demo theme changes, and update panel-sparkline backgrounds
demoTheme.subscribe((theme) => {
	style.textContent = theme === 'dark' ? panelCssDark : panelCssLight;

	// Update panel-sparkline canvas backgrounds after CSS swap
	requestAnimationFrame(() => {
		const panelSparklines = document.querySelectorAll('magx-panel-sparkline');
		for (const el of panelSparklines) {
			const sparkline = (el as any).getSparkline?.();
			if (!sparkline) continue;
			const container = (el as any).shadowRoot?.getElementById('container');
			if (!container) continue;
			const bg = window.getComputedStyle(container).getPropertyValue('--magx-panel-container-bg').trim();
			if (bg.startsWith('#')) {
				const hex = bg.substring(1);
				const r = parseInt(hex.substring(0, 2), 16);
				const g = parseInt(hex.substring(2, 4), 16);
				const b = parseInt(hex.substring(4, 6), 16);
				sparkline.setBackgroundColor({ r, g, b, a: 1.0 });
				sparkline.renderCanvas();
			}
		}
	});
});

// Manually register custom elements (decorators are stripped by esbuild)
const defs: [string, CustomElementConstructor][] = [
	['magx-panel', MagxPanel],
	['magx-panel-button', MagxPanelButton],
	['magx-panel-checkbox', MagxPanelCheckbox],
	['magx-panel-colorpicker', MagxPanelColorPicker],
	['magx-panel-date', MagxPanelDate],
	['magx-panel-dropdown', MagxPanelDropdown],
	['magx-panel-filechooser', MagxPanelFileChooser],
	['magx-panel-html', MagxPanelHTML],
	['magx-panel-image', MagxPanelImage],
	['magx-panel-progressbar', MagxPanelProgressBar],
	['magx-panel-range', MagxPanelRange],
	['magx-panel-sparkline', MagxPanelSparkline],
	['magx-panel-textarea', MagxPanelTextArea],
	['magx-panel-textinput', MagxPanelTextInput],
	['magx-panel-time', MagxPanelTime],
	['magx-sparkline', MagxSparkline],
];

for (const [tag, ctor] of defs) {
	if (!customElements.get(tag)) {
		customElements.define(tag, ctor);
	}
}

// Initialize panel-sparkline with live streaming data after elements upgrade
function initPanelSparkline() {
	const el = document.getElementById('demo-panel-sparkline') as any;
	if (!el) return;

	// Wait for the Lit element to finish its first render
	customElements.whenDefined('magx-panel-sparkline').then(() => {
		setTimeout(() => {
			const sparkline = el.getSparkline?.();
			if (!sparkline) return;

			sparkline.setDataPointNum(30);
			sparkline.setType('line' as any);
			sparkline.setLineColor?.('solid' as any, { r: 124, g: 58, b: 237, a: 1 });
			sparkline.setFill?.('gradient' as any, {
				above: { r: 124, g: 58, b: 237, a: 0.4 },
				below: { r: 124, g: 58, b: 237, a: 0.05 }
			});
			sparkline.setReferenceLine?.('average' as any);
			sparkline.setReferenceLineColor?.({ r: 200, g: 200, b: 200, a: 0.4 }, 1);

			// Seed with initial data
			const seed = [35, 42, 38, 55, 48, 62, 45, 58, 40, 52, 65, 48, 55, 70, 60, 45, 50, 68, 55, 42];
			for (const v of seed) sparkline.addDatapoint(v);
			sparkline.renderCanvas();

			// Stream new data every 800ms
			let val = 50;
			setInterval(() => {
				val = Math.max(5, Math.min(95, val + (Math.random() - 0.48) * 15));
				sparkline.addDatapoint(val);
				sparkline.renderCanvas();
			}, 800);
		}, 500);
	});
}

// Run sparkline init after page loads
if (document.readyState === 'complete') {
	initPanelSparkline();
} else {
	window.addEventListener('load', initPanelSparkline);
}
