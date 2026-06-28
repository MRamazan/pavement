import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PAVEMENT — Urban Infrastructure Reporter",
  description:
    "AI-powered civic infrastructure damage detection and ticketing platform. Report broken sidewalks, potholes, graffiti, and urban decay instantly.",
  keywords:
    "urban infrastructure, civic tech, AI, smart city, infrastructure repair, city maintenance",
  openGraph: {
    title: "PAVEMENT — Urban Infrastructure Reporter",
    description:
      "Report urban infrastructure damage with AI. Instant analysis, priority scoring, civic tickets.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
