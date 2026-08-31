import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TopUpMethod = "bop" | "paypal" | "jawwal" | "jawwal-manual";

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
 *  (jawwal auto) — starts unverified, same pattern as RECEIPT_METHODS
 *  orders in orderStore. No backend exists to auto-verify these, so they
 *  stay "قيد المراجعة" until manually resolved. */
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
  transactions: WalletTransaction[];
  topUpRequests: TopUpRequest[];
  /** Guards seedMockDataForTesting so it only ever runs once per browser,
   *  even after real transactions/requests exist. */
  mockDataSeeded: boolean;
  topUp: (
    amount: number,
    label?: string,
    receiptImage?: string,
    method?: TopUpMethod | "cash" | "wallet"
  ) => void;
  deduct: (amount: number, label?: string) => boolean;
  /** Submits a bank/wallet-transfer top-up request — does not credit the
   *  balance, since nothing here verifies the transfer actually happened. */
  submitTopUpRequest: (
    amount: number,
    method: TopUpMethod,
    details: { receiptImage?: string; receiptNote?: string; phone?: string }
  ) => string;
  /** Dev-only: adds mock data so the UI isn't empty during local testing.
   *  Runs at most once per browser, tracked via mockDataSeeded rather than
   *  checking for empty lists, so it still works once real data exists. */
  seedMockDataForTesting: () => void;
  /** Test-only stand-in for a real approval flow (no admin panel exists):
   *  marks a top-up request "مكتمل" and credits the balance, carrying its
   *  method/receipt into the resulting "سجل المعاملات" transaction. */
  approveTopUpRequest: (id: string) => void;
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
      topUpRequests: [],
      mockDataSeeded: false,

      topUp: (amount, label = "شحن رصيد", receiptImage, method) => {
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
              receiptImage,
              method,
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

      submitTopUpRequest: (amount, method, details) => {
        const id = genId();
        const request: TopUpRequest = {
          id,
          amount,
          method,
          status: "قيد المراجعة",
          createdAt: nowISO(),
          ...details,
        };
        set((state) => ({ topUpRequests: [request, ...state.topUpRequests] }));
        return id;
      },

      approveTopUpRequest: (id) => {
        const request = get().topUpRequests.find((r) => r.id === id);
        if (!request || request.status === "مكتمل") return;

        set((state) => ({
          topUpRequests: state.topUpRequests.map((r) =>
            r.id === id ? { ...r, status: "مكتمل" } : r
          ),
          balance: state.balance + request.amount,
          transactions: [
            {
              id: genId(),
              date: nowISO(),
              amount: request.amount,
              type: "credit",
              label: "تم الشحن",
              method: request.method,
              receiptImage: request.receiptImage,
            },
            ...state.transactions,
          ],
        }));
      },

      seedMockDataForTesting: () => {
        if (get().mockDataSeeded) return;

        const hoursAgo = (h: number) =>
          new Date(Date.now() - h * 3600_000).toISOString();
        const bankLabels: Record<TopUpMethod, string> = {
          bop: "بنك فلسطين",
          paypal: "بال باي",
          jawwal: "جوال باي",
          "jawwal-manual": "جوال باي",
        };
        const makeReceipt = (method: TopUpMethod, amount: number) =>
          "data:image/svg+xml;charset=utf-8," +
          encodeURIComponent(
            `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400">
              <rect width="300" height="400" fill="#f5f5f5"/>
              <rect x="20" y="20" width="260" height="60" fill="#117291"/>
              <text x="150" y="55" font-family="sans-serif" font-size="18" fill="#fff" text-anchor="middle">إشعار تحويل</text>
              <text x="150" y="120" font-family="sans-serif" font-size="14" fill="#333" text-anchor="middle">${bankLabels[method]}</text>
              <text x="150" y="150" font-family="sans-serif" font-size="22" fill="#117291" text-anchor="middle" font-weight="bold">${amount.toFixed(2)} ₪</text>
              <text x="150" y="190" font-family="sans-serif" font-size="12" fill="#666" text-anchor="middle">تمت العملية بنجاح</text>
            </svg>`
          );

        const transactions: WalletTransaction[] = [
          { id: genId(), date: hoursAgo(1), amount: 50, type: "credit", label: "شحن رصيد", receiptImage: makeReceipt("bop", 50), method: "bop" },
          { id: genId(), date: hoursAgo(5), amount: 22.5, type: "debit", label: "دفع طلب #ORD-M3K2", method: "wallet" },
          { id: genId(), date: hoursAgo(20), amount: 3, type: "credit", label: "باقي كاش", method: "cash" },
          { id: genId(), date: hoursAgo(48), amount: 100, type: "credit", label: "شحن رصيد", receiptImage: makeReceipt("jawwal-manual", 100), method: "jawwal-manual" },
          { id: genId(), date: hoursAgo(72), amount: 15.75, type: "debit", label: "دفع طلب #ORD-M2F9", method: "wallet" },
          { id: genId(), date: hoursAgo(96), amount: 40, type: "credit", label: "شحن رصيد", receiptImage: makeReceipt("paypal", 40), method: "paypal" },
        ];
        const topUpRequests: TopUpRequest[] = [
          { id: genId(), amount: 30, method: "bop", status: "قيد المراجعة", createdAt: hoursAgo(2), receiptImage: makeReceipt("bop", 30) },
        ];

        set((s) => ({
          balance: s.balance + 50 + 3 + 100 + 40 - 22.5 - 15.75,
          transactions: [...transactions, ...s.transactions],
          topUpRequests: [...topUpRequests, ...s.topUpRequests],
          mockDataSeeded: true,
        }));
      },
    }),
    { name: "glace-wallet" }
  )
);
