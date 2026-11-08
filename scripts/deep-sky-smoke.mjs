import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';
import { deepSkyObjects, deepSkyPositions } from '../src/lib/deepSky.js';
import { deepSkyImage } from '../src/lib/deepSkyImages.js';

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
const base = process.env.SKY_TEST_URL || 'http://127.0.0.1:5180/Sky/';
const errors = [];
const imageMock = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+X2ioAAAAASUVORK5CYII=', 'base64');
const m31 = deepSkyObjects.find(object => object.id === 'm31');
const closeDialog = page => page.getByRole('button', { name: 'ปิดหน้าต่าง', exact: true }).click();
const settle = page => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));

async function createPage(viewport, fallback = true) {
  const page = await browser.newPage({ viewport, timezoneId: 'Asia/Bangkok' });
  page.on('pageerror', error => errors.push(error.message));
  // This tests photo identity and UI loading, not the contents of the external survey.
  await page.route('https://alasky.cds.unistra.fr/**', route => route.fulfill({ contentType: 'image/png', body: imageMock }));
  if (fallback) await page.addInitScript(() => Object.defineProperty(Element.prototype, 'requestFullscreen', { configurable: true, value: undefined }));
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.locator('.sky-home .sky-pointer').waitFor();
  return page;
}
async function setDate(page, value) {
  await page.locator('.home-date-control').click();
  await page.getByLabel('วันและเวลา', { exact: true }).fill(value);
  await page.getByRole('button', { name: 'แสดงท้องฟ้า', exact: true }).click();
  await settle(page);
}
async function search(page, query = 'M31') {
  await page.getByLabel('ค้นหาดาวหรือกลุ่มดาว', { exact: true }).fill(query);
  await page.locator('.search-results button').filter({ hasText: 'Andromeda Galaxy' }).click();
  await page.locator('[data-deep-sky-details="m31"]').waitFor();
}
async function assertNoOverflow(page) {
  const dimensions = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth,
    dialog: [...document.querySelectorAll('dialog[open]')].map(el => ({ width: el.clientWidth, scroll: el.scrollWidth, left: el.getBoundingClientRect().left, right: el.getBoundingClientRect().right })) }));
  assert.ok(dimensions.scroll <= dimensions.width + 1, `no page overflow at ${dimensions.width}px`);
  for (const dialog of dimensions.dialog) {
    assert.ok(dialog.scroll <= dialog.width + 1, 'dialog content fits without horizontal scrolling');
    assert.ok(dialog.left >= -1 && dialog.right <= dimensions.width + 1, 'dialog fits viewport');
  }
}
async function assertPhoto(page) {
  const image = page.locator('[data-deep-sky-photo="m31"] img');
  assert.equal(await image.getAttribute('src'), deepSkyImage(m31).url, 'M31 image uses its exact J2000 position and wide field');
  await page.locator('.deep-sky-photo-frame.ready').waitFor();
  assert.match(await image.getAttribute('alt'), /M31/);
  assert.ok(await page.getByRole('link', { name: 'ข้อมูลแค็ตตาล็อกของ M31' }).getAttribute('href'), 'source is linked');
}
async function tapUnobscuredMarker(page) {
  const point = await page.locator('.deep-sky-marker').evaluateAll(nodes => nodes.map(node => {
    const hit = node.querySelector('.deep-sky-hit').getBoundingClientRect();
    return { id: node.dataset.deepSky, x: hit.x + hit.width / 2, y: hit.y + hit.height / 2 };
  }).find(p => document.elementFromPoint(p.x, p.y)?.closest('[data-deep-sky]')?.dataset.deepSky === p.id));
  assert.ok(point, 'there is an unobscured selectable deep-sky marker');
  await page.mouse.click(point.x, point.y);
  await page.waitForFunction(id => document.querySelector(`[data-deep-sky="${id}"]`)?.getAttribute('aria-pressed') === 'true', point.id);
  return point.id;
}

