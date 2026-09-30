"use client";

import { FileText } from "lucide-react";
import DashboardCard from "../shared/DashboardCard";
import RichContent from "@/components/Common/RichContent";
import { useTermsContent } from "@/hooks/terms";

export default function TermsPanel() {
  const { data: html = "" } = useTermsContent();

  return (
    <DashboardCard title="الشروط والأحكام" icon={FileText}>
      <p className="mb-6 text-white/60 text-[13px]">
        آخر تحديث: أغسطس 2026
      </p>
      <RichContent html={html} />
    </DashboardCard>
  );
}
