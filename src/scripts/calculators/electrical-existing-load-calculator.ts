import { STANDARD_SERVICE_RATINGS, fmt, fmtInt } from "@/lib/nec";

/**
 * NEC 220.87 — determining existing loads from measured demand.
 *
 * The existing load may be taken as the maximum demand recorded over the previous
 * 12 months multiplied by 125%. Where a year of data is not available, 30 days of
 * recorded demand data may be used instead. A new load is then added on top, at 125%
 * where it is continuous (210.20(A); EV supply equipment is continuous per 625.41).
 */
const EXISTING_MULTIPLIER = 1.25;
const CONTINUOUS_MULTIPLIER = 1.25;

export function initElectricalExistingLoadCalculator(): void {
  const peak = document.getElementById("el-peak") as HTMLInputElement | null;
  const peakRange = document.getElementById("el-peak-range") as HTMLInputElement | null;
  const service = document.getElementById("el-service") as HTMLSelectElement | null;
  const newLoad = document.getElementById("el-new") as HTMLInputElement | null;
  const continuous = document.getElementById("el-continuous") as HTMLSelectElement | null;
  const resetBtn = document.getElementById("el-reset");

  const out = {
    total: document.getElementById("el-total"),
    verdict: document.getElementById("el-verdict"),
    headroom: document.getElementById("el-headroom"),
    existing: document.getElementById("el-existing"),
    note: document.getElementById("el-note"),
    bdPeak: document.getElementById("el-bd-peak"),
    bdExisting: document.getElementById("el-bd-existing"),
    bdNew: document.getElementById("el-bd-new"),
    bdTotal: document.getElementById("el-bd-total"),
    bdService: document.getElementById("el-bd-service"),
    bdHeadroom: document.getElementById("el-bd-headroom"),
  };

  if (!peak || !peakRange || !service || !newLoad || !continuous) return;
  if (Object.values(out).some((el) => !el)) return;

  function calculate(): void {
    const peakAmps = Math.max(0, parseFloat(peak!.value) || 0);
    const serviceAmps = parseFloat(service!.value) || 100;
    const newAmps = Math.max(0, parseFloat(newLoad!.value) || 0);
    const isContinuous = continuous!.value === "yes";

    const existingLoad = peakAmps * EXISTING_MULTIPLIER;
    const newApplied = isContinuous ? newAmps * CONTINUOUS_MULTIPLIER : newAmps;
    const total = existingLoad + newApplied;
    const headroom = serviceAmps - total;
    const fits = total <= serviceAmps;

    out.total!.textContent = `${fmt(total, 1)} A`;
    out.existing!.textContent = `${fmt(existingLoad, 1)} A`;
    out.headroom!.textContent = `${fmt(Math.abs(headroom), 1)} A`;

    out.verdict!.textContent = fits ? "Fits the existing service" : "Exceeds the existing service";
    out.verdict!.className = fits
      ? "mt-1 text-sm font-semibold text-emerald-700"
      : "mt-1 text-sm font-semibold text-red-700";

    if (fits) {
      const nextUp = STANDARD_SERVICE_RATINGS.find((r) => r > serviceAmps) ?? serviceAmps;
      out.note!.textContent =
        headroom < serviceAmps * 0.1
          ? `Inside the ${fmtInt(serviceAmps)} A service, but with little margin — worth documenting the calculation carefully for the AHJ. A ${nextUp} A service would leave more room for later additions.`
          : `The ${fmtInt(serviceAmps)} A service covers this with ${fmt(headroom, 1)} A to spare, so no upgrade is required on the basis of load.`;
    } else {
      const needed = STANDARD_SERVICE_RATINGS.find((r) => r >= total) ?? 400;
      out.note!.textContent = `Over the ${fmtInt(serviceAmps)} A service by ${fmt(Math.abs(headroom), 1)} A. Options: a ${needed} A service, a load-management system (Article 750), or a smaller version of the new load.`;
    }

    out.bdPeak!.textContent = `${fmt(peakAmps, 1)} A recorded`;
    out.bdExisting!.textContent = `${fmt(peakAmps, 1)} × 1.25 = ${fmt(existingLoad, 1)} A`;
    out.bdNew!.textContent = isContinuous
      ? `${fmt(newAmps, 1)} × 1.25 = ${fmt(newApplied, 1)} A (continuous)`
      : `${fmt(newAmps, 1)} A (non-continuous)`;
    out.bdTotal!.textContent = `${fmt(total, 1)} A`;
    out.bdService!.textContent = `${fmtInt(serviceAmps)} A`;
    out.bdHeadroom!.textContent = fits ? `${fmt(headroom, 1)} A remaining` : `${fmt(Math.abs(headroom), 1)} A over`;
  }

  peak.addEventListener("input", () => {
    const v = parseFloat(peak.value) || 0;
    if (v >= Number(peakRange.min) && v <= Number(peakRange.max)) peakRange.value = String(v);
    calculate();
  });
  peakRange.addEventListener("input", () => {
    peak.value = peakRange.value;
    calculate();
  });
  [service, continuous].forEach((el) => el.addEventListener("change", calculate));
  newLoad.addEventListener("input", calculate);

  resetBtn?.addEventListener("click", () => {
    peak.value = "44";
    peakRange.value = "44";
    service.value = "100";
    newLoad.value = "32";
    continuous.value = "yes";
    calculate();
  });

  calculate();
}
