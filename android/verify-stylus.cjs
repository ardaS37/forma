const fs = require('fs');
const path = require('path');
const http = require('http');
const assert = require('assert/strict');
const {chromium} = require(process.env.FORMA_PLAYWRIGHT || 'playwright');
const root = path.join(__dirname, 'app/src/main/assets/web');
const server = http.createServer((req, res) => {
  const file = path.resolve(root, '.' + (req.url === '/' ? '/index.html' : req.url.split('?')[0]));
  if (!file.startsWith(root + path.sep)) return res.writeHead(403).end();
  fs.readFile(file, (error, bytes) => {
    if (error) return res.writeHead(404).end();
    res.setHeader('Content-Type', ({'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.woff2':'font/woff2','.ttf':'font/ttf'})[path.extname(file)] || 'application/octet-stream');
    res.end(bytes);
  });
});
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await chromium.launch({headless:true, channel:'chrome'});
    const page = await browser.newPage({viewport:{width:1100,height:900}});
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.addInitScript(() => {
      localStorage.setItem('forma-tutorial-v1', 'done');
      window.FormaAndroid = {setDrawingBounds(){}, setTheme(){}, getSystemTheme(){return 'light';}};
    });
    await page.goto(`http://127.0.0.1:${server.address().port}`);
    await page.locator('#start').click();
    await page.waitForFunction(() => typeof handleNativePenBatch === 'function' && canvas.width > 0);
    const report = await page.evaluate(() => {
      const results = [];
      let testTime=1000; Object.defineProperty(performance,'now',{value:()=>testTime,configurable:true});
      const advance=ms=>testTime+=ms;
      function check(value, message) { if (!value) throw Error(message); results.push(message); }
      const r = canvas.getBoundingClientRect(), x=r.left+50, y=r.top+100;
      function reset(mode='stroke') {
        if(drawing) finishDrawing({pointerId:drawing.pointerId});
        strokes=[]; undoStack=[]; redoStack=[]; drawingUndo=null;
        nativeStylusButton=false; webStylusButton=false; nativeSampleEraser=false;
        penResumeAfter=0; tool='pen'; settings.eraserMode=mode; inkDirty=true; render();
      }
      function batch(...rows) { handleNativePenBatch(rows.map(([phase,dx,dy,erase=false])=>[phase,x+dx,y+dy,.6,1000,erase])); }
      function line() { batch(['down',0,0],['move',80,0],['up',80,0]); }
      for(const mode of ['stroke','pixel']) {
        reset(mode); line();
        batch(['down',40,0,true]);
        check(drawing.tool==='eraser',mode+': held button starts as eraser');
        if(mode==='stroke')check(strokes.length===0,'contact erases whole stroke immediately');
        batch(['up',40,0,true]);
        check(drawing===null,mode+': erase tap finishes');
        check(undoStack.length===2,mode+': erase is one undo action');
        $('undo').onclick();
        check(strokes.length===1&&strokes[0].tool==='pen',mode+': undo restores original ink');
        $('redo').onclick();
        check(mode==='stroke'?strokes.length===0:strokes.at(-1).tool==='eraser',mode+': redo restores erasing');
        batch(['button',0,0,false]); advance(250);
        batch(['down',0,30],['move',60,30],['up',60,30]);
        check(strokes.at(-1).tool==='pen'&&strokes.at(-1).points.length>=2,mode+': next contact draws after release protection');

        reset(mode); line();
        batch(['down',0,30],['move',40,30],['move',40,0,true]);
        check(drawing.native===true,mode+': native identity survives tool switch');
        // Out-of-band bridge update must not alter samples already queued by Android.
        setStylusButtonPressed(false);
        batch(['move',60,0,true]);
        check(drawing.tool==='eraser',mode+': queued eraser sample stays eraser');
        batch(['move',60,40]);
        check(drawing.native&&drawing.points.length===0,mode+': release pauses ink while preserving native contact');
        advance(250); batch(['move',60,40],['move',80,40],['up',80,40]);
        check(drawing===null&&undoStack.length===2,mode+': mixed gesture finishes with one undo action');
        check(strokes.at(-1).tool==='pen',mode+': release restores pen');
        check(strokes.at(-1).points.every(p=>p.y>=point({clientX:x,clientY:y+40,pointerType:'pen',pressure:.6}).y),mode+': release does not bridge from eraser');
        const before=strokes.slice();
        batch(['down',0,70],['move',80,70],['cancel',80,70]);
        check(drawing===null,mode+': cancelled contact does not get stuck');
        batch(['down',0,90],['move',80,90],['up',80,90]);
        check(strokes.length>before.length,mode+': drawing recovers after cancel');
      }
      reset();
      const hover={pointerType:'pen',pointerId:7,buttons:2,button:2,pressure:.5,clientX:x,clientY:y,preventDefault(){},type:'pointermove'};
      canvas.onpointermove(hover);
      check(drawing===null,'WebView pen events cannot duplicate native drawing');
      batch(['down',0,0],['move',80,0]);
      canvas.onpointerup({pointerId:7});
      check(drawing?.native===true,'unrelated pointerup cannot finish native contact');
      batch(['up',80,0]);
      reset('pixel'); line(); render();
      const pixel=point({clientX:x+40,clientY:y,pointerType:'pen',pressure:.6});
      const alpha=dx=>ctx.getImageData(Math.round(pixel.x*documentScale+dx),Math.round(pixel.y*documentScale-scrollArea.scrollTop),1,1).data[3];
      check(alpha(0)>0,'pixel test starts with visible canvas ink');
      batch(['down',40,0,true],['move',40,10,true],['up',40,10,true]); render();
      check(alpha(0)===0&&alpha(-30)>0,'pixel eraser removes only touched canvas ink');
      reset(); line();
      batch(['down',0,30],['button',0,30,true],['move',40,0,true],['button',40,0,false]);
      check(drawing.native&&drawing.tool==='pen'&&drawing.points.length===0,'ordered button release restores pen without a dot');
      batch(['up',40,0]);
      check(strokes.every(s=>s.tool!=='pen'||s.points.every(p=>p.y!==pixel.y)),'release while stationary does not leave pen ink on erased stroke');
      batch(['button',0,0,false]);
      check(!nativeStylusButton,'queued idle release clears held indicator');
      advance(250); batch(['down',0,50],['move',20,50],['down',0,70],['move',40,70],['up',40,70]);
      check(drawing===null,'new native contact recovers a missing up');
      for(const mode of ['stroke','pixel']) {
        reset(mode); line();
        batch(['down',40,0,true],['button',40,0,false]);
        const before=strokes.slice(),undoBefore=undoStack.length;
        batch(['move',42,2]); advance(249); batch(['move',44,4],['up',46,6]);
        check(!strokes.some(s=>s.tool==='pen'&&s!==before[0]),mode+': releasing button while lifting leaves no pen dot');
        const savedCount=strokes.length,undoCount=undoStack.length;
        batch(['down',0,30],['move',10,30],['up',10,30]);
        check(strokes.length===savedCount&&undoStack.length===undoCount,mode+': contact within 250 ms leaves no ink or empty undo');
        advance(1); batch(['down',0,40],['move',30,40],['up',30,40]);
        check(strokes.at(-1).tool==='pen'&&strokes.at(-1).points.length===2,mode+': pen works at 250 ms boundary');
        batch(['down',40,0,true],['button',40,0,false],['move',40,10]);
        check(drawing.points.length===0,mode+': release starts a new protection interval');
        advance(249); batch(['move',50,20]);
        check(drawing.points.length===0,mode+': moving does not end protection early');
        advance(1); batch(['move',60,30],['move',70,30],['up',70,30]);
        check(strokes.at(-1).tool==='pen'&&strokes.at(-1).points.length===2,mode+': continuous contact resumes without eraser bridge');
        batch(['down',60,30,true],['button',60,30,false],['button',60,30,true],['move',70,30,true]);
        check(drawing.native&&drawing.tool==='eraser'&&drawing.points.length>0,mode+': repressing button erases during pen protection');
        batch(['up',70,30,true]);
      }
      reset();
      // Exercise browser pen input separately, including hover and chorded button releases.
      delete window.FormaAndroid;
      canvas.setPointerCapture=()=>{};
      const web=(type,dx,dy,buttons,pressure=.6,button=-1)=>({type,pointerType:'pen',pointerId:8,clientX:x+dx,clientY:y+dy,buttons,button,pressure,preventDefault(){}});
      canvas.onpointermove(web('pointermove',0,0,2,0,2));
      check(drawing===null,'hover with barrel button never draws');
      canvas.onpointermove(web('pointermove',0,0,0,0)); advance(250);
      canvas.onpointerdown(web('pointerdown',0,0,1,.6,0));
      canvas.onpointermove(web('pointermove',80,0,1));canvas.onpointerup(web('pointerup',80,0,0,0,0));
      canvas.onpointerdown(web('pointerdown',40,0,2,.6,2));
      check(drawing.tool==='eraser'&&strokes.length===0,'browser barrel-only contact erases');
      canvas.onpointermove(web('pointermove',40,0,1,.6,2));
      check(drawing.tool==='pen'&&drawing.points.length===0,'browser release suppresses lift-off ink');
      advance(250); canvas.onpointermove(web('pointermove',40,10,1));
      check(drawing.points.length===1,'browser pen resumes after protection expires');
      canvas.onpointerup(web('pointerup',40,0,0,0,0));
      check(!webStylusButton&&drawing===null,'browser pointerup clears tool state');
      return results;
    });
    assert.deepEqual(errors, []);
    console.log('PASS stylus drawing checks:',report.length);
    for(const row of report) console.log('  '+row);
  } finally {
    if(browser)await browser.close();
    await new Promise(resolve=>server.close(resolve));
  }
})().catch(error=>{console.error(error);process.exitCode=1;});
