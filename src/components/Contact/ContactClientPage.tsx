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
  const { mutateAsync: sendMessage, isPending } = useSendContactMessage();

  const form = useForm<IContactRequest>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", phone: "", email: "", message: "" },
  });

  async function onSubmit(data: IContactRequest) {
    const result = await sendMessage(data);
    if (!result.success) return;
    form.reset();
    setSuccessOpen(true);
  }

  return (
    <div className="relative bg-[radial-gradient(circle,#41a2c5_0%,#388dab_100%)] min-h-screen overflow-x-hidden">
      <ContactBackground />

      <div className="z-90 relative flex justify-center px-4 py-12.5 pt-22.5 lg:pt-26.5">
        <div className="bg-white/17 backdrop-blur-[15px] mb-12.5 rounded-[30px] w-[90%] max-w-275 overflow-hidden">
          <div className="mx-auto p-3.75 sm:p-5 pb-7.5 w-full max-w-237.5 min-h-100 text-white">
            <div className="mt-5 mb-4 text-center">
              <h1 className="text-white sm:text-[45px] text-4xl">تواصل معنا</h1>
            </div>

            <ContactForm
              form={form}
              isSubmitting={isPending}
              onSubmit={onSubmit}
            />
          </div>
        </div>
      </div>

      <ContactSuccessDialog open={successOpen} onOpenChange={setSuccessOpen} />
    </div>
  );
}
