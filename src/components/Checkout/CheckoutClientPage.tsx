"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Truck,
  Store,
  Utensils,
  MapPin,
  Plus,
  Pencil,
  Trash2,
  LogIn,
  ShoppingCart,
  Users,
  TriangleAlert,
  Clock,
} from "lucide-react";
import EventsBackground from "@/components/Events/EventsBackground";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { useAddressStore } from "@/store/addressStore";
import {
  useAddresses,
  useAddAddress,
  useDeleteAddress,
} from "@/hooks/addresses";
import { useCheckoutDraftStore } from "@/store/checkoutDraftStore";
import ScheduleTimePicker from "@/components/Checkout/ScheduleTimePicker";
import AddressForm from "@/components/Checkout/AddressForm";
import LoginSheet from "@/components/Checkout/LoginSheet";
import {
  formatTime12h,
  getScheduleDays,
  isDeliveryAvailableToday,
  scheduleToISOString,
} from "@/lib/scheduling";
import { generateScheduleSlotsFromAPI } from "@/lib/storeStatusUtils";
import { getDeliveryBlockingItem } from "@/lib/deliveryRestrictions";
import { useMenuProducts } from "@/hooks/menu/useMenuProducts";
import { useStoreStatus } from "@/hooks/store";

type DeliveryMethod = "delivery" | "pickup" | "dine-in";

const labelClass = "text-white/70 text-[14px] font-semibold mb-1.5";
const sectionLabelClass =
  "text-white/50 text-[13px] font-bold tracking-wide uppercase";

