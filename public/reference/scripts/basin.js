(() => {
  const fallback = document.querySelector('.basin-access');
  const entry = document.querySelector('.js-site-loader-enter-alt .js-enter-site');
  const loader = document.querySelector('.site-loader');
  if (!fallback) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.location.replace('/classic');
    return;
  }
  const observer = new MutationObserver(() => {
    if (entry && getComputedStyle(entry).visibility === 'visible') {
      fallback.classList.remove('is-visible');
    }
  });
  if (entry) observer.observe(entry, { attributes: true, attributeFilter: ['style', 'class'] });
  setTimeout(() => {
    if (
      loader &&
      getComputedStyle(loader).visibility !== 'hidden' &&
      (!entry || getComputedStyle(entry).visibility !== 'visible')
    ) {
      fallback.classList.add('is-visible');
    }
  }, 12000);
  entry?.addEventListener(
    'click',
    () => {
      fallback.classList.remove('is-visible');
      observer.disconnect();
    },
    { once: true },
  );
})();
