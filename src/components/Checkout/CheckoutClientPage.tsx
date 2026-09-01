"use client";

import { useMemo, useState } from "react";
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
import { useAddresses, useAddAddress, useDeleteAddress } from "@/hooks/addresses";
import { useCheckoutDraftStore } from "@/store/checkoutDraftStore";
import ScheduleTimePicker from "@/components/Checkout/ScheduleTimePicker";
import AddressForm from "@/components/Checkout/AddressForm";
import { findDeliveryZone } from "@/lib/deliveryZones";
import {
  formatTime12h,
  getScheduleDays,
  isDeliveryAvailableToday,
} from "@/lib/scheduling";
import { getDeliveryBlockingItem } from "@/lib/deliveryRestrictions";
import { useMenuProducts } from "@/hooks/menu/useMenuProducts";

type DeliveryMethod = "delivery" | "pickup" | "dine-in";

const labelClass = "text-white/70 text-[14px] font-semibold mb-1.5";
const sectionLabelClass =
  "text-white/50 text-[13px] font-bold tracking-wide uppercase";

export default function CheckoutClientPage() {
  const [cancelOpen, setCancelOpen] = useState(false);
  const [delivery, setDelivery] = useState<DeliveryMethod>("dine-in");
  const scheduleDays = useMemo(() => getScheduleDays(), []);
  // Defaults to the earliest bookable slot (today, ASAP) rather than "فوري" —
  // the customer can still clear it or pick a later time.
  const [schedule, setSchedule] = useState<{ date: string; time: string } | null>(
    () =>
      scheduleDays[0]?.slots[0]
        ? { date: scheduleDays[0].date, time: scheduleDays[0].slots[0] }
        : null
  );
  const scheduleLabel = schedule
    ? `${scheduleDays.find((d) => d.date === schedule.date)?.label ?? schedule.date} · ${formatTime12h(schedule.time)}`
    : undefined;
  const [captainNote, setCaptainNote] = useState("");
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [deliveryUnavailableOpen, setDeliveryUnavailableOpen] = useState(false);
  const [deliveryBlockedOpen, setDeliveryBlockedOpen] = useState(false);
  const deliveryAvailable = useMemo(() => isDeliveryAvailableToday(), []);
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const cartTotal = useCartStore((s) => s.total());
  const { data: menuProducts } = useMenuProducts();
  const deliveryBlockingItem = useMemo(
    () => getDeliveryBlockingItem(items, menuProducts ?? []),
    [items, menuProducts],
  );

  const isLoggedIn = useAuthStore((s) => s.isLoggedIn());
  const user = useAuthStore((s) => s.user);
  const [orderingForSomeoneElse, setOrderingForSomeoneElse] = useState(false);
  const { data: addresses = [] } = useAddresses();
  const selectedId = useAddressStore((s) => s.selectedId);
  const addAddressMutation = useAddAddress();
  const removeAddressMutation = useDeleteAddress();
  const selectAddress = useAddressStore((s) => s.selectAddress);
  const selectedAddress = addresses.find((a) => a.id === selectedId) ?? null;
  const setCheckoutDraft = useCheckoutDraftStore((s) => s.setDraft);

  function handleToggleForSomeoneElse(value: boolean) {
    setOrderingForSomeoneElse(value);
  }

  const isAddingNewAddress = addresses.length === 0 || showNewAddressForm;

  function goToPayment(
    address: {
      name: string;
      phone: string;
      city: string;
      zoneId: string;
      street: string;
      landmark?: string;
    },
    addressId?: string,
  ) {
    if (deliveryBlockingItem) {
      setDeliveryBlockedOpen(true);
      return;
    }
    const zone = findDeliveryZone(address.zoneId);
    setCheckoutDraft({
      deliveryMethod: "delivery",
      address: {
        name: address.name,
        phone: address.phone,
        city: address.city,
        // `DeliveryAddress.area` is a display string (order history, payment
        // summary) — resolve the zone name here so those screens don't need
        // to know about the zone catalog at all.
        area: zone?.name ?? address.zoneId,
        street: address.street,
        landmark: address.landmark,
        note: captainNote.trim() || undefined,
      },
      addressId,
      deliveryFee: zone?.fee ?? 0,
      pickupTime: scheduleLabel,
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
          <div className="relative w-full max-w-md overflow-hidden rounded-[32px] border border-white/15 bg-white/12 backdrop-blur-xl px-6 py-16 sm:py-20 text-center">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(244,228,81,0.12),transparent_55%)]" />
            <div className="relative flex flex-col items-center gap-5 animate-in fade-in zoom-in-95 duration-500">
              <div className="flex items-center justify-center size-24 rounded-full bg-white/10 border border-white/15 text-glace-yellow shadow-[0_0_40px_rgba(244,228,81,0.15)]">
                <ShoppingCart size={40} strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-white text-[26px] sm:text-[28px] font-bold mb-2">
                  لا يوجد منتجات في السلة
                </h2>
                <p className="text-white/60 text-[15px] max-w-xs mx-auto">
                  اختَر من منيو Glace وابدأ طلبك بخطوة واحدة
                </p>
              </div>
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 bg-glace-yellow hover:bg-yellow-300 text-[#1e6a7f] font-bold text-[15px] px-8 py-3.5 rounded-full transition-all shadow-[0_8px_28px_rgba(244,228,81,0.3)] hover:-translate-y-0.5"
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
        <h1 className="mb-6 text-white text-[40px] sm:text-[50px] text-center">
          إتمام الطلب
        </h1>

        <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
          <DialogContent
            showCloseButton={false}
            className="bg-[radial-gradient(circle,#41a2c5_0%,#388dab_100%)] p-6 sm:p-8 border-0 rounded-[30px] text-center text-white ring-0"
          >
            <DialogHeader className="items-center gap-3">
              <div className="flex justify-center items-center bg-rose-500 rounded-full size-16">
                <TriangleAlert className="size-8 text-white" strokeWidth={2.5} />
              </div>
              <DialogTitle className="text-2xl text-white">
                إلغاء الطلب؟
              </DialogTitle>
              <DialogDescription className="text-base text-white/90">
                رح يتم إفراغ السلة والرجوع للمنيو. ما بتقدر تراجع هالخطوة.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-2.5 mt-4">
              <Button
                type="button"
                onClick={handleCancelOrder}
                className="bg-rose-500 hover:bg-rose-400 border-0 rounded-[30px] w-full text-white font-bold text-lg h-auto py-2.5"
              >
                نعم، إلغاء الطلب
              </Button>
              <DialogClose
                render={
                  <button
                    type="button"
                    className="bg-white/12 hover:bg-white/18 rounded-[30px] w-full text-white text-lg py-2.5 transition-colors cursor-pointer"
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
            className="bg-[radial-gradient(circle,#41a2c5_0%,#388dab_100%)] p-6 sm:p-8 border-0 rounded-[30px] text-center text-white ring-0"
          >
            <DialogHeader className="items-center gap-3">
              <div className="flex justify-center items-center bg-rose-500 rounded-full size-16">
                <Truck className="size-8 text-white" strokeWidth={2.5} />
              </div>
              <DialogTitle className="text-2xl text-white">
                التوصيل غير متاح
              </DialogTitle>
              <DialogDescription className="text-base text-white/90">
                خدمة التوصيل غير متاحة حاليًا لهذا اليوم
              </DialogDescription>
            </DialogHeader>
            <DialogClose
              render={
                <button
                  type="button"
                  className="bg-glace-yellow hover:bg-yellow-300 mt-4 px-6 py-2.5 rounded-[30px] w-full text-[#1e6a7f] font-bold text-lg transition-colors cursor-pointer"
                />
              }
            >
              إغلاق
            </DialogClose>
          </DialogContent>
        </Dialog>

        <Dialog open={deliveryBlockedOpen} onOpenChange={setDeliveryBlockedOpen}>
          <DialogContent
            showCloseButton={false}
            className="bg-[radial-gradient(circle,#41a2c5_0%,#388dab_100%)] p-6 sm:p-8 border-0 rounded-[30px] text-center text-white ring-0"
          >
            <DialogHeader className="items-center gap-3">
              <div className="flex justify-center items-center bg-rose-500 rounded-full size-16">
                <TriangleAlert className="size-8 text-white" strokeWidth={2.5} />
              </div>
              <DialogTitle className="text-2xl text-white">
                هذا الصنف غير مناسب للتوصيل أو الاستلام
              </DialogTitle>
              <DialogDescription className="text-base text-white/90">
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
                className="bg-glace-yellow hover:bg-yellow-300 px-6 py-2.5 rounded-[30px] w-full text-[#1e6a7f] font-bold text-lg transition-colors"
              >
                الرجوع للسلة
              </Link>
              <DialogClose
                render={
                  <button
                    type="button"
                    className="bg-white/12 hover:bg-white/18 rounded-[30px] w-full text-white text-lg py-2.5 transition-colors cursor-pointer"
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
          <div className="order-2 flex-1">
            <div className="bg-white/[.17] backdrop-blur-[15px] rounded-[30px] p-4 sm:p-6">
              <h2 className="mb-1 text-white text-[22px] font-bold">
                طريقة الاستلام
              </h2>
              <p className="mb-4 text-white/55 text-[14px]">
                اختر الطريقة المناسبة لاستلام طلبك
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                {(
                  [
                    [
                      "delivery",
                      Truck,
                      "توصيل خارجي",
                      "ديليفري",
                      "col-span-2 sm:col-span-1",
                    ],
                    [
                      "pickup",
                      Store,
                      "استلام من المطعم",
                      "تاك اواي",
                      "",
                    ],
                    [
                      "dine-in",
                      Utensils,
                      "تناول الآن",
                      "في المطعم",
                      "",
                    ],
                  ] as const
                ).map(([val, Icon, label, hint, span]) => {
                  const active = delivery === val;
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => {
                        if (val === "delivery" && !deliveryAvailable) {
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
                      }}
                      aria-pressed={active}
                      className={`group relative flex flex-col items-center gap-1 sm:gap-1.5 rounded-[16px] sm:rounded-[20px] border px-2.5 py-2.5 sm:px-4 sm:py-4 text-center cursor-pointer transition-all duration-200 ${span} ${
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
                        <Icon size={18} className="sm:hidden" strokeWidth={2} />
                        <Icon size={22} className="hidden sm:block" strokeWidth={2} />
                      </span>
                      <span
                        className={`text-[13px] sm:text-[16px] font-bold ${
                          active ? "text-[#1e6a7f]" : "text-white"
                        }`}
                      >
                        {label}
                      </span>
                      <span
                        className={`text-[11px] sm:text-[13px] ${
                          active ? "text-[#1e6a7f]/70" : "text-white/50"
                        }`}
                      >
                        {hint}
                      </span>
                    </button>
                  );
                })}
              </div>

              {delivery === "delivery" && !isAddingNewAddress && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className={sectionLabelClass}>
                        عنوان التوصيل
                      </h3>
                      <button
                        type="button"
                        onClick={() => setShowNewAddressForm(true)}
                        className="flex items-center gap-1 text-glace-yellow text-[14px] font-bold cursor-pointer hover:text-yellow-300"
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
                            <div className="flex items-center justify-between gap-2">
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
                                className="text-white/40 hover:text-rose-300 transition-colors cursor-pointer p-1"
                              >
                                <Trash2 size={16} />
                              </span>
                            </div>
                            <p className="text-white/60 text-[14px] leading-relaxed">
                              {address.city} ·{" "}
                              {findDeliveryZone(address.zoneId)?.name ?? address.zoneId} ·{" "}
                              {address.street}
                              {address.landmark ? ` · ${address.landmark}` : ""}
                            </p>
                            <p className="text-white/45 text-[13px]">
                              {address.name} · {address.phone}
                            </p>
                          </button>
                        );
                      })}
                    </div>

                    <div className="mb-6">
                      <label className={labelClass}>
                        وقت التوصيل{" "}
                        <span className="text-white/35 font-normal">
                          (اختياري — اتركه فارغًا للتوصيل الفوري)
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
                        <span className="text-white/35 font-normal">
                          (اختياري)
                        </span>
                      </label>
                      <textarea
                        value={captainNote}
                        onChange={(e) => setCaptainNote(e.target.value)}
                        placeholder="مثال: الطابق الثاني، جرس معطل..."
                        rows={2}
                        className="w-full resize-none bg-white/8 border border-white/20 text-white placeholder:text-white/40 rounded-[16px] px-3.5 py-3 text-[15px] focus-visible:border-glace-yellow/60 focus-visible:ring-3 focus-visible:ring-glace-yellow/20 outline-none transition-colors"
                      />
                    </div>

                    {isLoggedIn && (
                      <div className="flex items-center gap-2.5">
                        <Button
                          type="button"
                          onClick={() => setCancelOpen(true)}
                          className="shrink-0 rounded-[18px] bg-rose-600 hover:bg-rose-500 border-0 text-white text-[14px] font-bold h-auto px-4 py-3.5 transition-colors cursor-pointer"
                        >
                          إلغاء الطلب
                        </Button>
                        <Button
                          type="button"
                          onClick={onConfirmSavedAddress}
                          disabled={!selectedAddress}
                          className="bg-glace-yellow hover:bg-yellow-300 border-0 rounded-[18px] flex-1 text-[#1e6a7f] text-[17px] font-bold h-auto py-3.5 shadow-[0_8px_28px_rgba(244,228,81,0.28)] hover:shadow-[0_10px_32px_rgba(244,228,81,0.4)] hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-60 disabled:pointer-events-none"
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
                  defaultPhone={orderingForSomeoneElse ? "" : (user?.phone ?? "")}
                  submitLabel="تأكيد وانتقل للدفع"
                  hideSubmit={!isLoggedIn}
                  onSubmit={(data) => {
                    const payload = { ...data, label: `عنوان ${addresses.length + 1}` };
                    addAddressMutation.mutate(payload, {
                      onSuccess: (created) => {
                        setShowNewAddressForm(false);
                        goToPayment(data, created.id);
                      },
                    });
                  }}
                  beforeContact={
                    <div>
                      {addresses.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setShowNewAddressForm(false)}
                          className="mb-4 self-start flex items-center gap-1.5 rounded-full border border-glace-yellow/40 bg-glace-yellow/10 px-3.5 py-1.5 text-glace-yellow text-[13.5px] font-bold hover:bg-glace-yellow/20 hover:border-glace-yellow/60 transition-colors cursor-pointer"
                        >
                          <Pencil size={14} />
                          العودة للعناوين المحفوظة
                        </button>
                      )}
                      <div className="flex items-center justify-between mb-1">
                        <button
                          type="button"
                          onClick={() =>
                            handleToggleForSomeoneElse(!orderingForSomeoneElse)
                          }
                          className="flex items-center gap-1.5 text-[13px] font-semibold cursor-pointer"
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
                        <p className="mb-1 text-white/45 text-[12.5px]">
                          الاسم ورقم الهاتف تبع الشخص المستلم، مش بياناتك
                        </p>
                      )}
                    </div>
                  }
                  footer={
                    <>
                      <div>
                        <label className={labelClass}>
                          وقت التوصيل{" "}
                          <span className="text-white/35 font-normal">
                            (اختياري — اتركه فارغًا للتوصيل الفوري)
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
                          <span className="text-white/35 font-normal">
                            (اختياري)
                          </span>
                        </label>
                        <textarea
                          value={captainNote}
                          onChange={(e) => setCaptainNote(e.target.value)}
                          placeholder="مثال: الطابق الثاني، جرس معطل..."
                          rows={2}
                          className="w-full resize-none bg-white/8 border border-white/20 text-white placeholder:text-white/40 rounded-[16px] px-3.5 py-3 text-[15px] focus-visible:border-glace-yellow/60 focus-visible:ring-3 focus-visible:ring-glace-yellow/20 outline-none transition-colors"
                        />
                      </div>

                      {isLoggedIn && (
                        <Button
                          type="button"
                          onClick={() => setCancelOpen(true)}
                          className="rounded-[18px] bg-rose-600 hover:bg-rose-500 border-0 text-white text-[14px] font-bold h-auto py-3.5 transition-colors cursor-pointer"
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
                  <div className="flex items-start gap-3 mb-6 bg-white/8 border border-white/15 rounded-[16px] p-4">
                    <span className="flex items-center justify-center bg-glace-yellow/15 text-glace-yellow rounded-full size-10 shrink-0">
                      <Store size={20} />
                    </span>
                    <p className="text-white/80 text-[14px] leading-relaxed pt-1.5">
                      سيتم تجهيز طلبك واستلامه من المحل مباشرة، بدون رسوم
                      توصيل.
                    </p>
                  </div>

                  <div className="mb-6">
                    <label className={`${labelClass} mb-2.5`}>
                      وقت الاستلام{" "}
                      <span className="text-white/35 font-normal">
                        (اختياري — اتركه فارغًا للاستلام الفوري)
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
                        className="shrink-0 rounded-[18px] bg-rose-600 hover:bg-rose-500 border-0 text-white text-[14px] font-bold h-auto px-4 py-3.5 transition-colors cursor-pointer"
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
                            pickupTime: scheduleLabel,
                          });
                          router.push("/payment");
                        }}
                        className="bg-glace-yellow hover:bg-yellow-300 border-0 rounded-[18px] flex-1 text-[#1e6a7f] text-[17px] font-bold h-auto py-3.5 shadow-[0_8px_28px_rgba(244,228,81,0.28)] hover:shadow-[0_10px_32px_rgba(244,228,81,0.4)] hover:-translate-y-0.5 transition-all cursor-pointer"
                      >
                        تأكيد وانتقل للدفع
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {delivery === "dine-in" && (
                <div>
                  <div className="flex items-start gap-3 mb-6 bg-white/8 border border-white/15 rounded-[16px] p-4">
                    <span className="flex items-center justify-center bg-glace-yellow/15 text-glace-yellow rounded-full size-10 shrink-0">
                      <Utensils size={20} />
                    </span>
                    <p className="text-white/80 text-[14px] leading-relaxed pt-1.5">
                      سيتم تجهيز طلبك لتناوله داخل المطعم، بدون رسوم توصيل.
                    </p>
                  </div>

                  {isLoggedIn && (
                    <div className="flex items-center gap-2.5">
                      <Button
                        type="button"
                        onClick={() => setCancelOpen(true)}
                        className="shrink-0 rounded-[18px] bg-rose-600 hover:bg-rose-500 border-0 text-white text-[14px] font-bold h-auto px-4 py-3.5 transition-colors cursor-pointer"
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
                        className="bg-glace-yellow hover:bg-yellow-300 border-0 rounded-[18px] flex-1 text-[#1e6a7f] text-[17px] font-bold h-auto py-3.5 shadow-[0_8px_28px_rgba(244,228,81,0.28)] hover:shadow-[0_10px_32px_rgba(244,228,81,0.4)] hover:-translate-y-0.5 transition-all cursor-pointer"
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

                <Link
                  href="/auth/login?redirect=/checkout"
                  className="flex flex-1 sm:flex-none items-center justify-center gap-2 bg-glace-yellow hover:bg-yellow-300 border-0 rounded-[16px] px-6 py-3 text-[#1e6a7f] text-[15px] font-bold shadow-[0_8px_28px_rgba(244,228,81,0.28)] hover:shadow-[0_10px_32px_rgba(244,228,81,0.4)] transition-all"
                >
                  <LogIn size={16} />
                  سجّل دخولك للمتابعة
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
