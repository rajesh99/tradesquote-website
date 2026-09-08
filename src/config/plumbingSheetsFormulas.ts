/**
 * The plumbing formulas you would write DIFFERENTLY because you are in Google
 * Sheets, as data.
 *
 * The sibling module `plumbingExcelFormulas.ts` covers the arithmetic, and all
 * of it pastes into Sheets unchanged — so restating it here would be ~27
 * character-identical cards. This module is the other thing: the builds that
 * exist because Sheets has `ARRAYFORMULA`, `QUERY`, `IMPORTRANGE`, `SPARKLINE`
 * and a named-function dialog, and Excel does not.
 *
 * It imports the Excel config for `tsv`, `PasteTable`, the compact all-formula
 * reference table and the derived counts. It shares ZERO formula strings with
 * it — that separation is what stops this page being a duplicate.
 *
 * Every numeric constant inside a `sheets`, `definition` or `excelEquivalent`
 * string is interpolated from `@/lib/plumbing`, never typed by hand, so a
 * formula a reader pastes cannot disagree with the calculator it came from.
 */

import {
  // constants — interpolated into the formula strings below, never typed by hand
  VELOCITY_CONSTANT,
  PSI_PER_FOOT_HEAD,
  FEET_HEAD_PER_PSI,
  MAX_VELOCITY_COLD,
  MAX_VELOCITY_HOT,
  MIN_VENT_SIZE,
  VENT_LENGTH_UPSIZE_FEET,
  VENT_SIZES,
  MIN_BUILDING_DRAIN_WITH_WC,
  MIN_SLOPE_IN_PER_FT,
  PRV_THRESHOLD_PSI,
  HAZEN_WILLIAMS_C,
  PIPE_DIMENSIONS,
  PIPE_MATERIAL_LABELS,
  WSFU_FIXTURES,
  DFU_FIXTURES,
  HUNTER_DEMAND,
  TABLE_710_1_1,
  // functions — every worked result on this page is their real output
  fmt,
  usd,
  sizeLabel,
  insideDiameter,
  velocity,
  frictionLossPsiPer100Ft,
  availableFrictionPsi,
  allowableLossPer100Ft,
  sizeSupplyPipe,
  wsfuToGpm,
  totalWsfu,
  totalDfu,
  minDrainSizeApplied,
  drainCapacity,
  minSlope,
  slopeToPercent,
  ventSize,
  velocityHead,
  psiToHead,
  totalDynamicHead,
  estimateJob,
  labourRate,
  type PipeMaterial,
} from "@/lib/plumbing";

import {
  sections as excelSections,
  tables as excelTables,
  tsv,
  totalCount,
  type PasteTable,
} from "@/config/plumbingExcelFormulas";

export { tsv, type PasteTable };

/* ------------------------------------------------------------------ *
 * Worked examples.
 *
 * One house, carried through every section, so a reader can follow a single
 * building from its fixture schedule to its drain size to its price. The
 * fixture counts are a two-bath single-family; the pressure and pricing
 * inputs are copied VERBATIM from the matching calculators' own defaults so
 * a reader who works an example here and then opens the tool sees the same
 * number.
 * ------------------------------------------------------------------ */

/** Keyed to `WSFU_FIXTURES` — the supply side of the schedule. */
const HOUSE_WSFU_COUNTS: Record<string, number> = {
  "wc-private-tank": 2,
  "lavatory-private": 3,
  "bathtub-private": 1,
  "shower-private": 1,
  "kitchen-sink-private": 1,
  "dishwasher-private": 1,
  "clothes-washer-private": 1,
  "hose-bibb": 2,
};

/**
 * Keyed to `DFU_FIXTURES` — the SAME house on the drainage side, and
 * deliberately not the same keys. IPC Table 709.1 and Appendix E table their
 * fixtures differently, which is the trap this page's second build is about.
 */
const HOUSE_DFU_COUNTS: Record<string, number> = {
  "wc-private-16": 2,
  lavatory: 3,
  bathtub: 1,
  "shower-57": 1,
  "kitchen-sink": 1,
  dishwasher: 1,
  "clothes-washer-res": 1,
};

/**
 * The two IPC tables name the same fixture differently, and the schedule builds
 * join on the LABEL because that is the only column Table 709.1 ships. Pull the
 * labels out of the library rather than typing them, and MEASURE the overlap —
 * the size of that overlap is the whole point of the two-tables build, so it
 * must not be a number a later edit to the tables can falsify.
 */
const label = <T extends { key: string; label: string }>(rows: T[], key: string) =>
  rows.find((r) => r.key === key)?.label ?? key;

const WSFU_WC = label(WSFU_FIXTURES, "wc-private-tank");
const WSFU_LAV = label(WSFU_FIXTURES, "lavatory-private");
const DFU_WC = label(DFU_FIXTURES, "wc-private-16");
const DFU_LAV = label(DFU_FIXTURES, "lavatory");

const WSFU_LABEL_SET = new Set(WSFU_FIXTURES.map((f) => f.label));
const SHARED_LABEL_LIST = DFU_FIXTURES.filter((f) => WSFU_LABEL_SET.has(f.label)).map((f) => f.label);
const SHARED_LABELS = SHARED_LABEL_LIST.length;
const SHARED_LABEL_NAME = SHARED_LABELS === 1 ? SHARED_LABEL_LIST[0] : "";

const HOUSE_ROWS = Object.keys(HOUSE_WSFU_COUNTS).length;
const HOUSE_WSFU = totalWsfu(HOUSE_WSFU_COUNTS);
const HOUSE_GPM = wsfuToGpm(HOUSE_WSFU, "tank");
const HOUSE_GPM_VALVE = wsfuToGpm(HOUSE_WSFU, "valve");
const HOUSE_DFU = totalDfu(HOUSE_DFU_COUNTS);
const HOUSE_DRAIN = minDrainSizeApplied(HOUSE_DFU, "building-drain", 0.25, true);
const HOUSE_DRAIN_TABLE_CAP = drainCapacity(HOUSE_DRAIN.fromTable ?? 2, "building-drain", 0.25);

/* Supply pressure and sizing — the water-line calculator's own defaults. */
const AVAIL = availableFrictionPsi({
  supplyPsi: 60,
  highestFixtureFeet: 20,
  fixtureRequiredPsi: 15,
  meterLossPsi: 8,
  otherLossPsi: 0,
});
const DEV_FEET = 120;
const BUDGET = allowableLossPer100Ft(AVAIL, DEV_FEET);
const SIZED = sizeSupplyPipe({
  gpm: HOUSE_GPM,
  material: "copper-l",
  developedFeet: DEV_FEET,
  availablePsi: AVAIL,
  maxVelocity: MAX_VELOCITY_COLD,
});

/* One branch off that main, for the per-row columns. */
const BRANCH_GPM = 12;
const BRANCH_SIZE = 0.75;
const BRANCH_BORE = insideDiameter("copper-l", BRANCH_SIZE) as number;
const C_COPPER = HAZEN_WILLIAMS_C["copper-l"];
const BRANCH_VEL = velocity(BRANCH_GPM, BRANCH_BORE);
const BRANCH_LOSS = frictionLossPsiPer100Ft(BRANCH_GPM, BRANCH_BORE, C_COPPER);
const PEX_BORE = insideDiameter("pex", BRANCH_SIZE) as number;
const PEX_VEL = velocity(BRANCH_GPM, PEX_BORE);

/* Drainage, vent and pump examples. */
const RUN_SIZE = 2;
const RUN_SLOPE = minSlope(RUN_SIZE);
const VENT_45 = ventSize(3, 45);
const VENT_30 = ventSize(3, 30);
const PUMP_BORE = insideDiameter("pvc-40", 1.5) as number;
const PUMP_VEL = velocity(30, PUMP_BORE);
const PUMP_FRICTION_100 = frictionLossPsiPer100Ft(30, PUMP_BORE, HAZEN_WILLIAMS_C["pvc-40"]);
const PUMP_TDH = totalDynamicHead({
  staticLiftFeet: 12,
  frictionHeadFeet: psiToHead((PUMP_FRICTION_100 / 100) * 40),
  pressureHeadFeet: 0,
  velocityHeadFeet: velocityHead(PUMP_VEL),
});

/* Pricing — the estimate and labour-rate calculators' own defaults. */
const ESTIMATE = estimateJob({
  labourHours: 10,
  labourRate: 110,
  fixtureCost: 850,
  materialCost: 450,
  overheadPercent: 15,
  marginPercent: 25,
});
const LABOUR = labourRate({
  wage: 38,
  burdenPercent: 32,
  overheadPerTech: 11000,
  billableHours: 1560,
  marginPercent: 40,
});

