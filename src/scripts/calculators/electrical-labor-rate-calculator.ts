import { fmt, fmtInt, usd } from "@/lib/nec";

export function initElectricalLaborRateCalculator(): void {
  const wage = document.getElementById("lr-wage") as HTMLInputElement | null;
  const wageRange = document.getElementById("lr-wage-range") as HTMLInputElement | null;
  const paidHours = document.getElementById("lr-paid-hours") as HTMLInputElement | null;
  const burden = document.getElementById("lr-burden") as HTMLInputElement | null;
  const billablePct = document.getElementById("lr-billable") as HTMLInputElement | null;
  const overheadPerYear = document.getElementById("lr-overhead") as HTMLInputElement | null;
  const margin = document.getElementById("lr-margin") as HTMLInputElement | null;
  const resetBtn = document.getElementById("lr-reset");

  const out = {
    billRate: document.getElementById("lr-bill-rate"),
    loadedCost: document.getElementById("lr-loaded-cost"),
    multiplier: document.getElementById("lr-multiplier"),
    note: document.getElementById("lr-note"),
    bdWage: document.getElementById("lr-bd-wage"),
    bdBurden: document.getElementById("lr-bd-burden"),
    bdEmployment: document.getElementById("lr-bd-employment"),
    bdOverhead: document.getElementById("lr-bd-overhead"),
    bdTotalCost: document.getElementById("lr-bd-total-cost"),
    bdBillable: document.getElementById("lr-bd-billable"),
    bdLoaded: document.getElementById("lr-bd-loaded"),
    bdRate: document.getElementById("lr-bd-rate"),
  };

  if (!wage || !wageRange || !paidHours || !burden || !billablePct || !overheadPerYear || !margin) return;
  if (Object.values(out).some((el) => !el)) return;

  function calculate(): void {
    const hourlyWage = Math.max(0, parseFloat(wage!.value) || 0);
    const paid = Math.max(1, parseFloat(paidHours!.value) || 2080);
    const burdenPct = Math.max(0, parseFloat(burden!.value) || 0) / 100;
    const billableFraction = Math.min(1, Math.max(0.05, (parseFloat(billablePct!.value) || 75) / 100));
    const annualOverhead = Math.max(0, parseFloat(overheadPerYear!.value) || 0);
    const marginPct = Math.min(0.9, Math.max(0, parseFloat(margin!.value) || 0) / 100);

    const annualWage = hourlyWage * paid;
    const burdenCost = annualWage * burdenPct;
    const employmentCost = annualWage + burdenCost;
    const totalCost = employmentCost + annualOverhead;

    // Only billable hours can recover the cost of all paid hours.
    const billableHours = paid * billableFraction;
    const loadedCost = billableHours > 0 ? totalCost / billableHours : 0;
    const billRate = marginPct < 1 ? loadedCost / (1 - marginPct) : loadedCost;
    const multiplier = hourlyWage > 0 ? billRate / hourlyWage : 0;

    out.billRate!.textContent = `$${fmt(billRate, 2)}`;
    out.loadedCost!.textContent = `$${fmt(loadedCost, 2)}`;
    out.multiplier!.textContent = `${fmt(multiplier, 2)}×`;

    out.note!.textContent =
      billRate < 50
        ? "Below the 2026 US market floor of about $50/hr — check the burden and billable assumptions."
        : billRate > 130
          ? "Above the typical $50–$130/hr band. Master-level, specialty, and high-cost-metro work does bill here."
          : `Inside the $50–$130/hr band reported for US electricians in 2026. Every unbillable hour pushes this up.`;

    out.bdWage!.textContent = `$${fmt(hourlyWage, 2)} × ${fmtInt(paid)} h = ${usd(annualWage)}`;
    out.bdBurden!.textContent = `${fmt(burdenPct * 100, 0)}% = ${usd(burdenCost)}`;
    out.bdEmployment!.textContent = usd(employmentCost);
    out.bdOverhead!.textContent = usd(annualOverhead);
    out.bdTotalCost!.textContent = usd(totalCost);
    out.bdBillable!.textContent = `${fmtInt(paid)} × ${fmt(billableFraction * 100, 0)}% = ${fmtInt(billableHours)} h`;
    out.bdLoaded!.textContent = `${usd(totalCost)} ÷ ${fmtInt(billableHours)} h = $${fmt(loadedCost, 2)}`;
    out.bdRate!.textContent = `$${fmt(loadedCost, 2)} ÷ ${(1 - marginPct).toFixed(2)} = $${fmt(billRate, 2)}`;
  }

  wage.addEventListener("input", () => {
    const v = parseFloat(wage.value) || 0;
    if (v >= Number(wageRange.min) && v <= Number(wageRange.max)) wageRange.value = String(v);
    calculate();
  });
  wageRange.addEventListener("input", () => {
    wage.value = wageRange.value;
    calculate();
  });
  [paidHours, burden, billablePct, overheadPerYear, margin].forEach((el) =>
    el.addEventListener("input", calculate),
  );

  resetBtn?.addEventListener("click", () => {
    wage.value = "32";
    wageRange.value = "32";
    paidHours.value = "2080";
    burden.value = "35";
    billablePct.value = "75";
    overheadPerYear.value = "9000";
    margin.value = "40";
    calculate();
  });

  calculate();
}
