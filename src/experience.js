/* Optional motion layer. The page is complete and visible without this module. */
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(pointer: fine) and (hover: hover)');
const html = document.documentElement;
const revealedElements = new WeakSet();
const select = (selector, scope = document) => [...scope.querySelectorAll(selector)];
let releaseLoader = () => {};
let stopCursor = () => {};
let stopReveals = () => {};

function nativeFallback() {
  html.classList.remove('pastila-cursor-on');
  document.querySelector('.pastila-cursor')?.classList.remove('is-visible');
}

function releaseExperience() {
  releaseLoader(true);
  nativeFallback();
  stopCursor();
  stopReveals();
}

function listenToMedia(query, listener) {
  if (query.addEventListener) query.addEventListener('change', listener);
  else query.addListener?.(listener);
}

function prepareLoader() {
  if (motionPreference.matches || document.visibilityState === 'hidden') return Promise.resolve();
  const overlay = document.createElement('div');
  overlay.className = 'pastila-loader';
  overlay.setAttribute('role', 'status');
  overlay.setAttribute('aria-live', 'polite');
  overlay.setAttribute('aria-label', 'Белёвская мануфактура. Слой за слоем.');
  overlay.innerHTML = `<div class="pastila-loader-body">
    <div class="pastila-loader-symbol" aria-hidden="true">
      <svg class="pastila-loader-apple" viewBox="0 0 160 170" fill="none">
        <path class="pastila-apple-outline" pathLength="1" d="M80 39C48 17 17 49 27 84c7 29 19 55 39 60 11 3 17-4 24-2 27 10 44-26 47-55 5-36-26-63-57-48Z"/>
        <path class="pastila-apple-stem" pathLength="1" d="M80 39c0-15 6-28 16-34"/>
        <path class="pastila-apple-leaf" d="M81 27C61 27 51 17 53 7c18-2 31 5 33 18"/>
        <g class="pastila-apple-details"><path d="m14 51-8-5m6 29H3m143-22 8-5m-6 32h9M47 155l-8 5m79-9 8 5"/><path class="pastila-apple-seed" d="M71 61c-5 1-8 6-5 9 4 2 7-5 5-9Zm24 5c-4-1-8 2-7 5 3 3 9-2 7-5Z"/></g>
      </svg>
      <span class="pastila-loader-layer"></span><span class="pastila-loader-layer"></span><span class="pastila-loader-layer"></span>
      <span class="pastila-loader-grain pastila-loader-grain-one"></span><span class="pastila-loader-grain pastila-loader-grain-two"></span><span class="pastila-loader-grain pastila-loader-grain-three"></span>
    </div>
    <p class="pastila-loader-title" aria-hidden="true">Белёвская<br>мануфактура</p>
    <p class="pastila-loader-caption" aria-hidden="true">Слой за слоем</p>
    <span class="pastila-loader-rule" aria-hidden="true"></span>
  </div>`;
  document.body.append(overlay);
  html.classList.add('pastila-loading');

  return new Promise(resolve => {
    let released = false;
    let removed = false;
    let exitTimer;
    const interactions = ['keydown', 'pointerdown', 'wheel', 'touchstart'];
    const remove = () => {
      if (removed) return;
      removed = true;
      overlay.remove();
      html.classList.remove('pastila-loading');
      resolve();
    };
    const release = (immediate = false) => {
      if (released) {
        if (immediate) { clearTimeout(exitTimer); remove(); }
        return;
      }
      released = true;
      clearTimeout(failsafe);
      clearTimeout(introTimer);
      interactions.forEach(type => window.removeEventListener(type, onInteraction, true));
      window.removeEventListener('scroll', onInteraction);
      if (immediate || motionPreference.matches || document.visibilityState === 'hidden') remove();
      else {
        overlay.classList.add('is-leaving');
        exitTimer = setTimeout(remove, 240);
      }
    };
    const onInteraction = () => release(true);
    // A timed brand introduction, independent of the network and browser cache.
    // Install the escape route before scheduling the two-second composition.
    const failsafe = setTimeout(() => release(true), 2450);
    const introTimer = setTimeout(() => release(), 2000);
    releaseLoader = release;
    interactions.forEach(type => window.addEventListener(type, onInteraction, {capture: true, passive: true}));
    window.addEventListener('scroll', onInteraction, {passive: true, once: true});
  });
}

