/**
 * Set gallery image order to 1..4 for every event in Filament.
 * Filament rejects order < 1.
 *
 *   node scripts/reorder-event-galleries.mjs
 */
import { chromium } from "playwright";

const BASE =
  process.env.GLACE_ADMIN_BASE ||
  "https://back.glaceelameer.com";
const API = `${BASE}/api`;
const EMAIL = process.env.GLACE_ADMIN_EMAIL || "admin@glace.com";
const PASS = process.env.GLACE_ADMIN_PASSWORD || "admin123456";

async function login(page) {
  await page.goto(`${BASE}/admin/login`);
  if (!page.url().includes("login")) return;
  await page.fill("input[type=email]", EMAIL);
  await page.fill("input[type=password]", PASS);
  await page.click('button[type=submit]');
  await page.waitForURL((u) => !u.pathname.includes("/login"), {
    timeout: 30000,
  });
}

function galleryTable(page) {
  return page.locator("table").filter({ hasText: "مسار الملف" }).first();
}

async function openGallery(page, eventId) {
  await page.goto(`${BASE}/admin/events/${eventId}/edit`, {
    waitUntil: "domcontentloaded",
  });
  await page.waitForTimeout(1200);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(700);
  await page.getByText("معرض صور الفعالية").first().waitFor({ timeout: 20000 });
  const perPage = page.locator(".fi-pagination select").last();
  if (await perPage.count()) {
    await perPage.selectOption("all").catch(() =>
      perPage.selectOption({ label: "All" }),
    );
    await page.waitForTimeout(1200);
  }
}

async function readPathRows(page) {
  const table = galleryTable(page);
  if (!(await table.count())) return [];
  return table.locator("tbody tr").evaluateAll((trs) =>
    trs
      .map((tr, idx) => {
        const text = tr.innerText.replace(/\s+/g, " ").trim();
        const hasPath = /event-images\/|\.png|\.jpe?g|\.webp/i.test(text);
        const orderMatch = text.match(/\b(\d+)\b/);
        return { idx, hasPath, text: text.slice(0, 80), order: orderMatch?.[1] };
      })
      .filter((r) => r.hasPath),
  );
}

async function setOrderInModal(page, order) {
  const modal = page.locator(".fi-modal-open").last();
  const labeled = modal.getByLabel(/الترتيب|Order|Sort/i);
  if (await labeled.count()) {
    await labeled.first().fill(String(order));
    return;
  }
  const num = modal.locator('input[type="number"]').first();
  if (await num.count()) await num.fill(String(order));
}

async function saveEditModal(page) {
  const modal = page.locator(".fi-modal-open").last();
  const saveChanges = modal.getByRole("button", {
    name: "Save changes",
    exact: true,
  });
  const save = modal.getByRole("button", { name: "Save", exact: true });
  if (await saveChanges.count()) await saveChanges.click();
  else if (await save.count()) await save.click();
  else await modal.locator('button[type="submit"]').first().click();
  await page.waitForTimeout(2500);
  await page.keyboard.press("Escape").catch(() => {});
  await page.waitForTimeout(300);
}

async function reorderEvent(page, eventId) {
  await openGallery(page, eventId);
  const rows = await readPathRows(page);
  console.log(`\n=== event ${eventId} === path rows=${rows.length}`);
  if (!rows.length) {
    console.log("  (no images)");
    return;
  }

  const target = rows.slice(0, 4);
  for (let i = 0; i < target.length; i++) {
    const order = i + 1; // Filament min = 1
    const row = galleryTable(page).locator("tbody tr").nth(target[i].idx);
    await row.getByRole("button", { name: /^Edit$/i }).click();
    await page.waitForTimeout(1000);
    await setOrderInModal(page, order);
    await saveEditModal(page);
    console.log(`  set order=${order}`);
  }

  const after = await readPathRows(page);
  console.log(
    "  UI orders:",
    after.slice(0, 4).map((r) => r.order).join(", "),
  );
}

async function main() {
  const browser = await chromium.launch({
    channel: "chrome",
    headless: false,
    slowMo: 50,
  });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1100 },
  });
  page.setDefaultTimeout(45000);
  await login(page);

  const events = await (await fetch(`${API}/events?perPage=20`)).json();
  const ids = (events.items || []).map((e) => e.id).sort((a, b) => a - b);

  for (const id of ids) {
    try {
      await reorderEvent(page, id);
    } catch (e) {
      console.log(`❌ event ${id}: ${e.message}`);
      await page.keyboard.press("Escape").catch(() => {});
      try {
        await login(page);
      } catch {
        /* ignore */
      }
    }
  }

  console.log("\nREORDER DONE");
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
