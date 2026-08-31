/** One named delivery zone — a neighborhood/area with its boundary streets
 *  spelled out so customers can self-identify without needing GPS. */
export interface DeliveryZone {
  id: string;
  name: string;
  /** Boundary streets/landmarks describing the zone's extent, e.g.
   *  "من مفترق العائلات - مفترق اللبابيدي". Shown as a hint under the name. */
  description?: string;
  /** Delivery fee for this zone — 0 until pricing is finalized per zone. */
  fee: number;
}

/** Hardcoded for now — shaped so a future `GET /delivery-zones` response can
 *  drop in directly (same fields), matching the `useMenuAddons`-style
 *  swap already used elsewhere in this codebase. */
const DELIVERY_ZONES: DeliveryZone[] = [
  { id: "hawl-alsaraya", name: "حول السرايا", description: "حول منطقة السرايا", fee: 10 },
  { id: "alramal", name: "الرمال", description: "التشريعي - شارع أحمد عبدالعزيز - شارع الثورة - مفترق الرمال", fee: 10 },
  { id: "tal-alhawa", name: "تل الهوا", description: "شارع الصناعة - مفترق الأزهر - الكتيبة - الأنصار", fee: 0 },
  { id: "aljalaa", name: "الجلاء", description: "شركة جوال - مفترق الغفري - مفترق العيون", fee: 10 },
  { id: "awal-alnasr", name: "اول النصر", description: "شمال مفترق العائلات - مفترق اللبابيدي", fee: 10 },
  { id: "akhr-alnasr", name: "اخر النصر", description: "مفترق اللبابيدي حتى بهلول", fee: 10 },
  { id: "haidar-alabbas", name: "حيدر ومفترق العباس", description: "مفترق التشريعي - مفترق العباس - الأنصار - مفترق الأزهر", fee: 15 },
  { id: "alshate", name: "الشاطئ", fee: 15 },
  { id: "alshate-alshamali", name: "الشاطئ الشمالي وأرض الغول", description: "مفترق أبو عودة، الجامع الأبيض، جامع الخالدي، أبراج الفيروز", fee: 15 },
  { id: "mantiqat-alnafaq", name: "منطقة النفق", fee: 15 },
  { id: "karama", name: "كرامة", fee: 15 },
  { id: "ard-alshanti", name: "أرض الشنطي", fee: 15 },
  { id: "alsinaa", name: "الصناعة", fee: 15 },
  { id: "sharia-alwahda", name: "شارع الوحدة", description: "مفترق العائلات حتى الشعبية", fee: 15 },
  { id: "alshifa", name: "الشفاء", fee: 15 },
  { id: "alyarmouk", name: "اليرموك", fee: 15 },
  { id: "altufah", name: "التفاح", fee: 20 },
  { id: "safatawi", name: "صفطاوي", description: "الصفطاوي", fee: 20 },
  { id: "alsamer-alshaabiya", name: "السامر والشعبية", fee: 20 },
  { id: "alsahaba", name: "الصحابة", fee: 20 },
  { id: "sharia-8", name: "شارع 8", description: "من النابلسي إلى مسجد علي", fee: 20 },
  { id: "sharia-albahr", name: "شارع البحر", description: "من الحسبة إلى النابلسي", fee: 20 },
  { id: "majlis-alwuzaraa", name: "مجلس الوزراء", description: "من كيرفور إلى مسجد مصعب", fee: 20 },
  { id: "altashriei-aljawazat", name: "التشريعي والجوازات", description: "من مفترق أبو طلال إلى الأزهر", fee: 20 },
  { id: "almina", name: "الميناء", description: "مفترق العباس، جامع أبو حصيرة، غرب مفترق حيدر", fee: 20 },
  { id: "alsheikh-radwan", name: "الشيخ رضوان", fee: 20 },
  { id: "alsarukh", name: "الصاروخ", description: "اخر الجلاء ومحيط دوار الصاروخ", fee: 20 },
  { id: "alzeitoun", name: "الزيتون", fee: 20 },
  { id: "alsabra", name: "الصبرة", description: "شارع المغربي وتفرعاته (جنوب الثلاثيني)", fee: 20 },
  { id: "althalathini", name: "الثلاثيني", description: "مفترق الحايك - مفترق عسقولة", fee: 20 },
  { id: "alsaha", name: "الساحة", fee: 20 },
  { id: "aldarj-yafa", name: "الدرج وشارع يافا", fee: 20 },
];

/** Placeholder for a future backend call — kept async so callers don't need
 *  to change when this becomes `fetch("/api/delivery-zones")`. */
export async function fetchDeliveryZones(): Promise<DeliveryZone[]> {
  return DELIVERY_ZONES;
}

export function findDeliveryZone(id: string | undefined): DeliveryZone | undefined {
  if (!id) return undefined;
  return DELIVERY_ZONES.find((z) => z.id === id);
}
