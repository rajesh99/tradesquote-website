/**
 * Shared NEC (NFPA 70) reference data and helpers for the electrical calculators.
 *
 * Baseline: **NEC 2023**. Every export names the article or table it comes from so
 * the values can be re-verified against a future code cycle. Every electrical
 * calculator reads from this module rather than carrying its own copies, so the
 * reference tables rendered on the pages and the numbers the scripts compute can
 * never drift apart.
 *
 * These are planning aids. Local amendments override the model code, and a
 * licensed electrician plus the AHJ have final say on anything installed.
 */

export type ConductorMaterial = "copper" | "aluminum";
export type TempRating = 60 | 75 | 90;

/** One row of NEC Table 310.16, plus the circular-mil area from Chapter 9 Table 8. */
export type ConductorSize = {
  /** Display label — "12", "1/0", "250 kcmil" */
  label: string;
  /** Circular mils (Chapter 9, Table 8) */
  cmil: number;
  /** Copper ampacity at 60/75/90 °C — null where the size is not listed */
  copper: Record<TempRating, number | null>;
  /** Aluminum / copper-clad aluminum ampacity at 60/75/90 °C */
  aluminum: Record<TempRating, number | null>;
};

/**
 * NEC Table 310.16 — allowable ampacities of insulated conductors rated up to
 * 2000 V, not more than three current-carrying conductors in a raceway, cable,
 * or earth, based on an ambient of 30 °C (86 °F).
 */
export const CONDUCTOR_SIZES: ConductorSize[] = [
  {
    label: "14",
    cmil: 4110,
    copper: { 60: 15, 75: 20, 90: 25 },
    aluminum: { 60: null, 75: null, 90: null },
  },
  {
    label: "12",
    cmil: 6530,
    copper: { 60: 20, 75: 25, 90: 30 },
    aluminum: { 60: 15, 75: 20, 90: 25 },
  },
  {
    label: "10",
    cmil: 10380,
    copper: { 60: 30, 75: 35, 90: 40 },
    aluminum: { 60: 25, 75: 30, 90: 35 },
  },
  {
    label: "8",
    cmil: 16510,
    copper: { 60: 40, 75: 50, 90: 55 },
    aluminum: { 60: 35, 75: 40, 90: 45 },
  },
  {
    label: "6",
    cmil: 26240,
    copper: { 60: 55, 75: 65, 90: 75 },
    aluminum: { 60: 40, 75: 50, 90: 55 },
  },
  {
    label: "4",
    cmil: 41740,
    copper: { 60: 70, 75: 85, 90: 95 },
    aluminum: { 60: 55, 75: 65, 90: 75 },
  },
  {
    label: "3",
    cmil: 52620,
    copper: { 60: 85, 75: 100, 90: 115 },
    aluminum: { 60: 65, 75: 75, 90: 85 },
  },
  {
    label: "2",
    cmil: 66360,
    copper: { 60: 95, 75: 115, 90: 130 },
    aluminum: { 60: 75, 75: 90, 90: 100 },
  },
  {
    label: "1",
    cmil: 83690,
    copper: { 60: 110, 75: 130, 90: 145 },
    aluminum: { 60: 85, 75: 100, 90: 115 },
  },
  {
    label: "1/0",
    cmil: 105600,
    copper: { 60: 125, 75: 150, 90: 170 },
    aluminum: { 60: 100, 75: 120, 90: 135 },
  },
  {
    label: "2/0",
    cmil: 133100,
    copper: { 60: 145, 75: 175, 90: 195 },
    aluminum: { 60: 115, 75: 135, 90: 150 },
  },
  {
    label: "3/0",
    cmil: 167800,
    copper: { 60: 165, 75: 200, 90: 225 },
    aluminum: { 60: 130, 75: 155, 90: 175 },
  },
  {
    label: "4/0",
    cmil: 211600,
    copper: { 60: 195, 75: 230, 90: 260 },
    aluminum: { 60: 150, 75: 180, 90: 205 },
  },
  {
    label: "250 kcmil",
    cmil: 250000,
    copper: { 60: 215, 75: 255, 90: 290 },
    aluminum: { 60: 170, 75: 205, 90: 230 },
  },
  {
    label: "300 kcmil",
    cmil: 300000,
    copper: { 60: 240, 75: 285, 90: 320 },
    aluminum: { 60: 195, 75: 230, 90: 260 },
  },
  {
    label: "350 kcmil",
    cmil: 350000,
    copper: { 60: 260, 75: 310, 90: 350 },
    aluminum: { 60: 210, 75: 250, 90: 280 },
  },
  {
    label: "400 kcmil",
    cmil: 400000,
    copper: { 60: 280, 75: 335, 90: 380 },
    aluminum: { 60: 225, 75: 270, 90: 305 },
  },
  {
    label: "500 kcmil",
    cmil: 500000,
    copper: { 60: 320, 75: 380, 90: 430 },
    aluminum: { 60: 260, 75: 310, 90: 350 },
  },
  {
    label: "600 kcmil",
    cmil: 600000,
    copper: { 60: 350, 75: 420, 90: 475 },
    aluminum: { 60: 285, 75: 340, 90: 385 },
  },
];

/** Resistivity constant for the voltage-drop approximation, ohm-cmil per foot. */
export const K_COPPER = 12.9;
export const K_ALUMINUM = 21.2;

export function kFor(material: ConductorMaterial): number {
  return material === "copper" ? K_COPPER : K_ALUMINUM;
}

/** NEC 240.6(A) — standard ampere ratings for fuses and inverse-time breakers. */
export const STANDARD_OCPD = [
  15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100, 110, 125, 150, 175, 200, 225, 250, 300, 350,
  400, 450, 500, 600,
];

