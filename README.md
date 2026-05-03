<div align="center">

<img src="https://img.shields.io/badge/⚡-EE%20ZONE-FF6B35?style=for-the-badge&labelColor=0A0A0F&color=FF6B35" alt="EE ZONE"/>

# ⚡ EE ZONE

### Next-Generation AI-Powered Electrical & Electronics Engineering Platform

<br/>

<!-- Core Tech -->
[![Next.js](https://img.shields.io/badge/Next.js-15.3-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)

<!-- Backend & DB -->
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.44-C5F74F?style=for-the-badge&logo=databricks&logoColor=black)](https://orm.drizzle.team)
[![Turso](https://img.shields.io/badge/Turso-libSQL-4FF8D2?style=for-the-badge&logo=sqlite&logoColor=black)](https://turso.tech)
[![Better Auth](https://img.shields.io/badge/Better_Auth-1.6-8B5CF6?style=for-the-badge&logo=auth0&logoColor=white)](https://better-auth.com)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://eezone-08-e8dm.vercel.app)

<!-- Status & License -->
[![Live](https://img.shields.io/badge/Status-Live%20%26%20Deployed-22C55E?style=for-the-badge&logo=statuspage&logoColor=white)](https://eezone-08-e8dm.vercel.app)
[![License](https://img.shields.io/badge/License-EOEL%20v1.0-FF6B35?style=for-the-badge&logo=opensourceinitiative&logoColor=white)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen?style=for-the-badge&logo=github&logoColor=white)](CONTRIBUTING.md)
[![Made in India](https://img.shields.io/badge/Made%20in-India-FF9933?style=for-the-badge&logo=googlemaps&logoColor=white)](https://github.com/ajinkyachalke008)

<br/>

[![Live Demo](https://img.shields.io/badge/LIVE%20DEMO-%20eezone--08--e8dm.vercel.app-6C63FF?style=for-the-badge&logo=vercel&logoColor=white)](https://eezone-08-e8dm.vercel.app)

<br/>

**Built with ⚡ by [Ajinkya Chalke](mailto:ajinkyachalke008@gmail.com) — Karad, Maharashtra, India**

*A unified intelligent workspace for electrical engineers, students, researchers, and professionals*

</div>

---

## 📌 Overview

**EE ZONE** is a production-grade, full-stack web platform that consolidates everything an electrical or electronics engineer needs into one intelligent workspace. Instead of juggling 10 different tools across different websites, EE Zone brings **circuit simulation, AI problem solving, engineering calculators, gamified learning, CAD diagramming, project management, and code compliance** into a single cohesive platform — with a dark, NeoLumen-themed UI built for serious technical work.

The platform is built on **Next.js 15 App Router**, backed by **Turso (libSQL)** with **Drizzle ORM**, authenticated via **Better Auth**, and deploys instantly to **Vercel**. AI features are powered via the **OpenRouter API**.

---

## 🌐 Live Demo

> **[https://eezone-08-e8dm.vercel.app](https://eezone-08-e8dm.vercel.app)**

---

## 🖼️ Preview

<div align="center">

<!-- 
  ═══════════════════════════════════════════════════════════
  HOW TO ADD SCREENSHOTS:

  Option 1 — Upload to GitHub:
    1. Go to your repo → Issues → New Issue
    2. Drag & drop your screenshot into the text box
    3. GitHub generates a URL like:
       https://user-images.githubusercontent.com/xxxxx/image.png
    4. Replace the placeholder below with that URL

  Option 2 — Add to repo:
    1. Create a folder: /public/previews/
    2. Add your screenshots there (e.g. homepage.png)
    3. Use relative path:
       ![EE Zone Homepage](./public/previews/homepage.png)

  Option 3 — Use a GIF (Recommended for impact):
    Tools: Loom, ScreenToGif, Kap (Mac), ShareX (Windows)
    Record a 15-30 second walkthrough of the platform
    Upload as above and replace the src below
  ═══════════════════════════════════════════════════════════
-->

| Homepage | Circuit Simulator |
|:---:|:---:|
| ![Homepage Preview](https://placehold.co/600x350/0A0A0F/FF6B35?text=Add+Homepage+Screenshot) | ![Circuit Sim Preview](https://placehold.co/600x350/0A0A0F/6C63FF?text=Add+Circuit+Sim+Screenshot) |

| Learning Hub | Magic CAD |
|:---:|:---:|
| ![Learning Hub Preview](https://placehold.co/600x350/0A0A0F/22C55E?text=Add+Learning+Hub+Screenshot) | ![Magic CAD Preview](https://placehold.co/600x350/0A0A0F/3B82F6?text=Add+Magic+CAD+Screenshot) |

> 📸 **To add your own screenshots:** Upload images to this repo under `/public/previews/` and replace the placeholder URLs above.

</div>

---

## ✨ Feature Modules

### 🤖 AI-Powered Tools (`/tools`)

| Tool | Description |
|------|-------------|
| **Instrument Scanner** | Upload or capture an image of any electrical instrument — AI identifies it and returns specs, usage guide, and safety notes |
| **Problem Solver** | Text or image input — solves Ohm's Law, KVL, KCL, AC/DC analysis, three-phase calculations step-by-step |
| **AI Circuit Designer** | Describe your system requirements in natural language — AI generates an optimized circuit schematic |
| **AI Code Assistant** | Generates PLC ladder logic, Arduino C++, and ESP32 firmware from project descriptions |
| **AI Troubleshooter** | Analyzes meter readings and equipment photos to diagnose faults |

---

### 🧮 Engineering Calculators (`/calculators`)

**Power Systems**
- Three-Phase Power Calculator, Short Circuit Analysis, Harmonic Analysis
- Load Schedule Generator, Conduit Fill Calculator, Grounding System Design

**Motor & Drive Systems**
- Motor Starter Sizing, VFD Calculator, Motor Selection Tool
- Belt & Chain Drive Calculator, Torque & Load Analysis

**Lighting & Energy**
- Lighting Design Calculator, Energy Cost Calculator, Solar PV System Designer
- Energy Audit Tool, ROI Analysis

**Quick Utilities**
- 555 Timer Calculator (astable & monostable modes fully implemented)
- Op-Amp Calculator (non-inverting, inverting, summing configs)
- Fuse & Breaker Sizing, Voltage Divider, PCB Trace Width, Thermal Management

---

### 🔌 Interactive Design & Simulation

**Circuit Simulator**
- Drag-and-drop circuit builder on infinite canvas
- 12+ professional SVG component symbols (resistor, capacitor, inductor, LED, diode, NPN transistor, op-amp, 555 timer, Arduino Uno, and more)
- DC / AC / Transient simulation with virtual oscilloscope
- Export to SVG, JSON, and SPICE netlist
- Snap-to-grid, undo/redo, live edit mode during simulation

**Schematic & Wiring Designer**
- Grid-based A* auto-routing algorithm for wire paths
- NEC-compliant wire color coding (black hot, red traveler, white neutral, green ground)
- Click-to-connect with auto-snap terminals
- Net management, labeling, and inspector panel
- Floor plan designer with room drawing
- Spatial indexing via `rbush` for performance
- Export to JSON with complete net data

---

### 🗺️ Magic CAD (`/magic-cad` & `/magic-cad-plus`)

Embedded **draw.io** integration, patched and configured specifically for EE Zone:
- Full diagramming environment for electrical schematics, P&IDs, and wiring diagrams
- AI Generate proxy connected to OpenRouter (`/api/drawio-generate`)
- Export proxy for diagram rendering (`/api/drawio-export`)
- EE Zone NeoLumen theme applied, service worker disabled for stable deployment
- Assets downloaded and patched automatically at **build time**

---

### 📚 Learning Hub (`/learn`)

**Gamified learning system:**
- Topic-based modules with completion tracking (`userTopicsProgress`)
- Quiz engine with multiple choice, scoring, timer, and difficulty levels
- Video tutorials with YouTube integration (`/api/youtube`)
- Downloadable resources — datasheets, guides, cheat sheets
- Bookmarks system for saving content

**Gamification Engine** (`/gamification`):
- XP points for completed activities, quizzes, and logins
- Badge system with category-based achievements
- Leaderboard with global rankings (`/leaderboard`)
- Daily login streaks
- User stats dashboard (`/progress`)

---

### 📁 Engineering Projects (`/projects`)

Community-driven project hub:
- Browse, rate, and comment on real-world electrical engineering projects
- Submit projects with step-by-step instructions and image uploads
- Rating and review system
- Filter by category and difficulty

---

### 🏛️ Code Compliance (`/tools` → Compliance)

- NEC Code Search (2020, 2023, 2026 editions)
- Compliance Checker for NEC and NFPA 70E
- Code Change Tracker, Jurisdiction Database, Permit Assistant

---

### 🔬 Diagnostics & Testing (`/tools` → Diagnostics)

- Maintenance Scheduler (NFPA 70B compliant)
- Test Report Generator (IEEE and NETA standards)
- Power Quality Analyzer (voltage sags, harmonics, load patterns)
- Thermal Imaging fault detection

---

### 💼 Career & Assessments (`/career`, `/assessments`)

- FE/PE exam preparation, engineering tutorials
- Resume builder, AI interview coaching, skill assessments

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 15.3 (App Router, React Server Components) |
| **Language** | TypeScript 5.9 |
| **Runtime** | Node.js 24.x / Bun 1.3 |
| **Styling** | Tailwind CSS v4, Framer Motion, shadcn/ui |
| **UI Primitives** | Radix UI (full suite), Lucide React, Tabler Icons |
| **3D / WebGL** | Three.js, @react-three/fiber, @react-three/drei |
| **Database** | Turso (libSQL edge database) via `@libsql/client` |
| **ORM** | Drizzle ORM 0.44 |
| **Auth** | Better Auth 1.6 |
| **AI / LLM** | OpenRouter API (meta/llama-3.3-70b and others) |
| **CAD Engine** | draw.io (diagx) — patched & embedded at build time |
| **Code Editor** | Monaco Editor |
| **Charts** | Recharts |
| **Payments** | Stripe + autumn-js |
| **Deployment** | Vercel (iad1 — US East, Node.js serverless) |
| **Package Manager** | Bun |

---

## 🗄️ Database Schema

The platform uses **Turso (libSQL)** — a SQLite-compatible edge database. Key tables:

```
users / sessions           → Better Auth managed
apps                       → Apps library entries
articles / topics          → Learning content
questions / quizAttempts   → Quiz engine
questionAttempts           → Per-answer tracking
videoTutorials             → YouTube-linked tutorials
downloadableResources      → PDFs, guides, datasheets
bookmarks                  → Saved items per user
projects / projectsNew     → Community projects
projectSteps(New)          → Step-by-step project instructions
projectRatings(New)        → Star ratings
projectComments(New)       → Discussion threads
projectUploads             → Attached project files
circuitProjects            → Saved circuit designs
userStats                  → Points, level, rank
userPoints                 → Activity-based point log
userActivities             → Action history
userBadges(New)            → Earned achievements
dailyLoginStreaks           → Streak tracking
userTopicsProgress         → Module completion tracking
leaderboardEntries         → Ranked global scores
achievements / badges      → Badge definitions & metadata
```

---

## ⚙️ Local Development

### Prerequisites

- Node.js 20+ or Bun 1.3+
- [Turso](https://turso.tech) account (free tier)
- [OpenRouter](https://openrouter.ai) API key (free tier)

### 1. Clone the Repository

```bash
git clone https://github.com/ajinkyachalke008/EEZONE-08.git
cd EEZONE-08
```

### 2. Install Dependencies

```bash
bun install
# or
npm install --legacy-peer-deps
```

### 3. Configure Environment Variables

Create a `.env` file in the root:

```env
# Database (Turso)
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your_turso_auth_token

# Authentication (Better Auth)
BETTER_AUTH_SECRET=your_random_secret_min_32_chars
BETTER_AUTH_URL=http://localhost:3000

# AI (OpenRouter)
OPENROUTER_API_KEY=your_openrouter_api_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Push Database Schema

```bash
bun run drizzle-kit push
```

### 5. Run Development Server

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 6. Build for Production

```bash
bun run build
bun start
```

---

## 🚀 Vercel Deployment

1. Push this repo to GitHub
2. Import project at [vercel.com](https://vercel.com)
3. Add all environment variables from `.env` above
4. Deploy — Vercel auto-detects Next.js

> **Note:** The draw.io assets (~20MB) are downloaded and patched at **build time** via `scripts/download-drawio.js` — no manual setup needed. The script does a sparse git checkout, patches the AI proxy URL, disables the service worker, and copies assets to `public/drawio`.

---

## 📁 Project Structure

```
EEZONE-08/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/                # API route handlers
│   │   │   ├── ai-assistant/   ai-circuit/   ai-code/   ai-troubleshoot/
│   │   │   ├── analyze-instrument/   solve-problem/
│   │   │   ├── circuit-projects/   drawio-export/   drawio-generate/
│   │   │   ├── gamification/   learn/   projects/   projects-new/
│   │   │   ├── tutorials/   youtube/   apps/
│   │   ├── apps/               # Apps Library page
│   │   ├── assessments/        # Skill assessment pages
│   │   ├── calculators/        # Engineering calculator pages
│   │   ├── career/             # Career tools
│   │   ├── gamification/       # XP, badges, achievements
│   │   ├── leaderboard/        # Global rankings
│   │   ├── learn/              # Learning hub + quiz engine
│   │   ├── magic-cad/          # draw.io CAD (standard)
│   │   ├── magic-cad-plus/     # draw.io CAD (advanced)
│   │   ├── progress/           # User progress dashboard
│   │   ├── projects/           # Community projects
│   │   ├── tools/              # All engineering tool pages
│   │   └── tutorials/          # Video tutorials
│   ├── components/ui/          # shadcn/ui component library
│   ├── db/
│   │   └── schema.ts           # Drizzle ORM schema (all tables)
│   └── lib/
│       ├── auth.ts             # Better Auth configuration
│       └── db.ts               # Turso libSQL client
├── scripts/
│   └── download-drawio.js      # Build-time draw.io download & patch
├── drizzle/                    # Drizzle migration snapshots
├── drizzle.config.ts
├── next.config.ts
└── package.json
```

---

## 🔑 Key Architectural Decisions

**Why Turso over Postgres?**
Turso (libSQL) runs at the Vercel edge with extremely low latency, the free tier is generous, and the SQLite-compatible API pairs perfectly with Drizzle ORM for type-safe queries without the overhead of a managed Postgres instance.

**Why Better Auth over NextAuth?**
Better Auth 1.6 offers first-class Drizzle adapter support, a clean API surface, and significantly less boilerplate than NextAuth v5 for the same feature set.

**Why draw.io via build-time download?**
draw.io's full app cannot be installed via npm. The build script does a sparse git checkout of only the necessary webapp assets, patches the AI proxy endpoint, disables the service worker (incompatible with Vercel), and outputs to `public/drawio` — fully transparent to the deployment pipeline.

**Why OpenRouter over direct model APIs?**
OpenRouter provides a unified API across 100+ models with a generous free tier, enabling the platform to use the best available model without being locked to a single provider or paying per-token costs during development.

---

## 🛣️ Roadmap

- [ ] **Hero / Landing Page** — NeoLumen marketing page with animated feature demos
- [ ] **Stripe Billing** — Premium tier activation via autumn-js + Stripe webhooks
- [ ] **Social Auth** — Google & GitHub OAuth via Better Auth
- [ ] **WebAssembly SPICE Engine** — Real circuit simulation backend
- [ ] **Mobile Optimization** — Responsive layouts for all calculator tools
- [ ] **PWA Support** — Installable offline-first app
- [ ] **PDF Report Export** — Professional engineering report generation
- [ ] **AR Circuit Overlay** — Camera feed + live circuit diagram overlay

---

## 👨‍💻 Author

**Ajinkya Chalke**
Engineering Student | AI/ML & Full-Stack Developer | Karad, Maharashtra, India

- 📧 Email: [ajinkyachalke008@gmail.com](mailto:ajinkyachalke008@gmail.com)
- 🔗 GitHub: [@ajinkyachalke008](https://github.com/ajinkyachalke008)

---

## 📄 License

<div align="center">

[![License](https://img.shields.io/badge/License-EOEL%20v1.0-FF6B35?style=for-the-badge&logo=opensourceinitiative&logoColor=white)](LICENSE)
[![Free for Education](https://img.shields.io/badge/Education-Free%20%26%20Open-22C55E?style=for-the-badge&logo=readthedocs&logoColor=white)](LICENSE)
[![Attribution Required](https://img.shields.io/badge/Attribution-Required-F59E0B?style=for-the-badge&logo=creativecommons&logoColor=white)](LICENSE)
[![Commercial Use](https://img.shields.io/badge/Commercial%20Use-With%20Credit-3B82F6?style=for-the-badge&logo=handshake&logoColor=white)](LICENSE)

</div>

This project is governed by the **EE Zone Open Engineering License (EOEL) v1.0** — a custom license written specifically for this platform.

### ✅ What You CAN Do

| Permission | Who |
|---|---|
| Use, study, and learn from the source code | ✅ Everyone |
| Fork and modify for academic projects | ✅ Everyone |
| Deploy for classroom / university use | ✅ Everyone |
| Share within educational communities | ✅ Everyone |
| Use commercially (with attribution) | ✅ With credit to Ajinkya Chalke |
| Submit pull requests & contributions | ✅ Everyone |

### ❌ What You CANNOT Do

| Restriction | Detail |
|---|---|
| Remove authorship credit | Attribution to Ajinkya Chalke is mandatory |
| White-label & rebrand as your own | Public deployments must link to original repo |
| Sell AI features as standalone product | Instrument Scanner, AI Designer etc. are protected |
| Use without crediting the original author | Even in commercial use — credit is non-negotiable |

### 📌 Attribution Required

Any public deployment must display:

```
Powered by EE ZONE — Built by Ajinkya Chalke
https://github.com/ajinkyachalke008/EEZONE-08
```

Any academic paper referencing this project must cite:

```
Chalke, A. (2025). EE ZONE: AI-Powered Electrical Engineering Platform.
GitHub. https://github.com/ajinkyachalke008/EEZONE-08
```

> ⚠️ **Engineering Safety Notice:** All calculators, simulations, and compliance tools are for educational reference only. Do not use outputs as the sole basis for real-world electrical installations. Always consult a licensed Professional Engineer.

See the full [LICENSE](LICENSE) file for complete terms.

---

<div align="center">

**⚡ EE ZONE — Built for Engineers, by an Engineer ⚡**

*If this project helped you, please ⭐ star the repository*

</div>
