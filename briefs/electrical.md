# Category Brief — Electrical (Wave 1)

> Wave 1 of the plan in `docs/notebooklm/electrical-content-strategy.md`: the 12 anchor
> calculators. Feed section 1–2 plus one calculator block at a time to
> `docs/calculator-prompts/02-generate-calculator-page.prompt.md`; feed section 1–2 plus the full
> calculator list to `01-generate-category-hub.prompt.md` first.
>
> **Code baseline: NEC 2023.** Note NEC 2026 deltas in a callout only where a rule moved. Every
> figure below traces to a named article or table — keep the citation in the page copy so it
> survives a code cycle. Table values are the 2023 edition; re-verify before publishing.
>
> **Prerequisite:** the Phase 0 fixes in the strategy doc (§2) must land first —
> `CalculatorToolCard.astro` still imports `hvacAccentStyles` directly, and 5 blog pages
> hard-code "HVAC Blog".

---

## 1. Category

| Field | Value |
| --- | --- |
| `name` | `Electrical` |
| `slug` | `electrical` |
| `accent` | `sky` (already set in `calculatorCategories.ts` — keep it; flip `status` to `live`, set `toolCount`) |
| `icon` | Keep the existing lightning-bolt SVG already in `calculatorCategories.ts` |
| `one_liner` | `Wire size, ampacity, voltage drop, breakers, conduit and box fill, grounding, load calculations, EV circuits, and job pricing — NEC-based and free.` |
| `hero_intro` | Size a circuit end to end without opening the code book: conductor gauge from ampacity *and* voltage drop, the breaker that matches it, the conduit and box that hold it, and the grounding conductors that go with it. Then run the whole-house load calculation that decides whether the service can take it — and price the job. |
| `order_hint` | For a full circuit the order is **Load → Wire → Breaker → Conduit/Box → Ground**. Start at the load calculator if you're sizing a service; start at wire size if you already know the amps. |

**Hub grouping (do this from day one — the HVAC hub is still a flat grid):**
`Conductors & Circuits` · `Load & Service Sizing` · `EV & Electrification` · `Cost & Pricing`

**Disclaimer block on every page** (in addition to the standard TradesQuote fine print):
> Results are for estimating and planning. Electrical work is life-safety work governed by the
> NEC and local amendments — your AHJ and a licensed electrician have final say. Local
> amendments override anything on this page.

## 2. Authorities to cite

- **NFPA 70 / National Electrical Code 2023** — https://www.nfpa.org/codes-and-standards/nfpa-70-standard-development/70 (free read-only access via NFPA LiNK)
- **NEC adoption by state** — https://electricaltoolbox.com/nec-adoption/ (which cycle the reader is actually under)
- **IEEE** — fault current and grounding practice — https://standards.ieee.org/
- **UL** — listing, terminal temperature ratings, AIC — https://www.ul.com/
- **NECA** — labor units and standard installation practice — https://www.necanet.org/
- **U.S. EIA** — residential/commercial electricity price per kWh — https://www.eia.gov/electricity/monthly/
- **U.S. DOE / ENERGY STAR** — EV charging and lighting efficacy guidance — https://www.energy.gov/

**Voltage-drop honesty rule:** the 3% branch / 5% total figures are *Informational Notes*
(210.19(A) IN, 215.2(A) IN), **not** mandatory NEC requirements. Say so on every page that uses
them. Getting this right is a genuine differentiator — most competitor pages present them as code.

**Constants used across this wave:**
`K = 12.9` (copper) / `21.2` (aluminum) ohm-cmil/ft · circular mils: 14→4,110 · 12→6,530 ·
10→10,380 · 8→16,510 · 6→26,240 · 4→41,740 · 2→66,360 · 1/0→105,600 · 2/0→133,100 ·
3/0→167,800 · 4/0→211,600 · standard OCPD ratings from **240.6(A)**.

---

## 3. Calculators

### Calculator: `electrical-wire-size-calculator`

| Field | Value |
| --- | --- |
| `title` | `Wire Size Calculator` |
| `accent` | `blue` |
| `search_question` | `What size wire do I need for 50 amps?` |
| `type` | `sizing` |
| `card_description` | The AWG your circuit actually needs — sized by NEC ampacity *and* voltage drop, whichever governs. |

**Formula:** Required ampacity = amps × 1.25 if continuous, else × 1.00 (**210.20(A)**). Pick the
smallest AWG whose **Table 310.16** ampacity at the termination temperature column ≥ required
(**110.14(C)** caps at 75°C for most equipment). Then check voltage drop:
`VD = 2 × K × I × L ÷ CM` (1φ) or `VD = 1.732 × K × I × L ÷ CM` (3φ); `VD% = VD ÷ V × 100`.
If VD% exceeds the limit, upsize until it passes. Apply the small-conductor rule (**240.4(D)**):
14 AWG max 15 A, 12 AWG max 20 A, 10 AWG max 30 A.

**Inputs:** `ws-amps` Load (A) number+slider 0–400 · `50` | `ws-continuous` Continuous load? select yes/no · `no` |
`ws-material` Conductor select copper/aluminum · `copper` | `ws-length` One-way run (ft) number 0–500 · `100` |
`ws-voltage` System voltage select 120/208/240/277/480 · `240` | `ws-phase` Phase select 1φ/3φ · `1φ` |
`ws-vd-limit` Voltage-drop limit select 3%/5% · `3%` | `ws-temp` Termination rating select 60/75/90 °C · `75`

**Result panel:** headline `ws-gauge`; tiles: ampacity of chosen gauge, voltage drop %;
breakdown rows: required ampacity, ampacity-governed gauge, voltage-drop-governed gauge, which
one won, volts at the load.

