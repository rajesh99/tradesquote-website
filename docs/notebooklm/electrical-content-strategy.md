# Electrical Content Strategy

The plan to stand up `/calculators/electrical/` and an electrical blog cluster at the same
depth as HVAC. Mirrors the structure of `hvac-content-strategy.md`, but written after research
into what electricians and homeowners actually search for and what competitors already own.

**Market assumption:** United States, imperial units, **NEC (NFPA 70)** as the governing
authority — consistent with the HVAC side's ASHRAE/ACCA/DOE framing and the company's US entity.
Do not write UK/AU/EU content into this category.

**Code edition policy:** write to **NEC 2023** as the baseline, note **NEC 2026** changes in a
callout where a rule actually moved. NEC 2026 was published 2025-08-20, but most states still
enforce 2020 or 2023 — a page that presents 2026 as universal will be wrong for most readers.
Every code citation must name the article/table so it survives a cycle change.

---

## 1. Why electrical is the right second category

| Signal | Finding |
| --- | --- |
| **Demand shape** | Same shape as HVAC: a small number of enormous "what size ___ do I need" queries feeding a long tail of code-lookup and cost queries. Wire size, breaker size, conduit fill, voltage drop, and load calculation are the five anchors. |
| **Converter volume** | Electrical has a top-of-funnel HVAC lacks: unit conversions (`watts to amps`, `amps to watts`, `kVA to amps`, `hp to amps`, Ohm's law). Very high volume, near-zero difficulty, trivially serviceable. |
| **Commercial value** | Panel upgrade, whole-house rewire, EV charger install, generator install, and "how to estimate electrical jobs" are all high-bid keywords — the same profile as HVAC's `hvac replacement cost` / `estimating for hvac` pair. |
| **Growth curve** | Electrification (EV, heat pumps, induction, solar + storage) is pushing load-calculation and panel-capacity questions up every year. NEC 220.87 and the solar 120% rule are rising queries with weak incumbent content. |
| **Cross-sell to HVAC** | Heat-pump conversions *are* electrical jobs. The existing `hvac-amp-draw-calculator` already lives at the seam. Two categories that link to each other beat two isolated silos. |
| **Reusable machinery** | `docs/calculator-prompts/` was written category-agnostic and literally uses `electrical-wire-size-calculator` as its worked example. The generator prompts already exist. |

### Competitive landscape

The electrical calculator space is **more crowded than HVAC was** — but shallow. Incumbents fall
into three groups, and none of them do what TradesQuote can do:

- **Thin single-tool sites** (`conduit-fill-calculator.com`, `voltagedropcalculator.net`,
  `wiresizes.com`, dozens of `*.app` clones). One calculator, no depth, no editorial.
- **Manufacturer tools** (Southwire's Re3 suite, Champion/Cummins/Generac generator sizers).
  Authoritative but product-gated and not SEO-optimised for the plain-English question.
- **Education/CE sites** (Mike Holt forums, ExpertCE, JADE Learning, EC&M). Deep code content,
  no interactive tools, poor commercial pages.

**The wedge:** the only site that pairs a *code-correct interactive calculator* with a
*plain-English explainer that funnels into a job quote*. That's exactly the HVAC playbook, and no
electrical incumbent runs it end to end.

### What HVAC taught us that applies here

1. Blog posts were the biggest single win — 39 posts around 45 calculators. Do posts and
   calculators in the same wave, not calculators-first.
2. Every post ends in a calculator CTA; every calculator links 4 siblings. No orphan pages.
3. Duplicate/overlapping angles are fine when the content genuinely differs (confirmed with the
   user during HVAC Phase 3.7) — `wire size chart` and `what size wire do I need` can both exist.
4. Avoid year-stamped slugs. `hvac-system-cost-2025` cost a rename plus a 301. Use
   `electrical-panel-upgrade-cost`, never `-2026`.
5. Bold inline links woven into prose — never a "Related Posts" list block.

---

## 2. Phase 0 — de-HVAC-ify the shared machinery (blocks everything)

The codebase is currently single-category. These are hard blockers, found by inspection:

| File | Problem | Fix |
| --- | --- | --- |
| `src/components/CalculatorToolCard.astro` | Imports `hvacAccentStyles` from `@/config/hvacCalculators` directly (line 3) | Accept `styles` as a prop; keep HVAC working |
| `src/components/HvacRelatedCalculators.astro` | Types + accent map bound to HVAC; heading defaults to "More HVAC calculators" | Rename to `RelatedCalculators.astro`, take `styles` + `heading` as props |
| `src/components/HvacExternalResources.astro` | Defaults to `DEFAULT_HVAC_EXTERNAL_RESOURCES`, heading hard-codes "HVAC" | Make `resources` + headings required props, or duplicate as `ElectricalExternalResources` |
| `src/pages/blog/index.astro` | `<h1>HVAC Blog</h1>`, HVAC meta | Neutralise to "Blog" / trade-agnostic copy |
| `src/pages/blog/page/[slug].astro` | Same HVAC h1 + meta | Same |
| `src/pages/blog/categories/[category].astro` | `title={\`${title} – HVAC Blog\`}` — `/blog/categories/electrical` would literally render "Electrical – HVAC Blog" | Derive per-category copy from the category param |
| `src/pages/blog/tags/[tag].astro` | Same HVAC title/description template | Same |
| `src/config/calculatorCategories.ts` | `electrical` exists but `status: "coming-soon"`, thin description, no `toolCount` | Flip to `live`, expand description, set real count. Accent is already `sky` — keep it. |

Also new in Phase 0:

- `src/config/electricalCalculators.ts` — `ElectricalCalculatorAccent`, `electricalCalculators[]`,
  `electricalAccentStyles`, `guide[]`, `faqs[]` (mirror `hvacCalculators.ts`).
- `src/config/electricalExternalResources.ts` — NFPA/NEC, IEEE, UL, NECA, EIA, DOE.
- `src/pages/calculators/electrical/index.astro` — hub page, grouped by workflow from day one
  (HVAC's hub grew flat and the strategy doc still lists "group by workflow" as pending).

`src/lib/calculatorFaq.ts`, `src/lib/schema.ts`, `Layout.astro`, `Base.astro`, and the content
collection schema are all already category-neutral. No change needed.

---

## 3. Authorities to cite

Every formula and default must trace to one of these, cited inline and in the page's
"Sources & standards" line.

| Authority | Used for |
| --- | --- |
| **NFPA 70 / NEC 2023 (+2026 deltas)** | Everything code: ampacity 310.16, derating 310.15, dwelling service 310.12, OCPD 240.4/240.6, load calc Art. 220, conduit fill Ch. 9 Tables 1/4/5, box fill 314.16, grounding 250.66/250.122, motors Art. 430, transformers 450.3, EV 625, PV 690/705 |
| **IEEE** | Fault current, grounding practice, power quality |
| **UL** | Listing/labelling, AIC ratings, terminal temperature ratings |
| **NECA** | Labor units (MLU), standard installation practice |
| **U.S. EIA** | Electricity price per kWh for operating-cost calculators |
| **DOE / ENERGY STAR** | Lighting efficacy, motor efficiency, EV charging guidance |
| **IES** | Footcandle targets by space type |
| **Manufacturer data** (Generac, Cummins, Eaton, Square D) | Generator sizing, panel busbar ratings, breaker AIC |

> **Editorial guardrail:** this content advises on code-governed, life-safety work. Every page
> carries the same disclaimer pattern the HVAC pages use, plus: *results are for estimating and
> planning; the AHJ and a licensed electrician have final say; local amendments override.*

---

## 4. Calculators — 44 tools in 7 workflow clusters

Slug convention `electrical-<tool>-calculator`, routed folder-based to
`/calculators/electrical/<slug>`. Accent families are assigned per cluster so the hub grid reads
as groups. **Bold = wave 1.**

### A. Conductor & circuit sizing (10) — the anchor cluster
| Slug | Answers | Accent |
| --- | --- | --- |
| **`electrical-wire-size-calculator`** | What gauge for N amps at L feet? (310.16 + voltage drop, whichever governs) | blue |
| **`electrical-voltage-drop-calculator`** | Drop % vs the 3%/5% recommendation | sky |
| **`electrical-ampacity-calculator`** | Derated ampacity: ambient 310.15(B)(1) × bundling 310.15(C)(1), capped by 110.14(C) | cyan |
| **`electrical-breaker-size-calculator`** | OCPD from load, continuous at 125% (210.20(A)), next standard size (240.6) | red |
| **`electrical-conduit-fill-calculator`** | Fill % for EMT/PVC/RMC/IMC (Ch. 9 T1/T4/T5) | teal |
| **`electrical-box-fill-calculator`** | Cubic inches required per 314.16 | teal |
| **`electrical-ground-wire-size-calculator`** | EGC (T250.122) and GEC (T250.66) | emerald |
| **`electrical-service-wire-size-calculator`** | Dwelling service/feeder conductors, T310.12 "83% rule" | blue |
| `electrical-conduit-size-calculator` | Reverse: N conductors → minimum trade size | teal |
| `electrical-wire-ampacity-chart` | Lookup reference, all temp columns, Cu + Al | slate/sky |

### B. Load calculation & service sizing (8)
| Slug | Answers | Accent |
| --- | --- | --- |
| **`electrical-load-calculator`** | Residential optional method 220.82 (first 10 kVA @100%, remainder @40%) | indigo |
| **`electrical-service-size-calculator`** | 100 / 150 / 200 / 400 A, plus headroom left | indigo |
| **`electrical-existing-load-calculator`** | 220.87 max demand from 12 months of utility data | violet |
| `electrical-standard-load-calculator` | Standard method with 220.42–220.55 demand factors | indigo |
| `electrical-subpanel-calculator` | Feeder conductors + neutral (215.2, 220.61) | violet |
| `electrical-commercial-load-calculator` | VA/sq ft by occupancy (T220.12) + demand factors | violet |
| `electrical-demand-factor-calculator` | Ranges 220.55, dryers 220.54, multi-family | indigo |
| `electrical-panel-schedule-calculator` | Per-phase balance on a 1φ or 3φ panel | slate |

### C. Conversions & formulas (8) — top-of-funnel volume
| Slug | Answers | Accent |
| --- | --- | --- |
| **`electrical-watts-to-amps-calculator`** | W → A for DC, 1φ, 3φ | emerald |
| **`electrical-amps-to-watts-calculator`** | A → W with PF | emerald |
| **`electrical-ohms-law-calculator`** | V/I/R/P wheel, solve any two | teal |
| **`electrical-unit-converter`** | W ↔ kW ↔ kVA ↔ hp ↔ BTU/h ↔ A | sky |
| `electrical-kva-calculator` | kVA ↔ kW ↔ A, 1φ and 3φ | emerald |
| `electrical-three-phase-power-calculator` | √3 math: kW, kVA, kVAR, line amps | cyan |
| `electrical-power-factor-calculator` | PF + capacitor kVAR: Qc = P(tanφ₁ − tanφ₂) | teal |
| `electrical-kwh-cost-calculator` | Appliance/circuit running cost at EIA rates | amber |

### D. Motors, transformers, fault current (5) — commercial/industrial
| Slug | Answers | Accent |
| --- | --- | --- |
| `electrical-motor-fla-calculator` | FLA from T430.248/430.250 (not the nameplate) | orange |
| `electrical-motor-circuit-calculator` | Conductor 430.22, OCPD T430.52, overload 430.32 | orange |
| `electrical-transformer-sizing-calculator` | kVA, primary/secondary FLA, OCPD 450.3 | red |
| `electrical-short-circuit-calculator` | Available fault current, point-to-point; AIC check | red |
| `electrical-conductor-resistance-calculator` | Ch. 9 T8/T9 resistance, R and Z runs | cyan |

### E. EV, solar, storage, generators (6) — the growth cluster
| Slug | Answers | Accent |
| --- | --- | --- |
| **`electrical-ev-charger-calculator`** | EVSE circuit: continuous ×125% (625.41/42) → wire, breaker, panel check | emerald |
| **`electrical-generator-sizing-calculator`** | Standby kW from selected loads, ×1.25 margin | orange |
| `electrical-solar-interconnection-calculator` | 705.12(B)(3)(2) 120% busbar rule | amber |
| `electrical-solar-string-calculator` | Voc cold / Vmp hot string limits (690.7) | amber |
| `electrical-battery-backup-calculator` | Runtime hours from kWh and selected loads | violet |
| `electrical-transfer-switch-calculator` | ATS size + which circuits fit | orange |

### F. Lighting & devices (3)
| Slug | Answers | Accent |
| --- | --- | --- |
| `electrical-lighting-calculator` | Fixture count = area × footcandles ÷ lumens/fixture | amber |
| `electrical-recessed-lighting-calculator` | Can count + spacing (≈ ceiling height ÷ 2) and layout | amber |
| `electrical-receptacle-circuit-calculator` | Outlets/lights per circuit — 180 VA (220.14(I)) and the 80% convention | rose |

### G. Cost & business (7) — the TradesQuote funnel
| Slug | Answers | Accent |
| --- | --- | --- |
| **`electrical-estimate-calculator`** | Job price: material + labor + overhead + markup | rose |
| **`electrical-panel-upgrade-cost-calculator`** | 100 A → 200 A installed cost | rose |
| **`electrical-labor-rate-calculator`** | Loaded hourly rate from wage, burden, billable hours | rose |
| `electrical-rewiring-cost-calculator` | Whole-house rewire by sq ft, age, access | orange |
| `electrical-ev-charger-install-cost-calculator` | Install cost by distance, panel work, permit | emerald |
| `electrical-generator-install-cost-calculator` | Generator + ATS + gas + pad + permit | orange |
| `electrical-markup-margin-calculator` | Markup vs margin, target-margin price | rose |

### Reference pages (3, non-calculator)
- `/calculators/electrical/formulas` — the formula wall (mirror the HVAC formulas page)
- `/calculators/electrical/glossary` — 60+ terms: ampacity, AIC, EGC/GEC, THHN, MCA/MOCP, kVA, PF…
- `/calculators/electrical/nec-tables` — static lookup: 310.16, Ch. 9 fill, 314.16, 250.66/250.122,
  430.248/430.250, 240.6. High-intent, zero-JS, strong internal-link hub.

---

## 5. Blog posts — 69 titles in 11 clusters

Format matches the HVAC strategy doc: filename · title · target keyword · calculator it funnels
into. Tier 1 = build first (highest volume × lowest competition × has a calculator to feed).

### Cluster 1 — Wire & conductor sizing (10)
| File | Title | Keyword | Calculator | Tier |
|---|---|---|---|---|
| `what-size-wire-do-i-need.mdx` | What Size Wire Do I Need? AWG by Amps, Distance, and Material | what size wire do i need | wire-size | 1 |
| `wire-size-chart-amps.mdx` | Wire Size Chart: Amps to AWG for Copper and Aluminum | wire size chart | wire-ampacity-chart | 1 |
| `voltage-drop-calculation.mdx` | Voltage Drop: How to Calculate It and What the NEC 3% Rule Really Says | voltage drop calculation | voltage-drop | 1 |
| `12-gauge-wire-amps.mdx` | 12 Gauge Wire Amps: 20 A, 25 A, or 30 A — and When Each Applies | 12 gauge wire amps | ampacity | 1 |
| `what-size-wire-for-100-amp-subpanel.mdx` | What Size Wire for a 100 Amp Sub Panel? | wire size for 100 amp sub panel | service-wire-size | 1 |
| `200-amp-service-wire-size.mdx` | 200 Amp Service Wire Size: Copper vs Aluminum and the 83% Rule | 200 amp service wire size | service-wire-size | 1 |
| `wire-derating-nec.mdx` | Wire Derating Explained: Ambient Temperature and Conductor Bundling | wire derating nec | ampacity | 2 |
| `10-gauge-wire-amps.mdx` | 10 Gauge Wire Amps: Ratings, Breaker Match, and Max Run Length | 10 gauge wire amps | ampacity | 2 |
| `copper-vs-aluminum-wire.mdx` | Copper vs Aluminum Wire: Sizing, Cost, and Where Each Belongs | copper vs aluminum wire | wire-size | 2 |
| `thhn-vs-nm-b-vs-mc-cable.mdx` | THHN vs NM-B vs MC Cable: Which Wiring Method Goes Where | thhn vs romex | wire-size | 3 |

### Cluster 2 — Breakers, circuits & panels (9)
| File | Title | Keyword | Calculator | Tier |
|---|---|---|---|---|
| `what-size-breaker-do-i-need.mdx` | What Size Breaker Do I Need? Sizing OCPD by Load | what size breaker do i need | breaker-size | 1 |
| `how-many-outlets-on-a-20-amp-circuit.mdx` | How Many Outlets on a 20 Amp Circuit? The Real NEC Answer | how many outlets on a 20 amp circuit | receptacle-circuit | 1 |
| `15-amp-vs-20-amp-circuit.mdx` | 15 Amp vs 20 Amp Circuit: Wire, Outlets, and When to Use Each | 15 amp vs 20 amp | breaker-size | 1 |
| `100-amp-vs-200-amp-service.mdx` | 100 Amp vs 200 Amp Service: Which Does Your Home Actually Need? | 100 amp vs 200 amp service | service-size | 1 |
| `80-percent-rule-electrical.mdx` | The 80% Rule for Circuits: Continuous Load, Explained | 80 percent rule electrical | breaker-size | 2 |
| `how-many-lights-on-one-circuit.mdx` | How Many Lights Can You Put on One Circuit? | how many lights on one circuit | receptacle-circuit | 2 |
| `subpanel-wire-and-breaker-sizing.mdx` | Sub Panel Sizing: Feeder Wire, Breaker, Neutral, and Ground | sub panel sizing | subpanel | 2 |
| `electrical-panel-full-tandem-breakers.mdx` | Panel Is Full: Tandem Breakers, Subpanels, and What's Actually Legal | tandem breakers | panel-schedule | 3 |
| `main-breaker-vs-main-lug.mdx` | Main Breaker vs Main Lug Panels: The 6-Handle Rule | main breaker vs main lug | service-size | 3 |

### Cluster 3 — Load calculation & service sizing (7)
| File | Title | Keyword | Calculator | Tier |
|---|---|---|---|---|
| `residential-electrical-load-calculation.mdx` | Residential Load Calculation: NEC 220.82 Step by Step | residential electrical load calculation | load-calculator | 1 |
| `what-size-electrical-service-do-i-need.mdx` | What Size Electrical Service Do I Need? 100 A to 400 A | what size electrical service do i need | service-size | 1 |
| `do-i-need-a-panel-upgrade.mdx` | Do I Need a Panel Upgrade? How to Tell Before Spending $3,000 | do i need a panel upgrade | existing-load | 1 |
| `standard-vs-optional-load-calculation.mdx` | Standard vs Optional Load Calculation: Which Method to Use | standard vs optional load calculation | standard-load | 2 |
| `nec-220-87-existing-load.mdx` | NEC 220.87: Using Utility Data to Prove You Don't Need a Panel Upgrade | nec 220.87 | existing-load | 2 |
| `commercial-electrical-load-calculation.mdx` | Commercial Load Calculation: VA per Square Foot by Occupancy | commercial electrical load calculation | commercial-load | 2 |
| `range-and-dryer-demand-factors.mdx` | Range and Dryer Demand Factors: NEC 220.54 and 220.55 | range demand factor nec | demand-factor | 3 |

### Cluster 4 — Raceway, boxes & rough-in (5)
| File | Title | Keyword | Calculator | Tier |
|---|---|---|---|---|
| `conduit-fill-chart.mdx` | Conduit Fill Chart: How Many Wires Fit in EMT, PVC, and RMC | conduit fill chart | conduit-fill | 1 |
| `how-to-calculate-conduit-fill.mdx` | How to Calculate Conduit Fill (NEC Chapter 9, Tables 1, 4, and 5) | how to calculate conduit fill | conduit-fill | 1 |
| `box-fill-calculation.mdx` | Box Fill Calculation: Counting Conductors per NEC 314.16 | box fill calculation | box-fill | 1 |
| `receptacle-spacing-nec-210-52.mdx` | Receptacle Spacing Rules: The 6-Foot Rule and Kitchen Countertops | receptacle spacing nec | receptacle-circuit | 2 |
| `conduit-bending-multipliers.mdx` | Conduit Bending: Offset, Saddle, and Stub-Up Multipliers | conduit bending multipliers | — | 3 |

### Cluster 5 — Grounding, bonding & protection (5)
| File | Title | Keyword | Calculator | Tier |
|---|---|---|---|---|
| `ground-wire-size-chart.mdx` | Ground Wire Size Chart: EGC vs GEC (250.122 and 250.66) | ground wire size chart | ground-wire-size | 1 |
| `gfci-vs-afci.mdx` | GFCI vs AFCI: What Each Protects and Where the NEC Requires It | gfci vs afci | — | 1 |
| `grounding-vs-bonding.mdx` | Grounding vs Bonding: What Each One Actually Does | grounding vs bonding | ground-wire-size | 2 |
| `where-gfci-is-required.mdx` | Where GFCI Protection Is Required (NEC 210.8, With the 2023 Changes) | where is gfci required | — | 2 |
| `afci-gfci-nuisance-tripping.mdx` | AFCI and GFCI Nuisance Tripping: How to Actually Diagnose It | afci nuisance tripping | — | 3 |

### Cluster 6 — Formulas & conversions (6)
| File | Title | Keyword | Calculator | Tier |
|---|---|---|---|---|
| `electrical-formulas-cheat-sheet.mdx` | Electrical Formulas Cheat Sheet: Ohm's Law to Three-Phase | electrical formulas | /formulas | 1 |
| `watts-to-amps.mdx` | Watts to Amps: The Formula for DC, Single-Phase, and Three-Phase | watts to amps | watts-to-amps | 1 |
| `amps-to-watts.mdx` | Amps to Watts: Conversion With Voltage and Power Factor | amps to watts | amps-to-watts | 1 |
| `ohms-law-explained.mdx` | Ohm's Law Explained: V, I, R, and the Power Wheel | ohms law | ohms-law | 2 |
| `kva-vs-kw.mdx` | kVA vs kW: Power Factor, Apparent Power, and Why It Matters | kva vs kw | kva | 2 |
| `three-phase-power-calculation.mdx` | Three-Phase Power: Why √3, and How to Get Line Amps | three phase power calculation | three-phase-power | 2 |

### Cluster 7 — Motors, transformers & fault current (5)
| File | Title | Keyword | Calculator | Tier |
|---|---|---|---|---|
| `motor-full-load-amps.mdx` | Motor Full Load Amps: Why You Use Table 430.250, Not the Nameplate | motor full load amps | motor-fla | 2 |
| `motor-circuit-sizing.mdx` | Motor Circuit Sizing: Conductors, OCPD, and Overload Protection | motor circuit sizing | motor-circuit | 2 |
| `transformer-sizing-calculation.mdx` | Transformer Sizing: kVA, Primary and Secondary OCPD (NEC 450.3) | transformer sizing calculation | transformer-sizing | 2 |
| `available-fault-current.mdx` | Available Fault Current: The Point-to-Point Method and AIC Ratings | available fault current calculation | short-circuit | 3 |
| `power-factor-correction.mdx` | Power Factor Correction: Sizing Capacitor kVAR and Cutting Demand Charges | power factor correction | power-factor | 3 |

### Cluster 8 — EV, solar, storage & generators (7)
| File | Title | Keyword | Calculator | Tier |
|---|---|---|---|---|
| `what-size-wire-for-ev-charger.mdx` | What Size Wire and Breaker for an EV Charger? | what size wire for ev charger | ev-charger | 1 |
| `ev-charger-installation-cost.mdx` | EV Charger Installation Cost: What Drives the $500–$2,500 Range | ev charger installation cost | ev-charger-install-cost | 1 |
| `what-size-generator-do-i-need.mdx` | What Size Generator Do I Need? Whole-House kW by Load | what size generator do i need | generator-sizing | 1 |
| `panel-upgrade-for-ev-charger.mdx` | Do You Need a Panel Upgrade for an EV Charger? (And the Load-Management Alternative) | panel upgrade for ev charger | existing-load | 2 |
| `solar-120-percent-rule.mdx` | The Solar 120% Rule: NEC 705.12 Busbar Math, Done Right | solar 120 rule | solar-interconnection | 2 |
| `standby-generator-installation-cost.mdx` | Standby Generator Installation Cost: Unit, ATS, Gas, Pad, Permit | generator installation cost | generator-install-cost | 2 |
| `solar-string-sizing.mdx` | Solar String Sizing: Cold-Weather Voc and Hot-Weather Vmp Limits | solar string sizing | solar-string | 3 |

### Cluster 9 — Lighting (3)
| File | Title | Keyword | Calculator | Tier |
|---|---|---|---|---|
| `how-many-recessed-lights-do-i-need.mdx` | How Many Recessed Lights Do I Need? Count and Spacing by Room | how many recessed lights do i need | recessed-lighting | 1 |
| `lumens-per-square-foot.mdx` | Lumens per Square Foot: Footcandle Targets Room by Room | lumens per square foot | lighting | 2 |
| `led-retrofit-payback.mdx` | LED Retrofit Payback: Watts Saved vs Fixture Cost | led retrofit payback | kwh-cost | 3 |

### Cluster 10 — Costs & business (8) — highest commercial value
| File | Title | Keyword | Calculator | Tier |
|---|---|---|---|---|
| `electrical-panel-upgrade-cost.mdx` | Electrical Panel Upgrade Cost: 100 A to 200 A | electrical panel upgrade cost | panel-upgrade-cost | 1 |
| `cost-to-rewire-a-house.mdx` | Cost to Rewire a House: Per Square Foot by Age and Access | cost to rewire a house | rewiring-cost | 1 |
| `how-to-estimate-electrical-jobs.mdx` | How to Estimate Electrical Jobs: Takeoff, Assemblies, and Labor Units | electrical estimating | estimate | 1 |
| `electrician-hourly-rate.mdx` | Electrician Hourly Rate: Apprentice, Journeyman, Master | electrician hourly rate | labor-rate | 1 |
| `electrical-labor-units-explained.mdx` | Electrical Labor Units: NECA MLU vs Your Own Job History | electrical labor units | labor-rate | 2 |
| `electrical-markup-vs-margin.mdx` | Markup vs Margin: How Electrical Contractors Price Jobs | electrical markup vs margin | markup-margin | 2 |
| `cost-to-install-an-outlet.mdx` | Cost to Install an Outlet or Add a Dedicated Circuit | cost to install an outlet | estimate | 2 |
| `flat-rate-vs-time-and-materials.mdx` | Flat Rate vs Time and Materials for Electrical Service Work | flat rate electrical pricing | labor-rate | 3 |

### Cluster 11 — Code & compliance evergreen (4)
| File | Title | Keyword | Calculator | Tier |
|---|---|---|---|---|
| `nec-adoption-by-state.mdx` | NEC Adoption by State: Which Code Cycle Applies to You | nec adoption by state | — | 2 |
| `nec-2023-vs-2026-changes.mdx` | NEC 2023 vs 2026: The Changes That Affect Everyday Work | nec 2026 changes | — | 2 |
| `common-nec-violations.mdx` | The 10 NEC Violations Inspectors Flag Most | common nec violations | — | 3 |
| `electrical-permits-and-inspections.mdx` | Electrical Permits and Inspections: What Gets Failed and Why | electrical permit requirements | estimate | 3 |

**Totals:** 69 posts — 27 tier 1, 25 tier 2, 17 tier 3.

---

## 6. Cross-category bridge to HVAC

This is free authority that a standalone electrical site can't have. Build these links
deliberately in both directions:

| Electrical page | Links to existing HVAC page | Why |
| --- | --- | --- |
| `what-size-breaker-do-i-need` | `/calculators/hvac/hvac-amp-draw-calculator` | "what size breaker for a 3-ton AC" is an HVAC-shaped query with an electrical answer — the amp-draw calc already computes MCA/MOCP. **Do not rebuild it under electrical**; link it. |
| `do-i-need-a-panel-upgrade` | `hvac-heat-pump-calculator`, `heat-pump-vs-gas-furnace-cost` | Heat-pump conversion is the #1 driver of residential panel-capacity questions |
| `electrical-load-calculator` | `hvac-manual-j-calculator` | The HVAC load feeds the electrical load; both are "load calculation" queries |
| `electrician-hourly-rate` | `hvac-labor-rate` | Same loaded-rate math, different burden numbers |
| `how-to-estimate-electrical-jobs` | `how-to-estimate-hvac-jobs` | Sibling business posts; the highest-bid keyword in each trade |
| `what-size-generator-do-i-need` | `hvac-amp-draw-calculator` | Central AC is the largest single generator-sizing input |

Add a reciprocal link on the HVAC side in the same pass — one-directional linking wastes half
the value.

---

## 7. Execution order

| Wave | Contents | Notes |
| --- | --- | --- |
| **0** | The 8 de-HVAC-ification fixes + `electricalCalculators.ts` + `electricalExternalResources.ts` + hub page | Blocks everything. Small, mechanical, must land first. |
| **1** | 12 anchor calculators + 18 tier-1 posts | Anchors: wire-size, voltage-drop, ampacity, breaker-size, conduit-fill, box-fill, ground-wire-size, service-wire-size, load-calculator, service-size, ev-charger, estimate. Brief already written: `briefs/electrical.md`. |
| **2** | 10 calculators (conversions + cost cluster) + 12 tier-1 posts | Conversions are cheap to build and pull the most raw traffic. Cost cluster carries the commercial intent. |
| **3** | `/formulas`, `/glossary`, `/nec-tables` reference pages + 12 tier-2 posts | Reference pages become the internal-link hub. |
| **4** | 12 calculators (motors, transformers, fault current, solar, lighting) + 13 tier-2 posts | Commercial/industrial audience; lower volume, higher bid. |
| **5** | Remaining 10 calculators + 17 tier-3 posts + full internal-linking pass + HVAC↔Electrical bridge | Mirror HVAC Phase 3.10: every post gets 2–4 contextual sibling links. |

**Do calculators and their posts in the same wave.** HVAC built 45 calculators before any posts
existed and then spent five phases catching up.

---

## 8. Per-page requirements (inherited from HVAC, non-negotiable)

**Calculators** — `src/pages/calculators/electrical/<slug>/index.astro` + a
`src/scripts/calculators/<slug>.ts` exporting `init<Name>()`. Structure: hero → input card +
sticky gradient result panel + "See the breakdown" `<details>` → plain-English formula → 3 worked
examples → reference table → 6–7 FAQ → TradesQuote CTA → 4 related calculators. SEO: unique title +
description, canonical, OG/Twitter, and three JSON-LD blocks (`BreadcrumbList`, `WebApplication`,
`FAQPage` mirroring the on-page FAQ exactly). Uses the minimal `Layout.astro` with `<slot name="head" />`;
SSR (no `prerender`).

**Blog posts** — `src/content/posts/<slug>.mdx`, frontmatter `categories: ["electrical"]`,
5 tags, `image: /images/posts/<slug>-hero.webp`, `draft: false`. Three inline SVG diagram
components under `src/components/blog/<topic>/`, wrapped in `<BlogInfographic>`. Bold inline
markdown links into siblings and calculators — never a "Related Posts" block. Uses `Base.astro`;
prerendered. Precompute any stacked-bar offsets in frontmatter, not inline IIFEs in the template.

**Acceptance per wave** — `npm run build` passes; hub lists every calculator and `toolCount`
matches; script IDs reconcile 1:1 with markup; reference-table and worked-example numbers equal
what the script computes; no dangling internal links; every code claim carries an article/table
citation and a "Sources & standards" line.

---

## 9. Research sources

Competitor tool inventories: [ElectricianCalc](https://electriciancalc.com/),
[Southwire Calculators](https://www.southwire.com/calculators),
[ElectricalCalcTools](https://electricalcalctools.com/),
[Conduit Fill Calculator](https://conduit-fill-calculator.com/).
Code/technical: [NEC 220 load calculations (EC&M)](https://www.ecmweb.com/national-electrical-code/code-basics/article/21127208/load-calculations-part-1),
[Residential load calculation walkthrough](https://expertce.com/learn-articles/residential-load-calculation-nec-220/),
[Conduit fill NEC guide](https://expertce.com/learn-articles/conduit-fill-calculations-nec-guide/),
[GEC sizing 250.66](https://expertce.com/learn-articles/sizing-gec-nec-table-250-66/),
[GFCI 210.8 2023 changes](https://expertce.com/learn-articles/understanding-nec-2023-gfci-rule-changes-section-210-8-explained/),
[Solar 120% rule 705.12](https://solardesignlab.com/solar-120-percent-rule-nec-705-12/),
[NEC adoption by state](https://electricaltoolbox.com/nec-adoption/).
Cost/market: [Cost to rewire a house](https://homeguide.com/costs/cost-to-rewire-a-house),
[Panel replacement cost](https://homeguide.com/costs/cost-to-replace-electrical-panel),
[Electrician cost per hour](https://homeguide.com/costs/electrician-cost-per-hour),
[How to price electrical work](https://www.housecallpro.com/resources/how-to-price-electrical-work/),
[Best electrician keywords](https://seoforhomeservice.com/electrician/best-electrician-keywords/).

> **Gap vs HVAC:** HVAC had `docs/resources/hvac-formula-calculator-keywords-stats.csv` (875 keywords
> with volume + bid). There is no equivalent electrical CSV. Volumes above are ranked from SERP
> competition, competitor tool coverage, and topical reasoning — not measured data. Pulling a real
> electrical keyword export would let waves 2–5 be re-prioritised on evidence.
