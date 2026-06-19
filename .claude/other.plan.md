## Blog Posts (biggest gap — you have 1, need ~20+)

These create the "topic cluster" that signals topical authority to Google. Each post targets a high-volume search query and links back to a calculator.

**Sizing & Load** (highest search volume)
| Post title | Target query | Links to |
|---|---|---|
| How Many BTU Do I Need? The Right AC Size for Every Room | "what size ac for 1500 sq ft" | BTU + Tonnage calc |
| What Size Heat Pump Do I Need in Cold Climates? | "heat pump sizing cold climate" | Heat pump calc |
| Furnace Sizing Guide: BTU by Climate Zone | "what size furnace do I need" | Furnace calc |
| Mini-Split vs Central Air: When Each Makes Sense | "mini split vs central air" | Mini-split calc |
| Manual J vs Rule of Thumb: When to Use Each | "manual j load calculation" | BTU calc |

**Diagnostics** (tech-intent, low competition)
| Post title | Target query | Links to |
|---|---|---|
| HVAC Delta T: Normal Range and What a Bad Reading Means | "hvac delta t normal range" | Delta T calc |
| HVAC Static Pressure: How to Test It and What It Should Be | "hvac static pressure test" | Static pressure calc |
| Superheat vs Subcooling: A Tech's Field Guide | "superheat and subcooling explained" | Superheat + Subcooling calcs |
| Refrigerant Overcharge vs Undercharge: How to Tell | "ac overcharged vs undercharged" | Superheat + Subcooling calcs |

**Efficiency & Cost** (homeowner + contractor intent)
| Post title | Target query | Links to |
|---|---|---|
| SEER vs SEER2: What Changed and Does It Matter? | "seer vs seer2 difference" | SEER savings calc |
| Is a 95% AFUE Furnace Worth the Extra Cost? | "95 afue furnace worth it" | AFUE savings calc |
| Heat Pump vs Gas Furnace: Which Costs Less to Run? | "heat pump vs gas furnace cost" | Operating cost + HSPF calc |
| How Much Does a New HVAC System Cost in 2025? | "new hvac system cost 2025" | Replacement cost calc |
| Markup vs Margin: How HVAC Contractors Price Jobs | "hvac contractor markup vs margin" | Estimate calc |

**Airflow & Ducts**
| Post title | Target query | Links to |
|---|---|---|
| HVAC Duct Sizing: Manual D vs Rules of Thumb | "hvac duct sizing guide" | Duct size + Friction rate calcs |
| Fan Laws Explained: How Blower Speed Affects CFM | "fan affinity laws hvac" | Fan laws calc |
| What Is CFM and How to Calculate It for Each Room | "hvac cfm calculation" | CFM calc |

**Indoor Air Quality / Psychrometrics**
| Post title | Target query | Links to |
|---|---|---|
| HRV vs ERV: Which One Do You Need? | "hrv vs erv difference" | HRV/ERV calc |
| ASHRAE 62.2 Ventilation Requirements Explained | "ashrae 62.2 residential ventilation" | Ventilation calc |
| How to Size a Dehumidifier for Your Home | "what size dehumidifier do I need" | Humidity control calc |
| Dew Point and HVAC: Why It Matters in Duct Design | "dew point hvac condensation" | Dew point calc |

---

## Additional Calculators (gaps vs competitors)

| Calculator | Why it's missing | Priority |
|---|---|---|
| **R-410A / R-32 / R-454B PT Chart** | Most-searched refrigerant reference by techs | High |
| **SEER2 ↔ SEER Converter** | New federal standard confuses buyers; high search intent | High |
| **Amp Draw Calculator** (BTU → amps) | Tied to electrical permit work; "what breaker for 3 ton AC" | High |
| **Heat Loss Calculator** (Manual J simplified heating) | You have cooling load but not a dedicated heating load tool | Medium |
| **Mixed Air Temperature Calculator** | Needed for economizer and AHU design | Medium |
| **Gas Line Sizing Calculator** | Natural gas pipe diameter from BTU load and length | Medium |
| **Coil Face Velocity Calculator** | Used for AHU design (wet coil 400–500 fpm target) | Low |
| **Zone Damper Bypass Sizing** | Multi-zone systems need this; no one else has it | Low |

---

## Category Page Enhancements

Things to add to `/calculators/hvac/index.astro`:

1. **Group calculators by workflow** — right now it's one flat grid. Adding section headers (Sizing, Diagnostics, Efficiency & Cost, Airflow, Psychrometrics) would reduce decision paralysis and improve time on page.

2. **"Recent HVAC posts" section** — once blog posts exist, a 3-card strip of latest blog posts at the bottom of the category page creates internal links both ways and adds fresh content signals to the category page.

3. **"Start here" banner** — for homeowners vs contractors. A two-button split ("I need to size equipment" → BTU calc | "I'm diagnosing a system" → Delta T calc) above the grid converts better and signals user intent to Google.

4. **Comparison table: efficiency ratings** — a static table comparing SEER/SEER2/HSPF/HSPF2/AFUE in one place. High-value reference content that attracts links.

---

## Other Content Types

- **HVAC glossary** — a `/calculators/hvac/glossary` page defining 50+ terms (TESP, SHR, EDR, AFUE, etc.). Captures long-tail definition queries and links back to every calculator that uses those terms.
- **HVAC formula reference** — you already have the formula block on the category page; expand it into its own standalone `/calculators/hvac/formulas` page with a ToC. Ranks well for "hvac formula sheet".
- **PT chart tables** — static reference pages for R-410A, R-32, R-454B pressure-temperature values. These get bookmarked by techs and linked to from forums.

---

**Highest ROI order:** Blog posts first (zero coding, massive keyword surface area), then group the category grid by workflow, then tackle the PT chart and SEER2 converter as the next calculators. The blog posts + calculators linking to each other is the core of a topic cluster — right now you have half of it.