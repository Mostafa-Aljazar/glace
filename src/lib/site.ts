export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://glaceelameer.com"
).replace(/\/$/, "");

export const SITE_NAME = "جلاسيه الأمير";
export const SITE_NAME_EN = "Glace El-Ameer";
export const SITE_TAGLINE = "أفضل بوظة وحلويات في فلسطين، نصنع السعادة كل يوم";
export const SITE_DESCRIPTION =
  "جلاسيه الأمير لإنتاج الآيس كريم والبراد والعصائر والحلويات، تشكيلة واسعة من نكهات الآيس كريم والحلويات الطازجة في فلسطين مع إمكانية الطلب أونلاين والتوصيل";

export const SITE_EMAIL = "info@glaceelameer.com";
export const SITE_PHONE = "+970592226522";
export const SITE_LOGO = `${SITE_URL}/icons/icon-512.png`;
export const SITE_OG_IMAGE = `${SITE_URL}/opengraph-image.png`;
export const SITE_SOCIAL_LINKS = [
  "https://t.me/glaceelameer",
  "https://wa.me/972592226522",
  "https://www.instagram.com/glaceelameer/",
  "https://x.com/GlaceElameer",
  "https://www.facebook.com/GlaceElameer",
  "https://www.linkedin.com/company/el-ameer-icecream-glaceelameer/",
  "https://www.tiktok.com/@glace_elameer",
];

// Static routes that are live for the public and worth indexing. Product and
// event pages are added to the sitemap from the API (see src/app/sitemap.ts).
export const PUBLIC_ROUTES = ["/", "/menu", "/events", "/contact"];

// Per-visitor or internal routes: disallowed in robots.txt and `noindex`ed.
export const PRIVATE_ROUTES = [
  "/cart",
  "/checkout",
  "/payment",
  "/order-status",
  "/my-account",
  "/favorites",
  "/auth",
  "/coming-soon",
  "/swagger",
  "/api",
];
