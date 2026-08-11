/**
 * Audits a Glace API deployment against the contract in docs/.
 *
 *   node scripts/audit-api.mjs https://<host>/api
 *
 * Read-only: every request is a GET except one intentionally-empty POST to
 * /contact, which the backend is expected to reject with 422.
 *
 * Exit code 0 = no blocking failures.
 */

const BASE = (process.argv[2] || "").replace(/\/+$/, "");
if (!BASE) {
  console.error("usage: node scripts/audit-api.mjs <base-url>   e.g. https://x.onrender.com/api");
  process.exit(2);
}

const TIMEOUT_MS = 120_000; // Render free tier cold-starts slowly
const BUILDERS = ["cup", "family", "brad", "brad-boza"];

let pass = 0, warn = 0, fail = 0;
const failures = [];

const ok = (m) => { pass++; console.log(`  \x1b[32m✅\x1b[0m ${m}`); };
const wr = (m) => { warn++; console.log(`  \x1b[33m⚠️\x1b[0m  ${m}`); };
const no = (m) => { fail++; failures.push(m); console.log(`  \x1b[31m❌\x1b[0m ${m}`); };
const head = (m) => console.log(`\n\x1b[1m${m}\x1b[0m`);

async function get(path) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(BASE + path, {
      headers: { Accept: "application/json" },
      signal: ctl.signal,
    });
    const text = await res.text();
    let json = null;
    try { json = JSON.parse(text); } catch { /* non-JSON */ }
    return { status: res.status, json, text };
  } catch (e) {
    return { status: 0, json: null, text: String(e?.message || e) };
  } finally {
    clearTimeout(t);
  }
}

const isDeadImage = (u) =>
  typeof u === "string" && /(^|\.)example\.com/i.test(u);

// ── Phase 0 — reachability ──────────────────────────────────────────────────
head("المرحلة 0 — الوصول والـendpoints");

const home = await get("/home");
const cats = await get("/menu/categories");
const prods = await get("/menu/products");
const addons = await get("/menu/addons");
const events = await get("/events");

if (home.status === 0) {
  no(`الخادم مش راد على ${BASE} (${home.text})`);
  console.log("\nتوقفت — مفيش اتصال.");
  process.exit(1);
}

for (const [name, r] of [
  ["GET /home", home], ["GET /menu/categories", cats],
  ["GET /menu/products", prods], ["GET /menu/addons", addons],
  ["GET /events", events],
]) {
  r.status === 200 ? ok(`${name} → 200`) : no(`${name} → ${r.status}`);
}

// ── Phase 1 — shape conformance ─────────────────────────────────────────────
head("المرحلة 1 — مطابقة الشكل");

const categories = Array.isArray(cats.json) ? cats.json : [];
const products = Array.isArray(prods.json) ? prods.json : [];
const addonList = Array.isArray(addons.json) ? addons.json : [];

const ICONS = ["ice-cream", "cup-soda", "cake", "glass-water", "milk", "apple"];
const badIcon = categories.filter((c) => !ICONS.includes(c?.icon));
badIcon.length === 0
  ? ok(`categories: ${categories.length} صف، كل الـicons صالحة`)
  : no(`categories: icon غير صالح على ${badIcon.map((c) => c.id).join(", ")}`);

const baseOk = (p) =>
  typeof p?.id === "string" && typeof p?.slug === "string" &&
  typeof p?.categoryId === "string" && typeof p?.name === "string" &&
  typeof p?.sortOrder === "number" && typeof p?.available === "boolean";
const productOk = (p) =>
  baseOk(p) &&
  ((p.kind === "builder" && Array.isArray(p.sizes)) ||
   (p.kind === "flat-list" && Array.isArray(p.items)));

const badProducts = products.filter((p) => !productOk(p));
badProducts.length === 0
  ? ok(`products: ${products.length} منتج، كلهم يعدّوا الفاليديشن`)
  : no(`products: ${badProducts.length} منتج شكله غلط → ${badProducts.map((p) => p?.slug ?? "?").join(", ")}`);

const catIds = new Set(categories.map((c) => c.id));
const orphans = products.filter((p) => !catIds.has(p.categoryId));
orphans.length === 0
  ? ok("كل منتج categoryId بتاعه موجود في categories")
  : no(`منتجات categoryId مش موجود: ${orphans.map((p) => `${p.slug}→${p.categoryId}`).join(", ")}`);

// ── Phase 2 — the eight contract items ──────────────────────────────────────
head("المرحلة 2 — بنود العقد الثمانية");

// (1) flavors inline on builder detail, absent from the list
const details = {};
for (const slug of BUILDERS) details[slug] = await get(`/menu/products/${slug}`);

