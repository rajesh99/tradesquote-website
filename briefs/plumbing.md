# Category Brief — Plumbing (Waves 1 & 2 — 22 calculators)

> Written alongside the build, not before it. **Every number in the "Defaults compute to"
> lines below was produced by running `src/lib/plumbing.ts`**, not typed from a draft — the
> electrical category learned that lesson the hard way. Reproduce them with the scratch
> script pattern: `node --experimental-strip-types` on a `.mts` that imports the lib by a
> `file:///C:/...` absolute URL.

## 1. Category

| Field | Value |
| --- | --- |
| `name` | Plumbing |
| `slug` | `plumbing` |
| `accent` | `orange` (already set in `calculatorCategories.ts`) |
| `one_liner` | Supply sizing, drainage, venting, and pricing built on the IPC |
| `order_hint` | Supply jobs go fixture units → demand → pipe size. Drainage jobs go DFU → drain size → slope → vent. |

## 2. Authorities cited

- **IPC 2021** — International Plumbing Code. Chapter 6 (water supply), Chapter 7 (sanitary
  drainage), Chapter 9 (vents), Appendix E (water pipe sizing).
- **ASTM** — B88 (copper tube), F876 (PEX), D1785 (Schedule 40) for pipe dimensions.
- **ASPE** — velocity design limits, Hunter's-curve demand method.
- **US DOE** — first-hour-rating worksheet values for peak-hour hot water demand.

### Provenance tiers — carried through into the lib's doc comment

1. **Derived / self-validating.** Pipe IDs are computed from OD and wall, never transcribed.
   PEX reproduces SDR-9 exactly (ID = OD × 7/9); Schedule 40 reproduces published IDs to
   4 decimal places. Velocity constant 0.4085 derives from 1 gpm = 0.0022280 ft³/s.
   Hazen-Williams cross-checks against the independent 0.2083 head-loss form within 1.3%.
2. **Verified against two independent sources.** Tables 709.1, 709.2, 710.1(1), 710.1(2),
   909.1, and the 906.2 vent rule.
3. **UNVERIFIED — flagged in code and on-page.** `WSFU_FIXTURES` and `HUNTER_DEMAND`.
   Appendix E is an appendix (only enforceable where adopted) and Hunter's curve runs high
   for modern low-flow fixtures, so the error is toward larger pipe. **Highest-value
   follow-up for this category: check both against a copy of Appendix E and promote them.**

`briefs`-level note: 87 independent-invariant assertions over the lib pass (pipe IDs vs
published values, SDR invariant, velocity derivation, two Hazen-Williams forms, psi/head
round-trip, fitting L/D vs published equivalent lengths, drain-table monotonicity in both
size and slope, stack ≥ interval sanity, vent rule, Manning sanity, water-heating
round-trips, Hunter curve monotonic + falling gpm-per-FU).

## 3. Wave 1 calculators — 16, in 5 hub groups

### Group: Water Supply & Pipe Sizing

#### `plumbing-water-supply-fixture-unit-calculator` · blue · sizing
**Search question:** How many fixture units is my house?
**Formula:** total WSFU = Σ (fixture count × WSFU weight); demand gpm = Hunter curve at that
total, separate columns for flush-tank and flushometer-valve systems.
**Defaults:** 2 bathroom groups (flush tank), 1 kitchen sink, 1 dishwasher, 1 clothes washer,
2 hose bibbs.
**Defaults compute to:** **16.4 WSFU total** (12.4 cold, 6.4 hot) → **18.16 gpm** flush-tank,
32.12 gpm flushometer.
**Reference table — demand per fixture unit falls as load rises (the whole point of the curve):**
5 FU → 9.40 gpm (1.88/FU) · 10 → 14.60 (1.46) · 16.4 → 18.16 (1.11) · 20 → 19.60 (0.98) ·
30 → 23.30 (0.78) · 50 → 29.10 (0.58) · 100 → 43.50 (0.43) · 200 → 65.00 (0.33).
**Hedge:** Appendix E adoption + Hunter runs high on low-flow fixtures.

#### `plumbing-pipe-size-calculator` · sky · sizing — FLAGSHIP
**Search question:** What size water line do I need?
**Formula:** available friction psi = supply − 0.4331 × lift − fixture psi − meter − other;
allowable psi/100 ft = available ÷ developed length × 100; pick the smallest size passing
**both** the velocity cap and that budget.
**Defaults:** 18 gpm, Copper Type L, 120 ft developed, 60 psi supply, 20 ft to highest
fixture, 15 psi at the fixture, 8 psi meter loss, 8 ft/s cap.
**Defaults compute to:** elevation loss **8.66 psi**, available friction **28.34 psi**,
allowable **23.62 psi/100 ft** → **1 inch**, ID 1.025, **7.00 ft/s**, **8.98 psi/100 ft**,
**10.77 psi** over the run, governed by **both**.
**Why 3/4" fails:** 11.93 ft/s and 32.91 psi/100 ft — it misses on both rules at once.
**gpm ladder (copper L, 120 ft, 28.34 psi):** 5 → 1/2" (6.88 ft/s) · 8 → 3/4" (5.30) ·
12 → 3/4" (7.95) · 18 → 1" (7.00) · 25 → 1-1/4" (6.38) · 40 → 1-1/2" (7.21).
**Best differentiator:** at 18 gpm copper needs **1"** but **PEX needs 1-1/4"** — PEX is
outside-diameter controlled, so a nominal 1" PEX has a 0.875" bore against copper's 1.025".
Smoother wall, smaller hole; the hole wins.

