# Plumbing Content Strategy

The plan to bring `/blog` up to the same depth for plumbing that HVAC and electrical already
have. Written **after** the calculators shipped, not before — waves 1–4 built 25 calculators and
3 reference pages, the first 8 posts went live in wave 4, and wave 5a added 6 more. This
document exists so the remaining waves stop being chosen post-by-post.

**Market assumption:** United States, imperial units, **IPC 2021** as the baseline authority —
consistent with the calculators. Do not write UK/AU/EU content into this category.

**Code policy, and it is different from electrical's.** The IPC is a *model* code and roughly
fifteen states enforce the **UPC** or a derivative such as California's CPC instead, where
fixture-unit values and sizing tables genuinely differ. Every post names the table or section it
uses and says the IPC is a model code. **Do not present IPC numbers as universal** — that is the
single most common error in competitor content and it is the easiest place to be more accurate
than they are.

> **No keyword data exists for plumbing.** HVAC has
> `docs/resources/hvac-formula-calculator-keywords-stats.csv`; plumbing and electrical do not.
> The tiers below are **reasoned, not measured**. Pulling a real export should re-prioritise
> everything here, exactly as it should have for electrical.

---

## 1. Where the category stands

| Surface | State |
| --- | --- |
| Calculators | **25**, in 6 hub groups. Four-edit registration is structurally guarded by `ungroupedPlumbingCalculators`. |
| Reference pages | **3** — `formulas` (25 blocks), `glossary` (85 terms), `backflow-prevention`. Parity with electrical, ahead of HVAC's 2. |
| Blog posts | **14** — 8 in wave 4, 6 in wave 5a. Against HVAC's 64 and electrical's 75. |
| Taxonomy | `categorySeo.plumbing` present in `blogTaxonomy.ts`. `/blog/categories/plumbing` live; the hub's "From the Blog" strip live. |
| Keyword data | **None.** |

**This is the whole gap: the tools are done and the writing has barely started.**

### Competitive landscape

Weaker than electrical's, and weak in a specific, exploitable way. Three groups:

- **Thin single-tool sites** — pipe-size and slope calculators with no editorial and, frequently,
  no statement of which code they implement.
- **Supplier and manufacturer content** — accurate on their own product, silent on the code.
- **Contractor blogs** — readable but rarely cite a table, and almost never distinguish IPC
  from UPC.

**The differentiating angle for this category is the same one the calculators already take:
name the rule that governed the answer, and be honest about where the code does not actually
say what everyone claims it says.** Four load-bearing examples, all already used in wave 4 and
all worth repeating:

1. **The 8 ft/s cold and 5 ft/s hot velocity limits are ASPE and manufacturer practice, not IPC
   numbers.** The code requires a system free of noise and erosion without naming a figure.
2. **A water closet floors a building drain at 3 inch regardless of DFU arithmetic** — the
   footnote overrides the table, and this is the most common residential sizing violation.
3. **A taller drainage stack carries MORE per size than a short one** (2 inch: 10 DFU over three
   branch intervals, 24 over more than three). Nearly every competitor implies capacity only falls.
4. **Appendix E is an appendix** — enforceable only where adopted — and Hunter's curve runs high
   for modern low-flow fixtures.

---

## 2. Blog posts — 47 titles in 8 clusters

Format matches the HVAC and electrical strategy docs: filename · title · target keyword ·
calculator it funnels into · tier. **Tier 1 = build first** (highest intent × weakest incumbent
content × has a calculator that already exists). ✅ marks the 14 shipped so far.

Every tier-1 and tier-2 funnel target below **already exists** — there is no calculator blocking
any of them. Verify before writing with
`ls src/pages/calculators/plumbing/`, which is the check that caught a false claim in electrical.

