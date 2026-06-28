# 🛣️ PAVEMENT - AI Infrastructure Decay Reporter

**Report broken infrastructure. AI handles the rest.**

Built for **FutureHacks 2026** by TechShare - *"Build the city of tomorrow, today."*

[Live Demo](#) · [Video Demo](#) · [Devpost Submission](#)

---

## The Problem

U.S. cities face **$435B in deferred infrastructure maintenance** (ASCE 2021 Infrastructure Report Card). The bottleneck isn't funding - it's *detection and reporting*. Existing 311 systems require residents to manually categorize issues, estimate severity, and navigate clunky forms. Most broken sidewalks, potholes, and damaged signage simply go unreported because reporting them is too much friction.

**PAVEMENT removes that friction entirely.** Snap a photo, optionally add a sentence of context, and AI does everything else: classification, severity scoring, cost estimation, and a structured maintenance ticket - ready for a city crew to act on.

## How It Works

1. **Citizen reports an issue** - uploads a photo and/or types a short description on the homepage
2. **AI analyzes it** - `meta-llama/llama-4-scout-17b-16e-instruct` (via Groq, multimodal vision + reasoning) inspects the image and text together
3. **Structured ticket is generated** - issue category, 1–100 priority score, safety risk flag, estimated repair cost, affected population, recommended action, and urgency window
4. **Admin dashboard** - city staff view all tickets sorted by priority, filter by status/category, drill into full AI rationale, update status, and leave internal notes

This is **load-bearing AI**: without the vision-language model, this is just a photo upload form. With it, an unstructured photo becomes an actionable, prioritized civic work order in under 5 seconds.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind CSS v4 |
| AI / Inference | Groq API - `meta-llama/llama-4-scout-17b-16e-instruct` (multimodal vision + LLM reasoning) |
| Data persistence | Browser `localStorage` (zero-backend, instant demo-ready) |
| Icons | lucide-react |
| Deployment | Vercel |

### Why this stack
Speed-to-demo was the constraint. A serverless Next.js API route calls Groq directly - no database, no auth server, no infra to provision. `localStorage` is the right call for a hackathon MVP: it's instant, requires zero setup, and is trivially swappable for Postgres/Supabase in a real deployment (see Roadmap below).

## Priority Scoring Logic

The AI scores every report from 1–100 using a weighted rubric the model is instructed to apply consistently:

| Score | Tier | Response window | Example |
|---|---|---|---|
| 85–100 | 🔴 Critical | 24 hours | Deep pothole in a traffic lane, fallen tree blocking a road |
| 65–84 | 🟠 High | 48–72 hours | Broken streetlight on a pedestrian route, large sidewalk crack with a confirmed injury |
| 35–64 | 🟡 Medium | 1–2 weeks | Minor sidewalk cracks, illegal dumping, worn road markings |
| 1–34 | 🟢 Low | 30 days | Faded paint, minor cosmetic wear |

Scoring factors include active safety risk, affected population size, vulnerability of affected users (elderly, children, disabled), issue duration, infrastructure criticality, and legal/ADA compliance - all surfaced back to the admin as a written rationale, not a black-box number.

## Project Structure

```
src/
├── app/
│   ├── page.tsx                 # Home - report submission
│   ├── admin/page.tsx           # Admin route (Suspense wrapper)
│   ├── api/analyze/route.ts     # Server-side Groq vision+LLM call
│   └── layout.tsx
├── components/
│   ├── ui/                      # Navbar, PriorityBadge, SeverityBar, StatusBadge
│   ├── report/ReportForm.tsx    # Upload → describe → analyze → submit flow
│   └── admin/
│       ├── AdminDashboard.tsx   # Full ticket management UI
│       ├── StatsBar.tsx         # Aggregate metrics
│       ├── TicketCard.tsx       # List item
│       └── TicketDetail.tsx     # Side panel: status, notes, delete
├── lib/
│   ├── groqAnalysis.ts          # Client-callable Groq wrapper (reference impl)
│   └── ticketStore.ts           # localStorage CRUD + demo data seeding
└── types/index.ts               # Shared types, priority/status/category config
```

## Running Locally

```bash
git clone <your-repo-url>
cd pavement-app
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The app works immediately with no setup if you've configured `GROQ_API_KEY` (see below). Visitors can optionally enter their own Groq key via the "Use your own Groq API key" link if they'd rather use their own quota - it's stored only in their browser's `localStorage` and is never persisted on any server.

## Deploying to Vercel

```bash
npm i -g vercel
vercel --prod
```

**Set one environment variable** so judges and testers can use the live demo without needing their own Groq account:

1. Get a free key at [console.groq.com](https://console.groq.com)
2. In the Vercel dashboard: **Project Settings → Environment Variables**
3. Add `GROQ_API_KEY` = `gsk_...` (apply to Production, Preview, and Development)
4. Redeploy

Without this variable, the app still works - visitors will be asked to enter their own key via the in-app banner instead.

## Demo Data

On first load, the admin panel seeds 5 realistic demo tickets spanning all four priority tiers (critical pothole, high-priority graffiti at a school, broken streetlight, cracked sidewalk with a confirmed injury, and a resolved illegal dumping case) so judges can immediately see the full system without waiting on a live AI call.

## Roadmap (Post-Hackathon)

- Swap `localStorage` for Postgres (Supabase) with multi-tenant city support
- Real geocoding (currently free-text address fields) + map clustering view
- Photo-based duplicate detection (avoid 50 tickets for the same pothole)
- Public-facing status tracker so reporters can follow their ticket
- Webhook integration into real municipal 311 systems

## Team / Submission Info

Built solo in a 6-hour sprint for FutureHacks 2026 (TechShare), themed *"Build the city of tomorrow, today."*

**Judging criteria this project targets:** Innovation (novel vision-to-civic-ticket pipeline, not a chatbot wrapper), Theme Alignment (citizen-powered smart-city infrastructure sensing), Real-world Impact (addresses a documented $435B U.S. maintenance backlog), and User Experience (3-step flow: photo → AI analysis → ticket, zero friction).
