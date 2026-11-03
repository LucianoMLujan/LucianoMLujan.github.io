/**
 * Animaciones de scroll compartidas por las secciones:
 * revelado progresivo, línea de tiempo que se completa y glow que sigue al puntero.
 */

export function initSectionMotion() {
	initReveal();
	initScrollProgress();
	initPointerGlow();
}

function initReveal() {
	const items = Array.from(
		document.querySelectorAll<HTMLElement>("[data-reveal]"),
	);
	if (items.length === 0) return;

	const reducedMotion = window.matchMedia(
		"(prefers-reduced-motion: reduce)",
	).matches;

	if (reducedMotion || !("IntersectionObserver" in window)) {
		for (const item of items) item.classList.add("is-visible");
		return;
	}

	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;
				entry.target.classList.add("is-visible");
				observer.unobserve(entry.target);
			}
		},
		{ threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
	);

	for (const item of items) observer.observe(item);
}

function initScrollProgress() {
	const tracks = Array.from(
		document.querySelectorAll<HTMLElement>("[data-scroll-progress]"),
	);
	if (tracks.length === 0) return;

	let frameId = 0;

	const update = () => {
		frameId = 0;
		const anchor = window.innerHeight * 0.62;

		for (const track of tracks) {
			const fill = track.querySelector<HTMLElement>(
				"[data-scroll-progress-fill]",
			);
			if (!fill) continue;

			const rect = track.getBoundingClientRect();
			if (rect.height === 0) continue;

			const progress = Math.min(
				Math.max((anchor - rect.top) / rect.height, 0),
				1,
			);
			fill.style.transform = `scaleY(${progress.toFixed(3)})`;
		}
	};

	const schedule = () => {
		if (!frameId) frameId = requestAnimationFrame(update);
	};

	window.addEventListener("scroll", schedule, { passive: true });
	window.addEventListener("resize", schedule);
	update();
}

function initPointerGlow() {
	const cards = Array.from(
		document.querySelectorAll<HTMLElement>("[data-glow]"),
	);
	if (cards.length === 0) return;

	for (const card of cards) {
		card.addEventListener(
			"pointermove",
			(event) => {
				const rect = card.getBoundingClientRect();
				card.style.setProperty("--glow-x", `${event.clientX - rect.left}px`);
				card.style.setProperty("--glow-y", `${event.clientY - rect.top}px`);
			},
			{ passive: true },
		);
	}
}
