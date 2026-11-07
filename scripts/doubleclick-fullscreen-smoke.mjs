import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
  headless: true,
  args: ['--no-sandbox'],
});
const errors = [];
const base = new URL(process.env.SKY_TEST_URL || 'http://127.0.0.1:5180/Sky/');
const settle = page => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
const zoom = page => page.locator('.sky-pointer, .sky-map').evaluate(element => Number(element.dataset.zoom));

async function mapPoint(page) {
  const canvas = page.locator('.sky-pointer-svg, .sky-map-svg');
  await canvas.scrollIntoViewIfNeeded();
  return canvas.evaluate(svg => {
    const rect = svg.getBoundingClientRect();
    for (const yRatio of [.45, .5, .55, .4, .6, .35]) {
      for (const xRatio of [.5, .45, .55, .4, .6]) {
        const point = { x: rect.x + rect.width * xRatio, y: rect.y + rect.height * yRatio };
        const target = document.elementFromPoint(point.x, point.y);
        if (target?.closest('svg') === svg && !target.closest('[role="button"], [data-star], [data-planet]')) return point;
      }
    }
    throw new Error('No unobscured map background point is available');
  });
}

async function doubleClickMap(page) {
  const point = await mapPoint(page);
  await page.mouse.dblclick(point.x, point.y);
}

async function expectFullscreen(page, mode) {
  await page.locator('.map-panel.is-fullscreen').waitFor();
  await page.waitForFunction(() => {
    const rect = document.querySelector('.map-panel').getBoundingClientRect();
    return Math.abs(rect.x) < 2 && Math.abs(rect.y) < 2
      && Math.abs(rect.width - innerWidth) < 2 && Math.abs(rect.height - innerHeight) < 2;
  });
  assert.equal(await page.evaluate(() => document.fullscreenElement === document.querySelector('.map-panel')), mode === 'native');
  assert.equal(await page.locator('.map-panel').evaluate(element => element.classList.contains('fullscreen-fallback')), mode !== 'native');
}

async function expectNormal(page, layout) {
  await page.waitForFunction(() => !document.fullscreenElement && !document.querySelector('.map-panel.is-fullscreen'));
  await page.locator(layout === 'sky' ? '.sky-home .sky-pointer' : '.sky-map').waitFor();
  assert.equal(await page.locator('body').evaluate(element => element.style.overflow), '', 'normal scrolling is restored');
  assert.equal(await page.locator('.site-header').evaluate(element => element.inert), false, 'normal navigation is restored');
}

async function createPage(mode, layout) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, timezoneId: 'Asia/Bangkok' });
  page.on('pageerror', error => errors.push(error.message));
  await page.route('https://alasky.cds.unistra.fr/**', route => route.abort());
  await page.addInitScript(mode => {
    if (mode === 'missing') Object.defineProperty(Element.prototype, 'requestFullscreen', { configurable: true, value: undefined });
    if (mode === 'rejected') Object.defineProperty(Element.prototype, 'requestFullscreen', {
      configurable: true, value: () => Promise.reject(new Error('Fullscreen not allowed')),
    });
    class Sensor extends Event { static requestPermission() { return Promise.resolve('granted'); } }
    Object.defineProperty(window, 'DeviceOrientationEvent', { configurable: true, value: Sensor });
  }, mode);
  const url = new URL(base);
  if (layout === 'circle') url.searchParams.set('view', 'map');
  else url.searchParams.delete('view');
  await page.goto(url.href, { waitUntil: 'networkidle' });
  await page.locator(layout === 'sky' ? '.sky-home .sky-pointer' : '.sky-map').waitFor();
  return page;
}

try {
  for (const mode of ['native', 'missing', 'rejected']) {
    for (const layout of ['sky', 'circle']) {
      const page = await createPage(mode, layout);
      const normalBox = await page.locator('.map-panel').boundingBox();
      const point = await mapPoint(page);
      await page.mouse.click(point.x, point.y);
      assert.equal(await page.locator('.map-panel.is-fullscreen').count(), 0, 'a single click does not enter fullscreen');
      await page.mouse.move(point.x, point.y);
      await page.mouse.wheel(0, -120);
      await page.waitForFunction(() => Number(document.querySelector('.sky-pointer, .sky-map').dataset.zoom) > 1);
      const initialZoom = await zoom(page);
      const initialHeading = layout === 'sky' ? await page.locator('.sky-pointer').getAttribute('data-heading') : null;

      await page.getByRole('button', { name: 'แสดงเส้นกลุ่มดาว', exact: true }).dblclick();
      assert.equal(await page.locator('.map-panel.is-fullscreen').count(), 0, 'double-clicking a toolbar control does not enter fullscreen');
      await doubleClickMap(page);
      await expectFullscreen(page, mode);
      assert.ok(Math.abs(await zoom(page) - initialZoom) < .01, 'double-click entry preserves zoom rather than resetting it');
      if (initialHeading !== null) assert.equal(await page.locator('.sky-pointer').getAttribute('data-heading'), initialHeading, 'entry preserves the viewing direction');
      await page.getByRole('button', { name: 'แสดงเส้นกลุ่มดาว', exact: true }).dblclick();
      assert.equal(await page.locator('.map-panel.is-fullscreen').count(), 1, 'double-clicking a fullscreen toolbar control does not exit');

      await doubleClickMap(page);
      await expectNormal(page, layout);
      await settle(page);
      assert.ok(Math.abs(await zoom(page) - initialZoom) < .01, 'double-click exit preserves zoom');
      const restored = await page.locator('.map-panel').boundingBox();
      assert.ok(Math.abs(restored.width - normalBox.width) < 2 && Math.abs(restored.height - normalBox.height) < 2, 'exit restores the original map layout');

      if (mode === 'missing' && layout === 'sky') {
        await page.getByRole('button', { name: 'ส่องฟ้าตามมือถือ', exact: true }).click();
        await page.evaluate(() => {
          const event = new Event('deviceorientation');
          Object.defineProperties(event, {
            beta: { value: 135 }, gamma: { value: 0 },
            webkitCompassHeading: { value: 35 }, webkitCompassAccuracy: { value: 10 },
          });
          window.dispatchEvent(event);
        });
        await page.waitForFunction(() => document.querySelector('.sky-pointer').dataset.manual === 'false');
        const heading = await page.locator('.sky-pointer').getAttribute('data-heading');
        await doubleClickMap(page);
        await expectFullscreen(page, mode);
        await doubleClickMap(page);
        await expectNormal(page, layout);
        assert.equal(await page.locator('.sky-pointer').getAttribute('data-manual'), 'false', 'an already active sensor remains active after double-click entry and exit');
        assert.equal(await page.locator('.sky-pointer').getAttribute('data-heading'), heading, 'sensor direction survives fullscreen toggles');
      }
      await page.close();
    }
  }
  assert.deepEqual(errors, [], 'no browser runtime errors');
  console.log('PASS: real mouse double-click fullscreen entry/exit for home and circle views; native, missing and rejected API; original layout and zoom restoration; single clicks and toolbar isolation; sensor continuity.');
} finally {
  await browser.close();
}
