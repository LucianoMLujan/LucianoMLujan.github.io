/**
 * Respaldo liviano con Canvas 2D para navegadores sin WebGL.
 * Mantiene la estética de "habilidades + grafo de nodos" sin depender de Three.js.
 */

import { skills } from "../skills";

const SKILL_LABELS = skills.map((skill) => skill.name);
const COLORS = ["#a78bfa", "#60a5fa", "#34d399"];

const MONO_FONT =
	"ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

interface Glyph {
	text: string;
	color: string;
	x: number;
	y: number;
	size: number;
	speed: number;
	phase: number;
	opacity: number;
}

interface Node2D {
	x: number;
	y: number;
	vx: number;
	vy: number;
	radius: number;
}

function createGlyph(index: number, width: number, height: number): Glyph {
	return {
		text: SKILL_LABELS[index % SKILL_LABELS.length],
		color: COLORS[index % COLORS.length],
		x: Math.random() * width,
		y: Math.random() * height,
		size: 15 + Math.random() * 11,
		speed: 6 + Math.random() * 12,
		phase: Math.random() * Math.PI * 2,
		opacity: 0.14 + Math.random() * 0.1,
	};
}

function drawGlyph(
	context: CanvasRenderingContext2D,
	glyph: Glyph,
	time: number,
) {
	context.save();
	context.globalAlpha = glyph.opacity;
	context.fillStyle = glyph.color;
	context.shadowColor = glyph.color;
	context.shadowBlur = 10;
	context.font = `700 ${glyph.size}px ${MONO_FONT}`;
	context.textAlign = "center";
	context.textBaseline = "middle";
	context.fillText(
		glyph.text,
		glyph.x + Math.sin(time * 0.4 + glyph.phase) * 12,
		glyph.y,
	);
	context.restore();
}

/** Comprueba si el navegador puede crear un contexto WebGL. */
let cachedWebGLSupport: boolean | null = null;

export function hasWebGLSupport(): boolean {
	if (cachedWebGLSupport !== null) return cachedWebGLSupport;

	try {
		const canvas = document.createElement("canvas");
		const context =
			canvas.getContext("webgl2") || canvas.getContext("webgl");
		if (!context) {
			cachedWebGLSupport = false;
			return false;
		}

		context.getExtension("WEBGL_lose_context")?.loseContext();
		cachedWebGLSupport = true;
		return true;
	} catch {
		cachedWebGLSupport = false;
		return false;
	}
}

/**
 * Reemplaza el canvas WebGL por uno limpio para dibujar el respaldo 2D
 * sin arrastrar un contexto en mal estado.
 */
export function mount2DFallback(canvas: HTMLCanvasElement): HTMLCanvasElement {
	const fallback = document.createElement("canvas");
	fallback.className = canvas.className;
	fallback.classList.remove("opacity-0");
	fallback.classList.add("opacity-100");
	canvas.replaceWith(fallback);
	return fallback;
}

function prepareCanvas(canvas: HTMLCanvasElement) {	const context = canvas.getContext("2d");
	if (!context) return null;

	const dpr = Math.min(window.devicePixelRatio || 1, 2);
	const isCompact = window.innerWidth < 768;
	const reducedMotion = window.matchMedia(
		"(prefers-reduced-motion: reduce)",
	).matches;

	return { context, dpr, isCompact, reducedMotion };
}

