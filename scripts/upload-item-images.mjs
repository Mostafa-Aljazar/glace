/**
 * Upload flat-list item images via Filament relation-manager modal.
 * Uses system Chrome (channel: chrome). Clears search between items.
 *
 *   node scripts/upload-item-images.mjs
 *   node scripts/upload-item-images.mjs --only=loqaimat,milkshake
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const ASSETS = path.join(ROOT, "src", "assets", "images");
const FLAVORS = path.join(ASSETS, "flavors");

const BASE =
  process.env.GLACE_ADMIN_BASE ||
  "https://back.glaceelameer.com";
const API = `${BASE}/api`;
const EMAIL = process.env.GLACE_ADMIN_EMAIL || "admin@glace.com";
const PASS = process.env.GLACE_ADMIN_PASSWORD || "admin123456";

const onlyArg = process.argv.find((a) => a.startsWith("--only="));
const ONLY = onlyArg
  ? new Set(onlyArg.slice("--only=".length).split(",").map((s) => s.trim()))
  : null;

const PRODUCT_FILES = {
  cup: "ice-cream-cup.png",
  family: "family-ice-cream.png",
  brad: "refrigerator.png",
  "brad-boza": "ice-cream.png",
  "cold-drinks": "cold-drinks.png",
  "hot-drinks": "hot-drinks.png",
  juices: "natural-juices.png",
  corn: "corn.png",
  milkshake: "milkshake.png",
  kunafa: "ice-cream-kunafa.png",
  loqaimat: "luqaimat.png",
  pancake: "pancake.png",
  waffle: "waffle.png",
  crepe: "crepe.png",
  pizza: "glassy-pizza.png",
  molten: "molten-cake.png",
  brownie: "brownies-cake.png",
  cookies: "mochi.png",
  cheesecake: "san-sebastian.png",
};

const ITEM_FILE = {
  chocolate: "flavors/chocolate-ice.png",
  vanilla: "flavors/vanillaa-ice.png",
  strawberry: "flavors/strawberry-ice.png",
  caramel: "flavors/caramel-ice.png",
  "dark-chocolate": "flavors/dark-ice.png",
  nescafe: "flavors/nescafe-ice.png",
  coconut: "flavors/coconut-ice.png",
  mango: "flavors/mango-ice.png",
  banana: "flavors/banana-ice.png",
  grape: "flavors/grape-ice.png",
  bazooka: "flavors/bazooka-ice.png",
  mario: "flavors/mario-ice.png",
  lemon: "flavors/lemon-ice.png",
  arabian: "flavors/arabian-ice.png",
  nutella: "flavors/nutella-ice.png",
  oreo: "flavors/oreo-ice.png",
  kitkat: "flavors/kitKat-ice.png",
  flora: "flavors/flora-ice.png",
  kinder: "flavors/kinder-Bueno-ice.png",
  lotus: "flavors/lotus-ice.png",
  pistachio: "flavors/pistachio-ice.png",
  blueberry: "flavors/blueberry-ice.png",
  energy: "flavors/energy-ice.png",
  bounty: "flavors/bounty-ice.png",
  "dondurma-pistachio": "dondurma-baklava.png",
  plain: "corn.png",
  cheese: "corn.png",
  "iced-coffee-caramel": "flavors/caramel-ice.png",
  "iced-mocha": "flavors/nescafe-ice.png",
  "spanish-latte-caramel": "flavors/caramel-ice.png",
  "boba-shake": "flavors/chocolate-ice.png",
  "small-water": "flavors/coconut-ice.png",
  "arabic-coffee": "flavors/caramel-ice.png",
  "hot-nescafe": "flavors/nescafe-ice.png",
  tea: "flavors/lemon-ice.png",
  "hot-chocolate": "flavors/chocolate-ice.png",
  "blue-lemonade": "flavors/lemon-ice.png",
};

function resolveItemFile(itemId, productSlug) {
  if (ITEM_FILE[itemId]) {
    const p = path.join(ASSETS, ITEM_FILE[itemId]);
    if (fs.existsSync(p)) return p;
  }
  const p1 = path.join(FLAVORS, `${itemId}-ice.png`);
  if (fs.existsSync(p1)) return p1;
  if (PRODUCT_FILES[productSlug]) {
    const p = path.join(ASSETS, PRODUCT_FILES[productSlug]);
    if (fs.existsSync(p)) return p;
  }
  return path.join(FLAVORS, "vanillaa-ice.png");
}

async function login(page) {
  await page.goto(`${BASE}/admin/login`);
  if (!page.url().includes("login")) return;
  await page.fill('input[type=email]', EMAIL);
  await page.fill('input[type=password]', PASS);
  await page.click('button[type=submit]');
  await page.waitForURL((u) => !u.pathname.includes("/login"), {
    timeout: 30000,
  });
}

async function clearSearch(page) {
  const boxes = page.locator(
    '.fi-ta-search-field input, input[placeholder="Search"]',
  );
  const n = await boxes.count();
  if (!n) return;
  const box = boxes.last();
  await box.fill("");
  await box.press("Enter").catch(() => {});
  await page.waitForTimeout(700);
}

async function openItemsTable(page) {
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(400);
  const tab = page.getByRole("tab", { name: /الأصناف/ });
  if (await tab.count()) {
    await tab.last().click();
    await page.waitForTimeout(700);
  }
  await page.getByText("إضافة صنف").first().waitFor({ timeout: 20000 });
  try {
    await page.getByLabel(/Per page/i).selectOption("all");
    await page.waitForTimeout(600);
  } catch {
    /* ignore */
  }
}

