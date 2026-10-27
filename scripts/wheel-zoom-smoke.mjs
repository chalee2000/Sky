import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, timezoneId: 'Asia/Bangkok' });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => { if (message.type() === 'error' && /passive event listener/i.test(message.text())) errors.push(message.text()); });
await page.route('https://alasky.cds.unistra.fr/**', route => route.abort());
await page.addInitScript(() => {
  Object.defineProperty(Element.prototype, 'requestFullscreen', { configurable: true, value: undefined });
  class Sensor extends Event { static requestPermission() { return Promise.resolve('granted'); } }
  Object.defineProperty(window, 'DeviceOrientationEvent', { configurable: true, value: Sensor });
});
const settled = () => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
const zoom = selector => page.locator(selector).evaluate(el => Number(el.dataset.zoom));
async function wheelAt(point, deltaY) {
  await page.mouse.move(point.x, point.y);
  await page.mouse.wheel(0, deltaY);
  await settled();
}
async function skyPoint() {
  return page.locator('.sky-pointer-svg').evaluate(el => {
    const r = el.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height * .44 };
  });
}
async function boundedWheel(selector, point) {
  for (let i = 0; i < 12; i++) await wheelAt(point, -240);
  assert.equal(await zoom(selector), 4, 'wheel zoom stops at 4x');
  for (let i = 0; i < 12; i++) await wheelAt(point, 240);
  assert.equal(await zoom(selector), 1, 'wheel zoom stops at 1x');
}
async function modifiersKeepBrowserZoom(selector) {
  const before = await zoom(selector);
  const results = await page.locator(`${selector}-svg`).evaluate(el => ['ctrlKey', 'metaKey'].map(key => {
    const event = new WheelEvent('wheel', { deltaY: -120, bubbles: true, cancelable: true, [key]: true });
    el.dispatchEvent(event);
    return event.defaultPrevented;
  }));
  await settled();
  assert.deepEqual(results, [false, false], 'browser zoom modifiers are not intercepted');
  assert.equal(await zoom(selector), before, 'browser zoom modifiers do not zoom the map');
}