**Defaults must compute to:** **6 AWG copper.** Required ampacity 50 A → 8 AWG (50 A at 75°C) is
enough on ampacity, but 8 AWG gives `2 × 12.9 × 50 × 100 ÷ 16,510 = 7.81 V = 3.26%` — over the 3%
limit. Upsize to 6 AWG: `2 × 12.9 × 50 × 100 ÷ 26,240 = 4.92 V = 2.05%`. Volts at load 235.1 V.
**This default is deliberately a case where voltage drop governs** — it teaches the whole point of
the tool in one screen.

**Reference table:** Amps (15–400) → minimum AWG copper / aluminum at 75°C, with the 100 ft
voltage-drop-corrected gauge in a third column.

**Worked examples:** (1) 20 A, 12 AWG Cu, 40 ft, 120 V → passes on both, 12 AWG. (2) The default —
50 A at 100 ft where drop forces 6 AWG over 8 AWG. (3) 20 A, 12 AWG Cu, **150 ft**, 120 V →
`2 × 12.9 × 20 × 150 ÷ 6,530 = 11.85 V = 9.9%`; must go to 8 AWG (2.9%) even though 12 AWG is fine
on ampacity — the long-run trap.

**FAQ seeds:** What size wire for a 50 amp circuit? · Does voltage drop override the ampacity
table? · Is the 3% rule actually code? · Can I use aluminum instead of copper? · Why is 12 AWG
limited to 20 A when the table says 25 A? · Do I use the 60, 75, or 90 °C column? · Does the
neutral count as a current-carrying conductor?

**Related:** `electrical-voltage-drop-calculator` · `electrical-ampacity-calculator` ·
`electrical-breaker-size-calculator` · `electrical-conduit-fill-calculator`

**Sources:** NEC Table 310.16 · NEC 110.14(C) · NEC 240.4(D) · NEC 210.19(A) Informational Note

**CTA headline:** Circuit sized? Quote the whole job in seconds.

---

### Calculator: `electrical-voltage-drop-calculator`

| Field | Value |
| --- | --- |
| `title` | `Voltage Drop Calculator` |
| `accent` | `sky` |
| `search_question` | `How much voltage drop on a 100-foot run?` |
| `type` | `sizing` |
| `card_description` | Voltage drop in volts and percent for any gauge, length, and load — against the 3% and 5% recommendations. |

**Formula:** 1φ `VD = 2 × K × I × L ÷ CM`; 3φ `VD = 1.732 × K × I × L ÷ CM`. `VD% = VD ÷ V × 100`.
Volts at load = V − VD. Max compliant length for the chosen gauge =
`limit% × V × CM ÷ (2 × K × I)` (1φ).

**Inputs:** `vd-gauge` Conductor size select 14 AWG–4/0 · `6 AWG` | `vd-material` select copper/aluminum · `copper` |
`vd-amps` Load (A) number+slider · `50` | `vd-length` One-way run (ft) number · `100` |
`vd-voltage` select 120/208/240/277/480 · `240` | `vd-phase` select 1φ/3φ · `1φ` | `vd-limit` select 3%/5% · `3%`

**Result panel:** headline `vd-percent`; tiles: volts dropped, volts at load; breakdown: K,
circular mils, the multiplier (2 or 1.732), pass/fail vs limit, max compliant one-way length.

**Defaults must compute to:** **2.05%** — 4.92 V dropped, 235.1 V at the load, PASS. Max compliant
length at 3% for 6 AWG @ 50 A = `0.03 × 240 × 26,240 ÷ (2 × 12.9 × 50) = 146 ft`.

**Reference table:** Max one-way run at 3% for each gauge at 20/30/50/100 A, 240 V copper.

**Worked examples:** (1) The default — 6 AWG, 50 A, 100 ft, passes at 2.05%. (2) 12 AWG, 20 A,
150 ft, 120 V → 9.9%, fails badly; upsize or move the panel. (3) 3φ 480 V, 100 A, 4/0 Cu, 400 ft →
`1.732 × 12.9 × 100 × 400 ÷ 211,600 = 4.22 V = 0.88%` — long runs are easy at 480 V, which is the
whole argument for higher voltage.

**FAQ seeds:** Is 3% voltage drop a code requirement or a recommendation? · Why 2× for
single-phase and 1.732× for three-phase? · What's an acceptable voltage drop? · Does voltage drop
matter more on 120 V than 240 V? · How far can I run 12 AWG on a 20 A circuit? · Does upsizing wire
for voltage drop change my ground wire size?

**Related:** `electrical-wire-size-calculator` · `electrical-ampacity-calculator` ·
`electrical-conductor-resistance-calculator` · `electrical-service-wire-size-calculator`

**Sources:** NEC 210.19(A) IN · NEC 215.2(A) IN · NEC Chapter 9 Table 8

**CTA headline:** Drop within limits? Price the run in seconds.

---

### Calculator: `electrical-ampacity-calculator`

| Field | Value |
| --- | --- |
| `title` | `Ampacity & Derating Calculator` |
| `accent` | `cyan` |
| `search_question` | `How many amps can 10 AWG carry at 40 °C with 6 conductors?` |
| `type` | `sizing` |
| `card_description` | Derated ampacity after ambient temperature correction and conductor bundling — capped by the 75 °C termination rule. |

**Formula:** `Derated = base ampacity (Table 310.16 at the insulation temp column) × ambient
correction (Table 310.15(B)(1)) × bundling adjustment (Table 310.15(C)(1))`. Then apply
**110.14(C)**: the usable ampacity can't exceed the same conductor's ampacity at the *termination*
temperature rating. Then apply **240.4(D)** for 14/12/10 AWG OCPD caps.
Bundling factors: 4–6 → 0.80 · 7–9 → 0.70 · 10–20 → 0.50 · 21–30 → 0.45 · 31–40 → 0.40 · 41+ → 0.35.

