import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('complete laboratory → intervention → comparison → optimization journey', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Understand where water goes/ })).toBeVisible();
  await page.getByRole('link', { name: 'Launch laboratory', exact: true }).click();
  await expect(page.getByRole('heading', { name: /Valley Catchment/ })).toBeVisible();
  await page.getByRole('button', { name: 'Run simulation', exact: true }).click();
  await expect(page.getByText('Mass balance accounted')).toBeVisible();
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  const slider = page.getByRole('slider', { name: 'Simulation timeline' });
  await slider.fill('60');
  await page.getByRole('textbox', { name: 'Scenario name', exact: true }).fill('Verified baseline');
  await page.getByRole('button', { name: 'Save scenario', exact: true }).last().click();
  await expect(page.getByRole('status')).toContainText('saved on this device');
  await page.getByRole('button', { name: 'Detention basin Capture surface water' }).click();
  await expect(page.getByRole('slider', { name: 'Storage capacity' })).toBeVisible();
  await page.getByRole('slider', { name: 'Storage capacity' }).fill('600');
  await page.getByRole('button', { name: 'Run simulation', exact: true }).click();
  await expect(page.getByText('Mass balance accounted')).toBeVisible();
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  await slider.fill('60');
  await page.screenshot({ path: '/tmp/basin-lab-desktop.png', fullPage: true });
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export', exact: true }).click();
  const exportFile = await downloadPromise;
  expect(exportFile.suggestedFilename()).toBe('basin-scenario.json');
  await exportFile.saveAs('/tmp/basin-scenario.json');
  await page.getByRole('link', { name: 'Compare runs' }).click();
  await page.getByRole('button', { name: 'Run comparison' }).click();
  await expect(page.getByRole('table')).toBeVisible();
  await expect(
    page.getByText('Only intervention settings may differ.', { exact: false }),
  ).toBeVisible();
  const row = page.getByRole('row').filter({
    has: page.getByRole('rowheader', { name: 'Cumulative boundary outflow', exact: true }),
  });
  const cells = await row.getByRole('cell').allTextContents();
  expect(parseFloat(cells[1])).toBeLessThan(parseFloat(cells[0]));
  await page.screenshot({ path: '/tmp/basin-compare-desktop.png', fullPage: true });
  await page.getByRole('link', { name: 'Optimize', exact: true }).click();
  await page.getByRole('button', { name: 'Run search' }).click();
  await expect(page.getByText('7 runs evaluated')).toBeVisible();
  await page.getByRole('link', { name: 'Inspect in laboratory' }).click();
  await expect(page.getByRole('heading', { name: /Optimized synthetic catchment/ })).toBeVisible();
  await page.getByRole('button', { name: 'Reset simulation' }).click();
  await expect(page.getByText('Mass balance awaiting simulation')).toBeVisible();
  await page.locator('input[type=file]').setInputFiles('/tmp/basin-scenario.json');
  await expect(page.getByRole('heading', { name: /Valley Catchment/ })).toBeVisible();
  await page.getByRole('slider', { name: 'Rainfall intensity', exact: true }).fill('100');
  await page.getByRole('button', { name: 'Run simulation', exact: true }).click();
  await expect(page.getByText('Mass balance accounted')).toBeVisible();
  await page.getByRole('link', { name: 'Methodology', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Account for every drop.' })).toBeVisible();
  await page.getByRole('link', { name: 'Case study', exact: true }).click();
  await expect(page.getByRole('link', { name: /KPRC, May 2018/ })).toHaveAttribute(
    'href',
    /click2houston/,
  );
  expect(errors).toEqual([]);
});
test('responsive layouts, WebGL, accessible controls and route integrity', async ({ page }) => {
  const failures: string[] = [];
  page.on('response', (r) => {
    if (r.status() >= 400) failures.push(`${r.status()} ${r.url()}`);
  });
  await page.goto('/');
  await expect(page.locator('canvas')).toBeVisible();
  await page.waitForTimeout(700);
  await page.screenshot({ path: '/tmp/basin-home-desktop.png', fullPage: true });
  const home = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(home.violations).toEqual([]);
  for (const width of [1440, 1024, 768, 390]) {
    await page.setViewportSize({ width, height: 950 });
    for (const route of [
      '/',
      '/lab',
      '/compare',
      '/optimize',
      '/case-study',
      '/methodology',
      '/about',
      '/experiments',
    ]) {
      await page.goto(route);
      await expect(page.locator('main')).toBeVisible();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
        `${route} at ${width}px`,
      ).toBe(true);
    }
  }
  await page.goto('/lab');
  await page.getByRole('button', { name: 'Toggle model controls' }).click();
  await page.getByRole('slider', { name: 'Rainfall intensity' }).fill('80');
  await page.getByRole('button', { name: 'Close controls' }).click();
  await page.getByRole('button', { name: 'Run simulation', exact: true }).click();
  await expect(page.getByText('Mass balance accounted')).toBeVisible();
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  await page.getByRole('button', { name: '2D', exact: true }).click();
  await expect(page.getByRole('img', { name: /Selectable 2D/ })).toBeVisible();
  await page.screenshot({ path: '/tmp/basin-lab-mobile.png', fullPage: true });
  const lab = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(lab.violations).toEqual([]);
  await page.goto('/');
  await expect(page.locator('canvas')).toBeVisible();
  await page.waitForTimeout(400);
  await page.screenshot({ path: '/tmp/basin-home-mobile.png', fullPage: true });
  expect(failures).toEqual([]);
});
test('experiment measurements are entered by users and persist locally', async ({ page }) => {
  await page.goto('/experiments');
  await expect(page.getByText('No experimental results. Yet.')).toBeVisible();
  await page.getByRole('button', { name: 'Add record' }).click();
  await page
    .getByRole('textbox', { name: 'Experiment name' })
    .fill('Automated UI test record (synthetic)');
  await page
    .getByRole('textbox', { name: 'Watershed geometry description' })
    .fill('Synthetic UI test, not empirical evidence');
  await page.getByRole('textbox', { name: 'Source / provenance' }).fill('Automated test only');
  await page.getByRole('spinbutton', { name: 'Catchment area · m²', exact: true }).fill('1');
  await page.getByRole('spinbutton', { name: 'Input duration · s', exact: true }).fill('600');
  await page.getByRole('spinbutton', { name: 'Water input · m³', exact: true }).fill('0.01');
  await page.getByRole('button', { name: 'Save measurement' }).click();
  await expect(
    page.getByRole('heading', { name: 'Automated UI test record (synthetic)' }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'Automated UI test record (synthetic)' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Compute current model ratio' }).click();
  await expect(
    page.getByText('Current synthetic model outflow / rainfall:', { exact: false }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Delete experiment Automated UI test record (synthetic)' })
    .click();
  await expect(page.getByText('No experimental results. Yet.')).toBeVisible();
});

test('gracefully uses selectable 2D terrain when WebGL is unavailable', async ({ page }) => {
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
  await expect(page.getByRole('img', { name: /Selectable 2D synthetic terrain/ })).toBeVisible();
  await page.getByRole('spinbutton', { name: 'Selected cell', exact: true }).fill('100');
  await expect(page.getByRole('heading', { name: 'Cell 100' })).toBeVisible();
  await page.getByRole('button', { name: '+0.5 m', exact: true }).click();
  await page.getByRole('button', { name: 'Run simulation', exact: true }).click();
  await expect(page.getByText('Mass balance accounted')).toBeVisible();
});
