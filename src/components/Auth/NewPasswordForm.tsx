"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import AuthLayout from "@/components/Auth/AuthLayout";
import PasswordInput from "@/components/Auth/PasswordInput";
import NewPasswordSuccessDialog from "@/components/Auth/NewPasswordSuccessDialog";
import type { NewPasswordFormValues } from "@/types";

const schema = z.object({
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
  confirmPassword: z.string().min(1, "تأكيد كلمة المرور مطلوب"),
}).refine((d) => d.password === d.confirmPassword, {
  message: "كلمتا المرور غير متطابقتين",
  path: ["confirmPassword"],
});

export default function NewPasswordForm() {
  const [successOpen, setSuccessOpen] = useState(false);

  const form = useForm<NewPasswordFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  function onSubmit(data: NewPasswordFormValues) {
    console.log(data);
    form.reset();
    setSuccessOpen(true);
  }

  return (
    <AuthLayout title="كلمة المرور الجديدة" subtitle="قم بإنشاء كلمة المرور الجديدة" activeHref="/auth/new-password">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>

          <PasswordInput name="password" label="كلمة المرور" />
          <PasswordInput name="confirmPassword" label="تأكيد كلمة المرور" />

          <Button
            type="submit"
            className="w-full md:py-1.25 md:my-1.25 md:text-[23px] py-1.5 mt-3.75 mb-2.5 text-[24px] h-auto bg-[#117291] hover:bg-[#0e6080] text-white rounded-[30px] border-0 cursor-pointer"
          >
            تأكيد
          </Button>

        </form>
      </Form>

      <NewPasswordSuccessDialog open={successOpen} onOpenChange={setSuccessOpen} />
    </AuthLayout>
  );
}