**Inputs:** `amp-gauge` select 14 AWG–4/0 · `10 AWG` | `amp-material` select copper/aluminum · `copper` |
`amp-insulation` Conductor rating select 60/75/90 °C · `90` | `amp-ambient` Ambient (°F/°C) number · `104 °F / 40 °C` |
`amp-count` Current-carrying conductors in the raceway number 1–41 · `6` | `amp-termination` Termination rating select 60/75/90 °C · `75`

**Result panel:** headline `amp-derated`; tiles: base ampacity, max OCPD;
breakdown: base at insulation column, ambient factor, bundling factor, derated result,
110.14(C) cap, 240.4(D) cap, governing value.

**Defaults must compute to:** **29.1 A.** 10 AWG Cu at 90°C = 40 A base; ambient 40°C → 0.91;
6 conductors → 0.80; `40 × 0.91 × 0.80 = 29.1 A`. The 110.14(C) 75°C cap for 10 AWG is 35 A (not
binding). Max OCPD = 30 A: 240.4(B) permits the next higher standard rating above 29.1 A, and
240.4(D) caps 10 AWG at 30 A anyway.

**Reference table:** Ambient correction factors (Table 310.15(B)(1)) for 60/75/90 °C side by side
with the bundling factors.

**Worked examples:** (1) The default. (2) Same 10 AWG THHN, 30 °C, 3 conductors → 40 A base × 1.00
× 1.00 = 40 A, but 110.14(C) caps it at 35 A and 240.4(D) caps the breaker at 30 A — the classic
"why can't I put 10 AWG on a 40 A breaker" case. (3) 4/0 Cu THHN, 45 °C, 9 conductors →
`260 × 0.87 × 0.70 = 158.3 A`, well below the 230 A everyone assumes 4/0 is good for.

**FAQ seeds:** When do I have to derate? · Do neutrals count as current-carrying? · Does the EGC
count? · Why can 90 °C wire never be used at its 90 °C ampacity? · How many conductors before
bundling kicks in? · Does conduit in direct sun need extra correction (310.15(B)(3))? · Can I
round up to the next breaker size?

**Related:** `electrical-wire-size-calculator` · `electrical-conduit-fill-calculator` ·
`electrical-breaker-size-calculator` · `electrical-wire-ampacity-chart`

**Sources:** NEC Table 310.16 · NEC 310.15(B)(1) · NEC 310.15(C)(1) · NEC 110.14(C) · NEC 240.4

**CTA headline:** Ampacity confirmed? Turn it into a priced quote.

---

### Calculator: `electrical-breaker-size-calculator`

| Field | Value |
| --- | --- |
| `title` | `Breaker Size Calculator` |
| `accent` | `red` |
| `search_question` | `What size breaker do I need for a 40 amp load?` |
| `type` | `sizing` |
| `card_description` | The overcurrent device your load requires — continuous loads at 125%, rounded to the next standard NEC rating. |

**Formula:** `Required = (non-continuous × 1.00) + (continuous × 1.25)` (**210.20(A)**). Round up to
the next standard rating in **240.6(A)**: 15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100, 110,
125, 150, 175, 200, 225, 250, 300, 350, 400… Then the conductor must have ampacity ≥ the breaker
(**240.4**), subject to **240.4(D)** small-conductor caps.

**Inputs:** `br-noncont` Non-continuous load (A) number · `0` | `br-cont` Continuous load (A) number · `40` |
`br-voltage` select 120/208/240/277/480 · `240` | `br-material` select copper/aluminum · `copper` |
`br-temp` Termination rating select 60/75/90 °C · `75`

**Result panel:** headline `br-size`; tiles: required amps before rounding, minimum conductor AWG;
breakdown: non-continuous at 100%, continuous at 125%, total required, next standard rating,
conductor to match.

**Defaults must compute to:** **50 A breaker, 8 AWG copper minimum.** `40 × 1.25 = 50 A` → 50 A is
already a standard rating. 8 AWG Cu at 75°C = 50 A.

**Reference table:** Standard OCPD ratings (240.6(A)) mapped to minimum copper and aluminum
conductor at 75°C, with the 240.4(D) caps flagged.

**Worked examples:** (1) The default. (2) 36 A non-continuous + 12 A continuous =
`36 + 15 = 51 A` → next standard is 60 A, needing 6 AWG Cu — the rounding surprise. (3) 16 A
continuous → `16 × 1.25 = 20 A` → 20 A breaker on 12 AWG, which is exactly why a 16 A continuous
load can't sit on a 15 A circuit.

**FAQ seeds:** What is a continuous load? · Why 125%? · Can I use a 40 A breaker on 10 AWG wire? ·
What are the standard breaker sizes? · What if my calculated amps fall between two standard
sizes? · Does the breaker protect the wire or the equipment? · When is a breaker allowed to be
larger than the conductor ampacity (motors, 240.4(G))?

