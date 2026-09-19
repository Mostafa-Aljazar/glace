import type { StoreStatusResponse, StoreSchedule } from "@/hooks/store";

/**
 * Convert API schedule (array of day schedules) into slots for a given day.
 * Used to replace hardcoded getScheduleDays() with real backend schedule.
 */
export function generateScheduleSlotsFromAPI(
  schedule: StoreSchedule[],
  daysToOffer: number = 3,
  now: Date = new Date(),
): Array<{ date: string; label: string; slots: string[] }> {
  const SLOT_INTERVAL_MIN = 15;
  const MIN_LEAD_MIN = 30;

  function pad(n: number) {
    return n.toString().padStart(2, "0");
  }

  function timeToMinutes(timeStr: string): number {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  }

  function minutesToTime(mins: number): string {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${pad(h)}:${pad(m)}`;
  }

  function ceilToInterval(minutesSinceMidnight: number) {
    return Math.ceil(minutesSinceMidnight / SLOT_INTERVAL_MIN) * SLOT_INTERVAL_MIN;
  }

  function slotsForDaySchedule(
    daySchedule: StoreSchedule,
    isToday: boolean,
  ): string[] {
    if (!daySchedule.enabled || daySchedule.allDay) {
      return [];
    }

    const openMin = timeToMinutes(daySchedule.open);
    const closeMin = timeToMinutes(daySchedule.close);

    let startMin = openMin;
    if (isToday) {
      const nowMin = now.getHours() * 60 + now.getMinutes();
      startMin = Math.max(openMin, ceilToInterval(nowMin + MIN_LEAD_MIN));
    }

    const slots: string[] = [];
    for (let m = startMin; m <= closeMin; m += SLOT_INTERVAL_MIN) {
      slots.push(minutesToTime(m));
    }
    return slots;
  }

  function getDayLabel(d: Date, isToday: boolean): string {
    if (isToday) return "اليوم";
    return d.toLocaleDateString("ar", {
      weekday: "long",
      day: "numeric",
      month: "short",
    });
  }

  function toDateKey(d: Date): string {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  const days: Array<{ date: string; label: string; slots: string[] }> = [];
  let cursor = new Date(now);
  cursor.setHours(0, 0, 0, 0);
  let guard = 0;

  while (days.length < daysToOffer && guard < 30) {
    guard++;
    const isToday = toDateKey(cursor) === toDateKey(now);
    const dayOfWeek = cursor.getDay(); // 0=Sun, 5=Fri, 6=Sat

    // Find matching schedule for this day
    const daySchedule = schedule.find((s) => {
      const dayMap: Record<number, string> = {
        0: "sun",
        1: "mon",
        2: "tue",
        3: "wed",
        4: "thu",
        5: "fri",
        6: "sat",
      };
      return s.day === dayMap[dayOfWeek];
    });

    if (daySchedule) {
      const slots = slotsForDaySchedule(daySchedule, isToday);
      if (slots.length > 0) {
        days.push({
          date: toDateKey(cursor),
          label: getDayLabel(cursor, isToday),
          slots,
        });
      }
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}

/**
 * Check if store/delivery is open based on API status.
 * Considers both schedule and override flags.
 */
export function isStoreOrDeliveryOpen(
  statusDetails: StoreStatusResponse["store"] | StoreStatusResponse["delivery"],
): boolean {
  return statusDetails.open;
}

/**
 * Get the next time when store/delivery will be open.
 * Returns ISO string or null if no info available.
 */
export function getNextOpenTime(
  statusDetails: StoreStatusResponse["store"] | StoreStatusResponse["delivery"],
): string | null {
  if (statusDetails.opensAt) {
    return statusDetails.opensAt;
  }
  return null;
}

/**
 * Get the time when store/delivery will close.
 * Returns ISO string or null if no info available.
 */
export function getCloseTime(
  statusDetails: StoreStatusResponse["store"] | StoreStatusResponse["delivery"],
): string | null {
  if (statusDetails.closesAt) {
    return statusDetails.closesAt;
  }
  return null;
}
