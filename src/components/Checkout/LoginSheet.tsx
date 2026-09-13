"use client";

import { X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import PhoneOtpFlow from "@/components/Auth/PhoneOtpFlow";

interface LoginSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function LoginSheet({ open, onOpenChange }: LoginSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        overlayClassName="z-100000000"
        className="z-100000000 bg-[#1b7496] border-white/15 rounded-t-[28px] max-h-[90vh] p-0"
      >
        <SheetHeader className="relative shrink-0 px-5 pt-5 pb-3 text-center">
          <SheetTitle className="text-white text-[18px] font-bold">
            تسجيل الدخول / إنشاء حساب
          </SheetTitle>
          <p className="text-white/70 text-[13.5px] mt-1">
            أدخل رقم جوالك لتسجيل الدخول أو إنشاء حساب جديد
          </p>
          <SheetClose
            aria-label="إغلاق"
            className="absolute top-4 start-4 flex items-center justify-center size-8 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X size={16} />
          </SheetClose>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 pb-6">
          <PhoneOtpFlow onSuccess={() => onOpenChange(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
