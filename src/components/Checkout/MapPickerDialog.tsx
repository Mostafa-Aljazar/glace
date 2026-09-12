"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// Leaflet touches `window` at import time, so it can only ever run in the
// browser — ssr: false keeps it out of the server render entirely.
const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-full text-white/50 text-[14px]">
      جارٍ تحميل الخريطة...
    </div>
  ),
});

interface MapPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialPosition?: { lat: number; lng: number };
  onConfirm: (position: { lat: number; lng: number }) => void;
}

export default function MapPickerDialog({
  open,
  onOpenChange,
  initialPosition,
  onConfirm,
}: MapPickerDialogProps) {
  const [position, setPosition] = useState(initialPosition);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="z-100000000 bg-[#1b7496] border border-white/15 rounded-[24px] w-[calc(100%-2rem)] max-w-lg p-0 overflow-hidden text-white"
        overlayClassName="z-100000000 bg-black/45"
      >
        <DialogHeader className="px-5 pt-5 pb-3">
          <DialogTitle className="text-white text-[17px] font-bold">
            اختر موقعك على الخريطة
          </DialogTitle>
        </DialogHeader>

        <div className="h-[320px] w-full">
          <LeafletMap initialPosition={initialPosition} onChange={setPosition} />
        </div>

        <div className="p-5">
          <p className="mb-3 text-white/50 text-[12.5px] text-center">
            اضغط على الخريطة أو اسحب العلامة لتحديد موقعك بدقة
          </p>
          <Button
            type="button"
            disabled={!position}
            onClick={() => {
              if (!position) return;
              onConfirm(position);
              onOpenChange(false);
            }}
            className="w-full bg-glace-yellow hover:bg-yellow-300 border-0 rounded-[16px] text-[#1e6a7f] text-[15px] font-bold h-auto py-3 cursor-pointer disabled:opacity-50"
          >
            <Check size={16} />
            تأكيد الموقع
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
