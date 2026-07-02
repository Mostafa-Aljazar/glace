import type { Metadata } from "next";
import EventsClientPage from "@/components/Events/EventsClientPage";

export const metadata: Metadata = {
  title: "الفعاليات و المناسبات | جلاسيه الأمير",
  description: "تصفح أحدث فعاليات ومناسبات جلاسيه الأمير",
};

export default function EventsPage() {
  return <EventsClientPage />;
}
