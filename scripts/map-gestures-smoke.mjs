import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
const context = await browser.newContext({ viewport: { width:390, height:844 }, hasTouch:true, isMobile:true, timezoneId:'Asia/Bangkok' });
const page = await context.newPage();
const cdp = await context.newCDPSession(page);
const errors = [];
page.on('pageerror', error => errors.push(error.message));
await page.route('https://alasky.cds.unistra.fr/**', route => route.abort());
const map = page.locator('.sky-map');
let center;
const svg = page.locator('.sky-map-svg');
const state = () => map.evaluate(el => ({ zoom:Number(el.dataset.zoom), x:Number(el.dataset.panX), y:Number(el.dataset.panY), rotation:Number(el.dataset.rotation) }));
const selection = () => page.locator('.star-card .star-identity h2').innerText();
const touch = (type, points=[]) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints:points.map((point,index) => ({ id:index+1, x:point.x, y:point.y, radiusX:3, radiusY:3, force:1 })) });
const lerp = (a,b,t) => ({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});
async function pinch(first, second, ratio) {
  const midpoint={x:(first.x+second.x)/2,y:(first.y+second.y)/2};
  const ends=[first,second].map(p=>({x:midpoint.x+(p.x-midpoint.x)*ratio,y:midpoint.y+(p.y-midpoint.y)*ratio}));
  await touch('touchStart',[first,second]);
  for(let i=1;i<=9;i++) await touch('touchMove',[lerp(first,ends[0],i/9),lerp(second,ends[1],i/9)]);
  await touch('touchEnd');
  return midpoint;
}
async function drag(from,to,{cancel=false}={}) {
  await touch('touchStart',[from]);
  for(let i=1;i<=7;i++) await touch('touchMove',[lerp(from,to,i/7)]);
  await touch(cancel?'touchCancel':'touchEnd');
}
async function centerCanvas() {
  await svg.scrollIntoViewIfNeeded();
  return svg.evaluate(el=>{const b=el.getBoundingClientRect();return {x:b.x+b.width/2,y:b.y+b.height/2,width:b.width,height:b.height,left:b.left,right:b.right};});
}
const reset=async()=>{await page.locator('.sky-map .map-reset').click();center=await centerCanvas();};
async function marker(selector) {
  return page.locator(selector).evaluateAll(nodes=>{
    const canvas=document.querySelector('.sky-map-svg').getBoundingClientRect();
    const center={x:canvas.x+canvas.width/2,y:canvas.y+canvas.height/2};
    return nodes.map(el=>{
      const circle=el.querySelector('.star-hit-area,.planet-hit');
      const b=circle.getBoundingClientRect();
      return {id:el.dataset.star||el.dataset.planet,x:b.x+b.width/2,y:b.y+b.height/2};
    }).filter(p=>p.x>canvas.left+55&&p.x<canvas.right-85&&p.y>60&&p.y<innerHeight-60&&document.elementFromPoint(p.x,p.y)?.closest('[data-star],[data-planet]'))
      .sort((a,b)=>Math.hypot(a.x-center.x,a.y-center.y)-Math.hypot(b.x-center.x,b.y-center.y))[0];
  });
}
const markerPosition=id=>page.locator(`[data-star="${id}"] .star-hit-area,[data-planet="${id}"] .planet-hit`).evaluate(el=>{const b=el.getBoundingClientRect();return {x:b.x+b.width/2,y:b.y+b.height/2};});

