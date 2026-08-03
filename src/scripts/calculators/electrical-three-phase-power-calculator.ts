import { SQRT3, fmt, fmtInt, fmtSmart } from "@/lib/nec";

export function initElectricalThreePhasePowerCalculator(): void {
  const mode = document.getElementById("tp-mode") as HTMLSelectElement | null;
  const value = document.getElementById("tp-value") as HTMLInputElement | null;
  const valueRange = document.getElementById("tp-value-range") as HTMLInputElement | null;
  const valueLabel = document.getElementById("tp-value-label");
  const valueUnit = document.getElementById("tp-value-unit");
  const volts = document.getElementById("tp-volts") as HTMLSelectElement | null;
  const pf = document.getElementById("tp-pf") as HTMLInputElement | null;
  const efficiency = document.getElementById("tp-efficiency") as HTMLInputElement | null;
  const resetBtn = document.getElementById("tp-reset");

  const out = {
    amps: document.getElementById("tp-amps"),
    kw: document.getElementById("tp-kw"),
    kva: document.getElementById("tp-kva"),
    note: document.getElementById("tp-note"),
    bdFormula: document.getElementById("tp-bd-formula"),
    bdDenominator: document.getElementById("tp-bd-denominator"),
    bdAmps: document.getElementById("tp-bd-amps"),
    bdKva: document.getElementById("tp-bd-kva"),
    bdKvar: document.getElementById("tp-bd-kvar"),
    bdSingle: document.getElementById("tp-bd-single"),
  };

  if (!mode || !value || !valueRange || !valueLabel || !valueUnit || !volts || !pf || !efficiency) return;
  if (Object.values(out).some((el) => !el)) return;

  function calculate(): void {
    const m = mode!.value;
    const v = Math.max(0, parseFloat(value!.value) || 0);
    const volt = parseFloat(volts!.value) || 480;
    const powerFactor = Math.min(1, Math.max(0.1, parseFloat(pf!.value) || 0.85));
    const eff = Math.min(1, Math.max(0.1, (parseFloat(efficiency!.value) || 100) / 100));

    valueLabel!.textContent = m === "from-kw" ? "Real power" : m === "from-amps" ? "Line current" : "Motor output";
    valueUnit!.textContent = m === "from-amps" ? "A" : m === "from-hp" ? "hp" : "kW";

    const denominator = SQRT3 * volt * powerFactor;

    let kw = 0;
    let amps = 0;

    if (m === "from-amps") {
      amps = v;
      kw = (denominator * amps) / 1000;
    } else if (m === "from-kw") {
      kw = v;
      amps = denominator > 0 ? (kw * 1000) / denominator : 0;
    } else {
      // Motor horsepower is shaft output — divide by efficiency to get input power.
      kw = (v * 0.7457) / eff;
      amps = denominator > 0 ? (kw * 1000) / denominator : 0;
    }

    const kva = powerFactor > 0 ? kw / powerFactor : 0;
    const kvar = Math.sqrt(Math.max(0, kva * kva - kw * kw));
    // The same real power on single-phase at the same voltage.
    const singlePhaseAmps = volt * powerFactor > 0 ? (kw * 1000) / (volt * powerFactor) : 0;

    out.amps!.textContent = `${fmtSmart(amps)} A`;
    out.kw!.textContent = `${fmtSmart(kw)} kW`;
    out.kva!.textContent = `${fmtSmart(kva)} kVA`;

    out.note!.textContent = `Single-phase at the same ${volt} V would draw ${fmtSmart(singlePhaseAmps)} A — three-phase moves the same power with ${fmt((1 - amps / (singlePhaseAmps || 1)) * 100, 0)}% less line current.`;

    out.bdFormula!.textContent = m === "from-amps" ? "P = √3 × V × I × PF" : "I = P ÷ (√3 × V × PF)";
    out.bdDenominator!.textContent = `1.732 × ${volt} × ${powerFactor} = ${fmt(denominator, 1)}`;
    out.bdAmps!.textContent = `${fmtSmart(amps)} A`;
    out.bdKva!.textContent = `${fmtSmart(kw)} ÷ ${powerFactor} = ${fmtSmart(kva)} kVA`;
    out.bdKvar!.textContent = `${fmtSmart(kvar)} kVAR`;
    out.bdSingle!.textContent = `${fmtSmart(singlePhaseAmps)} A (${fmtInt(singlePhaseAmps - amps)} A more)`;
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
  [mode, volts].forEach((el) => el.addEventListener("change", calculate));
  [pf, efficiency].forEach((el) => el.addEventListener("input", calculate));

  resetBtn?.addEventListener("click", () => {
    mode.value = "from-kw";
    value.value = "50";
    valueRange.value = "50";
    volts.value = "480";
    pf.value = "0.85";
    efficiency.value = "100";
    calculate();
  });

  calculate();
}
