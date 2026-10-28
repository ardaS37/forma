const assert=require('node:assert/strict'),path=require('node:path');
const root=path.join(__dirname,'app/src/main/assets/web');globalThis.math=require(path.join(root,'vendor/mathjs/math.js'));require(path.join(root,'trigonometry-bank.js'));require(path.join(root,'math-display.js'));require(path.join(root,'graph-practice.js'));require(path.join(root,'question-expansion.js'));
const bank=TrigonometryBank;let questions=0,checks=0;const seen=new Set();
function near(a,b,label,tol=2e-7){assert(Number.isFinite(a)&&Number.isFinite(b),label);assert(Math.abs(a-b)<=tol*Math.max(1,Math.abs(a),Math.abs(b)),`${label}: ${a} != ${b}`);checks++;}
const evaluate=(e,x=0)=>math.evaluate(e,{x});
function rootsCheck(v,label){const r=v.roots,lo=v.lo??0,hi=v.hi??360;assert.equal(new Set(r).size,r.length);for(const x of r){assert(x>=lo-1e-7&&x<hi);const y=v.kind==='domain'?math[v.op](x*Math.PI/180):v.expression?evaluate(v.expression,x):math[v.op](x*Math.PI/180);near(v.kind==='square-equation'?y*y:y,v.kind==='domain'||v.kind==='residual-equation'?0:v.kind==='square-equation'?v.target*v.target:v.target,label);}
 if(v.kind==='equation'){let expected=[];const A=math[v.op==='sin'?'asin':v.op==='cos'?'acos':'atan'](v.target)*180/Math.PI,bases=v.op==='sin'?[A,180-A]:v.op==='cos'?[A,-A]:[A],P=v.op==='tan'?180:360;for(let n=-30;n<=30;n++)for(const a of bases){const x=(a+P*n-v.phase)/v.k;if(x>=lo-1e-7&&x<hi-1e-7&&!expected.some(t=>Math.abs(t-x)<1e-6))expected.push(x);}assert.equal(r.length,expected.length,label+' complete');for(const x of expected)assert(r.some(t=>Math.abs(t-x)<2e-6),label+' missing root');checks++;}
 if(v.expectedCount)assert.equal(r.length,v.expectedCount,label);}
function verifyGraph(v,label){
 const evaluate=x=>math.evaluate(v.f,{x}),close=(a,b)=>near(a,b,label,3e-5);let expected=v.answer;
 if(v.draw){if(v.mode==='derivatives'){for(const x of[-1.3,.4,1.7])close(math.evaluate(v.derivative,{x}),(evaluate(x+1e-5)-evaluate(x-1e-5))/2e-5);}if(v.mode==='integrals'){for(const x of[-1.3,.4,1.7])close((math.evaluate(v.primitive,{x:x+1e-5})-math.evaluate(v.primitive,{x:x-1e-5}))/2e-5,evaluate(x));close(math.evaluate(v.primitive,{x:0}),1);}if(v.shift)expected=evaluate(0)+v.shift;}
 else if(v.type==='tangent-slope'){close(v.slope,(evaluate(1+1e-5)-evaluate(1-1e-5))/2e-5);close(v.slope,(v.points[1][1]-v.points[0][1])/(v.points[1][0]-v.points[0][0]));expected=v.linked?-1/v.slope:v.slope;}
 else if(v.type==='derivative-sign'){close(evaluate(v.root),0);assert(evaluate(v.root-1)<0&&evaluate(v.root+1)>0);expected=v.linked?v.slope:v.root;}
 else if(['signed-area','geometric-area'].includes(v.type)){let signed=0,area=0;for(let i=1;i<v.points.length;i++){const[x0,y0]=v.points[i-1],[x1,y1]=v.points[i],piece=(x1-x0)*(y0+y1)/2;signed+=piece;area+=Math.abs(piece);}expected=v.type==='signed-area'&&!v.linked||v.type==='geometric-area'&&v.linked?signed:area;}
 else if(v.type==='accumulation'){for(const x of[.5,1,2,3])close((math.evaluate(v.primitive,{x:x+1e-5})-math.evaluate(v.primitive,{x:x-1e-5}))/2e-5,evaluate(x));close(evaluate(v.root),0);expected=v.linked?math.evaluate(v.primitive,{x:v.root}):v.root;}
 if(v.mode==='trigonometry'){for(const x of[v.period*.13,v.period*.31])close(evaluate(x+v.period),evaluate(x));if(v.op!=='tan'){close(evaluate(v.period/4),v.op==='sin'?v.offset+v.a:v.offset);close(evaluate(v.period/2),v.op==='cos'?v.offset-v.a:v.offset);}if(!v.draw)expected=v.type==='read-period'?(v.linked?v.k:v.period):v.type==='read-range'?(v.linked?2*v.a:v.offset+v.a):(v.linked?v.offset:v.a);}
 close(v.answer,expected);
}

