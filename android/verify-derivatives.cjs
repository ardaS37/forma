// Independent mathjs differentiation, finite differences, and dependency filtering.
const assert=require('node:assert/strict');
const path=require('node:path');
const root=path.join(__dirname,'app/src/main/assets/web');
require(path.join(root,'derivative-bank.js'));
const math=require(path.join(root,'vendor/mathjs/math.js'));
const bank=globalThis.DerivativeBank;
const seen=new Set();let questions=0,checks=0;
function near(a,b,label,tolerance=1e-7){assert(Number.isFinite(a)&&Number.isFinite(b),label+': non-finite');assert(Math.abs(a-b)<=tolerance*Math.max(1,Math.abs(a),Math.abs(b)),`${label}: ${a} != ${b}`);checks++;}
function expression(e){return bank.ascii(e).replace(/\bln\(/g,'log(');}
function compiled(e){return math.compile(expression(e));}
function independent(e,order=1){let node=math.parse(expression(e));for(let i=0;i<order;i++)node=math.derivative(node,'x');return node.compile();}
const xs=[-.63,.17,.59,.83,1.37,2.21,3.47];
function derivativeCheck(v,label){
  if(!v.expression||!v.answer)return;
  const fn=compiled(v.expression),actual=compiled(v.answer),expected=independent(v.expression,v.kind==='higher'?v.order:1);
  let compared=0;
  for(const x of xs){
    let f,a,b;try{f=fn.evaluate({x});a=actual.evaluate({x});b=expected.evaluate({x});}catch{continue;}
    if(typeof f!=='number'||typeof a!=='number'||typeof b!=='number'||![f,a,b].every(Number.isFinite))continue;
    near(a,b,label+' symbolic at '+x);compared++;
    if(v.kind!=='higher'&&Math.abs(a)<1e6){
      const h=1e-5*Math.max(1,Math.abs(x));let d;try{d=(fn.evaluate({x:x-2*h})-8*fn.evaluate({x:x-h})+8*fn.evaluate({x:x+h})-fn.evaluate({x:x+2*h}))/(12*h);}catch{continue;}
      if(Number.isFinite(d))near(a,d,label+' finite difference',2e-5);
    }
  }
  assert(compared>0,label+': no real test point');
}
function verify(q){
  assert.deepEqual(JSON.parse(JSON.stringify(q)),q,'serializable snapshot');assert.equal(q.supportsChoices,false);
  assert(q.text&&q.eq&&q.solution&&q.english.text&&q.english.solution);seen.add(q.template);questions++;
  const v=q.verification,label=q.template;
  derivativeCheck(v,label);
  if(v.kind==='point')near(v.value,independent(v.expression).evaluate({x:v.at}),label);
  if(v.kind==='tangent'){near(v.value,compiled(v.expression).evaluate({x:v.at}),label);near(v.slope,independent(v.expression).evaluate({x:v.at}),label);}
  if(v.kind==='normal'){near(v.value,compiled(v.expression).evaluate({x:v.at}),label);near(v.slope*independent(v.expression).evaluate({x:v.at}),-1,label);}
  if(v.kind==='rates'){near(v.v,independent(v.expression).evaluate({x:v.at}),label);near(v.a,independent(v.expression,2).evaluate({x:v.at}),label);}
  if(v.kind==='implicit'){
    const x=v.r/3,y=Math.sqrt((v.r*v.r-x*x)/v.k),slope=-x/(v.k*y);
    near(2*x+2*v.k*y*slope,0,label);checks++;
  }
  if(v.kind==='parametric'){
    const dx=independent(v.x),dy=independent(v.y),a=compiled(v.answer);
    for(const x of [.3,.7,1.2])near(a.evaluate({x}),dy.evaluate({x})/dx.evaluate({x}),label);
  }
  if(v.kind==='corner'){
    const h=1e-4,f=x=>v.scale*Math.abs(x-v.at);near((f(v.at)-f(v.at-h))/h,-v.scale,label);near((f(v.at+h)-f(v.at))/h,v.scale,label);
  }
  if(v.kind==='match'){near(v.scale*v.at**2,v.A*v.at+v.B,label+' continuity');near(2*v.scale*v.at,v.A,label+' derivative');}
  if(v.kind==='extrema'){near(compiled(v.expression).evaluate({x:v.at}),v.value,label);near(independent(v.expression).evaluate({x:v.at}),0,label);assert(independent(v.expression,2).evaluate({x:v.at})>0);}
  if(v.kind==='monotonicity'){const d=independent(v.expression);near(d.evaluate({x:v.b}),0,label);near(d.evaluate({x:-v.b}),0,label);assert(d.evaluate({x:0})<0);assert(d.evaluate({x:v.b+1})>0);}
  if(v.kind==='optimization'){near(v.side*2,v.p,label);near(v.side*(v.p-v.side),v.area,label);assert(v.side*(v.p-v.side)>=(v.side+.1)*(v.p-v.side-.1));}
}
for(let seed=1;seed<=20;seed++){
  for(let index=0;index<bank.templates.length;index++){
    const q=bank.generate(seed*104729,index);verify(q);
    assert.deepEqual(bank.generate(seed*104729,index),q,'seeded reproducibility');
  }
}
assert.equal(seen.size,bank.templates.length,'all templates exercised');
for(const disabled of bank.defaults){
  const selected=bank.defaults.filter(id=>id!==disabled),eligible=bank.available(selected);
  for(let i=0;i<eligible.length;i++){
    const q=bank.generate(991,i,selected);assert(!q.requiredTopics.includes(disabled));
    const ops=[];function visit(e){if(!e||typeof e!=='object')return;ops.push(e.op);visit(e.a);visit(e.b);}
    visit(q.verification.expression);visit(q.verification.x);visit(q.verification.y);
    if(disabled==='logarithm')assert(!ops.includes('ln'),'log inside a mixed question');
    if(disabled==='trig')assert(!ops.some(op=>['sin','cos','tan','cot','sec','csc'].includes(op)));
    if(disabled==='inverse')assert(!ops.some(op=>['asin','acos','atan','acot'].includes(op)));
    if(disabled==='exponential')assert(!ops.includes('exp'));
    checks++;
  }
}
assert.equal(bank.available([]).length,0);assert.throws(()=>bank.generate(1,0,[]));
assert.deepEqual(bank.normalize(['bogus','polynomial','polynomial']),['polynomial']);
assert.deepEqual(bank.normalize(null),bank.defaults);
console.log(`${questions} questions, ${checks} independent checks, ${seen.size} templates, ${bank.topics.length} topics passed.`);
