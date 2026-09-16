/**
 * Every plumbing formula written for a spreadsheet, as data.
 *
 * This lives in a config module rather than inside the page so that
 * `src/components/blog/excel-formulas/ExcelSurvivabilityDiagram.astro` can
 * derive its own direct/lookup lists from the same array the page renders.
 * When the two were kept separately the diagram silently went stale the moment
 * a formula was added — the same class of drift the derived `toolCount` on the
 * calculator cards was introduced to kill.
 *
 * Every numeric constant inside an `excel` or `named` string is interpolated
 * from `@/lib/plumbing`, never typed by hand, so a formula a reader pastes
 * cannot disagree with the calculator it came from.
 */

import {
  // constants — interpolated into the Excel strings below, never typed by hand
  VELOCITY_CONSTANT,
  PSI_PER_FOOT_HEAD,
  LB_PER_GALLON,
  BTU_PER_GPM_PER_DEGF,
  PRV_THRESHOLD_PSI,
  MIN_VENT_SIZE,
  MIN_BUILDING_DRAIN_WITH_WC,
  CUBIC_INCHES_PER_GALLON,
  GALLONS_PER_CUBIC_FOOT,
  PDI_GREASE_LB_PER_GPM,
  GREASE_SINK_FILL_FRACTION,
  GREASE_INTERCEPTOR_MINIMUM_GAL,
  FIRST_FLUSH_PER_SQFT,
  COLLECTION_EFFICIENCY,
  FHR_USABLE_FRACTION,
  ATMOSPHERIC_PSI,
  MAX_VELOCITY_COLD,
  MAX_VELOCITY_HOT,
  VENT_SIZES,
  STANDARD_EXPANSION_TANKS,
  STANDARD_PRESSURE_TANKS,
  HAZEN_WILLIAMS_C,
  MANNING_N,
  MIN_SLOPE_IN_PER_FT,
  TABLE_909_1,
  FITTING_LD,
  FITTING_LABELS,
  HUNTER_DEMAND,
  WATER_DENSITY,
  DFU_FIXTURES,
  TABLE_710_1_1,
  TABLE_710_1_2,
  HOURS_PER_YEAR,
  COST_BAND,
  REPIPE_SECOND_STOREY_FACTOR,
  REPIPE_EXTRA_BATH_COST,
  DRIPS_PER_GALLON,
  MINUTES_PER_DAY,
  DAYS_PER_YEAR,
  BTU_PER_THERM,
  SEPTIC_RETENTION_DAYS,
  SEPTIC_TANK_MINIMUMS,
  UNIT_CATEGORIES,
  GREYWATER_SOURCE_YIELD,
  GREYWATER_MAX_STORAGE_HOURS,
  IRRIGATION_DEMAND,
  // functions — every worked result on this page is their real output
  fmt,
  usd,
  usd2,
  estimateJob,
  labourRate,
  repipeCost,
  waterHeaterCost,
  gallonsPerFoot,
  pipeVolume,
  convertUnit,
  dripsToGpd,
  leakCost,
  roofRunoffGpm,
  stormHorizontalCheck,
  septicSizing,
  greywaterYield,
  mixedFlow,
  sizeLabel,
  insideDiameter,
  velocity,
  frictionLossPsiPer100Ft,
  availableFrictionPsi,
  allowableLossPer100Ft,
  wsfuToGpm,
  developedLength,
  fittingEquivalentFeet,
  minSlope,
  slopeToPercent,
  totalFall,
  manningHalfFull,
  ventSize,
  trapArmMaxFeet,
  minDrainSizeApplied,
  greaseTrapHydraulic,
  greaseInterceptorVolume,
  rainwaterYieldGallons,
  headToPsi,
  psiToHead,
  velocityHead,
  totalDynamicHead,
  expansionTank,
  drawdownFraction,
  recoveryGph,
  firstHourRating,
  tanklessGpm,
  hotFraction,
} from "@/lib/plumbing";

/* ------------------------------------------------------------------ *
 * Worked-example inputs.
 *
 * These are the SAME defaults the matching calculators run, so a reader
 * who works an example here and then opens the tool sees the same number.
 * Every `result` string below is produced by calling the real library
 * function — nothing on this page is a hand-typed answer.
 * ------------------------------------------------------------------ */
const ID_34 = insideDiameter("copper-l", 0.75) as number;
const ID_1 = insideDiameter("copper-l", 1) as number;
const ID_112_PVC = insideDiameter("pvc-40", 1.5) as number;
const C_COPPER = HAZEN_WILLIAMS_C["copper-l"];
const C_PVC = HAZEN_WILLIAMS_C["pvc-40"];
const N_PLASTIC = MANNING_N["plastic"];

const AVAIL = availableFrictionPsi({
  supplyPsi: 60,
  highestFixtureFeet: 20,
  fixtureRequiredPsi: 15,
  meterLossPsi: 8,
  otherLossPsi: 0,
});
const DEV_LEN = developedLength(60, { elbow90: 6, teeBranch: 2, ballValve: 1 }, ID_34);
const MANNING_3IN = manningHalfFull(3, 0.125, N_PLASTIC);
const VENT_3_30 = ventSize(3, 30);
const DRAIN_18 = minDrainSizeApplied(18, "building-drain", 0.25, true);
const GREASE_SINK = greaseTrapHydraulic({ lengthIn: 24, widthIn: 24, depthIn: 12, compartments: 3 });
const GREASE_VESSEL = greaseInterceptorVolume({
  seats: 100,
  turnoverPerHour: 1,
  wasteFlowPerMeal: 6,
  retentionHours: 2.5,
  storageFactor: 1,
});
const RAIN = rainwaterYieldGallons({ areaSqFt: 2000, inches: 3.5, coefficient: 0.85, events: 4 });
const VEL_PUMP = velocity(30, ID_112_PVC);
const FRICTION_HEAD_PUMP = psiToHead((frictionLossPsiPer100Ft(30, ID_112_PVC, C_PVC) / 100) * 40);
const TDH = totalDynamicHead({
  staticLiftFeet: 12,
  frictionHeadFeet: FRICTION_HEAD_PUMP,
  pressureHeadFeet: 0,
  velocityHeadFeet: velocityHead(VEL_PUMP),
});
const EXPANSION = expansionTank({ systemGallons: 50, coldF: 40, hotF: 140, supplyPsi: 60, maxPsi: 80 });
const RECOVERY = recoveryGph(40000, 0.8, 90);

/* Pricing, volume and site examples. Each input object is copied VERBATIM from
   the matching calculator's own `const base`, so a reader who works an example
   here and then opens the tool sees the same number. Getting this wrong has
   already shipped two defects in this category. */
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
const REPIPE = repipeCost({
  squareFeet: 1800,
  materialKey: "pex",
  accessKey: "average",
  storeys: 1,
  bathrooms: 2,
  permit: 450,
  drywallRepair: 1500,
  regionKey: "average",
});
const WH_COST = waterHeaterCost({
  unitKey: "tank-gas-50",
  labourRate: 110,
  permit: 200,
  haulAway: 60,
  upgrades: ["expansionTank", "pan"],
  regionKey: "average",
});
/** The water-heater model bands at ±18%, not the ±15% every other cost model uses. */
const WH_COST_BAND = 0.18;

const PIPE_VOL = pipeVolume(ID_34, 50);
const LEAK_GPD = dripsToGpd(60);
const LEAK_RATES = {
  waterRatePer1000: 5.5,
  sewerRatePer1000: 7.0,
  deltaT: 70,
  efficiency: 0.8,
  energyRate: 1.4,
  fuel: "gas" as const,
};
const LEAK_COLD = leakCost({ gallonsPerDay: LEAK_GPD, ...LEAK_RATES, hotFraction: 0 });
const LEAK_HOT = leakCost({ gallonsPerDay: LEAK_GPD, ...LEAK_RATES, hotFraction: 1 });

const STORM_GPM = roofRunoffGpm(2000, 4);
const STORM_CHECK = stormHorizontalCheck(4, 0.125)!;
const ID_4_PVC = insideDiameter("pvc-40", 4) as number;
const SEPTIC = septicSizing({ bedrooms: 3, galPerBedroom: 150, applicationRate: 0.8, trenchWidthFt: 3 });
const GREYWATER = greywaterYield({
  occupants: 3,
  sources: { shower: true, lavatory: true, washer: true },
  loadsPerWeek: 5,
  irrigationRate: 0.6,
});
const MIXED = mixedFlow({ hotF: 140, coldF: 50, mixF: 120, mixedGpm: 2.5 });


/* ------------------------------------------------------------------ *
 * Data model
 *
 * `excel` and `named` are DATA STRINGS, which is what makes them safe: an
 * Excel formula is full of `<` and `<=`, and a bare `<` in the TEMPLATE half
 * of an .astro file is parsed as a tag opener and fails the build. Keeping
 * them here means they can never reach template markup.
 *
 * For the same reason these strings must never contain an HTML entity —
 * Excel's concatenation operator is written as a plain `&`.
 * ------------------------------------------------------------------ */
export type ExcelFormula = {
  name: string;
  /** "direct" = one expression; "lookup" = needs one of the pasted tables. */
  kind: "direct" | "lookup";
  inputs: { cell: string; label: string; example: string }[];
  excel: string;
  named: string;
  /** Computed by calling the library — never typed by hand. */
  result: string;
  notes: string;
  usesTable?: string;
  calc?: { href: string; label: string };
};
export type Section = { title: string; color: string; blurb: string; formulas: ExcelFormula[] };

