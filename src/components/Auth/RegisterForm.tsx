"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import AuthLayout from "@/components/Auth/AuthLayout";
import PasswordInput from "@/components/Auth/PasswordInput";
import { useRegister } from "@/hooks/auth/useRegister";
import type { RegisterFormValues } from "@/types";

const schema = z
  .object({
    fullName: z.string().min(1, "الاسم الكامل مطلوب"),
    email: z
      .string()
      .min(1, "البريد الإلكتروني مطلوب")
      .email("البريد الإلكتروني غير صالح"),
    phone: z.string().min(1, "رقم الهاتف مطلوب"),
    password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
    confirmPassword: z.string().min(1, "تأكيد كلمة المرور مطلوب"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "كلمتا المرور غير متطابقتين",
    path: ["confirmPassword"],
  });

const inputClass =
  "lg:py-1.5 lg:text-[20px] md:py-1 md:text-[17px] py-1.5 text-[20px] px-2.5 bg-transparent border-white text-white rounded-[35px] placeholder:text-white placeholder:text-[20px] focus-visible:ring-white/30";
const itemClass = "flex flex-col gap-1 lg:mb-3.75 mb-1.25";
const labelClass = "lg:text-[23px] text-[21px] text-white";

export default function RegisterForm() {
  const register = useRegister();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  function onSubmit(data: RegisterFormValues) {
    register.mutate({
      name: data.fullName,
      email: data.email,
      phone: data.phone,
      password: data.password,
      password_confirmation: data.confirmPassword,
    });
  }

  return (
    <AuthLayout
      title="إنشاء الحساب"
      subtitle="يمكنك إنشاء حساب جديد بكل سهولة"
      activeHref="/auth/register"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          {/* Full name */}
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem className={itemClass}>
                <FormLabel className={labelClass}>الاسم الكامل</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="text"
                    placeholder="إدخال اسمك الكامل هنا"
                    className={inputClass}
                  />
                </FormControl>
                <FormMessage className="text-[16px] text-glace-yellow" />
              </FormItem>
            )}
          />

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className={itemClass}>
                <FormLabel className={labelClass}>البريد الإلكتروني</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="إدخال بريدك الإلكتروني هنا"
                    className={inputClass}
                  />
                </FormControl>
                <FormMessage className="text-[16px] text-glace-yellow" />
              </FormItem>
            )}
          />

          {/* Phone */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem className={itemClass}>
                <FormLabel className={labelClass}>رقم الهاتف</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="tel"
                    placeholder="إدخال رقم هاتفك هنا"
                    className={inputClass}
                  />
                </FormControl>
                <FormMessage className="text-[16px] text-glace-yellow" />
              </FormItem>
            )}
          />

          {/* Password */}
          <PasswordInput name="password" label="كلمة المرور" />

          {/* Confirm password */}
          <PasswordInput name="confirmPassword" label="تأكيد كلمة المرور" />

          {register.isError && (
            <p className="mb-2 text-glace-yellow text-[15px] text-center">
              {(register.error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "حدث خطأ، حاول مجدداً"}
            </p>
          )}

          {/* Submit */}
          <Button
            type="submit"
            disabled={register.isPending}
            className="bg-[#117291] hover:bg-[#0e6080] md:my-1.25 mt-3.75 mb-2.5 py-1.5 md:py-1.25 border-0 rounded-[30px] w-full h-auto text-[24px] text-white md:text-[23px] cursor-pointer disabled:opacity-60"
          >
            {register.isPending ? "جاري الإنشاء..." : "إنشاء الحساب"}
          </Button>

          <span className="block text-[21px] text-white text-center">
            أمتلك حساب بالفعل !{" "}
            <Link href="/auth/login" className="text-[21px] text-white">
              تسجيل الدخول
            </Link>
          </span>

          <hr className="my-1.5 border-white/40" />
          <span className="block mb-2.25 md:mb-1.5 lg:mb-3.5 text-[21px] text-center">
            أو التسجيل من خلال
          </span>

          {/* Social login */}
          <div className="flex justify-center items-center gap-2.5 mt-3.5">
            <Button
              type="button"
              className="gap-1.25 bg-[#117291] hover:bg-[#0e6080] px-5 py-0.75 border-0 rounded-[30px] min-w-[135px] h-auto text-white cursor-pointer"
            >
              <div className="flex justify-center items-center bg-[#3798b7] rounded-full w-6.75 h-6.75 shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81z" />
                </svg>
              </div>
              <span>Google</span>
            </Button>
            <Button
              type="button"
              className="gap-1.25 bg-[#117291] hover:bg-[#0e6080] px-5 py-0.75 border-0 rounded-[30px] min-w-[135px] h-auto text-white cursor-pointer"
            >
              <div className="flex justify-center items-center bg-[#3798b7] rounded-full w-6.75 h-6.75 shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.268h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
                </svg>
              </div>
              <span>facebook</span>
            </Button>
          </div>
        </form>
      </Form>
    </AuthLayout>
  );
}