function verify(v,label){
 if(v.kind==='graph-practice'){verifyGraph(v,label);return;}

 if(v.kind==='numeric'){near(evaluate(v.expression),v.answer,label);return;}
 if(v.kind==='paired'){verify(v.first,label+' I');verify(v.second,label+' II');near(v.answer,v.first.answer-v.second.answer,label+' difference');return;}
 if(v.kind==='identity-evaluation'){verify(v.base,label);near(evaluate(v.expression,v.at),v.answer,label);return;}
 if(v.kind==='identity'){for(const x of [11,23,37,61,107,203])near(evaluate(v.left,x),evaluate(v.right,x),label);return;}
 if(v.kind==='undefined'){near(evaluate(v.denominator),0,label);return;}
 if(['equation','square-equation','residual-equation','domain'].includes(v.kind)){rootsCheck(v,label);return;}
 if(v.kind==='inequality'){const lo=v.lo??0,hi=v.hi??360;for(let x=lo+.123;x<hi;x+=.731){if(v.op==='tan'&&Math.abs(Math.cos(x*Math.PI/180))<1e-9)continue;const y=math[v.op](x*Math.PI/180),truth=v.comparison==='<'?y<v.target:y>=v.target,member=v.intervals.some(([a,b,l,r])=>(x>a||(l&&x===a))&&(x<b||(r&&x===b)));assert.equal(member,truth,label+' at '+x);checks++;}return;}
 if(v.kind==='review'){verify(v.base,label+' source');const b=v.base;let correct=v.correct;if(b.kind==='graph-practice')correct=Math.abs(v.candidate-(b.draw?math.evaluate(b.f,{x:0}):b.answer))<1e-7;else if(b.kind==='numeric')correct=Math.abs(v.candidate-evaluate(b.expression))<1e-7;else if(b.kind==='identity')correct=Math.abs(evaluate(b.left,23)-evaluate(v.candidate,23))<1e-7;else if(b.roots)correct=JSON.stringify(b.roots)===JSON.stringify(v.candidate);else if(b.intervals)correct=JSON.stringify(b.intervals)===JSON.stringify(v.candidate);assert.equal(correct,v.correct,label+' review');checks++;return;}
 throw Error('Unknown '+v.kind+' '+label);
}
for(let seed=1;seed<=10;seed++)for(let i=0;i<bank.templates.length;i++){const q=bank.generate(seed*739,i);assert.deepEqual(q,JSON.parse(JSON.stringify(q)),q.template+' serializable');assert.deepEqual(q,bank.generate(seed*739,i),'reproducible');assert(q.text&&(q.eq||q.diagram)&&q.solution&&q.english.text&&q.english.solution);verify(q.verification,q.template);questions++;seen.add(q.template);}
assert.equal(bank.templates.length,702);assert.equal(seen.size,702);
for(const off of bank.defaults){const enabled=bank.defaults.filter(t=>t!==off);for(let i=0;i<bank.available(enabled).length;i++){assert(!bank.generate(91,i,enabled).requiredTopics.includes(off));checks++;}}
assert.equal(bank.available([]).length,0);assert.throws(()=>bank.generate(1,0,[]));console.log(`${questions} trigonometry questions, ${checks} checks, ${seen.size} templates and ${bank.topics.length} topics passed.`);
