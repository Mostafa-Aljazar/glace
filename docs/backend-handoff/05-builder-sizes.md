# 05 — التحكم بالأنواع والأحجام من الداشبورد

**الأولوية:** عالية  
**Endpoints:** `GET /menu/products` · `GET /menu/products/{slug}`  
**Schema:** `ISizeOption` · `IContainerOption` في `docs/swagger.yaml`  
**تاريخ:** 2026-08-11

---

## قرار المنتج

الأدمن يقدر من **Filament** يضيف / يعدّل / يحذف **الأنواع** و**الأحجام** لكل منتج `kind: "builder"` (`cup` · `family` · `brad` · `brad-boza` …).

**مش المقصود** نصوص العناوين «اختر النوع» / «اختر الحجم» — دي تبقى في الفرونت.  
**المقصود** محتوى الأزرار نفسها:

| على الشاشة (مثال كاسة) | مصدر البيانات | إدارة من الداشبورد |
|---|---|---|
| كاسة · بسكوت · تيك اواي | `containerOptions[]` | ✅ CRUD مطلوب |
| صغير · وسط · كبير | `sizes[]` | ✅ CRUD مطلوب |
| أسعار كل حجم | `sizes[].prices` | ✅ مطلوب |
| عنوان الخطوة «اختر النوع» | نص فرونت ثابت | ❌ مش مطلوب من الباك |

أي تغيير من الأدمن يظهر فوراً على `/menu/order/{slug}` بدون deploy فرونت.

---

## الحالة الحالية

الـAPI بيرجّع الأنواع والأحجام من الداتابيس، بس تبويب **إعدادات Builder** فيه فقط:

- وضع الاختيار (Toggle / Repeatable)
- عائلات النكهات
- نص `pricingLabel`
- سويتش «يتضمن خطوة أضف بوظة»

**مش موجود في الأدمن:**

- إضافة / تعديل / حذف **الأنواع** (`containerOptions`)
- إضافة / تعديل / حذف **الأحجام** (`sizes`)
- تعديل **الأسعار** داخل `sizes[].prices`
- رفع **صورة حجم** (`sizes[].image`)
- تعديل **`iceCreamAddonPrices`** (brad-boza)

---

## أ) CRUD الأنواع — `containerOptions[]`

| حقل | نوع | ملاحظة |
|---|---|---|
| `id` | string | ثابت بعد الإنشاء — زي `cup` / `lemon` / `plastic` |
| `label` | string | النص على الزر («كاسة»، «ليمون»، …) |
| `available` | toggle | إيقاف نوع بدون حذفه |
| `name` | string؟ | اسم ملخص الطلب إن لزم |
| `image` | FileUpload؟ | fallback لصورة الحجم / thumbnail |
| `pricingLabel` | string؟ | عنوان جدول أسعار الحاوية («الكاسة») |

| منتج | أمثلة أنواع |
|---|---|
| `cup` | كاسة · بسكوت · تيك اواي |
| `family` | بلاستيك · فلين |
| `brad-boza` | ليمون · مانجا · مكس |
| `brad` | حسب التعريف الحالي |

إضافة نوع جديد من الأدمن → يظهر زر جديد في خطوة الأنواع فوراً.

---

## ب) CRUD الأحجام — `sizes[]` (+ صورة)

| حقل | نوع | ملاحظة |
|---|---|---|
| `id` | string | ثابت — زي `cup-small` / `plastic-half` |
| `label` | string | «صغير» / «1/2 لتر» |
| `maxBalls` | int | حد الكرات |
| `containerId` | select؟ | يربط بنوع؛ فاضي = حجم مشترك (brad-boza) |
| `available` | toggle | |
| **`image`** | FileUpload | مفضّل لصفوف العائلي |
| `prices[]` | repeater | `flavorFamily` + `price` |

