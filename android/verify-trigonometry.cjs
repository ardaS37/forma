const assert=require('node:assert/strict'),path=require('node:path');
const root=path.join(__dirname,'app/src/main/assets/web');globalThis.math=require(path.join(root,'vendor/mathjs/math.js'));require(path.join(root,'trigonometry-bank.js'));require(path.join(root,'question-expansion.js'));
const bank=TrigonometryBank;let questions=0,checks=0;const seen=new Set();
function near(a,b,label,tol=2e-7){assert(Number.isFinite(a)&&Number.isFinite(b),label);assert(Math.abs(a-b)<=tol*Math.max(1,Math.abs(a),Math.abs(b)),`${label}: ${a} != ${b}`);checks++;}
const evaluate=(e,x=0)=>math.evaluate(e,{x});
function rootsCheck(v,label){const r=v.roots,lo=v.lo??0,hi=v.hi??360;assert.equal(new Set(r).size,r.length);for(const x of r){assert(x>=lo-1e-7&&x<hi);const y=v.kind==='domain'?math[v.op](x*Math.PI/180):v.expression?evaluate(v.expression,x):math[v.op](x*Math.PI/180);near(v.kind==='square-equation'?y*y:y,v.kind==='domain'||v.kind==='residual-equation'?0:v.kind==='square-equation'?v.target*v.target:v.target,label);}
 if(v.kind==='equation'){let expected=[];const A=math[v.op==='sin'?'asin':v.op==='cos'?'acos':'atan'](v.target)*180/Math.PI,bases=v.op==='sin'?[A,180-A]:v.op==='cos'?[A,-A]:[A],P=v.op==='tan'?180:360;for(let n=-30;n<=30;n++)for(const a of bases){const x=(a+P*n-v.phase)/v.k;if(x>=lo-1e-7&&x<hi-1e-7&&!expected.some(t=>Math.abs(t-x)<1e-6))expected.push(x);}assert.equal(r.length,expected.length,label+' complete');for(const x of expected)assert(r.some(t=>Math.abs(t-x)<2e-6),label+' missing root');checks++;}
 if(v.expectedCount)assert.equal(r.length,v.expectedCount,label);}
function verify(v,label){
 if(v.kind==='numeric'){near(evaluate(v.expression),v.answer,label);return;}
 if(v.kind==='paired'){verify(v.first,label+' I');verify(v.second,label+' II');near(v.answer,v.first.answer-v.second.answer,label+' difference');return;}
 if(v.kind==='identity-evaluation'){verify(v.base,label);near(evaluate(v.expression,v.at),v.answer,label);return;}
 if(v.kind==='identity'){for(const x of [11,23,37,61,107,203])near(evaluate(v.left,x),evaluate(v.right,x),label);return;}
 if(v.kind==='undefined'){near(evaluate(v.denominator),0,label);return;}
 if(['equation','square-equation','residual-equation','domain'].includes(v.kind)){rootsCheck(v,label);return;}
 if(v.kind==='inequality'){const lo=v.lo??0,hi=v.hi??360;for(let x=lo+.123;x<hi;x+=.731){if(v.op==='tan'&&Math.abs(Math.cos(x*Math.PI/180))<1e-9)continue;const y=math[v.op](x*Math.PI/180),truth=v.comparison==='<'?y<v.target:y>=v.target,member=v.intervals.some(([a,b,l,r])=>(x>a||(l&&x===a))&&(x<b||(r&&x===b)));assert.equal(member,truth,label+' at '+x);checks++;}return;}
 if(v.kind==='review'){verify(v.base,label+' source');const b=v.base;let correct=v.correct;if(b.kind==='numeric')correct=Math.abs(v.candidate-evaluate(b.expression))<1e-7;else if(b.kind==='identity')correct=Math.abs(evaluate(b.left,23)-evaluate(v.candidate,23))<1e-7;else if(b.roots)correct=JSON.stringify(b.roots)===JSON.stringify(v.candidate);else if(b.intervals)correct=JSON.stringify(b.intervals)===JSON.stringify(v.candidate);assert.equal(correct,v.correct,label+' review');checks++;return;}
 throw Error('Unknown '+v.kind+' '+label);
}
for(let seed=1;seed<=10;seed++)for(let i=0;i<bank.templates.length;i++){const q=bank.generate(seed*739,i);assert.deepEqual(q,JSON.parse(JSON.stringify(q)),q.template+' serializable');assert.deepEqual(q,bank.generate(seed*739,i),'reproducible');assert(q.text&&q.eq&&q.solution&&q.english.text&&q.english.solution);verify(q.verification,q.template);questions++;seen.add(q.template);}
assert.equal(bank.templates.length,684);assert.equal(seen.size,684);
for(const off of bank.defaults){const enabled=bank.defaults.filter(t=>t!==off);for(let i=0;i<bank.available(enabled).length;i++){assert(!bank.generate(91,i,enabled).requiredTopics.includes(off));checks++;}}
assert.equal(bank.available([]).length,0);assert.throws(()=>bank.generate(1,0,[]));console.log(`${questions} trigonometry questions, ${checks} checks, ${seen.size} templates and ${bank.topics.length} topics passed.`);