/** NEC 310.15(B)(1) — ambient temperature correction factors, keyed by °C band ceiling. */
export const AMBIENT_CORRECTION: { maxC: number; label: string; f60: number; f75: number; f90: number }[] = [
  { maxC: 10, label: "≤ 10 °C (50 °F)", f60: 1.29, f75: 1.2, f90: 1.15 },
  { maxC: 15, label: "11–15 °C (52–59 °F)", f60: 1.22, f75: 1.15, f90: 1.12 },
  { maxC: 20, label: "16–20 °C (61–68 °F)", f60: 1.15, f75: 1.11, f90: 1.08 },
  { maxC: 25, label: "21–25 °C (70–77 °F)", f60: 1.08, f75: 1.05, f90: 1.04 },
  { maxC: 30, label: "26–30 °C (79–86 °F)", f60: 1.0, f75: 1.0, f90: 1.0 },
  { maxC: 35, label: "31–35 °C (88–95 °F)", f60: 0.91, f75: 0.94, f90: 0.96 },
  { maxC: 40, label: "36–40 °C (97–104 °F)", f60: 0.82, f75: 0.88, f90: 0.91 },
  { maxC: 45, label: "41–45 °C (106–113 °F)", f60: 0.71, f75: 0.82, f90: 0.87 },
  { maxC: 50, label: "46–50 °C (115–122 °F)", f60: 0.58, f75: 0.75, f90: 0.82 },
  { maxC: 55, label: "51–55 °C (124–131 °F)", f60: 0.41, f75: 0.67, f90: 0.76 },
  { maxC: 60, label: "56–60 °C (133–140 °F)", f60: 0, f75: 0.58, f90: 0.71 },
  { maxC: 70, label: "61–70 °C (142–158 °F)", f60: 0, f75: 0.33, f90: 0.58 },
  { maxC: 80, label: "71–80 °C (160–176 °F)", f60: 0, f75: 0, f90: 0.41 },
];

export function ambientFactor(ambientC: number, tempRating: TempRating): number {
  const row = AMBIENT_CORRECTION.find((r) => ambientC <= r.maxC) ?? AMBIENT_CORRECTION[AMBIENT_CORRECTION.length - 1];
  if (tempRating === 60) return row.f60;
  if (tempRating === 75) return row.f75;
  return row.f90;
}

/**
 * NEC 310.15(C)(1) — adjustment factors for more than three current-carrying
 * conductors in a raceway or cable.
 */
export const BUNDLING_ADJUSTMENT: { max: number; label: string; factor: number }[] = [
  { max: 3, label: "1–3 conductors", factor: 1.0 },
  { max: 6, label: "4–6 conductors", factor: 0.8 },
  { max: 9, label: "7–9 conductors", factor: 0.7 },
  { max: 20, label: "10–20 conductors", factor: 0.5 },
  { max: 30, label: "21–30 conductors", factor: 0.45 },
  { max: 40, label: "31–40 conductors", factor: 0.4 },
  { max: Infinity, label: "41 or more conductors", factor: 0.35 },
];

export function bundlingFactor(count: number): number {
  return (BUNDLING_ADJUSTMENT.find((r) => count <= r.max) ?? BUNDLING_ADJUSTMENT[0]).factor;
}

/**
 * NEC 240.4(D) — small-conductor overcurrent protection limits. Returns the
 * maximum OCPD rating for the size, or null when 240.4(D) does not apply.
 */
export function smallConductorCap(label: string, material: ConductorMaterial): number | null {
  if (material === "copper") {
    if (label === "14") return 15;
    if (label === "12") return 20;
    if (label === "10") return 30;
    return null;
  }
  if (label === "12") return 15;
  if (label === "10") return 25;
  return null;
}

export function ampacityOf(
  size: ConductorSize,
  material: ConductorMaterial,
  tempRating: TempRating,
): number | null {
  return material === "copper" ? size.copper[tempRating] : size.aluminum[tempRating];
}

/** Smallest conductor whose Table 310.16 ampacity meets `requiredAmps`. */
export function findSizeByAmpacity(
  requiredAmps: number,
  material: ConductorMaterial,
  tempRating: TempRating,
): ConductorSize | null {
  return (
    CONDUCTOR_SIZES.find((size) => {
      const amps = ampacityOf(size, material, tempRating);
      if (amps === null) return false;
      const cap = smallConductorCap(size.label, material);
      // 240.4(D) limits how much load these sizes may actually be used for.
      const usable = cap === null ? amps : Math.min(amps, cap);
      return usable >= requiredAmps;
    }) ?? null
  );
}

/** Next standard OCPD rating at or above `amps` (NEC 240.6(A)). */
export function nextStandardOcpd(amps: number): number {
  return STANDARD_OCPD.find((r) => r >= amps) ?? STANDARD_OCPD[STANDARD_OCPD.length - 1];
}

/** Largest standard OCPD rating at or below `amps`. */
export function prevStandardOcpd(amps: number): number {
  const below = STANDARD_OCPD.filter((r) => r <= amps);
  return below.length ? below[below.length - 1] : STANDARD_OCPD[0];
}

/**
 * Voltage drop by the circular-mils approximation.
 * 1φ: VD = 2 × K × I × L ÷ CM · 3φ: VD = 1.732 × K × I × L ÷ CM
 */
export function voltageDrop(opts: {
  cmil: number;
  material: ConductorMaterial;
  amps: number;
  lengthFt: number;
  phase: 1 | 3;
}): number {
  const multiplier = opts.phase === 3 ? 1.732 : 2;
  if (opts.cmil <= 0) return 0;
  return (multiplier * kFor(opts.material) * opts.amps * opts.lengthFt) / opts.cmil;
}

/** Longest one-way run that keeps drop within `limitPercent`. */
export function maxLengthForDrop(opts: {
  cmil: number;
  material: ConductorMaterial;
  amps: number;
  volts: number;
  phase: 1 | 3;
  limitPercent: number;
}): number {
  const multiplier = opts.phase === 3 ? 1.732 : 2;
  const denom = multiplier * kFor(opts.material) * opts.amps;
  if (denom <= 0) return 0;
  return ((opts.limitPercent / 100) * opts.volts * opts.cmil) / denom;
}

/** NEC Table 250.122 — minimum equipment grounding conductor by OCPD rating. */
export const TABLE_250_122: { maxOcpd: number; copper: string; aluminum: string }[] = [
  { maxOcpd: 15, copper: "14", aluminum: "12" },
  { maxOcpd: 20, copper: "12", aluminum: "10" },
  { maxOcpd: 60, copper: "10", aluminum: "8" },
  { maxOcpd: 100, copper: "8", aluminum: "6" },
  { maxOcpd: 200, copper: "6", aluminum: "4" },
  { maxOcpd: 300, copper: "4", aluminum: "2" },
  { maxOcpd: 400, copper: "3", aluminum: "1" },
  { maxOcpd: 500, copper: "2", aluminum: "1/0" },
  { maxOcpd: 600, copper: "1", aluminum: "2/0" },
  { maxOcpd: 800, copper: "1/0", aluminum: "3/0" },
  { maxOcpd: 1000, copper: "2/0", aluminum: "4/0" },
  { maxOcpd: 1200, copper: "3/0", aluminum: "250 kcmil" },
];

