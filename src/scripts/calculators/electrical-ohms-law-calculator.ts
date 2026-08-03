import { fmtSmart } from "@/lib/nec";

/**
 * Ohm's law wheel. The user supplies any two of V, I, R, P and the other two
 * are derived. Which pair is active is chosen by a mode select, because the
 * two-of-four relationships are different formulas rather than one rearranged.
 */
type Pair = "vi" | "vr" | "ir" | "pv" | "pi" | "pr";

export function initElectricalOhmsLawCalculator(): void {
  const pair = document.getElementById("ol-pair") as HTMLSelectElement | null;
  const a = document.getElementById("ol-a") as HTMLInputElement | null;
  const b = document.getElementById("ol-b") as HTMLInputElement | null;
  const labelA = document.getElementById("ol-label-a");
  const labelB = document.getElementById("ol-label-b");
  const unitA = document.getElementById("ol-unit-a");
  const unitB = document.getElementById("ol-unit-b");
  const resetBtn = document.getElementById("ol-reset");

  const out = {
    volts: document.getElementById("ol-volts"),
    amps: document.getElementById("ol-amps"),
    ohms: document.getElementById("ol-ohms"),
    watts: document.getElementById("ol-watts"),
    note: document.getElementById("ol-note"),
    bdGiven: document.getElementById("ol-bd-given"),
    bdF1: document.getElementById("ol-bd-f1"),
    bdF2: document.getElementById("ol-bd-f2"),
  };

  if (!pair || !a || !b || !labelA || !labelB || !unitA || !unitB) return;
  if (Object.values(out).some((el) => !el)) return;

  const meta: Record<Pair, { a: string; b: string; ua: string; ub: string; f1: string; f2: string }> = {
    vi: { a: "Voltage", b: "Current", ua: "V", ub: "A", f1: "R = V ÷ I", f2: "P = V × I" },
    vr: { a: "Voltage", b: "Resistance", ua: "V", ub: "Ω", f1: "I = V ÷ R", f2: "P = V² ÷ R" },
    ir: { a: "Current", b: "Resistance", ua: "A", ub: "Ω", f1: "V = I × R", f2: "P = I² × R" },
    pv: { a: "Power", b: "Voltage", ua: "W", ub: "V", f1: "I = P ÷ V", f2: "R = V² ÷ P" },
    pi: { a: "Power", b: "Current", ua: "W", ub: "A", f1: "V = P ÷ I", f2: "R = P ÷ I²" },
    pr: { a: "Power", b: "Resistance", ua: "W", ub: "Ω", f1: "I = √(P ÷ R)", f2: "V = √(P × R)" },
  };

  function calculate(): void {
    const mode = pair!.value as Pair;
    const m = meta[mode];
    labelA!.textContent = m.a;
    labelB!.textContent = m.b;
    unitA!.textContent = m.ua;
    unitB!.textContent = m.ub;
    out.bdF1!.textContent = m.f1;
    out.bdF2!.textContent = m.f2;

    const x = parseFloat(a!.value) || 0;
    const y = parseFloat(b!.value) || 0;

    let volts = 0;
    let amps = 0;
    let ohms = 0;
    let watts = 0;

    switch (mode) {
      case "vi":
        volts = x;
        amps = y;
        ohms = amps !== 0 ? volts / amps : 0;
        watts = volts * amps;
        break;
      case "vr":
        volts = x;
        ohms = y;
        amps = ohms !== 0 ? volts / ohms : 0;
        watts = ohms !== 0 ? (volts * volts) / ohms : 0;
        break;
      case "ir":
        amps = x;
        ohms = y;
        volts = amps * ohms;
        watts = amps * amps * ohms;
        break;
      case "pv":
        watts = x;
        volts = y;
        amps = volts !== 0 ? watts / volts : 0;
        ohms = watts !== 0 ? (volts * volts) / watts : 0;
        break;
      case "pi":
        watts = x;
        amps = y;
        volts = amps !== 0 ? watts / amps : 0;
        ohms = amps !== 0 ? watts / (amps * amps) : 0;
        break;
      case "pr":
        watts = x;
        ohms = y;
        amps = ohms > 0 ? Math.sqrt(watts / ohms) : 0;
        volts = Math.sqrt(Math.max(0, watts * ohms));
        break;
    }

    out.volts!.textContent = `${fmtSmart(volts)} V`;
    out.amps!.textContent = `${fmtSmart(amps)} A`;
    out.ohms!.textContent = `${fmtSmart(ohms)} Ω`;
    out.watts!.textContent = `${fmtSmart(watts)} W`;
    out.bdGiven!.textContent = `${m.a} ${fmtSmart(x)} ${m.ua} · ${m.b} ${fmtSmart(y)} ${m.ub}`;

    out.note!.textContent =
      watts > 0 && volts > 0
        ? `${fmtSmart(watts)} W at ${fmtSmart(volts)} V draws ${fmtSmart(amps)} A through ${fmtSmart(ohms)} Ω.`
        : "Enter two values to solve the other two.";
  }

  pair.addEventListener("change", () => {
    // Reset to sensible values for the newly selected pair so the display never
    // shows a nonsense combination left over from the previous mode.
    const defaults: Record<Pair, [string, string]> = {
      vi: ["120", "12"],
      vr: ["120", "10"],
      ir: ["12", "10"],
      pv: ["1440", "120"],
      pi: ["1440", "12"],
      pr: ["1440", "10"],
    };
    const [da, db] = defaults[pair.value as Pair];
    a.value = da;
    b.value = db;
    calculate();
  });
  [a, b].forEach((el) => el.addEventListener("input", calculate));

  resetBtn?.addEventListener("click", () => {
    pair.value = "vr";
    a.value = "120";
    b.value = "10";
    calculate();
  });

  calculate();
}
