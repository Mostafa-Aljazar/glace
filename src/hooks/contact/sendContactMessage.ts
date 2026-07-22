import { guestApi } from "@/lib/axios";
import { FAKE_CONTACT_SUBMIT_RESPONSE } from "@/data/fake-data/contact";
import type {
  IContactRequest,
  IContactResponse,
} from "@/types/contact.types";

function isContactResponse(value: unknown): value is IContactResponse {
  if (!value || typeof value !== "object") return false;
  const data = value as Partial<IContactResponse>;
  return typeof data.success === "boolean" && typeof data.message === "string";
}

/**
 * Sends a contact message via `POST /contact`.
 * Falls back to a successful fake response when the backend is unavailable.
 */
export async function sendContactMessage(
  payload: IContactRequest,
): Promise<IContactResponse> {
  try {
    const res = await guestApi.post<IContactResponse>("/contact", payload);
    if (isContactResponse(res?.data)) return res.data;
    return FAKE_CONTACT_SUBMIT_RESPONSE;
  } catch (e) {
    console.error("[sendContactMessage]", e);
    return FAKE_CONTACT_SUBMIT_RESPONSE;
  }
}

/** @deprecated Prefer `sendContactMessage` */
export const submitContact = sendContactMessage;

export default sendContactMessage;
