import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, timezoneId: 'Asia/Bangkok' });
const base = process.env.SKY_TEST_URL || 'http://127.0.0.1:5173/Sky/';
const errors = [];
const createPage = async mode => {
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(mode => {
    window.__sensorPermissionRequests = 0;
    const Sensor = class extends Event {};
    if (mode !== 'absolute') Sensor.requestPermission = async () => {
      window.__sensorPermissionRequests++;
      if (mode === 'exception') throw Error('permission failed');
      return mode === 'denied' ? 'denied' : 'granted';
    };
    Object.defineProperty(window, 'DeviceOrientationEvent', { configurable: true, value: mode === 'unsupported' ? undefined : Sensor });
  }, mode);
  await page.goto(base, { waitUntil: 'networkidle' });
  return page;
};
const sample = (page, values, type='deviceorientation') => page.evaluate(({values,type}) => {
  const event = new Event(type);
  for (const [key,value] of Object.entries(values)) Object.defineProperty(event,key,{value});
  window.dispatchEvent(event);
}, {values,type});
const waitHeading = (page, expected) => page.waitForFunction(expected => {
  const element = document.querySelector('.sky-pointer');
  if (!element?.hasAttribute('data-heading')) return false;
  const h=Number(element.dataset.heading);
  return Math.abs(((h-expected+540)%360)-180)<2;
}, expected);

try {
  await mkdir('test-results',{recursive:true});
  const page = await createPage('granted');
  assert.equal(await page.evaluate(()=>window.__sensorPermissionRequests),0,'no automatic permission prompt');
  await page.getByRole('button',{name:'กรุงเทพฯ',exact:true}).click();
  await page.getByRole('button',{name:/ชุมพร/}).click();
  await page.getByRole('button',{name:'ส่องฟ้าตามมือถือ',exact:true}).click();
  assert.equal(await page.evaluate(()=>window.__sensorPermissionRequests),1,'permission is requested on tap');
  await page.locator('.sky-pointer').waitFor();
  await sample(page,{alpha:0,beta:90,gamma:0,absolute:false});
  assert.equal(await page.locator('.pointer-readout').count(),0,'relative data alone is rejected');
  await sample(page,{alpha:19,beta:135,gamma:0,absolute:false,webkitCompassHeading:0,webkitCompassAccuracy:10});
  await waitHeading(page,0);
  assert.equal(await page.getByRole('slider').isDisabled(),true,'pointing mode uses current time');
  const initial = await page.locator('.sky-pointer-svg').innerHTML();
  for(let i=0;i<20;i++){await sample(page,{alpha:19,beta:135,gamma:0,absolute:false,webkitCompassHeading:90,webkitCompassAccuracy:10});await page.waitForTimeout(45);}
  await waitHeading(page,90);
  assert.notEqual(await page.locator('.sky-pointer-svg').innerHTML(),initial,'turning changes projected sky');
  assert.ok(Number(await page.locator('.sky-pointer').getAttribute('data-altitude'))>40,'tilt changes altitude');
  assert.ok((await page.locator('.map-caption').innerText()).includes('ชุมพร'),'pointing uses selected location');
  await page.screenshot({path:'test-results/pointing-mobile.png',fullPage:true});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'pointing fits mobile');
  await page.getByRole('button',{name:'หยุดส่องฟ้า',exact:true}).click();
  await page.locator('.sky-map').waitFor();
  await sample(page,{beta:90,gamma:0,webkitCompassHeading:180});
  assert.equal(await page.locator('.sky-pointer').count(),0,'stop restores manual map and removes listener');
  assert.equal(await page.getByRole('slider').isDisabled(),false);
  await page.getByRole('button',{name:'ส่องฟ้าตามมือถือ',exact:true}).click();
  await sample(page,{beta:90,gamma:0,webkitCompassHeading:180});
  await waitHeading(page,180);
  await page.getByRole('button',{name:'กลุ่มดาว',exact:true}).click();
  await page.getByRole('button',{name:'สำรวจท้องฟ้า',exact:true}).click();
  assert.equal(await page.locator('.sky-pointer').count(),0,'leaving map stops sensors');

  for(const mode of ['denied','unsupported','exception']) {
    const p=await createPage(mode);
    await p.getByRole('button',{name:'ส่องฟ้าตามมือถือ',exact:true}).click();
    await p.getByRole('alert').waitFor();
    assert.equal(await p.locator('.sky-pointer').count(),0,`${mode} keeps manual map`);
    assert.ok(await p.locator('.sky-map-svg circle').count()>1000,`${mode} still renders stars`);
    await p.close();
  }
  const android=await createPage('absolute');
  await android.getByRole('button',{name:'ส่องฟ้าตามมือถือ',exact:true}).click();
  await sample(android,{alpha:270,beta:90,gamma:0,absolute:true},'deviceorientationabsolute');
  await waitHeading(android,90);
  assert.equal(await android.evaluate(()=>window.__sensorPermissionRequests),0,'Android path needs no Safari prompt');
  await android.getByRole('button',{name:'หยุดส่องฟ้า',exact:true}).click();
  await android.close();

  const timeout=await createPage('granted');
  await timeout.getByRole('button',{name:'ส่องฟ้าตามมือถือ',exact:true}).click();
  await timeout.getByRole('alert').waitFor({timeout:13000});
  assert.equal(await timeout.locator('.sky-pointer').count(),0,'no-data timeout restores manual map');
  assert.deepEqual(errors,[],'no browser runtime errors');
  console.log('PASS: simulated iPhone permission, compass + tilt projection, relative-data rejection, selected city, current time, stop/restart, navigation cleanup, denial, unsupported device, permission error, Android absolute orientation, no-data timeout, mobile layout. Real hardware calibration still requires a phone.');
} finally { await browser.close(); }
