"use client";

import { useMutation } from "@tanstack/react-query";
import { userApi } from "@/lib/axios";

interface EmailSummaryInput {
  id: string;
  email: string;
}

/** Emails the order summary to any address the customer types — not tied
 *  to the account's own email. */
export function useEmailOrderSummary() {
  return useMutation({
    mutationFn: ({ id, email }: EmailSummaryInput) =>
      userApi
        .post<{ sent: boolean }>(`/orders/${id}/email-summary`, { email })
        .then((r) => r.data),
  });
}
