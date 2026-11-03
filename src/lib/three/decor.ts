import * as THREE from "three";
import { hasWebGLSupport } from "./fallback2d";

export type DecorVariant = "trajectory" | "knowledge";

type Updater = (elapsed: number) => void;

const COLORS = {
	violet: 0x8b5cf6,
	soft: 0xa78bfa,
	light: 0xc4b5fd,
	cyan: 0x60a5fa,
	emerald: 0x34d399,
};

/** Radio que la cámara debe encuadrar según la escena. */
const FIT_RADIUS: Record<DecorVariant, number> = {
	trajectory: 4.3,
	knowledge: 3.4,
};

function createRing(radius: number, color: number, opacity: number) {
	const curve = new THREE.EllipseCurve(0, 0, radius, radius, 0, Math.PI * 2);
	const points = curve
		.getPoints(96)
		.map((point) => new THREE.Vector3(point.x, point.y, 0));
	const geometry = new THREE.BufferGeometry().setFromPoints(points);

	return new THREE.LineLoop(
		geometry,
		new THREE.LineBasicMaterial({
			color,
			transparent: true,
			opacity,
			depthWrite: false,
			blending: THREE.AdditiveBlending,
		}),
	);
}

function addDust(rig: THREE.Group, count: number, spread: THREE.Vector3) {
	const positions = new Float32Array(count * 3);

	for (let i = 0; i < positions.length; i += 3) {
		positions[i] = (Math.random() - 0.5) * spread.x;
		positions[i + 1] = (Math.random() - 0.5) * spread.y;
		positions[i + 2] = (Math.random() - 0.5) * spread.z;
	}

	const geometry = new THREE.BufferGeometry();
	geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

	rig.add(
		new THREE.Points(
			geometry,
			new THREE.PointsMaterial({
				color: COLORS.soft,
				size: 0.035,
				transparent: true,
				opacity: 0.45,
				depthWrite: false,
				blending: THREE.AdditiveBlending,
				sizeAttenuation: true,
			}),
		),
	);
}

/** Espiral luminosa que representa la trayectoria profesional. */
function buildTrajectory(rig: THREE.Group, compact: boolean) {
	const segments = compact ? 150 : 260;
	const turns = 3.2;
	const height = 6.2;
	const radius = 1.55;
	const points: THREE.Vector3[] = [];

	for (let i = 0; i < segments; i++) {
		const t = i / (segments - 1);
		const angle = t * Math.PI * 2 * turns;
		points.push(
			new THREE.Vector3(
				Math.cos(angle) * radius,
				(t - 0.5) * height,
				Math.sin(angle) * radius,
			),
		);
	}

	rig.add(
		new THREE.Line(
			new THREE.BufferGeometry().setFromPoints(points),
			new THREE.LineBasicMaterial({
				color: COLORS.violet,
				transparent: true,
				opacity: 0.4,
				depthWrite: false,
				blending: THREE.AdditiveBlending,
			}),
		),
	);

	// Nodos brillantes cada cierta distancia sobre la espiral.
	const step = compact ? 16 : 10;
	const nodePositions: number[] = [];
	for (let i = 0; i < points.length; i += step) {
		nodePositions.push(points[i].x, points[i].y, points[i].z);
	}

	const nodeGeometry = new THREE.BufferGeometry();
	nodeGeometry.setAttribute(
		"position",
		new THREE.Float32BufferAttribute(nodePositions, 3),
	);
	rig.add(
		new THREE.Points(
			nodeGeometry,
			new THREE.PointsMaterial({
				color: COLORS.light,
				size: 0.1,
				transparent: true,
				opacity: 0.9,
				depthWrite: false,
				blending: THREE.AdditiveBlending,
				sizeAttenuation: true,
			}),
		),
	);

	// Anillos que enmarcan la espiral.
	[-0.34, 0, 0.34].forEach((level, index) => {
		const ring = createRing(
			radius + 0.55,
			index % 2 === 0 ? COLORS.cyan : COLORS.violet,
			0.16,
		);
		ring.position.y = level * height;
		ring.rotation.x = Math.PI / 2 + (index % 2 === 0 ? 0.16 : -0.16);
		rig.add(ring);
	});

	addDust(rig, compact ? 80 : 150, new THREE.Vector3(3.6, 7.6, 3.6));
}

/** Núcleo wireframe con electrones orbitando: conocimiento en movimiento. */
function buildKnowledge(
	rig: THREE.Group,
	compact: boolean,
	updaters: Updater[],
) {
	const core = new THREE.LineSegments(
		new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.55, 0)),
		new THREE.LineBasicMaterial({
			color: COLORS.violet,
			transparent: true,
			opacity: 0.45,
			depthWrite: false,
			blending: THREE.AdditiveBlending,
		}),
	);
	rig.add(core);

	const inner = new THREE.LineSegments(
		new THREE.EdgesGeometry(new THREE.OctahedronGeometry(0.85, 0)),
		new THREE.LineBasicMaterial({
			color: COLORS.cyan,
			transparent: true,
			opacity: 0.5,
			depthWrite: false,
			blending: THREE.AdditiveBlending,
		}),
	);
	rig.add(inner);

	const orbits = [
		{ radius: 2.2, color: COLORS.cyan, tiltX: Math.PI / 2.6, tiltZ: 0.35 },
		{ radius: 2.55, color: COLORS.violet, tiltX: Math.PI / 1.9, tiltZ: -0.4 },
		{ radius: 2.85, color: COLORS.emerald, tiltX: Math.PI / 1.4, tiltZ: 0.6 },
	];

	const electronGeometry = new THREE.SphereGeometry(0.06, 8, 8);

	const electrons = orbits.map((orbit, index) => {
		const ring = createRing(orbit.radius, orbit.color, 0.16);
		ring.rotation.set(orbit.tiltX, 0, orbit.tiltZ);
		rig.add(ring);

		const mesh = new THREE.Mesh(
			electronGeometry,
			new THREE.MeshBasicMaterial({
				color: orbit.color,
				transparent: true,
				opacity: 0.9,
			}),
		);
		rig.add(mesh);

		return {
			...orbit,
			ring,
			mesh,
			speed: 0.45 + index * 0.18,
			phase: index * 2.1,
		};
	});

	updaters.push((elapsed) => {
		core.rotation.y = elapsed * 0.16;
		core.rotation.x = elapsed * 0.05;
		inner.rotation.y = -elapsed * 0.4;
		inner.rotation.z = elapsed * 0.22;

		for (const electron of electrons) {
			const angle = elapsed * electron.speed + electron.phase;
			const position = new THREE.Vector3(
				Math.cos(angle) * electron.radius,
				Math.sin(angle) * electron.radius,
				0,
			);

			// Se apoya en la rotación del anillo para que el electrón lo siga.
			position.applyEuler(electron.ring.rotation);
			electron.mesh.position.copy(position);
		}
	});

	addDust(rig, compact ? 70 : 130, new THREE.Vector3(6.6, 6.6, 6.6));
}

