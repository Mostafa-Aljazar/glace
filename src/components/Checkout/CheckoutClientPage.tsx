"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import EventsBackground from "@/components/Events/EventsBackground";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cartStore";

type DeliveryMethod = "delivery" | "pickup";

const schema = z.object({
  name: z.string().min(1, "الاسم مطلوب"),
  phone: z.string().min(1, "رقم الهاتف مطلوب"),
  city: z.string().min(1, "المدينة مطلوبة"),
  area: z.string().min(1, "المنطقة مطلوبة"),
  street: z.string().min(1, "الشارع مطلوب"),
  landmark: z.string().optional(),
});

type AddressForm = z.infer<typeof schema>;

const inputClass = "bg-transparent border-white text-white placeholder:text-white/60 rounded-[20px] focus-visible:ring-white/30";
const labelClass = "text-white text-[18px]";

export default function CheckoutClientPage() {
  const [delivery, setDelivery] = useState<DeliveryMethod>("delivery");
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal);
  const total = useCartStore((s) => s.total);
  const discount = useCartStore((s) => s.discount);

  const form = useForm<AddressForm>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", phone: "", city: "", area: "", street: "", landmark: "" },
  });

  function onSubmit(data: AddressForm) {
    const query = delivery === "delivery"
      ? `?delivery=delivery&name=${encodeURIComponent(data.name)}&phone=${encodeURIComponent(data.phone)}&city=${encodeURIComponent(data.city)}&area=${encodeURIComponent(data.area)}&street=${encodeURIComponent(data.street)}&landmark=${encodeURIComponent(data.landmark ?? "")}`
      : "?delivery=pickup";
    router.push(`/payment${query}`);
  }

  if (items.length === 0) {
    return (
      <div className="relative bg-[radial-gradient(circle,#41a2c5_0%,#388dab_100%)] min-h-screen overflow-x-hidden">
        
        <EventsBackground />
        <div className="z-90 relative flex flex-col justify-center items-center gap-6 mx-auto px-4 pt-20 max-w-300 text-white text-center">
          <p className="text-[26px]">لا يوجد منتجات في السلة</p>
          <Button asChild className="bg-[#117291] hover:bg-[#0e6080] px-8 py-3 rounded-[30px] text-white text-[20px] h-auto">
            <Link href="/menu">تصفح المنيو</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-[radial-gradient(circle,#41a2c5_0%,#388dab_100%)] min-h-screen overflow-x-hidden">
      
      <EventsBackground />

      <div className="z-90 relative mx-auto px-4 pt-22.5 lg:pt-26.5 pb-12 max-w-300">
        <h1 className="mb-6 text-white text-[40px] sm:text-[50px] text-center">إتمام الطلب</h1>

        <div className="flex lg:flex-row flex-col gap-6">
          {/* Left: form */}
          <div className="flex-1">
            <div className="bg-white/[.17] backdrop-blur-[15px] rounded-[30px] p-6">
              {/* Delivery method */}
              <h2 className="mb-4 text-white text-[24px]">طريقة الاستلام</h2>
              <div className="flex gap-4 mb-6">
                {([["delivery", "توصيل"], ["pickup", "استلام من المحل"]] as const).map(([val, label]) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setDelivery(val)}
                    className={`px-5 py-2.5 rounded-full border text-[17px] cursor-pointer transition-colors ${
                      delivery === val ? "bg-white text-[#2d849e] border-white font-bold" : "bg-transparent border-white/50 text-white hover:border-white"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {delivery === "delivery" && (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem>
                          <FormLabel className={labelClass}>الاسم الكامل</FormLabel>
                          <FormControl><Input {...field} placeholder="الاسم الكامل" className={inputClass} /></FormControl>
                          <FormMessage className="text-glace-yellow text-[14px]" />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="phone" render={({ field }) => (
                        <FormItem>
                          <FormLabel className={labelClass}>رقم الهاتف</FormLabel>
                          <FormControl><Input {...field} type="tel" placeholder="رقم الهاتف" className={inputClass} /></FormControl>
                          <FormMessage className="text-glace-yellow text-[14px]" />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="city" render={({ field }) => (
                        <FormItem>
                          <FormLabel className={labelClass}>المدينة</FormLabel>
                          <FormControl><Input {...field} placeholder="المدينة" className={inputClass} /></FormControl>
                          <FormMessage className="text-glace-yellow text-[14px]" />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="area" render={({ field }) => (
                        <FormItem>
                          <FormLabel className={labelClass}>المنطقة / الحي</FormLabel>
                          <FormControl><Input {...field} placeholder="المنطقة أو الحي" className={inputClass} /></FormControl>
                          <FormMessage className="text-glace-yellow text-[14px]" />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="street" render={({ field }) => (
                        <FormItem>
                          <FormLabel className={labelClass}>الشارع والعنوان</FormLabel>
                          <FormControl><Input {...field} placeholder="الشارع والعنوان" className={inputClass} /></FormControl>
                          <FormMessage className="text-glace-yellow text-[14px]" />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="landmark" render={({ field }) => (
                        <FormItem>
                          <FormLabel className={labelClass}>علامة مميزة (اختياري)</FormLabel>
                          <FormControl><Input {...field} placeholder="بجانب ..." className={inputClass} /></FormControl>
                          <FormMessage className="text-glace-yellow text-[14px]" />
                        </FormItem>
                      )} />
                    </div>
                    <Button type="submit" className="bg-[#117291] hover:bg-[#0e6080] border-0 rounded-[30px] w-full text-white text-[20px] h-auto py-3 mt-2 cursor-pointer">
                      تأكيد وانتقل للدفع
                    </Button>
                  </form>
                </Form>
              )}

              {delivery === "pickup" && (
                <div className="text-white">
                  <p className="mb-4 text-[18px]">سيتم استلام طلبك من المحل مباشرة.</p>
                  <Button
                    type="button"
                    onClick={() => router.push("/payment?delivery=pickup")}
                    className="bg-[#117291] hover:bg-[#0e6080] border-0 rounded-[30px] w-full text-white text-[20px] h-auto py-3 cursor-pointer"
                  >
                    تأكيد وانتقل للدفع
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Right: order summary */}
          <div className="lg:w-[300px] w-full">
            <div className="bg-white/[.17] backdrop-blur-[15px] rounded-[30px] p-6 text-white">
              <h2 className="mb-4 text-[24px]">ملخص الطلب</h2>
              <div className="flex flex-col gap-2 mb-4 max-h-[250px] overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-[16px] border-b border-white/20 pb-2">
                    <span>{item.name} × {item.quantity}</span>
                    <span>{((item.unitPrice + item.addonTotal) * item.quantity).toFixed(2)} ₪</span>
                  </div>
                ))}
              </div>
              {discount > 0 && (
                <div className="flex justify-between mb-2 text-[16px] text-green-300">
                  <span>خصم</span>
                  <span>- {discount} ₪</span>
                </div>
              )}
              <div className="flex justify-between pt-3 border-t border-white/30 font-bold text-[22px]">
                <span>الإجمالي</span>
                <span>{total().toFixed(2)} ₪</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
