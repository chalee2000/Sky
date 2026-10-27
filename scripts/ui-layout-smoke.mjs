import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
const base = process.env.SKY_TEST_URL || 'http://127.0.0.1:5180/Sky/';
const errors = [];
const sizes = [{ width: 320, height: 700 }, { width: 390, height: 844 }, { width: 1440, height: 1000 }, { width: 844, height: 390 }, { width: 568, height: 320 }];

async function assertGeometry(page, fullscreen) {
  const layout = await page.evaluate(() => {
    const rect = selector => {
      const element = document.querySelector(selector);
      const bounds = element.getBoundingClientRect();
      return { x: bounds.x, y: bounds.y, right: bounds.right, bottom: bounds.bottom, width: bounds.width, height: bounds.height };
    };
    return {
      width: innerWidth, height: innerHeight,
      overflow: document.documentElement.scrollWidth > innerWidth,
      panel: rect('.map-panel'), sky: rect('.sky-viewport'), tools: rect('.map-tools'),
      controls: [...document.querySelectorAll('.map-tools button')].map(button => {
        const r = button.getBoundingClientRect();
        return { label: button.getAttribute('aria-label'), width: r.width, height: r.height, x: r.x, right: r.right, top: r.top, bottom: r.bottom };
      }),
      headingControls: [...document.querySelectorAll('.panel-heading button')].map(button => {
        const r = button.getBoundingClientRect();
        return { label: button.getAttribute('aria-label') || button.textContent, x: r.x, right: r.right };
      }),
    };
  });
  assert.equal(layout.overflow, false, `no horizontal page overflow at ${layout.width}px`);
  assert.ok(layout.tools.y >= layout.sky.bottom - 1, 'the action dock does not cover the sky canvas');
  for (const button of layout.headingControls) assert.ok(button.x >= layout.panel.x && button.right <= layout.panel.right + 1, `heading control remains inside panel: ${button.label}`);
  for (const button of layout.controls) {
    assert.ok(button.width >= (layout.width <= 390 ? 44 : 32) && button.height >= 44, `touch target for ${button.label}`);
    assert.ok(button.x >= layout.panel.x && button.right <= layout.panel.right + 1, `control stays inside panel: ${button.label}`);
    if (fullscreen) assert.ok(button.bottom <= layout.height + 1, `fullscreen control remains reachable: ${button.label}`);
  }
  if (fullscreen) {
    assert.ok(Math.abs(layout.panel.height - layout.height) <= 1, 'fullscreen uses the available viewport');
    assert.ok(layout.sky.height > (layout.width > layout.height ? Math.min(180, layout.height * .45) : 350), 'fullscreen retains useful sky height');
  }
}

async function assertHome(page) {
  const layout = await page.evaluate(() => {
    const rect = selector => {
      const r = document.querySelector(selector).getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height, right: r.right, bottom: r.bottom };
    };
    return { width: innerWidth, height: innerHeight, overflow: document.documentElement.scrollWidth > innerWidth,
      sky: rect('.sky-pointer'), header: rect('.site-header'), hud: rect('.sky-hud'), deck: rect('.map-control-deck'),
      heading: rect('.panel-heading'), reset: rect('.pointer-reset'), expanded: document.querySelector('.map-control-deck').dataset.expanded === 'true' };
  });
  assert.equal(layout.overflow, false, 'home has no horizontal overflow');
  assert.ok(Math.abs(layout.sky.width - layout.width) < 1 && Math.abs(layout.sky.height - layout.height) < 1, '360° sky fills the whole home viewport');
  assert.ok(layout.hud.x >= 0 && layout.hud.right <= layout.width && layout.hud.y >= layout.header.bottom, 'HUD stays below the floating header and inside the screen');
  assert.ok(layout.deck.bottom <= layout.height && layout.deck.x >= 0 && layout.deck.right <= layout.width, 'home control deck stays inside screen');
  if (!layout.expanded) {
    assert.ok(layout.heading.bottom <= layout.deck.y, 'collapsed deck does not hide the view/fullscreen controls');
    assert.ok(layout.reset.bottom <= layout.deck.y, 'collapsed deck does not hide the view reset');
  }
}

