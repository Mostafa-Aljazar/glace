import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const ASSETS = path.join(ROOT, "src", "assets", "images");

const BASE = "https://back.glaceelameer.com";
const EMAIL = "admin@glace.com";
const PASS = "admin123456";

const PRODUCT_FILES = {
  milkshake: "milkshake.png",
  brownie: "brownies-cake.png",
  molten: "molten-cake.png",
};

async function clearExistingUploads(page) {
  const removers = page.locator(
    'button[title="Remove"], button[aria-label="Remove"], .filepond--action-remove-item, button:has-text("Remove")',
  );
  const n = await removers.count();
  for (let i = 0; i < Math.min(n, 8); i++) {
    try {
      await removers.nth(0).click({ timeout: 1000 });
      await page.waitForTimeout(400);
    } catch {
      break;
    }
  }
}

async function waitForLivewireUpload(page) {
  try {
    await page.waitForResponse(
      (r) => r.url().includes("livewire/upload-file") && r.ok(),
      { timeout: 90000 },
    );
  } catch (e) {
    console.log("    !! upload wait threw:", e.message);
  }
  await page.waitForTimeout(5000);
}

async function uploadOnPage(page, filePath, label) {
  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.waitFor({ state: "attached", timeout: 20000 });
  await clearExistingUploads(page);

  const uploadWait = waitForLivewireUpload(page);
  await fileInput.setInputFiles(filePath);
  await uploadWait;

  const save = page.getByRole("button", { name: /Save changes|حفظ التغييرات|Save/i });

  if (await save.isDisabled().catch(() => true)) {
    console.log(`  ⚠ ${label} — Save disabled after upload`);
    return;
  }

  await save.click({ timeout: 15000 });
  await page.waitForTimeout(3500);
  console.log(`  ✅ ${label} (clicked save)`);
}

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();

await page.goto(`${BASE}/admin/login`, { waitUntil: "domcontentloaded" });
await page.locator('input[type="email"]').fill(EMAIL);
await page.locator('input[type="password"]').fill(PASS);
await page.locator('button[type="submit"]').click();
await page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 30000 });
console.log("logged in");

const list = await (await fetch(`${BASE}/api/menu/products`)).json();

for (const p of list) {
  const file = PRODUCT_FILES[p.slug];
  if (!file) continue;
  const filePath = path.join(ASSETS, file);
  const url = `${BASE}/admin/products/${p.id}/edit`;
  console.log(`\n→ ${p.slug}`);
  await page.goto(url, { waitUntil: "domcontentloaded" });
  const basic = page.getByRole("tab", { name: /المعلومات الأساسية|Basic/i });
  if (await basic.count()) await basic.first().click().catch(() => {});
  await uploadOnPage(page, filePath, `product:${p.slug} ← ${file}`);

  const check = await (await fetch(`${BASE}/api/menu/products/${p.slug}`)).json();
  console.log(`  API image right after: ${check.image}`);
}

await browser.close();