/** Red de nodos de fondo (versión 2D). */
export function initBackground2D(canvas: HTMLCanvasElement) {
	const prepared = prepareCanvas(canvas);
	if (!prepared) return;

	const { context, dpr, isCompact, reducedMotion } = prepared;
	const nodeCount = isCompact ? 32 : 58;
	const glyphCount = isCompact ? 5 : 8;
	const linkDistance = isCompact ? 110 : 150;

	let width = 0;
	let height = 0;
	let nodes: Node2D[] = [];
	let glyphs: Glyph[] = [];
	let frameId = 0;
	let lastTimestamp = 0;

	function resize() {
		width = canvas.clientWidth || window.innerWidth;
		height = canvas.clientHeight || window.innerHeight;
		canvas.width = Math.floor(width * dpr);
		canvas.height = Math.floor(height * dpr);
		context.setTransform(dpr, 0, 0, dpr, 0, 0);

		nodes = Array.from({ length: nodeCount }, () => ({
			x: Math.random() * width,
			y: Math.random() * height,
			vx: (Math.random() - 0.5) * 9,
			vy: (Math.random() - 0.5) * 9,
			radius: 1 + Math.random() * 1.4,
		}));
		glyphs = Array.from({ length: glyphCount }, (_, index) =>
			createGlyph(
				Math.floor((index * SKILL_LABELS.length) / glyphCount),
				width,
				height,
			),
		);

		if (reducedMotion) draw(0);
	}

	function draw(time: number) {
		context.clearRect(0, 0, width, height);

		// Conexiones
		context.lineWidth = 1;
		for (let i = 0; i < nodes.length; i++) {
			const a = nodes[i];
			for (let j = i + 1; j < nodes.length; j++) {
				const b = nodes[j];
				const distance = Math.hypot(a.x - b.x, a.y - b.y);
				if (distance > linkDistance) continue;

				context.globalAlpha = (1 - distance / linkDistance) * 0.18;
				context.strokeStyle = "#60a5fa";
				context.beginPath();
				context.moveTo(a.x, a.y);
				context.lineTo(b.x, b.y);
				context.stroke();
			}
		}

		// Nodos
		context.globalAlpha = 0.55;
		context.fillStyle = "#8b5cf6";
		for (const node of nodes) {
			context.beginPath();
			context.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
			context.fill();
		}

		for (const glyph of glyphs) drawGlyph(context, glyph, time);
	}

	function frame(timestamp: number) {
		const delta = Math.min((timestamp - lastTimestamp) / 1000, 0.05);
		lastTimestamp = timestamp;

		for (const node of nodes) {
			node.x += node.vx * delta;
			node.y += node.vy * delta;
			if (node.x < -20) node.x = width + 20;
			if (node.x > width + 20) node.x = -20;
			if (node.y < -20) node.y = height + 20;
			if (node.y > height + 20) node.y = -20;
		}

		for (const glyph of glyphs) {
			glyph.y -= glyph.speed * delta;
			if (glyph.y < -40) {
				glyph.y = height + 40;
				glyph.x = Math.random() * width;
			}
		}

		draw(timestamp / 1000);

		if (!document.hidden) frameId = requestAnimationFrame(frame);
		else frameId = 0;
	}

	function start() {
		if (reducedMotion || frameId) return;
		lastTimestamp = performance.now();
		frameId = requestAnimationFrame(frame);
	}

	window.addEventListener("resize", resize);
	document.addEventListener("visibilitychange", () => {
		if (document.hidden) {
			cancelAnimationFrame(frameId);
			frameId = 0;
		} else {
			start();
		}
	});

	resize();
	start();
}

/**
 * Respaldo del hero: esfera de nodos wireframe girando + habilidades técnicas.
 */
