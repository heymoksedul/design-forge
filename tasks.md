# DesignForge — Task Tracker & Implementation Roadmap

> **Product:** DesignForge (Figma → Production Code + `DESIGN.md`)  
> **Source Plan:** [`plan.md`](./plan.md)  
> **Tracking Status:** Active  

---

## 📊 Roadmap Overview & Phase Progress

| Phase | Description | Target / Packages | Status |
| :--- | :--- | :--- | :--- |
| **Phase 0** | Monorepo Setup & Workspace Infrastructure | `root`, `apps/*`, `packages/*` | [x] Completed |
| **Phase 1 [MVP 1 Priority]** | Comprehensive Design System IR & Zod Schemas | `packages/design-ir`, `packages/schemas` | [x] Completed |
| **Phase 2 [MVP 1 Priority]** | Deep Figma Parser (Per-Component Metrics & Styles) | `packages/figma-parser` | [x] Completed |
| **Phase 3 [MVP 1 Priority]** | `DESIGN_SYSTEM.md` High-Detail Generator | `packages/generators` | [x] Completed |
| **Phase 4 [MVP 1 Priority]** | Plugin UI & Dev Mode One-Click Exporter | `apps/plugin` | [x] Completed |
| **Phase 5 [MVP 1 Priority]** | Deep Precision Engine (Borders, Clips, Positioning, CSS/Tailwind) | `packages/*`, `apps/plugin` | [x] Completed |
| **Phase 5.1 [MVP 1 Priority]** | Asset Manifest Engine (SVG/PNG), WCAG Contrast (A11y) & Rem Typography | `packages/*`, `apps/plugin` | [x] Completed |
| **Phase 6 [Next MVP]** | Next.js + Tailwind Code Generator | `packages/generators/nextjs` | [ ] Deferred |
| **Phase 7 [Next MVP]** | HTML/CSS/JS Generator | `packages/generators/html` | [ ] Deferred |
| **Phase 8 [Next MVP]** | Asset Pipeline & ZIP Bundler | `packages/asset-pipeline`, `packages/exporter` | [ ] Deferred |
| **Phase 9 [Next MVP]** | AI Semantic Enhancement & Multi-Provider Layer | `packages/ai` | [ ] Deferred |
| **Phase 10 [Next MVP]** | Backend API & Cloud Integration | `apps/web` | [ ] Deferred |

---

## 🛠️ Phase 0: Monorepo Setup & Workspace Infrastructure
**Goal:** Initialize a scalable monorepo tooling base using `pnpm` and `Turborepo` with unified linting, typechecking, and testing.

- [x] **0.1** Initialize Git and root configuration:
  - [x] Create `.gitignore`
  - [x] Create `package.json` (workspace root)
  - [x] Create `pnpm-workspace.yaml` defining `apps/*` and `packages/*`
- [x] **0.2** Configure Turborepo (`turbo.json`):
  - [x] Define build pipelines (`build`, `test`, `lint`, `typecheck`, `clean`)
  - [x] Setup caching inputs and output directories (`dist/`, `.next/`)
- [x] **0.3** Shared TypeScript configs:
  - [x] Create `packages/config/tsconfig.base.json`
  - [x] Create configs for React/Next.js and Figma Plugin
- [x] **0.4** Shared Code Quality Tooling:
  - [x] Root ESLint configuration (`.eslintrc.js` or flat config)
  - [x] Root Prettier configuration (`.prettierrc`)
  - [x] Vitest setup across workspaces
- [x] **0.5** Scaffolding placeholder packages:
  - [x] `packages/design-ir`
  - [x] `packages/figma-parser`
  - [x] `packages/generators`
  - [x] `packages/ai`
  - [x] `packages/schemas`
  - [x] `packages/asset-pipeline`
  - [x] `packages/exporter`
  - [x] `packages/utils`
  - [x] `apps/plugin`
  - [x] `apps/web`

