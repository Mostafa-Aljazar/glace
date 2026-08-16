export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://glaceelameer.com"
).replace(/\/$/, "");

export const SITE_NAME = "جلاسيه الأمير";
export const SITE_NAME_EN = "Glace El-Ameer";
export const SITE_TAGLINE = "أفضل بوظة وحلويات في فلسطين — نصنع السعادة كل يوم";
export const SITE_DESCRIPTION =
  "جلاسيه الأمير لإنتاج الآيس كريم والبراد والعصائر والحلويات — تشكيلة واسعة من نكهات الآيس كريم والحلويات الطازجة في فلسطين، مع إمكانية الطلب أونلاين والتوصيل.";

// Routes that are actually live for the public and worth indexing.
// Keep in sync with the LIVE list in src/middleware.ts.
export const PUBLIC_ROUTES = ["/", "/menu", "/offers", "/events", "/contact"];