### Cluster 1 — Water supply & pipe sizing (7)
| File | Title | Keyword | Calculator | Tier |
|---|---|---|---|---|
| `what-size-water-line-do-i-need.mdx` ✅ | What Size Water Line Do I Need? Velocity and Pressure, Both | what size water line do i need | pipe-size | 1 |
| `water-pipe-size-chart.mdx` ✅ | Water Pipe Size Chart: GPM and Fixture Units to Nominal Size | water pipe size chart | pipe-size | 1 |
| `plumbing-fixture-units-explained.mdx` ✅ | Fixture Units Explained: WSFU, DFU, and Why They Are Different Numbers | plumbing fixture units | wsfu + dfu | 1 |
| `pex-vs-copper-vs-cpvc.mdx` ✅ | PEX vs Copper vs CPVC: Bore, Cost, and Why PEX Needs a Size Up | pex vs copper | pipe-size | 1 |
| `water-velocity-in-pipes.mdx` | Water Velocity in Pipes: The 8 and 5 ft/s Limits Nobody Can Cite | water velocity in pipes | pipe-velocity | 2 |
| `friction-loss-in-pipes.mdx` | Friction Loss in Water Pipes: Hazen-Williams Without the Nomograph | pipe friction loss | friction-loss | 2 |
| `how-many-fixtures-on-a-3-4-inch-line.mdx` | How Many Fixtures Can a 3/4 Inch Line Serve? | fixtures per pipe size | wsfu | 2 |

### Cluster 2 — Drainage, waste & vent (9)
| File | Title | Keyword | Calculator | Tier |
|---|---|---|---|---|
| `what-size-drain-pipe-do-i-need.mdx` ✅ | What Size Drain Pipe Do I Need? DFU, Tables 710.1, and the Rule That Overrides Them | what size drain pipe | drain-pipe-size | 1 |
| `drain-pipe-slope.mdx` ✅ | Drain Pipe Slope: How Much Fall Does a Drain Actually Need? | drain pipe slope | pipe-slope | 1 |
| `how-far-can-a-vent-be-from-a-trap.mdx` ✅ | How Far Can a Vent Be From a Trap? Trap Arm Limits Explained | how far can a vent be from a trap | vent-size | 1 |
| `drainage-fixture-unit-chart.mdx` ✅ | Drainage Fixture Unit Chart: Table 709.1 With the Trap Sizes | drainage fixture unit chart | dfu | 1 |
| `wet-venting-explained.mdx` ✅ | Wet Venting Explained: When One Drain Legally Vents Another | wet vent | vent-size | 1 |
| `why-is-my-drain-gurgling.mdx` | Why Is My Drain Gurgling? It Is Almost Always the Vent | drain gurgling | vent-size | 2 |
| `air-admittance-valve-vs-vent.mdx` | Air Admittance Valves: Where They Are Legal and Where They Are Not | air admittance valve | vent-size | 2 |
| `stack-vent-vs-vent-stack.mdx` | Stack Vent vs Vent Stack: Two Different Things With One Name | stack vent vs vent stack | vent-size | 3 |
| `building-drain-vs-building-sewer.mdx` | Building Drain vs Building Sewer: Where One Ends and the Other Starts | building drain vs sewer | drain-pipe-size | 3 |

### Cluster 3 — Site, storm & special waste (6)
| File | Title | Keyword | Calculator | Tier |
|---|---|---|---|---|
| `what-size-septic-tank-do-i-need.mdx` | What Size Septic Tank Do I Need? Bedrooms, Soil, and Why Both Matter | what size septic tank | septic-tank | 1 |
| `what-size-grease-trap-do-i-need.mdx` | What Size Grease Trap Do I Need? Two Devices, Two Methods | what size grease trap | grease-trap | 1 |
| `how-much-water-comes-off-a-roof.mdx` | Roof Runoff: How Much Water a Storm Actually Delivers | roof runoff calculation | storm-drainage | 2 |
| `rainwater-harvesting-system-sizing.mdx` | Sizing a Rainwater Harvesting System: The Dry Spell, Not the Roof | rainwater harvesting sizing | rainwater | 2 |
| `perc-test-and-leach-field-sizing.mdx` | Perc Tests and Leach Field Sizing: A 5x Swing From the Ground Alone | perc test leach field | septic-tank | 3 |
| `greywater-system-basics.mdx` | Grey Water Systems: The 24-Hour Rule That Shapes Everything | greywater system | rainwater | 3 |