**Related:** `electrical-wire-size-calculator` · `electrical-ampacity-calculator` ·
`electrical-ev-charger-calculator` · `/calculators/hvac/hvac-amp-draw-calculator` *(the HVAC
amp-draw tool already answers "what breaker for a 3-ton AC" — link it, don't rebuild it)*

**Sources:** NEC 210.20(A) · NEC 240.6(A) · NEC 240.4 · NEC Table 310.16

**CTA headline:** Breaker sized? Quote the circuit in seconds.

---

### Calculator: `electrical-conduit-fill-calculator`

| Field | Value |
| --- | --- |
| `title` | `Conduit Fill Calculator` |
| `accent` | `teal` |
| `search_question` | `How many #12 wires fit in 1/2 inch EMT?` |
| `type` | `sizing` |
| `card_description` | NEC Chapter 9 fill percentage for EMT, PVC, RMC, and IMC — plus how many more conductors will fit. |

**Formula:** Total conductor area = Σ (count × area from **Chapter 9 Table 5** for that insulation
type). Allowable area = conduit internal area (**Table 4**) × fill limit from **Table 1**:
**53%** for 1 conductor, **31%** for 2, **40%** for 3 or more.
`Fill% = total conductor area ÷ conduit total internal area × 100`.
THHN areas (in²): 14→0.0097 · 12→0.0133 · 10→0.0211 · 8→0.0366 · 6→0.0507 · 4→0.0824 ·
2→0.1158 · 1/0→0.1855 · 4/0→0.3237.
EMT internal area (in²): ½″→0.304 · ¾″→0.533 · 1″→0.864 · 1¼″→1.496 · 1½″→2.036 · 2″→3.356.

**Inputs:** `cf-type` Conduit type select EMT/PVC Sch 40/PVC Sch 80/RMC/IMC · `EMT` |
`cf-size` Trade size select ½″–4″ · `1/2"` | `cf-insulation` Insulation select THHN/THWN-2/XHHW/RHW · `THHN` |
`cf-rows` Up to 4 conductor rows: gauge select + count number · row 1 = `12 AWG × 4`

**Result panel:** headline `cf-percent`; tiles: allowable area, used area; breakdown: per-row
area, total area, fill limit applied, pass/fail, how many more of the largest gauge fit, next
trade size up.

**Defaults must compute to:** **17.5% fill — PASS.** `4 × 0.0133 = 0.0532 in²` against ½″ EMT's
0.304 in²; allowable at 40% = 0.122 in². Max #12 THHN in ½″ EMT = **9** (`0.122 ÷ 0.0133 = 9.17`,
matching Annex C Table C.1), so **5 more** will fit.

**Reference table:** Max THHN conductor count by gauge for ½″–2″ EMT (Annex C.1) — this table
alone is a strong ranking asset.

**Worked examples:** (1) The default. (2) 9 × #12 in ½″ EMT = 0.1197 in² = 39.4% — right at the
limit, legal but a miserable pull; note that experienced hands target 30–35%. (3) Two 4/0 THHN
in 1½″ EMT: `2 × 0.3237 = 0.6474 in²`, 2-conductor limit is 31% × 2.036 = 0.631 in² → **fails**,
go to 2″. The 2-conductor case is where people get caught.

**FAQ seeds:** What is the 40% conduit fill rule? · Why is 2 conductors 31% but 3 is 40%? · Does
the ground wire count in conduit fill? · How many #12 in ¾″ EMT? · Do I use Table 4 or Annex C? ·
Does a nipple under 24″ get 60% fill (Chapter 9 Note 4)? · Does derating apply once I pass 3
current-carrying conductors?

**Related:** `electrical-conduit-size-calculator` · `electrical-ampacity-calculator` ·
`electrical-box-fill-calculator` · `electrical-wire-size-calculator`

**Sources:** NEC Chapter 9 Tables 1, 4, 5 · NEC Annex C · NEC Chapter 9 Note 4

**CTA headline:** Conduit sized? Quote the rough-in in seconds.

---

### Calculator: `electrical-box-fill-calculator`

| Field | Value |
| --- | --- |
| `title` | `Box Fill Calculator` |
| `accent` | `teal` |
| `search_question` | `What size box do I need for 6 wires and a receptacle?` |
| `type` | `sizing` |
| `card_description` | Cubic inches required per NEC 314.16 — conductors, clamps, devices, and grounds counted correctly. |

**Formula (314.16(B)):** volume per conductor — 14 AWG 2.00 in³ · 12 AWG 2.25 · 10 AWG 2.50 ·
8 AWG 3.00 · 6 AWG 5.00. Count: **1** volume per conductor entering the box and terminating or
spliced inside (a conductor passing through unbroken counts as 1). **All EGCs together = 1**
volume of the largest EGC. **Internal clamps (all of them together) = 1** volume of the largest
conductor. **Each support fitting** (fixture stud, hickey) = 2. **Each device yoke = 2** volumes
of the largest conductor connected to it (4 if the device is wider than 2 gangs).

**Inputs:** `bf-gauge` Largest conductor select 14–6 AWG · `12 AWG` |
`bf-hots` Ungrounded conductors number · `2` | `bf-neutrals` Grounded conductors number · `2` |
`bf-grounds` EGCs number · `2` | `bf-clamps` Internal cable clamps? select yes/no · `yes` |
`bf-devices` Device yokes number 0–4 · `1` | `bf-fittings` Support fittings number 0–2 · `0`

**Result panel:** headline `bf-total` (in³); tiles: smallest standard box that works, spare
volume in that box; breakdown: one row per allowance with its multiplier.

**Defaults must compute to:** **18.00 in³.** Conductors `4 × 2.25 = 9.00` + EGCs (2 count as 1)
`2.25` + clamps `2.25` + one device yoke `2 × 2.25 = 4.50` = **18.00 in³**. An 18 in³ single-gang
box *exactly* meets it with zero margin — call that out and recommend a 20.3 or 22.5 in³ box.

**Reference table:** Common box volumes (314.16(A)) — 3×2 device boxes 7.5–22.5 in³, 4″ square
boxes 21–30.3 in³, plus plaster-ring add-ons — against max 14 AWG and 12 AWG conductor counts.

**Worked examples:** (1) The default. (2) Two 12/2 cables + one 12/3 + a 3-way switch:
6 CCCs `13.50` + EGC `2.25` + clamps `2.25` + device `4.50` = **22.50 in³** → needs a 22.5 in³ box
minimum, so a 4″ square. (3) A single 14/2 switch loop: 2 CCCs `4.00` + EGC `2.00` + clamps `2.00`
+ device `4.00` = **12.00 in³** — the smallest 12.5 in³ box works.

**FAQ seeds:** How do I count grounds in box fill? · Do wire nuts, pigtails, or cable staples
count? · How many wires in a single-gang box? · Does a smart switch or dimmer change the count? ·
Do all the clamps count once or each? · What about a conductor that just passes through? ·
Where do I find my box's cubic inches?

