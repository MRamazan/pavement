"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Search, RefreshCw, Plus, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/ui/Navbar";
import { StatsBar } from "@/components/admin/StatsBar";
import { TicketCard } from "@/components/admin/TicketCard";
import { TicketDetail } from "@/components/admin/TicketDetail";
import { getAllTickets, getStats, seedDemoData } from "@/lib/ticketStore";
import { PRIORITY_CONFIG, STATUS_CONFIG } from "@/types";
import type { Ticket, Priority, TicketStatus } from "@/types";

type SortMode = "priority" | "date" | "status";

export default function AdminDashboard() {
  const searchParams = useSearchParams();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    critical: 0,
    high: 0,
    safetyRisks: 0,
    avgScore: 0,
  });
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState<Priority | "ALL">("ALL");
  const [filterStatus, setFilterStatus] = useState<TicketStatus | "ALL">("ALL");
  const [sortMode, setSortMode] = useState<SortMode>("priority");
  const [showFilters, setShowFilters] = useState(false);
  const [isSeeded, setIsSeeded] = useState(false);

  const loadData = useCallback(() => {
    const allTickets = getAllTickets();
    setTickets(allTickets);
    setStats(getStats());
    return allTickets;
  }, []);

  useEffect(() => {
    seedDemoData();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time mount load from localStorage
    const allTickets = loadData();

    const targetId = searchParams.get("ticket");
    const target = targetId
      ? allTickets.find((t) => t.id === targetId)
      : undefined;

    setIsSeeded(true);
    if (target) {
      setSelectedTicket(target);
    }
  }, [loadData, searchParams]);

  const handleTicketUpdate = (updated: Ticket) => {
    setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setSelectedTicket(updated);
    setStats(getStats());
  };

  const handleTicketDelete = (id: string) => {
    setTickets((prev) => prev.filter((t) => t.id !== id));
    setSelectedTicket(null);
    setStats(getStats());
  };

  const filteredTickets = tickets
    .filter((t) => {
      if (filterPriority !== "ALL" && t.analysis.priority !== filterPriority)
        return false;
      if (filterStatus !== "ALL" && t.status !== filterStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          t.ticketNumber.toLowerCase().includes(q) ||
          t.analysis.issueSummary.toLowerCase().includes(q) ||
          t.analysis.issueType.toLowerCase().includes(q) ||
          (t.location.address ?? "").toLowerCase().includes(q) ||
          (t.userDescription ?? "").toLowerCase().includes(q) ||
          t.analysis.tags.some((tag) => tag.includes(q))
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortMode === "priority") {
        if (b.analysis.priorityScore !== a.analysis.priorityScore) {
          return b.analysis.priorityScore - a.analysis.priorityScore;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortMode === "date") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      const statusOrder = { OPEN: 0, IN_PROGRESS: 1, RESOLVED: 2, CLOSED: 3 };
      return statusOrder[a.status] - statusOrder[b.status];
    });

  const hasActiveFilters = filterPriority !== "ALL" || filterStatus !== "ALL" || searchQuery;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--bg)" }}
    >
      <Navbar />

      <div className="flex-1 mx-auto w-full px-4 sm:px-6 py-7" style={{ maxWidth: "1400px" }}>

        {/* Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1
              className="font-semibold"
              style={{ color: "var(--text-primary)", fontSize: "18px", letterSpacing: "-0.02em" }}
            >
              Dashboard
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
              {stats.total} tickets total
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => loadData()}
              className="p-2 rounded-lg transition-opacity hover:opacity-60"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
              }}
              title="Refresh"
            >
              <RefreshCw size={14} style={{ color: "var(--text-secondary)" }} />
            </button>
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-85"
              style={{ background: "var(--text-primary)" }}
            >
              <Plus size={13} />
              New Report
            </Link>
          </div>
        </div>

        {/* Stats */}
        {isSeeded && <StatsBar stats={stats} />}

        {/* Search + Controls row */}
        <div className="flex items-center gap-2 mb-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--text-secondary)", opacity: 0.5 }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tickets..."
              className="w-full text-sm pl-8 pr-4 py-2 rounded-lg outline-none"
              style={{
                border: "1px solid var(--border)",
                background: "var(--surface)",
                color: "var(--text-primary)",
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2"
              >
                <X size={12} style={{ color: "var(--text-secondary)" }} />
              </button>
            )}
          </div>

          {/* Sort */}
          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
            className="text-sm px-3 py-2 rounded-lg outline-none cursor-pointer"
            style={{
              border: "1px solid var(--border)",
              background: "var(--surface)",
              color: "var(--text-primary)",
            }}
          >
            <option value="priority">Priority</option>
            <option value="date">Newest</option>
            <option value="status">Status</option>
          </select>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors"
            style={{
              border: `1px solid ${showFilters || hasActiveFilters ? "var(--text-primary)" : "var(--border)"}`,
              background: showFilters || hasActiveFilters ? "var(--text-primary)" : "var(--surface)",
              color: showFilters || hasActiveFilters ? "#fff" : "var(--text-secondary)",
            }}
          >
            <SlidersHorizontal size={13} />
            <span className="hidden sm:inline text-sm">Filter</span>
            {hasActiveFilters && filterPriority !== "ALL" || hasActiveFilters && filterStatus !== "ALL" ? (
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "var(--accent)" }}
              />
            ) : null}
          </button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div
            className="mb-4 p-4 rounded-xl animate-fade-in-up"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center gap-3 flex-wrap mb-3">
              <span className="text-xs font-medium w-14" style={{ color: "var(--text-secondary)" }}>
                Priority
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {(["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"] as const).map(
                  (p) => (
                    <button
                      key={p}
                      onClick={() => setFilterPriority(p)}
                      className="text-xs px-3 py-1 rounded-md font-medium transition-all"
                      style={{
                        background:
                          filterPriority === p
                            ? p === "ALL"
                              ? "var(--text-primary)"
                              : PRIORITY_CONFIG[p as Priority].bgColor
                            : "var(--bg)",
                        color:
                          filterPriority === p
                            ? p === "ALL"
                              ? "#fff"
                              : PRIORITY_CONFIG[p as Priority].color
                            : "var(--text-secondary)",
                        border: `1px solid ${
                          filterPriority === p
                            ? p === "ALL"
                              ? "var(--text-primary)"
                              : PRIORITY_CONFIG[p as Priority].borderColor
                            : "var(--border)"
                        }`,
                      }}
                    >
                      {p === "ALL" ? "All" : p}
                    </button>
                  )
                )}
              </div>
            </div>

            <div
              className="w-full h-px mb-3"
              style={{ background: "var(--border)" }}
            />

            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-medium w-14" style={{ color: "var(--text-secondary)" }}>
                Status
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {(["ALL", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const).map(
                  (s) => (
                    <button
                      key={s}
                      onClick={() => setFilterStatus(s)}
                      className="text-xs px-3 py-1 rounded-md font-medium transition-all"
                      style={{
                        background:
                          filterStatus === s
                            ? s === "ALL"
                              ? "var(--text-primary)"
                              : STATUS_CONFIG[s as TicketStatus].bgColor
                            : "var(--bg)",
                        color:
                          filterStatus === s
                            ? s === "ALL"
                              ? "#fff"
                              : STATUS_CONFIG[s as TicketStatus].color
                            : "var(--text-secondary)",
                        border: `1px solid ${filterStatus === s ? "currentColor" : "var(--border)"}`,
                      }}
                    >
                      {s === "ALL" ? "All" : STATUS_CONFIG[s as TicketStatus]?.label ?? s}
                    </button>
                  )
                )}
              </div>
            </div>

            {hasActiveFilters && (
              <button
                onClick={() => {
                  setFilterPriority("ALL");
                  setFilterStatus("ALL");
                  setSearchQuery("");
                }}
                className="mt-3 text-xs"
                style={{ color: "var(--accent)" }}
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Count line */}
        {filteredTickets.length > 0 && (
          <p
            className="text-xs mb-3"
            style={{ color: "var(--text-secondary)", opacity: 0.6 }}
          >
            {filteredTickets.length} ticket{filteredTickets.length !== 1 ? "s" : ""}
            {hasActiveFilters ? " (filtered)" : ""}
          </p>
        )}

        {/* Main layout: list + detail */}
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: selectedTicket ? "1fr 400px" : "1fr",
          }}
        >
          {/* Ticket list */}
          <div className="space-y-2">
            {filteredTickets.length === 0 ? (
              <div
                className="text-center py-16 rounded-xl"
                style={{
                  background: "var(--surface)",
                  border: "1px dashed var(--border)",
                }}
              >
                <p
                  className="text-2xl mb-2"
                  role="img"
                  aria-label="empty"
                >
                  🗺️
                </p>
                <p
                  className="text-sm font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  {hasActiveFilters ? "No tickets match" : "No tickets yet"}
                </p>
                <p
                  className="text-xs mt-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {hasActiveFilters
                    ? "Try adjusting your filters"
                    : "Submit a report from the home page"}
                </p>
              </div>
            ) : (
              <>
                {filteredTickets.map((ticket, i) => (
                  <div
                    key={ticket.id}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${i * 30}ms`, animationFillMode: "both" }}
                  >
                    <TicketCard
                      ticket={ticket}
                      isSelected={selectedTicket?.id === ticket.id}
                      onClick={() =>
                        setSelectedTicket(
                          selectedTicket?.id === ticket.id ? null : ticket
                        )
                      }
                    />
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Detail panel */}
          {selectedTicket && (
            <div
              className="rounded-xl overflow-hidden lg:sticky lg:top-5 animate-fade-in-up"
              style={{
                border: "1px solid var(--border)",
                maxHeight: "calc(100vh - 100px)",
                alignSelf: "start",
              }}
            >
              <TicketDetail
                ticket={selectedTicket}
                onClose={() => setSelectedTicket(null)}
                onUpdate={handleTicketUpdate}
                onDelete={handleTicketDelete}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
