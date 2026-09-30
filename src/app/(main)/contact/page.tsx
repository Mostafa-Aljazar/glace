import type { Metadata } from "next";
import ContactClientPage from "@/components/Contact/ContactClientPage";
import JsonLd from "@/components/Common/JsonLd";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "تواصل معنا",
  description:
    "تواصل مع جلاسيه الأمير عبر الهاتف أو واتساب أو البريد الإلكتروني أو وسائل التواصل الاجتماعي، يسعدنا الرد على استفساراتكم وطلباتكم",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "تواصل معنا", path: "/contact" }])} />
      <ContactClientPage />
    </>
  );
}
