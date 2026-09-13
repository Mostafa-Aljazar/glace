"use client";

import { useEffect, useState } from "react";
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

const RESEND_SECONDS = 60;
const SUPPORT_WHATSAPP_HREF = "https://wa.me/972592226522";

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

const phoneSchema = z.object({
  phone: z
    .string()
    .min(1, "رقم الجوال مطلوب")
    .regex(/^(\+972|009725|972|05)\d{8}$|^5\d{8}$/, "رقم الجوال غير صالح"),
});

const otpSchema = z.object({
  fullName: z.string().optional(),
});

export default function PhoneOtpFlow() {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [userExists, setUserExists] = useState(false);
  const [code, setCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(0);

  const sendOtp = useSendOtp();
  const verifyOtp = useVerifyOtp();

  const phoneForm = useForm<z.infer<typeof phoneSchema>>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: "" },
  });

  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: { fullName: "" },
  });

  useEffect(() => {
    if (step !== "otp" || secondsLeft <= 0) return;
    const timer = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [step, secondsLeft]);

  function requestOtp(values: z.infer<typeof phoneSchema>) {
    setPhone(values.phone);
    sendOtp.mutate(
      { phone: values.phone },
      {
        onSuccess: (data) => {
          setUserExists(data.userExists);
          setCode("");
          setFullName("");
          setStep("otp");
          setSecondsLeft(RESEND_SECONDS);
        },
      },
    );
  }

  function handlePhoneEdit() {
    setStep("phone");
    sendOtp.reset();
    verifyOtp.reset();
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
      fullName: !userExists ? fullName : undefined,
    });
  }

  if (step === "otp") {
    return (
      <div className="flex flex-col gap-5">
        <button
          type="button"
          onClick={handlePhoneEdit}
          className="flex items-center gap-1.5 self-start bg-white/10 hover:bg-white/15 px-3 py-1.5 border border-glace-yellow/40 rounded-full font-medium text-[13px] text-glace-yellow transition-colors cursor-pointer"
        >
          <ArrowRight size={14} />
          تعديل رقم الجوال
        </button>

        <div className="text-center">
          <p className="flex justify-center items-center gap-1.5 text-[13.5px] text-white">
            <MessageCircle size={15} className="text-glace-yellow shrink-0" />
            سيتم إرسال رسالة الكود إلى رقم الجوال
          </p>
          <p dir="ltr" className="mt-1 font-bold text-[17px] text-white">
            {phone}
          </p>
        </div>

        {!userExists && (
          <div>
            <label className={labelClass}>الاسم الكامل</label>
            <div className="relative mt-2">
              <User size={18} className={fieldIconClass} />
              <Input
                type="text"
                placeholder="إدخال اسمك الكامل هنا"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={verifyOtp.isPending}
                className={`peer ${inputClass}`}
              />
            </div>
          </div>
        )}

        <OtpInput
          value={code}
          onChange={(newCode) => {
            setCode(newCode);
            verifyOtp.reset();
          }}
          disabled={verifyOtp.isPending}
        />

        {verifyOtp.isError && (
          <div className="bg-rose-500/15 px-3.5 py-2.5 border border-rose-400/40 rounded-[14px]">
            <p className="font-semibold text-[13.5px] text-rose-200 text-center">
              {verifyOtp.error instanceof Error
                ? verifyOtp.error.message
                : "حدث خطأ في التحقق"}
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Button
            type="button"
            disabled={code.length !== 6 || verifyOtp.isPending || (!userExists && !fullName.trim())}
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
                    disabled={sendOtp.isPending}
                    className={`peer ${inputClass} text-left`}
                  />
                </div>
              </FormControl>
              <FormMessage className="font-semibold text-[13px] text-rose-300" />
            </FormItem>
          )}
        />

        {sendOtp.isError && (
          <div className="bg-rose-500/15 px-3.5 py-2.5 border border-rose-400/40 rounded-[14px]">
            <p className="font-semibold text-[13.5px] text-rose-200 text-center">
              {sendOtp.error instanceof Error
                ? sendOtp.error.message
                : "حدث خطأ في إرسال الرمز"}
            </p>
          </div>
        )}

        <p className="flex justify-center items-center gap-1.5 text-[12.5px] text-white/90 text-center">
          <MessageCircle size={13} />
          سيتم إرسال رسالة الكود إلى رقم الجوال
        </p>

        <Button
          type="submit"
          disabled={sendOtp.isPending}
          className="bg-glace-yellow hover:bg-yellow-300 disabled:opacity-60 shadow-[0_8px_28px_rgba(244,228,81,0.28)] hover:shadow-[0_10px_32px_rgba(244,228,81,0.4)] disabled:shadow-none mt-1 py-3.5 border-0 rounded-[18px] w-full h-auto font-bold text-[#1e6a7f] text-[17px] transition-all hover:-translate-y-0.5 disabled:translate-y-0 cursor-pointer disabled:pointer-events-none"
        >
          {sendOtp.isPending ? "جاري الإرسال..." : "إرسال رمز التحقق"}
        </Button>

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
