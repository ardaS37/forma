/* Shared open-ended question pipeline for plane, solid and analytic geometry. */
(() => {
const models=new Map(),installed=new Set(),G=QuestionGraphs;
const number=x=>Number(x.toPrecision(7)).toString();
function fraction(a,b=1){if(b<0){a=-a;b=-b;}const gcd=(x,y)=>y?gcd(y,x%y):Math.abs(x),g=gcd(a,b);return b/g===1?String(a/g):`${a/g}/${b/g}`;}
const graph=(bounds,tr,en,extra={})=>({version:1,bounds,title:{tr,en},...extra});
const loop=points=>[...points,points[0]];
function shape(points,tr,en,extra={}){
 const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]),pad=Math.max(1,(Math.max(...xs)-Math.min(...xs))/6,(Math.max(...ys)-Math.min(...ys))/6);
 return graph([Math.min(...xs)-pad,Math.max(...xs)+pad,Math.min(...ys)-pad,Math.max(...ys)+pad],tr,en,{axes:false,grid:false,ticks:false,curves:[{points:loop(points)}],points:points.map(([x,y])=>({x,y})),...extra});
}
const label=(x,y,text,extra={})=>({x,y,text,...extra});
const circle=(r,h=0,k=0)=>G.parametric(t=>[h+r*Math.cos(t),k+r*Math.sin(t)],0,2*Math.PI);
function result(parameters,given,enGiven,task,enTask,solution,enSolution,inquiry,enInquiry,explanation,enExplanation,extra={}){
 return {parameters,given,enGiven,task,enTask,solution,enSolution,inquiry,enInquiry,explanation,enExplanation,...extra};
}
function material(model,r,index,mode){
 const data=model.make(r),investigate=mode==='investigation',text=data.given+' '+(investigate?data.inquiry:data.task),en=data.enGiven+' '+(investigate?data.enInquiry:data.enTask);
 return {...data,text,english:{text:en,solution:investigate?data.enExplanation:data.enSolution+' '+data.enExplanation},solution:investigate?data.explanation:data.solution+' '+data.explanation,eq:data.eq||'',responseType:investigate?(data.investigationType||'reasoning'):'expression',level:model.level+(investigate?.3:0),workSteps:investigate?5:4};
}
function add(program,topic,id,tr,en,make,level=3){
 const bank=UniversityQuestions.bankFor(program),row=bank.catalog.find(t=>t.id===topic);if(!row)throw Error('Missing geometry topic '+topic);
 if(models.has(id))throw Error('Duplicate geometry exercise '+id);
 row.subs.push([id,tr]);translations[tr]=en;const model={program,topic,id,make,level};models.set(id,model);
 if(installed.has(program))return;
 installed.add(program);const previous=bank.generate,dispatch=UniversityQuestions.generate;
 bank.generate=(subject,seed,index,selection={program,topic:'general',subtopic:'mixed'},count=4)=>{
  if(subject!=='Matematik'||!Number.isSafeInteger(index)||index<0)throw Error('Invalid geometry question request');
  const general=selection.topic==='general',row=general?bank.catalog[index%bank.catalog.length]:bank.catalog.find(t=>t.id===selection.topic);
  if(!row)return previous(subject,seed,index,selection,count);
  const position=general?Math.floor(index/bank.catalog.length):index,mixed=general||selection.subtopic==='mixed',sub=mixed?row.subs[position%row.subs.length][0]:selection.subtopic,model=models.get(sub);
  if(!model||model.program!==program||model.topic!==row.id)return previous(subject,seed,index,selection,count);
  const ordinal=mixed?Math.floor(position/row.subs.length):index,mode=ordinal%2?'investigation':'calculation',random=QuestionEngine.seededRandom(seed,`${index}:${sub}:${mode}`),r={i:(a,b)=>a+Math.floor(random()*(b-a+1)),pick:a=>a[Math.floor(random()*a.length)]};
  const data=material(model,r,index,mode),id=`ge2-${program}-${seed>>>0}-${index}-${sub}-${mode}`;
  const q={...data,id,generatorVersion:2,program,subject,index,educationMode:'university',template:sub+'-'+mode,modelId:sub,topicId:row.id,subtopicId:sub,scope:{...selection},supportsChoices:false,choices:[],correct:null,answerUnit:'',diagram:'',difficultyProfile:{base:data.level,steps:data.workSteps,type:data.responseType}};
  if(data.graph){q.solutionDiagram=G.render(data.graph,'tr',id+'-solution');q.english.solutionDiagram=G.render(data.graph,'en',id+'-solution');}
  q.difficulty=QuestionDifficulty.estimate(q);return q;
 };
 UniversityQuestions.generate=(subject,seed,index,selection,count)=>selection?.program===program?bank.generate(subject,seed,index,selection,count):dispatch(subject,seed,index,selection,count);
}
function graphic(program,topic,ids,prompt={tr:'Şekilden okuduğunuz geometrik özelliklerle yönteminizi gerekçelendirin.',en:'Justify the method using geometric properties read from the figure.'}){
 ids.forEach(id=>{
  const model=models.get(id);if(!model)throw Error('Unknown geometry graph model '+id);
  GraphQuestions.register(program,topic,'diagram-'+id,r=>{
   const data=material(model,r,0,'calculation');if(!data.graph)throw Error('Missing given geometry diagram '+id);
   return {...data,modelId:id,text:data.given+' Verilen şekli/grafiği kullanın. '+data.task+' '+prompt.tr,english:{text:data.enGiven+' Use the given figure/graph. '+data.enTask+' '+prompt.en,solution:data.enSolution+' '+data.enExplanation},solution:data.solution};
  });
 });
}
// Perspective drawings use an explicit linear projection; displayed dimensions are spatial lengths.
function box(a,b,h,title={tr:'Prizma perspektif şeması',en:'Perspective prism diagram'}){
 const vertices=[[0,0,0],[a,0,0],[a,b,0],[0,b,0],[0,0,h],[a,0,h],[a,b,h],[0,b,h]],project=([x,y,z])=>[x+.45*y,z+.3*y],points=vertices.map(project),edges=[[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
 return shape(points,title.tr,title.en,{curves:edges.map(([i,j])=>({points:[points[i],points[j]],dashed:i===3||j===3})),points:[],labels:[label(a/2,0,'a='+a,{dy:17}),label(a+.45*b/2,.3*b/2,'b='+b,{dx:7}),label(0,h/2,'h='+h,{anchor:'end',dx:-5})],description:{tr:'Perspektif şema; uzaysal uzunluklar kenar etiketlerinde verilmiştir.',en:'Perspective schematic; spatial lengths are given by edge labels.'}});
}
globalThis.GeometryExercises={add,graphic,models,result,number,fraction,graph,shape,loop,label,circle,box};
globalThis.CourseExercises=globalThis.GeometryExercises;
})();