function setupCursor() {
  stopCursor();
  nativeFallback();
  if (!finePointer.matches || motionPreference.matches) return;
  const cursor = document.createElement('div');
  cursor.className = 'pastila-cursor';
  cursor.setAttribute('aria-hidden', 'true');
  cursor.innerHTML = `<svg class="pastila-cursor-trail" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="pastila-ink" gradientUnits="userSpaceOnUse"><stop offset="0" stop-opacity="0"/><stop offset=".4" stop-opacity=".6"/><stop offset="1" stop-opacity="1"/></linearGradient></defs><path stroke="url(#pastila-ink)"/></svg><span class="pastila-cursor-dot"><svg class="pastila-cursor-arrow" viewBox="0 0 32 38"><path d="M3 3v27l7-7 6 12 6-3-6-12 11-1Z"/><path class="pastila-cursor-arrow-detail" d="m7 11 12 9"/></svg><svg class="pastila-cursor-ibeam" viewBox="0 0 28 36"><path class="pastila-cursor-text-outline" d="M14 4v28M9 4h10M9 32h10"/><path d="M14 4v28M9 4h10M9 32h10"/></svg></span>`;
  document.body.append(cursor);
  const dot = cursor.querySelector('.pastila-cursor-dot');
  const ink = cursor.querySelector('.pastila-cursor-trail path');
  const gradient = cursor.querySelector('linearGradient');
  const lifetime = 1150;
  let points = [];
  let frame = 0;
  let visible = false;
  let dead = false;

  const hide = () => {
    visible = false;
    cursor.classList.remove('is-visible', 'is-pressed', 'is-interactive', 'is-text', 'is-choice');
    html.classList.remove('pastila-cursor-on');
    cancelAnimationFrame(frame);
    frame = 0;
    points = [];
    ink.setAttribute('d', '');
  };
  const destroy = () => {
    if (dead) return;
    dead = true;
    hide();
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerdown', press);
    window.removeEventListener('pointerup', unpress);
    window.removeEventListener('blur', hide);
    window.removeEventListener('keydown', keyboard);
    document.removeEventListener('pointerover', changeTarget);
    document.removeEventListener('pointerleave', hide);
    cursor.remove();
  };
  // Rounded quadratic segments follow the real hand movement; no repeated stamps.
  const draw = time => {
    frame = 0;
    if (!visible || dead || !cursor.isConnected) { hide(); return; }
    try {
      points = points.filter(point => time - point.time < lifetime);
      if (points.length < 2) { ink.setAttribute('d', ''); return; }
      const first = points[0], last = points.at(-1);
      let path = `M${first.x.toFixed(1)} ${first.y.toFixed(1)}`;
      for (let i = 1; i < points.length - 1; i++) {
        const point = points[i], next = points[i + 1];
        path += `Q${point.x.toFixed(1)} ${point.y.toFixed(1)} ${((point.x + next.x) / 2).toFixed(1)} ${((point.y + next.y) / 2).toFixed(1)}`;
      }
      path += `L${last.x.toFixed(1)} ${last.y.toFixed(1)}`;
      ink.setAttribute('d', path);
      gradient.setAttribute('x1', first.x);
      gradient.setAttribute('y1', first.y);
      gradient.setAttribute('x2', last.x === first.x && last.y === first.y ? last.x + 1 : last.x);
      gradient.setAttribute('y2', last.y);
      ink.style.opacity = String(.72 * Math.min(1, (lifetime - (time - last.time)) / 400));
      frame = requestAnimationFrame(draw);
    } catch { destroy(); }
  };
  const updateTarget = target => {
    const interactive = !!target?.closest('a, button, summary, select, [role="button"], input[type="checkbox"], input[type="radio"], input[type="range"], input[type="color"]');
    const field = target?.closest('textarea, [contenteditable]:not([contenteditable="false"]), input:not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="range"]):not([type="color"])');
    const text = !!field || (!interactive && !!target?.closest('h1, h2, h3, p, label, .product-kind, .store-city, .detail-tags, .showcase-caption, .story-word, .article-copy, .product-facts, .plain-article'));
    cursor.classList.toggle('is-interactive', interactive && !text);
    cursor.classList.toggle('is-text', text);
    cursor.classList.toggle('is-choice', !!target?.closest('select'));
  };
  const changeTarget = event => {
    if (!visible || event.pointerType === 'touch') return;
    if (document.querySelector('dialog[open]')) { hide(); return; }
    updateTarget(event.target);
  };
  const move = event => {
    if (dead || event.pointerType === 'touch') return;
    try {
      if (!cursor.isConnected || document.visibilityState === 'hidden' || document.querySelector('dialog[open]')) { hide(); return; }
      // Keep the native cursor available if the optional stylesheet fails.
      if (getComputedStyle(cursor).position !== 'fixed' || !dot.getBoundingClientRect().width) { hide(); return; }
      const x = event.clientX, y = event.clientY, time = performance.now();
      const previous = points.at(-1);
      const distance = previous ? Math.hypot(x - previous.x, y - previous.y) : 0;
      if (previous && distance > 420) points = [];
      if (!points.length || distance >= 3) {
        points.push({x, y, time});
        if (points.length > 96) points.shift();
      }
      dot.style.transform = `translate(${x - 1.2}px, ${y - 1.2}px)`;
      updateTarget(event.target);
      visible = true;
      cursor.classList.add('is-visible');
      html.classList.add('pastila-cursor-on');
      if (!frame) frame = requestAnimationFrame(draw);
    } catch { destroy(); }
  };
  const press = () => { if (visible) cursor.classList.add('is-pressed'); };
  const unpress = () => cursor.classList.remove('is-pressed');
  const keyboard = event => { if (event.key === 'Tab') hide(); };
  window.addEventListener('pointermove', move, {passive: true});
  window.addEventListener('pointerdown', press, {passive: true});
  window.addEventListener('pointerup', unpress, {passive: true});
  window.addEventListener('blur', hide);
  window.addEventListener('keydown', keyboard);
  document.addEventListener('pointerover', changeTarget, {passive: true});
  document.addEventListener('pointerleave', hide);
  stopCursor = destroy;
}


