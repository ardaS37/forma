const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const root=path.join(__dirname,'app/src/main/assets/web'),context={console,translations:{},localStorage:{getItem:()=>null}};
vm.createContext(context);
for(const file of ['math.js','question-engine.js','university.js','math1.js','math2.js','analytic.js','geometry.js','linear.js','discrete.js','differential.js','math1-slides.js','question-difficulty.js','math1-expanded.js','math2-expanded.js','question-graphs.js','graph-questions.js','geometry-exercises.js','plane-expanded.js','solid-expanded.js','analytic-expanded.js','geometry-reference.js','science-catalog.js','physics1.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
const plain=x=>JSON.parse(JSON.stringify(x)),area=pts=>Math.abs(pts.reduce((s,p,i)=>{const next=pts[(i+1)%pts.length];return s+p[0]*next[1]-next[0]*p[1];},0)/2);
const integral=pts=>pts.slice(1).reduce((s,p,i)=>s+(p[0]-pts[i][0])*(p[1]+pts[i][1])/2,0);
let checks=0,questions=0;
function close(a,b,tolerance=1e-8){assert(Math.abs(a-b)<=tolerance*Math.max(1,Math.abs(a),Math.abs(b)),`${a} != ${b}`);checks++;}
function verify(q){
 const p=q.parameters,g=q.graph,c=g.curves||[],pts=c[0]?.points;
 switch(q.template){
 case 'graph-domain-values':{
  assert.equal(g.points.at(-1).open,true);close(pts[0][0],-p.a);close(pts.at(-1)[0],p.a+1);
  const [u,v]=pts.slice(1,3);close(u[0]-u[1]*(v[0]-u[0])/(v[1]-u[1]),p.a/2);break;}
 case 'graph-parabola-sign':for(const [x,y]of pts)close(y,p.s*(x-p.left)*(x-p.right));close(g.points[2].y,-p.s*p.d**2);break;
 case 'graph-removable-limit':close(pts[0][1]+(p.c-pts[0][0]),p.value);assert(g.points[0].open);assert.notEqual(g.points[1].y,p.value);break;
 case 'graph-jump-limit':close(c[0].points.at(-1)[1],p.a);close(c[1].points[0][1],p.b);assert(g.points[0].open&&!g.points[1].open);assert(p.a!==p.b);break;
 case 'graph-derivative-sign':close(pts[1][1],0);close(pts[3][1],0);assert(pts[0][1]*pts[2][1]<0&&pts[2][1]*pts[4][1]<0);break;
 case 'graph-signed-area':close(integral(pts),p.positive-p.negative);close(pts.slice(1).reduce((s,v,i)=>s+Math.abs((v[0]-pts[i][0])*(v[1]+pts[i][1])/2),0),p.positive+p.negative);break;
 case 'graph-sinusoid':close(g.points[1].x-g.points[0].x,p.T);close(g.points[0].y-g.points[2].y,2*p.A);for(const[x,y]of pts)close(y,p.A*Math.sin(2*Math.PI*x/p.T)+p.k);break;
 case 'graph-exponential':for(const[x,y]of pts)close(y,p.b**x);close(g.points[1].y,p.b);break;
 case 'graph-inverse':close((pts[1][1]-pts[0][1])/(pts[1][0]-pts[0][0]),p.m);close((p.b-p.k)/p.m,p.a);break;
 case 'graph-tangent-slope':{const[a,b]=c[1].points;close((b[1]-a[1])/(b[0]-a[0]),p.slope);close(a[1]+p.slope*(p.c-a[0]),p.y);break;}
 case 'graph-between-curves':close(area(g.regions[0].points),p.area,1e-4);for(const[x,y]of c[0].points)close(y,p.a*x);break;
 case 'graph-cusp':close((pts[1][1]-pts[0][1])/(pts[1][0]-pts[0][0]),-p.a);close((pts[2][1]-pts[1][1])/(pts[2][0]-pts[1][0]),p.a);break;
 case 'graph-disks':close(Math.PI*integral(pts.map(([x,y])=>[x,y*y])),p.volume);break;
 case 'graph-shells':{const segments=context.QuestionGraphs.sample(x=>2*Math.PI*x*(p.a-x),0,p.a,1000);close(integral(segments),p.volume,2e-6);close(area(g.regions[0].points),p.a*p.a/2);break;}
 case 'graph-interior-pole':assert(c[0].points.every(([x])=>x<p.c)&&c[1].points.every(([x])=>x>p.c));for(const curve of c.slice(0,2))for(const[x,y]of curve.points)close(y,1/(x-p.c)**2);assert(1/.0001-1/p.c>9000);break;
 case 'graph-partial-sums':g.points.forEach(({x,y})=>{close(y,Array.from({length:x+1},(_,i)=>p.A*p.ratio**i).reduce((a,b)=>a+b,0));close(p.sum-y,p.A*p.ratio**(x+1)/(1-p.ratio));});break;
 case 'graph-convergence-interval':close((g.points[0].x+g.points[1].x)/2,p.c);close((g.points[1].x-g.points[0].x)/2,p.R);assert(g.points[0].open&&!g.points[1].open);break;
 case 'graph-ellipse-orientation':close(area(pts),p.area,.0002);for(const[x,y]of pts)close((x/p.a)**2+(y/p.b)**2,1);{const arrow=g.arrows[0];assert(arrow.from[0]*arrow.to[1]-arrow.to[0]*arrow.from[1]>0);}break;
 case 'graph-cardioid-region':close(area(pts),p.area,.001);close(g.points[1].x,2*p.a);break;
 case 'graph-rose-petals':close(area(g.regions[0].points),p.petal,.002);close(area(pts),p.area,.002);break;
 case 'graph-vector-projection':close(g.arrows[0].to[0],p.projection[0]);close(p.perpendicular[0],0);close(Math.hypot(...g.arrows[0].to),p.norm);break;
 case 'graph-gradient-contours':c.forEach((curve,i)=>curve.points.forEach(([x,y])=>close(x*x+y*y,(i+1)**2)));{const arrow=g.arrows[0],u=arrow.to.map((x,i)=>x-arrow.from[i]);close(Math.hypot(...u),1);close(2*p.h*u[0]+2*p.k*u[1],p.directional);close(Math.hypot(2*p.h,2*p.k),p.maximal);}break;
 case 'graph-double-integral-region':close(area(g.regions[0].points),p.area);break;
 case 'graph-integral-test':for(let i=1;i<pts.length;i++){assert(pts[i][1]<pts[i-1][1]);assert((pts[i][1]<c[1].points[i][1])===p.convergent);}break;
 default:throw Error(q.template);
 }
}
for(const program of ['general-math-1','general-math-2']){
 const bank=context.UniversityQuestions.bankFor(program),subCount=bank.catalog.reduce((s,t)=>s+t.subs.length,0);assert.equal(subCount,program.endsWith('1')?102:90);
 const seen=new Set();
 for(const topic of bank.catalog){
  const group=context.GraphQuestions.registry.get(program+':'+topic.id);if(!group)continue;
  for(let seed=0;seed<100;seed++)for(let index=0;index<group.length;index++){
   const selection={program,topic:topic.id,subtopic:'graph-'+program+'-'+topic.id},q=context.UniversityQuestions.generate('Matematik',seed,index,selection,4);
   assert.equal(q.questionType,'graph');assert.equal(q.supportsChoices,false);assert.equal(q.template,group[index].id);assert(!/NaN|undefined|Infinity/.test(q.diagram));assert(q.solution.length>30&&q.english.solution.length>30);
   assert.deepEqual(plain(q),plain(context.UniversityQuestions.generate('Matematik',seed,index,selection,4)));
   assert.equal(q.diagram,context.QuestionGraphs.render(plain(q.graph),'tr',q.id));assert.equal(q.english.diagram,context.QuestionGraphs.render(q.graph,'en',q.id));
   const scales=q.diagram.match(/data-x-scale="([^"]+)" data-y-scale="([^"]+)"/);if(q.graph.equalScale!==false)close(+scales[1],+scales[2]);
   verify(q);seen.add(q.template);questions++;
  }
  const graphIndex=topic.subs.findIndex(s=>s[0].startsWith('graph-'));
  assert.equal(bank.generate('Matematik',3,graphIndex,{program,topic:topic.id,subtopic:'mixed'}).questionType,'graph');
  const generalIndex=graphIndex*bank.catalog.length+bank.catalog.indexOf(topic);
  assert.equal(bank.generate('Matematik',3,generalIndex,{program,topic:'general',subtopic:'mixed'}).questionType,'graph');
  const oldSub=topic.subs[0][0];assert.notEqual(bank.generate('Matematik',3,0,{program,topic:topic.id,subtopic:oldSub}).questionType,'graph');
 }
 assert.equal(seen.size,12);
}
assert.throws(()=>context.QuestionGraphs.render({version:1,bounds:[0,0,0,1]}));
assert.throws(()=>context.QuestionGraphs.render({version:1,bounds:[0,1,0,1],curves:[{points:[[0,NaN]]}]}));
assert(!context.QuestionGraphs.render({version:1,bounds:[0,1,0,1],title:{tr:'<script>"&'}}).includes('<script>'));
console.log(`PASS graph questions: ${questions} generated questions, 24 templates, ${checks} numerical checks; deterministic bilingual SVG, equal scales, mixed routing and original subtopics.`);
