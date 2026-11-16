const tabs = document.querySelectorAll('[role="tab"]');

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    tabs.forEach((item) => {
      const active = item === tab;
      item.classList.toggle('active', active);
      item.setAttribute('aria-selected', String(active));
      document.getElementById(item.getAttribute('aria-controls')).hidden = !active;
    });
  });

  tab.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    const next = event.key === 'ArrowRight' ? tab.nextElementSibling || tabs[0] : tab.previousElementSibling || tabs[tabs.length - 1];
    next.focus();
    next.click();
  });
});
