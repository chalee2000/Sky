import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const base=process.env.SKY_TEST_URL||'http://127.0.0.1:5180/Sky/?view=map';
const errors=[];
async function createPage(unsupported=false,viewport={width:390,height:844}){
  const page=await browser.newPage({viewport});
  page.on('pageerror',error=>errors.push(error.message));
  await page.route('https://alasky.cds.unistra.fr/**',route=>route.abort());
  await page.addInitScript(unsupported=>{
    window.__geoWatches=[];window.__cleared=[];window.__sensorRequests=0;window.__pageHidden=false;
    Object.defineProperty(document,'hidden',{configurable:true,get:()=>window.__pageHidden});
    Object.defineProperty(Element.prototype,'requestFullscreen',{configurable:true,value:undefined});
    Object.defineProperty(navigator,'geolocation',{configurable:true,value:{
      watchPosition(success,error,options){window.__geoWatches.push({success,error,options});return window.__geoWatches.length-1;},
      clearWatch(id){window.__cleared.push(id);}
    }});
    const Sensor=class extends Event {static requestPermission(){window.__sensorRequests++;return Promise.resolve('granted');}};
    Object.defineProperty(window,'DeviceOrientationEvent',{configurable:true,value:unsupported?undefined:Sensor});
  },unsupported);
  await page.goto(base,{waitUntil:'networkidle'});
  return page;
}
const fix=(page,latitude,longitude,index=0)=>page.evaluate(({latitude,longitude,index})=>window.__geoWatches[index].success({coords:{latitude,longitude,accuracy:12,heading:180}}),{latitude,longitude,index});
const pose=(page,heading)=>page.evaluate(heading=>{
  const event=new Event('deviceorientation');
  Object.defineProperties(event,{beta:{value:135},gamma:{value:0},webkitCompassHeading:{value:heading},webkitCompassAccuracy:{value:10}});
  window.dispatchEvent(event);
},heading);
async function fillsSky(page){
  const viewport=await page.locator('.sky-viewport').boundingBox();
  const sky=await page.locator('.sky-pointer').boundingBox();
  assert.ok(Math.abs(viewport.width-sky.width)<2&&Math.abs(viewport.height-sky.height)<2,'sky fills available fullscreen area');
  assert.equal(await page.locator('.sky-map').count(),0,'the fullscreen view is not constrained to the all-sky circle');
  assert.ok(sky.height>350);
}
try{
  await mkdir('test-results',{recursive:true});
  const page=await createPage();
  assert.equal(await page.evaluate(()=>window.__geoWatches.length+window.__sensorRequests),0,'no permission requests before a gesture');
  await page.getByRole('button',{name:'เต็มจอและติดตามตำแหน่ง',exact:true}).click();
  await page.locator('.map-panel.is-fullscreen').waitFor();
  assert.equal(await page.evaluate(()=>window.__geoWatches.length),1);
  assert.equal(await page.evaluate(()=>window.__sensorRequests),1);
  await fix(page,10.493,99.18);await pose(page,0);
  await page.locator('.pointer-readout').waitFor();
  assert.match(await page.locator('.map-caption').innerText(),/10.49° N/);
  assert.match(await page.locator('.gps-status').innerText(),/12/);
  await fillsSky(page);
  const before=await page.locator('.sky-pointer-svg').innerHTML();
  await fix(page,13.7563,100.5018);
  assert.notEqual(await page.locator('.sky-pointer-svg').innerHTML(),before,'new GPS coordinates update projected stars');
  assert.equal(await page.locator('.sky-pointer').getAttribute('data-heading'),'0.0','GPS course never substitutes for compass heading');
  for(let i=0;i<16;i++){await pose(page,90);await page.waitForTimeout(45);}
  assert.ok(Number(await page.locator('.sky-pointer').getAttribute('data-heading'))>85,'device rotation changes view');
  assert.equal(await page.getByRole('slider').isDisabled(),true);
  await page.getByRole('button',{name:'ซูมเข้า',exact:true}).click();
  assert.ok(Number(await page.locator('.sky-pointer').getAttribute('data-fov'))<62);
  await page.screenshot({path:'test-results/immersive-gps-mobile.png'});
  await page.evaluate(()=>{window.__pageHidden=true;document.dispatchEvent(new Event('visibilitychange'));});
  assert.ok(await page.evaluate(()=>window.__cleared.includes(0)),'watch id zero is released in background');
  await page.evaluate(()=>{window.__pageHidden=false;document.dispatchEvent(new Event('visibilitychange'));});
  await page.waitForFunction(()=>window.__geoWatches.length===2);
  await fix(page,11,100,1);await fix(page,55,44,0);
  assert.match(await page.locator('.map-caption').innerText(),/11.00° N/,'late callbacks from old watch are ignored');
  await page.getByRole('button',{name:'เปลี่ยนตำแหน่งบนแผนที่เต็มจอ',exact:true}).click();
  await page.getByRole('button',{name:/ชุมพร/}).click();
  assert.ok(await page.evaluate(()=>window.__cleared.includes(1)));
  await fix(page,55,44,1);
  assert.match(await page.locator('.map-caption').innerText(),/ชุมพร/,'chosen city cannot be overwritten by a stopped watch');
  await page.getByRole('button',{name:'ติดตาม GPS',exact:true}).click();
  await fix(page,10.5,99.2,2);
  await page.getByRole('button',{name:'ออกจากโหมดเต็มจอ',exact:true}).click();
  await page.locator('.sky-map').waitFor();
  assert.ok(await page.evaluate(()=>window.__cleared.includes(2)),'exit releases GPS');
  assert.equal(await page.locator('.sky-pointer').count(),0,'exit stops sensors started by the combined action');
  await page.close();

  const manual=await createPage(true,{width:1920,height:1014});
  await manual.getByRole('button',{name:'แสดงแผนที่เต็มหน้าจอ',exact:true}).click();
  await manual.locator('.sky-pointer[data-manual="true"]').waitFor();
  assert.equal(await manual.evaluate(()=>window.__geoWatches.length),0,'manual fullscreen keeps location permission optional');
  await fillsSky(manual);
  await manual.locator('.sky-pointer').focus();await manual.keyboard.press('ArrowRight');
  assert.equal(await manual.locator('.sky-pointer').getAttribute('data-heading'),'5.0');
  const box=await manual.locator('.sky-pointer').boundingBox();
  await manual.mouse.move(box.x+box.width*.35,box.y+box.height*.35);await manual.mouse.down();
  await manual.mouse.move(box.x+box.width*.55,box.y+box.height*.5,{steps:10});await manual.mouse.up();
  assert.notEqual(await manual.locator('.sky-pointer').getAttribute('data-heading'),'5.0');
  await manual.getByRole('button',{name:'คืนมุมมองท้องฟ้าเต็มจอ',exact:true}).click();
  assert.equal(await manual.locator('.sky-pointer').getAttribute('data-heading'),'0.0');
  await manual.screenshot({path:'test-results/immersive-desktop.png'});
  await manual.keyboard.press('Escape');await manual.locator('.sky-map').waitFor();
  await manual.getByRole('button',{name:'เต็มจอและติดตามตำแหน่ง',exact:true}).click();
  await manual.evaluate(()=>window.__geoWatches[0].error({code:1}));
  await manual.locator('.sky-pointer[data-manual="true"]').waitFor();
  assert.match(await manual.locator('[data-location-status="denied"]').innerText(),/ยังไม่ได้รับอนุญาต/);
  assert.equal(await manual.getByRole('button',{name:'ติดตาม GPS',exact:true}).getAttribute('aria-pressed'),'false');
  await manual.setViewportSize({width:320,height:700});
  const exit=await manual.getByRole('button',{name:'ออกจากโหมดเต็มจอ',exact:true}).boundingBox();
  assert.ok(exit.x>=0&&exit.x+exit.width<=320,'exit remains reachable on a small phone');
  assert.ok(await manual.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await manual.close();
  assert.deepEqual(errors,[]);
  console.log('PASS: immersive fullscreen, GPS updates and accuracy, compass rotation, live time, zoom, manual drag/keyboard, permissions, background cleanup/resume, stale callbacks, city selection, exit cleanup, small screens.');
}finally{await browser.close();}
