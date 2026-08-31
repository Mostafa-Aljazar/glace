"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Phone, ArrowRight } from "lucide-react";
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
import { inputClass, labelClass, fieldIconClass } from "@/components/Auth/authFieldStyles";
import { useSendOtp, useVerifyOtp } from "@/hooks/auth/useOtpAuth";
import type { PhoneFormValues, RegisterPhoneFormValues } from "@/types";

const RESEND_SECONDS = 45;

const loginSchema = z.object({
  phone: z
    .string()
    .min(1, "رقم الجوال مطلوب")
    .regex(/^(009665|9665|\+9665|05|5)\d{8}$/, "رقم الجوال غير صالح"),
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
    defaultValues: mode === "register" ? { fullName: "", phone: "" } : { phone: "" },
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
    sendOtp.mutate({ phone }, { onSuccess: () => setSecondsLeft(RESEND_SECONDS) });
  }

  function handleVerify() {
    if (code.length !== 6) return;
    verifyOtp.mutate({ phone, code, fullName: mode === "register" ? fullName : undefined });
  }

  if (step === "otp") {
    return (
      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={() => setStep("phone")}
          className="flex items-center gap-1.5 text-white/60 hover:text-white text-[13px] transition-colors cursor-pointer"
        >
          <ArrowRight size={15} />
          تعديل رقم الجوال
        </button>

        <div className="text-center">
          <p className="text-white/80 text-[14px]">
            تم إرسال رمز التحقق إلى
          </p>
          <p dir="ltr" className="text-white font-bold text-[16px]">
            {phone}
          </p>
        </div>

        <OtpInput value={code} onChange={setCode} disabled={verifyOtp.isPending} />

        {verifyOtp.isError && (
          <div className="flex items-center justify-center gap-2 bg-rose-500/15 border border-rose-400/40 rounded-[14px] px-3.5 py-2.5">
            <p className="text-rose-200 text-[13.5px] font-semibold text-center">
              {verifyOtp.error instanceof Error ? verifyOtp.error.message : "رمز التحقق غير صحيح"}
            </p>
          </div>
        )}

        <Button
          type="button"
          disabled={code.length !== 6 || verifyOtp.isPending}
          onClick={handleVerify}
          className="bg-glace-yellow hover:bg-yellow-300 border-0 rounded-[18px] w-full text-[#1e6a7f] text-[17px] font-bold h-auto py-3.5 mt-1 shadow-[0_8px_28px_rgba(244,228,81,0.28)] hover:shadow-[0_10px_32px_rgba(244,228,81,0.4)] hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-60 disabled:pointer-events-none disabled:translate-y-0 disabled:shadow-none"
        >
          {verifyOtp.isPending ? "جاري التحقق..." : "تأكيد الرمز"}
        </Button>

        <button
          type="button"
          onClick={handleResend}
          disabled={secondsLeft > 0 || sendOtp.isPending}
          className="text-white/70 hover:text-white disabled:hover:text-white/40 disabled:text-white/40 text-[13px] text-center transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          {secondsLeft > 0 ? `إعادة إرسال الرمز خلال ${secondsLeft} ثانية` : "إعادة إرسال الرمز"}
        </button>
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
                <FormMessage className="text-rose-300 text-[13px] font-semibold" />
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
                  <Phone size={18} className={fieldIconClass} />
                  <Input
                    {...field}
                    type="tel"
                    dir="ltr"
                    placeholder="05xxxxxxxx"
                    className={`peer ${inputClass} text-left`}
                  />
                </div>
              </FormControl>
              <FormMessage className="text-rose-300 text-[13px] font-semibold" />
            </FormItem>
          )}
        />

        {sendOtp.isError && (
          <div className="flex items-center justify-center gap-2 bg-rose-500/15 border border-rose-400/40 rounded-[14px] px-3.5 py-2.5">
            <p className="text-rose-200 text-[13.5px] font-semibold text-center">
              تعذر إرسال رمز التحقق، حاول مجدداً
            </p>
          </div>
        )}

        <Button
          type="submit"
          disabled={sendOtp.isPending}
          className="bg-glace-yellow hover:bg-yellow-300 border-0 rounded-[18px] w-full text-[#1e6a7f] text-[17px] font-bold h-auto py-3.5 mt-1 shadow-[0_8px_28px_rgba(244,228,81,0.28)] hover:shadow-[0_10px_32px_rgba(244,228,81,0.4)] hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-60 disabled:pointer-events-none disabled:translate-y-0 disabled:shadow-none"
        >
          {sendOtp.isPending ? "جاري الإرسال..." : "إرسال رمز التحقق"}
        </Button>

        <span className="block text-center text-white/70 text-[14px]">
          {switchLinkText}{" "}
          <Link href={switchLinkHref} className="text-glace-yellow font-semibold">
            {switchLinkLabel}
          </Link>
        </span>
      </form>
    </Form>
  );
}