```json
{
  "id": "plastic-half",
  "label": "1/2 لتر",
  "maxBalls": 8,
  "available": true,
  "containerId": "plastic",
  "image": "https://host/storage/sizes/family-plastic-half.png",
  "prices": [
    { "flavorFamily": "classic", "price": 14 },
    { "flavorFamily": "special", "price": 18 },
    { "flavorFamily": "mix", "price": 16 }
  ]
}
```

الفرونت يعرض صورة الصف من: `sizes[].image` ثم fallback `containerOptions[].image`.

### عائلي حالياً (حي) — بدون صور

| الصف | `size.id` | `containerId` | صورة |
|---|---|---|---|
| 1/2 لتر بلاستيك | `plastic-half` | `plastic` | ❌ |
| 1 لتر بلاستيك | `plastic-one` | `plastic` | ❌ |
| 1/2 لتر فلين | `foam-half` | `foam` | ❌ (الحاوية موقوفة) |
| 1 لتر فلين | `foam-one` | `foam` | ❌ |

---

## ج) براد مع بوظة — أسعار الإضافة أيضاً

| إجراء من الداشبورد | النتيجة على `/menu/order/brad-boza` |
|---|---|
| تغيير سعر حجم صغير 1 → 5 | الجدول والإجمالي يتحدّثوا |
| إيقاف نوع مانجا | الزر يظهر «غير متوفر» |
| إضافة نوع برتقال | زر رابع في الأنواع |
| تغيير `iceCreamAddonPrices.classic` 3 → 4 | صغير+كلاسيك = 5 بدل 4 |

```json
{
  "containerOptions": [
    { "id": "lemon", "label": "ليمون", "available": true },
    { "id": "mango", "label": "مانجا", "available": true },
    { "id": "mix", "label": "مكس", "available": true }
  ],
  "sizes": [
    {
      "id": "brad-boza-small",
      "label": "صغير",
      "maxBalls": 2,
      "available": true,
      "prices": [{ "flavorFamily": "classic", "price": 1 }]
    }
  ],
  "iceCreamAddonPrices": [
    { "flavorFamily": "classic", "price": 3 },
    { "flavorFamily": "special", "price": 5 },
    { "flavorFamily": "mix", "price": 4 }
  ]
}
```

---

## د) انعكاس على الـAPI

أي تعديل أدمن ينعكس على:

- `GET /menu/products/{slug}`
- `GET /menu/products` (نفس الشكل؛ القائمة بدون `flavors` الطويل)

URL الصور: كامل عبر `Storage::disk('public')->url(...)`.

---

## معايير القبول

- [ ] من الأدمن: CRUD كامل لـ`containerOptions` (الأنواع) لكل builder
- [ ] من الأدمن: CRUD كامل لـ`sizes` + `prices` + صورة الحجم
- [ ] من الأدمن: تعديل `iceCreamAddonPrices` لـ`brad-boza`
- [ ] إضافة نوع أو حجم جديد يظهر في صفحة الطلب بدون deploy فرونت
- [ ] كل حجم على `family` يرجّع `image` (أو على الأقل `container.image` كـfallback)
- [ ] إيقاف `available` على نوع أو حجم ينعكس في الواجهة
- [ ] **لا** حقول عناوين خطوات (`typeStepTitle` …) — مش جزء من هذا الطلب

```bash
curl -s "$API/menu/products/cup" | jq '{containers: .containerOptions, sizes: [.sizes[] | {id, label, containerId, prices}]}'
curl -s "$API/menu/products/family" | jq '.sizes[] | {id, label, image, available, containerId}'
curl -s "$API/menu/products/brad-boza" | jq '{containers: .containerOptions, sizes: [.sizes[] | {id, label, prices}], iceCreamAddonPrices}'
```

---

## ملاحظة فرونت (تم)

- النوع / الحجم / الأسعار بتتنقرأ من الـAPI فقط (مفيش hardcode لليمون/صغير/…).
- عناوين الخطوات «اختر النوع» / «اختر الحجم» ثابتة في الفرونت — مش من الباك.
- `ISizeOption.image` موجود في الـtypes والـSwagger؛ العائلي يعرض thumbnail أو placeholder.