**Related:** `electrical-conduit-fill-calculator` · `electrical-receptacle-circuit-calculator` ·
`electrical-ground-wire-size-calculator` · `electrical-wire-size-calculator`

**Sources:** NEC 314.16(A) · NEC 314.16(B) · NEC Table 314.16(A)

**CTA headline:** Boxes counted? Quote the rough-in in seconds.

---

### Calculator: `electrical-ground-wire-size-calculator`

| Field | Value |
| --- | --- |
| `title` | `Ground Wire Size Calculator` |
| `accent` | `emerald` |
| `search_question` | `What size ground wire for a 200 amp service?` |
| `type` | `sizing` |
| `card_description` | Equipment grounding conductor from the breaker size and grounding electrode conductor from the service conductors — two different tables. |

**Formula:** **EGC** from **Table 250.122** by OCPD rating (copper): 15 A→14 · 20 A→12 · 60 A→10 ·
100 A→8 · 200 A→6 · 300 A→4 · 400 A→3 · 500 A→2 · 600 A→1. If the ungrounded conductors were
upsized (for voltage drop, say), the EGC must be upsized proportionally by circular-mil ratio
(**250.122(B)**).
**GEC** from **Table 250.66** by largest service-entrance conductor: 2 Cu or smaller→8 Cu ·
1–1/0 Cu→6 Cu · 2/0–3/0 Cu→4 Cu · over 3/0–350 kcmil Cu→2 Cu · over 350–600→1/0 Cu.
Exceptions: a GEC to a **rod/pipe/plate** electrode never needs to exceed **6 AWG Cu**
(250.66(A)); to a **concrete-encased** electrode, **4 AWG Cu** (250.66(B)); to a **ground ring**,
never larger than the ring itself (250.66(C)).

**Inputs:** `gw-mode` What am I sizing? select EGC/GEC · `EGC` |
`gw-ocpd` OCPD rating (A) select 15–600 · `200` | `gw-material` select copper/aluminum · `copper` |
`gw-service` Largest service conductor select 8 AWG–600 kcmil · `3/0 Cu` |
`gw-electrode` Electrode type select rod/concrete-encased/ground ring/water pipe · `concrete-encased` |
`gw-upsized` Ungrounded conductors upsized? select yes/no · `no`

**Result panel:** headline `gw-size`; tiles: table used, electrode exception applied;
breakdown: table row matched, exception cap, 250.122(B) proportional upsize if any.

**Defaults must compute to:** **EGC = 6 AWG copper** (200 A, Table 250.122).
Switching to GEC mode with 3/0 Cu service conductors → **4 AWG copper** from Table 250.66 — but
capped at **6 AWG** if the only electrode is a driven rod (250.66(A)) and at **4 AWG** for a
concrete-encased electrode (250.66(B)). That "the table says 4, the exception says 6" tension is
the single most misunderstood thing in Article 250 and should be the page's centrepiece.

**Reference table:** Table 250.122 and Table 250.66 side by side, Cu and Al columns, with the
three 250.66 exception caps called out.

**Worked examples:** (1) 20 A kitchen circuit → 12 AWG Cu EGC. (2) The default 200 A service —
EGC 6 AWG, GEC 4 AWG to the rebar, 6 AWG to a rod. (3) A 20 A circuit whose conductors were
upsized from 12 AWG (6,530 cmil) to 8 AWG (16,510 cmil) for voltage drop → EGC must scale by
`16,510 ÷ 6,530 = 2.5283`, so 12 AWG (6,530) × 2.5283 = 16,510 cmil → **8 AWG** EGC, not 12.

**FAQ seeds:** What size ground wire for a 200 amp service? · What's the difference between an EGC
and a GEC? · Does the ground wire have to match the hot wires? · Why does a ground rod only need
6 AWG? · Can I use aluminum for a grounding conductor? · Do I upsize the ground when I upsize for
voltage drop? · Is the neutral a grounding conductor?

**Related:** `electrical-service-wire-size-calculator` · `electrical-breaker-size-calculator` ·
`electrical-box-fill-calculator` · `electrical-wire-size-calculator`

**Sources:** NEC Table 250.122 · NEC 250.122(B) · NEC Table 250.66 · NEC 250.66(A)(B)(C)

**CTA headline:** Grounding sized? Price the service work in seconds.

---

### Calculator: `electrical-service-wire-size-calculator`

| Field | Value |
| --- | --- |
| `title` | `Service & Feeder Wire Size Calculator` |
| `accent` | `blue` |
| `search_question` | `What size wire for a 200 amp service?` |
| `type` | `sizing` |
| `card_description` | Dwelling service and feeder conductors from NEC Table 310.12 — the 83% allowance that lets 4/0 aluminum carry 200 amps. |

**Formula:** For a **dwelling** service or the main feeder carrying the entire load, **Table
310.12** permits conductors rated at **83%** of the service rating. Copper: 100 A→4 · 110 A→3 ·
125 A→2 · 150 A→1 · 175 A→1/0 · 200 A→2/0 · 225 A→3/0 · 250 A→4/0 · 300 A→250 kcmil ·
400 A→400 kcmil. Aluminum: 100 A→2 · 125 A→1/0 · 150 A→2/0 · 175 A→3/0 · **200 A→4/0** ·
250 A→300 kcmil · 400 A→600 kcmil. Non-dwelling or a feeder that doesn't carry the whole load
falls back to **Table 310.16**. Then voltage-drop check, and neutral sizing per **220.61**
(reduced neutral permitted, but never smaller than the required GEC per 250.24(C)).

**Inputs:** `sw-rating` Service/feeder rating (A) select 100–400 · `200` |
`sw-material` select copper/aluminum · `aluminum` | `sw-type` Dwelling service (83% rule) or other feeder? select · `dwelling service` |
`sw-length` One-way run (ft) number · `100` | `sw-voltage` select 120/240 · `240`

