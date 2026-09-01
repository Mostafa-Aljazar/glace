import { userApi } from "@/lib/axios";
import { withMutationFallback } from "@/lib/apiWithFallback";

export interface ApplyCouponResult {
  valid: boolean;
  discount: number;
  message?: string | null;
}

/** Fallback when `/cart/apply-coupon` isn't live yet — the coupon table that
 *  used to live directly inside `cartStore.applyCoupon`. Value is a
 *  percentage off the subtotal, not a fixed shekel amount. */
const VALID_COUPONS: Record<string, number> = {
  "1234": 15,
};

function fakeApplyCoupon(code: string, subtotal: number): ApplyCouponResult {
  const trimmed = code.trim().toUpperCase();
  const percentage = VALID_COUPONS[trimmed] ?? 0;
  const discount = (subtotal * percentage) / 100;
  return {
    valid: discount > 0,
    discount,
    message: discount > 0 ? "تم تطبيق الكوبون" : "الكوبون غير صالح أو منتهي",
  };
}

export async function applyCouponRequest(
  code: string,
  subtotal: number,
): Promise<ApplyCouponResult> {
  return withMutationFallback(
    () =>
      userApi
        .post<ApplyCouponResult>("/cart/apply-coupon", { code, subtotal })
        .then((r) => r.data),
    () => fakeApplyCoupon(code, subtotal),
  );
}
