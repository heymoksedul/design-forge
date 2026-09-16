# DesignForge — Complete MVP Plan

> **Product:** Figma → Production Code + Design Documentation  
> **Primary outputs:** Next.js + TypeScript + Tailwind CSS, HTML + CSS + JavaScript, and `DESIGN.md`  
> **AI providers:** Gemini API and Cloudflare AI, behind a provider abstraction  
> **Architecture principle:** Figma → Design IR/AST → deterministic generators + optional AI enhancement

---

## 1. Product Vision

DesignForge is a Figma plugin and supporting web/backend system that converts selected Figma designs into structured, production-oriented frontend code and AI-readable design documentation.

The first MVP should focus on:

1. Reading a selected Figma frame or component tree.
2. Converting Figma nodes into a normalized Design IR (Intermediate Representation).
3. Generating:
   - Next.js + TypeScript + Tailwind CSS
   - HTML + CSS + JavaScript
   - `DESIGN.md`
4. Exporting assets.
5. Optionally using AI to improve semantic interpretation, responsive behavior, component naming, and documentation.
6. Supporting Gemini and Cloudflare AI through one provider interface.
7. Exporting the result as a ZIP.

The product must not depend on a single AI vendor.

---

# 2. MVP Goals

## Must Have

- [ ] Figma plugin
- [ ] Selected-frame detection
- [ ] Figma node parser
- [ ] Design IR / AST
- [ ] Auto Layout extraction
- [ ] Typography extraction
- [ ] Color/style extraction
- [ ] Border/radius/shadow extraction
- [ ] Component and instance detection
- [ ] Image/SVG asset extraction
- [ ] Next.js generator
- [ ] TypeScript generator
- [ ] Tailwind CSS generator
- [ ] HTML/CSS/JS generator
- [ ] `DESIGN.md` generator
- [ ] Gemini provider
- [ ] Cloudflare AI provider
- [ ] AI provider abstraction
- [ ] Zod validation
- [ ] ZIP export
- [ ] Basic responsive inference
- [ ] Error handling
- [ ] Generation progress UI

## Nice to Have in MVP

- [ ] AI semantic section detection
- [ ] AI component naming
- [ ] AI responsive suggestions
- [ ] AI-generated accessibility notes
- [ ] Generation history
- [ ] Web dashboard
- [ ] PostgreSQL persistence
- [ ] R2 asset storage

## Explicitly Out of Scope for Initial MVP

- [ ] Full visual pixel-perfect guarantee
- [ ] Automatic animation recreation
- [ ] Full interaction/state recreation
- [ ] GitHub deployment
- [ ] Vercel deployment
- [ ] Billing/subscriptions
- [ ] Team collaboration
- [ ] Live browser editor
- [ ] VS Code extension
- [ ] Full design-to-production CI/CD
- [ ] Automatic conversion of arbitrary absolute-positioned designs into perfect responsive layouts

---

# 3. Core User Flow

```text
Open Figma
   ↓
Select a Frame / Component
   ↓
Open DesignForge
   ↓
Plugin validates selection
   ↓
Analyze Design
   ↓
Figma Parser
   ↓
Design IR
   ↓
Optional AI Analysis
   ↓
Choose Export Target
   ├── Next.js
   ├── HTML/CSS/JS
   └── DESIGN.md
   ↓
Generate
   ↓
Validate
   ↓
Package Assets + Source
   ↓
Download ZIP
```

---

# 4. Product Architecture

```text
                         FIGMA
                           │
                           ▼
                  DesignForge Plugin
                           │
                           ▼
                    Figma Parser
                           │
                           ▼
                    Design IR / AST
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
          Next.js        HTML        DESIGN.md
         Generator     Generator     Generator
              │            │            │
              └────────────┼────────────┘
                           │
                           ▼
                     AI Enhancement
                           │
                ┌──────────┴──────────┐
                │                     │
                ▼                     ▼
             Gemini             Cloudflare AI
                │                     │
                └──────────┬──────────┘
                           ▼
                       Validator
                           │
                           ▼
                       ZIP Export
```

The parser and generators must remain usable without AI.

---

# 5. Recommended Technology Stack

## Core

- TypeScript
- Node.js
- pnpm
- Turborepo
- ESLint
- Prettier

## Figma

- Figma Plugin API
- `@figma/plugin-typings`
- React for plugin UI
- TypeScript

## Web

- Next.js
- App Router
- React
- Tailwind CSS
- TypeScript

## Validation

- Zod

## Backend

- Next.js Route Handlers for MVP
- PostgreSQL
- Prisma

## AI

- Gemini API
- Cloudflare Workers AI
- Optional Cloudflare AI Gateway

## Storage

- Cloudflare R2

## Cache / Rate Limiting

- Redis-compatible service
- Upstash Redis or Redis

## Export

- JSZip

## Testing

- Vitest
- Playwright
- React Testing Library where useful

---

# 6. Monorepo Structure

```text
designforge/
├── apps/
│   ├── plugin/
│   └── web/
│
├── packages/
│   ├── design-ir/
│   ├── figma-parser/
│   ├── generators/
│   │   ├── nextjs/
│   │   ├── html/
│   │   └── markdown/
│   │
│   ├── ai/
│   │   ├── core/
│   │   ├── gemini/
│   │   └── cloudflare/
│   │
│   ├── schemas/
│   ├── asset-pipeline/
│   ├── exporter/
│   ├── utils/
│   └── config/
│
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
├── tsconfig.base.json
├── .env.example
└── README.md
```

