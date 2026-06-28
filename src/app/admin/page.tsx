import { Suspense } from "react";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { Navbar } from "@/components/ui/Navbar";

function AdminLoadingFallback() {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <Navbar />
      <div className="flex items-center justify-center" style={{ height: "60vh" }}>
        <div className="text-center">
          <div
            className="mx-auto mb-3 rounded-full animate-spin"
            style={{
              width: "32px",
              height: "32px",
              border: "3px solid var(--border)",
              borderTopColor: "var(--accent)",
            }}
          />
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Loading admin panel...
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<AdminLoadingFallback />}>
      <AdminDashboard />
    </Suspense>
  );
}
