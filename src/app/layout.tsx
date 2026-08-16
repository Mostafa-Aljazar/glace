import type { Metadata, Viewport } from "next";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";
import LoadingPage from "@/components/Common/LoadingPage";
import ServiceWorkerRegister from "@/components/Common/ServiceWorkerRegister";
import {
  SITE_URL,
  SITE_NAME,
  SITE_NAME_EN,
  SITE_TAGLINE,
  SITE_DESCRIPTION,
} from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME_EN,
  keywords: [
    "جلاسيه الأمير",
    "آيس كريم فلسطين",
    "بوظة فلسطين",
    "حلويات فلسطين",
    "براد فلسطين",
    "عصائر طبيعية",
    "Glace El-Ameer",
    "Palestine ice cream",
  ],
  authors: [{ name: SITE_NAME }],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ar",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: ["/twitter-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: SITE_NAME_EN,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#1c6b88",
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  alternateName: SITE_NAME_EN,
  url: SITE_URL,
  logo: `${SITE_URL}/icons/icon-512.png`,
  image: `${SITE_URL}/opengraph-image.png`,
  description: SITE_DESCRIPTION,
  email: "info@glaceelameer.com",
  telephone: "+970592226522",
  sameAs: [
    "https://t.me/glaceelameer",
    "https://wa.me/972592226522",
    "https://www.instagram.com/glaceelameer/",
    "https://x.com/GlaceElameer",
    "https://www.facebook.com/GlaceElameer",
    "https://www.linkedin.com/company/el-ameer-icecream-glaceelameer/",
    "https://www.tiktok.com/@glace_elameer",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/boxicons@latest/css/boxicons.min.css"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(sessionStorage.getItem("glace-splash-seen")==="1")document.documentElement.dataset.splashSeen="1"}catch(e){}`,
          }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `html[data-splash-seen="1"] [data-app-splash]{display:none!important}`,
          }}
        />
      </head>
      <body className="">
        <QueryProvider>
          <LoadingPage />
          {children}
        </QueryProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
