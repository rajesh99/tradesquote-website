import {
  CONDUCTOR_SIZES,
  TABLE_310_12,
  cmilOf,
  findSizeByAmpacity,
  fmt,
  gecSize,
  sizeLabel,
  voltageDrop,
  type ConductorMaterial,
} from "@/lib/nec";

export function initElectricalServiceWireSizeCalculator(): void {
  const rating = document.getElementById("sw-rating") as HTMLSelectElement | null;
  const material = document.getElementById("sw-material") as HTMLSelectElement | null;
  const type = document.getElementById("sw-type") as HTMLSelectElement | null;
  const length = document.getElementById("sw-length") as HTMLInputElement | null;
  const voltage = document.getElementById("sw-voltage") as HTMLSelectElement | null;
  const resetBtn = document.getElementById("sw-reset");

  const out = {
    gauge: document.getElementById("sw-gauge"),
    neutral: document.getElementById("sw-neutral"),
    gec: document.getElementById("sw-gec"),
    note: document.getElementById("sw-note"),
    bdTable: document.getElementById("sw-bd-table"),
    bdUngrounded: document.getElementById("sw-bd-ungrounded"),
    bdNeutral: document.getElementById("sw-bd-neutral"),
    bdGec: document.getElementById("sw-bd-gec"),
    bdDrop: document.getElementById("sw-bd-drop"),
    bd83: document.getElementById("sw-bd-83"),
  };

  if (
    !rating ||
    !material ||
    !type ||
    !length ||
    !voltage ||
    !out.gauge ||
    !out.neutral ||
    !out.gec ||
    !out.note ||
    !out.bdTable ||
    !out.bdUngrounded ||
    !out.bdNeutral ||
    !out.bdGec ||
    !out.bdDrop ||
    !out.bd83
  ) {
    return;
  }

  function calculate(): void {
    const amps = parseInt(rating!.value) || 200;
    const mat = material!.value as ConductorMaterial;
    const isDwellingService = type!.value === "dwelling";
    const runFt = parseFloat(length!.value) || 0;
    const volts = parseFloat(voltage!.value) || 240;

    // NEC Table 310.12 permits dwelling service and main-feeder conductors at 83%
    // of the service rating. Anything else falls back to Table 310.16 at 75 °C.
    const row = TABLE_310_12.find((r) => r.rating === amps);
    const tableSize = isDwellingService && row ? (mat === "copper" ? row.copper : row.aluminum) : null;
    const fallback = findSizeByAmpacity(amps, mat, 75);
    const baseLabel = tableSize ?? fallback?.label ?? null;

    if (!baseLabel) {
      out.gauge!.textContent = "—";
      out.neutral!.textContent = "—";
      out.gec!.textContent = "—";
      out.note!.textContent = "This rating needs parallel conductor sets — see 310.10(G).";
      [out.bdTable, out.bdUngrounded, out.bdNeutral, out.bdGec, out.bdDrop, out.bd83].forEach((el) => {
        if (el) el.textContent = "—";
      });
      return;
    }

    // Voltage-drop check, upsizing if the run pushes past 3%.
    let finalLabel = baseLabel;
    let drop = voltageDrop({ cmil: cmilOf(finalLabel), material: mat, amps, lengthFt: runFt, phase: 1 });
    let percent = volts > 0 ? (drop / volts) * 100 : 0;
    let upsizedForDrop = false;

    if (percent > 3) {
      const startCmil = cmilOf(baseLabel);
      // Walk up the conductor table until the drop lands inside 3%.
      for (const size of CONDUCTOR_SIZES) {
        if (size.cmil <= startCmil) continue;
        const d = voltageDrop({ cmil: size.cmil, material: mat, amps, lengthFt: runFt, phase: 1 });
        const p = volts > 0 ? (d / volts) * 100 : 0;
        finalLabel = size.label;
        drop = d;
        percent = p;
        upsizedForDrop = true;
        if (p <= 3) break;
      }
    }

    const gec = gecSize(cmilOf(finalLabel), mat, "copper", "concrete-encased");

    out.gauge!.textContent = `${sizeLabel(finalLabel)} ${mat}`;
    // NEC 220.61 permits a reduced neutral; 250.24(C) sets its floor at the GEC size.
    out.neutral!.textContent = `${sizeLabel(baseLabel)} or reduced per 220.61`;
    out.gec!.textContent = `${sizeLabel(gec.size)} copper`;

    if (upsizedForDrop) {
      out.note!.textContent = `Table gives ${sizeLabel(baseLabel)}, but ${Math.round(runFt)} ft of run pushes drop over 3% — upsize to ${sizeLabel(finalLabel)}.`;
      out.note!.className = "mt-1 text-sm font-semibold text-amber-700";
    } else if (isDwellingService && row) {
      out.note!.textContent = `Table 310.12 allows ${sizeLabel(baseLabel)} ${mat} for a ${amps} A dwelling service — the 83% allowance.`;
      out.note!.className = "mt-1 text-sm font-semibold text-emerald-700";
    } else {
      out.note!.textContent = `Not a dwelling service carrying the whole load — Table 310.16 applies, so ${sizeLabel(baseLabel)} ${mat} is the minimum.`;
      out.note!.className = "mt-1 text-sm font-semibold text-sky-700";
    }

    out.bdTable!.textContent = isDwellingService && row ? "Table 310.12 (83% allowance)" : "Table 310.16 (75 °C column)";
    out.bdUngrounded!.textContent = `${sizeLabel(finalLabel)} ${mat}`;
    out.bdNeutral!.textContent = `${sizeLabel(baseLabel)}, reducible per 220.61 but never below the GEC (250.24(C))`;
    out.bdGec!.textContent = `${sizeLabel(gec.size)} copper (Table 250.66)`;
    out.bdDrop!.textContent = `${fmt(percent, 2)}% over ${Math.round(runFt)} ft`;
    out.bd83!.textContent =
      isDwellingService && row ? `${amps} A × 0.83 = ${fmt(amps * 0.83)} A of required ampacity` : "Does not apply";
  }

  [rating, material, type, voltage].forEach((el) => el.addEventListener("change", calculate));
  length.addEventListener("input", calculate);

  resetBtn?.addEventListener("click", () => {
    rating.value = "200";
    material.value = "aluminum";
    type.value = "dwelling";
    length.value = "100";
    voltage.value = "240";
    calculate();
  });

  calculate();
}
