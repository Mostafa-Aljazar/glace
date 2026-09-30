import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";
import LoadingPage from "@/components/Common/LoadingPage";
import ServiceWorkerRegister from "@/components/Common/ServiceWorkerRegister";
import OfflineOverlay from "@/components/Common/OfflineOverlay";
import InstallPwaButton from "@/components/Common/InstallPwaButton";
import JsonLd from "@/components/Common/JsonLd";
import {
  SITE_URL,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_DESCRIPTION,
  SITE_OG_IMAGE,
} from "@/lib/site";
import { OG_LOCALE, organizationJsonLd, websiteJsonLd } from "@/lib/seo";

// Search Console / Bing Webmaster ownership tokens, set per deployment.
const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
const bingVerification = process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "جلاسيه الأمير",
    "جلاسيه الامير",
    "آيس كريم غزة",
    "بوظة غزة",
    "حلويات غزة",
    "توصيل آيس كريم غزة",
    "آيس كريم فلسطين",
    "بوظة فلسطين",
    "حلويات فلسطين",
    "براد فلسطين",
    "عصائر طبيعية",
    "Glace El-Ameer",
    "Palestine ice cream",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "food",
  // No `alternates.canonical` here: metadata is inherited, so a root canonical
  // would tell Google every page is a copy of the home page. Public pages set
  // their own through `pageMetadata()` in src/lib/seo.ts.
  openGraph: {
    type: "website",
    locale: OG_LOCALE,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: SITE_OG_IMAGE,
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
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  ...(googleVerification || bingVerification
    ? {
        verification: {
          ...(googleVerification ? { google: googleVerification } : {}),
          ...(bingVerification
            ? { other: { "msvalidate.01": bingVerification } }
            : {}),
        },
      }
    : {}),
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: SITE_NAME,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#1c6b88",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <Script
          id="splash-seen-check"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `try{if(sessionStorage.getItem("glace-splash-seen")==="1")document.documentElement.dataset.splashSeen="1"}catch(e){}`,
          }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `html[data-splash-seen="1"] [data-app-splash]{display:none!important}html{color-scheme:light!important}`,
          }}
        />
      </head>
      <body className="">
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
        <QueryProvider>
          <LoadingPage />
          {children}
        </QueryProvider>
        <ServiceWorkerRegister />
        <OfflineOverlay />
        <InstallPwaButton />
      </body>
    </html>
  );
}
