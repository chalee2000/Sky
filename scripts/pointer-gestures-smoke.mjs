import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.route('https://alasky.cds.unistra.fr/**',route=>route.abort());
await page.addInitScript(()=>{
  Object.defineProperty(Element.prototype,'requestFullscreen',{configurable:true,value:undefined});
  class Sensor extends Event {static requestPermission(){return Promise.resolve('granted');}}
  Object.defineProperty(window,'DeviceOrientationEvent',{configurable:true,value:Sensor});
});
const client=await page.context().newCDPSession(page);
const touch=async(type,points)=>{await client.send('Input.dispatchTouchEvent',{type,touchPoints:points.map(([id,x,y])=>({id,x,y,radiusX:2,radiusY:2,force:1}))});await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));};
const sky=page.locator('.sky-pointer');
const scale=async()=>Number(await sky.getAttribute('data-zoom'));
const pose=heading=>page.evaluate(heading=>{
  const event=new Event('deviceorientation');
  Object.defineProperties(event,{beta:{value:135},gamma:{value:0},webkitCompassHeading:{value:heading},webkitCompassAccuracy:{value:10}});
  window.dispatchEvent(event);
},heading);
try{
  await page.goto(process.env.SKY_TEST_URL||'http://127.0.0.1:5180/Sky/',{waitUntil:'networkidle'});
  if(await page.locator('.sky-home').count()){
    assert.equal(await sky.getAttribute('data-projection'),'stereographic');
    const dome=await page.locator('.sky-pointer-svg').boundingBox();
    const dx=dome.x+dome.width/2,dy=dome.y+dome.height*.52;
    await touch('touchStart',[[1,dx-25,dy],[2,dx+25,dy]]);
    await touch('touchMove',[[1,dx-60,dy],[2,dx+60,dy]]);
    await touch('touchEnd',[]);
    assert.ok(await scale()>2,'pinch works in the default full-page dome');
    await page.getByRole('button',{name:'คืนมุมมองท้องฟ้าเต็มจอ',exact:true}).click();
    const before=await sky.getAttribute('data-heading');
    await touch('touchStart',[[1,dx,dy]]);
    await touch('touchMove',[[1,dx+35,dy+10]]);
    await touch('touchEnd',[]);
    assert.notEqual(await sky.getAttribute('data-heading'),before,'default dome turns with one finger');
  }
  await page.getByRole('button',{name:'แสดงแผนที่เต็มหน้าจอ',exact:true}).click();
  await sky.waitFor();
  const box=await page.locator('.sky-pointer-svg').boundingBox();
  const x=box.x+box.width/2,y=box.y+box.height*.38;
  await touch('touchStart',[[1,x-28,y],[2,x+28,y]]);
  for(let n=1;n<=6;n++)await touch('touchMove',[[1,x-28-n*9,y],[2,x+28+n*9,y]]);
  assert.ok(await scale()>2.7,'two fingers zoom the manual sky');
  // Lifting one finger must preserve the other captured pointer for dragging.
  await touch('touchEnd',[[2,x+82,y]]);
  const heading=await sky.getAttribute('data-heading');
  await touch('touchMove',[[1,x-52,y+10]]);
  await touch('touchEnd',[]);
  assert.notEqual(await sky.getAttribute('data-heading'),heading,'remaining finger can turn after pinch');
  await page.getByRole('button',{name:'คืนมุมมองท้องฟ้าเต็มจอ',exact:true}).click();
  assert.equal(await scale(),1);
  assert.equal(await sky.getAttribute('data-heading'),'0.0');
  // Cancellation ends the old gesture and the next drag starts cleanly.
  await touch('touchStart',[[1,x-25,y],[2,x+25,y]]);
  await touch('touchMove',[[1,x-45,y],[2,x+45,y]]);
  await touch('touchCancel',[]);
  const afterCancel=await scale();
  await touch('touchStart',[[3,x,y]]);
  await touch('touchMove',[[3,x+20,y+5]]);
  await touch('touchEnd',[]);
  assert.equal(await scale(),afterCancel,'cancelled fingers do not remain in a pinch');
  await page.getByRole('button',{name:'คืนมุมมองท้องฟ้าเต็มจอ',exact:true}).click();
  // Start directly on an object, without turning the gesture into selection.
  const marker=await page.locator('.pointer-star[aria-pressed="false"] .pointer-star-hit').evaluateAll(nodes=>nodes.map(el=>{const r=el.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};}).find(p=>p.x>70&&p.x<innerWidth-70&&p.y>180&&p.y<innerHeight-210));
  if(marker){
    const previous=await page.locator('.star-identity h2').innerText();
    await touch('touchStart',[[1,marker.x,marker.y],[2,marker.x+35,marker.y]]);
    await touch('touchMove',[[1,marker.x-25,marker.y],[2,marker.x+60,marker.y]]);
    await touch('touchEnd',[]);
    assert.ok(await scale()>2,'pinch starts on a star');
    assert.equal(await page.locator('.star-identity h2').innerText(),previous,'pinch does not select its starting star');
    await page.getByRole('button',{name:'คืนมุมมองท้องฟ้าเต็มจอ',exact:true}).click();
    const tapName=await page.locator('.pointer-star[aria-pressed="false"]').evaluateAll(nodes=>nodes.find(node=>{
      const r=node.querySelector('.pointer-star-hit').getBoundingClientRect();
      return document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('.pointer-star')===node;
    })?.getAttribute('aria-label'));
    assert.ok(tapName,'an unobstructed star is available for a fresh tap');
    const tap=page.getByRole('button',{name:tapName,exact:true});
    await tap.locator('.pointer-star-hit').tap();
    assert.equal(await page.getByRole('button',{name:tapName,exact:true}).getAttribute('aria-pressed'),'true','a fresh tap selects after the gesture');
  }
  await page.getByRole('button',{name:'ส่องฟ้าตามมือถือ',exact:true}).click();
  await pose(35);await page.waitForFunction(()=>document.querySelector('.sky-pointer')?.dataset.manual==='false');
  const compass=await sky.getAttribute('data-heading');
  const sensorBox=await page.locator('.sky-pointer-svg').boundingBox();
  const sx=sensorBox.x+sensorBox.width/2,sy=sensorBox.y+sensorBox.height*.38;
  await touch('touchStart',[[1,sx-30,sy],[2,sx+30,sy]]);
  await touch('touchMove',[[1,sx-75,sy],[2,sx+75,sy]]);
  await touch('touchEnd',[]);
  assert.ok(await scale()>2,'pinch works while compass tracking is active');
  assert.equal(await sky.getAttribute('data-heading'),compass,'pinch preserves compass heading');
  await touch('touchStart',[[1,sx,sy]]);await touch('touchMove',[[1,sx+45,sy+25]]);await touch('touchEnd',[]);
  assert.equal(await sky.getAttribute('data-heading'),compass,'single-finger drag does not override compass');
  await sky.focus();for(let n=0;n<25;n++)await page.keyboard.press('+');
  assert.equal(await scale(),4,'keyboard zoom shares the 4x upper bound');
  assert.deepEqual(errors,[]);
  console.log('PASS: actual touch manual and compass pinch, remaining-finger drag, cancellation, object-start pinch/tap, compass preservation, 4x keyboard bound.');
}finally{await browser.close();}
