import { guestApi } from "@/lib/axios";
import type { IContactRequest, IContactResponse } from "@/types/contact.types";

function isContactResponse(value: unknown): value is IContactResponse {
  if (!value || typeof value !== "object") return false;
  const data = value as Partial<IContactResponse>;
  return typeof data.success === "boolean" && typeof data.message === "string";
}

/**
 * Sends a contact message via `POST /contact`.
 *
 * Rejects on any failure — a delivery the backend never accepted must never be
 * reported to the customer as sent. Callers surface the error via the mutation.
 */
export async function sendContactMessage(
  payload: IContactRequest,
): Promise<IContactResponse> {
  const res = await guestApi.post<IContactResponse>("/contact", payload);

  if (!isContactResponse(res?.data)) {
    throw new Error("Invalid /contact response shape");
  }
  if (!res.data.success) {
    throw new Error(res.data.message || "تعذّر إرسال الرسالة");
  }

  return res.data;
}

export default sendContactMessage;
