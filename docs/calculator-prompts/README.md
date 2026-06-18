# Calculator Page Generator — Reusable Prompts

This folder contains a **category-agnostic prompt set** for generating free SEO calculator
pages on the TradesQuote site (Astro + Tailwind). The same prompts that produced the **HVAC**
calculator hub can generate a hub + calculators for any trade — **Electrical, Plumbing,
Painting, Carpentry, Cleaning**, etc.

You fill in one short **category brief**, then run two prompts. Everything else (page
structure, SEO schema, styling, scripts, config wiring) is encoded in the prompts so output
matches the existing HVAC pages exactly.

---

## Files in this folder

| File | What it is |
| --- | --- |
| `category-brief.template.md` | The **only** thing you edit per category. A fill-in form: category metadata + one block per calculator (formula, inputs, defaults, FAQs, sources). |
| `01-generate-category-hub.prompt.md` | Prompt that creates the category **config** (`src/config/<slug>Calculators.ts`), flips the category **live** in `calculatorCategories.ts`, and builds the category **hub page** (`src/pages/calculators/<slug>/index.astro`). Run this **once per category**. |
| `02-generate-calculator-page.prompt.md` | Prompt that creates **one** calculator page + its script. Run it **once per calculator** (parallelizable). |

---

## How to use (3 steps)

1. **Write the brief.** Copy `category-brief.template.md` → `briefs/<slug>.md` (or anywhere),
   and fill it in. Research the formulas, default values, and authoritative sources for that
   trade as you go — the prompts will cite whatever you put here, and will also research/verify.

2. **Generate the hub + config.** Paste `01-generate-category-hub.prompt.md` into Claude Code
   (or hand it to a subagent), with the brief contents appended. This produces the spine: the
   config file, the live category card, and the hub landing page.

3. **Generate each calculator.** For every calculator in the brief, run
   `02-generate-calculator-page.prompt.md` with that calculator's block. These are independent
   (each writes its own page + script), so they can run in parallel via subagents.

Then `npm run build` and fix anything the acceptance checklist (below) flags.

> Tip: in Claude Code you can say *"using docs/calculator-prompts/02-generate-calculator-page.prompt.md,
> generate the `electrical-wire-size-calculator` from briefs/electrical.md"* and it will read both files.

---

## What gets generated (file map)

For a category with slug `<cat>` and a calculator with slug `<cat>-<tool>-calculator`:

```
src/config/<cat>Calculators.ts                          # types, calculators[], <cat>AccentStyles, guide[], faqs[]
src/config/calculatorCategories.ts                      # (edited) category set to status:"live", toolCount:N
src/pages/calculators/<cat>/index.astro                 # the category hub page
src/pages/calculators/<cat>/<cat>-<tool>-calculator/index.astro   # one calculator page
src/scripts/calculators/<cat>-<tool>-calculator.ts      # that calculator's vanilla-TS init script
```

## Canonical reference files (the prompts tell the model to mirror these)

- **Hub page:** `src/pages/calculators/hvac/index.astro`
- **Sizing calculator:** `src/pages/calculators/hvac/hvac-btu-calculator/index.astro`
- **Comparison / cost calculator:** `src/pages/calculators/hvac/hvac-seer-savings-calculator/index.astro`
- **Scripts:** `src/scripts/calculators/hvac-btu-calculator.ts`, `.../hvac-seer-savings-calculator.ts`
- **Config:** `src/config/hvacCalculators.ts`, `src/config/calculatorCategories.ts`
- **Components:** `src/components/CalculatorToolCard.astro`, `CalculatorCategoryCard.astro`, `src/layouts/Layout.astro`

---

## Conventions encoded in the prompts

- **Routing is folder-based.** A page lives at `src/pages/calculators/<cat>/<slug>/index.astro`; the
  URL is `/calculators/<cat>/<slug>`.
- **Pages are data-driven.** The hub renders cards from `<cat>Calculators.ts`; the top-level
  `/calculators` index renders category cards from `calculatorCategories.ts` (which shows `toolCount`).
- **Each page is self-contained**: hero → interactive calculator (input card + sticky gradient
  result panel + "See the breakdown" `<details>`) → plain-English formula → worked examples →
  (optional reference table) → FAQ → CTA → "More `<Category>` calculators" grid.
- **Interactivity** is a separate `src/scripts/calculators/<slug>.ts` exporting
  `export function init<Name>(): void`, imported at the bottom of the page in a `<script>` tag.
  Every `getElementById` id must exist in the markup and vice-versa.
- **SEO per page:** unique `<title>` + meta description, `<link rel="canonical">`, OG + Twitter
  tags, and **three JSON-LD blocks** — `BreadcrumbList`, `WebApplication`, and a `FAQPage` whose
  questions exactly mirror the on-page FAQ.
- **Accents:** each calculator gets a distinct Tailwind color family (blue, sky, cyan, teal,
  emerald, indigo, violet, rose, amber, orange, red…). The category config file defines a
  `<cat>AccentStyles` map (mirror `hvacAccentStyles`) for the cards/guide table; the page itself
  uses the color family directly in its gradient/links/range-thumb.
- **Sourcing:** formulas and default values must be backed by authoritative, region-appropriate
  sources, cited inline and in a small "Sources & standards" fine-print line on each page.

### ⚠️ One-time setup gotcha — generalize the tool card

`src/components/CalculatorToolCard.astro` currently **hard-codes** `import … from "@/config/hvacCalculators"`.
Before a second category can reuse it, make it generic (accept the `calculator` object **and** its
`styles` as props), or duplicate it per category. `01-generate-category-hub.prompt.md` handles this —
it will refactor the card to be category-neutral the first time it's needed, leaving HVAC working.

---

## Acceptance checklist (every category)

- [ ] `npm run build` passes with no errors.
- [ ] Hub page lists every calculator; `toolCount` in `calculatorCategories.ts` matches the real count.
- [ ] Each page's script IDs reconcile 1:1 with its markup; default inputs produce the documented result.
- [ ] Reference-table and worked-example numbers equal what the script computes.
- [ ] All internal `/calculators/<cat>/<slug>` links resolve to real pages (no dangling links).
- [ ] Every page has canonical + OG/Twitter + the 3 JSON-LD blocks; FAQ schema mirrors on-page FAQ.
- [ ] Formulas/defaults are cited; "Sources & standards" line present.
