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
    assert.equal(await page.locator('#simulations-open').count(),0);
    const styles=await page.evaluate(()=>({settings:getComputedStyle(document.querySelector('#settings-open')).borderRadius,nav:getComputedStyle(document.querySelector('#home-nav')).borderWidth}));
    assert.equal(styles.settings,'50%');assert.equal(styles.nav,'0px');
    await page.locator('[data-subject="Fizik"]').click();await page.locator('[data-science-program="physics-1"]').click();
    await page.locator('[data-science-topic="physics-1-motion"]').click();await page.locator('[data-science-subtopic="physics-1-motion-3"]').click();await page.locator('#start').click();
    assert.equal(await page.evaluate(()=>activeQuestion.program),'physics-1');assert.equal(await page.evaluate(()=>StudySessions.current().selection.program),'physics-1');
    assert(await page.locator('#answers').isHidden());assert((await page.locator('#question-text').innerText()).includes('atılan'));
    await page.locator('#solution-toggle').click();assert((await page.locator('#solution').innerText()).includes('menzil'));
    await page.locator('#formula-toggle').click();assert((await page.locator('#formula-content').innerText()).includes('Atış'));
    await page.locator('#next').click();const questionId=await page.evaluate(()=>activeQuestion.id);assert((await page.locator('#question-text').innerText()).includes('tamamlayıcı'));
    const vectorData=await page.evaluate(()=>{const v=ModuleWorkspace.create('physics-vector'),m=ModuleWorkspace.create('matrix'),n=ModuleWorkspace.create('vector');ModuleWorkspace.connect(v,m);ModuleWorkspace.connect(v,n);m.api.receive({kind:'dataset',data:[[0,-1],[1,0]]});m.body.querySelector('[data-cw-field="operation"]').value='transpose';m.body.querySelector('[data-cw-run]').click();v.body.querySelector('.vector-neighbor').value=m.id;v.body.querySelector('.vector-read').click();return {v:v.id,m:m.id,n:n.id,vectors:v.api.exportState().vectors,data:m.api.snapshot().data};});
    assert.deepEqual(vectorData.vectors[0],[2,-3]);
    const sent=await page.evaluate(ids=>{const v=ModuleWorkspace.instances.get(ids.v),n=ModuleWorkspace.instances.get(ids.n);v.body.querySelector('.vector-neighbor').value=n.id;v.body.querySelector('.vector-send').click();return n.api.exportState().extra;},vectorData);assert(sent.memory.A.includes('2'));assert(sent.memory.A.includes('-3'));
    const v=page.locator('.record-window').filter({has:page.locator('.vector-plot')});await v.locator('[data-vector="a"]').fill('4, 0');await v.locator('[data-vector="b"]').fill('0, 3');assert((await v.locator('.vector-results').innerText()).includes('|A|=4'));
    assert((await v.locator('.vector-plot svg').boundingBox()).height>=190);await page.screenshot({path:path.join(output,'physics-vector-drawing-mobile.png'),fullPage:true});await v.locator('[data-vector="a"]').fill('1');assert((await v.locator('.vector-status').innerText()).includes('iki'));await v.locator('[data-vector="a"]').fill('4, 0');
    await page.evaluate(()=>{for(const m of ModuleWorkspace.instances.values())m.pane.querySelector('[data-module-minimize]').click();});await page.waitForTimeout(400);await page.locator('#save-work').click();await page.locator('#workspace-back').click();await page.locator('#notes-nav').click();await page.locator('.saved-note').first().click();
    assert.equal(await page.evaluate(()=>activeQuestion.id),questionId);assert.equal(await page.evaluate(()=>ScienceCatalog.selectionFor('Fizik').subtopic.id),'physics-1-motion-3');
    assert.deepEqual(await page.evaluate(()=>[...ModuleWorkspace.instances.values()].find(v=>v.kind==='physics-vector').api.exportState().vectors),[[4,0],[0,3]]);
    assert.equal(await page.evaluate(()=>ModuleWorkspace.edges.size),2);
    await page.screenshot({path:path.join(output,'physics-vector-mobile.png'),fullPage:true});
    await page.evaluate(()=>home());await page.locator('#start').click();await page.locator('#simulations-tool').click();assert.equal(await page.locator('[data-simulation]').count(),9);
    await page.locator('[data-sim-subject="Matematik"]').click();assert.equal(await page.locator('[data-simulation]').count(),0);await page.locator('[data-sim-subject="Kimya"]').click();assert.equal(await page.locator('[data-simulation]').count(),0);await page.locator('[data-sim-subject="Fizik"]').click();
    const modelIds=await page.evaluate(()=>PhysicsSimulations.models.map(m=>m.id));
    for(const id of modelIds){await page.locator(`[data-simulation="${id}"]`).click();assert(await page.locator('.simulation-window').isVisible());assert.equal(await page.locator('.simulation-stage svg').count(),1);assert((await page.locator('.simulation-stage svg').boundingBox()).height>=190);assert((await page.locator('.simulation-metrics').innerText()).length>10);await noOverflow('simulation '+id);const input=page.locator('[data-sim-param]').first();await input.evaluate(el=>{el.value=el.min;el.dispatchEvent(new Event('input',{bubbles:true}));});const timeInput=page.locator('.simulation-time');if(!await timeInput.isDisabled()){await timeInput.evaluate(el=>{el.value=Number(el.max)/2;el.dispatchEvent(new Event('input',{bubbles:true}));});assert(!/NaN|Infinity/.test(await page.locator('.simulation-metrics').innerText()));await page.locator('.simulation-play').click();await page.waitForTimeout(80);assert.equal(await page.locator('.simulation-play').innerText(),'Duraklat');await page.locator('.simulation-play').click();await page.locator('.simulation-reset').click();assert.equal(await timeInput.inputValue(),'0');}await page.waitForTimeout(350);await page.screenshot({path:path.join(output,`simulation-${id}-mobile.png`),fullPage:true});await page.locator('.simulation-window [data-module-close]').click();await page.locator('#simulations-tool').click();}
    await page.locator('#simulations-catalog .tool').click();await page.evaluate(()=>home());await page.setViewportSize({width:1100,height:850});
    await page.evaluate(()=>window.scrollTo(0,0));await page.waitForTimeout(100);const align=await page.evaluate(()=>({card:document.querySelector('.session-card').getBoundingClientRect().top,boxes:document.querySelector('.subjects').getBoundingClientRect().top}));assert(Math.abs(align.card-align.boxes)<1.5,JSON.stringify(align));await noOverflow('desktop home');await page.screenshot({path:path.join(output,'physics-home-desktop.png'),fullPage:true});
    await page.locator('#start').click();await page.evaluate(()=>document.querySelector('#widget-explorer').hidden=false);assert.deepEqual(await page.locator('.module-subject-heading').allTextContents(),['Matematik','Fizik','Kimya']);assert.equal(await page.locator('#cw-physics-vector-open').count(),1);await page.screenshot({path:path.join(output,'module-explorer-desktop.png'),fullPage:true});
    assert.deepEqual(errors,[]);console.log('PASS: Physics 1 open questions, solutions/formulas, saved sessions, vector/matrix transfer and restored module links, 9 simulations, categories and home alignment.');
  } finally {await browser.close();server.close();}
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