try {
  await page.goto(process.env.SKY_TEST_URL || 'http://127.0.0.1:5180/Sky/', { waitUntil: 'networkidle' });
  await page.locator('.sky-home .sky-pointer').waitFor();
  const selected = await page.locator('.sky-selection').innerText();
  const homePoint = await skyPoint();
  const heading = await page.locator('.sky-pointer').getAttribute('data-heading');
  await wheelAt(homePoint, -120);
  await page.waitForFunction(() => Number(document.querySelector('.sky-pointer').dataset.zoom) > 1);
  const enlarged = await zoom('.sky-pointer');
  await wheelAt(homePoint, 120);
  assert.ok(await zoom('.sky-pointer') < enlarged, 'wheel down zooms the home sky out');
  assert.equal(await page.locator('.sky-pointer').getAttribute('data-heading'), heading, 'wheel zoom preserves the manual viewing direction');
  assert.equal(await page.locator('.sky-selection').innerText(), selected, 'wheeling does not select a different object');
  await boundedWheel('.sky-pointer', homePoint);
  await modifiersKeepBrowserZoom('.sky-pointer');
  const header = await page.locator('.header-inner>a').boundingBox();
  await wheelAt({ x: header.x + header.width / 2, y: header.y + header.height / 2 }, -120);
  assert.equal(await zoom('.sky-pointer'), 1, 'wheel over floating controls does not zoom the sky');

  await page.getByRole('button', { name: 'แสดงแผนที่เต็มหน้าจอ', exact: true }).click();
  await page.locator('.map-panel.is-fullscreen').waitFor();
  const fullPoint = await skyPoint();
  await wheelAt(fullPoint, -120);
  assert.ok(await zoom('.sky-pointer') > 1, 'wheel zoom works in fullscreen');
  await page.getByRole('button', { name: 'ส่องฟ้าตามมือถือ', exact: true }).click();
  await page.evaluate(() => {
    const event = new Event('deviceorientation');
    Object.defineProperties(event, { beta: { value: 135 }, gamma: { value: 0 }, webkitCompassHeading: { value: 35 }, webkitCompassAccuracy: { value: 10 } });
    window.dispatchEvent(event);
  });
  await page.waitForFunction(() => document.querySelector('.sky-pointer')?.dataset.manual === 'false');
  const compass = await page.locator('.sky-pointer').getAttribute('data-heading');
  const beforeCompassZoom = await zoom('.sky-pointer');
  await wheelAt(await skyPoint(), -120);
  assert.ok(await zoom('.sky-pointer') > beforeCompassZoom, 'wheel zoom works while compass tracking is active');
  assert.equal(await page.locator('.sky-pointer').getAttribute('data-heading'), compass, 'wheel zoom preserves compass heading');
  await page.getByRole('button', { name: 'ออกจากโหมดเต็มจอ', exact: true }).click();
  await page.getByRole('button', { name: 'แผนที่วงกลม', exact: true }).click();

  await page.locator('.date-control').click();
  await page.getByLabel('วันและเวลา', { exact: true }).fill('2026-12-15T22:00');
  await page.getByRole('button', { name: 'แสดงท้องฟ้า', exact: true }).click();
  await page.locator('.sky-map-svg').scrollIntoViewIfNeeded();
  const star = await page.locator('.map-star[aria-pressed="false"]').evaluateAll(nodes => {
    const canvas = document.querySelector('.sky-map-svg').getBoundingClientRect();
    const center = { x: canvas.x + canvas.width / 2, y: canvas.y + canvas.height / 2 };
    return nodes.map(node => {
      const r = node.querySelector('.star-hit-area').getBoundingClientRect();
      return { id: node.dataset.star, x: r.x + r.width / 2, y: r.y + r.height / 2 };
    }).filter(p => document.elementFromPoint(p.x, p.y)?.closest('[data-star]')?.dataset.star === p.id)
      .sort((a, b) => Math.hypot(a.x - center.x, a.y - center.y) - Math.hypot(b.x - center.x, b.y - center.y))[0];
  });
  assert.ok(star, 'a visible star is available to verify wheel anchoring');
  const beforeScroll = await page.evaluate(() => scrollY);
  const beforeSelection = await page.locator('.star-identity h2').innerText();
  await wheelAt(star, -120);
  assert.ok(await zoom('.sky-map') > 1, 'wheel zooms the circular map');
  const after = await page.locator(`[data-star="${star.id}"] .star-hit-area`).evaluate(el => {
    const r = el.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  });
  assert.ok(Math.hypot(after.x - star.x, after.y - star.y) < 2, 'the star under the mouse stays anchored while zooming');
  assert.equal(await page.evaluate(() => scrollY), beforeScroll, 'wheeling over the map does not also scroll the page');
  assert.equal(await page.locator('.star-identity h2').innerText(), beforeSelection, 'wheel over a star does not select it');
  await boundedWheel('.sky-map', star);
  await modifiersKeepBrowserZoom('.sky-map');
  assert.equal(await page.evaluate(() => scrollY), beforeScroll, 'wheel remains captured at both zoom bounds');

  const zoomBeforeOutside = await zoom('.sky-map');
  await page.evaluate(() => scrollTo(0, 0));
  await wheelAt({ x: 5, y: 500 }, 350);
  await page.waitForFunction(() => scrollY > 20);
  assert.equal(await zoom('.sky-map'), zoomBeforeOutside, 'wheel outside the canvas scrolls normally without zooming the map');
  assert.deepEqual(errors, []);
  console.log('PASS: real mouse wheel zoom in/out, 1–4x bounds, default sky, fullscreen, compass direction, circle cursor anchoring, object selection, canvas scroll isolation, outside scrolling, and browser zoom modifiers.');
} finally {
  await browser.close();
}
