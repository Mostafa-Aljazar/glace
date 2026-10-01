"use client";

import type { UseFormReturn } from "react-hook-form";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
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
            className="mt-6 rounded-xl bg-white shadow-sm px-4 py-3 text-center font-bold text-[14px] text-red-500"
          >
            {errorMessage}
          </p>
        )}

        <div className="mt-8 flex justify-center sm:mt-10">
          <button
            type="submit"
            disabled={isSubmitting}
            className="group inline-flex relative justify-center items-center w-[190px] sm:w-[220px] lg:w-[250px] h-[66px] sm:h-[76px] lg:h-[84px] hover:scale-[1.04] active:scale-[0.97] disabled:opacity-60 disabled:hover:scale-100 transition-transform duration-200 cursor-pointer disabled:cursor-not-allowed"
          >
            {/* same wavy blob as the home hero's "اطلب الان" */}
            <svg
              viewBox="0 0 280 96"
              className="absolute inset-0 drop-shadow-[0_10px_22px_rgba(0,0,0,0.22)] group-hover:brightness-110 w-full h-full transition-[filter] duration-200"
              aria-hidden
              preserveAspectRatio="none"
            >
              <path
                d="M24 50
                   C18 28 52 10 88 16
                   C118 6 152 20 186 12
                   C224 4 262 22 260 50
                   C262 76 226 90 188 82
                   C154 92 118 78 86 86
                   C50 94 20 74 24 50 Z"
                fill="#51c9f4"
              />
              <path
                d="M30 50
                   C26 32 56 16 90 20
                   C120 12 152 24 184 16
                   C218 10 250 26 248 50
                   C250 72 218 84 184 78
                   C152 86 120 74 90 80
                   C56 88 28 70 30 50 Z"
                fill="#1e6a7f"
              />
            </svg>
            <span className="z-10 relative font-bold text-[22px] sm:text-[26px] lg:text-[30px] text-white leading-none -rotate-[2deg]">
              {isSubmitting ? "..." : "ارسال"}
            </span>
          </button>
        </div>
      </form>
    </Form>
  );
}