**Result panel:** headline `sw-gauge`; tiles: neutral size, GEC size;
breakdown: table used, ungrounded conductor, neutral per 220.61, EGC/GEC, voltage drop %.

**Defaults must compute to:** **4/0 aluminum** (200 A dwelling service, Table 310.12).
Voltage drop at 200 A over 100 ft: `2 × 21.2 × 200 × 100 ÷ 211,600 = 4.01 V = 1.67%` — PASS.
GEC = **4 AWG Cu** (Table 250.66 for 4/0 Al service conductors).

**Reference table:** Table 310.12 in full — Cu and Al for 100–400 A — beside the Table 310.16
values so the reader can see exactly what the 83% allowance buys.

**Worked examples:** (1) The default. (2) A 200 A **subpanel** feeder in a detached garage — not a
dwelling service carrying the whole load, so Table 310.16 applies: 4/0 Al is only 180 A there;
you need 250 kcmil Al or 2/0 Cu. This distinction is where most DIY answers online are wrong.
(3) 100 A service, copper, 150 ft: 4 AWG on the table, but
`2 × 12.9 × 100 × 150 ÷ 41,740 = 9.27 V = 3.86%` — over 3%, so upsize to 2 AWG (2.44%).

**FAQ seeds:** What size wire for a 200 amp service? · What is the 83% rule? · Can 4/0 aluminum
really carry 200 amps? · Does the 83% rule apply to a subpanel feeder? · Can the neutral be
smaller than the hots? · Do I need to upsize for a long service run? · Copper or aluminum for a
service?

**Related:** `electrical-service-size-calculator` · `electrical-load-calculator` ·
`electrical-ground-wire-size-calculator` · `electrical-voltage-drop-calculator`

**Sources:** NEC Table 310.12 · NEC Table 310.16 · NEC 220.61 · NEC 250.24(C) · NEC Table 250.66

**CTA headline:** Service conductors sized? Quote the upgrade in seconds.

---

### Calculator: `electrical-load-calculator`

| Field | Value |
| --- | --- |
| `title` | `Residential Load Calculator` |
| `accent` | `indigo` |
| `search_question` | `How do I do a residential load calculation?` |
| `type` | `sizing` |
| `card_description` | Whole-house calculated load in VA and amps by the NEC 220.82 optional method — the number that decides your service size. |

**Formula (220.82 optional method):**
General load = `3 VA/ft² × area` + `1,500 VA × small-appliance circuits (min 2)` +
`1,500 VA × laundry circuits (min 1)` + nameplate VA of every fastened-in-place appliance.
Apply **220.82(B)**: **first 10,000 VA at 100%, remainder at 40%**.
Add the largest of the **220.82(C)** heating/cooling options at its stated percentage (A/C or heat
pump at 100%, central electric heat at 65%, etc.).
`Service amps = total VA ÷ 240`.

**Inputs:** `lc-area` Floor area (ft²) number+slider · `2000` | `lc-sac` Small-appliance circuits number ≥2 · `2` |
`lc-laundry` Laundry circuits number ≥1 · `1` | `lc-range` Range/oven (VA) number · `12000` |
`lc-dryer` Dryer (VA) number · `5000` | `lc-wh` Water heater (VA) number · `4500` |
`lc-dishwasher` Dishwasher (VA) number · `1200` | `lc-other` Other fastened appliances (VA) number · `0` |
`lc-ac` A/C or heat pump (VA) number · `5000` | `lc-heat` Electric heat (VA) number · `0` |
`lc-ev` EV charger (VA) number · `0`

**Result panel:** headline `lc-amps`; tiles: total calculated VA, recommended service;
breakdown: general lighting, small appliance, laundry, appliance total, first 10 kVA at 100%,
remainder at 40%, largest HVAC load, total, amps, minimum standard service.

**Defaults must compute to:** **101 A → 125 A minimum service.**
General 6,000 + small appliance 3,000 + laundry 1,500 + appliances 22,700 = **33,200 VA**;
first 10,000 at 100% = 10,000; remaining 23,200 at 40% = 9,280 → 19,280 VA; plus A/C at 100% =
5,000 → **24,280 VA ÷ 240 = 101.2 A**. Next standard service = 125 A; recommend **200 A** for
electrification headroom.

**Reference table:** 220.82(C) percentages for each heating/cooling configuration, plus typical
nameplate VA for range, dryer, water heater, EV charger, heat pump, induction cooktop, hot tub.

**Worked examples:** (1) The default 2,000 ft² gas-heat home → 101 A, fits 125 A. (2) Add a 48 A
EV charger (11,520 VA): general subtotal becomes 44,720 → `10,000 + (34,720 × 0.40) = 23,888`
+ 5,000 = **28,888 VA = 120.4 A** — still under 125 A, which is the counter-intuitive good news
that kills a lot of unnecessary panel upgrades. (3) Same house all-electric: swap gas for a
10 kW heat pump with 10 kW strip heat and the 220.82(C) term jumps, pushing past 150 A.

**FAQ seeds:** How do I calculate the electrical load of a house? · What's the difference between
the standard and optional methods? · Why is the remainder only counted at 40%? · Do I include the
EV charger at full nameplate? · What size service does a 2,000 sq ft house need? · Is 100 amps
enough for a modern home? · Does a load calculation require a licensed electrician?

**Related:** `electrical-service-size-calculator` · `electrical-existing-load-calculator` ·
`electrical-service-wire-size-calculator` · `/calculators/hvac/hvac-manual-j-calculator`
*(the HVAC load feeds the electrical one — link both directions)*

**Sources:** NEC 220.82 · NEC 220.82(B) · NEC 220.82(C) · NEC 220.12 · NEC 220.52

**CTA headline:** Load calculated? Quote the service upgrade in seconds.

---