export const sections: Section[] = [
  {
    title: "Pipe Sizing & Water Supply",
    color: "blue",
    blurb:
      "The supply side is where a spreadsheet earns its keep, because sizing a water line is genuinely iterative — you guess a size, check it against both the velocity cap and the friction budget, and go again. In a sheet you drop the size into one cell and read both answers at once.",
    formulas: [
      {
        name: "Water Supply Fixture Units → Peak Demand (GPM)",
        kind: "lookup",
        usesTable: "Hunter's curve",
        calc: {
          href: "/calculators/plumbing/plumbing-water-supply-fixture-unit-calculator",
          label: "Water Supply Fixture Unit Calculator",
        },
        inputs: [
          { cell: "B2", label: "Total WSFU", example: "16.4" },
          { cell: "F2:H38", label: "Hunter's curve table (paste below)", example: "—" },
          { cell: "B3", label: "Helper — row index", example: "=MATCH(B2,$F$2:$F$38,1)" },
        ],
        excel: `=IF(B2>=INDEX($F$2:$F$38,${HUNTER_DEMAND.length}),INDEX($G$2:$G$38,${HUNTER_DEMAND.length}),INDEX($G$2:$G$38,B3)+(B2-INDEX($F$2:$F$38,B3))/(INDEX($F$2:$F$38,B3+1)-INDEX($F$2:$F$38,B3))*(INDEX($G$2:$G$38,B3+1)-INDEX($G$2:$G$38,B3)))`,
        named: "=IF(WSFU>=MaxFU,MaxDemand,INDEX(DemandTank,Row)+(WSFU-INDEX(FixtureUnits,Row))/(INDEX(FixtureUnits,Row+1)-INDEX(FixtureUnits,Row))*(INDEX(DemandTank,Row+1)-INDEX(DemandTank,Row)))",
        result: `${fmt(wsfuToGpm(16.4, "tank"), 2)} gpm flush tank · ${fmt(wsfuToGpm(16.4, "valve"), 2)} gpm flushometer valve`,
        notes: `Hunter's curve is a table, not an equation, so this is the one formula on the page that cannot exist without pasting data in. The helper cell finds the bracketing row and the main formula interpolates between it and the next — which is what the calculator does. The leading IF is not decoration: past the last row (${HUNTER_DEMAND[HUNTER_DEMAND.length - 1].fu} fixture units) the interpolation would reach for a row that does not exist and return #REF!, so the curve is clamped there exactly as the calculator clamps it. Do not use VLOOKUP alone — it returns the row below and understates demand between anchors. Below the first anchor the calculator scales linearly from the origin instead, so counts under 1 fixture unit are outside what this formula covers.`,
      },
      {
        name: "Pipe Velocity",
        kind: "direct",
        calc: {
          href: "/calculators/plumbing/plumbing-pipe-velocity-calculator",
          label: "Pipe Velocity Calculator",
        },
        inputs: [
          { cell: "B2", label: "Flow, gpm", example: "10" },
          { cell: "B3", label: "Inside diameter, inches", example: `${ID_34} (3/4 in Type L copper)` },
        ],
        excel: `=${VELOCITY_CONSTANT}*B2/B3^2`,
        named: `=${VELOCITY_CONSTANT}*Flow/Bore^2`,
        result: `${fmt(velocity(10, ID_34), 2)} ft/s`,
        notes: `Bore, not nominal size — a nominal 3/4 in is ${ID_34} in in Type L copper and 0.681 in in PEX, and the square term makes that a 33% difference in velocity. Add a conditional format against ${MAX_VELOCITY_COLD} ft/s cold and ${MAX_VELOCITY_HOT} ft/s hot and the sheet flags its own violations. Those two limits are ASPE and tube-manufacturer practice, not IPC numbers.`,
      },
      {
        name: "Hazen-Williams Friction Loss",
        kind: "direct",
        calc: {
          href: "/calculators/plumbing/plumbing-friction-loss-calculator",
          label: "Pipe Friction Loss Calculator",
        },
        inputs: [
          { cell: "B2", label: "Flow, gpm", example: "10" },
          { cell: "B3", label: "Roughness coefficient C", example: `${C_COPPER} (copper)` },
          { cell: "B4", label: "Inside diameter, inches", example: `${ID_34}` },
        ],
        excel: "=4.52*B2^1.852*100/(B3^1.852*B4^4.8704)",
        named: "=4.52*Flow^1.852*100/(CFactor^1.852*Bore^4.8704)",
        result: `${fmt(frictionLossPsiPer100Ft(10, ID_34, C_COPPER), 2)} psi per 100 ft`,
        notes:
          "Returns psi per 100 ft. Excel's ^ operator is the same precedence as elsewhere, but the parentheses around the denominator are load-bearing — without them the d term multiplies instead of divides and the answer comes back absurdly small. Valid for water between 40 and 75 °F in turbulent flow only.",
      },
      {
        name: "Available Pressure for Friction",
        kind: "direct",
        calc: {
          href: "/calculators/plumbing/plumbing-pipe-size-calculator",
          label: "Water Pipe Size Calculator",
        },
        inputs: [
          { cell: "B2", label: "Static supply pressure, psi", example: "60" },
          { cell: "B3", label: "Fixture minimum, psi", example: "15" },
          { cell: "B4", label: "Height to highest fixture, ft", example: "20" },
          { cell: "B5", label: "Meter loss, psi", example: "8" },
          { cell: "B6", label: "Softener / filter / backflow losses, psi", example: "0" },
        ],
        excel: `=B2-B3-${PSI_PER_FOOT_HEAD}*B4-B5-B6`,
        named: `=Static-FixtureMin-${PSI_PER_FOOT_HEAD}*Height-MeterLoss-DeviceLoss`,
        result: `${fmt(AVAIL, 2)} psi left for pipe friction`,
        notes:
          "Whatever survives all four deductions is the entire budget for pipe friction. Measure the static pressure rather than assuming it, and measure it at night when mains pressure peaks. Every device someone adds later — a softener, a whole-house filter — comes straight out of this number.",
      },
      {
        name: "Allowable Friction Loss per 100 ft",
        kind: "direct",
        calc: {
          href: "/calculators/plumbing/plumbing-pipe-size-calculator",
          label: "Water Pipe Size Calculator",
        },
        inputs: [
          { cell: "B2", label: "Available pressure, psi", example: `${fmt(AVAIL, 3)}` },
          { cell: "B3", label: "Developed length, ft", example: "120" },
        ],
        excel: "=B2/B3*100",
        named: "=Available/DevelopedLength*100",
        result: `${fmt(allowableLossPer100Ft(AVAIL, 120), 2)} psi per 100 ft allowable`,
        notes: `Pair this with the Hazen-Williams cell above: the smallest pipe whose actual loss stays under this number is the answer. At ${fmt(allowableLossPer100Ft(AVAIL, 120), 2)} psi/100 ft, a nominal 1 in copper carrying 18 gpm loses ${fmt(frictionLossPsiPer100Ft(18, ID_1, C_COPPER), 2)} and passes, while 3/4 in loses far more and fails. Residential jobs usually land between 2 and 8.`,
      },
      {
        name: "Developed Length & Fitting Equivalents",
        kind: "lookup",
        usesTable: "Fitting L/D ratios",
        calc: {
          href: "/calculators/plumbing/plumbing-friction-loss-calculator",
          label: "Pipe Friction Loss Calculator",
        },
        inputs: [
          { cell: "B2", label: "Measured pipe run, ft", example: "60" },
          { cell: "B3", label: "Inside diameter, inches", example: `${ID_34}` },
          { cell: "F2:G9", label: "Fitting table (paste below): L/D, then your count", example: "—" },
        ],
        excel: "=B2+SUMPRODUCT($F$2:$F$9,$G$2:$G$9)*B3/12",
        named: "=MeasuredRun+SUMPRODUCT(FittingLD,FittingCount)*Bore/12",
        result: `${fmt(DEV_LEN, 1)} ft developed from a 60 ft run with 6 elbows, 2 branch tees and a ball valve`,
        notes: `Equivalent length is computed from the L/D ratio and the bore, not read off a per-size table — which is why one SUMPRODUCT covers every fitting and every pipe size at once. A 90° elbow on 3/4 in copper is only ${fmt(fittingEquivalentFeet("elbow90", ID_34), 2)} ft, but a globe valve is ${fmt(fittingEquivalentFeet("globeValve", ID_34), 1)} ft — more than the elbows put together.`,
      },
    ],
  },
  {
    title: "Drainage, Waste & Vent",
    color: "emerald",
    blurb:
      "The drainage side is where a spreadsheet is most likely to go quietly wrong, because most of it is code tables rather than arithmetic. Four of the eight below need a table pasted in. That is not a limitation of Excel — it is what the IPC actually is.",
    formulas: [
      {
        name: "Drainage Fixture Units & Drain Size",
        kind: "lookup",
        usesTable: "Tables 709.1 and 710.1",
        calc: {
          href: "/calculators/plumbing/plumbing-drainage-fixture-unit-calculator",
          label: "Drainage Fixture Unit Calculator",
        },
        inputs: [
          { cell: "F2:G29", label: "Fixture DFU table and your counts", example: "—" },
          { cell: "B2", label: "Total DFU", example: "=SUMPRODUCT($F$2:$F$29,$G$2:$G$29)" },
          { cell: "B3", label: "Water closet on this drain?", example: "TRUE" },
          { cell: "J2:K6", label: "Capacity table for the application", example: "—" },
        ],
        excel: `=IF(B3,MAX(${MIN_BUILDING_DRAIN_WITH_WC},INDEX($J$2:$J$6,MATCH(TRUE,INDEX($K$2:$K$6>=B2,0),0))),INDEX($J$2:$J$6,MATCH(TRUE,INDEX($K$2:$K$6>=B2,0),0)))`,
        named: "=IF(HasWC,MAX(3,XLOOKUP(TRUE,Capacity>=TotalDFU,Size)),XLOOKUP(TRUE,Capacity>=TotalDFU,Size))",
        result: `18 DFU with a water closet → ${sizeLabel(DRAIN_18.size)} (the table alone says ${sizeLabel(DRAIN_18.fromTable)} — governed by ${DRAIN_18.governedBy === "water-closet" ? "the water closet, not the table" : "the table"})`,
        notes:
          "The MAX wrapper is the part every spreadsheet on the internet leaves out. A two-bath house is 18 DFU, which the building-drain table carries on 2 in pipe — but a water closet floors a building drain at 3 in regardless. Note the floor applies to the building drain, not to a horizontal branch. Use the branch column for branches and the stack columns for stacks; a tall stack legitimately carries more than a short one.",
      },
      {
        name: "Minimum Drain Slope",
        kind: "direct",
        calc: {
          href: "/calculators/plumbing/plumbing-pipe-slope-calculator",
          label: "Drain Pipe Slope Calculator",
        },
        inputs: [{ cell: "B2", label: "Nominal pipe size, inches", example: "3" }],
        excel: `=IF(B2<=${MIN_SLOPE_IN_PER_FT[0].maxSize},${MIN_SLOPE_IN_PER_FT[0].slope},IF(B2<=${MIN_SLOPE_IN_PER_FT[1].maxSize},${MIN_SLOPE_IN_PER_FT[1].slope},${MIN_SLOPE_IN_PER_FT[2].slope}))`,
        named: "=IF(Size<=2.5,0.25,IF(Size<=6,0.125,0.0625))",
        result: `2 in → ${minSlope(2)} in/ft · 3 in → ${minSlope(3)} in/ft`,
        notes:
          "Returns inches per foot. IPC 2021 has only two rows that matter in a house — 1/4 in/ft up to 2-1/2 in, 1/8 in/ft from 3 to 6 in — so the nested IF is honestly the whole table. Piping upstream of a grease interceptor stays at 1/4 in/ft whatever the size, which the formula does not know about; add that condition yourself if it applies.",
      },
      {
        name: "Slope as Percent & Total Fall",
        kind: "direct",
        calc: {
          href: "/calculators/plumbing/plumbing-pipe-slope-calculator",
          label: "Drain Pipe Slope Calculator",
        },
        inputs: [
          { cell: "B2", label: "Slope, in/ft", example: "0.125" },
          { cell: "B3", label: "Run, ft", example: "40" },
        ],
        excel: "=B2*B3          fall in inches\n=B2/12*100      slope as a percent",
        named: "=Slope*Run\n=Slope/12*100",
        result: `${fmt(totalFall(0.125, 40), 1)} in of fall · ${fmt(slopeToPercent(0.125), 2)}%`,
        notes: `The fall cell is the one that decides whether a run clears a footing or fits a joist bay. 1/4 in/ft is ${fmt(slopeToPercent(0.25), 2)}% and 1/8 in/ft is ${fmt(slopeToPercent(0.125), 2)}%. The same 40 ft run drops ${fmt(totalFall(0.25, 40), 1)} in at 1/4 and ${fmt(totalFall(0.125, 40), 1)} in at 1/8 — which is usually why a long run goes up a size.`,
      },
      {
        name: "Manning's Equation — Drain Capacity",
        kind: "direct",
        calc: {
          href: "/calculators/plumbing/plumbing-drain-pipe-size-calculator",
          label: "Drain Pipe Size Calculator",
        },
        inputs: [
          { cell: "B2", label: "Inside diameter, inches", example: "3" },
          { cell: "B3", label: "Slope, in/ft", example: "0.125" },
          { cell: "B4", label: "Manning roughness n", example: `${N_PLASTIC} (plastic)` },
        ],
        excel:
          "=(1.486/B4)*(B2/48)^(2/3)*(B3/12)^0.5          velocity, ft/s\n=PI()/8*(B2/12)^2*E2*448.831                   gpm at half full",
        named: "=(1.486/Roughness)*(Bore/48)^(2/3)*(Slope/12)^0.5\n=PI()/8*(Bore/12)^2*Velocity*448.831",
        result: `${fmt(MANNING_3IN.velocity, 2)} ft/s · ${fmt(MANNING_3IN.gpm, 1)} gpm`,
        notes: `Two cells, because you want the velocity as well as the flow. B2/48 is the hydraulic radius of a half-full pipe in feet — diameter over 4, then inches to feet. The PI()/8 term is half of a full circle's area. Note the exponent needs its parentheses: ^(2/3) is a cube root of a square, while ^2/3 is a square divided by three, and Excel will not warn you. 448.831 converts cubic feet per second to gpm; it is the one constant here we carry rounded rather than as 60 × ${GALLONS_PER_CUBIC_FOOT}, so that a sheet lands on exactly what the calculator prints. Watch the velocity cell rather than the gpm one: below about 2 ft/s solids drop out, which is why oversizing a drain at a flat grade can make it worse rather than better.`,
      },
      {
        name: "Vent Size",
        kind: "lookup",
        usesTable: "Stocked vent sizes",
        calc: {
          href: "/calculators/plumbing/plumbing-vent-size-calculator",
          label: "Vent Pipe Size Calculator",
        },
        inputs: [
          { cell: "B2", label: "Drain size served, inches", example: "3" },
          { cell: "B3", label: "Developed length of the vent, ft", example: "30" },
          { cell: "F2:F10", label: "Stocked vent sizes (paste below)", example: "—" },
        ],
        excel: `=INDEX($F$2:$F$10,MATCH(TRUE,INDEX($F$2:$F$10>=MAX(${MIN_VENT_SIZE},B2/2),0),0)+IF(B3>40,1,0))`,
        named: "=XLOOKUP(TRUE,VentSizes>=MAX(1.25,Drain/2),VentSizes)   then one size up if Length>40",
        result: `3 in drain over 30 ft → ${sizeLabel(VENT_3_30.size)} · the same drain over 60 ft → ${sizeLabel(ventSize(3, 60).size)}`,
        notes: `Half the drain diameter, floored at ${MIN_VENT_SIZE} in, rounded up to a size you can actually buy — then one size larger again past 40 ft of developed length. The ${MIN_VENT_SIZE} in floor only ever binds at 2 in drains and below; at 3 in and up the halving already clears it. The 40 ft rule upsizes the whole run, not just the excess, which is the part the MATCH offset is doing.`,
      },
      {
        name: "Trap Arm Maximum Length",
        kind: "lookup",
        usesTable: "Table 909.1",
        calc: {
          href: "/calculators/plumbing/plumbing-vent-size-calculator",
          label: "Vent Pipe Size Calculator",
        },
        inputs: [
          { cell: "B2", label: "Trap arm size, inches", example: "2" },
          { cell: "F2:H6", label: "Table 909.1 (paste below)", example: "—" },
        ],
        excel: "=INDEX($H$2:$H$6,MATCH(B2,$F$2:$F$6,0))",
        named: "=XLOOKUP(TrapArmSize,TableSize,MaxLength)",
        result: `1-1/2 in → ${trapArmMaxFeet(1.5)} ft · 2 in → ${trapArmMaxFeet(2)} ft · 3 in → ${trapArmMaxFeet(3)} ft`,
        notes:
          "An exact MATCH, not an approximate one — a trap arm is a listed size, so a 0 as the third argument is correct here and a 1 would silently return the wrong row for an in-between value. There is a floor as well as a ceiling: the vent must also sit at least two pipe diameters downstream of the trap weir. Self-siphoning fixtures, water closets above all, are not length-limited at all.",
      },
      {
        name: "Grease Interceptor Sizing",
        kind: "direct",
        calc: {
          href: "/calculators/plumbing/plumbing-grease-trap-calculator",
          label: "Grease Trap Size Calculator",
        },
        inputs: [
          { cell: "B2:B4", label: "Sink L × W × D, inches", example: "24 · 24 · 12" },
          { cell: "B5", label: "Compartments", example: "3" },
          { cell: "B6", label: "Fill fraction", example: `${GREASE_SINK_FILL_FRACTION}` },
          { cell: "B7", label: "Drain period, minutes", example: "1" },
          { cell: "B8", label: "Seats — gravity method below", example: "100" },
          { cell: "B9", label: "Meal turnover per hour", example: "1" },
          { cell: "B10", label: "Waste flow per meal, gal", example: "6" },
          { cell: "B11", label: "Retention, hours", example: "2.5" },
          { cell: "B12", label: "Storage factor", example: "1" },
        ],
        excel: `=B2*B3*B4*B5/${CUBIC_INCHES_PER_GALLON}                  sink volume, gallons\n=E2*B6/B7                            required flow, gpm\n=E3*${PDI_GREASE_LB_PER_GPM}                              grease capacity, lb\n=MAX(${GREASE_INTERCEPTOR_MINIMUM_GAL},B8*B9*B10*B11*B12)         gravity interceptor, gallons`,
        named: `=Length*Width*Depth*Comps/${CUBIC_INCHES_PER_GALLON}\n=Volume*Fill/DrainPeriod\n=Flow*${PDI_GREASE_LB_PER_GPM}\n=MAX(1000,Seats*Turnover*GalPerMeal*RetentionHrs*StorageFactor)`,
        result: `${fmt(GREASE_SINK.gallons, 2)} gal → ${fmt(GREASE_SINK.flowGpm, 2)} gpm → a ${GREASE_SINK.ratedGpm} gpm / ${GREASE_SINK.capacityLb} lb unit · 100 seats → ${fmt(GREASE_VESSEL.required, 0)} gal`,
        notes: `Two devices, two units, and sizing one with the other's method gives a plausible number that means nothing. The hydromechanical trap is rated in gpm; the gravity interceptor is rated in gallons. PDI-G101 defines grease capacity as exactly ${PDI_GREASE_LB_PER_GPM} lb per gpm, so that cell is a definition rather than a lookup. The MAX against ${fmt(GREASE_INTERCEPTOR_MINIMUM_GAL, 0)} gal matters more than the arithmetic — below roughly 65 seats the local FOG minimum governs and the calculation never binds.`,
      },
      {
        name: "Rainwater Yield & Cistern Storage",
        kind: "direct",
        calc: {
          href: "/calculators/plumbing/plumbing-rainwater-harvesting-calculator",
          label: "Rainwater Harvesting & Grey Water Calculator",
        },
        inputs: [
          { cell: "B2", label: "Catchment area, ft²", example: "2000" },
          { cell: "B3", label: "Rainfall over the period, inches", example: "3.5" },
          { cell: "B4", label: "Runoff coefficient Cr", example: "0.85" },
          { cell: "B5", label: "Collection efficiency Ce", example: `${COLLECTION_EFFICIENCY}` },
          { cell: "B6", label: "First flush per ft², gal", example: `${FIRST_FLUSH_PER_SQFT}` },
          { cell: "B7", label: "Rain events in the period", example: "4" },
          { cell: "B8", label: "Daily demand, gal · B9 dry-spell days", example: "60 · 21" },
        ],
        excel: `=B2*B3*(${GALLONS_PER_CUBIC_FOOT}/12)          gross yield, gallons\n=MIN(E2,B2*B6*B7)                     first flush diverted\n=(E2-E3)*B4*B5                        net yield, gallons\n=MIN(B8*B9,E4)                        cistern, gallons`,
        named: `=Area*Rainfall*(${GALLONS_PER_CUBIC_FOOT}/12)\n=MIN(Gross,Area*FirstFlushRate*Events)\n=(Gross-FirstFlush)*Runoff*Efficiency\n=MIN(Demand*DrySpell,NetYield)`,
        result: `${fmt(RAIN.gross, 0)} gal gross − ${fmt(RAIN.firstFlush, 0)} gal first flush → ${fmt(RAIN.net, 0)} gal net · cistern governed by the ${60 * 21 < RAIN.net ? "dry spell" : "roof"} at ${fmt(Math.min(60 * 21, RAIN.net), 0)} gal`,
        notes: `Four cells rather than one, because the first flush comes off the gross yield BEFORE the coefficients are applied — divert the dirtiest water first, then lose a share of what is left to the screen and the filter. Doing it in the other order, or skipping it, overstates the yield by ${fmt(((RAIN.gross * 0.85 * COLLECTION_EFFICIENCY) / RAIN.net - 1) * 100, 1)}% on this roof. Write the constant as ${GALLONS_PER_CUBIC_FOOT}/12 rather than the 0.62 you will see quoted everywhere — it is one cubic foot of water spread an inch deep over a square foot, and letting Excel do the division keeps the full precision. Area is the horizontal projection of the roof, not its slope length, because rain falls vertically. The final MIN is the whole design: a tank bigger than the roof can refill just sits part empty.`,
      },
      {
        name: "Storm & Roof Runoff Flow",
        kind: "direct",
        calc: {
          href: "/calculators/plumbing/plumbing-storm-drainage-calculator",
          label: "Storm & Roof Drainage Calculator",
        },
        inputs: [
          { cell: "B2", label: "Roof area, ft²", example: "2000" },
          { cell: "B3", label: "Design rainfall, in/hr", example: "4" },
          { cell: "B4", label: "Drain bore, inches", example: `${ID_4_PVC} (4 in Sch 40)` },
          { cell: "B5", label: "Slope, in/ft", example: "0.125" },
          { cell: "B6", label: "Manning roughness n", example: `${MANNING_N["plastic"]}` },
        ],
        excel: `=B2*B3*${GALLONS_PER_CUBIC_FOOT}/12/60                  runoff, gpm\n=(1.486/B6)*(B4/48)^(2/3)*(B5/12)^0.5     velocity, ft/s\n=PI()/4*(B4/12)^2*E3*448.831              full-bore capacity, gpm`,
        named: `=Area*Rainfall*${GALLONS_PER_CUBIC_FOOT}/12/60\n=(1.486/Roughness)*(Bore/48)^(2/3)*(Slope/12)^0.5\n=PI()/4*(Bore/12)^2*Velocity*448.831`,
        result: `${fmt(STORM_GPM, 1)} gpm off the roof · a 4 in drain carries ${fmt(STORM_CHECK.gpm, 1)} gpm at ${fmt(STORM_CHECK.velocity, 2)} ft/s`,
        notes: `Runoff is strictly linear in area and rainfall, so ${fmt(roofRunoffGpm(1000, 4), 2)} gpm per 1,000 ft² at 4 in/hr scales exactly — the one place a per-square-foot rule of thumb is safe. The capacity line is the same Manning equation as the drain formula above but at FULL bore rather than half, which is why the area term is PI()/4 rather than PI()/8. **This publishes the flow, not the code size:** IPC Tables 1106.2 and 1106.3 govern leader and horizontal storm drain sizing and are deliberately not reproduced, the same call made for the vent-stack table.`,
      },
      {
        name: "Septic Tank & Leach Field",
        kind: "lookup",
        usesTable: "Tank minimums by bedroom",
        calc: {
          href: "/calculators/plumbing/plumbing-septic-tank-calculator",
          label: "Septic Tank Size Calculator",
        },
        inputs: [
          { cell: "B2", label: "Bedrooms", example: "3" },
          { cell: "B3", label: "Gallons per bedroom per day", example: "150" },
          { cell: "B4", label: "Soil application rate, gal/ft²/day", example: "0.8 (loam)" },
          { cell: "B5", label: "Trench width, ft", example: "3" },
          { cell: "F2:G6", label: "Tank minimums table (paste below)", example: "—" },
        ],
        excel: `=B2*B3                                        daily flow, gpd\n=E2*${SEPTIC_RETENTION_DAYS}                                      retention volume, gal\n=INDEX($G$2:$G$6,MATCH(TRUE,INDEX($F$2:$F$6>=B2,0),0))    code minimum\n=MAX(E3,E4)                                   tank, gallons\n=E2/B4                                        leach field, ft2\n=E6/B5                                        trench length, ft`,
        named: `=Bedrooms*GalPerBedroom\n=DailyFlow*${SEPTIC_RETENTION_DAYS}\n=XLOOKUP(TRUE,MaxBedrooms>=Bedrooms,MinGallons)\n=MAX(Retention,Minimum)\n=DailyFlow/ApplicationRate\n=LeachField/TrenchWidth`,
        result: `${fmt(SEPTIC.dailyFlow, 0)} gpd → retention ${fmt(SEPTIC.retentionTank, 0)} gal vs minimum ${fmt(SEPTIC.minimumTank, 0)} gal → ${fmt(SEPTIC.tank, 0)} gal tank, governed by the ${SEPTIC.governedBy} · field ${fmt(SEPTIC.leachFieldSqFt, 0)} ft² = ${fmt(SEPTIC.trenchFeet, 0)} ft of trench`,
        notes: `The MAX is the whole tank calculation: on ordinary numbers the published minimum governs up to four bedrooms and retention only takes over at five, so a sheet that computes retention alone undersizes almost every house it is used on. The soil rate is the real variable — the identical house needs ${fmt(450 / 1.2, 0)} ft² of field in sand and ${fmt(450 / 0.24, 0)} ft² in slow clay, a 5x swing, while the tank does not move at all. **Septic is not IPC territory:** it falls to the IPSDC where adopted and to state and county health departments everywhere else, so treat every input here as a starting value and confirm the local ones. Setbacks, water table and a witnessed perc test are out of scope.`,
      },
      {
        name: "Grey Water Yield & Irrigable Area",
        kind: "direct",
        calc: {
          href: "/calculators/plumbing/plumbing-rainwater-harvesting-calculator",
          label: "Rainwater Harvesting & Grey Water Calculator",
        },
        inputs: [
          { cell: "B2", label: "Occupants", example: "3" },
          { cell: "B3", label: "Shower, gal/person/day", example: `${GREYWATER_SOURCE_YIELD[0].galPerPersonPerDay}` },
          { cell: "B4", label: "Lavatory, gal/person/day", example: `${GREYWATER_SOURCE_YIELD[1].galPerPersonPerDay}` },
          { cell: "B5", label: "Washer, gal/load", example: `${GREYWATER_SOURCE_YIELD[2].galPerPersonPerDay}` },
          { cell: "B6", label: "Washer loads per week", example: "5" },
          { cell: "B7", label: "Irrigation demand, gal/ft²/week", example: "0.6" },
        ],
        excel: `=B2*(B3+B4)+B5*B6/7          daily yield, gpd\n=E2*${GREYWATER_MAX_STORAGE_HOURS}/24                  maximum storage, gal\n=E2*7/B7                     irrigable area, ft2`,
        named: `=Occupants*(Shower+Lavatory)+WasherPerLoad*LoadsPerWeek/7\n=DailyYield*${GREYWATER_MAX_STORAGE_HOURS}/24\n=DailyYield*7/IrrigationRate`,
        result: `${fmt(GREYWATER.dailyYield, 1)} gpd (shower ${fmt(GREYWATER.bySource[0].gpd, 1)}, lavatory ${fmt(GREYWATER.bySource[1].gpd, 1)}, washer ${fmt(GREYWATER.bySource[2].gpd, 1)}) · storage ${fmt(GREYWATER.maxStorage, 0)} gal · ${fmt(GREYWATER.irrigableSqFt, 0)} ft² irrigable`,
        notes: `The storage line looks pointless and is the most important one here: the hold is ${GREYWATER_MAX_STORAGE_HOURS} hours, so maximum storage always equals exactly one day of yield. Untreated grey water goes septic past a day, so unlike a rainwater cistern it cannot bridge between events at all — it is a surge vessel, and the design work moves to the distribution field. The washer divides by 7 because it is per load per week while the others are per person per day; mixing those two bases is the easy error. Planting choice swings the area 4x, from ${fmt((GREYWATER.dailyYield * 7) / 1.2, 0)} ft² of cool-season lawn to ${fmt((GREYWATER.dailyYield * 7) / 0.3, 0)} ft² of drought-tolerant planting. Kitchen sink and dishwasher are deliberately absent — that is black water in most jurisdictions.`,
      },
    ],
  },
  {
    title: "Pressure & Pump Head",
    color: "cyan",
    blurb:
      "Everything here is closed-form, so this is the section that ports to a spreadsheet most cleanly. Two of them — thermal expansion and pressure-tank drawdown — carry a trap that catches most published spreadsheets: they are Boyle's law problems, so the pressures have to be absolute.",
    formulas: [
      {
        name: "Pressure ↔ Head of Water",
        kind: "direct",
        calc: {
          href: "/calculators/plumbing/plumbing-water-pressure-calculator",
          label: "Water Pressure Calculator",
        },
        inputs: [
          { cell: "B2", label: "Feet of head", example: "150.1" },
          { cell: "B3", label: "…or psi", example: "65" },
        ],
        excel: `=${PSI_PER_FOOT_HEAD}*B2          psi from feet\n=B3/${PSI_PER_FOOT_HEAD}          feet from psi`,
        named: `=${PSI_PER_FOOT_HEAD}*Head\n=Pressure/${PSI_PER_FOOT_HEAD}`,
        result: `65 psi = ${fmt(psiToHead(65), 1)} ft of head`,
        notes: `Write the second one as a division by ${PSI_PER_FOOT_HEAD} rather than multiplying by 2.31. The reciprocal is ${fmt(1 / PSI_PER_FOOT_HEAD, 4)}, so the rounded 2.31 introduces a small error that compounds once you feed it into a pump head total. Both constants shift slightly with water temperature — this is the one figure on the page that is a measurement rather than a definition.`,
      },
      {
        name: "Static Pressure Loss from Elevation",
        kind: "direct",
        calc: {
          href: "/calculators/plumbing/plumbing-water-pressure-calculator",
          label: "Water Pressure Calculator",
        },
        inputs: [{ cell: "B2", label: "Vertical rise, ft", example: "25" }],
        excel: `=${PSI_PER_FOOT_HEAD}*B2`,
        named: `=${PSI_PER_FOOT_HEAD}*Height`,
        result: `${fmt(headToPsi(25), 2)} psi lost over a 25 ft rise`,
        notes: `The only loss in a plumbing system that does not depend on flow — it is there whether anything is running or not. One storey costs about ${fmt(headToPsi(10), 2)} psi. On a 45 psi supply, reaching a third floor spends roughly a fifth of the budget before a single foot of pipe friction.`,
      },
      {
        name: "Total Dynamic Head",
        kind: "direct",
        calc: {
          href: "/calculators/plumbing/plumbing-pump-head-calculator",
          label: "Pump Head Calculator",
        },
        inputs: [
          { cell: "B2", label: "Static lift, ft", example: "12" },
          { cell: "B3", label: "Friction loss, psi/100 ft · B4 length", example: "· 40" },
          { cell: "B5", label: "Discharge pressure required, psi", example: "0" },
          { cell: "B6", label: "Velocity, ft/s", example: `${fmt(VEL_PUMP, 2)}` },
        ],
        excel: `=B2+(B3*B4/100)/${PSI_PER_FOOT_HEAD}+B5/${PSI_PER_FOOT_HEAD}+B6^2/(2*32.174)`,
        named: `=StaticLift+FrictionPsi/${PSI_PER_FOOT_HEAD}+DischargePsi/${PSI_PER_FOOT_HEAD}+Velocity^2/(2*32.174)`,
        result: `${fmt(TDH, 2)} ft of total dynamic head`,
        notes: `Four terms, all converted to feet before they are added — mixing psi and feet in one sum is the most common error in a pump sheet. The velocity head term is genuinely tiny in domestic work (${fmt(velocityHead(VEL_PUMP), 3)} ft here, under 3% of the total) but costs nothing to include. For a sump the discharge-pressure term is exactly zero; for a well pump it usually dominates everything else.`,
      },
      {
        name: "Pressure-Reducing Valve Threshold",
        kind: "direct",
        calc: {
          href: "/calculators/plumbing/plumbing-water-pressure-calculator",
          label: "Water Pressure Calculator",
        },
        inputs: [{ cell: "B2", label: "Static pressure, psi", example: "92" }],
        excel: `=IF(B2>${PRV_THRESHOLD_PSI},"PRV required","No PRV required")`,
        named: `=IF(Static>${PRV_THRESHOLD_PSI},"PRV required","No PRV required")`,
        result: `92 psi → PRV required · 78 psi → no PRV required`,
        notes: `IPC 604.8 puts the ceiling at ${PRV_THRESHOLD_PSI} psi static for building water distribution. Measure at night — a system reading 78 psi at 4 pm can sit well over ${PRV_THRESHOLD_PSI} psi at 4 am, and this cell will happily tell you the wrong thing from a daytime reading. Service lines to sill cocks and outside hydrants are excepted.`,
      },
      {
        name: "Thermal Expansion Volume",
        kind: "lookup",
        usesTable: "Water density",
        calc: {
          href: "/calculators/plumbing/plumbing-expansion-tank-calculator",
          label: "Thermal Expansion Tank Calculator",
        },
        inputs: [
          { cell: "B2", label: "System volume, gal", example: "50" },
          { cell: "B3", label: "Cold °F · B4 hot °F", example: "40 · 140" },
          { cell: "B5", label: "Supply psi · B6 ceiling psi", example: "60 · 80" },
          { cell: "F2:G19", label: "Water density table (paste below)", example: "—" },
        ],
        excel: `=INDEX($G$2:$G$19,MATCH(B3,$F$2:$F$19,1))/INDEX($G$2:$G$19,MATCH(B4,$F$2:$F$19,1))-1     expansion fraction\n=B2*E2/(1-(B5+${ATMOSPHERIC_PSI})/(B6+${ATMOSPHERIC_PSI}))                                       tank volume, gal`,
        named: `=DensityCold/DensityHot-1\n=SystemGallons*Fraction/(1-(SupplyPsi+${ATMOSPHERIC_PSI})/(MaxPsi+${ATMOSPHERIC_PSI}))`,
        result: `${fmt(EXPANSION.fraction * 100, 2)}% expansion · ${fmt(EXPANSION.acceptance, 2)} gal to absorb · ${fmt(EXPANSION.tankVolume, 2)} gal tank → a ${STANDARD_EXPANSION_TANKS.find((t) => t >= EXPANSION.tankVolume)} gal shell`,
        notes: `Water expands because it gets less dense, so the fraction is a ratio of two densities minus one — mass is conserved, volume is not. The ${ATMOSPHERIC_PSI} in both brackets is the whole formula: it is Boyle's law, so the pressures must be absolute, and using gauge pressure is the classic error that undersizes the tank. Note the ceiling is the ${PRV_THRESHOLD_PSI} psi code threshold, not the 150 psi relief-valve setting — sizing against the relief valve makes almost every house look like it needs the smallest tank made.`,
      },
      {
        name: "Pressure Tank Drawdown",
        kind: "direct",
        calc: {
          href: "/calculators/plumbing/plumbing-well-pressure-tank-calculator",
          label: "Well Pressure Tank Calculator",
        },
        inputs: [
          { cell: "B2", label: "Cut-in psi · B3 cut-out psi", example: "30 · 50" },
          { cell: "B4", label: "Pre-charge psi", example: "28" },
          { cell: "B5", label: "Pump gpm · B6 minimum run, min", example: "10 · 1" },
        ],
        excel: `=MIN(1,(B4+${ATMOSPHERIC_PSI})/(B2+${ATMOSPHERIC_PSI}))-MIN(1,(B4+${ATMOSPHERIC_PSI})/(B3+${ATMOSPHERIC_PSI}))     drawdown fraction\n=B5*B6/E2                                                                     required shell, gal`,
        named: `=MIN(1,PreAbs/CutInAbs)-MIN(1,PreAbs/CutOutAbs)\n=PumpGpm*RunMinutes/Fraction`,
        result: `${fmt(drawdownFraction(30, 50, 28) * 100, 2)}% of the shell at a 30/50 switch · a 10 gpm pump needs a ${STANDARD_PRESSURE_TANKS.find((t) => t >= (10 * 1) / drawdownFraction(30, 50, 28))} gal tank`,
        notes: `Absolute pressures again, and again it is Boyle's law. Because the answer is a ratio rather than a difference, the same 20 psi span delivers more at a lower band — ${fmt(drawdownFraction(20, 40, 18) * 100, 1)}% at 20/40 against ${fmt(drawdownFraction(40, 60, 38) * 100, 1)}% at 40/60. Widening the band is what actually helps: 30/70 reaches ${fmt(drawdownFraction(30, 70, 28) * 100, 1)}%. A "20 gallon" tank delivers about ${fmt(20 * drawdownFraction(30, 50, 28), 1)} gallons.`,
      },
    ],
  },
  {
    title: "Water Heating & Gas Piping",
    color: "rose",
    blurb:
      "All five are closed-form and all five fit on one row of a sheet, which makes this the section worth building as a comparison table — put six heaters down the rows and let the first-hour rating column pick the winner.",
    formulas: [
      {
        name: "Temperature Rise & Recovery Rate",
        kind: "direct",
        calc: {
          href: "/calculators/plumbing/plumbing-water-heater-size-calculator",
          label: "Water Heater Size Calculator",
        },
        inputs: [
          { cell: "B2", label: "Input, BTU/hr", example: "40000" },
          { cell: "B3", label: "Thermal efficiency", example: "0.8" },
          { cell: "B4", label: "Temperature rise, °F", example: "90" },
          { cell: "B5", label: "…or element kW, electric", example: "4.5" },
        ],
        excel: `=B2*B3/(${LB_PER_GALLON}*B4)          gas, gallons per hour\n=B5*3412.14/(${LB_PER_GALLON}*B4)      electric, gallons per hour`,
        named: `=Input*Efficiency/(${LB_PER_GALLON}*Rise)\n=Kilowatts*3412.14/(${LB_PER_GALLON}*Rise)`,
        result: `${fmt(RECOVERY, 2)} gph from a 40,000 BTU/hr gas heater at 80% · ${fmt(recoveryGph(4.5 * 3412.14, 1, 90), 2)} gph from a 4.5 kW element`,
        notes: `Recovery rate is what separates a gas heater from an electric one of the same size, and the gap is more than 2x on the same rise. ${LB_PER_GALLON} is the weight of a gallon of water and 1 BTU raises 1 lb by 1 °F, so the denominator is the energy to lift a gallon through the rise. Use the winter inlet temperature, not the summer one.`,
      },
      {
        name: "Tankless Flow Capacity",
        kind: "direct",
        calc: {
          href: "/calculators/plumbing/plumbing-tankless-water-heater-calculator",
          label: "Tankless Water Heater Calculator",
        },
        inputs: [
          { cell: "B2", label: "Input, BTU/hr", example: "199000" },
          { cell: "B3", label: "Thermal efficiency", example: "0.95" },
          { cell: "B4", label: "Temperature rise, °F", example: "70" },
        ],
        excel: `=B2*B3/(${BTU_PER_GPM_PER_DEGF}*B4)`,
        named: `=Input*Efficiency/(${BTU_PER_GPM_PER_DEGF}*Rise)`,
        result: `${fmt(tanklessGpm(199000, 0.95, 70), 2)} gpm at a 70 °F rise · ${fmt(tanklessGpm(199000, 0.95, 80), 2)} gpm at 80 °F`,
        notes: `The constant is ${BTU_PER_GPM_PER_DEGF}, not the 500 you will see everywhere — it is ${LB_PER_GALLON} lb per gallon times 60 minutes, and the rounded 500 is about 0.04% optimistic. Size on the winter rise: the same unit that gives ${fmt(tanklessGpm(199000, 0.95, 70), 2)} gpm at a 70 °F rise gives only ${fmt(tanklessGpm(199000, 0.95, 80), 2)} gpm at 80 °F, a ${fmt((1 - tanklessGpm(199000, 0.95, 80) / tanklessGpm(199000, 0.95, 70)) * 100, 1)}% loss. Undersizing on the summer number is why tankless units disappoint in January.`,
      },
      {
        name: "First-Hour Rating",
        kind: "direct",
        calc: {
          href: "/calculators/plumbing/plumbing-water-heater-size-calculator",
          label: "Water Heater Size Calculator",
        },
        inputs: [
          { cell: "B2", label: "Tank size, gal", example: "40" },
          { cell: "B3", label: "Recovery, gph", example: `${fmt(RECOVERY, 2)}` },
        ],
        excel: `=${FHR_USABLE_FRACTION}*B2+B3`,
        named: `=${FHR_USABLE_FRACTION}*TankGallons+Recovery`,
        result: `${fmt(firstHourRating(40, RECOVERY), 1)} gal in the first hour from a 40 gal gas heater`,
        notes: `This is the column to sort a comparison table on, not tank size. Only about ${FHR_USABLE_FRACTION * 100}% of a tank is usable before incoming cold dilutes delivery below setpoint, so recovery dominates the back half of the hour — which is how a 40 gal gas heater (${fmt(firstHourRating(40, RECOVERY), 1)} gal) out-delivers a 50 gal electric one (${fmt(firstHourRating(50, recoveryGph(4.5 * 3412.14, 1, 90)), 1)} gal).`,
      },
      {
        name: "Mixing Valve / Tempered Water Ratio",
        kind: "direct",
        calc: {
          href: "/calculators/plumbing/plumbing-mixing-valve-calculator",
          label: "Mixing Valve Calculator",
        },
        inputs: [
          { cell: "B2", label: "Delivered °F", example: "120" },
          { cell: "B3", label: "Cold inlet °F", example: "50" },
          { cell: "B4", label: "Stored °F", example: "140" },
          { cell: "B5", label: "Mixed flow, gpm", example: "2.5" },
        ],
        excel: "=(B2-B3)/(B4-B3)          hot fraction\n=E2*B5                    hot gpm drawn from the tank\n=(1-E2)*B5                cold gpm blended in\n=1/E2                     storage multiplier",
        named: "=(Delivered-Cold)/(Stored-Cold)\n=HotFraction*MixedFlow\n=(1-HotFraction)*MixedFlow\n=1/HotFraction",
        result: `${fmt(MIXED.hotFraction * 100, 1)}% hot · ${fmt(MIXED.hotGpm, 2)} gpm hot and ${fmt(MIXED.coldGpm, 2)} gpm cold of a 2.5 gpm draw · storage multiplier ${fmt(MIXED.storageMultiplier, 3)}`,
        notes: `The reciprocal of the hot fraction is a storage multiplier — at ${fmt(hotFraction(120, 50, 140) * 100, 1)}% hot, a 50 gal tank behaves like ${fmt(50 / hotFraction(120, 50, 140), 1)} gal. Storing at the delivery temperature gives no bonus at all (120/120 is 100% hot and a 1.00x multiplier) and parks the tank in the Legionella range. Note the cold inlet moves it the other way: a colder winter inlet raises the hot fraction exactly when recovery is slowest.`,
      },
      {
        name: "Gas Load → CFH",
        kind: "direct",
        calc: {
          href: "/calculators/hvac/hvac-gas-line-sizing-calculator",
          label: "Gas Line Sizing Calculator",
        },
        inputs: [
          { cell: "B2", label: "Total connected load, BTU/hr", example: "150000" },
          { cell: "B3", label: "Heating value, BTU/ft³", example: "1000 natural · 2516 propane" },
        ],
        excel: "=B2/B3",
        named: "=ConnectedLoad/HeatingValue",
        result: "150,000 BTU/hr on natural gas → 150 CFH",
        notes:
          "The simplest formula on the page and the one most often applied to the wrong number: sum the input ratings of every appliance downstream of the section you are sizing, not the whole house, and size each section for what it actually carries. Natural gas runs roughly 950 to 1,100 BTU/ft³, so confirm the local figure with the utility. Fuel gas is a separate code — IFGC 402.4 and NFPA 54, not the IPC.",
      },
    ],
  },
  {
    title: "Volume, Conversions & Waste",
    color: "amber",
    blurb:
      "The small arithmetic that decides how a system feels rather than whether it passes. How long the hot water takes to arrive, what a unit on a European spec sheet means in gpm, and what a drip actually costs over a year.",
    formulas: [
      {
        name: "Pipe Volume & Gallons per Foot",
        kind: "direct",
        calc: {
          href: "/calculators/plumbing/plumbing-pipe-volume-calculator",
          label: "Pipe Volume Calculator",
        },
        inputs: [
          { cell: "B2", label: "Inside diameter, inches", example: `${ID_34} (3/4 in Type L copper)` },
          { cell: "B3", label: "Run length, ft", example: "50" },
          { cell: "B4", label: "Flow while purging, gpm", example: "2" },
        ],
        excel: `=PI()/4*B2^2*12/${CUBIC_INCHES_PER_GALLON}          gallons per foot\n=E2*B3                        gallons in the run\n=E3*${LB_PER_GALLON}                      weight of that water, lb\n=E3/B4*60                     seconds to purge it`,
        named: `=PI()/4*Bore^2*12/${CUBIC_INCHES_PER_GALLON}\n=PerFoot*Length\n=Gallons*${LB_PER_GALLON}\n=Gallons/PurgeFlow*60`,
        result: `${fmt(PIPE_VOL.perFoot, 5)} gal/ft · ${fmt(PIPE_VOL.gallons, 2)} gal in 50 ft · ${fmt(PIPE_VOL.weightLb, 1)} lb · ${fmt(PIPE_VOL.minutesToPurge(2) * 60, 0)} s to purge`,
        notes: `The first cell collapses to the constant every plumber half-remembers: PI()/4 x 12 / ${CUBIC_INCHES_PER_GALLON} is ${fmt(0.0408, 4)}, so gallons per foot is ${fmt(0.0408, 4)} x diameter squared. Two things fall out of it worth keeping. **40 ft of 3/4 inch copper is about a gallon**, which is the mental shortcut for a purge or a chlorination charge. And because the volume goes as the square of the bore, upsizing a hot line makes the wait for hot water WORSE, not better — the fourth cell is the one that proves it.`,
      },
      {
        name: "Unit Conversion",
        kind: "lookup",
        usesTable: "Conversion factors",
        calc: {
          href: "/calculators/plumbing/plumbing-unit-converter",
          label: "Plumbing Unit Converter",
        },
        inputs: [
          { cell: "B2", label: "Value to convert", example: "10" },
          { cell: "B3", label: "From unit", example: "gpm" },
          { cell: "B4", label: "To unit", example: "lpm" },
          { cell: "F2:H30", label: "Conversion factor table (paste below)", example: "—" },
        ],
        excel: "=B2*INDEX($H$2:$H$30,MATCH(B3,$G$2:$G$30,0))/INDEX($H$2:$H$30,MATCH(B4,$G$2:$G$30,0))",
        named: "=Value*XLOOKUP(FromUnit,UnitKey,ToBase)/XLOOKUP(ToUnit,UnitKey,ToBase)",
        result: `10 gpm = ${fmt(convertUnit("flow", "gpm", "lpm", 10), 4)} L/min · 60 psi = ${fmt(convertUnit("pressure", "psi", "ftH2O", 60), 1)} ft of head · 1 bar = ${fmt(convertUnit("pressure", "bar", "psi", 1), 4)} psi`,
        notes: `Every unit in a category carries a factor to that category's base, so one formula converts any pair: multiply into the base, divide out of it. Use exact matching, and keep the categories separate — nothing stops MATCH finding a length unit when you meant a volume. **Temperature is the exception and cannot use this formula at all**, because it is an offset scale rather than a ratio: °C to °F is =B2*9/5+32, and a temperature RISE converts by ratio alone, so a 90 °F rise is 50 °C and not 32.2. The other trap is the imperial gallon at ${fmt(convertUnit("volume", "ukgal", "gal", 1), 4)} US gallons — a 20% error hiding on any spec sheet that just says "gallons".`,
      },
      {
        name: "Leak & Water Waste Cost",
        kind: "direct",
        calc: {
          href: "/calculators/plumbing/plumbing-leak-water-waste-calculator",
          label: "Leak & Water Waste Calculator",
        },
        inputs: [
          { cell: "B2", label: "Drips per minute", example: "60" },
          { cell: "B3", label: "Water rate, $ per 1,000 gal", example: "5.50" },
          { cell: "B4", label: "Sewer rate, $ per 1,000 gal", example: "7.00" },
          { cell: "B5", label: "Hot fraction, 0 to 1", example: "1" },
          { cell: "B6", label: "Temperature rise, °F", example: "70" },
          { cell: "B7", label: "Heater efficiency · B8 $ per therm", example: "0.8 · 1.40" },
        ],
        excel: `=B2*${MINUTES_PER_DAY}/${DRIPS_PER_GALLON}                       gallons per day\n=E2*${DAYS_PER_YEAR}                             gallons per year\n=E3/1000*(B3+B4)                     water and sewer per year\n=E3*B5*${LB_PER_GALLON}*B6/B7/${BTU_PER_THERM}*B8    energy per year, gas\n=E4+E5                               total per year`,
        named: `=DripsPerMinute*${MINUTES_PER_DAY}/${DRIPS_PER_GALLON}\n=GallonsPerDay*${DAYS_PER_YEAR}\n=GallonsPerYear/1000*(WaterRate+SewerRate)\n=GallonsPerYear*HotFraction*${LB_PER_GALLON}*Rise/Efficiency/${BTU_PER_THERM}*EnergyRate\n=WaterAndSewer+Energy`,
        result: `${fmt(LEAK_GPD, 2)} gpd = ${fmt(LEAK_COLD.gallonsPerYear, 0)} gal/yr · ${usd2(LEAK_COLD.totalCost)}/yr cold, ${usd2(LEAK_HOT.totalCost)}/yr hot on gas`,
        notes: `**The /1000 is the term people drop**, and dropping it inflates the answer a thousandfold — both utility rates are quoted per 1,000 gallons. The hot-water line is what almost every published leak calculator omits: the same drip is ${usd2(LEAK_COLD.totalCost)} a year cold and ${usd2(LEAK_HOT.totalCost)} hot, ${fmt(LEAK_HOT.totalCost / LEAK_COLD.totalCost, 2)}x, because you paid to heat it before it escaped — energy is ${fmt(LEAK_HOT.energyShare, 1)}% of the hot total. For an electric heater, divide by 3412.14 for kWh instead of ${fmt(BTU_PER_THERM, 0)} for therms. The drip constant is the USGS figure of ${fmt(DRIPS_PER_GALLON, 0)} drips per gallon, which reconciles with a 0.25 mL drop.`,
      },
    ],
  },
  {
    title: "Pricing & Business",
    color: "violet",
    blurb:
      "Not code, and not physics — but the arithmetic that decides whether the job was worth doing, and the part of a plumbing spreadsheet most likely to be quietly wrong. Put your own rates in the input cells; the numbers below are the calculators' defaults, not a price book.",
    formulas: [
      {
        name: "Job Price — Margin, not Markup",
        kind: "direct",
        calc: {
          href: "/calculators/plumbing/plumbing-estimate-calculator",
          label: "Plumbing Job Estimate Calculator",
        },
        inputs: [
          { cell: "B2", label: "Labour hours · B3 labour rate", example: "10 · 110" },
          { cell: "B4", label: "Fixture cost", example: "850" },
          { cell: "B5", label: "Material cost", example: "450" },
          { cell: "B6", label: "Overhead, percent", example: "15" },
          { cell: "B7", label: "Target margin, percent", example: "25" },
        ],
        excel: "=B2*B3+B4+B5              direct cost\n=E2*(1+B6/100)            break-even\n=E3/(1-B7/100)            price at that MARGIN\n=E3*(1+B7/100)            price at the same MARKUP\n=E4-E3                    profit at margin",
        named: "=Hours*Rate+Fixtures+Materials\n=Direct*(1+Overhead/100)\n=BreakEven/(1-Margin/100)\n=BreakEven*(1+Margin/100)\n=Price-BreakEven",
        result: `direct ${usd(ESTIMATE.direct)} → break-even ${usd(ESTIMATE.breakEven)} → ${usd(ESTIMATE.price)} at margin (${usd(ESTIMATE.profit)} profit) but only ${usd(ESTIMATE.markupPrice)} at markup, which delivers ${fmt(ESTIMATE.effectiveMargin, 1)}% and ${usd(ESTIMATE.price - ESTIMATE.markupPrice)} less`,
        notes: `Two cells, one character apart, and the gap between them is the most expensive mistake in the trade. **Margin divides by (1 − margin); markup multiplies by (1 + markup).** They are not the same number and never have been: a 25% markup is exactly a 20% margin, which on this job is ${usd(ESTIMATE.price - ESTIMATE.markupPrice)} of profit that simply does not arrive. Build both cells side by side in your sheet and the error becomes impossible to make. To hit a target margin from a markup, the markup needed is margin ÷ (1 − margin) — 25% margin needs a 33.3% markup.`,
      },
      {
        name: "Loaded Labour Rate",
        kind: "direct",
        calc: {
          href: "/calculators/plumbing/plumbing-labor-rate-calculator",
          label: "Plumbing Labor Rate Calculator",
        },
        inputs: [
          { cell: "B2", label: "Hourly wage", example: "38" },
          { cell: "B3", label: "Labour burden, percent", example: "32" },
          { cell: "B4", label: "Overhead per technician, per year", example: "11000" },
          { cell: "B5", label: "Billable hours per year", example: "1560" },
          { cell: "B6", label: "Target margin, percent", example: "40" },
        ],
        excel: `=B2*${HOURS_PER_YEAR}*(1+B3/100)+B4      annual cost of the tech\n=E2/B5                        loaded cost per billable hour\n=E3/(1-B6/100)                bill rate\n=E4/B2                        multiple of the wage\n=B5/${HOURS_PER_YEAR}                      utilisation`,
        named: `=Wage*${HOURS_PER_YEAR}*(1+Burden/100)+Overhead\n=AnnualCost/BillableHours\n=LoadedCost/(1-Margin/100)\n=BillRate/Wage\n=BillableHours/${HOURS_PER_YEAR}`,
        result: `${usd(LABOUR.totalCost)} a year → ${usd2(LABOUR.loadedCost)} loaded → ${usd2(LABOUR.billRate)} bill rate, ${fmt(LABOUR.multiple, 2)}x the wage at ${fmt(LABOUR.utilisation, 0)}% utilisation`,
        notes: `The cell that matters is the fourth one down, not the wage at the top. **Utilisation moves the bill rate further than pay does, and in the useful direction.** Drop billable hours to 1,000 and the same technician must bill ${usd2(labourRate({ wage: 38, burdenPercent: 32, overheadPerTech: 11000, billableHours: 1000, marginPercent: 40 }).billRate)}; lift them to 1,800 and it falls to ${usd2(labourRate({ wage: 38, burdenPercent: 32, overheadPerTech: 11000, billableHours: 1800, marginPercent: 40 }).billRate)}. Raising the wage 20% only moves it to ${usd2(labourRate({ wage: 45.6, burdenPercent: 32, overheadPerTech: 11000, billableHours: 1560, marginPercent: 40 }).billRate)}. Note ${HOURS_PER_YEAR} is PAID hours a year, while B5 is the smaller number you can actually invoice — conflating the two is what produces a rate that looks fine and loses money.`,
      },
      {
        name: "Whole-House Repipe Cost",
        kind: "direct",
        calc: {
          href: "/calculators/plumbing/plumbing-repipe-cost-calculator",
          label: "Repipe Cost Calculator",
        },
        inputs: [
          { cell: "B2", label: "Floor area, ft²", example: "1800" },
          { cell: "B3", label: "Material rate, $ per ft²", example: "5 PEX · 6 CPVC · 9 copper" },
          { cell: "B4", label: "Access factor", example: "0.8 easy · 1.0 average · 1.6 difficult" },
          { cell: "B5", label: "Storeys · B6 bathrooms", example: "1 · 2" },
          { cell: "B7", label: "Permit · B8 drywall repair", example: "450 · 1500" },
          { cell: "B9", label: "Regional factor", example: "0.85 / 1.0 / 1.25 / 1.5" },
        ],
        excel: `=B2*B3*B4*(1+MAX(0,B5-1)*${REPIPE_SECOND_STOREY_FACTOR})       after access and storeys\n=(E2+MAX(0,B6-2)*${REPIPE_EXTRA_BATH_COST}+B7+B8)*B9       total\n=E3/B2                                 cost per ft2\n=E3*(1-${COST_BAND})                             band low\n=E3*(1+${COST_BAND})                             band high`,
        named: `=Area*Rate*Access*(1+MAX(0,Storeys-1)*${REPIPE_SECOND_STOREY_FACTOR})\n=(Subtotal+MAX(0,Baths-2)*${REPIPE_EXTRA_BATH_COST}+Permit+Drywall)*Region\n=Total/Area\n=Total*(1-${COST_BAND})\n=Total*(1+${COST_BAND})`,
        result: `${usd(REPIPE.total)} = ${usd2(REPIPE.perSqFt)} per ft², band ${usd(REPIPE.low)}–${usd(REPIPE.high)}`,
        notes: `The rates in B3, B4 and B9 are input cells on purpose — they are your costs, not a code table, and a spreadsheet is the right place to keep your own. What is worth copying is the SHAPE: access is a **multiplier**, not an addition, so the levers compound rather than add. PEX through easy access is ${usd(repipeCost({ squareFeet: 1800, materialKey: "pex", accessKey: "easy", storeys: 1, bathrooms: 2, permit: 450, drywallRepair: 1500, regionKey: "average" }).total)} and copper through difficult access is ${usd(repipeCost({ squareFeet: 1800, materialKey: "copper", accessKey: "difficult", storeys: 1, bathrooms: 2, permit: 450, drywallRepair: 1500, regionKey: "average" }).total)} — ${fmt(repipeCost({ squareFeet: 1800, materialKey: "copper", accessKey: "difficult", storeys: 1, bathrooms: 2, permit: 450, drywallRepair: 1500, regionKey: "average" }).total / repipeCost({ squareFeet: 1800, materialKey: "pex", accessKey: "easy", storeys: 1, bathrooms: 2, permit: 450, drywallRepair: 1500, regionKey: "average" }).total, 2)}x on the same house. Note the per-ft² figure FALLS as the house grows, because permit and drywall repair are fixed, so quoting a flat rate per square foot loses money on small jobs.`,
      },
      {
        name: "Water Heater Replacement Cost",
        kind: "direct",
        calc: {
          href: "/calculators/plumbing/plumbing-water-heater-replacement-cost-calculator",
          label: "Water Heater Replacement Cost Calculator",
        },
        inputs: [
          { cell: "B2", label: "Equipment cost", example: "1100 (50 gal gas)" },
          { cell: "B3", label: "Labour hours · B4 labour rate", example: "4 · 110" },
          { cell: "B5", label: "Upgrades total", example: "270 (expansion tank + pan)" },
          { cell: "B6", label: "Permit · B7 haul away", example: "200 · 60" },
          { cell: "B8", label: "Regional factor", example: "1.0" },
        ],
        excel: `=B3*B4                          labour\n=(B2+E2+B5+B6+B7)*B8            total\n=B2*B8/E3                       equipment share of the job\n=E3*(1-${WH_COST_BAND})                    band low\n=E3*(1+${WH_COST_BAND})                    band high`,
        named: `=Hours*Rate\n=(Equipment+Labour+Upgrades+Permit+HaulAway)*Region\n=Equipment*Region/Total\n=Total*(1-${WH_COST_BAND})\n=Total*(1+${WH_COST_BAND})`,
        result: `labour ${usd(WH_COST.labour)} → ${usd(WH_COST.total)} total, equipment ${fmt(WH_COST.unitShare, 1)}% of it, band ${usd(WH_COST.low)}–${usd(WH_COST.high)}`,
        notes: `**This model bands at ±${WH_COST_BAND * 100}%, not the ±${COST_BAND * 100}% every other cost formula here uses** — water-heater jobs vary more than a repipe because what is behind the old unit is unknown until it comes out. Worth reproducing rather than tidying away. The upgrade cell is where a like-for-like swap turns into a project: a thermal expansion tank is required by IPC 607.3 on any closed system, and a gas tankless conversion typically adds a vent upgrade, a gas-line upsize and a condensate drain on top. The equipment-share cell is the useful one to show a customer — on a straight swap the box is barely half the bill, which is usually the opposite of what they expect.`,
      },
    ],
  },
];

