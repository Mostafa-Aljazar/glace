"use client";

import { useMutation } from "@tanstack/react-query";
import sendContactMessage from "@/hooks/contact/sendContactMessage";
import type {
  IContactRequest,
  IContactResponse,
} from "@/types/contact.types";

/**
 * React Query mutation to send a contact message (`POST /contact`).
 *
 * @example
 * const { mutateAsync, isPending } = useSendContactMessage();
 * await mutateAsync({ name, phone, email, message });
 */
export function useSendContactMessage() {
  return useMutation<IContactResponse, Error, IContactRequest>({
    mutationFn: sendContactMessage,
  });
}

/** @deprecated Prefer `useSendContactMessage` */
export function useSubmitContact() {
  return useSendContactMessage();
}