---

# 7. Figma Plugin Structure

```text
apps/plugin/
├── src/
│   ├── main.ts
│   ├── ui/
│   │   ├── App.tsx
│   │   ├── components/
│   │   ├── hooks/
│   │   └── styles/
│   │
│   ├── parser/
│   │   ├── index.ts
│   │   ├── node-parser.ts
│   │   ├── layout-parser.ts
│   │   ├── typography-parser.ts
│   │   ├── style-parser.ts
│   │   ├── component-parser.ts
│   │   ├── asset-parser.ts
│   │   └── variable-parser.ts
│   │
│   ├── messaging/
│   │   ├── messages.ts
│   │   └── handlers.ts
│   │
│   └── config/
│
├── manifest.json
├── package.json
└── tsconfig.json
```

---

# 8. Plugin UI

Initial UI:

```text
┌──────────────────────────────┐
│ DesignForge                  │
│ Figma → Production Code      │
├──────────────────────────────┤
│ Selected                     │
│ Homepage / 148 nodes         │
│                              │
│ Framework                    │
│ [ Next.js              ▼ ]   │
│                              │
│ Language                     │
│ [ TypeScript            ]    │
│                              │
│ Styling                      │
│ [ Tailwind CSS          ]    │
│                              │
│ AI Provider                  │
│ [ Gemini                ▼ ]  │
│                              │
│ ☑ Generate DESIGN.md         │
│ ☑ Export Assets              │
│ ☑ Detect Components          │
│ ☑ Responsive Analysis       │
│                              │
│ [ Analyze Design ]           │
│                              │
└──────────────────────────────┘
```

After analysis:

```text
✓ 12 sections
✓ 31 components
✓ 14 colors
✓ 8 typography styles
✓ 23 assets

[ Generate Code ]
```

---

# 9. Selection Rules

The plugin should initially support:

- FRAME
- COMPONENT
- COMPONENT_SET
- INSTANCE
- GROUP where possible

If multiple unrelated nodes are selected:

- Either reject the selection with a clear message
- Or allow multiple roots as an advanced mode

Initial MVP recommendation:

> Require exactly one root frame/component.

---

# 10. Figma Parser

The parser is the foundation of the product.

It should convert Figma nodes into normalized internal objects.

## Parse

### Structure

- Node ID
- Name
- Node type
- Parent
- Children
- Visibility
- Locked state where relevant

### Layout

- Width
- Height
- Min/max dimensions where available
- Position
- Auto Layout direction
- Gap
- Padding
- Alignment
- Distribution
- Wrapping
- Sizing mode
- Constraints

### Typography

- Font family
- Font size
- Font weight
- Line height
- Letter spacing
- Text alignment
- Text casing
- Paragraph spacing

### Visual

- Fill
- Stroke
- Stroke width
- Border radius
- Opacity
- Blend mode
- Shadows
- Blur
- Gradients

### Components

- Component
- Instance
- Component set
- Variant
- Variant properties
- Overrides

### Assets

- Raster images
- SVG
- Icons
- Fills containing images

### Variables / styles

- Color variables
- Number variables
- String variables where useful
- Local styles

---

# 11. Design IR

Never generate code directly from raw Figma nodes.

Create a normalized intermediate representation.

Example:

```ts
export interface DesignDocument {
  id: string
  name: string
  version: string

  viewport: {
    width: number
    height: number
  }

  tokens: DesignTokens
  assets: Asset[]
  components: ComponentDefinition[]
  root: DesignNode
}
```

Example node:

```ts
export interface DesignNode {
  id: string
  name: string
  type: DesignNodeType

  layout?: LayoutDefinition
  typography?: TypographyDefinition
  style?: StyleDefinition

  content?: {
    text?: string
    assetId?: string
  }

  component?: {
    name: string
    variant?: Record<string, string>
  }

  children?: DesignNode[]
}
```

---

# 12. Design IR Node Types

Suggested types:

```text
page
section
container
stack
grid
heading
paragraph
text
button
link
image
icon
input
card
list
navigation
footer
component
group
divider
spacer
unknown
```

The parser can initially classify based on Figma node types and naming conventions.

AI can improve semantic classification later.

---

# 13. Design Tokens

Normalize design tokens:

```ts
interface DesignTokens {
  colors: ColorToken[]
  typography: TypographyToken[]
  spacing: SpacingToken[]
  radii: RadiusToken[]
  shadows: ShadowToken[]
}
```

Example:

```json
{
  "colors": {
    "background": "#FAFAF8",
    "foreground": "#171717",
    "muted": "#737373",
    "border": "#E5E5E5"
  }
}
```

Do not blindly create hundreds of tokens.

Deduplicate equivalent values.

---

# 14. Semantic Mapping

Initial deterministic mapping:

```text
Figma FRAME named "Hero"
→ section / hero

TEXT named "Heading"
→ heading

TEXT named "Body"
→ paragraph

FRAME named "Button"
→ button

IMAGE
→ image

COMPONENT
→ component
```

Also use structure:

```text
Auto Layout vertical
+ large heading
+ paragraph
+ button
= likely hero/content section
```

AI can improve this classification but should not be required.

---

# 15. Component Strategy

If Figma contains real components:

```text
Button / Primary
Card / Feature
Navbar
```

