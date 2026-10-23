import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
const errors = [];
const base = process.env.SKY_TEST_URL || 'http://127.0.0.1:5173/Sky/';
const enter = page => page.getByRole('button', { name: 'แสดงแผนที่เต็มหน้าจอ', exact: true }).click();
const exit = page => page.getByRole('button', { name: 'ออกจากโหมดเต็มจอ', exact: true }).click();
async function coversViewport(page) {
  await page.waitForFunction(() => {
    const rect = document.querySelector('.map-panel')?.getBoundingClientRect();
    return rect && Math.abs(rect.x)<2 && Math.abs(rect.y)<2 && Math.abs(rect.width-innerWidth)<2 && Math.abs(rect.height-innerHeight)<2;
  });
}
async function createPage(mode, viewport={width:390,height:844}) {
  const page=await browser.newPage({viewport});
  page.on('pageerror', error=>errors.push(error.message));
  await page.addInitScript(mode=>{
    if (mode==='missing') Object.defineProperty(Element.prototype,'requestFullscreen',{configurable:true,value:undefined});
    if (mode==='rejected') Object.defineProperty(Element.prototype,'requestFullscreen',{configurable:true,value:()=>Promise.reject(new Error('Fullscreen not allowed'))});
  },mode);
  await page.goto(base,{waitUntil:'networkidle'});
  return page;
}
try {
  await mkdir('test-results',{recursive:true});
  const desktop=await createPage('native',{width:1280,height:800});
  const manifestUrl=new URL(await desktop.locator('link[rel="manifest"]').getAttribute('href'),desktop.url());
  const manifestResponse=await desktop.request.get(manifestUrl.href);
  assert.equal(manifestResponse.status(),200);
  const manifest=await manifestResponse.json();
  assert.equal(manifest.display,'standalone');
  assert.equal(manifest.start_url,'/Sky/');
  for(const icon of manifest.icons) {
    const response=await desktop.request.get(new URL(icon.src,manifestUrl).href);
    assert.equal(response.status(),200);
    assert.ok(response.headers()['content-type'].includes('image/png'));
    const data=await response.body();
    assert.equal(`${data.readUInt32BE(16)}x${data.readUInt32BE(20)}`,icon.sizes);
  }
  const appleIcon=await desktop.request.get(new URL(await desktop.locator('link[rel="apple-touch-icon"]').getAttribute('href'),desktop.url()).href);
  assert.equal(appleIcon.status(),200,'iPhone home-screen icon is available');
  await enter(desktop);
  await desktop.locator('.map-panel.is-fullscreen').waitFor();
  assert.equal(await desktop.evaluate(()=>document.fullscreenElement?.classList.contains('map-panel')),true,'desktop uses native fullscreen');
  await coversViewport(desktop);
  await exit(desktop);
  await desktop.waitForFunction(()=>!document.fullscreenElement && !document.querySelector('.map-panel.is-fullscreen'));
  await enter(desktop);
  await desktop.evaluate(()=>document.exitFullscreen());
  await desktop.waitForFunction(()=>!document.querySelector('.map-panel.is-fullscreen'));
  assert.equal(await desktop.locator('body').evaluate(el=>el.style.overflow),'','native browser exit restores scrolling');
  await desktop.close();

  for(const mode of ['missing','rejected']) {
    const page=await createPage(mode);
    const original=await page.locator('.map-panel').boundingBox();
    await page.getByRole('button',{name:'โหมดถนอมสายตา',exact:true}).click();
    await enter(page);
    await page.locator('.fullscreen-fallback').waitFor();
    await coversViewport(page);
    assert.equal(await page.locator('body').evaluate(el=>el.style.overflow),'hidden');
    assert.equal(await page.locator('.site-header').evaluate(el=>el.inert),true,'background navigation is inert');
    assert.equal(await page.getByRole('button',{name:'ออกจากโหมดเต็มจอ',exact:true}).evaluate(el=>el===document.activeElement),true,'focus moves to exit control');
    await page.getByRole('button',{name:'แสดงเส้นกลุ่มดาว',exact:true}).click();
    assert.equal(await page.locator('.pointer-constellation-lines').count(),0,'map controls work while expanded');
    await page.screenshot({path:`test-results/fullscreen-${mode}.png`});
    await page.keyboard.press('Escape');
    await page.waitForFunction(()=>!document.querySelector('.map-panel.is-fullscreen'));
    assert.equal(await page.locator('body').evaluate(el=>el.style.overflow),'');
    assert.equal(await page.locator('.site-header').evaluate(el=>el.inert),false);
    const restored=await page.locator('.map-panel').boundingBox();
    assert.ok(Math.abs(restored.height-original.height)<2,'exit restores original layout');
    await enter(page);
    await page.setViewportSize({width:320,height:700});
    await coversViewport(page);
    const close=await page.getByRole('button',{name:'ออกจากโหมดเต็มจอ',exact:true}).boundingBox();
    assert.ok(close.x>=0&&close.x+close.width<=320,'exit button fits a small phone');
    await page.setViewportSize({width:844,height:390});
    await coversViewport(page);
    await exit(page);
    await page.close();
  }

  const sensor=await createPage('missing');
  await sensor.evaluate(()=>{
    window.DeviceOrientationEvent=class extends Event {static requestPermission(){return Promise.resolve('granted');}};
  });
  await sensor.getByRole('button',{name:'ส่องฟ้าตามมือถือ',exact:true}).click();
  await sensor.evaluate(()=>{
    const event=new Event('deviceorientation');
    Object.defineProperties(event,{beta:{value:135},gamma:{value:0},webkitCompassHeading:{value:90}});
    window.dispatchEvent(event);
  });
  await sensor.locator('.pointer-readout').waitFor();
  await enter(sensor);
  await coversViewport(sensor);
  assert.equal(await sensor.locator('.sky-pointer').count(),1,'pointing mode survives fullscreen');
  const panel=await sensor.locator('.sky-pointer').boundingBox();
  assert.ok(panel.height>400,'sensor viewport expands');
  await exit(sensor);
  assert.equal(await sensor.locator('.sky-pointer').count(),1,'leaving fullscreen preserves sensors');
  await sensor.getByRole('button',{name:'หยุดส่องฟ้า',exact:true}).click();
  await sensor.close();
  assert.deepEqual(errors,[],'no browser runtime errors');
  console.log('PASS: native enter/exit, browser fullscreen exit, mobile API missing/rejected fallback, night mode, focus, background inert, scroll restoration, map controls, portrait/landscape resizing, sensor mode continuity.');
} finally {await browser.close();}
