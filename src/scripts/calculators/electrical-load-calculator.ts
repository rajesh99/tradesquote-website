import { STANDARD_SERVICE_RATINGS, fmt, fmtInt } from "@/lib/nec";

/** NEC 220.82 general-lighting unit load for dwellings, VA per square foot. */
const VA_PER_SQFT = 3;
/** NEC 220.52 — 1,500 VA per small-appliance and per laundry branch circuit. */
const VA_PER_CIRCUIT = 1500;
/** NEC 220.82(B) — first 10 kVA at 100%, the remainder at 40%. */
const FIRST_TIER_VA = 10000;
const REMAINDER_FACTOR = 0.4;

export function initElectricalLoadCalculator(): void {
  const ids = [
    "lc-area",
    "lc-sac",
    "lc-laundry",
    "lc-range",
    "lc-dryer",
    "lc-wh",
    "lc-dishwasher",
    "lc-other",
    "lc-ac",
    "lc-heat",
    "lc-ev",
  ] as const;

  const inputs = ids.map((id) => document.getElementById(id) as HTMLInputElement | null);
  const areaRange = document.getElementById("lc-area-range") as HTMLInputElement | null;
  const resetBtn = document.getElementById("lc-reset");

  const out = {
    amps: document.getElementById("lc-amps"),
    va: document.getElementById("lc-va"),
    service: document.getElementById("lc-service"),
    note: document.getElementById("lc-note"),
    bdGeneral: document.getElementById("lc-bd-general"),
    bdSac: document.getElementById("lc-bd-sac"),
    bdLaundry: document.getElementById("lc-bd-laundry"),
    bdAppliances: document.getElementById("lc-bd-appliances"),
    bdSubtotal: document.getElementById("lc-bd-subtotal"),
    bdFirstTier: document.getElementById("lc-bd-first-tier"),
    bdRemainder: document.getElementById("lc-bd-remainder"),
    bdHvac: document.getElementById("lc-bd-hvac"),
    bdTotal: document.getElementById("lc-bd-total"),
    bdAmps: document.getElementById("lc-bd-amps"),
  };

  if (inputs.some((el) => !el) || !areaRange || Object.values(out).some((el) => !el)) return;

  const [area, sac, laundry, range, dryer, wh, dishwasher, other, ac, heat, ev] = inputs as HTMLInputElement[];

  function num(el: HTMLInputElement, fallback = 0): number {
    const value = parseFloat(el.value);
    return Number.isFinite(value) && value >= 0 ? value : fallback;
  }

  function calculate(): void {
    const sqft = num(area);
    const sacCount = Math.max(2, Math.round(num(sac, 2)));
    const laundryCount = Math.max(1, Math.round(num(laundry, 1)));

    const general = sqft * VA_PER_SQFT;
    const sacVa = sacCount * VA_PER_CIRCUIT;
    const laundryVa = laundryCount * VA_PER_CIRCUIT;
    const applianceVa = num(range) + num(dryer) + num(wh) + num(dishwasher) + num(other) + num(ev);

    const subtotal = general + sacVa + laundryVa + applianceVa;

    // NEC 220.82(B) — first 10 kVA at 100%, remainder at 40%.
    const firstTier = Math.min(subtotal, FIRST_TIER_VA);
    const remainder = Math.max(0, subtotal - FIRST_TIER_VA);
    const remainderApplied = remainder * REMAINDER_FACTOR;

    // NEC 220.82(C) — take the largest of the heating/cooling options at 100%.
    const hvac = Math.max(num(ac), num(heat));

    const total = firstTier + remainderApplied + hvac;
    const amps = total / 240;
    const service = STANDARD_SERVICE_RATINGS.find((r) => r >= amps) ?? 400;

    out.amps!.textContent = `${fmt(amps)} A`;
    out.va!.textContent = `${fmtInt(total)} VA`;
    out.service!.textContent = `${service} A minimum`;

    const recommended = STANDARD_SERVICE_RATINGS.find((r) => r >= amps * 1.25 && r >= service) ?? service;
    out.note!.textContent =
      recommended > service
        ? `${service} A meets code today. A ${recommended} A service leaves room for an EV charger or heat pump later.`
        : `${service} A is both the code minimum and a sensible install size for this load.`;

    out.bdGeneral!.textContent = `${fmtInt(sqft)} ft² × ${VA_PER_SQFT} = ${fmtInt(general)} VA`;
    out.bdSac!.textContent = `${sacCount} × ${fmtInt(VA_PER_CIRCUIT)} = ${fmtInt(sacVa)} VA`;
    out.bdLaundry!.textContent = `${laundryCount} × ${fmtInt(VA_PER_CIRCUIT)} = ${fmtInt(laundryVa)} VA`;
    out.bdAppliances!.textContent = `${fmtInt(applianceVa)} VA`;
    out.bdSubtotal!.textContent = `${fmtInt(subtotal)} VA`;
    out.bdFirstTier!.textContent = `${fmtInt(firstTier)} VA at 100%`;
    out.bdRemainder!.textContent = `${fmtInt(remainder)} VA × 0.40 = ${fmtInt(remainderApplied)} VA`;
    out.bdHvac!.textContent = `${fmtInt(hvac)} VA at 100%`;
    out.bdTotal!.textContent = `${fmtInt(total)} VA`;
    out.bdAmps!.textContent = `${fmtInt(total)} ÷ 240 = ${fmt(amps)} A`;
  }

  area.addEventListener("input", () => {
    const value = num(area);
    if (value >= Number(areaRange!.min) && value <= Number(areaRange!.max)) {
      areaRange!.value = String(value);
    }
    calculate();
  });
  areaRange.addEventListener("input", () => {
    area.value = areaRange!.value;
    calculate();
  });
  [sac, laundry, range, dryer, wh, dishwasher, other, ac, heat, ev].forEach((el) =>
    el.addEventListener("input", calculate),
  );

  resetBtn?.addEventListener("click", () => {
    area.value = "2000";
    areaRange.value = "2000";
    sac.value = "2";
    laundry.value = "1";
    range.value = "12000";
    dryer.value = "5000";
    wh.value = "4500";
    dishwasher.value = "1200";
    other.value = "0";
    ac.value = "5000";
    heat.value = "0";
    ev.value = "0";
    calculate();
  });

  calculate();
}
