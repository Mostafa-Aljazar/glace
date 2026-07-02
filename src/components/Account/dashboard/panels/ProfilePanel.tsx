"use client";

import { useEffect } from "react";
import { UserCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMe } from "@/hooks/auth/useMe";
import { useUpdateProfile } from "@/hooks/auth/useUpdateProfile";
import DashboardCard from "../shared/DashboardCard";

const schema = z.object({
  name: z.string().min(1, "الاسم مطلوب"),
  phone: z.string().min(1, "رقم الهاتف مطلوب"),
  email: z.string().email("بريد إلكتروني غير صالح"),
});

type ProfileForm = z.infer<typeof schema>;

const inputClass = "bg-transparent border-white text-white placeholder:text-white/60 rounded-[20px] focus-visible:ring-white/30";
const labelClass = "text-white text-[17px]";

export default function ProfilePanel() {
  const { data: user } = useMe();
  const update = useUpdateProfile();

  const form = useForm<ProfileForm>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", phone: "", email: "" },
  });

  useEffect(() => {
    if (user) form.reset({ name: user.name, phone: user.phone ?? "", email: user.email });
  }, [user, form]);

  function onSubmit(data: ProfileForm) {
    update.mutate(data);
  }

  return (
    <DashboardCard title="بيانات الحساب" icon={UserCircle}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem>
              <FormLabel className={labelClass}>الاسم الكامل</FormLabel>
              <FormControl><Input {...field} className={inputClass} /></FormControl>
              <FormMessage className="text-glace-yellow text-[14px]" />
            </FormItem>
          )} />
          <FormField control={form.control} name="phone" render={({ field }) => (
            <FormItem>
              <FormLabel className={labelClass}>رقم الهاتف</FormLabel>
              <FormControl><Input {...field} type="tel" className={inputClass} /></FormControl>
              <FormMessage className="text-glace-yellow text-[14px]" />
            </FormItem>
          )} />
          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem>
              <FormLabel className={labelClass}>البريد الإلكتروني</FormLabel>
              <FormControl><Input {...field} type="email" className={inputClass} /></FormControl>
              <FormMessage className="text-glace-yellow text-[14px]" />
            </FormItem>
          )} />

          {update.isError && (
            <p className="text-glace-yellow text-[14px]">
              {(update.error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "حدث خطأ، حاول مجدداً"}
            </p>
          )}

          <Button
            type="submit"
            disabled={update.isPending}
            className="bg-[#117291] hover:bg-[#0e6080] border-0 rounded-[30px] text-white text-[18px] h-auto py-3 cursor-pointer disabled:opacity-60"
          >
            {update.isPending ? "جاري الحفظ..." : update.isSuccess ? "تم الحفظ ✓" : "حفظ التغييرات"}
          </Button>
        </form>
      </Form>
    </DashboardCard>
  );
}
