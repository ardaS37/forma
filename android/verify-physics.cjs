const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const root=path.join(__dirname,'app/src/main/assets/web'),context={console,translations:{},localStorage:{getItem:()=>null}};vm.createContext(context);
for(const file of ['math.js','question-engine.js','university.js','math1.js','math2.js','analytic.js','geometry.js','linear.js','discrete.js','differential.js','math1-slides.js','question-difficulty.js','math1-expanded.js','math2-expanded.js','science-catalog.js','physics1.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
const source=fs.readFileSync(path.join(root,'simulations.js'),'utf8');vm.runInContext(source.slice(0,source.indexOf('const toolbar=document.createElement'))+'})();',context);
const bank=context.Physics1Bank,near=(a,b)=>assert(Math.abs(a-b)<1e-7*Math.max(1,Math.abs(a),Math.abs(b)),`${a} != ${b}`),f=x=>Number(x.toFixed(4)).toLocaleString('tr-TR');let questions=0,checks=0;const seen=new Set();
for(const topic of bank.catalog)for(const sub of topic.subtopics)for(let seed=0;seed<80;seed++)for(let index=0;index<4;index++){
 const sel={program:'physics-1',topic:topic.id,subtopic:sub.id},q=bank.generate('Fizik',seed,index,sel);questions++;seen.add(q.template);
 assert.equal(q.supportsChoices,false);assert.equal(q.choices.length,0);assert(q.text&&q.eq&&q.solution);assert(!/NaN|Infinity|undefined/.test(q.text+q.solution));assert(q.difficulty.score>=1&&q.difficulty.score<=5);
 assert.equal(JSON.stringify(q),JSON.stringify(context.UniversityQuestions.generate('Fizik',seed,index,sel)));assert.equal(JSON.stringify(q),JSON.stringify(bank.generate('Fizik',seed,index,sel)));
 const p=q.parameters;
 if(sub.id==='physics-1-motion-4'){assert(p.v>p.u);assert(q.solution.includes(f(p.u*p.w/p.v)));checks++;}
 if(sub.id==='physics-1-momentum-3'){const before=p.m*p.u+p.M*p.w,v1=((p.m-p.M)*p.u+2*p.M*p.w)/(p.m+p.M),v2=(before-p.m*v1)/p.M;near(p.m*p.u*p.u+p.M*p.w*p.w,p.m*v1*v1+p.M*v2*v2);assert(q.solution.includes(f(v2)));checks++;}
 if(sub.id==='physics-1-thermal-2'){const temperature=(p.m*p.hot+p.M*p.cold)/(p.m+p.M);assert(temperature>p.cold&&temperature<p.hot);near(p.m*(p.hot-temperature),p.M*(temperature-p.cold));assert(q.solution.includes(f(temperature)));checks++;}
 if(sub.id==='physics-1-forces-1'){const N=p.m*9.81-p.F*.5;assert(q.solution.includes(N>=0?'Temas sürer':'temas kesilir'));checks++;}
}
assert.equal(bank.catalog.length,9);assert.equal(bank.makers.size,32);assert.equal(seen.size,64);assert.throws(()=>bank.generate('Fizik',1,-1,{}));assert.throws(()=>bank.generate('Kimya',1,0,{}));
for(const m of context.PhysicsSimulations.models){
 const nominal=Object.fromEntries(m.controls.map(c=>[c[0],c[5]]));
 for(let i=0;i<100;i++){const p=Object.fromEntries(m.controls.map(([key,label,min,max,step],j)=>[key,min+(max-min)*((i*37+j*11)%101)/100])),end=m.compute(p,0).duration;for(const t of [0,end/2,end]){const s=m.compute(p,t);for(const value of Object.values(s.metrics))if(typeof value==='number')assert(Number.isFinite(value));
 if(m.id==='energy')near(s.K+s.U,p.k*p.A*p.A/2);
 if(m.id==='momentum'){near(p.m1*s.v1+p.m2*s.v2,p.m1*p.u1+p.m2*p.u2);near(s.v2-s.v1,p.e*(p.u1-p.u2));assert(s.Kafter<=s.Kbefore+1e-7);if(p.e===1)near(s.Kafter,s.Kbefore);}
 if(m.id==='motion'&&t===end)near(s.y,0);
 if(m.id==='fluids'&&t===end)near(s.h,0);
 if(m.id==='thermal')near(s.Q,s.U+s.W);
 if(m.id==='gravity')near(s.v*s.v/s.r,context.Physics1Bank.constants.G*0+3.986004418e14/(s.r*s.r));
 checks++;}}
 assert(m.compute(nominal,0));
}
const report={questions,independentChecks:checks,mainTopics:9,subtopics:32,questionVariants:seen.size,simulations:context.PhysicsSimulations.models.length};fs.writeFileSync(path.join(__dirname,'../build/physics1-verification.json'),JSON.stringify(report,null,2));console.log('PASS',report);
