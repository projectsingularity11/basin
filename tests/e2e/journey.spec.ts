import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
async function navigate(page: import('@playwright/test').Page, name: string) {
  await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name, exact: true })
    .click();
}
test('synthetic run, save, detention, compare, search, and JSON roundtrip', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error' && !/WebGL.*CONTEXT_LOST/.test(m.text())) errors.push(m.text());
  });
  await page.goto('/lab');
  await expect(page.getByRole('heading', { name: 'Valley Catchment' })).toBeVisible();
  await page.getByRole('button', { name: 'Run simulation', exact: true }).click();
  await expect(page.getByText(/Mass balance accounted/)).toBeVisible();
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  await page.getByRole('slider', { name: 'Simulation timeline' }).fill('60');
  await page.getByRole('button', { name: 'Saved scenarios', exact: true }).click();
  await page.getByRole('textbox', { name: 'Scenario name' }).fill('Verified baseline');
  await page.getByRole('button', { name: 'Save scenario', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('saved');
  await page.getByRole('button', { name: 'Close panel' }).click();
  await page.getByRole('button', { name: 'Intervene', exact: false }).click();
  await page.getByRole('button', { name: 'Add detention Capture and store water' }).click();
  await page.getByRole('slider', { name: 'Storage capacity' }).fill('600');
  await page.getByRole('button', { name: 'Run modified scenario' }).click();
  await expect(page.getByText(/Mass balance accounted/)).toBeVisible();
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  await page.getByRole('slider', { name: 'Simulation timeline' }).fill('60');
  await page.getByRole('button', { name: 'Results', exact: true }).click();
  await expect(page.getByText('Detained water', { exact: true })).toBeVisible();
  await page.screenshot({ path: '/tmp/v02-results.png' });
  await page.getByRole('link', { name: 'Compare runs' }).click();
  await page.getByRole('button', { name: 'Run comparison' }).click();
  await expect(page.getByRole('table')).toBeVisible();
  const row = page.getByRole('row').filter({
    has: page.getByRole('rowheader', { name: 'Cumulative boundary outflow', exact: true }),
  });
  const cells = await row.getByRole('cell').allTextContents();
  expect(parseFloat(cells[1])).toBeLessThan(parseFloat(cells[0]));
  await navigate(page, 'Optimize');
  await page.getByRole('button', { name: 'Run search' }).click();
  await expect(page.getByText('7 runs evaluated', { exact: false })).toBeVisible();
  await page.getByRole('link', { name: 'Inspect in laboratory' }).click();
  await page.getByRole('button', { name: 'Saved scenarios' }).click();
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export', exact: true }).click();
  const file = await pending;
  await file.saveAs('/tmp/basin-v02.json');
  await page.locator('input[type=file]').setInputFiles('/tmp/basin-v02.json');
  await expect(page.getByRole('status')).toContainText('imported');
  await page.getByRole('button', { name: 'Close panel' }).click();
  await page.getByRole('button', { name: 'Reset simulation' }).click();
  await expect(page.getByText('Ready to simulate')).toBeVisible();
  expect(errors).toEqual([]);
});
test('live place search and USGS elevation feed the lab, intervention and export', async ({
  page,
}) => {
  test.setTimeout(100000);
  await page.goto('/earth');
  await expect(page.locator('.earth-map')).toHaveAttribute('data-map-features', /^[1-9][0-9]*$/, {
    timeout: 25000,
  });
  await page.screenshot({ path: '/tmp/v02-earth.png' });
  await page.getByRole('textbox', { name: 'Search for a place' }).fill('Spring Texas');
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  const place = page.locator('.place-results button').first();
  await expect(place).toBeVisible({ timeout: 20000 });
  await place.click();
  await page.getByRole('button', { name: 'Load terrain', exact: true }).click();
  await expect(page.locator('.new-lab')).toBeVisible({ timeout: 35000 });
  await expect(page.getByRole('button', { name: /USGS 3DEP/ })).toBeVisible();
  await page.getByRole('button', { name: /USGS 3DEP/ }).click();
  await expect(page.getByText('EPSG:32615')).toBeVisible();
  await page.screenshot({ path: '/tmp/v02-provenance.png' });
  await page.getByRole('button', { name: 'Close panel' }).click();
  await page.getByRole('button', { name: 'Run simulation', exact: true }).click();
  await expect(page.getByText(/Mass balance accounted/)).toBeVisible();
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  await page.getByRole('slider', { name: 'Simulation timeline' }).fill('60');
  await page.screenshot({ path: '/tmp/v02-real-run.png' });
  await page.getByRole('button', { name: /Intervene/ }).click();
  await page.getByRole('button', { name: 'Add detention Capture and store water' }).click();
  await page.getByRole('button', { name: 'Run modified scenario' }).click();
  await expect(page.getByText(/Mass balance accounted/)).toBeVisible();
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  await navigate(page, 'Compare');
  await page.getByRole('button', { name: 'Run comparison' }).click();
  await expect(
    page.getByText('Only intervention settings may differ.', { exact: false }),
  ).toBeVisible();
  await page.screenshot({ path: '/tmp/v02-real-compare.png', fullPage: true });
});
test('ocean, keyboard navigation, reduced motion, responsive layouts and accessibility', async ({
  page,
}) => {
  test.setTimeout(180000);
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'BASIN', exact: true })).toBeVisible();
  await expect(page.locator('.ocean-backdrop')).toBeVisible();
  const surface = page.locator('.ocean-surface video');
  await expect
    .poll(() => surface.evaluate((video) => (video as HTMLVideoElement).currentTime))
    .toBeGreaterThan(0);
  await expect(surface).toHaveJSProperty('videoWidth', 1920);
  await page.getByRole('button', { name: 'Pause ocean footage' }).click();
  await expect(surface).toHaveJSProperty('paused', true);
  await page.getByRole('button', { name: 'Play ocean footage' }).click();
  await expect(surface).toHaveJSProperty('paused', false);
  await page.screenshot({ path: '/tmp/basin-final-hero.png' });
  await page.locator('.dive-reef').evaluate((section) => {
    window.scrollTo({
      top: window.scrollY + section.getBoundingClientRect().top + 60,
      behavior: 'instant',
    });
  });
  await expect
    .poll(() =>
      page
        .locator('.ocean-reef video')
        .evaluate((video) => (video as HTMLVideoElement).currentTime),
    )
    .toBeGreaterThan(0);
  await expect(surface).toHaveJSProperty('paused', true);
  await page.screenshot({ path: '/tmp/basin-final-under.png' });
  await page.locator('.dive-floor').evaluate((section) => {
    window.scrollTo({
      top: window.scrollY + section.getBoundingClientRect().top + 60,
      behavior: 'instant',
    });
  });
  await expect
    .poll(() =>
      page
        .locator('.ocean-floor video')
        .evaluate((video) => (video as HTMLVideoElement).currentTime),
    )
    .toBeGreaterThan(0);
  await page.screenshot({ path: '/tmp/basin-final-deep.png' });
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Open navigation' })).toBeFocused();
  for (const width of [1440, 1024, 768, 390]) {
    await page.setViewportSize({ width, height: 950 });
    for (const route of ['/earth', '/lab', '/compare', '/optimize', '/methodology', '/study']) {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('main')).toBeVisible();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        `${route} ${width}px`,
      ).toBe(true);
    }
  }
  await page.goto('/lab');
  await page.getByRole('button', { name: '2D', exact: true }).click();
  await page.getByRole('button', { name: /Storm/ }).click();
  await page.getByRole('slider', { name: 'Rainfall intensity' }).fill('80');
  await page.getByRole('button', { name: 'Advanced settings' }).click();
  await expect(page.getByRole('combobox', { name: 'Boundary condition' })).toBeVisible();
  await page.screenshot({ path: '/tmp/v02-mobile-lab.png' });
  const scan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(scan.violations).toEqual([]);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.ocean-backdrop')).toBeVisible();
  await expect(surface).toHaveJSProperty('paused', true);
  await expect(page.getByRole('button', { name: 'Pause ocean footage' })).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.screenshot({ path: '/tmp/v02-mobile-hero.png' });
  expect((await page.request.get('/icon.svg')).status()).toBe(200);
});
test('elevation errors remain explicit and WebGL-unavailable fallback remains usable', async ({
  page,
}) => {
  await page.route('**/api/elevation?**', (r) =>
    r.fulfill({
      status: 422,
      contentType: 'application/json',
      body: JSON.stringify({
        error: {
          code: 'ELEVATION_UNAVAILABLE',
          message: 'USGS temporarily unavailable. Retry or choose another region.',
        },
      }),
    }),
  );
  await page.goto('/earth');
  await page.getByRole('button', { name: 'Load terrain' }).click();
  await expect(page.locator('.geo-error')).toContainText('USGS temporarily unavailable');
  await expect(page).toHaveURL(/earth/);
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      kind: string,
      ...args: unknown[]
    ) {
      if (kind === 'webgl2' || kind === 'webgl') return null;
      return Reflect.apply(original, this, [kind, ...args]);
    } as typeof original;
  });
  await page.goto('/lab');
  await expect(page.getByRole('img', { name: /Selectable 2D terrain/ })).toBeVisible();
  await page.getByRole('button', { name: 'Run simulation', exact: true }).click();
  await expect(page.getByText(/Mass balance accounted/)).toBeVisible();
});

test('reproduces and reopens the library mitigation investigation', async ({ page }) => {
  await page.goto('/case-study');
  await page.getByRole('link', { name: 'Reproduce the library study' }).click();
  await expect(page.getByRole('heading', { name: 'Barbara Bush Branch Library' })).toBeVisible();
  await page.getByRole('button', { name: 'Run watershed study' }).click();
  await expect(page.getByRole('heading', { name: 'Detention tradeoffs' })).toBeVisible({
    timeout: 20000,
  });
  await expect(page.getByRole('img', { name: /Drainage screening grid/ })).toBeVisible();
  await page.screenshot({ path: '/tmp/basin-final-study.png', fullPage: true });
  await page.getByRole('button', { name: 'Save on this device' }).click();
  await expect(page.getByRole('status')).toContainText('Study saved');
  await page.reload();
  await page.getByRole('button', { name: 'Reopen saved study' }).click();
  await expect(page.getByRole('heading', { name: 'Detention tradeoffs' })).toBeVisible({
    timeout: 20000,
  });
  const file = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export hydrographs CSV' }).click();
  expect((await file).suggestedFilename()).toBe('basin-hydrographs.csv');
});
