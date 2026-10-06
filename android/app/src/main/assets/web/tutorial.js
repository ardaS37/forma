/* First-run tour. It never creates sample records, drawings or module windows. */
(()=>{
'use strict';
const KEY='forma-tutorial-v1', $=id=>document.getElementById(id);
let active=false,index=0,steps=[],previousFocus=null,frame=0;
const english=()=>document.documentElement.lang==='en';
const copy=(tr,en)=>english()?en:tr;
const dialog=document.createElement('dialog');dialog.className='tutorial-overlay';dialog.id='tutorial';
dialog.setAttribute('aria-labelledby','tutorial-title');dialog.setAttribute('aria-describedby','tutorial-description');
dialog.innerHTML=`<div class="tutorial-spotlight" aria-hidden="true"></div><section class="tutorial-card"><div class="tutorial-heading"><span class="tutorial-count"></span><button type="button" class="tutorial-skip"></button></div><h2 id="tutorial-title"></h2><p id="tutorial-description"></p><div class="tutorial-cable" hidden><div class="tutorial-cable-labels"><span></span><span></span></div><div class="tutorial-cable-stage"><svg aria-hidden="true"><path class="tutorial-cable-guide"/><path class="tutorial-cable-line"/></svg><button class="tutorial-port tutorial-port-start" type="button">⌁</button><button class="tutorial-port tutorial-port-end" type="button">⌁</button></div><p class="tutorial-cable-status" role="status"></p></div><div class="tutorial-progress" aria-hidden="true"></div><div class="tutorial-actions"><button type="button" class="tutorial-prev"></button><button type="button" class="tutorial-next primary"></button></div></section>`;
document.body.append(dialog);
const card=dialog.querySelector('.tutorial-card'),spot=dialog.querySelector('.tutorial-spotlight'),next=dialog.querySelector('.tutorial-next'),prev=dialog.querySelector('.tutorial-prev'),skip=dialog.querySelector('.tutorial-skip');
const step=(target,trTitle,enTitle,trText,enText,extra={})=>({target,trTitle,enTitle,trText,enText,...extra});
function makeSteps(){
 const homeVisible=!$('home').hidden;
 const result=[step(homeVisible?'.welcome':null,'Forma’ya hoş geldin','Welcome to Forma','Kısa bir turla çalışma alanını tanıyalım. İstediğin zaman atlayabilir, ayarlardan tekrar açabilirsin.','Take a quick tour of your study space. Skip anytime, or restart it from settings.')];
 if(homeVisible)result.push(
 step('.subjects','Dersini seç','Choose a subject','Matematik, fizik veya kimyayı buradan seç. Lise ve üniversite modları ayarlarda.','Choose mathematics, physics or chemistry here. Switch between high school and university in settings.'),
 step('#topics','Konunu belirle','Choose your topic','Üniversitede önce dersi, sonra konuyu ve alt konuyu seç. Genel karma seçeneği farklı konulardan soru getirir.','At university level, choose a course, topic and subtopic. A mixed session combines questions from different topics.'),
 step('#start','Çalışmaya başla','Start studying','Bu düğme seçtiğin konu için çalışma alanını açar. Sonraki adımda birlikte bakalım.','This button opens your selected topic’s study space. Let’s look at it in the next step.',{nextLabel:['Çalışma alanını göster','Show study space']}));
 if(homeVisible&&$('start').disabled)return result.concat(step('#settings-open','Hazır olduğunda','When you’re ready','Bu dersin soruları henüz hazır değil. Hazır bir matematik konusu seçip çalışmaya başladığında, tanıtımı ayarlardan yeniden açabilirsin.','Questions for this subject are not ready yet. Choose an available mathematics topic, start studying and replay the tour from settings.'));
 result.push(
 step('.question-panel','Soru ve çözüm','Questions and solutions','Soru solda. Çözümü görmek için altındaki satıra dokun. Kenardaki ok soru bölümünü daraltır. Sağ kenarın ortasındaki tutamacı sürükleyerek genişletebilirsin.','Your question is on the left. Tap the row underneath to reveal the solution. The edge arrow collapses the question panel. Drag the grip in the middle of the right edge to expand it.',{workspace:true}),
 step('#next','Yeni soruya geç','Move to a new question','Sonraki ile aynı oturumda yeni bir soru üretilir. Üstteki yeni oturum düğmesi aynı konuda boş bir çalışma başlatır. Önceki ile geri dönebilirsin. Her soruda tahtanın temizlenmesini ayarlardan değiştirebilirsin.','Next generates a new question in the same session. The new session button starts a blank study in this topic. Previous takes you back. Settings control whether a new question clears the board.'),
 step('#pen-tool','Kalemin hazır','Your pen is ready','Kaleme dokunarak kalem türü, kalınlık ve basıncı ayarla. Hızlı renkler, cetvel ve silgi yanındaki araçlarda. S Pen tuşunu basılı tutunca geçici silgiye geçer. Elle çizim kapalıyken parmağın sayfayı kaydırır.','Tap the pen to choose its type, thickness and pressure. Quick colors, ruler and eraser are beside it. Hold the S Pen button to erase temporarily. With finger drawing off, your finger scrolls the page.'),
 step('#paper-settings','Kendi alanını oluştur','Make it your own','Tema, vurgu ve sayfa rengi, kâğıt düzeni, dil, şıklar ve defter yazımı burada. Kareli, çizgili, noktalı veya düz kâğıt seçebilirsin.','Choose your theme, accent and page colors, paper pattern, language, answer choices and natural math notation here. Use grid, lined, dotted or plain paper.'),
 step('#formula-toggle','Formüller elinin altında','Keep formulas nearby','Alttaki ince satır formül çekmecesini açar. Formülleri dikey kaydırabilir, başka konuların formüllerine de bakabilirsin.','The slim bottom bar opens your formulas. Scroll through them and explore formulas from other topics.'),
 step('#widgets-open','Modülleri aç','Open modules','Hesap makinesi, grafik, saat, kronometre ve diğer araçlar sağdaki modül gezgininde. Aynı modülden birden fazla pencere açabilir, pencereleri taşıyıp küçültebilirsin.','Find calculator, graph, clock, timer and other tools in the module explorer on the right. Open multiple windows of the same module, move them and minimize them.'),
 step('#widgets-open','Kabloyla bağla','Connect with a cable','Bir modülün başlığındaki yuvarlak bağlantı noktasından tutup diğer modülün noktasına bırak. Desteklenen modüller bağlanır; örneğin hesap makinesi grafiğin klavyesi olur. Kabloya çift tıklayarak bağlantıyı kaldırabilirsin. Aşağıdaki iki noktada deneyebilirsin.','Drag the round connection port in one module’s title bar onto another module’s port. Compatible modules connect: your calculator can become the graph’s keyboard. Double-click a cable to disconnect it. Try the two ports below.',{cable:true}),
 step('#save-work','Çalışmanı sakla','Keep your work','Kaydet düğmesi oturumdaki soruları, çözümlerini, çizimlerini ve modülleri Defterim’e ekler. Defterim’de kayıtları açabilir, klasörleyebilir ve silebilirsin. Hazırsın!','Save adds your session’s questions, solutions, drawings and modules to My notebook. Reopen, organize into folders or delete saved work there. You’re ready!'));
 return result;
}
function findTarget(){let node=steps[index]?.target&&document.querySelector(steps[index].target);return node&&node.getClientRects().length?node:null;}
function layout(){if(!active)return;const node=findTarget(),vw=innerWidth,vh=innerHeight;let rect=node?.getBoundingClientRect();
 if(rect){const x=Math.max(6,rect.left-6),y=Math.max(6,rect.top-6),right=Math.min(vw-6,rect.right+6),bottom=Math.min(vh-6,rect.bottom+6);spot.style.cssText=`left:${x}px;top:${y}px;width:${Math.max(0,right-x)}px;height:${Math.max(0,bottom-y)}px`;spot.classList.remove('tutorial-no-target');}else{spot.style.cssText='left:50%;top:50%;width:0;height:0';spot.classList.add('tutorial-no-target');}
 card.style.maxHeight=Math.max(160,vh-24)+'px';const w=card.offsetWidth,h=card.offsetHeight;
 let x=(vw-w)/2,y=(vh-h)/2;
 if(rect){x=Math.max(12,Math.min(vw-w-12,rect.left));if(rect.bottom+18+h<=vh-12)y=rect.bottom+18;else if(rect.top-18-h>=12)y=rect.top-18-h;else if(vw>800&&rect.right+24+w<vw)x=rect.right+24;else y=Math.max(12,vh-h-12);}
 card.style.left=Math.max(12,x)+'px';card.style.top=Math.max(12,Math.min(vh-h-12,y))+'px';drawPractice();
}
function scheduleLayout(){if(!active)return;cancelAnimationFrame(frame);frame=requestAnimationFrame(layout);}
function render(){const s=steps[index];if(s.workspace&&$('workspace').hidden){$('start').click();}
 if(s.target==='.question-panel'&&$('question-collapse').getAttribute('aria-expanded')==='false')$('question-collapse').click();
 $('tutorial-title').textContent=copy(s.trTitle,s.enTitle);$('tutorial-description').textContent=copy(s.trText,s.enText);
 dialog.querySelector('.tutorial-count').textContent=copy('TANITIM','QUICK TOUR')+' · '+(index+1)+' / '+steps.length;
 skip.textContent=copy('Atla','Skip');prev.textContent=copy('Geri','Back');prev.disabled=index===0;
 next.textContent=index===steps.length-1?copy('Başlayalım','Let’s begin'):s.nextLabel?copy(...s.nextLabel):copy('İleri','Next');
 dialog.querySelector('.tutorial-cable').hidden=!s.cable;resetPractice();
 dialog.querySelector('.tutorial-progress').replaceChildren(...steps.map((_,i)=>{const dot=document.createElement('span');dot.className=i===index?'active':i<index?'passed':'';return dot;}));
 const node=findTarget();node?.scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'});
 layout();next.focus({preventScroll:true});
 if(!matchMedia('(prefers-reduced-motion: reduce)').matches)card.animate([{opacity:.3,transform:'translateY(7px)'},{opacity:1,transform:'translateY(0)'}],{duration:180,easing:'ease-out'});
}
function start(){if(active)return;previousFocus=document.activeElement;if($('settings-modal').open)$('settings-modal').close();
 if(!$('notes-page').hidden)document.querySelector('.brand').click();steps=makeSteps();index=0;active=true;dialog.showModal();render();}
function finish(){if(!active)return;active=false;cancelAnimationFrame(frame);try{localStorage.setItem(KEY,'done');}catch{}dialog.close();if(previousFocus?.isConnected&&previousFocus.getClientRects().length)previousFocus.focus({preventScroll:true});}
next.onclick=()=>{if(index===steps.length-1)finish();else{index++;render();}};prev.onclick=()=>{if(index>0){index--;render();}};skip.onclick=finish;
dialog.addEventListener('cancel',event=>{event.preventDefault();finish();});
dialog.addEventListener('keydown',event=>{if(event.key!=='Tab')return;const list=[...card.querySelectorAll('button:not(:disabled)')].filter(b=>b.getClientRects().length);const first=list[0],last=list.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}});
window.addEventListener('resize',scheduleLayout,{passive:true});window.addEventListener('scroll',scheduleLayout,{capture:true,passive:true});window.visualViewport?.addEventListener('resize',scheduleLayout);
// A local practice cable teaches the gesture without opening or altering real modules.
const stage=dialog.querySelector('.tutorial-cable-stage'),from=dialog.querySelector('.tutorial-port-start'),to=dialog.querySelector('.tutorial-port-end'),path=dialog.querySelector('.tutorial-cable-line'),guide=dialog.querySelector('.tutorial-cable-guide');let drag=null,connected=false;
function endpoints(){return{x:from.offsetLeft+from.offsetWidth/2,y:from.offsetTop+from.offsetHeight/2,endX:to.offsetLeft+to.offsetWidth/2,endY:to.offsetTop+to.offsetHeight/2};}
function curve(x,y,endX,endY){return `M ${x} ${y} C ${x+55} ${y+45}, ${endX-55} ${endY+45}, ${endX} ${endY}`;}
function drawPractice(){const p=endpoints();guide.setAttribute('d',curve(p.x,p.y,p.endX,p.endY));path.setAttribute('d',drag?curve(p.x,p.y,drag.x,drag.y):connected?curve(p.x,p.y,p.endX,p.endY):'');}
function resetPractice(){drag=null;connected=false;from.classList.remove('connected');to.classList.remove('connected');from.setAttribute('aria-label',copy('Örnek kabloyu buradan sürükle','Drag the practice cable from here'));to.setAttribute('aria-label',copy('Kabloyu buraya bırak','Drop the cable here'));const labels=dialog.querySelectorAll('.tutorial-cable-labels span');labels[0].textContent=copy('Hesap makinesi','Calculator');labels[1].textContent=copy('Grafik','Graph');dialog.querySelector('.tutorial-cable-status').textContent=copy('Soldaki noktadan sağdakine sürükle.','Drag from the left port to the right port.');}
from.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();from.setPointerCapture(e.pointerId);const r=stage.getBoundingClientRect();drag={id:e.pointerId,x:e.clientX-r.left,y:e.clientY-r.top};connected=false;drawPractice();});
from.addEventListener('pointermove',e=>{if(drag?.id!==e.pointerId)return;const r=stage.getBoundingClientRect();drag.x=e.clientX-r.left;drag.y=e.clientY-r.top;drawPractice();});
from.addEventListener('pointerup',e=>{if(drag?.id!==e.pointerId)return;const r=to.getBoundingClientRect();connected=e.clientX>=r.left-12&&e.clientX<=r.right+12&&e.clientY>=r.top-12&&e.clientY<=r.bottom+12;drag=null;from.classList.toggle('connected',connected);to.classList.toggle('connected',connected);dialog.querySelector('.tutorial-cable-status').textContent=connected?copy('Bağlandı. Gerçek modüllerde de aynı hareketi kullan.','Connected. Use the same gesture in real modules.'):copy('Bir daha dene: sağdaki noktanın üzerine bırak.','Try again: release over the right port.');drawPractice();});
from.addEventListener('pointercancel',()=>{drag=null;drawPractice();});
$('tutorial-replay').onclick=start;window.FormaTutorial={start};
let seen=false;try{seen=localStorage.getItem(KEY)==='done';}catch{}if(!seen)setTimeout(start,500);
})();
