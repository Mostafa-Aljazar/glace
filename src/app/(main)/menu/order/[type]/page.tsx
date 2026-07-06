import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DessertsOrderClientPage from "@/components/Order/DessertsOrderClientPage";
import { DESSERT_CATEGORIES_V2 } from "@/data/OrderData";

interface Props {
  params: Promise<{ type: string }>;
}

const CATEGORY_TITLES: Record<string, string> = {
  pancake: "طلب بان كيك | جلاسيه الأمير",
  waffle: "طلب وافل | جلاسيه الأمير",
  crepe: "طلب كريب | جلاسيه الأمير",
  pizza: "طلب بيتزا جلاسيه | جلاسيه الأمير",
  molten: "طلب مولتن كيك | جلاسيه الأمير",
  "cold-drinks": "طلب مشروبات باردة | جلاسيه الأمير",
  juices: "طلب عصائر طبيعية | جلاسيه الأمير",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type } = await params;
  const title = CATEGORY_TITLES[type] || "طلب | جلاسيه الأمير";
  return { title };
}

export function generateStaticParams() {
  return DESSERT_CATEGORIES_V2.map((cat) => ({ type: cat.id }));
}

export default async function OrderTypePage({ params }: Props) {
  const { type } = await params;

  const categoryExists = DESSERT_CATEGORIES_V2.some((cat) => cat.id === type);
  if (!categoryExists) {
    notFound();
  }

  return <DessertsOrderClientPage initialType={type} />;
}
