import {
  SQRT3,
  cmilOf,
  effectiveImpedance,
  fmt,
  fmtInt,
  runImpedance,
  sizeLabel,
  voltageDrop,
  type ConductorMaterial,
  type MotorPhase,
  type RacewayKind,
} from "@/lib/nec";

/**
 * Conductor resistance, reactance and the voltage drop they actually cause.
 *
 * The point of this tool over a plain voltage-drop calculator is the reactance.
 * The familiar K-constant formula models resistance only, which is exactly right
 * at unity power factor and increasingly wrong as conductors get large — above
 * about 1/0 in a steel raceway the reactance is comparable to the resistance.
 *
 * The correct quantity for a load is the effective impedance at the load's power
 * factor, Ze = R·cos θ + X·sin θ, not the impedance magnitude √(R² + X²). The
 * magnitude is only right for a bolted fault. Note the consequence that falls out
 * of the formula: on a small, highly resistive conductor a lagging power factor
 * slightly REDUCES line drop, because only the in-phase component of the current
 * produces IR drop along the conductor.
 */
export function initElectricalConductorResistanceCalculator(): void {
  const size = document.getElementById("cr-size") as HTMLSelectElement | null;
  const material = document.getElementById("cr-material") as HTMLSelectElement | null;
  const raceway = document.getElementById("cr-raceway") as HTMLSelectElement | null;
  const sets = document.getElementById("cr-sets") as HTMLSelectElement | null;
  const length = document.getElementById("cr-length") as HTMLInputElement | null;
  const lengthRange = document.getElementById("cr-length-range") as HTMLInputElement | null;
  const tempC = document.getElementById("cr-temp") as HTMLSelectElement | null;
  const amps = document.getElementById("cr-amps") as HTMLInputElement | null;
  const phase = document.getElementById("cr-phase") as HTMLSelectElement | null;
  const volts = document.getElementById("cr-volts") as HTMLSelectElement | null;
  const powerFactor = document.getElementById("cr-pf") as HTMLInputElement | null;
  const resetBtn = document.getElementById("cr-reset");

  const out = {
    resistance: document.getElementById("cr-resistance"),
    reactance: document.getElementById("cr-reactance"),
    drop: document.getElementById("cr-drop"),
    dropPercent: document.getElementById("cr-drop-percent"),
    note: document.getElementById("cr-note"),
    bdRPerKft: document.getElementById("cr-bd-r-per-kft"),
    bdXPerKft: document.getElementById("cr-bd-x-per-kft"),
    bdRun: document.getElementById("cr-bd-run"),
    bdZe: document.getElementById("cr-bd-ze"),
    bdDrop: document.getElementById("cr-bd-drop"),
    bdK: document.getElementById("cr-bd-k"),
    bdLoss: document.getElementById("cr-bd-loss"),
  };

  if (!size || !material || !raceway || !sets || !length || !lengthRange) return;
  if (!tempC || !amps || !phase || !volts || !powerFactor) return;
  if (Object.values(out).some((el) => !el)) return;

  function calculate(): void {
    const label = size!.value;
    const mat = material!.value as ConductorMaterial;
    const race = raceway!.value as RacewayKind;
    const setCount = parseInt(sets!.value) || 1;
    const runFt = Math.max(0, parseFloat(length!.value) || 0);
    const temp = parseFloat(tempC!.value) || 75;
    const current = Math.max(0, parseFloat(amps!.value) || 0);
    const mode = phase!.value as MotorPhase;
    const voltValue = parseFloat(volts!.value) || 240;
    const pf = Math.min(1, Math.max(0.1, parseFloat(powerFactor!.value) || 1));

    const impedance = runImpedance({
      label,
      material: mat,
      lengthFt: runFt,
      parallelSets: setCount,
      raceway: race,
      tempC: temp,
    });

    if (!impedance) {
      out.note!.textContent = `${sizeLabel(label)} is not listed in aluminum in Chapter 9 Table 8 — pick a larger size or switch to copper.`;
      return;
    }

    const multiplier = mode === "3ph" ? SQRT3 : 2;
    const ze = effectiveImpedance(impedance.r, impedance.x, pf);
    const drop = multiplier * current * ze;
    const dropPercent = voltValue > 0 ? (drop / voltValue) * 100 : 0;

    // Resistance-only drop, which is what the K-constant approximation models.
    const dropR = multiplier * current * impedance.r;
    const dropK = voltageDrop({
      cmil: cmilOf(label) * setCount,
      material: mat,
      amps: current,
      lengthFt: runFt,
      phase: mode === "3ph" ? 3 : 1,
    });

    // I²R heat in the whole run: three phases, or both conductors on single-phase.
    const conductorsCarrying = mode === "3ph" ? 3 : 2;
    const loss = conductorsCarrying * current * current * impedance.r;

    out.resistance!.textContent = `${fmt(impedance.r, 5)} Ω`;
    out.reactance!.textContent = `${fmt(impedance.x, 5)} Ω`;
    out.drop!.textContent = `${fmt(drop, 2)} V`;
    out.dropPercent!.textContent = `${fmt(dropPercent, 2)}%`;

    const reactanceEffect = dropR > 0 ? ((drop - dropR) / dropR) * 100 : 0;
    if (pf >= 0.999) {
      out.note!.textContent = `At unity power factor the reactance contributes nothing — Ze collapses to R exactly, which is why the familiar K-constant formula is accurate for resistive loads. It gives ${fmt(dropK, 2)} V here against ${fmt(dropR, 2)} V from Table 8.`;
    } else if (reactanceEffect > 5) {
      out.note!.textContent = `Reactance adds ${fmt(reactanceEffect, 0)}% more drop than resistance alone at ${pf} power factor. This is where the K-constant shortcut understates the answer — it models resistance only, and on conductors this size in ${race === "steel" ? "a steel raceway" : "PVC"} the reactance is no longer negligible.`;
    } else if (reactanceEffect < -2) {
      out.note!.textContent = `Counter-intuitively, drop is ${fmt(Math.abs(reactanceEffect), 0)}% LOWER than resistance alone would give. On a conductor this small the resistance dominates the reactance, and only the in-phase component of the current produces IR drop along the line — so a lagging power factor slightly reduces it.`;
    } else {
      out.note!.textContent = `Resistance and reactance roughly balance out at ${pf} power factor on this size — the effective impedance is within a few percent of the resistance alone.`;
    }

    out.bdRPerKft!.textContent = `${fmt(impedance.rPerKft, 5)} Ω/kFT at ${temp} °C (Table 8)`;
    out.bdXPerKft!.textContent = `${fmt(impedance.xPerKft, 4)} Ω/kFT, ${race === "steel" ? "steel" : "PVC or aluminum"} raceway (Table 9)`;
    out.bdRun!.textContent = `R ${fmt(impedance.r, 5)} Ω · X ${fmt(impedance.x, 5)} Ω over ${Math.round(runFt)} ft${setCount > 1 ? ` ÷ ${setCount} sets` : ""}`;
    out.bdZe!.textContent = `${fmt(impedance.r, 5)} × ${pf} + ${fmt(impedance.x, 5)} × ${fmt(Math.sqrt(1 - pf * pf), 3)} = ${fmt(ze, 5)} Ω`;
    out.bdDrop!.textContent = `${mode === "3ph" ? "1.732" : "2"} × ${fmt(current, 0)} A × ${fmt(ze, 5)} = ${fmt(drop, 2)} V`;
    out.bdK!.textContent = `${fmt(dropK, 2)} V — resistance only, ${fmt(dropR > 0 ? ((dropK - dropR) / dropR) * 100 : 0, 2)}% from Table 8`;
    out.bdLoss!.textContent = `${conductorsCarrying} × ${fmt(current, 0)}² × ${fmt(impedance.r, 5)} = ${fmtInt(loss)} W`;
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
  [size, material, raceway, sets, tempC, phase, volts].forEach((el) => el.addEventListener("change", calculate));
  [amps, powerFactor].forEach((el) => el.addEventListener("input", calculate));

  resetBtn?.addEventListener("click", () => {
    size.value = "4/0";
    material.value = "copper";
    raceway.value = "steel";
    sets.value = "1";
    length.value = "100";
    lengthRange.value = "100";
    tempC.value = "75";
    amps.value = "200";
    phase.value = "3ph";
    volts.value = "480";
    powerFactor.value = "0.85";
    calculate();
  });

  calculate();
}