export function egcSize(ocpd: number, material: ConductorMaterial): string {
  const row = TABLE_250_122.find((r) => ocpd <= r.maxOcpd) ?? TABLE_250_122[TABLE_250_122.length - 1];
  return material === "copper" ? row.copper : row.aluminum;
}

/**
 * NEC Table 250.66 — grounding electrode conductor by the size of the largest
 * ungrounded service-entrance conductor. Rows are matched on circular mils so a
 * copper or aluminum service conductor both resolve correctly.
 */
export const TABLE_250_66: {
  maxCopperCmil: number;
  maxAluminumCmil: number;
  /** Display label for the copper service-conductor range this row covers */
  copperRange: string;
  /** Display label for the aluminum service-conductor range this row covers */
  aluminumRange: string;
  copper: string;
  aluminum: string;
}[] = [
  {
    maxCopperCmil: 66360,
    maxAluminumCmil: 105600,
    copperRange: "2 AWG or smaller",
    aluminumRange: "1/0 AWG or smaller",
    copper: "8",
    aluminum: "6",
  },
  {
    maxCopperCmil: 105600,
    maxAluminumCmil: 167800,
    copperRange: "1 or 1/0 AWG",
    aluminumRange: "2/0 or 3/0 AWG",
    copper: "6",
    aluminum: "4",
  },
  {
    maxCopperCmil: 167800,
    maxAluminumCmil: 250000,
    copperRange: "2/0 or 3/0 AWG",
    aluminumRange: "4/0 AWG or 250 kcmil",
    copper: "4",
    aluminum: "2",
  },
  {
    maxCopperCmil: 350000,
    maxAluminumCmil: 500000,
    copperRange: "over 3/0 through 350 kcmil",
    aluminumRange: "over 250 through 500 kcmil",
    copper: "2",
    aluminum: "1/0",
  },
  {
    maxCopperCmil: 600000,
    maxAluminumCmil: 900000,
    copperRange: "over 350 through 600 kcmil",
    aluminumRange: "over 500 through 900 kcmil",
    copper: "1/0",
    aluminum: "3/0",
  },
  {
    maxCopperCmil: 1100000,
    maxAluminumCmil: 1750000,
    copperRange: "over 600 through 1100 kcmil",
    aluminumRange: "over 900 through 1750 kcmil",
    copper: "2/0",
    aluminum: "4/0",
  },
  {
    maxCopperCmil: Infinity,
    maxAluminumCmil: Infinity,
    copperRange: "over 1100 kcmil",
    aluminumRange: "over 1750 kcmil",
    copper: "3/0",
    aluminum: "250 kcmil",
  },
];

export type ElectrodeType = "rod" | "concrete-encased" | "ground-ring" | "water-pipe" | "plate";

/**
 * GEC size from Table 250.66, then the 250.66(A)/(B)/(C) caps: a GEC run to a
 * rod, pipe, or plate electrode need not exceed 6 AWG copper; to a
 * concrete-encased electrode, 4 AWG copper; to a ground ring, no larger than
 * the ring conductor itself.
 */
export function gecSize(
  serviceCmil: number,
  serviceMaterial: ConductorMaterial,
  gecMaterial: ConductorMaterial,
  electrode: ElectrodeType,
): { size: string; cappedBy: string | null; tableSize: string } {
  const row =
    TABLE_250_66.find((r) =>
      serviceMaterial === "copper" ? serviceCmil <= r.maxCopperCmil : serviceCmil <= r.maxAluminumCmil,
    ) ?? TABLE_250_66[TABLE_250_66.length - 1];
  const tableSize = gecMaterial === "copper" ? row.copper : row.aluminum;

  const capLabel = (() => {
    if (electrode === "rod" || electrode === "plate") return gecMaterial === "copper" ? "6" : "4";
    if (electrode === "concrete-encased") return gecMaterial === "copper" ? "4" : "2";
    return null;
  })();

  if (capLabel === null) return { size: tableSize, cappedBy: null, tableSize };

  const tableCmil = CONDUCTOR_SIZES.find((s) => s.label === tableSize)?.cmil ?? 0;
  const capCmil = CONDUCTOR_SIZES.find((s) => s.label === capLabel)?.cmil ?? 0;
  if (tableCmil > capCmil) {
    const article = electrode === "concrete-encased" ? "250.66(B)" : "250.66(A)";
    return { size: capLabel, cappedBy: article, tableSize };
  }
  return { size: tableSize, cappedBy: null, tableSize };
}

/**
 * NEC Table 310.12 — service and feeder conductors for dwelling units, sized at
 * 83% of the service rating. Applies to a service, or to the feeder that carries
 * the entire load of a one-family dwelling.
 */
export const TABLE_310_12: { rating: number; copper: string; aluminum: string }[] = [
  { rating: 100, copper: "4", aluminum: "2" },
  { rating: 110, copper: "3", aluminum: "1" },
  { rating: 125, copper: "2", aluminum: "1/0" },
  { rating: 150, copper: "1", aluminum: "2/0" },
  { rating: 175, copper: "1/0", aluminum: "3/0" },
  { rating: 200, copper: "2/0", aluminum: "4/0" },
  { rating: 225, copper: "3/0", aluminum: "250 kcmil" },
  { rating: 250, copper: "4/0", aluminum: "300 kcmil" },
  { rating: 300, copper: "250 kcmil", aluminum: "350 kcmil" },
  { rating: 350, copper: "350 kcmil", aluminum: "500 kcmil" },
  { rating: 400, copper: "400 kcmil", aluminum: "600 kcmil" },
];

/** Standard residential service and panel ratings. */
export const STANDARD_SERVICE_RATINGS = [60, 100, 125, 150, 200, 225, 320, 400];