try {
  await mkdir('test-results', { recursive: true });
  for (const viewport of sizes) {
    const page = await browser.newPage({ viewport });
    page.on('pageerror', error => errors.push(error.message));
    await page.route('https://alasky.cds.unistra.fr/**', route => route.abort());
    await page.addInitScript(() => Object.defineProperty(Element.prototype, 'requestFullscreen', { configurable: true, value: undefined }));
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.locator('.sky-home .sky-pointer[data-manual="true"]').waitFor();
    await assertHome(page);
    await page.screenshot({ path: `test-results/review-ui-home-${viewport.width}.png` });
    if (viewport.width === 390) {
      const hud = page.locator('.sky-hud');
      if (!await hud.evaluate(el => el.open)) await hud.locator('summary').click();
      assert.match(await page.locator('[data-lst]').innerText(), /^\d{2}:\d{2}:\d{2}$/);
      assert.ok(Number.isFinite(Number(await page.locator('[data-sun-altitude]').getAttribute('data-sun-altitude'))));
      const previous = await page.locator('[data-lst]').innerText();
      await page.locator('.home-date-control').click();
      await page.getByLabel('วันและเวลา', { exact: true }).fill('2026-12-15T22:00');
      await page.getByRole('button', { name: 'แสดงท้องฟ้า', exact: true }).click();
      assert.equal(await hud.locator('time').innerText(), '22:00:00');
      assert.notEqual(await page.locator('[data-lst]').innerText(), previous, 'HUD uses the selected time');
      assert.equal(await hud.getAttribute('data-live'), 'false');
      assert.match(await page.locator('.sky-hud-moon').innerText(), /≈\d+%/);
      await hud.locator('summary').click();
      await page.getByRole('button', { name: 'กลุ่มดาว', exact: true }).click();
      await page.locator('.library-grid').waitFor();
      await page.getByRole('button', { name: 'สำรวจท้องฟ้า', exact: true }).click();
      await page.locator('.sky-home').waitFor();
      await page.getByRole('button', { name: 'บันทึกของฉัน', exact: true }).click();
      await page.getByRole('heading', { name: 'จักรวาลส่วนตัวของคุณ' }).waitFor();
      await page.getByRole('button', { name: 'สำรวจท้องฟ้า', exact: true }).click();
      await page.locator('.sky-home').waitFor();
      await page.getByRole('button', { name: 'แสดงแผนที่เต็มหน้าจอ', exact: true }).click();
      await page.locator('.map-panel.is-fullscreen').waitFor();
      await assertGeometry(page, true);
      await page.getByRole('button', { name: 'ออกจากโหมดเต็มจอ', exact: true }).click();
      await page.locator('.sky-home .sky-pointer').waitFor();
      await assertHome(page);
    }
    await page.getByRole('button', { name: 'แผนที่วงกลม', exact: true }).click();
    await page.locator('.sky-map').waitFor();
    await assertGeometry(page, false);
    await page.locator('.map-panel').screenshot({ path: `test-results/review-ui-map-${viewport.width}.png` });
    await page.getByRole('button', { name: 'แสดงแผนที่เต็มหน้าจอ', exact: true }).click();
    await page.locator('.map-panel.is-fullscreen').waitFor();
    await assertGeometry(page, true);
    await page.screenshot({ path: `test-results/review-ui-full-${viewport.width}.png` });
    await page.getByRole('button', { name: 'ออกจากโหมดเต็มจอ', exact: true }).click();
    await assertGeometry(page, false);
    await page.getByRole('button', { name: 'ท้องฟ้า 360°', exact: true }).click();
    await page.locator('.sky-home').waitFor();
    await assertHome(page);
    await page.close();
  }
  assert.deepEqual(errors, []);
  console.log('PASS: 360° home, selected-time HUD, floating controls, library/bookmark menus, fullscreen return, circular-map alternative, 320/390px mobile, desktop/landscape, touch controls and no horizontal overflow.');
} finally {
  await browser.close();
}
