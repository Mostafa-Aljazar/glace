import Image from "next/image";
import Link from "next/link";
import { logo, bgFooter } from "@/assets/images";

const footerLinks = [
  { label: "الرئيسية", href: "/" },
  { label: "المنيو", href: "/menu" },
  { label: "العروض", href: "/offers" },
  { label: "الفعاليات", href: "/events" },
  { label: "من نحن", href: "/#about" },
  { label: "تواصل معنا", href: "/contact" },
];

const socialLinks = [
  {
    label: "تيليغرام",
    href: "https://t.me/glaceelameer",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8-1.7 8.01c-.12.56-.46.7-.93.43l-2.57-1.9-1.24 1.19c-.14.14-.26.26-.53.26l.19-2.63 4.83-4.36c.21-.19-.05-.29-.32-.1L7.9 14.49l-2.52-.79c-.55-.17-.56-.55.12-.82l9.86-3.8c.45-.17.85.11.28.72z" />
      </svg>
    ),
  },
  {
    label: "واتساب",
    href: "https://wa.me/972592226522",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.116.551 4.103 1.515 5.83L0 24l6.335-1.654A11.955 11.955 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.893 0-3.673-.513-5.201-1.407L3.6 21.6l1.04-3.107A9.956 9.956 0 0 1 2 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z" />
      </svg>
    ),
  },
  {
    label: "انستغرام",
    href: "https://www.instagram.com/glaceelameer/",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
      </svg>
    ),
  },
  {
    label: "فيسبوك",
    href: "https://www.facebook.com/GlaceElameer",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.462h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
      </svg>
    ),
  },
  {
    label: "تيك توك",
    href: "https://www.tiktok.com/@glace_elameer",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16.6 5.82c-.99-.98-1.6-2.32-1.6-3.82h-3.45v13.79c0 1.87-1.52 3.4-3.4 3.4a3.4 3.4 0 0 1-3.4-3.4 3.4 3.4 0 0 1 3.4-3.4c.35 0 .69.05 1.01.15V8.85a6.84 6.84 0 0 0-1.01-.08 6.85 6.85 0 0 0-6.85 6.85A6.85 6.85 0 0 0 8.15 22.5a6.85 6.85 0 0 0 6.85-6.85V9.4a9.1 9.1 0 0 0 5.32 1.7V7.65a5.4 5.4 0 0 1-3.72-1.83z" />
      </svg>
    ),
  },
];

interface FooterProps {
  withBg?: boolean;
}

export default function Footer({ withBg = true }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={`relative z-[1] -mt-1 overflow-hidden ${withBg ? "bg-white" : ""}`}
    >
      {/* Wave keeps mobile drip density on wider screens by tiling a mirror copy */}
      <div className="relative z-0 w-full">
        <div className="flex w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bgFooter.src}
            alt=""
            className="block w-full md:w-1/2 lg:w-1/3 h-auto pointer-events-none select-none"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bgFooter.src}
            alt=""
            className="hidden md:block w-1/2 lg:w-1/3 h-auto -scale-x-100 pointer-events-none select-none"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bgFooter.src}
            alt=""
            className="hidden lg:block w-1/3 h-auto pointer-events-none select-none"
          />
        </div>
        <div
          aria-hidden
          className="absolute inset-x-0 top-[58%] bottom-0"
          style={{ background: "#51C9F4" }}
        />
      </div>

      <div
        className="relative z-10 -mt-px"
        style={{
          background:
            "linear-gradient(to bottom, #51C9F4 0%, #2f8fb3 45%, #1c6b88 100%)",
        }}
      >
        <div className="flex flex-col items-center mx-auto px-4 pt-2 sm:pt-3 pb-24 lg:pb-8 w-[90%] max-w-5xl text-white">
          {/* Logo */}
          <Image
            src={logo}
            alt="جلاسيه الأمير"
            width={180}
            height={70}
            className="drop-shadow-xl mb-2.5 w-36 sm:w-44 object-contain"
          />

          {/* Tagline */}
          <p className="mb-6 text-[13px] sm:text-[15px] text-white text-center tracking-wide">
            أفضل بوظة وحلويات في فلسطين — نصنع السعادة كل يوم
          </p>

          {/* Yellow accent divider */}
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-glace-yellow w-10 h-px" />
            <div className="bg-glace-yellow rounded-full w-1.5 h-1.5" />
            <div className="bg-glace-yellow w-10 h-px" />
          </div>

          {/* Nav links */}
          <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2 m-0 mb-6 p-0 list-none">
            {footerLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-[15px] text-white sm:text-[16px] hover:text-glace-yellow transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Social icons */}
          <div className="flex justify-center items-center gap-2.5 mb-6">
            {socialLinks.map((s) => (
              <Link
                key={s.label}
                href={s.href}
                target="_blank"
                aria-label={s.label}
                className="flex justify-center items-center bg-white/20 hover:bg-glace-yellow border border-white/50 hover:border-glace-yellow rounded-full w-10 h-10 text-white hover:text-[#0e3749] transition-all duration-200"
              >
                {s.icon}
              </Link>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="flex sm:flex-row flex-col justify-between items-center gap-2 pt-4 border-white/25 border-t w-full text-[12px] text-white/90">
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="tel:+970592226522"
                className="flex items-center gap-1.5 hover:text-glace-yellow transition-colors"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                </svg>
                970592226522+
              </a>
              <a
                href="mailto:info@glaceelameer.com"
                className="flex items-center gap-1.5 hover:text-glace-yellow transition-colors"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
                info@glaceelameer.com
              </a>
            </div>
            <p>جميع الحقوق محفوظة © جلاسيه الأمير {currentYear}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