try {
  await mkdir('test-results', { recursive: true });
  const page = await createPage({ width: 1440, height: 1000 });
  await setDate(page, '2026-11-08T20:00');
  const stars = await page.evaluate(async () => (await fetch(`${location.pathname}data/stars.json`)).json());
  assert.equal(stars.length, 15544);
  assert.equal(stars.filter(row => row[2] > 6 && row[2] <= 7).length, 10500, 'new fainter stars are present');

  await search(page);
  await assertPhoto(page);
  const factsBefore = await page.locator('.deep-sky-facts').innerText();
  await page.getByRole('button', { name: 'ดูตำแหน่งบนแผนที่' }).click();
  await page.locator('[data-deep-sky="m31"][aria-pressed="true"]').waitFor();
  const before = await page.locator('[data-deep-sky="m31"] .deep-sky-hit').getAttribute('cy');
  await setDate(page, '2026-11-08T22:00');
  assert.notEqual(await page.locator('[data-deep-sky="m31"] .deep-sky-hit').getAttribute('cy'), before, 'sky marker moves as observation time changes');
  await page.locator('.sky-selection').click();
  assert.notEqual(await page.locator('.deep-sky-facts').innerText(), factsBefore, 'detail altitude and direction use updated time');
  await closeDialog(page);
  await page.getByRole('button', { name: 'แสดงกาแล็กซีและวัตถุห้วงอวกาศลึก', exact: true }).click();
  assert.equal(await page.locator('.deep-sky-marker').count(), 0, 'layer toggle hides markers');
  await page.getByRole('button', { name: 'แสดงกาแล็กซีและวัตถุห้วงอวกาศลึก', exact: true }).click();
  assert.ok(await page.locator('.deep-sky-marker').count() > 0);

  await page.getByRole('button', { name: 'สำรวจกาแล็กซีและกระจุกดาว', exact: true }).click();
  await page.locator('.deep-sky-browser').waitFor();
  assert.equal(await page.locator('.deep-sky-tile').count(), deepSkyObjects.length);
  await page.locator('.deep-sky-categories').getByRole('button', { name: 'กระจุกดาว', exact: true }).click();
  assert.equal(await page.locator('.deep-sky-tile').count(), deepSkyObjects.filter(o => o.type === 'cluster').length);
  await page.getByLabel('เฉพาะเหนือขอบฟ้า').check();
  const aboveClusters = deepSkyPositions(new Date('2026-11-08T15:00:00Z'), 13.7563, 100.5018).filter(o => o.type === 'cluster' && o.altitude >= 0);
  assert.equal(await page.locator('.deep-sky-tile').count(), aboveClusters.length, 'horizon filter uses the selected date and location');
  await closeDialog(page);
  await page.getByRole('button', { name: 'แผนที่วงกลม', exact: true }).click();
  await page.locator('.sky-map-svg').scrollIntoViewIfNeeded();
  const circleId = await tapUnobscuredMarker(page);
  await page.locator(`[data-selected-deep-sky="${circleId}"]`).waitFor();
  await page.getByRole('button', { name: 'ท้องฟ้า 360°', exact: true }).click();
  await page.getByRole('button', { name: 'แสดงแผนที่เต็มหน้าจอ', exact: true }).click();
  await page.locator('.map-panel.fullscreen-fallback').waitFor();
  await page.getByRole('button', { name: 'สำรวจกาแล็กซีและกระจุกดาว', exact: true }).click();
  await page.getByLabel('ค้นหาในคลังกาแล็กซี', { exact: true }).fill('M31');
  await page.locator('[data-deep-sky-choice="m31"]').click();
  await assertPhoto(page);
  await closeDialog(page);
  assert.equal(await page.locator('.map-panel.is-fullscreen').count(), 1, 'closing details keeps fullscreen active');
  await page.getByRole('button', { name: 'ออกจากโหมดเต็มจอ', exact: true }).click();
  await assertNoOverflow(page);
  await search(page);
  await page.screenshot({ path: 'test-results/deep-sky-m31-desktop.png' });
  await page.close();

  for (const width of [320, 390]) {
    const mobile = await createPage({ width, height: 844 });
    await setDate(mobile, '2026-11-08T20:00');
    await mobile.locator('.site-header nav').getByRole('button', { name: 'กาแล็กซี', exact: true }).click();
    await mobile.locator('.deep-sky-browser').waitFor();
    await assertNoOverflow(mobile);
    await mobile.getByLabel('ค้นหาในคลังกาแล็กซี', { exact: true }).fill('M31');
    await mobile.locator('[data-deep-sky-choice="m31"]').click();
    await assertPhoto(mobile);
    await assertNoOverflow(mobile);
    await mobile.screenshot({ path: `test-results/deep-sky-m31-${width}.png` });
    await mobile.getByRole('button', { name: 'ดูตำแหน่งบนแผนที่' }).click();
    await mobile.locator('.sky-home [data-deep-sky="m31"]').waitFor();
    await mobile.getByRole('button', { name: /เครื่องมือและเวลา/ }).click();
    await assertNoOverflow(mobile);
    await settle(mobile);
    assert.equal(await mobile.locator('[data-deep-sky="m31"] .deep-sky-hit').evaluate(hit => {
      const r=hit.getBoundingClientRect();
      return document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('[data-deep-sky]')?.dataset.deepSky;
    }), 'm31', 'expanded mobile tools do not hide the selected galaxy');
    await mobile.screenshot({ path: `test-results/deep-sky-map-${width}.png` });
    await mobile.close();
  }

  const failedPhoto = await createPage({ width: 390, height: 844 });
  await failedPhoto.route('https://alasky.cds.unistra.fr/**', route => route.abort());
  await search(failedPhoto);
  await failedPhoto.locator('.deep-sky-photo-frame.error').waitFor();
  assert.equal(await failedPhoto.locator('[data-deep-sky-photo="m31"] img').getAttribute('src'), deepSkyImage(m31).url, 'failed image is not replaced with another object');
  await failedPhoto.route('https://alasky.cds.unistra.fr/**', route => route.fulfill({ contentType: 'image/png', body: imageMock }));
  await failedPhoto.getByRole('button', { name: 'ลองโหลดอีกครั้ง', exact: true }).click();
  await assertPhoto(failedPhoto);
  await failedPhoto.close();

  const native = await createPage({ width: 1440, height: 1000 }, false);
  await native.getByRole('button', { name: 'แสดงแผนที่เต็มหน้าจอ', exact: true }).click();
  await native.waitForFunction(() => document.fullscreenElement === document.querySelector('.map-panel'));
  await native.getByRole('button', { name: 'สำรวจกาแล็กซีและกระจุกดาว', exact: true }).click();
  await native.locator('[data-deep-sky-choice="m31"]').click();
  await assertPhoto(native);
  await closeDialog(native);
  assert.equal(await native.evaluate(() => !!document.fullscreenElement), true, 'native fullscreen survives details dialog');
  await native.close();
  assert.deepEqual(errors, [], 'no browser runtime errors');
  console.log('PASS: 15,544 source stars, M31 search/identity and mocked survey photo, date-dependent position, catalog/category/horizon filters, map layer and pointer selection, native/fallback fullscreen details, 320/390px responsive layouts. External photo contents are not verified.');
} finally {
  await browser.close();
}
