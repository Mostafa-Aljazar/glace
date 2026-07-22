import Image from "next/image";
import type { UseFormReturn } from "react-hook-form";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { popImgG } from "@/assets/images";
import type { IContactRequest } from "@/types/contact.types";

const inputClass =
  "w-full px-3.5 py-1.75 bg-[#4397ae] text-white border-0 rounded-[30px] text-[21px] outline-none placeholder:text-white placeholder:text-[21px]";

interface ContactFormProps {
  form: UseFormReturn<IContactRequest>;
  isSubmitting?: boolean;
  onSubmit: (data: IContactRequest) => void;
}

export default function ContactForm({
  form,
  isSubmitting = false,
  onSubmit,
}: ContactFormProps) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="mt-4">
        <div className="flex sm:flex-row flex-col gap-5">
          <div className="w-full sm:w-1/2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-0.5 mb-1.75">
                  <FormLabel className="pr-1.5 text-white text-2xl">
                    اسم المرسل
                  </FormLabel>
                  <FormControl>
                    <input
                      {...field}
                      type="text"
                      placeholder="الاسم هنا"
                      className={inputClass}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-0.5 mb-1.75">
                  <FormLabel className="pr-1.5 text-white text-2xl">
                    رقم الجوال
                  </FormLabel>
                  <FormControl>
                    <input
                      {...field}
                      type="text"
                      placeholder="رقم الجوال"
                      className={inputClass}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-0.5 mb-1.75">
                  <FormLabel className="pr-1.5 text-white text-2xl">
                    البريد الالكتروني
                  </FormLabel>
                  <FormControl>
                    <input
                      {...field}
                      type="email"
                      placeholder="البريد الالكتروني"
                      className={inputClass}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />
          </div>

          <div className="w-full sm:w-1/2">
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-0.5 mb-1.75 h-full">
                  <FormLabel className="pr-1.5 text-white text-2xl">
                    رسالتك
                  </FormLabel>
                  <FormControl>
                    <textarea
                      {...field}
                      rows={7}
                      placeholder="رسالتك هنا"
                      className="flex-1 bg-[#4397ae] px-3.5 py-1.75 border-0 rounded-[30px] outline-none w-full text-[21px] text-white placeholder:text-[21px] placeholder:text-white resize-none"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-center mt-10">
          <button
            type="submit"
            disabled={isSubmitting}
            className="relative flex justify-center items-center bg-transparent mx-auto sm:mx-0 border-0 w-50 sm:w-auto min-w-35 sm:min-w-37.5 h-13.75 sm:h-17.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Image
              src={popImgG}
              alt=""
              fill
              className="opacity-80 object-fill rotate-[-5deg]"
            />
            <span className="relative text-white text-3xl sm:text-4xl">
              {isSubmitting ? "..." : "ارسال"}
            </span>
          </button>
        </div>
      </form>
    </Form>
  );
}
