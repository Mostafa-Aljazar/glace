"use client";

import { useEffect } from "react";
import { UserCircle, User, Phone, Mail } from "lucide-react";
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
import { useMe } from "@/hooks/auth/useMe";
import { useAuthStore } from "@/store/authStore";
import { useUpdateProfile } from "@/hooks/auth/useUpdateProfile";
import type { AuthUser } from "@/store/authStore";
import DashboardCard from "../shared/DashboardCard";
import { inputClass, labelClass, fieldIconClass } from "@/components/Auth/authFieldStyles";

const schema = z.object({
  name: z.string().min(1, "الاسم مطلوب"),
  phone: z.string().min(1, "رقم الهاتف مطلوب"),
  email: z
    .string()
    .email("بريد إلكتروني غير صالح")
    .optional()
    .or(z.literal("")),
});

type ProfileForm = z.infer<typeof schema>;

export default function ProfilePanel() {
  // prefer reading user from the persisted auth store for correct typing
  useMe(); // keep query active so it syncs the store via onSuccess
  const user = useAuthStore((s) => s.user);
  const update = useUpdateProfile();

  const form = useForm<ProfileForm>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", phone: "", email: "" },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        phone: user.phone ?? "",
        email: user.email,
      });
    }
  }, [user, form]);

  function onSubmit(data: ProfileForm) {
    update.mutate(data);
  }

  return (
    <DashboardCard title="بيانات الحساب" icon={UserCircle}>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
          className="flex flex-col gap-4"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelClass}>الاسم الكامل</FormLabel>
                <FormControl>
                  <div className="relative">
                    <User size={18} className={fieldIconClass} />
                    <Input {...field} placeholder="الاسم الكامل" className={`peer ${inputClass}`} />
                  </div>
                </FormControl>
                <FormMessage className="text-[13px] text-glace-yellow font-semibold" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelClass}>رقم الهاتف</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Phone size={18} className={fieldIconClass} />
                    <Input
                      {...field}
                      type="tel"
                      dir="ltr"
                      placeholder="05XXXXXXXX"
                      className={`peer text-left ${inputClass}`}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-[13px] text-glace-yellow font-semibold" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelClass}>
                  البريد الإلكتروني (اختياري)
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail size={18} className={fieldIconClass} />
                    <Input
                      {...field}
                      type="email"
                      dir="ltr"
                      placeholder="example@email.com"
                      className={`peer text-left ${inputClass}`}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-[13px] text-glace-yellow font-semibold" />
              </FormItem>
            )}
          />

          {update.isError && (
            <p className="text-[13px] text-glace-yellow font-semibold">
              {(update.error as { response?: { data?: { message?: string } } })
                ?.response?.data?.message ?? "حدث خطأ، حاول مجدداً"}
            </p>
          )}

          <Button
            type="submit"
            disabled={update.isPending}
            className="bg-glace-yellow hover:bg-glace-yellow/90 disabled:opacity-60 py-3 border-0 rounded-[16px] h-12 text-[16px] font-semibold text-[#1e6a7f] cursor-pointer transition-colors"
          >
            {update.isPending
              ? "جاري الحفظ..."
              : update.isSuccess
                ? "تم الحفظ ✓"
                : "حفظ التغييرات"}
          </Button>
        </form>
      </Form>
    </DashboardCard>
  );
}
