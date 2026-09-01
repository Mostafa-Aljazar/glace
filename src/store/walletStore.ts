import { create } from "zustand";

export type TopUpMethod = "bop" | "paypal" | "jawwal" | "jawwal-manual" | "visa";

export interface WalletTransaction {
  id: string;
  date: string;
  amount: number;
  type: "credit" | "debit";
  label: string;
  /** Which payment method produced this transaction, when known — e.g. the
   *  bank/wallet a top-up came through, or "cash" for a change credit. */
  method?: TopUpMethod | "cash" | "wallet";
  /** Carried over from the top-up request that produced this transaction,
   *  when there was one — lets "سجل المعاملات" show the same proof of
   *  transfer that was reviewed on "طلبات الشحن". */
  receiptImage?: string;
}
/** "قيد المراجعة" matches the same wording used for orders under staff
 *  review (orderStore's OrderStatus) — a submitted top-up sits here until
 *  someone on the dashboard checks the receipt. */
export type TopUpRequestStatus = "قيد المراجعة" | "مكتمل";

/** A bank/wallet-transfer top-up the customer submitted — either with a
 *  receipt/fallback note (bop, paypal, jawwal-manual) or a phone number
 *  (jawwal auto) — starts unverified until reviewed on the dashboard. */
export interface TopUpRequest {
  id: string;
  amount: number;
  method: TopUpMethod;
  status: TopUpRequestStatus;
  createdAt: string;
  receiptImage?: string;
  receiptNote?: string;
  /** Only set for "jawwal" (auto) — the number the customer paid from. */
  phone?: string;
}

interface WalletState {
  balance: number;
  /** Overwrites the balance — used by `useWallet()` to sync a real
   *  `GET /wallet` response into the store. Transaction history is
   *  paginated (`GET /wallet/transactions`) and read straight off
   *  `useWalletTransactions()`, not mirrored here. */
  setBalance: (balance: number) => void;
}

export const useWalletStore = create<WalletState>()((set) => ({
  balance: 0,

  setBalance: (balance) => set({ balance }),
}));
