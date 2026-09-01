"use client";

import DOMPurify from "isomorphic-dompurify";
import { Lock } from "lucide-react";
import DashboardCard from "../shared/DashboardCard";
import { usePrivacyContent } from "@/hooks/privacy";

export default function PrivacyPanel() {
  const { data: html = "" } = usePrivacyContent();
  const safeHtml = DOMPurify.sanitize(html);

  return (
    <DashboardCard title="سياسة الخصوصية" icon={Lock}>
      <p className="mb-6 text-white/60 text-[13px]">
        آخر تحديث: أغسطس 2026
      </p>
      <div
        className="[&_a]:text-glace-yellow [&_a]:hover:underline [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:first:mt-0 [&_h3]:font-bold [&_h3]:text-glace-yellow [&_h3]:text-[17px] [&_p]:mt-2 [&_p]:first:mt-0 [&_ul]:space-y-1.5 [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:list-inside text-white/85 text-[15px] leading-relaxed"
        dangerouslySetInnerHTML={{ __html: safeHtml }}
      />
    </DashboardCard>
  );
}
