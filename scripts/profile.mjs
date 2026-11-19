import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(process.env.BASE_URL || 'http://localhost:3000');
  await page.locator('.ocean-backdrop').waitFor();
  await page.evaluate(() => window.scrollTo({ top: innerHeight, behavior: 'instant' }));
  await page.waitForTimeout(1500);
  const samples = await page.evaluate(
    () =>
      new Promise((resolve) => {
        const start = performance.now();
        const intervals = [];
        let previous = start;
        function sample(now) {
          intervals.push(now - previous);
          previous = now;
          if (now - start < 3000) requestAnimationFrame(sample);
          else resolve(intervals);
        }
        requestAnimationFrame(sample);
      }),
  );
  const sorted = [...samples].sort((a, b) => a - b);
  console.log(
    JSON.stringify(
      {
        viewport: page.viewportSize(),
        renderer: 'Headless Chromium, animation callback timing',
        samples: samples.length,
        averageFps: 1000 / (samples.reduce((sum, value) => sum + value, 0) / samples.length),
        p95FrameMs: sorted[Math.floor(sorted.length * 0.95)],
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
