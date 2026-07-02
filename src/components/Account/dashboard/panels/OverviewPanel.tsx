"use client";

import { ShoppingBag, Receipt, Wallet, ShoppingCart, LayoutDashboard } from "lucide-react";
import { useOrderStore, type OrderStatus } from "@/store/orderStore";
import { useWalletStore } from "@/store/walletStore";
import { useCartStore } from "@/store/cartStore";
import DashboardCard from "../shared/DashboardCard";
import StatCard from "../shared/StatCard";
import EmptyState from "../shared/EmptyState";

const STATUS_COLORS: Record<OrderStatus, string> = {
  "قيد المراجعة": "bg-yellow-500/30 text-yellow-200",
  "قيد التحضير": "bg-blue-500/30 text-blue-200",
  "في الطريق": "bg-purple-500/30 text-purple-200",
  "تم التسليم": "bg-green-500/30 text-green-200",
};

interface Props {
  onGoToOrders: () => void;
  onGoToWallet: () => void;
}

export default function OverviewPanel({ onGoToOrders, onGoToWallet }: Props) {
  const orders = useOrderStore((s) => s.orders);
  const balance = useWalletStore((s) => s.balance);
  const transactions = useWalletStore((s) => s.transactions);
  const cartItems = useCartStore((s) => s.items);

  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);
  const lastOrder = [...orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )[0];
  const lastThreeTx = [...transactions].reverse().slice(0, 3);

  return (
    <div className="flex flex-col gap-6">
      {/* Stat cards — 2×2 grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard label="إجمالي الطلبات" value={orders.length} icon={ShoppingBag} />
        <StatCard label="المبلغ الكلي المنفق" value={`${totalSpent.toFixed(0)} ₪`} icon={Receipt} />
        <StatCard label="رصيد المحفظة" value={`${balance.toFixed(0)} ₪`} icon={Wallet} />
        <StatCard label="السلة الحالية" value={cartItems.length} icon={ShoppingCart} sub="منتجات" />
      </div>

      {/* Recent order + wallet snapshot */}
      <div className="flex lg:flex-row flex-col gap-6">
        {/* Recent order */}
        <DashboardCard title="آخر طلب" icon={ShoppingBag} className="flex-1">
          {lastOrder ? (
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-glace-yellow font-bold text-[16px]">{lastOrder.id}</p>
                  <p className="text-white/60 text-[13px] mt-1">
                    {new Date(lastOrder.createdAt).toLocaleDateString("ar-PS", { dateStyle: "long" })}
                  </p>
                </div>
                <span className={`text-[12px] px-3 py-1 rounded-full ${STATUS_COLORS[lastOrder.status]}`}>
                  {lastOrder.status}
                </span>
              </div>
              <p className="text-[22px] font-bold border-t border-white/20 pt-3">{lastOrder.total.toFixed(2)} ₪</p>
              <p className="text-white/60 text-[13px]">{lastOrder.items.length} منتج</p>
              <button
                type="button"
                onClick={onGoToOrders}
                className="mt-1 text-glace-yellow text-[14px] hover:underline cursor-pointer text-right"
              >
                عرض كل الطلبات ←
              </button>
            </div>
          ) : (
            <EmptyState
              icon={ShoppingBag}
              message="لا يوجد طلبات بعد"
              action={{ label: "تصفح المنيو", href: "/menu" }}
            />
          )}
        </DashboardCard>

        {/* Wallet snapshot */}
        <DashboardCard title="محفظتي" icon={Wallet} className="flex-1">
          <div className="flex flex-col gap-3">
            <p className="text-[36px] font-bold leading-none">{balance.toFixed(2)} <span className="text-[18px] font-normal">₪</span></p>
            {lastThreeTx.length === 0 ? (
              <p className="text-white/50 text-[14px]">لا يوجد معاملات بعد</p>
            ) : (
              <div className="flex flex-col gap-2 mt-1">
                {lastThreeTx.map((tx) => (
                  <div key={tx.id} className="flex justify-between text-[14px] pb-2 border-b border-white/10">
                    <span className="text-white/70">{tx.label}</span>
                    <span className={tx.type === "credit" ? "text-green-300" : "text-red-300"}>
                      {tx.type === "credit" ? "+" : "-"}{tx.amount.toFixed(0)} ₪
                    </span>
                  </div>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={onGoToWallet}
              className="mt-1 text-glace-yellow text-[14px] hover:underline cursor-pointer text-right"
            >
              إدارة المحفظة ←
            </button>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}
