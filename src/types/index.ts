import type { StaticIMG } from "@/assets/images";
import type React from "react";
import type { HomeImage } from "./home.types";

export interface NavItem {
  label: string;
  /** Optional shorter label for the compact desktop header bar. */
  shortLabel?: string;
  href: string;
  icon?: React.ElementType;
}
export type { ISlideData, HomeImage, IHomePageData } from "./home.types";
export type { IEvent, IEventsListResponse, EventImage } from "./events.types";
export type {
  IContactRequest,
  IContactResponse,
} from "./contact.types";

/** @deprecated Prefer `IContactRequest` */
export type ContactFormValues = import("./contact.types").IContactRequest & {
  subject?: string;
};

export interface EventCard {
  id: number;
  title: string;
  image: HomeImage;
  href: string;
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

export interface PhoneFormValues {
  phone: string;
}

export interface RegisterPhoneFormValues {
  fullName: string;
  phone: string;
}

export interface OtpFormValues {
  code: string;
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
