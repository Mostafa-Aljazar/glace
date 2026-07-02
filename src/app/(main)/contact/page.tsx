import type { Metadata } from "next";
import ContactClientPage from "@/components/Contact/ContactClientPage";

export const metadata: Metadata = {
  title: "تواصل معنا | جلاسيه الأمير",
};

export default function ContactPage() {
  return <ContactClientPage />;
}
