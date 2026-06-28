"use client";

import {
  FileText,
  Clock,
  Loader2,
  CheckCircle2,
  AlertOctagon,
  Shield,
  Gauge,
} from "lucide-react";

interface StatsBarProps {
  stats: {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    critical: number;
    high: number;
    safetyRisks: number;
    avgScore: number;
  };
}

export function StatsBar({ stats }: StatsBarProps) {
  const cards: {
    label: string;
    value: number | string;
    icon: React.ElementType;
    color: string;
    bg: string;
  }[] = [
    {
      label: "Total Tickets",
      value: stats.total,
      icon: FileText,
      color: "var(--text-primary)",
      bg: "var(--surface)",
    },
    {
      label: "Open",
      value: stats.open,
      icon: Clock,
      color: "var(--accent)",
      bg: "var(--accent-light)",
    },
    {
      label: "In Progress",
      value: stats.inProgress,
      icon: Loader2,
      color: "#3B82F6",
      bg: "#EFF6FF",
    },
    {
      label: "Resolved",
      value: stats.resolved,
      icon: CheckCircle2,
      color: "#059669",
      bg: "#ECFDF5",
    },
    {
      label: "Critical",
      value: stats.critical,
      icon: AlertOctagon,
      color: "#DC2626",
      bg: "#FEF2F2",
    },
    {
      label: "Safety Risks",
      value: stats.safetyRisks,
      icon: Shield,
      color: "#DC2626",
      bg: "#FEF2F2",
    },
    {
      label: "Avg. Score",
      value: stats.avgScore,
      icon: Gauge,
      color: "#D97706",
      bg: "#FFFBEB",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 mb-6">
      {cards.map(({ label, value, icon: Icon, color, bg }) => (
        <div
          key={label}
          className="p-3.5 rounded-xl"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
          }}
        >
          <div
            className="inline-flex items-center justify-center rounded-lg mb-2"
            style={{ width: "28px", height: "28px", background: bg }}
          >
            <Icon size={14} style={{ color }} />
          </div>
          <p
            className="text-lg font-bold leading-none"
            style={{ color: "var(--text-primary)" }}
          >
            {value}
          </p>
          <p
            className="text-xs mt-1 truncate"
            style={{ color: "var(--text-secondary)" }}
          >
            {label}
          </p>
        </div>
      ))}
    </div>
  );
}
