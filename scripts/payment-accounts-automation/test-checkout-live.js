// Single-session QA script: opens ONE browser, requests OTP, then polls a local
// file (otp-code.txt) for the code so the same login session/cookies survive
// between "request" and "enter code" — avoids losing the OTP by closing the browser.
//
// Usage:
//   1) node test-checkout-live.js cash    (or: wallet)
//   2) When it prints "Waiting for OTP code...", write the code into otp-code.txt
//      in this directory (just the digits, e.g. echo 123456 > otp-code.txt)
//   3) The script picks it up automatically and continues.
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const SITE_URL = process.env.SITE_URL || 'http://localhost:3055';
const CUSTOMER_PHONE = process.env.CUSTOMER_PHONE || '0592106078';
const OTP_FILE = path.join(__dirname, 'otp-code.txt');

const SHOT_DIR = path.join(__dirname, 'screenshots-checkout');
if (!fs.existsSync(SHOT_DIR)) fs.mkdirSync(SHOT_DIR);

async function shot(page, name) {
  await page.screenshot({ path: path.join(SHOT_DIR, `${name}.png`), fullPage: true }).catch(() => {});
}

async function dismissPwaPrompt(page) {
  const notNow = page.getByText('ليس الآن', { exact: true });
  if (await notNow.count()) {
    await notNow.click().catch(() => {});
    await page.waitForTimeout(300);
  }
}

async function waitForOtpFile(timeoutMs = 180000) {
  if (fs.existsSync(OTP_FILE)) fs.unlinkSync(OTP_FILE);
  console.log(`\n>>> Waiting for OTP code... write it into: ${OTP_FILE}\n    (e.g. echo 123456 > "${OTP_FILE}")\n`);
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (fs.existsSync(OTP_FILE)) {
      const code = fs.readFileSync(OTP_FILE, 'utf8').trim();
      if (code) return code;
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error('Timed out waiting for OTP code file');
}

async function run(paymentMethod) {
  const browser = await chromium.launch({ headless: false, slowMo: 150 });
  const context = await browser.newContext();
  const page = await context.newPage();
  const results = { steps: [] };

  try {
    console.log('Requesting OTP for', CUSTOMER_PHONE, '...');
    await page.goto(`${SITE_URL}/auth/login`);
    await page.waitForTimeout(1000);
    await dismissPwaPrompt(page);
    await page.locator('input[type="tel"]').fill(CUSTOMER_PHONE);

    let otpSendResponse = null;
    page.once('response', async (res) => {
      if (res.url().includes('/auth/otp/send')) {
        try { otpSendResponse = { status: res.status(), body: await res.json() }; }
        catch (_) { otpSendResponse = { status: res.status(), body: await res.text().catch(() => null) }; }
      }
    });
    await page.getByRole('button', { name: 'إرسال رمز التحقق' }).click();
    await page.waitForTimeout(2000);
    await shot(page, '01_otp_requested');
    console.log('OTP send response:', JSON.stringify(otpSendResponse, null, 2));

    const errorBanner = page.getByText('تعذر إرسال رمز التحقق', { exact: false });
    if (await errorBanner.count()) {
      throw new Error('OTP send failed (backend returned an error) — see 01_otp_requested.png. Response: ' + JSON.stringify(otpSendResponse));
    }

    const otpCode = await waitForOtpFile();
    console.log('Got OTP code, entering it...');

    const otpInputs = page.locator('input[maxlength="1"]');
    await otpInputs.first().click();
    await page.keyboard.type(otpCode, { delay: 100 });
    await page.waitForTimeout(500);

    let verifyResponseBody = null;
    page.once('response', async (res) => {
      if (res.url().includes('/auth/otp/verify')) {
        try { verifyResponseBody = { status: res.status(), body: await res.json() }; }
        catch (_) { verifyResponseBody = { status: res.status(), body: await res.text().catch(() => null) }; }
      }
    });

    await page.getByRole('button', { name: 'تأكيد الرمز' }).click();
    await page.waitForTimeout(2500);
    console.log('OTP verify response:', JSON.stringify(verifyResponseBody, null, 2));
    await shot(page, '02_after_login');
    results.steps.push({ step: 'login', url: page.url() });
    console.log('Login step done, current URL:', page.url());

    const stillOnLogin = page.url().includes('/auth/login');
    if (stillOnLogin) {
      const bodyText = await page.locator('body').innerText().catch(() => '');
      throw new Error('Still on login page after entering OTP — likely wrong/expired code. Page text: ' + bodyText.slice(0, 300));
    }

    console.log('Navigating to menu...');
    await page.goto(`${SITE_URL}/menu`);
    await page.waitForTimeout(1500);
    await dismissPwaPrompt(page);
    await shot(page, '03_menu');

    const productLink = page.getByRole('link', { name: /لقيمات/ }).first();
    await productLink.click();
    await page.waitForTimeout(1500);
    await shot(page, '04_product_page');

    const addBtn = page.getByText('أضف', { exact: true }).first();
    await addBtn.click();
    await page.waitForTimeout(500);

    const addToCartBtn = page.getByRole('button', { name: /أضف للسلة/ });
    await addToCartBtn.click();
    await page.waitForTimeout(1000);
    await shot(page, '05_added_to_cart');
    results.steps.push({ step: 'add_to_cart', url: page.url() });

    console.log('Navigating to checkout...');
    await page.goto(`${SITE_URL}/checkout`);
    await page.waitForTimeout(1500);
    await dismissPwaPrompt(page);
    await shot(page, '06_checkout');

    await page.getByRole('button', { name: 'استلام من المطعم' }).click();
    await page.waitForTimeout(800);
    await shot(page, '07_pickup_selected');

    await page.getByRole('button', { name: 'تأكيد وانتقل للدفع' }).click();
    await page.waitForTimeout(1500);
    await shot(page, '08_payment_page');
    results.steps.push({ step: 'checkout_to_payment', url: page.url() });

    const methodLabel = paymentMethod === 'wallet' ? 'محفظتي في النظام' : 'كاش';
    console.log(`Selecting payment method: ${methodLabel}`);
    await page.getByRole('button', { name: methodLabel }).click();
    await page.waitForTimeout(800);
    await shot(page, '09_payment_method_selected');

    const responses = [];
    page.on('response', async (res) => {
      const url = res.url();
      if (url.includes('/orders') || url.includes('/wallet/deduct')) {
        let body = null;
        try { body = await res.json(); } catch (_) {}
        responses.push({ url, status: res.status(), body });
      }
    });

    console.log('Clicking تأكيد الدفع ...');
    await page.getByRole('button', { name: 'تأكيد الدفع' }).click();
    await page.waitForTimeout(4000);
    await shot(page, '10_after_confirm');
    results.steps.push({ step: 'confirm_payment', url: page.url() });

    results.networkResponses = responses;
    console.log('\n=== NETWORK RESPONSES (orders/wallet) ===');
    console.log(JSON.stringify(responses, null, 2));

    const finalText = await page.locator('body').innerText().catch(() => '');
    fs.writeFileSync(path.join(SHOT_DIR, 'final_page_text.txt'), finalText);
  } catch (err) {
    console.error('ERROR:', err.message);
    await shot(page, 'error');
    results.error = err.message;
  } finally {
    fs.writeFileSync(path.join(SHOT_DIR, 'results.json'), JSON.stringify(results, null, 2));
    console.log('\n=== DONE — see screenshots-checkout/ for details ===');
    await browser.close();
  }
}

const paymentMethod = process.argv[2] || 'cash';
run(paymentMethod);
