import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const base=process.env.SKY_TEST_URL||'http://127.0.0.1:5173/Sky/';
const errors=[];
async function createPage(){
  const page=await browser.newPage({viewport:{width:390,height:844}});
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://alasky.cds.unistra.fr/**',route=>route.abort());
  return page;
}
async function choose(page,name){
  await page.getByRole('textbox',{name:'ค้นหาดาวหรือกลุ่มดาว'}).fill(name);
  await page.locator('.search-results button').first().click();
}
try {
  await mkdir('test-results',{recursive:true});
  const page=await createPage();
  await page.goto(base,{waitUntil:'networkidle'});
  await choose(page,'Saturn');
  await page.locator('.planet-card .star-more').click();
  const model=page.locator('[data-model-object="saturn"]');
  await model.locator('canvas').waitFor();
  await page.waitForFunction(()=>document.querySelector('[data-model-object="saturn"]')?.dataset.textureStatus==='ready');
  assert.equal(await model.getAttribute('data-model-status'),'ready');
  const stage=model.locator('.model-stage');
  const initial=await stage.getAttribute('data-view');
  await model.getByRole('button',{name:'หมุนโมเดลไปทางขวา',exact:true}).click();
  assert.notEqual(await stage.getAttribute('data-view'),initial);
  await model.getByRole('button',{name:'ขยายโมเดล 3 มิติ',exact:true}).click();
  await model.getByRole('button',{name:'คืนมุมมอง 3 มิติ',exact:true}).click();
  assert.equal(await stage.getAttribute('data-view'),initial);
  await stage.focus();
  await page.keyboard.press('ArrowLeft');
  assert.notEqual(await stage.getAttribute('data-view'),initial);
  await model.getByLabel('เส้นอ้างอิงบนแบบจำลอง').check();
  const box=await stage.boundingBox();
  await page.mouse.move(box.x+box.width*.4,box.y+box.height*.4);
  await page.mouse.down();await page.mouse.move(box.x+box.width*.7,box.y+box.height*.5,{steps:8});await page.mouse.up();
  const dragged=await stage.getAttribute('data-view');
  assert.notEqual(dragged,initial);
  await model.getByRole('button',{name:'คืนมุมมอง 3 มิติ',exact:true}).click();
  await page.getByRole('dialog').screenshot({path:'test-results/saturn-3d.png'});
  assert.match(await model.innerText(),/วงแหวนหลัก A, B และ C/);
  assert.match(await model.innerText(),/ไม่ใช่เฟส/);
  await page.getByRole('button',{name:'ปิดหน้าต่าง',exact:true}).click();
  assert.equal(await page.locator('.model-stage canvas').count(),0,'closing disposes and removes the model canvas');

  for(const [name,id,textured] of [['Mars','mars',true],['Jupiter','jupiter',true],['Mercury','mercury',false],['Uranus','uranus',false],['Venus','venus',false],['Neptune','neptune',false]]){
    await choose(page,name);await page.locator('.planet-card .star-more').click();
    await page.locator(`[data-model-object="${id}"][data-model-status="ready"]`).waitFor();
    if(textured)await page.locator(`[data-model-object="${id}"][data-texture-status="ready"]`).waitFor();
    else assert.equal(await page.locator('.celestial-model').getAttribute('data-texture-status'),'none');
    if(id==='venus'||id==='neptune'){
      await page.locator('.model-map-options button').nth(1).click();
      await page.locator(`[data-model-object="${id}"][data-texture-status="ready"]`).waitFor();
      assert.match(await page.locator('.model-source').innerText(),/ปรับ|สีสำหรับ/);
    }
    await page.getByRole('button',{name:'ปิดหน้าต่าง',exact:true}).click();
  }
  await choose(page,'Aldebaran');await page.getByRole('button',{name:'ดูแบบจำลอง 3 มิติ',exact:true}).click();
  await page.locator('[data-model-object="aldebaran"][data-model-status="ready"]').waitFor();
  assert.equal(await page.locator('.celestial-model').getAttribute('data-model-kind'),'star');
  assert.match(await page.locator('.celestial-model').innerText(),/ไม่ใช่ภาพถ่ายหรือรูปร่างที่วัดได้/);
  assert.equal(await page.getByRole('button',{name:'ดูภาพถ่ายจริงบริเวณดาวอัลเดบารัน',exact:true}).count(),2);
  await page.getByRole('dialog').screenshot({path:'test-results/aldebaran-3d.png'});
  await page.locator('.model-stage canvas').evaluate(canvas=>canvas.getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());
  await page.locator('[data-model-status="lost"]').waitFor();
  await page.getByRole('button',{name:'ลองเปิด 3 มิติอีกครั้ง',exact:true}).click();
  await page.locator('[data-model-status="ready"]').waitFor();
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.close();

  const fallback=await createPage();
  await fallback.addInitScript(()=>{
    const original=HTMLCanvasElement.prototype.getContext;
    window.__fail3d=true;
    HTMLCanvasElement.prototype.getContext=function(type,...args){return window.__fail3d&&['webgl','webgl2','experimental-webgl'].includes(type)?null:original.call(this,type,...args);};
  });
  await fallback.goto(base,{waitUntil:'networkidle'});
  await choose(fallback,'Mars');await fallback.locator('.planet-card .star-more').click();
  await fallback.locator('[data-model-status="unavailable"]').waitFor();
  assert.match(await fallback.locator('.planet-details').innerText(),/ดาวอังคาร/);
  await fallback.evaluate(()=>window.__fail3d=false);
  await fallback.getByRole('button',{name:'ลองเปิด 3 มิติอีกครั้ง',exact:true}).click();
  await fallback.locator('[data-model-status="ready"][data-texture-status="ready"]').waitFor();
  await fallback.close();

  const failedMap=await createPage();let fail=true;
  await failedMap.route('**/textures/jupiter.jpg',route=>fail?route.abort():route.continue());
  await failedMap.goto(base,{waitUntil:'networkidle'});
  await choose(failedMap,'Jupiter');await failedMap.locator('.planet-card .star-more').click();
  await failedMap.locator('[data-texture-status="error"]').waitFor();
  assert.match(await failedMap.locator('.model-texture-error').innerText(),/เฉพาะรูปร่างและสีโดยประมาณ/);
  fail=false;await failedMap.getByRole('button',{name:'ลองโหลดใหม่',exact:true}).click();
  await failedMap.locator('[data-texture-status="ready"]').waitFor();
  await failedMap.close();
  assert.deepEqual(errors,[]);
  console.log('PASS: real WebGL render, all seven planets, local NASA maps, opt-in processed maps, star labels, drag/keyboard/zoom/reset, cleanup, context-loss recovery, missing WebGL and texture retry.');
} finally {await browser.close();}
