import { chromium } from "playwright";
const BASE = "https://back.glaceelameer.com";
const EMAIL = "admin@glace.com";
const PASS = "admin123456";

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
await page.goto(`${BASE}/admin/login`, { waitUntil: "domcontentloaded" });
await page.locator('input[type="email"]').fill(EMAIL);
await page.locator('input[type="password"]').fill(PASS);
await page.locator('button[type="submit"]').click();
await page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 30000 });

const products = await (await fetch(`${BASE}/api/menu/products`)).json();
const milkshake = products.find((p) => p.slug === "milkshake");
console.log("product id:", milkshake.id, "current image:", milkshake.image);

await page.goto(`${BASE}/admin/products/${milkshake.id}/edit`, {
  waitUntil: "domcontentloaded",
});
await page.waitForTimeout(1500);

const inputs = page.locator('input[type="file"]');
const n = await inputs.count();
console.log("file inputs count:", n);
for (let i = 0; i < n; i++) {
  const el = inputs.nth(i);
  const info = await el.evaluate((e) => {
    const wrap = e.closest("[wire\\:model]") || e.closest('div[x-data]') || e.closest('.fi-fo-file-upload');
    return {
      id: e.id,
      name: e.name,
      wireModel: wrap ? wrap.getAttribute("wire:model") : null,
      wrapClass: wrap ? wrap.className : null,
      nearestLabelText: e.closest('.fi-fo-field-wrp')?.querySelector('label')?.innerText || null,
    };
  });
  console.log(i, info);
}
await browser.close();
