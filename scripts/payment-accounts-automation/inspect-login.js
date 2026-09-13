require('dotenv').config();
const { chromium } = require('playwright');

const SITE_URL = process.env.SITE_URL || 'http://localhost:3055';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(`${SITE_URL}/auth/login`);
  await page.waitForTimeout(1500);

  const buttons = await page.locator('button').evaluateAll(els =>
    els.map(el => el.textContent.trim()).filter(Boolean)
  );
  console.log('Buttons:', JSON.stringify(buttons, null, 2));

  await page.screenshot({ path: 'screenshots-checkout/inspect_login.png', fullPage: true });
  await browser.close();
}

run();
