"use client";

import { useState } from "react";
import { Wallet, TrendingUp, TrendingDown } from "lucide-react";
import EventsBackground from "@/components/Events/EventsBackground";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useWalletStore } from "@/store/walletStore";

const TOP_UP_AMOUNTS = [10, 20, 50, 100];

export default function MyWalletClientPage() {
  const [customAmount, setCustomAmount] = useState("");
  const balance = useWalletStore((s) => s.balance);
  const transactions = useWalletStore((s) => s.transactions);
  const topUp = useWalletStore((s) => s.topUp);

  function handleTopUp(amount: number) {
    if (amount <= 0) return;
    topUp(amount, "شحن رصيد");
    setCustomAmount("");
  }

  return (
    <div className="relative bg-[radial-gradient(circle,#41a2c5_0%,#388dab_100%)] min-h-screen overflow-x-hidden">
      
      <EventsBackground />

      <div className="z-90 relative mx-auto px-4 pt-22.5 lg:pt-26.5 pb-12 max-w-300">
        <h1 className="mb-6 text-[40px] text-white sm:text-[50px] text-center">
          محفظتي
        </h1>

        <div className="flex lg:flex-row flex-col gap-6">
          {/* Balance + Top-up */}
          <div className="flex flex-col gap-5 w-full lg:w-[320px]">
            {/* Balance card */}
            <div className="bg-white/[.17] backdrop-blur-[15px] p-6 rounded-[30px] text-white text-center">
              <div className="flex justify-center items-center bg-glace-yellow mx-auto mb-4 rounded-full size-16">
                <Wallet className="size-8 text-[#388dab]" strokeWidth={2} />
              </div>
              <p className="opacity-80 mb-1 text-[18px]">الرصيد الحالي</p>
              <p className="font-bold text-[52px] leading-none">
                {balance.toFixed(2)}
              </p>
              <p className="mt-1 text-[22px]">شيكل ₪</p>
            </div>

            {/* Top-up */}
            <div className="bg-white/[.17] backdrop-blur-[15px] p-6 rounded-[30px] text-white">
              <h2 className="mb-4 text-[22px]">شحن الرصيد</h2>
              <div className="gap-3 grid grid-cols-2 mb-4">
                {TOP_UP_AMOUNTS.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleTopUp(amt)}
                    className="hover:bg-white/20 py-3 border border-white/50 hover:border-white rounded-full text-[18px] text-white transition-colors cursor-pointer"
                  >
                    {amt} ₪
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="مبلغ مخصص"
                  className="bg-transparent border-white rounded-[20px] focus-visible:ring-white/30 text-white placeholder:text-white/60"
                />
                <Button
                  type="button"
                  onClick={() => handleTopUp(parseFloat(customAmount) || 0)}
                  className="bg-[#117291] hover:bg-[#0e6080] px-5 border-0 rounded-[20px] h-auto text-white cursor-pointer"
                >
                  شحن
                </Button>
              </div>
            </div>
          </div>

          {/* Transaction history */}
          <div className="flex-1 bg-white/[.17] backdrop-blur-[15px] p-6 rounded-[30px] text-white">
            <h2 className="mb-4 text-[22px]">سجل المعاملات</h2>

            {transactions.length === 0 ? (
              <p className="py-10 text-[18px] text-white/60 text-center">
                لا يوجد معاملات بعد
              </p>
            ) : (
              <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex justify-between items-center pb-3 border-white/20 border-b"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex justify-center items-center rounded-full w-9 h-9 ${tx.type === "credit" ? "bg-green-500/30" : "bg-red-500/30"}`}
                      >
                        {tx.type === "credit" ? (
                          <TrendingUp size={18} className="text-green-300" />
                        ) : (
                          <TrendingDown size={18} className="text-red-300" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-[16px]">{tx.label}</p>
                        <p className="opacity-60 text-[13px]">
                          {new Date(tx.date).toLocaleString("ar-PS", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </p>
                      </div>
                    </div>
                    <p
                      className={`text-[18px] font-bold ${tx.type === "credit" ? "text-green-300" : "text-red-300"}`}
                    >
                      {tx.type === "credit" ? "+" : "-"}
                      {tx.amount.toFixed(2)} ₪
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
