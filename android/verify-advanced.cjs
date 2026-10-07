const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const c={console,translations:{},localStorage:{getItem:()=>null}},root=path.join(__dirname,'app/src/main/assets/web');vm.createContext(c);
for(const f of ['math.js','question-engine.js','university.js','math1.js','math2.js','analytic.js','geometry.js','linear.js','discrete.js','differential.js','math1-slides.js','question-difficulty.js','math1-expanded.js','math2-expanded.js','question-graphs.js','graph-questions.js','geometry-exercises.js','plane-expanded.js','solid-expanded.js','analytic-expanded.js','geometry-reference.js','advanced-math.js','linear-expanded.js','discrete-expanded.js','differential-expanded.js','advanced-reference.js','cw-math.js','matrix-tool.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),c,{filename:f});
const plain=x=>JSON.parse(JSON.stringify(x)),dot=(u,v)=>u.reduce((s,x,i)=>s+x*v[i],0),mul=(A,B)=>A.map(row=>B[0].map((_,j)=>row.reduce((s,v,k)=>s+v*B[k][j],0))),det=A=>A[0][0]*A[1][1]-A[0][1]*A[1][0],power=(A,n)=>{let B=[[1,0],[0,1]];while(n--)B=mul(B,A);return B;},gcd=(a,b)=>b?gcd(b,a%b):a;
let checks=0,questions=0;function close(a,b,tol=1e-7){assert(Number.isFinite(a)&&Number.isFinite(b));assert(Math.abs(a-b)<=tol*Math.max(1,Math.abs(a),Math.abs(b)),`${a} != ${b}`);checks++;}
function array(A,B){A.flat().forEach((v,i)=>close(v,B.flat()[i]));}const D=(f,x,h=1e-5)=>(f(x+h)-f(x-h))/(2*h),DD=(f,x,h=1e-4)=>(f(x+h)-2*f(x)+f(x-h))/(h*h);
function ode(f,x,rhs){close(D(f,x),rhs(x,f(x)),2e-5);}function second(f,x,a,b,rhs){close(DD(f,x)+a*D(f,x)+b*f(x),rhs(x),3e-4);}
function verify(q){const p=q.parameters;switch(q.modelId){
case'lx-commutator':array(p.AB,mul(p.A,p.B));array(p.BA,mul(p.B,p.A));close(det(p.AB),1);break;
case'lx-symmetric-split':array(p.S.map((row,i)=>row.map((v,j)=>v+p.K[i][j])),p.A);close(p.S[0][1],p.S[1][0]);close(p.K[0][1],-p.K[1][0]);break;
case'lx-nilpotent-power':array(power([[1,p.k],[0,1]],p.n),[[1,p.n*p.k],[0,1]]);break;
case'lx-rank-one':close(det(p.A),p.D);break;
case'lx-singular-parameter':close(p.D,det([[1,p.k],[p.k,1]]));break;
case'lx-orientation-area':close(Math.abs(det(p.A)),p.area);break;
case'lx-affine-solutions':for(const t of[-2,0,3]){close(p.b-p.a*t+p.a*t,p.b);close(p.d-p.c*t+p.c*t,p.d);}break;
case'lx-consistency-rank':close(p.c-p.k*p.b,p.delta);break;
case'lx-interpolation':p.ys.forEach((y,x)=>close(y,p.C*x*x+p.A*x+p.B));break;
case'lx-cauchy':close(p.dot,dot(p.u,p.v));close(p.U*p.W-p.dot*p.dot,p.D*p.D);break;
case'lx-triple-product':close(det([[p.a,p.b],[0,p.c]])*p.s*p.f,p.s*p.a*p.c*p.f);break;
case'lx-triangle-inequality':assert(2*p.b<2*Math.hypot(p.a,p.b));checks++;break;
case'lx-affine-subspace':for(const[x,y]of q.graph.curves[0].points)close(p.a*x+p.b*y,p.d);break;
case'lx-polynomial-basis':for(const x of[-2,0,3])close(p.A*x*x+p.B*x+p.C,p.coords[0]+p.coords[1]*(x-p.h)+p.coords[2]*(x-p.h)**2);break;
case'lx-plane-intersection':close(p.a*p.b+p.a*(-p.b),0);close(-p.b+p.b,0);break;
case'lx-reflection':array(mul(p.H,p.H),[[1,0],[0,1]]);array(p.v,p.H.map(row=>dot(row,p.u)));close(det(p.H),-1);break;
case'lx-similarity':array(mul([[1,-p.k],[0,1]],mul(p.A,p.P)),p.B);break;
case'lx-surjection-kernel':close(p.a*p.b-p.a*p.b,0);break;
case'lx-symmetric-spectrum':const B=power([[p.a,p.b],[p.b,p.a]],p.n);array(B,[[(p.l**p.n+p.m**p.n)/2,(p.l**p.n-p.m**p.n)/2],[(p.l**p.n-p.m**p.n)/2,(p.l**p.n+p.m**p.n)/2]]);break;
case'lx-jordan-power':array(power([[p.l,1],[0,p.l]],p.n),[[p.l**p.n,p.n*p.l**(p.n-1)],[0,p.l**p.n]]);break;
case'lx-complex-rotation':array(mul([[0,-p.w],[p.w,0]],[[0,-p.w],[p.w,0]]),[[-p.w*p.w,0],[0,-p.w*p.w]]);break;
case'lx-least-squares-line':const residual=p.ys.map((y,i)=>y-p.a*(i-1)-p.b);close(residual.reduce((s,v)=>s+v,0),0);close(dot(residual,[-1,0,1]),0);close(dot(residual,residual),p.SSE);break;
case'lx-qr':const Q=[[1/Math.sqrt(p.d),-p.k/Math.sqrt(p.d)],[p.k/Math.sqrt(p.d),1/Math.sqrt(p.d)]];array(mul(Q,[[Math.sqrt(p.d),p.k/Math.sqrt(p.d)],[0,1/Math.sqrt(p.d)]]),[[1,0],[p.k,1]]);break;
case'lx-projector':const A=[[1/p.d,p.k/p.d],[p.k/p.d,p.k*p.k/p.d]];array(mul(A,A),A);break;
case'dx-implication-count':let count=0;for(let mask=0;mask<2**p.n;mask++)if(!(mask&1)||(mask&2))count++;close(count,p.count);break;
case'dx-quantifiers':assert(p.n>1);checks++;break;
case'dx-parity':let odd=0;for(let mask=0;mask<2**p.n;mask++)if(mask.toString(2).replace(/0/g,'').length%2)odd++;close(odd,p.count);break;
case'dx-venn-atoms':close(p.union,p.a+p.b+p.i);break;
case'dx-three-set-ie':close(p.union,p.atoms.reduce((a,b)=>a+b));close(p.A,p.atoms[0]+p.atoms[3]+p.atoms[4]+p.atoms[6]);break;
case'dx-powerset-constraints':let one=0;for(let mask=0;mask<2**p.n;mask++)if(!!(mask&1)!==!!(mask&2))one++;close(one,2**(p.n-1));break;
case'dx-circular':let fac=1;for(let i=1;i<p.n;i++)fac*=i;close(fac,p.count);break;
case'dx-bounded-stars':let bounded=0;for(let a=0;a<=2;a++)for(let b=0;b<=2;b++)for(let d=0;d<=2;d++)bounded+=+(a+b+d===p.N);close(bounded,p.count);break;
case'dx-pigeonhole-tight':close(Math.ceil(p.N/12),p.q);break;
case'dx-residue-classes':for(let k=0;k<p.m;k++)close(Array.from({length:p.N},(_,i)=>i).filter(i=>i%p.m===k).length,p.k+(k<p.s));break;
case'dx-hasse':assert(p.p!==p.q&&p.p*p.q>p.q);checks++;break;
case'dx-order-count':let order=0;for(let x=1;x<=p.n;x++)for(let y=1;y<=p.n;y++)order+=+(x<=y);close(order,p.n*(p.n+1)/2);break;
case'dx-mapping':assert.deepEqual(plain(p.image),[...new Set(p.targets)].sort());checks++;break;
case'dx-surjection-count':let onto=0;for(let k=0;k<p.m**p.n;k++){let v=k,S=new Set();for(let i=0;i<p.n;i++){S.add(v%p.m);v=Math.floor(v/p.m);}onto+=+(S.size===p.m);}close(onto,p.count);break;
case'dx-divisor-square':assert(p.p!==p.q&&p.a>=2&&p.b>=2);checks++;break;
case'dx-congruence':close(p.d,gcd(p.a,p.m));assert.deepEqual(plain(p.solutions),Array.from({length:p.m},(_,x)=>x).filter(x=>(p.a*x-p.b)%p.m===0));checks++;break;
case'dx-crt':close(p.x%p.p,p.a);close(p.x%p.q,p.b);assert(p.x>=0&&p.x<p.p*p.q);break;
case'dx-bezout':close(p.a*p.x+p.b*p.y,p.d);close(p.d,gcd(p.a,p.b));break;
case'dx-shortest-path':{const dist=Array.from({length:4},(_,i)=>Array.from({length:4},(_,j)=>i===j?0:Infinity));for(const[i,j,w]of[[0,1,p.a],[0,2,p.b],[1,3,p.c],[2,3,p.d],[1,2,p.e]])dist[i][j]=dist[j][i]=w;for(let k=0;k<4;k++)for(let i=0;i<4;i++)for(let j=0;j<4;j++)dist[i][j]=Math.min(dist[i][j],dist[i][k]+dist[k][j]);close(dist[0][3],p.best);break;}
case'dx-degree-sequence':{let seq=[...p.seq];while(seq.length&&seq[0]>0){seq.sort((a,b)=>b-a);let d=seq.shift();if(d>seq.length){seq=[-1];break;}for(let i=0;i<d;i++)seq[i]--;if(seq.some(x=>x<0))break;}assert.equal(seq.every(x=>x===0),p.valid);checks++;break;}
case'dx-euler-hamilton':assert(p.n>=4);checks++;break;
case'dx-weighted-tree':close(p.diameter,Math.max(p.a+p.b,p.a+p.c+p.d,p.b+p.c+p.d));break;
case'dx-full-binary':close(2*(p.L-1),2*p.L-2);break;
case'dx-cycle-spanning':assert(p.n>=4);checks++;break;
case'dx-affine':p.values.forEach((v,n)=>close(v,p.k**n*p.a+p.b*(p.k**n-1)/(p.k-1)));break;
case'dx-repeated-root':{const f=n=>(p.A+p.B*n)*p.k**n;for(let n=0;n<5;n++)close(f(n+2),2*p.k*f(n+1)-p.k*p.k*f(n));break;}
case'dx-binary-strings':let valid=0;for(let k=0;k<2**p.n;k++)valid+=+(!(k&(k>>1)));close(valid,p.count);break;
case'odx-slope-field':{const f=x=>p.K+(p.b-p.K)*Math.exp(p.s*p.a*x);close(f(0),p.b);ode(f,.2,(x,y)=>p.s*p.a*(y-p.K));break;}
case'odx-logistic-phase':{const f=x=>p.K/(1+Math.exp(-p.a*p.K*x));close(f(0),p.K/2);ode(f,.1,(x,y)=>p.a*y*(p.K-y));break;}
case'odx-nonunique':{const f=x=>x<=p.T?0:(x-p.T)**2/4;ode(f,p.T+.5,(x,y)=>Math.sqrt(Math.abs(y)));close(f(0),0);break;}
case'odx-blowup':{const f=x=>p.b/(1-p.a*p.b*x);close(p.T,1/(p.a*p.b));ode(f,.2*p.T,(x,y)=>p.a*y*y);break;}
case'odx-tangent-domain':ode(x=>Math.tan(p.a*x),.1,(x,y)=>p.a*(1+y*y));break;
case'odx-branch':{const f=x=>Math.sign(p.b)*Math.sqrt(x*x+p.b*p.b);close(f(0),p.b);ode(f,.5,(x,y)=>x/y);break;}
case'odx-singular-coefficient':{const f=x=>x**(p.m+1)/p.d+(p.b-1/p.d)*x**(-p.a);close(f(1),p.b);ode(f,1.2,(x,y)=>x**p.m-p.a*y/x);break;}
case'odx-matched-forcing':ode(x=>Math.exp(-p.a*x)*(p.b+x),.3,(x,y)=>Math.exp(-p.a*x)-p.a*y);break;
case'odx-mixing':ode(t=>p.V*p.c*(1-Math.exp(-p.q*t/p.V)),.3,(x,y)=>p.q*p.c-p.q*y/p.V);break;
case'odx-quadratic-potential':for(const[x,y]of q.graph.curves[0].points)close(p.a*x*x+x*y+p.c*y*y,p.C);break;
case'odx-integrating-factor':ode(x=>x**(-1/p.k),1.2,(x,y)=>-y/(p.k*x));break;
case'odx-homogeneous-domain':{const f=x=>x/(1/p.b-Math.log(x));close(f(1),p.b);ode(f,.8,(x,y)=>y/x+(y/x)**2);break;}
case'odx-bernoulli-threshold':{const f=x=>1/(1/p.a+(1/p.b-1/p.a)*Math.exp(p.a*x));close(f(0),p.b);ode(f,.02,(x,y)=>-p.a*y+y*y);break;}
case'odx-riccati':ode(x=>-p.k*Math.tanh(p.k*(x-p.t)),p.t+.1,(x,y)=>y*y-p.k*p.k);break;
case'odx-cubic-stability':ode(x=>1/Math.sqrt(1+p.D*Math.exp(-2*p.a*x)),.2,(x,y)=>p.a*y*(1-y*y));break;
case'odx-damped':{const f=x=>Math.exp(-p.a*x)*(p.A*Math.cos(p.w*x)+p.B*Math.sin(p.w*x));close(f(0),p.A);close(D(f,0),-p.a*p.A+p.w*p.B);second(f,.2,2*p.a,p.a*p.a+p.w*p.w,()=>0);break;}
case'odx-reduction':{const f=x=>(p.A+p.B)/3*x*x+(2*p.A-p.B)/3/x;close(f(1),p.A);close(D(f,1),p.B);second(f,1.3,0,-2/(1.3**2),()=>0);break;}
case'odx-boundary':close(Math.sin(p.w*Math.PI/p.w),0);break;
case'odx-polynomial-forcing':{const f=x=>p.b/p.k**3*Math.sinh(p.k*x)-p.b/p.k**2*x;close(f(0),0);close(D(f,0),0);second(f,.2,0,-p.k*p.k,x=>p.b*x);break;}
case'odx-resonance-envelope':second(x=>p.b/(2*p.w)*x*Math.sin(p.w*x),.3,0,p.w*p.w,x=>p.b*Math.cos(p.w*x));break;
case'odx-variation':second(x=>p.b*(Math.cos(x)*Math.log(Math.cos(x))+x*Math.sin(x)),.2,0,1,x=>p.b/Math.cos(x));break;
case'odx-delayed-step':ode(x=>p.b/p.a*(1-Math.exp(-p.a*(x-p.c))),p.c+.2,(x,y)=>p.b-p.a*y);break;
case'odx-impulse':{const f=x=>p.J/p.w*Math.sin(p.w*(x-p.c));close(f(p.c),0);close(D(f,p.c),p.J);second(f,p.c+.2,0,p.w*p.w,()=>0);break;}
case'odx-convolution':ode(x=>p.m===1?x/p.a-(1-Math.exp(-p.a*x))/p.a**2:x*x/p.a-2*x/p.a**2+2*(1-Math.exp(-p.a*x))/p.a**3,.4,(x,y)=>x**p.m-p.a*y);break;
case'odx-spiral':{const f=t=>[Math.exp(-p.a*t)*(p.U*Math.cos(p.w*t)-p.V*Math.sin(p.w*t)),Math.exp(-p.a*t)*(p.U*Math.sin(p.w*t)+p.V*Math.cos(p.w*t))],v=f(.2);close(D(t=>f(t)[0],.2),-p.a*v[0]-p.w*v[1]);close(D(t=>f(t)[1],.2),p.w*v[0]-p.a*v[1]);close(dot(v,v),(p.U*p.U+p.V*p.V)*Math.exp(-2*p.a*.2));break;}
case'odx-saddle':ode(x=>p.U*Math.exp(-p.a*x),.3,(x,y)=>-p.a*y);ode(x=>p.V*Math.exp(p.b*x),.3,(x,y)=>p.b*y);break;
case'odx-euler-heun':close(p.e,1-p.a*p.h);close(p.H,1-p.a*p.h+(p.a*p.h)**2/2);break;
default:throw Error('Missing checker '+q.modelId);
}}
const programs=new Map([['linear-algebra',64],['discrete-math',72],['differential-equations',72]]),models=[...c.CourseExercises.models.values()].filter(m=>programs.has(m.program)),seen=new Set();assert.equal(models.length,78);
for(const model of models)for(let seed=0;seed<50;seed++)for(let index=0;index<2;index++){const selection={program:model.program,topic:model.topic,subtopic:model.id},q=c.UniversityQuestions.generate('Matematik',seed,index,selection);assert.equal(q.modelId,model.id);assert.equal(q.supportsChoices,false);assert(!/undefined|NaN|Infinity/.test(q.text+q.solution));assert(q.english.text.length>30&&q.english.solution.length>20);assert.equal(q.english.solution,index?q.enExplanation:q.enSolution+' '+q.enExplanation);assert.deepEqual(plain(q),plain(c.UniversityQuestions.generate('Matematik',seed,index,selection)));verify(q);seen.add(q.template);questions++;}
assert.equal(seen.size,156);
for(const[program,total]of programs){const bank=c.UniversityQuestions.bankFor(program);assert.equal(bank.catalog.reduce((n,t)=>n+t.subs.length,0),total);for(const topic of bank.catalog){for(let index=0;index<topic.subs.length*2;index++){const q=bank.generate('Matematik',42,index,{program,topic:topic.id,subtopic:'mixed'});assert.equal(q.subtopicId,topic.subs[index%topic.subs.length][0]);const general=bank.generate('Matematik',42,index*bank.catalog.length+bank.catalog.indexOf(topic),{program,topic:'general',subtopic:'mixed'});assert.equal(general.subtopicId,q.subtopicId);}assert.equal(c.GraphQuestions.registry.get(program+':'+topic.id).length,1);for(let seed=0;seed<30;seed++){const q=bank.generate('Matematik',seed,0,{program,topic:topic.id,subtopic:'graph-'+program+'-'+topic.id});assert.equal(q.questionType,'graph');assert(q.diagram.includes('question-graph'));verify(q);questions++;}}}
const T=c.MatrixTool;array(T.calculate([[1,2,3],[4,5,6]],[[1,0],[0,1],[1,1]],'multiply').data,[[4,5],[10,11]]);close(T.calculate([[0,2],[3,4]],null,'det').result,-6);array(mul([[2,1],[1,3]],plain(T.calculate([[2,1],[1,3]],null,'inverse').data)),[[1,0],[0,1]]);assert.throws(()=>T.calculate([[1,2],[2,4]],null,'inverse'));
assert.equal(T.calculate([[1,1],[2,2]],[[1],[3]],'solve').classification,'none');assert.equal(T.calculate([[1,1],[2,2]],[[1],[2]],'solve').classification,'infinite');array(T.calculate([[2,1],[1,3]],[[5],[5]],'solve').data,[[2],[1]]);close(T.calculate([[1e-20,0],[0,2e-20]],null,'rank').result,2);close(T.calculate([[1,2],[2,4]],null,'rank').result,1);assert.throws(()=>T.calculate([[1,2]],[[1,2]],'multiply'));assert.throws(()=>T.calculate([[1,2]],null,'det'));
console.log(`PASS advanced banks: ${questions} questions, 156 open variants + 26 given diagrams, ${checks} independent checks; matrix tool arithmetic, ranks, inverse, rectangular products and solution classifications.`);
