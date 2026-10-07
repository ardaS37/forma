const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const root=path.join(__dirname,'app/src/main/assets/web'),c={console,translations:{},localStorage:{getItem:()=>null}};vm.createContext(c);
for(const f of ['math.js','question-engine.js','university.js','math1.js','math2.js','analytic.js','geometry.js','linear.js','discrete.js','differential.js','math1-slides.js','question-difficulty.js','math1-expanded.js','math2-expanded.js','question-graphs.js','graph-questions.js','geometry-exercises.js','plane-expanded.js','solid-expanded.js','analytic-expanded.js','geometry-reference.js','science-catalog.js','physics1.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),c,{filename:f});
const plain=x=>JSON.parse(JSON.stringify(x)),dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0),norm=a=>Math.hypot(...a),sub=(a,b)=>a.map((x,i)=>x-b[i]),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const integral=(f,a,b,N=200)=>{let s=f(a)+f(b);for(let i=1;i<N;i++)s+=(i%2?4:2)*f(a+(b-a)*i/N);return s*(b-a)/(3*N);};
const polygonArea=pts=>Math.abs(pts.reduce((s,p,i)=>{const q=pts[(i+1)%pts.length];return s+p[0]*q[1]-p[1]*q[0];},0)/2);
let checks=0,questions=0;const seen=new Set(),types=new Set(),boundary=new Set();
function close(a,b,tol=1e-7){assert(Number.isFinite(a)&&Number.isFinite(b));assert(Math.abs(a-b)<=tol*Math.max(1,Math.abs(a),Math.abs(b)),`${a} != ${b}`);checks++;}
function verify(q){const p=q.parameters,id=q.modelId;
 switch(id){
 case 'ge-angle-equation':close(p.alpha+p.beta,180);close(p.alpha,p.a*p.x);close(p.beta,2*p.x+p.c);break;
 case 'ge-parallel-chain':close(p.turn,p.a+p.b);assert(p.turn<180);break;
 case 'ge-bisector-angle':close((p.a+p.b)/2,90);break;
 case 'ge-clock-angle':close(p.hour,30*p.h+p.m/2);close(p.minute,6*p.m);close(p.small,Math.acos(Math.cos((p.hour-p.minute)*Math.PI/180))*180/Math.PI);break;
 case 'ge-heron':{const s=(p.a+p.b+p.c)/2;close(p.area,Math.sqrt(s*(s-p.a)*(s-p.b)*(s-p.c)));close(p.a*p.a+p.b*p.b,p.c*p.c);break;}
 case 'ge-cosine-rule':close(p.c2,p.a*p.a+p.b*p.b-2*p.a*p.b*Math.cos(Math.PI/3));close(p.area,p.a*p.b*Math.sin(Math.PI/3)/2);break;
 case 'ge-incircle':close(p.inradius,(p.a+p.b-p.c)/2);close(p.circumradius,p.a*p.b*p.c/(4*p.area));break;
 case 'ge-median':close(p.median,Math.hypot(p.a/2,p.b/2));break;
 case 'ge-trapezoid-midline':close(p.mid,(p.a+p.b)/2);close(p.area,p.h*(p.a+p.b)/2);break;
 case 'ge-parallelogram-law':close(p.d2+p.e2,2*(p.a*p.a+p.b*p.b));close(p.e2-p.d2,4*p.a*p.b*Math.cos(Math.PI/3));break;
 case 'ge-cyclic':close(p.a+p.C,180);close(p.b+p.D,180);break;
 case 'ge-rhombus-diagonals':close(p.side,Math.hypot(p.d/2,p.e/2));close(p.area,polygonArea(q.graph.curves[0].points));break;
 case 'ge-diagonal-inverse':close(p.D,Array.from({length:p.N},()=>p.N-3).reduce((a,b)=>a+b,0)/2);break;
 case 'ge-regular-hexagon':close(p.area,polygonArea(q.graph.curves[0].points));close(p.apothem,p.a*Math.cos(Math.PI/6));break;
 case 'ge-exterior-algebra':close(p.N*p.exterior,360);break;
 case 'ge-concave-area':close(p.area,polygonArea(q.graph.curves[0].points));break;
 case 'ge-chord-distance':close(p.half*p.half+p.d*p.d,p.radius*p.radius);close(p.chord,2*p.half);break;
 case 'ge-point-power':close(p.power,p.a*p.b);assert(p.b>p.a);break;
 case 'ge-intersecting-chords':close(p.a*p.b,p.c*p.d);break;
 case 'ge-circular-segment':close(p.area,Math.PI*p.radius*p.radius/4-p.radius*p.radius*Math.sin(Math.PI/2)/2);break;
 case 'ge-inverse-area-scale':close(p.ratio*p.ratio,p.b*p.b/(p.a*p.a));break;
 case 'ge-parallel-area':close(p.area,polygonArea(q.graph.curves[0].points));close(p.smallArea,p.area*p.u*p.u/(p.v*p.v));close(p.remainingArea+p.smallArea,p.area);break;
 case 'ge-shadow':close(p.height/p.treeShadow,p.stick/p.shadow);break;
 case 'ge-homothety':close(p.X-p.h,p.scale*(p.x-p.h));close(p.Y-p.k,p.scale*(p.y-p.k));break;
 case 'so-corner-cut':close(p.volume,p.a**3-p.b**3);close(p.surface,6*p.a*p.a-3*p.b*p.b+3*p.b*p.b);break;
 case 'so-central-section':{const pts=[[0,p.a/2,p.a],[p.a/2,0,p.a],[p.a,0,p.a/2],[p.a,p.a/2,0],[p.a/2,p.a,0],[0,p.a,p.a/2]];for(let i=0;i<6;i++){close(pts[i].reduce((a,b)=>a+b),3*p.a/2);close(norm(sub(pts[i],pts[(i+1)%6])),p.side);}close(p.area,6*p.side*p.side*Math.sqrt(3)/4);break;}
 case 'so-surface-path':close(p.distance,Math.hypot(2*p.a,p.a));close(p.space,norm([p.a,p.a,p.a]));break;
 case 'so-scale-dimensions':close(p.volume,(p.a*p.k)**3);close(p.surface,6*(p.a*p.k)**2);break;
 case 'so-water-level':close(p.a*p.b*p.level+p.overflow,p.a*p.b*p.initial+p.inserted);assert(p.level<=p.h);boundary.add('overflow-'+(p.overflow>0));break;
 case 'so-box-surface-path':close(p.distance,Math.sqrt(p.a*p.a+p.b*p.b+p.h*p.h+2*Math.min(p.a*p.b,p.a*p.h,p.b*p.h)));break;
 case 'so-cube-packing':close(p.count,Math.floor(p.a/p.unit)*Math.floor(p.b/p.unit)*Math.floor(p.h/p.unit));close(p.remainder+p.count*p.unit**3,p.a*p.b*p.h);break;
 case 'so-diagonal-angle':close(p.diagonal,norm([p.a,p.b,p.h]));close(Math.sin(p.angle*Math.PI/180),p.h/p.diagonal);break;
 case 'so-triangular-prism':close(p.baseArea,3*p.k*4*p.k/2);close(p.volume,p.baseArea*p.h);close(p.surface,2*p.baseArea+12*p.k*p.h);break;
 case 'so-hexagonal-prism':close(p.baseArea,6*(p.a*Math.sqrt(3)/2)*p.a/2);close(p.volume,p.baseArea*p.h);break;
 case 'so-oblique-height':close(p.volume,integral(()=>p.B,0,p.h));close(p.edge,Math.hypot(p.h,p.shift));break;
 case 'so-joined-prisms':close(p.volume,p.a*p.b*p.h+p.c*p.b*p.h);close(p.surface,2*(p.a*p.b+p.a*p.h+p.b*p.h)+2*(p.c*p.b+p.c*p.h+p.b*p.h)-2*p.b*p.h);break;
 case 'so-square-frustum':close(p.volume,integral(z=>(p.a+(p.b-p.a)*z/p.h)**2,0,p.h));close(p.slant,Math.hypot(p.h,(p.a-p.b)/2));close(p.lateral,4*(p.a+p.b)*p.slant/2);break;
 case 'so-parallel-section':close(p.smallVolume,integral(z=>(p.a*z/p.h)**2,0,p.h*p.k));close(p.sectionArea,(p.a*p.k)**2);break;
 case 'so-slant-vs-height':close(p.h*p.h+(p.a/2)**2,p.l*p.l);close(p.volume,p.a*p.a*p.h/3);break;
 case 'so-tetrahedron':close(p.h*p.h+p.a*p.a/3,p.a*p.a);close(p.volume,p.a*p.a*Math.sqrt(3)/4*p.h/3);close(p.surface,4*p.a*p.a*Math.sqrt(3)/4);break;
 case 'so-axial-cylinder':close(p.sectionArea,2*p.radius*p.h);close(p.diagonal,Math.hypot(2*p.radius,p.h));close(p.volume,Math.PI*p.radius*p.radius*p.h);break;
 case 'so-cylindrical-shell':close(p.volume,integral(()=>Math.PI*(p.outer*p.outer-p.inner*p.inner),0,p.h));close(p.surface,2*Math.PI*p.outer*p.h+2*Math.PI*p.inner*p.h+2*Math.PI*(p.outer*p.outer-p.inner*p.inner));break;
 case 'so-rolled-sheet':close(p.V1,Math.PI*(p.a/(2*Math.PI))**2*p.b);close(p.V2,Math.PI*(p.b/(2*Math.PI))**2*p.a);close(p.ratio,p.V1/p.V2);break;
 case 'so-optimal-cylinder':close(p.volume,Math.PI*p.radius*p.radius*p.optimalHeight);{const S=r=>2*Math.PI*r*r+2*p.volume/r;close(S(p.radius),p.optimalSurface);assert(S(p.radius*.9)>p.optimalSurface&&S(p.radius*1.1)>p.optimalSurface);}break;
 case 'so-cone-frustum':close(p.volume,integral(z=>Math.PI*(p.outer+(p.inner-p.outer)*z/p.h)**2,0,p.h));close(p.slant,Math.hypot(p.h,p.outer-p.inner));break;
 case 'so-cone-net':close(p.theta/360*2*Math.PI*p.l,2*Math.PI*p.radius);close(p.l,Math.hypot(p.radius,p.h));break;
 case 'so-cone-cut-volume':close(p.smallVolume,integral(z=>Math.PI*(p.radius*z/p.h)**2,0,p.h*p.k));close(p.remaining+p.smallVolume,p.volume);break;
 case 'so-inscribed-sphere':close(p.rho,p.radius*p.h/(p.radius+p.l));close((p.h-p.rho)*p.radius/p.l,p.rho);break;
 case 'so-spherical-cap':close(p.rho*p.rho+p.d*p.d,p.radius*p.radius);close(p.volume,integral(z=>Math.PI*(p.radius*p.radius-z*z),p.d,p.radius));close(p.curvedArea,2*Math.PI*p.radius*p.h);break;
 case 'so-spherical-zone':close(p.height,p.z2-p.z1);close(p.area,integral(()=>2*Math.PI*p.radius,p.z1,p.z2));break;
 case 'so-napkin-ring':close(p.hole*p.hole+p.half*p.half,p.radius*p.radius);close(p.volume,integral(z=>Math.PI*(p.radius*p.radius-z*z-p.hole*p.hole),-p.half,p.half));break;
 case 'so-sphere-cube':close(norm([p.a/2,p.a/2,p.a/2]),p.radius);close(p.volume,p.a**3);close(p.surface,6*p.a*p.a);break;
 case 'an-oriented-area':close(p.determinant,(p.B[0]-p.A[0])*(p.C[1]-p.A[1])-(p.C[0]-p.A[0])*(p.B[1]-p.A[1]));close(p.area,polygonArea([p.A,p.B,p.C]));break;
 case 'an-external-division':close(norm(sub(p.P,p.A))/norm(sub(p.P,p.B)),p.m);break;
 case 'an-centroid':p.centroid.forEach((x,i)=>close(x,(p.A[i]+p.B[i]+p.C[i])/3));close(norm(sub(p.centroid,p.A))/norm(sub(p.M,p.centroid)),2);break;
 case 'an-bisector-locus':for(const y of [-7,0,8])close(norm(sub([p.h,y],p.A)),norm(sub([p.h,y],p.B)));break;
 case 'an-foot-reflection':close(p.a*p.H[0]+p.b*p.H[1]+p.c,0);close(dot(sub(p.P,p.H),[-p.b,p.a]),0);close(norm(sub(p.P,p.H)),p.distance);p.image.forEach((x,i)=>close((x+p.P[i])/2,p.H[i]));break;
 case 'an-line-angle':close(p.cos,Math.abs(dot(p.u,p.v))/(norm(p.u)*norm(p.v)));boundary.add('parallel-'+p.parallel);boundary.add('perpendicular-'+p.perpendicular);break;
 case 'an-line-pencil':close(p.a-p.a/p.b*p.b,0);break;
 case 'an-parallel-strip':close(p.width,Math.abs(p.offset)/norm([p.a,p.b]));close(p.area,p.width*p.length);break;
 case 'an-line-circle':close(p.delta,p.radius*p.radius-(p.y-p.k)**2);boundary.add('circle-line-'+p.count);break;
 case 'an-radical-axis':close(p.x*p.x-p.r1*p.r1,(p.x-p.d)**2-p.r2*p.r2);break;
 case 'an-three-point-circle':for(const point of [p.A,p.B,p.C])close(dot(sub(point,p.center),sub(point,p.center)),p.r2);break;
 case 'an-circle-position':assert(p.r1>p.r2);boundary.add('circle-circle-'+p.count);close(p.count,p.d>p.r1+p.r2||p.d<p.r1-p.r2?0:p.d===p.r1+p.r2||p.d===p.r1-p.r2?1:2);break;
 case 'an-shifted-parabola':for(const point of q.graph.curves[0].points){close((point[1]-p.k)**2,4*p.p*(point[0]-p.h));close(norm(sub(point,p.focus)),Math.abs(point[0]-p.directrix));}break;
 case 'an-vertical-tangent':close(p.x*p.x,4*p.p*p.y);close(p.slope,p.x/(2*p.p));break;
 case 'an-latus-rectum':for(const point of [p.A,p.B])close(point[1]**2,4*p.p*point[0]);close(norm(sub(p.A,p.B)),p.length);break;
 case 'an-parabola-line':close(p.D,p.m*p.m+4*p.a*p.b);assert(q.text.includes(c.GeometryExercises.fraction(Math.round(p.b*4*p.a),4*p.a)));if(p.b===-p.m*p.m/(4*p.a))assert.equal(p.count,1);boundary.add('parabola-line-'+p.count);break;
 case 'an-translated-ellipse':close(p.c*p.c+p.b*p.b,p.a*p.a);close(p.area,polygonArea(q.graph.curves[0].points),.0002);close(p.e,p.c/p.a);break;
 case 'an-ellipse-tangent':close((p.x/p.a)**2+(p.y/p.b)**2,1);close(p.slope,-p.b*p.b*p.x/(p.a*p.a*p.y));break;
 case 'an-ellipse-chord':close((p.half/p.a)**2+(p.y/p.b)**2,1);close(p.length,2*p.half);break;
 case 'an-ellipse-from-foci':close(p.b2+p.c*p.c,p.a*p.a);assert(p.a>p.c);break;
 case 'an-translated-hyperbola':close(p.c*p.c,p.a*p.a+p.b*p.b);for(const curve of q.graph.curves.slice(0,2))for(const[x,y]of curve.points)close(((x-p.h)/p.a)**2-((y-p.k)/p.b)**2,1);break;
 case 'an-hyperbola-tangent':close((p.x/p.a)**2-(p.y/p.b)**2,1);close(p.slope,p.b*p.b*p.x/(p.a*p.a*p.y));assert(q.text.includes(`${5*p.a}/3,${4*p.b}/3`));break;
 case 'an-conjugate-hyperbola':close(1/p.e1**2+1/p.e2**2,1);break;
 case 'an-asymptote-parallel':close((p.x/p.a)**2-(p.y/p.b)**2,1);close(p.y,p.b*p.x/p.a+p.c);break;
 case 'an-pivot-rotation':close(norm(sub(p.P,[p.h,p.k])),norm(sub(p.image,[p.h,p.k])));close(dot(sub(p.P,[p.h,p.k]),sub(p.image,[p.h,p.k])),0);break;
 case 'an-reflection-map':close(p.a*(p.P[0]+p.image[0])/2+p.b*(p.P[1]+p.image[1])/2+p.c,0);close(dot(sub(p.image,p.P),[-p.b,p.a]),0);break;
 case 'an-rotated-conic':for(const[x,y]of q.graph.curves[0].points)close(p.A*x*x+p.B*x*y+p.A*y*y,p.rhs);close(p.area,polygonArea(q.graph.curves[0].points),.0002);break;
 case 'an-apollonius-circle':for(const t of [0,.7,2.4]){const point=[p.center+p.radius*Math.cos(t),p.radius*Math.sin(t)];close(norm(point)/norm(sub(point,[p.d,0])),p.q);}break;
 case 'an-line-plane':close(dot(p.normal,p.point)+p.constant,0);p.point.forEach((x,i)=>close(x,p.P[i]+p.t0*p.u[i]));close(p.residual+p.den*p.t0,0);break;
 case 'an-plane-angle':close(dot(p.dir,p.u),0);close(dot(p.dir,p.v),0);boundary.add('coincident-planes-'+(norm(p.dir)===0));break;
 case 'an-skew-distance':{const A=[p.t,0,p.t],B=[0,p.s,p.h+p.s],w=sub(B,A);close(dot(w,p.u),0);close(dot(w,p.v),0);close(norm(w),p.distance);break;}
 case 'an-sphere-plane':close(p.rho*p.rho+p.offset*p.offset,p.radius*p.radius);close(p.center[2],p.plane);break;
 default:throw Error('Missing independent checker: '+id);
 }
}
assert.equal(c.GeometryExercises.models.size,84);
for(const model of c.GeometryExercises.models.values())for(let seed=0;seed<50;seed++)for(let index=0;index<2;index++){
 const selection={program:model.program,topic:model.topic,subtopic:model.id},q=c.UniversityQuestions.generate('Matematik',seed,index,selection);
 assert.equal(q.modelId,model.id);assert.equal(q.supportsChoices,false);assert.equal(q.subtopicId,model.id);assert(q.text.length>30&&q.solution.length>15&&q.english.text.length>30&&q.english.solution.length>15,q.template+' '+JSON.stringify([q.text,q.solution,q.english.text,q.english.solution]));assert(!/undefined|NaN|Infinity/.test(q.text+q.solution+(q.solutionDiagram||'')));
 assert.equal(q.english.solution,index?q.enExplanation:q.enSolution+' '+q.enExplanation);if(index)assert.equal(q.solution,q.explanation);
 assert.deepEqual(plain(q),plain(c.UniversityQuestions.generate('Matematik',seed,index,selection)));assert(q.difficulty.score>=1&&q.difficulty.score<=5);
 if(q.graph){assert(q.solutionDiagram.includes('question-graph'));assert(q.english.solutionDiagram.includes(q.graph.title.en));}
 verify(q);seen.add(q.template);types.add(q.responseType);questions++;
}
for(const[program,count]of [['geometry',54],['solid-geometry',63],['analytic-geometry',72]]){
 const bank=c.UniversityQuestions.bankFor(program);assert.equal(bank.catalog.reduce((n,t)=>n+t.subs.length,0),count);
 for(const topic of bank.catalog){
  for(let i=0;i<topic.subs.length*2;i++){
   const q=bank.generate('Matematik',7,i,{program,topic:topic.id,subtopic:'mixed'});assert.equal(q.subtopicId,topic.subs[i%topic.subs.length][0]);
   const general=bank.generate('Matematik',7,i*bank.catalog.length+bank.catalog.indexOf(topic),{program,topic:'general',subtopic:'mixed'});assert.equal(general.subtopicId,q.subtopicId);
  }
  const group=c.GraphQuestions.registry.get(program+':'+topic.id);assert.equal(group.length,1);
  for(let seed=0;seed<30;seed++){
   const q=bank.generate('Matematik',seed,0,{program,topic:topic.id,subtopic:'graph-'+program+'-'+topic.id});assert.equal(q.questionType,'graph');assert(q.diagram.includes('question-graph'));assert(q.graph.curves.length);verify(q);questions++;
   if(q.graph.axes===false){assert(!q.diagram.match(/class="graph-axes"[^>]*><path/));assert(!q.diagram.match(/class="graph-ticks"[^>]*><text/));}
  }
 }
}
for(const type of ['expression','reasoning','proof','drawing'])assert(types.has(type));assert.equal(seen.size,168);
for(const x of ['overflow-true','overflow-false','circle-line-0','circle-line-1','circle-line-2','parabola-line-0','parabola-line-1','parabola-line-2','circle-circle-0','circle-circle-1','circle-circle-2','coincident-planes-true','coincident-planes-false'])assert(boundary.has(x),x);
console.log(`PASS expanded geometry: ${questions} generated questions, 168 open-ended variants + 21 given-diagram templates, ${checks} independent numerical checks; bilingual solutions, original/mixed routing, degeneracies and persisted graph data.`);