### Cluster 4 — Pressure, pumps & wells (6)
| File | Title | Keyword | Calculator | Tier |
|---|---|---|---|---|
| `normal-water-pressure-for-a-house.mdx` ✅ | Normal Water Pressure for a House: 40 to 60 psi, and Why Height Costs 4.33 | normal water pressure for a house | water-pressure | 1 |
| `low-water-pressure-in-house.mdx` | Low Water Pressure in a House: Static vs Flowing, and What Each Tells You | low water pressure in house | water-pressure | 1 |
| `what-size-pressure-tank-do-i-need.mdx` | What Size Well Pressure Tank? Drawdown Is a Ratio, Not a Difference | what size pressure tank | well-pressure-tank | 1 |
| `do-i-need-a-pressure-reducing-valve.mdx` | Do I Need a PRV? IPC 604.8 and the Expansion Tank It Drags With It | pressure reducing valve | water-pressure | 2 |
| `well-pump-short-cycling.mdx` | Well Pump Short Cycling: An Over-Charged Tank Looks Exactly Like a Dead One | well pump short cycling | well-pressure-tank | 2 |
| `how-to-calculate-pump-head.mdx` | Total Dynamic Head: Static Lift, Friction, Pressure, and the Term Everyone Drops | total dynamic head | pump-head | 2 |

### Cluster 5 — Water heating (8)
| File | Title | Keyword | Calculator | Tier |
|---|---|---|---|---|
| `what-size-water-heater-do-i-need.mdx` ✅ | What Size Water Heater Do I Need? First-Hour Rating, Not Gallons | what size water heater | water-heater-size | 1 |
| `tankless-water-heater-sizing.mdx` ✅ | Tankless Water Heater Sizing: Temperature Rise Decides Everything | tankless water heater sizing | tankless | 1 |
| `how-much-does-a-water-heater-cost-to-replace.mdx` | Water Heater Replacement Cost: The Upgrades Turn a Swap Into a Project | water heater replacement cost | wh-replacement-cost | 1 |
| `tankless-vs-tank-water-heater.mdx` | Tankless vs Tank: Simultaneity, Not Capacity, Is the Real Difference | tankless vs tank water heater | tankless | 1 |
| `thermal-expansion-tank-sizing.mdx` | Thermal Expansion Tank Sizing: The Pre-Charge Matters More Than the Tank | expansion tank sizing | expansion-tank | 1 |
| `water-heater-temperature-setting.mdx` | Water Heater Temperature: Store at 140, Deliver at 120, and Why | water heater temperature | mixing-valve | 2 |
| `heat-pump-water-heater-sizing.mdx` | Heat Pump Water Heaters: Great Efficiency, Slow Recovery | heat pump water heater sizing | water-heater-size | 2 |
| `mixing-valve-explained.mdx` | Thermostatic Mixing Valves: How Storing Hot Stretches a Tank | thermostatic mixing valve | mixing-valve | 3 |

### Cluster 6 — Volume, wait time & conversions (3)
| File | Title | Keyword | Calculator | Tier |
|---|---|---|---|---|
| `how-long-does-it-take-hot-water-to-reach-the-tap.mdx` ✅ | Why Hot Water Takes So Long — and Why a Bigger Pipe Makes It Worse | hot water takes too long | pipe-volume | 1 |
| `how-many-gallons-in-a-pipe.mdx` | How Many Gallons Are in a Pipe? 0.0408 x Diameter Squared | gallons in a pipe | pipe-volume | 2 |
| `plumbing-unit-conversions.mdx` | Plumbing Unit Conversions: GPM, LPM, PSI, Head — and the Imperial Gallon Trap | gpm to lpm | unit-converter | 3 |

### Cluster 7 — Cost & business (4) — highest commercial value
| File | Title | Keyword | Calculator | Tier |
|---|---|---|---|---|
| `how-much-does-it-cost-to-repipe-a-house.mdx` ✅ | How Much Does It Cost to Repipe a House? The Variable Nobody Quotes | cost to repipe a house | repipe-cost | 1 |
| `how-to-estimate-plumbing-jobs.mdx` | How to Estimate Plumbing Jobs: Markup Is Not Margin | how to estimate plumbing jobs | estimate | 1 |
| `plumber-hourly-rate.mdx` | Plumber Hourly Rate: Utilisation Moves It More Than Wage Does | plumber hourly rate | labor-rate | 1 |
| `plumbing-markup-vs-margin.mdx` | Markup vs Margin for Plumbers: 25% Markup Is a 20% Margin | markup vs margin | estimate | 2 |

