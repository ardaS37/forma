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
    assert.equal(await page.evaluate(()=>settings.amoled),true,'AMOLED enabled by default');
    await page.evaluate(()=>{settings.amoled=false;applySettings();storeSettings();});
    await page.screenshot({path:path.join(output,'home-mobile.png'),fullPage:true});

    const state=()=>page.evaluate(()=>({chosen:settings.theme,applied:document.documentElement.dataset.theme,bg:getComputedStyle(document.body).backgroundColor}));
    async function chosen(mode){await page.locator('[data-theme-choice="'+mode+'"]').click();assert.equal((await state()).chosen,mode);assert.equal(await page.locator('[data-theme-choice="'+mode+'"]').getAttribute('aria-pressed'),'true');}
    async function applied(mode){await page.waitForFunction(expected=>document.documentElement.dataset.theme===expected,mode);const s=await state();assert.equal(s.applied,mode);assert.equal(s.bg,mode==='dark'?'rgb(21, 28, 36)':'rgb(255, 255, 255)');}
    await page.emulateMedia({colorScheme:'light'});await page.locator('#settings-open').click();await chosen('dark');await applied('dark');
    await page.emulateMedia({colorScheme:'dark'});await chosen('light');await applied('light');
    await chosen('system');await applied('dark');await page.emulateMedia({colorScheme:'light'});await applied('light');await page.emulateMedia({colorScheme:'dark'});await applied('dark');
    await page.reload();await applied('dark');assert.equal((await state()).chosen,'system');await page.locator('#settings-open').click();await chosen('dark');await page.reload();await page.emulateMedia({colorScheme:'light'});await applied('dark');assert.equal((await state()).chosen,'dark');
    // A Light Android Activity may report light through matchMedia even when the OS is dark.
    await context.addInitScript(()=>{window.nativeThemeCalls=[];window.FormaAndroid={getSystemTheme:()=> 'dark',setTheme:mode=>window.nativeThemeCalls.push(mode)};});
    await page.reload();await applied('dark');await page.locator('#settings-open').click();await chosen('system');await applied('dark');
    await page.evaluate(()=>window.setAndroidSystemTheme('light'));await applied('light');assert.equal((await state()).chosen,'system');
    await page.evaluate(()=>window.setAndroidSystemTheme('dark'));await applied('dark');
    await chosen('light');await page.evaluate(()=>window.setAndroidSystemTheme('dark'));await applied('light');
    await chosen('dark');await page.evaluate(()=>window.setAndroidSystemTheme('light'));await applied('dark');
    await page.reload();await applied('dark');assert.equal((await state()).chosen,'dark');assert.equal(await page.evaluate(()=>window.nativeThemeCalls.at(-1)),'dark');
    await page.locator('#settings-open').click();await chosen('system');await applied('dark');await page.waitForTimeout(300);await page.screenshot({path:path.join(output,'theme-system-dark-mobile.png'),fullPage:true});
    await page.locator('#settings-close').click();await page.locator('#start').click();await applied('dark');
    const iconColors=await page.evaluate(()=>{const pen=getComputedStyle(document.querySelector('#pen-tool')).color;return [...document.querySelectorAll('.drawing-toolbar .tool,.header .settings-button,.header .nav-item,#paper-settings')].map(button=>({id:button.id,color:getComputedStyle(button).color,pen}));});
    for(const icon of iconColors)assert.equal(icon.color,icon.pen,`${icon.id}: dark icon must match pen accent`);
    const bubbles=await page.evaluate(()=>{const pen=getComputedStyle(document.querySelector('#pen-tool'));return [...document.querySelectorAll('.drawing-toolbar .tool,.header .settings-button,#paper-settings')].map(button=>{const style=getComputedStyle(button);return {id:button.id,background:style.backgroundColor,border:style.borderColor,penBackground:pen.backgroundColor,penBorder:pen.borderColor};});});
    for(const bubble of bubbles){assert.equal(bubble.background,bubble.penBackground,`${bubble.id}: dark bubble background`);assert.equal(bubble.border,bubble.penBorder,`${bubble.id}: dark bubble border`);assert.equal(bubble.background,'rgba(0, 0, 0, 0)');}
    assert.equal(await page.evaluate(()=>document.querySelector('#paper').style.getPropertyValue('--sheet-bg').startsWith('#')),true);
    await page.waitForTimeout(300);await page.screenshot({path:path.join(output,'theme-system-dark-workspace.png'),fullPage:true});
    await page.evaluate(()=>window.setAndroidSystemTheme('light'));await applied('light');
    await page.locator('#paper-settings').click();await chosen('dark');await page.locator('#amoled-theme').check();
    const blackState=()=>page.evaluate(()=>({bg:getComputedStyle(document.body).backgroundColor,paper:document.querySelector('#paper').style.getPropertyValue('--sheet-bg'),native:window.nativeThemeCalls.at(-1),amoled:settings.amoled}));
    assert.deepEqual(await blackState(),{bg:'rgb(0, 0, 0)',paper:'#000000',native:'amoled',amoled:true});
    await page.reload();assert.deepEqual(await blackState(),{bg:'rgb(0, 0, 0)',paper:'#000000',native:'amoled',amoled:true});
    await page.locator('#settings-open').click();assert(await page.locator('#amoled-theme').isChecked());await chosen('light');await applied('light');
    await chosen('system');assert.equal((await blackState()).bg,'rgb(0, 0, 0)');await page.evaluate(()=>window.setAndroidSystemTheme('light'));await applied('light');await page.evaluate(()=>window.setAndroidSystemTheme('dark'));assert.equal((await blackState()).bg,'rgb(0, 0, 0)');
    await page.locator('[data-page-color="#1b242d"]').click();assert.equal((await blackState()).paper,'#000000');
    await page.reload();assert.equal((await blackState()).paper,'#000000');await page.locator('#settings-open').click();
    await page.locator('#amoled-theme').uncheck();await applied('dark');assert.equal((await blackState()).native,'dark');assert.equal((await blackState()).paper,'#1b242d');
    await page.reload();assert.equal(await page.evaluate(()=>settings.amoled),false);await page.locator('#settings-open').click();
    await page.locator('#amoled-theme').check();assert.equal((await blackState()).paper,'#000000');await chosen('light');assert.equal((await blackState()).paper,'#000000');
    await page.locator('[data-page-color="#fff7e8"]').click();assert.equal((await blackState()).paper,'#fff7e8');
    assert.deepEqual(errors,[]);console.log('PASS: theme switches, Android overrides, dark icon colors/bubbles, AMOLED true black body/paper/native bars, saved toggle, light/system transitions and restoring standard dark.');
  }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
