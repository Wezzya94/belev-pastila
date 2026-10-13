/* Optional motion layer. The page is complete and visible without this module. */
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(pointer: fine) and (hover: hover)');
const html = document.documentElement;

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
  html.classList.remove('hero-pending');
  clearTimeout(window.heroSafety);
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
  stopCursor(); nativeFallback();
  if (!finePointer.matches || motionPreference.matches) return;
  const cursor=document.createElement('div');cursor.className='pastila-cursor';cursor.setAttribute('aria-hidden','true');
  cursor.innerHTML=`<svg class="pastila-cursor-trail" xmlns="http://www.w3.org/2000/svg"><path/></svg><span class="pastila-cursor-dot"><svg class="pastila-cursor-arrow" viewBox="0 0 32 38"><path d="M3 3v27l7-7 6 12 6-3-6-12 11-1Z"/></svg><svg class="pastila-cursor-ibeam" viewBox="0 0 28 36"><path class="pastila-cursor-text-outline" d="M14 4v28M9 4h10M9 32h10"/><path d="M14 4v28M9 4h10M9 32h10"/></svg></span>`;
  document.body.append(cursor);
  // A non-interactive top-layer surface stays above native modal dialogs.
  if(typeof cursor.showPopover==='function'){cursor.setAttribute('popover','manual');cursor.showPopover();}
  const dot=cursor.querySelector('.pastila-cursor-dot'),ink=cursor.querySelector('.pastila-cursor-trail path');
  if(getComputedStyle(cursor).position!=='fixed'||!dot.getBoundingClientRect().width){cursor.remove();return;}
  const lifetime=1250;let points=[],frame=0,visible=false,dead=false,pending=null,lastTarget=null,lastTime=0;
  const hide=()=>{visible=false;cursor.classList.remove('is-visible','is-pressed');html.classList.remove('pastila-cursor-on');cancelAnimationFrame(frame);frame=0;points=[];pending=null;ink.setAttribute('d','');};
  const targetMode=target=>{
    if(target===lastTarget)return;lastTarget=target;
    const field=!!target?.closest('textarea,[contenteditable="true"],input:not([type="range"]):not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"])');
    const active=!!target?.closest('a,button,summary,select,input,[role="button"]');
    cursor.classList.toggle('is-text',field);cursor.classList.toggle('is-interactive',active&&!field);
  };
  const draw=time=>{
    frame=0;if(!visible||dead)return;
    if(pending){
      const {x,y}=pending,prev=points.at(-1);pending=null;
      if(prev&&Math.hypot(x-prev.x,y-prev.y)>650)points=[];
      if(!points.length||Math.hypot(x-points.at(-1).x,y-points.at(-1).y)>1){points.push({x,y,time});lastTime=time;}
      if(points.length>90)points.splice(0,points.length-90);
    }
    // Retain one point across the age boundary and interpolate it for a smooth tail.
    while(points.length>2&&time-points[1].time>lifetime)points.shift();
    if(points.length>1&&time-lastTime<lifetime){
      let first=points[0],next=points[1];const cut=time-lifetime;
      if(first.time<cut&&next.time>cut){const t=(cut-first.time)/(next.time-first.time);first={x:first.x+(next.x-first.x)*t,y:first.y+(next.y-first.y)*t};}
      let d=`M${first.x.toFixed(1)} ${first.y.toFixed(1)}`;
      for(let i=1;i<points.length-1;i++){const a=points[i],b=points[i+1];d+=`Q${a.x.toFixed(1)} ${a.y.toFixed(1)} ${((a.x+b.x)/2).toFixed(1)} ${((a.y+b.y)/2).toFixed(1)}`;}
      const end=points.at(-1);d+=`L${end.x.toFixed(1)} ${end.y.toFixed(1)}`;ink.setAttribute('d',d);
      ink.style.opacity=String(.55*Math.min(1,(lifetime-(time-lastTime))/500));frame=requestAnimationFrame(draw);
    }else{ink.setAttribute('d','');if(time-lastTime>=lifetime)points=[];}
  };
  const move=event=>{
    if(dead||event.pointerType==='touch'||document.visibilityState==='hidden')return;
    pending={x:event.clientX,y:event.clientY};
    dot.style.transform=`translate3d(${event.clientX-1.2}px,${event.clientY-1.2}px,0)`;targetMode(event.target);
    if(!visible){visible=true;cursor.classList.add('is-visible');html.classList.add('pastila-cursor-on');}
    if(!frame)frame=requestAnimationFrame(draw);
  };
  const press=()=>{if(visible)cursor.classList.add('is-pressed');};
  const up=()=>cursor.classList.remove('is-pressed');
  const keyboard=event=>{if(event.key==='Tab')hide();};
  const topLayer=()=>{if(cursor.hasAttribute('popover')){cursor.hidePopover();cursor.showPopover();}};
  const modalObserver=new MutationObserver(topLayer);
  document.querySelectorAll('dialog').forEach(dialog=>modalObserver.observe(dialog,{attributes:true,attributeFilter:['open']}));
  window.addEventListener('pointermove',move,{passive:true});window.addEventListener('pointerdown',press,{passive:true});window.addEventListener('pointerup',up,{passive:true});
  window.addEventListener('blur',hide);window.addEventListener('keydown',keyboard);document.documentElement.addEventListener('pointerleave',hide);
  stopCursor=()=>{dead=true;hide();modalObserver.disconnect();window.removeEventListener('pointermove',move);window.removeEventListener('pointerdown',press);window.removeEventListener('pointerup',up);window.removeEventListener('blur',hide);window.removeEventListener('keydown',keyboard);document.documentElement.removeEventListener('pointerleave',hide);cursor.remove();};
}


