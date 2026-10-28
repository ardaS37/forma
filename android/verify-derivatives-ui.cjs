const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require(process.env.FORMA_PLAYWRIGHT||'playwright');
const root=path.join(__dirname,'app/src/main/assets/web'),output=path.join(__dirname,'../build/turev-ui');
fs.mkdirSync(output,{recursive:true});
const server=http.createServer((req,res)=>{
  const file=path.resolve(root,'.'+(req.url==='/'?'/index.html':decodeURI(req.url.split('?')[0])));
  if(!file.startsWith(root+path.sep))return res.writeHead(403).end();
  fs.readFile(file,(e,b)=>{if(e)return res.writeHead(404).end();res.setHeader('Content-Type',({'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.woff2':'font/woff2','.ttf':'font/ttf'})[path.extname(file)]||'application/octet-stream');res.end(b);});
});
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const browser=await chromium.launch({headless:true,channel:process.env.FORMA_CHROME_CHANNEL||undefined});
  const context=await browser.newContext({viewport:{width:1180,height:900}}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  try{
    await page.goto(`http://127.0.0.1:${server.address().port}`);await page.locator('#workspace').waitFor({state:'visible'});
    assert.equal(await page.title(),'Türev Al');assert.equal(await page.locator('#home').isVisible(),false);
    assert.equal(await page.locator('#simulations-tool').count(),0);assert.equal(await page.locator('#simulations-catalog').count(),0);
    assert.equal(await page.locator('#workspace-back').isVisible(),false);assert.equal(await page.locator('#answers').isVisible(),false);
    await page.screenshot({path:path.join(output,'tablet.png')});
    const first=await page.evaluate(()=>structuredClone(activeQuestion));
    await page.locator('#solution-toggle').click();assert(await page.locator('#solution').isVisible());
    await page.locator('#next').click();await page.locator('#prev').click();assert.deepEqual(await page.evaluate(()=>activeQuestion),first);
    // Draw real canvas ink and verify undo, redo, autosave and page reload.
    const rect=await page.locator('#canvas').boundingBox();
    await page.mouse.move(rect.x+90,rect.y+140);await page.mouse.down();await page.mouse.move(rect.x+240,rect.y+210,{steps:14});await page.mouse.up();
    const ink=await page.evaluate(()=>structuredClone(strokes));assert(ink.length>0);
    await page.locator('#undo').click();assert.equal(await page.evaluate(()=>strokes.length),0);
    await page.locator('#redo').click();assert.deepEqual(await page.evaluate(()=>strokes),ink);
    await page.evaluate(()=>save());await page.reload();await page.locator('#workspace').waitFor({state:'visible'});
    assert.deepEqual(await page.evaluate(()=>strokes),ink);assert.deepEqual(await page.evaluate(()=>activeQuestion),first);
    // Dialog cancel leaves both the current question and ink unchanged.
    await page.locator('#derivative-topics-tool').click();await page.locator('#derivative-topic-logarithm').uncheck();
    await page.locator('#derivative-topics-cancel').click();assert((await page.evaluate(()=>universitySelection.topics)).includes('logarithm'));
    assert.deepEqual(await page.evaluate(()=>strokes),ink);
    await page.locator('#save-work').click();
    // Disable logarithms. No logarithms, including nested expressions, may be generated.
    await page.locator('#derivative-topics-tool').click();await page.locator('#derivative-topic-logarithm').uncheck();
    await page.screenshot({path:path.join(output,'topics-tablet.png')});
    await page.locator('#derivative-topics-apply').click();
    assert(!(await page.evaluate(()=>universitySelection.topics)).includes('logarithm'));
    const filter=await page.evaluate(()=>Array.from({length:300},(_,i)=>DerivativeBank.generate(971,i,universitySelection.topics)).every(q=>!q.requiredTopics.includes('logarithm')&&!/\bln\(/.test(q.eq)));
    assert(filter);await page.reload();await page.locator('#workspace').waitFor({state:'visible'});
    assert(!(await page.evaluate(()=>universitySelection.topics)).includes('logarithm'));
    // Empty and prerequisite-only selections cannot produce an invalid stream.
    await page.locator('#derivative-topics-tool').click();await page.locator('#derivative-select-none').click();
    assert(await page.locator('#derivative-topics-apply').isDisabled());assert(await page.locator('#derivative-topic-error').isVisible());
    await page.locator('#derivative-topic-product').check();assert(await page.locator('#derivative-topics-apply').isDisabled());
    await page.locator('#derivative-topic-polynomial').check();assert(!(await page.locator('#derivative-topics-apply').isDisabled()));
    await page.locator('#derivative-topics-apply').click();assert.deepEqual(await page.evaluate(()=>universitySelection.topics),['polynomial','product']);
    await page.locator('#next').click();const second=await page.evaluate(()=>activeQuestion.id);
    await page.reload();await page.locator('#workspace').waitFor({state:'visible'});assert.equal(await page.evaluate(()=>activeQuestion.id),second);
    // Saved sessions retain their own selection and ink when reopened.
    await page.locator('#workspace-notes').click();await page.locator('.saved-note').first().click();
    assert.deepEqual(await page.evaluate(()=>strokes),ink);assert.deepEqual(await page.evaluate(()=>activeQuestion),first);
    assert((await page.evaluate(()=>universitySelection.topics)).includes('logarithm'));
    await page.reload();await page.locator('#workspace').waitFor({state:'visible'});assert.deepEqual(await page.evaluate(()=>strokes),ink);
    // Every template renders an equation and an openable solution without a JS error.
    const count=await page.evaluate(()=>DerivativeBank.templates.length);
    for(let i=0;i<count;i++){
      await page.evaluate(i=>{qi=i;activeQuestion=DerivativeBank.generate(391,i);renderQuestionContent();$('solution-toggle').click();},i);
      assert(await page.locator('#question-equation [role="math"]').count()>0,`equation ${i}`);
      assert(await page.locator('#solution').isVisible(),`solution ${i}`);
      assert.equal(await page.locator('.ML__error').count(),0,`math markup ${i}`);
    }
    await page.evaluate(()=>{selectGeneratedQuestion(0);loadQuestion();});
    await page.locator('#paper-settings').click();assert.equal(await page.locator('#education-mode-section').isVisible(),false);
    await page.locator('[data-theme-choice="dark"]').click();await page.locator('#settings-close').click();await page.locator('#settings-modal').waitFor({state:'hidden'});
    await page.screenshot({path:path.join(output,'tablet-dark.png')});
    await page.locator('#paper-settings').click();await page.locator('[data-language-choice="en"]').click();await page.locator('#settings-close').click();await page.locator('#settings-modal').waitFor({state:'hidden'});
    await page.locator('#derivative-topics-tool').click();assert.equal(await page.locator('#derivative-topics-title').textContent(),'Which derivative topics do I know?');
    await page.keyboard.press('Escape');assert.equal(await page.locator('#derivative-topics-dialog').isVisible(),false);
    assert.equal(await page.locator('#derivative-topics-tool').evaluate(el=>el===document.activeElement),true);
    await page.setViewportSize({width:390,height:844});
    await page.screenshot({path:path.join(output,'mobile-dark.png'),fullPage:true});
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'mobile overflow');
    await page.locator('#derivative-topics-tool').click();await page.screenshot({path:path.join(output,'topics-mobile.png'),fullPage:true});
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'mobile dialog overflow');
    await page.locator('#derivative-topics-cancel').click();
    await page.locator('#paper-settings').click();await page.locator('[data-theme-choice="light"]').click();await page.locator('[data-language-choice="tr"]').click();await page.locator('#settings-close').click();await page.locator('#settings-modal').waitFor({state:'hidden'});
    await page.screenshot({path:path.join(output,'mobile.png'),fullPage:true});
    await page.evaluate(()=>localStorage.setItem('forma-university-selection',JSON.stringify({topics:[]})));await page.reload();await page.locator('#workspace').waitFor({state:'visible'});assert(await page.evaluate(()=>activeQuestion&&universitySelection.topics.length===DerivativeBank.topics.length),'invalid saved selection recovery');
    assert.deepEqual(errors,[]);console.log(`PASS: ${count} templates, topic filtering, cancel/apply, prerequisites, saved sessions, canvas ink/undo/redo, reload, English/Turkish, light/dark, mobile/tablet.`);
  }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
