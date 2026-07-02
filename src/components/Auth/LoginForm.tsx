"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import AuthLayout from "@/components/Auth/AuthLayout";
import PasswordInput from "@/components/Auth/PasswordInput";
import { useLogin } from "@/hooks/auth/useLogin";
import type { LoginFormValues } from "@/types";

const schema = z.object({
  email: z.string().min(1, "البريد الإلكتروني مطلوب").email("البريد الإلكتروني غير صالح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
  rememberMe: z.boolean(),
});

export default function LoginForm() {
  const login = useLogin();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", rememberMe: true },
  });

  function onSubmit(data: LoginFormValues) {
    login.mutate({ email: data.email, password: data.password });
  }

  return (
    <AuthLayout title="تسجيل الدخول" subtitle="أهلا وسهلاً أهلاً بعودتكْ" activeHref="/auth/login">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-1 lg:mb-3.75 mb-1.25">
                <FormLabel className="lg:text-[23px] text-[21px] text-white">
                  البريد الإلكتروني
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="إدخال بريدك الإلكتروني هنا"
                    className="lg:py-1.5 lg:text-[20px] md:py-1 md:text-[17px] py-1.5 text-[20px] px-2.5 bg-transparent border-white text-white rounded-[35px] placeholder:text-white placeholder:text-[20px] focus-visible:ring-white/30"
                  />
                </FormControl>
                <FormMessage className="text-glace-yellow text-[16px]" />
              </FormItem>
            )}
          />

          {/* Password */}
          <PasswordInput name="password" label="كلمة المرور" />

          {/* Remember me + forgot password */}
          <div className="flex items-center justify-between lg:mb-3.75 mb-1.25">
            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <FormItem className="flex items-center gap-1.5 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="border-white data-[state=checked]:bg-transparent data-[state=checked]:border-white w-4.5 h-4.5 cursor-pointer"
                    />
                  </FormControl>
                  <FormLabel className="text-white text-[19px] cursor-pointer mb-0">
                    تذكرني
                  </FormLabel>
                </FormItem>
              )}
            />
            <Link href="/auth/restore-password" className="text-white text-[21px]">
              نسيت كلمة المرور؟
            </Link>
          </div>

          {login.isError && (
            <p className="mb-2 text-glace-yellow text-[15px] text-center">
              {(login.error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "بيانات الدخول غير صحيحة"}
            </p>
          )}

          {/* Submit */}
          <Button
            type="submit"
            disabled={login.isPending}
            className="w-full md:py-1.25 md:my-1.25 md:text-[23px] py-1.5 mt-3.75 mb-2.5 text-[24px] bg-[#117291] hover:bg-[#0e6080] text-white rounded-[30px] border-0 h-auto cursor-pointer disabled:opacity-60"
          >
            {login.isPending ? "جاري الدخول..." : "تسجيل الدخول"}
          </Button>

          <span className="block text-center text-[21px] text-white">
            لا تمتلكِ حساب؟{" "}
            <Link href="/auth/register" className="text-white text-[21px]">
              إنشاء حساب
            </Link>
          </span>

          <hr className="my-1.5 border-white/40" />
          <span className="block text-center text-[21px] lg:mb-3.5 md:mb-1.5 mb-2.25">
            أو التسجيل من خلال
          </span>

          {/* Social login */}
          <div className="flex items-center justify-center gap-2.5 mt-3.5">
            <Button
              type="button"
              className="bg-[#117291] hover:bg-[#0e6080] text-white border-0 px-5 py-0.75 gap-1.25 rounded-[30px] min-w-[135px] h-auto cursor-pointer"
            >
              <div className="w-6.75 h-6.75 bg-[#3798b7] flex items-center justify-center rounded-full shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81z" />
                </svg>
              </div>
              <span>Google</span>
            </Button>
            <Button
              type="button"
              className="bg-[#117291] hover:bg-[#0e6080] text-white border-0 px-5 py-0.75 gap-1.25 rounded-[30px] min-w-[135px] h-auto cursor-pointer"
            >
              <div className="w-6.75 h-6.75 bg-[#3798b7] flex items-center justify-center rounded-full shrink-0">
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
