import { IceCream, CupSoda, Cake, GlassWater, Milk, Apple } from "lucide-react";
import type { MenuIconName } from "@/types/menu.types";

const ICONS: Record<MenuIconName, typeof IceCream> = {
  "ice-cream": IceCream,
  "cup-soda": CupSoda,
  cake: Cake,
  "glass-water": GlassWater,
  milk: Milk,
  apple: Apple,
};

export function MenuIcon({
  name,
  ...props
}: { name: MenuIconName } & React.ComponentProps<typeof IceCream>) {
  const Icon = ICONS[name] ?? IceCream;
  return <Icon {...props} />;
}

export default MenuIcon;
