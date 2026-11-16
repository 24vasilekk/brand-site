const hero = document.querySelector('.hero');
if (hero && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  window.addEventListener('scroll', () => {
    const y = Math.min(window.scrollY * 0.08, 45);
    hero.style.backgroundPosition = `center calc(50% + ${y}px)`;
  }, { passive: true });
}
