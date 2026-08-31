import type { PaymentMethod } from "@/store/orderStore";

/** The store's own receiving account for one bank-transfer/wallet payment
 *  method — shown to the customer so they can pay externally, then upload
 *  proof of transfer. */
export interface MerchantPaymentAccount {
  method: PaymentMethod;
  /** Static placeholder QR — swap for a real exported QR once the merchant
   *  accounts below are replaced with real ones. */
  qrImage: string;
  holderName: string;
  /** Only set for bank-transfer methods (e.g. بنك فلسطين), not wallet apps. */
  bankName?: string;
  primaryLabel: string;
  primaryValue: string;
  /** Optional second copyable field — e.g. the IBAN alongside the account
   *  number for bop, for banks that only accept IBAN transfers. */
  secondaryLabel?: string;
  secondaryValue?: string;
}

/** Hardcoded demo data — these are placeholder account numbers, not real
 *  merchant accounts. Shaped so a future `GET /payment-accounts` response
 *  can drop in directly, matching the pattern in deliveryZones.ts. */
const MERCHANT_PAYMENT_ACCOUNTS: MerchantPaymentAccount[] = [
  {
    method: "bop",
    qrImage: "/images/qr/bop-placeholder.svg",
    holderName: "شركة ديبو للنقل وحلول التجارة",
    bankName: "بنك فلسطين",
    primaryLabel: "رقم الحساب",
    primaryValue: "4100166993000000",
    secondaryLabel: "رقم الآيبان (IBAN)",
    secondaryValue: "PS52PALS045441001660993000000",
  },
  {
    method: "paypal",
    qrImage: "/images/qr/palpay-placeholder.svg",
    holderName: "صالح منصور المدني",
    primaryLabel: "رقم الجوال",
    primaryValue: "0592099777",
    secondaryLabel: "رقم الآيبان (IBAN)",
    secondaryValue: "PS76PALS045441002210993000000",
  },
  {
    method: "jawwal-manual",
    qrImage: "/images/qr/jawwal-placeholder.svg",
    holderName: "صالح منصور المدني",
    primaryLabel: "رقم الجوال",
    primaryValue: "0599178899",
    secondaryLabel: "رقم الآيبان (IBAN)",
    secondaryValue: "PS31PALS045441003330993000000",
  },
  {
    method: "jawwal",
    qrImage: "/images/qr/jawwal-placeholder.svg",
    holderName: "صالح منصور المدني",
    primaryLabel: "رقم الجوال",
    primaryValue: "0599178899",
    secondaryLabel: "رقم الآيبان (IBAN)",
    secondaryValue: "PS08PALS045441004440993000000",
  },
];

export function findMerchantPaymentAccount(
  method: PaymentMethod
): MerchantPaymentAccount | undefined {
  return MERCHANT_PAYMENT_ACCOUNTS.find((a) => a.method === method);
}
