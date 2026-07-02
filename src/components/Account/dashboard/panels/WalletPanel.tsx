"use client";

import { useState } from "react";
import { Wallet, TrendingUp, TrendingDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useWalletStore } from "@/store/walletStore";
import DashboardCard from "../shared/DashboardCard";
import EmptyState from "../shared/EmptyState";

const TOP_UP_AMOUNTS = [10, 20, 50, 100];

export default function WalletPanel() {
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
    <div className="flex lg:flex-row flex-col gap-6">
      {/* Balance + Top-up */}
      <div className="flex flex-col gap-5 w-full lg:w-[300px] shrink-0">
        {/* Balance card */}
        <DashboardCard>
          <div className="flex flex-col items-center text-center">
            <div className="flex justify-center items-center bg-glace-yellow rounded-full size-16 mb-4">
              <Wallet className="size-8 text-[#388dab]" strokeWidth={2} />
            </div>
            <p className="text-white/80 text-[17px] mb-1">الرصيد الحالي</p>
            <p className="font-bold text-[52px] leading-none">{balance.toFixed(2)}</p>
            <p className="text-[21px] mt-1">شيكل ₪</p>
          </div>
        </DashboardCard>

        {/* Top-up */}
        <DashboardCard title="شحن الرصيد" icon={Wallet}>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {TOP_UP_AMOUNTS.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => handleTopUp(amt)}
                className="hover:bg-white/20 py-3 border border-white/50 hover:border-white rounded-full text-[17px] text-white transition-colors cursor-pointer"
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
        </DashboardCard>
      </div>

      {/* Transaction history */}
      <DashboardCard title="سجل المعاملات" icon={TrendingUp} className="flex-1">
        {transactions.length === 0 ? (
          <EmptyState icon={Wallet} message="لا يوجد معاملات بعد" />
        ) : (
          <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto">
            {[...transactions].reverse().map((tx) => (
              <div key={tx.id} className="flex justify-between items-center pb-3 border-b border-white/20">
                <div className="flex items-center gap-3">
                  <div className={`flex justify-center items-center rounded-full size-9 ${tx.type === "credit" ? "bg-green-500/30" : "bg-red-500/30"}`}>
                    {tx.type === "credit"
                      ? <TrendingUp size={18} className="text-green-300" />
                      : <TrendingDown size={18} className="text-red-300" />}
                  </div>
                  <div>
                    <p className="text-[15px] font-bold">{tx.label}</p>
                    <p className="text-white/60 text-[12px]">
                      {new Date(tx.date).toLocaleString("ar-PS", { dateStyle: "short", timeStyle: "short" })}
                    </p>
                  </div>
                </div>
                <p className={`text-[17px] font-bold ${tx.type === "credit" ? "text-green-300" : "text-red-300"}`}>
                  {tx.type === "credit" ? "+" : "-"}{tx.amount.toFixed(2)} ₪
                </p>
              </div>
            ))}
          </div>
        )}
      </DashboardCard>
    </div>
  );
}
