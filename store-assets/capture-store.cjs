// Capture the packaged Android web interface in isolated browser contexts.
const fs = require('fs');
const path = require('path');
const http = require('http');
const {chromium} = require(process.env.FORMA_PLAYWRIGHT || 'playwright');
const sharp = require('sharp');
const root = path.resolve(__dirname, '../android/app/src/main/assets/web');
const server = http.createServer((req, res) => {
  const file = path.resolve(root, '.' + (req.url === '/' ? '/index.html' : decodeURIComponent(req.url.split('?')[0])));
  if (!file.startsWith(root + path.sep)) return res.writeHead(403).end();
  fs.readFile(file, (error, bytes) => {
    if (error) return res.writeHead(404).end();
    res.setHeader('Content-Type', ({'.html':'text/html','.js':'application/javascript','.css':'text/css','.woff2':'font/woff2','.ttf':'font/ttf','.json':'application/json'})[path.extname(file)] || 'application/octet-stream');
    res.end(bytes);
  });
});
const sizes = [
  {name:'phone', width:432, height:768, scale:2.5},
  {name:'tablet-7', width:720, height:1280, scale:1.5},
  {name:'tablet-10', width:1280, height:720, scale:2}
];
const descriptions = {
  '01-home':'Matematik dersleri, konu ve alt konu seçimi bulunan Forma ana ekranı.',
  '02-notebook':'Parabol sorusu ve çizim araçlarıyla dijital defter çalışma alanı.',
  '03-solution':'Parabol sorusunun adım adım çözümü ve koordinat düzlemindeki grafiği.',
  '04-modules':'Çalışma alanında bilimsel hesap makinesi ve büyük ekranda fonksiyon grafiği.'
};
async function main() {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({headless:true, channel:'chrome'});
  const report = [];
  try {
    for (const size of sizes) {
      const output = path.join(__dirname, size.name);
      fs.mkdirSync(output, {recursive:true});
      const context = await browser.newContext({viewport:{width:size.width,height:size.height},deviceScaleFactor:size.scale,hasTouch:true,locale:'tr-TR'});
      await context.addInitScript(() => {
        localStorage.setItem('forma-tutorial-v1','done');
        localStorage.setItem('forma-settings',JSON.stringify({defaultsVersion:2,language:'tr',educationMode:'university',theme:'light',paper:'dots',accent:'lavender',questionWriting:true,questionMode:'open',fingerDrawing:false,eraserMode:'stroke'}));
      });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(`http://127.0.0.1:${server.address().port}`, {waitUntil:'networkidle'});
      await page.evaluate(() => document.fonts.ready);
      async function capture(name) {
        await page.waitForTimeout(350);
        const png = await page.screenshot({animations:'disabled',fullPage:false});
        const file = path.join(output, name+'.png');
        // Store screenshots must be RGB PNG without alpha; dimensions stay native.
        await sharp(png).removeAlpha().png().toFile(file);
        const metadata = await sharp(file).metadata();
        report.push({file:path.relative(__dirname,file).replaceAll('\\','/'),width:metadata.width,height:metadata.height,channels:metadata.channels,bytes:fs.statSync(file).size,alt:descriptions[name]});
      }
      await page.locator('[data-university-topic="equations-inequalities"]').click();
      await page.locator('[data-university-subtopic="m1-parabola"]').click();
      await page.evaluate(() => scrollTo(0,0));
      await capture('01-home');
      await page.locator('#start').click();
      await page.evaluate(() => { StudySessions.current().stream.seed = 7919; selectGeneratedQuestion(0); renderQuestionContent(true); });
      await page.waitForTimeout(300);
      // Draw with the actual canvas interaction, as a demonstration notebook entry.
      const box = await page.locator('#canvas').boundingBox();
      const visibleTop = Math.max(box.y+40, size.height * 0.48);
      const x = box.x + Math.min(box.width * 0.5, 300);
      const y = Math.min(visibleTop + 90, size.height - 110);
      const r = Math.min(75,box.width * 0.23);
      async function stroke(points) {
        await page.mouse.move(...points[0]);
        await page.mouse.down();
        for (const point of points.slice(1)) await page.mouse.move(...point);
        await page.mouse.up();
      }
      await stroke([[x-r-15,y+25],[x+r+15,y+25]]);
      await stroke([[x+50,y+45],[x+50,y-90]]);
      const curve=[];
      for(let i=0;i<=40;i++){const t=-1+i/20;curve.push([x+t*r,y-75*t*t]);}
      await stroke(curve);
      await capture('02-notebook');
      await page.locator('#solution-toggle').click();
      if (size.width > 900) await page.locator('#solution .math1-reference-graph').scrollIntoViewIfNeeded();
      await capture('03-solution');
      await page.locator('#solution-toggle').click();
      await page.evaluate(({width,height}) => {
        const calculator=ModuleWorkspace.create('calculator');
        calculator.api.setInput('sqrt(144)+sin(30)');
        calculator.api.execute();
        calculator.pane.style.left=(width>600?360:12)+'px';
        calculator.pane.style.top=(width>600?72:100)+'px';
        calculator.clamp();
        if(width>600){
          const graph=ModuleWorkspace.create('graph');
          graph.pane.style.left=(width<900?Math.max(12,(width-520)/2):Math.max(400,width-480))+'px';
          graph.pane.style.top='72px';
          graph.clamp();
          const input=graph.pane.querySelector('[data-role="graph-function-1"]');
          input.value='x^2';input.dispatchEvent(new Event('input',{bubbles:true}));
          const input2=graph.pane.querySelector('[data-role="graph-function-2"]');
          input2.value='sin(x)';input2.dispatchEvent(new Event('input',{bubbles:true}));
          ModuleWorkspace.connect(calculator,graph);
          if(width<900) calculator.pane.querySelector('[data-module-minimize]').click();
        }
      },size);
      await capture('04-modules');
      if(errors.length) throw new Error(size.name+': '+errors.join('; '));
      await context.close();
    }
    fs.writeFileSync(path.join(__dirname,'screenshots.json'),JSON.stringify({source:'Packaged Android web UI rendered in Chrome at device viewport sizes; not physical Android device captures.',version:'1.33.0',screenshots:report},null,2));
    console.log(JSON.stringify(report.map(({file,width,height,bytes})=>({file,width,height,bytes})),null,2));
  } finally { await browser.close(); server.close(); }
}
main().catch(error => {console.error(error);server.close();process.exitCode=1;});
