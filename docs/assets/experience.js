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

function addBackgroundDetails() {
  const places = [
    ['.collection-section', 'orchard'],
    ['.story-teaser', 'imprint'],
    ['.partner-teaser, .partner-opening', 'ribbon'],
    ['.contacts-grid', 'address']
  ];
  for (const [selector, variant] of places) {
    select(selector).forEach(section => {
      if (section.querySelector(':scope > .pastila-ornament')) return;
      const detail = document.createElement('div');
      detail.className = `pastila-ornament pastila-ornament-${variant}`;
      detail.setAttribute('aria-hidden', 'true');
      detail.innerHTML = variant === 'orchard'
        ? `<svg viewBox="0 0 180 220" fill="none"><path d="M89 70C50 43 16 83 29 121c9 30 23 55 46 59 13 2 22-6 30-3 31 11 52-29 56-61 6-42-33-69-72-46Z"/><path d="M90 70c1-20 7-32 22-43M91 53C64 48 51 36 55 18c26 0 45 13 40 35"/><path d="M45 111c16-8 35-8 52-3s31 6 44 0m-92 23c17-7 30-5 46-1s29 5 40-1"/></svg>`
        : `<svg viewBox="0 0 360 180" fill="none"><path d="M9 119C73 76 125 126 188 87s102-33 165-61M9 142c64-43 116 7 179-32s102-33 165-61M9 165c64-43 116 7 179-32s102-33 165-61"/></svg>`;
      section.classList.add('pastila-has-ornament');
      section.append(detail);
    });
  }
}

