"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Plus } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Report Issue", icon: Plus },
    { href: "/admin", label: "Admin Panel", icon: LayoutDashboard },
  ];

  return (
    <nav
      style={{
        background: "var(--text-primary)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        className="mx-auto px-4 sm:px-6"
        style={{ maxWidth: "1200px" }}
      >
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div>
              <span
                className="font-bold tracking-tight"
                style={{ color: "#FFFFFF", fontSize: "15px", letterSpacing: "-0.01em" }}
              >
                PAVEMENT
              </span>
              <span
                className="hidden sm:inline text-xs ml-2"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                Urban Infrastructure Reporter
              </span>
            </div>
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-1">
            {links.map(({ href, label, icon: Icon }) => {
              const isActive =
                pathname === href ||
                (href !== "/" && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                  style={{
                    color: isActive ? "#FFFFFF" : "rgba(255,255,255,0.5)",
                    backgroundColor: isActive
                      ? "rgba(255,255,255,0.1)"
                      : "transparent",
                  }}
                >
                  <Icon size={14} />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