preserve them.

Generated:

```text
components/
├── Button.tsx
├── FeatureCard.tsx
└── Navbar.tsx
```

Avoid generating a component for every arbitrary Figma frame.

Component extraction rules should consider:

- Repeated structure
- Figma component identity
- Instances
- Naming
- Complexity
- Reusability

---

# 16. Next.js Generator

Target:

- Next.js App Router
- TypeScript
- Tailwind CSS
- Semantic HTML
- Reusable components

Generated structure:

```text
generated/
├── app/
│   ├── page.tsx
│   ├── layout.tsx
│   └── globals.css
│
├── components/
│   ├── Navbar.tsx
│   ├── Hero.tsx
│   ├── Features.tsx
│   └── Footer.tsx
│
├── public/
│   └── assets/
│
├── design/
│   └── DESIGN.md
│
├── package.json
├── tsconfig.json
├── postcss.config.mjs
└── README.md
```

---

# 17. Tailwind Rules

Prefer:

```tsx
<section className="mx-auto max-w-7xl px-6 py-24">
```

over:

```tsx
<section
  style={{
    position: "absolute",
    left: 127,
    top: 83
  }}
>
```

Rules:

- Prefer Flexbox
- Prefer Grid
- Use Auto Layout information
- Use max-width containers
- Use semantic spacing
- Avoid unnecessary absolute positioning
- Avoid generated pixel-by-pixel coordinates
- Use CSS variables for meaningful repeated tokens
- Use responsive Tailwind utilities

---

# 18. HTML/CSS/JS Generator

Output:

```text
generated/
├── index.html
├── styles.css
├── script.js
└── assets/
```

Rules:

- Semantic HTML5
- CSS custom properties for repeated tokens
- Flexbox/Grid
- Minimal JavaScript
- No framework dependency
- Accessible buttons/links/images
- Responsive CSS

---

# 19. DESIGN.md Generator

`DESIGN.md` should contain:

```text
1. Design overview
2. Visual direction
3. Colors
4. Typography
5. Spacing
6. Radius
7. Shadows
8. Layout
9. Components
10. Sections
11. Responsive behavior
12. Assets
13. Accessibility notes
14. Implementation rules
15. Inferred assumptions
```

Important:

If a responsive behavior is inferred rather than directly observed:

```md
Responsive behavior was inferred because no mobile reference frame was provided.
```

Never represent AI assumptions as measured Figma facts.

---

# 20. Example DESIGN.md Structure

```md
# Design System

## Design Overview

Minimal premium SaaS landing page.

## Visual Direction

- Minimal
- High whitespace
- Large editorial typography
- Soft neutral surfaces

## Colors

| Token | Value |
|---|---|
| Background | #FAFAF8 |
| Foreground | #171717 |
| Muted | #737373 |
| Border | #E5E5E5 |

## Typography

### Display

- Font: Inter
- Weight: 600
- Size: 64px
- Line height: 1.05
- Letter spacing: -0.04em

## Layout

- Container: 1200px
- Section spacing: 120px
- Grid gap: 24px

## Components

- Navbar
- Hero
- FeatureCard
- Testimonial
- CTA
- Footer

## Responsive Behavior

### Desktop

Two-column hero.

### Mobile

Hero content stacks vertically.

## Assumptions

Mobile behavior was inferred because no mobile frame was provided.

## Implementation Rules

- Use semantic HTML
- Use reusable React components
- Prefer Tailwind utilities
- Avoid unnecessary absolute positioning
- Preserve visual hierarchy
```

---

# 21. AI Architecture

Create one common interface.

```ts
export interface AIProvider {
  analyzeDesign(
    input: DesignAnalysisInput
  ): Promise<DesignAnalysis>

  generateDesignMd(
    input: DesignMdInput
  ): Promise<string>

  improveCode(
    input: CodeImproveInput
  ): Promise<GeneratedCode>
}
```

Providers:

```text
AIProvider
├── GeminiProvider
└── CloudflareAIProvider
```

Factory:

```ts
const provider = aiProviderFactory.get("gemini")
```

This allows future providers:

- OpenAI
- Anthropic
- Ollama
- OpenRouter
- Other Cloudflare-supported models

without changing the generator architecture.

---

# 22. AI Responsibilities

AI should NOT be responsible for:

- Reading every raw Figma property
- Basic dimensions
- Exact colors
- Exact font sizes
- Asset extraction
- Node tree parsing

Those should be deterministic.

AI should handle:

- Semantic classification
- Component naming
- Section understanding
- Responsive inference
- Design direction
- Accessibility suggestions
- DESIGN.md enrichment
- Code quality improvements
- Ambiguous layout interpretation

---

# 23. AI Pipeline

Use multiple stages.

```text
Figma Nodes
    ↓
Design IR
    ↓
Deterministic Analysis
    ↓
AI Semantic Analysis
    ↓
Design Plan
    ↓
Generator
    ↓
Generated Files
    ↓
Validation
    ↓
Optional AI Repair
```

Do not send the entire raw Figma document to the model when it is unnecessary.

---

# 24. AI Input Optimization

Before AI:

- Remove duplicate styles
- Deduplicate colors
- Deduplicate typography
- Remove irrelevant metadata
- Compress repetitive nodes
- Keep semantic hierarchy
- Include only required assets metadata

This reduces token usage and improves consistency.

---

# 25. Structured AI Output

