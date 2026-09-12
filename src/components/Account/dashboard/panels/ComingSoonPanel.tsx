"use client";

import { FileText, Lock, HelpCircle, type LucideIcon } from "lucide-react";
import DashboardCard from "../shared/DashboardCard";
import EmptyState from "../shared/EmptyState";

// Icons are resolved here (client-side) rather than passed in as a prop —
// Server Component pages can't hand a component/function across the
// server->client boundary, only plain serializable values like this key.
const ICONS: Record<string, LucideIcon> = {
  terms: FileText,
  privacy: Lock,
  help: HelpCircle,
};

interface Props {
  title: string;
  icon: keyof typeof ICONS;
}

export default function ComingSoonPanel({ title, icon }: Props) {
  const Icon = ICONS[icon];
  return (
    <DashboardCard title={title} icon={Icon}>
      <EmptyState icon={Icon} message="هالصفحة قريباً" />
    </DashboardCard>
  );
}