/**
 * Monta una escena decorativa muy liviana que se pausa fuera de pantalla,
 * respeta `prefers-reduced-motion` y reacciona al scroll de su sección.
 */
export function initSectionDecor(
	canvas: HTMLCanvasElement,
	variant: DecorVariant,
) {
	const host = canvas.parentElement;
	if (!host || host.clientWidth === 0 || host.clientHeight === 0) return;

	if (!hasWebGLSupport()) {
		host.remove();
		return;
	}

	let renderer: THREE.WebGLRenderer;
	try {
		renderer = new THREE.WebGLRenderer({
			canvas,
			alpha: true,
			antialias: false,
			powerPreference: "low-power",
		});
	} catch (error) {
		console.warn("[three] No se pudo crear la escena decorativa.", error);
		host.remove();
		return;
	}

	const reducedMotion = window.matchMedia(
		"(prefers-reduced-motion: reduce)",
	).matches;
	const isCompact = window.innerWidth < 768;

	renderer.setPixelRatio(
		Math.min(window.devicePixelRatio, isCompact ? 1.25 : 1.6),
	);
	renderer.setClearColor(0x000000, 0);

	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
	const rig = new THREE.Group();
	scene.add(rig);

	const updaters: Updater[] = [];
	if (variant === "trajectory") {
		buildTrajectory(rig, isCompact);
	} else {
		buildKnowledge(rig, isCompact, updaters);
	}

	const section = canvas.closest("section");
	const timer = new THREE.Timer();
	timer.connect(document);

	let elapsed = 0;
	let scroll = 0;
	let targetScroll = 0;
	let frameId = 0;
	let inView = true;
	let pageHidden = document.hidden;

	const canAnimate = () => !reducedMotion && inView && !pageHidden;

	function updateScroll() {
		if (!section) return;
		const rect = section.getBoundingClientRect();
		const viewport = window.innerHeight || 1;
		targetScroll = THREE.MathUtils.clamp(
			(viewport - rect.top) / (viewport + rect.height),
			0,
			1,
		);
	}

	function resize() {
		const width = host.clientWidth;
		const height = host.clientHeight;
		if (!width || !height) return;

		renderer.setSize(width, height, false);
		camera.aspect = width / height;

		const verticalFov = THREE.MathUtils.degToRad(camera.fov);
		camera.position.z =
			(FIT_RADIUS[variant] /
				(Math.tan(verticalFov / 2) * Math.min(1, camera.aspect))) *
			1.08;
		camera.updateProjectionMatrix();

		if (!frameId) renderer.render(scene, camera);
	}

	function renderFrame(timestamp?: number) {
		frameId = 0;
		timer.update(timestamp);
		const delta = Math.min(timer.getDelta(), 0.05);
		elapsed += delta;
		scroll += (targetScroll - scroll) * 0.06;

		rig.rotation.y = elapsed * 0.12 + scroll * 0.9;
		rig.rotation.x =
			Math.sin(elapsed * 0.18) * 0.06 + (scroll - 0.5) * 0.25;

		if (variant === "trajectory") {
			// La espiral se desplaza en vertical mientras se recorre la sección.
			rig.position.y = (0.5 - scroll) * 1.4;
		}

		for (const update of updaters) update(elapsed);

		renderer.render(scene, camera);

		if (canAnimate()) frameId = requestAnimationFrame(renderFrame);
	}

	function start() {
		if (!frameId && canAnimate()) {
			frameId = requestAnimationFrame(renderFrame);
		}
	}

	function stop() {
		if (frameId) {
			cancelAnimationFrame(frameId);
			frameId = 0;
		}
	}

	new IntersectionObserver(
		([entry]) => {
			inView = entry.isIntersecting;
			if (inView) start();
			else stop();
		},
		{ threshold: 0 },
	).observe(host);

	document.addEventListener("visibilitychange", () => {
		pageHidden = document.hidden;
		if (pageHidden) stop();
		else start();
	});

	new ResizeObserver(() => {
		updateScroll();
		resize();
		if (reducedMotion) renderer.render(scene, camera);
	}).observe(host);

	window.addEventListener(
		"scroll",
		() => {
			updateScroll();
			if (reducedMotion) renderer.render(scene, camera);
		},
		{ passive: true },
	);

	window.addEventListener("resize", updateScroll);

	updateScroll();
	scroll = targetScroll;
	resize();
	renderer.render(scene, camera);

	canvas.classList.remove("opacity-0");
	canvas.classList.add("opacity-100");
	start();
}
