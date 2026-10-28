const assert=require('node:assert/strict'),path=require('node:path');
const root=path.join(__dirname,'app/src/main/assets/web');globalThis.math=require(path.join(root,'vendor/mathjs/math.js'));
for(const f of['math-display.js','derivative-bank.js','integral-bank.js','limit-bank.js','multivariable-practice.js','graph-practice.js','question-expansion.js','practice-banks.js','reference-data.js'])require(path.join(root,f));
let questions=0,checks=0;const source=e=>PracticeMath.ascii(e).replace(/\bln\(/g,'log('),C=e=>math.compile(typeof e==='string'?e:source(e)),at=(f,x,y=2)=>f.evaluate({x,y});
const diff=(e,n=1)=>{let node=math.parse(typeof e==='string'?e:source(e));for(let i=0;i<n;i++)node=math.derivative(node,'x');return node.compile();};
function near(a,b,label,tol=3e-6){assert(typeof a==='number'&&typeof b==='number'&&Number.isFinite(a)&&Number.isFinite(b),label+': nonfinite');assert(Math.abs(a-b)<=tol*Math.max(1,Math.abs(a),Math.abs(b)),`${label}: ${a} != ${b}`);checks++;}
function simpson(f,a,b,n=128){const h=(b-a)/n;let s=f(a)+f(b);for(let i=1;i<n;i++)s+=(i%2?4:2)*f(a+i*h);return s*h/3;}
function verifyMultivariable(v,label){
 const ev=(f,p)=>math.evaluate(f,p),h=1e-5;
 const finite=(f,p,x)=>{const a={...p,[x]:p[x]+h},b={...p,[x]:p[x]-h};return(ev(f,a)-ev(f,b))/(2*h);};
 if(v.kind==='parameter-integral'||v.kind==='parameter-initial'){
  for(const x of [.7,1.3,2])for(const y of [.5,1.7]){const p={x,y},F=v.kind==='parameter-initial'?v.answerExpression:v.F;near(finite(F,p,v.axis),ev(v.f,p),label,2e-5);if(v.kind==='parameter-initial')near(ev(F,{...p,[v.axis]:v.anchor}),0,label+' initial');}return;
 }
 if(v.kind==='iterated-general'){
  const f=math.compile(v.f),p={};function integrate(i){if(i===v.variables.length)return f.evaluate(p);const axis=v.variables[i],[lo,hi]=v.bounds[i];return simpson(t=>{p[axis]=t;return integrate(i+1);},typeof lo==='number'?lo:ev(lo,p),typeof hi==='number'?hi:ev(hi,p),v.variables.length===3?16:64);}
  near(integrate(0),v.answer,label,3e-6);near(ev(v.value,{}),v.answer,label);return;
 }
 if(v.kind==='jacobian'||v.kind==='jacobian-increment'){
  v.functions.forEach((f,i)=>v.variables.forEach((x,j)=>near(ev(v.jacobian[i][j],v.at),finite(f,v.at,x),label+' jacobian',2e-5)));
  if(v.kind==='jacobian-increment')v.answer.forEach((a,i)=>near(a,v.values[i].reduce((sum,b,j)=>sum+b*v.increments[j],0),label));return;
 }
 v.variables.forEach((x,i)=>{near(ev(v.partials[i],v.at),finite(v.f,v.at,x),label+' partial',2e-5);near(v.values[i],ev(v.partials[i],v.at),label);});
 if(v.kind==='directional'){
  near(Math.hypot(...v.unit),1,label+' unit');const a={...v.at},b={...v.at};v.variables.forEach((x,i)=>{a[x]+=h*v.unit[i];b[x]-=h*v.unit[i];});near(v.answer,(ev(v.f,a)-ev(v.f,b))/(2*h),label+' along unit path',3e-5);
 }
 if(v.kind==='steepest'||v.kind==='steepest-min'){near(v.rate,Math.hypot(...v.values),label);near(Math.hypot(...v.unit),1,label);v.unit.forEach((u,i)=>near(u,v.values[i]/v.rate,label));if(v.kind==='steepest-min')near(v.answer,-v.rate,label);}
 if(v.kind==='gradient-linearization')near(v.answer,ev(v.f,v.at)+v.values.reduce((sum,d,i)=>sum+d*v.increments[i],0),label);
 if(v.kind==='hessian'||v.kind==='hessian-invariants'){
  v.hessian.forEach((row,i)=>row.forEach((f,j)=>{near(ev(f,v.at),finite(v.partials[i],v.at,v.variables[j]),label+' hessian',3e-5);near(v.matrix[i][j],v.matrix[j][i],label+' symmetry');}));
  if(v.kind==='hessian-invariants'){near(v.trace,v.matrix.reduce((sum,row,i)=>sum+row[i],0),label);near(v.frobenius,Math.hypot(...v.matrix.flat()),label);}
 }
 if(v.kind==='multivariable-chain'||v.kind==='chain-approx'){
  const along=t=>ev(v.f,Object.fromEntries(v.variables.map(x=>[x,ev(v.path[x],{t})]))),num=(along(v.t+h)-along(v.t-h))/(2*h);near(ev(v.expression,{t:v.t}),num,label+' chain',3e-5);near(v.answer,num,label,3e-5);if(v.kind==='chain-approx')near(v.approx,along(v.t)+v.h*v.answer,label);
 }
}
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

 if(MultivariablePractice.kinds.has(v.kind)){verifyMultivariable(v,label);return;}

 if(v.kind==='review'){verify(v.base,label+' base');const b=v.base;if(MultivariablePractice.kinds.has(b.kind)&&Array.isArray(v.candidate)){const truth=b.kind==='gradient'?b.partials:b.kind==='jacobian'?b.jacobian:b.hessian;const flat=v.candidate.flat(),actual=truth.flat();flat.forEach((expr,i)=>{const difference=math.evaluate(expr,b.at)-math.evaluate(actual[i],b.at);near(difference,!v.correct&&i===0?1:0,label+' proposed vector/matrix');});}if(v.candidate!==null){if(typeof v.candidate==='number'){const expected=b.kind==='steepest'?b.rate:b.kind==='graph-practice'?(b.draw?math.evaluate(b.f,{x:0}):b.answer):b.kind==='rates'?b.a:['normal','tangent'].includes(b.kind)?b.slope:b.kind==='optimization'?b.area:b.result==='infinity'?b.sign:typeof b.answer==='number'?b.answer:b.value??null;if(expected!==null){if(v.correct)near(v.candidate,expected,label);else assert(Math.abs(v.candidate-expected)>.1,label+' altered claim');}}else if(v.candidate.op&&['derivative','higher','inverse-derivative','parametric','fundamental'].includes(b.kind)){const f=C(v.candidate),truth=C(b.answer);let tested=false;for(const x of[.4,.7,1.3,2.1]){let a,c;try{a=at(f,x);c=at(truth,x);}catch{continue;}if(typeof a!=='number'||typeof c!=='number'||!Number.isFinite(a)||!Number.isFinite(c))continue;if(v.correct)near(a,c,label);else assert(Math.abs(a-c)>.1);tested=true;break;}assert(tested,label+' review point');}}return;}
 if(['derivative','higher','inverse-derivative','point','tangent','normal','rates','linearization'].includes(v.kind)&&v.expression){const f=C(v.expression),a=C(v.kind==='linearization'?PracticeMath.derivative(v.expression):v.answer||PracticeMath.derivative(v.expression)),d=diff(v.expression,v.kind==='higher'?v.order:1);let tested=0;for(const x of[.17,.43,.71,1.31,2.23,3.47]){let expected,actual,original;try{expected=at(d,x);actual=at(a,x);original=at(f,x);}catch{continue;}if(typeof original!=='number'||typeof expected!=='number'||typeof actual!=='number'||![original,expected,actual].every(Number.isFinite))continue;if(v.kind==='inverse-derivative')expected=1/expected;near(actual,expected,label);tested++;}assert(tested,label+' no real point');if(v.kind==='point')near(v.value,at(d,v.at),label);if(v.kind==='tangent')near(v.slope,at(d,v.at),label);if(v.kind==='normal')near(v.slope*at(d,v.at),-1,label);if(v.kind==='rates'){near(v.v,at(d,v.at),label);near(v.a,at(diff(v.expression,2),v.at),label);}if(v.kind==='linearization'){near(v.value,at(f,v.at),label);near(v.slope,at(d,v.at),label);near(v.answer,v.value+v.h*v.slope,label);}return;}
 if(v.kind==='antiderivative'||v.kind==='initial'){const f=C(v.f),F=C(v.F);let d;try{d=diff(v.F);}catch{}let n=0;for(const x of[.19,.43,.71,1.41,2.23]){let expected,primitive;try{expected=at(f,x);primitive=at(F,x);}catch{continue;}if(typeof expected!=='number'||typeof primitive!=='number'||![expected,primitive].every(Number.isFinite))continue;const h=1e-5;let actual;try{actual=d?at(d,x):(at(F,x-2*h)-8*at(F,x-h)+8*at(F,x+h)-at(F,x+2*h))/(12*h);}catch{continue;}if(typeof actual==='number'&&Number.isFinite(actual)){near(actual,expected,label,8e-5);n++;}}assert(n,label+' no primitive point');if(v.kind==='initial')near(at(F,v.at),v.target,label);return;}
 if(['definite','area','volume','average'].includes(v.kind)){verify({kind:'antiderivative',f:v.f,F:v.F},label);near(simpson(x=>at(C(v.f),x),v.lo,v.hi,128)*v.factor,v.value,label,2e-5);return;}
 if(v.kind==='fundamental'){const expected=diff(v.exactPrimitive),a=C(v.answer);for(const x of[.2,.7,1.3])near(at(a,x),at(expected,x),label);return;}
 if(v.kind==='variable-bound'){const upper=C(v.upper),du=diff(v.upper),f=C(v.f),answer=C(v.answer);for(const t of[v.lo+.001,v.lo+.01]){const x=(t-1)/Number(at(du,0));near(at(upper,x),t,label);near(at(answer,x),at(f,t)*at(du,x),label);}return;}
 if(v.kind==='leibniz'){const expected=diff(v.closed,v.order||1),answer=C(v.answerExpression);for(const x of[.2,.7,1.3]){near(at(answer,x),at(expected,x),label);const a=math.evaluate(v.lower,{x}),b=math.evaluate(v.upper,{x}),boundary=math.evaluate(v.boundary,{x}),inside=simpson(t=>math.evaluate(v.inside,{x,t}),a,b,256);near(boundary+inside,at(diff(v.closed),x),label+' boundary and parameter',1e-5);}return;}
 if(v.kind==='expression-transfer'){const expected=diff(v.sourceExpression,v.order),actual=C(v.expression);for(const x of[.3,.7,1.3])near(at(actual,x),at(expected,x),label);return;}
 if(v.kind==='partial'){let d=math.parse(v.f);for(const axis of v.axis)d=math.derivative(d,axis);const f=d.compile(),a=C(v.answerExpression);for(const x of[.3,1,2])near(at(a,x,1.7),at(f,x,1.7),label);return;}
 if(v.kind==='total-differential'){const dx=math.derivative(v.f,'x').compile(),dy=math.derivative(v.f,'y').compile();for(const x of[.3,1,2]){near(at(dx,x,1.7),at(C(v.dx),x,1.7),label);near(at(dy,x,1.7),at(C(v.dy),x,1.7),label);}return;}
 if(v.kind==='multivariable-linearization'){const f=C(v.f),dx=math.derivative(v.f,'x').compile(),dy=math.derivative(v.f,'y').compile();near(v.answer,at(f,v.x,v.y)+v.h*at(dx,v.x,v.y)+v.k*at(dy,v.x,v.y),label);return;}
 if(['double','double-region','double-polar','triple'].includes(v.kind)){let numeric;if(v.kind==='double')numeric=simpson(x=>simpson(y=>v.coefficient*x**v.m*y**v.n,0,v.B,32),0,v.A,32);else if(v.kind==='double-region')numeric=simpson(x=>simpson(y=>v.coefficient*x**v.m*y**v.n,0,x,32),0,v.A,128);else if(v.kind==='double-polar')numeric=simpson(theta=>simpson(r=>v.coefficient*((r*Math.cos(theta))**2+(r*Math.sin(theta))**2)**v.n*r,v.inner,v.A,256),0,v.angle,32);else numeric=simpson(x=>simpson(y=>simpson(z=>v.coefficient*x**v.m*y**v.n*z**v.p,0,v.C,8),0,v.B,8),0,v.A,8);near(numeric,v.value,label,1e-5);return;}
 if(v.kind==='numeric-transfer'){near(math.evaluate(v.expression),v.answer,label);if(v.base)verify(v.base,label+' source');return;}
 if(v.kind==='improper'){if(v.converges){if(v.type==='tail')near(v.value,v.a/(v.p-1),label);if(v.type==='exptail')near(v.value,1/v.a,label);if(v.type==='rootsingularity')near(v.value,2*Math.sqrt(v.a),label);}else assert(['tail','singular'].includes(v.type));return;}
 if(v.kind==='implicit'){near(2*(v.r/3)+2*v.k*Math.sqrt((v.r*v.r-(v.r/3)**2)/v.k)*(-(v.r/3)/(v.k*Math.sqrt((v.r*v.r-(v.r/3)**2)/v.k))),0,label);return;}
 if(v.kind==='parametric'||v.kind==='parametric-linearization'){const dx=diff(v.x),dy=diff(v.y);if(v.kind==='parametric'){for(const x of[.3,.7,1.3])near(at(C(v.answer),x),at(dy,x)/at(dx,x),label);}else{near(v.slope,at(dy,v.t)/at(dx,v.t),label);near(v.answer,v.value+v.h*v.slope,label);}return;}
 if(v.kind==='implicit-linearization'){near(v.slope,-v.at/(v.k*v.value),label);near(v.answer,v.value+v.h*v.slope,label);return;}
 if(v.kind==='corner'||v.kind==='corner-linearization')return;
 if(v.kind==='match'||v.kind==='matched-linearization'){near(v.A,2*v.scale*v.at,label);near(v.scale*v.at*v.at,v.A*v.at+v.B,label);return;}
 if(v.kind==='optimization'){near(v.area,v.p*v.p/4,label);return;}
 if(v.kind==='optimization-loss'){near(v.answer,v.side**2-(v.side-v.h)*(v.side+v.h),label);return;}
 if(v.kind==='extrema'||v.kind==='monotonicity'){near(at(diff(v.expression),v.at??v.b),0,label);return;}
 if(v.kind==='divergence-scaling'){assert.equal(v.base.converges,false);return;}
 if(v.result){if(v.result==='parameter'){near(v.coeff*v.point+v.constant,v.value*v.point+v.offset,label);return;}if(v.piecewise){const l=at(C(v.piecewise.left),v.point),r=at(C(v.piecewise.right),v.point);near(l,v.left,label);near(r,v.right,label);if(v.result==='finite')near(v.value,l,label);else assert(l!==r);return;}if(v.oscillation){const a=v.oscillation,n=100,x=a/(Math.PI/2+2*Math.PI*n),y=v.outer==='square'?a/(Math.PI*n):a/(3*Math.PI/2+2*Math.PI*n);assert(Math.abs(at(C(v.f),x)-at(C(v.f),y))>.1);return;}if(v.result==='dne'){const f=C(v.f),l=at(f,v.point-1e-5),r=at(f,v.point+1e-5);if(v.left==='-inf')assert(l<0&&r>0);else{near(l,v.left,label);near(r,v.right,label);}return;}const f=C(v.f),inf=typeof v.point==='string',dir=v.side==='left'?-1:1;if(v.result==='infinity'){const a=inf?(v.point==='inf'?100:-100):v.point+dir*.001,b=inf?(v.point==='inf'?1000:-1000):v.point+dir*.00001;assert(at(f,b)*v.sign>at(f,a)*v.sign||!Number.isFinite(at(f,b)));return;}if(label.includes('logarithm-scale-infinity')){const x=1e7,y=1e14;assert(Math.abs(at(f,y)-v.value)<Math.abs(at(f,x)-v.value));checks++;return;}const xs=inf?[10,100,1000,1e6].map(x=>v.point==='inf'?x:-x):[v.point+dir*1e-5];let value;for(const x of xs){let z=at(f,x);if(typeof z==='number'&&Number.isFinite(z))value=z;}near(value,v.value,label,Math.abs(v.value)<1e-6?1e-3:.02);return;}
 throw Error('Missing verification '+v.kind+' '+label);
}
for(const[mode,bank]of Object.entries(PracticeBanks)){const seen=new Set();for(let seed=1;seed<=4;seed++)for(let i=0;i<bank.templates.length;i++){const q=bank.generate(seed*1777,i);assert.deepEqual(q,JSON.parse(JSON.stringify(q)),q.template+' snapshot');verify(q.verification,q.template);seen.add(q.template);questions++;}assert.equal(seen.size,bank.templates.length);for(const off of bank.defaults){const selected=bank.defaults.filter(t=>t!==off);for(let i=0;i<Math.min(60,bank.available(selected).length);i++){assert(!bank.generate(187,i,selected).requiredTopics.includes(off));checks++;}}assert(bank.topics.every(t=>t.formulas?.length));console.log(mode,bank.templates.length,'templates passed');}
console.log(`${questions} questions; ${checks} independent checks passed.`);