try {
  await mkdir('test-results',{recursive:true});
  await page.goto(process.env.SKY_TEST_URL||'http://127.0.0.1:5180/Sky/',{waitUntil:'networkidle'});
  const overview=page.getByRole('button',{name:'แผนที่วงกลม',exact:true});
  if(await overview.count()) await overview.click();
  await page.locator('.date-control').click();
  await page.getByLabel('วันและเวลา',{exact:true}).fill('2026-12-15T22:00');
  await page.getByRole('button',{name:'แสดงท้องฟ้า',exact:true}).click();
  center=await centerCanvas();
  assert.equal((await state()).zoom,1);
  assert.equal(await svg.evaluate(el=>getComputedStyle(el).touchAction),'none','only the canvas owns map gestures');
  assert.notEqual(await page.locator('body').evaluate(el=>getComputedStyle(el).touchAction),'none','page zoom and scrolling are not disabled globally');
  const browserScale=await page.evaluate(()=>visualViewport.scale);
  const chosen=await marker('.map-star[aria-pressed="false"]');
  assert.ok(chosen,'a tappable star is available near the gesture center');
  const beforeSelection=await selection();
  const second={x:chosen.x+44,y:chosen.y};
  const before=await state();
  const midpoint=await pinch(chosen,second,1.7);
  const after=await state();
  assert.ok(after.zoom>1.5&&after.zoom<1.9,'real two-finger touch zooms the map');
  assert.deepEqual(await selection(),beforeSelection,'pinching from a star does not select it');
  const starAfter=await markerPosition(chosen.id);
  const ratio=after.zoom/before.zoom;
  assert.ok(Math.abs(starAfter.x-(midpoint.x+(chosen.x-midpoint.x)*ratio))<3,'pinch preserves the horizontal gesture anchor');
  assert.ok(Math.abs(starAfter.y-(midpoint.y+(chosen.y-midpoint.y)*ratio))<3,'pinch preserves the vertical gesture anchor');
  assert.equal(await page.evaluate(()=>visualViewport.scale),browserScale,'canvas gesture does not zoom the browser page');

  const pannedBefore=await state();
  await drag({x:center.x-25,y:center.y-18},{x:center.x+25,y:center.y+20});
  const pannedAfter=await state();
  assert.ok(Math.abs(pannedAfter.x-pannedBefore.x)>10&&Math.abs(pannedAfter.y-pannedBefore.y)>10,'zoomed map pans horizontally and vertically');
  assert.equal(pannedAfter.rotation,pannedBefore.rotation,'panning does not unexpectedly rotate the view');
  await reset();
  assert.deepEqual(await state(),{zoom:1,x:0,y:0,rotation:0},'reset restores the complete map view');

  await drag({x:center.x-35,y:center.y},{x:center.x+35,y:center.y});
  assert.ok(Math.abs((await state()).rotation)>1,'single finger rotates the overview');
  await reset();
  const tapStar=await marker('.map-star[aria-pressed="false"]');
  await page.touchscreen.tap(tapStar.x,tapStar.y);
  assert.equal(await page.locator(`[data-star="${tapStar.id}"]`).getAttribute('aria-pressed'),'true','ordinary tap still selects a star');

  await svg.focus();
  await page.keyboard.press('+');
  const keyZoom=await state();
  assert.ok(keyZoom.zoom>1,'keyboard zoom remains available');
  await page.keyboard.press('ArrowRight');
  assert.notEqual((await state()).x,keyZoom.x,'arrow keys pan the magnified map');
  await reset();

  // Browser cancellation must not leave a stale drag active for the next touch.
  await drag({x:center.x-20,y:center.y},{x:center.x+20,y:center.y},{cancel:true});
  const cancelled=await state();
  await touch('touchStart',[{x:center.x,y:center.y+20}]);
  await touch('touchEnd');
  assert.deepEqual(await state(),cancelled,'cancelled gesture does not move on the next tap');
  await reset();

  await svg.evaluate(el=>el.addEventListener('pointerdown',event=>{window.__mapGesturePointer=event.pointerId;},{once:true}));
  await touch('touchStart',[{x:center.x,y:center.y}]);
  await svg.evaluate(el=>el.dispatchEvent(new PointerEvent('lostpointercapture',{bubbles:true,pointerId:window.__mapGesturePointer,pointerType:'touch'})));
  await touch('touchMove',[{x:center.x+45,y:center.y+25}]);
  await touch('touchEnd');
  assert.deepEqual(await state(),{zoom:1,x:0,y:0,rotation:0},'lost capture cleans up pointer state');
  await page.screenshot({path:'test-results/map-touch-mobile.png'});

  // A planet is also an interactive target; it must not block a two-finger zoom.
  const planet=await marker('.map-planet');
  if(planet){
    const currentSelection=await selection();
    await pinch(planet,{x:planet.x+40,y:planet.y},1.5);
    assert.ok((await state()).zoom>1.3,'pinch also starts on a planet marker');
    assert.deepEqual(await selection(),currentSelection,'pinching on a planet does not accidentally select it');
    await reset();
  } else throw new Error('The fixed observation date should provide a planet for the pinch regression');

  for(const viewport of [{width:320,height:700},{width:390,height:844}]){
    await page.setViewportSize(viewport);
    const c=await centerCanvas();
    await pinch({x:c.x-22,y:c.y},{x:c.x+22,y:c.y},1.5);
    assert.ok((await state()).zoom>1.3);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'mobile gestures do not cause page overflow');
    await reset();
  }
  assert.deepEqual(errors,[],'no browser errors during touch/cancel/keyboard interactions');
  console.log('PASS: real touch pinch on stars/planets, midpoint anchoring, two-axis pan, overview rotation, tap selection, keyboard zoom/pan, cancel/lost-capture cleanup, reset, browser zoom isolation, and 320/390px layouts.');
} finally { await browser.close(); }
