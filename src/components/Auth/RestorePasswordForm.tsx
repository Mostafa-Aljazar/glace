"use client";

import { useRouter } from "next/navigation";
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
import type { RestorePasswordFormValues } from "@/types";

const schema = z.object({
  email: z
    .string()
    .min(1, "البريد الإلكتروني مطلوب")
    .email("البريد الإلكتروني غير صالح"),
});

export default function RestorePasswordForm() {
  const router = useRouter();
  const form = useForm<RestorePasswordFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  function onSubmit(data: RestorePasswordFormValues) {
    console.log(data);
    router.push("/auth/new-password");
  }

  return (
    <AuthLayout title="استعادة كلمة المرور" activeHref="/auth/restore-password">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-1 mb-2">
                <FormLabel className="text-[21px] text-white lg:text-[23px]">
                  البريد الإلكتروني
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="إدخال بريدك الإلكتروني هنا"
                    className="bg-transparent px-2.5 py-1.5 md:py-1 lg:py-1.5 border-white rounded-[35px] focus-visible:ring-white/30 text-[20px] text-white md:text-[17px] lg:text-[20px] placeholder:text-[20px] placeholder:text-white"
                  />
                </FormControl>
                <FormMessage className="text-[16px] text-glace-yellow" />
              </FormItem>
            )}
          />

          <span className="block mb-1 text-[21px] text-white text-center">
            الرجاء مراجعة البريد الالكتروني لاستعادة كلمة المرور
          </span>

          <Button
            type="submit"
            className="bg-[#117291] hover:bg-[#0e6080] mt-4 mb-2.5 py-1.5 border-0 rounded-[30px] w-full h-auto text-[23px] text-white cursor-pointer"
          >
            إستعادة
          </Button>
        </form>
      </Form>
    </AuthLayout>
  );
}
