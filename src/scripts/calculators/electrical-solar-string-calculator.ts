import { stringSizing, pvVoltageCorrection, fmt } from "@/lib/nec";

/**
 * PV string sizing — the two temperature extremes that bound a string.
 *
 * Cold sets the maximum. Open-circuit voltage rises as the cell gets colder, and
 * NEC 690.7 requires the maximum voltage be calculated at the lowest expected
 * ambient temperature. Exceed the inverter's maximum input and the inverter is
 * destroyed — on the coldest sunny morning of the year, not on installation day.
 *
 * Heat sets the minimum. Vmp falls as the cell heats, and if the string drops
 * below the MPPT window the inverter stops tracking and the array's output
 * collapses. Cell temperature runs well above ambient — 25 to 35°C above it for a
 * roof mount — which is why the hot case is entered as a cell temperature.
 */
export function initElectricalSolarStringCalculator(): void {
  const voc = document.getElementById("ss-voc") as HTMLInputElement | null;
  const vmp = document.getElementById("ss-vmp") as HTMLInputElement | null;
  const coeffVoc = document.getElementById("ss-coeff-voc") as HTMLInputElement | null;
  const coeffVmp = document.getElementById("ss-coeff-vmp") as HTMLInputElement | null;
  const lowTemp = document.getElementById("ss-low-temp") as HTMLInputElement | null;
  const lowTempRange = document.getElementById("ss-low-temp-range") as HTMLInputElement | null;
  const hotCell = document.getElementById("ss-hot-cell") as HTMLInputElement | null;
  const maxVolts = document.getElementById("ss-max-volts") as HTMLSelectElement | null;
  const mpptMin = document.getElementById("ss-mppt-min") as HTMLInputElement | null;
  const resetBtn = document.getElementById("ss-reset");

  const out = {
    range: document.getElementById("ss-range"),
    maxModules: document.getElementById("ss-max-modules"),
    minModules: document.getElementById("ss-min-modules"),
    vocCold: document.getElementById("ss-voc-cold"),
    vmpHot: document.getElementById("ss-vmp-hot"),
    note: document.getElementById("ss-note"),
    bdColdDelta: document.getElementById("ss-bd-cold-delta"),
    bdVocCold: document.getElementById("ss-bd-voc-cold"),
    bdMax: document.getElementById("ss-bd-max"),
    bdHotDelta: document.getElementById("ss-bd-hot-delta"),
    bdVmpHot: document.getElementById("ss-bd-vmp-hot"),
    bdMin: document.getElementById("ss-bd-min"),
    bdTable: document.getElementById("ss-bd-table"),
  };

  if (!voc || !vmp || !coeffVoc || !coeffVmp || !lowTemp || !lowTempRange || !hotCell || !maxVolts || !mpptMin) return;
  if (Object.values(out).some((el) => !el)) return;

  function calculate(): void {
    const vocStc = Math.max(1, parseFloat(voc!.value) || 0);
    const vmpStc = Math.max(1, parseFloat(vmp!.value) || 0);
    const tempCoeffVoc = parseFloat(coeffVoc!.value) || 0;
    const tempCoeffVmp = parseFloat(coeffVmp!.value) || 0;
    const lowAmbientC = parseFloat(lowTemp!.value) || 0;
    const hotCellC = parseFloat(hotCell!.value) || 0;
    const inverterMaxVolts = parseFloat(maxVolts!.value) || 600;
    const mpptMinVolts = Math.max(1, parseFloat(mpptMin!.value) || 0);

    const r = stringSizing({
      vocStc,
      vmpStc,
      tempCoeffVoc,
      tempCoeffVmp,
      lowAmbientC,
      hotCellC,
      inverterMaxVolts,
      mpptMinVolts,
    });

    out.maxModules!.textContent = String(r.maxModules);
    out.minModules!.textContent = String(r.minModules);
    out.vocCold!.textContent = `${fmt(r.vocCold, 2)} V`;
    out.vmpHot!.textContent = `${fmt(r.vmpHot, 2)} V`;

    if (!r.viable) {
      out.range!.textContent = "No valid string";
      out.range!.className = "text-4xl sm:text-5xl font-extrabold tracking-tight text-red-600";
      out.note!.textContent = `The cold limit (${r.maxModules} modules) is below the hot minimum (${r.minModules}). No string length works with this module and inverter combination — a wider MPPT window, a higher maximum input voltage, or a different module is required.`;
    } else {
      out.range!.textContent =
        r.minModules === r.maxModules ? `${r.maxModules} modules` : `${r.minModules}–${r.maxModules}`;
      out.range!.className = "text-4xl sm:text-5xl font-extrabold tracking-tight text-amber-600";
      const headroom = inverterMaxVolts - r.maxModules * r.vocCold;
      out.note!.textContent = `A string of ${r.maxModules} reaches ${fmt(
        r.maxModules * r.vocCold,
        1,
      )} V at ${fmt(lowAmbientC, 0)}°C — ${fmt(headroom, 1)} V under the inverter's ${inverterMaxVolts} V ceiling. Design to the maximum only if you trust the record-low temperature you entered; one module fewer buys a large safety margin for very little production.`;
    }

    const coldDelta = lowAmbientC - 25;
    const hotDelta = hotCellC - 25;
    const { factor, label } = pvVoltageCorrection(lowAmbientC);

    out.bdColdDelta!.textContent = `${fmt(lowAmbientC, 0)}°C − 25°C = ${fmt(coldDelta, 0)}°C`;
    out.bdVocCold!.textContent = `${fmt(vocStc, 2)} × (1 + ${tempCoeffVoc}%/°C × ${fmt(
      coldDelta,
      0,
    )}) = ${fmt(r.vocCold, 2)} V`;
    out.bdMax!.textContent = `${inverterMaxVolts} ÷ ${fmt(r.vocCold, 2)} = ${fmt(
      inverterMaxVolts / r.vocCold,
      2,
    )} → ${r.maxModules} modules`;
    out.bdHotDelta!.textContent = `${fmt(hotCellC, 0)}°C cell − 25°C = +${fmt(hotDelta, 0)}°C`;
    out.bdVmpHot!.textContent = `${fmt(vmpStc, 2)} × (1 + ${tempCoeffVmp}%/°C × ${fmt(
      hotDelta,
      0,
    )}) = ${fmt(r.vmpHot, 2)} V`;
    out.bdMin!.textContent = `${mpptMinVolts} ÷ ${fmt(r.vmpHot, 2)} = ${fmt(
      mpptMinVolts / r.vmpHot,
      2,
    )} → ${r.minModules} modules`;
    out.bdTable!.textContent = `${label} → ×${factor} → ${fmt(r.tableVocCold, 2)} V → ${r.tableMaxModules} modules`;
  }

  lowTemp.addEventListener("input", () => {
    const v = parseFloat(lowTemp.value);
    if (!Number.isNaN(v) && v >= Number(lowTempRange.min) && v <= Number(lowTempRange.max)) {
      lowTempRange.value = String(v);
    }
    calculate();
  });
  lowTempRange.addEventListener("input", () => {
    lowTemp.value = lowTempRange.value;
    calculate();
  });
  maxVolts.addEventListener("change", calculate);
  [voc, vmp, coeffVoc, coeffVmp, hotCell, mpptMin].forEach((el) => el.addEventListener("input", calculate));

  resetBtn?.addEventListener("click", () => {
    voc.value = "49.5";
    vmp.value = "41.5";
    coeffVoc.value = "-0.27";
    coeffVmp.value = "-0.35";
    lowTemp.value = "-10";
    lowTempRange.value = "-10";
    hotCell.value = "65";
    maxVolts.value = "600";
    mpptMin.value = "80";
    calculate();
  });

  calculate();
}
