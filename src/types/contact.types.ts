/** Contact form submit body — matches `POST /contact`. */
export interface IContactRequest {
  name: string;
  phone: string;
  email: string;
  message: string;
  /** Optional — not shown on the current UI form. */
  subject?: string;
}

/** Contact form submit response — matches `POST /contact`. */
export interface IContactResponse {
  success: boolean;
  message: string;
}
