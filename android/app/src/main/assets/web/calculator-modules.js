// Calculator extensions and an input-module connection bus. No user expression is executed as JavaScript.
let calculatorDisplay='norm',calculatorDigits=4,calculatorNotation='decimal';
try{const data=JSON.parse(localStorage.getItem('forma-calculator-extended')||'{}');for(const name of Object.keys(calculatorVariables))if(Number.isFinite(data.variables?.[name]))calculatorVariables[name]=data.variables[name];if(['norm','fix','sci'].includes(data.display))calculatorDisplay=data.display;if(Number.isInteger(data.digits)&&data.digits>=0&&data.digits<=9)calculatorDigits=data.digits;if(['decimal','engineering','dms','mixed'].includes(data.notation))calculatorNotation=data.notation;}catch{}
function saveCalculatorExtended(){try{localStorage.setItem('forma-calculator-extended',JSON.stringify({variables:calculatorVariables,display:calculatorDisplay,digits:calculatorDigits,notation:calculatorNotation}));}catch{}}
const originalFormatCalc=formatCalc;
formatCalc=function(value){
 if(!Number.isFinite(value))return t('Bu işlem tanımlı değil.');
 if(calculatorNotation==='engineering'){
  let exponent=value===0?0:Math.floor(Math.log10(Math.abs(value))/3)*3,mantissa=value/10**exponent;
  if(Math.abs(mantissa)>=999.9999999995){mantissa/=1000;exponent+=3;}
  return Number(mantissa.toPrecision(10)).toLocaleString(I18n.locale(),{useGrouping:false,maximumSignificantDigits:10})+' ×10^'+exponent;
 }
 if(calculatorNotation==='dms'){
  const total=Math.round(Math.abs(value)*3600*1e6)/1e6,d=Math.floor(total/3600),m=Math.floor((total-d*3600)/60),seconds=Number((total-d*3600-m*60).toFixed(6));
  return (value<0?'−':'')+d+'° '+m+'′ '+seconds.toLocaleString(I18n.locale(),{useGrouping:false})+'″';
 }
 if(calculatorNotation==='mixed'){
  const f=asFraction(value);if(f?.includes('/')){const [n,d]=f.split('/').map(Number),whole=Math.trunc(Math.abs(n)/d),remainder=Math.abs(n)%d;return(n<0?'−':'')+(whole?whole+' ':'')+remainder+'/'+d;}
 }
 if(calculatorDisplay==='fix')return value.toFixed(calculatorDigits).replace('.',I18n.locale().startsWith('tr')?',':'.');
 if(calculatorDisplay==='sci')return value.toExponential(calculatorDigits).replace('.',I18n.locale().startsWith('tr')?',':'.');
 return originalFormatCalc(value);
};
$('calc-display').value=calculatorDisplay;$('calc-digits').value=calculatorDigits;
for(const id of ['calc-display','calc-digits'])$(id).onchange=()=>{const value=Number($('calc-digits').value);if(!Number.isInteger(value)||value<0||value>9){$('calc-digits').value=calculatorDigits;return;}calculatorDisplay=$('calc-display').value;calculatorDigits=value;calculatorNotation='decimal';saveCalculatorExtended();renderCalculator();};
for(const [id,mode] of [['calc-eng','engineering'],['calc-dms','dms'],['calc-mixed','mixed']])$(id).onclick=()=>{calculatorNotation=calculatorNotation===mode?'decimal':mode;saveCalculatorExtended();renderCalculator();};
const oldCalcFormatClick=$('calc-format').onclick;$('calc-format').onclick=()=>{calculatorNotation='decimal';calculatorDisplay='norm';$('calc-display').value='norm';oldCalcFormatClick();saveCalculatorExtended();};
for(const name of Object.keys(calculatorVariables)){
 const label=document.createElement('label'),key=document.createElement('button'),input=document.createElement('input'),store=document.createElement('button');key.textContent=name.replace('var','').toUpperCase();key.dataset.calcKey=name;input.type='number';input.step='any';input.value=calculatorVariables[name];input.setAttribute('aria-label',name.replace('var','').toUpperCase());input.dataset.variable=name;input.onchange=()=>{const v=Number(input.value);if(input.value.trim()&&Number.isFinite(v)){calculatorVariables[name]=v;saveCalculatorExtended();}else input.value=calculatorVariables[name];};store.textContent='STO';store.setAttribute('aria-label','STO '+name.replace('var','').toUpperCase());store.onclick=()=>{if(!Number.isFinite(calculatorResult))return;calculatorVariables[name]=calculatorResult;input.value=calculatorResult;saveCalculatorExtended();};label.append(key,input,store);$('calc-variables').append(label);
}
$('calc-variables').addEventListener('click',calculatorKey);document.querySelector('.calc-variable-keys').onclick=calculatorKey;
let calculatorPanel='scientific';
function selectCalculatorPanel(panel){calculatorPanel=panel;for(const id of ['scientific','statistics','variables'])$('calc-'+id+'-panel').hidden=id!==panel;document.querySelectorAll('[data-calc-panel]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.calcPanel===panel)));floatingWindows.get('calculator-window').clamp();}
document.querySelectorAll('[data-calc-panel]').forEach(button=>button.onclick=()=>selectCalculatorPanel(button.dataset.calcPanel));
const oldCalcMore=$('calc-more').onclick;$('calc-more').onclick=()=>{oldCalcMore();$('calculator-window').classList.toggle('expanded-calculator',$('calc-more').getAttribute('aria-expanded')==='true');$('calc-more').textContent=$('calc-more').getAttribute('aria-expanded')==='true'?'↙':'↗';refreshCalculatorExtensions();};
function fitRegression(xs,ys,degree){
 const cols=degree+1,center=xs.reduce((s,v)=>s+v,0)/xs.length,scale=Math.max(...xs.map(x=>Math.abs(x-center)));if(scale===0)throw Error('Bu veriyle regresyon tanımlı değil.');
 // Scaled modified Gram-Schmidt with reorthogonalization avoids normal-equation instability.
 const vectors=Array.from({length:cols},(_,p)=>xs.map(x=>((x-center)/scale)**p)),Q=[],R=Array.from({length:cols},()=>Array(cols).fill(0));
 for(let j=0;j<cols;j++){const v=vectors[j].slice();for(let pass=0;pass<2;pass++)for(let k=0;k<j;k++){const projection=Q[k].reduce((s,q,i)=>s+q*v[i],0);R[k][j]+=projection;for(let i=0;i<v.length;i++)v[i]-=projection*Q[k][i];}R[j][j]=Math.hypot(...v);if(R[j][j]<1e-12)throw Error('Bu veriyle regresyon tanımlı değil.');Q.push(v.map(x=>x/R[j][j]));}
 const c=Q.map(q=>q.reduce((s,v,i)=>s+v*ys[i],0));for(let j=cols-1;j>=0;j--){for(let k=j+1;k<cols;k++)c[j]-=R[j][k]*c[k];c[j]/=R[j][j];}
 if(degree===1)return[c[0]-c[1]*center/scale,c[1]/scale];return[c[0]-c[1]*center/scale+c[2]*center*center/scale**2,c[1]/scale-2*c[2]*center/scale**2,c[2]/scale**2];
}
function calculatorStatistics(source,model='linear'){
 const rows=String(source).trim().split(/\n/).filter(line=>line.trim()).map(line=>line.trim().split(/[\s;]+/).map(x=>Number(x.replace(',','.'))));
 if(!rows.length||rows.length>10000||rows.some(r=>r.length<1||r.length>2||r.some(v=>!Number.isFinite(v))))throw Error('Veriyi kontrol et.');
 const xs=rows.map(r=>r[0]),n=xs.length,mean=xs.reduce((s,v)=>s+v,0)/n,ss=xs.reduce((s,v)=>s+(v-mean)**2,0),result={n,sum:xs.reduce((s,v)=>s+v,0),sumSquares:xs.reduce((s,v)=>s+v*v,0),mean,populationSD:Math.sqrt(ss/n),sampleSD:n>1?Math.sqrt(ss/(n-1)):null};
 if(rows.every(r=>r.length===1))return result;if(rows.some(r=>r.length!==2))throw Error('Regresyon için x ve y çiftleri girin.');
 const ys=rows.map(r=>r[1]),my=ys.reduce((s,v)=>s+v,0)/n,syy=ys.reduce((s,v)=>s+(v-my)**2,0),cov=xs.reduce((s,x,i)=>s+(x-mean)*(ys[i]-my),0);
 Object.assign(result,{sumY:ys.reduce((s,v)=>s+v,0),sumYSquares:ys.reduce((s,v)=>s+v*v,0),sumXY:xs.reduce((s,x,i)=>s+x*ys[i],0),meanY:my,populationSDY:Math.sqrt(syy/n),sampleSDY:n>1?Math.sqrt(syy/(n-1)):null,r:ss>0&&syy>0?cov/Math.sqrt(ss*syy):null});
 let tx=xs.slice(),ty=ys.slice();if(['log','power'].includes(model)){if(xs.some(x=>x<=0))throw Error('Bu veriyle regresyon tanımlı değil.');tx=xs.map(Math.log);}if(['exp','power'].includes(model)){if(ys.some(y=>y<=0))throw Error('Bu veriyle regresyon tanımlı değil.');ty=ys.map(Math.log);}if(model==='inverse'){if(xs.some(x=>x===0))throw Error('Bu veriyle regresyon tanımlı değil.');tx=xs.map(x=>1/x);}
 const coefficients=fitRegression(tx,ty,model==='quadratic'?2:1);if(['exp','power'].includes(model))coefficients[0]=Math.exp(coefficients[0]);Object.assign(result,{model,coefficients});return result;
}
function renderCalculatorStatistics(){try{const r=calculatorStatistics($('calc-stat-data').value,$('calc-stat-model').value),f=v=>v===null?'—':formatCalc(v),lines=[`n=${r.n}    Σx=${f(r.sum)}    Σx²=${f(r.sumSquares)}`,`x̄=${f(r.mean)}    σx=${f(r.populationSD)}    sx=${f(r.sampleSD)}`];if(r.coefficients){const [a,b,c]=r.coefficients;lines.push(`Σy=${f(r.sumY)}    Σy²=${f(r.sumYSquares)}    Σxy=${f(r.sumXY)}`,`ȳ=${f(r.meanY)}    σy=${f(r.populationSDY)}    sy=${f(r.sampleSDY)}`);const equation=r.model==='quadratic'?`y=${f(a)}+(${f(b)})x+(${f(c)})x²`:r.model==='log'?`y=${f(a)}+(${f(b)})ln x`:r.model==='exp'?`y=${f(a)}·e^((${f(b)})x)`:r.model==='power'?`y=${f(a)}·x^(${f(b)})`:r.model==='inverse'?`y=${f(a)}+(${f(b)})/x`:`y=${f(a)}+(${f(b)})x`;lines.push(equation,'r='+f(r.r));}$('calc-stat-output').textContent=lines.join('\n');}catch(e){$('calc-stat-output').textContent=t(e.message);}}
$('calc-stat-run').onclick=renderCalculatorStatistics;$('calc-stat-clear').onclick=()=>{$('calc-stat-data').value='';$('calc-stat-output').textContent='';$('calc-predict-output').textContent='';};
// Future supported modules register a port plus input and execute adapters, independent of calculator internals.
(function(){
 const modules=new Map(),sourceId='calculator';let armed=null,connection=null,frame=null;
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg'),path=document.createElementNS(svg.namespaceURI,'path');svg.id='module-cables';svg.setAttribute('aria-hidden','true');svg.append(path);document.body.append(svg);
 const schedule=()=>{if(frame!==null)return;frame=requestAnimationFrame(()=>{frame=null;drawCable();});};
 function drawCable(){const a=modules.get(sourceId),b=modules.get(connection);if(!b||a.pane.hidden||b.pane.hidden||$('workspace').hidden){svg.setAttribute('hidden','');return;}svg.removeAttribute('hidden');svg.setAttribute('viewBox',`0 0 ${innerWidth} ${innerHeight}`);const r=a.port.getBoundingClientRect(),s=b.port.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2,u=s.left+s.width/2,v=s.top+s.height/2,bend=Math.max(55,Math.abs(u-x)*.35);path.setAttribute('d',`M${x},${y} C${x+bend},${y+35} ${u-bend},${v+35} ${u},${v}`);}
 function update(){for(const [id,module] of modules){module.port.setAttribute('aria-pressed',String(id===armed||connection&&(id===sourceId||id===connection)));module.port.classList.toggle('link-armed',id===armed);module.port.classList.toggle('linked',!!connection&&(id===sourceId||id===connection));module.port.title=t(connection&&(id===sourceId||id===connection)?'Modül bağlantısını kes':'Modülleri bağla');module.port.setAttribute('aria-label',module.port.title);}
  if(!connection)svg.setAttribute('hidden','');$('module-link-status').hidden=!armed&&!connection;$('module-link-status').textContent=t(connection?'Grafik klavyesi':'Bağlanacak modülü seçin');$('calc-input').classList.toggle('linked-input',!!connection);$('calc-result').hidden=!!connection;schedule();}
 function disconnect(){connection=null;armed=null;update();}
 function activate(id){if(connection&&(id===sourceId||id===connection)){disconnect();return;}if(!armed){armed=id;update();toast('Bağlanacak modülü seçin');return;}if(armed===id){armed=null;update();return;}if(armed!==sourceId&&id!==sourceId){armed=id;update();return;}connection=armed===sourceId?id:armed;armed=null;const target=modules.get(connection).input();calcInput.value=target.value;calculatorError='';$('calc-error').textContent='';update();}
 function register(adapter){modules.set(adapter.id,adapter);adapter.port.onclick=()=>activate(adapter.id);new MutationObserver(schedule).observe(adapter.pane,{attributes:true,attributeFilter:['style','hidden','class']});new ResizeObserver(schedule).observe(adapter.pane);update();}
 function commit(){if(!connection)return;const module=modules.get(connection),input=module.input();if(calcInput.value.length>input.maxLength)return;input.value=calcInput.value;input.setSelectionRange(calcInput.selectionStart??input.value.length,calcInput.selectionEnd??input.value.length);input.dispatchEvent(new Event('input',{bubbles:true}));}
 function execute(){commit();clearTimeout(graphTimer);modules.get(connection)?.execute();}
 globalThis.ModuleLinks={register,get connected(){return !!connection;},get target(){return connection;},commit,execute,disconnect,refresh:update};
 register({id:sourceId,port:$('calculator-link'),pane:$('calculator-window')});
 let activeGraphInput=$('graph-function-1');const graphInput=()=>graphDimension==='3d'?$('graph-surface'):activeGraphInput.isConnected?activeGraphInput:$('graph-function-1');
 register({id:'graph',port:$('graph-link'),pane:$('graph-window'),input:graphInput,execute:()=>{graphMode=calculatorMode;$('graph-mode').textContent=graphMode;compileGraph();}});
 $('graph-window').addEventListener('focusin',event=>{if(graphInputs().includes(event.target)||event.target===$('graph-surface')){activeGraphInput=event.target;if(connection==='graph')calcInput.value=event.target.value;}});
 $('graph-window').addEventListener('input',event=>{if(connection==='graph'&&event.target===graphInput()&&calcInput.value!==event.target.value)calcInput.value=event.target.value;});
 $('graph-window').addEventListener('click',event=>{if(connection==='graph'&&event.target.closest('[data-graph-dimension]'))calcInput.value=graphInput().value;});
 calcInput.addEventListener('input',commit);$('calculator-window').addEventListener('click',event=>{if(event.target.closest('[data-calc-key]'))commit();});
 // Keep caret position while tapping keys, and prevent the Android soft keyboard from opening for each key.
 $('calculator-window').addEventListener('pointerdown',event=>{if(event.target.closest('[data-calc-key]'))event.preventDefault();});
 const oldEnter=calcInput.onkeydown;calcInput.onkeydown=event=>{if(event.key==='Enter'&&connection){event.preventDefault();execute();}else oldEnter(event);};
 window.addEventListener('resize',schedule);document.addEventListener('keydown',event=>{if(event.key==='Escape'&&armed){armed=null;update();}});new MutationObserver(schedule).observe(document.body,{attributes:true,attributeFilter:['data-screen']});
})();
function refreshCalculatorExtensions(){document.querySelector('label[for="calc-stat-data"]').textContent=t($('calc-stat-model').value==='sd'?'SD: her satır değer ve frekans':'Veri (her satır x veya x y)');if($('calc-stat-output').textContent&&$('calc-stat-data').value.trim())renderCalculatorStatistics();$('calc-more').title=t($('calc-more').getAttribute('aria-expanded')==='true'?'Hesap makinesini daralt':'Hesap makinesini genişlet');$('calc-more').setAttribute('aria-label',$('calc-more').title);ModuleLinks.refresh();}
const originalRefreshToolLanguage=refreshToolLanguage;refreshToolLanguage=function(){originalRefreshToolLanguage();refreshCalculatorExtensions();};
refreshCalculatorExtensions();renderCalculator();
const unweightedStatistics=calculatorStatistics;
calculatorStatistics=function(source,model='linear'){
 if(model!=='sd'){
  const r=unweightedStatistics(source,model);if(r.coefficients&&['log','exp','power','inverse'].includes(model)){
   const rows=source.trim().split(/\n/).filter(x=>x.trim()).map(line=>line.trim().split(/[\s;]+/).map(x=>Number(x.replace(',','.')))),xs=rows.map(row=>model==='inverse'?1/row[0]:['log','power'].includes(model)?Math.log(row[0]):row[0]),ys=rows.map(row=>['exp','power'].includes(model)?Math.log(row[1]):row[1]),mx=xs.reduce((s,v)=>s+v,0)/xs.length,my=ys.reduce((s,v)=>s+v,0)/ys.length,sx=xs.reduce((s,v)=>s+(v-mx)**2,0),sy=ys.reduce((s,v)=>s+(v-my)**2,0);r.r=sx>0&&sy>0?xs.reduce((s,x,i)=>s+(x-mx)*(ys[i]-my),0)/Math.sqrt(sx*sy):null;
  }return r;
 }
 const rows=source.trim().split(/\n/).filter(x=>x.trim()).map(line=>line.trim().split(/[\s;]+/).map(x=>Number(x.replace(',','.'))));
 if(!rows.length||rows.length>10000||rows.some(r=>r.length>2||r.some(v=>!Number.isFinite(v))||r.length===2&&(!Number.isSafeInteger(r[1])||r[1]<1)))throw Error('Veriyi kontrol et.');
 const n=rows.reduce((s,r)=>s+(r[1]||1),0),sum=rows.reduce((s,r)=>s+r[0]*(r[1]||1),0),mean=sum/n,ss=rows.reduce((s,r)=>s+(r[0]-mean)**2*(r[1]||1),0);if(n>1e9)throw Error('Veriyi kontrol et.');return{n,sum,sumSquares:rows.reduce((s,r)=>s+r[0]**2*(r[1]||1),0),mean,populationSD:Math.sqrt(ss/n),sampleSD:n>1?Math.sqrt(ss/(n-1)):null};
};
$('calc-stat-model').onchange=()=>{document.querySelector('label[for="calc-stat-data"]').textContent=t($('calc-stat-model').value==='sd'?'SD: her satır değer ve frekans':'Veri (her satır x veya x y)');$('calc-predict-output').textContent='';};
function predictRegression(inverse){try{const r=calculatorStatistics($('calc-stat-data').value,$('calc-stat-model').value);if(!r.coefficients)throw Error('Regresyon için x ve y çiftleri girin.');const [a,b,c]=r.coefficients,input=$(inverse?'calc-predict-y-value':'calc-predict-x'),v=Number(input.value);if(!input.value.trim()||!Number.isFinite(v))throw Error('Veriyi kontrol et.');let results=[];
 if(!inverse){const y=r.model==='quadratic'?a+b*v+c*v*v:r.model==='log'?a+b*Math.log(v):r.model==='exp'?a*Math.exp(b*v):r.model==='power'?a*v**b:r.model==='inverse'?a+b/v:a+b*v;if(r.model==='power'&&v<=0||r.model==='log'&&v<=0)throw Error('Bu işlem tanımlı değil.');results=[y];}
 else if(r.model==='quadratic'){if(Math.abs(c)<1e-14)results=[(v-a)/b];else{const d=b*b-4*c*(a-v);if(d<0)throw Error('Bu işlem tanımlı değil.');results=[(-b+Math.sqrt(d))/(2*c),(-b-Math.sqrt(d))/(2*c)];}}
 else results=[r.model==='log'?Math.exp((v-a)/b):r.model==='exp'?Math.log(v/a)/b:r.model==='power'?Math.exp(Math.log(v/a)/b):r.model==='inverse'?b/(v-a):(v-a)/b];
 if(results.some(x=>!Number.isFinite(x)))throw Error('Bu işlem tanımlı değil.');$('calc-predict-output').textContent=(inverse?'x̂=':'ŷ=')+results.map(formatCalc).join(' ; ');
 }catch(e){$('calc-predict-output').textContent=t(e.message);}}
$('calc-predict-y').onclick=()=>predictRegression(false);$('calc-predict-x-run').onclick=()=>predictRegression(true);
