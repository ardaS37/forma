const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const root=path.join(__dirname,'app/src/main/assets/web'),context={console,translations:{},localStorage:{getItem:()=>null}};
vm.createContext(context);
for(const file of ['math.js','question-engine.js','university.js','math1.js','math2.js','analytic.js','geometry.js','linear.js','discrete.js','differential.js','math1-slides.js','question-difficulty.js','math1-expanded.js','math2-expanded.js','science-catalog.js','physics1.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
const bank=context.Math2Bank,seen=new Set(),types=new Set(),levels=new Set();let questions=0,independentChecks=0;
function close(a,b,tol=1e-7){assert(Number.isFinite(a)&&Number.isFinite(b),`${a}, ${b}`);assert(Math.abs(a-b)<=tol*Math.max(1,Math.abs(a),Math.abs(b)),`${a} != ${b}`);independentChecks++;}
function integral(f,a,b,n=160){let s=f(a)+f(b);for(let i=1;i<n;i++)s+=(i%2?4:2)*f(a+(b-a)*i/n);return s*(b-a)/(3*n);}
function derivative(f,x){const h=1e-5;return(f(x+h)-f(x-h))/(2*h);}
const dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0),norm=a=>Math.hypot(...a);
const cross=(u,v)=>[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];
const fac=n=>n<2?1:n*fac(n-1),fraction=(a,b)=>{const gcd=(x,y)=>y?gcd(y,x%y):Math.abs(x),g=gcd(a,b);return b/g===1?String(a/g):`${a/g}/${b/g}`;};
function verify(q){
 const p=q.parameters,v=q.template.endsWith('-analysis'),id=q.template.replace(/^m2-/,'').replace(/-(analysis|calculation)$/,'');
 switch(id){
 case 'reduction':close(integral(x=>Math.sin(x)**(2*p.n),0,Math.PI/2),p.value);break;
 case 'repeated-poles':{
  const A=p.a-p.c/p.h**2,B=p.b+p.c/p.h,C=p.c/p.h**2;
  for(const x of [.7,1.5,3.2])close(A/x+B/x**2+C/(x+p.h),(p.a*x*x+(p.b+p.a*p.h)*x+p.b*p.h+p.c)/(x*x*(x+p.h)));
  assert(q.solution.includes('A='+fraction(p.a*p.h*p.h-p.c,p.h*p.h)));break;}
 case 'half-angle-substitution':for(const x of [-2,-.5,.7,2])close(derivative(t=>2/(p.a*Math.sqrt(3))*Math.atan(Math.tan(t/2)/Math.sqrt(3)),x),1/(p.a*(2+Math.cos(x))));break;
 case 'radical-substitution':for(const x of [-3,-.4,1,4])close(derivative(t=>p.b*Math.hypot(p.a,t),x),p.b*x/Math.hypot(p.a,x));break;
 case 'exponential-parts':{
  const F=x=>Math.exp(p.k*x)*Array.from({length:p.n+1},(_,j)=>(-1)**j*fac(p.n)/fac(p.n-j)*x**(p.n-j)/p.k**(j+1)).reduce((a,b)=>a+b,0);
  for(const x of [-.7,.5,1])close(derivative(F,x),x**p.n*Math.exp(p.k*x),1e-5);break;}
 case 'trig-products':{
  const F=x=>-Math.cos((p.a+p.b)*x)/(2*(p.a+p.b))-Math.cos((p.a-p.b)*x)/(2*(p.a-p.b));
  close(derivative(F,.37),Math.sin(p.a*.37)*Math.cos(p.b*.37));close(integral(x=>Math.sin(p.a*x)*Math.cos(p.b*x),0,2*Math.PI),0);break;}
 case 'shells':close(integral(x=>2*Math.PI*x*(p.a-x),0,p.a),p.value);break;
 case 'parabolic-volume':close(integral(x=>Math.PI*(p.a*p.a-x*x)**2,0,p.a),p.value);break;
 case 'parametric-length':close(integral(t=>Math.hypot(-p.a*Math.sin(t),p.a*Math.cos(t)),0,p.T),p.value);break;
 case 'surface-area':close(integral(t=>2*Math.PI*p.a**2*Math.sin(t),0,Math.PI),p.value);break;
 case 'centroid':{
  const top=x=>p.h*(1-x/p.b),A=integral(top,0,p.b);
  close(A,p.area);close(integral(x=>x*top(x),0,p.b)/A,p.xc);close(integral(x=>top(x)**2/2,0,p.b)/A,p.yc);break;}
 case 'spring-work':close(integral(x=>p.k*x,p.a,p.b),p.value);break;
 case 'p-classification':assert(q.solution.includes(p.p===1?'her ikisi':p.p<1?'ilk integral':'ikinci integral'));independentChecks++;break;
 case 'interior-singularity':if(p.p<1)close(4*Math.sqrt(p.a),p.value);else assert(p.value===null&&q.solution.includes('ıraksak'));break;
 case 'exponential-tail':close(integral(x=>x*Math.exp(-p.k*x),p.a,p.a+25/p.k,320),p.value,1e-6);break;
 case 'logarithmic-test':assert(q.solution.includes(p.p>1?'değer':'ıraksak'));independentChecks++;break;
 case 'rational-tail':close(integral(t=>1/p.a,0,1),p.value);close(1/(p.R+p.a),p.tail);break;
 case 'principal-value':close(integral(x=>p.k/x,-p.a,-.2)+integral(x=>p.k/x,.2,p.a),0);assert(q.solution.includes('ıraksaktır'));break;
 case 'monotone-recursion':{
  let value=p.a0;for(let n=0;n<p.N;n++)value=(value+p.L)/2;close(value,p.value);assert(value<p.L);break;}
 case 'p-series':assert(q.solution.includes(p.p>1?'seri yakınsak':'seri ıraksak'));independentChecks++;break;
 case 'ratio-root':close(((1000001/1000000)**p.q)/p.a,1/p.a,1e-5);break;
 case 'absolute-conditional':assert(q.solution.includes(p.p>1?'mutlak yakınsak':'koşullu yakınsak'));independentChecks++;break;
 case 'shifted-telescoping':{
  let sum=0;for(let n=1;n<=p.N;n++)sum+=1/((n+p.a)*(n+p.a+1));close(sum,p.partial);close(p.value-p.partial,1/(p.N+p.a+1));break;}
 case 'alternating-error':{
  let partial=0,reference=0;for(let n=1;n<=50000;n++){const term=(-1)**(n+1)/n**p.p;reference+=term;if(n<=p.N)partial+=term;}
  const error=reference-partial;assert(Math.abs(error)<=p.tolerance+1/50001**p.p);assert(p.N%2?error<0:error>0);independentChecks++;break;}
 case 'geometric-remainder':{
  let sum=0;for(let n=0;n<=p.N;n++)sum+=p.A*p.ratio**n;close(sum,p.partial);close(p.sum-p.partial,p.tail);break;}
 case 'shifted-log':assert(q.solution.includes(`(${p.a-p.R},${p.a+p.R}]`));close(Math.log(1+.2),Array.from({length:60},(_,j)=>(-1)**j*.2**(j+1)/(j+1)).reduce((s,t)=>s+t,0));break;
 case 'binomial-expansion':{
  let coefficient=1;for(let n=0;n<4;n++){close(p.coefficients[n],coefficient);coefficient*=(-.5-n)*p.a/(n+1);}break;}
 case 'termwise-operations':close(v?integral(t=>1/(p.R-t),0,p.R*.2):-derivative(t=>p.R/(p.R-t),-p.R*.2),v?-Math.log(.8):-p.R/(p.R+p.R*.2)**2);break;
 case 'taylor-error':{
  let term=1,sum=1;for(let j=1;j<=p.N;j++){term*=p.a*p.h/j;sum+=term;}
  close(sum,p.approx);assert(Math.abs(Math.exp(p.a*p.h)-sum)<=p.bound+1e-12);independentChecks++;break;}
 case 'series-composition':{
  const x=.2;let series=0;for(let n=0;n<30;n++)series+=(-p.a*x*x)**n/fac(n);close(series,Math.exp(-p.a*x*x));break;}
 case 'taylor-center':for(const x of [-4,-.3,2,7])close(p.coefficients.reduce((s,c,j)=>s+c*(x-p.c)**j,0),p.a*x**3);break;
 case 'cycloid':{
  const t=Math.PI,h=1e-3,X=t=>p.a*(t-Math.sin(t)),Y=t=>p.a*(1-Math.cos(t));
  close(derivative(Y,t)/derivative(X,t),p.slope);close((Y(t+h)-2*Y(t)+Y(t-h))/((X(t+h)-X(t-h))/2)**2,p.second,1e-5);break;}
 case 'ellipse':close(integral(t=>p.a*Math.cos(t)*p.b*Math.cos(t),0,2*Math.PI),p.area);close(-p.b/p.a,p.slope);break;
 case 'cardioid':close(integral(t=>p.a**2*(1+Math.cos(t))**2/2,0,2*Math.PI),p.area);break;
 case 'polar-rose':close(integral(t=>p.a**2*Math.cos(p.k*t)**2/2,-Math.PI/(2*p.k),Math.PI/(2*p.k)),p.petal);close(p.k*p.petal,p.area);break;
 case 'spiral':close(integral(t=>p.a*Math.sqrt(1+t*t),0,p.T),p.length);close(derivative(t=>p.a*t*Math.sin(t),Math.PI/2)/derivative(t=>p.a*t*Math.cos(t),Math.PI/2),p.slope);break;
 case 'helix':{
  const t=.6,u=[-p.a*Math.sin(t),p.a*Math.cos(t),p.b],w=[-p.a*Math.cos(t),-p.a*Math.sin(t),0];close(norm(u),p.speed);close(norm(cross(u,w))/norm(u)**3,p.curvature);break;}
 case 'projection':close(dot(p.remainder,p.v),0);p.u.forEach((x,i)=>close(p.projection[i]+p.remainder[i],x));break;
 case 'cross-area':cross(p.u,p.v).forEach((x,i)=>close(x,p.cross[i]));close(norm(p.cross),p.area);break;
 case 'triple-volume':close(dot(p.u,cross(p.v,p.w)),p.det);close(Math.abs(p.det),p.volume);break;
 case 'line-plane-intersection':if(v)close(dot(p.n,p.direction),0);else{close(dot(p.n,p.intersection),p.d);p.intersection.forEach((x,i)=>close(x,p.p[i]+p.t*p.direction[i]));}break;
 case 'plane-distance':close(dot([1,2,2],p.foot),p.d);close(norm(p.p.map((x,i)=>x-p.foot[i])),p.distance);break;
 case 'skew-lines':close(norm([0,0,p.a]),p.distance);assert(dot([0,0,p.a],[1,0,0])===0&&dot([0,0,p.a],[0,1,0])===0);break;
 case 'gradient-tangent':close(dot(p.gradient,[.6,.8]),p.directional);close(derivative(t=>p.a*(p.h+.6*t)**2+p.b*(p.k+.8*t)**2,0),p.directional);break;
 case 'chain-rule':close(derivative(t=>t*t+p.a*t**4,p.t),p.value,1e-6);break;
 case 'limits-differentiability':{
  if(v){for(const [x,y]of[[.3,.4],[-.7,.1],[.01,.02]])assert(p.a*x*x*y*y/(x*x+y*y)<=p.a*(x*x+y*y)/4+1e-12);}
  else assert(q.solution.includes(fraction(p.a,2)));independentChecks++;break;}
 case 'lagrange':{
  let maximum=-Infinity;for(let i=0;i<1000;i++){const x=p.R*Math.cos(i*2*Math.PI/1000),y=p.R*Math.sin(i*2*Math.PI/1000);maximum=Math.max(maximum,v?p.a*x+p.b*y:x*y);}
  close(maximum,p.maximum,3e-5);break;}
 case 'hessian':close(p.hessian[0][0]*p.hessian[1][1]-p.hessian[0][1]**2,p.det);assert(q.solution.includes(p.C===0?'test karar vermez':p.C<0?'eyer':'minimum'));break;
 case 'double-domains':if(v)close(integral(x=>integral(y=>x+y,0,p.b*(1-x/p.a),20),0,p.a,20),p.value);else close(2*Math.PI*integral(r=>r**3,0,p.a),p.value);break;
 case 'triple-integrals':if(v)close(4*Math.PI*integral(r=>r**4,0,p.a),p.value);else close(integral(x=>integral(y=>p.c*(1-x/p.a-y/p.b),0,p.b*(1-x/p.a),20),0,p.a,20),p.value);break;
 default:throw Error('Missing independent check for '+id);
 }
}
const catalog={};
for(const topic of bank.catalog){
 catalog[topic.id]={label:topic.label,subtopics:topic.subs.length,newTemplates:topic.subs.reduce((s,[id])=>s+(bank.expandedTemplates.get(id)?.length||0),0)};
 for(const [sub] of topic.subs)for(let seed=0;seed<32;seed++)for(let index=0;index<8;index++){
  const selection={program:'general-math-2',topic:topic.id,subtopic:sub},q=bank.generate('Matematik',seed*7919,index,selection,7);
  assert.equal(q.topicId,topic.id);assert.equal(q.subtopicId,sub);assert.equal(q.program,'general-math-2');
  assert(q.text&&q.eq&&q.solution&&q.english.text&&q.english.solution,`${sub} incomplete`);
  assert(!/NaN|Infinity/.test(q.text+q.eq+q.solution+q.english.solution)&&!/undefined/.test(q.text+q.eq+q.solution),q.template+' '+q.eq+' '+q.solution+' '+q.english.solution);
  assert(!Object.keys(q).some(k=>/^\d+$/.test(k)),q.template+' unexpected string spread');
  assert(q.difficulty.score>=1&&q.difficulty.score<=5);levels.add(q.difficulty.level);questions++;
  assert.equal(JSON.stringify(q),JSON.stringify(bank.generate('Matematik',seed*7919,index,selection,7)),'generation must be deterministic');
  if(!q.template.startsWith('m2-'))continue;
  seen.add(q.template);types.add(q.responseType);assert.equal(q.supportsChoices,false);assert.equal(q.choices.length,0);assert.equal(q.correct,null);
  assert(q.solution.length>60&&q.english.solution.length>60,q.template+" | "+q.solution+" | "+q.english.solution);
  if(q.solutionDiagram)assert(q.solutionDiagram.includes('<svg')&&!/NaN|Infinity/.test(q.solutionDiagram));
  verify(q);
 }
}
assert.equal(seen.size,100);assert.deepEqual([...types].sort(),['drawing','expression','proof','reasoning']);assert.deepEqual([...levels].sort(),[1,2,3,4,5]);
const mixedTopics=new Set(),mixedTemplates=new Set();
for(let i=0;i<bank.catalog.length*36;i++){const q=context.UniversityQuestions.generate('Matematik',42,i,{program:'general-math-2',topic:'general',subtopic:'mixed'},4);mixedTopics.add(q.topicId);if(q.template.startsWith('m2-'))mixedTemplates.add(q.template);}
assert.equal(mixedTopics.size,8);assert(mixedTemplates.size>=90);
assert.throws(()=>bank.generate('Fizik',1,0,{}));assert.throws(()=>bank.generate('Matematik',1,-1,{}));
assert.throws(()=>bank.generate('Matematik',1,0,{topic:'multivariable',subtopic:'missing'}));
assert.equal(context.UniversityQuestions.generate('Matematik',1,0,{program:'general-math-1',topic:'general',subtopic:'mixed'},4).program,'general-math-1');
assert.equal(context.UniversityQuestions.generate('Matematik',1,0,{program:'linear-algebra',topic:'general',subtopic:'mixed'},4).program,'linear-algebra');
assert.equal(context.UniversityQuestions.generate('Fizik',1,0,{program:'physics-1',topic:'general',subtopic:'mixed'},4).program,'physics-1');
const report={passed:true,questions,independentChecks,mainTopics:bank.catalog.length,subtopics:bank.catalog.reduce((s,t)=>s+t.subs.length,0),newTemplates:seen.size,responseTypes:[...types],difficultyLevels:[...levels].sort(),catalog};
fs.mkdirSync(path.join(__dirname,'../build'),{recursive:true});fs.writeFileSync(path.join(__dirname,'../build/math2-verification.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
