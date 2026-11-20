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
  const controls = document.createElement('aside');
  controls.className = 'basin-scene-controls';
  controls.setAttribute('aria-label', 'Scene controls');
  controls.innerHTML = '<span></span><button type="button"></button>';
  document.body.append(controls);
  const [hint, action] = controls.children;
  const modal = () => document.querySelector('#modal-container:not(.d-none) .js-modal-close');
  const scene = () => document.querySelector('main[data-router-view]')?.dataset.routerView;
  const skip = () => {
    const current = [...document.querySelectorAll('.js-skip-section')].find(
      (button) =>
        button.getClientRects().length &&
        getComputedStyle(button).visibility === 'visible' &&
        button.closest('[data-ui-id]')?.style.opacity !== '0',
    );
    if (current) current.click();
    else return false;
    return true;
  };
  const updateControls = () => {
    const view = scene();
    const close = modal();
    controls.hidden =
      !close &&
      (getComputedStyle(loader).visibility === 'visible' ||
        view !== 'journey' ||
        menu?.getAttribute('aria-expanded') === 'true');
    const nextHint = close ? '' : 'Scroll or swipe to explore';
    const nextAction = close ? 'Close details · Esc' : 'Next chapter · Z';
    if (hint.textContent !== nextHint) hint.textContent = nextHint;
    if (action.textContent !== nextAction) action.textContent = nextAction;
  };
  setInterval(updateControls, 200);
  updateControls();
  action.addEventListener('click', () => {
    const close = modal();
    if (close) close.click();
    else if (!skip()) window.dispatchEvent(new KeyboardEvent('keydown', { key: 'z' }));
  });
  document.addEventListener(
    'keydown',
    (event) => {
      if (
        event.repeat ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        event.target.closest?.('input, textarea, select, [contenteditable]')
      )
        return;
      if (event.key === 'Escape' && modal()) {
        event.stopImmediatePropagation();
        modal().click();
      } else if (event.key.toLowerCase() === 'z' && !controls.hidden && !modal() && skip()) {
        event.preventDefault();
      }
    },
    true,
  );
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
