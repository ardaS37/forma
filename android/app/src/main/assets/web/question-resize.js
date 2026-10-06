(()=>{
'use strict';
const layout=document.querySelector('.work-layout'),handle=document.createElement('div');
handle.id='question-resize';handle.className='question-resize';handle.tabIndex=0;handle.setAttribute('role','separator');handle.setAttribute('aria-orientation','vertical');handle.setAttribute('aria-controls','question-content');layout.append(handle);
let preferred=null,drag=null;try{const value=Number(localStorage.getItem('forma-question-width'));if(Number.isFinite(value)&&value>0)preferred=value;}catch{}
const limits=()=>{const min=parseFloat(getComputedStyle(layout).getPropertyValue('--question-min-width'))||330,width=layout.getBoundingClientRect().width;return{min,max:Math.max(min,Math.min(width*.65,width-280))};};
function apply(value=preferred){const {min,max}=limits(),width=Math.round(Math.max(min,Math.min(max,value??min)));layout.style.setProperty('--question-width',width+'px');handle.setAttribute('aria-valuemin',Math.round(min));handle.setAttribute('aria-valuemax',Math.round(max));handle.setAttribute('aria-valuenow',width);handle.setAttribute('aria-label',document.documentElement.lang==='en'?'Resize question panel':'Soru bölümünü yeniden boyutlandır');return width;}
function store(){try{localStorage.setItem('forma-question-width',String(preferred));}catch{}}
function finish(event){if(!drag||event.pointerId!==drag.id)return;drag=null;layout.classList.remove('question-resizing');store();try{handle.releasePointerCapture(event.pointerId);}catch{}}
handle.addEventListener('pointerdown',event=>{if(event.button!==0||layout.classList.contains('question-collapsed'))return;event.preventDefault();const width=apply();drag={id:event.pointerId,x:event.clientX,width};layout.classList.add('question-resizing');handle.setPointerCapture(event.pointerId);handle.focus({preventScroll:true});});
handle.addEventListener('pointermove',event=>{if(drag?.id!==event.pointerId)return;event.preventDefault();preferred=apply(drag.width+event.clientX-drag.x);});
handle.addEventListener('pointerup',finish);handle.addEventListener('pointercancel',finish);handle.addEventListener('lostpointercapture',finish);
handle.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const{min,max}=limits();preferred=apply(event.key==='Home'?min:event.key==='End'?max:apply()+(event.key==='ArrowRight'?20:-20));store();});
window.addEventListener('resize',()=>apply(),{passive:true});new MutationObserver(()=>{if(!document.getElementById('workspace').hidden)apply();}).observe(document.getElementById('workspace'),{attributes:true,attributeFilter:['hidden']});new MutationObserver(()=>apply()).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});apply();
})();