/* Table extents, so a range in a formula string can never drift from the
   table the reader actually pasted. */
const HUNTER_ROWS = HUNTER_DEMAND.length;
const HUNTER_LAST = HUNTER_ROWS + 1;
const DRAIN_ROWS = TABLE_710_1_1.length;
const DRAIN_LAST = DRAIN_ROWS + 1;
const VENT_LAST = VENT_SIZES.length + 1;
const SLOPE_BREAKS = MIN_SLOPE_IN_PER_FT.filter((r) => Number.isFinite(r.maxSize));
const SLOPE_LAST = MIN_SLOPE_IN_PER_FT[MIN_SLOPE_IN_PER_FT.length - 1].slope;

/** The four slope columns of Table 710.1(1), in the order the paste table has them. */
const SLOPE_KEYS = ["0.0625", "0.125", "0.25", "0.5"] as const;

/* ------------------------------------------------------------------ *
 * Data model
 *
 * `sheets`, `definition` and `excelEquivalent` are DATA STRINGS, and that is
 * what makes them safe: a spreadsheet formula is full of `<` and `<=`, and a
 * bare `<` in the TEMPLATE half of an .astro file is parsed as a tag opener
 * and fails the build. Keeping them here means they can never reach markup.
 *
 * For the same reason these strings must never contain an HTML entity —
 * Sheets' concatenation operator is written as a plain `&`, exactly as
 * Excel's is.
 * ------------------------------------------------------------------ */

export type SheetsBuild = {
  name: string;
  /** Which Sheets capability earns this a place on the page. */
  capability: "arrayformula" | "query" | "lookup" | "text" | "visual" | "validation" | "import";
  /** One line naming what Excel makes you do instead. The page's thesis, per card. */
  insteadOfExcel: string;
  /** Where the ONE formula goes. Column-shaped, not cell-shaped. */
  placement: { tab: string; cell: string; governs: string };
  columns: { ref: string; header: string; example: string }[];
  /** Paste-ready, US locale. */
  sheets: string;
  /** Computed by calling the library — never typed by hand. */
  result: string;
  notes: string;
  excelEquivalent?: string;
  usesTable?: string;
  calc?: { href: string; label: string };
};

export type SheetsSection = { title: string; color: string; blurb: string; builds: SheetsBuild[] };

/** Shaped like the fields of the actual `Data > Named functions` dialog. */
export type NamedFunction = {
  name: string;
  /** The dialog's "Function description". */
  description: string;
  /** The dialog's "Argument placeholders", with a description each. */
  args: { name: string; description: string; example: string }[];
  /** The dialog's "Formula definition". */
  definition: string;
  result: string;
  notes: string;
  needsTable?: string;
  calc?: { href: string; label: string };
};

/**
 * Function-name availability, checked against Google's published function list
 * rather than reasoned about. `excel` means Excel has a function of THAT NAME;
 * where an equivalent ships under a different name the note says so, because
 * a bare tick would otherwise overstate the gap.
 */
export type ParityRow = { fn: string; sheets: boolean; excel: boolean; note: string };

export const parity: ParityRow[] = [
  {
    fn: "ARRAYFORMULA",
    sheets: true,
    excel: false,
    note: "The whole reason this page exists. Excel's nearest equivalent is a Table column formula, which still writes a copy into every row.",
  },
  {
    fn: "QUERY",
    sheets: true,
    excel: false,
    note: "SQL over a range. Excel needs a PivotTable, which does not refresh when you add a row, or the 365-only GROUPBY.",
  },
  {
    fn: "IMPORTRANGE",
    sheets: true,
    excel: false,
    note: "Live pull from another spreadsheet. Excel links to a workbook path or a Power Query connection instead.",
  },
  {
    fn: "SPARKLINE",
    sheets: true,
    excel: false,
    note: "An inline chart in a cell. Excel's sparklines are a chart object, not a function, so they cannot be driven by a formula.",
  },
  {
    fn: "REGEXEXTRACT / REGEXMATCH / REGEXREPLACE",
    sheets: true,
    excel: false,
    note: "No regex functions in Excel at all without VBA. This is the biggest single capability gap in Sheets' favour.",
  },
  {
    fn: "SPLIT",
    sheets: true,
    excel: false,
    note: "Excel 365 does the same job under the name TEXTSPLIT. Pre-365 Excel has neither.",
  },
  {
    fn: "SORTN",
    sheets: true,
    excel: false,
    note: "Top-n in one call. Excel 365 composes it as TAKE(SORT(...)).",
  },
  {
    fn: "Named functions",
    sheets: true,
    excel: true,
    note: "Both can do it — Sheets under Data > Named functions, Excel 365 by naming a LAMBDA in Name Manager. Only Sheets gives each argument a description and can Import a function from another file.",
  },
  { fn: "XLOOKUP", sheets: true, excel: true, note: "Full parity, match_mode and search_mode included. Excel needs 365 or 2021." },
  { fn: "LAMBDA", sheets: true, excel: true, note: "Both. Excel needs 365." },
  { fn: "MAP / REDUCE / SCAN / BYROW / BYCOL / MAKEARRAY", sheets: true, excel: true, note: "Both. Reach for these the moment per-row logic branches and ARRAYFORMULA stops vectorising." },
  { fn: "LET", sheets: true, excel: true, note: "Both. What makes a long build readable instead of a helper-cell chain." },
  { fn: "FILTER / SEQUENCE", sheets: true, excel: true, note: "Both. Excel needs 365." },
  { fn: "TOCOL / TOROW / WRAPROWS", sheets: true, excel: true, note: "Both." },
  { fn: "VSTACK / HSTACK", sheets: true, excel: true, note: "Both. In Sheets the older { } array-literal form does the same thing." },
  { fn: "CHOOSECOLS / CHOOSEROWS", sheets: true, excel: true, note: "Both. Handy for picking a slope column out of a pasted code table." },
  { fn: "TEXTJOIN", sheets: true, excel: true, note: "Both, back to Excel 2019." },
  {
    fn: "XMATCH",
    sheets: false,
    excel: true,
    note: "Not in Sheets. Plain MATCH covers it — match_type 1 for a curve you read between anchors, 0 for a listed size.",
  },
  {
    fn: "TEXTBEFORE / TEXTAFTER",
    sheets: false,
    excel: true,
    note: "Not in Sheets. Use SPLIT with INDEX, or REGEXEXTRACT, which is more powerful but less readable.",
  },
  {
    fn: "TEXTSPLIT",
    sheets: false,
    excel: true,
    note: "Not in Sheets under that name. SPLIT is the equivalent and takes a set of delimiters rather than one.",
  },
  {
    fn: "GROUPBY / PIVOTBY",
    sheets: false,
    excel: true,
    note: "Not in Sheets, and not missed — QUERY did this a decade earlier and reads better.",
  },
];

/* ------------------------------------------------------------------ *
 * The builds
 * ------------------------------------------------------------------ */

