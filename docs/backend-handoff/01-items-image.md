# 01 — صور الأصناف لكل منتجات flat-list (`items[].image`)

**الأولوية:** عالية  
**Endpoints:** `GET /menu/products` · `GET /menu/products/{slug}`  
**Schema:** `IProductVariant` في `docs/swagger.yaml`  
**تاريخ التحقق:** 2026-08-11

---

## قرار المنتج

**كل** منتج `kind: "flat-list"` — بدون استثناء — لازم كل صف داخل `items[]` يرجّع **`image`** غير فاضي.

ينطبق على الميلك شيك والبان كيك والذرة والمشروبات و… **كل الـ15 منتج / 69 صنف**.

الفرونت جاهز: بمجرد ما الحقل يوصل، الصورة تظهر جنب الاسم في `/menu/order/{slug}`.

---

## الحالة الحيّة (0 صور على الكل)

| slug | عناصر | عندها `image` |
|---|---:|---:|
| `milkshake` | 16 | **0** |
| `pancake` | 3 | **0** |
| `waffle` | 3 | **0** |
| `crepe` | 3 | **0** |
| `pizza` | 3 | **0** |
| `molten` | 3 | **0** |
| `brownie` | 3 | **0** |
| `cookies` | 4 | **0** |
| `cheesecake` | 4 | **0** |
| `kunafa` | 6 | **0** |
| `loqaimat` | 6 | **0** |
| `corn` | 3 | **0** |
| `juices` | 3 | **0** |
| `hot-drinks` | 4 | **0** |
| `cold-drinks` | 5 | **0** |
| **المجموع** | **69** | **0** |

صورة المنتج الأب (`product.image`) موجودة لمعظم المنتجات — **مش كافية**. المطلوب صورة **لكل صنف** في القائمة.

---

## المطلوب في الـAPI

كل عنصر في `items[]`:

| الحقل | مطلوب؟ | ملاحظة |
|---|---|---|
| `id` | نعم | موجود ✓ |
| `label` | نعم | موجود ✓ |
| `price` | نعم | موجود ✓ |
| `available` | نعم | موجود ✓ |
| **`image`** | **نعم** | ❌ ناقص على 69/69 |
| `description` | لا | اختياري |

في الـSwagger:

```yaml
IProductVariant:
  required: [id, label, price, available, image]
```

مثال:

```json
{
  "slug": "milkshake",
  "kind": "flat-list",
  "image": "products/milkshake-hero.png",
  "items": [
    {
      "id": "chocolate",
      "label": "كلاسيك شوكولاته",
      "price": 8,
      "available": true,
      "image": "products/items/milkshake-chocolate.png"
    },
    {
      "id": "nutella",
      "label": "سبيشال نوتيلا",
      "price": 10,
      "available": true,
      "image": "products/items/milkshake-nutella.png"
    }
  ]
}
```

مقبول: مسار storage أو URL مطلق حقيقي (مش `example.com`).

---

## شغل الأدمن (Filament) — مرة واحدة تغطي الكل

1. حقل رفع صورة على **عناصر المنتج** (Relation Manager / repeater للـitems) — مش بس صورة المنتج الأب.
2. نفس الواجهة لكل منتج flat-list (الـ15 أعلاه).
3. الـAPI Resource يسلّسل `image` لكل item في القائمة والتفصيل.

الأدمن يرفع صور الأصناف؛ الباك يرجّعها؛ الفرونت يعرضها تلقائياً لكل الصفحات.

---

## سلوك الفرونت (تم — لا شغل إضافي)

نفس `items[].image` بتظهر في:

1. قائمة الأصناف في `/menu/order/{slug}` (`OrderFlatListTemplate`)
2. **مودال المكس / سوبر مكس** (`MixFlavorModal`) — صف كل طعم: صورة + اسم (`label`) + سعر الوحدة داخل المكس

```tsx
{item.image && <Image src={resolveMenuImageSrc(item.image)} ... />}
```

بدون `image` من الـAPI → دائرة فاضية جنب الاسم (زي وافل مكس حالياً).  
الاسم والسعر شغالين من الحقول الموجودة؛ **الصورة تنتظر رفع `items[].image`.**

---

## معايير القبول

- [ ] **كل** عنصر في `GET /menu/products` عنده `image` غير فاضي (69/69)
- [ ] نفس الشيء في `GET /menu/products/{slug}` لكل الـ15 slug أعلاه
- [ ] مفيش `cdn.example.com` أو host ميت
- [ ] الصورة تفتح من المتصفح عبر `/storage/...` أو CDN حقيقي
- [ ] `/menu/order/milkshake` و`/menu/order/corn` و`/menu/order/pancake` … تظهر thumbnail لكل صف
- [ ] مودال المكس (مثلاً `/menu/order/waffle` → مكس) يظهر صورة لكل صنف جنب الاسم والسعر
- [ ] `scripts/audit-api.mjs` بند `(3) items[].image` يمرّ بنجاح

```bash
API=http://acw348d983gr8x01lb5myd3x.64.176.172.179.sslip.io/api

# لازم يطبع 0 لكل منتج
for slug in milkshake pancake waffle crepe pizza molten brownie cookies cheesecake kunafa loqaimat corn juices hot-drinks cold-drinks; do
  missing=$(curl -s "$API/menu/products/$slug" | jq '[.items[] | select(.image == null or .image == "")] | length')
  echo "$slug: missing=$missing"
done
```
