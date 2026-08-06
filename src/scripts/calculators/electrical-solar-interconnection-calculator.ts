import { busbarAllowance, BUSBAR_ALLOWANCE_PERCENT, PV_CONTINUOUS_FACTOR, fmt } from "@/lib/nec";

/**
 * NEC 705.12(B)(3)(2) — the "120% rule" for a load-side PV interconnection.
 *
 * The busbar may be loaded to 120% of its rating by the main overcurrent device
 * plus the PV backfed breaker, on the condition that the PV breaker is placed at
 * the opposite end of the busbar from the main supply. That physical placement is
 * the whole justification: current then enters from both ends and no single
 * section of bar carries the sum.
 *
 * The alternatives in 705.12(B)(3) — the sum rule, the centre-fed rule, and the
 * engineering-supervision path — are deliberately not modelled. The 120% option is
 * the one nearly every residential job uses, and conflating them is how the rule
 * gets misapplied.
 */
export function initElectricalSolarInterconnectionCalculator(): void {
  const busbar = document.getElementById("si-busbar") as HTMLSelectElement | null;
  const main = document.getElementById("si-main") as HTMLSelectElement | null;
  const inverterAmps = document.getElementById("si-inverter") as HTMLInputElement | null;
  const inverterRange = document.getElementById("si-inverter-range") as HTMLInputElement | null;
  const resetBtn = document.getElementById("si-reset");

  const out = {
    verdict: document.getElementById("si-verdict"),
    pvBreaker: document.getElementById("si-pv-breaker"),
    total: document.getElementById("si-total"),
    allowance: document.getElementById("si-allowance"),
    headroom: document.getElementById("si-headroom"),
    maxInverter: document.getElementById("si-max-inverter"),
    note: document.getElementById("si-note"),
    bdInverter: document.getElementById("si-bd-inverter"),
    bdBreaker: document.getElementById("si-bd-breaker"),
    bdAllowance: document.getElementById("si-bd-allowance"),
    bdSum: document.getElementById("si-bd-sum"),
    bdResult: document.getElementById("si-bd-result"),
    bdMax: document.getElementById("si-bd-max"),
  };

  if (!busbar || !main || !inverterAmps || !inverterRange) return;
  if (Object.values(out).some((el) => !el)) return;

  function calculate(): void {
    const busbarRating = parseFloat(busbar!.value) || 200;
    const mainBreaker = parseFloat(main!.value) || 200;
    const amps = Math.max(0, parseFloat(inverterAmps!.value) || 0);

    const r = busbarAllowance({ busbarRating, mainBreaker, inverterAmps: amps });

    out.pvBreaker!.textContent = `${r.pvBreaker} A`;
    out.total!.textContent = `${fmt(r.total, 0)} A`;
    out.allowance!.textContent = `${fmt(r.allowance, 0)} A`;
    out.headroom!.textContent = `${r.headroom >= 0 ? "" : "−"}${fmt(Math.abs(r.headroom), 0)} A`;
    out.maxInverter!.textContent = `${fmt(r.maxInverterAmps, 1)} A`;

    if (r.passes) {
      out.verdict!.textContent = r.headroom === 0 ? "Fits exactly" : "Fits";
      out.verdict!.className =
        "text-4xl sm:text-5xl font-extrabold tracking-tight text-emerald-600";
    } else {
      out.verdict!.textContent = "Does not fit";
      out.verdict!.className = "text-4xl sm:text-5xl font-extrabold tracking-tight text-red-600";
    }

    if (mainBreaker > busbarRating) {
      out.note!.textContent =
        "The main breaker is larger than the busbar rating, which is not a legal panel to begin with. Fix that before considering the PV interconnection.";
    } else if (r.headroom === 0 && r.passes) {
      out.note!.textContent = `Exactly at the limit, which is legal — 705.12(B)(3)(2) says the sum shall not exceed 120%, and this equals it. The PV breaker must land at the opposite end of the busbar from the main, and the panel needs the 705.12(B)(3)(2) warning label.`;
    } else if (r.passes) {
      out.note!.textContent = `${fmt(
        r.headroom,
        0,
      )} A of busbar allowance left. The PV breaker still has to be at the opposite end of the busbar from the main, and the panel still needs the permanent warning label.`;
    } else if (r.maxPvBreaker <= 0) {
      out.note!.textContent =
        "No allowance is left at all — the main already consumes the whole 120% figure. A supply-side (line-side) tap under 705.11 or a main breaker derate are the usual ways out.";
    } else {
      out.note!.textContent = `Over by ${fmt(
        Math.abs(r.headroom),
        0,
      )} A. The three normal fixes are a smaller inverter, a main breaker derate down from ${mainBreaker} A, or a supply-side tap under 705.11 that bypasses the busbar rule entirely.`;
    }

    out.bdInverter!.textContent = `${fmt(amps, 1)} A continuous output`;
    out.bdBreaker!.textContent = `${fmt(amps, 1)} × ${PV_CONTINUOUS_FACTOR} = ${fmt(
      amps * PV_CONTINUOUS_FACTOR,
      1,
    )} A → ${r.pvBreaker} A standard`;
    out.bdAllowance!.textContent = `${busbarRating} A × ${BUSBAR_ALLOWANCE_PERCENT}% = ${fmt(r.allowance, 0)} A`;
    out.bdSum!.textContent = `${mainBreaker} A main + ${r.pvBreaker} A PV = ${fmt(r.total, 0)} A`;
    out.bdResult!.textContent = r.passes
      ? `${fmt(r.total, 0)} ≤ ${fmt(r.allowance, 0)} — permitted`
      : `${fmt(r.total, 0)} > ${fmt(r.allowance, 0)} — not permitted`;
    out.bdMax!.textContent = `${fmt(r.allowance, 0)} − ${mainBreaker} = ${fmt(
      r.allowance - mainBreaker,
      0,
    )} A → ${r.maxPvBreaker} A breaker → ${fmt(r.maxInverterAmps, 1)} A inverter`;
  }

  inverterAmps.addEventListener("input", () => {
    const v = parseFloat(inverterAmps.value) || 0;
    if (v >= Number(inverterRange.min) && v <= Number(inverterRange.max)) inverterRange.value = String(v);
    calculate();
  });
  inverterRange.addEventListener("input", () => {
    inverterAmps.value = inverterRange.value;
    calculate();
  });
  [busbar, main].forEach((el) => el.addEventListener("change", calculate));

  resetBtn?.addEventListener("click", () => {
    busbar.value = "200";
    main.value = "200";
    inverterAmps.value = "32";
    inverterRange.value = "32";
    calculate();
  });

  calculate();
}
