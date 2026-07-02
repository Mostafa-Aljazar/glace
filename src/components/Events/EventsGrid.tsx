import Image from "next/image";
import Link from "next/link";
import { CalendarX } from "lucide-react";
import type { EventData } from "@/data/Events";

interface EventsGridProps {
  items: EventData[];
}

export default function EventsGrid({ items }: EventsGridProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 bg-white/10 backdrop-blur-[15px] mx-auto mt-4 py-16 rounded-[30px] w-full max-w-150 text-center">
        <div className="flex justify-center items-center bg-white/15 rounded-full size-20">
          <CalendarX className="size-10 text-white" strokeWidth={1.5} />
        </div>
        <h3 className="text-white text-2xl">لا توجد فعاليات حالياً</h3>
        <p className="px-6 text-white/80 text-base">
          تابعنا لمعرفة أحدث فعاليات و مناسبات جلاسيه الأمير
        </p>
      </div>
    );
  }

  return (
    <div className="gap-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-4">
      {items.map((ev) => (
        <Link
          key={ev.id}
          href={`/events/${ev.id}`}
          className="group flex flex-col gap-2.5 mx-auto mb-3.75 w-full max-w-82.5"
        >
          <div className="rounded-[20px] w-full h-50 overflow-hidden">
            <Image
              src={ev.listImage}
              alt={ev.title}
              width={330}
              height={200}
              className="rounded-[20px] w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          </div>
          <h3 className="text-white text-xl sm:text-2xl text-start line-clamp-2 leading-[120%]">
            {ev.title}
          </h3>
        </Link>
      ))}
    </div>
  );
}
