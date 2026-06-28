"use client";

import { PRIORITY_CONFIG } from "@/types";
import type { Priority } from "@/types";

interface PriorityBadgeProps {
  priority: Priority;
  score?: number;
  size?: "sm" | "md" | "lg";
  showScore?: boolean;
}

export function PriorityBadge({
  priority,
  score,
  size = "md",
  showScore = false,
}: PriorityBadgeProps) {
  const config = PRIORITY_CONFIG[priority];

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-xs px-2.5 py-1",
    lg: "text-sm px-3 py-1.5",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full ${sizeClasses[size]}`}
      style={{
        color: config.color,
        backgroundColor: config.bgColor,
        border: `1px solid ${config.borderColor}`,
      }}
    >
      <span
        className="inline-block rounded-full"
        style={{
          width: size === "sm" ? "6px" : "7px",
          height: size === "sm" ? "6px" : "7px",
          backgroundColor: config.color,
        }}
      />
      {config.label}
      {showScore && score !== undefined && (
        <span style={{ opacity: 0.7 }}>·{score}</span>
      )}
    </span>
  );
}

interface SeverityBarProps {
  score: number;
  priority: Priority;
  showLabel?: boolean;
}

export function SeverityBar({ score, priority, showLabel = true }: SeverityBarProps) {
  const config = PRIORITY_CONFIG[priority];

  return (
    <div>
      {showLabel && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
            Severity Score
          </span>
          <span className="text-xs font-bold" style={{ color: config.color }}>
            {score}/100
          </span>
        </div>
      )}
      <div
        className="rounded-full overflow-hidden"
        style={{ height: "6px", backgroundColor: "var(--border)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${score}%`,
            backgroundColor: config.color,
          }}
        />
      </div>
    </div>
  );
}
