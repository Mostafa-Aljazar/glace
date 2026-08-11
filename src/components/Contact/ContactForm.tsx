"use client";

import Image from "next/image";
import type { UseFormReturn } from "react-hook-form";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { popImgG } from "@/assets/images";
import type { IContactRequest } from "@/types/contact.types";
import { cn } from "@/lib/utils";

const fieldShell =
  "w-full rounded-[18px] border border-white/20 bg-white/12 px-4 py-3 text-[16px] sm:text-[17px] text-white outline-none transition-colors placeholder:text-white/45 focus:border-glace-yellow/60 focus:bg-white/16 focus:ring-2 focus:ring-glace-yellow/25";

interface ContactFormProps {
  form: UseFormReturn<IContactRequest>;
  isSubmitting?: boolean;
  /** Shown when the backend rejected the message — never swallow a failure. */
  errorMessage?: string | null;
  onSubmit: (data: IContactRequest) => void;
}

export default function ContactForm({
  form,
  isSubmitting = false,
  errorMessage = null,
  onSubmit,
}: ContactFormProps) {
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className="mt-2 sm:mt-4"
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-8">
          <div className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="gap-1.5">
                  <FormLabel className="text-[15px] sm:text-[16px] font-medium text-white/90">
                    اسم المرسل
                  </FormLabel>
                  <FormControl>
                    <input
                      {...field}
                      type="text"
                      autoComplete="name"
                      placeholder="مثال: أحمد علي"
                      className={fieldShell}
                    />
                  </FormControl>
                  <FormMessage className="text-glace-yellow text-[13px]" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem className="gap-1.5">
                  <FormLabel className="text-[15px] sm:text-[16px] font-medium text-white/90">
                    رقم الجوال
                  </FormLabel>
                  <FormControl>
                    <input
                      {...field}
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="0599 000 000"
                      dir="ltr"
                      className={cn(
                        fieldShell,
                        // LTR keeps digits in order; text-right sits the number
                        // next to the RTL label instead of flipping to +1 (...).
                        "text-right tracking-wide tabular-nums",
                      )}
                    />
                  </FormControl>
                  <FormMessage className="text-glace-yellow text-[13px]" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="gap-1.5">
                  <FormLabel className="text-[15px] sm:text-[16px] font-medium text-white/90">
                    البريد الإلكتروني
                  </FormLabel>
                  <FormControl>
                    <input
                      {...field}
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      placeholder="name@example.com"
                      dir="ltr"
                      className={cn(fieldShell, "text-right")}
                    />
                  </FormControl>
                  <FormMessage className="text-glace-yellow text-[13px]" />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-1.5">
                <FormLabel className="text-[15px] sm:text-[16px] font-medium text-white/90">
                  رسالتك
                </FormLabel>
                <FormControl>
                  <textarea
                    {...field}
                    rows={8}
                    placeholder="اكتب استفسارك أو ملاحظتك هنا..."
                    className={cn(
                      fieldShell,
                      "min-h-[180px] max-h-[480px] resize-y leading-relaxed",
                    )}
                  />
                </FormControl>
                <FormMessage className="text-glace-yellow text-[13px]" />
              </FormItem>
            )}
          />
        </div>

        {errorMessage && (
          <p
            role="alert"
            className="mt-6 rounded-xl border border-red-400/40 bg-red-500/15 px-4 py-3 text-center text-[14px] text-red-100"
          >
            {errorMessage}
          </p>
        )}

        <div className="mt-8 flex justify-center sm:mt-10">
          <button
            type="submit"
            disabled={isSubmitting}
            className="relative mx-auto flex h-13.75 w-50 min-w-35 cursor-pointer items-center justify-center border-0 bg-transparent sm:mx-0 sm:h-17.5 sm:w-auto sm:min-w-37.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Image
              src={popImgG}
              alt=""
              fill
              className="rotate-[-5deg] object-fill opacity-80"
            />
            <span className="relative text-3xl text-white sm:text-4xl">
              {isSubmitting ? "..." : "ارسال"}
            </span>
          </button>
        </div>
      </form>
    </Form>
  );
}
