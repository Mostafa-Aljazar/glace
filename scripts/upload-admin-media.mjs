/**
 * Manual media upload into Filament admin from local src/assets/images.
 * Covers: flavors, product cover images, event listImage, home about/why/hero when UI allows.
 *
 * Usage:
 *   node scripts/upload-admin-media.mjs
 *   node scripts/upload-admin-media.mjs --only=flavors
 *   node scripts/upload-admin-media.mjs --only=products,events,home
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const ASSETS = path.join(ROOT, "src", "assets", "images");
const FLAVORS_DIR = path.join(ASSETS, "flavors");

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
const want = (k) => !ONLY || ONLY.has(k);

const FLAVOR_FILES = {
  arabian: "arabian-ice.png",
  banana: "banana-ice.png",
  bazooka: "bazooka-ice.png",
  caramel: "caramel-ice.png",
  chocolate: "chocolate-ice.png",
  coconut: "coconut-ice.png",
  "dark-chocolate": "dark-ice.png",
  flora: "flora-ice.png",
  grape: "grape-ice.png",
  kinder: "kinder-Bueno-ice.png",
  kitkat: "kitKat-ice.png",
  lemon: "lemon-ice.png",
  lotus: "lotus-ice.png",
  mango: "mango-ice.png",
  mario: "mario-ice.png",
  nescafe: "nescafe-ice.png",
  nutella: "nutella-ice.png",
  oreo: "oreo-ice.png",
  pistachio: "pistachio-ice.png",
  strawberry: "strawberry-ice.png",
  vanilla: "vanillaa-ice.png",
  "vanilla-stevia": "vanillaa-ice.png",
  "nescafe-stevia": "nescafe-ice.png",
};

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

const EVENT_CYCLE = ["i1.png", "i2.png", "i3.png", "i4.png"];

function mustFile(...parts) {
  const p = path.join(...parts);
  if (!fs.existsSync(p)) throw new Error(`Missing file: ${p}`);
  return p;
}

async function login(page) {
  await page.goto(`${BASE}/admin/login`, { waitUntil: "domcontentloaded" });
  if (!page.url().includes("/login")) {
    console.log("Already logged in");
    return;
  }
  await page.locator('input[type="email"]').fill(EMAIL);
  await page.locator('input[type="password"]').fill(PASS);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL((u) => !u.pathname.includes("/login"), {
    timeout: 30000,
  });
  console.log("Logged in →", page.url());
}

async function clearExistingUploads(page) {
  // FilePond / Filament remove buttons
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
  } catch {
    /* fallback settle */
  }
  // Filament needs a beat to attach the temp upload to the form state
  await page.waitForTimeout(5000);
}

async function uploadOnPage(page, filePath, label) {
  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.waitFor({ state: "attached", timeout: 20000 });
  await clearExistingUploads(page);

  const uploadWait = waitForLivewireUpload(page);
  await fileInput.setInputFiles(filePath);
  await uploadWait;

  const save = page.getByRole("button", {
    name: /Save changes|حفظ التغييرات|Save/i,
  });

  if (await save.isDisabled().catch(() => true)) {
    const desc = page.getByLabel(/الوصف/i).first();
    if (await desc.count()) {
      const v = await desc.inputValue().catch(() => "");
      await desc.fill(`${v} `);
      await desc.fill(v);
    }
  }

  if (await save.isDisabled().catch(() => true)) {
    console.log(`  ⚠ ${label} — Save disabled (maybe already set)`);
    return;
  }

  await save.click({ timeout: 15000 });
  await page.waitForTimeout(3500);
  console.log(`  ✅ ${label}`);
}

async function uploadFlavors(page) {
  console.log("\n=== Flavors ===");
  for (const [slug, file] of Object.entries(FLAVOR_FILES)) {
    const filePath = mustFile(FLAVORS_DIR, file);
    const url = `${BASE}/admin/flavors/${slug}/edit`;
    try {
      await page.goto(url, { waitUntil: "domcontentloaded" });
      if (page.url().includes("/login")) throw new Error("session lost");
      // 404?
      const title = await page.title();
      if (/404|Not Found|غير موجود/i.test(title)) {
        console.log(`  ⏭ ${slug} — page missing`);
        continue;
      }
      await uploadOnPage(page, filePath, `flavor:${slug} ← ${file}`);
    } catch (e) {
      console.log(`  ❌ flavor:${slug} — ${e.message}`);
    }
  }
}

