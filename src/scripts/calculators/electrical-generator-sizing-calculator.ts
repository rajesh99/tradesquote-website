import { fmt, fmtInt } from "@/lib/nec";

/**
 * Standby generator sizing.
 *
 * Two independent requirements have to be met, and the larger governs:
 *
 *  1. Running capacity — the sum of the running watts of everything that may run at
 *     once, plus a margin so the set is not operated at 100% continuously.
 *  2. Starting capacity — every other load running while the largest motor starts.
 *     Motor inrush is several times running current, so this frequently governs on
 *     a house with an air conditioner or a well pump.
 *
 * Generators are then selected from standard air-cooled and liquid-cooled sizes.
 */
const STANDARD_KW = [7.5, 10, 12, 14, 16, 18, 20, 22, 24, 26, 30, 36, 48, 60];

export function initElectricalGeneratorSizingCalculator(): void {
  const hvac = document.getElementById("gs-hvac") as HTMLInputElement | null;
  const well = document.getElementById("gs-well") as HTMLInputElement | null;
  const fridge = document.getElementById("gs-fridge") as HTMLInputElement | null;
  const lights = document.getElementById("gs-lights") as HTMLInputElement | null;
  const sump = document.getElementById("gs-sump") as HTMLInputElement | null;
  const other = document.getElementById("gs-other") as HTMLInputElement | null;
  const largest = document.getElementById("gs-largest") as HTMLInputElement | null;
  const multiplier = document.getElementById("gs-multiplier") as HTMLSelectElement | null;
  const margin = document.getElementById("gs-margin") as HTMLInputElement | null;
  const marginRange = document.getElementById("gs-margin-range") as HTMLInputElement | null;
  const resetBtn = document.getElementById("gs-reset");

  const out = {
    size: document.getElementById("gs-size"),
    governing: document.getElementById("gs-governing"),
    running: document.getElementById("gs-running"),
    starting: document.getElementById("gs-starting"),
    note: document.getElementById("gs-note"),
    bdRunning: document.getElementById("gs-bd-running"),
    bdMargin: document.getElementById("gs-bd-margin"),
    bdSurge: document.getElementById("gs-bd-surge"),
    bdStarting: document.getElementById("gs-bd-starting"),
    bdRequired: document.getElementById("gs-bd-required"),
    bdSelected: document.getElementById("gs-bd-selected"),
  };

  if (!hvac || !well || !fridge || !lights || !sump || !other || !largest || !multiplier || !margin || !marginRange) {
    return;
  }
  if (Object.values(out).some((el) => !el)) return;

  const num = (el: HTMLInputElement) => Math.max(0, parseFloat(el.value) || 0);

  function calculate(): void {
    const runningTotal =
      num(hvac!) + num(well!) + num(fridge!) + num(lights!) + num(sump!) + num(other!);
    const largestRunning = Math.min(num(largest!), runningTotal);
    const surgeFactor = parseFloat(multiplier!.value) || 3;
    const marginPct = Math.min(100, Math.max(0, parseFloat(margin!.value) || 0)) / 100;

    const largestStarting = largestRunning * surgeFactor;
    const runningRequirement = runningTotal * (1 + marginPct);
    const startingRequirement = runningTotal - largestRunning + largestStarting;

    const required = Math.max(runningRequirement, startingRequirement);
    const requiredKw = required / 1000;
    const selected = STANDARD_KW.find((k) => k >= requiredKw) ?? STANDARD_KW[STANDARD_KW.length - 1];
    const startingGoverns = startingRequirement > runningRequirement;

    out.size!.textContent = `${fmt(selected, selected % 1 === 0 ? 0 : 1)} kW`;
    out.governing!.textContent = startingGoverns
      ? "Motor starting governs the size"
      : "Running load governs the size";
    out.running!.textContent = `${fmtInt(runningTotal)} W`;
    out.starting!.textContent = `${fmtInt(startingRequirement)} W`;

    if (requiredKw > 60) {
      out.note!.textContent =
        "Above the largest standard residential set. A load-shedding module or splitting the loads across a smaller generator is usually cheaper than a commercial-size unit.";
    } else if (startingGoverns) {
      out.note!.textContent = `The generator has to absorb ${fmtInt(largestStarting)} W of inrush while ${fmtInt(runningTotal - largestRunning)} W is already running. A soft starter on the largest motor would cut the starting requirement and could drop you a size.`;
    } else {
      out.note!.textContent = `Running load plus a ${fmt(marginPct * 100, 0)}% margin sets the size here. Confirm the largest motor's locked-rotor draw on its nameplate — a hard-starting compressor can push the starting requirement above this.`;
    }

    out.bdRunning!.textContent = `${fmtInt(runningTotal)} W`;
    out.bdMargin!.textContent = `${fmtInt(runningTotal)} × ${(1 + marginPct).toFixed(2)} = ${fmtInt(runningRequirement)} W`;
    out.bdSurge!.textContent = `${fmtInt(largestRunning)} × ${surgeFactor} = ${fmtInt(largestStarting)} W`;
    out.bdStarting!.textContent = `${fmtInt(runningTotal)} − ${fmtInt(largestRunning)} + ${fmtInt(largestStarting)} = ${fmtInt(startingRequirement)} W`;
    out.bdRequired!.textContent = `${fmtInt(required)} W (${fmt(requiredKw, 1)} kW)`;
    out.bdSelected!.textContent = `${fmt(selected, selected % 1 === 0 ? 0 : 1)} kW standard size`;
  }

  margin.addEventListener("input", () => {
    const v = parseFloat(margin.value) || 0;
    if (v >= Number(marginRange.min) && v <= Number(marginRange.max)) marginRange.value = String(v);
    calculate();
  });
  marginRange.addEventListener("input", () => {
    margin.value = marginRange.value;
    calculate();
  });
  [hvac, well, fridge, lights, sump, other, largest].forEach((el) => el.addEventListener("input", calculate));
  multiplier.addEventListener("change", calculate);

  resetBtn?.addEventListener("click", () => {
    hvac.value = "5000";
    well.value = "1500";
    fridge.value = "700";
    lights.value = "1200";
    sump.value = "800";
    other.value = "0";
    largest.value = "5000";
    multiplier.value = "3";
    margin.value = "25";
    marginRange.value = "25";
    calculate();
  });

  calculate();
}
