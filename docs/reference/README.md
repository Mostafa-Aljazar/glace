# مرجع: fake-data مقابل الباك اند

الملفات في [`fake-data/`](./fake-data/) أصلها منسوخ من آخر commit قبل ما نحوّل الفرونت
لـ backend-only، و**اتحدّثت بعدها** بالشكل المتفق عليه:

- كل عنصر أخد **`id` ثابت** (69 عنصر) — متحقّق إنها فريدة داخل كل منتج
- `flavorOptionIds` بقت **`itemIds`** وبتشاور على الـids دي مش على الأسماء

يعني هي دلوقتي **داتا seed جاهزة** يقدر الباك ياخد منها مباشرة، مش مجرد أرشيف.

هي **مرجع فقط** — مستثناة من `tsconfig.json` ومفيش أي ملف في `src/` بيستوردها،
فما بتأثرش على الـbuild ولا على الـbundle.

الغرض منها: (١) الباك يشوف الشكل المطلوب بمثال حقيقي، (٢) نعرف بالظبط إيش لسه ناقص.

> آخر تحقق مقابل `https://glace-bzjj.onrender.com/api` — 2026-08-09.

---

## 1. النكهات — ناقصة بالكامل 🔴

الباك ما بيبعتش نكهات خالص. (جرّبنا `/api/menu/flavors` و`/api/flavors`
و`/api/menu/tastes` و`/api/menu/products/{slug}/flavors` — كلها 404.)

> **القرار النهائي: مفيش endpoint للنكهات.** بتيجي **inline** جوه رد
> `GET /menu/products/{slug}` تحت مفتاح `flavors[]` — request واحد لصفحة الطلب،
> وكل منتج يقدر يعرض مجموعته الخاصة. التفاصيل في
> [`BACKEND_REQUIREMENTS.md`](../BACKEND_REQUIREMENTS.md) §3.1.

المرجع فيه **23 نكهة** ([`menu.ts`](./fake-data/menu.ts) → `FAKE_FLAVORS`):

| العائلة | العدد | الـids |
|---|---|---|
| `classic` | 13 | chocolate, vanilla, strawberry, caramel, dark-chocolate, nescafe, coconut, mango, banana, grape, bazooka, mario, lemon |
| `stevia` | 2 | vanilla-stevia, nescafe-stevia |
| `special` | 8 | arabian, nutella, oreo, kitkat, flora, kinder, lotus, pistachio |

حالات خاصة لازم الباك يحافظ عليها:
- `available: false` → **mango**, **flora**
- `isPremiumMixFlavor: true` → **pistachio** (بيتسعّر بـ`premiumFlavorPrice` مش `flavorPrice`)

**الأثر:** خطوة «اختر الأطعمة» فاضية، والطلب مقفول على **كاسة / عائلي / براد بوظة**.
`براد` شغال لأن `flavorFamilies: []` عنده. الـ15 منتج flat-list كلهم شغالين.

**الشكل المطلوب (inline جوه المنتج):**

```json
GET /api/menu/products/cup
{
  "slug": "cup", "kind": "builder", "...": "...",
  "flavors": [
    { "id": "chocolate", "nameAr": "شوكولاتة", "nameEn": "Chocolate",
      "image": "https://cdn.glace.ps/flavors/chocolate.png",
      "family": "classic", "available": true },
    { "id": "mango", "nameAr": "مانجا", "nameEn": "Mango",
      "image": "https://cdn.glace.ps/flavors/mango.png",
      "family": "classic", "available": false },
    { "id": "pistachio", "nameAr": "بيستاشيو", "nameEn": "Pistachio",
      "image": "https://cdn.glace.ps/flavors/pistachio.png",
      "family": "special", "available": true, "isPremiumMixFlavor": true }
  ]
}
```

⚠️ قائمة `GET /menu/products` **ما تحتويش** `flavors` — الـdetail بس.

`family` لازم تكون `classic` \| `special` \| `stevia` — الفاليديشن في
`fetchMenuProductById.ts` بيرفض أي قيمة تانية.

---

## 2. الصور — كلها روابط ميتة 🔴

كل صورة من الباك على `https://cdn.example.com/...` والدومين **مش موجود** (فشل DNS).

| | المرجع | الباك اند |
|---|---|---|
| صورة المنتج | ✅ 19/19 | ⚠️ 19/19 بس كلها `cdn.example.com` |
| صور عناصر flat-list | ✅ 69/69 | ❌ **0/69** — الحقل مش موجود أصلاً |
| صور الحاويات | ✅ 5 | ⚠️ 1 بس (`cup.biscuit`) وهي placeholder |
| صور النكهات | ✅ 23 | ❌ لا توجد نكهات أصلاً |

الفرونت بيعرض placeholder محايد لأي رابط ميت، وبيعدّي أي رابط حقيقي زي ما هو —
يعني أول ما الـCDN يشتغل مش محتاج أي تعديل كود.

**الأهم:** عناصر الـflat-list الـ69 مالهاش حقل `image` نهائياً — مش بس رابط ميت.
لازم يتضاف للـschema.

---

## 3. اختلافات في الـIDs

### حاويات `family`

| المرجع | الباك اند |
|---|---|
| `classic-container` | `plastic` |
| `flin` | `foam` |

