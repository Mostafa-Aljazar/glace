/** Manual kill-switch until the backend exposes a real "is the shop open"
 *  endpoint/flag — flip this to simulate the shop being closed. */
const STORE_MANUALLY_CLOSED = false;

/** When closed, shown to the customer as the expected reopening time. */
const REOPEN_LABEL = "الاثنين، الساعة 11:00 ص";

export function isStoreOpen() {
  return !STORE_MANUALLY_CLOSED;
}

export function getReopenLabel() {
  return REOPEN_LABEL;
}
