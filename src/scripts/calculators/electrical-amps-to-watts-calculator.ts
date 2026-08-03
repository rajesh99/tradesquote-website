import { ampsToVoltAmps, ampsToWatts, fmt, fmtInt, fmtSmart, type PhaseMode } from "@/lib/nec";

export function initElectricalAmpsToWattsCalculator(): void {
  const amps = document.getElementById("aw-amps") as HTMLInputElement | null;
  const ampsRange = document.getElementById("aw-amps-range") as HTMLInputElement | null;
  const mode = document.getElementById("aw-mode") as HTMLSelectElement | null;
  const volts = document.getElementById("aw-volts") as HTMLSelectElement | null;
  const pf = document.getElementById("aw-pf") as HTMLInputElement | null;
  const pfWrap = document.getElementById("aw-pf-wrap");
  const resetBtn = document.getElementById("aw-reset");

  const out = {
    watts: document.getElementById("aw-watts"),
    kw: document.getElementById("aw-kw"),
    va: document.getElementById("aw-va"),
    note: document.getElementById("aw-note"),
    bdFormula: document.getElementById("aw-bd-formula"),
    bdWatts: document.getElementById("aw-bd-watts"),
    bdVa: document.getElementById("aw-bd-va"),
    bdReactive: document.getElementById("aw-bd-reactive"),
    bdContinuous: document.getElementById("aw-bd-continuous"),
  };

  if (!amps || !ampsRange || !mode || !volts || !pf || !pfWrap) return;
  if (Object.values(out).some((el) => !el)) return;

  function calculate(): void {
    const a = Math.max(0, parseFloat(amps!.value) || 0);
    const m = mode!.value as PhaseMode;
    const v = parseFloat(volts!.value) || 120;
    const powerFactor = m === "dc" ? 1 : Math.min(1, Math.max(0.1, parseFloat(pf!.value) || 1));

    pfWrap!.classList.toggle("hidden", m === "dc");

    const watts = ampsToWatts(a, m, v, powerFactor);
    const voltAmps = m === "dc" ? watts : ampsToVoltAmps(a, m, v);
    // Reactive power closes the triangle: Q = √(S² − P²).
    const reactive = Math.sqrt(Math.max(0, voltAmps * voltAmps - watts * watts));

    out.watts!.textContent = `${fmtInt(watts)} W`;
    out.kw!.textContent = `${fmt(watts / 1000, 2)} kW`;
    out.va!.textContent = `${fmtInt(voltAmps)} VA`;

    out.note!.textContent =
      m === "dc"
        ? "DC: watts and volt-amperes are the same number."
        : powerFactor === 1
          ? "At unity power factor, watts equals volt-amperes — a purely resistive load."
          : `At ${powerFactor} power factor, ${fmtInt(voltAmps - watts)} VA of the apparent power does no work.`;

    out.bdFormula!.textContent =
      m === "dc" ? "P = V × I" : m === "3ph" ? "P = √3 × V × I × PF" : "P = V × I × PF";
    out.bdWatts!.textContent = `${fmtInt(watts)} W`;
    out.bdVa!.textContent = `${fmtInt(voltAmps)} VA`;
    out.bdReactive!.textContent = m === "dc" ? "Not applicable to DC" : `${fmtInt(reactive)} VAR`;
    // Stated against the entered current treated as a device rating (210.20(A)).
    out.bdContinuous!.textContent = `${fmt(a * 0.8, 1)} A max continuous on a ${fmt(a, 0)} A device`;
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
  [mode, volts].forEach((el) => el.addEventListener("change", calculate));
  pf.addEventListener("input", calculate);

  resetBtn?.addEventListener("click", () => {
    amps.value = "20";
    ampsRange.value = "20";
    mode.value = "1ph";
    volts.value = "120";
    pf.value = "1";
    calculate();
  });

  calculate();
}