/**
 * NEC Chapter 9, Table 5 — approximate area in square inches of THHN/THWN-2
 * insulated conductors.
 */
export const THHN_AREA: Record<string, number> = {
  "14": 0.0097,
  "12": 0.0133,
  "10": 0.0211,
  "8": 0.0366,
  "6": 0.0507,
  "4": 0.0824,
  "3": 0.0973,
  "2": 0.1158,
  "1": 0.1562,
  "1/0": 0.1855,
  "2/0": 0.2223,
  "3/0": 0.2679,
  "4/0": 0.3237,
  "250 kcmil": 0.397,
  "350 kcmil": 0.5242,
  "500 kcmil": 0.7073,
};

/** NEC Chapter 9, Table 5 — XHHW-2 conductor areas (slightly smaller than THHN in small sizes). */
export const XHHW_AREA: Record<string, number> = {
  "14": 0.0139,
  "12": 0.0181,
  "10": 0.0243,
  "8": 0.0437,
  "6": 0.059,
  "4": 0.0814,
  "3": 0.0962,
  "2": 0.1146,
  "1": 0.1534,
  "1/0": 0.1825,
  "2/0": 0.219,
  "3/0": 0.2642,
  "4/0": 0.3197,
  "250 kcmil": 0.3904,
  "350 kcmil": 0.5153,
  "500 kcmil": 0.6984,
};

/** NEC Chapter 9, Table 4 — total (100%) internal area in square inches by raceway type. */
export const CONDUIT_AREA: Record<string, Record<string, number>> = {
  EMT: {
    '1/2"': 0.304,
    '3/4"': 0.533,
    '1"': 0.864,
    '1-1/4"': 1.496,
    '1-1/2"': 2.036,
    '2"': 3.356,
    '2-1/2"': 5.858,
    '3"': 8.846,
    '4"': 14.753,
  },
  "PVC Sch 40": {
    '1/2"': 0.285,
    '3/4"': 0.508,
    '1"': 0.832,
    '1-1/4"': 1.453,
    '1-1/2"': 1.986,
    '2"': 3.291,
    '2-1/2"': 4.695,
    '3"': 7.268,
    '4"': 12.554,
  },
  "PVC Sch 80": {
    '1/2"': 0.217,
    '3/4"': 0.409,
    '1"': 0.688,
    '1-1/4"': 1.237,
    '1-1/2"': 1.711,
    '2"': 2.874,
    '2-1/2"': 4.119,
    '3"': 6.442,
    '4"': 11.258,
  },
  RMC: {
    '1/2"': 0.314,
    '3/4"': 0.549,
    '1"': 0.887,
    '1-1/4"': 1.526,
    '1-1/2"': 2.071,
    '2"': 3.408,
    '2-1/2"': 4.866,
    '3"': 7.499,
    '4"': 12.882,
  },
  IMC: {
    '1/2"': 0.342,
    '3/4"': 0.586,
    '1"': 0.959,
    '1-1/4"': 1.647,
    '1-1/2"': 2.225,
    '2"': 3.63,
    '2-1/2"': 5.135,
    '3"': 7.922,
    '4"': 13.457,
  },
};

export const CONDUIT_TRADE_SIZES = [
  '1/2"',
  '3/4"',
  '1"',
  '1-1/4"',
  '1-1/2"',
  '2"',
  '2-1/2"',
  '3"',
  '4"',
];

/** NEC Chapter 9, Table 1 — maximum percent fill by number of conductors. */
export function conduitFillLimit(conductorCount: number): number {
  if (conductorCount <= 0) return 0.4;
  if (conductorCount === 1) return 0.53;
  if (conductorCount === 2) return 0.31;
  return 0.4;
}

/**
 * Largest number of identical conductors that fit a raceway, respecting the fact
 * that the Chapter 9 Table 1 fill limit itself depends on the conductor count
 * (53% for one, 31% for two, 40% for three or more). Iterating is necessary
 * because a count of two can fail at 31% while three would pass at 40%.
 */
export function maxConductorCount(conduitTotalArea: number, conductorArea: number): number {
  if (conductorArea <= 0 || conduitTotalArea <= 0) return 0;
  let best = 0;
  const ceiling = Math.floor((conduitTotalArea * 0.53) / conductorArea) + 3;
  for (let n = 1; n <= ceiling; n += 1) {
    if (n * conductorArea <= conduitTotalArea * conduitFillLimit(n)) best = n;
  }
  return best;
}

/**
 * How many more conductors of `conductorArea` can be added to a raceway that
 * already holds `usedArea` across `usedCount` conductors — tier-aware, so
 * crossing from two to three conductors correctly picks up the 40% allowance.
 */
export function additionalConductorsThatFit(
  conduitTotalArea: number,
  usedArea: number,
  usedCount: number,
  conductorArea: number,
): number {
  if (conductorArea <= 0 || conduitTotalArea <= 0) return 0;
  let added = 0;
  for (let extra = 1; extra <= 200; extra += 1) {
    const count = usedCount + extra;
    if (usedArea + extra * conductorArea <= conduitTotalArea * conduitFillLimit(count)) {
      added = extra;
    } else if (count > 3) {
      break;
    }
  }
  return added;
}

/** NEC 314.16(B) — free space required per conductor, in cubic inches. */
export const BOX_FILL_VOLUME: Record<string, number> = {
  "18": 1.5,
  "16": 1.75,
  "14": 2.0,
  "12": 2.25,
  "10": 2.5,
  "8": 3.0,
  "6": 5.0,
};

/** Common outlet, device, and junction box volumes (NEC Table 314.16(A) plus trade sizes). */
export const STANDARD_BOX_VOLUMES: { label: string; volume: number }[] = [
  { label: '3" × 2" × 2" device box', volume: 10.0 },
  { label: '3" × 2" × 2-1/4" device box', volume: 10.5 },
  { label: '3" × 2" × 2-1/2" device box', volume: 12.5 },
  { label: '3" × 2" × 2-3/4" device box', volume: 14.0 },
  { label: '3" × 2" × 3-1/2" device box', volume: 18.0 },
  { label: 'Single-gang plastic box, 20.3 in³', volume: 20.3 },
  { label: 'Single-gang plastic box, 22.5 in³', volume: 22.5 },
  { label: '4" square × 1-1/2" box', volume: 21.0 },
  { label: '4" square × 2-1/8" box', volume: 30.3 },
  { label: '4-11/16" square × 1-1/2" box', volume: 29.5 },
  { label: '4-11/16" square × 2-1/8" box', volume: 42.0 },
];

