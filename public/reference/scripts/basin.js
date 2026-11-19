(() => {
  const fallback = document.querySelector('.basin-access');
  const loader = document.querySelector('.site-loader');
  if (!fallback) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const path = window.location.pathname.replace(/\/$/, '');
    const expedition =
      path.match(/^\/expeditions\/(runoff|harvey|detention)$/)?.[1] ??
      {
        '/journeys/runoff': 'runoff',
        '/journeys/harvey': 'harvey',
        '/journeys/detention': 'detention',
      }[path];
    window.location.replace(
      expedition ? `/explore/${expedition}` : path === '/about' ? '/explore/about' : '/explore',
    );
    return;
  }
  const menu = document.querySelector('[aria-controls="basin-primary-nav"]');
  const nav = document.getElementById('basin-primary-nav');
  if (menu && nav) {
    const syncMenu = () => {
      const expanded =
        matchMedia('(max-width: 1023px)').matches &&
        nav.style.display === 'flex' &&
        document.body.style.position === 'fixed';
      menu.setAttribute('aria-expanded', String(expanded));
      menu.setAttribute('aria-label', expanded ? 'Close navigation' : 'Open navigation');
    };
    new MutationObserver(syncMenu).observe(document.body, {
      attributes: true,
      attributeFilter: ['style'],
    });
    window.addEventListener('resize', syncMenu);
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
        menu.click();
        menu.focus();
      }
    });
  }
  const entries = [...document.querySelectorAll('.js-enter-site')];
  const visible = (element) => element && getComputedStyle(element).visibility === 'visible';
  const ready = () => !visible(loader) || entries.some(visible);
  const observer = new MutationObserver(() => {
    if (ready()) fallback.classList.remove('is-visible');
  });
  for (const element of [loader, ...entries]) {
    if (element)
      observer.observe(element, { attributes: true, attributeFilter: ['style', 'class'] });
  }
  const fallbackTimer = setTimeout(() => {
    if (!ready()) fallback.classList.add('is-visible');
  }, 12000);
  for (const button of entries) {
    button.addEventListener(
      'click',
      () => {
        fallback.classList.remove('is-visible');
        clearTimeout(fallbackTimer);
        observer.disconnect();
      },
      { once: true },
    );
  }
})();
