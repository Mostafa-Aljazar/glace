import type { Metadata } from "next";
import { notFound } from "next/navigation";
import EventDetailClientPage from "@/components/Events/EventDetailClientPage";
import { EVENTS } from "@/data/Events";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return EVENTS.map((ev) => ({ id: String(ev.id) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const event = EVENTS.find((e) => e.id === Number(id));
  if (!event) return { title: "الفعالية | جلاسيه الأمير" };
  return {
    title: `${event.title} | جلاسيه الأمير`,
    description: event.description,
  };
}

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params;
  const event = EVENTS.find((e) => e.id === Number(id));
  if (!event) notFound();
  return <EventDetailClientPage id={event.id} />;
}
