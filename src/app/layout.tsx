import type { Metadata } from "next";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";

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
    <html lang="ar" dir="rtl">
      <head>
        <link rel="stylesheet" href="https://unpkg.com/boxicons@latest/css/boxicons.min.css" />
      </head>
      <body className="">
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