export default function CheckoutClientPage() {
  const [cancelOpen, setCancelOpen] = useState(false);
  const [delivery, setDelivery] = useState<DeliveryMethod>("dine-in");
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const cartTotal = useCartStore((s) => s.total());
  const { data: menuProducts } = useMenuProducts();
  const { data: storeStatus } = useStoreStatus();

  // Use real API data for store/delivery status
  const storeOpen = storeStatus?.storeOpen ?? true;
  const deliveryOpen = storeStatus?.deliveryOpen ?? true;
  const closedMessage =
    storeStatus?.closedMessage ?? "نستقبل طلباتكم غداً خلال ساعات العمل";
  const deliveryClosedMessage =
    storeStatus?.deliveryClosedMessage ??
    "خدمة التوصيل غير متاحة حالياً، تحقق من ساعات العمل";
  const autoConfirmMinutes = storeStatus?.autoConfirmMinutes ?? 25;
  const timezone = storeStatus?.timezone ?? "Asia/Gaza";
  const serverTime = storeStatus?.serverTime;

  // Generate schedule from API data or fallback to hardcoded
  const scheduleDays = useMemo(() => {
    if (
      storeStatus?.schedule?.delivery &&
      storeStatus.schedule.delivery.length > 0
    ) {
      return generateScheduleSlotsFromAPI(
        storeStatus.schedule.delivery,
        3,
        serverTime ? new Date(serverTime) : undefined,
      );
    }
    return getScheduleDays();
  }, [storeStatus?.schedule?.delivery, serverTime]);

  // Starts unchecked/off — scheduling is optional ("اختياري"), so the
  // picker shouldn't look pre-selected until the customer opts in via its
  // checkbox (ScheduleTimePicker fills in the earliest slot once checked).
  const [schedule, setSchedule] = useState<{
    date: string;
    time: string;
  } | null>(null);
  const scheduleLabel = schedule
    ? `${scheduleDays.find((d) => d.date === schedule.date)?.label ?? schedule.date} · ${formatTime12h(schedule.time)}`
    : undefined;
  // The backend expects a real datetime for `pickupTime`, not the Arabic
  // display label above (which it rejects: "must be a valid date").
  const pickupTimeISO = schedule ? scheduleToISOString(schedule) : undefined;
  const [captainNote, setCaptainNote] = useState("");
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [storeClosedOpen, setStoreClosedOpen] = useState(false);
  const [deliveryUnavailableOpen, setDeliveryUnavailableOpen] = useState(false);
  const [deliveryBlockedOpen, setDeliveryBlockedOpen] = useState(false);
  const [loginSheetOpen, setLoginSheetOpen] = useState(false);

  const deliveryBlockingItem = useMemo(
    () => getDeliveryBlockingItem(items, menuProducts ?? []),
    [items, menuProducts],
  );

  const isLoggedIn = useAuthStore((s) => s.isLoggedIn());
  const user = useAuthStore((s) => s.user);
  const [orderingForSomeoneElse, setOrderingForSomeoneElse] = useState(false);
  const { data: addresses = [], refetch: refetchAddresses } = useAddresses();
  const selectedId = useAddressStore((s) => s.selectedId);
  const addAddressMutation = useAddAddress();
  const removeAddressMutation = useDeleteAddress();
  const selectAddress = useAddressStore((s) => s.selectAddress);
  const selectedAddress = addresses.find((a) => a.id === selectedId) ?? null;
  const setCheckoutDraft = useCheckoutDraftStore((s) => s.setDraft);

  // Auto-select a default address only once addresses first load — guarded
  // by a ref (not just `!selectedId`) so a `confirmNewAddress` refetch that
  // resolves before its own `selectAddress(id)` commits can't have this
  // effect race it back to the default address on the same addresses update.
  const didAutoSelect = useRef(false);
  useEffect(() => {
    if (didAutoSelect.current || selectedId || addresses.length === 0) return;
    didAutoSelect.current = true;
    const defaultAddress = addresses.find((a) => a.isDefault);
    selectAddress(defaultAddress?.id ?? addresses[0].id);
  }, [addresses, selectedId, selectAddress]);

  function handleToggleForSomeoneElse(value: boolean) {
    setOrderingForSomeoneElse(value);
  }

  const isAddingNewAddress = addresses.length === 0 || showNewAddressForm;
  const [confirmingNewAddress, setConfirmingNewAddress] = useState(false);

  /** Going straight from a freshly-created address to `/payment` (using the
   *  id from the `POST /addresses` response) intermittently gets rejected
   *  by `POST /orders` with "اختر عنوان التوصيل" — the backend doesn't treat
   *  that address as ready yet in the same round trip. Instead: save it,
   *  re-fetch the saved-addresses list from the server so the new one is
   *  confirmed present, select it there, and drop back to the normal saved-
   *  address screen — the customer then explicitly presses "تأكيد وانتقل
   *  للدفع" like any other saved address, never auto-navigating on a
   *  same-request id. `selectedId` is persisted (see addressStore) so it
   *  survives that round trip. */
  async function confirmNewAddress(id: string) {
    setConfirmingNewAddress(true);
    const previousIds = new Set(addresses.map((a) => a.id));
    const { data: freshAddresses } = await refetchAddresses();
    // The id from the `POST /addresses` response has, in practice, not
    // always matched the id the same address later carries in
    // `GET /addresses` — fall back to "whichever address is new since
    // before this save" so selection doesn't silently miss.
    const match =
      freshAddresses?.find((a) => a.id === id) ??
      freshAddresses?.find((a) => !previousIds.has(a.id));
    selectAddress(match?.id ?? id);
    setConfirmingNewAddress(false);
    setShowNewAddressForm(false);
  }

  function goToPayment(
    address: {
      name: string;
      phone: string;
      city: string;
      zoneId: string;
      area?: string;
      fee?: number;
      street: string;
      landmark?: string;
    },
    addressId?: string,
  ) {
    if (deliveryBlockingItem) {
      setDeliveryBlockedOpen(true);
      return;
    }
    setCheckoutDraft({
      deliveryMethod: "delivery",
      address: {
        name: address.name,
        phone: address.phone,
        city: address.city,
        // Trust the value saved with the address as-is — the backend's own
        // `area`/`fee` are the source of truth, not a local zone lookup.
        area: address.area ?? "",
        street: address.street,
        landmark: address.landmark,
        note: captainNote.trim() || undefined,
      },
      addressId,
      deliveryFee: address.fee ?? 0,
      pickupTime: pickupTimeISO,
    });
    router.push("/payment");
  }

  function onConfirmSavedAddress() {
    if (!selectedAddress) return;
    goToPayment(selectedAddress, selectedAddress.id);
  }

  function handleCancelOrder() {
    clearCart();
    setCancelOpen(false);
    router.push("/menu");
  }

  if (items.length === 0) {
    return (
      <div className="relative bg-[radial-gradient(circle,#41a2c5_0%,#388dab_100%)] min-h-screen overflow-x-hidden">
        <EventsBackground />
        <div className="z-90 relative flex flex-col justify-center items-center mx-auto px-4 pt-24 lg:pt-28 pb-12 max-w-300 min-h-screen">
          <div className="relative bg-white/12 backdrop-blur-xl px-6 py-16 sm:py-20 border border-white/15 rounded-[32px] w-full max-w-md overflow-hidden text-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(244,228,81,0.12),transparent_55%)] pointer-events-none" />
            <div className="relative flex flex-col items-center gap-5 animate-in duration-500 fade-in zoom-in-95">
              <div className="flex justify-center items-center bg-white/10 shadow-[0_0_40px_rgba(244,228,81,0.15)] border border-white/15 rounded-full size-24 text-glace-yellow">
                <ShoppingCart size={40} strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="mb-2 font-bold text-[26px] text-white sm:text-[28px]">
                  لا يوجد منتجات في السلة
                </h2>
                <p className="mx-auto max-w-xs text-[15px] text-white/60">
                  اختَر من منيو Glace وابدأ طلبك بخطوة واحدة
                </p>
              </div>
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 bg-glace-yellow hover:bg-yellow-300 shadow-[0_8px_28px_rgba(244,228,81,0.3)] px-8 py-3.5 rounded-full font-bold text-[#1e6a7f] text-[15px] transition-all hover:-translate-y-0.5"
              >
                <ShoppingCart size={16} />
                تصفح المنيو
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-[radial-gradient(circle,#41a2c5_0%,#388dab_100%)] min-h-screen overflow-x-hidden">
      <EventsBackground />

      <div className="z-90 relative mx-auto px-2 sm:px-4 pt-22.5 lg:pt-26.5 pb-40 lg:pb-12 max-w-300">
        <h1 className="mb-6 text-[40px] text-white sm:text-[50px] text-center">
          إتمام الطلب
        </h1>

        <Dialog open={storeClosedOpen} onOpenChange={setStoreClosedOpen}>
          <DialogContent
            showCloseButton={false}
            className="bg-[radial-gradient(circle,#41a2c5_0%,#388dab_100%)] p-6 sm:p-8 border-0 rounded-[30px] ring-0 text-white text-center"
          >
            <DialogHeader className="items-center gap-3">
              <div className="flex justify-center items-center bg-rose-500 rounded-full size-16">
                <Clock className="size-8 text-white" strokeWidth={2.5} />
              </div>
              <DialogTitle className="text-white text-2xl">
                المتجر مغلق حالياً
              </DialogTitle>
              <DialogDescription className="text-white/90 text-base">
                {closedMessage}
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center gap-2.5 mt-4">
              <Link
                href="/#location"
                className="flex-1 bg-white/12 hover:bg-white/18 px-6 py-2.5 rounded-[30px] font-bold text-white text-lg text-center transition-colors"
              >
                ساعات العمل
              </Link>
              <DialogClose
                render={
                  <button
                    type="button"
                    className="flex-1 bg-glace-yellow hover:bg-yellow-300 px-6 py-2.5 rounded-[30px] font-bold text-[#1e6a7f] text-lg transition-colors cursor-pointer"
                  />
                }
              >
                حسناً
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
          <DialogContent
            showCloseButton={false}
            className="bg-[radial-gradient(circle,#41a2c5_0%,#388dab_100%)] p-6 sm:p-8 border-0 rounded-[30px] ring-0 text-white text-center"
          >
            <DialogHeader className="items-center gap-3">
              <div className="flex justify-center items-center bg-rose-500 rounded-full size-16">
                <TriangleAlert
                  className="size-8 text-white"
                  strokeWidth={2.5}
                />
              </div>
              <DialogTitle className="text-white text-2xl">
                إلغاء الطلب؟
              </DialogTitle>
              <DialogDescription className="text-white/90 text-base">
                رح يتم إفراغ السلة والرجوع للمنيو. ما بتقدر تراجع هالخطوة.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-2.5 mt-4">
              <Button
                type="button"
                onClick={handleCancelOrder}
                className="bg-rose-500 hover:bg-rose-400 py-2.5 border-0 rounded-[30px] w-full h-auto font-bold text-white text-lg"
              >
                نعم، إلغاء الطلب
              </Button>
              <DialogClose
                render={
                  <button
                    type="button"
                    className="bg-white/12 hover:bg-white/18 py-2.5 rounded-[30px] w-full text-white text-lg transition-colors cursor-pointer"
                  />
                }
              >
                تراجع
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog
          open={deliveryUnavailableOpen}
          onOpenChange={setDeliveryUnavailableOpen}
        >
          <DialogContent
            showCloseButton={false}
            className="bg-[radial-gradient(circle,#41a2c5_0%,#388dab_100%)] p-6 sm:p-8 border-0 rounded-[30px] ring-0 text-white text-center"
          >
            <DialogHeader className="items-center gap-3">
              <div className="flex justify-center items-center bg-rose-500 rounded-full size-16">
                <Truck className="size-8 text-white" strokeWidth={2.5} />
              </div>
              <DialogTitle className="text-white text-2xl">
                التوصيل غير متاح
              </DialogTitle>
              <DialogDescription className="text-white/90 text-base">
                {deliveryClosedMessage}
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center gap-2.5 mt-4">
              <Link
                href="/#location"
                className="flex-1 bg-white/12 hover:bg-white/18 px-6 py-2.5 rounded-[30px] font-bold text-white text-lg text-center transition-colors"
              >
                ساعات العمل
              </Link>
              <DialogClose
                render={
                  <button
                    type="button"
                    className="flex-1 bg-glace-yellow hover:bg-yellow-300 px-6 py-2.5 rounded-[30px] font-bold text-[#1e6a7f] text-lg transition-colors cursor-pointer"
                  />
                }
              >
                حسناً
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog
          open={deliveryBlockedOpen}
          onOpenChange={setDeliveryBlockedOpen}
        >
          <DialogContent
            showCloseButton={false}
            className="bg-[radial-gradient(circle,#41a2c5_0%,#388dab_100%)] p-6 sm:p-8 border-0 rounded-[30px] ring-0 text-white text-center"
          >
            <DialogHeader className="items-center gap-3">
              <div className="flex justify-center items-center bg-rose-500 rounded-full size-16">
                <TriangleAlert
                  className="size-8 text-white"
                  strokeWidth={2.5}
                />
              </div>
              <DialogTitle className="text-white text-2xl">
                هذا الصنف غير مناسب للتوصيل أو الاستلام
              </DialogTitle>
              <DialogDescription className="text-white/90 text-base">
                {deliveryBlockingItem?.reason === "category"
                  ? `صنف "${deliveryBlockingItem.item.name}" (جيلاتو دوم) غير مناسب. الرجاء اختيار صنف آخر أو إزالته من السلة.`
                  : deliveryBlockingItem?.reason === "in-store-only"
                    ? `صنف "${deliveryBlockingItem.item.name}" متوفر داخل المحل فقط. الرجاء اختيار صنف آخر أو إزالته من السلة.`
                    : `صنف "${deliveryBlockingItem?.item.name}" بحجم ${deliveryBlockingItem?.item.size} غير مناسب. الرجاء اختيار حجم أكبر أو صنف آخر.`}
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-2.5 mt-4">
              <Link
                href="/cart"
                className="bg-glace-yellow hover:bg-yellow-300 px-6 py-2.5 rounded-[30px] w-full font-bold text-[#1e6a7f] text-lg transition-colors"
              >
                الرجوع للسلة
              </Link>
              <DialogClose
                render={
                  <button
                    type="button"
                    className="bg-white/12 hover:bg-white/18 py-2.5 rounded-[30px] w-full text-white text-lg transition-colors cursor-pointer"
                  />
                }
              >
                إغلاق
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>

        <div className="flex flex-col gap-6">
          {/* Left: form */}
          <div className="flex-1 order-2">
            <div className="bg-white/[.17] backdrop-blur-[15px] p-4 sm:p-6 rounded-[30px]">
              <h2 className="mb-1 font-bold text-[22px] text-white">
                طريقة الاستلام
              </h2>
              <p className="mb-4 text-[14px] text-white/55">
                اختر الطريقة المناسبة لاستلام طلبك
              </p>

              {(() => {
                const options = [
                  [
                    "dine-in",
                    Utensils,
                    "تناول الآن",
                    "تجهيزه لتناول الطلب داخل المطعم",
                  ],
                  ["delivery", Truck, "توصيل خارجي", "ديليفري من طرف المطعم"],
                  [
                    "pickup",
                    Store,
                    "استلام من المطعم",
                    "تجهيز الطلب تيك اواي وسأقوم أنا باستلامه",
                  ],
                ] as const;

                function handleSelect(val: (typeof options)[number][0]) {
                  if (!storeOpen) {
                    setStoreClosedOpen(true);
                    return;
                  }
                  if (val === "delivery" && !deliveryOpen) {
                    setDeliveryUnavailableOpen(true);
                    return;
                  }
                  if (
                    (val === "delivery" || val === "pickup") &&
                    deliveryBlockingItem
                  ) {
                    setDeliveryBlockedOpen(true);
                    return;
                  }
                  setDelivery(val);
                }

                const [dineIn, ...rest] = options;
                const [dineInVal, DineInIcon, dineInLabel, dineInHint] = dineIn;
                const dineInActive = delivery === dineInVal;

                return (
                  <div className="flex flex-col gap-3 mb-6">
                    <button
                      type="button"
                      onClick={() => handleSelect(dineInVal)}
                      aria-pressed={dineInActive}
                      className={`group relative flex flex-col items-center gap-2 rounded-[20px] border px-4 py-5 sm:py-6 text-center cursor-pointer transition-all duration-200 ${
                        dineInActive
                          ? "bg-glace-yellow border-glace-yellow shadow-[0_8px_24px_rgba(244,228,81,0.3)]"
                          : "bg-white/8 border-white/20 hover:border-white/40 hover:bg-white/12"
                      }`}
                    >
                      <span
                        className={`flex items-center justify-center size-12 sm:size-14 rounded-full transition-colors ${
                          dineInActive
                            ? "bg-[#1e6a7f]/12 text-[#1e6a7f]"
                            : "bg-white/10 text-white"
                        }`}
                      >
                        <DineInIcon size={26} strokeWidth={2} />
                      </span>
                      <span
                        className={`text-[17px] sm:text-[19px] font-bold ${
                          dineInActive ? "text-[#1e6a7f]" : "text-white"
                        }`}
                      >
                        {dineInLabel}
                      </span>
                      <span
                        className={`text-[13px] sm:text-[14px] font-semibold ${
                          dineInActive ? "text-[#1e6a7f]/80" : "text-white/70"
                        }`}
                      >
                        {dineInHint}
                      </span>
                    </button>

                    <div className="gap-3 grid grid-cols-2">
                      {rest.map(([val, Icon, label, hint]) => {
                        const active = delivery === val;
                        return (
                          <button
                            key={val}
                            type="button"
                            onClick={() => handleSelect(val)}
                            aria-pressed={active}
                            className={`group relative flex flex-col items-center gap-1.5 rounded-[16px] sm:rounded-[20px] border px-2.5 py-3 sm:px-4 sm:py-4 text-center cursor-pointer transition-all duration-200 ${
                              active
                                ? "bg-glace-yellow border-glace-yellow shadow-[0_8px_24px_rgba(244,228,81,0.3)]"
                                : "bg-white/8 border-white/20 hover:border-white/40 hover:bg-white/12"
                            }`}
                          >
                            <span
                              className={`flex items-center justify-center size-8 sm:size-11 rounded-full transition-colors ${
                                active
                                  ? "bg-[#1e6a7f]/12 text-[#1e6a7f]"
                                  : "bg-white/10 text-white"
                              }`}
                            >
                              <Icon
                                size={18}
                                className="sm:hidden"
                                strokeWidth={2}
                              />
                              <Icon
                                size={22}
                                className="hidden sm:block"
                                strokeWidth={2}
                              />
                            </span>
                            <span
                              className={`text-[13px] sm:text-[16px] font-bold ${
                                active ? "text-[#1e6a7f]" : "text-white"
                              }`}
                            >
                              {label}
                            </span>
                            <span
                              className={`text-[11px] sm:text-[12.5px] font-semibold leading-snug ${
                                active ? "text-[#1e6a7f]/80" : "text-white/70"
                              }`}
                            >
                              {hint}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {delivery === "delivery" && !isAddingNewAddress && (
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className={sectionLabelClass}>عنوان التوصيل</h3>
                    <button
                      type="button"
                      onClick={() => setShowNewAddressForm(true)}
                      className="flex items-center gap-1 font-bold text-[14px] text-glace-yellow hover:text-yellow-300 cursor-pointer"
                    >
                      <Plus size={16} />
                      إضافة عنوان جديد
                    </button>
                  </div>

                  <div className="flex flex-col gap-3 mb-6">
                    {addresses.map((address) => {
                      const active = address.id === selectedId;
                      return (
                        <button
                          key={address.id}
                          type="button"
                          onClick={() => selectAddress(address.id)}
                          className={`relative flex flex-col gap-1.5 rounded-[18px] border px-4 py-3.5 text-start cursor-pointer transition-colors ${
                            active
                              ? "bg-glace-yellow/12 border-glace-yellow"
                              : "bg-white/6 border-white/15 hover:border-white/30"
                          }`}
                        >
                          <div className="flex justify-between items-center gap-2">
                            <span
                              className={`flex items-center gap-1.5 text-[16px] font-bold ${
                                active ? "text-glace-yellow" : "text-white"
                              }`}
                            >
                              <MapPin size={16} />
                              {address.label}
                            </span>
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                removeAddressMutation.mutate(address.id);
                              }}
                              role="button"
                              aria-label="حذف العنوان"
                              className="p-1 text-white/40 hover:text-rose-300 transition-colors cursor-pointer"
                            >
                              <Trash2 size={16} />
                            </span>
                          </div>
                          <p className="text-[14px] text-white/60 leading-relaxed">
                            {address.city} · {address.area} · {address.street}
                            {address.landmark ? ` · ${address.landmark}` : ""}
                          </p>
                          <p className="text-[13px] text-white/45">
                            {address.name} · {address.phone}
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mb-6">
                    <label className={labelClass}>
                      هل تريد جدولة وقت التوصيل؟{" "}
                      <span className="font-normal text-white/35">
                        (اختياري)
                      </span>
                    </label>
                    <ScheduleTimePicker
                      days={scheduleDays}
                      value={schedule}
                      onChange={setSchedule}
                    />
                  </div>

                  <div className="mb-6">
                    <label className={labelClass}>
                      ملاحظة للكابتن{" "}
                      <span className="font-normal text-white/35">
                        (اختياري)
                      </span>
                    </label>
                    <textarea
                      value={captainNote}
                      onChange={(e) => setCaptainNote(e.target.value)}
                      placeholder="مثال: الطابق الثاني، جرس معطل..."
                      rows={2}
                      className="bg-white/8 px-3.5 py-3 border border-white/20 focus-visible:border-glace-yellow/60 rounded-[16px] outline-none focus-visible:ring-3 focus-visible:ring-glace-yellow/20 w-full text-[15px] text-white placeholder:text-white/40 transition-colors resize-none"
                    />
                  </div>

                  {isLoggedIn && (
                    <div className="flex items-center gap-2.5">
                      <Button
                        type="button"
                        onClick={() => setCancelOpen(true)}
                        className="bg-rose-600 hover:bg-rose-500 px-4 py-3.5 border-0 rounded-[18px] h-auto font-bold text-[14px] text-white transition-colors cursor-pointer shrink-0"
                      >
                        إلغاء الطلب
                      </Button>
                      <Button
                        type="button"
                        onClick={onConfirmSavedAddress}
                        disabled={!selectedAddress}
                        className="flex-1 bg-glace-yellow hover:bg-yellow-300 disabled:opacity-60 shadow-[0_8px_28px_rgba(244,228,81,0.28)] hover:shadow-[0_10px_32px_rgba(244,228,81,0.4)] py-3.5 border-0 rounded-[18px] h-auto font-bold text-[#1e6a7f] text-[17px] transition-all hover:-translate-y-0.5 cursor-pointer disabled:pointer-events-none"
                      >
                        تأكيد وانتقل للدفع
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {delivery === "delivery" && isAddingNewAddress && (
                <AddressForm
                  defaultName={orderingForSomeoneElse ? "" : (user?.name ?? "")}
                  defaultPhone={
                    orderingForSomeoneElse ? "" : (user?.phone ?? "")
                  }
                  submitLabel="حفظ العنوان"
                  hideSubmit={!isLoggedIn}
                  submitting={confirmingNewAddress}
                  onSubmit={(data) => {
                    addAddressMutation.mutate(data, {
                      onSuccess: (created) => {
                        confirmNewAddress(created.id);
                      },
                    });
                  }}
                  beforeContact={
                    <div>
                      {addresses.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setShowNewAddressForm(false)}
                          className="flex items-center self-start gap-1.5 bg-glace-yellow/10 hover:bg-glace-yellow/20 mb-4 px-3.5 py-1.5 border border-glace-yellow/40 hover:border-glace-yellow/60 rounded-full font-bold text-[13.5px] text-glace-yellow transition-colors cursor-pointer"
                        >
                          <Pencil size={14} />
                          العودة للعناوين المحفوظة
                        </button>
                      )}
                      <div className="flex justify-between items-center mb-1">
                        <button
                          type="button"
                          onClick={() =>
                            handleToggleForSomeoneElse(!orderingForSomeoneElse)
                          }
                          className="flex items-center gap-1.5 font-semibold text-[13px] cursor-pointer"
                        >
                          <Users
                            size={14}
                            className={
                              orderingForSomeoneElse
                                ? "text-glace-yellow"
                                : "text-white/50"
                            }
                          />
                          <span
                            className={
                              orderingForSomeoneElse
                                ? "text-glace-yellow"
                                : "text-white/60"
                            }
                          >
                            أطلب لشخص تاني
                          </span>
                          <span
                            className={`relative w-8 h-4.5 rounded-full transition-colors ${
                              orderingForSomeoneElse
                                ? "bg-glace-yellow"
                                : "bg-white/20"
                            }`}
                          >
                            <span
                              className={`absolute top-0.5 size-3.5 rounded-full bg-white transition-all ${
                                orderingForSomeoneElse
                                  ? "start-[16px]"
                                  : "start-0.5"
                              }`}
                            />
                          </span>
                        </button>
                      </div>
                      {orderingForSomeoneElse && (
                        <p className="mb-1 text-[12.5px] text-white/45">
                          الاسم ورقم الهاتف تبع الشخص المستلم، مش بياناتك
                        </p>
                      )}
                    </div>
                  }
                  footer={
                    <>
                      <div>
                        <label className={labelClass}>
                          هل تريد جدولة وقت التوصيل؟{" "}
                          <span className="font-normal text-white/35">
                            (اختياري)
                          </span>
                        </label>
                        <ScheduleTimePicker
                          days={scheduleDays}
                          value={schedule}
                          onChange={setSchedule}
                        />
                      </div>

                      <div>
                        <label className={labelClass}>
                          ملاحظة للكابتن{" "}
                          <span className="font-normal text-white/35">
                            (اختياري)
                          </span>
                        </label>
                        <textarea
                          value={captainNote}
                          onChange={(e) => setCaptainNote(e.target.value)}
                          placeholder="مثال: الطابق الثاني، جرس معطل..."
                          rows={2}
                          className="bg-white/8 px-3.5 py-3 border border-white/20 focus-visible:border-glace-yellow/60 rounded-[16px] outline-none focus-visible:ring-3 focus-visible:ring-glace-yellow/20 w-full text-[15px] text-white placeholder:text-white/40 transition-colors resize-none"
                        />
                      </div>

                      {isLoggedIn && (
                        <Button
                          type="button"
                          onClick={() => setCancelOpen(true)}
                          className="bg-rose-600 hover:bg-rose-500 py-3.5 border-0 rounded-[18px] h-auto font-bold text-[14px] text-white transition-colors cursor-pointer"
                        >
                          إلغاء الطلب
                        </Button>
                      )}
                    </>
                  }
                />
              )}

              {delivery === "pickup" && (
                <div>
                  <div className="flex items-start gap-3 bg-white/8 mb-6 p-4 border border-white/15 rounded-[16px]">
                    <span className="flex justify-center items-center bg-glace-yellow/15 rounded-full size-10 text-glace-yellow shrink-0">
                      <Store size={20} />
                    </span>
                    <p className="pt-1.5 text-[14px] text-white/80 leading-relaxed">
                      سيتم تجهيز الطلب تيك اواي وستقوم أنت باستلامه من المحل
                      مباشرة، بدون رسوم توصيل.
                    </p>
                  </div>

                  <div className="mb-6">
                    <label className={`${labelClass} mb-2.5`}>
                      هل تريد جدولة وقت الاستلام؟{" "}
                      <span className="font-normal text-white/35">
                        (اختياري)
                      </span>
                    </label>
                    <ScheduleTimePicker
                      days={scheduleDays}
                      value={schedule}
                      onChange={setSchedule}
                    />
                  </div>

                  {isLoggedIn && (
                    <div className="flex items-center gap-2.5">
                      <Button
                        type="button"
                        onClick={() => setCancelOpen(true)}
                        className="bg-rose-600 hover:bg-rose-500 px-4 py-3.5 border-0 rounded-[18px] h-auto font-bold text-[14px] text-white transition-colors cursor-pointer shrink-0"
                      >
                        إلغاء الطلب
                      </Button>
                      <Button
                        type="button"
                        onClick={() => {
                          if (deliveryBlockingItem) {
                            setDeliveryBlockedOpen(true);
                            return;
                          }
                          setCheckoutDraft({
                            deliveryMethod: "pickup",
                            address: undefined,
                            deliveryFee: 0,
                            pickupTime: pickupTimeISO,
                          });
                          router.push("/payment");
                        }}
                        className="flex-1 bg-glace-yellow hover:bg-yellow-300 shadow-[0_8px_28px_rgba(244,228,81,0.28)] hover:shadow-[0_10px_32px_rgba(244,228,81,0.4)] py-3.5 border-0 rounded-[18px] h-auto font-bold text-[#1e6a7f] text-[17px] transition-all hover:-translate-y-0.5 cursor-pointer"
                      >
                        تأكيد وانتقل للدفع
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {delivery === "dine-in" && (
                <div>
                  <div className="flex items-start gap-3 bg-white/8 mb-6 p-4 border border-white/15 rounded-[16px]">
                    <span className="flex justify-center items-center bg-glace-yellow/15 rounded-full size-10 text-glace-yellow shrink-0">
                      <Utensils size={20} />
                    </span>
                    <p className="pt-1.5 text-[14px] text-white/80 leading-relaxed">
                      سيتم تجهيز طلبك لتناوله داخل المطعم مباشرة، بدون رسوم
                      توصيل.
                    </p>
                  </div>

                  {isLoggedIn && (
                    <div className="flex items-center gap-2.5">
                      <Button
                        type="button"
                        onClick={() => setCancelOpen(true)}
                        className="bg-rose-600 hover:bg-rose-500 px-4 py-3.5 border-0 rounded-[18px] h-auto font-bold text-[14px] text-white transition-colors cursor-pointer shrink-0"
                      >
                        إلغاء الطلب
                      </Button>
                      <Button
                        type="button"
                        onClick={() => {
                          setCheckoutDraft({
                            deliveryMethod: "dine-in",
                            address: undefined,
                            deliveryFee: 0,
                          });
                          router.push("/payment");
                        }}
                        className="flex-1 bg-glace-yellow hover:bg-yellow-300 shadow-[0_8px_28px_rgba(244,228,81,0.28)] hover:shadow-[0_10px_32px_rgba(244,228,81,0.4)] py-3.5 border-0 rounded-[18px] h-auto font-bold text-[#1e6a7f] text-[17px] transition-all hover:-translate-y-0.5 cursor-pointer"
                      >
                        تأكيد وانتقل للدفع
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {!isLoggedIn && (
              <div className="flex items-stretch sm:items-center gap-3 sm:gap-4 lg:gap-6 bg-[#2d8aaa]/92 shadow-[0_8px_28px_rgba(0,0,0,0.22)] backdrop-blur-md mt-6 px-4 sm:px-5 lg:px-8 py-3 sm:py-4 lg:py-5 border border-white/35 rounded-[24px]">
                <div className="flex flex-col shrink-0">
                  <span className="mb-1 text-[11px] text-white/75 sm:text-[12px] leading-none">
                    الإجمالي
                  </span>
                  <p className="font-bold tabular-nums text-[16px] text-glace-yellow sm:text-[18px] lg:text-[22px] leading-none">
                    ₪ {cartTotal.toFixed(2)}
                  </p>
                </div>

                <div className="hidden md:block flex-1" />

                <button
                  type="button"
                  onClick={() => setLoginSheetOpen(true)}
                  className="flex flex-1 sm:flex-none justify-center items-center gap-2 bg-glace-yellow hover:bg-yellow-300 shadow-[0_8px_28px_rgba(244,228,81,0.28)] hover:shadow-[0_10px_32px_rgba(244,228,81,0.4)] px-6 py-3 border-0 rounded-[16px] font-bold text-[#1e6a7f] text-[15px] transition-all cursor-pointer"
                >
                  <LogIn size={16} />
                  سجّل دخولك للمتابعة
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <LoginSheet open={loginSheetOpen} onOpenChange={setLoginSheetOpen} />
    </div>
  );
}
