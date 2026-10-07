const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const{chromium}=require(process.env.FORMA_PLAYWRIGHT||'playwright');
const root=path.join(__dirname,'app/src/main/assets/web'),output=path.join(__dirname,'../build/graph-ui-checks');fs.mkdirSync(output,{recursive:true});
const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+(req.url==='/'?'/index.html':req.url.split('?')[0]));if(!file.startsWith(root+path.sep))return res.writeHead(403).end();fs.readFile(file,(err,data)=>{if(err)return res.writeHead(404).end();res.setHeader('Content-Type',({'.html':'text/html','.js':'application/javascript','.css':'text/css','.ttf':'font/ttf','.woff2':'font/woff2'})[path.extname(file)]||'application/octet-stream');res.end(data);});});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{browser=await chromium.launch({headless:true,channel:'chrome'});const page=await browser.newPage({viewport:{width:412,height:915},hasTouch:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>localStorage.setItem('forma-tutorial-v1','done'));await page.goto(`http://127.0.0.1:${server.address().port}`);let flows=0;
 for(const program of ['general-math-1','general-math-2']){
  await page.locator(`[data-university-program="${program}"]`).click();
  const topics=await page.evaluate(program=>UniversityQuestions.bankFor(program).catalog.filter(t=>GraphQuestions.registry.has(program+':'+t.id)).map(t=>({id:t.id,count:GraphQuestions.registry.get(program+':'+t.id).length})),program);
  for(const topic of topics){await page.locator(`[data-university-topic="${topic.id}"]`).click();await page.locator(`[data-university-subtopic="graph-${program}-${topic.id}"]`).click();await page.locator('#start').click();
   for(let index=0;index<topic.count;index++){
    if(index)await page.locator('#next').click();
    const q=await page.evaluate(()=>activeQuestion);assert.equal(q.questionType,'graph');assert.equal(q.index,index);
    assert(await page.locator('#question-diagram .question-graph').isVisible());assert(await page.locator('#solution').isHidden());
    assert((await page.locator('#question-diagram').getAttribute('class')).includes('has-question-graph'));
    await page.evaluate(()=>{settings.questionMode='multiple';renderQuestionContent(true);});assert(await page.locator('#answers').isHidden());
    const styles=await page.evaluate(()=>{const svg=document.querySelector('.question-graph');return{width:svg.getBoundingClientRect().width,container:document.querySelector('#question-diagram').getBoundingClientRect().width,text:[...svg.querySelectorAll('text')].every(t=>getComputedStyle(t).stroke==='none'),grid:[...svg.querySelectorAll('.graph-grid path')].every(p=>getComputedStyle(p).fill==='none'),secondary:[...svg.querySelectorAll('.graph-secondary')].every(p=>getComputedStyle(p).stroke===getComputedStyle(svg.querySelector('.graph-axes path')).stroke),overflow:document.documentElement.scrollWidth>innerWidth+1};});
    assert(styles.width>200&&styles.width<=styles.container+1);assert(styles.text&&styles.grid&&styles.secondary&&!styles.overflow);
    await page.evaluate(()=>{settings.language='en';applyLanguage();});assert.equal(await page.locator('.question-graph-figure figcaption').innerText(),q.graph.title.en);
    await page.locator('#solution-toggle').click();assert((await page.locator('#solution').innerText()).length>30);
    await page.evaluate(()=>{settings.language='tr';applyLanguage();});await page.locator('#solution-toggle').click();
    if(['graph-removable-limit','graph-rose-petals','graph-gradient-contours','graph-convergence-interval'].includes(q.template))await page.locator('.question-panel').screenshot({path:path.join(output,q.template+'-mobile.png')});
    flows++;
   }await page.locator('#workspace-back').click();
  }
 }
 await page.locator('[data-university-topic="parametric-polar"]').click();await page.locator('[data-university-subtopic="graph-general-math-2-parametric-polar"]').click();await page.locator('#start').click();await page.locator('#next').click();await page.locator('#next').click();
 const original=await page.evaluate(()=>JSON.parse(JSON.stringify({id:activeQuestion.id,graph:activeQuestion.graph,diagram:activeQuestion.diagram}))); 
 await page.locator('#save-work').click();await page.locator('#workspace-notes').click();await page.reload();await page.locator('#notes-nav').click();await page.locator('.saved-note').first().click();
 assert.deepEqual(await page.evaluate(()=>({id:activeQuestion.id,graph:activeQuestion.graph,diagram:activeQuestion.diagram})),original);assert(await page.locator('.question-graph').isVisible());assert(await page.locator('#solution').isHidden());
 await page.setViewportSize({width:1024,height:768});await page.evaluate(()=>{settings.language='en';applyLanguage();});assert.equal(await page.locator('figcaption').innerText(),original.graph.title.en);
 await page.locator('.question-panel').screenshot({path:path.join(output,'saved-graph-tablet-en.png')});
 await page.evaluate(()=>{document.documentElement.style.setProperty('--paper','#17212b');document.documentElement.style.setProperty('--ink','#e2edf8');document.documentElement.style.setProperty('--accent','#9ebd83');});
 assert(await page.evaluate(()=>[...document.querySelectorAll('.question-graph text')].every(t=>getComputedStyle(t).fill==='rgb(226, 237, 248)')));
 await page.locator('.question-panel').screenshot({path:path.join(output,'saved-graph-tablet-dark.png')});assert.deepEqual(errors,[]);
 console.log(`PASS graph UI: ${flows} templates, graphs visible before solutions, bilingual labels, mobile/tablet layout, styles, open-ended behavior and saved graph restoration.`);
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