#### `plumbing-pipe-velocity-calculator` · cyan · sizing
**Formula:** V = 0.4085 × gpm ÷ ID²; max gpm = V × ID² ÷ 0.4085.
**Defaults:** 10 gpm, Copper Type L 3/4" (ID 0.785).
**Defaults compute to:** **6.63 ft/s** — inside the 8 ft/s cold limit, **over** the 5 ft/s hot
limit. Max flow for that pipe: **12.07 gpm cold, 7.54 gpm hot**.
**Reference table — max gpm per size, Type L (cold / hot):** 1/2" 5.8/3.6 · 3/4" 12.1/7.5 ·
1" 20.6/12.9 · 1-1/4" 31.3/19.6 · 1-1/2" 44.4/27.7 · 2" 77.2/48.2.
**Ladder at 10 gpm:** 1/2" 13.75 ft/s · 3/4" 6.63 · 1" 3.89 · 1-1/4" 2.55 · 1-1/2" 1.80.
**Hedge:** the 8/5 limits are ASPE and manufacturer practice, **not a numeric IPC figure**.

#### `plumbing-friction-loss-calculator` · teal · sizing
**Formula:** psi/ft = 4.52 × Q^1.852 ÷ (C^1.852 × d^4.8704); fitting equivalent length =
(L/D) × ID ÷ 12.
**Defaults:** 10 gpm, Copper Type L 3/4", 100 ft measured, 6 × 90° elbow, 2 × tee-branch,
2 × ball valve.
**Defaults compute to:** 90° elbow **1.96 ft** each, tee-branch **3.93 ft**, ball valve
**0.52 ft** → developed length **120.67 ft**; **11.08 psi/100 ft**, **13.37 psi** total,
6.63 ft/s.
**Best differentiator — same nominal size, four materials at 10 gpm in 3/4":**
PVC Sch 40 **7.70** psi/100 ft (ID 0.824, C 150) · Copper L **11.08** (0.785, 140) ·
galvanised **11.64** (0.824, C 120) · **PEX 19.55** (ID 0.681, C 150). PEX has the best C
factor and the worst loss, because bore beats smoothness.

### Group: Drainage, Waste & Vent

#### `plumbing-drainage-fixture-unit-calculator` · emerald · sizing
**Formula:** total DFU = Σ (count × Table 709.1 value).
**Defaults:** 2 bathroom groups (1.6 gpf), kitchen sink, dishwasher, clothes washer, laundry tray.
**Defaults compute to:** **18 DFU** (10 + 2 + 2 + 2 + 2), trap sizes 1-1/2" / 1-1/2" / 2" / 1-1/2".
**The catch to publish:** 18 DFU would ride a **2" building drain** on Table 710.1(1) at
1/4 in/ft, but a water closet anywhere on the drain floors it at **3"** per the table's own
footnote. The calculator applies that floor and says which rule governed.

