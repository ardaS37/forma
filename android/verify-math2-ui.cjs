const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const {chromium}=require(process.env.FORMA_PLAYWRIGHT||'playwright');
const root=path.join(__dirname,'app/src/main/assets/web'),output=path.join(__dirname,'../build/math2-ui-checks');
fs.mkdirSync(output,{recursive:true});
const server=http.createServer((req,res)=>{
 const file=path.resolve(root,'.'+(req.url==='/'?'/index.html':req.url.split('?')[0]));
 if(!file.startsWith(root+path.sep))return res.writeHead(403).end();
 fs.readFile(file,(error,data)=>{if(error)return res.writeHead(404).end();res.setHeader('Content-Type',({'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.woff2':'font/woff2','.ttf':'font/ttf'})[path.extname(file)]||'application/octet-stream');res.end(data);});
});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));let browser;
 try{
  browser=await chromium.launch({headless:true,channel:'chrome'});
  const page=await browser.newPage({viewport:{width:412,height:915},hasTouch:true}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>localStorage.setItem('forma-tutorial-v1','done'));
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  await page.locator('[data-university-program="general-math-2"]').click();
  const catalog=await page.evaluate(()=>Math2Bank.catalog.map(t=>({id:t.id,subs:t.subs.map(s=>s[0])})));
  assert.equal(catalog.flatMap(t=>t.subs).length,90);
  let flows=0;
  for(const topic of catalog){
   await page.locator(`[data-university-topic="${topic.id}"]`).click();
   assert.equal(await page.locator('[data-university-subtopic]').count(),topic.subs.length+1);
   for(const sub of topic.subs){
    await page.locator(`[data-university-subtopic="${sub}"]`).click();
    await page.locator('#start').click();
    const q=await page.evaluate(()=>activeQuestion);
    assert.equal(q.program,'general-math-2');assert.equal(q.subtopicId,sub);
    assert.equal(await page.locator('#question-difficulty [role="meter"]').count(),1);
    await page.evaluate(()=>{settings.questionMode='multiple';renderQuestionContent(true);});
    if(q.template.startsWith('m2-')||q.questionType==='graph'){assert(await page.locator('#answers').isHidden());assert(await page.locator('#feedback').isHidden());}
    await page.locator('#solution-toggle').click();assert((await page.locator('#solution').innerText()).length>20);
    if(q.solutionDiagram)assert.equal(await page.locator('#solution .math2-reference-graph').count(),1);
    await page.locator('#workspace-back').click();flows++;
   }
  }
  await page.locator('[data-university-topic="parametric-polar"]').click();
  await page.locator('[data-university-subtopic="m2-polar-rose"]').click();
  await page.locator('#start').click();await page.locator('#next').click();
  assert.equal(await page.evaluate(()=>activeQuestion.responseType),'drawing');
  await page.locator('#solution-toggle').click();
  assert.equal(await page.locator('#solution .math2-reference-graph').count(),1);
  await page.waitForTimeout(250);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.screenshot({path:path.join(output,'polar-rose-mobile.png'),fullPage:true});
  const original=await page.evaluate(()=>({id:activeQuestion.id,text:activeQuestion.text,solution:activeQuestion.solution,diagram:activeQuestion.solutionDiagram}));
  await page.locator('#question-collapse').click();
  await page.locator('#canvas').scrollIntoViewIfNeeded();
  const rect=await page.locator('#canvas').boundingBox();
  await page.mouse.move(rect.x+40,rect.y+100);await page.mouse.down();await page.mouse.move(rect.x+150,rect.y+120,{steps:5});await page.mouse.up();
  assert.equal(await page.evaluate(()=>strokes.length),1,'test stroke must be drawn before saving');
  await page.locator('#save-work').click();await page.locator('#workspace-notes').click();
  assert.equal(await page.locator('.saved-note').count(),1);
  await page.reload();await page.locator('#notes-nav').click();await page.locator('.saved-note').first().click();
  const restored=await page.evaluate(()=>({id:activeQuestion.id,text:activeQuestion.text,solution:activeQuestion.solution,diagram:activeQuestion.solutionDiagram}));
  assert.deepEqual(restored,original);assert.equal(await page.evaluate(()=>strokes.length),1);
  if(await page.locator('#question-content').isHidden())await page.locator('#question-collapse').click();
  await page.evaluate(()=>{settings.language='en';applyLanguage();});
  assert((await page.locator('#question-difficulty').innerText()).includes('Difficulty'));
  assert((await page.locator('#question-text').innerText()).includes('petal'));
  await page.locator('#solution-toggle').click();
  assert((await page.locator('#solution').innerText()).includes('petal'));
  await page.setViewportSize({width:1024,height:768});await page.waitForTimeout(250);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.screenshot({path:path.join(output,'polar-rose-tablet-en.png'),fullPage:true});
  await page.evaluate(()=>{formulaSubject='Matematik';formulaProgram='general-math-2';formulaTopic=0;formulaFollowsQuestion=false;renderFormulas();});
  await page.locator('#formula-toggle').click();
  assert((await page.locator('#formula-content').innerText()).includes('half-angle'));
  await page.locator('#workspace-back').click();
  await page.locator('[data-university-topic="multivariable"]').click();
  await page.locator('[data-university-subtopic="m2-lagrange"]').click();
  assert((await page.locator('[data-university-subtopic="m2-lagrange"]').innerText()).includes('Lagrange'));
  await page.locator('#start').click();await page.locator('#solution-toggle').click();
  await page.waitForTimeout(250);await page.screenshot({path:path.join(output,'lagrange-tablet-en.png'),fullPage:true});
  assert.deepEqual(errors,[]);
  console.log('PASS Mathematics 2 UI:',flows,'subtopic flows, open-ended behavior, SVG solutions, mobile/tablet, English, formulas and saved session/ink restoration.');
 }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
