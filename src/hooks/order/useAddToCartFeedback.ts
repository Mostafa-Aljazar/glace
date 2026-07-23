"use client";

import { useCallback, useState } from "react";

/**
 * The "added to cart" success flash + validation-message timeout pattern
 * that used to be copy-pasted in nearly every order page.
 */
export function useAddToCartFeedback() {
  const [addedToCart, setAddedToCart] = useState(false);
  const [validationMsg, setValidationMsg] = useState("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showValidation = useCallback((msg: string) => {
    setValidationMsg(msg);
    window.setTimeout(() => setValidationMsg(""), 3000);
  }, []);

  const markAdded = useCallback((toastMessage?: string) => {
    setAddedToCart(true);
    window.setTimeout(() => setAddedToCart(false), 2000);
    if (toastMessage) {
      setToastMsg(toastMessage);
      window.setTimeout(
        () => setToastMsg((current) => (current === toastMessage ? null : current)),
        3500,
      );
    }
  }, []);

  const dismissToast = useCallback(() => setToastMsg(null), []);

  return { addedToCart, validationMsg, showValidation, markAdded, toastMsg, dismissToast };
}