Do not depend on free-form AI text.

Use a Zod schema.

Example:

```ts
const DesignAnalysisSchema = z.object({
  designDirection: z.string(),

  sections: z.array(
    z.object({
      name: z.string(),
      type: z.string(),
      description: z.string()
    })
  ),

  components: z.array(
    z.object({
      name: z.string(),
      type: z.string(),
      reusable: z.boolean()
    })
  ),

  responsiveRules: z.array(
    z.object({
      breakpoint: z.string(),
      behavior: z.string(),
      confidence: z.number()
    })
  )
})
```

Validate every model response before using it.

---

# 26. Gemini Integration

Create:

```text
packages/ai/gemini/
├── client.ts
├── provider.ts
├── prompts.ts
└── schemas.ts
```

Use structured JSON output where possible.

Flow:

```text
Design IR
   ↓
Gemini
   ↓
Structured JSON
   ↓
Zod validation
   ↓
DesignAnalysis
```

Environment:

```env
GEMINI_API_KEY=
```

Never expose this key to the Figma plugin.

---

# 27. Cloudflare AI Integration

Create:

```text
packages/ai/cloudflare/
├── client.ts
├── provider.ts
├── prompts.ts
└── models.ts
```

Environment:

```env
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_API_TOKEN=
CLOUDFLARE_AI_MODEL=
```

If AI Gateway is used:

```env
CLOUDFLARE_AI_GATEWAY=
```

Cloudflare should be accessed server-side.

---

# 28. Backend

For MVP:

```text
Next.js
└── Route Handlers
```

Endpoints:

```text
POST /api/analyze
POST /api/generate
POST /api/generate/design-md
POST /api/generate/nextjs
POST /api/generate/html
POST /api/generate/zip
GET  /api/ai/providers
GET  /api/health
```

Later, the AI/generation backend can be separated into a worker/service if needed.

---

# 29. Request Flow

Example:

```http
POST /api/analyze
```

Input:

```json
{
  "document": {},
  "provider": "gemini"
}
```

Backend:

```text
Validate request
↓
Normalize Design IR
↓
Check size
↓
Check rate limit
↓
AI provider
↓
Validate structured response
↓
Return analysis
```

---

# 30. Figma ↔ Backend Communication

Recommended:

```text
Figma Plugin
      │
      │ HTTPS
      ▼
Next.js API
      │
      ├── AI
      ├── Generator
      └── Storage
```

Do not put provider secrets inside:

- `main.ts`
- `ui.tsx`
- plugin manifest
- generated frontend bundle

---

# 31. Asset Pipeline

For images:

```text
Figma node
↓
exportAsync()
↓
Binary
↓
Asset registry
↓
ZIP
```

Generated:

```text
public/assets/
├── hero.png
├── logo.svg
└── avatar-01.png
```

Use deterministic filenames.

Example:

```text
hero-section-image.webp
feature-card-01.png
logo-company.svg
```

---

# 32. Asset Rules

- Preserve SVG when possible
- Export raster assets only when necessary
- Avoid duplicate exports
- Hash or normalize filenames
- Preserve intrinsic dimensions
- Generate alt-text suggestions through AI only as suggestions
- Never overwrite unrelated assets

---

# 33. ZIP Packaging

Use JSZip.

Pipeline:

```text
Design IR
↓
Generate files
↓
Generate assets
↓
Generate DESIGN.md
↓
Generate README
↓
Generate package.json
↓
ZIP
```

README should explain:

- What was generated
- Framework
- Commands
- Assumptions
- Known limitations

---

# 34. Generated README

Example:

```md
# Generated Project

Generated by DesignForge.

## Stack

- Next.js
- TypeScript
- Tailwind CSS

## Development

npm install
npm run dev

## Notes

Responsive behavior was inferred where no reference frame existed.
```

---

# 35. Validation

MVP validation:

```text
Generated source
      ↓
Syntax validation
      ↓
TypeScript validation
      ↓
Lint
      ↓
Optional build
```

If build fails:

```text
Build error
↓
Capture error
↓
AI repair
↓
Regenerate affected files
↓
Validate again
```

AI repair should have a maximum retry count.

Recommended:

```text
maxRepairAttempts = 2
```

---

# 36. Code Generation Strategy

Do not ask AI:

> Generate the entire project from this design.

Instead:

```text
Design IR
↓
Component plan
↓
File plan
↓
Deterministic templates
↓
AI refinement where necessary
```

Example file plan:

```json
{
  "files": [
    "app/page.tsx",
    "components/Navbar.tsx",
    "components/Hero.tsx",
    "components/Footer.tsx",
    "app/globals.css"
  ]
}
```

Then each file can be generated independently.

---

# 37. Design-to-Code Rules

Priority order:

1. Semantic HTML
2. Reusable components
3. Layout fidelity
4. Typography fidelity
5. Spacing fidelity
6. Responsive behavior
7. Accessibility
8. Maintainability
9. Minimal code

If pixel fidelity conflicts with maintainability, use the closest maintainable layout rather than excessive absolute positioning.

---

# 38. Responsive Strategy

Use three sources of evidence.

## Level 1 — Actual Figma Frames

If desktop/tablet/mobile designs exist:

```text
Desktop
Tablet
Mobile
```

compare them.

## Level 2 — Figma Auto Layout

Use:

- horizontal/vertical direction
- wrapping
- fill/hug/fixed
- constraints
- alignment

