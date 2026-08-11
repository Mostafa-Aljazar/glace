# 04 — الهوم والفعاليات (Home & Events)

**الأولوية:** عاجل للشكل + عملية يدوية للصور  
**Endpoints:** `GET /home` · `GET /events` · `GET /events/{id}`  
**تاريخ التحقق على الـAPI الحي:** 2026-08-11

---

## ملخص سريع

| # | البند | نوع الشغل | الحالة الحيّة |
|---|---|---|---|
| 1 | الصور مسار نسبي بدل URL كامل | كود (Resource / Accessor) | ❌ مثال: `"manImg": "hero-slides/xxx.png"` |
| 2 | `about.paragraphs` شكل غلط | كود (Resource) | ❌ `[{ "text": "..." }]` بدل `["..."]` |
| 3 | رفع صورة بطاقة للفعاليات 4–10 | يدوي من الأدمن | جزئي — عند id 3 صورة؛ 4–10 غالباً `null` |
| 4 | `home.events.items` من 3 ← 10 | كود (limit/take) | ❌ الهوم يرجّع **3** وبلا صور |
| 5 | معرض `images[]` لتفاصيل الفعالية | شاشة + جدول جديد | ❌ دائماً `[null, null, null, null]` |
| — | `whyGlace.features[].image` | لا تعملوا شيء | ملاحظة فقط — الفرونت بيتجاهلها |

---

## 🔴 1. الصور لازم ترجع URL كامل

### المشكلة

الباك بيرجّع مسار تخزين نسبي:

```json
"manImg": "hero-slides/01KZRAB31FVVSVVAJNQD8YH3BY.png"
"image": "about/01KZRDEBZ60TV1QE6QW33NDEPD.png"
"listImage": "events/01KZRF7M84418CBNDS3PWADNCN.png"
```

المطلوب حسب العقد (`format: uri` في الـSwagger):

```json
"manImg": "http://acw348d983gr8x01lb5myd3x.64.176.172.179.sslip.io/storage/hero-slides/01KZRAB31FVVSVVAJNQD8YH3BY.png"
```

ده كان بيكسر الصفحة الرئيسية (خطأ parse / 500 على `next/image`) قبل ما الفرونت يضيف workaround مؤقت بـ`resolveMediaSrc`.  
**الـworkaround مش بديل للعقد — المطلوب من الباك URL كامل.**

### وين ينطبق

كل حقول الصور في:

- `home.hero.slides[]` → `manImg` · `pieceImg` · `zigzagsImg`
- `home.about.image`
- `home.events.items[].listImage` (أو `image` إن وُجد)
- `events[].listImage`
- `events[].images[]`
- ويفضّل نفس القاعدة على المنيو (`product.image` · `items[].image` · `flavors[].image`) لاتساق العقد

### التنفيذ المقترح (Laravel)

```php
'image' => $model->image_path
    ? Storage::disk('public')->url($model->image_path)
    : null,

// أو accessor موحّد
'manImg' => $this->storageUrl($slide->man_img_path),
```

تأكدوا إن `APP_URL` / `FILESYSTEM_DISK` يعطوا host صحيح للبيئة الحالية (sslip.io / production).

### معايير قبول

- [ ] كل حقول الصور في `/home` و`/events` تبدأ بـ`http://` أو `https://`
- [ ] المسار يتضمن `/storage/...` أو CDN حقيقي
- [ ] مفيش قيم نسبية مثل `hero-slides/...` أو `about/...` بدون origin
- [ ] الروابط تفتح في المتصفح مباشرة (200 + صورة)

```bash
curl -s "$API/home" | jq '.. | objects | .. | strings | select(test("^(hero-slides|about|events|products|flavors)/"))'
# المتوقع: لا نتائج
```

---

## 🔴 2. `about.paragraphs` = مصفوفة نصوص مباشرة

### الحالة الحيّة

```json
"paragraphs": [
  { "text": "تأسس جلاسيه الأمير عام 2015..." }
]
```

### المطلوب (Swagger + `IHomeAboutData`)

```json
"paragraphs": [
  "تأسس جلاسيه الأمير عام 2015...",
  "تعمل الشركة على تقديم أجود أنواع الآيس كريم..."
]
```

شكل `{ "text": "..." }` كان بيرمي error ويكسر قسم About — الفرونت عنده تطبيع مؤقت، المطلوب الباك يبعت `string[]`.

### تنفيذ

في الـAPI Resource:

```php
'paragraphs' => collect($about->paragraphs)
    ->map(fn ($p) => is_array($p) ? ($p['text'] ?? '') : (string) $p)
    ->values()
    ->all(),
```

أو خزّنوا أصلاً JSON كـ`string[]` في الداتابيس/الإعدادات.

### معايير قبول

