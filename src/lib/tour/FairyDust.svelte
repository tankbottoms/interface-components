<script lang="ts">
	/**
	 * Fairy-dust emitter — the tour's focus effect and its cursor trail.
	 *
	 * One fixed, pointer-transparent canvas covers the viewport. Two emitters
	 * feed it: a *tracer* that walks the perimeter of the current target so the
	 * highlight reads as a live ring rather than a drawn box, and the *cursor*,
	 * so the pointer keeps sparkling while the tour is up. Particles are plain
	 * objects in one flat array with a hard cap — a tour can be left open for a
	 * long time and an unbounded emitter is how these effects become a fan.
	 *
	 * Everything honours `prefers-reduced-motion`: the canvas simply never
	 * starts, and the ring drawn by GuidedTour carries the highlight alone.
	 */
	interface Props {
		/** Viewport rect of the element being highlighted, or null for none. */
		rect?: { x: number; y: number; width: number; height: number } | null;
		/** Emit a burst — bump this (e.g. the step index) to fire one. */
		burst?: number;
		/** Follow the pointer as well as the ring. */
		cursor?: boolean;
		/** Master switch. */
		active?: boolean;
	}

	let { rect = null, burst = 0, cursor = true, active = true }: Props = $props();

	const MAX = 220;
	const CORNER = 6;

	interface P {
		x: number;
		y: number;
		vx: number;
		vy: number;
		life: number;
		max: number;
		size: number;
		spin: number;
		hue: 0 | 1 | 2;
	}

	let canvas: HTMLCanvasElement | null = $state(null);
	let particles: P[] = [];
	let raf = 0;
	let t = 0;
	let pointer = { x: -9999, y: -9999, moved: false };
	let accent = '#3E9B72';

	function readAccent() {
		if (typeof window === 'undefined') return;
		const v = getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim();
		if (v) accent = v;
	}

	function spawn(x: number, y: number, spread: number, speed: number) {
		if (particles.length >= MAX) return;
		const a = Math.random() * Math.PI * 2;
		const s = speed * (0.35 + Math.random() * 0.9);
		const max = 620 + Math.random() * 520;
		particles.push({
			x: x + (Math.random() - 0.5) * spread,
			y: y + (Math.random() - 0.5) * spread,
			vx: Math.cos(a) * s,
			vy: Math.sin(a) * s - 0.14,
			life: 0,
			max,
			size: 1.1 + Math.random() * 2.2,
			spin: Math.random() * Math.PI,
			hue: (Math.floor(Math.random() * 3) as 0 | 1 | 2)
		});
	}

	/**
	 * Walk the rounded perimeter of the rect. `u` is 0..1 around the loop; the
	 * four sides are parameterised by length so the tracer moves at a constant
	 * speed instead of racing along the short edges.
	 */
	function perimeterPoint(r: { x: number; y: number; width: number; height: number }, u: number) {
		const w = Math.max(1, r.width);
		const h = Math.max(1, r.height);
		const per = 2 * (w + h);
		let d = (u % 1) * per;
		if (d < w) return { x: r.x + d, y: r.y };
		d -= w;
		if (d < h) return { x: r.x + w, y: r.y + d };
		d -= h;
		if (d < w) return { x: r.x + w - d, y: r.y + h };
		d -= w;
		return { x: r.x, y: r.y + h - d };
	}

	function draw(dt: number) {
		const c = canvas;
		if (!c) return;
		const ctx = c.getContext('2d');
		if (!ctx) return;
		const dpr = Math.min(2, window.devicePixelRatio || 1);
		const w = window.innerWidth;
		const h = window.innerHeight;
		if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) {
			c.width = Math.round(w * dpr);
			c.height = Math.round(h * dpr);
			c.style.width = w + 'px';
			c.style.height = h + 'px';
		}
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		ctx.clearRect(0, 0, w, h);

		for (let i = particles.length - 1; i >= 0; i--) {
			const p = particles[i];
			p.life += dt;
			if (p.life >= p.max) {
				particles.splice(i, 1);
				continue;
			}
			const k = p.life / p.max;
			p.x += p.vx * dt * 0.06;
			p.y += p.vy * dt * 0.06 + k * dt * 0.004;
			p.vx *= 0.985;
			p.vy *= 0.985;

			const alpha = k < 0.18 ? k / 0.18 : 1 - (k - 0.18) / 0.82;
			const size = p.size * (1 - k * 0.5);
			ctx.save();
			ctx.globalAlpha = Math.max(0, alpha) * 0.9;
			ctx.translate(p.x, p.y);
			ctx.rotate(p.spin + k * 2.4);
			ctx.fillStyle = p.hue === 0 ? accent : p.hue === 1 ? '#FFFFFF' : '#FFE9A8';
			ctx.shadowColor = accent;
			ctx.shadowBlur = 6;
			/* A four-point star, not a dot — dust should twinkle, not fizz. */
			ctx.beginPath();
			ctx.moveTo(0, -size * 2.2);
			ctx.quadraticCurveTo(0, 0, size * 2.2, 0);
			ctx.quadraticCurveTo(0, 0, 0, size * 2.2);
			ctx.quadraticCurveTo(0, 0, -size * 2.2, 0);
			ctx.quadraticCurveTo(0, 0, 0, -size * 2.2);
			ctx.fill();
			ctx.restore();
		}
	}

	function onMove(e: PointerEvent) {
		pointer = { x: e.clientX, y: e.clientY, moved: true };
	}

	$effect(() => {
		if (typeof window === 'undefined') return;
		if (!active) return;
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		readAccent();
		window.addEventListener('pointermove', onMove, { passive: true });

		let last = performance.now();
		let emitAcc = 0;
		const loop = (now: number) => {
			const dt = Math.min(48, now - last);
			last = now;
			t += dt;

			const r = rect;
			if (r) {
				/* Two tracers on opposite sides of the loop keep a wide card lit. */
				const u = (t / 2600) % 1;
				for (const off of [0, 0.5]) {
					const pt = perimeterPoint(r, u + off);
					spawn(pt.x, pt.y, 5, 0.5);
				}
			}
			emitAcc += dt;
			if (cursor && pointer.moved && emitAcc > 26) {
				emitAcc = 0;
				spawn(pointer.x, pointer.y, 3, 0.42);
			}
			draw(dt);
			raf = requestAnimationFrame(loop);
		};
		raf = requestAnimationFrame(loop);

		return () => {
			cancelAnimationFrame(raf);
			window.removeEventListener('pointermove', onMove);
			particles = [];
		};
	});

	/* A burst on every step change — the arrival, not the dwell, is the signal. */
	$effect(() => {
		const n = burst;
		void n;
		const r = rect;
		if (!r || typeof window === 'undefined') return;
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		readAccent();
		for (let i = 0; i < 26; i++) {
			const pt = perimeterPoint(r, i / 26);
			spawn(pt.x, pt.y, CORNER, 1.5);
		}
	});
</script>

<canvas bind:this={canvas} class="fairydust" aria-hidden="true"></canvas>

<style>
	.fairydust {
		position: fixed;
		inset: 0;
		z-index: 9998;
		pointer-events: none;
	}
</style>
