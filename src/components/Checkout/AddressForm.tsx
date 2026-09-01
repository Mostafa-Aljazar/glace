"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Home,
  Briefcase,
  MapPin,
  Pencil,
  User,
  Building2,
  Landmark,
  Navigation,
  Map as MapIcon,
} from "lucide-react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ZonePickerSheet from "@/components/Checkout/ZonePickerSheet";
import MapPickerDialog from "@/components/Checkout/MapPickerDialog";
import { findDeliveryZone, type DeliveryZone } from "@/lib/deliveryZones";
import type { AddressType, SavedAddress } from "@/store/addressStore";

/** Inline SVG instead of the 🇵🇸 emoji — flag emojis render as bare "PS"
 *  letters or a blank box on Windows/some browsers with no flag-glyph font. */
function PalestineFlag() {
  return (
    <svg
      viewBox="0 0 30 20"
      className="rounded-xs w-4.5 h-3 shrink-0"
      aria-hidden
    >
      <rect width="30" height="20" fill="#fff" />
      <rect width="30" height="6.667" fill="#000" />
      <rect y="13.333" width="30" height="6.667" fill="#007a3d" />
      <polygon points="0,0 12,10 0,20" fill="#ce1126" />
    </svg>
  );
}

const CITY = "غزة";

const TYPE_OPTIONS: { type: AddressType; label: string; icon: typeof Home }[] =
  [
    { type: "home", label: "المنزل", icon: Home },
    { type: "work", label: "العمل", icon: Briefcase },
    { type: "other", label: "أخرى", icon: MapPin },
  ];

const DEFAULT_LABEL: Record<AddressType, string> = {
  home: "المنزل",
  work: "العمل",
  other: "",
};

const schema = z.object({
  label: z.string().min(1, "اسم العنوان مطلوب"),
  name: z.string().min(1, "الاسم مطلوب"),
  phone: z
    .string()
    .min(1, "رقم الهاتف مطلوب")
    .regex(/^05\d{8}$/, "رقم الهاتف يجب أن يبدأ بـ 05 ويتكون من 10 أرقام"),
  zoneId: z.string().min(1, "المنطقة مطلوبة"),
  street: z.string().min(1, "الشارع مطلوب"),
  landmark: z.string().optional(),
});

export type AddressFormValues = z.infer<typeof schema> & { type: AddressType };

export const inputClass =
  "bg-white/8 border border-white/20 text-white placeholder:text-white/40 rounded-[16px] h-12 ps-11 focus-visible:border-glace-yellow/60 focus-visible:ring-glace-yellow/20 transition-colors";
/** Same box styling as `inputClass` but without the icon gutter — for
 *  buttons/triggers that lay their own icon out inline via flex instead of
 *  absolutely-positioning it (`fieldIconClass`) over a bare `<Input>`. */
export const inputTriggerClass =
  "bg-white/8 border border-white/20 text-white placeholder:text-white/40 rounded-[16px] h-12 px-3.5 focus-visible:border-glace-yellow/60 focus-visible:ring-glace-yellow/20 transition-colors";
export const phoneInputClass =
  "bg-white/8 border border-white/20 text-white rounded-[16px] h-12 px-3.5 focus-within:border-glace-yellow/60 focus-within:ring-3 focus-within:ring-glace-yellow/20 transition-colors";
export const labelClass = "text-white/70 text-[14px] font-semibold mb-1.5";
export const sectionLabelClass =
  "text-white/50 text-[13px] font-bold tracking-wide uppercase";
export const fieldIconClass =
  "absolute top-1/2 start-3.5 -translate-y-1/2 text-white/40 pointer-events-none z-10 peer-focus:text-glace-yellow";

interface AddressFormProps {
  /** Present when editing an existing address — seeds every field. */
  initialValue?: SavedAddress;
  /** Name/phone to prefill when adding fresh (e.g. the logged-in user, or
   *  the checkout recipient once "أطلب لشخص تاني" is toggled). */
  defaultName?: string;
  defaultPhone?: string;
  submitLabel: string;
  onSubmit: (data: Omit<SavedAddress, "id" | "isDefault">) => void;
  /** Extra content rendered right before the submit button — checkout uses
   *  this slot for its own schedule picker / captain note, which aren't
   *  part of the address record itself. */
  footer?: React.ReactNode;
  /** Extra content rendered right above the "بيانات التواصل" section —
   *  checkout uses this for its "أطلب لشخص تاني" toggle and a "back to
   *  saved addresses" link, neither of which belong on the shared form. */
  beforeContact?: React.ReactNode;
  /** Hides the built-in submit button — checkout uses this for guests, who
   *  can fill the form but must log in (via a separate sticky bar) before
   *  the address can actually be saved/submitted. */
  hideSubmit?: boolean;
}

