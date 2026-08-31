"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, MapPin, Search, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { fetchDeliveryZones, type DeliveryZone } from "@/lib/deliveryZones";

interface ZonePickerSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedZoneId?: string;
  onSelect: (zone: DeliveryZone) => void;
}

export default function ZonePickerSheet({
  open,
  onOpenChange,
  selectedZoneId,
  onSelect,
}: ZonePickerSheetProps) {
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [query, setQuery] = useState("");

  // Fetched fresh each time the sheet opens — cheap now (hardcoded list) and
  // keeps this component ready for the real endpoint without further changes.
  useEffect(() => {
    if (!open) return;
    fetchDeliveryZones().then(setZones);
  }, [open]);

  function handleOpenChange(next: boolean) {
    if (!next) setQuery("");
    onOpenChange(next);
  }

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return zones;
    return zones.filter(
      (z) => z.name.includes(q) || (z.description ?? "").includes(q),
    );
  }, [zones, query]);

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        overlayClassName="z-100000000"
        className="z-100000000 bg-[#1b7496] border-white/15 rounded-t-[28px] max-h-[85vh] p-0"
      >
        <SheetHeader className="relative shrink-0 px-5 pt-5 pb-3 text-center">
          <SheetTitle className="text-white text-[18px] font-bold">
            اختر منطقتك
          </SheetTitle>
          <SheetClose
            aria-label="إغلاق"
            className="absolute top-4 start-4 flex items-center justify-center size-8 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X size={16} />
          </SheetClose>
        </SheetHeader>

        <div className="shrink-0 px-5 pb-3">
          <div className="relative">
            <Search
              size={17}
              className="absolute top-1/2 start-4 -translate-y-1/2 text-white/40"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث عن منطقتك..."
              className="w-full bg-white/10 border border-white/20 rounded-[16px] ps-11 pe-4 py-3 text-white placeholder:text-white/40 text-[14px] outline-none focus:border-glace-yellow/50 transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-6">
          {filtered.length === 0 ? (
            <p className="text-white/50 text-[14px] text-center py-8">
              ما في نتائج مطابقة
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {filtered.map((zone) => {
                const active = zone.id === selectedZoneId;
                return (
                  <button
                    key={zone.id}
                    type="button"
                    onClick={() => {
                      onSelect(zone);
                      handleOpenChange(false);
                    }}
                    className={`w-full flex items-center gap-3 rounded-[16px] border px-4 py-3 text-start transition-colors cursor-pointer ${
                      active
                        ? "bg-glace-yellow/15 border-glace-yellow"
                        : "bg-white/6 border-white/12 hover:border-white/25"
                    }`}
                  >
                    <span
                      className={`flex items-center justify-center shrink-0 size-9 rounded-full ${
                        active ? "bg-glace-yellow text-[#1e6a7f]" : "bg-white/10 text-white/60"
                      }`}
                    >
                      {active ? <Check size={17} strokeWidth={3} /> : <MapPin size={16} />}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span
                        className={`block font-bold text-[15px] ${active ? "text-glace-yellow" : "text-white"}`}
                      >
                        {zone.name}
                      </span>
                      {zone.description && (
                        <span className="block text-white/50 text-[12px] mt-0.5 line-clamp-1">
                          {zone.description}
                        </span>
                      )}
                    </span>
                    {zone.fee > 0 ? (
                      <span className="shrink-0 text-white/60 text-[13px] tabular-nums">
                        {zone.fee} ₪
                      </span>
                    ) : (
                      <span className="shrink-0 bg-glace-yellow/20 text-glace-yellow text-[12px] font-bold px-2 py-0.5 rounded-full">
                        مجاني
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
