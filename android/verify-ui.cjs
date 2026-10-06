// Run with Node and Playwright installed. Uses an isolated browser profile.
const fs = require('fs');
const path = require('path');
const http = require('http');
const assert = require('assert/strict');
const {chromium} = require(process.env.FORMA_PLAYWRIGHT || 'playwright');
const root = path.join(__dirname, 'app/src/main/assets/web');
const output = path.join(__dirname, '../build/ui-checks');
fs.mkdirSync(output, {recursive:true});
const server = http.createServer((req,res) => {
  const file = path.resolve(root, '.' + (req.url === '/' ? '/index.html' : decodeURI(req.url.split('?')[0])));
  if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  fs.readFile(file,(error,bytes) => {
    if(error) {res.writeHead(404).end(); return;}
    res.setHeader('Content-Type', ({'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.woff2':'font/woff2','.ttf':'font/ttf'})[path.extname(file)] || 'application/octet-stream');
    res.end(bytes);
  });
});
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const browser = await chromium.launch({headless:true,channel:'chrome'});
  const context = await browser.newContext({viewport:{width:412,height:915},hasTouch:true,deviceScaleFactor:1});
  await context.addInitScript(()=>localStorage.setItem('forma-tutorial-v1','done'));
  const page=await context.newPage(),errors=[];
  page.on('pageerror', error=>errors.push(error.message));
  try {
    await page.goto(`http://127.0.0.1:${server.address().port}`);
    await page.waitForTimeout(800);
    await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
    async function noOverflow(label){assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${label}: horizontal overflow`);}
    await noOverflow('mobile home');
    await page.screenshot({path:path.join(output,'home-mobile.png'),fullPage:true});
    const scienceSummary=await page.evaluate(()=>ScienceCatalog.programs.map(p=>({subject:p.subject,id:p.id,topics:p.topics.map(t=>({id:t.id,subs:t.subtopics.map(s=>s.id)}))})));
    assert.equal(scienceSummary.filter(p=>p.subject==='Fizik').length,3);
    assert.equal(scienceSummary.filter(p=>p.subject==='Kimya').length,6);
    const ids=scienceSummary.flatMap(p=>[p.id,...p.topics.flatMap(t=>[t.id,...t.subs])]);
    assert.equal(new Set(ids).size,ids.length);
    const beforeSessions=await page.evaluate(()=>Object.keys(StudySessions.inspect().sessions).length);
    for(const scienceSubject of ['Fizik','Kimya']){
      await page.locator(`[data-subject="${scienceSubject}"]`).click();
      for(const p of scienceSummary.filter(p=>p.subject===scienceSubject)){
        await page.locator(`[data-science-program="${p.id}"]`).click();
        assert.equal(await page.locator('[data-science-topic]').count(),p.topics.length);
        for(const topic of p.topics){
          await page.locator(`[data-science-topic="${topic.id}"]`).click();
          assert.equal(await page.locator('[data-science-subtopic]').count(),topic.subs.length+(p.id==='physics-1'?1:0));
          await page.locator(`[data-science-subtopic="${topic.subs.at(-1)}"]`).click();
          assert.equal(await page.locator('#start').isDisabled(),p.id!=='physics-1');
        }
      }
      await noOverflow(scienceSubject+' mobile');
      await page.screenshot({path:path.join(output,scienceSubject==='Fizik'?'physics-mobile.png':'chemistry-mobile.png'),fullPage:true});
    }
    assert((await page.evaluate(()=>Object.keys(StudySessions.inspect().sessions).length))>=beforeSessions);
    await page.reload();
    await page.locator('[data-subject="Fizik"]').click();
    assert.equal(await page.locator('[data-science-program][aria-pressed="true"]').getAttribute('data-science-program'),'physics-3');
    assert.equal(await page.locator('[data-science-topic][aria-pressed="true"]').getAttribute('data-science-topic'),'physics-3-solid');
    await page.locator('[data-subject="Kimya"]').click();
    assert.equal(await page.locator('[data-science-program][aria-pressed="true"]').getAttribute('data-science-program'),'inorganic-chemistry');
    await page.locator('[data-subject="Matematik"]').click();
    assert(!(await page.locator('#start').isDisabled()));
    assert.equal(await page.locator('[data-university-program]').count(),8);
    await page.locator('[data-university-topic="equations-inequalities"]').click();
    await page.locator('[data-university-subtopic="m1-parabola"]').click();
    await page.locator('#start').click();
    assert.equal(await page.locator('#question-difficulty [role="meter"]').count(),1);
    assert.equal(await page.evaluate(()=>activeQuestion.supportsChoices),false);
    await page.locator('#solution-toggle').click();
    assert.equal(await page.locator('#solution .math1-reference-graph').count(),1);
    await page.waitForTimeout(400);
    await page.screenshot({path:path.join(output,'math1-parabola-mobile.png'),fullPage:true});
    await page.locator('#solution-toggle').click();
    await page.evaluate(()=>{settings.questionMode='multiple';renderQuestionContent(true);});
    assert(await page.locator('#answers').isHidden());
    assert(await page.locator('#feedback').isHidden());
    await page.evaluate(()=>{settings.questionMode='open';renderQuestionContent(true);});
    await page.locator('#pen-tool').click();
    await page.locator('#custom-color').evaluate(el=>el.value='#123abc');
    await page.locator('#add-color').click();
    assert.equal(await page.locator('[data-remove-color="#123abc"]').count(),1);
    await page.locator('[data-remove-color="#123abc"]').click();
    assert.equal(await page.locator('[data-color="#123abc"]').count(),0);
    assert(!await page.evaluate(()=>JSON.parse(localStorage.getItem('forma-brushes')).customColors.includes('#123abc')));
    await page.locator('#pen-palette-close').click();
    for(const style of ['normal','dashed','arrow','double-arrow']){
      await page.locator('#ruler-tool').click();
      await page.locator(`[data-ruler-style="${style}"]`).click();
      await page.locator('#ruler-close').click();
      const rect=await page.locator('#canvas').boundingBox();
      const index=['normal','dashed','arrow','double-arrow'].indexOf(style);
      await page.mouse.move(rect.x+40,rect.y+110+index*45); await page.mouse.down();
      await page.mouse.move(rect.x+200,rect.y+135+index*45,{steps:8}); await page.mouse.up();
      const stroke=await page.evaluate(()=>strokes.at(-1));
      assert.equal(stroke.rulerStyle,style); assert.equal(stroke.points.length,2);
    }
    await page.locator('#ruler-tool').click();
    await page.screenshot({path:path.join(output,'ruler-mobile.png')});
    await page.locator('#ruler-disable').click();
    assert.equal(await page.evaluate(()=>rulerEnabled),false);
    assert(await page.evaluate(()=>{const e=new MouseEvent('contextmenu',{bubbles:true,cancelable:true});document.querySelector('#pen-tool').dispatchEvent(e);return e.defaultPrevented;}));
    await page.locator('#save-work').click();
    await page.locator('#workspace-notes').click();
    await page.locator('#folder-create').click();
    await page.locator('#folder-name').fill('Çalışmalar');
    await page.locator('#folder-form button[type="submit"]').click();
    await page.waitForTimeout(250);
    const folder=page.locator('[data-folder-filter]').filter({hasText:'Çalışmalar'});
    const folderId=await folder.getAttribute('data-folder-filter');
    const handle=page.locator('.note-drag-handle').first();
    const key=await handle.getAttribute('data-note-key');
    async function dragHandle(target){
      const a=await page.locator('.note-drag-handle').first().boundingBox(),b=await target.boundingBox();
      await page.mouse.move(a.x+a.width/2,a.y+a.height/2);await page.mouse.down();
      await page.mouse.move(b.x+b.width/2,b.y+b.height/2,{steps:10});await page.waitForTimeout(120);await page.mouse.up();await page.waitForTimeout(400);
    }
    await dragHandle(folder);
    assert.equal(await page.evaluate(key=>JSON.parse(localStorage.getItem('forma-v1'))[key].folderId,key),folderId);
    await folder.click();
    assert.equal(await page.locator('.note-card').count(),1);
    await noOverflow('mobile notes');
    await page.screenshot({path:path.join(output,'notes-mobile.png'),fullPage:true});
    await dragHandle(page.locator('[data-folder-filter="unfiled"]'));
    assert.equal(await page.evaluate(key=>JSON.parse(localStorage.getItem('forma-v1'))[key].folderId,key),undefined);
    await page.locator('[data-folder-filter="all"]').click();
    // Verify touch pointer handling independently of desktop mouse emulation.
    await page.evaluate(({folderId})=>{
      const h=document.querySelector('.note-drag-handle'),f=document.querySelector(`[data-folder-filter="${folderId}"]`),r=h.getBoundingClientRect(),b=f.getBoundingClientRect();
      h.setPointerCapture=()=>{};
      h.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,cancelable:true,pointerId:42,pointerType:'touch',button:0,clientX:r.x+10,clientY:r.y+10}));
      document.dispatchEvent(new PointerEvent('pointermove',{bubbles:true,cancelable:true,pointerId:42,pointerType:'touch',clientX:b.x+10,clientY:b.y+10}));
      document.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,pointerId:42,pointerType:'touch',clientX:b.x+10,clientY:b.y+10}));
    },{folderId});
    assert.equal(await page.evaluate(key=>database[key].folderId,key),folderId);
    // Cancelled drags must retain the original folder.
    await page.evaluate(()=>{
      const h=document.querySelector('.note-drag-handle');h.setPointerCapture=()=>{};
      h.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,cancelable:true,pointerId:43,button:0,clientX:100,clientY:400}));
      document.dispatchEvent(new PointerEvent('pointercancel',{bubbles:true,pointerId:43}));
    });
    assert.equal(await page.evaluate(key=>database[key].folderId,key),folderId);
    await page.reload(); await page.waitForTimeout(300);
    assert.equal(await page.evaluate(()=>brushState.rulerStyle),'double-arrow');
    await page.locator('#notes-nav').click();
    await page.locator('.saved-note').first().click();
    assert.deepEqual(await page.evaluate(()=>strokes.map(s=>s.rulerStyle)),['normal','dashed','arrow','double-arrow']);
    assert.equal(await page.evaluate(()=>activeQuestion.generatorVersion),3);
    assert.equal(await page.evaluate(()=>activeQuestion.difficulty.basis),'type-steps-numbers-v1');
    await page.waitForTimeout(500);
    await page.screenshot({path:path.join(output,'strokes-restored.png')});
    await page.evaluate(()=>{settings.theme='dark';applySettings();});
    await page.screenshot({path:path.join(output,'workspace-dark.png')});
    await page.setViewportSize({width:1024,height:768});
    await page.locator('#workspace-back').click(); await page.waitForTimeout(500); await noOverflow('tablet home');
    await page.screenshot({path:path.join(output,'home-tablet.png'),fullPage:true});
    await page.locator('#notes-nav').click(); await page.waitForTimeout(500); await noOverflow('tablet notes');
    await page.screenshot({path:path.join(output,'notes-tablet.png'),fullPage:true});
    await page.evaluate(()=>home());
    await page.locator('[data-university-subtopic="m1-sign-charts"]').click();
    await page.locator('#start').click();
    await page.locator('#solution-toggle').click();
    assert.equal(await page.locator('#solution .math1-sign-chart').count(),1);
    await page.waitForTimeout(400);
    await page.screenshot({path:path.join(output,'math1-sign-chart-tablet.png'),fullPage:true});
    await page.locator('#formula-toggle').click();
    assert(await page.locator('#formula-content').innerText().then(text=>text.includes('Cardano')&&text.includes('Horner')));
    await page.evaluate(()=>{settings.language='en';applyLanguage();});
    assert((await page.locator('#question-difficulty').innerText()).includes('Difficulty'));
    assert(await page.locator('#answers').isHidden());
    assert.deepEqual(errors,[]);
    console.log('PASS: Physics 1 and physics/chemistry placeholder catalog, isolated persistent selections, existing mathematics flow, mobile/tablet layout, color deletion, ruler/session restoration and folder drag.');
  } finally {await browser.close();server.close();}
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