### Cluster 8 — Code & compliance evergreen (4)
| File | Title | Keyword | Calculator | Tier |
|---|---|---|---|---|
| `ipc-vs-upc-differences.mdx` | IPC vs UPC: Which Code Applies, and Where They Actually Diverge | ipc vs upc | formulas | 1 |
| `backflow-prevention-explained.mdx` | Backflow Prevention: No Vacuum Breaker Stops Backpressure | backflow preventer types | backflow-prevention | 1 |
| `common-plumbing-code-violations.mdx` | Common Plumbing Code Violations and Why Inspectors Catch Them | plumbing code violations | glossary | 2 |
| `plumbing-permits-and-inspections.mdx` | Plumbing Permits and Inspections: What Needs One and What It Costs | plumbing permit cost | estimate | 3 |

### Tier totals

| Tier | Count | Shipped | Remaining |
|---|---|---|---|
| 1 | 25 | 14 | **11** |
| 2 | 15 | 0 | 15 |
| 3 | 7 | 0 | 7 |
| **Total** | **47** | **14** | **33** |

Verify these totals against the tables with:
`grep -oE '^\| \`[a-z0-9-]+\.mdx\`.*\| [123] \|$' docs/notebooklm/plumbing-content-strategy.md | grep -oE '\| [123] \|$' | sort | uniq -c`
— the electrical doc's own totals line was wrong twice, so check rather than trust.

---

## 3. Wave 5 — the recommended next batch

**The 17 tier-1 posts remaining after wave 4**, in three sub-waves so each is reviewable.
**5a is DONE** — the 11 below are what is left:

**5a — the sizing anchors that pair with wave 4 (6 posts). SHIPPED.**
`water-pipe-size-chart`, `plumbing-fixture-units-explained`, `drainage-fixture-unit-chart`,
`wet-venting-explained`, `pex-vs-copper-vs-cpvc`,
`how-long-does-it-take-hot-water-to-reach-the-tap`. These finished the supply/drainage spine and
filled the Volume & Conversions gap wave 4 deliberately left.

**5b — site, pressure and water heating (7 posts).** `what-size-septic-tank-do-i-need`,
`what-size-grease-trap-do-i-need`, `low-water-pressure-in-house`,
`what-size-pressure-tank-do-i-need`, `thermal-expansion-tank-sizing`,
`tankless-vs-tank-water-heater`, `how-much-does-a-water-heater-cost-to-replace`.

**5c — business and code (4 posts).** `how-to-estimate-plumbing-jobs`, `plumber-hourly-rate`,
`ipc-vs-upc-differences`, `backflow-prevention-explained`. Highest commercial value; the first
two mirror electrical's `$67`-bid estimating cluster.

### Also outstanding, not blog work

- **A leak and water-waste calculator** — what the hub's coming-soon card currently promises.
  Drip rate to gallons per year, running-toilet cost, and flow-rate-based leak detection.
- **The Appendix E verification.** `WSFU_FIXTURES` and `HUNTER_DEMAND` are the category's only
  unverified tier-3 exports. **This is the highest-value non-content fix left in plumbing** —
  it underpins two calculators and Cluster 1 leans on both.
- **A plumbing keyword CSV.** Everything above is reasoned. Measure it.

---

## 4. Per-page requirements (inherited, non-negotiable)

Confirmed by inspection of the 8 wave-4 posts, not from the older strategy docs — the electrical
doc is wrong about hero format.

- **1 mdx + 3 SVG diagram components under `src/components/blog/<topic>/` + 1 hero SVG.**
- **Heroes are `.svg`, not `.webp`.** 1000×500 viewBox, gradient background plus two blurred
  ellipses, left white text card, right graphic, `<rect y="496" height="4" fill="#01AD9F">`
  accent bar. **Plumbing heroes use ORANGE** (`#EA580C` / `#FB923C`) with the teal bar retained —
  the same relationship electrical has with sky.