الاتنين ليهم نفس الـlabel (بلاستيك / فلين) فالعرض سليم، بس الـids مختلفة —
مهم لو هتربط طلبات قديمة أو تعمل migration.

### أحجام `family`

| المرجع | الباك اند |
|---|---|
| `half-liter` / `one-liter` | `plastic-half` / `plastic-one` |
| `half-liter-flin` / `one-liter-flin` | `foam-half` / `foam-one` |

`cup` و`brad` و`brad-boza` الـids متطابقة ✅

---

## 4. مخالفات للـtype contract

```
brad   selectionMode: null   flavorFamilies: []
```

النوع `IBuilderProduct` بيقول `selectionMode?: SelectionMode` — يعني `undefined`
أو القيمة، **مش `null`**. والتوثيق بيقول `flavorFamilies` تكون **غائبة** لو مفيش خطوة
نكهات، مش array فاضية.

الكود بيتعامل معاها صح حالياً (`?.length` و`=== "repeatable"`)، بس TypeScript مش
شايفها لأن الـresponse بيتعمله cast. الأنضف إن الباك يحذف الحقلين بدل ما يبعتهم فاضيين.

### خلايا أسعار ناقصة

`cup` و`brad-boza` بيعلنوا `flavorFamilies: ["classic","special","mix"]` بس الـ`sizes`
مالهاش خلايا سعر لكل العائلات:

| المنتج | معلن | موجود فعلاً في `prices` |
|---|---|---|
| `cup` | classic, special, mix | classic, special |
| `brad-boza` | classic, special, mix | classic فقط |
| `family` | classic, special, mix | classic, special, mix ✅ |

`pickPriceCell()` بيعمل fallback (mix → special → classic) فمفيش كراش، وسلوك `cup`
موثّق ومقصود. بس **`brad-boza` محتاج تأكيد**: `special` بترجع لسعر classic والفرق
كله جاي من `iceCreamAddonPrices`. لو ده مقصود تمام، لو لأ فالأسعار غلط.

---

## 5. الإضافات (addons) — الباك أنضف من المرجع ✅

| | المرجع | الباك اند |
|---|---|---|
| المشتركة | 11 (فيها **تكرار**) | **7 فريدة** ✅ |
| `extra-biscuit` maxQty | 15 | 10 |
| per-product | — | milkshake: 6، pancake: 2 |

المرجع فيه `extra-caramel` و`extra-nutella` و`extra-nuts` و`extra-oreo` و`extra-lotus`
مكررين مرتين. الباك اند مظبوط هنا — **متنقلش التكرار للباك**.

⚠️ كان في الفرونت `EXTRA_BISCUIT_UNIT_PRICE = 1` hardcoded بينما الباك بيقول **3**.
اتصلح وبقى بياخد السعر والـ`maxQty` والـlabel من `/menu/addons`.

---

## 6. الوصف (description)

الباك بيبعت `description` لـ8 منتجات بس: pizza, crepe, waffle, pancake, brad-boza,
brad, cup, family. المرجع فيه أوصاف أكتر بكتير (88 موضع، أغلبها على مستوى العنصر).
مش blocker — بس المنيو أفقر نصياً من التصميم الأصلي.

---

## 7. سلوك غير متسق في الـAPI

| المسار | الحالي | المفروض |
|---|---|---|
| `GET /api/menu/products/{unknown}` | **200** + `{}` | `404` |
| `GET /api/events/{unknown}` | `404` + `{"message":"Not found"}` ✅ | — |

الفرونت بيتعامل مع الـbody الفاضي كـ«غير موجود»، بس المفروض يتظبط في الباك.

**فلترة الكاتيجوري:** البراميتر الصح `?category=` ✅. أي اسم تاني (`?categoryId=`)
**بيتجاهله الباك ويرجّع الـ19 كلهم** — سلوك خطر لو حد استخدم الاسم الغلط.

---

## ملخص الأولويات

| # | الفجوة | الخطورة | الأثر |
|---|---|---|---|
| 1 | `flavors[]` مش موجودة في رد المنتج | 🔴 | 3 منتجات مش قابلة للطلب |
| 2 | كل الصور `cdn.example.com` | 🔴 | مفيش صور حقيقية في الموقع |
| 3 | عناصر flat-list مالهاش `image` | 🟠 | 69 عنصر بصورة المنتج العامة |
| 4 | `brad-boza` أسعار special/mix | 🟠 | أسعار محتمل تكون غلط |
| 5 | `brad`: `null` / `[]` بدل حذف الحقل | 🟡 | مخالفة type contract |
| 6 | unknown slug بيرجع 200 | 🟡 | عدم اتساق |
| 7 | `description` ناقص لـ11 منتج | 🟡 | محتوى أفقر |

## ما تنقلوش للباك من المرجع

- تكرار الإضافات (11 → الصح 7)
- `EXTRA_BISCUIT_UNIT_PRICE = 1` (الصح 3)
- الـids القديمة `classic-container` / `flin` — الباك بـ`plastic`/`foam` أوضح

> **ملاحظة:** ملفات `fake-data/` هنا **اتحدّثت** بـ`items[].id` و`itemIds` —
> الجداول اللي فوق بتقارن الداتا نفسها (أسماء/أسعار/صور)، مش شكل الحقول.
