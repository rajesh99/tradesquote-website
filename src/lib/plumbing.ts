/**
 * Shared plumbing reference data and helpers for the plumbing calculators.
 *
 * Baseline: **IPC 2021** (International Plumbing Code). Every export names the
 * section or table it comes from so the values can be re-verified against a
 * future code cycle. Every plumbing calculator reads from this module rather
 * than carrying its own copies, so the reference tables rendered on the pages
 * and the numbers the scripts compute can never drift apart.
 *
 * ## Provenance — read before trusting a number
 *
 * The exports below fall into three tiers, and each is labelled:
 *
 * 1. **Derived** — computed from first principles or from a dimensional
 *    standard, so it is self-validating. Pipe inside diameters are computed
 *    from outside diameter and wall thickness rather than transcribed; the
 *    velocity constant and the pressure/head constants are derived.
 * 2. **Verified** — cross-checked against two independent published sources
 *    while this module was written. Tables 709.1, 709.2, 710.1(1), 710.1(2),
 *    909.1 and the 906.2 vent rule are in this tier.
 * 3. **UNVERIFIED — flagged** — commonly published values that could not be
 *    confirmed against a primary source here. `WSFU_FIXTURES` and
 *    `HUNTER_DEMAND` are in this tier and say so at their definitions. Pages
 *    that use them must disclose it. See the block comment above each.
 *
 * These are planning aids. The IPC is a model code: local amendments override
 * it, roughly fifteen states use the UPC or a UPC derivative instead, and a
 * licensed plumber plus the AHJ have final say on anything installed.
 */

/* ------------------------------------------------------------------ *
 * Formatting
 * ------------------------------------------------------------------ */

