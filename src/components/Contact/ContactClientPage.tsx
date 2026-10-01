"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import ContactBackground from "@/components/Contact/ContactBackground";
import ContactForm from "@/components/Contact/ContactForm";
import ContactSuccessDialog from "@/components/Contact/ContactSuccessDialog";
import Footer from "@/components/Common/Footer";
import { useSendContactMessage } from "@/hooks/contact/useSendContactMessage";
import type { IContactRequest } from "@/types/contact.types";

const schema = z.object({
  name: z.string().min(1, "اسم المرسل مطلوب"),
  phone: z.string().min(1, "رقم الجوال مطلوب"),
  email: z.string().email("البريد الإلكتروني غير صالح"),
  message: z.string().min(1, "الرسالة مطلوبة"),
});

export default function ContactClientPage() {
  const [successOpen, setSuccessOpen] = useState(false);
  const {
    mutateAsync: sendMessage,
    isPending,
    error,
    reset: resetMutation,
  } = useSendContactMessage();

  const form = useForm<IContactRequest>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", phone: "", email: "", message: "" },
  });

  async function onSubmit(data: IContactRequest) {
    resetMutation();
    try {
      await sendMessage(data);
    } catch {
      // Surfaced to the user through `errorMessage` below.
      return;
    }
    form.reset();
    setSuccessOpen(true);
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[radial-gradient(circle,#41a2c5_0%,#388dab_100%)]">
      <ContactBackground />

      <div className="relative z-90 flex justify-center px-4 py-12.5 pt-22.5 lg:pt-26.5">
        <div className="mb-12.5 w-full max-w-275 overflow-x-hidden rounded-[30px] border border-white/15 bg-white/17 shadow-[0_20px_60px_rgba(0,0,0,0.12)] backdrop-blur-[15px] sm:w-[92%]">
          <div className="mx-auto w-full max-w-237.5 p-5 pb-8 text-white sm:p-7 sm:pb-10">
            <div className="mb-6 text-center sm:mb-8">
              <h1 className="text-4xl leading-tight text-white sm:text-[42px]">
                تواصل معنا
              </h1>
              <p className="mx-auto mt-2 max-w-md text-[14px] leading-relaxed text-white/70 sm:text-[15px]">
                أرسل استفسارك وسنرد عليك في أقرب وقت
              </p>
              <a
                href="https://wa.me/972592226522"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2.5 mt-4 text-[14px] text-white/85 hover:text-white sm:text-[15px] transition-colors"
              >
                <span className="flex justify-center items-center bg-[#25D366] group-hover:bg-[#1ebe5b] shadow-[0_6px_20px_rgba(37,211,102,0.35)] rounded-full text-white size-11 sm:size-12 group-hover:scale-105 transition shrink-0">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.116.551 4.103 1.515 5.83L0 24l6.335-1.654A11.955 11.955 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.893 0-3.673-.513-5.201-1.407L3.6 21.6l1.04-3.107A9.956 9.956 0 0 1 2 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z" />
                  </svg>
                </span>
                راسلنا على واتساب
              </a>
            </div>

            <ContactForm
              form={form}
              isSubmitting={isPending}
              errorMessage={
                error
                  ? ((
                      error as {
                        response?: { data?: { message?: string } };
                      }
                    ).response?.data?.message ??
                    "تعذّر إرسال الرسالة، حاول مرة أخرى")
                  : null
              }
              onSubmit={onSubmit}
            />
          </div>
        </div>
      </div>

      <ContactSuccessDialog open={successOpen} onOpenChange={setSuccessOpen} />

      <Footer withBg={false} />
    </div>
  );
}