export default function AddressForm({
  initialValue,
  defaultName,
  defaultPhone,
  submitLabel,
  onSubmit,
  footer,
  beforeContact,
  hideSubmit,
}: AddressFormProps) {
  const [type, setType] = useState<AddressType>(initialValue?.type ?? "home");
  const [customLabel, setCustomLabel] = useState(type === "other");
  const [zonePickerOpen, setZonePickerOpen] = useState(false);
  const [mapPickerOpen, setMapPickerOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState<DeliveryZone | undefined>(
    () => findDeliveryZone(initialValue?.zoneId),
  );

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      label: initialValue?.label ?? DEFAULT_LABEL[type],
      name: initialValue?.name ?? defaultName ?? "",
      phone: initialValue?.phone ?? defaultPhone ?? "",
      zoneId: initialValue?.zoneId ?? "",
      street: initialValue?.street ?? "",
      landmark: initialValue?.landmark ?? "",
    },
  });

  // Follow the logged-in user's own name/phone until the customer edits
  // either field themselves (mirrors the pattern checkout used before this
  // form was extracted, minus the "someone else" toggle which lives outside).
  useEffect(() => {
    if (initialValue) return;
    if (defaultName !== undefined) form.setValue("name", defaultName);
    if (defaultPhone !== undefined) form.setValue("phone", defaultPhone);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultName, defaultPhone]);

  function selectType(next: AddressType) {
    setType(next);
    if (next !== "other") {
      setCustomLabel(false);
      form.setValue("label", DEFAULT_LABEL[next]);
    } else {
      setCustomLabel(true);
      form.setValue("label", initialValue?.label ?? "");
    }
  }

  const [location, setLocation] = useState(initialValue?.location);

  function handleGeolocate() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        /* Permission denied or unavailable — silently no-op; the field
           simply stays empty and the address remains saveable without it. */
      },
    );
  }

  function handleSubmit(data: z.infer<typeof schema>) {
    onSubmit({
      type,
      label: data.label,
      name: data.name,
      phone: data.phone,
      city: CITY,
      zoneId: data.zoneId,
      street: data.street,
      landmark: data.landmark,
      location,
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        noValidate
        className="flex flex-col gap-6"
      >
        {/* Address type */}
        <div>
          <h3 className={`mb-3 ${sectionLabelClass}`}>نوع العنوان</h3>
          <div className="flex flex-wrap gap-2">
            {TYPE_OPTIONS.map(({ type: t, label, icon: Icon }) => (
              <button
                key={t}
                type="button"
                onClick={() => selectType(t)}
                className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-[14px] font-bold transition-colors cursor-pointer ${
                  type === t
                    ? "bg-glace-yellow/15 border-glace-yellow text-glace-yellow"
                    : "bg-white/6 border-white/15 text-white/70 hover:border-white/30"
                }`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
            {type === "other" && (
              <button
                type="button"
                onClick={() => setCustomLabel((v) => !v)}
                className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-[14px] font-bold transition-colors cursor-pointer ${
                  customLabel
                    ? "bg-glace-yellow/15 border-glace-yellow text-glace-yellow"
                    : "bg-white/6 border-white/15 text-white/70 hover:border-white/30"
                }`}
              >
                <Pencil size={14} />
                مخصص
              </button>
            )}
          </div>
        </div>

        {/* Address name */}
        <FormField
          control={form.control}
          name="label"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={labelClass}>اسم العنوان</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="مثال: العنوان الرئيسي"
                  className={`ps-4 ${inputClass}`}
                />
              </FormControl>
              <FormMessage className="font-semibold text-[13px] text-rose-300" />
            </FormItem>
          )}
        />

        {beforeContact}

        {/* Contact */}
        <div>
          <h3 className={`mb-3 ${sectionLabelClass}`}>بيانات التواصل</h3>
          <div className="gap-4 grid grid-cols-1 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClass}>الاسم الكامل</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User size={18} className={fieldIconClass} />
                      <Input
                        {...field}
                        placeholder="الاسم الكامل"
                        className={`peer ${inputClass}`}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="font-semibold text-[13px] text-rose-300" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClass}>رقم الهاتف</FormLabel>
                  <FormControl>
                    <div
                      className={`flex items-center gap-2.5 ${phoneInputClass}`}
                    >
                      <span className="flex items-center pe-2.5 border-e border-white/15 shrink-0">
                        <PalestineFlag />
                      </span>
                      <input
                        {...field}
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel"
                        placeholder="05XXXXXXXX"
                        maxLength={10}
                        dir="ltr"
                        className="flex-1 bg-transparent outline-none min-w-0 text-[16px] text-white placeholder:text-white/40 text-left tracking-wide"
                        onChange={(e) => {
                          field.onChange(
                            e.target.value.replace(/\D/g, "").slice(0, 10),
                          );
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="font-semibold text-[13px] text-rose-300" />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <h3 className={`mb-3 ${sectionLabelClass}`}>الموقع</h3>
          <div className="gap-4 grid grid-cols-1 sm:grid-cols-2">
            <FormItem>
              <FormLabel className={labelClass}>المدينة</FormLabel>
              <FormControl>
                <div className="relative">
                  <Building2 size={18} className={fieldIconClass} />
                  <div
                    className={`${inputClass} flex w-full items-center text-[16px] opacity-70`}
                  >
                    {CITY}
                  </div>
                </div>
              </FormControl>
            </FormItem>

            <FormField
              control={form.control}
              name="zoneId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClass}>المنطقة / الحي</FormLabel>
                  <FormControl>
                    <button
                      type="button"
                      onClick={() => setZonePickerOpen(true)}
                      className={`${inputTriggerClass} flex w-full items-center gap-2 text-[15px] text-start cursor-pointer`}
                    >
                      <MapPin size={18} className="text-white/40 shrink-0" />
                      <span
                        className={`flex-1 ${selectedZone ? "text-white" : "text-white/40"}`}
                      >
                        {selectedZone?.name ?? "اختر المنطقة"}
                      </span>
                      {selectedZone &&
                        (selectedZone.fee > 0 ? (
                          <span className="tabular-nums text-[13px] text-white/60 shrink-0">
                            {selectedZone.fee} ₪
                          </span>
                        ) : (
                          <span className="bg-glace-yellow/20 px-2 py-0.5 rounded-full font-bold text-[12px] text-glace-yellow shrink-0">
                            مجاني
                          </span>
                        ))}
                    </button>
                  </FormControl>
                  <FormMessage className="font-semibold text-[13px] text-rose-300" />
                  {selectedZone?.description && (
                    <p className="mt-1 text-[12.5px] text-white/45 leading-relaxed">
                      {selectedZone.description}
                    </p>
                  )}
                  <ZonePickerSheet
                    open={zonePickerOpen}
                    onOpenChange={setZonePickerOpen}
                    selectedZoneId={field.value}
                    onSelect={(zone) => {
                      field.onChange(zone.id);
                      setSelectedZone(zone);
                    }}
                  />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="street"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel className={labelClass}>الشارع والعنوان</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPin size={18} className={fieldIconClass} />
                      <Input
                        {...field}
                        placeholder="الشارع والعنوان"
                        className={`peer ${inputClass}`}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="font-semibold text-[13px] text-rose-300" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="landmark"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel className={labelClass}>
                    علامة مميزة{" "}
                    <span className="font-normal text-white/35">(اختياري)</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Landmark size={18} className={fieldIconClass} />
                      <Input
                        {...field}
                        placeholder="بجانب ..."
                        className={`peer ${inputClass}`}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="font-semibold text-[13px] text-rose-300" />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* GPS */}
        <div>
          <h3 className={`mb-1 ${sectionLabelClass}`}>الموقع على الخريطة</h3>
          <p className="mb-3 text-[12.5px] text-white/45">
            إضافة موقعك يتيح للكابتن تقدير وقت وصوله إليك بدقة.
          </p>
          <div className="flex flex-col gap-2.5">
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={handleGeolocate}
                className="flex flex-1 justify-center items-center gap-2 bg-white/6 hover:bg-white/10 px-4 py-3 border border-white/20 rounded-[16px] font-bold text-[14px] text-glace-yellow transition-colors cursor-pointer"
              >
                <Navigation size={16} />
                استخدم موقعي الحالي
              </button>
              <button
                type="button"
                onClick={() => setMapPickerOpen(true)}
                className="flex flex-1 justify-center items-center gap-2 bg-white/6 hover:bg-white/10 px-4 py-3 border border-white/20 rounded-[16px] font-bold text-[14px] text-glace-yellow transition-colors cursor-pointer"
              >
                <MapIcon size={16} />
                اختر من الخريطة
              </button>
            </div>
            {location && (
              <p className="tabular-nums text-[12px] text-white/45 text-center">
                تم تحديد الموقع: {location.lat.toFixed(5)},{" "}
                {location.lng.toFixed(5)}
              </p>
            )}
          </div>
          <MapPickerDialog
            open={mapPickerOpen}
            onOpenChange={setMapPickerOpen}
            initialPosition={location}
            onConfirm={setLocation}
          />
        </div>

        {footer}

        {!hideSubmit && (
          <Button
            type="submit"
            className="bg-glace-yellow hover:bg-yellow-300 shadow-[0_8px_28px_rgba(244,228,81,0.28)] hover:shadow-[0_10px_32px_rgba(244,228,81,0.4)] py-3.5 border-0 rounded-[18px] h-auto font-bold text-[#1e6a7f] text-[17px] transition-all hover:-translate-y-0.5 cursor-pointer"
          >
            {submitLabel}
          </Button>
        )}
      </form>
    </Form>
  );
}