- [ ] `typeof paragraphs[0] === "string"`
- [ ] مفيش عنصر من نوع object داخل المصفوفة
- [ ] قسم About في الهوم يعرض النصوص بدون أخطاء

```bash
curl -s "$API/home" | jq '.about.paragraphs | map(type) | unique'
# المتوقع: ["string"]
```

---

## 🟡 3. رفع صورة بطاقة للفعاليات الناقصة (يدوي)

### الحالة

حقل الأدمن **«صورة البطاقة»** موجود ويعمل.  
على الـAPI: فعالية واحدة على الأقل (`id: 3`) عندها `listImage`؛ معظم الباقي `listImage: null`، والهوم يعرض أحدث 3 (8، 9، 10) **بدون صور**.

### المطلوب

من شاشة تعديل الفعالية → ارفعوا «صورة البطاقة» للفعاليات **4 إلى 10** (وكل فعالية جديدة لاحقاً).

مش محتاج كود — رفع من الداشبورد فقط.

### معايير قبول

- [ ] كل فعالية ظاهرة في `/events` عندها `listImage` غير `null`
- [ ] بطاقات قائمة الفعاليات والهوم تظهر thumbnails حقيقية

---

## 🟡 4. `home.events.items`: من 3 إلى 10

### الحالة الحيّة

```text
home.events.items length = 3
ids: 10, 9, 8   ← وبالصدفة بدون listImage
```

### المطلوب

غيّروا الـ`limit` / `take` / `paginate` في كويري فعاليات الهوم من **3 → 10**.

الفرونت (الكاروسيل) بياخد **أي عدد** — مفيش قيد على 3.

### معايير قبول

- [ ] `GET /home` → `events.items.length` = حتى 10 (أو عدد الفعاليات المتوفرة إن أقل)
- [ ] العناصر مرتّبة بالأحدث أولاً (نفس منطق القائمة)

```bash
curl -s "$API/home" | jq '.events.items | length'
# المتوقع: 10 (أو عدد الفعاليات إن < 10)
```

---

## 🔴 5. معرض صور تفاصيل الفعالية `images[]` — شاشة جديدة

### المشكلة

شاشة تعديل الفعالية فيها **«صورة البطاقة»** فقط.  
مفيش واجهة لرفع معرض صفحة التفاصيل، فـ`images` بترجع دائماً:

```json
"images": [null, null, null, null]
```

حتى للفعاليات اللي عندها `listImage`.

الفرونت حالياً يعمل fallback على `listImage` للمعرض — **workaround مؤقت**.

### المطلوب

1. **جدول** منفصل مثلاً:

| عمود | نوع | ملاحظة |
|---|---|---|
| `id` | PK | |
| `event_id` | FK → events | |
| `path` / `url` | string | مسار التخزين |
| `sort_order` | int | ترتيب العرض |

2. **شاشة Filament:** رفع متعدد (FileUpload multiple / Repeater) على Edit Event، بنفس أسلوب صورة البطاقة.
3. **الـAPI:**

```json
"images": [
  "https://host/storage/events/3-a.png",
  "https://host/storage/events/3-b.png"
]
```

- مصفوفة strings (URL كامل بعد البند 1)
- **بدون** `null` داخل المصفوفة — إما روابط أو `[]` فارغة
- العقد يطلب `images` في `IEvent.required`

### معايير قبول

- [ ] من الأدمن تقدر ترفع أكثر من صورة لمعرض فعالية
- [ ] `GET /events/{id}` يرجّع `images` كمصفوفة روابط حقيقية (أو `[]`)
- [ ] مفيش `null` داخل `images`
- [ ] صفحة تفاصيل الفعالية تعرض المعرض من الـAPI بدون الاعتماد على fallback الفرونت

```bash
curl -s "$API/events/3" | jq '.images'
# المتوقع: ["http.../storage/...", ...]  — مش [null, null, ...]
```

---

## ⚪ ملاحظة — لماذا جلاسيه

خلفيات أزرار «لماذا جلاسيه» (الملوّنة تحت كل ميزة) **مش من الباك** — زينة تصميم ثابتة في الفرونت (تبديل أزرق/بني حسب الترتيب).

لو بتبعتوا `image` مع كل `whyGlace.features[]` → **مش لازم**. الفرونت بيتجاهلها والعقد يقول صراحة: لا ترسلوا صورة هنا.

---

## ترتيب التنفيذ المقترح

1. **بند 2** (`paragraphs`) — سطر Resource، أثر فوري  
2. **بند 1** (`Storage::url`) — موحّد لكل حقول الصور  
3. **بند 4** (limit 10) — سطر كويري  
4. **بند 3** — رفع يدوي لصور البطاقات  
5. **بند 5** — جدول + شاشة معرض (أكبر شغل)

بعدها: راجعوا [`03-media-and-cleanup.md`](./03-media-and-cleanup.md) لأي بنود وسائط متبقية على المنيو.
