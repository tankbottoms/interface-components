<script lang="ts">
	import { componentDefs } from '$lib/data/components';
	import { searchQuery } from '$lib/stores/search';
	import HeroSection from '$lib/components/HeroSection.svelte';
	import ComponentCard from '$lib/components/ComponentCard.svelte';
	import DemoContainer from '$lib/components/DemoContainer.svelte';
	import FontAwesomeSection from '$lib/components/FontAwesomeSection.svelte';

	const filtered = $derived(
		componentDefs.filter((c) => {
			const q = $searchQuery.toLowerCase();
			if (!q) return true;
			return (
				c.name.toLowerCase().includes(q) ||
				c.tagName.toLowerCase().includes(q) ||
				c.category.toLowerCase().includes(q) ||
				c.description.toLowerCase().includes(q)
			);
		})
	);
</script>

<svelte:head>
	<title>Interface Components - Lit Web Component Library</title>
	<meta
		name="description"
		content="Documentation and live demos for magx draggable panel components and sparkline charts."
	/>
</svelte:head>

<HeroSection components={componentDefs} />

{#each filtered as comp (comp.id)}
	<ComponentCard component={comp}>
		{#if comp.id === 'panel'}
			<DemoContainer>
				{#snippet children()}
					<div style="position: relative; min-height: 350px;">
						<magx-panel id="demo-panel" title="Demo Panel" x="10" y="10">
							<magx-panel-checkbox title="Bounds Check" checked></magx-panel-checkbox>
							<magx-panel-textinput title="Name" placeholder="Type here..."></magx-panel-textinput>
							<magx-panel-range title="Volume" min="0" max="100" step="5" value="50"
							></magx-panel-range>
							<magx-panel-colorpicker title="Color" value="#7c3aed"></magx-panel-colorpicker>
							<magx-panel-button title="Click Me"></magx-panel-button>
						</magx-panel>
					</div>
				{/snippet}
			</DemoContainer>
		{:else if comp.id === 'button'}
			<DemoContainer>
				{#snippet children()}
					<div style="position: relative; min-height: 250px;">
						<magx-panel title="Button Demo" x="10" y="10" closebutton="false">
							<magx-panel-button title="Primary Action"></magx-panel-button>
							<magx-panel-button title="Secondary"></magx-panel-button>
						</magx-panel>
					</div>
				{/snippet}
			</DemoContainer>
		{:else if comp.id === 'checkbox'}
			<DemoContainer>
				{#snippet children()}
					<div style="position: relative; min-height: 250px;">
						<magx-panel title="Checkbox Demo" x="10" y="10" closebutton="false">
							<magx-panel-checkbox title="Option A" checked></magx-panel-checkbox>
							<magx-panel-checkbox title="Option B"></magx-panel-checkbox>
						</magx-panel>
					</div>
				{/snippet}
			</DemoContainer>
		{:else if comp.id === 'colorpicker'}
			<DemoContainer>
				{#snippet children()}
					<div style="position: relative; min-height: 250px;">
						<magx-panel title="Color Picker Demo" x="10" y="10" closebutton="false">
							<magx-panel-colorpicker title="Foreground" value="#2563eb"></magx-panel-colorpicker>
							<magx-panel-colorpicker title="Background" value="#1a1b26"></magx-panel-colorpicker>
						</magx-panel>
					</div>
				{/snippet}
			</DemoContainer>
		{:else if comp.id === 'date'}
			<DemoContainer>
				{#snippet children()}
					<div style="position: relative; min-height: 250px;">
						<magx-panel title="Date Demo" x="10" y="10" closebutton="false">
							<magx-panel-date title="Start Date"></magx-panel-date>
							<magx-panel-date title="End Date"></magx-panel-date>
						</magx-panel>
					</div>
				{/snippet}
			</DemoContainer>
		{:else if comp.id === 'dropdown'}
			<DemoContainer>
				{#snippet children()}
					<div style="position: relative; min-height: 250px;">
						<magx-panel title="Dropdown Demo" x="10" y="10" closebutton="false">
							<magx-panel-dropdown title="Difficulty" index="1">
								<option label="Easy">Easy</option>
								<option label="Normal">Normal</option>
								<option label="Hard">Hard</option>
							</magx-panel-dropdown>
						</magx-panel>
					</div>
				{/snippet}
			</DemoContainer>
		{:else if comp.id === 'filechooser'}
			<DemoContainer>
				{#snippet children()}
					<div style="position: relative; min-height: 250px;">
						<magx-panel title="File Chooser Demo" x="10" y="10" closebutton="false">
							<magx-panel-filechooser title="Upload" placeholderLabel="Choose a file..."
							></magx-panel-filechooser>
						</magx-panel>
					</div>
				{/snippet}
			</DemoContainer>
		{:else if comp.id === 'html'}
			<DemoContainer>
				{#snippet children()}
					<div style="position: relative; min-height: 250px;">
						<magx-panel title="HTML Demo" x="10" y="10" closebutton="false">
							<magx-panel-html title="Custom Content">
								<p style="color: #7c3aed; margin: 4px;">
									<b>Bold</b>, <i>italic</i>, and <u>underlined</u> text
								</p>
							</magx-panel-html>
						</magx-panel>
					</div>
				{/snippet}
			</DemoContainer>
		{:else if comp.id === 'image'}
			<DemoContainer>
				{#snippet children()}
					<div style="position: relative; min-height: 250px;">
						<magx-panel title="Image Demo" x="10" y="10" closebutton="false">
							<magx-panel-image title="Screenshot" src="/screenshots/sparkline-examples.png"
							></magx-panel-image>
						</magx-panel>
					</div>
				{/snippet}
			</DemoContainer>
		{:else if comp.id === 'progressbar'}
			<DemoContainer>
				{#snippet children()}
					<div style="position: relative; min-height: 250px;">
						<magx-panel title="Progress Demo" x="10" y="10" closebutton="false">
							<magx-panel-progressbar title="Upload" id="demo-pb" currentValue="65" maxValue="100"
							></magx-panel-progressbar>
						</magx-panel>
					</div>
				{/snippet}
			</DemoContainer>
		{:else if comp.id === 'range'}
			<DemoContainer>
				{#snippet children()}
					<div style="position: relative; min-height: 250px;">
						<magx-panel title="Range Demo" x="10" y="10" closebutton="false">
							<magx-panel-range title="Brightness" min="0" max="100" step="1" value="75"
							></magx-panel-range>
							<magx-panel-range title="Contrast" min="-50" max="50" step="5" value="0"
							></magx-panel-range>
						</magx-panel>
					</div>
				{/snippet}
			</DemoContainer>
		{:else if comp.id === 'panel-sparkline'}
			<DemoContainer>
				{#snippet children()}
					<div style="position: relative; min-height: 250px;">
						<magx-panel title="Panel Sparkline Demo" x="10" y="10" closebutton="false">
							<magx-panel-sparkline title="CPU Usage" id="demo-panel-sparkline"></magx-panel-sparkline>
						</magx-panel>
					</div>
				{/snippet}
			</DemoContainer>
		{:else if comp.id === 'textarea'}
			<DemoContainer>
				{#snippet children()}
					<div style="position: relative; min-height: 250px;">
						<magx-panel title="TextArea Demo" x="10" y="10" closebutton="false">
							<magx-panel-textarea title="Notes" placeholder="Type your notes here..."
							></magx-panel-textarea>
						</magx-panel>
					</div>
				{/snippet}
			</DemoContainer>
		{:else if comp.id === 'textinput'}
			<DemoContainer>
				{#snippet children()}
					<div style="position: relative; min-height: 250px;">
						<magx-panel title="TextInput Demo" x="10" y="10" closebutton="false">
							<magx-panel-textinput title="Username" placeholder="Enter name..." type="text"
							></magx-panel-textinput>
							<magx-panel-textinput title="Age" type="number" min="0" max="150"
							></magx-panel-textinput>
							<magx-panel-textinput title="Password" type="password" placeholder="Secret..."
							></magx-panel-textinput>
						</magx-panel>
					</div>
				{/snippet}
			</DemoContainer>
		{:else if comp.id === 'time'}
			<DemoContainer>
				{#snippet children()}
					<div style="position: relative; min-height: 250px;">
						<magx-panel title="Time Demo" x="10" y="10" closebutton="false">
							<magx-panel-time title="Alarm Time"></magx-panel-time>
						</magx-panel>
					</div>
				{/snippet}
			</DemoContainer>
		{:else if comp.id === 'sparkline'}
			<DemoContainer>
				{#snippet children()}
					<div
						style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px;"
					>
						<!-- 1. Line — gradient fill, average ref line -->
						<div>
							<div class="spark-label">Line / Gradient Fill</div>
							<magx-sparkline
								type="line"
								data="3,7,2,9,4,8,1,6,5,10,3,7,8,4,6,9,2,5,8,7"
								lineCol="rgba(124,58,237,1)"
								filltype="gradient"
								fillAboveCol="rgba(124,58,237,0.4)"
								fillBelowCol="rgba(124,58,237,0.05)"
								lineWidth="2"
								refLineType="average"
								refLineCol="rgba(200,200,200,0.5)"
								bckgCol="rgba(0,0,0,0)"
								style="width: 200px; height: 60px; display: block;"
							></magx-sparkline>
						</div>
						<!-- 2. Bar — solid fill, bordered -->
						<div>
							<div class="spark-label">Bar / Bordered</div>
							<magx-sparkline
								type="bar"
								data="5,12,8,15,3,10,7,14,6,11,9,13,4,8,16,5,10,12,7,9"
								lineCol="rgba(37,99,235,1)"
								filltype="solid"
								fillCol="rgba(37,99,235,0.6)"
								bckgCol="rgba(0,0,0,0)"
								style="width: 200px; height: 60px; display: block;"
							></magx-sparkline>
						</div>
						<!-- 3. Line — above/below dual color -->
						<div>
							<div class="spark-label">Line / Above-Below</div>
							<magx-sparkline
								type="line"
								data="-3,2,5,-1,4,-2,7,1,-4,3,6,-2,1,5,-3,2,4,-1,3,-2"
								lineType="firstlastdiff"
								lineAboveCol="rgba(34,197,94,1)"
								lineBelowCol="rgba(239,68,68,1)"
								filltype="aboveonecolbelowonecol"
								fillAboveCol="rgba(34,197,94,0.3)"
								fillBelowCol="rgba(239,68,68,0.3)"
								lineWidth="2"
								refLineType="middle"
								refLineCol="rgba(200,200,200,0.4)"
								bckgCol="rgba(0,0,0,0)"
								style="width: 200px; height: 60px; display: block;"
							></magx-sparkline>
						</div>
						<!-- 4. Line — endpoint marker -->
						<div>
							<div class="spark-label">Line / Endpoint Dot</div>
							<magx-sparkline
								type="line"
								data="2,4,3,8,6,9,5,7,10,8,12,11,9,13,10,14,12,15,11,16"
								lineCol="rgba(234,179,8,1)"
								filltype="solid"
								fillCol="rgba(234,179,8,0.15)"
								lineWidth="2"
								endpointCol="rgba(234,179,8,1)"
								endpointRadius="4"
								bckgCol="rgba(0,0,0,0)"
								style="width: 200px; height: 60px; display: block;"
							></magx-sparkline>
						</div>
						<!-- 5. Bar — no border, solid fill -->
						<div>
							<div class="spark-label">Bar / No Border</div>
							<magx-sparkline
								type="bar"
								data="8,14,6,18,10,16,4,12,20,9,15,7,17,11,13,5,19,8,14,10"
								lineCol="rgba(0,0,0,0)"
								filltype="solid"
								fillCol="rgba(16,185,129,0.7)"
								bckgCol="rgba(0,0,0,0)"
								style="width: 200px; height: 60px; display: block;"
							></magx-sparkline>
						</div>
						<!-- 6. Line — thin, no fill, median ref -->
						<div>
							<div class="spark-label">Line / Thin + Median</div>
							<magx-sparkline
								type="line"
								data="12,8,15,6,14,9,11,7,16,10,13,5,17,8,12,9,14,6,11,15"
								lineCol="rgba(239,68,68,1)"
								filltype="solid"
								fillCol="rgba(0,0,0,0)"
								lineWidth="1"
								refLineType="median"
								refLineCol="rgba(239,68,68,0.3)"
								bckgCol="rgba(0,0,0,0)"
								style="width: 200px; height: 60px; display: block;"
							></magx-sparkline>
						</div>
						<!-- 7. Bar — gradient fill -->
						<div>
							<div class="spark-label">Bar / Gradient Fill</div>
							<magx-sparkline
								type="bar"
								data="3,9,5,14,7,12,2,16,8,11,6,15,4,10,13,7,9,17,5,11"
								lineCol="rgba(168,85,247,0.8)"
								filltype="gradient"
								fillAboveCol="rgba(168,85,247,0.6)"
								fillBelowCol="rgba(168,85,247,0.1)"
								bckgCol="rgba(0,0,0,0)"
								style="width: 200px; height: 60px; display: block;"
							></magx-sparkline>
						</div>
						<!-- 8. Line — thick, solid fill, no ref -->
						<div>
							<div class="spark-label">Line / Thick + Solid</div>
							<magx-sparkline
								type="line"
								data="1,3,2,5,4,7,6,9,8,10,9,8,7,6,5,4,3,2,3,5"
								lineCol="rgba(6,182,212,1)"
								filltype="solid"
								fillCol="rgba(6,182,212,0.25)"
								lineWidth="3"
								bckgCol="rgba(0,0,0,0)"
								style="width: 200px; height: 60px; display: block;"
							></magx-sparkline>
						</div>
						<!-- 9. Line — first data point ref -->
						<div>
							<div class="spark-label">Line / First Point Ref</div>
							<magx-sparkline
								type="line"
								data="10,12,9,14,8,15,7,16,11,13,10,17,9,14,12,8,15,11,13,16"
								lineCol="rgba(244,63,94,1)"
								filltype="gradient"
								fillAboveCol="rgba(244,63,94,0.3)"
								fillBelowCol="rgba(244,63,94,0.05)"
								lineWidth="2"
								refLineType="firstdatapoint"
								refLineCol="rgba(244,63,94,0.4)"
								bckgCol="rgba(0,0,0,0)"
								style="width: 200px; height: 60px; display: block;"
							></magx-sparkline>
						</div>
						<!-- 10. Bar — above/below dual color -->
						<div>
							<div class="spark-label">Bar / Above-Below</div>
							<magx-sparkline
								type="bar"
								data="-5,8,-3,12,-7,6,-2,10,-4,9,-1,7,-6,11,-3,8,-5,4,-2,10"
								lineType="abovebelow"
								lineAboveCol="rgba(34,197,94,0.9)"
								lineBelowCol="rgba(239,68,68,0.9)"
								filltype="aboveonecolbelowonecol"
								fillAboveCol="rgba(34,197,94,0.4)"
								fillBelowCol="rgba(239,68,68,0.4)"
								refLineType="middle"
								refLineCol="rgba(150,150,150,0.3)"
								bckgCol="rgba(0,0,0,0)"
								style="width: 200px; height: 60px; display: block;"
							></magx-sparkline>
						</div>
						<!-- 11. Line — minimal, hairline -->
						<div>
							<div class="spark-label">Line / Hairline</div>
							<magx-sparkline
								type="line"
								data="5,8,3,12,6,10,4,14,7,11,9,6,13,5,10,8,12,4,9,7"
								lineCol="rgba(100,116,139,1)"
								filltype="solid"
								fillCol="rgba(0,0,0,0)"
								lineWidth="0.5"
								bckgCol="rgba(0,0,0,0)"
								style="width: 200px; height: 60px; display: block;"
							></magx-sparkline>
						</div>
						<!-- 12. Bar — tall narrow, bordered, no fill -->
						<div>
							<div class="spark-label">Bar / Outline Only</div>
							<magx-sparkline
								type="bar"
								data="4,18,7,15,2,20,9,13,6,17,3,14,8,19,5,16,10,12,1,18"
								lineCol="rgba(251,146,60,1)"
								filltype="solid"
								fillCol="rgba(0,0,0,0)"
								bckgCol="rgba(0,0,0,0)"
								style="width: 200px; height: 60px; display: block;"
							></magx-sparkline>
						</div>
						<!-- 13. Line — gradient, capped values -->
						<div>
							<div class="spark-label">Line / Capped Values</div>
							<magx-sparkline
								type="line"
								data="2,25,5,30,8,3,28,6,22,10,35,4,18,7,26,9,32,5,20,12"
								lineCol="rgba(59,130,246,1)"
								filltype="gradient"
								fillAboveCol="rgba(59,130,246,0.35)"
								fillBelowCol="rgba(59,130,246,0.05)"
								lineWidth="2"
								capAbove="true"
								capBelow="true"
								upperBound="25"
								lowerBound="3"
								bckgCol="rgba(0,0,0,0)"
								style="width: 200px; height: 60px; display: block;"
							></magx-sparkline>
						</div>
						<!-- 14. Line — above/below with endpoint -->
						<div>
							<div class="spark-label">Line / Dual + Endpoint</div>
							<magx-sparkline
								type="line"
								data="-2,4,-1,6,3,-3,5,0,-4,7,2,-5,8,1,-2,6,-1,4,3,-3"
								lineType="firstlastdiff"
								lineAboveCol="rgba(16,185,129,1)"
								lineBelowCol="rgba(236,72,153,1)"
								filltype="solid"
								fillCol="rgba(0,0,0,0)"
								lineWidth="2"
								endpointCol="rgba(255,255,255,1)"
								endpointRadius="3"
								refLineType="middle"
								refLineCol="rgba(150,150,150,0.3)"
								bckgCol="rgba(0,0,0,0)"
								style="width: 200px; height: 60px; display: block;"
							></magx-sparkline>
						</div>
						<!-- 15. Bar — solid fill, average ref -->
						<div>
							<div class="spark-label">Bar / Avg Reference</div>
							<magx-sparkline
								type="bar"
								data="10,6,14,3,18,8,12,5,16,9,11,7,15,4,13,10,17,6,14,8"
								lineCol="rgba(14,165,233,0.7)"
								filltype="solid"
								fillCol="rgba(14,165,233,0.45)"
								refLineType="average"
								refLineCol="rgba(14,165,233,0.6)"
								refLineWidth="2"
								bckgCol="rgba(0,0,0,0)"
								style="width: 200px; height: 60px; display: block;"
							></magx-sparkline>
						</div>
						<!-- 16. Line — dense data, gradient -->
						<div>
							<div class="spark-label">Line / Dense Data</div>
							<magx-sparkline
								type="line"
								data="5,6,4,7,5,8,6,9,7,8,6,7,8,9,10,9,8,7,6,5,4,5,6,7,8,9,10,11,10,9,8,7,6,5,6,7,8,9,10,8"
								lineCol="rgba(139,92,246,1)"
								filltype="gradient"
								fillAboveCol="rgba(139,92,246,0.3)"
								fillBelowCol="rgba(139,92,246,0.02)"
								lineWidth="1.5"
								bckgCol="rgba(0,0,0,0)"
								style="width: 200px; height: 60px; display: block;"
							></magx-sparkline>
						</div>
						<!-- 17. Bar — wide, no border, gradient -->
						<div>
							<div class="spark-label">Bar / Wide Gradient</div>
							<magx-sparkline
								type="bar"
								data="12,8,15,6,18,10,14"
								lineCol="rgba(0,0,0,0)"
								filltype="gradient"
								fillAboveCol="rgba(245,158,11,0.7)"
								fillBelowCol="rgba(245,158,11,0.15)"
								bckgCol="rgba(0,0,0,0)"
								style="width: 200px; height: 60px; display: block;"
							></magx-sparkline>
						</div>
						<!-- 18. Line — custom ref line position -->
						<div>
							<div class="spark-label">Line / Custom Ref</div>
							<magx-sparkline
								type="line"
								data="20,35,25,40,30,45,28,50,33,42,27,38,32,44,29,41,34,46,31,43"
								lineCol="rgba(220,38,38,1)"
								filltype="solid"
								fillCol="rgba(220,38,38,0.1)"
								lineWidth="2"
								refLineType="custom"
								refLineYPos="35"
								refLineCol="rgba(220,38,38,0.5)"
								refLineWidth="1"
								bckgCol="rgba(0,0,0,0)"
								style="width: 200px; height: 60px; display: block;"
							></magx-sparkline>
						</div>
						<!-- 19. Bar — dual color, median ref -->
						<div>
							<div class="spark-label">Bar / Dual + Median</div>
							<magx-sparkline
								type="bar"
								data="-8,5,-12,9,-3,14,-6,11,-10,7,-1,13,-5,8,-9,6,-2,15,-7,10"
								lineType="abovebelow"
								lineAboveCol="rgba(52,211,153,0.8)"
								lineBelowCol="rgba(251,113,133,0.8)"
								filltype="aboveonecolbelowonecol"
								fillAboveCol="rgba(52,211,153,0.35)"
								fillBelowCol="rgba(251,113,133,0.35)"
								refLineType="median"
								refLineCol="rgba(150,150,150,0.4)"
								bckgCol="rgba(0,0,0,0)"
								style="width: 200px; height: 60px; display: block;"
							></magx-sparkline>
						</div>
						<!-- 20. Line — monotone uptrend, solid fill -->
						<div>
							<div class="spark-label">Line / Uptrend</div>
							<magx-sparkline
								type="line"
								data="2,3,4,3,5,6,5,7,8,7,9,10,9,11,12,11,13,14,13,15"
								lineCol="rgba(34,197,94,1)"
								filltype="solid"
								fillCol="rgba(34,197,94,0.2)"
								lineWidth="2"
								endpointCol="rgba(34,197,94,1)"
								endpointRadius="3"
								bckgCol="rgba(0,0,0,0)"
								style="width: 200px; height: 60px; display: block;"
							></magx-sparkline>
						</div>
						<!-- 21. Line — downtrend, red gradient -->
						<div>
							<div class="spark-label">Line / Downtrend</div>
							<magx-sparkline
								type="line"
								data="18,17,16,17,15,14,15,13,12,13,11,10,11,9,8,9,7,6,7,5"
								lineCol="rgba(239,68,68,1)"
								filltype="gradient"
								fillAboveCol="rgba(239,68,68,0.35)"
								fillBelowCol="rgba(239,68,68,0.05)"
								lineWidth="2"
								endpointCol="rgba(239,68,68,1)"
								endpointRadius="3"
								bckgCol="rgba(0,0,0,0)"
								style="width: 200px; height: 60px; display: block;"
							></magx-sparkline>
						</div>
						<!-- 22. Bar — sparse, heavy border -->
						<div>
							<div class="spark-label">Bar / Heavy Border</div>
							<magx-sparkline
								type="bar"
								data="10,4,16,8,20,6,14"
								lineCol="rgba(30,41,59,1)"
								lineWidth="2"
								filltype="solid"
								fillCol="rgba(148,163,184,0.4)"
								bckgCol="rgba(0,0,0,0)"
								style="width: 200px; height: 60px; display: block;"
							></magx-sparkline>
						</div>
						<!-- 23. Line — volatile, first-last diff -->
						<div>
							<div class="spark-label">Line / Volatile</div>
							<magx-sparkline
								type="line"
								data="10,-8,15,-12,20,-5,18,-15,25,-3,22,-10,28,-7,19,-14,24,-6,21,-9"
								lineType="firstlastdiff"
								lineAboveCol="rgba(99,102,241,1)"
								lineBelowCol="rgba(249,115,22,1)"
								filltype="solid"
								fillCol="rgba(0,0,0,0)"
								lineWidth="1.5"
								refLineType="average"
								refLineCol="rgba(150,150,150,0.3)"
								bckgCol="rgba(0,0,0,0)"
								style="width: 200px; height: 60px; display: block;"
							></magx-sparkline>
						</div>
						<!-- 24. Bar — no border, dark teal -->
						<div>
							<div class="spark-label">Bar / Teal Solid</div>
							<magx-sparkline
								type="bar"
								data="7,13,5,17,9,15,3,19,8,14,6,18,10,16,4,20,11,13,7,15"
								lineCol="rgba(0,0,0,0)"
								filltype="solid"
								fillCol="rgba(20,184,166,0.65)"
								refLineType="average"
								refLineCol="rgba(20,184,166,0.5)"
								bckgCol="rgba(0,0,0,0)"
								style="width: 200px; height: 60px; display: block;"
							></magx-sparkline>
						</div>
					</div>
				{/snippet}
			</DemoContainer>
		{/if}
	</ComponentCard>
{/each}

<FontAwesomeSection />

<style>
	:global(.spark-label) {
		font-size: 0.7rem;
		font-weight: 600;
		text-transform: uppercase;
		color: var(--color-text-muted);
		margin-bottom: 4px;
		letter-spacing: 0.03em;
	}
</style>
