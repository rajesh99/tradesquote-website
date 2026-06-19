# Category Brief — `<<Category Name>>`

> Copy this file to `briefs/<slug>.md`, fill every `<<placeholder>>`, then feed it to the two
> generator prompts. Research formulas, default values, and authoritative sources for this trade
> as you fill it in. Delete the HVAC examples shown in `> blockquotes` once you've replaced them.

---

## 1. Category

| Field | Value | Notes |
| --- | --- | --- |
| `name` | `<<Electrical>>` | Display name |
| `slug` | `<<electrical>>` | URL segment + config prefix, kebab-case |
| `accent` | `<<sky>>` | Category-card accent. One of: `blue, amber, emerald, violet, sky, orange, slate` (see `calculatorCategories.ts`) |
| `icon` | `<<inline SVG>>` | 24×24 stroke SVG, like other entries in `calculatorCategories.ts` |
| `one_liner` | `<<Wire gauge, circuit load, conduit fill, and voltage drop…>>` | Shown on the category card + hub meta |
| `hero_intro` | `<<2–3 sentences for the hub hero>>` | What this category's tools collectively cover |
| `order_hint` | `<<For a full circuit, the order is Load → Wire → Breaker → Conduit>>` | Optional intro line for the "Which calculator do I need?" table |

## 2. Authorities to cite (trade-appropriate)

List the standards bodies / data sources whose figures back this trade's formulas and defaults.
Pages must cite these inline + in a "Sources & standards" line.

> **HVAC used:** U.S. EIA (energy prices), U.S. DOE / ENERGY STAR (efficiency standards), ACCA Manual J/D (load/duct design).
>
> **Examples by trade:** Electrical → NEC / NFPA 70, IEEE, UL; Plumbing → IPC / UPC, ASPE, local code; Painting → manufacturer coverage specs (Sherwin-Williams, Benjamin Moore); Carpentry → APA / engineered-wood spans, IRC.

- `<<source 1 + URL>>`
- `<<source 2 + URL>>`

## 3. Calculators

Add one block per calculator (aim for 6–12). Each calculator gets a **distinct** accent color
family. Mark `type` as **sizing** (mirror `hvac-btu-calculator`) or **comparison/cost**
(mirror `hvac-seer-savings-calculator`).

---

### Calculator: `<<electrical-wire-size-calculator>>`

| Field | Value |
| --- | --- |
| `title` | `<<Wire Size Calculator>>` |
| `accent` | `<<blue>>` (distinct Tailwind family: blue, sky, cyan, teal, emerald, indigo, violet, rose, amber, orange, red…) |
| `search_question` | `<<What wire gauge do I need for 50 amps?>>` (drives the card + H1 framing) |
| `type` | `<<sizing | comparison/cost>>` |
| `card_description` | `<<One sentence for the hub card.>>` |

**Formula (plain English + constants):**
> `<<ampacity per AWG from NEC 310.16; size = smallest gauge whose ampacity ≥ load × 1.25; voltage drop = 2 × K × I × L ÷ CM…>>`

**Inputs** (id · label · control · options/range · default):
> - `ws-amps` · Load (amps) · number+slider · 0–400 · `50`
> - `ws-material` · Conductor · select · copper/aluminum · `copper`
> - `ws-length` · One-way run (ft) · number · 0–500 · `100`
> - `ws-voltage` · System voltage · select · 120/240/480 · `240`

**Result panel** (headline + 2 tiles + breakdown rows):
> - headline `ws-gauge` "6 AWG"; tiles: ampacity, voltage drop %; breakdown: required ampacity, base gauge, drop adjustment.

**Defaults must compute to** (used for the self-check + table/example consistency):
> `<<6 AWG copper, 3.1% drop … exact numbers>>`

**Reference table** (rows; optional but recommended):
> `<<Amps → AWG copper / aluminum table>>`

**Worked examples** (3; for comparison/cost types include one "not worth it" case):
> 1. `<<…>>`  2. `<<…>>`  3. `<<…>>`

**FAQ** (6–7 Q&A — these become the on-page FAQ **and** the FAQPage JSON-LD):
> Q: `<<What size wire for a 50-amp circuit?>>`  A: `<<…>>`
> Q: `<<…>>`  A: `<<…>>`

**Related calculators** (4 cross-links — slug · title · one-liner; mix new + existing):
> - `/calculators/electrical/electrical-breaker-size-calculator` · Breaker Size · "Match the breaker to the wire."
> - …

**Sources** (2–4 authoritative URLs, trade-appropriate):
> - `<<NEC 310.16 ampacity table — URL>>`

**CTA headline** (tailored one-liner for the TradesQuote CTA block):
> `<<Sized the circuit? Quote the whole job in seconds.>>`

---

### Calculator: `<<next-slug>>`
*(repeat the block above)*
