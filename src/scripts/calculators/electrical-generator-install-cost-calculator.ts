import { fmtInt, usd } from "@/lib/nec";

/**
 * Standby generator installation cost. 2026 US market figures — ranges, not quotes.
 *
 * The structure worth understanding is that the generator itself is usually less
 * than two thirds of the job. The transfer switch, the fuel run, the pad, the
 * permit and the labour together routinely add as much again, which is why a
 * "$5,800 generator" turns into an $11,000 invoice.
 *
 * Unit prices track air-cooled residential sets up to 26 kW and liquid-cooled
 * above that — the jump between 26 and 36 kW is a change of machine, not a
 * change of size, and the price step reflects it.
 */
const UNIT_COST: Record<string, number> = {
  "10": 3200,
  "14": 4200,
  "18": 5000,
  "22": 5800,
  "26": 7400,
  "36": 11500,
  "48": 15000,
};

/** Service-rated whole-house switches cost far more than an essential-circuits panel. */
const ATS_COST: Record<string, number> = {
  "essential-100": 700,
  "essential-150": 900,
  "whole-200": 1600,
  "whole-400": 3200,
};

const FUEL_PER_FT: Record<string, number> = {
  natural: 28,
  propane: 32,
};

/** A buried LP tank is its own line item; natural gas has no equivalent. */
const LP_TANK = 1200;

const PAD_COST: Record<string, number> = {
  gravel: 250,
  precast: 600,
  poured: 900,
};

export function initElectricalGeneratorInstallCostCalculator(): void {
  const size = document.getElementById("gi-size") as HTMLSelectElement | null;
  const ats = document.getElementById("gi-ats") as HTMLSelectElement | null;
  const fuel = document.getElementById("gi-fuel") as HTMLSelectElement | null;
  const runFt = document.getElementById("gi-run") as HTMLInputElement | null;
  const runRange = document.getElementById("gi-run-range") as HTMLInputElement | null;
  const pad = document.getElementById("gi-pad") as HTMLSelectElement | null;
  const permit = document.getElementById("gi-permit") as HTMLInputElement | null;
  const hours = document.getElementById("gi-hours") as HTMLInputElement | null;
  const rate = document.getElementById("gi-rate") as HTMLInputElement | null;
  const region = document.getElementById("gi-region") as HTMLSelectElement | null;
  const resetBtn = document.getElementById("gi-reset");

  const out = {
    total: document.getElementById("gi-total"),
    low: document.getElementById("gi-low"),
    high: document.getElementById("gi-high"),
    unitShare: document.getElementById("gi-unit-share"),
    note: document.getElementById("gi-note"),
    bdUnit: document.getElementById("gi-bd-unit"),
    bdAts: document.getElementById("gi-bd-ats"),
    bdFuel: document.getElementById("gi-bd-fuel"),
    bdTank: document.getElementById("gi-bd-tank"),
    bdPad: document.getElementById("gi-bd-pad"),
    bdPermit: document.getElementById("gi-bd-permit"),
    bdLabor: document.getElementById("gi-bd-labor"),
    bdSubtotal: document.getElementById("gi-bd-subtotal"),
    bdRegion: document.getElementById("gi-bd-region"),
  };

  if (!size || !ats || !fuel || !runFt || !runRange || !pad || !permit || !hours || !rate || !region) return;
  if (Object.values(out).some((el) => !el)) return;

  function calculate(): void {
    const unit = UNIT_COST[size!.value] ?? 5800;
    const atsCost = ATS_COST[ats!.value] ?? 1600;
    const perFt = FUEL_PER_FT[fuel!.value] ?? 28;
    const feet = Math.max(0, parseFloat(runFt!.value) || 0);
    const fuelRun = perFt * feet;
    const tank = fuel!.value === "propane" ? LP_TANK : 0;
    const padCost = PAD_COST[pad!.value] ?? 600;
    const permitFee = Math.max(0, parseFloat(permit!.value) || 0);
    const laborHours = Math.max(0, parseFloat(hours!.value) || 0);
    const laborRate = Math.max(0, parseFloat(rate!.value) || 0);
    const labor = laborHours * laborRate;
    const regionMultiplier = parseFloat(region!.value) || 1;

    const subtotal = unit + atsCost + fuelRun + tank + padCost + permitFee + labor;
    const total = subtotal * regionMultiplier;
    const unitShare = total > 0 ? (unit * regionMultiplier) / total : 0;

    out.total!.textContent = usd(total);
    out.low!.textContent = usd(total * 0.85);
    out.high!.textContent = usd(total * 1.15);
    out.unitShare!.textContent = `${Math.round(unitShare * 100)}%`;

    if (unitShare < 0.5) {
      out.note!.textContent = `The generator is only ${Math.round(
        unitShare * 100,
      )}% of this total — everything else is installation. That is the normal shape of a standby job, and it is why comparing quotes on the machine alone tells you almost nothing.`;
    } else if (total > 20000) {
      out.note!.textContent =
        "A liquid-cooled set with a large transfer switch. At this size the load calculation matters more than the price — NEC 702.4(B)(2) permits a smaller generator with load management, which is often far cheaper than the next machine up.";
    } else {
      out.note!.textContent = `The generator is ${Math.round(
        unitShare * 100,
      )}% of this total. Installation is the rest — transfer switch, fuel, pad, permit, and labour.`;
    }

    out.bdUnit!.textContent = `${size!.value} kW air-cooled or liquid-cooled set = ${usd(unit)}`;
    out.bdAts!.textContent = usd(atsCost);
    out.bdFuel!.textContent = `${fmtInt(feet)} ft × $${perFt}/ft = ${usd(fuelRun)}`;
    out.bdTank!.textContent = tank > 0 ? `${usd(tank)} (buried LP tank)` : "Not needed on natural gas — $0";
    out.bdPad!.textContent = usd(padCost);
    out.bdPermit!.textContent = usd(permitFee);
    out.bdLabor!.textContent = `${laborHours} h × ${usd(laborRate)} = ${usd(labor)}`;
    out.bdSubtotal!.textContent = usd(subtotal);
    out.bdRegion!.textContent = `× ${regionMultiplier.toFixed(2)} = ${usd(total)}`;
  }

  runFt.addEventListener("input", () => {
    const v = parseFloat(runFt.value) || 0;
    if (v >= Number(runRange.min) && v <= Number(runRange.max)) runRange.value = String(v);
    calculate();
  });
  runRange.addEventListener("input", () => {
    runFt.value = runRange.value;
    calculate();
  });
  [size, ats, fuel, pad, region].forEach((el) => el.addEventListener("change", calculate));
  [permit, hours, rate].forEach((el) => el.addEventListener("input", calculate));

  resetBtn?.addEventListener("click", () => {
    size.value = "22";
    ats.value = "whole-200";
    fuel.value = "natural";
    runFt.value = "40";
    runRange.value = "40";
    pad.value = "precast";
    permit.value = "350";
    hours.value = "16";
    rate.value = "95";
    region.value = "1";
    calculate();
  });

  calculate();
}
