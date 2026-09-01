"use client";

import { useState } from "react";
import { MapPin, MapPinOff, Plus, Pencil, Trash2 } from "lucide-react";
import type { SavedAddress } from "@/store/addressStore";
import { useAuthStore } from "@/store/authStore";
import { findDeliveryZone } from "@/lib/deliveryZones";
import {
  useAddresses,
  useAddAddress,
  useUpdateAddress,
  useDeleteAddress,
  useSetDefaultAddress,
} from "@/hooks/addresses";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import DashboardCard from "../shared/DashboardCard";
import EmptyState from "../shared/EmptyState";
import AddressForm from "@/components/Checkout/AddressForm";

export default function AddressesPanel() {
  const { data: addresses = [] } = useAddresses();
  const removeAddressMutation = useDeleteAddress();
  const addAddressMutation = useAddAddress();
  const setDefaultAddressMutation = useSetDefaultAddress();
  const user = useAuthStore((s) => s.user);
  const [editingId, setEditingId] = useState<string | null>(null);
  const updateAddressMutation = useUpdateAddress(editingId ?? "");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SavedAddress | null>(null);

  function openAdd() {
    setEditing(null);
    setEditingId(null);
    setFormOpen(true);
  }

  function openEdit(address: SavedAddress) {
    setEditing(address);
    setEditingId(address.id);
    setFormOpen(true);
  }

  return (
    <DashboardCard title="العناوين المحفوظة" icon={MapPin}>
      <div className="flex items-center justify-end mb-4">
        <button
          type="button"
          onClick={openAdd}
          className="flex items-center gap-1.5 rounded-full bg-glace-yellow px-4 py-2 text-[13px] font-bold text-[#1e6a7f] hover:bg-yellow-300 transition-colors cursor-pointer"
        >
          <Plus size={15} />
          إضافة عنوان
        </button>
      </div>

      {addresses.length === 0 ? (
        <EmptyState icon={MapPin} message="ما في عناوين محفوظة بعد" />
      ) : (
        <div className="flex flex-col gap-3">
          {addresses.map((address) => {
            const zone = findDeliveryZone(address.zoneId);
            return (
              <div
                key={address.id}
                className={`rounded-[18px] border px-4 py-3.5 ${
                  address.isDefault
                    ? "bg-glace-yellow/10 border-glace-yellow/50"
                    : "bg-white/6 border-white/15"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="flex items-center gap-1.5 text-[16px] font-bold text-white">
                        <MapPin size={16} className="text-glace-yellow shrink-0" />
                        {address.label}
                      </span>
                      {address.isDefault && (
                        <span className="bg-glace-yellow/20 text-glace-yellow text-[11px] font-bold px-2 py-0.5 rounded-full">
                          الافتراضي
                        </span>
                      )}
                      {!address.location && (
                        <span className="flex items-center gap-1 text-white/40 text-[11px]">
                          <MapPinOff size={12} />
                          بدون موقع GPS
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 text-white/60 text-[14px] leading-relaxed">
                      {address.city} · {zone?.name ?? address.zoneId} · {address.street}
                      {address.landmark ? ` · ${address.landmark}` : ""}
                    </p>
                    <p className="text-white/45 text-[13px]">
                      {address.name} · {address.phone}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => removeAddressMutation.mutate(address.id)}
                    className="flex items-center gap-1.5 text-rose-300 hover:text-rose-200 text-[13px] font-bold transition-colors cursor-pointer"
                  >
                    <Trash2 size={14} />
                    حذف
                  </button>
                  <div className="flex items-center gap-3">
                    {!address.isDefault && (
                      <button
                        type="button"
                        onClick={() => setDefaultAddressMutation.mutate(address.id)}
                        className="text-white/60 hover:text-white text-[13px] font-bold transition-colors cursor-pointer"
                      >
                        اجعله افتراضي
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => openEdit(address)}
                      className="flex items-center gap-1.5 text-glace-yellow hover:text-yellow-300 text-[13px] font-bold transition-colors cursor-pointer"
                    >
                      <Pencil size={14} />
                      تعديل
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent
          className="bg-[#1b7496] border border-white/15 rounded-[28px] max-w-lg md:max-w-xl lg:max-w-2xl max-h-[85vh] overflow-y-auto p-6 text-white"
          overlayClassName="bg-black/45"
        >
          <DialogHeader>
            <DialogTitle className="text-white text-[19px] font-bold">
              {editing ? "تعديل العنوان" : "إضافة عنوان جديد"}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-2">
            <AddressForm
              initialValue={editing ?? undefined}
              defaultName={editing ? undefined : user?.name}
              defaultPhone={editing ? undefined : user?.phone}
              submitLabel={editing ? "حفظ التغييرات" : "إضافة العنوان"}
              onSubmit={(data) => {
                if (editing) {
                  updateAddressMutation.mutate(data);
                } else {
                  addAddressMutation.mutate(data);
                }
                setFormOpen(false);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </DashboardCard>
  );
}
