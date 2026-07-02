import type { StaticIMG } from "@/assets/images";

export interface NavItem {
  label: string;
  href: string;
}

export interface SlideData {
  manImg: StaticIMG;
  pieceImg: StaticIMG;
  zigzagsImg: StaticIMG;
  titleH1: string;
  titleH2: string;
  bgColor: string;
  headerBgColor: string;
  h1BgColor: string;
  h2BgColor: string;
}

export interface EventCard {
  id: number;
  title: string;
  image: StaticIMG;
  href: string;
}

export interface Opinion {
  id: number;
  name: string;
  text: string;
  image: StaticIMG;
}

export interface Branch {
  id: string;
  label: string;
  mapSrc: string;
  address: string;
  phone: string;
  whatsapp: string;
  weekdayHours: string;
  fridayHours: string;
  borderRadius: string;
}

export type MenuModalType = "table" | "flavors" | "confirmation";

export interface PriceRow {
  label: string;
  classic?: string | number;
  special?: string | number;
  price?: string | number;
}

export interface FlavorCard {
  nameAr: string;
  nameEn: string;
  image: StaticIMG;
}

export type MenuCategory = "ice-cream" | "drinks" | "desserts";

export interface MenuItem {
  id: string;
  name: string;
  image: StaticIMG;
  modalType: MenuModalType;
  category: MenuCategory;
  tableHeaders?: string[];
  priceRows?: PriceRow[];
  flavors?: FlavorCard[];
  orderHref?: string;
  confirmationModal?: boolean;
}

export interface FlavorItem {
  id: number;
  name: string;
  image: StaticIMG;
}

export interface ToppingItem {
  id: number;
  name: string;
  price: number;
}

export interface ContactFormValues {
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
}

export interface LoginFormValues {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterFormValues {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface RestorePasswordFormValues {
  email: string;
}

export interface NewPasswordFormValues {
  password: string;
  confirmPassword: string;
}

export interface JobApplicationFormValues {
  fullName: string;
  email: string;
  phone: string;
  position: string;
  experience: string;
  message: string;
}

export interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  size?: string;
  flavors?: string[];
  price: number;
}
