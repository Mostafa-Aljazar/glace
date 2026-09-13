// QA script: exercises the real customer-facing OTP login + cart + checkout flow
// against production, to verify whether the backend's reported fixes for
// items[].itemId (422 on POST /orders) and wallet-deduction atomicity are real.
//
// Usage:
//   node test-checkout.js request-otp        -> sends OTP to CUSTOMER_PHONE, then exits
//   node test-checkout.js login-and-order <OTP_CODE> <paymentMethod>
//       paymentMethod: cash | wallet  (start with cash — it's the simplest, no wallet risk)
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const SITE_URL = process.env.SITE_URL || 'http://localhost:3055';
const CUSTOMER_PHONE = process.env.CUSTOMER_PHONE || '0592106078';

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

async function requestOtp() {
  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const page = await browser.newPage();
  await page.goto(`${SITE_URL}/auth/login`);
  await page.waitForTimeout(1000);
  await dismissPwaPrompt(page);
  await page.locator('input[type="tel"]').fill(CUSTOMER_PHONE);
  await page.getByRole('button', { name: 'إرسال رمز التحقق' }).click();
  await page.waitForTimeout(2000);
  await shot(page, '01_otp_requested');
  console.log('OTP requested for', CUSTOMER_PHONE, '- check your phone/SMS, then run login-and-order with the code.');
  // Keep the browser open for a bit so state isn't lost, but we cannot persist across process exit easily.
  await browser.close();
}

async function loginAndOrder(otpCode, paymentMethod) {
  const browser = await chromium.launch({ headless: false, slowMo: 150 });
  const context = await browser.newContext();
  const page = await context.newPage();
  const results = { steps: [] };

  try {
    console.log('Logging in with OTP...');
    await page.goto(`${SITE_URL}/auth/login`);
    await page.waitForTimeout(1000);
    await dismissPwaPrompt(page);
    await page.locator('input[type="tel"]').fill(CUSTOMER_PHONE);
    await page.getByRole('button', { name: 'إرسال رمز التحقق' }).click();
    await page.waitForTimeout(1500);

    const otpInputs = page.locator('input[maxlength="1"]');
    await otpInputs.first().click();
    await page.keyboard.type(otpCode, { delay: 100 });
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'تأكيد الرمز' }).click();
    await page.waitForTimeout(2500);
    await shot(page, '02_after_login');
    results.steps.push({ step: 'login', url: page.url() });
    console.log('Login step done, current URL:', page.url());

    console.log('Navigating to menu...');
    await page.goto(`${SITE_URL}/menu`);
    await page.waitForTimeout(1500);
    await dismissPwaPrompt(page);
    await shot(page, '03_menu');

    // Open a simple flat-list product: لقيمات (luqaimat)
    const productLink = page.getByRole('link', { name: /لقيمات/ }).first();
    await productLink.click();
    await page.waitForTimeout(1500);
    await shot(page, '04_product_page');

    // Add the first sub-item found via its "أضف" button
    const addBtn = page.getByText('أضف', { exact: true }).first();
    await addBtn.click();
    await page.waitForTimeout(500);

    // Final add-to-cart floating button
    const addToCartBtn = page.getByRole('button', { name: /أضف للسلة/ });
    await addToCartBtn.click();
    await page.waitForTimeout(1000);
    await shot(page, '05_added_to_cart');
    results.steps.push({ step: 'add_to_cart', url: page.url() });

    console.log('Navigating to checkout...');
    await page.goto(`${SITE_URL}/checkout`);
    await page.waitForTimeout(1500);
    await shot(page, '06_checkout');

    // Choose pickup (استلام من المطعم) — simplest path, no address needed
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

    // Capture the POST /orders (and /wallet/deduct if applicable) network responses
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

const [, , cmd, arg1, arg2] = process.argv;

if (cmd === 'request-otp') {
  requestOtp();
} else if (cmd === 'login-and-order') {
  if (!arg1) {
    console.error('Usage: node test-checkout.js login-and-order <OTP_CODE> [cash|wallet]');
    process.exit(1);
  }
  loginAndOrder(arg1, arg2 || 'cash');
} else {
  console.error('Usage:\n  node test-checkout.js request-otp\n  node test-checkout.js login-and-order <OTP_CODE> [cash|wallet]');
  process.exit(1);
}
