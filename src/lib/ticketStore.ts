import type { Ticket, TicketStore } from "@/types";

const STORAGE_KEY = "pavement_tickets_v1";

function generateTicketNumber(existingCount: number): string {
  const num = String(existingCount + 1).padStart(4, "0");
  return `PVT-${num}`;
}

export function getStore(): TicketStore {
  if (typeof window === "undefined") {
    return { tickets: [], lastUpdated: new Date().toISOString() };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { tickets: [], lastUpdated: new Date().toISOString() };
    return JSON.parse(raw) as TicketStore;
  } catch {
    return { tickets: [], lastUpdated: new Date().toISOString() };
  }
}

export function saveStore(store: TicketStore): void {
  if (typeof window === "undefined") return;
  try {
    store.lastUpdated = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    console.error("Failed to save to localStorage");
  }
}

export function getAllTickets(): Ticket[] {
  const store = getStore();
  return store.tickets.sort((a, b) => {
    // Sort: first by priority score descending, then by date descending
    if (b.analysis.priorityScore !== a.analysis.priorityScore) {
      return b.analysis.priorityScore - a.analysis.priorityScore;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export function getTicketById(id: string): Ticket | undefined {
  const store = getStore();
  return store.tickets.find((t) => t.id === id);
}

export function createTicket(
  ticketData: Omit<Ticket, "ticketNumber" | "updatedAt">
): Ticket {
  const store = getStore();
  const ticketNumber = generateTicketNumber(store.tickets.length);
  const now = new Date().toISOString();

  const newTicket: Ticket = {
    ...ticketData,
    ticketNumber,
    updatedAt: now,
  };

  store.tickets.push(newTicket);
  saveStore(store);
  return newTicket;
}

export function updateTicket(
  id: string,
  updates: Partial<Ticket>
): Ticket | null {
  const store = getStore();
  const idx = store.tickets.findIndex((t) => t.id === id);
  if (idx === -1) return null;

  store.tickets[idx] = {
    ...store.tickets[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  saveStore(store);
  return store.tickets[idx];
}

export function deleteTicket(id: string): boolean {
  const store = getStore();
  const before = store.tickets.length;
  store.tickets = store.tickets.filter((t) => t.id !== id);
  saveStore(store);
  return store.tickets.length < before;
}

export function getStats() {
  const tickets = getAllTickets();
  const total = tickets.length;
  const open = tickets.filter((t) => t.status === "OPEN").length;
  const inProgress = tickets.filter((t) => t.status === "IN_PROGRESS").length;
  const resolved = tickets.filter((t) => t.status === "RESOLVED").length;
  const critical = tickets.filter((t) => t.analysis.priority === "CRITICAL").length;
  const high = tickets.filter((t) => t.analysis.priority === "HIGH").length;
  const safetyRisks = tickets.filter((t) => t.analysis.safetyRisk).length;

  const avgScore =
    total > 0
      ? Math.round(
          tickets.reduce((sum, t) => sum + t.analysis.priorityScore, 0) / total
        )
      : 0;

  return { total, open, inProgress, resolved, critical, high, safetyRisks, avgScore };
}

// Seed demo data for hackathon demo purposes
export function seedDemoData(): void {
  const store = getStore();
  if (store.tickets.length > 0) return; // Don't seed if data exists

  const demoTickets: Omit<Ticket, "ticketNumber" | "updatedAt">[] = [
    {
      id: "demo-001",
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      status: "OPEN",
      imageBase64: "",
      userDescription: "Large pothole near bus stop, cars swerving dangerously",
      location: {
        address: "Corner of 5th Ave & Main St",
        neighborhood: "Downtown",
        city: "Metro City",
      },
      analysis: {
        issueType: "pothole",
        issueSummary: "Large structural pothole — immediate traffic hazard",
        detailedDescription:
          "A deep pothole approximately 45cm in diameter and 12cm deep has formed at a heavily trafficked intersection. Located directly in a bus lane and near a pedestrian crossing, it poses significant risk to cyclists, vehicles, and pedestrians.",
        priorityScore: 91,
        priority: "CRITICAL",
        priorityReason:
          "Active traffic hazard at high-volume intersection; proximity to bus stop elevates pedestrian risk; structural depth suggests underlying drainage failure.",
        safetyRisk: true,
        estimatedRepairCost: "$800–$1,200",
        affectedPopulation: "~4,000 daily commuters",
        recommendedAction:
          "Emergency temporary fill within 24h; permanent asphalt repair within 72h; inspect adjacent drainage infrastructure.",
        urgencyWindow: "Within 24 hours",
        confidence: 0.95,
        tags: ["traffic-hazard", "pothole", "bus-lane", "pedestrian-risk"],
      },
    },
    {
      id: "demo-002",
      createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
      status: "IN_PROGRESS",
      imageBase64: "",
      userDescription: "Graffiti on school wall, been here for weeks",
      location: {
        address: "Riverside Elementary School, Oak Blvd",
        neighborhood: "Riverside",
        city: "Metro City",
      },
      analysis: {
        issueType: "graffiti",
        issueSummary: "Large-scale graffiti on school building exterior",
        detailedDescription:
          "Extensive graffiti spanning approximately 8 linear meters across the front face of an elementary school. Tags include offensive language visible from the main street and school entrance. Present for an estimated 2–3 weeks based on weathering.",
        priorityScore: 72,
        priority: "HIGH",
        priorityReason:
          "Educational facility with vulnerable population (children); offensive content visible from school entrance; prolonged exposure indicates maintenance failure; impacts community perception.",
        safetyRisk: false,
        estimatedRepairCost: "$400–$700",
        affectedPopulation: "~350 students, staff, and families",
        recommendedAction:
          "Priority graffiti removal using solvent-appropriate for building material; consider anti-graffiti coating upon completion; coordinate with school administration.",
        urgencyWindow: "Within 48 hours",
        confidence: 0.92,
        tags: ["graffiti", "school", "community", "vandalism"],
      },
    },
    {
      id: "demo-003",
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      status: "OPEN",
      imageBase64: "",
      userDescription: "Broken streetlight, very dark at night",
      location: {
        address: "Elm Street, near park entrance",
        neighborhood: "Greenpark",
        city: "Metro City",
      },
      analysis: {
        issueType: "broken_streetlight",
        issueSummary: "Non-functional streetlight — park entrance safety concern",
        detailedDescription:
          "A park-entrance streetlight has been completely non-functional for an estimated 5+ days. The area serves as a primary pedestrian route connecting a residential neighborhood to the subway station, used heavily during evening rush hours.",
        priorityScore: 68,
        priority: "HIGH",
        priorityReason:
          "Pedestrian safety risk during nighttime hours; high foot traffic corridor; proximity to park creates conditions favorable to opportunistic crime.",
        safetyRisk: true,
        estimatedRepairCost: "$150–$400",
        affectedPopulation: "~800 nightly commuters",
        recommendedAction:
          "Electrical inspection within 48h; bulb/ballast replacement or full unit repair; consider upgrading to LED with motion sensor.",
        urgencyWindow: "Within 48 hours",
        confidence: 0.88,
        tags: ["streetlight", "safety", "nighttime", "pedestrian"],
      },
    },
    {
      id: "demo-004",
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      status: "OPEN",
      imageBase64: "",
      userDescription: "Cracked sidewalk, tripped on it yesterday",
      location: {
        address: "Maple Avenue, between 3rd and 4th St",
        neighborhood: "Westside",
        city: "Metro City",
      },
      analysis: {
        issueType: "cracked_sidewalk",
        issueSummary: "Severely cracked sidewalk panel — confirmed trip hazard",
        detailedDescription:
          "A 1.2m × 0.9m concrete sidewalk panel has fractured into multiple sections with a vertical displacement of approximately 5cm between sections. User reports a confirmed trip incident. Located on a route commonly used by elderly residents accessing a nearby pharmacy.",
        priorityScore: 58,
        priority: "MEDIUM",
        priorityReason:
          "Confirmed personal injury incident; elderly-accessible route; significant vertical displacement; however, no immediate life-threatening hazard if properly marked.",
        safetyRisk: true,
        estimatedRepairCost: "$300–$600",
        affectedPopulation: "~200 daily pedestrians",
        recommendedAction:
          "Install hazard tape and signage immediately; schedule concrete panel replacement within 2 weeks; inspect adjacent panels for similar damage.",
        urgencyWindow: "Within 1 week",
        confidence: 0.9,
        tags: ["sidewalk", "trip-hazard", "elderly-route", "confirmed-injury"],
      },
    },
    {
      id: "demo-005",
      createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
      status: "RESOLVED",
      imageBase64: "",
      userDescription: "Old mattress dumped on the sidewalk",
      location: {
        address: "Industrial Way, near warehouse district",
        neighborhood: "Industrial",
        city: "Metro City",
      },
      analysis: {
        issueType: "illegal_dumping",
        issueSummary: "Bulky item illegal dumping — sidewalk obstruction",
        detailedDescription:
          "A large mattress and two cardboard boxes have been illegally deposited on a public sidewalk adjacent to a warehouse district. The obstruction reduces usable sidewalk width to below ADA-compliant minimums (currently ~60cm, standard requires 120cm+).",
        priorityScore: 38,
        priority: "MEDIUM",
        priorityReason:
          "ADA compliance violation; active obstruction of pedestrian right-of-way; potential pest attraction; area known for repeated dumping incidents.",
        safetyRisk: false,
        estimatedRepairCost: "$80–$150 (removal fee)",
        affectedPopulation: "~100 daily pedestrians",
        recommendedAction:
          "Schedule bulk removal within 3 business days; photograph and log for repeat-offender tracking; consider installing no-dumping signage.",
        urgencyWindow: "Within 3 days",
        confidence: 0.87,
        tags: ["illegal-dumping", "obstruction", "ADA", "bulk-waste"],
      },
      resolvedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      adminNotes: "Removed by city sanitation crew on schedule.",
    },
  ];

  demoTickets.forEach((t, i) => {
    const ticketNumber = generateTicketNumber(i);
    store.tickets.push({
      ...t,
      ticketNumber,
      updatedAt: t.createdAt,
    });
  });

  saveStore(store);
}
