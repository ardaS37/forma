const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const root=path.join(__dirname,'app/src/main/assets/web');
const context={console,translations:{}};vm.createContext(context);
for(const file of ['math.js','question-engine.js','university.js','math1.js','math2.js','analytic.js','geometry.js','linear.js','discrete.js','differential.js','math1-slides.js','question-difficulty.js','math1-expanded.js','math2-expanded.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
const bank=context.Math1Bank;
const close=(a,b,tol=1e-8)=>assert(Math.abs(a-b)<=tol*Math.max(1,Math.abs(a),Math.abs(b)),`${a} != ${b}`);
const evaluatePolynomial=(cs,x)=>cs.map((c,i)=>c*x**(cs.length-i-1)).reduce((a,b)=>a+b,0);
function contains(intervals,x){return intervals.split(' ∪ ').some(s=>{
 if(s.startsWith('{'))return Number(s.slice(1,-1))===x;
 const [a,b]=s.slice(1,-1).split(',').map(s=>s.trim());
 const left=a==='−∞'?-Infinity:Number(a),right=b==='∞'?Infinity:Number(b);
 return (x>left||(s[0]==='['&&x===left))&&(x<right||(s.at(-1)===']'&&x===right));
});}
let checks=0,newChecks=0;const seen=new Set(),types=new Set(),levels=new Set();
const topicCounts={};
for(const topic of bank.catalog){
 topicCounts[topic.id]={label:topic.label,subtopics:topic.subs.length,expandedTemplates:topic.subs.reduce((n,[id])=>n+(bank.expandedTemplates.get(id)?.length||0),0)};
 for(const [sub] of topic.subs)for(let seed=0;seed<48;seed++)for(let index=0;index<8;index++){
  const selection={program:'general-math-1',topic:topic.id,subtopic:sub};
  const q=bank.generate('Matematik',seed*7919,index,selection,4);
  assert.equal(q.topicId,topic.id);assert.equal(q.subtopicId,sub);
  assert(q.text&&q.eq&&q.solution,`${sub} incomplete`);
  assert(!/NaN/.test(q.text+q.eq+q.solution),q.template+' invalid text: '+q.text+' | '+q.eq+' | '+q.solution);
  assert(q.difficulty.score>=1&&q.difficulty.score<=5);
  checks++;levels.add(q.difficulty.level);
  if(q.generatorVersion!==3)continue;
  newChecks++;seen.add(q.template);types.add(q.responseType);
  assert.equal(q.supportsChoices,false);assert.equal(q.choices.length,0);assert.equal(q.correct,null);
  const p=q.parameters;
  if(p.coefficients&&p.roots)for(const x of p.roots)close(evaluatePolynomial(p.coefficients,x),0);
  if(q.template==='quadratic-analysis'){
   const [a,b,c]=p.coefficients;close(p.discriminant,b*b-4*a*c);close(p.roots.reduce((a,b)=>a+b),-b/a);close(p.roots.reduce((a,b)=>a*b),c/a);
  }
  if(q.template==='cubic-cardano'||q.template==='cubic-cardano-shift'){
   const depressedRoot=p.realRoot-(p.h||0);
   close(depressedRoot**3+p.p*depressedRoot+p.q,0);
   if(p.coefficients)close(evaluatePolynomial(p.coefficients,p.realRoot),0);
   const root=Math.cbrt(-p.q/2+Math.sqrt(p.D))+Math.cbrt(-p.q/2-Math.sqrt(p.D));close(root,depressedRoot);
  }
  if(q.template==='horner-remainder')for(const x of [-3,-.5,0,2,7])close(evaluatePolynomial(p.coefficients,x),(x-p.a)*evaluatePolynomial(p.quotient,x)+p.remainder);
  if(q.template==='polynomial-parameter')close(p.a**3+p.b*p.a**2+p.m*p.a+p.c,0);
  if(p.matrix&&p.rhs&&p.roots)p.matrix.forEach((row,i)=>close(row.reduce((s,a,j)=>s+a*p.roots[j],0),p.rhs[i]));
  if(['polynomial-sign-chart','rational-sign-chart','repeated-root-chart','rational-two-poles'].includes(q.template)){
   const actual=context.Math1Bank.expandedUtilities.chart(p.roots,p.poles||[],p.op);
   for(let j=-40;j<=40;j++){
    const x=j/4;let denominator=(p.poles||[]).reduce((v,a)=>v*(x-a),1);
    const val=p.roots.reduce((v,a)=>v*(x-a),1)/denominator;
    const expected=denominator!==0&&(p.op==='≥'?val>=0:p.op==='≤'?val<=0:p.op==='>'?val>0:val<0);
    assert.equal(contains(actual.answer,x),expected,`${q.template} ${actual.answer} at ${x}`);
   }
  }
  if(q.template==='system-underdetermined')p.matrix.forEach(row=>close(row.reduce((s,a,j)=>s+a*p.direction[j],0),0));
  if(q.template==='parabola-graph'){
   close(evaluatePolynomial(p.coefficients,p.h),p.k);
   close(evaluatePolynomial(p.coefficients,p.h-1),evaluatePolynomial(p.coefficients,p.h+1));
  }
  if(q.template==='logarithmic-product-equation'){close((p.validRoot-p.a)*(p.validRoot+p.b),p.K);assert(p.validRoot>p.a);assert(p.roots.filter(x=>x>p.a).length===1);}
  if(q.template==='piecewise-continuity-parameters'){close(p.a*p.h*p.h,p.m*p.h+p.n);close(2*p.a*p.h,p.m);}
  if(q.template==='implicit-general'){
   close(p.x*p.x+p.a*p.x*p.y+p.y*p.y,p.C);
   const slope=-(2*p.x+p.a*p.y)/(p.a*p.x+2*p.y);
   close((2*p.x+p.a*p.y)+(p.a*p.x+2*p.y)*slope,0);
  }
  if(q.template==='ladder-related-rates')close(p.x*p.x+p.y*p.y,p.L*p.L);
  if(q.template==='newton-two-iterations'){
   assert(Math.abs(p.x2-Math.sqrt(p.N))<Math.abs(p.x1-Math.sqrt(p.N)));
   close(p.x1,p.x0-(p.x0*p.x0-p.N)/(2*p.x0));
  }
  if(q.template==='complex-roots-plot'){
   let re=0,im=0;for(let k=0;k<p.m;k++){const theta=2*Math.PI*k/p.m;re+=p.radius*Math.cos(theta);im+=p.radius*Math.sin(theta);}close(re,0);close(im,0);
  }
  if(q.template==='rectangle-optimization'){
   const optimum=p.L/4,A=x=>x*(p.L-2*x);assert(A(optimum)>A(optimum-.1));assert(A(optimum)>A(optimum+.1));
  }
  if(q.template==='box-optimization'){
   const optimum=p.L/6,V=x=>x*(p.L-2*x)**2;assert(V(optimum)>V(optimum-.1));assert(V(optimum)>V(optimum+.1));
  }
  if(q.template==='area-parabola-line'){
   const pieces=200,dx=p.a/pieces;let area=0;for(let i=0;i<pieces;i++){const x=(i+.5)*dx;area+=(p.a*x-x*x)*dx;}close(area,p.a**3/6,3e-5);
  }
  if(q.solutionDiagram)assert(!/NaN|undefined/.test(q.solutionDiagram));
  // Question output must be deterministic and snapshots must be independent of later generation.
  if(seed===0&&index===0)assert.equal(JSON.stringify(q),JSON.stringify(bank.generate('Matematik',seed*7919,index,selection,4)));
 }
}
const expected=[...bank.expandedTemplates.values()].flat().map(item=>item.id);
assert.equal(seen.size,expected.length);expected.forEach(id=>assert(seen.has(id),id));
const generalTopics=new Set();for(let i=0;i<bank.catalog.length*4;i++)generalTopics.add(bank.generate('Matematik',100,i,{program:'general-math-1',topic:'general',subtopic:'mixed'}).topicId);
assert.equal(generalTopics.size,bank.catalog.length);
assert(context.QuestionDifficulty.estimate({difficultyProfile:{base:2,steps:3},parameters:{a:999}}).score>context.QuestionDifficulty.estimate({difficultyProfile:{base:2,steps:3},parameters:{a:2}}).score);
const report={checks,new_question_checks:newChecks,expanded_templates:seen.size,topics:bank.catalog.length,subtopics:bank.catalog.reduce((n,t)=>n+t.subs.length,0),response_types:[...types],difficulty_levels:[...levels].sort(),catalog:topicCounts,passed:true};
fs.writeFileSync(path.join(__dirname,'../build/math1-verification.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