**Acceptance Criteria (DoD):**
- [x] `pnpm install` succeeds without dependency conflicts.
- [x] `pnpm build`, `pnpm typecheck`, and `pnpm test` run across all packages without errors.

---

## 📐 Phase 1: Design IR Types & Zod Schemas
**Goal:** Define the single source of truth for design representations (Intermediate Representation / AST) independent of Figma and LLMs.

- [ ] **1.1** Define Core Document & Node Types (`packages/design-ir`):
  - [ ] `DesignDocument` interface (viewport, tokens, assets, components, root node)
  - [ ] `DesignNode` interface (id, name, type, layout, style, typography, content, children)
  - [ ] Node classification enum (`page`, `section`, `container`, `stack`, `grid`, `heading`, `paragraph`, `button`, `link`, `image`, `icon`, `input`, `card`, `list`, `navigation`, `footer`, etc.)
- [ ] **1.2** Define Layout & Style Token Structures:
  - [ ] `LayoutDefinition` (flex direction, wrap, gap, padding, align, justify, sizing modes)
  - [ ] `TypographyDefinition` (font family, weight, size, line-height, letter-spacing, text align)
  - [ ] `StyleDefinition` (fills, strokes, border radius, shadows, opacity, blend modes)
  - [ ] `DesignTokens` (colors, typography, spacing, radii, shadows)
- [ ] **1.3** Define Zod Validation Schemas (`packages/schemas`):
  - [ ] Zod schema for `DesignDocument` and `DesignNode`
  - [ ] Schema validation utilities and serialization helpers
  - [ ] Token deduplication helper types

**Acceptance Criteria (DoD):**
- Unit tests verifying Zod schemas properly accept valid IR objects and reject malformed structures.

---

## 🔍 Phase 2: Figma Node Parser & Extraction Engine
**Goal:** Convert live Figma nodes into deterministic Design IR without relying on AI.

- [ ] **2.1** Node Traversal & Selection Validator (`packages/figma-parser`):
  - [ ] Selection validation: support `FRAME`, `COMPONENT`, `COMPONENT_SET`, `INSTANCE`
  - [ ] Graceful rejection for unsupported or empty selections
  - [ ] Safe recursive node traversal with depth & node count safety guards
- [ ] **2.2** Layout Extraction (`layout-parser.ts`):
  - [ ] Extract Auto Layout (direction, spacing/gap, padding, alignment, hug/fill/fixed)
  - [ ] Fallback calculation for non-Auto Layout frames (bounding box, relative coordinates)
- [ ] **2.3** Typography & Style Parsers (`typography-parser.ts`, `style-parser.ts`):
  - [ ] Extract typography metrics and text runs
  - [ ] Extract solid colors, gradients, image fills, strokes, border radii, shadows
  - [ ] Token normalization and deduplication
- [ ] **2.4** Component & Asset Detection (`component-parser.ts`, `asset-parser.ts`):
  - [ ] Detect component definitions, instances, variants, and overrides
  - [ ] Detect vector icons and raster image nodes for export
- [ ] **2.5** Parser Test Suite & Fixtures:
  - [ ] Create synthetic Figma node mock fixtures (simple button, hero section, card grid)
  - [ ] Verify deterministic output: same input nodes always yield identical Design IR

**Acceptance Criteria (DoD):**
- Parser successfully transforms mock Figma node trees into validated `DesignDocument` instances.
- Zero crashes on unsupported node types (graceful fallback to `unknown` or `group`).

---

## 🌐 Phase 3: Deterministic HTML/CSS/JS Generator
**Goal:** Generate clean, modern, framework-free HTML5 + CSS3 + Vanilla JS from Design IR.

