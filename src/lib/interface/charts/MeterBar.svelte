<script lang="ts">
	/**
	 * Labelled meter — gpumon's UTIL / MEM / PWR rows. The label sits inside the
	 * bar on a pastel plate so the row reads as one object at a glance, and the
	 * fill colour steps through the status ramp as it crosses thresholds.
	 */
	let {
		label = '',
		value = 0,
		max = 100,
		display = '',
		warn = 70,
		crit = 90,
		token = ''
	}: {
		label?: string;
		value?: number;
		max?: number;
		display?: string;
		warn?: number;
		crit?: number;
		/** Force a palette token instead of using the status ramp. */
		token?: string;
	} = $props();

	const pct = $derived(Math.max(0, Math.min(100, (value / max) * 100)));
	const fill = $derived(
		token
			? `var(--pastel-${token})`
			: pct >= crit
				? 'var(--status-crit)'
				: pct >= warn
					? 'var(--status-warn)'
					: 'var(--status-ok)'
	);
</script>

<div class="ifc-meter" title="{label} {pct.toFixed(0)}%">
	<div class="ifc-meter-fill" style="width:{pct}%;background:{fill}"></div>
	<span class="ifc-meter-label">{label}</span>
	<span class="ifc-meter-value">{display || `${pct.toFixed(0)}%`}</span>
</div>