export function smallestBoxFor(volume: number): { label: string; volume: number } | null {
  return [...STANDARD_BOX_VOLUMES].sort((a, b) => a.volume - b.volume).find((b) => b.volume >= volume) ?? null;
}

/** Formatting helpers shared by the electrical calculator scripts. */
export function usd(value: number): string {
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

export function fmt(value: number, digits = 1): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function fmtInt(value: number): string {
  return Math.round(value).toLocaleString("en-US");
}

export function cmilOf(label: string): number {
  return CONDUCTOR_SIZES.find((s) => s.label === label)?.cmil ?? 0;
}

/** "12" → "12 AWG", "250 kcmil" → "250 kcmil". */
export function sizeLabel(label: string): string {
  return label.includes("kcmil") ? label : `${label} AWG`;
}

/* ------------------------------------------------------------------------- *
 * Power and unit conversion — shared by the conversion-cluster calculators   *
 * ------------------------------------------------------------------------- */

/** √3, the line-to-line factor in balanced three-phase power. */
export const SQRT3 = Math.sqrt(3);

/** Conventional electrical horsepower, in watts. */
export const WATTS_PER_HP = 745.7;

/** 1 watt = 3.412142 BTU/h. */
export const BTU_PER_WATT = 3.412142;

export type PhaseMode = "dc" | "1ph" | "3ph";

/** Denominator that relates watts to amps for each supply type. */
export function powerDivisor(mode: PhaseMode, volts: number, powerFactor: number): number {
  if (mode === "dc") return volts;
  if (mode === "3ph") return SQRT3 * volts * powerFactor;
  return volts * powerFactor;
}

/** Watts → amps. DC ignores power factor. */
export function wattsToAmps(watts: number, mode: PhaseMode, volts: number, powerFactor: number): number {
  const divisor = powerDivisor(mode, volts, powerFactor);
  return divisor > 0 ? watts / divisor : 0;
}

/** Amps → watts (real power). */
export function ampsToWatts(amps: number, mode: PhaseMode, volts: number, powerFactor: number): number {
  return amps * powerDivisor(mode, volts, powerFactor);
}

/** Amps → volt-amperes (apparent power — power factor does not apply). */
export function ampsToVoltAmps(amps: number, mode: PhaseMode, volts: number): number {
  return mode === "3ph" ? SQRT3 * volts * amps : volts * amps;
}

/**
 * Reactive power from real power and power factor: Q = P × tan(φ), where
 * φ = arccos(PF). Used for power-factor correction sizing.
 */
export function tanPhi(powerFactor: number): number {
  const pf = Math.min(1, Math.max(0.01, powerFactor));
  return Math.sqrt(1 - pf * pf) / pf;
}

/** Format a value with thousands separators and a variable number of decimals. */
export function fmtSmart(value: number): string {
  if (!Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  const digits = abs >= 1000 ? 0 : abs >= 100 ? 1 : abs >= 1 ? 2 : 4;
  return value.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

/* ------------------------------------------------------------------------- *
 * Motors — Article 430                                                       *
 *                                                                            *
 * The rule that governs everything here is 430.6(A)(1): conductors and the    *
 * branch-circuit short-circuit and ground-fault protective device are sized   *
 * from these TABLE values, not from the motor nameplate. Only the overload    *
 * device (430.32) uses the nameplate full-load amperes.                       *
 * ------------------------------------------------------------------------- */

export type MotorPhase = "1ph" | "3ph";

export type MotorFlcRow = {
  /** Horsepower as a number, for sorting and arithmetic */
  hp: number;
  /** Display label — "1-1/2" rather than 1.5 */
  label: string;
  /** Full-load current in amperes, keyed by nominal system voltage */
  amps: Record<number, number>;
};

/**
 * NEC Table 430.248 — full-load currents of single-phase alternating-current
 * motors, in amperes, at 115, 200, 208 and 230 volts.
 */
export const TABLE_430_248: MotorFlcRow[] = [
  { hp: 1 / 6, label: "1/6", amps: { 115: 4.4, 200: 2.5, 208: 2.4, 230: 2.2 } },
  { hp: 1 / 4, label: "1/4", amps: { 115: 5.8, 200: 3.3, 208: 3.2, 230: 2.9 } },
  { hp: 1 / 3, label: "1/3", amps: { 115: 7.2, 200: 4.1, 208: 4.0, 230: 3.6 } },
  { hp: 1 / 2, label: "1/2", amps: { 115: 9.8, 200: 5.6, 208: 5.4, 230: 4.9 } },
  { hp: 3 / 4, label: "3/4", amps: { 115: 13.8, 200: 7.9, 208: 7.6, 230: 6.9 } },
  { hp: 1, label: "1", amps: { 115: 16, 200: 9.2, 208: 8.8, 230: 8 } },
  { hp: 1.5, label: "1-1/2", amps: { 115: 20, 200: 11.5, 208: 11.0, 230: 10 } },
  { hp: 2, label: "2", amps: { 115: 24, 200: 13.8, 208: 13.2, 230: 12 } },
  { hp: 3, label: "3", amps: { 115: 34, 200: 19.6, 208: 18.7, 230: 17 } },
  { hp: 5, label: "5", amps: { 115: 56, 200: 32.2, 208: 30.8, 230: 28 } },
  { hp: 7.5, label: "7-1/2", amps: { 115: 80, 200: 46.0, 208: 44.0, 230: 40 } },
  { hp: 10, label: "10", amps: { 115: 100, 200: 57.5, 208: 55.0, 230: 50 } },
];

/**
 * NEC Table 430.250 — full-load currents of three-phase alternating-current
 * motors (squirrel-cage and wound-rotor induction), in amperes, at 200, 208,
 * 230, 460 and 575 volts.
 */
export const TABLE_430_250: MotorFlcRow[] = [
  { hp: 1 / 2, label: "1/2", amps: { 200: 2.5, 208: 2.4, 230: 2.2, 460: 1.1, 575: 0.9 } },
  { hp: 3 / 4, label: "3/4", amps: { 200: 3.7, 208: 3.5, 230: 3.2, 460: 1.6, 575: 1.3 } },
  { hp: 1, label: "1", amps: { 200: 4.8, 208: 4.6, 230: 4.2, 460: 2.1, 575: 1.7 } },
  { hp: 1.5, label: "1-1/2", amps: { 200: 6.9, 208: 6.6, 230: 6.0, 460: 3.0, 575: 2.4 } },
  { hp: 2, label: "2", amps: { 200: 7.8, 208: 7.5, 230: 6.8, 460: 3.4, 575: 2.7 } },
  { hp: 3, label: "3", amps: { 200: 11.0, 208: 10.6, 230: 9.6, 460: 4.8, 575: 3.9 } },
  { hp: 5, label: "5", amps: { 200: 17.5, 208: 16.7, 230: 15.2, 460: 7.6, 575: 6.1 } },
  { hp: 7.5, label: "7-1/2", amps: { 200: 25.3, 208: 24.2, 230: 22, 460: 11, 575: 9 } },
  { hp: 10, label: "10", amps: { 200: 32.2, 208: 30.8, 230: 28, 460: 14, 575: 11 } },
  { hp: 15, label: "15", amps: { 200: 48.3, 208: 46.2, 230: 42, 460: 21, 575: 17 } },
  { hp: 20, label: "20", amps: { 200: 62.1, 208: 59.4, 230: 54, 460: 27, 575: 22 } },
  { hp: 25, label: "25", amps: { 200: 78.2, 208: 74.8, 230: 68, 460: 34, 575: 27 } },
  { hp: 30, label: "30", amps: { 200: 92, 208: 88, 230: 80, 460: 40, 575: 32 } },
  { hp: 40, label: "40", amps: { 200: 120, 208: 114, 230: 104, 460: 52, 575: 41 } },
  { hp: 50, label: "50", amps: { 200: 150, 208: 143, 230: 130, 460: 65, 575: 52 } },
  { hp: 60, label: "60", amps: { 200: 177, 208: 169, 230: 154, 460: 77, 575: 62 } },
  { hp: 75, label: "75", amps: { 200: 221, 208: 211, 230: 192, 460: 96, 575: 77 } },
  { hp: 100, label: "100", amps: { 200: 285, 208: 273, 230: 248, 460: 124, 575: 99 } },
  { hp: 125, label: "125", amps: { 200: 359, 208: 343, 230: 312, 460: 156, 575: 125 } },
  { hp: 150, label: "150", amps: { 200: 414, 208: 396, 230: 360, 460: 180, 575: 144 } },
  { hp: 200, label: "200", amps: { 200: 552, 208: 528, 230: 480, 460: 240, 575: 192 } },
];

export function motorFlcTable(phase: MotorPhase): MotorFlcRow[] {
  return phase === "1ph" ? TABLE_430_248 : TABLE_430_250;
}

/** Voltages listed in each table — the only ones a table lookup is valid for. */
export function motorTableVoltages(phase: MotorPhase): number[] {
  return phase === "1ph" ? [115, 200, 208, 230] : [200, 208, 230, 460, 575];
}

/** Table full-load current for a horsepower and nominal voltage, or null if not listed. */
export function motorFlc(hp: number, phase: MotorPhase, volts: number): number | null {
  const row = motorFlcTable(phase).find((r) => r.hp === hp);
  if (!row) return null;
  return row.amps[volts] ?? null;
}

export type MotorType =
  | "squirrelCage"
  | "designB"
  | "synchronous"
  | "woundRotor"
  | "dc"
  | "singlePhase";

export type MotorProtectionDevice =
  | "nonTimeDelayFuse"
  | "dualElementFuse"
  | "instantTrip"
  | "inverseTime";

/**
 * NEC Table 430.52(C)(1) — maximum rating or setting of motor branch-circuit
 * short-circuit and ground-fault protective devices, as a percentage of the
 * motor's table full-load current.
 */
export const TABLE_430_52: Record<
  MotorType,
  { label: string } & Record<MotorProtectionDevice, number>
> = {
  singlePhase: {
    label: "Single-phase, no code letter",
    nonTimeDelayFuse: 300,
    dualElementFuse: 175,
    instantTrip: 800,
    inverseTime: 250,
  },
  squirrelCage: {
    label: "AC polyphase squirrel-cage, other than Design B",
    nonTimeDelayFuse: 300,
    dualElementFuse: 175,
    instantTrip: 800,
    inverseTime: 250,
  },
  designB: {
    label: "Design B energy-efficient squirrel-cage",
    nonTimeDelayFuse: 300,
    dualElementFuse: 175,
    instantTrip: 1100,
    inverseTime: 250,
  },
  synchronous: {
    label: "Synchronous",
    nonTimeDelayFuse: 300,
    dualElementFuse: 175,
    instantTrip: 800,
    inverseTime: 250,
  },
  woundRotor: {
    label: "Wound rotor",
    nonTimeDelayFuse: 150,
    dualElementFuse: 150,
    instantTrip: 800,
    inverseTime: 150,
  },
  dc: {
    label: "DC, constant voltage",
    nonTimeDelayFuse: 150,
    dualElementFuse: 150,
    instantTrip: 250,
    inverseTime: 150,
  },
};

export const MOTOR_DEVICE_LABELS: Record<MotorProtectionDevice, string> = {
  nonTimeDelayFuse: "Non-time-delay fuse",
  dualElementFuse: "Dual-element (time-delay) fuse",
  instantTrip: "Instantaneous-trip breaker",
  inverseTime: "Inverse-time breaker",
};

/**
 * 430.52(C)(1) Exception No. 2 — where the Table 430.52 value is not sufficient
 * to start the motor, the device may be increased to these percentages. This is
 * a ceiling, not a recommendation.
 */
export function motorOcpdAbsoluteMax(flc: number, device: MotorProtectionDevice): number {
  if (device === "nonTimeDelayFuse") return flc * 4;
  if (device === "dualElementFuse") return flc * 2.25;
  if (device === "inverseTime") return flc * (flc > 100 ? 3 : 4);
  // 430.52(C)(3) routes instantaneous-trip breakers through a listed combination controller.
  return flc * 13;
}

/**
 * 430.22 — branch-circuit conductors for a single continuous-duty motor are
 * sized at 125% of the table full-load current.
 */
export function motorConductorAmps(flc: number): number {
  return flc * 1.25;
}

export type OverloadClass = "serviceFactor115" | "tempRise40" | "other";

export const OVERLOAD_PERCENT: Record<OverloadClass, { label: string; percent: number }> = {
  serviceFactor115: { label: "Marked service factor 1.15 or greater", percent: 125 },
  tempRise40: { label: "Marked temperature rise 40 °C or less", percent: 125 },
  other: { label: "All other motors", percent: 115 },
};

/**
 * 430.32(A)(1) — separate overload device rating, as a percentage of the motor's
 * NAMEPLATE full-load amperes. This is the one place the nameplate is used rather
 * than the table. 430.32(C) permits an increase to 140% / 130% where the initial
 * value will not allow the motor to start.
 */
export function motorOverloadRating(nameplateFla: number, klass: OverloadClass): number {
  return (nameplateFla * OVERLOAD_PERCENT[klass].percent) / 100;
}

export function motorOverloadMax(nameplateFla: number, klass: OverloadClass): number {
  return (nameplateFla * (klass === "other" ? 130 : 140)) / 100;
}

/* ------------------------------------------------------------------------- *
 * Transformers — Article 450                                                 *
 * ------------------------------------------------------------------------- */

/** Standard single- and three-phase dry-type transformer kVA ratings. */
export const STANDARD_TRANSFORMER_KVA = [
  1.5, 3, 5, 7.5, 10, 15, 25, 30, 37.5, 45, 50, 75, 100, 112.5, 150, 167, 225, 300, 500, 750, 1000,
];

/** Typical nameplate impedance by size — always prefer the actual nameplate. */
export const TYPICAL_TRANSFORMER_IMPEDANCE: { maxKva: number; percentZ: number }[] = [
  { maxKva: 75, percentZ: 2.5 },
  { maxKva: 300, percentZ: 3.5 },
  { maxKva: 750, percentZ: 4.5 },
  { maxKva: Infinity, percentZ: 5.75 },
];

export function typicalPercentZ(kva: number): number {
  return (
    TYPICAL_TRANSFORMER_IMPEDANCE.find((r) => kva <= r.maxKva) ?? TYPICAL_TRANSFORMER_IMPEDANCE[0]
  ).percentZ;
}

/** Transformer full-load current on either winding. */
export function transformerFla(kva: number, volts: number, phase: MotorPhase): number {
  if (volts <= 0) return 0;
  return (kva * 1000) / (phase === "3ph" ? SQRT3 * volts : volts);
}

export function nextStandardTransformerKva(kva: number): number {
  return (
    STANDARD_TRANSFORMER_KVA.find((k) => k >= kva) ??
    STANDARD_TRANSFORMER_KVA[STANDARD_TRANSFORMER_KVA.length - 1]
  );
}

/**
 * Table 450.3(B) — maximum overcurrent protection for a transformer of 1000 V or
 * less. Where secondary protection is provided at no more than 125% of secondary
 * current, the primary device may go to 250%; with primary protection only, the
 * ceiling depends on how small the primary current is.
 */
export function transformerPrimaryMaxPercent(
  primaryFla: number,
  hasSecondaryProtection: boolean,
): number {
  if (hasSecondaryProtection) return 250;
  if (primaryFla < 2) return 300;
  if (primaryFla < 9) return 167;
  return 125;
}

export const TRANSFORMER_SECONDARY_MAX_PERCENT = 125;

/* ------------------------------------------------------------------------- *
 * Conductor impedance — Chapter 9, Tables 8 and 9                            *
 * ------------------------------------------------------------------------- */

/**
 * NEC Chapter 9, Table 8 — direct-current resistance of uncoated stranded
 * conductors at 75 °C, in ohms per 1000 ft. Verified against the K constants:
 * R × cmil ÷ 1000 reproduces 12.9 (copper) and 21.2 (aluminum) for every size.
 */
export const TABLE_8_DC_RESISTANCE: Record<string, { copper: number; aluminum: number | null }> = {
  "14": { copper: 3.07, aluminum: null },
  "12": { copper: 1.93, aluminum: 3.18 },
  "10": { copper: 1.21, aluminum: 2.0 },
  "8": { copper: 0.764, aluminum: 1.26 },
  "6": { copper: 0.491, aluminum: 0.808 },
  "4": { copper: 0.308, aluminum: 0.508 },
  "3": { copper: 0.245, aluminum: 0.403 },
  "2": { copper: 0.194, aluminum: 0.319 },
  "1": { copper: 0.154, aluminum: 0.253 },
  "1/0": { copper: 0.122, aluminum: 0.201 },
  "2/0": { copper: 0.0967, aluminum: 0.159 },
  "3/0": { copper: 0.0766, aluminum: 0.126 },
  "4/0": { copper: 0.0608, aluminum: 0.1 },
  "250 kcmil": { copper: 0.0515, aluminum: 0.0847 },
  "300 kcmil": { copper: 0.0429, aluminum: 0.0707 },
  "350 kcmil": { copper: 0.0367, aluminum: 0.0605 },
  "400 kcmil": { copper: 0.0321, aluminum: 0.0529 },
  "500 kcmil": { copper: 0.0258, aluminum: 0.0424 },
  "600 kcmil": { copper: 0.0214, aluminum: 0.0353 },
};

export type RacewayKind = "nonmagnetic" | "steel";

/**
 * NEC Chapter 9, Table 9 — inductive reactance for 600 V cables, three single
 * conductors in a raceway, 60 Hz, in ohms to neutral per 1000 ft. A steel
 * raceway has the higher reactance.
 */
export const TABLE_9_REACTANCE: Record<string, Record<RacewayKind, number>> = {
  "14": { nonmagnetic: 0.058, steel: 0.073 },
  "12": { nonmagnetic: 0.054, steel: 0.068 },
  "10": { nonmagnetic: 0.05, steel: 0.063 },
  "8": { nonmagnetic: 0.052, steel: 0.065 },
  "6": { nonmagnetic: 0.051, steel: 0.064 },
  "4": { nonmagnetic: 0.048, steel: 0.06 },
  "3": { nonmagnetic: 0.047, steel: 0.059 },
  "2": { nonmagnetic: 0.045, steel: 0.057 },
  "1": { nonmagnetic: 0.046, steel: 0.057 },
  "1/0": { nonmagnetic: 0.044, steel: 0.055 },
  "2/0": { nonmagnetic: 0.043, steel: 0.054 },
  "3/0": { nonmagnetic: 0.042, steel: 0.052 },
  "4/0": { nonmagnetic: 0.041, steel: 0.051 },
  "250 kcmil": { nonmagnetic: 0.041, steel: 0.052 },
  "300 kcmil": { nonmagnetic: 0.041, steel: 0.051 },
  "350 kcmil": { nonmagnetic: 0.04, steel: 0.05 },
  "400 kcmil": { nonmagnetic: 0.04, steel: 0.049 },
  "500 kcmil": { nonmagnetic: 0.039, steel: 0.048 },
  "600 kcmil": { nonmagnetic: 0.039, steel: 0.048 },
};

/** Temperature coefficient of resistance, per Chapter 9 Table 8's correction note. */
export const ALPHA_COPPER = 0.00323;
export const ALPHA_ALUMINUM = 0.0033;

/** Table 8 resistance corrected from its 75 °C basis to another temperature. */
export function resistanceAtTemp(
  r75: number,
  material: ConductorMaterial,
  tempC: number,
): number {
  const alpha = material === "copper" ? ALPHA_COPPER : ALPHA_ALUMINUM;
  return r75 * (1 + alpha * (tempC - 75));
}

/**
 * Effective impedance at a given load power factor: Ze = R·cos θ + X·sin θ.
 *
 * This is what actually causes voltage drop, and it reproduces the "Effective Z
 * at 0.85 PF" column of Chapter 9 Table 9 closely. Note the two limits: at unity
 * power factor Ze collapses to R, which is why the K-constant approximation is
 * accurate for resistive loads; and the impedance *magnitude* √(R² + X²) is only
 * correct for a bolted fault, not for a normal load.
 */
export function effectiveImpedance(r: number, x: number, powerFactor: number): number {
  const pf = Math.min(1, Math.max(0, powerFactor));
  return r * pf + x * Math.sqrt(1 - pf * pf);
}

/** Resistance and reactance of one leg of a run, in ohms. */
export function runImpedance(opts: {
  label: string;
  material: ConductorMaterial;
  lengthFt: number;
  parallelSets: number;
  raceway: RacewayKind;
  tempC: number;
}): { r: number; x: number; z: number; rPerKft: number; xPerKft: number } | null {
  const rRow = TABLE_8_DC_RESISTANCE[opts.label];
  const xRow = TABLE_9_REACTANCE[opts.label];
  if (!rRow || !xRow) return null;
  const r75 = opts.material === "copper" ? rRow.copper : rRow.aluminum;
  if (r75 === null) return null;
  const sets = Math.max(1, opts.parallelSets);
  const rPerKft = resistanceAtTemp(r75, opts.material, opts.tempC);
  const xPerKft = xRow[opts.raceway];
  const r = (rPerKft * opts.lengthFt) / 1000 / sets;
  const x = (xPerKft * opts.lengthFt) / 1000 / sets;
  return { r, x, z: Math.sqrt(r * r + x * x), rPerKft, xPerKft };
}

/* ------------------------------------------------------------------------- *
 * Available fault current — the point-to-point method                        *
 * ------------------------------------------------------------------------- */

/** Common device interrupting ratings, for the AIC comparison. */
export const STANDARD_AIC_RATINGS = [10000, 22000, 25000, 42000, 65000, 100000, 200000];

/**
 * Symmetrical RMS short-circuit current at the transformer secondary terminals,
 * assuming an infinite primary source — the conservative standard assumption.
 * The NEMA impedance tolerance is plus or minus 10%, and the low-impedance case
 * is the one that matters for an interrupting-rating check.
 */
export function transformerSecondaryFaultCurrent(opts: {
  kva: number;
  secondaryVolts: number;
  phase: MotorPhase;
  percentZ: number;
  applyToleranceMargin: boolean;
}): { fla: number; faultCurrent: number; effectivePercentZ: number } {
  const fla = transformerFla(opts.kva, opts.secondaryVolts, opts.phase);
  const nominalZ = Math.max(0.1, opts.percentZ);
  const effectivePercentZ = opts.applyToleranceMargin ? nominalZ * 0.9 : nominalZ;
  return { fla, faultCurrent: fla / (effectivePercentZ / 100), effectivePercentZ };
}

/**
 * Fault current at the far end of a run. Derived rather than table-driven: the
 * source impedance implied by the upstream fault current is added to the run's
 * own impedance, which is algebraically identical to the point-to-point method's
 * M = 1 ÷ (1 + f) but needs no proprietary conductor constants.
 *
 * Three-phase uses the phase voltage against a one-way conductor impedance; a
 * single-phase line-to-line fault uses the full voltage and both conductors.
 */
export function faultCurrentAfterRun(opts: {
  upstreamFaultCurrent: number;
  volts: number;
  phase: MotorPhase;
  runZ: number;
}): { sourceZ: number; loopZ: number; totalZ: number; f: number; multiplier: number; faultCurrent: number } {
  const driving = opts.phase === "3ph" ? opts.volts / SQRT3 : opts.volts;
  const loopZ = opts.phase === "3ph" ? opts.runZ : opts.runZ * 2;
  if (opts.upstreamFaultCurrent <= 0) {
    return { sourceZ: 0, loopZ, totalZ: loopZ, f: 0, multiplier: 0, faultCurrent: 0 };
  }
  const sourceZ = driving / opts.upstreamFaultCurrent;
  const f = sourceZ > 0 ? loopZ / sourceZ : 0;
  const multiplier = 1 / (1 + f);
  return {
    sourceZ,
    loopZ,
    totalZ: sourceZ + loopZ,
    f,
    multiplier,
    faultCurrent: opts.upstreamFaultCurrent * multiplier,
  };
}

/** Smallest standard interrupting rating that covers the available fault current. */
export function requiredAicRating(faultCurrent: number): number | null {
  return STANDARD_AIC_RATINGS.find((r) => r >= faultCurrent) ?? null;
}
