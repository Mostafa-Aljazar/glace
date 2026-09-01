"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, ArrowRight, MessageCircle } from "lucide-react";
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
import OtpInput from "@/components/Auth/OtpInput";
import {
  inputClass,
  labelClass,
  fieldIconClass,
} from "@/components/Auth/authFieldStyles";
import { useSendOtp, useVerifyOtp } from "@/hooks/auth/useOtpAuth";
import type { PhoneFormValues, RegisterPhoneFormValues } from "@/types";

const RESEND_SECONDS = 45;
const SUPPORT_WHATSAPP_HREF = "https://wa.me/972592226522";

/** Inline SVG instead of the 🇵🇸 emoji — flag emojis render as bare "PS"
 *  letters or a blank box on Windows/some browsers with no flag-glyph font. */
function PalestineFlag() {
  return (
    <svg viewBox="0 0 30 20" className="w-4.5 h-3 rounded-xs shrink-0" aria-hidden>
      <rect width="30" height="20" fill="#fff" />
      <rect width="30" height="6.667" fill="#000" />
      <rect y="13.333" width="30" height="6.667" fill="#007a3d" />
      <polygon points="0,0 12,10 0,20" fill="#ce1126" />
    </svg>
  );
}

const loginSchema = z.object({
  phone: z
    .string()
    .min(1, "رقم الجوال مطلوب")
    .regex(/^(\+972|009725|972|05)\d{8}$|^5\d{8}$/, "رقم الجوال غير صالح"),
});

const registerSchema = loginSchema.extend({
  fullName: z.string().min(1, "الاسم الكامل مطلوب"),
});

type Props =
  | {
      mode: "login";
      switchLinkHref: string;
      switchLinkLabel: string;
      switchLinkText: string;
    }
  | {
      mode: "register";
      switchLinkHref: string;
      switchLinkLabel: string;
      switchLinkText: string;
    };