export const sheetsSections: SheetsSection[] = [
  {
    title: "Build the Schedule, Not the Cell",
    color: "blue",
    blurb:
      "This is the whole difference. In Excel you write a formula and fill it down, and from that moment the sheet has as many copies of your logic as it has rows — any one of which somebody can overtype without leaving a mark. In Sheets one formula in the header row governs the entire column below it, including rows that do not exist yet. There is one copy of the logic, in one cell, and adding a fixture to the schedule cannot break it.",
    builds: [
      {
        name: "Fixture Schedule → WSFU on Every Row",
        capability: "arrayformula",
        insteadOfExcel: `Fill ${HOUSE_ROWS} rows down, then fill them again every time the schedule grows`,
        placement: { tab: "Schedule", cell: "D2", governs: "D2:D — every row, now and later" },
        columns: [
          { ref: "A", header: "Room or branch", example: "Hall bath" },
          { ref: "B", header: "Fixture, from a dropdown", example: WSFU_LAV },
          { ref: "C", header: "Count", example: "3" },
          { ref: "D", header: "WSFU — the one formula", example: "→" },
        ],
        usesTable: "WSFU fixture schedule",
        sheets: `=ARRAYFORMULA(IF(B2:B="",,C2:C*IFERROR(XLOOKUP(B2:B,WSFU!$B$2:$B,WSFU!$E$2:$E),0)))`,
        excelEquivalent: `=C2*IFERROR(XLOOKUP(B2,WSFU!$B:$B,WSFU!$E:$E),0)      then fill down, forever`,
        result: `${HOUSE_ROWS} fixture rows → ${fmt(HOUSE_WSFU, 1)} WSFU total → ${fmt(HOUSE_GPM, 2)} gpm peak demand on flush tanks, ${fmt(HOUSE_GPM_VALVE, 2)} gpm on flushometer valves`,
        notes: `The \`IF(B2:B="",,…)\` wrapper is what keeps the column clean — the double comma returns a genuinely blank cell rather than a zero or an empty string, so \`SUM(D2:D)\` and \`QUERY\` both behave. This is the one XLOOKUP shape that vectorises reliably: a vertical search key against a SINGLE-column return range. Give it a multi-column return range and it quietly hands back only the first column, which is the most common way an ARRAYFORMULA build goes wrong. Join on the fixture **label** in column B of the WSFU tab rather than the internal key in column A, because a dropdown then guarantees the spelling and the sheet stays readable to whoever inherits it. Note the totals column is the code's own, not cold plus hot — IPC assigns a fixture's total weight rather than adding the two, and a sheet that adds them overstates the load.`,
        calc: {
          href: "/calculators/plumbing/plumbing-water-supply-fixture-unit-calculator",
          label: "Water Supply Fixture Unit Calculator",
        },
      },
      {
        name: "One Schedule, Two Code Tables That Disagree",
        capability: "lookup",
        insteadOfExcel: "The same mismatch, but hidden across 40 filled-down cells instead of sitting in 2",
        placement: { tab: "Schedule", cell: "F2", governs: "F2:F alongside the WSFU column" },
        columns: [
          { ref: "B", header: "Supply fixture, from the WSFU tab", example: WSFU_WC },
          { ref: "E", header: "Drainage fixture — a SECOND column, from the DFU tab", example: DFU_WC },
          { ref: "F", header: "DFU — the one formula", example: "→" },
        ],
        usesTable: "Fixture drainage units — IPC Table 709.1",
        sheets: `=ARRAYFORMULA(IF(E2:E="",,C2:C*IFERROR(XLOOKUP(E2:E,DFU!$A$2:$A,DFU!$B$2:$B),0)))`,
        result: `The same house: ${fmt(HOUSE_WSFU, 1)} WSFU on the supply side, ${fmt(HOUSE_DFU, 0)} DFU on the drainage side, from ${Object.keys(HOUSE_DFU_COUNTS).length} drainage rows`,
        notes: `**The two IPC tables do not name the same fixture the same way, and this is the quietest way a plumbing spreadsheet goes wrong.** Exactly ${SHARED_LABELS} of the ${DFU_FIXTURES.length} fixtures in Table 709.1 is spelled identically in the ${WSFU_FIXTURES.length}-row supply table${SHARED_LABEL_NAME ? ` — "${SHARED_LABEL_NAME}"` : ""}. A water closet is "${WSFU_WC}" on the supply side, because what matters is how it is flushed; the same fixture is "${DFU_WC}" on the drainage side, because what matters is how much it discharges. So one fixture column cannot drive both lookups — and \`IFERROR(…,0)\` will cheerfully contribute **zero DFU** for every row named the supply way, giving you a total that looks plausible and is not. Two fixture columns, or an explicit mapping tab, and never one. While you are building, wrap with \`IFNA\` instead of \`IFERROR\` so the misses show up as errors rather than as zeros.`,
        calc: {
          href: "/calculators/plumbing/plumbing-drainage-fixture-unit-calculator",
          label: "Drainage Fixture Unit Calculator",
        },
      },
      {
        name: "Bore, Velocity and Friction Across the Whole Branch Schedule",
        capability: "arrayformula",
        insteadOfExcel: "Three formulas per branch, filled down — so 40 branches carry 120 copies of the same three ideas",
        placement: { tab: "Branches", cell: "E2, F2, G2", governs: "three columns, each from one cell" },
        columns: [
          { ref: "A", header: "Branch", example: "Riser 1 — 2nd floor" },
          { ref: "B", header: "Design gpm", example: String(BRANCH_GPM) },
          { ref: "C", header: "Material key", example: "copper-l" },
          { ref: "D", header: "Nominal size", example: String(BRANCH_SIZE) },
          { ref: "E", header: "Bore, inches", example: "→" },
          { ref: "F", header: "Velocity, ft/s", example: "→" },
          { ref: "G", header: "psi per 100 ft", example: "→" },
        ],
        usesTable: "Pipe dimensions and C factors",
        sheets: `=ARRAYFORMULA(IF(D2:D="",,IFERROR(XLOOKUP(C2:C&"|"&D2:D,Pipe!$A$2:$A&"|"&Pipe!$C$2:$C,Pipe!$F$2:$F),"not stocked")))
=ARRAYFORMULA(IF(E2:E="",,${VELOCITY_CONSTANT}*B2:B/E2:E^2))
=ARRAYFORMULA(IF(E2:E="",,4.52*B2:B^1.852/(XLOOKUP(C2:C,Pipe!$A$2:$A,Pipe!$G$2:$G)^1.852*E2:E^4.8704)*100))`,
        result: `${BRANCH_GPM} gpm through ${sizeLabel(BRANCH_SIZE)} Type L copper: bore ${fmt(BRANCH_BORE, 3)} in → ${fmt(BRANCH_VEL, 2)} ft/s → ${fmt(BRANCH_LOSS, 2)} psi per 100 ft. The same flow through ${sizeLabel(BRANCH_SIZE)} PEX (bore ${fmt(PEX_BORE, 3)} in) runs at ${fmt(PEX_VEL, 2)} ft/s`,
        notes: `Three columns, three cells, because a multi-column \`XLOOKUP\` return does not vectorise — asking for bore and C factor in one call gets you bore twice. The \`C2:C&"|"&D2:D\` trick builds a composite key elementwise inside the ARRAYFORMULA, which is how you look up on two columns without a helper column. **Bore, never nominal.** The velocity term squares it, so the ${fmt(((BRANCH_BORE - PEX_BORE) / PEX_BORE) * 100, 0)}% bore difference between ${sizeLabel(BRANCH_SIZE)} copper and ${sizeLabel(BRANCH_SIZE)} PEX becomes a ${fmt(((PEX_VEL - BRANCH_VEL) / BRANCH_VEL) * 100, 0)}% difference in velocity, which is the difference between passing and failing the ${MAX_VELOCITY_COLD} ft/s cold ceiling. Those ceilings — ${MAX_VELOCITY_COLD} ft/s cold, ${MAX_VELOCITY_HOT} ft/s hot — are ASPE and tube-manufacturer practice, not IPC figures.`,
        calc: {
          href: "/calculators/plumbing/plumbing-pipe-velocity-calculator",
          label: "Pipe Velocity Calculator",
        },
      },
      {
        name: "Smallest Pipe That Passes Both Tests",
        capability: "lookup",
        insteadOfExcel: "An array-entered INDEX/MATCH(TRUE,…) that nobody who inherits the sheet will understand",
        placement: { tab: "Branches", cell: "H2", governs: "one cell per branch, or wrap in MAP for the column" },
        columns: [
          { ref: "B", header: "Design gpm", example: fmt(HOUSE_GPM, 2) },
          { ref: "C", header: "Material key", example: "copper-l" },
          { ref: "I", header: "Friction budget, psi/100 ft", example: fmt(BUDGET, 2) },
        ],
        usesTable: "Pipe dimensions and C factors",
        sheets: `=LET(m,$C2, q,$B2, budget,$I2,
  sizes, FILTER(Pipe!$C$2:$C,Pipe!$A$2:$A=m),
  bores, FILTER(Pipe!$F$2:$F,Pipe!$A$2:$A=m),
  cfac,  FILTER(Pipe!$G$2:$G,Pipe!$A$2:$A=m),
  vel,   ${VELOCITY_CONSTANT}*q/bores^2,
  loss,  4.52*q^1.852/(cfac^1.852*bores^4.8704)*100,
  pass,  FILTER(sizes,(vel<=Limits!$B$2)*(loss<=budget)),
  IFERROR(INDEX(pass,1),"nothing listed passes"))`,
        excelEquivalent: `=INDEX(sizes,MATCH(TRUE,INDEX((vel<=8)*(loss<=budget),0),0))     array-entered, pre-365`,
        result: `${fmt(HOUSE_GPM, 2)} gpm, Type L copper, ${DEV_FEET} ft developed length, ${fmt(AVAIL, 1)} psi available → budget ${fmt(BUDGET, 2)} psi/100 ft → ${SIZED.size === null ? "no listed size passes" : sizeLabel(SIZED.size)} at ${fmt(SIZED.velocity, 2)} ft/s and ${fmt(SIZED.lossPer100, 2)} psi/100 ft, governed by ${SIZED.governedBy}`,
        notes: `Sizing a water line is genuinely iterative — you guess a size, test it against both the velocity ceiling and the friction budget, and go again. This does the whole sweep in one cell: \`FILTER\` pulls the sizes stocked in that material, the two arithmetic lines compute velocity and loss for **all** of them at once, and multiplying the two comparisons is a logical AND across the arrays. \`INDEX(pass,1)\` takes the smallest because the pipe table is sorted ascending. Which of the two rules governs is worth surfacing — here it is ${SIZED.governedBy}, and on a long run with low static it is nearly always friction, which is why sizing on velocity alone quietly under-sizes long branches.`,
        calc: {
          href: "/calculators/plumbing/plumbing-pipe-size-calculator",
          label: "Pipe Size Calculator",
        },
      },
      {
        name: "Drain Size With the Water-Closet Floor, Applied to Every Row",
        capability: "arrayformula",
        insteadOfExcel: "The most commonly omitted line in every plumbing sheet on the internet, omitted once per row",
        placement: { tab: "Schedule", cell: "H2", governs: "H2:H" },
        columns: [
          { ref: "F", header: "DFU on the run", example: fmt(HOUSE_DFU, 0) },
          { ref: "G", header: "Serves a water closet?", example: "TRUE" },
          { ref: "H", header: "Minimum size — the one formula", example: "→" },
        ],
        usesTable: "Building drain capacity — IPC Table 710.1(1)",
        sheets: `=ARRAYFORMULA(IF(F2:F="",,LET(
  t, IFERROR(XLOOKUP(F2:F,Drain!$D$2:$D$${DRAIN_LAST},Drain!$A$2:$A$${DRAIN_LAST},"over table",1),"over table"),
  IF((G2:G=TRUE)*(t<${MIN_BUILDING_DRAIN_WITH_WC}),${MIN_BUILDING_DRAIN_WITH_WC},t))))`,
        result: `${fmt(HOUSE_DFU, 0)} DFU at 1/4 in per ft: the table alone says ${HOUSE_DRAIN.fromTable === null ? "over table" : sizeLabel(HOUSE_DRAIN.fromTable)} (capacity ${HOUSE_DRAIN_TABLE_CAP === null ? "—" : fmt(HOUSE_DRAIN_TABLE_CAP, 0)} DFU), but the run serves a water closet, so the answer is ${HOUSE_DRAIN.size === null ? "—" : sizeLabel(HOUSE_DRAIN.size)} — governed by ${HOUSE_DRAIN.governedBy === "water-closet" ? "the water-closet floor, not the table" : "the table"}`,
        notes: `**Do not reach for \`MAX\` here.** Inside an ARRAYFORMULA, \`MAX\` aggregates the entire array down to one number, so \`MAX(${MIN_BUILDING_DRAIN_WITH_WC},t)\` returns the largest drain in the whole schedule and writes it into every row. The elementwise form is \`IF(t<${MIN_BUILDING_DRAIN_WITH_WC},${MIN_BUILDING_DRAIN_WITH_WC},t)\`. This is the single most useful behaviour to internalise about array formulas: anything that *reduces* — MAX, MIN, SUM, COUNT — collapses the array instead of walking it. The rule being applied is that no building drain serving a water closet may be smaller than ${MIN_BUILDING_DRAIN_WITH_WC} in regardless of what the DFU table permits, and the \`,1\` on the XLOOKUP is match_mode "exact or next larger", which is what a capacity lookup always wants.`,
        calc: {
          href: "/calculators/plumbing/plumbing-drain-pipe-size-calculator",
          label: "Drain Pipe Size Calculator",
        },
      },
    ],
  },

  {
    title: "Roll It Up Without a Pivot Table",
    color: "emerald",
    blurb:
      "A fixture schedule is only half the job — you need the load reaching each branch, riser and floor, and you need it to be right after somebody adds a bathroom. Excel's answer is a PivotTable, which is a snapshot: it does not refresh when a row appears, and half the sheets in the trade are quietly reporting last week's totals. QUERY is a formula, so it cannot be stale.",
    builds: [
      {
        name: "DFU Total by Branch, Floor or Riser",
        capability: "query",
        insteadOfExcel: "A PivotTable that silently does not include the row you just added",
        placement: { tab: "Rollup", cell: "A1", governs: "spills as far as the groups go" },
        columns: [
          { ref: "Schedule!A", header: "Branch or floor", example: "Riser 1 — 2nd floor" },
          { ref: "Schedule!F", header: "DFU per row", example: "6" },
        ],
        sheets: `=QUERY(Schedule!A2:F,"select A, sum(F) where A is not null group by A order by sum(F) desc label A 'Branch', sum(F) 'DFU'",0)`,
        result: `The example house rolls up to ${fmt(HOUSE_DFU, 0)} DFU total, and each branch's subtotal updates the moment a fixture row is added`,
        notes: `The trailing \`0\` says the range has no header row, which is why the range starts at row 2 and the \`label\` clause supplies the headings instead. \`where A is not null\` is what keeps the thousands of empty rows below your data out of the result. **The trap worth knowing:** QUERY infers one data type per column and nulls out the minority — so a column holding both \`3\` and \`1-1/2"\` will silently drop one or the other. Keep sizes numeric in the schedule and render the fraction for display elsewhere, or wrap the column in \`TO_TEXT\` before it reaches QUERY.`,
        calc: {
          href: "/calculators/plumbing/plumbing-drainage-fixture-unit-calculator",
          label: "Drainage Fixture Unit Calculator",
        },
      },
      {
        name: "Riser Load Straight Into Peak Demand",
        capability: "query",
        insteadOfExcel: "A pivot, then a second table beside it, then a lookup per row to convert it",
        placement: { tab: "Rollup", cell: "D1", governs: "two columns, spilling" },
        columns: [
          { ref: "Schedule!A", header: "Riser", example: "Riser 1" },
          { ref: "Schedule!D", header: "WSFU per row", example: "2.2" },
        ],
        usesTable: "Hunter's curve — WSFU to GPM",
        sheets: `=LET(t, QUERY(Schedule!A2:D,"select A, sum(D) where A is not null group by A",0),
  HSTACK(t, MAP(CHOOSECOLS(t,2), LAMBDA(fu, WSFU_TO_GPM(fu,"tank")))))`,
        result: `${fmt(HOUSE_WSFU, 1)} WSFU on the whole house → ${fmt(HOUSE_GPM, 2)} gpm, and every riser's own gpm appears beside its WSFU without a single helper cell`,
        notes: `This is the composition that has no Excel equivalent worth writing: a \`QUERY\` result piped through \`MAP\` into a **named function you defined yourself**, all in one cell. \`CHOOSECOLS(t,2)\` pulls the summed column out of the query result, \`MAP\` walks it, and \`HSTACK\` puts the two side by side. \`MAP\` rather than \`ARRAYFORMULA\` because \`WSFU_TO_GPM\` interpolates between anchors and branches internally — exactly the case where ARRAYFORMULA stops vectorising and starts returning the first row's answer for everything. Define \`WSFU_TO_GPM\` first; the named-function section below has it.`,
        calc: {
          href: "/calculators/plumbing/plumbing-water-supply-fixture-unit-calculator",
          label: "Water Supply Fixture Unit Calculator",
        },
      },
      {
        name: "Trap Sizes for the Take-Off",
        capability: "query",
        insteadOfExcel: "Sorting a copy of the schedule by hand and counting the blocks",
        placement: { tab: "Rollup", cell: "G1", governs: "two columns, spilling" },
        columns: [
          { ref: "Schedule!E", header: "Drainage fixture", example: DFU_LAV },
          { ref: "Schedule!C", header: "Count", example: "3" },
        ],
        usesTable: "Fixture drainage units — IPC Table 709.1",
        sheets: `=QUERY({ARRAYFORMULA(IFERROR(XLOOKUP(Schedule!E2:E,DFU!$A$2:$A,DFU!$C$2:$C),"")),Schedule!C2:C},
  "select Col1, sum(Col2) where Col1 is not null group by Col1 order by Col1 label Col1 'Trap size', sum(Col2) 'Traps'",0)`,
        result: `The example house needs traps at ${[
          ...new Set(
            Object.keys(HOUSE_DFU_COUNTS)
              .map((k) => DFU_FIXTURES.find((f) => f.key === k)?.trap)
              .filter((t): t is number => typeof t === "number"),
          ),
        ]
          .sort((a, b) => a - b)
          .map((t) => sizeLabel(t))
          .join(", ")} — the water closets trap themselves and correctly return nothing`,
        notes: `The \`{ }\` braces build a two-column array on the fly out of a computed column and a real one, which is how you QUERY over something that does not exist in the sheet. Column names become \`Col1\`, \`Col2\` once you do that, not \`A\` and \`B\`. Water closets and bathroom groups have no trap-size entry because they are integral-trap fixtures, so they come back blank and \`where Col1 is not null\` drops them — which is the right answer, not a bug to patch. **Locale note:** inside \`{ }\` the column separator is a comma in a US-format sheet and a backslash in a comma-decimal one.`,
      },
    ],
  },

  {
    title: "Parse What the Field Actually Types",
    color: "rose",
    blurb:
      "Nobody in a van types 1.5. They type 1-1/2\", or 1 1/2, or 1½, and the sheet has to cope. This is the one area where Sheets and Excel genuinely trade blows: Excel 365 has TEXTBEFORE, TEXTAFTER and TEXTSPLIT, which read beautifully for a fixed-shape split and which Sheets does not have at all. Sheets has SPLIT and the REGEX family, which Excel does not have at all, and which will handle input Excel's text functions cannot. Neither wins outright — but only one of them can parse a size somebody typed three different ways.",
    builds: [
      {
        name: 'Text Pipe Size → Number: 1-1/2" Becomes 1.5',
        capability: "text",
        insteadOfExcel: "TEXTBEFORE and TEXTAFTER, which read better but do not exist here",
        placement: { tab: "Schedule", cell: "any", governs: "one cell, or wrap in MAP for a column" },
        columns: [{ ref: "A2", header: "Size as typed", example: '1-1/2"' }],
        sheets: `=LET(p, SPLIT(SUBSTITUTE(A2,CHAR(34),""),"-/"),
  n, COUNTA(p),
  IFS(n=3, INDEX(p,1)+INDEX(p,2)/INDEX(p,3),
      n=2, INDEX(p,1)/INDEX(p,2),
      TRUE, INDEX(p,1)))`,
        result: `Handles all three shapes the trade writes: ${sizeLabel(1.5)} → 1.5, ${sizeLabel(0.75)} → 0.75, ${sizeLabel(2)} → 2, ${sizeLabel(2.5)} → 2.5`,
        notes: `\`SPLIT\` takes a *set* of delimiters, not one, so \`"-/"\` breaks on either character and the part count tells you which shape arrived: three parts is a mixed number, two is a bare fraction, one is a whole number. \`CHAR(34)\` rather than an escaped double quote keeps the formula pasteable without an editor mangling it. This is worth building once and never again — every code table on this page keys on the decimal, and every human types the fraction.`,
      },
      {
        name: "Pull Material and Size Out of One Typed Cell",
        capability: "text",
        insteadOfExcel: "Nothing. Excel has no regex functions at all without VBA",
        placement: { tab: "Schedule", cell: "two cells", governs: "one cell each, or MAP for columns" },
        columns: [{ ref: "A2", header: "What somebody actually typed", example: '3/4" copper L' }],
        sheets: `=REGEXEXTRACT(LOWER(A2),"copper[ -]?l|copper[ -]?m|pex|cpvc|pvc|steel")
=REGEXEXTRACT(A2,"^\\s*([0-9]+(?:-[0-9]+/[0-9]+|/[0-9]+)?)")`,
        result: `\`3/4" copper L\` → material \`copper l\` and size \`3/4\`, which the parser above turns into ${fmt(0.75, 2)} and a \`Pipe\` lookup turns into a ${fmt(insideDiameter("copper-l", 0.75) as number, 3)} in bore`,
        notes: `Normalise the material with \`LOWER\` and a space-or-hyphen class, then map it to the key your pipe table uses — do not try to make the regex emit \`copper-l\` directly, because the next person will type "Type L copper" and you will be editing the regex instead of the mapping table. The size pattern is anchored at the start and deliberately non-greedy about the fraction so \`1-1/2\` and \`3/4\` and \`2\` all match. **Regex is the reason a messy schedule is salvageable in Sheets and a retyping job in Excel** — worth remembering before anyone tells you the two are interchangeable.`,
      },
      {
        name: "Back the Other Way: 1.5 Becomes the Fraction the Trade Says",
        capability: "text",
        insteadOfExcel: "Same job, but Excel needs the fraction number format, which changes the display and not the value",
        placement: { tab: "Schedule", cell: "any", governs: "one cell, or MAP for a column" },
        columns: [{ ref: "A2", header: "Decimal size", example: "1.5" }],
        sheets: `=LET(w, INT(A2), f, A2-w,
  frac, IFS(f=0,"", f=0.25,"1/4", f=0.375,"3/8", f=0.5,"1/2", f=0.75,"3/4", TRUE,TEXT(f,"0.###")),
  IF(frac="", w&CHAR(34), IF(w=0, frac&CHAR(34), w&"-"&frac&CHAR(34))))`,
        result: `Reproduces our own size labels exactly: 0.75 → ${sizeLabel(0.75)}, 1.25 → ${sizeLabel(1.25)}, 1.5 → ${sizeLabel(1.5)}, 2 → ${sizeLabel(2)}, 2.5 → ${sizeLabel(2.5)}, 4 → ${sizeLabel(4)}`,
        notes: `The reason to compute the label rather than format the cell is that a **number format changes what you see and not what QUERY sees** — a fraction-formatted 1.5 is still numeric, which is usually what you want, but a printed take-off needs real text. Keep the decimal in one column and this in another, and never let the text column feed a lookup. The fraction list stops where our pipe tables stop; anything unlisted falls through to three decimal places rather than lying about being a fraction.`,
      },
    ],
  },

  {
    title: "Make the Sheet Police Itself",
    color: "amber",
    blurb:
      "A spreadsheet that quietly returns a code violation is worse than no spreadsheet, because it has your name on it. None of what follows is a formula you paste into a cell — it is what a shared sheet does on its own: flags the row that fails, refuses the fixture that does not exist, and draws the velocity so you can see the outlier without reading a column of numbers.",
    builds: [
      {
        name: "Flag Every Branch Over the Velocity Ceiling",
        capability: "validation",
        insteadOfExcel: "The same rule, but Excel's version can reference another sheet directly",
        placement: {
          tab: "Branches",
          cell: "Format > Conditional formatting",
          governs: "apply to F2:F, custom formula",
        },
        columns: [
          { ref: "F", header: "Velocity, ft/s", example: fmt(BRANCH_VEL, 2) },
          { ref: "Limits!B2", header: "Cold ceiling", example: String(MAX_VELOCITY_COLD) },
          { ref: "Limits!B3", header: "Hot ceiling", example: String(MAX_VELOCITY_HOT) },
        ],
        sheets: `=AND($F2<>"", $F2>INDIRECT(IF($J2="hot","Limits!$B$3","Limits!$B$2")))`,
        result: `At ${fmt(BRANCH_VEL, 2)} ft/s the example branch sits just under the ${MAX_VELOCITY_COLD} ft/s cold ceiling and stays unflagged — but the same ${BRANCH_GPM} gpm in ${sizeLabel(BRANCH_SIZE)} PEX runs ${fmt(PEX_VEL, 2)} ft/s and lights up, and on a hot line the ceiling drops to ${MAX_VELOCITY_HOT} ft/s and even the copper fails`,
        notes: `**A conditional-format custom formula cannot reference another sheet directly** — this is a documented Sheets limitation and the single most common reason a rule silently never fires. \`INDIRECT\` with the sheet name as text is the way through, and it is worth the ugliness to keep the limits in one place rather than hard-coding ${MAX_VELOCITY_COLD} into a formatting rule where nobody will ever find it. Anchor the column with \`$F2\` and leave the row unanchored so the rule walks down the range. The \`$F2<>""\` guard matters because an empty cell compares as zero and would otherwise flag every unused row.`,
        calc: {
          href: "/calculators/plumbing/plumbing-pipe-velocity-calculator",
          label: "Pipe Velocity Calculator",
        },
      },
      {
        name: "Flag Any Run Below Its Minimum Slope",
        capability: "validation",
        insteadOfExcel: "Identical rule, no meaningful difference",
        placement: {
          tab: "Runs",
          cell: "Format > Conditional formatting",
          governs: "apply to D2:D, custom formula",
        },
        columns: [
          { ref: "C", header: "Nominal size", example: String(RUN_SIZE) },
          { ref: "D", header: "Actual slope, in per ft", example: "0.1875" },
        ],
        sheets: `=AND($D2<>"", $D2<IFS(${SLOPE_BREAKS.map((r) => `$C2<=${r.maxSize},${r.slope}`).join(", ")}, TRUE,${SLOPE_LAST}))`,
        result: `A ${sizeLabel(RUN_SIZE)} run needs ${RUN_SLOPE} in per ft (${fmt(slopeToPercent(RUN_SLOPE), 2)}%); a ${sizeLabel(3)} run legally runs at ${minSlope(3)} in per ft (${fmt(slopeToPercent(minSlope(3)), 2)}%), which is half the fall`,
        notes: `The step down at ${sizeLabel(3)} is the most consequential line in IPC Table 704.1 and the reason this has to be a formula rather than a single threshold: a ${sizeLabel(3)} drain legally runs at half the fall a ${sizeLabel(RUN_SIZE)} drain needs, so one hard-coded number will either fail every large run or pass every shallow small one. \`IFS\` reads top-down and stops at the first TRUE, so the breakpoints must stay in ascending order. Note this checks the code minimum only — it says nothing about whether the run is *too* steep, which is a real failure mode on long ${sizeLabel(4)} laterals where the liquid outruns the solids.`,
        calc: {
          href: "/calculators/plumbing/plumbing-pipe-slope-calculator",
          label: "Pipe Slope Calculator",
        },
      },
      {
        name: "A Dropdown That Cannot Produce a Wrong Fixture",
        capability: "validation",
        insteadOfExcel: "Data Validation from a range, then a named range to make it portable",
        placement: {
          tab: "Schedule",
          cell: "Data > Data validation",
          governs: "apply to B2:B, dropdown from a range",
        },
        columns: [
          { ref: "B", header: "Supply fixture (dropdown)", example: WSFU_LAV },
          { ref: "E", header: "Drainage fixture (a second dropdown)", example: DFU_LAV },
        ],
        usesTable: "WSFU fixture schedule",
        sheets: `Apply to B2:B — Dropdown (from a range):  =WSFU!$B$2:$B$${WSFU_FIXTURES.length + 1}
Apply to E2:E — Dropdown (from a range):  =DFU!$A$2:$A$${DFU_FIXTURES.length + 1}`,
        result: `${WSFU_FIXTURES.length} supply fixtures and ${DFU_FIXTURES.length} drainage fixtures to pick from, and a typo becomes impossible rather than becoming a zero`,
        notes: `**Two dropdowns, because the two code tables disagree about names** — and this is what makes joining on the label safe rather than reckless. Both schedule builds above look the fixture up by its spelling, so a hand-typed "Lav" would fall through \`IFERROR\` and contribute nothing at all; a dropdown sourced from the table itself means the spelling cannot be wrong. Set each rule to **reject** invalid input rather than warn, or the guarantee is decorative. Note the two source columns are not the same letter: the supply table ships an internal key in A and the label in B, while Table 709.1 ships the label in A and no key at all.`,
      },
      {
        name: "Draw the Velocity in the Cell Beside It",
        capability: "visual",
        insteadOfExcel: "A sparkline chart object, which a formula cannot drive",
        placement: { tab: "Branches", cell: "K2", governs: "one cell per row — the one place you still fill down" },
        columns: [
          { ref: "F", header: "Velocity, ft/s", example: fmt(BRANCH_VEL, 2) },
          { ref: "K", header: "Bar against the ceiling", example: "▇▇▇▇▇▇▁" },
        ],
        sheets: `=SPARKLINE(F2,{"charttype","bar";"max",${MAX_VELOCITY_COLD};"color1",IF(F2>${MAX_VELOCITY_COLD},"#DC2626","#01AD9F")})`,
        result: `Every branch drawn against the same ${MAX_VELOCITY_COLD} ft/s ceiling, so ${fmt(BRANCH_VEL, 2)} ft/s reads as nearly full and turns red the moment it crosses`,
        notes: `**\`SPARKLINE\` is the one function on this page that does not vectorise** — wrap it in \`ARRAYFORMULA\` and you get a single chart, not a column of them, so this is the one place the whole page still tells you to fill down. Fixing \`max\` to the ceiling rather than letting it auto-scale is the entire point: an auto-scaled bar makes every row look equally full and hides the outlier you were looking for. The \`;\` separates option rows and the \`,\` separates the pairs inside them — in a comma-decimal locale those become \`\\\` and \`;\` respectively, which is the single most confusing locale difference in Sheets.`,
      },
    ],
  },

  {
    title: "One Price Book, Every Estimate",
    color: "violet",
    blurb:
      "Every estimate you have ever sent has a labour rate buried in it, and the day that rate changes you find out how many copies of it exist. A shared sheet fixes this properly: the rates live in one file, every estimate reads them live, and last quarter's quote still shows last quarter's number because it was a value when you sent it. Excel can link workbooks; it cannot do it to a file somebody else has open.",
    builds: [
      {
        name: "Pull the Rate Master Into Every Job Sheet",
        capability: "import",
        insteadOfExcel: "A workbook link that breaks when the file moves, or a Power Query refresh nobody runs",
        placement: { tab: "Rates", cell: "A1", governs: "spills the whole imported block" },
        columns: [
          { ref: "A", header: "Rate label", example: "Journeyman" },
          { ref: "B", header: "Value", example: "110" },
        ],
        sheets: `=IMPORTRANGE("1AbC…the master file's key…","Rates!A1:C40")`,
        result: `One file holds the rates; every job sheet reads them, and changing the journeyman rate once updates every open estimate`,
        notes: `Paste the whole source URL the first time and Sheets will reduce it to the key for you, then click Allow access on the prompt — it appears once per source-destination pair and never again, which is why it seems to have failed the first time somebody else opens the file. **Disclose this if the source is your price book:** once access is granted, any editor on the destination spreadsheet can pull *any* range from the source, not just the one you named, and the grant counts against the source's sharing limit. Keep costs and rates in a file you are content for the whole company to read, and keep margins somewhere else.`,
      },
      {
        name: "Job Price at a Margin, Reading the Shared Rates",
        capability: "import",
        insteadOfExcel: "The same arithmetic — this one is about where the numbers come from",
        placement: { tab: "Job", cell: "B7", governs: "one cell, per job" },
        columns: [
          { ref: "B2", header: "Labour hours", example: "10" },
          { ref: "B3", header: "Fixture cost", example: usd(850) },
          { ref: "B4", header: "Material cost", example: usd(450) },
          { ref: "B5", header: "Target margin, percent", example: "25" },
        ],
        sheets: `=LET(rate, XLOOKUP("Journeyman",Rates!$A:$A,Rates!$B:$B),
  oh, XLOOKUP("Overhead %",Rates!$A:$A,Rates!$B:$B),
  direct, $B$2*rate+$B$3+$B$4,
  breakeven, direct*(1+oh/100),
  breakeven/(1-$B$5/100))`,
        excelEquivalent: `=(B2*Rates!$B$2+B3+B4)*(1+Rates!$B$8/100)/(1-B5/100)      and good luck naming those cells`,
        result: `direct ${usd(ESTIMATE.direct)} → break-even ${usd(ESTIMATE.breakEven)} → ${usd(ESTIMATE.price)} at a ${fmt(25, 0)}% margin, ${usd(ESTIMATE.profit)} profit. The same 25% applied as a markup gives ${usd(ESTIMATE.markupPrice)} — a ${fmt(ESTIMATE.effectiveMargin, 1)}% margin and ${usd(ESTIMATE.price - ESTIMATE.markupPrice)} less in your pocket on identical work`,
        notes: `\`XLOOKUP\` on a label rather than a cell reference is what makes the imported block safe to reorganise — insert a row in the rate master and a positional reference like \`Rates!$B$2\` silently starts returning the wrong number, while a label lookup follows it. **Margin divides by (1 − margin); markup multiplies by (1 + markup)**, and they are not the same operation: a 25% markup is always a 20% margin. For reference the loaded-rate side of the same arithmetic gives ${usd(LABOUR.loadedCost)} per hour loaded and ${usd(LABOUR.billRate)} to bill at a ${fmt(40, 0)}% margin, which is ${fmt(LABOUR.multiple, 2)}× the wage.`,
        calc: {
          href: "/calculators/plumbing/plumbing-estimate-calculator",
          label: "Plumbing Job Estimate Calculator",
        },
      },
    ],
  },
];