- Diagrams import `{ C, FONT, markerDefs }` from `../infographicTokens`, render arrows via
  `<defs set:html={defs} />`, and wrap in `BlogInfographic` with `title` + `caption`.
- **Compute every value in the diagram component's own frontmatter from `src/lib/plumbing.ts`.**
  Never transcribe. **Use the lib's `fmt`, never `toFixed`** — `fmt` uses `toLocaleString`
  (half-up) and `toFixed` rounds half-even, and wave 4 shipped a diagram reading 23.61 against a
  calculator reading 23.62 before that was caught.
- Frontmatter: `meta_title` with the year and `| TradesQuote`,
  `image: /images/posts/<slug>-hero.svg`, `categories: ["plumbing"]`, **5 tags**, `draft: false`,
  **no year in the slug**.
- **≥8 FAQ headings** and a **Sources & standards** line naming the IPC tables used and stating
  that the IPC is a model code.
- House style: **bold inline links in body prose or the "Use the Free Calculator" CTA — never a
  "Related Posts" list.** Every new post gets at least one inbound link from an existing post in
  the same session; orphaned posts are treated as a defect.
- Footer text in a diagram: budget ~145 characters at font-size 10 starting at x=24 in a 720-wide
  viewBox. Where a label is drawn at `barX + barWidth + pad`, cap the bar width so the longest
  label still fits.

## 5. Verification recipe

Cheaper than screenshots, and it works when the Browser pane is hidden.

1. `npm run build`; assert each slug has `dist/blog/<slug>/index.html` with **exactly 3
   `<figure>`** and a hero reference.
2. Extract every `](/...)` from the new mdx. Resolve blog links against `dist`, but
   **calculator links against `src/pages`** — calculators are SSR and never appear in `dist`.
3. In-browser `getBBox()` sweep: fetch each post, `DOMParser` it, clone each `figure svg` into an
   offscreen 720 px div, and compare every `text/rect/circle/line/path` bbox against the parsed
   viewBox.
4. Assert every numeric anchor in the prose also appears in the rendered `figure svg text`. This
   is what caught the `fmt`/`toFixed` drift.
5. Consistency sweep: 5 tags, ≥8 FAQ headings, sources line, `draft:false`, correct category,
   no year in slug, ≥1 inbound link, no self-links.
6. Mobile 375 px: `scrollWidth === clientWidth === 375`, wide tables inside `overflow-x-auto`.

## 6. Authorities to cite

- **IPC 2021** — Chapter 6 (water supply), Chapter 7 (sanitary drainage), Chapter 9 (vents),
  Chapter 11 (storm drainage), Chapter 13 (nonpotable water), Appendix E (water pipe sizing,
  enforceable only where adopted).
- **IAPMO / UPC** — named wherever it diverges, which is most of Chapter 7.
- **ASPE** — velocity design limits and the Hunter's-curve demand method.
- **ASTM** — B88 (copper), F876 (PEX), D1785 (Schedule 40) for pipe dimensions.
- **US DOE** — first-hour-rating worksheet values.
- **PDI-G101** — grease interceptor rating (2 lb per gpm, exactly).
- **IPSDC / state health departments** — septic; not IPC territory.
- **NFPA 70E is not relevant here**; the plumbing analogue for scope limits is the AHJ.

## 7. Deliberate hedges to preserve — do not tighten these

Carried from the calculators into the posts. Each one is a place where being accurate means
being less definite than competitors are.

- **Velocity limits are ASPE/manufacturer practice, not an IPC number.**
- **Appendix E is an appendix** and Hunter runs high on low-flow fixtures — error is toward
  larger pipe.
- **Table 906.1 (vent stacks) is not reproduced** anywhere; posts hand multi-storey vent stacks
  back to the code.
- **Storm drainage publishes the FLOW, not the code size** — Tables 1106.2/1106.3 govern.
- **Septic is not IPC territory** and varies more than anything else in plumbing.
- **Grease meal-count factors are tier 3** and every one is an editable input.
- **Nonpotable reuse publishes no jurisdiction table** — the same call as `nec-adoption-by-state`.
- **AAV acceptance varies**; never present one as universally legal.
