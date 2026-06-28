export type Priority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

export type IssueCategory =
  | "pothole"
  | "cracked_sidewalk"
  | "graffiti"
  | "broken_streetlight"
  | "damaged_sign"
  | "flooding"
  | "fallen_tree"
  | "illegal_dumping"
  | "broken_bench"
  | "road_damage"
  | "other";

export interface GeoLocation {
  latitude?: number;
  longitude?: number;
  address?: string;
  neighborhood?: string;
  city?: string;
}

export interface AIAnalysis {
  issueType: IssueCategory;
  issueSummary: string;
  detailedDescription: string;
  priorityScore: number; // 1–100
  priority: Priority;
  priorityReason: string;
  safetyRisk: boolean;
  estimatedRepairCost: string;
  affectedPopulation: string;
  recommendedAction: string;
  urgencyWindow: string; // e.g. "Within 24 hours"
  confidence: number; // 0–1
  tags: string[];
}

export interface Ticket {
  id: string;
  ticketNumber: string; // e.g. "PVT-0042"
  createdAt: string; // ISO string
  updatedAt: string;
  status: TicketStatus;
  imageBase64: string; // stored image
  imageUrl?: string;
  userDescription?: string;
  location: GeoLocation;
  analysis: AIAnalysis;
  adminNotes?: string;
  resolvedAt?: string;
}

export interface TicketStore {
  tickets: Ticket[];
  lastUpdated: string;
}

export const PRIORITY_CONFIG: Record<
  Priority,
  { color: string; bgColor: string; borderColor: string; label: string; scoreRange: string }
> = {
  CRITICAL: {
    color: "#DC2626",
    bgColor: "#FEF2F2",
    borderColor: "#FECACA",
    label: "Critical",
    scoreRange: "85–100",
  },
  HIGH: {
    color: "#E8400C",
    bgColor: "#FFF0EB",
    borderColor: "#FED7C3",
    label: "High",
    scoreRange: "65–84",
  },
  MEDIUM: {
    color: "#D97706",
    bgColor: "#FFFBEB",
    borderColor: "#FDE68A",
    label: "Medium",
    scoreRange: "35–64",
  },
  LOW: {
    color: "#059669",
    bgColor: "#ECFDF5",
    borderColor: "#A7F3D0",
    label: "Low",
    scoreRange: "1–34",
  },
};

export const CATEGORY_LABELS: Record<IssueCategory, string> = {
  pothole: "Pothole",
  cracked_sidewalk: "Cracked Sidewalk",
  graffiti: "Graffiti / Vandalism",
  broken_streetlight: "Broken Streetlight",
  damaged_sign: "Damaged Sign",
  flooding: "Flooding / Drainage",
  fallen_tree: "Fallen Tree / Debris",
  illegal_dumping: "Illegal Dumping",
  broken_bench: "Broken Street Furniture",
  road_damage: "Road Damage",
  other: "Other Infrastructure",
};

export const STATUS_CONFIG: Record<
  TicketStatus,
  { color: string; bgColor: string; label: string }
> = {
  OPEN: { color: "#E8400C", bgColor: "#FFF0EB", label: "Open" },
  IN_PROGRESS: { color: "#3B82F6", bgColor: "#EFF6FF", label: "In Progress" },
  RESOLVED: { color: "#059669", bgColor: "#ECFDF5", label: "Resolved" },
  CLOSED: { color: "#64748B", bgColor: "#F8FAFC", label: "Closed" },
};
