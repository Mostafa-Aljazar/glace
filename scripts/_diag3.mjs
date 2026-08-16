import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const ASSETS = path.join(ROOT, "src", "assets", "images");

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

await page.goto(`${BASE}/admin/products/${milkshake.id}/edit`, { waitUntil: "domcontentloaded" });

const basic = page.getByRole("tab", { name: /المعلومات الأساسية|Basic/i });
console.log("basic tab count:", await basic.count());
if (await basic.count()) {
  await basic.first().click().catch((e) => console.log("tab click failed:", e.message));
}
await page.waitForTimeout(500);

console.log("file inputs after tab click:", await page.locator('input[type="file"]').count());

// clearExistingUploads
const removers = page.locator(
  'button[title="Remove"], button[aria-label="Remove"], .filepond--action-remove-item, button:has-text("Remove")',
);
const rn = await removers.count();
console.log("removers found:", rn);
for (let i = 0; i < Math.min(rn, 8); i++) {
  try {
    await removers.nth(0).click({ timeout: 1000 });
    console.log("clicked remover", i);
    await page.waitForTimeout(400);
  } catch (e) {
    console.log("remover click failed:", e.message);
    break;
  }
}

console.log("file inputs after clear:", await page.locator('input[type="file"]').count());

const filePath = path.join(ASSETS, "milkshake.png");
const fileInput = page.locator('input[type="file"]').first();
await fileInput.waitFor({ state: "attached", timeout: 20000 });

const uploadWaitPromise = page
  .waitForResponse((r) => r.url().includes("livewire/upload-file") && r.ok(), { timeout: 90000 })
  .then((r) => console.log("upload-file resp ok:", r.status()))
  .catch((e) => console.log("upload-file wait failed:", e.message));

await fileInput.setInputFiles(filePath);
await uploadWaitPromise;
await page.waitForTimeout(5000);

const save = page.getByRole("button", { name: /Save changes|حفظ التغييرات|Save/i });
console.log("save disabled?", await save.isDisabled().catch(() => "err"));

await save.click({ timeout: 15000 });
await page.waitForTimeout(3500);

const check = await (await fetch(`${BASE}/api/menu/products/milkshake`)).json();
console.log("post-save API image:", check.image);

await browser.close();
