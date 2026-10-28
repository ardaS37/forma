const assert=require('node:assert/strict'),path=require('node:path');
const root=path.join(__dirname,'app/src/main/assets/web');
for(const f of ['derivative-bank.js','integral-bank.js','limit-bank.js','practice-banks.js'])require(path.join(root,f));
const math=require(path.join(root,'vendor/mathjs/math.js')),M=PracticeMath;
let questions=0,checks=0;const seen={limits:new Set(),integrals:new Set()};
const source=e=>M.ascii(e).replace(/\bln\(/g,'log('),compile=e=>math.compile(source(e)),at=(f,x)=>f.evaluate({x});
function near(a,b,label,tol=1e-7){assert(Number.isFinite(a)&&Number.isFinite(b),label+': nonfinite');assert(Math.abs(a-b)<=tol*Math.max(1,Math.abs(a),Math.abs(b)),`${label}: ${a} != ${b}`);checks++;}
function integrate(f,a,b){const n=512,h=(b-a)/n;let sum=at(f,a)+at(f,b);for(let i=1;i<n;i++)sum+=(i%2?4:2)*at(f,a+i*h);return sum*h/3;}
function primitive(v,label){
  const f=compile(v.f),F=compile(v.F);let compared=0,symbolic;
  try{symbolic=math.derivative(math.parse(source(v.F)),'x').compile();}catch{}
  for(const x of [-2.2,-.71,.19,.43,.73,1.41,2.23]){
    let value,expected;try{value=at(f,x);expected=at(F,x);}catch{continue;}
    if(typeof value!=='number'||typeof expected!=='number'||![value,expected].every(Number.isFinite)||Math.abs(value)>1e9)continue;
    const h=1e-5*Math.max(1,Math.abs(x));let diff;try{diff=(at(F,x-2*h)-8*at(F,x-h)+8*at(F,x+h)-at(F,x+2*h))/(12*h);}catch{continue;}
    if(!Number.isFinite(diff))continue;near(diff,value,label+' finite difference',3e-5);compared++;
    if(symbolic){const d=at(symbolic,x);if(typeof d==='number'&&Number.isFinite(d))near(d,value,label+' independent symbolic');}
  }
  assert(compared>0,label+': no real comparison point');
}
function integral(q){
  const v=q.verification,label=q.template;
  if(v.f&&v.F)primitive(v,label);
  if(['definite','area','volume','average'].includes(v.kind)){
    const f=compile(v.f),numeric=integrate(f,v.lo,v.hi)*v.factor;
    near(numeric,v.value,label+' quadrature',2e-7);
    if(v.kind==='area'){assert(v.value>=0);if(v.upper){const u=compile(v.upper),l=compile(v.lower);for(let i=0;i<=10;i++){const x=v.lo+(v.hi-v.lo)*i/10;assert(at(u,x)>=at(l,x));near(at(f,x),at(u,x)-at(l,x),label+' height');}}}
    if(v.kind==='volume'){const R=compile(v.curve),r=compile(v.inner);for(let i=0;i<=10;i++){const x=v.lo+(v.hi-v.lo)*i/10;assert(at(R,x)>=at(r,x));near(at(f,x),at(R,x)**2-at(r,x)**2,label+' cross section');}}
  }
  if(v.kind==='initial')near(at(compile(v.F),v.at),v.target,label+' initial value');
  if(v.kind==='fundamental'){
    const exact=math.derivative(math.parse(source(v.exactPrimitive)),'x').compile(),answer=compile(v.answer);
    for(const x of [.2,.7,1.3])near(at(exact,x),at(answer,x),label+' variable-bound derivative');
  }
  if(v.kind==='improper'){
    if(v.type==='tail'&&v.converges)near(v.value,v.a/(v.p-1),label);
    if(v.type==='tail'&&!v.converges)assert(v.p===1);
    if(v.type==='exptail')near(v.value,1/v.a,label);
    if(v.type==='rootsingularity')near(v.value,2*Math.sqrt(v.a),label);
    if(v.type==='singular')assert(!v.converges);
    checks++;
  }
}
function limit(q){
  const v=q.verification,label=q.template;
  if(v.result==='parameter'){near(v.coeff*v.point+v.constant,v.value*v.point+v.offset,label+' continuity');return;}
  if(v.piecewise){const left=at(compile(v.piecewise.left),v.point),right=at(compile(v.piecewise.right),v.point);near(left,v.left,label+' left');near(right,v.right,label+' right');if(v.result==='finite')near(left,v.value,label);else assert(Math.abs(left-right)>0);return;}
  const f=compile(v.f);
  if(v.oscillation){for(const n of [10,100]){near(at(f,v.oscillation/(Math.PI/2+2*Math.PI*n)),1,label);near(at(f,v.oscillation/(3*Math.PI/2+2*Math.PI*n)),-1,label);}return;}
  if(v.result==='dne'){
    const h=1e-5,left=at(f,v.point-h),right=at(f,v.point+h);
    if(v.left==='-inf'){assert(left<-1e4&&right>1e4);checks++;}else{near(left,v.left,label);near(right,v.right,label);}return;
  }
  const infinitePoint=typeof v.point==='string',directions=v.side==='left'?[-1]:v.side==='right'?[1]:[-1,1];
  if(v.result==='infinity'){
    const xs=infinitePoint?[10,100,1000].map(x=>v.point==='-inf'?-x:x):[.01,.001,.00001].map(h=>v.point+directions[0]*h);
    const values=xs.map(x=>at(f,x));assert(values.every(n=>typeof n==='number'&&!Number.isNaN(n)),label);
    assert(values.at(-1)*v.sign>values[0]*v.sign||!Number.isFinite(values.at(-1)),label+' growth direction');assert(values.at(-1)*v.sign>0,label+' sign');checks+=2;return;
  }
  for(const direction of infinitePoint?[1]:directions){
    const xs=infinitePoint?[10,20,50,100,1000,100000].map(x=>v.point==='-inf'?-x:x):[1e-3,1e-4,1e-5].map(h=>v.point+direction*h*Math.max(1,Math.abs(v.point)));
    const values=xs.map(x=>{try{return at(f,x);}catch{return NaN;}}).filter(x=>typeof x==='number'&&Number.isFinite(x));
    assert(values.length,label+' real samples');const last=values.at(-1),expected=v.value;
    const tolerance=expected===0?1e-3:1e-2*Math.max(1e-8,Math.abs(expected));
    assert(Math.abs(last-expected)<=tolerance,`${label}: sampled ${last}, expected ${expected}`);checks++;
  }
}
for(const mode of ['integrals','limits']){
  const bank=PracticeBanks[mode];
  for(let seed=1;seed<=16;seed++)for(let index=0;index<bank.templates.length;index++){
    const q=bank.generate(seed*104729,index);assert.deepEqual(JSON.parse(JSON.stringify(q)),q,q.template+' snapshot');assert.deepEqual(bank.generate(seed*104729,index),q,'reproducibility');
    assert(q.text&&q.eq&&q.eqLatex&&q.solution&&q.english.text&&q.english.solution);assert.equal(q.supportsChoices,false);seen[mode].add(q.template);questions++;
    (mode==='integrals'?integral:limit)(q);
  }
  assert.equal(seen[mode].size,bank.templates.length,mode+' template coverage');
  for(const disabled of bank.defaults){
    const selected=bank.defaults.filter(t=>t!==disabled),eligible=bank.available(selected);
    for(let i=0;i<eligible.length;i++){
      const q=bank.generate(932,i,selected);assert(!q.requiredTopics.includes(disabled));
      if(disabled==='logarithm')assert(!/\bln\(/.test(q.eq),'logarithm leaked into '+q.template);
      if(disabled==='trig')assert(!/\b(?:sin|cos|tan|cot|sec|csc)\(/.test(q.eq),'trig leaked into '+q.template);
      checks++;
    }
  }
  assert.equal(bank.available([]).length,0);assert.throws(()=>bank.generate(1,0,[]));
}
for(const [mode,bank] of Object.entries(PracticeBanks)){
  assert.equal(bank.topicGroups.length,2);const ids=bank.topicGroups.flatMap(g=>g.topics.map(t=>t.id));assert.equal(new Set(ids).size,bank.topics.length);
  const school=bank.topicGroups[0].topics.map(t=>t.id),pool=bank.available(school);assert(pool.length>0);
  for(let i=0;i<pool.length;i++){const q=bank.generate(913,i,school);assert(q.requiredTopics.every(t=>school.includes(t)));if(mode==='limits'){assert.equal(typeof q.verification.point,'number');assert.notEqual(q.verification.result,'infinity');assert(!/standard|lhopital|higher/.test(q.template));}if(mode==='derivatives'&&q.verification.order)assert(q.verification.order<=2);if(mode==='integrals')assert(!['improper','volume','average'].includes(q.verification.kind));checks++;}
}
console.log(`${questions} limit/integral questions, ${checks} independent checks; ${seen.limits.size} limit and ${seen.integrals.size} integral templates passed.`);