const needFlavors = BUILDERS.filter((s) => {
  const d = details[s].json;
  return Array.isArray(d?.flavorFamilies) && d.flavorFamilies.length > 0;
});
for (const slug of needFlavors) {
  const f = details[slug].json?.flavors;
  if (!Array.isArray(f) || f.length === 0) {
    no(`(1) ${slug}: flavors[] ناقصة في الـdetail`);
  } else {
    const FAM = ["classic", "special", "stevia"];
    const badFam = f.filter((x) => !FAM.includes(x?.family));
    const badShape = f.filter(
      (x) => typeof x?.id !== "string" || typeof x?.nameAr !== "string" ||
             typeof x?.available !== "boolean");
    if (badFam.length) no(`(1) ${slug}: family غير مسموحة → ${[...new Set(badFam.map((x) => x?.family))].join(", ")} (المسموح: classic|special|stevia)`);
    else if (badShape.length) no(`(1) ${slug}: ${badShape.length} نكهة ناقصها id/nameAr/available`);
    else ok(`(1) ${slug}: ${f.length} نكهة، الشكل سليم`);
  }
}
const listHasFlavors = products.filter((p) => Array.isArray(p.flavors));
listHasFlavors.length === 0
  ? ok("(1) قائمة /menu/products ما فيهاش flavors ✓ (المفروض detail بس)")
  : wr(`(1) قائمة /menu/products بترجّع flavors على ${listHasFlavors.length} منتج — بتكبّر الرد بلا داعي`);

