import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const errors=[];
const mock=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+X2ioAAAAASUVORK5CYII=','base64');
const base=process.env.SKY_TEST_URL||'http://127.0.0.1:5180/Sky/';
try{
  await mkdir('test-results',{recursive:true});
  for(const width of [1440,390,320]){
    const page=await browser.newPage({viewport:{width,height:width===1440?1000:844}});
    page.on('pageerror',e=>errors.push(e.message));
    await page.route('https://alasky.cds.unistra.fr/**',route=>route.fulfill({contentType:'image/png',body:mock}));
    await page.addInitScript(()=>Object.defineProperty(Element.prototype,'requestFullscreen',{configurable:true,value:undefined}));
    await page.goto(base,{waitUntil:'networkidle'});
    await page.locator('.home-date-control').click();
    await page.getByLabel('วันและเวลา',{exact:true}).fill('2026-11-08T21:00');
    await page.getByRole('button',{name:'แสดงท้องฟ้า',exact:true}).click();
    await page.locator('.sky-star-light').first().waitFor();
    await page.screenshot({path:`test-results/polished-home-${width}.png`});
    await page.locator('.sky-selection').click();
    await page.locator('.star-photo-viewer .photo-ready').waitFor();
    const url=new URL(await page.locator('.photo-scroll img').getAttribute('src'));
    assert.equal(url.searchParams.get('width'),'1024');
    await page.getByRole('button',{name:'ปิดหน้าต่าง',exact:true}).click();
    await page.getByRole('button',{name:'แสดงแผนที่เต็มหน้าจอ',exact:true}).click();
    await page.locator('.map-panel.is-fullscreen').waitFor();
    await page.locator('.sky-pointer').focus();
    for(let i=0;i<6;i++)await page.keyboard.press('ArrowLeft');
    for(let i=0;i<10;i++)await page.keyboard.press('ArrowUp');
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    const labels=await page.evaluate(()=>{
      const selectors='.pointer-star-label,.planet-map-label,.deep-sky-marker-label,.pointer-constellation-name text';
      const boxes=[...document.querySelectorAll(selectors)].map(el=>{const r=el.getBoundingClientRect();return{text:el.textContent,x:r.x,y:r.y,right:r.right,bottom:r.bottom};});
      const collisions=[];
      for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){
        const a=boxes[i],b=boxes[j];
        if(a.x<b.right-1&&a.right>b.x+1&&a.y<b.bottom-1&&a.bottom>b.y+1)collisions.push([a.text,b.text]);
      }
      return {count:boxes.length,collisions,overflow:document.documentElement.scrollWidth>innerWidth};
    });
    assert.ok(labels.count>0,'labels remain discoverable');
    assert.deepEqual(labels.collisions,[],`projected labels do not overlap at ${width}px`);
    assert.equal(labels.overflow,false);
    await page.screenshot({path:`test-results/polished-full-${width}.png`});
    await page.getByRole('button',{name:'สำรวจกาแล็กซีและกระจุกดาว',exact:true}).click();
    await page.getByLabel('ค้นหาในคลังกาแล็กซี',{exact:true}).fill('M31');
    await page.locator('[data-deep-sky-choice="m31"]').click();
    await page.locator('.deep-sky-photo-frame.ready').waitFor();
    const image=page.locator('.deep-sky-photo-scroll img');
    assert.equal(new URL(await image.getAttribute('src')).searchParams.get('width'),'1200');
    await page.getByRole('button',{name:'ขยายภาพกาแล็กซี',exact:true}).click();
    assert.equal(await image.evaluate(el=>el.style.width),'150%');
    await page.getByRole('button',{name:'คืนขนาดภาพกาแล็กซี',exact:true}).click();
    assert.equal(await image.evaluate(el=>el.style.width),'100%');
    await page.close();
  }
  assert.deepEqual(errors,[]);
  console.log('PASS: crisp catalog stars; real photo entry and high-resolution image requests; fullscreen labels avoid each other at 1440/390/320px; deep-sky photo zoom/reset; no runtime errors. Photo responses are mocked.');
}finally{await browser.close();}
