"use client";

import { useState } from "react";
import {
  X,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Users,
  Wrench,
  Tag,
  Shield,
  CheckCircle,
  Trash2,
  Edit3,
  AlertTriangle,
} from "lucide-react";
import { PriorityBadge, SeverityBar } from "@/components/ui/PriorityBadge";
import { updateTicket, deleteTicket } from "@/lib/ticketStore";
import { CATEGORY_LABELS, STATUS_CONFIG } from "@/types";
import type { Ticket, TicketStatus } from "@/types";

interface TicketDetailProps {
  ticket: Ticket;
  onClose: () => void;
  onUpdate: (updated: Ticket) => void;
  onDelete: (id: string) => void;
}

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function TicketDetail({
  ticket,
  onClose,
  onUpdate,
  onDelete,
}: TicketDetailProps) {
  const [adminNotes, setAdminNotes] = useState(ticket.adminNotes ?? "");
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { analysis, location } = ticket;

  const handleStatusChange = (newStatus: TicketStatus) => {
    const updates: Partial<Ticket> = { status: newStatus };
    if (newStatus === "RESOLVED" && !ticket.resolvedAt) {
      updates.resolvedAt = new Date().toISOString();
    }
    const updated = updateTicket(ticket.id, updates);
    if (updated) onUpdate(updated);
  };

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    await new Promise((r) => setTimeout(r, 200));
    const updated = updateTicket(ticket.id, { adminNotes });
    setIsSavingNotes(false);
    if (updated) onUpdate(updated);
  };

  const handleDelete = () => {
    setIsDeleting(true);
    setTimeout(() => {
      deleteTicket(ticket.id);
      onDelete(ticket.id);
    }, 300);
  };

  return (
    <div
      className="h-full flex flex-col overflow-hidden"
      style={{ background: "var(--surface)" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4 flex-shrink-0"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div>
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-mono font-bold"
              style={{ color: "var(--text-secondary)" }}
            >
              {ticket.ticketNumber}
            </span>
            <PriorityBadge
              priority={analysis.priority}
              score={analysis.priorityScore}
              showScore
            />
          </div>
          <p
            className="text-sm font-semibold mt-0.5"
            style={{ color: "var(--text-primary)" }}
          >
            {analysis.issueSummary}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg transition-colors hover:opacity-70"
          style={{
            background: "var(--bg)",
            border: "1px solid var(--border)",
          }}
        >
          <X size={16} style={{ color: "var(--text-secondary)" }} />
        </button>
      </div>

      {/* Body — scrollable */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Image */}
        {ticket.imageBase64 && ticket.imageBase64.length > 100 && (
          <div
            className="rounded-xl overflow-hidden"
            style={{ border: "1px solid var(--border)" }}
          >
            <img
              src={ticket.imageBase64.startsWith("data:") ? ticket.imageBase64 : `data:image/jpeg;base64,${ticket.imageBase64}`}
              alt="Issue"
              className="w-full object-cover"
              style={{ maxHeight: "220px" }}
            />
          </div>
        )}

        {/* Status changer */}
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-wider mb-2"
            style={{ color: "var(--text-secondary)" }}
          >
            Status
          </p>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(STATUS_CONFIG) as TicketStatus[]).map((status) => {
              const config = STATUS_CONFIG[status];
              const isActive = ticket.status === status;
              return (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
                  style={{
                    background: isActive ? config.bgColor : "var(--bg)",
                    color: isActive ? config.color : "var(--text-secondary)",
                    border: `1px solid ${isActive ? config.color + "66" : "var(--border)"}`,
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  {config.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Severity */}
        <div
          className="p-4 rounded-xl"
          style={{ background: "var(--bg)", border: "1px solid var(--border)" }}
        >
          <SeverityBar
            score={analysis.priorityScore}
            priority={analysis.priority}
          />
          {analysis.safetyRisk && (
            <div
              className="mt-3 flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg"
              style={{ background: "#FEF2F2", color: "#DC2626" }}
            >
              <Shield size={12} />
              Active safety risk — immediate action required
            </div>
          )}
        </div>

        {/* Category & Issue Detail */}
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-wider mb-2"
            style={{ color: "var(--text-secondary)" }}
          >
            Issue Analysis
          </p>
          <div
            className="p-4 rounded-xl space-y-3"
            style={{ background: "var(--bg)", border: "1px solid var(--border)" }}
          >
            <div>
              <span
                className="text-xs"
                style={{ color: "var(--text-secondary)" }}
              >
                Category
              </span>
              <p
                className="text-sm font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                {CATEGORY_LABELS[analysis.issueType]}
              </p>
            </div>
            <div>
              <span
                className="text-xs"
                style={{ color: "var(--text-secondary)" }}
              >
                AI Description
              </span>
              <p
                className="text-sm"
                style={{ color: "var(--text-primary)", lineHeight: "1.6" }}
              >
                {analysis.detailedDescription}
              </p>
            </div>
            {ticket.userDescription && (
              <div>
                <span
                  className="text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Reporter&apos;s Description
                </span>
                <p
                  className="text-sm italic"
                  style={{ color: "var(--text-secondary)", lineHeight: "1.6" }}
                >
                  &ldquo;{ticket.userDescription}&rdquo;
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Priority Rationale */}
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-wider mb-2"
            style={{ color: "var(--text-secondary)" }}
          >
            Priority Rationale
          </p>
          <div
            className="p-4 rounded-xl text-sm"
            style={{
              background: "var(--bg)",
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
              lineHeight: "1.6",
            }}
          >
            {analysis.priorityReason}
          </div>
        </div>

        {/* Logistics */}
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-wider mb-2"
            style={{ color: "var(--text-secondary)" }}
          >
            Logistics
          </p>
          <div className="grid grid-cols-2 gap-2">
            <MiniCard
              icon={Clock}
              label="Response Window"
              value={analysis.urgencyWindow}
            />
            <MiniCard
              icon={DollarSign}
              label="Repair Cost"
              value={analysis.estimatedRepairCost}
            />
            <MiniCard
              icon={Users}
              label="Affected"
              value={analysis.affectedPopulation}
            />
            <MiniCard
              icon={AlertTriangle}
              label="Confidence"
              value={`${Math.round(analysis.confidence * 100)}%`}
            />
          </div>
        </div>

        {/* Recommended Action */}
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-wider mb-2"
            style={{ color: "var(--text-secondary)" }}
          >
            Recommended Action
          </p>
          <div
            className="p-4 rounded-xl text-sm"
            style={{
              background: "#EFF6FF",
              border: "1px solid #BFDBFE",
              color: "#1E40AF",
              lineHeight: "1.6",
            }}
          >
            <Wrench size={13} className="inline mr-1.5 mb-0.5" />
            {analysis.recommendedAction}
          </div>
        </div>

        {/* Location & Time */}
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-wider mb-2"
            style={{ color: "var(--text-secondary)" }}
          >
            Location & Timeline
          </p>
          <div
            className="p-4 rounded-xl space-y-2 text-sm"
            style={{ background: "var(--bg)", border: "1px solid var(--border)" }}
          >
            {location.address && (
              <div className="flex items-start gap-2">
                <MapPin
                  size={13}
                  className="mt-0.5 flex-shrink-0"
                  style={{ color: "var(--text-secondary)" }}
                />
                <span style={{ color: "var(--text-primary)" }}>
                  {[location.address, location.neighborhood, location.city]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar
                size={13}
                style={{ color: "var(--text-secondary)" }}
              />
              <span style={{ color: "var(--text-secondary)" }}>
                Reported: {formatDate(ticket.createdAt)}
              </span>
            </div>
            {ticket.resolvedAt && (
              <div className="flex items-center gap-2">
                <CheckCircle size={13} style={{ color: "#059669" }} />
                <span style={{ color: "#059669" }}>
                  Resolved: {formatDate(ticket.resolvedAt)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Tags */}
        {analysis.tags.length > 0 && (
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: "var(--text-secondary)" }}
            >
              Tags
            </p>
            <div className="flex flex-wrap gap-1.5">
              {analysis.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2.5 py-1 rounded-full"
                  style={{
                    background: "var(--bg)",
                    border: "1px solid var(--border)",
                    color: "var(--text-secondary)",
                  }}
                >
                  <Tag size={9} className="inline mr-1" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Admin Notes */}
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-wider mb-2"
            style={{ color: "var(--text-secondary)" }}
          >
            <Edit3 size={11} className="inline mr-1" />
            Admin Notes
          </p>
          <textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Internal notes, crew assignment, follow-up actions..."
            rows={3}
            className="w-full text-sm px-4 py-3 rounded-xl outline-none resize-none"
            style={{
              border: "1px solid var(--border)",
              background: "var(--bg)",
              color: "var(--text-primary)",
            }}
          />
          <button
            onClick={handleSaveNotes}
            disabled={isSavingNotes}
            className="mt-2 w-full py-2 rounded-lg text-xs font-medium transition-colors"
            style={{
              background: "var(--text-primary)",
              color: "#fff",
            }}
          >
            {isSavingNotes ? "Saving..." : "Save Notes"}
          </button>
        </div>

        {/* Delete */}
        <div
          className="pt-2"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-1.5 text-xs transition-colors hover:opacity-70"
              style={{ color: "#DC2626" }}
            >
              <Trash2 size={12} />
              Delete ticket
            </button>
          ) : (
            <div
              className="p-3 rounded-xl"
              style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}
            >
              <p
                className="text-xs font-medium mb-2"
                style={{ color: "#DC2626" }}
              >
                Delete this ticket permanently?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-1.5 rounded-lg text-xs font-medium"
                  style={{
                    background: "white",
                    border: "1px solid var(--border)",
                    color: "var(--text-secondary)",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-white"
                  style={{ background: "#DC2626" }}
                >
                  {isDeleting ? "Deleting..." : "Yes, Delete"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MiniCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div
      className="p-3 rounded-xl"
      style={{ background: "var(--bg)", border: "1px solid var(--border)" }}
    >
      <div className="flex items-center gap-1 mb-0.5">
        <Icon size={11} style={{ color: "var(--text-secondary)" }} />
        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
          {label}
        </span>
      </div>
      <p
        className="text-xs font-semibold"
        style={{ color: "var(--text-primary)" }}
      >
        {value}
      </p>
    </div>
  );
}
