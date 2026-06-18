# PROMPT 02 — Generate ONE Calculator Page + Script

**Run once per calculator** (independent of the others — safe to run many in parallel as
subagents). Paste this whole prompt, then append the calculator's block from the **Category
brief**. The model has read/write access to this repo.

---

## Role & goal

You are building ONE free SEO calculator page for the TradesQuote website (Astro + Tailwind).
Create **exactly two files** and edit nothing else (config + hub are handled by PROMPT 01):

1. `src/pages/calculators/<category-slug>/<calculator-slug>/index.astro`
2. `src/scripts/calculators/<calculator-slug>.ts`

## Parameters (from the appended brief block)

`CATEGORY` (name + slug) · `SLUG` · `TITLE` · `ACCENT` (Tailwind family) · `SEARCH_QUESTION` ·
`TYPE` (`sizing` | `comparison/cost`) · `FORMULA` · `INPUTS` · `RESULT_PANEL` · `DEFAULTS_RESULT`
· `REFERENCE_TABLE` (optional) · `WORKED_EXAMPLES` · `FAQS` · `RELATED` (4) · `SOURCES` · `CTA_H2`.

## Step 1 — Read & mirror the canonical template (do not skip)

- If `TYPE = sizing`: mirror `src/pages/calculators/hvac/hvac-btu-calculator/index.astro` and
  `src/scripts/calculators/hvac-btu-calculator.ts`.
- If `TYPE = comparison/cost`: mirror `src/pages/calculators/hvac/hvac-seer-savings-calculator/index.astro`
  and `src/scripts/calculators/hvac-seer-savings-calculator.ts` (has the reference `<table>` + dynamic labels).
- Always read `src/layouts/Layout.astro`.

Reproduce the template's structure, Tailwind classes, and JSON-LD block shapes **exactly** — only
content, colors, IDs, and math change.

## Step 2 — Build the page (sections, in order)

1. **Frontmatter consts:** `title` (`"<TITLE> — <benefit/keyword> | TradesQuote"`), `description`
   (1–2 sentences, keyword-rich, "Instant, no sign-up."), `pageUrl =
   "https://tradesquote.ai/calculators/<category-slug>/<SLUG>"`, and the three JSON-LD objects:
   - `BreadcrumbList` — Home / Calculators / `<Category>` / `<TITLE>` (4 levels; `<Category>` href
     = `/calculators/<category-slug>`).
   - `WebApplication` — `name = TITLE`, `applicationCategory: "BusinessApplication"`, free offer.
   - `FAQPage` — built from `FAQS` (must match the on-page FAQ verbatim).
   Also a `relatedCalculators` array from `RELATED`.
2. **`<Fragment slot="head">`:** canonical + OG (`og:title/description/url/site_name/image`) +
   Twitter (`summary_large_image`) + the three `<script type="application/ld+json">` blocks.
3. **Hero:** breadcrumb, accent pill badge ("`<Category>` Tools · Free"), H1 =
   `"<TITLE> <span class='text-<ACCENT>-600'>— Free Online Calculator</span>"`, and a 2-sentence
   intro derived from `SEARCH_QUESTION` + what it computes. (Comparison/cost pages may add the
   emerald-style "differentiator" note box linking to sibling calculators — see the SEER template.)
4. **Calculator** (`<section id="calculator">`, two columns):
   - Left: input card titled "Enter your details" rendering every control in `INPUTS` (number,
     number+range slider, select, checkbox) with the template's label/markup; include a
     `id="resetBtn"` "Reset to defaults" button.
   - Right: `lg:sticky` result panel with `from-<ACCENT>-600 to-…-500` gradient: a headline result,
     the tiles + wide box from `RESULT_PANEL`, and a "See the breakdown" `<details>` listing each
     factor. Close with the "planning estimate — confirm with `<pro standard>`" fine print.
   - If `REFERENCE_TABLE` given, add it below the grid as a bordered card with a `<table>`.
5. **"The formula, explained in plain English":** dark `bg-slate-900` mono code block rendering
   `FORMULA` step-by-step (accent-colored `# comments`, amber-highlighted constants), plus four
   explainer cards.
6. **"Worked examples":** the 3 `WORKED_EXAMPLES`, each a card with a mono arithmetic block and a
   bolded "Result:" sentence. For `comparison/cost`, one example must show when it's NOT worth it.
7. **FAQ** (`<section id="faq">`): the `FAQS` as `<details>` accordions (markup from the template).
8. **CTA:** the standard TradesQuote gradient CTA block (3 feature tiles, both buttons, fine
   print) with H2 = `CTA_H2`.
9. **"More `<Category>` calculators":** 4-card grid from `relatedCalculators`.
10. **Bottom:** `<script>import { init<Name> } from "@/scripts/calculators/<SLUG>"; init<Name>();</script>`
    and the `<style>` range-thumb block (class `.<short>-range`, thumb = the accent's hex).

## Step 3 — Build the script `src/scripts/calculators/<SLUG>.ts`

- Export `export function init<Name>(): void`. Include `fmt` (`Math.round(n).toLocaleString("en-US")`);
  add `usd`/`usd2`/`pctFmt` as needed (copy from the SEER script for cost pages).
- `getElementById` every input + output id, then a single guard `if (!a || !b || …) return;`.
- A `calculate()` that reads inputs, applies `FORMULA`, and writes every result + breakdown id.
- Wire: `number ↔ range` mirror both directions; `selects/checkboxes/numbers` call `calculate` on
  `"input"` (selects that change other fields use `"change"`); `resetBtn` restores defaults and
  recomputes. Call `calculate()` once at the end.
- **`DEFAULTS_RESULT` is the contract:** with the default inputs, the script must produce those
  exact headline/tile values, and they must equal the `REFERENCE_TABLE`/`WORKED_EXAMPLES` numbers.

## SEO requirements (non-negotiable)

Unique title + meta description; canonical; OG + Twitter; the 3 JSON-LD blocks with FAQPage
mirroring the visible FAQ; one `<h1>`; descriptive `<h2>`s; keyword-aligned slug; internal links
to 4 sibling calculators.

## Sourcing & citations

Back `FORMULA` and default values with the brief's `SOURCES` (research/verify if thin). Cite them
naturally inline (e.g. "per the NEC", "U.S. EIA") and add a small "Sources & standards" fine-print
line (`text-xs text-slate-500`, `<a class="underline hover:text-<ACCENT>-600" target="_blank"
rel="noopener">`) after the reference table or formula section.

## Self-check before finishing

- Every `getElementById` id exists in the markup and vice-versa (re-read both files to confirm).
- Default inputs compute to `DEFAULTS_RESULT`; table/example numbers agree with the script.
- All 4 related links use real sibling slugs.
- The page compiles (`npm run build` passes for this route).

## Output

Confirm the two files created, the default computed result, and any unreconciled IDs (there should
be none). Do not edit config, the hub, or any other calculator.
