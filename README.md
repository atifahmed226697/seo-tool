# SEO Toolkit - Step 1A (UI & Structure)

A modern, responsive, and privacy-first suite of utility tools for webmasters, digital marketers, and developers. Built using **Next.js (App Router)**, **TypeScript**, and **Tailwind CSS**.

> **Step 1A Scope:** This release establishes the visual structure, layout components, design system, and placeholder UI for all 7 tools. No external APIs, database, auth, or backend business logic are active in this step.

---

## 🛠️ Project Structure

```text
seo-toolkit/
├── app/
│   ├── layout.tsx                     # Root layout with Navbar, Footer & SEO metadata
│   ├── page.tsx                       # Homepage with Hero, Tools Grid, Why Us & FAQ
│   ├── globals.css                    # Tailwind CSS directives & color variables
│   ├── robots.ts                      # Dynamic robots.txt configuration
│   ├── sitemap.ts                     # Dynamic sitemap generator from lib/tools.ts
│   └── tools/
│       ├── case-converter/page.tsx     # Text case converter (disabled preview)
│       ├── meta-tag-generator/page.tsx # HTML & Social meta tag generator (preview)
│       ├── meta-tag-analyzer/page.tsx  # Live page metadata crawler (preview)
│       ├── domain-age-checker/page.tsx # WHOIS / domain age lookup (preview)
│       ├── da-pa-checker/page.tsx      # Moz DA/PA authority checker (preview)
│       ├── spam-score-checker/page.tsx # Domain toxicity & spam score (preview)
│       └── google-index-checker/page.tsx # Google SERP index checker (preview)
├── components/
│   ├── Navbar.tsx                     # Sticky header with tools dropdown & mobile menu
│   ├── Footer.tsx                     # Categorized links to all 7 tools from lib/tools.ts
│   ├── ToolCard.tsx                   # Tool card with icon, status, category & hover state
│   ├── ToolLayout.tsx                 # Shared tool wrapper (breadcrumbs, notice, how-to, related)
│   ├── ToolIcon.tsx                   # Safe Lucide-React icon renderer
│   ├── ComingSoonBadge.tsx            # Status indicator ("ready-next" | "needs-api")
│   ├── FaqAccordion.tsx               # Interactive FAQ accordion for homepage
│   └── tools/
│       ├── DaPaCheckerUI.tsx          # Single / Bulk tabs + empty results table
│       ├── SpamScoreCheckerUI.tsx      # Single / Bulk tabs + empty results table
│       └── GoogleIndexCheckerUI.tsx    # Single / Bulk tabs + empty results table
├── lib/
│   └── tools.ts                       # Single source of truth for all tools & categories
├── .env.example                       # Environment variables documentation
├── .gitignore                         # Standard Next.js gitignore
├── next.config.mjs                    # Next.js build configuration
├── package.json                       # Scripts and project dependencies
├── postcss.config.mjs                 # PostCSS configuration for Tailwind CSS
├── tailwind.config.ts                 # Tailwind CSS theme and dark mode setup
├── tsconfig.json                      # Strict TypeScript compiler options
└── README.md                          # Project documentation and run guide
```

---

## 🚀 Quick Start & Run Instructions

### Prerequisites
- Node.js (version 18.17+ or 20.x recommended)
- npm, yarn, or pnpm

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build & Check
```bash
npm run build
npm run start
```

---

## 🧭 Tools Catalog & Single Source of Truth (`lib/tools.ts`)

All navigation items, homepage cards, related tool widgets, and dynamic sitemaps derive directly from `lib/tools.ts`:

| Tool | Slug | Category | Status | Next Milestone |
|---|---|---|---|---|
| **Case Converter** | `case-converter` | Content & Copy | `ready-next` | Step 1B (In-browser transformation) |
| **Meta Tag Generator** | `meta-tag-generator` | On-Page SEO | `ready-next` | Step 1B (Client-side HTML/OG generator) |
| **Meta Tag Analyzer** | `meta-tag-analyzer` | On-Page SEO | `needs-api` | Step 2 (Server scraper & DOM parser) |
| **Domain Age Checker** | `domain-age-checker` | Domain Research | `needs-api` | Step 2 (RDAP & WHOIS integration) |
| **DA / PA Checker** | `da-pa-checker` | Authority & Backlinks | `needs-api` | Step 2 (Moz / SEO authority metrics API) |
| **Spam Score Checker** | `spam-score-checker` | Authority & Backlinks | `needs-api` | Step 2 (Domain penalty & backlink toxicity API) |
| **Google Index Checker**| `google-index-checker` | Indexing & SERP | `needs-api` | Step 2 (Search index crawler & cache API) |

---

## 🎨 Design & Features

- **Tailwind CSS & Mobile Responsive**: Optimized for fluid breakpoints (mobile, tablet, desktop).
- **Light & Dark Mode Friendly**: High contrast slate palettes, accessible border states, and subtle glowing accents.
- **Shared `ToolLayout`**:
  - Breadcrumb navigation (`Home > Tools > [Tool Name]`).
  - H1 title and contextual description.
  - Visible **"Coming in next step"** notice on every tool.
  - Three-step "How to use" guide.
  - Related tools recommendation block (3 contextual tools from `lib/tools.ts`).
- **SEO Ready**:
  - Dynamic `app/sitemap.ts` mapping all tool routes automatically.
  - `app/robots.ts` configured for clean web crawling.
  - Unique metadata titles and descriptions per page.
