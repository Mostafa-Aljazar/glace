"use client";

import { useState } from "react";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { useFormContext } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface PasswordInputProps {
  name: string;
  label: string;
  placeholder?: string;
}

export default function PasswordInput({
  name,
  label,
  placeholder = "•••••••••",
}: PasswordInputProps) {
  const [show, setShow] = useState(false);
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col gap-1 mb-1.25 lg:mb-3.75">
          <FormLabel className="text-[21px] text-white lg:text-[23px]">
            {label}
          </FormLabel>
          <FormControl>
            <div className="relative flex items-center w-full">
              <Input
                {...field}
                type={show ? "text" : "password"}
                placeholder={placeholder}
                className="bg-transparent px-2.5 py-1.5 md:py-1 lg:py-1.5 pr-10 border-white rounded-[35px] focus-visible:ring-white/30 text-[20px] text-white md:text-[17px] lg:text-[20px] placeholder:text-[20px] placeholder:text-white [&::-ms-reveal]:hidden [&::-webkit-credentials-auto-fill-button]:hidden [&::-webkit-textfield-decoration-container]:hidden"
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                className="left-2.5 absolute flex justify-center items-center bg-transparent p-0 border-0 w-6.25 h-6.25 text-white cursor-pointer"
              >
                {show ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </FormControl>
          <FormMessage className="text-[16px] text-glace-yellow" />
        </FormItem>
      )}
    />
  );
}
