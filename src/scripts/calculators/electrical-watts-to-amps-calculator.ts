import {
  findSizeByAmpacity,
  fmt,
  fmtSmart,
  nextStandardOcpd,
  sizeLabel,
  wattsToAmps,
  type PhaseMode,
} from "@/lib/nec";

export function initElectricalWattsToAmpsCalculator(): void {
  const watts = document.getElementById("wa-watts") as HTMLInputElement | null;
  const wattsRange = document.getElementById("wa-watts-range") as HTMLInputElement | null;
  const mode = document.getElementById("wa-mode") as HTMLSelectElement | null;
  const volts = document.getElementById("wa-volts") as HTMLSelectElement | null;
  const pf = document.getElementById("wa-pf") as HTMLInputElement | null;
  const pfWrap = document.getElementById("wa-pf-wrap");
  const continuous = document.getElementById("wa-continuous") as HTMLSelectElement | null;
  const resetBtn = document.getElementById("wa-reset");

  const out = {
    amps: document.getElementById("wa-amps"),
    breaker: document.getElementById("wa-breaker"),
    conductor: document.getElementById("wa-conductor"),
    note: document.getElementById("wa-note"),
    bdFormula: document.getElementById("wa-bd-formula"),
    bdDivisor: document.getElementById("wa-bd-divisor"),
    bdAmps: document.getElementById("wa-bd-amps"),
    bdRequired: document.getElementById("wa-bd-required"),
    bdBreaker: document.getElementById("wa-bd-breaker"),
    bdKw: document.getElementById("wa-bd-kw"),
  };

  if (!watts || !wattsRange || !mode || !volts || !pf || !pfWrap || !continuous) return;
  if (Object.values(out).some((el) => !el)) return;

  function calculate(): void {
    const w = Math.max(0, parseFloat(watts!.value) || 0);
    const m = mode!.value as PhaseMode;
    const v = parseFloat(volts!.value) || 120;
    const powerFactor = m === "dc" ? 1 : Math.min(1, Math.max(0.1, parseFloat(pf!.value) || 1));
    const isContinuous = continuous!.value === "yes";

    // Power factor is meaningless on a DC circuit — hide the input rather than lie about it.
    pfWrap!.classList.toggle("hidden", m === "dc");

    const amps = wattsToAmps(w, m, v, powerFactor);
    const required = isContinuous ? amps * 1.25 : amps;
    const breaker = amps > 0 ? nextStandardOcpd(required) : 0;
    const conductor = breaker > 0 ? findSizeByAmpacity(breaker, "copper", 75) : null;

    out.amps!.textContent = `${fmtSmart(amps)} A`;
    out.breaker!.textContent = breaker > 0 ? `${breaker} A` : "—";
    out.conductor!.textContent = conductor ? `${sizeLabel(conductor.label)} Cu` : "—";

    out.note!.textContent =
      m === "dc"
        ? `DC: amps = watts ÷ volts. No power factor involved.`
        : m === "3ph"
          ? `Three-phase: the √3 factor means the same watts draw about 42% less line current than single-phase at the same voltage.`
          : `Single-phase: amps = watts ÷ (volts × power factor).`;

    out.bdFormula!.textContent =
      m === "dc" ? "I = P ÷ V" : m === "3ph" ? "I = P ÷ (√3 × V × PF)" : "I = P ÷ (V × PF)";
    out.bdDivisor!.textContent =
      m === "dc"
        ? `${v} V`
        : m === "3ph"
          ? `1.732 × ${v} V × ${powerFactor} = ${fmt(1.7320508 * v * powerFactor, 1)}`
          : `${v} V × ${powerFactor} = ${fmt(v * powerFactor, 1)}`;
    out.bdAmps!.textContent = `${fmtSmart(amps)} A`;
    out.bdRequired!.textContent = isContinuous
      ? `${fmtSmart(amps)} × 1.25 = ${fmtSmart(required)} A`
      : `${fmtSmart(amps)} A (not continuous)`;
    out.bdBreaker!.textContent = breaker > 0 ? `${breaker} A` : "—";
    out.bdKw!.textContent = `${fmt(w / 1000, 3)} kW`;
  }

  watts.addEventListener("input", () => {
    const value = parseFloat(watts.value) || 0;
    if (value >= Number(wattsRange.min) && value <= Number(wattsRange.max)) {
      wattsRange.value = String(value);
    }
    calculate();
  });
  wattsRange.addEventListener("input", () => {
    watts.value = wattsRange.value;
    calculate();
  });
  [mode, volts, continuous].forEach((el) => el.addEventListener("change", calculate));
  pf.addEventListener("input", calculate);

  resetBtn?.addEventListener("click", () => {
    watts.value = "1500";
    wattsRange.value = "1500";
    mode.value = "1ph";
    volts.value = "120";
    pf.value = "1";
    continuous.value = "no";
    calculate();
  });

  calculate();
}