- [ ] **3.1** HTML Structure Generator:
  - [ ] Map semantic nodes to HTML5 elements (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`, `<button>`, `<a>`, `<p>`, `<h1>`-`<h6>`)
  - [ ] Generate clean indentation and valid DOM tree
- [ ] **3.2** CSS Generation:
  - [ ] CSS Custom Properties (`:root { ... }`) for color, typography, and spacing tokens
  - [ ] Responsive Flexbox and CSS Grid layout generation based on IR layout definitions
  - [ ] Reset and utility classes
- [ ] **3.3** Assets & Script Integration:
  - [ ] Link extracted images and SVG icons with relative paths (`./assets/...`)
  - [ ] Minimal Vanilla JS boilerplate (mobile menu toggle, basic interactive controls)
- [ ] **3.4** Unit & Snapshot Tests:
  - [ ] Verify generated HTML syntax validity
  - [ ] Snapshot testing for standard fixtures

**Acceptance Criteria (DoD):**
- Output directory contains standalone `index.html`, `styles.css`, `script.js`, and `assets/`.
- Opens and displays properly in any modern browser without build tools.

---

## ⚡ Phase 4: Deterministic Next.js + Tailwind Generator
**Goal:** Generate an idiomatic, build-ready Next.js (App Router) project in TypeScript with Tailwind CSS.

- [ ] **4.1** Project Scaffolding Generator:
  - [ ] Generate `package.json` with dependencies (`next`, `react`, `react-dom`, `tailwindcss`, `lucide-react`, `typescript`)
  - [ ] Generate `tsconfig.json`, `next.config.mjs`, `postcss.config.mjs`
  - [ ] Generate `app/layout.tsx` and `app/globals.css`
- [ ] **4.2** Tailwind Mapping Engine:
  - [ ] Map IR colors, font sizes, gaps, padding, and radii to Tailwind classes
  - [ ] Avoid arbitrary coordinate positioning (`top-[127px]`); enforce flex/grid/container layouts
  - [ ] Inject CSS variable theme tokens into `globals.css` or Tailwind configuration
- [ ] **4.3** Component Generator:
  - [ ] Extract reusable components into `components/<ComponentName>.tsx`
  - [ ] Generate clean props interfaces for component instances and variants
  - [ ] Assemble `app/page.tsx` composing sections and components
- [ ] **4.4** Asset Handling:
  - [ ] Wire images via `next/image` with proper `width`, `height`, and `alt` tags
  - [ ] Map asset file paths to `public/assets/...`
- [ ] **4.5** Next.js Generator Test Suite:
  - [ ] Snapshot test output files
  - [ ] Verify generated code passes TypeScript typechecking (`tsc --noEmit`)

**Acceptance Criteria (DoD):**
- Generated Next.js project runs `npm install && npm run build` without TypeScript or syntax errors.

---

## 📝 Phase 5: `DESIGN.md` System Documentation Generator
**Goal:** Generate human-readable and AI-actionable design system documentation.

- [ ] **5.1** Markdown Template & Section Assembly:
  - [ ] Design Overview & Visual Direction
  - [ ] Color Palette (hex, token names, contrast/usage roles)
  - [ ] Typography Scales (font family, sizes, weights, line-heights)
  - [ ] Layout & Spacing System (container widths, section gaps, grid rules)
  - [ ] Component & Variant Inventory
  - [ ] Asset Manifest
  - [ ] Inferred Responsive Behavior & Breakpoints
  - [ ] Accessibility & Implementation Rules for AI coding agents
- [ ] **5.2** Explicit Assumptions Tracker:
  - [ ] Explicitly mark inferred rules (e.g. "Mobile stacking inferred; no mobile frame provided")
  - [ ] Never present AI hallucinations as measured Figma facts
- [ ] **5.3** Unit Tests for Markdown Output:
  - [ ] Verify markdown structure, table formatting, and heading hierarchy

**Acceptance Criteria (DoD):**
- Generated `DESIGN.md` is valid markdown and directly usable as context for LLM coding agents.

---

## 📦 Phase 6: Asset Pipeline & JSZip Exporter
**Goal:** Extract, optimize, and bundle source files and assets into a single downloadable ZIP archive.

- [ ] **6.1** Asset Pipeline (`packages/asset-pipeline`):
  - [ ] Binary raster image extraction (`exportAsync` to PNG/WebP)
  - [ ] SVG vector export and sanitization
  - [ ] Deterministic filename generation (`slugify(node.name) + hash`)
  - [ ] Asset deduplication by buffer/content hash
- [ ] **6.2** ZIP Packaging Engine (`packages/exporter`):
  - [ ] Integrate `JSZip`
  - [ ] Structure files according to target (`nextjs`, `html`, or `design-md`)
  - [ ] Generate project `README.md` explaining setup instructions and assumptions
  - [ ] Sanitize paths to prevent directory traversal (`../../`)
- [ ] **6.3** Test Suite:
  - [ ] Test zip creation in Node.js and browser/plugin environments
  - [ ] Test integrity of bundled assets and text files

**Acceptance Criteria (DoD):**
- Produces an uncorrupted `.zip` file containing source code, assets, `DESIGN.md`, and `README.md`.

---

## 🔌 Phase 7: Figma Plugin UI & Typed Messaging Bridge
**Goal:** Build the interactive Figma plugin UI with React and establish a robust, typed messaging bridge.

- [ ] **7.1** Plugin Sandbox Controller (`apps/plugin/src/main.ts`):
  - [ ] Track selection changes (`figma.on('selectionchange')`)
  - [ ] Selection validation & error reporting to UI
  - [ ] Execute `exportAsync` for requested asset nodes
- [ ] **7.2** Typed Messaging System (`apps/plugin/src/messaging`):
  - [ ] Define request/response message types (`ANALYZE_SELECTION`, `SELECTION_INFO`, `START_GENERATION`, `PROGRESS_UPDATE`, `EXPORT_COMPLETE`, `ERROR`)
  - [ ] Robust message handlers between `main.ts` (QuickJS) and `ui.html` (iframe)
- [ ] **7.3** Plugin UI React Application (`apps/plugin/src/ui`):
  - [ ] Step 1: Selection summary card (node count, frame dimensions)
  - [ ] Step 2: Target selection (Next.js / HTML / DESIGN.md) & AI Provider selection
  - [ ] Step 3: Analysis summary (sections detected, tokens, assets)
  - [ ] Step 4: Progress state machine (Parsing → Analyzing → Generating → Packaging)
  - [ ] Step 5: Download ZIP button & error banners
- [ ] **7.4** Plugin Build Configuration:
  - [ ] Setup bundler (Vite or esbuild) for `main.ts` and single-file `ui.html`
  - [ ] Configure `manifest.json` with correct network and UI permissions

**Acceptance Criteria (DoD):**
- Plugin runs inside Figma Desktop / Web, accurately detects user selection, and manages state transitions cleanly.

---

## 🚀 Phase 8: Backend API & Route Handlers
**Goal:** Implement Next.js server-side route handlers to safely execute AI analysis, code generation, and export.

- [ ] **8.1** Route Handlers Scaffolding (`apps/web/app/api`):
  - [ ] `POST /api/analyze` — Run deterministic analysis + optional AI semantic classification
  - [ ] `POST /api/generate` — Orchestrate code and `DESIGN.md` generators
  - [ ] `POST /api/generate/zip` — Bundle into downloadable ZIP
  - [ ] `GET  /api/health` — Health and provider connectivity status
- [ ] **8.2** Security & Middleware:
  - [ ] Request body size limits (e.g. max 10MB)
  - [ ] Origin verification / CORS headers for Figma plugin iframe
  - [ ] Rate limiting (Upstash Redis or in-memory limiter for MVP)
  - [ ] Strict secret isolation (ensure zero API keys leak to plugin bundle)
- [ ] **8.3** Backend Integration Tests:
  - [ ] Test API endpoints with mock Design IR payloads

**Acceptance Criteria (DoD):**
- Backend endpoints accept valid requests, invoke generators, and return structured responses / ZIP streams.

---

## 🤖 Phase 9: AI Provider Abstraction (Gemini & Cloudflare)
**Goal:** Implement a vendor-neutral AI abstraction layer supporting Gemini and Cloudflare Workers AI.

- [ ] **9.1** Provider Interface & Factory (`packages/ai/core`):
  - [ ] `AIProvider` interface (`analyzeDesign`, `generateDesignMd`, `improveCode`)
  - [ ] `AIProviderFactory` (`getProvider("gemini" | "cloudflare")`)
  - [ ] Versioned prompts directory (`prompts/design-analysis.v1.ts`, `prompts/responsive.v1.ts`)
- [ ] **9.2** Gemini Integration (`packages/ai/gemini`):
  - [ ] Google GenAI SDK integration with `GEMINI_API_KEY` and configurable model
  - [ ] Structured JSON output via schema enforcement
  - [ ] Implement semantic section classification and responsive layout inference
- [ ] **9.3** Cloudflare Workers AI Integration (`packages/ai/cloudflare`):
  - [ ] Cloudflare REST API client with Account ID & API Token
  - [ ] Structured JSON parsing & error fallback
- [ ] **9.4** AI Payload Optimization:
  - [ ] Strip non-essential node properties before dispatching to LLM
  - [ ] Token and cost reduction filtering
- [ ] **9.5** AI Provider Tests:
  - [ ] Mocked unit tests for Gemini and Cloudflare adapters
  - [ ] Timeout (15s) and automatic single-retry logic

**Acceptance Criteria (DoD):**
- Can swap between Gemini and Cloudflare providers with zero changes to generator or caller logic.
- All AI responses conform strictly to Zod schemas.

---

## 🛡️ Phase 10: Validation, Build Checker & AI Repair Loop
**Goal:** Validate generated code automatically and provide a bounded AI repair cycle for failed builds.

- [ ] **10.1** In-Memory Code Validation:
  - [ ] TypeScript AST syntax validation using TypeScript compiler API
  - [ ] Unused import / broken reference checks
- [ ] **10.2** Bounded AI Repair Loop:
  - [ ] If syntax or type check fails, capture error message and file snippet
  - [ ] Invoke `aiProvider.improveCode({ error, code })`
  - [ ] Enforce hard limit: `maxRepairAttempts = 2`
  - [ ] Fall back to deterministic template if repair fails
- [ ] **10.3** Validation Logging:
  - [ ] Log repair metrics without recording sensitive code or keys

**Acceptance Criteria (DoD):**
- Faulty generated code triggers repair and either passes validation or falls back gracefully without hanging.

---

## 🏆 Phase 11: Golden Fixtures, Testing & Private Beta Readiness
**Goal:** Assemble end-to-end regression fixtures, verify real Figma designs, and prepare for private beta.

- [ ] **11.1** Golden Test Fixtures (`fixtures/`):
  - [ ] `hero-simple`: Hero title, subtitle, CTA button, background image
  - [ ] `feature-grid`: 3-column feature card grid
  - [ ] `pricing-table`: Pricing tiers with badges and feature lists
  - [ ] `navbar-footer`: Responsive header and footer components
  - [ ] `full-saas-landing`: End-to-end landing page
- [ ] **11.2** Automated End-to-End Test Suite:
  - [ ] Figma mock → Design IR → HTML/Next.js/DESIGN.md → ZIP
  - [ ] Snapshot regression tests
- [ ] **11.3** Manual Beta Testing Checklist:
  - [ ] Test with at least 5 real-world Figma community landing pages
  - [ ] Verify generated Next.js ZIP runs `pnpm dev` immediately out of the box
  - [ ] Verify mobile responsiveness of generated components
- [ ] **11.4** Documentation & Developer Guide:
  - [ ] Complete root `README.md` with monorepo setup steps
  - [ ] `.env.example` with required AI provider keys

**Acceptance Criteria (DoD):**
- All 5 golden fixtures pass automated tests.
- Full user flow from Figma selection to runnable Next.js app verified end-to-end.
