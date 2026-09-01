# Prompt: ربط الفرونت بالباك اند الحقيقي (بدل zustand/localStorage)

استخدم هاد النص كـprompt لاحق لتنفيذ التعديلات فعلياً بالكود، بعد ما الباك اند يجهز الـendpoints الموصوفة بـ`docs/backend-handoff/08` إلى `14`.

---

## الهدف

حالياً 6 أنظمة بالفرونت شغالة بالكامل على zustand + localStorage بدون أي اتصال بباك اند حقيقي:
**Auth (OTP)، Account/Profile، Addresses، Cart/Checkout، Orders، Payments، Wallet**.

المطلوب: استبدال التخزين/المنطق المحلي في كل نظام باستدعاءات فعلية للـAPI (عبر react-query، بنفس نمط `useMe.ts`/`useUpdateProfile.ts`/`useLogout.ts` الموجودين حالياً)، بحيث الفرونت يصير "غبي" (source of truth = السيرفر) بدل ما يحسب/يخزن كل شي بنفسه.

**لا تبدأ التنفيذ قبل ما تتأكد كل endpoint فعلياً شغال على الباك اند** (اختبره بـcurl/Postman أول) — التوثيق الكامل لكل endpoint موجود بـ:
- `docs/backend-handoff/08-auth-otp.md`
- `docs/backend-handoff/09-account-profile.md`
- `docs/backend-handoff/10-addresses.md`
- `docs/backend-handoff/11-cart-coupons.md`
- `docs/backend-handoff/12-orders.md`
- `docs/backend-handoff/13-payments.md`
- `docs/backend-handoff/14-wallet.md`

نفّذ نظام نظام (كل واحد PR/commit منفصل)، بالترتيب تحت، لأن بعضها يعتمد على بعض (auth أول شي، بعدين addresses، بعدين orders/payments اللي بتعتمد عليهم).

---

## 1. Auth (OTP) — `src/hooks/auth/useOtpAuth.ts`

- احذف `fakeSendOtp`/`fakeVerifyOtp` بالكامل (الكود الثابت `"123456"` والتوكن الوهمي `fake-token-...`).
- بدّلهم باستدعاء حقيقي عبر `userApi` (نفس axios instance المستخدم بـ`useMe.ts`):
  - `useSendOtp`: `POST /auth/otp/send` بـ`{ phone }`.
  - `useVerifyOtp`: `POST /auth/otp/verify` بـ`{ phone, code, fullName? }` → يرجع `{ token, user }`.
- تأكد `onSuccess` لسا بينادي `setAuth(token, user)` بنفس الشكل الحالي (`authStore.ts`) — ما تغيّر واجهة الـhook نفسها إذا ما لزم، بس الداخل.
- أضف معالجة أخطاء حقيقية: كود غلط (422)، rate-limit (429) — رسائل عربية واضحة بدل رسالة عامة.
- لا تلمس `PhoneOtpFlow.tsx`/`OtpInput.tsx`/`LoginForm.tsx`/`RegisterForm.tsx` إلا إذا شكل الاستجابة الفعلي من الباك اند اختلف عن الموصوف بـ`08-auth-otp.md`.

## 2. Account/Profile

- `useMe.ts`/`useUpdateProfile.ts`/`useLogout.ts` مبنيين أصلاً على `/auth/me`, `/auth/profile`, `/auth/logout` — تأكد بس إنهم فعلاً شغالين ضد الباك اند الحقيقي (مش mock)، وصحح أي فرق بشكل الاستجابة.
- مفيش تغيير متوقع بالمكونات (`ProfilePanel.tsx`) إذا شكل `AuthUser` طابق الموصوف.

## 3. Addresses — `src/store/addressStore.ts`

- هاد أكبر تغيير هيكلي: `addressStore` حالياً zustand+persist (localStorage) بالكامل. لازم يتحول لـreact-query (queries + mutations) بدل zustand state محلي:
  - `useAddresses()` → `GET /addresses`
  - `useAddAddress()` → `POST /addresses`
  - `useUpdateAddress(id)` → `PUT /addresses/{id}`
  - `useDeleteAddress(id)` → `DELETE /addresses/{id}`
  - `useSetDefaultAddress(id)` → `POST /addresses/{id}/default`
- كل الأماكن اللي بتستخدم `useAddressStore()` حالياً (`AddressesPanel.tsx`, `CheckoutClientPage.tsx`, `AddressForm.tsx`) لازم تتحول لاستخدام الـhooks الجديدة بدل الـstore مباشرة. خلي `invalidateQueries`/`optimistic update` مناسب بعد كل mutation.
- احتفظ بمنطق الفورم (`AddressForm.tsx` — zod schema، حقل `city` الثابت "غزة"، الخريطة/GPS) زي ما هو، بس غيّر شو بيصير بعد الـsubmit (استدعاء mutation بدل `addAddress`/`updateAddress` من الـstore).

## 4. Cart/Checkout

- **سلة المشتريات نفسها (`cartStore.ts`) تضل zustand محلي** — السلة قبل تأكيد الطلب مفيهاش داعي تنزل عالسيرفر (نفس منطق أي متجر إلكتروني: cart = client state لحد الـcheckout). **ما تلمسها**.
- اللي لازم يتغيّر:
  - **الكوبون** (`applyCoupon` بـ`cartStore.ts`): احذف `VALID_COUPONS` hardcoded، بدّلها باستدعاء `POST /cart/apply-coupon` (شوف `11-cart-coupons.md`) — الفرونت يرسل `code`+`subtotal`، السيرفر يرجع `valid`/`discount`. خزّن النتيجة بنفس حقول `coupon`/`discount` بالـstore متل ما هي.
  - **مناطق التوصيل** (`src/lib/deliveryZones.ts`): استبدل الـ31 منطقة الـhardcoded باستدعاء `GET /delivery-zones` فعلي (الدالة `fetchDeliveryZones()` موجودة أصلاً كـstub، فقط فعّلها بنداء حقيقي بدل ما ترجع المصفوفة الثابتة).
  - **حسابات الدفع** (`src/lib/merchantPaymentAccounts.ts`): استبدلها بـ`GET /payment-accounts` (`13-payments.md`).