## Level 3 — AI inference

When no reference exists, AI may infer:

```text
Desktop:
2 columns

Mobile:
stack vertically
```

Store confidence:

```json
{
  "behavior": "stack vertically",
  "confidence": 0.82,
  "source": "inferred"
}
```

---

# 39. Important Responsive Limitation

The plugin cannot know every responsive rule from a single desktop frame.

Therefore:

- Never claim exact mobile behavior if no mobile design exists.
- Mark inferred behavior.
- Allow users to choose:

```text
Responsive mode:
○ Conservative
○ Balanced
○ AI inferred
```

For MVP, use `Balanced`.

---

# 40. Design Tokens → Tailwind

Map repeated values into CSS variables or Tailwind-compatible theme values.

Example:

```css
:root {
  --color-background: #fafaf8;
  --color-foreground: #171717;
  --color-muted: #737373;
}
```

Then:

```tsx
className="bg-[var(--color-background)] text-[var(--color-foreground)]"
```

Alternatively generate theme configuration where appropriate.

Avoid creating arbitrary utility classes for every single Figma value.

---

# 41. Database

PostgreSQL + Prisma.

Initial schema concepts:

```text
User
Project
Generation
GenerationFile
Usage
```

Example:

```text
User
- id
- email
- createdAt

Project
- id
- userId
- name
- createdAt

Generation
- id
- projectId
- provider
- model
- target
- status
- createdAt

GenerationFile
- id
- generationId
- path
- content

Usage
- id
- userId
- provider
- model
- tokens
- createdAt
```

Database persistence can be optional in the first private beta.

---

# 42. R2 Storage

Use R2 for:

- Large assets
- Generated ZIPs
- Optional generation snapshots
- Project artifacts

Do not store large binaries directly in PostgreSQL.

---

# 43. Caching

Cache where safe:

- Repeated AI analysis
- Identical Design IR hashes
- Static asset processing

Create:

```text
designHash
```

Example:

```text
SHA-256(normalized Design IR)
```

Cache key:

```text
analysis:{provider}:{model}:{designHash}
```

Never cache private data across users without a user/project namespace.

---

# 44. Rate Limiting

Apply limits to:

```text
/analyze
/generate
/repair
```

Example private MVP limits:

```text
10 analyses / minute / user
5 generations / minute / user
2 repair cycles / generation
```

Actual limits should be adjusted based on provider cost and usage.

---

# 45. Security

Minimum:

- HTTPS
- Server-side AI secrets
- Input validation
- Output validation
- Request body limits
- Rate limiting
- Timeout
- Retry limits
- Logging without secrets
- Sanitize generated filenames
- Prevent path traversal
- Validate ZIP paths
- Restrict allowed export targets

Never trust AI-generated filenames.

Reject:

```text
../../something
```

Normalize:

```text
components/Hero.tsx
```

---

# 46. AI Prompt Architecture

Keep prompts versioned.

```text
packages/ai/
└── prompts/
    ├── design-analysis.v1.ts
    ├── responsive-analysis.v1.ts
    ├── design-md.v1.ts
    └── code-review.v1.ts
```

Do not hardcode giant prompts inside route handlers.

Prompt versions should be traceable in generation metadata.

---

# 47. AI Context

Send:

```text
Design metadata
+ Design IR
+ Tokens
+ Component registry
+ Export target
+ Generation rules
```

Do not send unnecessary:

- raw binary data
- duplicate nodes
- huge SVG content
- irrelevant metadata

---

# 48. Error Handling

Plugin errors:

```text
No selection
Multiple incompatible selections
Unsupported node
Large document
Asset export failure
Network failure
AI failure
Invalid AI response
Generation failure
ZIP failure
```

UI should show actionable errors.

Example:

```text
Unable to analyze this selection.

Reason:
The selected nodes contain unsupported embedded content.

Try selecting the main frame instead.
```

---

# 49. Generation State Machine

Use explicit states:

```text
idle
↓
analyzing
↓
analyzed
↓
generating
↓
validating
↓
packaging
↓
complete
```

Failure:

```text
any state
↓
error
```

This makes plugin UI and backend behavior predictable.

---

# 50. Plugin Messaging

Use typed messages.

```ts
type PluginMessage =
  | {
      type: "ANALYZE_SELECTION"
    }
  | {
      type: "SELECTION_RESULT"
      payload: SelectionSummary
    }
  | {
      type: "GENERATION_PROGRESS"
      payload: {
        step: string
        progress: number
      }
    }
  | {
      type: "GENERATION_COMPLETE"
      payload: {
        downloadUrl?: string
      }
    }
```

Avoid stringly-typed unvalidated message objects.

---

# 51. Web Dashboard

Optional for first public beta.

Pages:

```text
/
 /dashboard
 /projects
 /projects/[id]
 /settings
 /settings/ai
```

Dashboard:

```text
Projects
├── SaaS Landing
├── Portfolio
└── Marketing Page
```

Generation history:

```text
SaaS Landing

v1
Next.js
Gemini
Completed

v2
HTML
Cloudflare AI
Completed
```

---

# 52. AI Settings

Web settings:

```text
AI Providers

Gemini
[ Connected ]

Cloudflare AI
[ Connected ]

Default provider
[ Gemini ]

Fallback provider
[ Cloudflare AI ]
```

API keys should be encrypted at rest if user-managed keys are supported.