function setupReveals() {
  stopReveals();
  if (motionPreference.matches || typeof IntersectionObserver !== 'function' || typeof Element.prototype.animate !== 'function') return;
  const seen = revealedElements;
  const quick = new WeakSet();
  const modes = new Map();
  const running = new Map();
  let stopped = false;
  let lastScroll = window.scrollY;
  let lastScrollTime = performance.now();
  const initialScroll = window.scrollY > 24;
  const curve = 'cubic-bezier(.19, 1, .22, 1)';
  const visible = element => {
    if (element.closest('[hidden]')) return false;
    const closed = element.closest('details:not([open])');
    if (closed && !closed.querySelector('summary')?.contains(element)) return false;
    return element.getClientRects().length > 0;
  };
  const cancel = element => {
    const animation = running.get(element);
    if (animation) { running.delete(element); animation.cancel(); }
  };
  const finishAll = () => {
    for (const element of running.keys()) cancel(element);
  };
  const framesFor = (mode, short) => {
    if (short) return [{opacity: .8, transform: 'translateY(4px)'}, {opacity: 1, transform: 'translateY(0)'}];
    const styles = {
      title: [{opacity: .58, transform: 'translateY(24px)'}, {opacity: 1, transform: 'translateY(0)'}],
      line: [{opacity: .64, transform: 'translateX(-18px)'}, {opacity: 1, transform: 'translateX(0)'}],
      layer: [{opacity: .75, transform: 'translateY(26px) scale(.97)'}, {opacity: 1, transform: 'translateY(0) scale(1)'}],
      opening: [{clipPath: 'inset(5% 8% 5% 8%)', opacity: .75}, {clipPath: 'inset(0% 0% 0% 0%)', opacity: 1}],
      stamp: [{opacity: .65, transform: 'rotate(-2deg) scale(.97)'}, {opacity: 1, transform: 'rotate(0deg) scale(1)'}],
      left: [{opacity: .7, transform: 'translateX(-24px)'}, {opacity: 1, transform: 'translateX(0)'}],
      right: [{opacity: .7, transform: 'translateX(24px)'}, {opacity: 1, transform: 'translateX(0)'}],
      ribbon: [{opacity: .74, transform: 'translateX(-14px)'}, {opacity: 1, transform: 'translateX(0)'}],
      fold: [{opacity: .72, transform: 'translateY(-10px)'}, {opacity: 1, transform: 'translateY(0)'}],
      copy: [{opacity: .68}, {opacity: 1}],
      card: [{opacity: .72, transform: 'translateY(22px)'}, {opacity: 1, transform: 'translateY(0)'}]
    };
    return styles[mode] || styles.copy;
  };
  const play = (element, mode, delay = 0, short = false) => {
    if (stopped || motionPreference.matches || !visible(element) || document.visibilityState === 'hidden') return;
    cancel(element);
    try {
      const durations = {title: 1320, line: 1200, layer: 1400, opening: 1350, stamp: 1260, left: 1100, right: 1100, ribbon: 1200, fold: 1050, copy: 1000, card: 980};
      // The authored entrances take their time; filtered results stay responsive.
      const duration = short ? 280 : durations[mode] || 1000;
      const animation = element.animate(framesFor(mode, short), {duration, delay: short ? 0 : delay, easing: curve, fill: 'none'});
      running.set(element, animation);
      const clear = () => {
        if (running.get(element) === animation) running.delete(element);
        animation.cancel();
      };
      animation.finished.then(clear, clear);
    } catch { cancel(element); }
  };

  const observer = new IntersectionObserver(entries => {
    const batches = new Map();
    for (const entry of entries) {
      const element = entry.target;
      if (!entry.isIntersecting || !visible(element)) continue;
      observer.unobserve(element);
      if (seen.has(element)) continue;
      seen.add(element);
      // Scroll restoration and content already above the viewport are final states.
      if (entry.boundingClientRect.bottom <= 0) continue;
      const mode = modes.get(element) || 'copy';
      const group = element.closest('.product-grid, .store-grid, .stm-grid, .gallery-thumbs, .feature-actions');
      const index = group ? batches.get(group) || 0 : 0;
      if (group) batches.set(group, index + 1);
      play(element, mode, Math.min(index * 85, 340), quick.has(element));
    }
  }, {threshold: .08, rootMargin: '0px 0px -14px 0px'});
  const register = (element, mode) => {
    if (modes.has(element)) return;
    modes.set(element, mode);
    if (seen.has(element)) return;
    const rect = element.getBoundingClientRect();
    if (rect.bottom < 0 || (initialScroll && rect.top < innerHeight)) seen.add(element);
    else observer.observe(element);
  };
  const specs = [
    ['.hero-heading h1, .page-heading h1, .detail-copy h1, .manufactory-opening h1, .partner-opening h1', 'title'],
    ['.hero-photo img, .story-visual img', 'layer'],
    ['.hero-heading p, .page-heading p, .hero-bottom, .detail-copy > .product-kind, .manufactory-opening p, .partner-opening p', 'copy'],
    ['.collection-section .section-heading h2, .related-products .section-heading h2, .inside-copy h2, .story-copy h2, .product-facts h2, .stm-section .section-heading h2, .feature-intro-heading h2', 'line'],
    ['.taste-shortcuts, .category-links, .detail-tags, .partner-teaser h2, .partner-opening .button', 'ribbon'],
    ['.product-card', 'card'],
    ['.inside-photo img, .detail-main-image, .manufactory-opening > img, .feature-photo img, .partner-photo img', 'opening'],
    ['.inside-copy p, .inside-copy .photo-switch, .inside-copy .text-link, .showcase-caption, .story-copy p, .story-copy .text-link, .product-facts p, .product-facts dl, .upcoming-note, .stm-section > p, .plain-article p', 'copy'],
    ['.story-word, .footer-brand img, .contact-primary h2', 'stamp'],
    ['.store-teaser > div, .article-title h2, .heritage-section .wrap > h2, .contact-primary > a, .contact-primary > p', 'left'],
    ['.quick-city, .article-copy, .contact-address, .contact-band > div', 'right'],
    ['.store-card, .feature-action', 'left'],
    ['.filter-form, .contact-band h2, .business-row > h2, .stm-group summary', 'fold'],
    ['.catalog-status, .store-results-heading, .gallery-thumbs > button, .detail-actions, .heritage-story, .business-row > div, .partner-teaser p, .partner-teaser .button, .contacts-grid .button, .contact-helper, .plain-article h2', 'copy'],
    ['.stm-grid > img', 'opening'],
    ['.footer-main > div, .footer-main > nav, .footer-brand span, .footer-bottom', 'ribbon']
  ];
  specs.forEach(([selector, mode]) => select(selector).forEach(element => register(element, mode)));

  const mutations = new MutationObserver(records => {
    for (const record of records) {
      const card = record.target;
      if (!card.matches('.product-card, .store-card')) continue;
      if (card.hidden) {
        cancel(card);
        observer.unobserve(card);
      } else if (!seen.has(card)) {
        quick.add(card);
        observer.observe(card);
      }
    }
  });
  select('.product-grid, .store-grid').forEach(grid => mutations.observe(grid, {subtree: true, attributes: true, attributeFilter: ['hidden']}));
  const onFilter = event => {
    const form = event.target.closest?.('#catalog-filters, #store-filters');
    if (!form) return;
    select('.product-card, .store-card').forEach(card => {
      cancel(card);
      quick.add(card);
    });
  };
  const onFocus = event => {
    for (const element of running.keys()) {
      if (element.contains(event.target)) cancel(element);
    }
  };
  const onScroll = () => {
    const now = performance.now();
    const distance = Math.abs(window.scrollY - lastScroll);
    const elapsed = now - lastScrollTime;
    if (distance > 140 && elapsed < 100) finishAll();
    lastScroll = window.scrollY;
    lastScrollTime = now;
  };
  const onToggle = event => {
    const details = event.target;
    if (!details.matches?.('.stm-group')) return;
    const images = select('.stm-grid > img', details);
    if (!details.open) images.forEach(cancel);
    else images.forEach(image => { if (!seen.has(image)) { quick.add(image); observer.observe(image); } });
  };
  document.addEventListener('input', onFilter, true);
  document.addEventListener('reset', onFilter, true);
  document.addEventListener('focusin', onFocus);
  document.addEventListener('toggle', onToggle, true);
  window.addEventListener('scroll', onScroll, {passive: true});
  stopReveals = () => {
    stopped = true;
    observer.disconnect();
    mutations.disconnect();
    finishAll();
    document.removeEventListener('input', onFilter, true);
    document.removeEventListener('reset', onFilter, true);
    document.removeEventListener('focusin', onFocus);
    document.removeEventListener('toggle', onToggle, true);
    window.removeEventListener('scroll', onScroll);
  };
}

async function boot() {
  if (html.dataset.pastilaExperience) return;
  html.dataset.pastilaExperience = 'ready';
  try {
    setupCursor();
    await prepareLoader();
    if (document.visibilityState !== 'hidden') setupReveals();
  } catch { releaseExperience(); stopCursor(); }
}

listenToMedia(finePointer, setupCursor);
listenToMedia(motionPreference, () => {
  releaseExperience();
  setupCursor();
  if (!motionPreference.matches && document.visibilityState !== 'hidden') setupReveals();
});
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') releaseExperience();
  else if (html.dataset.pastilaExperience && !motionPreference.matches) {
    setupCursor();
    setupReveals();
  }
});
window.addEventListener('pagehide', () => { releaseExperience(); stopCursor(); });
window.addEventListener('pageshow', event => {
  if (event.persisted) { setupCursor(); setupReveals(); }
});
window.addEventListener('error', () => { releaseExperience(); stopCursor(); });
window.addEventListener('unhandledrejection', () => { releaseExperience(); stopCursor(); });
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, {once: true});
else boot();