export function initHero2D(canvas: HTMLCanvasElement) {
	const prepared = prepareCanvas(canvas);
	if (!prepared) return;

	const { context, dpr, isCompact, reducedMotion } = prepared;

	// Puntos distribuidos en una esfera (espiral de Fibonacci).
	const pointCount = 26;
	const points: { x: number; y: number; z: number }[] = [];
	const goldenAngle = Math.PI * (3 - Math.sqrt(5));

	for (let i = 0; i < pointCount; i++) {
		const y = 1 - (i / (pointCount - 1)) * 2;
		const radius = Math.sqrt(Math.max(0, 1 - y * y));
		const theta = i * goldenAngle;
		points.push({
			x: radius * Math.cos(theta),
			y,
			z: radius * Math.sin(theta),
		});
	}

	// Aristas entre puntos cercanos (se calculan una sola vez).
	const edges: [number, number][] = [];
	for (let i = 0; i < points.length; i++) {
		for (let j = i + 1; j < points.length; j++) {
			const distance = Math.hypot(
				points[i].x - points[j].x,
				points[i].y - points[j].y,
				points[i].z - points[j].z,
			);
			if (distance < 0.95) edges.push([i, j]);
		}
	}

	let width = 0;
	let height = 0;
	let centerX = 0;
	let centerY = 0;
	let radius = 100;
	let glyphs: Glyph[] = [];
	let frameId = 0;
	let lastTimestamp = 0;

	function resize() {
		width = canvas.clientWidth;
		height = canvas.clientHeight;
		if (!width || !height) return;

		canvas.width = Math.floor(width * dpr);
		canvas.height = Math.floor(height * dpr);
		context.setTransform(dpr, 0, 0, dpr, 0, 0);

		centerX = width / 2;
		centerY = height / 2;
		radius = Math.min(width, height) * (isCompact ? 0.27 : 0.21);

		const glyphCount = isCompact ? 6 : 9;
		glyphs = Array.from({ length: glyphCount }, (_, index) => ({
			...createGlyph(
				Math.floor((index * SKILL_LABELS.length) / glyphCount),
				width,
				height,
			),
			size: isCompact ? 13 : 16,
			opacity: 0.32,
		}));

		if (reducedMotion) draw(0, 0);
	}

	function draw(time: number, parallax: number) {
		context.clearRect(0, 0, width, height);

		const rotation = time * 0.35;
		const tilt = 0.45 + parallax * 0.15;
		const cosY = Math.cos(rotation);
		const sinY = Math.sin(rotation);
		const cosX = Math.cos(tilt);
		const sinX = Math.sin(tilt);

		const projected = points.map((point) => {
			const x1 = point.x * cosY - point.z * sinY;
			const z1 = point.x * sinY + point.z * cosY;
			const y1 = point.y * cosX - z1 * sinX;
			const z2 = point.y * sinX + z1 * cosX;
			const scale = 1 + z2 * 0.18;

			return {
				x: centerX + x1 * radius * scale,
				y: centerY + y1 * radius * scale,
				z: z2,
			};
		});

		// Anillos
		context.save();
		context.translate(centerX, centerY);
		for (const [scale, alpha, color] of [
			[1.55, 0.16, "#60a5fa"],
			[1.85, 0.1, "#8b5cf6"],
		] as const) {
			context.beginPath();
			context.ellipse(
				0,
				0,
				radius * scale,
				radius * scale * 0.34,
				rotation * 0.4,
				0,
				Math.PI * 2,
			);
			context.strokeStyle = color;
			context.globalAlpha = alpha;
			context.lineWidth = 1;
			context.stroke();
		}
		context.restore();

		// Aristas
		for (const [start, end] of edges) {
			const a = projected[start];
			const b = projected[end];
			const depth = (a.z + b.z) / 2;
			context.globalAlpha = 0.18 + (depth + 1) * 0.14;
			context.strokeStyle = "#8b5cf6";
			context.lineWidth = 1;
			context.beginPath();
			context.moveTo(a.x, a.y);
			context.lineTo(b.x, b.y);
			context.stroke();
		}

		// Vértices
		for (const point of projected) {
			context.globalAlpha = 0.45 + (point.z + 1) * 0.25;
			context.fillStyle = "#a78bfa";
			context.beginPath();
			context.arc(point.x, point.y, 1.4, 0, Math.PI * 2);
			context.fill();
		}

		// Tokens en órbita
		glyphs.forEach((glyph, index) => {
			const angle = time * 0.35 + (index / glyphs.length) * Math.PI * 2;
			const orbit = radius * (1.55 + (index % 2) * 0.28);
			const x = centerX + Math.cos(angle) * orbit;
			const y =
				centerY +
				Math.sin(angle) * orbit * 0.55 +
				Math.sin(time * 0.8 + glyph.phase) * 8;

			context.save();
			context.globalAlpha = glyph.opacity;
			context.fillStyle = glyph.color;
			context.shadowColor = glyph.color;
			context.shadowBlur = 10;
			context.font = `700 ${glyph.size}px ${MONO_FONT}`;
			context.textAlign = "center";
			context.textBaseline = "middle";
			context.fillText(glyph.text, x, y);
			context.restore();
		});
	}

	function frame(timestamp: number) {
		const delta = Math.min((timestamp - lastTimestamp) / 1000, 0.05);
		lastTimestamp = timestamp;
		draw((timestamp - startTime) / 1000, 0);
		if (!document.hidden) frameId = requestAnimationFrame(frame);
		else frameId = 0;
	}

	const startTime = performance.now();

	function start() {
		if (reducedMotion || frameId) return;
		lastTimestamp = performance.now();
		frameId = requestAnimationFrame(frame);
	}

	function stop() {
		cancelAnimationFrame(frameId);
		frameId = 0;
	}

	new IntersectionObserver(
		([entry]) => {
			if (entry.isIntersecting) start();
			else stop();
		},
		{ threshold: 0 },
	).observe(canvas);

	window.addEventListener("resize", () => {
		resize();
		if (reducedMotion) draw(0, 0);
	});

	document.addEventListener("visibilitychange", () => {
		if (document.hidden) stop();
		else start();
	});

	resize();
	start();
}
