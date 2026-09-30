"use client";

import { Lock } from "lucide-react";
import DashboardCard from "../shared/DashboardCard";
import RichContent from "@/components/Common/RichContent";
import { usePrivacyContent } from "@/hooks/privacy";

export default function PrivacyPanel() {
  const { data: html = "" } = usePrivacyContent();

  return (
    <DashboardCard title="سياسة الخصوصية" icon={Lock}>
      <p className="mb-6 text-white/60 text-[13px]">
        آخر تحديث: أغسطس 2026
      </p>
      <RichContent html={html} />
    </DashboardCard>
  );
}
