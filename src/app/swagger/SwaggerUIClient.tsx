"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import "swagger-ui-react/swagger-ui.css";

const SwaggerUI = dynamic(() => import("swagger-ui-react"), {
  ssr: false,
  loading: () => <p className="swagger-loading">Loading Swagger UI…</p>,
});

export default function SwaggerUIClient() {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const page = document.querySelector(".swagger-page") as HTMLElement | null;

    const prevDir = html.getAttribute("dir");
    const prevLang = html.getAttribute("lang");

    html.setAttribute("dir", "ltr");
    html.setAttribute("lang", "en");
    html.classList.add("swagger-docs");
    body.classList.add("swagger-docs");

    const fontFamily = page
      ? getComputedStyle(page).fontFamily
      : '"Cairo", sans-serif';

    const style = document.createElement("style");
    style.id = "swagger-font-override";
    style.textContent = `
      html.swagger-docs,
      html.swagger-docs body,
      html.swagger-docs body *,
      body.swagger-docs,
      body.swagger-docs *,
      .swagger-page,
      .swagger-page *,
      .swagger-ui,
      .swagger-ui * {
        direction: ltr !important;
        text-align: left !important;
        word-spacing: normal !important;
        letter-spacing: normal !important;
        font-style: normal !important;
        font-family: ${fontFamily} !important;
      }
      html.swagger-docs body,
      body.swagger-docs {
        background-color: #ffffff !important;
      }
      /* Keep Models / Schemas section visible and readable */
      .swagger-ui .models {
        display: block !important;
        margin: 24px 0 !important;
      }
      .swagger-ui .model-box,
      .swagger-ui .model {
        font-size: 13px !important;
      }
      .swagger-ui table.model tr.property-row td {
        padding: 6px 8px !important;
        vertical-align: top !important;
      }
      .swagger-ui .example,
      .swagger-ui .highlight-code,
      .swagger-ui .microlight {
        direction: ltr !important;
        text-align: left !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      if (prevDir) html.setAttribute("dir", prevDir);
      else html.removeAttribute("dir");
      if (prevLang) html.setAttribute("lang", prevLang);
      else html.removeAttribute("lang");
      html.classList.remove("swagger-docs");
      body.classList.remove("swagger-docs");
      style.remove();
    };
  }, []);

  return (
    <SwaggerUI
      url="/api/openapi"
      docExpansion="list"
      defaultModelsExpandDepth={-1}
      defaultModelExpandDepth={5}
      defaultModelRendering="example"
      tryItOutEnabled
      displayOperationId
      displayRequestDuration
      filter
      showExtensions
      showCommonExtensions
      supportedSubmitMethods={["get", "post", "put", "patch", "delete"]}
    />
  );
}
