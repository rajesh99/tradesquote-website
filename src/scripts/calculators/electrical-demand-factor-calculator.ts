import { rangeDemand, dryerDemand, DRYER_MINIMUM_VA, fmt, fmtInt } from "@/lib/nec";

/**
 * Table 220.55 (household ranges) and Table 220.54 (electric clothes dryers).
 *
 * These are the two demand factors that make a residential load calculation come
 * out far below the connected load, and both are routinely misapplied:
 *
 *  - A 12 kW range is counted at **8 kW**, not 12. Column C is a demand in
 *    kilowatts, not a percentage, and it already includes diversity.
 *  - A dryer counts at **5,000 VA or nameplate, whichever is larger** — so a
 *    4,800 W dryer still counts as 5,000, and a 5,600 W one counts as 5,600.
 *
 * Both tables scale hard with unit count, which is what makes multifamily
 * services so much smaller than the sum of their apartments suggests.
 */
export function initElectricalDemandFactorCalculator(): void {
  const rangeCount = document.getElementById("df-range-count") as HTMLInputElement | null;
  const rangeKw = document.getElementById("df-range-kw") as HTMLInputElement | null;
  const dryerCount = document.getElementById("df-dryer-count") as HTMLInputElement | null;
  const dryerWatts = document.getElementById("df-dryer-watts") as HTMLInputElement | null;
  const resetBtn = document.getElementById("df-reset");

  const out = {
    total: document.getElementById("df-total"),
    connected: document.getElementById("df-connected"),
    saved: document.getElementById("df-saved"),
    rangeDemand: document.getElementById("df-range-demand"),
    dryerDemand: document.getElementById("df-dryer-demand"),
    note: document.getElementById("df-note"),
    bdRangeConnected: document.getElementById("df-bd-range-connected"),
    bdRangeColumn: document.getElementById("df-bd-range-column"),
    bdRangeNote1: document.getElementById("df-bd-range-note1"),
    bdRangeAlt: document.getElementById("df-bd-range-alt"),
    bdDryerEach: document.getElementById("df-bd-dryer-each"),
    bdDryerConnected: document.getElementById("df-bd-dryer-connected"),
    bdDryerPercent: document.getElementById("df-bd-dryer-percent"),
    bdTotal: document.getElementById("df-bd-total"),
  };

  if (!rangeCount || !rangeKw || !dryerCount || !dryerWatts) return;
  if (Object.values(out).some((el) => !el)) return;

  function calculate(): void {
    const nRanges = Math.max(0, Math.floor(parseFloat(rangeCount!.value) || 0));
    const eachKw = Math.max(0, parseFloat(rangeKw!.value) || 0);
    const nDryers = Math.max(0, Math.floor(parseFloat(dryerCount!.value) || 0));
    const nameplateW = Math.max(0, parseFloat(dryerWatts!.value) || 0);

    const r = rangeDemand(nRanges, eachKw);
    const d = dryerDemand(nDryers, nameplateW);

    const rangeVa = r.demandKw * 1000;
    const totalVa = rangeVa + d.demandVa;
    const connectedVa = nRanges * eachKw * 1000 + d.connectedVa;
    const savedVa = connectedVa - totalVa;

    out.total!.textContent = `${fmtInt(totalVa)} VA`;
    out.connected!.textContent = `${fmtInt(connectedVa)} VA`;
    out.saved!.textContent = connectedVa > 0 ? `${fmt((savedVa / connectedVa) * 100, 0)}%` : "0%";
    out.rangeDemand!.textContent = `${fmt(r.demandKw, 2)} kW`;
    out.dryerDemand!.textContent = `${fmtInt(d.demandVa)} VA`;

    if (nRanges === 1 && eachKw > 0 && eachKw <= 12) {
      out.note!.textContent = `A single range of ${fmt(
        eachKw,
        1,
      )} kW is counted at ${r.columnC} kW flat. Column C is a demand in kilowatts, not a percentage — every range from just over 1¾ kW to 12 kW lands on the same 8 kW figure, which is why the nameplate barely matters at this size.`;
    } else if (r.note1Applies) {
      out.note!.textContent = `Above 12 kW, Note 1 adds 5% to the Column C figure for each full kilowatt over — here ${r.note1Percent}% on ${r.columnC} kW gives ${fmt(
        r.demandKw,
        2,
      )} kW. The increase applies to the table value, not to the nameplate.`;
    } else if (nRanges > 1) {
      out.note!.textContent = `${nRanges} ranges totalling ${fmtInt(
        nRanges * eachKw,
      )} kW connected are counted at ${fmt(
        r.demandKw,
        2,
      )} kW — diversity is already inside the table. Nobody's tenants all roast at once, and Table 220.55 is the code admitting it.`;
    } else {
      out.note!.textContent =
        "Enter at least one appliance. Both tables apply only to dwelling units — a commercial kitchen uses 220.56 instead, which is a different set of factors entirely.";
    }

    out.bdRangeConnected!.textContent = `${nRanges} × ${fmt(eachKw, 1)} kW = ${fmt(nRanges * eachKw, 1)} kW`;
    out.bdRangeColumn!.textContent = `Column C for ${nRanges} = ${r.columnC} kW`;
    out.bdRangeNote1!.textContent = r.note1Applies
      ? `over 12 kW → +${r.note1Percent}% → ${fmt(r.demandKw, 2)} kW`
      : "not over 12 kW — no Note 1 increase";
    out.bdRangeAlt!.textContent = r.columnAlternative
      ? `Column ${r.columnAlternative.column} @ ${r.columnAlternative.percent}% = ${fmt(
          r.columnAlternative.demandKw,
          2,
        )} kW (Note 3 permits this instead)`
      : "not available — Notes 3 applies only at 8¾ kW and below";
    out.bdDryerEach!.textContent = `max(${fmtInt(DRYER_MINIMUM_VA)}, ${fmtInt(
      nameplateW,
    )}) = ${fmtInt(d.perDryerVa)} VA each`;
    out.bdDryerConnected!.textContent = `${nDryers} × ${fmtInt(d.perDryerVa)} = ${fmtInt(d.connectedVa)} VA`;
    out.bdDryerPercent!.textContent = `× ${d.percent}% = ${fmtInt(d.demandVa)} VA`;
    out.bdTotal!.textContent = `${fmtInt(rangeVa)} + ${fmtInt(d.demandVa)} = ${fmtInt(totalVa)} VA`;
  }

  [rangeCount, rangeKw, dryerCount, dryerWatts].forEach((el) => el.addEventListener("input", calculate));

  resetBtn?.addEventListener("click", () => {
    rangeCount.value = "1";
    rangeKw.value = "12";
    dryerCount.value = "1";
    dryerWatts.value = "5000";
    calculate();
  });

  calculate();
}
