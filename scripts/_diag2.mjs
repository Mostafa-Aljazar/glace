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

page.on("requestfinished", (req) => {
  const u = req.url();
  if (u.includes("livewire") || u.includes("upload")) {
    console.log("REQ:", req.method(), u);
  }
});
page.on("console", (msg) => {
  if (/error/i.test(msg.type())) console.log("CONSOLE:", msg.text());
});

await page.goto(`${BASE}/admin/login`, { waitUntil: "domcontentloaded" });
await page.locator('input[type="email"]').fill(EMAIL);
await page.locator('input[type="password"]').fill(PASS);
await page.locator('button[type="submit"]').click();
await page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 30000 });

const products = await (await fetch(`${BASE}/api/menu/products`)).json();
const milkshake = products.find((p) => p.slug === "milkshake");

await page.goto(`${BASE}/admin/products/${milkshake.id}/edit`, {
  waitUntil: "domcontentloaded",
});
await page.waitForTimeout(1500);

const filePath = path.join(ASSETS, "milkshake.png");
console.log("uploading:", filePath);

const fileInput = page.locator('input[type="file"]').first();
await fileInput.setInputFiles(filePath);

console.log("waiting for upload response...");
try {
  const resp = await page.waitForResponse(
    (r) => r.url().includes("livewire/upload-file"),
    { timeout: 30000 },
  );
  console.log("upload response status:", resp.status());
  const body = await resp.text().catch(() => "<no body>");
  console.log("upload response body:", body.slice(0, 500));
} catch (e) {
  console.log("no upload-file response seen:", e.message);
}

await page.waitForTimeout(5000);

// screenshot the file upload area
await page.locator('.fi-fo-file-upload').first().screenshot({ path: path.join(__dirname, "_diag_upload_area.png") }).catch((e) => console.log("screenshot fail", e.message));

const save = page.getByRole("button", { name: /Save changes|حفظ التغييرات|Save/i });
console.log("save disabled?", await save.isDisabled().catch(() => "err"));
console.log("save count:", await save.count());

await save.click({ timeout: 15000 });
await page.waitForTimeout(3500);
console.log("clicked save, url after:", page.url());

const check = await (await fetch(`${BASE}/api/menu/products/milkshake`)).json();
console.log("post-save API image:", check.image);

await browser.close();