/* ------------------------------------------------------------------ *
 * Named functions
 *
 * Names checked against Google's rules: none matches a built-in, none starts
 * with a digit, none contains anything but letters and underscores. Note
 * `MIN_SLOPE_INFT` rather than `SLOPE` — SLOPE is a built-in statistical
 * function and the dialog will refuse it.
 * ------------------------------------------------------------------ */

export const namedFunctions: NamedFunction[] = [
  {
    name: "WSFU_TO_GPM",
    description: "Probable peak demand in gpm for a total water supply fixture unit load, read off Hunter's curve.",
    args: [
      { name: "fu", description: "Total WSFU on the run", example: fmt(HOUSE_WSFU, 1) },
      { name: "control", description: `"tank" for flush tanks, "valve" for flushometers`, example: `"tank"` },
    ],
    needsTable: "Hunter's curve — WSFU to GPM",
    definition: `=LET(
  raw_fu, Hunter!$A$2:$A$${HUNTER_LAST},
  raw_d,  IF(control="valve", Hunter!$C$2:$C$${HUNTER_LAST}, Hunter!$B$2:$B$${HUNTER_LAST}),
  keep,   raw_d<>"",
  fus,    FILTER(raw_fu, keep),
  dem,    FILTER(raw_d, keep),
  n,      COUNT(fus),
  IFS(
    fu<=INDEX(fus,1), fu/INDEX(fus,1)*INDEX(dem,1),
    fu>=INDEX(fus,n), INDEX(dem,n),
    TRUE, LET(i, MATCH(fu,fus,1),
      INDEX(dem,i)+(fu-INDEX(fus,i))/(INDEX(fus,i+1)-INDEX(fus,i))*(INDEX(dem,i+1)-INDEX(dem,i)))))`,
    result: `=WSFU_TO_GPM(${fmt(HOUSE_WSFU, 1)},"tank") → ${fmt(HOUSE_GPM, 2)} gpm · =WSFU_TO_GPM(${fmt(HOUSE_WSFU, 1)},"valve") → ${fmt(HOUSE_GPM_VALVE, 2)} gpm`,
    notes: `**This is the case for named functions in one line.** The Excel page has to write this as a ${(excelSections[0].formulas[0].excel || "").length}-character expression *plus* a helper cell holding the MATCH, and repeat both on every sheet that needs it. Here it is one definition and \`=WSFU_TO_GPM(B2,"tank")\` forever. Three behaviours are worth keeping: the \`keep\` filter drops the blank rows at the top of the flushometer column, where the curve has no valve anchors below ${HUNTER_DEMAND.find((r) => r.valve !== null)?.fu ?? 5} FU; below the first anchor demand scales linearly from the origin rather than clamping; and above the last it flattens rather than extrapolating. Hunter's curve is a table, not an equation, so this cannot exist without the paste.`,
    calc: {
      href: "/calculators/plumbing/plumbing-water-supply-fixture-unit-calculator",
      label: "Water Supply Fixture Unit Calculator",
    },
  },
  {
    name: "HW_LOSS",
    description: "Hazen-Williams friction loss in psi per 100 ft, for water in a full pipe.",
    args: [
      { name: "gpm", description: "Flow, gallons per minute", example: String(BRANCH_GPM) },
      { name: "bore", description: "INSIDE diameter, inches — not nominal size", example: fmt(BRANCH_BORE, 3) },
      { name: "cfac", description: "Hazen-Williams C for the material", example: String(C_COPPER) },
    ],
    definition: `=4.52*gpm^1.852/(cfac^1.852*bore^4.8704)*100`,
    result: `=HW_LOSS(${BRANCH_GPM},${fmt(BRANCH_BORE, 3)},${C_COPPER}) → ${fmt(BRANCH_LOSS, 2)} psi per 100 ft`,
    notes: `The only argument anyone gets wrong is the second one. Passing ${BRANCH_SIZE} instead of the ${fmt(BRANCH_BORE, 3)} in bore understates the loss badly, because the diameter carries an exponent of 4.87 — naming the placeholder \`bore\` rather than \`d\` is doing real work here, since the dialog shows that name to whoever uses the function. C is a material property, not a constant: ${Object.entries(HAZEN_WILLIAMS_C)
      .map(([m, c]) => `${PIPE_MATERIAL_LABELS[m as PipeMaterial]} ${c}`)
      .join(", ")}.`,
    calc: {
      href: "/calculators/plumbing/plumbing-friction-loss-calculator",
      label: "Friction Loss Calculator",
    },
  },
  {
    name: "PIPE_ID",
    description: "Inside diameter in inches for a material and nominal trade size.",
    args: [
      { name: "material", description: "Material key, e.g. copper-l or pex", example: "copper-l" },
      { name: "nominal", description: "Nominal trade size in inches, as a decimal", example: String(BRANCH_SIZE) },
    ],
    needsTable: "Pipe dimensions and C factors",
    definition: `=IFERROR(XLOOKUP(material&"|"&nominal, Pipe!$A$2:$A&"|"&Pipe!$C$2:$C, Pipe!$F$2:$F), "not stocked")`,
    result: `=PIPE_ID("copper-l",${BRANCH_SIZE}) → ${fmt(BRANCH_BORE, 3)} in · =PIPE_ID("pex",${BRANCH_SIZE}) → ${fmt(PEX_BORE, 3)} in`,
    notes: `The composite-key concatenation is the whole trick — it looks up on two columns without a helper column, and it works inside a named function because the function body evaluates as an array expression. Every bore in the pasted table is **computed** as outside diameter minus twice the wall rather than transcribed, which is what makes the numbers self-checking: PEX at SDR-9 means wall equals OD over 9, and the computed values land on the published ASTM figures. Returning text rather than an error for an unstocked size keeps a schedule readable while it is half filled in.`,
  },
  {
    name: "MIN_SLOPE_INFT",
    description: "Minimum code slope in inches per foot for a horizontal drain of a given size, IPC Table 704.1.",
    args: [{ name: "size", description: "Nominal drain size, inches", example: String(RUN_SIZE) }],
    definition: `=IFS(${SLOPE_BREAKS.map((r) => `size<=${r.maxSize}, ${r.slope}`).join(", ")}, TRUE, ${SLOPE_LAST})`,
    result: `=MIN_SLOPE_INFT(${RUN_SIZE}) → ${RUN_SLOPE} in per ft · =MIN_SLOPE_INFT(3) → ${minSlope(3)} · =MIN_SLOPE_INFT(8) → ${minSlope(8)}`,
    notes: `Named \`MIN_SLOPE_INFT\` and not \`SLOPE\` because **\`SLOPE\` is a built-in statistical function and the dialog will reject it** — the same goes for anything else colliding with a built-in, anything starting with a digit, and \`TRUE\`/\`FALSE\`. Worth knowing too that a named *range* takes precedence over a named function of the same name, which produces a genuinely baffling failure if you have a range called \`RATE\` and write a function called \`RATE\`. Underscores are the only special character allowed.`,
    calc: {
      href: "/calculators/plumbing/plumbing-pipe-slope-calculator",
      label: "Pipe Slope Calculator",
    },
  },
  {
    name: "VENT_SIZE",
    description: "Individual, common or branch vent size per IPC 906.2 — half the drain served, with the length upsize applied.",
    args: [
      { name: "drain", description: "Size of the drain being vented, inches", example: "3" },
      { name: "length", description: "Developed length of the vent, feet", example: "45" },
    ],
    needsTable: "Stocked vent sizes",
    definition: `=LET(
  sizes, Vent!$A$2:$A$${VENT_LAST},
  half,  MAX(drain/2, ${MIN_VENT_SIZE}),
  i,     MATCH(TRUE, sizes>=half, 0),
  j,     IF(length>${VENT_LENGTH_UPSIZE_FEET}, i+1, i),
  INDEX(sizes, MIN(j, COUNT(sizes))))`,
    result: `=VENT_SIZE(3,30) → ${sizeLabel(VENT_30.size)} · =VENT_SIZE(3,45) → ${sizeLabel(VENT_45.size)}, upsized because ${VENT_LENGTH_UPSIZE_FEET} ft is passed`,
    notes: `\`MATCH(TRUE, sizes>=half, 0)\` finds the first stocked size at or above half the drain — this works here, inside \`LET\`, precisely because a named function body evaluates as an array expression without needing \`ARRAYFORMULA\`. Three rules are stacked: not less than half the drain served, never below ${MIN_VENT_SIZE} in, and one nominal size up for the **whole run** once developed length passes ${VENT_LENGTH_UPSIZE_FEET} ft. This covers individual, common and branch vents only — a vent stack or stack vent serving a multi-storey drainage stack is sized by IPC Table 906.1, which is a different table and deliberately not this function.`,
    calc: {
      href: "/calculators/plumbing/plumbing-vent-size-calculator",
      label: "Vent Size Calculator",
    },
  },
  {
    name: "DRAIN_SIZE",
    description: "Minimum building drain size for a DFU load at a given slope, with the water-closet floor applied.",
    args: [
      { name: "dfu", description: "Total drainage fixture units on the run", example: fmt(HOUSE_DFU, 0) },
      { name: "slope", description: "Slope in inches per foot: 0.0625, 0.125, 0.25 or 0.5", example: "0.25" },
      { name: "has_wc", description: "TRUE if the run serves a water closet", example: "TRUE" },
    ],
    needsTable: "Building drain capacity — IPC Table 710.1(1)",
    definition: `=LET(
  tbl,   Drain!$A$2:$E$${DRAIN_LAST},
  col,   MATCH(slope, {${SLOPE_KEYS.join(",")}}, 0)+1,
  sizes, CHOOSECOLS(tbl,1),
  cap,   CHOOSECOLS(tbl,col),
  keep,  ISNUMBER(cap),
  s,     FILTER(sizes,keep),
  c,     FILTER(cap,keep),
  t,     IFERROR(INDEX(s, MATCH(TRUE, c>=dfu, 0)), "over table"),
  IF(ISNUMBER(t)*(has_wc=TRUE)*(t<${MIN_BUILDING_DRAIN_WITH_WC}), ${MIN_BUILDING_DRAIN_WITH_WC}, t))`,
    result: `=DRAIN_SIZE(${fmt(HOUSE_DFU, 0)},0.25,TRUE) → ${HOUSE_DRAIN.size === null ? "—" : sizeLabel(HOUSE_DRAIN.size)}, where the table alone would have said ${HOUSE_DRAIN.fromTable === null ? "—" : sizeLabel(HOUSE_DRAIN.fromTable)}`,
    notes: `\`CHOOSECOLS\` picks the slope column, which is cleaner than four \`IF\`s and survives somebody widening the table. The \`ISNUMBER\` filter drops the blank cells — the shallow slopes are simply **not permitted** for small sizes rather than being an omission, and treating a blank as zero capacity would return a size the code forbids. Then the water-closet floor: no building drain serving a water closet may be under ${MIN_BUILDING_DRAIN_WITH_WC} in whatever the DFU table permits, which is the line most sheets skip. Multiplying the three conditions is a logical AND that keeps working if you later wrap the whole thing in \`MAP\`.`,
    calc: {
      href: "/calculators/plumbing/plumbing-drain-pipe-size-calculator",
      label: "Drain Pipe Size Calculator",
    },
  },
  {
    name: "TDH_FT",
    description: "Total dynamic head in feet: static lift plus friction plus discharge pressure plus velocity head.",
    args: [
      { name: "lift", description: "Static lift, feet", example: "12" },
      { name: "psi100", description: "Friction loss, psi per 100 ft", example: fmt(PUMP_FRICTION_100, 2) },
      { name: "length", description: "Developed length, feet", example: "40" },
      { name: "disch_psi", description: "Required discharge pressure, psi", example: "0" },
      { name: "vel", description: "Velocity in the discharge, ft/s", example: fmt(PUMP_VEL, 2) },
    ],
    definition: `=lift + psi100*length/100/${PSI_PER_FOOT_HEAD} + disch_psi/${PSI_PER_FOOT_HEAD} + vel^2/64.348`,
    result: `=TDH_FT(12,${fmt(PUMP_FRICTION_100, 2)},40,0,${fmt(PUMP_VEL, 2)}) → ${fmt(PUMP_TDH, 1)} ft of head`,
    notes: `Four terms in four different units, which is exactly why this belongs in a named function rather than being retyped per job. Dividing by ${PSI_PER_FOOT_HEAD} psi per foot rather than multiplying by its reciprocal (${fmt(FEET_HEAD_PER_PSI, 4)}) keeps the formula short and uses exactly the constant our calculators run on, and 64.348 is 2g with g at 32.174 ft/s². The velocity-head term is genuinely small — ${fmt(velocityHead(PUMP_VEL), 2)} ft here out of ${fmt(PUMP_TDH, 1)} — and people leave it out, which is fine on a sump and not fine on a booster set. Feet, not psi, because that is what a pump curve is drawn in.`,
    calc: {
      href: "/calculators/plumbing/plumbing-pump-head-calculator",
      label: "Pump Head Calculator",
    },
  },
];

