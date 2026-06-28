import { Navbar } from "@/components/ui/Navbar";
import { ReportForm } from "@/components/report/ReportForm";
import { AlertTriangle, Shield, Zap, BarChart2 } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <Navbar />

      <main className="mx-auto px-4 sm:px-6 py-10" style={{ maxWidth: "1200px" }}>
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left: Hero copy */}
          <div className="lg:sticky lg:top-10">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
              style={{
                background: "var(--accent-light)",
                color: "var(--accent)",
                border: "1px solid #FED7C3",
              }}
            >
              <AlertTriangle size={11} />
              AI-Powered Civic Reporting
            </div>

            <h1
              className="font-bold leading-tight mb-4"
              style={{
                fontSize: "clamp(2rem, 4vw, 2.75rem)",
                color: "var(--text-primary)",
                letterSpacing: "-0.03em",
              }}
            >
              Report broken
              <br />
              infrastructure.
              <br />
              <span style={{ color: "var(--accent)" }}>AI handles the rest.</span>
            </h1>

            <p
              className="text-base mb-8 leading-relaxed"
              style={{ color: "var(--text-secondary)", maxWidth: "400px" }}
            >
              Upload a photo of any urban infrastructure problem. Our AI instantly
              classifies severity, calculates priority, and generates an actionable
              maintenance ticket for city crews.
            </p>

            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Zap, title: "Instant Analysis", desc: "AI classifies and scores in seconds" },
                { icon: BarChart2, title: "Priority Scoring", desc: "1-100 score with full rationale" },
                { icon: Shield, title: "Safety Detection", desc: "Flags active hazards automatically" },
                { icon: AlertTriangle, title: "Admin Dashboard", desc: "Manage all tickets in one place" },
              ].map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="p-4 rounded-xl"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                >
                  <Icon size={16} className="mb-2" style={{ color: "var(--accent)" }} />
                  <p className="text-sm font-semibold mb-0.5" style={{ color: "var(--text-primary)" }}>{title}</p>
                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{desc}</p>
                </div>
              ))}
            </div>

            <div
              className="mt-6 p-4 rounded-xl flex items-center gap-6"
              style={{ background: "var(--text-primary)" }}
            >
              {[
                { value: "< 5s", label: "Analysis time" },
                { value: "4-tier", label: "Priority system" },
                { value: "11+", label: "Issue categories" },
              ].map(({ value, label }) => (
                <div key={label} className="text-center flex-1">
                  <p className="text-base font-bold" style={{ color: "#fff" }}>{value}</p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Form */}
          <div>
            <div
              className="p-6 sm:p-8 rounded-2xl"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
              }}
            >
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                  Submit a report
                </h2>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  Upload a photo or describe the issue. AI does the analysis.
                </p>
              </div>
              <ReportForm />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
