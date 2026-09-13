require('dotenv').config();
const { chromium } = require('playwright');

const SITE_URL = process.env.SITE_URL || 'http://localhost:3055';
const CUSTOMER_PHONE = process.argv[2] || process.env.CUSTOMER_PHONE || '0595796456';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('response', async (res) => {
    if (res.url().includes('/auth/otp/send')) {
      let body = null;
      try { body = await res.json(); } catch (_) {
        try { body = await res.text(); } catch (_) {}
      }
      console.log('RESPONSE', res.status(), res.url());
      console.log(JSON.stringify(body, null, 2));
    }
  });
  page.on('requestfailed', (req) => {
    if (req.url().includes('/auth/otp/send')) {
      console.log('REQUEST FAILED', req.url(), req.failure());
    }
  });

  await page.goto(`${SITE_URL}/auth/login`);
  await page.waitForTimeout(1000);
  const notNow = page.getByText('ليس الآن', { exact: true });
  if (await notNow.count()) await notNow.click().catch(() => {});

  await page.locator('input[type="tel"]').fill(CUSTOMER_PHONE);
  await page.getByRole('button', { name: 'إرسال رمز التحقق' }).click();
  await page.waitForTimeout(3000);

  await browser.close();
}

run();
