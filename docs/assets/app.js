import {MAX_COMPARE,filterProducts,filterStores,toggleComparison,compositionLabel} from './domain.mjs';
const root=new URL('../',import.meta.url),storageKey='belev-comparison-v1';
const $=selector=>document.querySelector(selector),$$=selector=>[...document.querySelectorAll(selector)];
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const siteURL=path=>new URL(path,root).href;
let products=[],stores=[],ids=[],validIds=new Set(),toastTimer;
function toast(message){const el=$('.toast');el.textContent=message;el.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),3500);}
function readSaved(){try{const value=JSON.parse(localStorage.getItem(storageKey)||'[]');return Array.isArray(value)?[...new Set(value.filter(x=>typeof x==='string'&&validIds.has(x)))].slice(0,MAX_COMPARE):[];}catch{return[];}}
function save(){try{if(ids.length)localStorage.setItem(storageKey,JSON.stringify(ids));else localStorage.removeItem(storageKey);}catch{/* Browsers may disable storage; the current comparison still works. */}}
function syncComparison(){
  $$('.compare-count').forEach(el=>el.textContent=ids.length);
  const headerCompare=$('.header-compare');if(headerCompare)headerCompare.setAttribute('aria-label',`Сравнить выбранные товары: ${ids.length} из 3`);
  $$('[data-compare]').forEach(button=>{const selected=ids.includes(button.dataset.compare);button.setAttribute('aria-pressed',String(selected));const product=products.find(p=>String(p.id)===button.dataset.compare);button.setAttribute('aria-label',`${selected?'Убрать из':'Добавить в'} сравнение: ${product?.name||'товар'}`);const label=button.querySelector('span');if(label)label.textContent=selected?'На полке':'Сравнить';});
  $('.compare-tray').hidden=!ids.length;
  $('.tray-summary').textContent=ids.length===1?'Добавьте ещё один товар':`${ids.length} товара из 3`;
  $('.compare-tray [data-open-compare]').disabled=ids.length<2;
}
function compareMarkup(){
 const selected=ids.map(id=>products.find(p=>String(p.id)===id)).filter(Boolean);
 if(selected.length<2)return`<div class="compare-help"><p>${selected.length?'На полке один товар. Добавьте ещё один, чтобы сравнить состав и формат.':'Выберите два или три товара в каталоге. Здесь появятся фотографии, состав и характеристики.'}</p><a class="button button-green" href="${siteURL('catalog/')}">Выбрать сладости</a></div>`;
 const row=(label,format)=>`<tr><th scope="row">${label}</th>${selected.map(p=>`<td>${format(p)}</td>`).join('')}</tr>`;
 return`<p class="compare-scroll-hint">Прокрутите таблицу вправо, чтобы увидеть остальные товары →</p><div class="compare-scroll" tabindex="0" role="region" aria-label="Таблица сравнения товаров, прокручивается по горизонтали"><table class="compare-table" data-count="${selected.length}"><caption>Сведения производителя. Для покупки сверяйте состав с актуальной упаковкой.</caption><thead><tr><th scope="col">На вашей полке</th>${selected.map(p=>`<th scope="col"><a href="${siteURL(`products/${p.slug}/`)}"><img class="compare-item-image" src="${siteURL(p.image)}" alt="${esc(p.name)}" width="220" height="160"/><span class="compare-item-title">${esc(p.name)}</span></a><button class="compare-item-remove" type="button" data-compare="${esc(p.id)}" aria-label="Убрать из сравнения: ${esc(p.name)}">Убрать с полки</button></th>`).join('')}</tr></thead><tbody>${row('Сладости',p=>esc(p.categoryName))}${row('Вкус',p=>esc((p.tasteTags||[]).join(', ')||'Уточняйте по упаковке'))}${row('Вес',p=>p.weightGrams?`${p.weightGrams} г`:'Не указан')}${row('Состав',p=>esc(compositionLabel(p)))}${row('Добавленный сахар',p=>p.sugarAdded===false?'Без добавления':p.sugarAdded===true?'Есть':'Уточняйте по упаковке')}${row('На 100 г',p=>p.energyKcal?`${esc(p.energyKcal)} ккал`:'Не указано')}${row('Хранение',p=>esc(p.storage||'Уточняйте на упаковке'))}${row('Покупка',p=>`<a class="text-link" href="${siteURL(`stores/?product=${p.id}`)}">Найти магазин</a>`)}</tbody></table></div>`;
}
function renderComparison(){const focused=document.activeElement?.dataset?.compare;$('.compare-body').innerHTML=compareMarkup();syncComparison();if(focused&&$('.compare-dialog').open){const next=$('.compare-body [data-compare]');(next||$('[data-close-dialog]')).focus();}}
function changeComparison(id){const result=toggleComparison(ids,id,validIds);if(result.limit){toast('На полке уже три товара. Уберите один, чтобы добавить другой.');return;}ids=result.ids;save();syncComparison();if($('.compare-dialog').open)renderComparison();else toast(result.added?'Товар добавлен на дегустационную полку':'Товар убран с полки');}
function setQuery(values){const url=new URL(location.href);for(const[key,value]of Object.entries(values)){if(value)url.searchParams.set(key,value);else url.searchParams.delete(key);}history.replaceState(null,'',url);}
function setSelect(form,name,value){const field=form.elements.namedItem(name);field.value=value||'';if(field.tagName==='SELECT'&&field.selectedIndex<0)field.value='';}
function catalogFilters(){const form=$('#catalog-filters');if(!form)return;
 const readURL=()=>{const params=new URLSearchParams(location.search);['q','category','sugar','weight'].forEach(key=>setSelect(form,key,params.get(key)));};
 const apply=(update=true)=>{const values=Object.fromEntries(new FormData(form));const result=filterProducts(products,{query:values.q,category:values.category,sugar:values.sugar,weight:values.weight});const visible=new Set(result.map(p=>String(p.id)));$$('#catalog-grid [data-product-id]').forEach(card=>card.hidden=!visible.has(card.dataset.productId));$('#catalog-count').textContent=`Найдено товаров: ${result.length}`;$('#catalog-empty').hidden=!!result.length;if(update)setQuery(values);};
 readURL();apply(false);form.addEventListener('input',()=>apply());form.addEventListener('submit',event=>{event.preventDefault();apply();});form.addEventListener('reset',event=>{event.preventDefault();['q','category','sugar','weight'].forEach(key=>setSelect(form,key,''));apply();});$('[data-reset-filters]').addEventListener('click',()=>{form.reset();$('#product-search').focus();});window.addEventListener('popstate',()=>{readURL();apply(false);});
}
function storeFilters(){const form=$('#store-filters');if(!form)return;
 const readURL=()=>{const params=new URLSearchParams(location.search);['q','city'].forEach(key=>setSelect(form,key,params.get(key)));const product=products.find(p=>String(p.id)===params.get('product'));const context=$('#store-product-context');context.hidden=!product;if(product)context.textContent=`Вы выбрали: ${product.name}. Здесь указаны точки продажи белёвских сладостей; наличие именно этого продукта уточняйте у продавца.`;};
 const apply=(update=true)=>{const values=Object.fromEntries(new FormData(form));const result=filterStores(stores,{city:values.city,query:values.q});const visible=new Set(result.map(s=>s.id));$$('[data-store-id]').forEach(card=>card.hidden=!visible.has(card.dataset.storeId));$('#store-count').textContent=`Найдено точек продажи: ${result.length}`;$('#store-empty').hidden=!!result.length;if(update)setQuery(values);};
 readURL();apply(false);form.addEventListener('input',()=>apply());form.addEventListener('submit',event=>{event.preventDefault();apply();});form.addEventListener('reset',event=>{event.preventDefault();['q','city'].forEach(key=>setSelect(form,key,''));apply();});window.addEventListener('popstate',()=>{readURL();apply(false);});
}
let unboxFrame=0;
function setUnbox(value,animate=false){
 const stage=$('.unbox-stage'),range=$('#unbox-range');if(!stage||!range)return;
 cancelAnimationFrame(unboxFrame);
 const apply=n=>{stage.style.setProperty('--opening',n+'%');range.value=String(n);range.setAttribute('aria-valuetext',n===0?'Показана упаковка':n===100?'Показана пастила внутри':`Упаковка открыта на ${Math.round(n)}%`);$$('[data-showcase-view]').forEach(b=>{const active=b.dataset.showcaseView==='cut'?n===100:n===0;b.setAttribute('aria-pressed',String(active));b.classList.toggle('active',active);});};
 if(!animate||matchMedia('(prefers-reduced-motion: reduce)').matches){apply(value);return;}
 const start=parseFloat(stage.style.getPropertyValue('--opening'))||0,time=performance.now();
 const tick=now=>{const t=Math.min(1,(now-time)/1150),ease=1-Math.pow(1-t,4);apply(start+(value-start)*ease);if(t<1)unboxFrame=requestAnimationFrame(tick);};unboxFrame=requestAnimationFrame(tick);
}
$('#unbox-range')?.addEventListener('input',event=>setUnbox(Number(event.target.value)));
function interactions(){
 const menu=$('.menu-toggle'),navigation=$('#mobile-menu');
 const closeMenu=()=>{menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Открыть меню');navigation.hidden=true;};
 menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Закрыть меню':'Открыть меню');navigation.hidden=!open;});
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!navigation.hidden){closeMenu();menu.focus();}});window.addEventListener('resize',()=>{if(innerWidth>=1200)closeMenu();});
 document.addEventListener('click',event=>{
  const showcase=event.target.closest('[data-showcase-view]');if(showcase)setUnbox(showcase.dataset.showcaseView==='cut'?100:0,true);
  const gallery=event.target.closest('[data-detail-image]');if(gallery){const image=$('#detail-image');image.src=gallery.dataset.detailImage;image.alt=gallery.dataset.alt;$$('[data-detail-image]').forEach(button=>{const active=button===gallery;button.setAttribute('aria-pressed',String(active));button.classList.toggle('active',active);});}
  const compare=event.target.closest('[data-compare]');if(compare&&validIds.size)changeComparison(compare.dataset.compare);
  if(event.target.closest('[data-open-compare]')&&validIds.size){renderComparison();$('.compare-dialog').showModal();}
  if(event.target.closest('[data-close-dialog]'))$('.compare-dialog').close();
  if(event.target.closest('.tray-clear')){ids=[];save();syncComparison();if($('.compare-dialog').open)renderComparison();toast('Дегустационная полка очищена');}
 });
 const dialog=$('.compare-dialog');dialog.addEventListener('click',event=>{if(event.target===dialog){const bounds=dialog.getBoundingClientRect();if(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom)dialog.close();}});
 window.addEventListener('storage',event=>{if(event.key===storageKey){ids=readSaved();syncComparison();if(dialog.open)renderComparison();}});
}
interactions();
try{
 const responses=await Promise.all([fetch(siteURL('data/products.json')),fetch(siteURL('data/stores.json'))]);if(responses.some(response=>!response.ok))throw new Error('Data unavailable');
 [products,stores]=await Promise.all(responses.map(response=>response.json()));if(!Array.isArray(products)||!products.length||!Array.isArray(stores))throw new Error('Invalid data');
 validIds=new Set(products.map(p=>String(p.id)));ids=readSaved();syncComparison();catalogFilters();storeFilters();
}catch{
 $$('[data-compare],[data-open-compare]').forEach(button=>button.disabled=true);
 $$('#catalog-filters,#store-filters').forEach(form=>{form.querySelectorAll('input,select,button').forEach(field=>field.disabled=true);const note=document.createElement('p');note.className='filter-error';note.textContent='Фильтры временно не загрузились. Весь список доступен ниже. ';const retry=document.createElement('button');retry.type='button';retry.className='filter-reset';retry.textContent='Загрузить снова';retry.addEventListener('click',()=>location.reload());note.append(retry);form.before(note);});
}
