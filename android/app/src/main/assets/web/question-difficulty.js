/* An explainable estimate, not an empirically calibrated student score. */
(() => {
const labels=['Kolay','Temel','Orta','Zor','İleri'];
Object.assign(translations,{'Zorluk':'Difficulty','Kolay':'Easy','Temel':'Basic','Orta':'Intermediate','Zor':'Hard','İleri':'Advanced','Soru türü, çözüm adımları ve sayılara göre tahmin.':'Estimated from task type, solution steps and number complexity.'});
function estimate(q){
 const type=q.responseType||'numeric',profile=q.difficultyProfile||{};
 const numericBase=({foundations:1.3,functions:1.8,'exp-log':1.5,trig:2,limits:1.8,derivatives:2.3,applications:2.5,integrals:2.3})[q.topicId]||2;
 let base=profile.base??(type==='proof'?3.3:type==='drawing'?3:type==='expression'?2.8:numericBase);
 const template=String(q.template||q.subtopicId||'');
 if(!q.difficultyProfile&&/implicit|related|epsilon|inverse|system|radical/.test(template))base+=.5;
 let largest=0,fractional=false;
 function inspect(value,key=''){
   if(/seed|index|cycle|cursor|time/i.test(key))return;
   if(typeof value==='number'&&Number.isFinite(value)){largest=Math.max(largest,Math.abs(value));fractional ||= !Number.isInteger(value);}
   else if(Array.isArray(value))value.forEach(v=>inspect(v,key));
   else if(value&&typeof value==='object')Object.entries(value).forEach(([k,v])=>inspect(v,k));
 }
 inspect(q.parameters);
 const numberLoad=Math.min(.6,Math.max(0,Math.log10(1+largest)-.7)*.25)+(fractional?.15:0);
 const stepLoad=Math.max(-.3,Math.min(.6,((profile.steps||3)-3)*.12));
 const score=Math.round(Math.min(5,Math.max(1,base+numberLoad+stepLoad))*10)/10;
 return {score,level:Math.round(score),basis:'type-steps-numbers-v1',factors:{type,base,steps:profile.steps||3,largestNumber:largest,fractional}};
}
function render(q){
 let panel=document.getElementById('question-difficulty');
 if(!panel){panel=document.createElement('div');panel.id='question-difficulty';panel.className='question-difficulty';document.getElementById('question-text').before(panel);}
 const d=q.difficulty&&Number.isFinite(q.difficulty.score)&&q.difficulty.score>=1&&q.difficulty.score<=5?q.difficulty:estimate(q);
 const label=t(labels[Math.max(0,Math.min(4,Math.round(d.score)-1))]);
 panel.title=t('Soru türü, çözüm adımları ve sayılara göre tahmin.');
 panel.replaceChildren();
 const caption=document.createElement('div');caption.className='difficulty-caption';
 const name=document.createElement('span'),value=document.createElement('span');name.textContent=t('Zorluk');value.textContent=label+' · '+d.score.toLocaleString(I18n.locale())+'/5';caption.append(name,value);
 const meter=document.createElement('div');meter.className='difficulty-meter';meter.setAttribute('role','meter');meter.setAttribute('aria-label',t('Zorluk'));meter.setAttribute('aria-valuemin','1');meter.setAttribute('aria-valuemax','5');meter.setAttribute('aria-valuenow',String(d.score));meter.setAttribute('aria-valuetext',label+' '+d.score+'/5');
 for(let i=0;i<5;i++){const segment=document.createElement('span');segment.style.setProperty('--difficulty-fill',Math.max(0,Math.min(1,d.score-i))*100+'%');meter.append(segment);}
 panel.append(caption,meter);
}
globalThis.QuestionDifficulty={estimate,render};
})();
