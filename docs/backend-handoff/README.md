# حزمة تعديلات للباك اند — Glace API

**تاريخ:** 2026-08-11  
**API الحالي:** `http://acw348d983gr8x01lb5myd3x.64.176.172.179.sslip.io/api`  
**العقد:** [`../swagger.yaml`](../swagger.yaml) · [`../MENU_CATALOG.md`](../MENU_CATALOG.md)

هذه المجلدات مخصّصة لإرسالها لفريق الباك. كل ملف = تذكرة تنفيذ مستقلة مع معايير قبول.

---

## الأولوية

| # | الملف | الأثر | الحالة على الـAPI الحي (2026-08-11) |
|---|---|---|---|
| 1 | [`01-items-image.md`](./01-items-image.md) | صور أصناف **كل** flat-list (15 منتج / 69 صنف) | ❌ `items[].image` = **0/69** |
| 2 | [`02-builder-flavors.md`](./02-builder-flavors.md) | قفل طلب `cup` / `brad-boza` / `family` | ❌ `available` محذوف لما `false` · `family` بدون `flavors` |
| 3 | [`05-builder-sizes.md`](./05-builder-sizes.md) | CRUD أنواع+أحجام+أسعار من الداشبورد · صور الأحجام | ❌ الأدمن ما بيدير `containerOptions`/`sizes` · مفيش `sizes[].image` |
| 4 | [`07-flat-list-mixes.md`](./07-flat-list-mixes.md) | CRUD مكس/سوبر مكس من الداشبورد (flat-list) | ❌ الأدمن ما بيدير `mixes[]` (بيانات API متسيّدة فقط) |
| 5 | [`06-brad-boza-media.md`](./06-brad-boza-media.md) | عنوان أسعار البراد بدون تكرار · بدون صورة كاسة | ⚠️ `pricingLabel` · ممنوع صورة ثانية |
| 6 | [`04-home-and-events.md`](./04-home-and-events.md) | كسر/ضعف الهوم والفعاليات | ❌ مسار نسبي · `paragraphs` غلط · limit 3 · معرض `null` |
| 7 | [`03-media-and-cleanup.md`](./03-media-and-cleanup.md) | صور نكهات + تنظيفات صغيرة | جزئي (صور المنتجات اتحسّنت) |

---

## تحقق سريع بعد التنفيذ

```bash
# شكل العقد + البنود المتفق عليها
node scripts/audit-api.mjs http://acw348d983gr8x01lb5myd3x.64.176.172.179.sslip.io/api

# عيّنة يدوية لصور الأصناف
curl -s .../api/menu/products/corn | jq '.items[] | {id, label, image}'

# عيّنة يدوية للنكهات
curl -s .../api/menu/products/cup | jq '.flavors[] | select(.id=="mango" or .id=="flora") | {id, available}'
curl -s .../api/menu/products/family | jq '.flavors | length'

# عيّنة يدوية للهوم / الفعاليات
curl -s .../api/home | jq '.about.paragraphs | map(type) | unique'
curl -s .../api/home | jq '.hero.slides[0].manImg'
curl -s .../api/home | jq '.events.items | length'
curl -s .../api/events/3 | jq '{listImage, images}'

# عيّنة يدوية لأحجام العائلي
curl -s .../api/menu/products/family | jq '.sizes[] | {id, image, available}'

# عيّنة يدوية للمكسات
curl -s .../api/menu/products/pancake | jq '.mixes[] | {id, available, pick, basePrice, itemIds}'
curl -s .../api/menu/products/kunafa | jq '.mixes'
```

القبول النهائي: `audit-api.mjs` يخرج `0` فشل، وكل الـ19 منتج يوصلوا لـ«أضف للسلة» بدون شاشة خطأ، والهوم/الفعاليات بدون placeholders مكسورة.

---

## ملاحظات للباك

- الفرونت **ما عندوش fallback** لداتا المنيو. رد ناقص/غلط = شاشة خطأ للزبون.
- **المطلوب للصور:** URL كامل عبر `Storage::disk('public')->url(...)`.  
  الفرونت عنده تطبيع مؤقت للمسارات النسبية — **مش بديل عن العقد** (شوف [`04-home-and-events.md`](./04-home-and-events.md) بند 1).
- روابط `cdn.example.com` **مرفوضة** (دومين ميت) وتُعامل كـ«مفيش صورة».