export default function PhoneOtpFlow({
  mode,
  switchLinkHref,
  switchLinkLabel,
  switchLinkText,
}: Props) {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [code, setCode] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(0);

  const sendOtp = useSendOtp();
  const verifyOtp = useVerifyOtp();

  const phoneForm = useForm<RegisterPhoneFormValues | PhoneFormValues>({
    resolver: zodResolver(mode === "register" ? registerSchema : loginSchema),
    defaultValues:
      mode === "register" ? { fullName: "", phone: "" } : { phone: "" },
  });

  useEffect(() => {
    if (step !== "otp" || secondsLeft <= 0) return;
    const timer = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [step, secondsLeft]);

  function requestOtp(values: PhoneFormValues | RegisterPhoneFormValues) {
    setPhone(values.phone);
    if ("fullName" in values) setFullName(values.fullName);
    sendOtp.mutate(
      { phone: values.phone },
      {
        onSuccess: () => {
          setCode("");
          setStep("otp");
          setSecondsLeft(RESEND_SECONDS);
        },
      },
    );
  }

  function handleResend() {
    if (secondsLeft > 0) return;
    sendOtp.mutate(
      { phone },
      { onSuccess: () => setSecondsLeft(RESEND_SECONDS) },
    );
  }

  function handleVerify() {
    if (code.length !== 6) return;
    verifyOtp.mutate({
      phone,
      code,
      fullName: mode === "register" ? fullName : undefined,
    });
  }

  if (step === "otp") {
    return (
      <div className="flex flex-col gap-5">
        <button
          type="button"
          onClick={() => setStep("phone")}
          className="flex items-center gap-1.5 self-start bg-white/10 hover:bg-white/15 px-3 py-1.5 border border-glace-yellow/40 rounded-full font-medium text-[13px] text-glace-yellow transition-colors cursor-pointer"
        >
          <ArrowRight size={14} />
          تعديل رقم الجوال
        </button>

        <div className="text-center">
          <p className="flex justify-center items-center gap-1.5 text-[13.5px] text-white">
            <MessageCircle size={15} className="text-glace-yellow shrink-0" />
            تم إرسال رمز التحقق إلى حسابك على واتساب
          </p>
          <p dir="ltr" className="mt-1 font-bold text-[17px] text-white">
            {phone}
          </p>
        </div>

        <OtpInput
          value={code}
          onChange={setCode}
          disabled={verifyOtp.isPending}
        />

        {verifyOtp.isError && (
          <div className="flex justify-center items-center gap-2 bg-rose-500/15 px-3.5 py-2.5 border border-rose-400/40 rounded-[14px]">
            <p className="font-semibold text-[13.5px] text-rose-200 text-center">
              {verifyOtp.error instanceof Error
                ? verifyOtp.error.message
                : "رمز التحقق غير صحيح"}
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Button
            type="button"
            disabled={code.length !== 6 || verifyOtp.isPending}
            onClick={handleVerify}
            className="bg-glace-yellow hover:bg-yellow-300 disabled:opacity-60 shadow-[0_8px_28px_rgba(244,228,81,0.28)] hover:shadow-[0_10px_32px_rgba(244,228,81,0.4)] disabled:shadow-none py-3.5 border-0 rounded-[18px] w-full h-auto font-bold text-[#1e6a7f] text-[17px] transition-all hover:-translate-y-0.5 disabled:translate-y-0 cursor-pointer disabled:pointer-events-none"
          >
            {verifyOtp.isPending ? "جاري التحقق..." : "تأكيد الرمز"}
          </Button>

          <button
            type="button"
            onClick={handleResend}
            disabled={secondsLeft > 0 || sendOtp.isPending}
            className="font-semibold text-[13px] text-white disabled:text-white/80 text-center underline-offset-2 hover:underline disabled:hover:no-underline transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            {secondsLeft > 0
              ? `إعادة إرسال الرمز خلال ${secondsLeft} ثانية`
              : "إعادة إرسال الرمز"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <Form {...phoneForm}>
      <form
        onSubmit={phoneForm.handleSubmit(requestOtp)}
        noValidate
        className="flex flex-col gap-4"
      >
        {mode === "register" && (
          <FormField
            control={phoneForm.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelClass}>الاسم الكامل</FormLabel>
                <FormControl>
                  <div className="relative">
                    <User size={18} className={fieldIconClass} />
                    <Input
                      {...field}
                      type="text"
                      placeholder="إدخال اسمك الكامل هنا"
                      className={`peer ${inputClass}`}
                    />
                  </div>
                </FormControl>
                <FormMessage className="font-semibold text-[13px] text-rose-300" />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={phoneForm.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={labelClass}>رقم الجوال</FormLabel>
              <FormControl>
                <div className="relative">
                  <span className={`${fieldIconClass} flex items-center gap-1.5`}>
                    <PalestineFlag />
                  </span>
                  <Input
                    {...field}
                    type="tel"
                    dir="ltr"
                    placeholder="05xxxxxxxx"
                    className={`peer ${inputClass} text-left`}
                  />
                </div>
              </FormControl>
              <FormMessage className="font-semibold text-[13px] text-rose-300" />
            </FormItem>
          )}
        />

        {sendOtp.isError && (
          <div className="flex justify-center items-center gap-2 bg-rose-500/15 px-3.5 py-2.5 border border-rose-400/40 rounded-[14px]">
            <p className="font-semibold text-[13.5px] text-rose-200 text-center">
              تعذر إرسال رمز التحقق، حاول مجدداً
            </p>
          </div>
        )}

        <p className="flex justify-center items-center gap-1.5 text-[12.5px] text-white/90 text-center">
          <MessageCircle size={13} />
          سيتم إرسال رمز التحقق عبر واتساب
        </p>

        <Button
          type="submit"
          disabled={sendOtp.isPending}
          className="bg-glace-yellow hover:bg-yellow-300 disabled:opacity-60 shadow-[0_8px_28px_rgba(244,228,81,0.28)] hover:shadow-[0_10px_32px_rgba(244,228,81,0.4)] disabled:shadow-none mt-1 py-3.5 border-0 rounded-[18px] w-full h-auto font-bold text-[#1e6a7f] text-[17px] transition-all hover:-translate-y-0.5 disabled:translate-y-0 cursor-pointer disabled:pointer-events-none"
        >
          {sendOtp.isPending ? "جاري الإرسال..." : "إرسال رمز التحقق"}
        </Button>

        <span className="block text-[14px] text-white text-center">
          {switchLinkText}{" "}
          <Link
            href={switchLinkHref}
            className="font-semibold text-glace-yellow"
          >
            {switchLinkLabel}
          </Link>
        </span>

        <a
          href={SUPPORT_WHATSAPP_HREF}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 text-[13px] text-white/90 hover:text-white transition-colors"
        >
          تواجه مشكلة في التسجيل؟{" "}
          <span className="inline-flex items-center gap-1 font-semibold text-glace-yellow">
            <MessageCircle size={14} />
            تواصل مع الدعم عبر واتساب
          </span>
        </a>
      </form>
    </Form>
  );
}