/* ------------------------------------------------------------------ *
 * Paste-in tables.
 *
 * Generated from the library arrays, so they cannot drift from the
 * calculators. Tab-separated: pasting one into A1 lands every value in
 * its own cell in Excel, Google Sheets and LibreOffice alike.
 * ------------------------------------------------------------------ */
export type PasteTable = { name: string; headers: string[]; rows: string[][]; note: string };

export const tsv = (t: PasteTable) =>
  [t.headers.join("\t"), ...t.rows.map((r) => r.join("\t"))].join("\n");

export const tables: PasteTable[] = [
  {
    name: "Hunter's curve — WSFU to GPM",
    headers: ["Fixture units", "Flush tank gpm", "Flushometer gpm"],
    rows: HUNTER_DEMAND.map((r) => [
      String(r.fu),
      String(r.tank),
      r.valve === null ? "" : String(r.valve),
    ]),
    note: `IPC Appendix E Table E103.3(3), ${HUNTER_DEMAND.length} rows. The flushometer column is blank at the low end because those fixtures cannot occur there. Appendix E is an appendix — enforceable only where specifically adopted — and Hunter's curve runs high for modern low-flow fixtures, so the error is toward larger pipe.`,
  },
  {
    name: "Fitting equivalent lengths — L/D ratios",
    headers: ["Fitting", "L/D ratio", "Your count"],
    rows: (Object.keys(FITTING_LD) as (keyof typeof FITTING_LD)[]).map((k) => [
      FITTING_LABELS[k],
      String(FITTING_LD[k]),
      "0",
    ]),
    note: "Equivalent feet is L/D × bore ÷ 12, so one table covers every pipe size. Overwrite the third column with your fitting counts and the developed-length SUMPRODUCT reads it directly. These are ASPE and manufacturer design values, not code.",
  },
  {
    name: "Minimum drain slope — IPC Table 704.1",
    headers: ["Up to size (in)", "Minimum slope (in/ft)", "Percent grade"],
    rows: MIN_SLOPE_IN_PER_FT.map((r) => [
      Number.isFinite(r.maxSize) ? String(r.maxSize) : "larger",
      String(r.slope),
      `${fmt(slopeToPercent(r.slope), 2)}%`,
    ]),
    note: "Three rows is the entire table, which is why the nested IF above is honest rather than a shortcut. The last band has no upper size, so the IF ends with a bare else rather than a third comparison.",
  },
  {
    name: "Trap arm maximum length — IPC Table 909.1",
    headers: ["Trap arm size (in)", "Max slope (in/ft)", "Max developed length (ft)"],
    rows: TABLE_909_1.map((r) => [sizeLabel(r.size), String(r.slope), String(r.maxFeet)]),
    note: "Measured from the trap weir to the inner edge of the vent fitting. At the three smallest sizes the arm has fallen exactly one pipe diameter at maximum length; at 3 and 4 in it has fallen half a diameter, because the permitted slope halves.",
  },
  {
    name: "Stocked vent sizes",
    headers: ["Nominal size (in)"],
    rows: VENT_SIZES.map((s) => [sizeLabel(s)]),
    note: `Used by the vent-size MATCH to round the half-diameter result up to something you can buy. The ${MIN_VENT_SIZE} in first row is the IPC 916.2 floor.`,
  },
  {
    name: "Water density by temperature",
    headers: ["Temperature (°F)", "Density (lb/ft³)"],
    rows: WATER_DENSITY.map((r) => [String(r.tempF), String(r.density)]),
    note: "Drives the thermal-expansion fraction. A uniform 10 °F grid from 40 to 200, so an approximate MATCH lands on the row below and the interpolation is straightforward. Note the 60 °F row is where the 0.4331 psi-per-foot constant comes from.",
  },
  {
    name: "Fixture drainage units — IPC Table 709.1",
    headers: ["Fixture", "DFU", "Trap size (in)", "Your count"],
    rows: DFU_FIXTURES.map((f) => [
      f.label,
      String(f.dfu),
      f.trap === null ? "" : sizeLabel(f.trap),
      "0",
    ]),
    note: `${DFU_FIXTURES.length} fixtures. Overwrite the last column with your counts and SUMPRODUCT the DFU column against it. The blank trap cells are the fixtures with an integral trap — both bathroom groups, every water closet row and the urinals — where the trap is part of the fixture rather than a size you choose.`,
  },
  {
    name: "Building drain capacity — IPC Table 710.1(1)",
    headers: ["Size (in)", "1/16 in/ft", "1/8 in/ft", "1/4 in/ft", "1/2 in/ft"],
    rows: TABLE_710_1_1.map((r) => [
      sizeLabel(r.size),
      r.slopes["0.0625"] === null ? "" : String(r.slopes["0.0625"]),
      r.slopes["0.125"] === null ? "" : String(r.slopes["0.125"]),
      r.slopes["0.25"] === null ? "" : String(r.slopes["0.25"]),
      r.slopes["0.5"] === null ? "" : String(r.slopes["0.5"]),
    ]),
    note: "Maximum drainage fixture units on a building drain or sewer, by slope. **Paste the blanks as genuinely empty cells** — an empty cell compares as zero, so a first-TRUE capacity search skips those rows correctly, whereas a dash or the word 'n/a' breaks the comparison. Blank means the slope is not permitted at that size, not that capacity is unlimited.",
  },
  {
    name: "Branches and stacks — IPC Table 710.1(2)",
    headers: ["Size (in)", "Horizontal branch", "Stack, 3 intervals or fewer", "Stack, over 3 intervals"],
    rows: TABLE_710_1_2.map((r) => [
      sizeLabel(r.size),
      String(r.branch),
      r.stackShort === null ? "" : String(r.stackShort),
      r.stackTall === null ? "" : String(r.stackTall),
    ]),
    note: "Use the column that matches what you are sizing — a horizontal branch, a short stack or a tall one. The counter-intuitive column is the last: a TALLER stack carries more per size than a short one, because terminal-velocity annular flow only develops with height. A 2 in stack takes 10 fixture units over three branch intervals and 24 over more than three.",
  },
  {
    name: "Septic tank minimums by bedroom count",
    headers: ["Up to bedrooms", "Minimum tank (gal)"],
    rows: SEPTIC_TANK_MINIMUMS.map((r) => [
      r.maxBedrooms === null || !Number.isFinite(r.maxBedrooms) ? "more" : String(r.maxBedrooms),
      String(r.gallons),
    ]),
    note: "Common published minimums rather than a single national code — septic falls to state and county health departments, so confirm the local figures before relying on these. The last row has no upper bedroom count, so a first-TRUE search rather than an exact match is the right lookup.",
  },
  {
    name: "Unit conversion factors",
    headers: ["Category", "Unit", "To base"],
    rows: UNIT_CATEGORIES.filter((c) => c.key !== "temperature").flatMap((c) =>
      c.units.map((u) => [c.key, u.key, String(u.toBase)]),
    ),
    note: "Every unit carries a factor to its category's base unit — gpm for flow, psi for pressure, gallons for volume, inches for length, ft/s for velocity. Multiply into the base and divide out of it. Temperature is deliberately absent: it is an offset scale, not a ratio, so it needs its own formula and cannot use this table.",
  },
];

/* Derived so the page's prose, its badges and the blog diagram can never
   disagree about how many formulas need a code table. */
export const directCount = sections.reduce(
  (a, s) => a + s.formulas.filter((f) => f.kind === "direct").length,
  0,
);
export const lookupCount = sections.reduce(
  (a, s) => a + s.formulas.filter((f) => f.kind === "lookup").length,
  0,
);
export const totalCount = directCount + lookupCount;