function setupReveals() {
  stopReveals();
  if(motionPreference.matches||!window.IntersectionObserver||!Element.prototype.animate)return;
  const states=new Map(),running=new Map();let stopped=false;
  const final={opacity:1,transform:'none',filter:'none'};
  const hiddenFor=(mode,above=false)=>({opacity:0,transform:mode==='plate'?`translateY(${above?-28:48}px) scale(.95)`:mode==='side'?`translateX(${above?18:-24}px)`:mode==='image'?`translateY(${above?-18:24}px) scale(.96)`:`translateY(${above?-18:24}px)`,filter:'none'});
  const cancel=element=>{running.get(element)?.cancel();running.delete(element);};
  const transition=(element,enter,above,initial=false)=>{
    const state=states.get(element);if(!state||stopped)return;
    const current=getComputedStyle(element);const from={opacity:current.opacity,transform:current.transform,filter:current.filter};
    cancel(element);state.inside=enter;element.dataset.motionState=enter?'enter':'exit';
    const start=initial&&enter?hiddenFor(state.mode,above):from;
    const animation=element.animate([start,enter?final:hiddenFor(state.mode,above)],{duration:initial&&!enter?1:enter?(state.mode==='plate'?2800:(!finePointer.matches?1450:1250)):800,easing:state.mode==='plate'?'cubic-bezier(.22,.5,.25,1)':'cubic-bezier(.2,.75,.2,1)',fill:'both'});
    running.set(element,animation);
    animation.finished.then(()=>{if(running.get(element)!==animation)return;if(enter){cancel(element);element.dataset.motionState='visible';}},()=>{});
  };
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      const element=entry.target,state=states.get(element);if(!state||element.closest('[hidden]'))return;
      const enter=entry.isIntersecting&&entry.intersectionRatio>0;
      if(state.inside===enter)return;
      // Keyboard focus must never be hidden by an exit animation.
      if(!enter&&element.contains(document.activeElement))return;
      transition(element,enter,entry.boundingClientRect.bottom<innerHeight/2,state.inside===null);
    });
  },{rootMargin:'-48px 0px -28px 0px',threshold:[0,.08]});
  const specs=[
    ['.hero-photo','plate'],
    ['.hero-heading, .hero-bottom, .page-heading, .detail-copy h1, .manufactory-opening h1, .partner-opening h1, .section-heading, .feature-intro-heading','title'],
    ['.product-card,.store-card,.feature-action,.stm-grid>img,.gallery-thumbs>button','image'],
    ['.inside-copy,.inside-photo,.story-copy,.story-visual,.store-teaser>div,.quick-city,.partner-composition,.partner-teaser h2,.partner-teaser p,.partner-steps,.partner-teaser .button','side'],
    ['.taste-shortcuts,.category-links,.filter-form,.catalog-status,.store-results-heading,.detail-tags,.detail-actions,.detail-main-image,.product-facts,.article-title,.article-copy,.heritage-story,.heritage-section .wrap>h2,.contact-primary,.contact-address,.contact-band,.business-row,.stm-group summary,.plain-article h2,.plain-article p,.footer-main>* ,.footer-bottom','copy']
  ];
  specs.forEach(([selector,mode])=>select(selector).forEach(element=>{if(states.has(element))return;states.set(element,{mode,inside:null});observer.observe(element);}));
  // Arm the opening pose before releasing the synchronous first-paint guard.
  for(const [element,state] of states){
    const bounds=element.getBoundingClientRect();
    transition(element,bounds.bottom>48&&bounds.top<innerHeight-28,bounds.bottom<innerHeight/2,true);
  }
  html.classList.remove('hero-pending');clearTimeout(window.heroSafety);
  const onFocus=event=>{for(const [element,state] of states){if(element.contains(event.target)){cancel(element);state.inside=true;element.dataset.motionState='visible';}}};
  const onFilter=event=>{if(!event.target.closest?.('#catalog-filters,#store-filters'))return;for(const [element,state]of states){if(element.matches('.product-card,.store-card')){cancel(element);state.inside=null;observer.unobserve(element);observer.observe(element);}}};
  const onToggle=event=>{if(!event.target.matches?.('.stm-group'))return;event.target.querySelectorAll('.stm-grid>img').forEach(element=>{cancel(element);states.get(element).inside=null;observer.unobserve(element);observer.observe(element);});};
  document.addEventListener('focusin',onFocus);document.addEventListener('input',onFilter,true);document.addEventListener('reset',onFilter,true);document.addEventListener('toggle',onToggle,true);
  stopReveals=()=>{stopped=true;observer.disconnect();for(const element of running.keys())cancel(element);document.removeEventListener('focusin',onFocus);document.removeEventListener('input',onFilter,true);document.removeEventListener('reset',onFilter,true);document.removeEventListener('toggle',onToggle,true);};
}

function revealHeroLines(){
 const lines=document.querySelector('.hero-linework');if(!lines||motionPreference.matches)return;
 document.querySelectorAll('.hero-linework path,.hero-botanical path').forEach((path,index)=>path.animate([{strokeDashoffset:1,opacity:0},{strokeDashoffset:0,opacity:1}],{duration:3200,delay:Math.min(index*130,1000),easing:'cubic-bezier(.2,.65,.2,1)',fill:'backwards'}));
}

async function boot() {
  if (html.dataset.pastilaExperience) return;
  html.dataset.pastilaExperience = 'ready';
  try {
    setupCursor();
    if(window.heroFallback)return;
    const photo=document.querySelector('.hero-photo img');
    // Decode while the intro runs; cached and uncached visits use the same order.
    await Promise.all([prepareLoader(),photo?Promise.race([photo.decode().catch(()=>{}),new Promise(resolve=>setTimeout(resolve,4400))]):Promise.resolve()]);
    if (document.visibilityState !== 'hidden'&&!window.heroFallback) { setupReveals(); revealHeroLines(); }
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