/* ------------------------------------------------------------------ *
 * Paste-in tables.
 *
 * The eleven from the Excel reference are imported rather than rebuilt. The
 * three below are the ones only this page's builds need, and like the others
 * they are generated from the library arrays so they cannot drift from the
 * calculators. Tab-separated: pasting one into A1 lands every value in its
 * own cell in Google Sheets, Excel and LibreOffice alike.
 * ------------------------------------------------------------------ */

const sheetsOnlyTables: PasteTable[] = [
  {
    name: "Pipe dimensions and C factors — the Pipe tab",
    headers: ["Material key", "Material", "Nominal", "Label", "OD in", "Wall in", "Bore in", "C"],
    rows: (Object.keys(PIPE_DIMENSIONS) as PipeMaterial[]).flatMap((m) =>
      PIPE_DIMENSIONS[m].map((r) => [
        m,
        PIPE_MATERIAL_LABELS[m],
        String(r.nominal),
        sizeLabel(r.nominal),
        String(r.od),
        String(r.wall),
        fmt(r.od - 2 * r.wall, 3),
        String(HAZEN_WILLIAMS_C[m]),
      ]),
    ),
    note: `Every material and size our calculators know, with the bore COMPUTED as OD minus twice the wall rather than transcribed. Column F is the one every formula on this page reaches for. The composite lookups key on column A and column C together, so keep both.`,
  },
  {
    name: "WSFU fixture schedule — the WSFU tab",
    headers: ["Key", "Fixture", "Cold", "Hot", "Total", "Group"],
    rows: WSFU_FIXTURES.map((f) => [
      f.key,
      f.label,
      String(f.cold),
      String(f.hot),
      String(f.total),
      f.group,
    ]),
    note: `${WSFU_FIXTURES.length} fixtures. **Total is not cold plus hot** — the code assigns a fixture's total weight separately, and a sheet that adds the two columns overstates the load on every row. Column B is the dropdown source; column E is what the schedule multiplies.`,
  },
  {
    name: "Limits and constants — the Limits tab",
    headers: ["Label", "Value", "Unit", "Status"],
    rows: [
      ["Max velocity, cold", String(MAX_VELOCITY_COLD), "ft/s", "ASPE / manufacturer practice, not IPC"],
      ["Max velocity, hot", String(MAX_VELOCITY_HOT), "ft/s", "ASPE / manufacturer practice, not IPC"],
      ["PRV threshold", String(PRV_THRESHOLD_PSI), "psi", "IPC 604.8 — required above this"],
      ["Minimum vent size", String(MIN_VENT_SIZE), "in", "IPC 906.2"],
      ["Vent length upsize", String(VENT_LENGTH_UPSIZE_FEET), "ft", "IPC 906.2"],
      ["Min building drain with WC", String(MIN_BUILDING_DRAIN_WITH_WC), "in", "IPC 710.1"],
      ["Velocity constant", String(VELOCITY_CONSTANT), "—", "0.4085, fuller than the published 0.408"],
      ["psi per foot of head", String(PSI_PER_FOOT_HEAD), "psi/ft", "water at 60 °F"],
      ["feet of head per psi", fmt(FEET_HEAD_PER_PSI, 4), "ft/psi", "reciprocal of the above"],
    ],
    note: `The tab every conditional-formatting rule points at, which is the whole reason to have it: a limit hard-coded into a formatting rule is a limit nobody will ever find again. The two velocity ceilings are design practice rather than numeric IPC limits — the code requires a system free of excessive noise and erosion without naming a figure.`,
  },
];