For the first MVP, server-owned keys are simpler.

---

# 53. Recommended MVP AI Model Strategy

Do not tie the product to one specific model ID in application logic.

Use configuration:

```env
GEMINI_MODEL=
CLOUDFLARE_AI_MODEL=
```

Model registry:

```ts
interface ModelConfig {
  provider: AIProviderName
  id: string
  capabilities: {
    structuredOutput: boolean
    vision: boolean
    maxContext: number
  }
}
```

The application asks for capabilities rather than hardcoding vendor-specific behavior everywhere.

---

# 54. Figma Dev Mode Codegen

Later, expose common snippets through Figma Codegen:

```text
Inspect
→ Code
→ DesignForge
```

Possible snippets:

- React
- Next.js
- HTML
- Tailwind

However, full project ZIP generation should remain in the normal plugin UI.

---

# 55. CLI — Post-MVP

Future:

```bash
designforge generate design.json \
  --target next \
  --ai gemini
```

Potential workflow:

```text
Figma
↓
export Design IR
↓
CLI
↓
Next.js project
```

This can later become useful for CI/CD.

---

# 56. Testing Strategy

## Unit Tests

Test:

- Figma node → IR
- Token extraction
- Layout normalization
- Component detection
- Asset naming
- Tailwind mapping
- HTML generator
- Next.js generator
- Markdown generator

## Snapshot Tests

Use representative Design IR fixtures.

```text
fixtures/
├── hero.json
├── ecommerce.json
├── saas.json
└── dashboard.json
```

Compare generated output.

## Integration Tests

Test:

```text
Figma-like fixture
↓
IR
↓
Generator
↓
ZIP
```

## AI Tests

Use fixed mocked provider responses.

Do not make unit tests dependent on live AI APIs.

---

# 57. Golden Fixtures

Create a test corpus:

```text
fixtures/
├── simple-button
├── hero
├── navbar
├── feature-grid
├── pricing
├── testimonial
├── dashboard
└── full-landing-page
```

Each fixture should have:

```text
input.json
expected/
├── DESIGN.md
├── next/
└── html/
```

This becomes the regression suite for the generator.

---

# 58. Quality Metrics

Track:

### Structural

- Successful parse rate
- Unsupported node rate
- Asset extraction success

### Code

- TypeScript errors
- Build success rate
- ESLint errors
- Component count
- Absolute positioning count

### AI

- Structured output validation rate
- AI repair rate
- Average tokens
- Average latency
- Provider failure rate

### Visual

Later add screenshot comparison:

```text
Figma screenshot
vs
Generated website screenshot
```

Use this after MVP.

---

# 59. Visual Validation — Post-MVP

Future pipeline:

```text
Generated Next.js
↓
Playwright
↓
Screenshot
↓
Compare with Figma reference
↓
Visual diff
↓
AI analysis
↓
Repair
```

This is how the product can eventually move toward higher visual fidelity.

---

# 60. Performance Strategy

Figma plugin should not freeze on large files.

Rules:

- Parse recursively
- Avoid unnecessary repeated traversals
- Deduplicate styles
- Process assets separately
- Chunk large payloads
- Show progress
- Move expensive work server-side where possible

Large selection:

```text
1000+ nodes
```

should show:

```text
Analyzing 342 / 1200 nodes
```

---

# 61. Payload Limits

Set limits for:

- Node count
- JSON size
- Asset count
- Individual asset size
- AI request size

Example initial limits:

```text
Max nodes: 3000
Max total JSON: 5 MB
Max assets: 100
```

These should be configurable.

---

# 62. Logging

Use structured logs.

```json
{
  "event": "generation.completed",
  "generationId": "...",
  "provider": "gemini",
  "target": "nextjs",
  "durationMs": 4210
}
```

Never log:

- API keys
- full user source code
- private Figma data unnecessarily
- authentication tokens

---

# 63. Observability

Track:

```text
generation_started
generation_completed
generation_failed
ai_request_started
ai_request_failed
asset_export_failed
zip_created
```

Later integrate an error monitoring service.

---

# 64. Environment Variables

Example:

```env
# App
NEXT_PUBLIC_APP_URL=
DATABASE_URL=

# Gemini
GEMINI_API_KEY=
GEMINI_MODEL=

# Cloudflare
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_API_TOKEN=
CLOUDFLARE_AI_MODEL=
CLOUDFLARE_AI_GATEWAY=

# R2
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_ENDPOINT=

# Redis
REDIS_URL=

# Auth
AUTH_SECRET=
```

Never expose server secrets through `NEXT_PUBLIC_*`.

---

# 65. Deployment

Suggested:

```text
Web/API
→ Vercel or Cloudflare-compatible deployment

Database
→ PostgreSQL provider

Assets
→ Cloudflare R2

AI
→ Gemini + Cloudflare AI

Cache
→ Redis/Upstash
```

For the initial private MVP, Vercel + PostgreSQL + R2 + Gemini/Cloudflare AI is enough.

---

# 66. Recommended Repository Rules

Use:

```text
pnpm
```

for all workspace commands.

Use:

