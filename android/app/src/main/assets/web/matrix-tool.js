/* Visual A–D matrix editor and numerical elimination with inspectable row steps. */
(() => {
const clone=A=>A.map(r=>r.slice()),max=A=>Math.max(0,...A.flat().map(Math.abs)),finite=A=>{if(A.flat().some(v=>!Number.isFinite(v)))throw Error('Sonuç tanımlı değil.');return A;};
function reduce(A,pivotCols=A[0].length){
 const R=clone(A),steps=[],pivots=[],tolerance=1e-12*max(A.map(row=>row.slice(0,pivotCols)));let row=0,sign=1,product=1;
 for(let col=0;col<pivotCols&&row<R.length;col++){
  let best=row;for(let i=row+1;i<R.length;i++)if(Math.abs(R[i][col])>Math.abs(R[best][col]))best=i;
  if(Math.abs(R[best][col])<=tolerance)continue;
  if(best!==row){[R[row],R[best]]=[R[best],R[row]];sign=-sign;steps.push({kind:'swap',row,other:best,matrix:clone(R)});}
  const pivot=R[row][col];product*=pivot;R[row]=R[row].map(v=>v/pivot);steps.push({kind:'scale',row,value:pivot,matrix:clone(R)});
  for(let i=0;i<R.length;i++)if(i!==row){const factor=R[i][col];if(factor!==0){R[i]=R[i].map((v,j)=>v-factor*R[row][j]);R[i][col]=0;steps.push({kind:'subtract',row:i,other:row,value:factor,matrix:clone(R)});}}
  pivots.push(col);row++;finite(R);
 }return{matrix:R,steps,pivots,rank:pivots.length,det:pivots.length===pivotCols&&A.length===pivotCols?sign*product:0,tolerance};
}
function calculate(a,b,op,scalar=1){
 const square=()=>{if(a.length!==a[0].length)throw Error('Kare matris gerekli.');},same=()=>{if(a.length!==b.length||a[0].length!==b[0].length)throw Error('Matris boyutları eşit olmalı.');},product=(A,B)=>{if(A[0].length!==B.length)throw Error('Çarpım için sol sütun ve sağ satır sayısı eşit olmalı.');return A.map(row=>B[0].map((_,j)=>row.reduce((s,v,k)=>s+v*B[k][j],0)));};
 let data,result=null,reduction=null,classification=null,free=[];
 if(op==='add'||op==='subtract'){same();data=a.map((row,i)=>row.map((v,j)=>v+(op==='add'?1:-1)*b[i][j]));}
 else if(op==='multiply')data=product(a,b);
 else if(op==='transpose')data=a[0].map((_,j)=>a.map(row=>row[j]));
 else if(op==='scale')data=a.map(row=>row.map(v=>v*scalar));
 else if(op==='identity'){square();data=a.map((row,i)=>row.map((_,j)=>+(i===j)));}
 else if(op==='square'||op==='cube'){square();data=product(a,a);if(op==='cube')data=product(data,a);}
 else if(op==='trace'){square();result=a.reduce((s,row,i)=>s+row[i],0);}
 else if(op==='det'){square();reduction=reduce(a);result=reduction.det;}
 else if(op==='rank'||op==='rref'){reduction=reduce(a);if(op==='rank')result=reduction.rank;else data=reduction.matrix;}
 else if(op==='inverse'){square();const n=a.length;reduction=reduce(a.map((row,i)=>[...row,...Array.from({length:n},(_,j)=>+(i===j))]),n);if(reduction.rank<n)throw Error('Tekil matrisin tersi yok.');data=reduction.matrix.map(row=>row.slice(n));}
 else if(op==='solve'){
  if(b.length!==a.length||b[0].length!==1)throw Error('Ax=b için sağ matris aynı satır sayısında tek sütun olmalı.');
  const n=a[0].length;reduction=reduce(a.map((row,i)=>[...row,b[i][0]]),n);const rhsTolerance=1e-10*Math.max(max(b),max(reduction.matrix.map(row=>[row[n]]))),inconsistent=reduction.matrix.slice(reduction.rank).some(row=>Math.abs(row[n])>rhsTolerance);
  free=Array.from({length:n},(_,i)=>i).filter(i=>!reduction.pivots.includes(i));classification=inconsistent?'none':free.length?'infinite':'unique';
  if(!inconsistent){data=Array.from({length:n},()=>[0]);reduction.pivots.forEach((col,i)=>data[col][0]=reduction.matrix[i][n]);}
 }else throw Error('İşlemi kontrol et.');
 if(data)finite(data);if(result!==null&&!Number.isFinite(result))throw Error('Sonuç tanımlı değil.');return{data,result,reduction,classification,free};
}
function create(ctx){
 const {form,output,field,val,fmt,text,scope,setActive,invalidate}=ctx,memory={},names=['A','B','C','D'].map(x=>[x,x]);let stored='A',cells=[],syncing=false;
 const store=field('store','Matris değişkeni','select',names),rows=field('rows','Satır sayısı','select',Array.from({length:6},(_,i)=>[String(i+1),String(i+1)]),'2'),cols=field('cols','Sütun sayısı','select',Array.from({length:6},(_,i)=>[String(i+1),String(i+1)]),'2');
 const editor=document.createElement('div');editor.className='matrix-editor';form.append(editor);
 const actions=document.createElement('div');actions.className='matrix-editor-actions';form.append(actions);
 const bulk=document.createElement('details');bulk.className='matrix-bulk';const summary=document.createElement('summary');summary.textContent=t('Toplu metin girişi');summary.dataset.moduleI18n='Toplu metin girişi';bulk.append(summary);form.append(bulk);
 const data=field('data','Her satır bir matris satırı','textarea');bulk.append(data.closest('label'));
 const status=document.createElement('p');status.className='module-inline-status';status.setAttribute('role','status');bulk.append(status);
 function save(){memory[stored]=cells.map(row=>row.map(cell=>cell.value.trim()||'?').join(' ')).join('\n');data.value=memory[stored];}
 function build(values){const n=+rows.value,m=+cols.value;editor.replaceChildren();editor.setAttribute('aria-label',stored+' '+n+'×'+m);editor.style.setProperty('--matrix-columns',m);cells=Array.from({length:n},(_,i)=>Array.from({length:m},(_,j)=>{const cell=document.createElement('input');cell.type='text';cell.inputMode='text';cell.maxLength=128;cell.spellcheck=false;cell.value=values?.[i]?.[j]??'0';cell.dataset.matrixCell=i+','+j;cell.setAttribute('aria-label',`${stored} ${i+1},${j+1}`);cell.onfocus=()=>setActive(cell);cell.oninput=()=>{save();invalidate();};editor.append(cell);return cell;}));setActive(cells[0][0]);save();}
 function load(source){const values=String(source||'0 0\n0 0').trim().split('\n').filter(s=>s.trim()).map(row=>row.trim().split(/\s+/));if(values.length>6||!values[0]?.length||values[0].length>6||values.some(r=>r.length!==values[0].length))throw Error('Matris 1–6 satır ve sütundan oluşmalı.');rows.value=String(values.length);cols.value=String(values[0].length);build(values.map(row=>row.map(v=>v==='?'?'':v)));}
 const button=(label,fn)=>{const b=document.createElement('button');b.type='button';b.className='module-action';b.textContent=t(label);b.dataset.moduleI18n=label;b.onclick=()=>{fn();save();invalidate();};actions.append(b);};
 button('Sıfırla',()=>cells.flat().forEach(cell=>cell.value='0'));button('Birim matris',()=>{cols.value=rows.value;build(Array.from({length:+rows.value},(_,i)=>Array.from({length:+cols.value},(_,j)=>String(+(i===j)))));});button('Hücreleri temizle',()=>cells.flat().forEach(cell=>cell.value=''));
 const apply=document.createElement('button');apply.type='button';apply.className='module-action';apply.textContent=t('Metni hücrelere aktar');apply.dataset.moduleI18n='Metni hücrelere aktar';bulk.append(apply);apply.onclick=()=>{try{const parsed=CWMath.matrix(data.value);load(parsed.map(row=>row.join(' ')).join('\n'));invalidate();status.textContent='';}catch(e){status.textContent=t(e.message);}};
 store.onchange=()=>{save();stored=store.value;load(memory[stored]);invalidate();};const resize=()=>{build(cells.map(row=>row.map(cell=>cell.value)));invalidate();};rows.onchange=cols.onchange=resize;
 field('left','Sol değişken','select',names).onchange=invalidate;field('right','Sağ değişken','select',names,'B').onchange=invalidate;const op=field('operation','İşlem','select',[['add','A + B'],['subtract','A − B'],['multiply','A × B'],['scale','Skaler çarpım'],['transpose','Aᵀ'],['det','det(A)'],['inverse','A⁻¹'],['rank','Rank'],['rref','İndirgenmiş satır biçimi'],['solve','Ax = b'],['trace','İz'],['square','A²'],['cube','A³'],['identity','I']]);const scalar=field('scalar','Skaler','text',null,'1');scalar.addEventListener('input',invalidate);
 function refresh(){scalar.closest('label').hidden=op.value!=='scale';ctx.show('right',['add','subtract','multiply','solve'].includes(op.value));}op.onchange=()=>{refresh();invalidate();};
 function visual(A,label,determinant=false){const wrap=document.createElement('div');wrap.className='matrix-result';const title=document.createElement('p');title.textContent=label;wrap.append(title,MatrixVisual.node(A.map(row=>row.map(fmt)),{determinant,label}));output.append(wrap);}
 function compute(){if(data.value!==memory[stored]){const parsed=CWMath.matrix(data.value);load(parsed.map(row=>row.join(' ')).join('\n'));}save();const a=CWMath.matrix(memory[val('left')]||''),needs=['add','subtract','multiply','solve'].includes(op.value),b=needs?CWMath.matrix(memory[val('right')]||''):null,result=calculate(a,b,op.value,CWMath.real(scalar.value,scope));visual(a,val('left')+' · '+a.length+'×'+a[0].length,op.value==='det');if(b)visual(b,val('right')+' · '+b.length+'×'+b[0].length);
  if(result.classification){text(t(({none:'Çözüm yok.',infinite:'Sonsuz çözüm.',unique:'Tek çözüm.'})[result.classification]));if(result.classification==='infinite'){text(t('Serbest değişkenler')+': '+result.free.map(i=>'x'+(i+1)+'=t'+(i+1)).join(', '));for(let i=0;i<result.reduction.pivots.length;i++){const col=result.reduction.pivots[i],row=result.reduction.matrix[i];text('x'+(col+1)+' = '+fmt(row[a[0].length])+result.free.map(j=>' − ('+fmt(row[j])+')t'+(j+1)).join(''));}text(t('Aşağıdaki özel çözümde serbest değişkenler sıfır alınmıştır.'));}}
  if(result.data)visual(result.data,t('Sonuç')+' · '+result.data.length+'×'+result.data[0].length);if(result.result!==null)text(t('Sonuç')+' ≈ '+fmt(result.result));
  if(result.reduction){text(t('Rank')+' = '+result.reduction.rank);const details=document.createElement('details');details.className='matrix-steps';const summary=document.createElement('summary');summary.dataset.moduleI18n='Satır işlemlerini göster';summary.textContent=t(summary.dataset.moduleI18n);details.append(summary);const note=document.createElement('p');note.dataset.moduleI18n='Sayısal sonuçlar yaklaşık; çok küçük pivotlar sıfır kabul edilir.';note.textContent=t(note.dataset.moduleI18n);details.append(note);for(const step of result.reduction.steps){const row=document.createElement('div'),label=document.createElement('p');label.textContent=step.kind==='swap'?`R${step.row+1} ↔ R${step.other+1}`:step.kind==='scale'?`R${step.row+1} ← R${step.row+1} / (${fmt(step.value)})`:`R${step.row+1} ← R${step.row+1} − (${fmt(step.value)})R${step.other+1}`;row.append(label,MatrixVisual.node(step.matrix.map(row=>row.map(fmt))));details.append(row);}output.append(details);}
  return{result:result.result,data:result.data,expression:op.value+'('+val('left')+(needs?','+val('right'):'')+')'};
 }
 load('0 0\n0 0');refresh();return{compute,refresh,exportExtra:()=>{save();return{memory,stored};},importExtra(state){Object.assign(memory,state?.memory||{});stored=names.some(n=>n[0]===state?.stored)?state.stored:'A';store.value=stored;load(memory[stored]||data.value);refresh();},receiveData(d){if(!Array.isArray(d)||!Array.isArray(d[0]))throw Error('Matris verisi gerekli.');finite(d);load(d.map(row=>row.join(' ')).join('\n'));},save};
}
globalThis.MatrixTool={create,calculate,reduce};
Object.assign(translations,{'Satır sayısı':'Rows','Sütun sayısı':'Columns','Toplu metin girişi':'Bulk text input','Sıfırla':'Fill with zeros','Birim matris':'Identity matrix','Hücreleri temizle':'Clear cells','Metni hücrelere aktar':'Apply text to cells','Skaler çarpım':'Scalar multiplication','Skaler':'Scalar','Rank':'Rank','İndirgenmiş satır biçimi':'Reduced row echelon form','İz':'Trace','Satır işlemlerini göster':'Show row operations','Çözüm yok.':'No solution.','Sonsuz çözüm.':'Infinitely many solutions.','Tek çözüm.':'Unique solution.','Serbest değişkenler':'Free variables','Aşağıdaki özel çözümde serbest değişkenler sıfır alınmıştır.':'The particular solution below sets all free variables to zero.','Sayısal sonuçlar yaklaşık; çok küçük pivotlar sıfır kabul edilir.':'Numerical results are approximate; very small pivots are treated as zero.','Matris 1–6 satır ve sütundan oluşmalı.':'Matrix must have 1–6 rows and columns.','Matris boyutları eşit olmalı.':'Matrix dimensions must match.','Çarpım için sol sütun ve sağ satır sayısı eşit olmalı.':'Left columns must match right rows for multiplication.','Ax=b için sağ matris aynı satır sayısında tek sütun olmalı.':'For Ax=b the right matrix must have matching rows and one column.','Tekil matrisin tersi yok.':'A singular matrix has no inverse.','Kare matris gerekli.':'A square matrix is required.'});
})();
