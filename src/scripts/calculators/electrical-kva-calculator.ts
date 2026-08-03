import { SQRT3, fmt, fmtInt, fmtSmart } from "@/lib/nec";

/** Standard dry-type transformer kVA ratings (NEC Article 450 equipment sizes). */
const STANDARD_KVA = [3, 6, 9, 15, 22.5, 30, 45, 75, 112.5, 150, 225, 300, 500, 750, 1000];

export function initElectricalKvaCalculator(): void {
  const mode = document.getElementById("kv-mode") as HTMLSelectElement | null;
  const value = document.getElementById("kv-value") as HTMLInputElement | null;
  const valueRange = document.getElementById("kv-value-range") as HTMLInputElement | null;
  const valueLabel = document.getElementById("kv-value-label");
  const valueUnit = document.getElementById("kv-value-unit");
  const phase = document.getElementById("kv-phase") as HTMLSelectElement | null;
  const volts = document.getElementById("kv-volts") as HTMLSelectElement | null;
  const pf = document.getElementById("kv-pf") as HTMLInputElement | null;
  const resetBtn = document.getElementById("kv-reset");

  const out = {
    primary: document.getElementById("kv-primary"),
    primaryLabel: document.getElementById("kv-primary-label"),
    kw: document.getElementById("kv-kw"),
    amps: document.getElementById("kv-amps"),
    note: document.getElementById("kv-note"),
    bdFormula: document.getElementById("kv-bd-formula"),
    bdKva: document.getElementById("kv-bd-kva"),
    bdKw: document.getElementById("kv-bd-kw"),
    bdKvar: document.getElementById("kv-bd-kvar"),
    bdAmps: document.getElementById("kv-bd-amps"),
    bdStandard: document.getElementById("kv-bd-standard"),
  };

  if (!mode || !value || !valueRange || !valueLabel || !valueUnit || !phase || !volts || !pf) return;
  if (Object.values(out).some((el) => !el)) return;

  function calculate(): void {
    const m = mode!.value;
    const v = Math.max(0, parseFloat(value!.value) || 0);
    const is3ph = phase!.value === "3ph";
    const volt = parseFloat(volts!.value) || 480;
    const powerFactor = Math.min(1, Math.max(0.1, parseFloat(pf!.value) || 0.85));
    const factor = is3ph ? SQRT3 * volt : volt;

    valueLabel!.textContent = m === "from-amps" ? "Line current" : m === "from-kw" ? "Real power" : "Apparent power";
    valueUnit!.textContent = m === "from-amps" ? "A" : m === "from-kw" ? "kW" : "kVA";

    let kva = 0;
    let kw = 0;
    let amps = 0;

    if (m === "from-amps") {
      amps = v;
      kva = (factor * amps) / 1000;
      kw = kva * powerFactor;
    } else if (m === "from-kw") {
      kw = v;
      kva = powerFactor > 0 ? kw / powerFactor : 0;
      amps = factor > 0 ? (kva * 1000) / factor : 0;
    } else {
      kva = v;
      kw = kva * powerFactor;
      amps = factor > 0 ? (kva * 1000) / factor : 0;
    }

    // The reactive leg of the power triangle.
    const kvar = Math.sqrt(Math.max(0, kva * kva - kw * kw));
    const standard = STANDARD_KVA.find((s) => s >= kva) ?? STANDARD_KVA[STANDARD_KVA.length - 1];

    out.primary!.textContent = `${fmtSmart(kva)} kVA`;
    out.primaryLabel!.textContent = "apparent power";
    out.kw!.textContent = `${fmtSmart(kw)} kW`;
    out.amps!.textContent = `${fmtSmart(amps)} A`;

    out.note!.textContent =
      powerFactor === 1
        ? "At unity power factor kVA and kW are identical — the load is purely resistive."
        : `${fmtSmart(kvar)} kVAR of reactive power is circulating without doing work. Transformers and generators are rated in kVA precisely because they must carry it.`;

    out.bdFormula!.textContent = is3ph ? "kVA = √3 × V × I ÷ 1,000" : "kVA = V × I ÷ 1,000";
    out.bdKva!.textContent = `${fmtSmart(kva)} kVA (${fmtInt(kva * 1000)} VA)`;
    out.bdKw!.textContent = `${fmtSmart(kva)} × ${powerFactor} = ${fmtSmart(kw)} kW`;
    out.bdKvar!.textContent = `√(${fmt(kva, 1)}² − ${fmt(kw, 1)}²) = ${fmtSmart(kvar)} kVAR`;
    out.bdAmps!.textContent = `${fmtSmart(amps)} A at ${volt} V${is3ph ? " three-phase" : ""}`;
    out.bdStandard!.textContent = `${standard} kVA`;
  }

  value.addEventListener("input", () => {
    const v = parseFloat(value.value) || 0;
    if (v >= Number(valueRange.min) && v <= Number(valueRange.max)) valueRange.value = String(v);
    calculate();
  });
  valueRange.addEventListener("input", () => {
    value.value = valueRange.value;
    calculate();
  });
  [mode, phase, volts].forEach((el) => el.addEventListener("change", calculate));
  pf.addEventListener("input", calculate);

  resetBtn?.addEventListener("click", () => {
    mode.value = "from-amps";
    value.value = "100";
    valueRange.value = "100";
    phase.value = "3ph";
    volts.value = "480";
    pf.value = "0.85";
    calculate();
  });

  calculate();
}