- **لا تلمس** `src/lib/scheduling.ts` (منطق الجدولة) ولا `src/lib/deliveryRestrictions.ts` — هدول منطق فرونت بحت بدون حاجة لـAPI حسب `12-orders.md`، إلا إذا الباك اند أكّد رفض طلبات فيها صنف ممنوع توصيل (وقتها تقدر تشيل الفحص المحلي بثقة إنه السيرفر بيرفضه كمان بس خلّيه موجود كطبقة أولى للـUX السريع).

## 5. Orders — `src/store/orderStore.ts`

- هاد أكبر إعادة هيكلة. `orderStore` (zustand+persist) لازم يتحول بالكامل لـreact-query:
  - `usePlaceOrder()` → `POST /orders` — يرسل السلة (`items`)، `couponCode`، `paymentMethod`، `deliveryMethod`، `addressId` (مش عنوان حر — مرجع لعنوان محفوظ)، `pickupTime`، و`receiptImage`/`receiptNote` لو الطريقة من `RECEIPT_METHODS`. **مهم: لا ترسل `subtotal`/`discount`/`total` محسوبة بالفرونت للسيرفر كـmصدر حقيقة — إرسالها كمعلومة عرض فقط مقبول، بس السيرفر يعيد حسابها ولازم تستخدم القيم الراجعة من الاستجابة (`order.total` إلخ) لعرض التأكيد، مش القيم المحسوبة محلياً.**
  - `useOrders()` → `GET /orders`
  - `useOrder(id)` → `GET /orders/{id}`
  - `useCancelOrder()` → `POST /orders/{id}/cancel`
  - `useUpdateReceipt()` → `POST /orders/{id}/receipt`
  - `useMarkReceived()` → `POST /orders/{id}/received`
- احذف `getMockOrders()` بالكامل — كانت بس للتطوير المحلي.
- بعد كل `placeOrder` ناجح، امسح السلة (`clearCart()` من `cartStore.ts`) وحوّل المستخدم لصفحة تتبع الطلب بالـ`id` الراجع من السيرفر.
- المكونات المتأثرة: `CheckoutClientPage.tsx`, `PaymentClientPage.tsx`, `OrderStatusClientPage.tsx`, `OrdersPanel.tsx` — كلها لازم تستبدل `useOrderStore()` بالـhooks الجديدة.
- رفع الإيصال (`ReceiptUploadForm.tsx`): بدّل تحويل الصورة لـbase64 (`FileReader.readAsDataURL`) بإرسال الملف نفسه (`FormData`) لـmutation الطلب، بدل تخزين data URL بالـstate.

## 6. Payments/Wallet — `src/store/walletStore.ts`

- تحويل مماثل لـorders:
  - `useWallet()` → `GET /wallet` (`balance` + `transactions`)
  - `useSubmitTopUpRequest()` → `POST /wallet/topup-requests` (multipart لو فيه صورة إيصال)
  - `useTopUpRequests()` → `GET /wallet/topup-requests`
  - `useDeductWallet()` → `POST /wallet/deduct` — تعامل مع 409 (رصيد غير كافٍ) بعرض رسالة، مش افتراض النجاح محلياً.
- **احذف `approveTopUpRequest()` و`seedMockDataForTesting()` بالكامل من `walletStore.ts`** — كانوا بس محاكاة لمراجعة إدارية غير موجودة؛ الموافقة الفعلية لازم تصير من Filament فقط، مفيهاش داعي أي مسار بالفرونت يقدر "يوافق" على شحن.
- المكونات المتأثرة: `WalletPanel.tsx` بالكامل (كتب أصلاً بافتراض الـstore المحلي، +641 سطر) — يحتاج مراجعة دقيقة لكل مكان بينادي فيه `useWalletStore`.

## 7. تنظيف عام بعد كل الأنظمة فوق

- احذف `src/store/checkoutDraftStore.ts` **فقط لو** انتقل الـcheckout لتمرير `addressId`/`deliveryMethod` مباشرة بدل draft محلي — أو خليه إذا لسا مفيد لنقل الاختيارات بين صفحتي checkout/payment (قرار تصميم، مش إلزامي يترحذف).
- دوّر على أي بقايا استيراد لـ`orderStore`/`walletStore`/`addressStore` القديمة (zustand persist) بعد التحويل، وتأكد ما ضلت أي شاشة تقرأ من localStorage بالخطأ بدل الـAPI.
- شغّل typecheck (`npm run build` أو ما يعادلها) بعد كل نظام، مش بس بالآخر — التغييرات هون كبيرة وبتنكسر بسهولة لو تراكمت الأخطاء.

---

## ترتيب التنفيذ المقترح

1. Auth (OTP) — أساس كل شي تاني.
2. Account/Profile — تأكيد بسيط، مش تغيير كبير.
3. Addresses — لازم قبل Orders لأنه Orders بيرجع لها بـ`addressId`.
4. Cart (كوبون + مناطق + حسابات دفع فقط، مش السلة نفسها).
5. Orders.
6. Payments/Wallet.
7. تنظيف نهائي.