function setupCursor() {
  stopCursor();
  nativeFallback();
  if (!finePointer.matches || motionPreference.matches) return;
  const cursor = document.createElement('div');
  cursor.className = 'pastila-cursor';
  cursor.setAttribute('aria-hidden', 'true');
  const apple = '<svg viewBox="0 0 30 32"><path d="M15 8C8 2 2 8 4 16c2 7 5 13 9 13 3 0 4-2 6-1 6 2 10-7 10-13 0-8-8-11-14-7Z"/><path class="pastila-cursor-leaf" d="M15 8c0-4 2-7 5-8M15 5C10 5 8 3 8 1c5 0 8 1 8 4"/></svg>';
  cursor.innerHTML = `${Array.from({length: 8}, () => `<span class="pastila-cursor-particle">${apple}</span>`).join('')}<span class="pastila-cursor-dot">${apple}</span>`;
  document.body.append(cursor);
  const dot = cursor.querySelector('.pastila-cursor-dot');
  const particles = select('.pastila-cursor-particle', cursor).map(node => ({node, x: 0, y: 0, born: 0, active: false}));
  let frame = 0;
  let x = 0, y = 0, trailX = 0, trailY = 0;
  let poolIndex = 0;
  let lastEmission = 0;
  let visible = false;
  let dead = false;

  const hide = () => {
    visible = false;
    cursor.classList.remove('is-visible', 'is-pressed');
    html.classList.remove('pastila-cursor-on');
    cancelAnimationFrame(frame);
    frame = 0;
    particles.forEach(particle => { particle.active = false; particle.node.style.opacity = '0'; });
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
    document.removeEventListener('pointerleave', hide);
    cursor.remove();
  };
  const tick = time => {
    frame = 0;
    if (!visible || dead || !cursor.isConnected) { hide(); return; }
    try {
      let active = false;
      for (const particle of particles) {
        if (!particle.active) continue;
        const age = Math.min(1, Math.max(0, (time - particle.born) / 340));
        particle.node.style.opacity = String(.25 * (1 - age) * (1 - age));
        particle.node.style.transform = `translate(${particle.x - 9}px, ${particle.y - 10 + age * 5}px) scale(${1 - age * .35})`;
        if (age === 1) particle.active = false;
        else active = true;
      }
      if (active) frame = requestAnimationFrame(tick);
    } catch { destroy(); }
  };
  const textField = target => target?.closest('textarea, select, [contenteditable]:not([contenteditable="false"]), input:not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="range"]):not([type="color"])');
  const move = event => {
    if (dead || event.pointerType === 'touch') return;
    try {
      if (!cursor.isConnected || document.visibilityState === 'hidden' || document.querySelector('dialog[open]') || textField(event.target)) { hide(); return; }
      // Never suppress the native cursor if the accompanying stylesheet failed.
      if (getComputedStyle(cursor).position !== 'fixed' || !dot.getBoundingClientRect().width) { hide(); return; }
      x = event.clientX;
      y = event.clientY;
      const time = performance.now();
      if (!visible) { trailX = x; trailY = y; }
      const dx = x - trailX, dy = y - trailY;
      const distance = Math.hypot(dx, dy);
      if (distance > 180) particles.forEach(particle => { particle.active = false; particle.node.style.opacity = '0'; });
      if (distance >= 14 && time - lastEmission >= 20) {
        const length = Math.min(distance, 55);
        const count = Math.min(3, Math.ceil(length / 20));
        for (let step = 1; step <= count; step += 1) {
          const particle = particles[poolIndex++ % particles.length];
          particle.x = x - dx / distance * length * step / count;
          particle.y = y - dy / distance * length * step / count;
          particle.born = time - step * 12;
          particle.active = true;
        }
        trailX = x;
        trailY = y;
        lastEmission = time;
      }
      dot.style.transform = `translate(${x - 14}px, ${y - 15}px)`;
      cursor.classList.toggle('is-interactive', !!event.target.closest('a, button, summary, [role="button"], input[type="checkbox"], input[type="radio"]'));
      visible = true;
      cursor.classList.add('is-visible');
      html.classList.add('pastila-cursor-on');
      if (!frame && particles.some(particle => particle.active)) frame = requestAnimationFrame(tick);
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
  const curve = 'cubic-bezier(.22, .8, .25, 1)';
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
      title: [{clipPath: 'inset(0 0 92% 0)', transform: 'translateY(10px)'}, {clipPath: 'inset(0 0 0% 0)', transform: 'translateY(0)'}],
      line: [{clipPath: 'inset(0 100% 0 0)'}, {clipPath: 'inset(0 0% 0 0)'}],
      layer: [{opacity: .72, transform: 'translateY(18px) scale(.96)'}, {opacity: 1, transform: 'translateY(0) scale(1)'}],
      opening: [{clipPath: 'inset(7% 13% 7% 13%)', opacity: .7}, {clipPath: 'inset(0% 0% 0% 0%)', opacity: 1}],
      stamp: [{opacity: .5, transform: 'rotate(-3deg) scale(.94)'}, {opacity: 1, transform: 'rotate(0deg) scale(1)'}],
      left: [{opacity: .68, transform: 'translateX(-20px)'}, {opacity: 1, transform: 'translateX(0)'}],
      right: [{opacity: .68, transform: 'translateX(20px)'}, {opacity: 1, transform: 'translateX(0)'}],
      ribbon: [{clipPath: 'inset(0 70% 0 0)', opacity: .72}, {clipPath: 'inset(0 0% 0 0)', opacity: 1}],
      fold: [{clipPath: 'inset(0 0 60% 0)', transform: 'translateY(-5px)'}, {clipPath: 'inset(0 0 0% 0)', transform: 'translateY(0)'}],
      copy: [{opacity: .55}, {opacity: 1}],
      card: [{opacity: .65, transform: 'translateY(16px)'}, {opacity: 1, transform: 'translateY(0)'}]
    };
    return styles[mode] || styles.copy;
  };
  const play = (element, mode, delay = 0, short = false) => {
    if (stopped || motionPreference.matches || !visible(element) || document.visibilityState === 'hidden') return;
    cancel(element);
    try {
      const duration = short ? 220 : mode === 'stamp' || mode === 'opening' || mode === 'title' ? 700 : mode === 'card' ? 420 : 540;
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
      play(element, mode, Math.min(index * 55, 220), quick.has(element));
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
    ['.hero-photo img', 'layer'],
    ['.hero-heading p, .page-heading p, .hero-bottom, .detail-copy > .product-kind, .manufactory-opening p, .partner-opening p', 'copy'],
    ['.collection-section .section-heading h2, .related-products .section-heading h2, .inside-copy h2, .story-copy h2, .product-facts h2, .stm-section .section-heading h2, .feature-intro-heading h2', 'line'],
    ['.category-links, .detail-tags, .partner-teaser h2, .partner-opening .button', 'ribbon'],
    ['.product-card', 'card'],
    ['.inside-photo img, .detail-main-image, .manufactory-opening > img', 'opening'],
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
    addBackgroundDetails();
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