async function uploadOneItem(page, product, itemId) {
  const filePath = resolveItemFile(itemId, product.slug);

  await clearSearch(page);

  const searchBoxes = page.locator(
    '.fi-ta-search-field input, input[placeholder="Search"]',
  );
  if (await searchBoxes.count()) {
    await searchBoxes.last().fill(itemId);
    await page.waitForTimeout(1100);
  }

  const row = page.locator("tr").filter({ hasText: itemId }).first();
  if (!(await row.count())) {
    await clearSearch(page);
    return { ok: false, reason: "row missing" };
  }

  await row.getByRole("button", { name: /^Edit$/i }).click();
  await page.waitForTimeout(1600);

  let input = page.locator(".fi-modal-open input[type=file]").last();
  if (!(await input.count())) {
    input = page.locator("[role=dialog] input[type=file]").last();
  }
  if (!(await input.count())) {
    input = page.locator("input[type=file]").last();
  }

  const uploadWait = page
    .waitForResponse(
      (r) => r.url().includes("livewire/upload-file") && r.ok(),
      { timeout: 90000 },
    )
    .catch(() => null);

  try {
    await input.setInputFiles(filePath);
  } catch (e) {
    await page.keyboard.press("Escape").catch(() => {});
    await clearSearch(page);
    return { ok: false, reason: `setInputFiles: ${e.message}` };
  }

  await uploadWait;
  await page.waitForTimeout(3500);

  const modalSave = page
    .locator(".fi-modal-open button, [role=dialog] button")
    .filter({ hasText: /Save/i });
  if (await modalSave.count()) await modalSave.last().click();
  else await page.getByRole("button", { name: /Save/i }).last().click();

  await page.waitForTimeout(2800);
  await page.keyboard.press("Escape").catch(() => {});
  await page.waitForTimeout(400);
  await clearSearch(page);

  const check = await (await fetch(`${API}/menu/products/${product.slug}`)).json();
  const got = (check.items || []).find((x) => x.id === itemId);
  return { ok: !!got?.image, reason: got?.image ? "ok" : "still null" };
}

async function main() {
  console.log("Admin:", BASE);
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  page.setDefaultTimeout(60000);
  await login(page);
  console.log("logged in");

  const products = await (await fetch(`${API}/menu/products`)).json();
  let flat = products.filter((p) => p.kind !== "builder");
  if (ONLY) flat = flat.filter((p) => ONLY.has(p.slug));
  flat.sort((a, b) => (a.slug === "loqaimat" ? -1 : b.slug === "loqaimat" ? 1 : 0));

  let ok = 0;
  let fail = 0;

  for (const p of flat) {
    const detail = await (await fetch(`${API}/menu/products/${p.slug}`)).json();
    const missing = (detail.items || []).filter((it) => !it.image);
    if (!missing.length) {
      console.log(`⏭ ${p.slug} (all have images)`);
      continue;
    }

    console.log(`\n→ ${p.slug} missing ${missing.length}`);
    await page.goto(`${BASE}/admin/products/${p.id}/edit`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForTimeout(1200);

    try {
      await openItemsTable(page);
    } catch (e) {
      console.log(`❌ ${p.slug} no items table: ${e.message}`);
      fail += missing.length;
      continue;
    }

    for (const it of missing) {
      const res = await uploadOneItem(page, p, it.id);
      if (res.ok) {
        console.log(`✅ ${p.slug}/${it.id}`);
        ok++;
      } else {
        console.log(`❌ ${p.slug}/${it.id} — ${res.reason}`);
        fail++;
      }
    }
  }

  let withImg = 0;
  let total = 0;
  for (const p of products.filter((x) => x.kind !== "builder")) {
    const d = await (await fetch(`${API}/menu/products/${p.slug}`)).json();
    for (const it of d.items || []) {
      total++;
      if (it.image) withImg++;
    }
  }

  console.log("\nDONE", { ok, fail, itemsWithImage: `${withImg}/${total}` });
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