### Calculator: `electrical-service-size-calculator`

| Field | Value |
| --- | --- |
| `title` | `Service Size Calculator` |
| `accent` | `indigo` |
| `search_question` | `What size electrical service do I need?` |
| `type` | `sizing` |
| `card_description` | Turn a calculated load into a service rating — and see exactly how much headroom is left for an EV charger or heat pump. |

**Formula:** `Amps = calculated VA ÷ 240`. Pick the smallest standard service ≥ amps
(100 / 125 / 150 / 200 / 225 / 320 / 400). `Utilisation% = amps ÷ service rating × 100`.
`Headroom = (service rating − amps)` in amps and `× 240` in VA. Flag when utilisation exceeds
**80%**, the practical planning threshold.

**Inputs:** `ss-va` Calculated load (VA) number · `24280` | `ss-voltage` select 120/240 · `240` |
`ss-existing` Existing service rating (A) select 60–400 · `200` |
`ss-future` Planned additions (VA) number · `0`

**Result panel:** headline `ss-service` (minimum service); tiles: utilisation % of the existing
panel, headroom in amps; breakdown: amps, minimum standard service, existing rating,
spare capacity in VA, what that spare fits (EV charger / heat pump / neither).

**Defaults must compute to:** **101 A calculated → 125 A minimum; on the existing 200 A panel
that's 50.6% used with 98.8 A (≈23,700 VA) spare** — room for both a 48 A EV charger and a heat
pump. Chains directly off `electrical-load-calculator`'s default output.

**Reference table:** Standard service ratings vs the calculated load each supports at 80%
utilisation, with typical additions (48 A EVSE = 11,520 VA, 5-ton heat pump ≈ 7,000 VA,
induction range = 12,000 VA, hot tub = 11,500 VA) so readers can do the arithmetic in their head.

**Worked examples:** (1) The default. (2) Same house on a 100 A panel: 101 A = 101% — genuinely
needs an upgrade or load management. (3) 150 A panel at 101 A = 67%, 49 A spare = 11,760 VA:
fits a 48 A EVSE with almost nothing left, so a load-management device is the cheaper answer than
a service upgrade.

**FAQ seeds:** What size electrical service do I need? · Is 100 amp service enough? · How do I
know if my panel is full vs overloaded? · What's the 80% rule for panels? · Can I add an EV
charger to a 100 amp panel? · Does upgrading the panel mean upgrading the service? · What does a
200 amp service cost?

**Related:** `electrical-load-calculator` · `electrical-existing-load-calculator` ·
`electrical-panel-upgrade-cost-calculator` · `electrical-service-wire-size-calculator`

**Sources:** NEC 220.82 · NEC 230.79 · NEC 408.36 · NEC 220.87

**CTA headline:** Service size settled? Quote the upgrade in seconds.

---

### Calculator: `electrical-ev-charger-calculator`

| Field | Value |
| --- | --- |
| `title` | `EV Charger Circuit Calculator` |
| `accent` | `emerald` |
| `search_question` | `What size wire and breaker for a 48 amp EV charger?` |
| `type` | `sizing` |
| `card_description` | EVSE circuit sized as a continuous load per NEC 625 — breaker, conductor, ground, voltage drop, and whether your panel can take it. |

**Formula:** EV charging is a **continuous load** (**625.41**, **625.42**): conductors and
overcurrent protection at **125%** of the EVSE's rated output current.
`Required = charger amps × 1.25` → next standard rating (240.6(A)). Conductor from **Table
310.16** at the 75°C column ≥ the breaker. EGC from **Table 250.122**. Voltage drop
`2 × K × I × L ÷ CM`. Panel check: `existing calculated VA + (charger A × V)` against the service
rating. If it doesn't fit, an **EMS / load-management device (625.42(A), 750)** is usually cheaper
than a service upgrade.

**Inputs:** `ev-amps` Charger output (A) select 16/24/32/40/48/64/80 · `48` |
`ev-voltage` select 208/240 · `240` | `ev-material` select copper/aluminum · `copper` |
`ev-length` One-way run (ft) number · `60` | `ev-hardwired` Hardwired or receptacle? select · `hardwired` |
`ev-existing-va` Existing calculated load (VA) number · `24280` | `ev-service` Service rating (A) select 100–400 · `200`

**Result panel:** headline `ev-breaker`; tiles: conductor AWG, EGC AWG; breakdown: 125%
calculation, next standard breaker, conductor from 310.16, EGC from 250.122, voltage drop %,
new total load, % of service used, verdict (fits / needs load management / needs upgrade).

**Defaults must compute to:** **60 A breaker, 6 AWG copper, 10 AWG copper ground.**
`48 × 1.25 = 60 A` → 60 A standard rating; 6 AWG Cu at 75°C = 65 A ≥ 60 A; EGC for a 60 A OCPD =
10 AWG Cu. Voltage drop `2 × 12.9 × 48 × 60 ÷ 26,240 = 2.83 V = 1.18%` — PASS.
Panel check: `24,280 + (48 × 240 = 11,520) = 35,800 VA ÷ 240 = 149.2 A` = **74.6% of a 200 A
service — fits.**

**Reference table:** Charger output → breaker → copper AWG → EGC, for 16/24/32/40/48/64/80 A,
plus the corresponding continuous VA at 240 V.

**Worked examples:** (1) The default 48 A hardwired charger. (2) A 40 A charger on a NEMA 14-50
receptacle → `40 × 1.25 = 50 A` breaker, 8 AWG Cu, 10 AWG EGC — the most common install, and note
that many plug-in units ship set to 32 A. (3) Same 48 A charger on a **100 A** service already
calculated at 24,280 VA: `35,800 ÷ 240 = 149 A` on a 100 A service = **149% — will not fit**;
either drop to a 32 A charger with load management or upgrade the service.