/** All fourteen — the eleven from the Excel reference plus this page's three. */
export const tables: PasteTable[] = [...sheetsOnlyTables, ...excelTables];

/* ------------------------------------------------------------------ *
 * Derived counts, so the page's prose, its badges and the blog diagrams can
 * never disagree with the data.
 * ------------------------------------------------------------------ */

export const buildCount = sheetsSections.reduce((a, s) => a + s.builds.length, 0);
export const namedFunctionCount = namedFunctions.length;
export const sheetsOnlyCount = parity.filter((r) => r.sheets && !r.excel).length;
export const excelOnlyCount = parity.filter((r) => !r.sheets && r.excel).length;
export const bothCount = parity.filter((r) => r.sheets && r.excel).length;
export const tableCount = tables.length;
export const tableRowCount = tables.reduce((a, t) => a + t.rows.length, 0);

/** Re-exported so nothing on this page ever types the number 35. */
export const excelFormulaCount = totalCount;

/** The compact all-formula reference — imported, never restated. */
export const excelReference = excelSections;

/**
 * Length of the Hunter's-curve interpolation as the Excel page has to write
 * it, measured rather than counted, because the named-function section's
 * whole argument rests on this number.
 */
export const hunterExcelLength = (excelSections[0].formulas[0].excel || "").length;
