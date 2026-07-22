import type { Metadata } from "next";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";
import LoadingPage from "@/components/Common/LoadingPage";

export const metadata: Metadata = {
  title: "جلاسيه الأمير",
  description: "لإنتاج الآيس كريم و البراد و العصائر و الحلويات",
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
      </body>
    </html>
  );
}
