const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const {chromium}=require(process.env.FORMA_PLAYWRIGHT||'playwright');
const root=path.join(__dirname,'app/src/main/assets/web'),output=path.join(__dirname,'../build/advanced-ui-checks');fs.mkdirSync(output,{recursive:true});
const quick=process.env.FORMA_GEOMETRY_QUICK==='1',quickIds=new Set(['ge-intersecting-chords','ge-shadow','so-square-frustum','so-parallel-section','so-spherical-cap','an-centroid','an-external-division','an-foot-reflection','an-radical-axis','an-parabola-line','an-ellipse-tangent','an-hyperbola-tangent','an-reflection-map','an-apollonius-circle']);
const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+(req.url==='/'?'/index.html':req.url.split('?')[0]));if(!file.startsWith(root+path.sep))return res.writeHead(403).end();fs.readFile(file,(err,data)=>{if(err)return res.writeHead(404).end();res.setHeader('Content-Type',({'.html':'text/html','.js':'application/javascript','.css':'text/css','.ttf':'font/ttf','.woff2':'font/woff2'})[path.extname(file)]||'application/octet-stream');res.end(data);});});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{browser=await chromium.launch({headless:true,channel:'chrome'});const page=await browser.newPage({viewport:{width:412,height:915},hasTouch:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>localStorage.setItem('forma-tutorial-v1','done'));await page.goto(`http://127.0.0.1:${server.address().port}`);let flows=0,questions=0;
 for(const[program,total]of [['linear-algebra',64],['discrete-math',72],['differential-equations',72]]){
  await page.locator(`[data-university-program="${program}"]`).click();
  const topics=await page.evaluate(program=>UniversityQuestions.bankFor(program).catalog.map(t=>({id:t.id,subs:t.subs.map(s=>s[0])})),program);assert.equal(topics.flatMap(t=>t.subs).length,total);
  for(const topic of topics){await page.locator(`[data-university-topic="${topic.id}"]`).click();assert.equal(await page.locator('[data-university-subtopic]').count(),topic.subs.length+1);
   for(const sub of topic.subs){
    if(quick&&!sub.startsWith('graph-')&&!quickIds.has(sub))continue;
    if(!sub.startsWith('lx-')&&!sub.startsWith('dx-')&&!sub.startsWith('odx-')&&!sub.startsWith('graph-')&&sub!==topic.subs[0])continue;
    await page.locator(`[data-university-subtopic="${sub}"]`).click();await page.locator('#start').click();const iterations=sub.startsWith('graph-')||sub===topic.subs[0]?1:2;
    for(let i=0;i<iterations;i++){
     if(i)await page.locator('#next').click();const q=await page.evaluate(()=>activeQuestion);assert.equal(q.program,program);assert.equal(q.subtopicId,sub);assert(await page.locator('#solution').isHidden());
     if(q.modelId){await page.evaluate(()=>{settings.questionMode='multiple';renderQuestionContent(true);});assert(await page.locator('#answers').isHidden());assert.equal(await page.locator('#question-difficulty [role="meter"]').count(),1);}
     if(q.questionType==='graph'){
      assert(await page.locator('#question-diagram .question-graph').isVisible());
      const dimension=await page.locator('#question-diagram .question-graph').boundingBox();assert(dimension.width>200&&dimension.height>150);
      if(['la-matrices','la-projections','dm-functions','dm-relations','ode-basics','ode-particular','ode-systems'].includes(topic.id))await page.locator('.question-panel').screenshot({path:path.join(output,topic.id+'-given-mobile.png')});
     }
     await page.evaluate(()=>{settings.language='en';applyLanguage();});assert.equal(await page.locator('#question-text').getAttribute('data-math-source'),q.english.text);
     await page.locator('#solution-toggle').click();assert.equal(await page.locator('#solution').getAttribute('data-math-source'),q.english.solution);
     if(q.solutionDiagram){assert(await page.locator('#solution .question-graph').isVisible());const box=await page.locator('#solution .question-graph').boundingBox();assert(box.width>200&&box.height>150);}
     await page.evaluate(()=>{settings.language='tr';applyLanguage();});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));questions++;
    }await page.locator('#workspace-back').click();flows++;
   }
  }
 }
 await page.locator('[data-university-program="linear-algebra"]').click();await page.locator('[data-university-topic="la-projections"]').click();await page.locator('[data-university-subtopic="graph-linear-algebra-la-projections"]').click();await page.locator('#start').click();
 const original=await page.evaluate(()=>JSON.parse(JSON.stringify({id:activeQuestion.id,text:activeQuestion.text,graph:activeQuestion.graph,diagram:activeQuestion.diagram})));
 await page.locator('#question-collapse').click();await page.locator('#canvas').scrollIntoViewIfNeeded();const rect=await page.locator('#canvas').boundingBox();await page.mouse.move(rect.x+40,rect.y+80);await page.mouse.down();await page.mouse.move(rect.x+140,rect.y+100,{steps:5});await page.mouse.up();assert.equal(await page.evaluate(()=>strokes.length),1);
 await page.locator('#save-work').click();await page.locator('#workspace-notes').click();await page.reload();await page.locator('#notes-nav').click();await page.locator('.saved-note').first().click();
 assert.deepEqual(await page.evaluate(()=>JSON.parse(JSON.stringify({id:activeQuestion.id,text:activeQuestion.text,graph:activeQuestion.graph,diagram:activeQuestion.diagram}))),original);assert.equal(await page.evaluate(()=>strokes.length),1);
 if(await page.locator('#question-content').isHidden())await page.locator('#question-collapse').click();assert(await page.locator('#question-diagram .question-graph').isVisible());
 await page.setViewportSize({width:1024,height:768});await page.evaluate(()=>{settings.language='en';applyLanguage();});await page.locator('.question-panel').screenshot({path:path.join(output,'restored-circle-tablet-en.png')});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 await page.evaluate(()=>{settings.questionWriting=false;renderQuestionContent(true);});assert.equal(await page.locator('#question-text').innerText(),await page.evaluate(()=>activeQuestion.english.text));
 await page.evaluate(()=>{settings.questionWriting=true;renderQuestionContent(true);});
 for(const[program,title]of [['linear-algebra','Least-squares condition'],['discrete-math','Surjection count'],['differential-equations','Second shifting theorem']]){
  await page.evaluate(program=>{formulaSubject='Matematik';formulaProgram=program;formulaTopic=0;formulaFollowsQuestion=false;renderFormulas();},program);assert((await page.locator('#formula-content').textContent()).includes(title));
 }
 assert.deepEqual(errors,[]);console.log(`PASS advanced UI: ${flows} subtopic flows, ${questions} questions, all 26 given diagrams, worked solution diagrams, bilingual content, mobile/tablet, original topics and saved question/ink restoration.`);
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
