const key='belev-theme-v1',html=document.documentElement;
const moon='<path d="M20 14.2A8.4 8.4 0 0 1 9.8 4a8.4 8.4 0 1 0 10.2 10.2Z"/>';
const sun='<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>';
const buttons=[...document.querySelectorAll('[data-theme-toggle]')];
function apply(theme){
 html.dataset.theme=theme==='dark'?'dark':'light';
 const dark=html.dataset.theme==='dark';
 for(const button of buttons){button.hidden=false;button.setAttribute('aria-label',dark?'Включить светлую тему':'Включить тёмную тему');button.title=dark?'Светлая тема':'Тёмная тема';button.setAttribute('aria-pressed',String(dark));button.querySelector('svg').innerHTML=dark?sun:moon;}
}
apply(html.dataset.theme||'light');
for(const button of buttons)button.addEventListener('click',()=>{const next=html.dataset.theme==='dark'?'light':'dark';apply(next);try{localStorage.setItem(key,next);}catch{/* Theme switching works when browser storage is disabled. */}});
window.addEventListener('storage',event=>{if(event.key===key)apply(event.newValue==='dark'?'dark':'light');});
