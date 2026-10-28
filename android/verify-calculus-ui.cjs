const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require(process.env.FORMA_PLAYWRIGHT||'playwright');
const root=path.join(__dirname,'app/src/main/assets/web'),output=path.join(__dirname,'../build/turev-ui');fs.mkdirSync(output,{recursive:true});
const server=http.createServer((req,res)=>{
  const file=path.resolve(root,'.'+(req.url==='/'?'/index.html':decodeURI(req.url.split('?')[0])));if(!file.startsWith(root+path.sep))return res.writeHead(403).end();
  fs.readFile(file,(e,b)=>{if(e)return res.writeHead(404).end();res.setHeader('Content-Type',({'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.woff2':'font/woff2','.ttf':'font/ttf'})[path.extname(file)]||'application/octet-stream');res.end(b);});
});
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const browser=await chromium.launch({headless:true,channel:process.env.FORMA_CHROME_CHANNEL||undefined});
  const context=await browser.newContext({viewport:{width:1180,height:900}}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  try{
    await page.goto(`http://127.0.0.1:${server.address().port}`);await page.locator('#practice-menu').waitFor({state:'visible'});
    assert.equal(await page.title(),'Türev Al');assert.deepEqual(await page.locator('#practice-menu button').allTextContents(),['Limit','Türev','İntegral']);assert.equal(await page.locator('button:visible').count(),3);
    await page.screenshot({animations:'disabled',path:path.join(output,'menu-tablet.png')});
    const snapshots={};
    for(const mode of ['limits','derivatives','integrals']){
      await page.locator(`[data-practice-mode="${mode}"]`).click();await page.locator('#workspace').waitFor({state:'visible'});
      assert.equal(await page.evaluate(()=>activeQuestion.program),mode);assert.equal(await page.locator('#practice-screen-name').textContent(),({limits:'Limit Al',derivatives:'Türev Al',integrals:'İntegral Al'})[mode]);
      assert.equal(await page.locator('#derivative-topics-tool').textContent(),'');assert.equal(await page.locator('#derivative-topics-tool').getAttribute('class'),'tool');
      assert(await page.evaluate(()=>{const topic=getComputedStyle($('derivative-topics-tool')),ruler=getComputedStyle($('ruler-tool'));return topic.width===ruler.width&&topic.height===ruler.height&&topic.borderRadius===ruler.borderRadius;}));
      const start=await page.evaluate(()=>activeQuestion.id),r=await page.locator('#canvas').boundingBox();
      await page.mouse.move(r.x+60,r.y+160);await page.mouse.down();await page.mouse.move(r.x+160,r.y+190,{steps:10});await page.mouse.up();
      const ink=await page.evaluate(()=>structuredClone(strokes));assert(ink.length);
      await page.locator('#save-work').click();snapshots[mode]={id:start,ink};
      await page.locator('#derivative-topics-tool').click();
      const heading=await page.locator('#derivative-topics-title').textContent();assert(heading.toLocaleLowerCase('tr').includes(({limits:'limit',derivatives:'türev',integrals:'integral'})[mode]));
      assert.equal(await page.locator('#derivative-topic-list hr').count(),1);assert.equal(await page.locator('#derivative-topic-list h2,#derivative-topic-list h3').count(),0);
      assert(await page.locator('#derivative-topic-list').evaluate(list=>{const labels=[...list.children],split=labels.findIndex(x=>x.tagName==='HR');return split>0&&labels.slice(0,split).every(x=>x.dataset.level==='high-school')&&labels.slice(split+1).every(x=>x.dataset.level==='university');}));
      assert.equal(await page.locator('#derivative-topic-list input').count(),await page.evaluate(()=>practiceBank().topics.length));
      await page.locator('#derivative-topic-logarithm').uncheck();await page.locator('#derivative-topics-apply').click();
      assert(!(await page.evaluate(()=>universitySelection.topics)).includes('logarithm'));
      assert(await page.evaluate(()=>Array.from({length:250},(_,i)=>practiceBank().generate(939,i,universitySelection.topics)).every(q=>!q.requiredTopics.includes('logarithm')&&!/\bln\(/.test(q.eq))));
      await page.screenshot({animations:'disabled',path:path.join(output,mode+'-tablet.png')});
      await page.locator('#workspace-back').click();await page.locator('#practice-menu').waitFor({state:'visible'});assert.equal(await page.locator('button:visible').count(),3);
    }
    // Each mode restores its own selection, cursor and ink, including across a reload.
    await page.reload();await page.locator('#practice-menu').waitFor({state:'visible'});
    for(const mode of ['integrals','limits','derivatives']){
      await page.locator(`[data-practice-mode="${mode}"]`).click();assert.equal(await page.evaluate(()=>universitySelection.program),mode);
      assert(!(await page.evaluate(()=>universitySelection.topics)).includes('logarithm'));
      // Return to all topics to resume the original saved stream and ink.
      await page.locator('#derivative-topics-tool').click();await page.locator('#derivative-select-all').click();await page.locator('#derivative-topics-apply').click();
      assert.equal(await page.evaluate(()=>activeQuestion.id),snapshots[mode].id);assert.deepEqual(await page.evaluate(()=>strokes),snapshots[mode].ink);
      await page.locator('#workspace-back').click();
    }
    // Open an integral saved session while a limit stream is active.
    await page.locator('[data-practice-mode="limits"]').click();await page.locator('#workspace-notes').click();
    const integralKey=await page.evaluate(()=>Object.keys(database).find(k=>database[k].type==='session'&&database[k].question.program==='integrals'));
    await page.locator('.saved-note').evaluateAll((nodes,key)=>nodes.find(n=>n.dataset.key===key).click(),integralKey);
    assert.equal(await page.evaluate(()=>universitySelection.program),'integrals');assert.equal(await page.evaluate(()=>activeQuestion.id),snapshots.integrals.id);assert.deepEqual(await page.evaluate(()=>strokes),snapshots.integrals.ink);
    // Render every new family, then exercise its real next/previous flow.
    for(const mode of ['limits','integrals']){
      await page.locator('#workspace-back').click();await page.locator(`[data-practice-mode="${mode}"]`).click();
      const count=await page.evaluate(()=>practiceBank().templates.length);
      for(let i=0;i<count;i++){
        await page.evaluate(i=>{qi=i;activeQuestion=practiceBank().generate(177,i);renderQuestionContent();$('solution-toggle').click();},i);
        assert(await page.locator('#question-equation [role="math"]').count()>0,mode+' equation '+i);assert(await page.locator('#solution').isVisible());assert.equal(await page.locator('.ML__error').count(),0,mode+' math '+i);
      }
      await page.evaluate(()=>{selectGeneratedQuestion(0);loadQuestion();});const q=await page.evaluate(()=>structuredClone(activeQuestion));
      await page.locator('#next').click();await page.locator('#prev').click();assert.deepEqual(await page.evaluate(()=>activeQuestion),q);
      await page.locator('#derivative-topics-tool').click();await page.locator('#derivative-select-none').click();assert(await page.locator('#derivative-topics-apply').isDisabled());await page.locator('#derivative-topics-cancel').click();
    }
    await page.locator('#workspace-back').click();await page.setViewportSize({width:390,height:844});await page.screenshot({animations:'disabled',path:path.join(output,'menu-mobile.png')});
    assert.equal(await page.locator('button:visible').count(),3);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    for(const mode of ['limits','integrals']){
      await page.locator(`[data-practice-mode="${mode}"]`).click();await page.screenshot({animations:'disabled',path:path.join(output,mode+'-mobile.png'),fullPage:true});
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.locator('#derivative-topics-tool').click();
      await page.screenshot({animations:'disabled',path:path.join(output,mode+'-topics-mobile.png'),fullPage:true});await page.keyboard.press('Escape');
      await page.locator('#paper-settings').click();await page.locator('[data-language-choice="en"]').click();await page.locator('[data-theme-choice="dark"]').click();await page.locator('#settings-close').click();await page.locator('#settings-modal').waitFor({state:'hidden'});
      await page.locator('#derivative-topics-tool').click();assert((await page.locator('#derivative-topics-title').textContent()).startsWith('Which '));await page.keyboard.press('Escape');
      await page.locator('#workspace-back').click();
    }
    assert.equal(await page.title(),'Türev Al');assert.equal(await page.locator('button:visible').count(),3);assert.deepEqual(errors,[]);
    console.log('PASS: three-button menu; independent mode filters, sessions and ink; 156 limit/integral templates; next/previous, saved cross-mode restore, reload, empty filters, mobile/tablet, language and theme.');
  }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
