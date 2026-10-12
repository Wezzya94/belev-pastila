// Optional enhancement: without this module the sticky header stays visible.
const header = document.querySelector('.site-header');

if (header) {
  try {
    const inner = header.querySelector('.header-inner');
    const menu = header.querySelector('.menu-toggle');
    const mobileMenu = header.querySelector('.mobile-menu');
    const compare = header.querySelector('.header-compare');
    const count = header.querySelector('[data-compare-count]');
    const dialogs = [...document.querySelectorAll('dialog')];
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const fineHover = matchMedia('(hover: hover) and (pointer: fine)');
    let height = header.offsetHeight;
    let frame = 0;
    let lastY = 0;
    let direction = 0;
    let distance = 0;
    let hovered = false;
    let suspended = false;

    const scrollPosition = () => {
      const maximum = Math.max(0, document.documentElement.scrollHeight - innerHeight);
      return Math.min(maximum, Math.max(0, scrollY));
    };
    const isHeld = () => reduced.matches || hovered || header.contains(document.activeElement)
      || menu?.getAttribute('aria-expanded') === 'true'
      || (mobileMenu && !mobileMenu.hidden && innerWidth < 1200)
      || dialogs.some(dialog => dialog.open);
    const resetDirection = () => {
      lastY = scrollPosition();
      direction = 0;
      distance = 0;
    };
    const show = () => header.classList.remove('header-is-hidden');
    const measure = () => {
      height = header.getBoundingClientRect().height;
      document.documentElement.style.setProperty('--header-height', `${Math.ceil(height)}px`);
      document.documentElement.style.setProperty('--header-bar-height', `${Math.ceil(inner?.getBoundingClientRect().height || height)}px`);
    };
    const refresh = () => {
      measure();
      show();
      resetDirection();
      header.classList.toggle('header-scrolled', lastY > 8);
    };
    const updateScroll = () => {
      frame = 0;
      if (suspended || document.hidden) return;
      const y = scrollPosition();
      header.classList.toggle('header-scrolled', y > 8);
      if (isHeld() || y <= Math.max(24, height * .6)) {
        show();
        resetDirection();
        return;
      }
      const delta = y - lastY;
      // Accumulate tiny trackpad steps, but ignore direction jitter.
      if (Math.abs(delta) < 1.5) return;
      lastY = y;
      const nextDirection = Math.sign(delta);
      distance = nextDirection === direction ? distance + Math.abs(delta) : Math.abs(delta);
      direction = nextDirection;
      if (direction > 0 && distance >= 24 && y > height + 32) {
        header.classList.add('header-is-hidden');
        distance = 0;
      } else if (direction < 0 && distance >= 10) {
        show();
        distance = 0;
      }
    };
    const schedule = () => {
      if (!frame && !suspended && !document.hidden) frame = requestAnimationFrame(updateScroll);
    };
    const stopFrame = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };
    const holdChanged = () => {
      measure();
      if (isHeld()) show();
      resetDirection();
    };
    const syncCount = () => {
      if (!compare || !count) return;
      const number = Math.max(0, Number.parseInt(count.textContent, 10) || 0);
      compare.dataset.hasItems = String(number > 0);
    };

    header.classList.add('header-enhanced');
    refresh();
    syncCount();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', refresh, { passive: true });
    window.addEventListener('orientationchange', refresh, { passive: true });
    header.addEventListener('focusin', () => { show(); resetDirection(); });
    header.addEventListener('focusout', () => queueMicrotask(holdChanged));
    header.addEventListener('pointerenter', event => {
      if (event.pointerType === 'touch' || !fineHover.matches) return;
      hovered = true;
      show();
      resetDirection();
    });
    header.addEventListener('pointerleave', () => { hovered = false; resetDirection(); });
    reduced.addEventListener('change', refresh);
    fineHover.addEventListener('change', () => { hovered = false; refresh(); });
    document.addEventListener('visibilitychange', () => {
      stopFrame();
      if (!document.hidden) refresh();
    });
    window.addEventListener('pagehide', () => { suspended = true; stopFrame(); });
    window.addEventListener('pageshow', () => { suspended = false; refresh(); });

    if ('ResizeObserver' in window) new ResizeObserver(measure).observe(header);
    if ('MutationObserver' in window) {
      const heldObserver = new MutationObserver(holdChanged);
      heldObserver.observe(header, { subtree: true, attributes: true, attributeFilter: ['aria-expanded', 'hidden'] });
      for (const dialog of dialogs) heldObserver.observe(dialog, { attributes: true, attributeFilter: ['open'] });
      if (count) new MutationObserver(syncCount).observe(count, { childList: true, characterData: true, subtree: true });
    }
  } catch {
    // A failure must leave navigation readable and keyboard-reachable.
    header.classList.remove('header-is-hidden', 'header-enhanced');
  }
}