async function uploadOneProductAttempt(page, product, filePath) {
  await page.goto(`${BASE}/admin/products/${product.id}/edit`, {
    waitUntil: "domcontentloaded",
  });
  await page.waitForTimeout(1200); // let Alpine/Livewire/FilePond hydrate
  const basic = page.getByRole("tab", { name: /المعلومات الأساسية|Basic/i });
  if (await basic.count()) {
    await basic.first().click().catch(() => {});
    await page.waitForTimeout(500);
  }

  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.waitFor({ state: "attached", timeout: 20000 });
  await clearExistingUploads(page);
  await page.waitForTimeout(500);

  const uploadWait = page
    .waitForResponse((r) => r.url().includes("livewire/upload-file") && r.ok(), {
      timeout: 20000,
    })
    .catch(() => null);
  await fileInput.setInputFiles(filePath);
  const resp = await uploadWait;
  if (!resp) return false; // hydration race — caller retries
  await page.waitForTimeout(2000);

  const save = page.getByRole("button", { name: /Save changes|حفظ التغييرات|Save/i });
  if (await save.isDisabled().catch(() => true)) return false;
  await save.click({ timeout: 15000 });
  await page.waitForTimeout(3000);

  const check = await (await fetch(`${API}/menu/products/${product.slug}`)).json();
  return !!check.image;
}

async function uploadProducts(page) {
  console.log("\n=== Products ===");
  const list = await (await fetch(`${API}/menu/products`)).json();
  let ok = 0;
  let fail = 0;
  for (const p of list) {
    const file = PRODUCT_FILES[p.slug];
    if (!file) {
      console.log(`  ⏭ ${p.slug} — no mapped asset`);
      continue;
    }
    const filePath = mustFile(ASSETS, file);

    let success = false;
    for (let attempt = 1; attempt <= 3 && !success; attempt++) {
      try {
        success = await uploadOneProductAttempt(page, p, filePath);
      } catch (e) {
        console.log(`  ⚠ ${p.slug} attempt ${attempt} error: ${e.message}`);
      }
      if (!success && attempt < 3) {
        console.log(`  ↻ ${p.slug} attempt ${attempt} failed, retrying`);
      }
    }

    if (success) {
      console.log(`  ✅ product:${p.slug} ← ${file}`);
      ok++;
    } else {
      console.log(`  ❌ product:${p.slug} — failed after 3 attempts`);
      fail++;
    }
  }
  console.log(`\nProducts done: ${ok} ok, ${fail} failed`);
}

async function discoverFirstMatchingLink(page, texts) {
  for (const t of texts) {
    const link = page.getByRole("link", { name: new RegExp(t, "i") }).first();
    if (await link.count()) return link;
  }
  return null;
}

async function uploadEvents(page) {
  console.log("\n=== Events (listImage only) ===");
  // Open events list
  await page.goto(`${BASE}/admin/events`, { waitUntil: "domcontentloaded" });
  if (page.url().includes("/login")) throw new Error("session lost");

  // Collect edit hrefs
  const hrefs = await page.$$eval('a[href*="/admin/events/"]', (as) =>
    [
      ...new Set(
        as
          .map((a) => a.getAttribute("href"))
          .filter((h) => h && /\/admin\/events\/[^/]+\/edit/.test(h)),
      ),
    ],
  );

  if (!hrefs.length) {
    // Try numeric ids from API
    const events = await (await fetch(`${API}/events?perPage=20`)).json();
    const items = events.items || events.data || [];
    for (let i = 0; i < items.length; i++) {
      const id = items[i].id;
      const file = EVENT_CYCLE[i % EVENT_CYCLE.length];
      const filePath = mustFile(ASSETS, file);
      try {
        await page.goto(`${BASE}/admin/events/${id}/edit`, {
          waitUntil: "domcontentloaded",
        });
        await uploadOnPage(page, filePath, `event:${id} ← ${file}`);
      } catch (e) {
        console.log(`  ❌ event:${id} — ${e.message}`);
      }
    }
    return;
  }

  for (let i = 0; i < hrefs.length; i++) {
    const href = hrefs[i].startsWith("http") ? hrefs[i] : `${BASE}${hrefs[i]}`;
    const file = EVENT_CYCLE[i % EVENT_CYCLE.length];
    const filePath = mustFile(ASSETS, file);
    try {
      await page.goto(href, { waitUntil: "domcontentloaded" });
      await uploadOnPage(page, filePath, `event ← ${file} (${href})`);
    } catch (e) {
      console.log(`  ❌ event ${href} — ${e.message}`);
    }
  }
}

async function openFirstEditOrList(page, listPath) {
  await page.goto(`${BASE}${listPath}`, { waitUntil: "domcontentloaded" });
  const edit = await page.$$eval("a[href*='/edit']", (as) =>
    as.map((a) => a.getAttribute("href")).filter(Boolean),
  );
  if (edit[0]) {
    const href = edit[0].startsWith("http") ? edit[0] : `${BASE}${edit[0]}`;
    await page.goto(href, { waitUntil: "domcontentloaded" });
    return href;
  }
  // singleton create/edit on same page
  return page.url();
}

