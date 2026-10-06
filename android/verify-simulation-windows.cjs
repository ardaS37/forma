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
    await page.setViewportSize({width:1280,height:900});await page.locator('#start').click();
    await page.locator('#simulations-tool').click();await page.locator('[data-simulation="energy"]').click();
    const energy=page.locator('[data-module-kind="simulation-energy"]');assert(await energy.isVisible());assert.equal(await page.locator('dialog[open]').count(),0);assert(await energy.locator('[data-module-port]').isHidden());
    await energy.locator('[data-sim-param="m"]').evaluate(el=>{el.value=4;el.dispatchEvent(new Event('input',{bubbles:true}));});await energy.locator('.simulation-time').evaluate(el=>{el.value=1.2;el.dispatchEvent(new Event('input',{bubbles:true}));});
    const energyState=await page.evaluate(()=>[...ModuleWorkspace.instances.values()].find(m=>m.kind==='simulation-energy').api.exportState());
    const header=energy.locator('.floating-header');await header.focus();const leftBefore=(await energy.boundingBox()).x;await header.press('ArrowLeft');assert((await energy.boundingBox()).x<leftBefore);
    await energy.locator('.simulation-play').click();await page.waitForTimeout(100);await energy.locator('[data-module-minimize]').click();assert.equal(await energy.locator('.simulation-play').innerText(),'Başlat');await energy.locator('.module-content').waitFor({state:'hidden'});
    await page.locator('#simulations-tool').click();await page.locator('[data-simulation="motion"]').click();
    const motion=page.locator('[data-module-kind="simulation-motion"]');assert.equal(await page.locator('.simulation-window').count(),2);await motion.locator('[data-sim-param="v"]').evaluate(el=>{el.value=25;el.dispatchEvent(new Event('input',{bubbles:true}));});
    const independent=await page.evaluate(()=>[...ModuleWorkspace.instances.values()].find(m=>m.kind==='simulation-energy').api.exportState());assert.equal(independent.params.m,energyState.params.m);
    await motion.locator('[data-module-minimize]').click();await page.waitForTimeout(300);await page.locator('#calculator-open').evaluate(el=>el.click());assert.equal(await page.locator('[data-module-kind="calculator"]').count(),1);await page.locator('[data-module-kind="calculator"] [data-module-minimize]').click();
    const stored=await page.evaluate(()=>ModuleWorkspace.capture());assert.equal(stored.windows.filter(w=>w.kind.startsWith('simulation-')).length,2);assert.equal(stored.edges.length,0);
    await page.locator('#save-work').click();await page.locator('#workspace-back').click();await page.locator('#notes-nav').click();await page.locator('.saved-note').first().click();
    assert.equal(await page.locator('.simulation-window').count(),2);assert.equal(await motion.locator('[data-sim-param="v"]').inputValue(),'25');await motion.locator('.module-content').waitFor({state:'hidden'});
    await motion.locator('[data-module-minimize]').click();await page.waitForTimeout(250);await motion.locator('.simulation-play').click();await page.waitForTimeout(100);await motion.locator('[data-module-close]').click();await page.waitForTimeout(200);assert.equal(await page.locator('[data-module-kind="simulation-motion"]').count(),0);
    await energy.locator('[data-module-minimize]').click();await page.waitForTimeout(250);await page.screenshot({path:path.join(output,'simulation-floating-desktop.png'),fullPage:true});
    await page.setViewportSize({width:412,height:915});await page.waitForTimeout(300);await noOverflow('mobile simulation window');assert((await energy.boundingBox()).width<=396);await page.screenshot({path:path.join(output,'simulation-floating-mobile.png'),fullPage:true});
    await page.keyboard.press('Escape');await page.waitForTimeout(200);assert.equal(await page.locator('.simulation-window').count(),0);assert.equal(await page.locator('#workspace').isVisible(),true);
    await page.evaluate(()=>home());assert.equal(await page.locator('#simulations-open').count(),0);assert.equal(await page.locator('#simulations-workspace-open').count(),0);assert.equal(await page.locator('.module-subject-heading').allTextContents().then(t=>t.includes('Simülasyonlar')),false);
    assert.deepEqual(errors,[]);console.log('PASS: toolbar entry, independent windows, no cable ports, dragging, pause on minimize, session restore, calculator coexistence, close/Escape cleanup, mobile bounds and removed home/explorer entries.');
  }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
