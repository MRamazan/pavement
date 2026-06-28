"use client";

import { MapPin, Calendar, Shield } from "lucide-react";
import { PriorityBadge, SeverityBar } from "@/components/ui/PriorityBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { CATEGORY_LABELS } from "@/types";
import type { Ticket } from "@/types";

interface TicketCardProps {
  ticket: Ticket;
  isSelected?: boolean;
  onClick: () => void;
}

function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export function TicketCard({ ticket, isSelected, onClick }: TicketCardProps) {
  const { analysis, location } = ticket;

  return (
    <div
      className="ticket-card px-4 py-3.5 rounded-xl cursor-pointer"
      onClick={onClick}
      style={{
        background: isSelected ? "var(--surface)" : "var(--surface)",
        border: `1px solid ${isSelected ? "var(--text-primary)" : "var(--border)"}`,
        outline: "none",
      }}
    >
      <div className="flex items-center gap-3">
        {/* Thumbnail */}
        <div
          className="flex-shrink-0 rounded-lg overflow-hidden"
          style={{
            width: "44px",
            height: "44px",
            background: "var(--bg)",
            border: "1px solid var(--border)",
          }}
        >
          {ticket.imageBase64 && ticket.imageBase64.length > 100 ? (
            <img
              src={ticket.imageBase64.startsWith("data:") ? ticket.imageBase64 : `data:image/jpeg;base64,${ticket.imageBase64}`}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ fontSize: "18px" }}
            >
              {getIssueEmoji(analysis.issueType)}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span
              className="text-xs font-mono"
              style={{ color: "var(--text-secondary)", opacity: 0.7 }}
            >
              {ticket.ticketNumber}
            </span>
            <PriorityBadge
              priority={analysis.priority}
              size="sm"
              showScore
              score={analysis.priorityScore}
            />
            {analysis.safetyRisk && (
              <Shield size={10} style={{ color: "#DC2626" }} />
            )}
            <div className="ml-auto flex items-center gap-1.5">
              <StatusBadge status={ticket.status} size="sm" />
            </div>
          </div>

          <p
            className="text-sm font-medium truncate"
            style={{ color: "var(--text-primary)" }}
          >
            {analysis.issueSummary}
          </p>

          <div
            className="flex items-center gap-2 text-xs mt-0.5"
            style={{ color: "var(--text-secondary)" }}
          >
            <span style={{ opacity: 0.7 }}>{CATEGORY_LABELS[analysis.issueType]}</span>
            {location.address && (
              <>
                <span style={{ opacity: 0.3 }}>·</span>
                <span className="flex items-center gap-0.5 truncate" style={{ opacity: 0.7 }}>
                  <MapPin size={9} />
                  {location.address}
                </span>
              </>
            )}
            <span style={{ opacity: 0.3 }}>·</span>
            <span className="flex items-center gap-0.5 whitespace-nowrap" style={{ opacity: 0.7 }}>
              <Calendar size={9} />
              {formatRelativeTime(ticket.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Severity bar */}
      <div className="mt-3">
        <SeverityBar
          score={analysis.priorityScore}
          priority={analysis.priority}
          showLabel={false}
        />
      </div>
    </div>
  );
}

function getIssueEmoji(issueType: string): string {
  const map: Record<string, string> = {
    pothole: "🕳️",
    cracked_sidewalk: "🚶",
    graffiti: "🖌️",
    broken_streetlight: "💡",
    damaged_sign: "🪧",
    flooding: "🌊",
    fallen_tree: "🌳",
    illegal_dumping: "🗑️",
    broken_bench: "🪑",
    road_damage: "🛣️",
    other: "⚠️",
  };
  return map[issueType] ?? "⚠️";
}
