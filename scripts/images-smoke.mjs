import { chromium } from 'playwright';
import assert from 'node:assert/strict';

// A tiny image is a UI test fixture only. It is never shipped as a star photo.
const fixture=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aJ1sAAAAASUVORK5CYII=','base64');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const base=process.env.SKY_TEST_URL||'http://127.0.0.1:5173/Sky/?view=map';
const errors=[];
async function createPage(fail=false){
  const page=await browser.newPage({viewport:{width:390,height:844}});
  page.on('pageerror',error=>errors.push(error.message));
  const control={fail};
  await page.route('https://alasky.cds.unistra.fr/**',route=>control.fail?route.abort('failed'):route.fulfill({status:200,contentType:'image/png',body:fixture}));
  await page.goto(base,{waitUntil:'networkidle'});
  return {page,control};
}
async function choose(page,name){
  await page.getByRole('textbox',{name:'ค้นหาดาวหรือกลุ่มดาว'}).fill(name);
  await page.locator('.search-results button').first().click();
}
try{
  const {page}=await createPage();
  await choose(page,'Aldebaran');
  await page.locator('.star-photo-button img.ready').waitFor();
  await page.getByRole('button',{name:'ดูภาพถ่ายจริงบริเวณดาวอัลเดบารัน',exact:true}).click();
  const dialog=page.getByRole('dialog',{name:'ภาพดาวอัลเดบารัน',exact:true});
  await dialog.locator('.photo-ready').waitFor();
  const url=new URL(await dialog.locator('.photo-scroll img').getAttribute('src'));
  assert.equal(Number(url.searchParams.get('ra')),68.9805);
  assert.equal(Number(url.searchParams.get('dec')),16.5093);
  assert.equal(await dialog.locator('.star-photo-viewer').getAttribute('data-photo-star'),'aldebaran');
  assert.ok((await dialog.locator('.photo-explanation').innerText()).includes('ไม่ใช่ภาพรายละเอียดผิวดาว'));
  assert.ok((await dialog.locator('.photo-credit').innerText()).includes('DSS2'));
  await dialog.getByRole('button',{name:'ขยายภาพดาว',exact:true}).click();
  assert.equal(await dialog.locator('.photo-scroll img').evaluate(el=>el.style.width),'150%');
  await dialog.getByRole('button',{name:'คืนขนาดภาพดาว',exact:true}).click();
  assert.equal(await dialog.locator('.photo-scroll img').evaluate(el=>el.style.width),'100%');
  await page.keyboard.press('Escape');
  await choose(page,'Sirius');
  await page.getByRole('button',{name:'ดูภาพถ่ายจริงบริเวณดาวซิริอุส',exact:true}).click();
  const sirius=page.getByRole('dialog',{name:'ภาพดาวซิริอุส',exact:true});
  await sirius.locator('.photo-ready').waitFor();
  const nextUrl=new URL(await sirius.locator('.photo-scroll img').getAttribute('src'));
  assert.equal(Number(nextUrl.searchParams.get('ra')),101.2875);
  assert.notEqual(nextUrl.href,url.href,'selection never reuses another star image');
  await page.getByRole('button',{name:'ปิดหน้าต่าง',exact:true}).click();
  await page.getByRole('button',{name:'อ่านนิทานของดาวดวงนี้',exact:true}).click();
  const story=page.getByRole('dialog',{name:'นิทานดวงดาว',exact:true});
  await story.locator('.story-photo-hero img.ready').waitFor();
  assert.equal(await story.locator('.story-photo-hero img').getAttribute('src'),nextUrl.href,'story hero uses the selected star photo, not a sparkle icon');
  await story.getByRole('button',{name:'ดูภาพถ่ายจริงบริเวณดาวซิริอุส',exact:true}).click();
  await sirius.locator('.photo-ready').waitFor();
  await page.getByRole('button',{name:'ปิดหน้าต่าง',exact:true}).click();
  await story.waitFor();
  assert.equal(await story.locator('.star-story').getAttribute('data-story-id'),'sirius','closing enlarged photo returns to the same story');
  await story.getByRole('button',{name:'อ่านนิทานดวงถัดไป',exact:true}).click();
  await story.locator('.story-photo-hero img.ready').waitFor();
  assert.notEqual(await story.locator('.story-photo-hero img').getAttribute('src'),nextUrl.href,'changing story changes its photo');
  await story.getByRole('button',{name:'อ่านนิทานดวงก่อนหน้า',exact:true}).click();
  await page.getByRole('button',{name:'ปิดหน้าต่าง',exact:true}).click();
  await page.getByRole('button',{name:'แสดงแผนที่เต็มหน้าจอ',exact:true}).click();
  await page.getByRole('button',{name:'ดูภาพดาวที่เลือก',exact:true}).click();
  await sirius.locator('.photo-ready').waitFor();
  await page.getByRole('button',{name:'ปิดหน้าต่าง',exact:true}).click();
  assert.equal(await page.locator('.map-panel.is-fullscreen').count(),1);
  await page.getByRole('button',{name:'ออกจากโหมดเต็มจอ',exact:true}).click();
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.close();

  const failed=await createPage(true);
  await choose(failed.page,'Aldebaran');
  await failed.page.getByRole('button',{name:'อ่านนิทานของดาวดวงนี้',exact:true}).click();
  const failedStory=failed.page.getByRole('dialog',{name:'นิทานดวงดาว',exact:true});
  await failedStory.getByText('ยังโหลดภาพจริงไม่ได้ · แตะเพื่อลอง',{exact:true}).waitFor();
  await failedStory.getByRole('button',{name:'ดูภาพถ่ายจริงบริเวณดาวอัลเดบารัน',exact:true}).click();
  await failed.page.getByText('ยังโหลดภาพถ่ายจริงไม่ได้',{exact:true}).waitFor();
  assert.equal(await failed.page.locator('.photo-ready').count(),0,'failed images do not show a fake replacement');
  assert.ok((await failed.page.locator('.photo-error').innerText()).includes('ไม่ใช้รูปดาวอื่น'));
  failed.control.fail=false;
  await failed.page.getByRole('button',{name:'ลองโหลดอีกครั้ง',exact:true}).click();
  await failed.page.locator('.photo-ready').waitFor();
  await failed.page.getByRole('button',{name:'ปิดหน้าต่าง',exact:true}).click();
  await failedStory.locator('.story-photo-hero img.ready').waitFor();
  await failed.page.close();
  assert.deepEqual(errors,[]);
  console.log('PASS with mocked image responses: selected-star coordinates, thumbnail click, credits, truthful labels, zoom/reset, distinct star image URLs, fullscreen, mobile layout, unavailable-image state and retry. Live DSS2 image content is not verified by these tests.');
}finally{await browser.close();}
