import {
  faultCurrentAfterRun,
  fmt,
  fmtInt,
  requiredAicRating,
  runImpedance,
  sizeLabel,
  transformerSecondaryFaultCurrent,
  typicalPercentZ,
  type ConductorMaterial,
  type MotorPhase,
  type RacewayKind,
} from "@/lib/nec";

/**
 * Available fault current by the point-to-point method, and the interrupting
 * rating it demands (NEC 110.9, 110.24).
 *
 * Two deliberate choices:
 *
 *  1. The primary source is treated as infinite. That is the standard
 *     conservative assumption and it always overstates the fault current, which
 *     is the safe direction for an interrupting-rating check.
 *  2. Conductor impedance is computed from Chapter 9 Table 8 resistance and
 *     Table 9 reactance rather than from proprietary conductor constants, so
 *     every step is traceable to the code book. Adding the implied source
 *     impedance to the run impedance is algebraically identical to the classic
 *     M = 1 ÷ (1 + f) multiplier.
 */
export function initElectricalShortCircuitCalculator(): void {
  const kva = document.getElementById("sc-kva") as HTMLInputElement | null;
  const phase = document.getElementById("sc-phase") as HTMLSelectElement | null;
  const volts = document.getElementById("sc-volts") as HTMLSelectElement | null;
  const percentZ = document.getElementById("sc-percent-z") as HTMLInputElement | null;
  const tolerance = document.getElementById("sc-tolerance") as HTMLSelectElement | null;
  const size = document.getElementById("sc-size") as HTMLSelectElement | null;
  const material = document.getElementById("sc-material") as HTMLSelectElement | null;
  const raceway = document.getElementById("sc-raceway") as HTMLSelectElement | null;
  const sets = document.getElementById("sc-sets") as HTMLSelectElement | null;
  const length = document.getElementById("sc-length") as HTMLInputElement | null;
  const lengthRange = document.getElementById("sc-length-range") as HTMLInputElement | null;
  const resetBtn = document.getElementById("sc-reset");

  const out = {
    atPanel: document.getElementById("sc-at-panel"),
    atTransformer: document.getElementById("sc-at-transformer"),
    aicPanel: document.getElementById("sc-aic-panel"),
    aicTransformer: document.getElementById("sc-aic-transformer"),
    note: document.getElementById("sc-note"),
    bdFla: document.getElementById("sc-bd-fla"),
    bdZ: document.getElementById("sc-bd-z"),
    bdSecondary: document.getElementById("sc-bd-secondary"),
    bdRunZ: document.getElementById("sc-bd-run-z"),
    bdSourceZ: document.getElementById("sc-bd-source-z"),
    bdF: document.getElementById("sc-bd-f"),
    bdMultiplier: document.getElementById("sc-bd-multiplier"),
    bdFault: document.getElementById("sc-bd-fault"),
  };

  if (!kva || !phase || !volts || !percentZ || !tolerance || !size || !material) return;
  if (!raceway || !sets || !length || !lengthRange) return;
  if (Object.values(out).some((el) => !el)) return;

  function calculate(): void {
    const kvaValue = Math.max(1, parseFloat(kva!.value) || 0);
    const mode = phase!.value as MotorPhase;
    const voltValue = parseFloat(volts!.value) || 480;
    const zPct = Math.max(0.5, parseFloat(percentZ!.value) || typicalPercentZ(kvaValue));
    const applyTolerance = tolerance!.value === "yes";
    const mat = material!.value as ConductorMaterial;
    const race = raceway!.value as RacewayKind;
    const setCount = parseInt(sets!.value) || 1;
    const runFt = Math.max(0, parseFloat(length!.value) || 0);

    const atTransformer = transformerSecondaryFaultCurrent({
      kva: kvaValue,
      secondaryVolts: voltValue,
      phase: mode,
      percentZ: zPct,
      applyToleranceMargin: applyTolerance,
    });

    const impedance = runImpedance({
      label: size!.value,
      material: mat,
      lengthFt: runFt,
      parallelSets: setCount,
      raceway: race,
      tempC: 75,
    });

    if (!impedance) {
      out.note!.textContent = `${sizeLabel(size!.value)} is not listed in aluminum in Chapter 9 Table 8. Pick a larger size or switch to copper.`;
      return;
    }

    const atPanel = faultCurrentAfterRun({
      upstreamFaultCurrent: atTransformer.faultCurrent,
      volts: voltValue,
      phase: mode,
      runZ: impedance.z,
    });

    const aicTransformer = requiredAicRating(atTransformer.faultCurrent);
    const aicPanel = requiredAicRating(atPanel.faultCurrent);

    out.atPanel!.textContent = `${fmtInt(atPanel.faultCurrent)} A`;
    out.atTransformer!.textContent = `${fmtInt(atTransformer.faultCurrent)} A`;
    out.aicTransformer!.textContent = aicTransformer ? `${fmtInt(aicTransformer)} A` : "over 200 kA";
    out.aicPanel!.textContent = aicPanel ? `${fmtInt(aicPanel)} A` : "over 200 kA";

    const drop = (1 - atPanel.multiplier) * 100;
    if (aicPanel !== null && aicTransformer !== null && aicPanel < aicTransformer) {
      out.note!.textContent = `The run sheds ${fmt(drop, 0)}% of the fault current, which drops the requirement from a ${fmtInt(aicTransformer)} A device at the transformer to ${fmtInt(aicPanel)} A at the panel. Equipment at the transformer end still has to be rated for the full ${fmtInt(atTransformer.faultCurrent)} A.`;
    } else if (atPanel.faultCurrent > 10000) {
      out.note!.textContent = `${fmtInt(atPanel.faultCurrent)} A is above the 10 kA interrupting rating of a standard residential loadcenter, so this panel needs a commercial-rated assembly or a documented series rating.`;
    } else {
      out.note!.textContent = `${fmtInt(atPanel.faultCurrent)} A is within the 10 kA rating common to residential loadcenters. Confirm the rating marked on the equipment — 110.9 requires the device to interrupt what is actually available.`;
    }

    out.bdFla!.textContent = `${fmt(atTransformer.fla, 1)} A secondary full load`;
    out.bdZ!.textContent = applyTolerance
      ? `${zPct}% nameplate × 0.90 tolerance = ${fmt(atTransformer.effectivePercentZ, 2)}%`
      : `${fmt(atTransformer.effectivePercentZ, 2)}% as marked`;
    out.bdSecondary!.textContent = `${fmt(atTransformer.fla, 1)} ÷ ${fmt(atTransformer.effectivePercentZ / 100, 4)} = ${fmtInt(atTransformer.faultCurrent)} A`;
    out.bdRunZ!.textContent = `R ${fmt(impedance.r, 5)} + jX ${fmt(impedance.x, 5)} → Z ${fmt(impedance.z, 5)} Ω${setCount > 1 ? ` (${setCount} sets)` : ""}`;
    out.bdSourceZ!.textContent = `${fmt(atPanel.sourceZ, 5)} Ω implied by the upstream current`;
    out.bdF!.textContent = `${fmt(atPanel.loopZ, 5)} ÷ ${fmt(atPanel.sourceZ, 5)} = ${fmt(atPanel.f, 4)}`;
    out.bdMultiplier!.textContent = `1 ÷ (1 + ${fmt(atPanel.f, 4)}) = ${fmt(atPanel.multiplier, 4)}`;
    out.bdFault!.textContent = `${fmtInt(atTransformer.faultCurrent)} × ${fmt(atPanel.multiplier, 4)} = ${fmtInt(atPanel.faultCurrent)} A`;
  }

  length.addEventListener("input", () => {
    const value = parseFloat(length.value) || 0;
    if (value >= Number(lengthRange.min) && value <= Number(lengthRange.max)) lengthRange.value = String(value);
    calculate();
  });
  lengthRange.addEventListener("input", () => {
    length.value = lengthRange.value;
    calculate();
  });
  [phase, volts, tolerance, size, material, raceway, sets].forEach((el) => el.addEventListener("change", calculate));
  [kva, percentZ].forEach((el) => el.addEventListener("input", calculate));

  resetBtn?.addEventListener("click", () => {
    kva.value = "300";
    phase.value = "3ph";
    volts.value = "480";
    percentZ.value = "3.5";
    tolerance.value = "yes";
    size.value = "4/0";
    material.value = "copper";
    raceway.value = "steel";
    sets.value = "1";
    length.value = "100";
    lengthRange.value = "100";
    calculate();
  });

  calculate();
}
