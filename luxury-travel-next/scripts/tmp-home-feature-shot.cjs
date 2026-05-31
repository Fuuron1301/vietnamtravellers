const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 980 }, deviceScaleFactor: 1 });
  await page.goto('http://localhost:3100/', { waitUntil: 'networkidle', timeout: 60000 });
  const section = page.locator('#tailor-made-assurance');
  await section.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await section.screenshot({ path: 'home-feature-redesign.png' });
  await browser.close();
})();
