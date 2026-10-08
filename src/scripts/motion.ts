/*
 * Kine Tours motion — "ink & fog".
 * - Reveal: sections get .is-in when they enter, which lifts the fog off the
 *   etching and lets [data-reveal] children rise into place (CSS in global.css).
 * - Nav ink: the fixed nav takes the --ink of the section underneath it.
 * - Nav veil: a paper backdrop appears once the page has scrolled.
 * - Parallax: etchings drift at --parallax-rate of the scroll speed.
 * Durations and distances come from tokens.css, which zeroes them for
 * prefers-reduced-motion, so this script only has to skip the parallax.
 */

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function initReveal() {
	const groups = document.querySelectorAll<HTMLElement>('[data-reveal-group]');
	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					entry.target.classList.add('is-in');
					observer.unobserve(entry.target);
				}
			}
		},
		{ threshold: 0.15 },
	);
	groups.forEach((group) => observer.observe(group));
}

function initNav() {
	const nav = document.querySelector<HTMLElement>('[data-nav]');
	if (!nav) return;

	// Ink: watch a thin band near the top of the viewport, where the nav sits.
	const sections = document.querySelectorAll<HTMLElement>('[data-ink-section]');
	const inkObserver = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;
				const ink = getComputedStyle(entry.target).getPropertyValue('--ink').trim();
				if (ink) nav.style.setProperty('--ink', ink);
			}
		},
		{ rootMargin: '-4% 0px -92% 0px' },
	);
	sections.forEach((section) => inkObserver.observe(section));

	// Veil: on as soon as the top of the page has scrolled away.
	const update = () => nav.classList.toggle('is-scrolled', window.scrollY > 24);
	update();
	window.addEventListener('scroll', update, { passive: true });
}

function initParallax() {
	const layers = Array.from(document.querySelectorAll<HTMLElement>('[data-parallax]'));
	if (!layers.length) return;

	let frame = 0;

	const apply = () => {
		frame = 0;
		const rate = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--parallax-rate')) || 1;
		const lag = 1 - rate; // 0.15 → image moves 15% slower than the page
		const viewport = window.innerHeight;

		for (const layer of layers) {
			const section = layer.parentElement;
			if (!section) continue;
			const rect = section.getBoundingClientRect();
			if (rect.bottom < 0 || rect.top > viewport) continue; // off screen

			// The media layer overhangs its section by 6% top and bottom; never drift past that.
			const limit = rect.height * 0.06;
			const offset = Math.max(-limit, Math.min(limit, -rect.top * lag));
			layer.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
		}
	};

	const request = () => {
		if (!frame) frame = requestAnimationFrame(apply);
	};

	const enable = () => {
		if (reducedMotion.matches) {
			window.removeEventListener('scroll', request);
			window.removeEventListener('resize', request);
			layers.forEach((layer) => (layer.style.transform = ''));
			return;
		}
		window.addEventListener('scroll', request, { passive: true });
		window.addEventListener('resize', request);
		apply();
	};

	enable();
	reducedMotion.addEventListener('change', enable);
}

initReveal();
initNav();
initParallax();
