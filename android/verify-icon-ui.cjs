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
    await context.addInitScript(()=>{window.iconCalls=[];window.FormaAndroid={setTheme:()=>{},getSystemTheme:()=> 'light',setLauncherAccent:(accent,color)=>window.iconCalls.push({accent,color})};});
    await page.reload();await page.waitForTimeout(150);
    assert.equal(await page.evaluate(()=>window.iconCalls.at(-1).accent),'lavender');
    await page.locator('#settings-open').click();assert((await page.locator('.launcher-accent-note').innerText()).includes('en yakın'));
    for(const accent of ['green','blue','amber','rose','none','lavender']){
        await page.locator(`[data-accent-choice="${accent}"]`).click();assert.equal(await page.evaluate(()=>window.iconCalls.at(-1).accent),accent);
        assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('forma-settings')).accent),accent);
    }
    const count=await page.evaluate(()=>window.iconCalls.length);await page.evaluate(()=>{applySettings();applySettings();});assert.equal(await page.evaluate(()=>window.iconCalls.length),count);
    await page.locator('#accent-custom-color').evaluate(el=>{el.value='#8679a1';el.dispatchEvent(new Event('input',{bubbles:true}));});
    assert.deepEqual(await page.evaluate(()=>window.iconCalls.at(-1)),{accent:'custom',color:'#8679a1'});
    await page.locator('#accent-custom-color').evaluate(el=>{el.value='#001122';el.dispatchEvent(new Event('input',{bubbles:true}));});assert.equal(await page.evaluate(()=>window.iconCalls.at(-1).color),'#001122');
    const beforeTheme=await page.evaluate(()=>window.iconCalls.length);await page.locator('[data-theme-choice="dark"]').click();assert.equal(await page.evaluate(()=>window.iconCalls.length),beforeTheme);
    await page.reload();assert.deepEqual(await page.evaluate(()=>window.iconCalls.at(-1)),{accent:'custom',color:'#001122'});
    assert.deepEqual(errors,[]);console.log('PASS: accent UI forwards all colors, custom color updates, no redundant calls, dark theme preserves tone, saved accent is restored.');
  }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