```text
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

at root.

CI should run:

```text
install
↓
lint
↓
typecheck
↓
test
↓
build
```

---

# 67. Definition of Done — Parser

Parser is done when:

- [ ] A selected frame can be parsed.
- [ ] Nested children are preserved.
- [ ] Auto Layout is represented.
- [ ] Typography is extracted.
- [ ] Colors are normalized.
- [ ] Components are detected.
- [ ] Images can be exported.
- [ ] Unsupported nodes do not crash the parser.
- [ ] Parser produces deterministic IR.
- [ ] Fixtures cover major node types.

---

# 68. Definition of Done — Next.js Generator

- [ ] Generates valid TSX
- [ ] Generates reusable components
- [ ] Uses Tailwind
- [ ] Generates responsive classes
- [ ] Handles assets
- [ ] Handles typography
- [ ] Handles colors
- [ ] Handles basic variants
- [ ] No unnecessary absolute positioning
- [ ] Generated project builds

---

# 69. Definition of Done — HTML Generator

- [ ] Valid HTML
- [ ] Semantic structure
- [ ] Responsive CSS
- [ ] Assets work
- [ ] JavaScript only where necessary
- [ ] No external framework dependency
- [ ] Basic accessibility support

---

# 70. Definition of Done — DESIGN.md

- [ ] Colors
- [ ] Typography
- [ ] Layout
- [ ] Spacing
- [ ] Components
- [ ] Sections
- [ ] Responsive behavior
- [ ] Assets
- [ ] Implementation guidance
- [ ] Explicit assumptions

---

# 71. Definition of Done — AI

- [ ] Gemini provider works
- [ ] Cloudflare provider works
- [ ] Provider interface is shared
- [ ] Structured output validated
- [ ] Timeouts implemented
- [ ] Retry implemented
- [ ] Provider errors handled
- [ ] AI assumptions marked
- [ ] No API key in plugin bundle

---

# 72. Development Milestones

## Milestone 0 — Repository

Tasks:

- [ ] Create monorepo
- [ ] Configure pnpm
- [ ] Configure Turborepo
- [ ] Configure TypeScript
- [ ] Configure ESLint
- [ ] Configure Prettier
- [ ] Configure Vitest
- [ ] Create plugin app
- [ ] Create Next.js app

---

## Milestone 1 — Figma Parser

Tasks:

- [ ] Selection API
- [ ] Node traversal
- [ ] Layout parser
- [ ] Typography parser
- [ ] Style parser
- [ ] Component parser
- [ ] Asset parser
- [ ] Design IR
- [ ] Fixtures
- [ ] Tests

Deliverable:

```text
Figma Frame
→ Design IR JSON
```

---

## Milestone 2 — HTML Generator

Tasks:

- [ ] HTML AST
- [ ] CSS token generation
- [ ] Flex/Grid mapping
- [ ] Typography
- [ ] Images
- [ ] Responsive CSS
- [ ] Asset folder
- [ ] Tests

Deliverable:

```text
Figma
→ HTML/CSS/JS ZIP
```

---

## Milestone 3 — Next.js Generator

Tasks:

- [ ] TSX generator
- [ ] Component generator
- [ ] Tailwind mapping
- [ ] App Router
- [ ] Assets
- [ ] globals.css
- [ ] package.json
- [ ] README
- [ ] Build validation

Deliverable:

```text
Figma
→ Next.js ZIP
```

---

## Milestone 4 — DESIGN.md

Tasks:

- [ ] Token documentation
- [ ] Component documentation
- [ ] Layout documentation
- [ ] Responsive documentation
- [ ] Assumption section
- [ ] Markdown tests

Deliverable:

```text
Figma
→ DESIGN.md
```

---

## Milestone 5 — AI

Tasks:

- [ ] AI interface
- [ ] Gemini provider
- [ ] Cloudflare provider
- [ ] Structured schemas
- [ ] Prompt versions
- [ ] Semantic analysis
- [ ] Responsive inference
- [ ] DESIGN.md enrichment
- [ ] Retry/timeout

Deliverable:

```text
Figma
→ IR
→ AI
→ better DESIGN.md + better component plan
```

---

## Milestone 6 — Packaging

Tasks:

- [ ] ZIP generation
- [ ] Asset packaging
- [ ] Progress UI
- [ ] Error handling
- [ ] Download flow

Deliverable:

```text
Select Frame
→ Generate
→ Download ZIP
```

---

## Milestone 7 — Private Beta

Test with:

- SaaS landing pages
- Agency websites
- Portfolio pages
- Pricing pages
- Dashboard screens
- E-commerce pages

Collect failures and expand parser/generator rules.

---

# 73. MVP Priority Order

If development time becomes limited, prioritize:

```text
1. Design IR
2. Figma parser
3. Next.js/Tailwind generator
4. HTML generator
5. DESIGN.md
6. Asset pipeline
7. Gemini
8. Cloudflare AI
9. Validation
10. Dashboard
```

The IR and deterministic generator quality matter more than adding more AI providers.

---

# 74. What NOT to Build First

Do not start with:

```text
AI website builder
Live preview
GitHub deployment
Billing
Teams
Templates marketplace
Animation recreation
Visual diff engine
```

First make:

```text
Figma
↓
Reliable IR
↓
Reliable code
```

excellent.

---

# 75. Product Differentiation

Basic Figma-to-code tools mostly focus on:

```text
Figma → Code
```

DesignForge should focus on:

```text
Figma
 ↓
Design understanding
 ↓
Design IR
 ↓
Production code
 +