#### `plumbing-drain-pipe-size-calculator` · indigo · sizing
**Formula:** DFU → Table 710.1(1) for building drains and sewers (slope-dependent),
Table 710.1(2) for horizontal branches and stacks; then the water-closet 3" floor.
**Defaults:** 18 DFU, building drain, 1/4 in/ft, serves a water closet.
**Defaults compute to:** **3 inch** (table alone said 2"; governed by the water-closet floor);
3" at 1/4 in/ft carries **42 DFU**; minimum slope for 3" is 1/8 in/ft = 1.04%.
**Same 18 DFU across applications:** building drain 2" · horizontal branch 3" (cap 20) ·
stack ≤3 intervals 2-1/2" (cap 20) · stack >3 intervals **2"** (cap 24).
**Best differentiator:** **a taller stack carries MORE per size than a short one** — 2" holds
10 DFU over three branch intervals but 24 DFU over more than three, because the code table
accounts for the terminal-velocity flow regime that only develops with height. Nearly every
competitor presents stack capacity as if it only falls.
**Slope sensitivity, 4" building drain:** 1/8 → 180 DFU · 1/4 → 216 · 1/2 → 250.

#### `plumbing-pipe-slope-calculator` · violet · sizing
**Formula:** minimum slope from Table 704.1; fall = slope × run; percent = slope ÷ 12 × 100.
**Defaults:** 3" pipe, 40 ft run, code minimum.
**Defaults compute to:** **1/8 in/ft**, **1.04%**, **5.00 in** of fall.
**Reference table (min slope · percent · fall over 40 ft):** 1-1/2"–2-1/2" 1/4 in/ft · 2.08% ·
10.00 in — 3"–6" 1/8 · 1.04% · 5.00 — 8"+ 1/16 · 0.52% · 2.50.
**Fall at 1/4 in/ft:** 10 ft → 2.50 in · 20 → 5.00 · 40 → 10.00 · 60 → 15.00 · 100 → 25.00.
**Best differentiator:** the step at 3" means **a 3" drain needs half the fall of a 2" drain**
— which is exactly why upsizing a long run buys headroom under a floor. Also worth saying:
too steep is a real failure mode (liquid outruns solids), not just too flat.

#### `plumbing-vent-size-calculator` · rose · sizing
**Formula:** IPC 906.2 — vent ≥ half the drain diameter, never below 1-1/4", +1 nominal size
for the whole run past 40 ft developed length. Trap arm capped by Table 909.1.
**Defaults:** 3" drain, 30 ft developed vent.
**Defaults compute to:** **1-1/2" vent** (half of 3" = 1.5", no upsize at 30 ft); trap arm max
**12 ft** at 1/8 in/ft.
**Ladder (drain → vent at 30 ft / at 60 ft; trap arm):** 1-1/2" → 1-1/4"/1-1/2", 6 ft ·
2" → 1-1/4"/1-1/2", 8 ft · 3" → 1-1/2"/2", 12 ft · 4" → 2"/2-1/2", 16 ft · 6" → 3"/4", n/a.
**Scope hedge to keep:** this covers individual, common, and branch vents. A **vent stack or
stack vent** on a multi-storey drainage stack is sized by **Table 906.1**, which the lib
deliberately does not reproduce — the page says so and hands the reader back to the code.
Also: developed length is **not limited** for self-siphoning fixtures such as water closets.

### Group: Pressure & Pump Head

#### `plumbing-water-pressure-calculator` · amber · sizing
**Formula:** psi = 0.4331 × ft; ft = 2.309 × psi; loss = 0.4331 × lift; PRV required above
80 psi (IPC 604.8).
**Defaults:** 65 psi static, 25 ft to highest fixture.
**Defaults compute to:** 65 psi = **150.1 ft of head**; 25 ft of lift costs **10.83 psi**;
**54.17 psi** at the top fixture; **no PRV required** (65 < 80).
**Storey ladder at 65 psi (10 ft per storey):** 1 → 60.67 psi left · 2 → 56.34 · 3 → 52.01 ·
4 → 47.68 · 5 → 43.34.
**Best differentiator:** a storey costs **4.33 psi** and nothing else — it is the one loss in
the whole system that is completely independent of flow, pipe, and fittings.

#### `plumbing-pump-head-calculator` · orange · sizing
**Formula:** TDH = static lift + friction head + pressure head + velocity head, with friction
converted from psi via 2.309 ft/psi and velocity head = V² ÷ 2g.
**Defaults:** 30 gpm, 1-1/2" PVC Sch 40, 40 ft developed, 12 ft static lift, 0 pressure head.
**Defaults compute to:** friction **0.90 psi = 2.08 ft**, velocity **4.73 ft/s** →
velocity head **0.35 ft**, **TDH 14.43 ft**; 2.26 psi/100 ft.
**Best differentiator:** velocity head is **2.4% of TDH** here — real, routinely omitted, and
almost never the thing that matters. Static lift is 83% of it. Say which term to care about.

### Group: Water Heating

#### `plumbing-water-heater-size-calculator` · red · sizing
**Formula:** peak-hour demand = Σ (uses × gallons); recovery gph = BTU × eff ÷ (8.33 × rise);
FHR = 0.70 × tank + recovery; pick the smallest stocked tank whose FHR ≥ demand.
**Defaults:** 3 showers, 1 dishwasher, 1 clothes washer, 2 hand-washings; 40,000 BTU at 80%,
50 °F in to 140 °F out (90 °F rise).
**Defaults compute to:** demand **66 gal**, recovery **42.68 gph**, → **40 gallon tank**,
FHR **70.68**, headroom **4.68 gal**.
**FHR ladder at this recovery:** 30 → 63.68 · 40 → 70.68 · 50 → 77.68 · 60 → 84.68 ·
75 → 95.18 · 80 → 98.68 · 100 → 112.68.
**Best differentiator:** **first-hour rating, not tank gallons, is the spec that matters** —
a 40-gallon gas heater beats a 50-gallon electric one on FHR because recovery does more work
in that first hour than the extra ten gallons of storage.

#### `plumbing-tankless-water-heater-calculator` · blue · sizing
**Formula:** gpm = BTU/hr × eff ÷ (500 × rise); BTU = gpm × 500 × rise ÷ eff. The 500 is
8.33 lb/gal × 60 min (499.8 exactly).
**Defaults:** 199,000 BTU, 95% efficient, 50 °F inlet, 120 °F target (70 °F rise).
**Defaults compute to:** **5.40 gpm**; a 4 gpm target needs **147,309 BTU/hr**.
**Rise sensitivity, same 199k unit:** inlet 70 °F → **7.57 gpm** · 60 → 6.30 · 50 → 5.40 ·
40 → **4.73 gpm**.
**Best differentiator:** the same unit loses **37% of its output** between a 70 °F Gulf-coast
inlet and a 40 °F northern winter inlet. Tankless units are sold on a headline gpm that
assumes a rise nobody in a cold climate ever sees — this is the single most common tankless
sizing failure and it is entirely predictable.

### Group: Cost & Business

#### `plumbing-estimate-calculator` · emerald · cost
**Defaults:** 10 h at $110, $850 fixtures, $450 material, 15% overhead, 25% target.
**Defaults compute to:** labour **$1,100**, direct **$2,400**, overhead **$360**, break-even
**$2,760** → price **$3,680**, profit **$920**.
**The example that must be on the page:** the same 25% applied as a **markup** gives
**$3,450** — exactly a **20.0% margin** and **$230 less profit** on identical work.
Memorise 25 → 20, 50 → 33, 100 → 50.

#### `plumbing-repipe-cost-calculator` · indigo · cost
**Defaults:** 1,800 ft², PEX, average access, 1 storey, 2 baths, $450 permit, $1,500 drywall.
**Defaults compute to:** base **$9,000** ($5/ft²) → access ×1.0 → storeys ×1.0 → **$10,950**
= **$6.08/ft²**, band **$9,308–$12,592**.
**Access sensitivity (the headline):** easy **$9,150** ($5.08/ft²) · average **$10,950**
($6.08) · difficult **$16,350** ($9.08).
**Material sensitivity:** PEX $10,950 · CPVC $12,750 · copper **$18,150**.
**Best differentiator:** copper adds **$7,200** and difficult access adds **$5,400** — so
material is the bigger lever here, but access is the one nobody quotes for, and on a copper
job with plaster walls the two compound.

#### `plumbing-water-heater-replacement-cost-calculator` · amber · cost
**Defaults:** 50 gal gas tank, $110/h, $200 permit, $60 haul-away, expansion tank + drain pan.
**Defaults compute to:** unit **$1,100** + labour 4 h **$440** + upgrades **$270** + permit
$200 + haul $60 = **$2,070**, band **$1,697–$2,443**; the unit is **53.1%** of the invoice.
**By unit type (same labour, same two upgrades):** 50 gal electric **$1,715** · 40 gal gas
$1,920 · electric tankless $1,940 · 50 gal gas $2,070 · gas tankless $3,010 · heat pump **$3,190**.
**Tankless conversion with the full upgrade set** (vent + gas upsize + condensate):
**$4,240** — roughly **double** the like-for-like tank swap.
**Best differentiator:** the code upgrades, not the appliance, are what turn a swap into a
project. IPC 607.3 makes a thermal expansion tank mandatory on a closed system, and a
199k BTU tankless generally outgrows a 1/2" gas branch.

#### `plumbing-labor-rate-calculator` · teal · cost
**Defaults:** $38/h wage, 32% burden, $11,000 overhead per tech, 1,560 billable hours,
40% target margin.
**Defaults compute to:** $79,040 wage + **$25,293** burden = $104,333 + $11,000 = **$115,333**
÷ 1,560 = **$73.93 loaded** ÷ 0.60 = **$123.22 bill rate** = **3.24× the wage**, 75% utilisation.
**Utilisation sweep at the same $38 wage:** 60% → **$154.02** · 70% → $132.02 · 75% → $123.22 ·
85% → $108.72 · 90% → **$102.68**. A **$51/hr swing** from utilisation alone.
**Wage sweep at 1,560 h:** $28 → $93.89 · $33 → $108.55 · $38 → $123.22 · $43 → $137.89 ·
$48 → $152.55 — every **+$5** of wage costs **+$14.67** of rate.
**Best differentiator:** utilisation moves the rate more than the wage does. Selling one more
billable hour a day beats cutting margin, and it is the lever most shops never measure.

## 4. Acceptance checklist

- [ ] `npm run build` passes; sitemap up 17 URLs (16 calculators + hub).
- [ ] Four-edit reconciliation: 16 in `plumbingCalculators` = 16 grouped = 16 guide rows
      = 16 unique hub card hrefs = the hub badge; `ungroupedPlumbingCalculators` empty.
- [ ] Every slug has a page and a script with a matching `export function init…`; every
      `getElementById` id exists in the markup and vice-versa.
- [ ] Defaults on every page reproduce the figures above exactly.
- [ ] All internal links resolve (calculator links against `src/pages`, others against `dist`).
- [ ] Canonical on `https://www.tradesquote.ai`, OG + Twitter, 3 JSON-LD blocks, FAQPage
      mirroring the visible FAQ.
- [ ] The WSFU/Hunter provenance caveat is visible on both pages that depend on it.
- [ ] HVAC (43) and electrical (39) hubs unaffected.

---

# Wave 2 — the six pending calculators (category now at 22)

These were the six the hub's "coming soon" card promised. Same discipline as wave 1: every
"Defaults compute to" line below was produced by running `src/lib/plumbing.ts`. The lib gained
`WATER_DENSITY`, `expansionTank`, `pipeVolume`, `mixedFlow`, `roofRunoffGpm`, `septicSizing` and
`UNIT_CATEGORIES` — **52 further independent-invariant assertions pass** (density cross-checks
against `PSI_PER_FOOT_HEAD`'s own basis, pipe volume against published gal/ft, Boyle's-law tank
sizing, every unit round-tripping exactly, septic monotonicity).

New hub group: **Volume & Conversions**. Two calculators joined **Water Heating**, two joined
**Drainage, Waste & Vent**.

### `plumbing-expansion-tank-calculator` · cyan · Water Heating
**Formula:** E = ρ(cold)/ρ(hot) − 1; acceptance = system × E; ratio = 1 − P_pre/P_max (both
absolute, +14.7); tank = acceptance ÷ ratio.
**Defaults:** 50 gal system, 40→140 °F, 60 psi supply, 80 psi max.
**Defaults compute to:** expansion **1.71%**, acceptance **0.86 gal**, ratio **21.1%**, required
**4.05 gal** → **4.4 gallon shell**.
**Pre-charge sweep (the headline):** 40 psi → 2.02 gal · 50 → 2.70 · 60 → 4.05 · **70 → 8.10**.
A 4× swing from one Schrader valve — the pre-charge matters more than the tank.
**Best differentiator:** the tank is 4.7× the expansion volume because Boyle's law only lets you
use the pressure window. Using *gauge* instead of absolute pressure is the classic error and it
undersizes the tank.
**Hedge kept:** potable DHW only; hydronic loops run hotter and need a hydronic method.

### `plumbing-mixing-valve-calculator` · violet · Water Heating
**Formula:** hot fraction = (T_mix − T_cold)/(T_hot − T_cold); storage multiplier = 1 ÷ hot fraction.
**Defaults:** 140 °F stored, 50 °F cold, 120 °F delivered, 2.5 gpm, 50 gal tank.
**Defaults compute to:** **77.8% hot** = 1.94 gpm hot + 0.56 cold; multiplier **1.29×**, so a
50-gal tank behaves like **64.3 gal**.
**Store-temp sweep (deliver 120 from 50):** 120 → 100% hot, 50.0 gal · 130 → 87.5%, 57.1 ·
140 → 77.8%, 64.3 · 150 → 70.0%, 71.4 · 160 → 63.6%, 78.6.
**Seasonal:** 70 °F inlet 71.4% hot · 40 °F inlet 80.0% — winter drains the tank faster *and* the
burner recovers slower.
**Best differentiator:** storing at the delivery temperature (120/120) gives **zero** capacity gain
*and* parks the tank in the *Legionella* range. That is the setting to argue against.

### `plumbing-pipe-volume-calculator` · sky · Volume & Conversions
**Formula:** gal/ft = π/4 × d² × 12 ÷ 231 = **0.0408 × d²**; weight = gal × 8.33; purge = gal ÷ gpm.
**Defaults:** 3/4" Type L copper (bore 0.785), 50 ft, 2 gpm.
**Defaults compute to:** **1.26 gal**, 4.8 L, 10.5 lb, **38 seconds** to purge.
**Validated:** 1" Sch 40 gives 0.0449 gal/ft against a published 0.0449.
**Best differentiator — upsizing the hot line makes the wait WORSE.** 50 ft at 2 gpm: 3/4" copper
38 s · 1" copper **65 s** · 3/4" PEX **28 s**. PEX's small bore is a disadvantage everywhere else
and an advantage here. Has a custom-bore field for tanks, casings and unlisted sizes.

### `plumbing-unit-converter` · teal · Volume & Conversions
Six categories: flow, pressure/head, volume, length, velocity, temperature. Shows the factor used,
the reverse conversion, and the whole category at once.
**Defaults compute to:** 10 gpm = **37.854 L/min**; factor ×3.7854; reverse 1 L/min = 0.264172 gpm.
**Anchors:** 60 psi = 138.536 ft head = 4.137 bar · 1 cfs = 448.83 gpm · 1 imperial gal = 1.20095
US gal · 1 in = 25.4 mm exactly.
**Best differentiators:** (a) the **imperial gallon is a 20% trap** on spec sheets; (b) a
temperature *rise* converts by ratio alone — a 90 °F rise is **50 °C, not 32.2** — which the page
works through explicitly; (c) the psi-to-head factor is the only one that is not a definition,
because it depends on water density.

### `plumbing-storm-drainage-calculator` · sky · Drainage, Waste & Vent
**Formula:** gpm = area × rainfall ÷ **96.25**, and the divisor is *derived* (1 in/hr on 1 ft² =
1/12 ft³/hr × 7.48052 gal/ft³ ÷ 60) rather than quoting the usual rounded 96.23.
**Defaults:** 2,000 ft² roof, 4 in/hr, 2 leaders, 1/8 in/ft.
**Defaults compute to:** **83.1 gpm** total, 41.6 per leader; hydraulic check suggests **4"**
carrying 115 gpm at 2.91 ft/s; 166.2 gpm at twice the design rate.
**Rainfall sensitivity:** the same 2,000 ft² roof sheds 41.6 gpm at 2 in/hr and **124.7 at 6** —
3× for location alone.
**SCOPE HEDGE — the important one.** The **flow is derived and exact; the pipe size is not a code
answer.** IPC Tables 1106.2 (leaders) and 1106.3 (horizontal storm drains) govern and are
**deliberately not reproduced** — same call as Table 906.1 on the vent calculator. The size shown
is a Manning full-bore hydraulic check, labelled as such in the result panel, the formula block,
the reference table and the sources line. Storm drains are checked at **full bore** (twice the
half-full flow), unlike sanitary drains which are sized part-full to scour.

### `plumbing-septic-tank-calculator` · amber · Drainage, Waste & Vent
**Formula:** flow = bedrooms × gal/bedroom; tank = max(flow × 2 days, jurisdictional minimum);
field = flow ÷ soil application rate; trench = field ÷ width.
**Defaults:** 3 bedrooms, 150 gal/bedroom/day, 0.8 gal/ft²/day, 3 ft trench.
**Defaults compute to:** **450 gal/day**, retention 900, minimum 1,000 → **tank 1,000 gal
(minimum governs)**, field **563 ft²**, **188 ft** of trench.
**Bedroom sweep:** 2 → 1,000 (min) · 3 → 1,000 (min) · 4 → 1,250 (min) · **5 → 1,500 (retention
takes over)** · 6 → 1,800 (retention).
**Soil sweep at 450 gpd:** sand 1.2 → 375 ft² · loam 0.8 → 563 · silt 0.45 → 1,000 · clay 0.36 →
1,250 · slow clay 0.24 → **1,875 ft²**. A **5× swing** from the ground alone.
**JURISDICTION HEDGE — the important one.** Septic is **not IPC territory**; it falls to the IPSDC
where adopted and to state/county health departments everywhere else, and the numbers vary more
than anything else in plumbing. So **every input is editable** — gallons per bedroom, the soil
application rate, trench width — with the defaults presented as common values, *not* code. Stated
in the hero, the result panel, the formula block, the tables and the sources line. Setbacks, water
table, witnessed perc test and permitting are explicitly out of scope.

## Wave 2 acceptance — all passed

- `npm run build` clean; sitemap **684 URLs**, 23 plumbing (22 calculators + hub + formulas).
- Reconciliation: **22 = 22 grouped = 22 guide rows = 22 unique hub hrefs = badge**;
  `ungroupedPlumbingCalculators` empty; ids reconciled both directions; accents distinct per group.
  **88 checks pass.**
- SEO sweep: **24 pages, 24 unique titles, 24 unique descriptions**, all with canonical/OG/Twitter/
  3 JSON-LD and FAQPage mirroring the visible array.
- All six driven in-browser — every default matched — plus edge cases (max ≤ pre-charge, mix above
  storage, category switch, swap) and reset on each.
- Mobile 375 px: no horizontal scroll on any new page; all tables wrapped.
- HVAC 43 and electrical 39 unchanged; the electrical FAQ's derived plumbing count moved 16 → 22
  on its own.

---

# Wave 3 — the four pending pages (category now 24 calculators + 3 reference pages)

These were the four the hub's own "coming soon" card promised after wave 2: a glossary, a
backflow-prevention reference, grease-trap sizing and well-pressure-tank sizing. Same
discipline as waves 1 and 2 — **every "Defaults compute to" line below was produced by
running `src/lib/plumbing.ts`**, and **89 further independent-invariant assertions pass**
(228 across the three waves).

`plumbing.ts` is now 2,452 lines / 166 exports. Two calculators joined existing hub groups —
grease trap into **Drainage, Waste & Vent**, well pressure tank into **Pressure & Pump Head**
— so no new group was needed. Sitemap **688 URLs** (+4).

## 3.1 New calculators

### `plumbing-grease-trap-calculator` · teal · Drainage, Waste & Vent

**Search question:** What size grease trap do I need?
**Two methods, deliberately side by side — that is the whole point of the page.**

**Method 1 — hydromechanical, rated in GPM (IPC 1003.3.4.1, PDI-G101).**
gallons = L × W × D × compartments ÷ `CUBIC_INCHES_PER_GALLON`; gpm = gallons × fill ÷ drain
minutes; grease lb = rated gpm × 2.
**Defaults:** 24 × 24 × 12 in, 3 compartments, 75% fill, 1 minute.
**Defaults compute to:** **89.77 gal** (20,736 in³) → drained **67.32 gal** → **67.32 gpm** →
**PDI 75 gpm / 150 lb**.
**Sink ladder (3 compartments, 12 in deep):** 16×16 → 29.92 gpm → 35/70 lb · 18×18 → 37.87 →
50/100 · 20×20 → 46.75 → 50/100 · **24×24 → 67.32 → 75/150** · 30×24 → 84.16 → 100/200.

**Method 2 — gravity interceptor, rated in GALLONS.**
meals/hr = seats × turnover; gallons = meals/hr × gal per meal × retention hr × storage
factor; then the larger of that and the local floor.
**Defaults:** 100 seats, 1 turnover/hr, 6 gal/meal, 2.5 h retention, 8-hour day (×1),
1,000 gal floor.
**Defaults compute to:** 100 meals in the peak hour → **1,500 gal calculated → 1,500 gal
vessel, governed by the calculation**.
**Seat ladder:** 30 → 450 calc, **1,000 (floor)** · 50 → 750, **1,000 (floor)** · 75 → 1,125 →
1,250 · 100 → 1,500 → 1,500 · 150 → 2,250 → 2,500 · 200 → 3,000 → 3,000 · 300 → 4,500 → 5,000.
**Hours-of-operation ladder at 100 seats:** ×1 → 1,500 · ×1.5 single-service → 2,250 → 2,500 ·
×2 (16 h) → 3,000 · ×3 (24 h) → 4,500 → 5,000.

**Best differentiator:** the two methods answer *different questions* — the under-sink unit is
sized on **flow** because it separates by slowing water down; the buried vessel is sized on
**retention volume** because it separates by waiting. Sizing one with the other's method gives
a plausible number that means nothing.
**Second:** PDI-G101 defines grease capacity as **exactly 2 lb per gpm**, so "how many pounds"
and "how many gpm" are one number, not two. `capacityLb` is therefore *derived* from `gpm` in
the lib rather than transcribed beside it.
**Third:** a standard 24 × 24 × 12 three-compartment sink already needs **75 gpm**, near the
top of the hydromechanical range — which is why full-service kitchens end up outside with a
gravity interceptor. The page warns above 50 gpm.
**Fourth:** on the defaults the **floor governs below about 67 seats** (1,000 ÷ 6 ÷ 2.5), so
every small kitchen in a jurisdiction gets the same tank whatever the arithmetic says.

**SCOPE HEDGE — same class as septic and storm, do not tighten.** IPC 1003.3.4 lets the AHJ
approve a sizing method, and in practice the local **FOG programme** sets the minimum size, the
location, the pump-out interval and the sample port. Every factor is an editable input with the
defaults presented as common values, not code. `GREASE_WASTE_PER_MEAL`,
`GREASE_RETENTION_HOURS` and `GREASE_STORAGE_FACTORS` are **tier 3 — commonly published,
unverified here** and labelled so in the lib, on the page and in the sources line. Flow control
fittings, sample ports and pump-out frequency are explicitly out of scope.

### `plumbing-well-pressure-tank-calculator` · blue · Pressure & Pump Head

**Search question:** What size pressure tank do I need?
**Formula (Boyle's law, same absolute-pressure basis as `expansionTank()`):**
air at cut-in = P_pre ÷ P_on (capped at the whole shell); air at cut-out = P_pre ÷ P_off;
drawdown fraction = the difference. Required drawdown = pump gpm × minimum run minutes;
required shell = that ÷ the fraction.
**Defaults:** 10 gpm, 30/50 psi switch, pre-charge auto at cut-in − 2 = 28 psi, run time auto.
**Defaults compute to:** fraction **29.53%**, run **1.00 min**, drawdown needed **10 gal**,
shell **33.87 gal** → **44 gallon tank**, which delivers **12.99 gal = 1.30 min** per cycle.

**Pressure-switch ladder (pre-charge 2 psi under cut-in; last column is a 20 gal shell):**
20/40 → **34.46%** / 6.89 gal · 30/50 → 29.53% / 5.91 · 40/60 → **25.79%** / 5.16 ·
50/70 → 22.88% / 4.58 · 30/70 → **45.11%** / 9.02 · 40/80 → 40.69% / 8.14.
**Pre-charge ladder at 30/50 on a 20 gal shell:** 20 psi → 24.00% / 4.80 gal · 25 → 27.45% /
5.49 · **28 → 29.53% / 5.91** · 30 (at cut-in) → **30.91%** / 6.18 · 35 → 23.18% / 4.64 ·
40 → 15.46% / 3.09 · 45 → **7.73%** / 1.55.
**Pump ladder at 30/50:** 5 gpm → 20 gal · 8 → 32 · **10 → 44** · 12 (run steps to 1.5 min) →
62 · 15 → 86 · 20 → 119 · 25 → past the stocked ladder, two tanks in parallel.

**Best differentiator — drawdown is a RATIO, not a difference, so the same span gives more at
a lower band.** 20/40 and 40/60 are both 20 psi wide, but the first delivers **34.46%** and the
second **25.79%** — a third more water from the same shell. Almost every published guide implies
a higher setting is better. What actually helps is a *wider* band: 30/70 reaches **45.11%** and
drops the default job from a 44 gallon tank to a 26.
**Second:** a "20-gallon" tank delivers **5.91 gallons** at 30/50 — under a third of its name.
**Third — the 2 psi margin is quantified, not asserted.** Maximum drawdown is at pre-charge =
cut-in (**30.91%**); the conventional 2 psi below costs **1.38 points** and stops the diaphragm
bottoming out every cycle. Worth stating both numbers rather than pretending 28 is optimal.
**Fourth:** an over-charged tank is indistinguishable from a dead one — 45 psi on a 30/50 gives
**7.73%**, a quarter of correct, and the symptom is short-cycling on a brand-new tank.

**HEDGE:** tank sizing and minimum run time are **pump-industry practice, not code** — the IPC
governs the potable system downstream, not how well equipment is proportioned. Real diaphragm
tanks deliver slightly under the theoretical Boyle's-law figure, so the page defers to the
manufacturer's own drawdown table. Constant-pressure and variable-speed systems are explicitly
out of scope.

## 3.2 New reference pages (no script, no registry entry, BreadcrumbList only)

### `/calculators/plumbing/glossary`
**80 terms, A–W across 19 letters**, each with the IPC section behind it and a link into the
calculator that uses it. **The count is computed from the data array *before* the title string
is built**, so the title, the meta description and the intro all interpolate it and none can go
stale — a structural fix for the bug the electrical glossary shipped with ("70+" against 56
actual terms). Verified in-browser: 80 rendered `<dt>`, title claims 80, no duplicate terms, all
19 jump links resolve.

### `/calculators/plumbing/backflow-prevention`
**Every table imported from `plumbing.ts` — zero transcribed copies on the page**, the same
discipline as electrical's `nec-tables`. Renders 10 assemblies, 6 air-gap rows and 11
applications. Anchors: `#backpressure-vs-backsiphonage`, `#hazard`, `#assemblies`, `#air-gaps`,
`#applications`, `#testing`.

**Best differentiator, and the page leads with it: no vacuum breaker of any kind protects
against backpressure.** A vacuum breaker relieves *falling* pressure; push water at it from
below and the air inlet is held shut by the very pressure it is meant to relieve. That rules out
**4 of the 10 devices** (HVB, AVB, PVB, SVB) the moment a boiler, pump or injector is involved.
**Second:** only **air gap, RPZ/RPBA and RPDA** cover a high hazard under backpressure — and the
air gap is not an in-line device — which is why the RPZ ends up on so many commercial jobs.
**Third:** the continuous-pressure column is what catches people out. **HVB and AVB may not** sit
under supply pressure past 12 hours, so a shutoff valve downstream of one is the classic fault.
**Fourth:** a **backwater valve is not a backflow preventer** — one is a check valve in a *drain*
against sewer surcharge, the other protects the *water supply*. Given its own callout because the
names get swapped constantly.

**Air gaps are DERIVED, tier 1.** The whole table is one rule — 2× the effective opening, 3×
near a wall, floors of 1 in and 1.5 in — so `MINIMUM_AIR_GAPS` is computed from
`minimumAirGap()` rather than transcribed, and the page says so.

**SCOPE HEDGE — same class as `nec-adoption-by-state` refusing a state table.** Water purveyors
run their own cross-connection control programmes that are routinely stricter than the IPC, and
assemblies must be on an approved list (USC FCCCHR / ASSE listings). The page names the
mechanism and the primary sources and publishes **no product list and no jurisdiction table**.

## 3.3 Registry, hub and formula-page changes

- Four-edit registration done for both calculators; **`ungroupedPlumbingCalculators` stayed
  empty** and the hub's safety-net block never appeared.
- Hub **de-numbered**: the OG description said "sixteen free IPC-based tools" against 22 actual,
  and the formula prose said "all twenty-two formulas". Both numbers were removed rather than
  updated — the fix the HVAC `toolCount` bug eventually got. The badge already derives from
  `plumbingCalculators.length`.
- Hub gained a **reference row** — Formulas, Glossary, Backflow Prevention — so the new pages are
  reachable. (Electrical's `glossary` and `nec-tables` are still linked from *nowhere* on their
  hub; confirmed by grep, left alone by scope.)
- Coming-soon card refreshed: all four promised items now exist, so it names plumbing blog
  content and a grey-water / rainwater-harvesting calculator instead.
- Formula reference is now **24 blocks** (+2): grease interceptor sizing in DWV, pressure tank
  drawdown in Pressure & Pump Head. Every line ≤ 36 chars, asserted by script.
- **Stale link fixed:** the Thermal Expansion Volume formula pointed at the water-heater
  *replacement cost* calculator; it now points at the expansion tank calculator, which has
  existed since wave 2.

## 3.4 Bug found and fixed in passing

`plumbingCalculators.ts` carried `title: "Storm &amp; Roof Drainage Calculator"` — an HTML
entity inside a JS string. Astro escapes text content, so the hub card rendered the literal
characters **`Storm &amp; Roof Drainage Calculator`**, and the same string went into the
ItemList JSON-LD. Wave-2 defect, caught by reading the rendered hub card text rather than the
source. Fixed to a plain `&`. **Rule: an entity belongs in markup, never in a data string that
gets interpolated.** The glossary's `"Relief Valve (T&amp;P)"` is fine because that field is
rendered with `set:html`.

## 3.5 Wave 3 acceptance — all passed

- **89 invariant assertions** on the new lib exports: PDI lb = 2 × gpm across the whole ladder;
  hydraulic gallons reproduce `CUBIC_INCHES_PER_GALLON`; a 24 × 24 × 12 compartment lands on the
  published 29.92 gal; drawdown recomputed against an independently written Boyle's-law form at
  five pressure bands; `tank × fraction` round-trips to the required drawdown; fraction → 0 at
  and above cut-out and continuous at the pre-charge = cut-in boundary; every assembly stops
  backsiphonage and no vacuum breaker stops backpressure; air gaps reproduce the 2×/3× rule;
  monotonicity in every input of both new models.
- **346 reconciliation checks**: 24 registered = 24 grouped = 24 guide rows = 24 unique hub card
  hrefs = the badge; ungrouped empty; every slug has page + script + `init…` + wiring; element
  ids reconciled **both** directions; guide accents match registry accents; accents distinct per
  group; no stray page dirs or scripts; canonical on `www`, 3 JSON-LD blocks and OG/Twitter on
  every calculator page; **28 pages, 28 unique titles, 28 unique descriptions**.
- `npm run build` clean; sitemap **684 → 688**.
- Both calculators driven in-browser — every default matched — plus edge cases: pre-charge above
  cut-in (drawdown collapses, correct warning), pre-charge above cut-out (0.0%), 25 gpm past the
  stocked ladder, method switch toggling all four grease panels, the preset selects writing into
  their editable fields, a 50-seat kitchen falling to the floor, a 48 × 36 sink past the PDI
  ladder, and reset on both.
- **49 unique internal links across the six touched pages all resolve**; no broken in-page
  anchors (`#home` is a pre-existing site-wide skip link).
- Mobile 375 px: `scrollWidth === clientWidth === 375` on all five plumbing pages; wide tables
  scroll inside their own `overflow-x-auto` containers as intended.
- HVAC 43 and electrical 39 untouched — `git status` shows no non-plumbing source changes — and
  **the electrical hub's derived plumbing count moved 22 → 24 on its own**.
