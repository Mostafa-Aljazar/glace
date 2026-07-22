import { Cairo } from "next/font/google";
import type { Metadata } from "next";
import SwaggerUIClient from "./SwaggerUIClient";
import "./swagger.css";

const cairo = Cairo({
  subsets: ["latin", "arabic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Glace API — Swagger",
  description: "OpenAPI documentation for the Glace API",
};

export default function SwaggerPage() {
  return (
    <div className={`swagger-page ${cairo.className}`} dir="ltr" lang="en">
      <SwaggerUIClient />
    </div>
  );
}
