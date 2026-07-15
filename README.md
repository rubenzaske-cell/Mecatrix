<div align="center">

# 🤖 Mecatrix

### AI-Powered Automotive Intelligence Platform

*Diagnose · Learn · Repair — with AI, immersive 3D, and an intelligent mechanic mentor.*

</div>

---

## 🚀 Overview

**Mecatrix** is a next-generation automotive learning, diagnostic, and repair platform that combines:

- 🧠 **MecaAI** — an AI assistant specialized in vehicle mechanics (LLM-powered chat mentor)
- 🔍 **Intelligent Diagnosis** — multi-modal AI combining engine photos (VLM) + voice notes (ASR) + symptoms into confidence-ranked reports
- 🔧 **3D Virtual Workshop** — a professional interactive simulator with holdable tools, bolt-by-bolt disassembly, and step-by-step guided repairs
- 📚 **Engine & Tool Libraries** — 8 interactive 3D engine models + 17 professional tools with tutorials
- 🎓 **Training & Courses** — structured learning paths + simulated fault scenarios with performance grading
- 📋 **Maintenance History** — a digital service log with full CRUD persistence

## 🎨 The Mascot — MecaAI

MecaAI is the platform's mascot: a low-poly cartoon robot built procedurally with Three.js. It floats in the dashboard hero and reacts in the assistant view — its antenna blinks and eyes glow brighter while the AI is "thinking."

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | **Next.js 16** (App Router, Turbopack) |
| Language | **TypeScript 5** |
| Styling | **Tailwind CSS 4** + shadcn/ui (New York) |
| 3D | **Three.js** + **@react-three/fiber** + **@react-three/drei** |
| Database | **Prisma ORM** (SQLite) |
| AI | **z-ai-web-dev-sdk** (LLM, VLM, ASR) |
| State | **Zustand** (nav) + React state |
| Animations | **Framer Motion** |
| Icons | **Lucide React** |

## 📦 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ or [Bun](https://bun.sh/)
- A SQLite-compatible environment (default)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/mecatrix.git
cd mecatrix

# 2. Install dependencies
bun install   # or: npm install

# 3. Set up environment
cp .env.example .env

# 4. Initialize the database
bun run db:push

# 5. Start the dev server
bun run dev
```

The app runs at `http://localhost:3000`.

### Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start dev server (port 3000) |
| `bun run lint` | Run ESLint |
| `bun run db:push` | Push Prisma schema to SQLite |
| `bun run db:generate` | Regenerate Prisma Client |
| `bun run build` | Production build |

## 🧩 Features

### MecaAI Assistant
An LLM-powered mechanic mentor that teaches, diagnoses, and guides repairs. Adapts explanations to beginner / intermediate / expert skill levels. Renders rich Markdown responses.

### Intelligent Vehicle Diagnosis
Upload engine photos, record a voice note of symptoms, and describe the issue. MecaAI combines all evidence (VLM photo analysis + ASR transcript + symptom reasoning) into a single confidence-ranked report with:
- Vehicle identification (manufacturer, model, year, engine type)
- Color-coded findings (🟢 Normal / 🟡 Inspect / 🔴 Critical)
- Recommended actions

### 3D Virtual Workshop
A professional interactive simulator — not just a visualization:
- **3 modes**: Practice (free disassembly) · Guided (step-by-step with MecaAI instructor) · Exam (graded, no help)
- **17 holdable 3D tools** across 9 categories (wrenches, sockets, Allen/Torx, screwdrivers, pliers, hammer, torque wrench, impact gun, multimeter, OBD-II scanner, hydraulic jack, puller)
- **Interactive bolts** — loosen in correct sequence, with CCW spin + lift + fade animations
- **Smart compatibility** — equipping a tool highlights only compatible parts; wrong-tool attempts trigger MecaAI feedback
- **Immersive controls** — exploded view, transparent mode, auto-rotation, reset assembly
- **Spacious workshop environment** — floor grid, workbenches, tool cabinets, hydraulic lift, overhead industrial lights

### Engine Library
8 interactive 3D engine models: gasoline I4 turbo, diesel I6, hybrid Atkinson, EV powertrain, V8, motorcycle parallel-twin, cargo tricycle, heavy truck diesel. Each with 11 components (block, head, pistons, crankshaft, intake/exhaust manifolds, timing, turbo, injectors, alternator, battery).

### Tool Collection
17 professional tools with interactive tutorials, correct procedures, recommended applications, and an AI "is this the right tool?" verifier.

### Training Courses & Virtual Training
6 structured courses with progress tracking + 4 simulated fault scenarios with performance feedback (diagnostic accuracy, repair accuracy, completion time, mistakes).

### Maintenance History
A digital service log with timeline view, cost tracking, and full CRUD persistence via Prisma/SQLite.

## 📁 Project Structure

```
src/
├── app/
│   ├── api/              # AI + CRUD API routes (LLM, VLM, ASR, vehicles, maintenance)
│   ├── layout.tsx        # Root layout with theme provider
│   ├── page.tsx          # Single-page app entry
│   └── globals.css       # Mecatrix design system
├── components/
│   ├── mecatrix/
│   │   ├── three/        # 3D: engine assembly, workshop env, mascot, held tool
│   │   ├── views/        # 12 feature views
│   │   ├── ui/           # Shared primitives
│   │   └── ...           # Shell, sidebar, nav, footer
│   └── ui/               # shadcn/ui components
├── data/                 # Static catalogs (engines, tools, courses)
├── lib/
│   ├── mecatrix/         # Nav store, workshop data, compat logic
│   └── db.ts             # Prisma client
└── prisma/
    └── schema.prisma     # Vehicle, Diagnosis, MaintenanceRecord, ChatMessage, CourseProgress
```

## ⚠️ Disclaimer

Mecatrix diagnostics are **confidence-ranked estimates**, not guarantees. Always verify critical repairs with official service manuals and follow proper safety procedures.

## 📄 License

This project is for educational and demonstration purposes.

---

<div align="center">

Built with ❤️ for learners, students, and professional mechanics.

</div>
