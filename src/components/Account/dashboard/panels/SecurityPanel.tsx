"use client";

import { Shield, LogOut } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import PasswordInput from "@/components/Auth/PasswordInput";
import { useChangePassword } from "@/hooks/auth/useChangePassword";
import { useLogout } from "@/hooks/auth/useLogout";
import DashboardCard from "../shared/DashboardCard";

const schema = z.object({
  current_password: z.string().min(1, "كلمة المرور الحالية مطلوبة"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
  password_confirmation: z.string().min(1, "تأكيد كلمة المرور مطلوب"),
}).refine((d) => d.password === d.password_confirmation, {
  message: "كلمتا المرور غير متطابقتين",
  path: ["password_confirmation"],
});

type PasswordForm = z.infer<typeof schema>;

export default function SecurityPanel() {
  const changePassword = useChangePassword();
  const logout = useLogout();

  const form = useForm<PasswordForm>({
    resolver: zodResolver(schema),
    defaultValues: { current_password: "", password: "", password_confirmation: "" },
  });

  function onSubmit(data: PasswordForm) {
    changePassword.mutate(data, { onSuccess: () => form.reset() });
  }

  return (
    <div className="flex flex-col gap-6">
      <DashboardCard title="تغيير كلمة المرور" icon={Shield}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
            <PasswordInput name="current_password" label="كلمة المرور الحالية" />
            <PasswordInput name="password" label="كلمة المرور الجديدة" />
            <PasswordInput name="password_confirmation" label="تأكيد كلمة المرور" />

            {changePassword.isError && (
              <p className="text-glace-yellow text-[14px]">
                {(changePassword.error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "حدث خطأ، حاول مجدداً"}
              </p>
            )}

            <Button
              type="submit"
              disabled={changePassword.isPending}
              className="bg-[#117291] hover:bg-[#0e6080] border-0 rounded-[30px] text-white text-[18px] h-auto py-3 cursor-pointer disabled:opacity-60"
            >
              {changePassword.isPending ? "جاري التغيير..." : changePassword.isSuccess ? "تم التغيير ✓" : "تغيير كلمة المرور"}
            </Button>
          </form>
        </Form>
      </DashboardCard>

      {/* Danger zone */}
      <DashboardCard>
        <div className="flex sm:flex-row flex-col sm:items-center justify-between gap-4">
          <div>
            <p className="text-white text-[18px] font-bold">تسجيل الخروج</p>
            <p className="text-white/60 text-[14px] mt-1">تسجيل الخروج من حسابك على جميع الأجهزة</p>
          </div>
          <Button
            type="button"
            disabled={logout.isPending}
            onClick={() => logout.mutate()}
            className="flex items-center gap-2 bg-red-500/30 hover:bg-red-500/50 border border-red-400/50 rounded-[20px] text-white text-[17px] h-auto py-3 px-6 cursor-pointer disabled:opacity-60 shrink-0"
          >
            <LogOut size={18} />
            {logout.isPending ? "جاري الخروج..." : "تسجيل الخروج"}
          </Button>
        </div>
      </DashboardCard>
    </div>
  );
}