/** Round to `decimals` and group thousands — matches `fmt` in `nec.ts`. */
export function fmt(n: number, decimals = 0): string {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Whole dollars. */
export function usd(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

/** Dollars and cents. */
export function usd2(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Render a decimal pipe size as the fraction the trade actually says. */
export function sizeLabel(nominal: number): string {
  const fractions: Record<string, string> = {
    "0.25": "1/4",
    "0.375": "3/8",
    "0.5": "1/2",
    "0.75": "3/4",
    "1.25": "1-1/4",
    "1.5": "1-1/2",
    "2.5": "2-1/2",
  };
  const key = String(nominal);
  if (fractions[key]) return `${fractions[key]}"`;
  return `${nominal}"`;
}

/* ------------------------------------------------------------------ *
 * Water constants — DERIVED
 * ------------------------------------------------------------------ */

/**
 * Pressure exerted by one foot of water column, psi. Water at 60 °F weighs
 * 62.37 lb/ft³; 62.37 ÷ 144 in²/ft² = 0.4331 psi per foot.
 */
export const PSI_PER_FOOT_HEAD = 0.4331;

/** Feet of head per psi — the reciprocal, 1 ÷ 0.4331 = 2.309. */
export const FEET_HEAD_PER_PSI = 1 / PSI_PER_FOOT_HEAD;

/**
 * Velocity constant: V (ft/s) = K × Q (gpm) ÷ d² (in²).
 *
 * Derivation: 1 gpm = 0.0022280 ft³/s. A pipe of inside diameter d inches has
 * area πd² ÷ 4 in² = πd² ÷ 576 ft². So V = 0.0022280 × 576 ÷ π = 0.40850.
 */
export const VELOCITY_CONSTANT = 0.4085;

/** Weight of water, lb per US gallon at 60 °F. */
export const LB_PER_GALLON = 8.33;

/**
 * BTU/hr to raise 1 gpm by 1 °F: 8.33 lb/gal × 60 min/hr × 1 BTU/lb·°F.
 * This is the "500" every water-heating formula uses.
 */
export const BTU_PER_GPM_PER_DEGF = LB_PER_GALLON * 60;

/**
 * Static pressure above which IPC 604.8 requires an approved pressure-reducing
 * valve on the water distribution system.
 */
export const PRV_THRESHOLD_PSI = 80;

/**
 * Recommended maximum water velocity, ft/s.
 *
 * NOT a numeric IPC limit — the IPC requires the system to be sized so it is
 * free of excessive noise and erosion without naming a figure. These are the
 * long-standing ASPE / tube-manufacturer design values: erosion-corrosion in
 * copper is temperature-dependent, which is why the hot limit is lower.
 */
export const MAX_VELOCITY_COLD = 8;
export const MAX_VELOCITY_HOT = 5;

/* ------------------------------------------------------------------ *
 * Pipe dimensions — DERIVED
 *
 * Inside diameter is COMPUTED from outside diameter and wall thickness rather
 * than transcribed, so the numbers are self-validating: for PEX, SDR-9 means
 * wall = OD ÷ 9, and the computed IDs land on the published ASTM F876 values
 * (1/2" → 0.486 vs 0.485 published). Schedule 40 IDs reproduce the published
 * ASTM D1785 values exactly. Never replace this with a hand-typed ID column.
 * ------------------------------------------------------------------ */

export type PipeMaterial =
  | "copper-l"
  | "copper-m"
  | "pex"
  | "cpvc-40"
  | "pvc-40"
  | "steel-40";

/** One nominal size of one material: nominal label, outside diameter, wall. */
export type PipeDimension = {
  /** Nominal trade size in inches, e.g. 0.75 for 3/4" */
  nominal: number;
  /** Outside diameter, inches */
  od: number;
  /** Minimum wall thickness, inches */
  wall: number;
};

/** Copper tube OD is always nominal + 1/8". Walls are ASTM B88. */
const COPPER_L: PipeDimension[] = [
  { nominal: 0.5, od: 0.625, wall: 0.04 },
  { nominal: 0.75, od: 0.875, wall: 0.045 },
  { nominal: 1, od: 1.125, wall: 0.05 },
  { nominal: 1.25, od: 1.375, wall: 0.055 },
  { nominal: 1.5, od: 1.625, wall: 0.06 },
  { nominal: 2, od: 2.125, wall: 0.07 },
  { nominal: 2.5, od: 2.625, wall: 0.08 },
  { nominal: 3, od: 3.125, wall: 0.09 },
  { nominal: 4, od: 4.125, wall: 0.11 },
];

const COPPER_M: PipeDimension[] = [
  { nominal: 0.5, od: 0.625, wall: 0.028 },
  { nominal: 0.75, od: 0.875, wall: 0.032 },
  { nominal: 1, od: 1.125, wall: 0.035 },
  { nominal: 1.25, od: 1.375, wall: 0.042 },
  { nominal: 1.5, od: 1.625, wall: 0.049 },
  { nominal: 2, od: 2.125, wall: 0.058 },
  { nominal: 2.5, od: 2.625, wall: 0.065 },
  { nominal: 3, od: 3.125, wall: 0.072 },
  { nominal: 4, od: 4.125, wall: 0.095 },
];

/** ASTM F876 PEX is copper tube size, SDR-9 — wall is exactly OD ÷ 9. */
const PEX: PipeDimension[] = [0.375, 0.5, 0.75, 1, 1.25, 1.5, 2].map((nominal) => {
  const od = nominal + 0.125;
  return { nominal, od, wall: od / 9 };
});

/** ASTM D1785 Schedule 40 — shared by PVC, CPVC Schedule 40 and steel. */
const SCHEDULE_40: PipeDimension[] = [
  { nominal: 0.5, od: 0.84, wall: 0.109 },
  { nominal: 0.75, od: 1.05, wall: 0.113 },
  { nominal: 1, od: 1.315, wall: 0.133 },
  { nominal: 1.25, od: 1.66, wall: 0.14 },
  { nominal: 1.5, od: 1.9, wall: 0.145 },
  { nominal: 2, od: 2.375, wall: 0.154 },
  { nominal: 2.5, od: 2.875, wall: 0.203 },
  { nominal: 3, od: 3.5, wall: 0.216 },
  { nominal: 4, od: 4.5, wall: 0.237 },
  { nominal: 6, od: 6.625, wall: 0.28 },
];

export const PIPE_DIMENSIONS: Record<PipeMaterial, PipeDimension[]> = {
  "copper-l": COPPER_L,
  "copper-m": COPPER_M,
  pex: PEX,
  "cpvc-40": SCHEDULE_40,
  "pvc-40": SCHEDULE_40,
  "steel-40": SCHEDULE_40,
};

export const PIPE_MATERIAL_LABELS: Record<PipeMaterial, string> = {
  "copper-l": "Copper, Type L",
  "copper-m": "Copper, Type M",
  pex: "PEX (SDR-9)",
  "cpvc-40": "CPVC, Schedule 40",
  "pvc-40": "PVC, Schedule 40",
  "steel-40": "Galvanized steel, Schedule 40",
};

/**
 * Hazen-Williams roughness coefficient C. Higher is smoother.
 *
 * Plastics are conventionally taken at 150 and copper at 140. Galvanized steel
 * is listed at 120 as installed; it degrades toward 100 as it scales, which is
 * why old galvanized systems lose pressure long before anything visibly fails.
 */
export const HAZEN_WILLIAMS_C: Record<PipeMaterial, number> = {
  "copper-l": 140,
  "copper-m": 140,
  pex: 150,
  "cpvc-40": 150,
  "pvc-40": 150,
  "steel-40": 120,
};

/** Inside diameter in inches, computed — ID = OD − 2 × wall. */
export function insideDiameter(material: PipeMaterial, nominal: number): number | null {
  const row = PIPE_DIMENSIONS[material].find((r) => r.nominal === nominal);
  if (!row) return null;
  return row.od - 2 * row.wall;
}

/** Every nominal size available in a material, smallest first. */
export function nominalSizes(material: PipeMaterial): number[] {
  return PIPE_DIMENSIONS[material].map((r) => r.nominal);
}

/* ------------------------------------------------------------------ *
 * Flow, velocity and friction — DERIVED
 * ------------------------------------------------------------------ */

/** Water velocity in ft/s from flow in gpm and inside diameter in inches. */
export function velocity(gpm: number, idInches: number): number {
  if (idInches <= 0) return 0;
  return (VELOCITY_CONSTANT * gpm) / (idInches * idInches);
}

/** Flow in gpm that produces a given velocity in a given inside diameter. */
export function flowAtVelocity(ftPerSec: number, idInches: number): number {
  return (ftPerSec * idInches * idInches) / VELOCITY_CONSTANT;
}

/**
 * Hazen-Williams friction loss, **psi per foot** of pipe.
 *
 *     psi/ft = 4.52 × Q^1.852 ÷ (C^1.852 × d^4.8704)
 *
 * Q in gpm, d in inches. Cross-checked against the head-loss form
 * h_f(ft/100ft) = 0.2083 × (100/C)^1.852 × Q^1.852 ÷ d^4.8655: for 8 gpm in
 * 3/4" Type L copper the two forms give 7.31 and 7.39 psi/100 ft, a 1.1%
 * spread that comes from the differing published exponent on d.
 */
export function frictionLossPsiPerFoot(gpm: number, idInches: number, c: number): number {
  if (gpm <= 0 || idInches <= 0) return 0;
  return (4.52 * Math.pow(gpm, 1.852)) / (Math.pow(c, 1.852) * Math.pow(idInches, 4.8704));
}

/** The same loss expressed per 100 ft, which is how charts publish it. */
export function frictionLossPsiPer100Ft(gpm: number, idInches: number, c: number): number {
  return frictionLossPsiPerFoot(gpm, idInches, c) * 100;
}

/** psi from feet of water column. */
export function headToPsi(feet: number): number {
  return feet * PSI_PER_FOOT_HEAD;
}

/** Feet of water column from psi. */
export function psiToHead(psi: number): number {
  return psi * FEET_HEAD_PER_PSI;
}

/* ------------------------------------------------------------------ *
 * Fitting losses — DERIVED
 *
 * Equivalent length is computed from the classic equivalent-length-in-diameters
 * (L/D) ratios rather than a transcribed per-size table, which makes it valid
 * at any diameter. Sanity check against the published tables: a 90 degree
 * elbow on 3/4" copper (ID 0.785") gives 30 x 0.785 / 12 = 1.96 ft against a
 * published 2.0 ft, and a tee taken through the branch gives 3.93 against 4.0.
 * ------------------------------------------------------------------ */

export type FittingKey =
  | "elbow90"
  | "elbow45"
  | "teeRun"
  | "teeBranch"
  | "ballValve"
  | "gateValve"
  | "globeValve"
  | "checkValve";

/** Equivalent length expressed in pipe diameters. */
export const FITTING_LD: Record<FittingKey, number> = {
  elbow90: 30,
  elbow45: 16,
  teeRun: 20,
  teeBranch: 60,
  ballValve: 8,
  gateValve: 8,
  globeValve: 340,
  checkValve: 100,
};

export const FITTING_LABELS: Record<FittingKey, string> = {
  elbow90: "90 degree elbow",
  elbow45: "45 degree elbow",
  teeRun: "Tee, straight through",
  teeBranch: "Tee, through the branch",
  ballValve: "Ball valve, full open",
  gateValve: "Gate valve, full open",
  globeValve: "Globe valve",
  checkValve: "Swing check valve",
};

/** Equivalent length of one fitting, in feet of straight pipe. */
export function fittingEquivalentFeet(fitting: FittingKey, idInches: number): number {
  return (FITTING_LD[fitting] * idInches) / 12;
}

/** Measured run plus every fitting's equivalent length. */
export function developedLength(
  measuredFeet: number,
  fittings: Partial<Record<FittingKey, number>>,
  idInches: number,
): number {
  let total = measuredFeet;
  (Object.keys(fittings) as FittingKey[]).forEach((key) => {
    const count = fittings[key] ?? 0;
    total += count * fittingEquivalentFeet(key, idInches);
  });
  return total;
}

/* ------------------------------------------------------------------ *
 * Sanitary drainage — VERIFIED (IPC 2021 Chapter 7)
 * ------------------------------------------------------------------ */

/**
 * IPC Table 709.1 — Drainage Fixture Unit Values for Fixtures and Groups.
 *
 * Cross-checked against two independent published reproductions of the 2021
 * table; both agree on every row below. `trap` is the minimum trap size in
 * inches from the same table. Water closets and urinals carry no figure
 * because they are governed by their own integral trap.
 */
export type DfuFixture = {
  key: string;
  label: string;
  dfu: number;
  /** Minimum trap size, inches — null where the fixture traps itself. */
  trap: number | null;
  group: "Residential" | "Commercial";
};

export const DFU_FIXTURES: DfuFixture[] = [
  { key: "bathroom-group-16", label: "Bathroom group (1.6 gpf water closet)", dfu: 5, trap: null, group: "Residential" },
  { key: "bathroom-group-over", label: "Bathroom group (over 1.6 gpf water closet)", dfu: 6, trap: null, group: "Residential" },
  { key: "wc-private-16", label: "Water closet, private (1.6 gpf)", dfu: 3, trap: null, group: "Residential" },
  { key: "wc-private-over", label: "Water closet, private (over 1.6 gpf)", dfu: 4, trap: null, group: "Residential" },
  { key: "lavatory", label: "Lavatory", dfu: 1, trap: 1.25, group: "Residential" },
  { key: "bathtub", label: "Bathtub (with or without shower)", dfu: 2, trap: 1.5, group: "Residential" },
  { key: "shower-57", label: "Shower, up to 5.7 gpm", dfu: 2, trap: 1.5, group: "Residential" },
  { key: "shower-123", label: "Shower, over 5.7 to 12.3 gpm", dfu: 3, trap: 2, group: "Residential" },
  { key: "kitchen-sink", label: "Kitchen sink, domestic", dfu: 2, trap: 1.5, group: "Residential" },
  { key: "dishwasher", label: "Dishwashing machine, domestic", dfu: 2, trap: 1.5, group: "Residential" },
  { key: "clothes-washer-res", label: "Clothes washer, residential", dfu: 2, trap: 2, group: "Residential" },
  { key: "laundry-tray", label: "Laundry tray (1 or 2 compartments)", dfu: 2, trap: 1.5, group: "Residential" },
  { key: "bidet", label: "Bidet", dfu: 1, trap: 1.25, group: "Residential" },
  { key: "floor-drain", label: "Floor drain", dfu: 2, trap: 2, group: "Residential" },
  { key: "sink", label: "Sink", dfu: 2, trap: 1.5, group: "Residential" },
  { key: "wc-public-16", label: "Water closet, public (1.6 gpf)", dfu: 4, trap: null, group: "Commercial" },
  { key: "wc-public-over", label: "Water closet, public (over 1.6 gpf)", dfu: 6, trap: null, group: "Commercial" },
  { key: "wc-flushometer-tank", label: "Water closet, flushometer tank", dfu: 4, trap: null, group: "Commercial" },
  { key: "urinal", label: "Urinal", dfu: 4, trap: null, group: "Commercial" },
  { key: "urinal-1gpf", label: "Urinal, 1 gpf or less", dfu: 2, trap: null, group: "Commercial" },
  { key: "urinal-waterless", label: "Urinal, nonwater supplied", dfu: 0.5, trap: null, group: "Commercial" },
  { key: "shower-258", label: "Shower, over 12.3 to 25.8 gpm", dfu: 5, trap: 3, group: "Commercial" },
  { key: "shower-556", label: "Shower, over 25.8 to 55.6 gpm", dfu: 6, trap: 4, group: "Commercial" },
  { key: "service-sink", label: "Service sink", dfu: 2, trap: 1.5, group: "Commercial" },
  { key: "clothes-washer-com", label: "Clothes washer, commercial", dfu: 3, trap: 2, group: "Commercial" },
  { key: "drinking-fountain", label: "Drinking fountain", dfu: 0.5, trap: 1.25, group: "Commercial" },
  { key: "wash-sink", label: "Wash sink (per faucet set)", dfu: 2, trap: 1.5, group: "Commercial" },
  { key: "dental-lavatory", label: "Dental lavatory", dfu: 1, trap: 1.25, group: "Commercial" },
];

/**
 * IPC Table 709.2 — a fixture not listed in Table 709.1 takes its DFU value
 * from the size of its drain connection.
 */
export const DFU_BY_DRAIN_SIZE: { size: number; dfu: number }[] = [
  { size: 1.25, dfu: 1 },
  { size: 1.5, dfu: 2 },
  { size: 2, dfu: 3 },
  { size: 3, dfu: 5 },
  { size: 4, dfu: 6 },
];

/** Total DFU for a fixture count map keyed by the `key` field above. */
export function totalDfu(counts: Record<string, number>): number {
  return DFU_FIXTURES.reduce((sum, f) => sum + (counts[f.key] ?? 0) * f.dfu, 0);
}

/**
 * IPC Table 704.1 — minimum slope of horizontal drainage pipe, inches per
 * foot. The step down at 3" is the most consequential line in the table: a 3"
 * drain legally runs at half the fall a 2" drain needs.
 */
export const MIN_SLOPE_IN_PER_FT: { maxSize: number; slope: number }[] = [
  { maxSize: 2.5, slope: 0.25 },
  { maxSize: 6, slope: 0.125 },
  { maxSize: Infinity, slope: 0.0625 },
];

/** Minimum code slope in inches per foot for a horizontal drain of this size. */
export function minSlope(nominalSize: number): number {
  const row = MIN_SLOPE_IN_PER_FT.find((r) => nominalSize <= r.maxSize);
  return row ? row.slope : 0.0625;
}

/** Slope in inches per foot expressed as a percent grade. */
export function slopeToPercent(inPerFt: number): number {
  return (inPerFt / 12) * 100;
}

/** Total fall in inches over a run, from slope in inches per foot. */
export function totalFall(inPerFt: number, runFeet: number): number {
  return inPerFt * runFeet;
}

export type SlopeKey = "0.0625" | "0.125" | "0.25" | "0.5";

/**
 * IPC Table 710.1(1) — Building Drains and Sewers. Maximum DFU load on a
 * building drain or sewer, including branches of the building drain, at each
 * slope. `null` means the size is not listed at that slope.
 *
 * Verified against a full published reproduction of the 2021 table, with the
 * 3" and 4" rows independently confirmed a second time.
 */
export type BuildingDrainRow = {
  size: number;
  slopes: Record<SlopeKey, number | null>;
};

export const TABLE_710_1_1: BuildingDrainRow[] = [
  { size: 1.25, slopes: { "0.0625": null, "0.125": null, "0.25": 1, "0.5": 1 } },
  { size: 1.5, slopes: { "0.0625": null, "0.125": null, "0.25": 3, "0.5": 3 } },
  { size: 2, slopes: { "0.0625": null, "0.125": null, "0.25": 21, "0.5": 26 } },
  { size: 2.5, slopes: { "0.0625": null, "0.125": null, "0.25": 24, "0.5": 31 } },
  { size: 3, slopes: { "0.0625": null, "0.125": 36, "0.25": 42, "0.5": 50 } },
  { size: 4, slopes: { "0.0625": null, "0.125": 180, "0.25": 216, "0.5": 250 } },
  { size: 5, slopes: { "0.0625": null, "0.125": 390, "0.25": 480, "0.5": 575 } },
  { size: 6, slopes: { "0.0625": null, "0.125": 700, "0.25": 840, "0.5": 1000 } },
  { size: 8, slopes: { "0.0625": 1400, "0.125": 1600, "0.25": 1920, "0.5": 2300 } },
  { size: 10, slopes: { "0.0625": 2500, "0.125": 2900, "0.25": 3500, "0.5": 4200 } },
  { size: 12, slopes: { "0.0625": 3900, "0.125": 4600, "0.25": 5600, "0.5": 6700 } },
  { size: 15, slopes: { "0.0625": 7000, "0.125": 8300, "0.25": 10000, "0.5": 12000 } },
];

/**
 * IPC Table 710.1(2) — Horizontal Fixture Branches and Stacks.
 *
 * `branch` is the total for a horizontal fixture branch; `oneInterval` the
 * total discharge into one branch interval of a stack; `stackShort` the total
 * for a stack of three branch intervals or less; `stackTall` the total for a
 * stack greater than three branch intervals. `null` marks a cell the published
 * table defers to a footnote.
 */
export type BranchStackRow = {
  size: number;
  branch: number;
  oneInterval: number | null;
  stackShort: number | null;
  stackTall: number | null;
};

export const TABLE_710_1_2: BranchStackRow[] = [
  { size: 1.5, branch: 3, oneInterval: 2, stackShort: 4, stackTall: 8 },
  { size: 2, branch: 6, oneInterval: 6, stackShort: 10, stackTall: 24 },
  { size: 2.5, branch: 12, oneInterval: 9, stackShort: 20, stackTall: 42 },
  { size: 3, branch: 20, oneInterval: 20, stackShort: 48, stackTall: 72 },
  { size: 4, branch: 160, oneInterval: 90, stackShort: 240, stackTall: 500 },
  { size: 5, branch: 360, oneInterval: 200, stackShort: 540, stackTall: 1100 },
  { size: 6, branch: 620, oneInterval: 350, stackShort: 960, stackTall: 1900 },
  { size: 8, branch: 1400, oneInterval: 600, stackShort: 2200, stackTall: 3600 },
  { size: 10, branch: 2500, oneInterval: 1000, stackShort: 3800, stackTall: 5600 },
  { size: 12, branch: 3900, oneInterval: 1500, stackShort: 6000, stackTall: 8400 },
  { size: 15, branch: 7000, oneInterval: null, stackShort: null, stackTall: null },
];

export type DrainApplication =
  | "building-drain"
  | "horizontal-branch"
  | "stack-short"
  | "stack-tall";

export const DRAIN_APPLICATION_LABELS: Record<DrainApplication, string> = {
  "building-drain": "Building drain or sewer",
  "horizontal-branch": "Horizontal fixture branch",
  "stack-short": "Stack, 3 branch intervals or less",
  "stack-tall": "Stack, more than 3 branch intervals",
};

/**
 * Smallest pipe size that carries `dfu` for the given application. `slope`
 * only applies to a building drain or sewer — the branch and stack table is
 * slope-independent, because those runs are sized on the fall the code
 * already requires.
 */
export function minDrainSize(
  dfu: number,
  application: DrainApplication,
  slope: number = 0.25,
): number | null {
  if (application === "building-drain") {
    const key = String(slope) as SlopeKey;
    const row = TABLE_710_1_1.find((r) => {
      const cap = r.slopes[key];
      return cap !== null && cap !== undefined && cap >= dfu;
    });
    return row ? row.size : null;
  }
  const column =
    application === "horizontal-branch"
      ? "branch"
      : application === "stack-short"
        ? "stackShort"
        : "stackTall";
  const row = TABLE_710_1_2.find((r) => {
    const cap = r[column] as number | null;
    return cap !== null && cap >= dfu;
  });
  return row ? row.size : null;
}

/**
 * IPC Table 710.1(1), footnote — the minimum size of any building drain
 * serving a water closet is 3 inches.
 *
 * This OVERRIDES the DFU lookup and is the single most commonly missed line in
 * residential drainage sizing: a two-bathroom house totals about 18 DFU, which
 * Table 710.1(1) would carry on a 2" drain at 1/4 in/ft, but a water closet
 * anywhere on that drain floors it at 3".
 */
export const MIN_BUILDING_DRAIN_WITH_WC = 3;

/**
 * Table lookup with the water-closet floor applied. Returns the governing rule
 * alongside the size so a page can say WHY the answer is what it is.
 */
export function minDrainSizeApplied(
  dfu: number,
  application: DrainApplication,
  slope: number = 0.25,
  servesWaterCloset = false,
): { size: number | null; fromTable: number | null; governedBy: "table" | "water-closet" } {
  const fromTable = minDrainSize(dfu, application, slope);
  if (
    !servesWaterCloset ||
    application !== "building-drain" ||
    fromTable === null ||
    fromTable >= MIN_BUILDING_DRAIN_WITH_WC
  ) {
    return { size: fromTable, fromTable, governedBy: "table" };
  }
  return { size: MIN_BUILDING_DRAIN_WITH_WC, fromTable, governedBy: "water-closet" };
}

/** DFU capacity of a given size in a given application, for the result panel. */
export function drainCapacity(
  size: number,
  application: DrainApplication,
  slope: number = 0.25,
): number | null {
  if (application === "building-drain") {
    const key = String(slope) as SlopeKey;
    return TABLE_710_1_1.find((r) => r.size === size)?.slopes[key] ?? null;
  }
  const row = TABLE_710_1_2.find((r) => r.size === size);
  if (!row) return null;
  if (application === "horizontal-branch") return row.branch;
  if (application === "stack-short") return row.stackShort;
  return row.stackTall;
}

/* ------------------------------------------------------------------ *
 * Venting — VERIFIED (IPC 2021 Chapter 9)
 * ------------------------------------------------------------------ */

/**
 * IPC Table 909.1 — maximum developed length of a fixture drain from the trap
 * weir to the vent fitting, with the slope the same table requires. Verified
 * against two independent sources.
 *
 * The developed length is NOT limited for self-siphoning fixtures such as
 * water closets, which is why a toilet can sit well past these distances.
 */
export const TABLE_909_1: { size: number; slope: number; maxFeet: number }[] = [
  { size: 1.25, slope: 0.25, maxFeet: 5 },
  { size: 1.5, slope: 0.25, maxFeet: 6 },
  { size: 2, slope: 0.25, maxFeet: 8 },
  { size: 3, slope: 0.125, maxFeet: 12 },
  { size: 4, slope: 0.125, maxFeet: 16 },
];

/** Maximum trap-arm developed length for a fixture drain of this size. */
export function trapArmMaxFeet(size: number): number | null {
  return TABLE_909_1.find((r) => r.size === size)?.maxFeet ?? null;
}

/** Minimum vent diameter per IPC 906.2. */
export const MIN_VENT_SIZE = 1.25;

/** Developed length past which IPC 906.2 adds one nominal size to the vent. */
export const VENT_LENGTH_UPSIZE_FEET = 40;

/** Nominal sizes a vent can be, smallest first. */
export const VENT_SIZES = [1.25, 1.5, 2, 2.5, 3, 4, 5, 6, 8];

/**
 * Individual / branch vent size per IPC 906.2: not less than half the required
 * diameter of the drain served, never smaller than 1-1/4", and increased one
 * nominal size for the whole run once developed length passes 40 feet.
 *
 * This covers individual, common and branch vents. A vent STACK or stack vent
 * serving a multi-storey drainage stack is sized by IPC Table 906.1 instead,
 * which this module deliberately does not reproduce — see the note on the
 * vent-size calculator page.
 */
export function ventSize(drainSize: number, developedFeet: number): {
  size: number;
  halfDrain: number;
  upsized: boolean;
} {
  const halfDrain = drainSize / 2;
  const base = VENT_SIZES.find((s) => s >= Math.max(halfDrain, MIN_VENT_SIZE)) ?? MIN_VENT_SIZE;
  const upsized = developedFeet > VENT_LENGTH_UPSIZE_FEET;
  if (!upsized) return { size: base, halfDrain, upsized };
  const index = VENT_SIZES.indexOf(base);
  const next = VENT_SIZES[Math.min(index + 1, VENT_SIZES.length - 1)];
  return { size: next, halfDrain, upsized };
}

/**
 * Manning's equation for a drain flowing half full, the condition the IPC
 * drainage tables are built around. Returns velocity in ft/s and flow in gpm.
 *
 *     V = (1.486 / n) x R^(2/3) x S^(1/2)
 *
 * For a half-full circular pipe the hydraulic radius R is d/4 (in feet) and
 * the flow area is half the full area.
 */
export const MANNING_N: Record<string, number> = {
  "cast-iron": 0.013,
  plastic: 0.01,
  clay: 0.013,
  concrete: 0.013,
};

export function manningHalfFull(
  idInches: number,
  slopeInPerFt: number,
  n: number,
): { velocity: number; gpm: number } {
  if (idInches <= 0 || slopeInPerFt <= 0) return { velocity: 0, gpm: 0 };
  const diameterFt = idInches / 12;
  const hydraulicRadius = diameterFt / 4;
  const slope = slopeInPerFt / 12;
  const v = (1.486 / n) * Math.pow(hydraulicRadius, 2 / 3) * Math.sqrt(slope);
  const areaFt2 = (Math.PI * diameterFt * diameterFt) / 4 / 2;
  const cfs = v * areaFt2;
  return { velocity: v, gpm: cfs * 448.831 };
}

/* ------------------------------------------------------------------ *
 * Water supply demand — UNVERIFIED, FLAGGED
 *
 * !! DO NOT SILENTLY "FIX" THIS BLOCK. Read the whole comment first. !!
 *
 * `WSFU_FIXTURES` and `HUNTER_DEMAND` hold the commonly published water
 * supply fixture unit weights and the fixture-unit-to-gpm demand curve. They
 * could NOT be confirmed against a primary source while this module was
 * written, so they are labelled unverified rather than presented as a
 * reproduction of IPC Appendix E Tables E103.3(2) and E103.3(3).
 *
 * Two things make this less alarming than it sounds, and both must stay
 * visible on any page that uses these numbers:
 *
 *   1. **Appendix E is an appendix.** The IPC's water-pipe sizing method is
 *      only enforceable where the jurisdiction has adopted Appendix E. Many
 *      have not, and design there falls to engineering judgement anyway.
 *   2. **The curve is conservative for modern fixtures.** Hunter calibrated it
 *      in 1940 on fixtures that used several times today's water. IPC 604.3 has
 *      since cut fixture flow rates hard, so a WSFU-derived demand runs HIGH,
 *      which errs toward larger pipe. Wrong in the safe direction.
 *
 * Two rows were independently confirmed and are a good sign for the rest of
 * the set: a private water closet is 2.2 WSFU on a flush tank and 6.0 on a
 * flushometer valve.
 *
 * **Highest-value follow-up for this category:** check every value below
 * against a copy of IPC Appendix E and promote the block to the verified tier.
 * ------------------------------------------------------------------ */

export type WsfuFixture = {
  key: string;
  label: string;
  /** Cold-water weight in WSFU. */
  cold: number;
  /** Hot-water weight in WSFU. */
  hot: number;
  /** Total weight — deliberately NOT cold + hot; the code assigns it. */
  total: number;
  group: "Residential" | "Commercial";
};

export const WSFU_FIXTURES: WsfuFixture[] = [
  { key: "bathroom-group-tank", label: "Bathroom group, flush tank water closet", cold: 2.7, hot: 1.5, total: 3.6, group: "Residential" },
  { key: "bathroom-group-valve", label: "Bathroom group, flushometer water closet", cold: 6.0, hot: 3.0, total: 8.0, group: "Residential" },
  { key: "wc-private-tank", label: "Water closet, private, flush tank", cold: 2.2, hot: 0, total: 2.2, group: "Residential" },
  { key: "wc-private-valve", label: "Water closet, private, flushometer valve", cold: 6.0, hot: 0, total: 6.0, group: "Residential" },
  { key: "lavatory-private", label: "Lavatory, private", cold: 0.5, hot: 0.5, total: 0.7, group: "Residential" },
  { key: "bathtub-private", label: "Bathtub, private", cold: 1.0, hot: 1.0, total: 1.4, group: "Residential" },
  { key: "shower-private", label: "Shower head, private", cold: 1.0, hot: 1.0, total: 1.4, group: "Residential" },
  { key: "kitchen-sink-private", label: "Kitchen sink, private", cold: 1.0, hot: 1.0, total: 1.4, group: "Residential" },
  { key: "dishwasher-private", label: "Dishwasher, private", cold: 0, hot: 1.4, total: 1.4, group: "Residential" },
  { key: "clothes-washer-private", label: "Clothes washer, private", cold: 1.0, hot: 1.0, total: 1.4, group: "Residential" },
  { key: "laundry-tray-private", label: "Laundry tray, private", cold: 1.0, hot: 1.0, total: 1.4, group: "Residential" },
  { key: "bidet-private", label: "Bidet, private", cold: 1.5, hot: 1.5, total: 2.0, group: "Residential" },
  { key: "hose-bibb", label: "Hose bibb / sillcock", cold: 2.5, hot: 0, total: 2.5, group: "Residential" },
  { key: "wc-public-tank", label: "Water closet, public, flush tank", cold: 5.0, hot: 0, total: 5.0, group: "Commercial" },
  { key: "wc-public-valve", label: "Water closet, public, flushometer valve", cold: 10.0, hot: 0, total: 10.0, group: "Commercial" },
  { key: "urinal-1in", label: "Urinal, 1 inch flushometer valve", cold: 10.0, hot: 0, total: 10.0, group: "Commercial" },
  { key: "urinal-075in", label: "Urinal, 3/4 inch flushometer valve", cold: 5.0, hot: 0, total: 5.0, group: "Commercial" },
  { key: "urinal-tank", label: "Urinal, flush tank", cold: 3.0, hot: 0, total: 3.0, group: "Commercial" },
  { key: "lavatory-public", label: "Lavatory, public", cold: 1.5, hot: 1.5, total: 2.0, group: "Commercial" },
  { key: "bathtub-public", label: "Bathtub, public", cold: 3.0, hot: 3.0, total: 4.0, group: "Commercial" },
  { key: "shower-public", label: "Shower head, public", cold: 3.0, hot: 3.0, total: 4.0, group: "Commercial" },
  { key: "kitchen-sink-public", label: "Kitchen sink, public", cold: 3.0, hot: 3.0, total: 4.0, group: "Commercial" },
  { key: "service-sink-public", label: "Service sink, public", cold: 2.25, hot: 2.25, total: 3.0, group: "Commercial" },
  { key: "clothes-washer-public", label: "Clothes washer, public", cold: 2.25, hot: 2.25, total: 3.0, group: "Commercial" },
  { key: "drinking-fountain-public", label: "Drinking fountain", cold: 0.25, hot: 0, total: 0.25, group: "Commercial" },
];

/** Total WSFU for a fixture count map, on the cold, hot or total column. */
export function totalWsfu(
  counts: Record<string, number>,
  column: "cold" | "hot" | "total" = "total",
): number {
  return WSFU_FIXTURES.reduce((sum, f) => sum + (counts[f.key] ?? 0) * f[column], 0);
}

/**
 * Hunter's curve demand anchors: fixture units against probable peak demand in
 * gpm, for systems predominantly served by flush tanks and by flushometer
 * valves. Interpolated linearly between anchors.
 *
 * UNVERIFIED — see the block comment above. Where a jurisdiction has adopted
 * IPC Appendix E, Table E103.3(3) is the authority and this is an approximation
 * of it. Roy Hunter's original method is US government work from 1940 (NBS
 * Building Materials and Structures Report BMS65) and is not itself
 * proprietary; the code table's exact values are.
 */
export const HUNTER_DEMAND: { fu: number; tank: number; valve: number | null }[] = [
  { fu: 1, tank: 3.0, valve: null },
  { fu: 2, tank: 5.0, valve: null },
  { fu: 3, tank: 6.5, valve: null },
  { fu: 4, tank: 8.0, valve: null },
  { fu: 5, tank: 9.4, valve: 15.0 },
  { fu: 6, tank: 10.7, valve: 17.4 },
  { fu: 7, tank: 11.8, valve: 19.8 },
  { fu: 8, tank: 12.8, valve: 22.2 },
  { fu: 9, tank: 13.7, valve: 24.6 },
  { fu: 10, tank: 14.6, valve: 27.0 },
  { fu: 12, tank: 16.0, valve: 28.6 },
  { fu: 14, tank: 17.0, valve: 30.2 },
  { fu: 16, tank: 18.0, valve: 31.8 },
  { fu: 18, tank: 18.8, valve: 33.4 },
  { fu: 20, tank: 19.6, valve: 35.0 },
  { fu: 25, tank: 21.5, valve: 38.0 },
  { fu: 30, tank: 23.3, valve: 41.0 },
  { fu: 35, tank: 24.9, valve: 43.8 },
  { fu: 40, tank: 26.3, valve: 46.5 },
  { fu: 45, tank: 27.7, valve: 49.0 },
  { fu: 50, tank: 29.1, valve: 51.5 },
  { fu: 60, tank: 32.0, valve: 55.0 },
  { fu: 70, tank: 35.0, valve: 58.5 },
  { fu: 80, tank: 38.0, valve: 62.0 },
  { fu: 90, tank: 41.0, valve: 64.8 },
  { fu: 100, tank: 43.5, valve: 67.5 },
  { fu: 120, tank: 48.0, valve: 72.5 },
  { fu: 140, tank: 52.5, valve: 77.5 },
  { fu: 160, tank: 57.0, valve: 82.5 },
  { fu: 180, tank: 61.0, valve: 87.0 },
  { fu: 200, tank: 65.0, valve: 91.5 },
  { fu: 250, tank: 75.0, valve: 101.0 },
  { fu: 300, tank: 85.0, valve: 110.0 },
  { fu: 400, tank: 105.0, valve: 126.0 },
  { fu: 500, tank: 124.0, valve: 142.0 },
  { fu: 750, tank: 170.0, valve: 178.0 },
  { fu: 1000, tank: 208.0, valve: 208.0 },
];

export type SupplyControl = "tank" | "valve";

/** Probable peak demand in gpm for a total WSFU load. */
export function wsfuToGpm(fu: number, control: SupplyControl = "tank"): number {
  if (fu <= 0) return 0;
  const column = control === "valve" ? "valve" : "tank";
  const rows = HUNTER_DEMAND.filter((r) => r[column] !== null) as {
    fu: number;
    tank: number;
    valve: number;
  }[];
  const first = rows[0];
  const last = rows[rows.length - 1];
  if (fu <= first.fu) {
    // Below the curve's first anchor, scale linearly from the origin.
    return (fu / first.fu) * first[column];
  }
  if (fu >= last.fu) return last[column];
  for (let i = 0; i < rows.length - 1; i += 1) {
    const lo = rows[i];
    const hi = rows[i + 1];
    if (fu >= lo.fu && fu <= hi.fu) {
      const t = (fu - lo.fu) / (hi.fu - lo.fu);
      return lo[column] + t * (hi[column] - lo[column]);
    }
  }
  return last[column];
}

/**
 * IPC Table 604.3 — maximum flow rates and consumption for plumbing fixtures
 * and fittings. Used to sanity-check a demand figure against what the fixtures
 * can physically pass.
 */
export const FIXTURE_MAX_FLOW: { label: string; value: string }[] = [
  { label: "Lavatory faucet, private", value: "2.2 gpm at 60 psi" },
  { label: "Lavatory faucet, public (metering)", value: "0.25 gal per cycle" },
  { label: "Shower head", value: "2.5 gpm at 80 psi" },
  { label: "Sink faucet", value: "2.2 gpm at 60 psi" },
  { label: "Water closet", value: "1.6 gal per flush" },
  { label: "Urinal", value: "1.0 gal per flush" },
];

/* ------------------------------------------------------------------ *
 * Supply pipe sizing — DERIVED from the pressure budget
 * ------------------------------------------------------------------ */

/**
 * Pressure left over for pipe friction, psi.
 *
 * Everything the system spends before the pipe gets a say: the elevation lift
 * to the highest fixture, the pressure that fixture needs to work, the meter
 * loss, and any treatment or backflow device.
 */
export function availableFrictionPsi(args: {
  supplyPsi: number;
  highestFixtureFeet: number;
  fixtureRequiredPsi: number;
  meterLossPsi: number;
  otherLossPsi: number;
}): number {
  const elevation = headToPsi(args.highestFixtureFeet);
  return (
    args.supplyPsi -
    elevation -
    args.fixtureRequiredPsi -
    args.meterLossPsi -
    args.otherLossPsi
  );
}

/** The friction budget spread over the developed length, psi per 100 ft. */
export function allowableLossPer100Ft(availablePsi: number, developedFeet: number): number {
  if (developedFeet <= 0) return 0;
  return (availablePsi / developedFeet) * 100;
}

export type SupplySizeResult = {
  size: number | null;
  id: number;
  velocity: number;
  lossPer100: number;
  lossTotal: number;
  /** Which rule decided the size. "both" means they landed on the same size. */
  governedBy: "velocity" | "friction" | "both" | "none";
};

/**
 * Smallest nominal size in a material that satisfies BOTH the velocity ceiling
 * and the friction budget, and a note on which of the two governed.
 */
export function sizeSupplyPipe(args: {
  gpm: number;
  material: PipeMaterial;
  developedFeet: number;
  availablePsi: number;
  maxVelocity: number;
}): SupplySizeResult {
  const c = HAZEN_WILLIAMS_C[args.material];
  const budget = allowableLossPer100Ft(args.availablePsi, args.developedFeet);
  const sizes = nominalSizes(args.material);

  let velocityOk: number | null = null;
  let frictionOk: number | null = null;

  for (const size of sizes) {
    const id = insideDiameter(args.material, size);
    if (id === null) continue;
    const v = velocity(args.gpm, id);
    const loss = frictionLossPsiPer100Ft(args.gpm, id, c);
    if (velocityOk === null && v <= args.maxVelocity) velocityOk = size;
    if (frictionOk === null && budget > 0 && loss <= budget) frictionOk = size;
  }

  const chosen =
    velocityOk === null && frictionOk === null
      ? null
      : Math.max(velocityOk ?? 0, frictionOk ?? 0);

  if (chosen === null || chosen === 0) {
    return { size: null, id: 0, velocity: 0, lossPer100: 0, lossTotal: 0, governedBy: "none" };
  }

  const id = insideDiameter(args.material, chosen) ?? 0;
  const v = velocity(args.gpm, id);
  const lossPer100 = frictionLossPsiPer100Ft(args.gpm, id, c);
  let governedBy: SupplySizeResult["governedBy"];
  if (velocityOk !== null && frictionOk !== null && velocityOk === frictionOk) {
    governedBy = "both";
  } else if (frictionOk !== null && chosen === frictionOk) {
    governedBy = "friction";
  } else {
    governedBy = "velocity";
  }

  return {
    size: chosen,
    id,
    velocity: v,
    lossPer100,
    lossTotal: (lossPer100 / 100) * args.developedFeet,
    governedBy,
  };
}

/* ------------------------------------------------------------------ *
 * Pressure and pump head — DERIVED
 * ------------------------------------------------------------------ */

/** Total dynamic head in feet — the four components a pump has to overcome. */
export function totalDynamicHead(args: {
  staticLiftFeet: number;
  frictionHeadFeet: number;
  pressureHeadFeet: number;
  velocityHeadFeet: number;
}): number {
  return (
    args.staticLiftFeet + args.frictionHeadFeet + args.pressureHeadFeet + args.velocityHeadFeet
  );
}

/** Velocity head, feet: V squared over 2g with g = 32.174 ft/s squared. */
export function velocityHead(ftPerSec: number): number {
  return (ftPerSec * ftPerSec) / (2 * 32.174);
}

/* ------------------------------------------------------------------ *
 * Water heating — DERIVED
 * ------------------------------------------------------------------ */

/** Recovery rate in gallons per hour from input BTU/hr, efficiency and rise. */
export function recoveryGph(btuPerHour: number, efficiency: number, deltaT: number): number {
  if (deltaT <= 0) return 0;
  return (btuPerHour * efficiency) / (LB_PER_GALLON * deltaT);
}

/**
 * First-hour rating: the usable fraction of a full tank plus one hour of
 * recovery. The 0.70 factor is the long-standing allowance for the cold water
 * mixing in as hot water is drawn off.
 */
export const FHR_USABLE_FRACTION = 0.7;

export function firstHourRating(tankGallons: number, recoveryGallonsPerHour: number): number {
  return FHR_USABLE_FRACTION * tankGallons + recoveryGallonsPerHour;
}

/** Continuous flow a tankless unit can deliver at a given temperature rise. */
export function tanklessGpm(btuPerHour: number, efficiency: number, deltaT: number): number {
  if (deltaT <= 0) return 0;
  return (btuPerHour * efficiency) / (BTU_PER_GPM_PER_DEGF * deltaT);
}

/** BTU/hr needed for a target flow at a target rise. */
export function tanklessBtuRequired(gpm: number, deltaT: number, efficiency: number): number {
  if (efficiency <= 0) return 0;
  return (gpm * BTU_PER_GPM_PER_DEGF * deltaT) / efficiency;
}

/** Fraction of the mix that must come from the hot side to hit a target temp. */
export function hotFraction(mixTemp: number, coldTemp: number, hotTemp: number): number {
  if (hotTemp === coldTemp) return 0;
  return (mixTemp - coldTemp) / (hotTemp - coldTemp);
}

/**
 * Hot-water draw per use, gallons. These are the figures the US DOE first-hour
 * rating worksheet uses for peak-hour demand; a modern low-flow shower is at
 * the bottom of the published shower range.
 */
export const PEAK_HOUR_USES: { key: string; label: string; gallons: number }[] = [
  { key: "shower", label: "Shower", gallons: 15 },
  { key: "bath", label: "Bath", gallons: 20 },
  { key: "shave", label: "Shaving", gallons: 2 },
  { key: "hands-face", label: "Hands and face washing", gallons: 4 },
  { key: "shampoo", label: "Hair shampoo", gallons: 4 },
  { key: "dishwasher", label: "Dishwasher", gallons: 6 },
  { key: "kitchen-sink", label: "Food prep / kitchen sink", gallons: 4 },
  { key: "clothes-washer", label: "Clothes washer", gallons: 7 },
];

/** Peak-hour hot water demand in gallons from a use-count map. */
export function peakHourDemand(counts: Record<string, number>): number {
  return PEAK_HOUR_USES.reduce((sum, u) => sum + (counts[u.key] ?? 0) * u.gallons, 0);
}

/** Storage water heater sizes commonly stocked, gallons. */
export const STANDARD_TANK_SIZES = [30, 40, 50, 60, 75, 80, 100];

/** Smallest stocked tank whose first-hour rating covers the demand. */
export function selectTank(
  demandGallons: number,
  btuPerHour: number,
  efficiency: number,
  deltaT: number,
): { tank: number | null; fhr: number; recovery: number } {
  const recovery = recoveryGph(btuPerHour, efficiency, deltaT);
  for (const tank of STANDARD_TANK_SIZES) {
    const fhr = firstHourRating(tank, recovery);
    if (fhr >= demandGallons) return { tank, fhr, recovery };
  }
  const largest = STANDARD_TANK_SIZES[STANDARD_TANK_SIZES.length - 1];
  return { tank: null, fhr: firstHourRating(largest, recovery), recovery };
}

/* ------------------------------------------------------------------ *
 * Pricing and cost models — ASSUMPTION-BASED, not code
 *
 * These are market assumptions, not code requirements, and they are the part of
 * this module most likely to be out of date. They live here rather than inside
 * the calculator scripts on purpose: the electrical category put its cost
 * constants in the scripts, which made the scripts the only source of truth and
 * meant every blog figure had to be recomputed by hand from them. Keeping the
 * model here lets the pages, the scripts and any future write-up read the same
 * numbers.
 *
 * Figures are US national-average retail pricing for 2026 and carry a plus or
 * minus band rather than pretending to a single answer. Regional multipliers
 * follow the same 0.85 / 1.00 / 1.25 / 1.50 ladder the electrical cost
 * calculators use, so the two categories stay comparable.
 * ------------------------------------------------------------------ */

export const REGION_MULTIPLIERS: { key: string; label: string; factor: number }[] = [
  { key: "low", label: "Lower-cost metro / rural", factor: 0.85 },
  { key: "average", label: "National average", factor: 1.0 },
  { key: "high", label: "Higher-cost metro", factor: 1.25 },
  { key: "very-high", label: "Major coastal metro", factor: 1.5 },
];

/** The band a cost estimate is quoted with, as a fraction either side. */
export const COST_BAND = 0.15;

export function costBand(total: number, band = COST_BAND): { low: number; high: number } {
  return { low: total * (1 - band), high: total * (1 + band) };
}

/* ---- Job estimate ------------------------------------------------- */

export type EstimateInput = {
  labourHours: number;
  labourRate: number;
  fixtureCost: number;
  materialCost: number;
  overheadPercent: number;
  marginPercent: number;
};

export type EstimateResult = {
  labour: number;
  direct: number;
  overhead: number;
  breakEven: number;
  price: number;
  profit: number;
  /** What the same percentage applied as a MARKUP would have produced. */
  markupPrice: number;
  markupProfit: number;
  /** The margin a markup of `marginPercent` actually delivers. */
  effectiveMargin: number;
};

/**
 * Price a job. The point of the two extra fields is the markup-versus-margin
 * trap: dividing by (1 − margin) and multiplying by (1 + markup) are not the
 * same operation, and the second always leaves money on the table.
 */
export function estimateJob(input: EstimateInput): EstimateResult {
  const labour = input.labourHours * input.labourRate;
  const direct = labour + input.fixtureCost + input.materialCost;
  const overhead = direct * (input.overheadPercent / 100);
  const breakEven = direct + overhead;
  const margin = input.marginPercent / 100;
  const price = margin >= 1 ? breakEven : breakEven / (1 - margin);
  const markupPrice = breakEven * (1 + margin);
  return {
    labour,
    direct,
    overhead,
    breakEven,
    price,
    profit: price - breakEven,
    markupPrice,
    markupProfit: markupPrice - breakEven,
    effectiveMargin: markupPrice > 0 ? ((markupPrice - breakEven) / markupPrice) * 100 : 0,
  };
}

/* ---- Whole-house repipe ------------------------------------------- */

export const REPIPE_MATERIAL_COST: { key: string; label: string; perSqFt: number }[] = [
  { key: "pex", label: "PEX", perSqFt: 5 },
  { key: "cpvc", label: "CPVC", perSqFt: 6 },
  { key: "copper", label: "Copper, Type L", perSqFt: 9 },
];

/**
 * Wall access is the biggest single lever in a repipe — a 2x spread between an
 * open crawlspace and finished plaster over lath, which is more than the
 * difference between PEX and copper.
 */
export const REPIPE_ACCESS: { key: string; label: string; factor: number }[] = [
  { key: "easy", label: "Easy — open walls, crawlspace or basement", factor: 0.8 },
  { key: "average", label: "Average — drywall, some fishing", factor: 1.0 },
  { key: "difficult", label: "Difficult — plaster, tile, slab or finished ceilings", factor: 1.6 },
];

export type RepipeInput = {
  squareFeet: number;
  materialKey: string;
  accessKey: string;
  storeys: number;
  bathrooms: number;
  permit: number;
  drywallRepair: number;
  regionKey: string;
};

export type RepipeResult = {
  base: number;
  afterAccess: number;
  afterStoreys: number;
  afterBathrooms: number;
  total: number;
  perSqFt: number;
  low: number;
  high: number;
  perSqFtRate: number;
  accessFactor: number;
  storeyFactor: number;
};

/** A second storey adds vertical risers and more fishing — 15%. */
export const REPIPE_SECOND_STOREY_FACTOR = 0.15;
/** Each bathroom past the second adds a branch group. */
export const REPIPE_EXTRA_BATH_COST = 750;

export function repipeCost(input: RepipeInput): RepipeResult {
  const rate =
    REPIPE_MATERIAL_COST.find((m) => m.key === input.materialKey)?.perSqFt ??
    REPIPE_MATERIAL_COST[0].perSqFt;
  const accessFactor =
    REPIPE_ACCESS.find((a) => a.key === input.accessKey)?.factor ?? 1;
  const storeyFactor = 1 + Math.max(0, input.storeys - 1) * REPIPE_SECOND_STOREY_FACTOR;
  const region =
    REGION_MULTIPLIERS.find((r) => r.key === input.regionKey)?.factor ?? 1;

  const base = input.squareFeet * rate;
  const afterAccess = base * accessFactor;
  const afterStoreys = afterAccess * storeyFactor;
  const afterBathrooms =
    afterStoreys + Math.max(0, input.bathrooms - 2) * REPIPE_EXTRA_BATH_COST;
  const total = (afterBathrooms + input.permit + input.drywallRepair) * region;
  const band = costBand(total);

  return {
    base,
    afterAccess,
    afterStoreys,
    afterBathrooms,
    total,
    perSqFt: input.squareFeet > 0 ? total / input.squareFeet : 0,
    low: band.low,
    high: band.high,
    perSqFtRate: rate,
    accessFactor,
    storeyFactor,
  };
}

/* ---- Water heater replacement ------------------------------------- */

export const WATER_HEATER_UNITS: {
  key: string;
  label: string;
  unit: number;
  hours: number;
}[] = [
  { key: "tank-gas-40", label: "40 gal gas tank", unit: 950, hours: 4 },
  { key: "tank-gas-50", label: "50 gal gas tank", unit: 1100, hours: 4 },
  { key: "tank-electric-50", label: "50 gal electric tank", unit: 800, hours: 3.5 },
  { key: "tank-hpwh-50", label: "50 gal heat pump (hybrid)", unit: 2000, hours: 6 },
  { key: "tankless-gas", label: "Tankless, gas", unit: 1600, hours: 8 },
  { key: "tankless-electric", label: "Tankless, electric", unit: 750, hours: 6 },
];

export type WaterHeaterUpgradeKey =
  | "expansionTank"
  | "pan"
  | "seismic"
  | "ventUpgrade"
  | "gasLineUpgrade"
  | "electricalCircuit"
  | "condensateDrain";

export const WATER_HEATER_UPGRADES: {
  key: WaterHeaterUpgradeKey;
  label: string;
  cost: number;
  note: string;
}[] = [
  { key: "expansionTank", label: "Thermal expansion tank", cost: 150, note: "Required by IPC 607.3 on any closed system" },
  { key: "pan", label: "Drain pan and drain line", cost: 120, note: "Required where a leak would damage the structure" },
  { key: "seismic", label: "Seismic strapping", cost: 90, note: "Required in seismic design categories C and up" },
  { key: "ventUpgrade", label: "Vent / flue upgrade", cost: 500, note: "Category IV tankless needs its own sealed vent" },
  { key: "gasLineUpgrade", label: "Gas line upsize", cost: 600, note: "A 199k BTU tankless usually outgrows a 1/2 in branch" },
  { key: "electricalCircuit", label: "New electrical circuit", cost: 450, note: "Heat pump and electric tankless units" },
  { key: "condensateDrain", label: "Condensate drain / neutraliser", cost: 200, note: "Condensing gas units" },
];

export type WaterHeaterCostInput = {
  unitKey: string;
  labourRate: number;
  permit: number;
  haulAway: number;
  upgrades: WaterHeaterUpgradeKey[];
  regionKey: string;
};

export type WaterHeaterCostResult = {
  unit: number;
  hours: number;
  labour: number;
  upgradeTotal: number;
  upgradeLines: { label: string; cost: number }[];
  total: number;
  low: number;
  high: number;
  unitShare: number;
};

export function waterHeaterCost(input: WaterHeaterCostInput): WaterHeaterCostResult {
  const spec =
    WATER_HEATER_UNITS.find((u) => u.key === input.unitKey) ?? WATER_HEATER_UNITS[1];
  const region =
    REGION_MULTIPLIERS.find((r) => r.key === input.regionKey)?.factor ?? 1;
  const labour = spec.hours * input.labourRate;
  const upgradeLines = WATER_HEATER_UPGRADES.filter((u) =>
    input.upgrades.includes(u.key),
  ).map((u) => ({ label: u.label, cost: u.cost }));
  const upgradeTotal = upgradeLines.reduce((sum, u) => sum + u.cost, 0);
  const total =
    (spec.unit + labour + upgradeTotal + input.permit + input.haulAway) * region;
  const band = costBand(total, 0.18);
  return {
    unit: spec.unit,
    hours: spec.hours,
    labour,
    upgradeTotal,
    upgradeLines,
    total,
    low: band.low,
    high: band.high,
    unitShare: total > 0 ? ((spec.unit * region) / total) * 100 : 0,
  };
}

/* ---- Loaded labour rate ------------------------------------------- */

export const HOURS_PER_YEAR = 2080;

export type LabourRateInput = {
  wage: number;
  burdenPercent: number;
  overheadPerTech: number;
  billableHours: number;
  marginPercent: number;
};

export type LabourRateResult = {
  baseWage: number;
  burden: number;
  wageWithBurden: number;
  totalCost: number;
  loadedCost: number;
  billRate: number;
  multiple: number;
  utilisation: number;
};

/**
 * Wage to bill rate. The step people skip is dividing by BILLABLE hours rather
 * than paid hours — a tech is paid 2,080 hours a year and sells far fewer, and
 * that gap is what the rate has to absorb.
 */
export function labourRate(input: LabourRateInput): LabourRateResult {
  const baseWage = input.wage * HOURS_PER_YEAR;
  const burden = baseWage * (input.burdenPercent / 100);
  const wageWithBurden = baseWage + burden;
  const totalCost = wageWithBurden + input.overheadPerTech;
  const loadedCost = input.billableHours > 0 ? totalCost / input.billableHours : 0;
  const margin = input.marginPercent / 100;
  const billRate = margin >= 1 ? loadedCost : loadedCost / (1 - margin);
  return {
    baseWage,
    burden,
    wageWithBurden,
    totalCost,
    loadedCost,
    billRate,
    multiple: input.wage > 0 ? billRate / input.wage : 0,
    utilisation: (input.billableHours / HOURS_PER_YEAR) * 100,
  };
}
