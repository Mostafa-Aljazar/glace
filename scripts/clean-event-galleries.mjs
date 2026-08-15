/**
 * Clean event galleries in Filament:
 * - delete rows without file path
 * - keep max 4 images
 * - set order 1..4 (Filament min is 1)
 * - add missing images up to 4
 *
 *   node scripts/clean-event-galleries.mjs
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const ASSETS = path.join(ROOT, "src", "assets", "images");
const BASE =
  process.env.GLACE_ADMIN_BASE ||
  "https://back.glaceelameer.com";
const API = `${BASE}/api`;
const EMAIL = process.env.GLACE_ADMIN_EMAIL || "admin@glace.com";
const PASS = process.env.GLACE_ADMIN_PASSWORD || "admin123456";

const FILES = ["i1.png", "i2.png", "i3.png", "i4.png"]
  .map((f) => path.join(ASSETS, f))
  .filter((p) => fs.existsSync(p));

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

async function openGallery(page, eventId) {
  await page.goto(`${BASE}/admin/events/${eventId}/edit`, {
    waitUntil: "domcontentloaded",
  });
  await page.waitForTimeout(1200);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(700);
  await page.getByText("معرض صور الفعالية").first().waitFor({ timeout: 20000 });
  // Show all rows so we can trim to exactly 4 without pagination traps
  const perPage = page.locator(".fi-pagination select").last();
  if (await perPage.count()) {
    await perPage.selectOption("all").catch(() =>
      perPage.selectOption({ label: "All" }),
    );
    await page.waitForTimeout(1500);
  }
}

function galleryTable(page) {
  return page.locator("table").filter({ hasText: "مسار الملف" }).first();
}

async function readRows(page) {
  const table = galleryTable(page);
  if (!(await table.count())) return [];
  return table.locator("tbody tr").evaluateAll((trs) =>
    trs.map((tr, idx) => {
      const cells = [...tr.querySelectorAll("td")].map((td) =>
        td.innerText.replace(/\s+/g, " ").trim(),
      );
      const joined = cells.join(" | ");
      const hasPath = /event-images\/|\.png|\.jpe?g|\.webp/i.test(joined);
      return { idx, hasPath, text: joined.slice(0, 100) };
    }),
  );
}

async function confirmDeleteModal(page) {
  await page.waitForTimeout(700);
  const modal = page
    .locator(".fi-modal-open")
    .filter({ hasText: /Are you sure|Delete event image|حذف/i });
  await modal.first().waitFor({ state: "attached", timeout: 10000 });
  const confirm = modal.locator('button[type="submit"]').filter({
    hasText: /Confirm|تأكيد/i,
  });
  await confirm.first().click({ force: true });
  await page.waitForTimeout(1800);
}

async function deleteRow(page, rowIndex) {
  const row = galleryTable(page).locator("tbody tr").nth(rowIndex);
  const del = row.getByRole("button", { name: /^Delete$/i });
  await del.click({ force: true });
  await confirmDeleteModal(page);
}

async function uploadInOpenModal(page, filePath) {
  let input = page.locator(".fi-modal-open input[type=file]").first();
  if (!(await input.count())) input = page.locator("input[type=file]").last();

  for (let i = 0; i < 2; i++) {
    const rm = page.locator(".fi-modal-open .filepond--action-remove-item").first();
    if (await rm.count()) {
      await rm.click().catch(() => {});
      await page.waitForTimeout(300);
    } else break;
  }

  const wait = page
    .waitForResponse(
      (r) => r.url().includes("livewire/upload-file") && r.ok(),
      { timeout: 90000 },
    )
    .catch(() => null);
  await input.setInputFiles(filePath);
  await wait;
  // Wait until FilePond reports complete (Create stays disabled while "Uploading file...")
  const modal = page.locator(".fi-modal-open").last();
  for (let i = 0; i < 30; i++) {
    const text = await modal.innerText().catch(() => "");
    if (/Upload complete/i.test(text) && !/Uploading file/i.test(text)) break;
    await page.waitForTimeout(500);
  }
  await page.waitForTimeout(800);
}

async function setOrder(page, order) {
  const labeled = page.locator(".fi-modal-open").getByLabel(/الترتيب|Order|Sort/i);
  if (await labeled.count()) {
    await labeled.first().fill(String(order));
    return;
  }
  const num = page.locator(".fi-modal-open input[type=number]").first();
  if (await num.count()) await num.fill(String(order));
}

async function saveModal(page) {
  const modal = page
    .locator(".fi-modal-open")
    .filter({ hasText: /Create event image|Edit event image|صورة|الترتيب/i })
    .last();
  await modal.waitFor({ state: "attached", timeout: 15000 });

  // Leave FilePond focus so Create/Save actually fires Livewire
  await modal.locator('input[type="number"]').first().click().catch(() => {});
  await page.waitForTimeout(300);

  const submit =
    (await modal.getByRole("button", { name: "Create", exact: true }).count())
      ? modal.getByRole("button", { name: "Create", exact: true })
      : (await modal.getByRole("button", { name: "Save changes", exact: true }).count())
        ? modal.getByRole("button", { name: "Save changes", exact: true })
        : (await modal.getByRole("button", { name: "Save", exact: true }).count())
          ? modal.getByRole("button", { name: "Save", exact: true })
          : modal.locator('button[type="submit"]').first();

  const lw = page
    .waitForResponse(
      (r) =>
        r.request().method() === "POST" &&
        r.url().includes("livewire") &&
        !r.url().includes("upload-file"),
      { timeout: 30000 },
    )
    .catch(() => null);

  // Real click first (force often skips Filament/Alpine handlers)
  try {
    await submit.click({ timeout: 5000 });
  } catch {
    await submit.evaluate((el) => el.click());
  }

  const resp = await lw;
  if (!resp) {
    // Fallback: native form submit
    await modal.locator("form").first().evaluate((f) => f.requestSubmit()).catch(() => {});
    await page.waitForTimeout(2500);
  } else {
    await page.waitForTimeout(2000);
  }

  // If create modal still open, something failed — leave it for caller
  const stillCreate = await page
    .locator(".fi-modal-open")
    .filter({ hasText: /Create event image/i })
    .count();
  if (!stillCreate) {
    await page.keyboard.press("Escape").catch(() => {});
    await page.waitForTimeout(400);
  }
}

async function addImage(page, filePath, order) {
  // Close any leftover modal
  await page.keyboard.press("Escape").catch(() => {});
  await page.waitForTimeout(400);
  await page.getByText("إضافة صورة").first().click();
  await page.waitForTimeout(1500);
  await uploadInOpenModal(page, filePath);
  await setOrder(page, order);
  await saveModal(page);
  // If create modal stuck open, cancel and signal failure via API check
  const stuck = await page
    .locator(".fi-modal-open")
    .filter({ hasText: /Create event image/i })
    .count();
  if (stuck) {
    await page.getByRole("button", { name: "Cancel", exact: true }).click().catch(() => {});
    await page.keyboard.press("Escape").catch(() => {});
    await page.waitForTimeout(500);
  }
}

async function apiImageCount(eventId) {
  const e = await (await fetch(`${API}/events/${eventId}`)).json();
  return (e.images || []).length;
}

async function cleanEvent(page, eventId) {
  await openGallery(page, eventId);
  console.log(`\n=== event ${eventId} ===`);

  // delete empties (no file path)
  for (let guard = 0; guard < 40; guard++) {
    const rows = await readRows(page);
    const emptyIdx = rows.findIndex((r) => !r.hasPath);
    if (emptyIdx < 0) break;
    console.log(`  delete empty #${emptyIdx}`);
    await deleteRow(page, emptyIdx);
  }

  // hard cap: delete until API reports <= 4 images
  for (let guard = 0; guard < 80; guard++) {
    const count = await apiImageCount(eventId);
    const rows = await readRows(page);
    const withPath = rows.filter((r) => r.hasPath);
    if (count <= 4 && withPath.length <= 4) break;
    if (!withPath.length) break;
    const last = withPath[withPath.length - 1];
    console.log(
      `  delete extra #${last.idx} (api=${count}, ui=${withPath.length})`,
    );
    await deleteRow(page, last.idx);
  }

  // add until API has exactly 4 (order must be >= 1 per Filament validation)
  for (let guard = 0; guard < 8; guard++) {
    const count = await apiImageCount(eventId);
    if (count >= 4) break;
    const order = count + 1; // 1..4
    console.log(`  add image → order ${order} (api=${count})`);
    await addImage(page, FILES[(order - 1) % FILES.length], order);
    await page.waitForTimeout(1200);
    const after = await apiImageCount(eventId);
    if (after <= count) {
      console.log(`  ⚠ add did not stick (still ${after}) — reopen & retry`);
      await page.keyboard.press("Escape").catch(() => {});
      await openGallery(page, eventId);
      continue;
    }
  }

  // final API-driven trim if overshot
  for (let guard = 0; guard < 20; guard++) {
    const count = await apiImageCount(eventId);
    if (count <= 4) break;
    await openGallery(page, eventId);
    const rows = await readRows(page);
    const withPath = rows.filter((r) => r.hasPath);
    if (!withPath.length) break;
    const last = withPath[withPath.length - 1];
    console.log(`  final trim #${last.idx} (api=${count})`);
    await deleteRow(page, last.idx);
  }

  // reorder first 4 rows that have path → 1..4
  await openGallery(page, eventId);
  for (let i = 0; i < 4; i++) {
    const rows = await readRows(page);
    const withPath = rows.filter((r) => r.hasPath);
    if (!withPath[i]) break;
    await galleryTable(page)
      .locator("tbody tr")
      .nth(withPath[i].idx)
      .getByRole("button", { name: /^Edit$/i })
      .click();
    await page.waitForTimeout(1200);
    await setOrder(page, i + 1);
    await saveModal(page);
    console.log(`  order=${i + 1}`);
  }

  const n = await apiImageCount(eventId);
  console.log(`  API images=${n}`);
  return n;
}

async function main() {
  if (FILES.length < 4) throw new Error("Need i1..i4.png in assets");
  // Visible Chrome so you can watch the dashboard CRUD
  const browser = await chromium.launch({
    channel: "chrome",
    headless: false,
    slowMo: 80,
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  page.setDefaultTimeout(45000);
  await login(page);

  const events = await (await fetch(`${API}/events?perPage=20`)).json();
  const ids = (events.items || []).map((e) => e.id).sort((a, b) => a - b);
  const results = {};
  for (const id of ids) {
    const existing = await apiImageCount(id);
    if (existing === 4) {
      console.log(`\n=== event ${id} === already 4, skip`);
      results[id] = 4;
      continue;
    }
    let ok = false;
    for (let attempt = 1; attempt <= 3 && !ok; attempt++) {
      try {
        results[id] = await cleanEvent(page, id);
        ok = results[id] === 4;
        if (!ok) console.log(`  retry event ${id} (got ${results[id]})`);
      } catch (e) {
        console.log(`❌ event ${id} attempt ${attempt}: ${e.message}`);
        results[id] = -1;
        await page.keyboard.press("Escape").catch(() => {});
        try {
          await login(page);
        } catch {
          /* ignore */
        }
        await page.waitForTimeout(2000 * attempt);
      }
    }
  }
  console.log("\nGALLERY FINAL", results);
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
