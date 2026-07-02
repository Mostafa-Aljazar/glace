import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WalletTransaction {
  id: string;
  date: string;
  amount: number;
  type: "credit" | "debit";
  label: string;
}

interface WalletState {
  balance: number;
  transactions: WalletTransaction[];
  topUp: (amount: number, label?: string) => void;
  deduct: (amount: number, label?: string) => boolean;
}

function genId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function nowISO() {
  return new Date().toISOString();
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      balance: 0,
      transactions: [],

      topUp: (amount, label = "شحن رصيد") => {
        if (amount <= 0) return;
        set((state) => ({
          balance: state.balance + amount,
          transactions: [
            {
              id: genId(),
              date: nowISO(),
              amount,
              type: "credit",
              label,
            },
            ...state.transactions,
          ],
        }));
      },

      deduct: (amount, label = "دفع طلب") => {
        if (get().balance < amount) return false;
        set((state) => ({
          balance: state.balance - amount,
          transactions: [
            {
              id: genId(),
              date: nowISO(),
              amount,
              type: "debit",
              label,
            },
            ...state.transactions,
          ],
        }));
        return true;
      },
    }),
    { name: "glace-wallet" }
  )
);
