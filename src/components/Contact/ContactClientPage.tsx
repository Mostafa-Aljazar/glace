"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import ContactBackground from "@/components/Contact/ContactBackground";
import ContactForm from "@/components/Contact/ContactForm";
import ContactSuccessDialog from "@/components/Contact/ContactSuccessDialog";
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
    </div>
  );
}