**FAQ seeds:** What size breaker for a 48 amp EV charger? · What wire size for an EV charger? ·
Why is 125% required for EV charging? · Do I need a panel upgrade for an EV charger? · Can I put
two EV chargers on one circuit? · Hardwired or NEMA 14-50 — which is better? · Does a load
management device let me skip the upgrade? · Does the EV charger need GFCI protection?

**Related:** `electrical-load-calculator` · `electrical-service-size-calculator` ·
`electrical-ev-charger-install-cost-calculator` · `electrical-breaker-size-calculator`

**Sources:** NEC 625.41 · NEC 625.42 · NEC 210.20(A) · NEC Table 310.16 · NEC Table 250.122 ·
NEC Article 750

**CTA headline:** EV circuit sized? Quote the install in seconds.

> **Content accuracy note:** the 30% federal 30C credit for EV charging equipment expired
> **2026-06-30**. Do **not** promise it on the cost pages — verify current federal and state
> incentives at publish time.

---

### Calculator: `electrical-estimate-calculator`

| Field | Value |
| --- | --- |
| `title` | `Electrical Estimate Calculator` |
| `accent` | `rose` |
| `search_question` | `How do I price an electrical job?` |
| `type` | `comparison/cost` |
| `card_description` | Turn labor hours, material, and fixtures into a quoted price at your target gross margin. |

**Formula:** Mirror `hvac-estimate-calculator` exactly so the two trades behave identically:
`labor = hours × loaded rate` · `direct = labor + fixtures/equipment + material` ·
`overhead = direct × overhead%` · `break-even = direct + overhead` ·
`price = break-even ÷ (1 − margin%)` · `profit = price − break-even`.
Also show the (wrong but common) `break-even × (1 + margin%)` result so the markup-vs-margin gap
is visible on screen — the same teaching device the HVAC page uses.

**Inputs:** `est-hours` Labor hours number+slider · `12` | `est-rate` Loaded labor rate ($/h) number · `95` |
`est-fixtures` Fixtures & equipment ($) number · `600` | `est-material` Material ($) number · `850` |
`est-overhead` Overhead (%) number · `15` | `est-margin` Target gross margin (%) number+slider · `25`

**Result panel:** headline `est-price`; tiles: gross profit, break-even; breakdown: labor,
fixtures, material, overhead added, break-even, ÷ (1 − margin), price, and the markup-vs-margin
comparison line.

**Defaults must compute to:** **$3,971 quoted price.**
`labor = 12 × 95 = $1,140` · `direct = 1,140 + 600 + 850 = $2,590` ·
`overhead = 2,590 × 0.15 = $388.50` · `break-even = $2,978.50` ·
`price = 2,978.50 ÷ 0.75 = $3,971.33` · `profit = $992.83`.
Markup-instead-of-margin would give `2,978.50 × 1.25 = $3,723.13` — **$248 less profit on the same
job**, which is the point.

**Reference table:** Typical 2026 US benchmarks with sources — electrician billing $50–$130/h
(service call $100–$200 for the first hour); loaded cost commonly 2.5–3× wage; panel upgrade
$1,300–$5,000 installed; dedicated circuit $250–$900; outlet $100–$185; whole-house rewire
$5–$17/ft². Label every figure as a market range, not a quote.

**Worked examples:** (1) The default sub-panel-and-circuits job. (2) A 200 A panel upgrade:
10 h × $95 + $900 panel + $400 material + 15% OH + 30% margin →
`950 + 900 + 400 = 2,250` × 1.15 = `$2,587.50` ÷ 0.70 = **$3,696**. (3) A single added circuit
priced too thin: 3 h × $95 + $120 material + 15% OH at only 10% margin →
`285 + 120 = 405` × 1.15 = `$465.75` ÷ 0.90 = **$517** for $51.75 of profit — the "you're working
for free" case every cost calculator should show at least once.

**FAQ seeds:** How do electricians price jobs? · What's a good profit margin on electrical work? ·
What should my hourly rate be? · Markup or margin — which do I use? · How do I price a panel
upgrade? · Should I charge a flat rate or time and materials? · How do I account for permits and
inspection time?

**Related:** `electrical-labor-rate-calculator` · `electrical-markup-margin-calculator` ·
`electrical-panel-upgrade-cost-calculator` · `/calculators/hvac/hvac-estimate-calculator`

**Sources:** U.S. BLS wage data · NECA labor units ·
https://homeguide.com/costs/electrician-cost-per-hour ·
https://www.housecallpro.com/resources/how-to-price-electrical-work/

**CTA headline:** Priced the job? Let TradesQuote write the whole estimate.

---

## 4. Wave 1 acceptance checklist

- [ ] Phase 0 refactors landed; HVAC pages still render identically.
- [ ] `npm run build` passes; every new page prerenders or SSRs as intended.
- [ ] `calculatorCategories.ts`: electrical is `live` with `toolCount: 12`.
- [ ] Hub page groups the 12 tools under the 4 workflow headings.
- [ ] Every script's `getElementById` ids reconcile 1:1 with its markup.
- [ ] **Each calculator's default inputs produce exactly the "Defaults must compute to" numbers
      above** — verified in the browser, not assumed.
- [ ] Reference-table and worked-example numbers match what the script computes.
- [ ] Each page has canonical + OG/Twitter + `BreadcrumbList` + `WebApplication` + `FAQPage`,
      with FAQ schema mirroring the on-page FAQ verbatim.
- [ ] Every code claim cites an article or table number; "Sources & standards" line present.
- [ ] Voltage-drop pages state that 3%/5% are Informational Notes, not mandatory.
- [ ] Licensed-electrician / AHJ disclaimer on every page.
- [ ] Cross-links to `/calculators/hvac/hvac-amp-draw-calculator`,
      `hvac-manual-j-calculator`, and `hvac-estimate-calculator` are live **and reciprocated**
      from the HVAC side.
