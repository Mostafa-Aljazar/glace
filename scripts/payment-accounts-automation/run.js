require('dotenv').config();
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');
const accounts = require('./accounts');

const ADMIN_URL = process.env.ADMIN_URL;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const SHOT_DIR = path.join(__dirname, 'screenshots');
if (!fs.existsSync(SHOT_DIR)) fs.mkdirSync(SHOT_DIR);

const QR_IMAGE = path.join(__dirname, 'placeholder-qr.png');

function slug(s) {
  return s.replace(/[^\w؀-ۿ]+/g, '_').slice(0, 40);
}

async function fillById(page, fieldId, value) {
  if (!value) return false;
  const input = page.locator(`[id="${fieldId}"]`);
  if (await input.count()) {
    await input.fill(value);
    return true;
  }
  return false;
}

async function selectPaymentMethod(page, methodText) {
  // It's a plain HTML <select> whose first/only <select> on the page is "طريقة الدفع".
  const select = page.locator('select').first();
  await select.selectOption({ label: methodText });
}

async function run() {
  if (!ADMIN_URL || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error('Missing ADMIN_URL / ADMIN_EMAIL / ADMIN_PASSWORD in .env');
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: false, slowMo: 150 });
  const context = await browser.newContext();
  const page = await context.newPage();

  const results = [];

  try {
    console.log('Navigating to login page...');
    await page.goto(`${ADMIN_URL}/login`);
    await page.getByLabel('Email address').fill(ADMIN_EMAIL);
    await page.getByLabel('Password').fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForURL(`${ADMIN_URL}`, { timeout: 15000 }).catch(() => {});
    await page.screenshot({ path: path.join(SHOT_DIR, '00_after_login.png') });
    console.log('Logged in.');

    for (const acc of accounts) {
      console.log(`\n--- Creating: ${acc.method} (${acc.accountHolder}) ---`);
      try {
        await page.goto(`${ADMIN_URL}/payment-accounts/create`);
        await page.waitForSelector('text=طريقة الدفع');

        await selectPaymentMethod(page, acc.method);

        // Give the form a moment to reveal conditional fields (bank name, transfer fields)
        await page.waitForTimeout(400);

        await fillById(page, 'data.holder_name', acc.accountHolder);
        await fillById(page, 'data.bank_name', acc.bankName);
        await fillById(page, 'data.primary_label', acc.primaryLabel);
        await fillById(page, 'data.primary_value', acc.primaryValue);
        await fillById(page, 'data.secondary_label', acc.secondaryLabel);
        await fillById(page, 'data.secondary_value', acc.secondaryValue);

        // QR image upload (optional field) — wait for the upload to finish before submitting.
        const fileInput = page.locator('input[type="file"]').first();
        if (await fileInput.count()) {
          await fileInput.setInputFiles(QR_IMAGE);
          await page.getByText('Uploading', { exact: false }).waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
          await page.waitForTimeout(500);
        }

        await page.screenshot({ path: path.join(SHOT_DIR, `${slug(acc.method)}_before_submit.png`) });

        await page.getByRole('button', { name: 'Create', exact: true }).click();
        await page.getByText('Uploading', { exact: false }).waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
        await page.waitForTimeout(1200);

        const currentUrl = page.url();
        const success = currentUrl.includes('/payment-accounts') && !currentUrl.includes('/create');
        await page.screenshot({ path: path.join(SHOT_DIR, `${slug(acc.method)}_after_submit.png`) });

        results.push({ method: acc.method, success, url: currentUrl });
        console.log(success ? 'OK: created.' : 'WARNING: still on create page, check screenshot/validation.');
      } catch (err) {
        console.error(`ERROR creating ${acc.method}:`, err.message);
        await page.screenshot({ path: path.join(SHOT_DIR, `${slug(acc.method)}_error.png`) }).catch(() => {});
        results.push({ method: acc.method, success: false, error: err.message });
      }
    }
  } finally {
    console.log('\n=== SUMMARY ===');
    for (const r of results) {
      console.log(`${r.success ? 'PASS' : 'FAIL'} - ${r.method}${r.error ? ' - ' + r.error : ''}`);
    }
    await browser.close();
  }
}

run();
