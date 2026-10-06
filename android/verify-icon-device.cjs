const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{execFileSync}=require('child_process');
const {chromium}=require(process.env.FORMA_PLAYWRIGHT||'playwright');
const adb=process.env.FORMA_ADB,serial=process.env.FORMA_TEST_SERIAL;
if(!adb||serial!=='emulator-5580')throw Error('Requires dedicated emulator-5580.');
const call=(...args)=>execFileSync(adb,['-s',serial,...args],{encoding:'utf8',timeout:20000});
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const launchers=()=>call('shell','cmd','package','query-activities','--brief','--components','-a','android.intent.action.MAIN','-c','android.intent.category.LAUNCHER','com.sapsoft.forma').trim().split(/\r?\n/).filter(s=>s.includes('com.sapsoft.forma/'));
(async()=>{
const cases=[['green','LauncherGreen'],['blue','LauncherBlue'],['amber','LauncherAmber'],['rose','LauncherRose'],['none','LauncherGray'],['lavender','LauncherLavender'],['custom','LauncherLavender','#8679a1']],transitions=[],browsers=[];
for(const [accent,alias,color] of cases){
 call('shell','input','keyevent','KEYCODE_WAKEUP');call('shell','wm','dismiss-keyguard');
 const current=launchers();assert.equal(current.length,1);assert(call('shell','am','start','-W','-n',current[0]).includes('Status: ok'));await pause(700);
 const pid=call('shell','pidof','com.sapsoft.forma').trim().split(' ')[0];assert(/^\d+$/.test(pid));call('forward','tcp:9225','localabstract:webview_devtools_remote_'+pid);
 const browser=await chromium.connectOverCDP('http://127.0.0.1:9225');
 browsers.push(browser);
 try{let page;for(const p of browser.contexts().flatMap(c=>c.pages()).filter(p=>p.url().includes('appassets.androidplatform.net')))if(await p.evaluate(()=>document.visibilityState==='visible'))page=p;assert(page,'Visible foreground WebView required');await page.waitForFunction(()=>typeof settings!=='undefined'&&window.FormaAndroid?.setLauncherAccent);
 await page.evaluate(({accent,color})=>{settings.accent=accent;if(color)settings.customAccent=color;applySettings();storeSettings();},{accent,color});await pause(250);
 call('shell','input','keyevent','KEYCODE_HOME');let active=[];
 for(let i=0;i<20;i++){await pause(500);active=launchers();if(active.length===1&&active[0].endsWith('.'+alias))break;}
 assert.equal(active.length,1,JSON.stringify(active));assert(active[0].endsWith('.'+alias),JSON.stringify(active));transitions.push({accent,alias,launcherCount:active.length});console.log('Verified',accent,alias);
 }finally{}
}
// Confirm persisted custom setting from the icon that was left enabled.
assert(call('shell','am','start','-W','-n',launchers()[0]).includes('Status: ok'));await pause(700);
const pid=call('shell','pidof','com.sapsoft.forma').trim().split(' ')[0];call('forward','tcp:9225','localabstract:webview_devtools_remote_'+pid);
const browser=await chromium.connectOverCDP('http://127.0.0.1:9225');try{const page=browser.contexts().flatMap(c=>c.pages()).find(p=>p.url().includes('appassets.androidplatform.net'));await page.waitForFunction(()=>typeof settings!=='undefined');assert.equal(await page.evaluate(()=>settings.accent),'custom');assert.equal(await page.evaluate(()=>settings.customAccent),'#8679a1');}finally{await browser.close().catch(()=>{});}
for(const b of browsers)await b.close().catch(()=>{});
const report={sdk:call('shell','getprop','ro.build.version.sdk').trim(),transitions,customColor:'#8679a1',preferenceRestored:true};fs.writeFileSync(path.join(__dirname,'../build/icon-device-verification.json'),JSON.stringify(report,null,2));console.log('PASS: actual Android icon changes, single launcher entry, launching from every icon, custom tone and persisted preference.',JSON.stringify(report));
})().catch(e=>{console.error(e);process.exitCode=1;});
