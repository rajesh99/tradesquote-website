import { cmilOf, fmt, kFor, maxLengthForDrop, voltageDrop, type ConductorMaterial } from "@/lib/nec";

export function initElectricalVoltageDropCalculator(): void {
  const gauge = document.getElementById("vd-gauge") as HTMLSelectElement | null;
  const material = document.getElementById("vd-material") as HTMLSelectElement | null;
  const amps = document.getElementById("vd-amps") as HTMLInputElement | null;
  const ampsRange = document.getElementById("vd-amps-range") as HTMLInputElement | null;
  const length = document.getElementById("vd-length") as HTMLInputElement | null;
  const voltage = document.getElementById("vd-voltage") as HTMLSelectElement | null;
  const phase = document.getElementById("vd-phase") as HTMLSelectElement | null;
  const limitEl = document.getElementById("vd-limit") as HTMLSelectElement | null;
  const resetBtn = document.getElementById("vd-reset");

  const out = {
    percent: document.getElementById("vd-percent"),
    dropped: document.getElementById("vd-volts-dropped"),
    atLoad: document.getElementById("vd-volts-at-load"),
    verdict: document.getElementById("vd-verdict"),
    bdK: document.getElementById("vd-bd-k"),
    bdCmil: document.getElementById("vd-bd-cmil"),
    bdMultiplier: document.getElementById("vd-bd-multiplier"),
    bdStatus: document.getElementById("vd-bd-status"),
    bdMaxLength: document.getElementById("vd-bd-max-length"),
  };

  if (
    !gauge ||
    !material ||
    !amps ||
    !ampsRange ||
    !length ||
    !voltage ||
    !phase ||
    !limitEl ||
    !out.percent ||
    !out.dropped ||
    !out.atLoad ||
    !out.verdict ||
    !out.bdK ||
    !out.bdCmil ||
    !out.bdMultiplier ||
    !out.bdStatus ||
    !out.bdMaxLength
  ) {
    return;
  }

  function calculate(): void {
    const mat = material!.value as ConductorMaterial;
    const cmil = cmilOf(gauge!.value);
    const loadAmps = parseFloat(amps!.value) || 0;
    const runFt = parseFloat(length!.value) || 0;
    const volts = parseFloat(voltage!.value) || 240;
    const ph = (parseInt(phase!.value) === 3 ? 3 : 1) as 1 | 3;
    const limit = parseFloat(limitEl!.value) || 3;

    const drop = voltageDrop({ cmil, material: mat, amps: loadAmps, lengthFt: runFt, phase: ph });
    const percent = volts > 0 ? (drop / volts) * 100 : 0;
    const passes = percent <= limit;
    const maxLen = maxLengthForDrop({ cmil, material: mat, amps: loadAmps, volts, phase: ph, limitPercent: limit });

    out.percent!.textContent = `${fmt(percent, 2)}%`;
    out.dropped!.textContent = `${fmt(drop, 2)} V`;
    out.atLoad!.textContent = `${fmt(volts - drop, 1)} V`;

    out.verdict!.textContent = passes
      ? `Within the ${limit}% recommendation.`
      : `Exceeds the ${limit}% recommendation — upsize the conductor or shorten the run.`;
    out.verdict!.className = passes
      ? "mt-1 text-sm font-semibold text-emerald-700"
      : "mt-1 text-sm font-semibold text-rose-700";

    out.bdK!.textContent = `${kFor(mat)} (${mat})`;
    out.bdCmil!.textContent = `${cmil.toLocaleString("en-US")} cmil`;
    out.bdMultiplier!.textContent = ph === 3 ? "1.732 (three-phase)" : "2 (single-phase)";
    out.bdStatus!.textContent = passes ? `Pass — under ${limit}%` : `Fail — over ${limit}%`;
    out.bdMaxLength!.textContent = loadAmps > 0 ? `${Math.floor(maxLen).toLocaleString("en-US")} ft` : "—";
  }

  amps.addEventListener("input", () => {
    const value = parseFloat(amps.value) || 0;
    if (value >= Number(ampsRange.min) && value <= Number(ampsRange.max)) {
      ampsRange.value = String(value);
    }
    calculate();
  });
  ampsRange.addEventListener("input", () => {
    amps.value = ampsRange.value;
    calculate();
  });
  [gauge, material, voltage, phase, limitEl].forEach((el) => el.addEventListener("change", calculate));
  length.addEventListener("input", calculate);

  resetBtn?.addEventListener("click", () => {
    gauge.value = "6";
    material.value = "copper";
    amps.value = "50";
    ampsRange.value = "50";
    length.value = "100";
    voltage.value = "240";
    phase.value = "1";
    limitEl.value = "3";
    calculate();
  });

  calculate();
}
