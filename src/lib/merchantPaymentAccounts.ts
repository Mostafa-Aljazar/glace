import { guestApi } from "@/lib/axios";
import { withQueryFallback } from "@/lib/apiWithFallback";
import type { PaymentMethod } from "@/store/orderStore";

/** The store's own receiving account for one bank-transfer/wallet payment
 *  method — shown to the customer so they can pay externally, then upload
 *  proof of transfer. */
export interface MerchantPaymentAccount {
  method: PaymentMethod;
  /** True only for `visa` — no online transfer account exists, it can only
   *  be paid on the in-store card terminal. When set, every field below is
   *  absent and the UI shows "pay in-store" copy instead of an account. */
  inStoreOnly?: boolean;
  /** Static placeholder QR — swap for a real exported QR once the merchant
   *  accounts below are replaced with real ones. */
  qrImage?: string;
  holderName?: string;
  /** Only set for bank-transfer methods (e.g. بنك فلسطين), not wallet apps. */
  bankName?: string;
  accountLabel?: string;
  accountValue?: string;
  /** Optional — the IBAN alongside the account/phone number, for banks
   *  that only accept IBAN transfers. */
  iban?: string;
}

/** An account with a real transfer target — excludes `visa`'s
 *  `inStoreOnly` entry, which never has these fields populated. */
export interface TransferPaymentAccount extends MerchantPaymentAccount {
  inStoreOnly?: false;
  qrImage: string;
  holderName: string;
  accountLabel: string;
  accountValue: string;
}

/** Hardcoded placeholder data — each method points at a different receiving
 *  account, not real merchant accounts. Shaped so a future
 *  `GET /payment-accounts` response can drop in directly, matching the
 *  pattern in deliveryZones.ts. Kept only as a fallback while that endpoint
 *  isn't reachable yet — the real call always tries first. */
const MERCHANT_PAYMENT_ACCOUNTS: MerchantPaymentAccount[] = [
  {
    method: "bop",
    qrImage: "/images/qr/bop-placeholder.svg",
    holderName: "شركة ديبو للنقل وحلول التجارة",
    bankName: "بنك فلسطين",
    accountLabel: "رقم الحساب",
    accountValue: "4100166993000000",
    iban: "PS52PALS045441001660993000000",
  },
  {
    method: "paypal",
    qrImage: "/images/qr/palpay-placeholder.svg",
    holderName: "صالح منصور المدني",
    accountLabel: "رقم الجوال",
    accountValue: "0592099777",
    iban: "PS76PALS045441002210993000000",
  },
  {
    method: "jawwal-manual",
    qrImage: "/images/qr/jawwal-placeholder.svg",
    holderName: "محمود عيسى أبو شرخ",
    accountLabel: "رقم الجوال",
    accountValue: "0599178899",
    iban: "PS31PALS045441003330993000000",
  },
  {
    method: "jawwal",
    qrImage: "/images/qr/jawwal-placeholder.svg",
    holderName: "محمود عيسى أبو شرخ",
    accountLabel: "رقم الجوال",
    accountValue: "0598887766",
    iban: "PS08PALS045441004440993000000",
  },
  {
    method: "visa",
    inStoreOnly: true,
  },
];

export function findMerchantPaymentAccount(
  method: PaymentMethod
): MerchantPaymentAccount | undefined {
  return MERCHANT_PAYMENT_ACCOUNTS.find((a) => a.method === method);
}

/** Tries the real `GET /payment-accounts` first; falls back to the hardcoded
 *  placeholder accounts above while the backend endpoint doesn't exist yet. */
export async function fetchPaymentAccounts(): Promise<MerchantPaymentAccount[]> {
  return withQueryFallback(
    () =>
      guestApi
        .get<MerchantPaymentAccount[]>("/payment-accounts")
        .then((r) => r.data),
    () => MERCHANT_PAYMENT_ACCOUNTS,
  );
}