DESIGN.md
```

The `DESIGN.md` output can become especially useful for AI coding workflows.

Example:

```text
Figma design
+
DESIGN.md
+
existing codebase
↓
AI coding agent
↓
consistent implementation
```

---

# 76. Future AI Coding Workflow

Post-MVP:

```text
Figma
 ↓
DesignForge
 ↓
DESIGN.md
 ↓
Cursor / Codex / Claude Code
 ↓
Existing Next.js repository
 ↓
Implementation
```

Eventually:

```text
Figma
 ↓
DesignForge
 ↓
GitHub
 ↓
AI coding agent
 ↓
PR
 ↓
Preview
```

This should remain a future extension, not an MVP dependency.

---

# 77. Suggested First Version UX

Keep the plugin extremely focused.

### Screen 1

```text
Select a frame
```

### Screen 2

```text
Analyze

12 Sections
31 Components
23 Assets
```

### Screen 3

```text
Export

Next.js
HTML
DESIGN.md
```

### Screen 4

```text
Generate

Parsing       ✓
Analysis      ✓
Components    ✓
Assets        ✓
Code          ✓
Validation    ✓
ZIP           ✓

[ Download ]
```

---

# 78. MVP Success Criteria

The MVP should be considered successful if a user can:

1. Open a reasonably structured Figma landing page.
2. Select its main frame.
3. Analyze it without crashing.
4. Get a useful Design IR.
5. Generate a complete Next.js project.
6. Run `npm install && npm run dev`.
7. See a visually recognizable implementation.
8. Generate a useful `DESIGN.md`.
9. Generate HTML/CSS/JS.
10. Download all output and assets as one ZIP.
11. Optionally use Gemini or Cloudflare AI to improve semantic interpretation.
12. Switch AI providers without changing the generator code.

---

# 79. Recommended Build Order

Start implementation in this exact order:

```text
Step 1
Monorepo

Step 2
Design IR types

Step 3
Figma parser

Step 4
Parser fixtures + tests

Step 5
HTML generator

Step 6
Next.js generator

Step 7
DESIGN.md generator

Step 8
Asset pipeline

Step 9
ZIP exporter

Step 10
Plugin UI

Step 11
Backend API

Step 12
AI provider abstraction

Step 13
Gemini

Step 14
Cloudflare AI

Step 15
Validation

Step 16
Private beta
```

---

# 80. Final Architecture

```text
┌─────────────────────────────────────────────┐
│                    FIGMA                    │
└──────────────────────┬──────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│              DESIGNFORGE PLUGIN             │
│                                             │
│ Selection / UI / Asset Export / Messaging  │
└──────────────────────┬──────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│                 FIGMA PARSER                │
└──────────────────────┬──────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│                 DESIGN IR / AST             │
│                                             │
│ Nodes / Layout / Tokens / Components       │
│ Typography / Assets / Constraints           │
└──────────────┬───────────────────┬──────────┘
               │                   │
               ▼                   ▼
┌────────────────────────┐  ┌─────────────────┐
│ Deterministic          │  │ AI Analysis     │
│ Generators             │  │                 │
│                        │  │ Gemini          │
│ Next.js                │  │ Cloudflare AI   │
│ HTML/CSS/JS            │  │                 │
│ DESIGN.md              │  └────────┬────────┘
└────────────┬───────────┘           │
             │                       │
             └───────────┬───────────┘
                         ▼
                ┌──────────────────┐
                │ Validation       │
                │ TypeScript       │
                │ ESLint           │
                │ Build            │
                └────────┬─────────┘
                         │
                         ▼
                ┌──────────────────┐
                │ ZIP Export       │
                │ Source + Assets  │
                │ DESIGN.md        │
                └──────────────────┘
```

---

# 81. Final Technical Principle

The most important rule for the entire project:

> **AI should improve understanding and code quality; AI should not be the source of truth for raw Figma measurements.**

Source of truth:

```text
Figma
 ↓
Parser
 ↓
Design IR
```

Reasoning layer:

```text
Design IR
 ↓
AI
```

Output layer:

```text
Design IR + AI Analysis
 ↓
Generators
```

This separation gives DesignForge:

- predictable output
- testable code
- multiple exporters
- multiple AI providers
- lower AI cost
- easier debugging
- better maintainability
- future support for React, Vue, Svelte, Astro, etc.

---

# 82. Post-MVP Roadmap

## V1.1

- Better component detection
- More Figma node types
- Better Tailwind token mapping
- Better responsive inference
- More robust SVG handling

## V1.2

- Screenshot-based visual validation
- AI repair
- Live preview
- Generation history

## V1.3

- GitHub export
- Existing repository integration
- Pull request generation

## V2

```text
Figma
 ↓
DesignForge
 ↓
Existing GitHub repo
 ↓
AI implementation
 ↓
Build
 ↓
Visual validation
 ↓
AI repair
 ↓
Pull Request
```

## V3

```text
Figma
 ↓
DesignForge
 ↓
Production-ready application
 ↓
Deploy
```

---

# 83. First Implementation Target

The first working milestone should be deliberately small:

```text
Figma Frame
   ↓
Parser
   ↓
Design IR
   ↓
Next.js + Tailwind Generator
   ↓
ZIP
```

Then add:

```text
DESIGN.md
```

Then:

```text
Gemini
```

Then:

```text
Cloudflare AI
```

Then:

```text
Validation + AI repair
```

This sequence minimizes architectural risk and prevents the MVP from becoming an AI-heavy prototype that cannot reliably produce code.

