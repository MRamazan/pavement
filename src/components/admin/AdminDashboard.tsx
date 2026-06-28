"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Filter, RefreshCw, Plus, ChevronDown } from "lucide-react";
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

    // Handle direct ticket link from report form
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

  // Filter + search + sort
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
      // Status: open first, then in_progress, then resolved, then closed
      const statusOrder = { OPEN: 0, IN_PROGRESS: 1, RESOLVED: 2, CLOSED: 3 };
      return statusOrder[a.status] - statusOrder[b.status];
    });

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--bg)" }}
    >
      <Navbar />

      <div className="flex-1 mx-auto w-full px-4 sm:px-6 py-8" style={{ maxWidth: "1400px" }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1
              className="text-xl font-bold"
              style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}
            >
              Admin Panel
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
              {stats.total} tickets · {stats.open} open · {stats.critical} critical
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => loadData()}
              className="p-2 rounded-xl transition-colors hover:opacity-70"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
              }}
              title="Refresh"
            >
              <RefreshCw size={15} style={{ color: "var(--text-secondary)" }} />
            </button>
            <Link
              href="/"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: "var(--accent)" }}
            >
              <Plus size={14} />
              New Report
            </Link>
          </div>
        </div>

        {/* Stats */}
        {isSeeded && <StatsBar stats={stats} />}

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--text-secondary)" }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tickets, locations, categories..."
              className="w-full text-sm pl-9 pr-4 py-2.5 rounded-xl outline-none"
              style={{
                border: "1px solid var(--border)",
                background: "var(--surface)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
            style={{
              border: "1px solid var(--border)",
              background: showFilters ? "var(--text-primary)" : "var(--surface)",
              color: showFilters ? "#fff" : "var(--text-secondary)",
            }}
          >
            <Filter size={13} />
            Filters
            <ChevronDown
              size={12}
              style={{
                transform: showFilters ? "rotate(180deg)" : "none",
                transition: "transform 0.2s",
              }}
            />
          </button>

          {/* Sort */}
          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
            className="text-sm px-4 py-2.5 rounded-xl outline-none cursor-pointer"
            style={{
              border: "1px solid var(--border)",
              background: "var(--surface)",
              color: "var(--text-primary)",
            }}
          >
            <option value="priority">Sort: Priority Score</option>
            <option value="date">Sort: Newest First</option>
            <option value="status">Sort: Status</option>
          </select>
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div
            className="flex flex-wrap gap-2 mb-5 p-4 rounded-xl animate-fade-in-up"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
                Priority:
              </span>
              {(["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"] as const).map(
                (p) => (
                  <button
                    key={p}
                    onClick={() => setFilterPriority(p)}
                    className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
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
                    {p === "ALL" ? "All Priorities" : p}
                  </button>
                )
              )}
            </div>

            <div
              className="w-full h-px"
              style={{ background: "var(--border)" }}
            />

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
                Status:
              </span>
              {(["ALL", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const).map(
                (s) => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
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
                    {s === "ALL" ? "All Statuses" : STATUS_CONFIG[s as TicketStatus]?.label ?? s}
                  </button>
                )
              )}
            </div>
          </div>
        )}

        {/* Main layout: list + detail */}
        <div
          className="grid gap-5"
          style={{
            gridTemplateColumns: selectedTicket ? "1fr 420px" : "1fr",
          }}
        >
          {/* Ticket list */}
          <div className="space-y-2.5">
            {filteredTickets.length === 0 ? (
              <div
                className="text-center py-16 rounded-2xl"
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
                  {searchQuery || filterPriority !== "ALL" || filterStatus !== "ALL"
                    ? "No tickets match your filters"
                    : "No tickets yet"}
                </p>
                <p
                  className="text-xs mt-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {searchQuery || filterPriority !== "ALL" || filterStatus !== "ALL"
                    ? "Try adjusting your search or filters"
                    : "Submit a report from the home page to get started"}
                </p>
              </div>
            ) : (
              <>
                <p
                  className="text-xs font-medium mb-3"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {filteredTickets.length} ticket{filteredTickets.length !== 1 ? "s" : ""}
                  {filterPriority !== "ALL" || filterStatus !== "ALL" || searchQuery
                    ? " (filtered)"
                    : ""}
                  {" · Sorted by "}
                  {sortMode === "priority"
                    ? "priority score"
                    : sortMode === "date"
                    ? "newest first"
                    : "status"}
                </p>
                {filteredTickets.map((ticket, i) => (
                  <div
                    key={ticket.id}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${i * 40}ms`, animationFillMode: "both" }}
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
              className="rounded-2xl overflow-hidden lg:sticky lg:top-5 animate-fade-in-up"
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
