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
    accent: string;
  }[] = [
    {
      label: "Total",
      value: stats.total,
      icon: FileText,
      accent: "var(--text-secondary)",
    },
    {
      label: "Open",
      value: stats.open,
      icon: Clock,
      accent: "var(--accent)",
    },
    {
      label: "In Progress",
      value: stats.inProgress,
      icon: Loader2,
      accent: "#3B82F6",
    },
    {
      label: "Resolved",
      value: stats.resolved,
      icon: CheckCircle2,
      accent: "#059669",
    },
    {
      label: "Critical",
      value: stats.critical,
      icon: AlertOctagon,
      accent: "#DC2626",
    },
    {
      label: "Safety",
      value: stats.safetyRisks,
      icon: Shield,
      accent: "#DC2626",
    },
    {
      label: "Avg Score",
      value: stats.avgScore,
      icon: Gauge,
      accent: "#D97706",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mb-6">
      {cards.map(({ label, value, icon: Icon, accent }) => (
        <div
          key={label}
          className="p-3 rounded-lg"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <p
              className="text-xs"
              style={{ color: "var(--text-secondary)" }}
            >
              {label}
            </p>
            <Icon size={12} style={{ color: accent, opacity: 0.7 }} />
          </div>
          <p
            className="text-xl font-semibold leading-none"
            style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}
          >
            {value}
          </p>
        </div>
      ))}
    </div>
  );
}
