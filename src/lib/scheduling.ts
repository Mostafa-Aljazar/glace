const SLOT_INTERVAL_MIN = 15;
const OPEN_HOUR = 11; // 11:00
const CLOSE_HOUR = 23; // 11:00 PM
const FRIDAY = 5; // Date#getDay()
const DAYS_TO_OFFER = 3;
const MIN_LEAD_MIN = 30;

/** Manual kill-switch until the backend exposes a real "is delivery open"
 *  endpoint/flag — flip this to simulate the store pausing delivery. */
const DELIVERY_MANUALLY_DISABLED = false;

/** Whether delivery can be selected right now: blocked on Fridays (no
 *  delivery day) and by the manual override above, standing in for a
 *  future backend-driven pause. */
export function isDeliveryAvailableToday(now: Date = new Date()) {
  if (DELIVERY_MANUALLY_DISABLED) return false;
  return now.getDay() !== FRIDAY;
}

export interface ScheduleDay {
  /** yyyy-mm-dd, used as a stable key/value */
  date: string;
  label: string;
  slots: string[];
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

/** "14:15" -> "2:15 م", "09:00" -> "9:00 ص". */
export function formatTime12h(time: string) {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "م" : "ص";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${pad(m)} ${period}`;
}

function toDateKey(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function dayLabel(d: Date, isToday: boolean) {
  if (isToday) return "اليوم";
  return d.toLocaleDateString("ar", { weekday: "long", day: "numeric", month: "short" });
}

/** Rounds up to the next SLOT_INTERVAL_MIN boundary. */
function ceilToInterval(minutesSinceMidnight: number) {
  return Math.ceil(minutesSinceMidnight / SLOT_INTERVAL_MIN) * SLOT_INTERVAL_MIN;
}

function slotsForDay(d: Date, now: Date, isToday: boolean): string[] {
  const openMin = OPEN_HOUR * 60;
  const closeMin = CLOSE_HOUR * 60;

  let startMin = openMin;
  if (isToday) {
    const nowMin = now.getHours() * 60 + now.getMinutes();
    startMin = Math.max(openMin, ceilToInterval(nowMin + MIN_LEAD_MIN));
  }

  const slots: string[] = [];
  for (let m = startMin; m <= closeMin; m += SLOT_INTERVAL_MIN) {
    slots.push(`${pad(Math.floor(m / 60))}:${pad(m % 60)}`);
  }
  return slots;
}

/** Builds up to DAYS_TO_OFFER upcoming days (skipping Fridays — no delivery)
 *  that have at least one bookable slot, starting from `now`. */
export function getScheduleDays(now: Date = new Date()): ScheduleDay[] {
  const days: ScheduleDay[] = [];
  let cursor = new Date(now);
  let guard = 0;

  while (days.length < DAYS_TO_OFFER && guard < 14) {
    guard++;
    const isToday = toDateKey(cursor) === toDateKey(now);

    if (cursor.getDay() !== FRIDAY) {
      const slots = slotsForDay(cursor, now, isToday);
      if (slots.length > 0) {
        days.push({
          date: toDateKey(cursor),
          label: dayLabel(cursor, isToday),
          slots,
        });
      }
    }

    cursor = new Date(cursor);
    cursor.setDate(cursor.getDate() + 1);
    cursor.setHours(0, 0, 0, 0);
  }

  return days;
}
