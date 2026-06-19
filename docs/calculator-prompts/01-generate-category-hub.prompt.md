# PROMPT 01 — Generate a Calculator Category (config + hub page)

**Run once per category.** Paste this whole prompt, then append the **Category brief** (sections
1–3 of `category-brief.template.md`, filled in). The model has read/write access to this repo.

---

## Role & goal

You are extending the TradesQuote website (Astro + Tailwind, folder-based routing). Create the
**spine** for a new calculator category: its config file, its live category card, and its hub
landing page — matching the existing **HVAC** category exactly. You are NOT building individual
calculator pages here (that's PROMPT 02).

## Inputs

The appended **Category brief**, especially:
- Category `name`, `slug`, `accent`, `icon`, `one_liner`, `hero_intro`, `order_hint`.
- The trade `authorities` to cite.
- The list of calculators: each `slug`, `title`, `accent`, `search_question`, `card_description`
  (full per-calculator math lives in PROMPT 02 — here you only need card/guide-level data).

## Step 0 — Read the canonical references (do not skip)

- `src/config/hvacCalculators.ts` — the config shape to mirror.
- `src/config/calculatorCategories.ts` — the category registry.
- `src/pages/calculators/hvac/index.astro` — the hub page to mirror.
- `src/components/CalculatorToolCard.astro` and `src/components/CalculatorCategoryCard.astro`.
- `src/layouts/Layout.astro`, `src/components/Header.astro`, `src/components/Footer.astro`.

## Step 1 — Make the tool card reusable (one-time, only if still HVAC-specific)

`CalculatorToolCard.astro` currently hard-codes `@/config/hvacCalculators` and the
`/calculators/hvac/` path. Generalize it so any category can use it, **without breaking HVAC**:

- Change its props to `{ calculator, styles, basePath }` where `calculator` is a minimal interface
  (`slug, title, description, question, icon`), `styles` is the accent-style object, and `basePath`
  is e.g. `/calculators/electrical`.
- Build the link as `` `${basePath}/${calculator.slug}` `` and apply `styles.*` classes.
- Update the **HVAC hub's** single `<CalculatorToolCard … />` usage to pass
  `calculator={calculator} styles={hvacAccentStyles[calculator.accent]} basePath="/calculators/hvac"`.
- Re-build to confirm HVAC still renders.

(Zero-risk fallback if you prefer not to touch shared code: copy it to `<Category>ToolCard.astro`
importing `<slug>AccentStyles`, and use that in the new hub only.)

## Step 2 — Create `src/config/<slug>Calculators.ts`

Mirror `hvacCalculators.ts` structure exactly, renamed for this category:

1. `export type <Cat>CalculatorAccent = …` — union of every accent family used by this category's
   calculators (e.g. `"blue" | "sky" | "indigo" | …`).
2. `export type <Cat>Calculator = { slug; title; description; question; accent; icon }`.
3. `export const <slug>Calculators: <Cat>Calculator[] = [ … ]` — one entry per calculator from the
   brief (use `card_description` and `search_question`; `icon` = a 24×24 stroke SVG string).
4. `export const <slug>AccentStyles: Record<<Cat>CalculatorAccent, {iconBg; iconColor; hoverBorder;
   hoverTitle; ctaColor; linkColor}>` — copy the relevant blocks from `hvacAccentStyles` for each
   accent you used (add new color blocks following the same Tailwind pattern, e.g. `red`, `amber`).
5. `export const <slug>CalculatorGuide = [ … ]` — the "Which calculator do I need?" rows
   (`question, slug, tool, accent as const, rule`).
6. `export const <slug>Faqs = [ … ]` — 4–6 category-level FAQs (free? which first? accuracy vs.
   pro standard? other trades coming?). Reuse the HVAC FAQ tone.

## Step 3 — Flip the category live in `src/config/calculatorCategories.ts`

Find the category entry (it likely already exists with `status: "coming-soon"`). Set
`status: "live"`, add `toolCount: <N>` (exact number of calculators), and refresh its `description`
to enumerate the tools. If the category isn't present, add it (slug, name, description, accent, icon).

## Step 4 — Create `src/pages/calculators/<slug>/index.astro`

Mirror `src/pages/calculators/hvac/index.astro` section-for-section, importing from
`@/config/<slug>Calculators` and the (generalized) `CalculatorToolCard`:

- `Layout` with a category `title` + meta `description` (enumerate the tools, like the HVAC hub).
- `<Fragment slot="head">`: canonical (`https://tradesquote.ai/calculators/<slug>`), OG + Twitter,
  and `BreadcrumbList`, `ItemList`, and `FAQPage` JSON-LD (ItemList from `<slug>Calculators`, FAQ
  from `<slug>Faqs`).
- Hero (breadcrumb Home / Calculators / `<Name>`; badge "`<Name>` Tools · N Free Calculators";
  H1; `hero_intro`).
- Calculator directory grid: `{<slug>Calculators.map((c) => <CalculatorToolCard … />)}` plus the
  dashed "More trades on the way" card (reuse the HVAC hub's `comingSoonCategories` block).
- "Which calculator do I need?" table driven by `<slug>CalculatorGuide` (use `order_hint` as intro).
- "Every `<Name>` formula on one page" dark code block — one line per calculator's headline formula.
- FAQ section from `<slug>Faqs`.
- The standard TradesQuote CTA block + Footer.

## Acceptance criteria

- `npm run build` passes; HVAC hub still renders (if you generalized the card).
- New hub lists every calculator; the formula cheat-sheet and guide table cover all of them.
- `toolCount` equals the real calculator count; counts/wording in hub copy agree.
- All `/calculators/<slug>/<calc-slug>` links resolve (the calculator pages come from PROMPT 02 —
  it's fine if they 404 until those are generated; flag any link whose slug isn't in the brief).

## Output

Report: files created/edited, the final `toolCount`, and any brief fields that were missing.
Do not invent calculators beyond the brief.
