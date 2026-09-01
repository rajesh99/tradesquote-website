# Category Brief — Plumbing (Wave 1)

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

## 3. Calculators — 16, in 5 hub groups

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
