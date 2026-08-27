import {
  CONDUCTOR_SIZES,
  ampacityOf,
  findSizeByAmpacity,
  fmt,
  sizeLabel,
  smallConductorCap,
  voltageDrop,
  type ConductorMaterial,
  type TempRating,
} from "@/lib/nec";

export function initElectricalWireSizeCalculator(): void {
  const amps = document.getElementById("ws-amps") as HTMLInputElement | null;
  const ampsRange = document.getElementById("ws-amps-range") as HTMLInputElement | null;
  const continuous = document.getElementById("ws-continuous") as HTMLSelectElement | null;
  const material = document.getElementById("ws-material") as HTMLSelectElement | null;
  const length = document.getElementById("ws-length") as HTMLInputElement | null;
  const voltage = document.getElementById("ws-voltage") as HTMLSelectElement | null;
  const phase = document.getElementById("ws-phase") as HTMLSelectElement | null;
  const vdLimit = document.getElementById("ws-vd-limit") as HTMLSelectElement | null;
  const temp = document.getElementById("ws-temp") as HTMLSelectElement | null;
  const resetBtn = document.getElementById("ws-reset");

  const out = {
    gauge: document.getElementById("ws-gauge"),
    ampacity: document.getElementById("ws-ampacity"),
    vdPercent: document.getElementById("ws-vd-percent"),
    governedBy: document.getElementById("ws-governed-by"),
    bdRequired: document.getElementById("ws-bd-required"),
    bdAmpGauge: document.getElementById("ws-bd-amp-gauge"),
    bdVdGauge: document.getElementById("ws-bd-vd-gauge"),
    bdGoverning: document.getElementById("ws-bd-governing"),
    bdVolts: document.getElementById("ws-bd-volts"),
    bdOcpdCap: document.getElementById("ws-bd-ocpd-cap"),
  };

  if (
    !amps ||
    !ampsRange ||
    !continuous ||
    !material ||
    !length ||
    !voltage ||
    !phase ||
    !vdLimit ||
    !temp ||
    !out.gauge ||
    !out.ampacity ||
    !out.vdPercent ||
    !out.governedBy ||
    !out.bdRequired ||
    !out.bdAmpGauge ||
    !out.bdVdGauge ||
    !out.bdGoverning ||
    !out.bdVolts ||
    !out.bdOcpdCap
  ) {
    return;
  }

  function calculate(): void {
    const loadAmps = parseFloat(amps!.value) || 0;
    const isContinuous = continuous!.value === "yes";
    const mat = material!.value as ConductorMaterial;
    const runFt = parseFloat(length!.value) || 0;
    const volts = parseFloat(voltage!.value) || 240;
    const ph = (parseInt(phase!.value) === 3 ? 3 : 1) as 1 | 3;
    const limit = parseFloat(vdLimit!.value) || 3;
    const tempRating = (parseInt(temp!.value) || 75) as TempRating;

    // Step 1 — required ampacity: continuous loads at 125% per 210.20(A).
    const required = isContinuous ? loadAmps * 1.25 : loadAmps;

    // Step 2 — smallest conductor that satisfies Table 310.16 (and 240.4(D)).
    const byAmpacity = findSizeByAmpacity(required, mat, tempRating);

    if (!byAmpacity) {
      out.gauge!.textContent = "—";
      out.ampacity!.textContent = "over 600 kcmil";
      out.vdPercent!.textContent = "—";
      out.governedBy!.textContent = "Load exceeds a single-conductor run — parallel sets required (310.10(G)).";
      out.bdRequired!.textContent = `${fmt(required)} A`;
      out.bdAmpGauge!.textContent = "—";
      out.bdVdGauge!.textContent = "—";
      out.bdGoverning!.textContent = "—";
      out.bdVolts!.textContent = "—";
      out.bdOcpdCap!.textContent = "—";
      return;
    }

    // Step 3 — walk up sizes until voltage drop lands inside the limit.
    const startIndex = CONDUCTOR_SIZES.indexOf(byAmpacity);
    let finalSize = byAmpacity;
    let finalDrop = voltageDrop({ cmil: finalSize.cmil, material: mat, amps: loadAmps, lengthFt: runFt, phase: ph });
    let finalPercent = volts > 0 ? (finalDrop / volts) * 100 : 0;

    for (let i = startIndex; i < CONDUCTOR_SIZES.length; i += 1) {
      const candidate = CONDUCTOR_SIZES[i];
      if (ampacityOf(candidate, mat, tempRating) === null) continue;
      const drop = voltageDrop({ cmil: candidate.cmil, material: mat, amps: loadAmps, lengthFt: runFt, phase: ph });
      const percent = volts > 0 ? (drop / volts) * 100 : 0;
      finalSize = candidate;
      finalDrop = drop;
      finalPercent = percent;
      if (percent <= limit) break;
    }

    const finalAmpacity = ampacityOf(finalSize, mat, tempRating) ?? 0;
    const cap = smallConductorCap(finalSize.label, mat);
    const governedByDrop = finalSize !== byAmpacity;

    out.gauge!.textContent = sizeLabel(finalSize.label);
    out.ampacity!.textContent = `${finalAmpacity} A`;
    out.vdPercent!.textContent = `${fmt(finalPercent, 2)}%`;
    out.governedBy!.textContent = governedByDrop
      ? `Voltage drop governs — ampacity alone would allow ${sizeLabel(byAmpacity.label)}.`
      : `Ampacity governs — voltage drop is ${fmt(finalPercent, 2)}%, inside the ${limit}% limit.`;

    out.bdRequired!.textContent = `${fmt(required)} A`;
    out.bdAmpGauge!.textContent = sizeLabel(byAmpacity.label);
    out.bdVdGauge!.textContent = sizeLabel(finalSize.label);
    out.bdGoverning!.textContent = governedByDrop ? "Voltage drop" : "Ampacity";
    out.bdVolts!.textContent = `${fmt(volts - finalDrop, 1)} V (−${fmt(finalDrop, 2)} V)`;
    out.bdOcpdCap!.textContent = cap === null ? "No 240.4(D) limit" : `${cap} A max (240.4(D))`;
  }

  function syncFromRange(): void {
    amps!.value = ampsRange!.value;
    calculate();
  }

  function syncToRange(): void {
    const value = parseFloat(amps!.value) || 0;
    if (value >= Number(ampsRange!.min) && value <= Number(ampsRange!.max)) {
      ampsRange!.value = String(value);
    }
    calculate();
  }

  amps.addEventListener("input", syncToRange);
  ampsRange.addEventListener("input", syncFromRange);
  [continuous, material, voltage, phase, vdLimit, temp].forEach((el) =>
    el.addEventListener("change", calculate),
  );
  length.addEventListener("input", calculate);

  resetBtn?.addEventListener("click", () => {
    amps.value = "50";
    ampsRange.value = "50";
    continuous.value = "no";
    material.value = "copper";
    length.value = "100";
    voltage.value = "240";
    phase.value = "1";
    vdLimit.value = "3";
    temp.value = "75";
    calculate();
  });

  calculate();
}