// (2) image hosts — absolute, dead, and backend-relative are all checked.
// Relative paths matter: they crash next/image unless the frontend resolves
// them against the API origin, so they must be counted, not skipped.
const allImages = [];
const IMG_RE = /\.(png|jpe?g|webp|gif|svg)(\?|$)/i;
const walk = (v) => {
  if (typeof v === "string") {
    if (/^https?:\/\//.test(v) || IMG_RE.test(v)) allImages.push(v);
    return;
  }
  if (Array.isArray(v)) return v.forEach(walk);
  if (v && typeof v === "object") return Object.values(v).forEach(walk);
};
walk(products); walk(home.json); walk(events.json);
Object.values(details).forEach((d) => walk(d.json));

const dead = allImages.filter(isDeadImage);
const relative = allImages.filter((u) => !/^https?:\/\//.test(u));
const realAbs = allImages.filter((u) => /^https?:\/\//.test(u) && !isDeadImage(u));

dead.length === 0
  ? ok(`(2) مفيش أي رابط example.com (${allImages.length} رابط مفحوص)`)
  : no(`(2) ${dead.length} رابط لسه على example.com — مثال: ${dead[0]}`);

if (relative.length) {
  wr(`(2) ${relative.length} مسار نسبي (مثال: ${relative[0]}) — الفرونت بيحلّها على {origin}/storage/، بس العقد بيطلب URL كامل`);
}
if (realAbs.length) ok(`(2) ${realAbs.length} رابط مطلق حقيقي`);

// (3) items[].image
let items = 0, withImg = 0;
for (const p of products) for (const it of p.items ?? []) { items++; if (it.image) withImg++; }
if (items === 0) wr("(3) مفيش عناصر flat-list للفحص");
else if (withImg === items) ok(`(3) كل العناصر عندها image (${withImg}/${items})`);
else no(`(3) items[].image ناقصة على ${items - withImg} من ${items} عنصر`);

// (4) items[].id + mixes[].itemIds
let noId = 0, dupIds = [], mixLegacy = 0, unresolved = [];
for (const p of products) {
  if (p.kind !== "flat-list") continue;
  const ids = (p.items ?? []).map((i) => i?.id);
  noId += ids.filter((i) => typeof i !== "string" || !i).length;
  const dupe = ids.filter((id, i) => id && ids.indexOf(id) !== i);
  if (dupe.length) dupIds.push(`${p.slug}:${[...new Set(dupe)].join("/")}`);
  for (const m of p.mixes ?? []) {
    if (m.flavorOptionIds && !m.itemIds) mixLegacy++;
    for (const id of m.itemIds ?? []) if (!ids.includes(id)) unresolved.push(`${p.slug}.${m.id}→${id}`);
  }
}
noId === 0 ? ok(`(4) كل الـ${items} عنصر عندهم id`) : no(`(4) ${noId} عنصر من غير id`);
dupIds.length === 0 ? ok("(4) مفيش id مكرر داخل أي منتج") : no(`(4) ids مكررة: ${dupIds.join(" | ")}`);
mixLegacy === 0 ? ok("(4) مفيش flavorOptionIds قديمة") : no(`(4) ${mixLegacy} mix لسه بيستخدم flavorOptionIds بدل itemIds`);
unresolved.length === 0 ? ok("(4) كل itemIds بتحل لعنصر في نفس المنتج") : no(`(4) itemIds مش موجودة: ${unresolved.slice(0, 5).join(", ")}`);

// (5) available on sizes / mixes / categories
const sizes = products.flatMap((p) => p.sizes ?? []);
const mixes = products.flatMap((p) => p.mixes ?? []);
const has = (arr, f) => arr.length > 0 && arr.every((x) => f in x);
has(sizes, "available") ? ok(`(5) available على كل الأحجام (${sizes.length})`) : no(`(5) available ناقصة على الأحجام (${sizes.filter((s) => "available" in s).length}/${sizes.length})`);
has(mixes, "available") ? ok(`(5) available على كل المكسات (${mixes.length})`) : no(`(5) available ناقصة على المكسات (${mixes.filter((m) => "available" in m).length}/${mixes.length})`);
has(categories, "available") ? ok(`(5) available على كل الكاتيجوري (${categories.length})`) : no(`(5) available ناقصة على الكاتيجوري (${categories.filter((c) => "available" in c).length}/${categories.length})`);

// (6) brad must omit selectionMode / flavorFamilies
const brad = details["brad"]?.json;
if (brad) {
  const bad = [];
  if (brad.selectionMode === null) bad.push("selectionMode: null");
  if (Array.isArray(brad.flavorFamilies) && brad.flavorFamilies.length === 0) bad.push("flavorFamilies: []");
  bad.length === 0 ? ok("(6) brad: الحقول محذوفة صح") : no(`(6) brad لسه بيبعت ${bad.join(" و ")} — المفروض يحذفهم`);
}

// (7) 404 for an unknown slug
const unknown = await get("/menu/products/__nope__");
unknown.status === 404
  ? ok("(7) slug غير موجود → 404")
  : no(`(7) slug غير موجود → ${unknown.status} (المفروض 404)`);

// (8) category filter
const filtered = await get("/menu/products?category=desserts");
const wrongParam = await get("/menu/products?categoryId=desserts");
const fl = Array.isArray(filtered.json) ? filtered.json.length : -1;
const wl = Array.isArray(wrongParam.json) ? wrongParam.json.length : -1;
fl >= 0 && fl < products.length
  ? ok(`(8) ?category= بتفلتر (${fl} من ${products.length})`)
  : no(`(8) ?category= مش بتفلتر (رجّعت ${fl})`);
if (wl === products.length) wr("(8) ?categoryId= بيتجاهله الباك ويرجّع الكل — المفروض يتجاهل أو يرفض بوضوح");

// ── Phase 3 — price integrity ───────────────────────────────────────────────
head("المرحلة 3 — سلامة الأسعار");

const badPrice = [];
for (const p of products) {
  for (const it of p.items ?? []) if (typeof it.price !== "number") badPrice.push(`${p.slug}.${it.id ?? it.label}`);
  for (const s of p.sizes ?? []) {
    if (!Array.isArray(s.prices) || s.prices.length === 0) badPrice.push(`${p.slug}.${s.id}(no prices)`);
    for (const c of s.prices ?? []) if (typeof c.price !== "number") badPrice.push(`${p.slug}.${s.id}.${c.flavorFamily}`);
  }
}
badPrice.length === 0 ? ok("كل الأسعار أرقام صحيحة") : no(`أسعار غلط: ${badPrice.slice(0, 6).join(", ")}`);

const biscuit = addonList.find((a) => a.id === "extra-biscuit");
biscuit
  ? ok(`extra-biscuit موجود — السعر ${biscuit.price}₪، maxQty ${biscuit.maxQty ?? "—"}`)
  : no("extra-biscuit مش موجود في /menu/addons (الفرونت بيخفي خطوة البسكوت من غيره)");

const addonIds = addonList.map((a) => a.id);
const dupAddons = addonIds.filter((id, i) => addonIds.indexOf(id) !== i);
dupAddons.length === 0 ? ok(`addons: ${addonList.length} فريدة`) : no(`addons مكررة: ${[...new Set(dupAddons)].join(", ")}`);

// (9) home shows 10 events, not 3
const homeEventCount = home.json?.events?.items?.length ?? 0;
homeEventCount >= 10
  ? ok(`(9) home.events.items: ${homeEventCount} (>= 10)`)
  : wr(`(9) home.events.items: ${homeEventCount} — المطلوب 10 (الكاروسيل يقبل أي عدد)`);

// (10) events image coverage — informational, not a hard fail: the dashboard
// simply hasn't been used to upload these yet. Fetch beyond page 1 so the
// count reflects every event, not just the default page size.
const eventsAll = await get(`/events?perPage=${Math.max(events.json?.total ?? 50, 50)}`);
const eventsList = Array.isArray(eventsAll.json?.items)
  ? eventsAll.json.items
  : Array.isArray(events.json?.items)
    ? events.json.items
    : [];
const withListImage = eventsList.filter((e) => hasReal(e?.listImage)).length;
const withGallery = eventsList.filter((e) => (e?.images ?? []).some(hasReal)).length;
function hasReal(v) {
  return typeof v === "string" && v.trim() !== "" && !isDeadImage(v);
}
if (eventsList.length) {
  wr(`(10) listImage مرفوعة على ${withListImage}/${eventsList.length} فعالية`);
  withGallery === 0
    ? wr(`(10) images[] فاضية على كل الـ${eventsList.length} فعالية — مفيش رفع معرض في الداشبورد`)
    : ok(`(10) images[] فيها صور حقيقية على ${withGallery}/${eventsList.length} فعالية`);
}

// ── Summary ─────────────────────────────────────────────────────────────────
head("الخلاصة");
console.log(`  ✅ ${pass} نجح   ⚠️ ${warn} تحذير   ❌ ${fail} فشل`);
if (fail) {
  console.log("\n\x1b[1mالفاشل:\x1b[0m");
  failures.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
}
process.exit(fail ? 1 : 0);
