import { SQRT3, fmt, fmtInt, fmtSmart, tanPhi } from "@/lib/nec";

/** Standard capacitor bank kVAR steps commonly stocked for PF correction. */
const STANDARD_KVAR = [2.5, 5, 7.5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 100, 150, 200, 300];

export function initElectricalPowerFactorCalculator(): void {
  const kw = document.getElementById("pf-kw") as HTMLInputElement | null;
  const kwRange = document.getElementById("pf-kw-range") as HTMLInputElement | null;
  const current = document.getElementById("pf-current") as HTMLInputElement | null;
  const target = document.getElementById("pf-target") as HTMLInputElement | null;
  const volts = document.getElementById("pf-volts") as HTMLSelectElement | null;
  const phase = document.getElementById("pf-phase") as HTMLSelectElement | null;
  const demandRate = document.getElementById("pf-demand-rate") as HTMLInputElement | null;
  const resetBtn = document.getElementById("pf-reset");

  const out = {
    kvar: document.getElementById("pf-kvar"),
    bank: document.getElementById("pf-bank"),
    ampsSaved: document.getElementById("pf-amps-saved"),
    note: document.getElementById("pf-note"),
    bdTan1: document.getElementById("pf-bd-tan1"),
    bdTan2: document.getElementById("pf-bd-tan2"),
    bdKvar: document.getElementById("pf-bd-kvar"),
    bdKvaBefore: document.getElementById("pf-bd-kva-before"),
    bdKvaAfter: document.getElementById("pf-bd-kva-after"),
    bdAmpsBefore: document.getElementById("pf-bd-amps-before"),
    bdAmpsAfter: document.getElementById("pf-bd-amps-after"),
    bdSaving: document.getElementById("pf-bd-saving"),
  };

  if (!kw || !kwRange || !current || !target || !volts || !phase || !demandRate) return;
  if (Object.values(out).some((el) => !el)) return;

  function calculate(): void {
    const p = Math.max(0, parseFloat(kw!.value) || 0);
    const pf1 = Math.min(0.999, Math.max(0.1, parseFloat(current!.value) || 0.75));
    const pf2 = Math.min(1, Math.max(pf1, parseFloat(target!.value) || 0.95));
    const volt = parseFloat(volts!.value) || 480;
    const is3ph = phase!.value === "3ph";
    const rate = Math.max(0, parseFloat(demandRate!.value) || 0);

    const t1 = tanPhi(pf1);
    const t2 = tanPhi(pf2);
    // Qc = P × (tan φ₁ − tan φ₂)
    const kvar = p * (t1 - t2);
    const bank = STANDARD_KVAR.find((s) => s >= kvar) ?? STANDARD_KVAR[STANDARD_KVAR.length - 1];

    const kvaBefore = pf1 > 0 ? p / pf1 : 0;
    const kvaAfter = pf2 > 0 ? p / pf2 : 0;
    const factor = is3ph ? SQRT3 * volt : volt;
    const ampsBefore = factor > 0 ? (kvaBefore * 1000) / factor : 0;
    const ampsAfter = factor > 0 ? (kvaAfter * 1000) / factor : 0;
    const ampsSaved = ampsBefore - ampsAfter;
    // Utilities that bill on kVA demand charge the apparent-power reduction.
    const monthlySaving = (kvaBefore - kvaAfter) * rate;

    out.kvar!.textContent = `${fmtSmart(kvar)} kVAR`;
    out.bank!.textContent = kvar > 0 ? `${bank} kVAR` : "—";
    out.ampsSaved!.textContent = `${fmtSmart(ampsSaved)} A`;

    out.note!.textContent =
      pf2 <= pf1
        ? "Target power factor must be higher than the current power factor."
        : `Correcting ${pf1} → ${pf2} cuts apparent power by ${fmtSmart(kvaBefore - kvaAfter)} kVA and line current by ${fmt((ampsSaved / (ampsBefore || 1)) * 100, 1)}%.`;

    out.bdTan1!.textContent = `arccos(${pf1}) → tan φ₁ = ${fmt(t1, 4)}`;
    out.bdTan2!.textContent = `arccos(${pf2}) → tan φ₂ = ${fmt(t2, 4)}`;
    out.bdKvar!.textContent = `${fmtSmart(p)} × (${fmt(t1, 4)} − ${fmt(t2, 4)}) = ${fmtSmart(kvar)} kVAR`;
    out.bdKvaBefore!.textContent = `${fmtSmart(p)} ÷ ${pf1} = ${fmtSmart(kvaBefore)} kVA`;
    out.bdKvaAfter!.textContent = `${fmtSmart(p)} ÷ ${pf2} = ${fmtSmart(kvaAfter)} kVA`;
    out.bdAmpsBefore!.textContent = `${fmtSmart(ampsBefore)} A`;
    out.bdAmpsAfter!.textContent = `${fmtSmart(ampsAfter)} A`;
    out.bdSaving!.textContent =
      rate > 0 ? `$${fmtInt(monthlySaving)}/month · $${fmtInt(monthlySaving * 12)}/year` : "Enter a kVA demand rate";
  }

  kw.addEventListener("input", () => {
    const v = parseFloat(kw.value) || 0;
    if (v >= Number(kwRange.min) && v <= Number(kwRange.max)) kwRange.value = String(v);
    calculate();
  });
  kwRange.addEventListener("input", () => {
    kw.value = kwRange.value;
    calculate();
  });
  [volts, phase].forEach((el) => el.addEventListener("change", calculate));
  [current, target, demandRate].forEach((el) => el.addEventListener("input", calculate));

  resetBtn?.addEventListener("click", () => {
    kw.value = "100";
    kwRange.value = "100";
    current.value = "0.75";
    target.value = "0.95";
    volts.value = "480";
    phase.value = "3ph";
    demandRate.value = "0";
    calculate();
  });

  calculate();
}