async function uploadHome(page) {
  console.log("\n=== Home (about / why / hero) ===");

  // About
  try {
    await openFirstEditOrList(page, "/admin/home-abouts");
    const candidates = ["imgpp.png", "imgWhyGlace.png", "happinessExpertsImg.png"];
    let filePath = null;
    for (const c of candidates) {
      const p = path.join(ASSETS, c);
      if (fs.existsSync(p)) {
        filePath = p;
        break;
      }
    }
    if (filePath && (await page.locator('input[type="file"]').count())) {
      await uploadOnPage(page, filePath, `home:about ← ${path.basename(filePath)}`);
    } else {
      console.log("  ⏭ about — no file input or asset");
    }
  } catch (e) {
    console.log(`  ❌ about — ${e.message}`);
  }

  // Why Glace
  try {
    await openFirstEditOrList(page, "/admin/home-why-glaces");
    const whyFiles = [
      "imgWhyGlace.png",
      "happinessExpertsImg.png",
      "checkImg.png",
      "checkImgB.png",
      "popImgP.png",
      "popImgB.png",
    ]
      .map((f) => path.join(ASSETS, f))
      .filter((p) => fs.existsSync(p));

    const inputs = page.locator('input[type="file"]');
    const count = await inputs.count();
    if (count === 1 && whyFiles[0]) {
      await uploadOnPage(page, whyFiles[0], `home:why ← ${path.basename(whyFiles[0])}`);
    } else if (count > 1 && whyFiles.length) {
      for (let i = 0; i < Math.min(count, whyFiles.length); i++) {
        await Promise.all([
          waitForLivewireUpload(page),
          inputs.nth(i).setInputFiles(whyFiles[i]),
        ]);
      }
      const save = page.getByRole("button", {
        name: /Save changes|حفظ التغييرات|Save/i,
      });
      if (await save.count()) await save.click();
      await page.waitForTimeout(2500);
      console.log(`  ✅ home:why — ${Math.min(count, whyFiles.length)} files`);
    } else {
      console.log("  ⏭ why — no file inputs");
    }
  } catch (e) {
    console.log(`  ❌ why — ${e.message}`);
  }

  // Hero slides
  try {
    await page.goto(`${BASE}/admin/hero-slides`, { waitUntil: "domcontentloaded" });
    const editHrefs = await page.$$eval("a[href*='/edit']", (as) =>
      [...new Set(as.map((a) => a.getAttribute("href")).filter(Boolean))],
    );

    const manFiles = [
      "man1.png",
      "man2.png",
      "man3.png",
      "man4.png",
      "man5.png",
      "man6.png",
    ]
      .map((f) => path.join(ASSETS, f))
      .filter((p) => fs.existsSync(p));

    if (!editHrefs.length) console.log("  ⏭ hero — no edit links");

    for (let i = 0; i < editHrefs.length; i++) {
      const href = editHrefs[i].startsWith("http")
        ? editHrefs[i]
        : `${BASE}${editHrefs[i]}`;
      const filePath = manFiles[i % manFiles.length];
      if (!filePath) break;
      try {
        await page.goto(href, { waitUntil: "domcontentloaded" });
        if (!(await page.locator('input[type="file"]').count())) {
          console.log(`  ⏭ hero[${i}] — no file input`);
          continue;
        }
        // Prefer manImg: if multiple file inputs, fill all with same man image cycle
        const inputs = page.locator('input[type="file"]');
        const n = await inputs.count();
        for (let j = 0; j < n; j++) {
          const f = manFiles[(i + j) % manFiles.length];
          await Promise.all([
            waitForLivewireUpload(page),
            inputs.nth(j).setInputFiles(f),
          ]);
        }
        const save = page.getByRole("button", {
          name: /Save changes|حفظ التغييرات|Save/i,
        });
        await save.click({ timeout: 15000 });
        await page.waitForTimeout(2500);
        console.log(
          `  ✅ home:hero[${i}] ← ${path.basename(filePath)} (${n} inputs)`,
        );
      } catch (e) {
        console.log(`  ❌ hero[${i}] — ${e.message}`);
      }
    }
  } catch (e) {
    console.log(`  ❌ hero — ${e.message}`);
  }
}

async function main() {
  console.log("Admin:", BASE);
  console.log("Assets:", ASSETS);

  const headless = process.env.GLACE_HEADLESS !== "false";
  const browser = await chromium.launch({ channel: 'chrome', headless });
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await context.newPage();
  page.setDefaultTimeout(45000);

  try {
    await login(page);
    if (want("flavors")) await uploadFlavors(page);
    if (want("products")) await uploadProducts(page);
    if (want("events")) await uploadEvents(page);
    if (want("home")) await uploadHome(page);
  } finally {
    await browser.close();
  }

  // Verify API
  console.log("\n=== API verify ===");
  const cup = await (await fetch(`${API}/menu/products/cup`)).json();
  const flavImg = (cup.flavors || []).filter((f) => f.image).length;
  const products = await (await fetch(`${API}/menu/products`)).json();
  const prodImg = products.filter((p) => p.image).length;
  const home = await (await fetch(`${API}/home`)).json();
  const events = await (await fetch(`${API}/events?perPage=20`)).json();
  const listImg = (events.items || []).filter((e) => e.listImage).length;
  console.log({
    flavorImages: `${flavImg}/${(cup.flavors || []).length}`,
    productImages: `${prodImg}/${products.length}`,
    homeAbout: home.about?.image || null,
    heroSlides: (home.hero?.slides || []).length,
    eventListImage: `${listImg}/${(events.items || []).length}`,
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
