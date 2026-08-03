import { fmt, fmtInt, fmtSmart } from "@/lib/nec";

export function initElectricalKwhCostCalculator(): void {
  const watts = document.getElementById("kc-watts") as HTMLInputElement | null;
  const wattsRange = document.getElementById("kc-watts-range") as HTMLInputElement | null;
  const hours = document.getElementById("kc-hours") as HTMLInputElement | null;
  const days = document.getElementById("kc-days") as HTMLInputElement | null;
  const rate = document.getElementById("kc-rate") as HTMLInputElement | null;
  const resetBtn = document.getElementById("kc-reset");

  const out = {
    monthly: document.getElementById("kc-monthly"),
    daily: document.getElementById("kc-daily"),
    annual: document.getElementById("kc-annual"),
    note: document.getElementById("kc-note"),
    bdKw: document.getElementById("kc-bd-kw"),
    bdDailyKwh: document.getElementById("kc-bd-daily-kwh"),
    bdMonthlyKwh: document.getElementById("kc-bd-monthly-kwh"),
    bdAnnualKwh: document.getElementById("kc-bd-annual-kwh"),
    bdRate: document.getElementById("kc-bd-rate"),
    bdAnnualCost: document.getElementById("kc-bd-annual-cost"),
  };

  if (!watts || !wattsRange || !hours || !days || !rate) return;
  if (Object.values(out).some((el) => !el)) return;

  function calculate(): void {
    const w = Math.max(0, parseFloat(watts!.value) || 0);
    const hrs = Math.max(0, Math.min(24, parseFloat(hours!.value) || 0));
    const dys = Math.max(0, Math.min(31, parseFloat(days!.value) || 0));
    const price = Math.max(0, parseFloat(rate!.value) || 0);

    const kw = w / 1000;
    const dailyKwh = kw * hrs;
    const monthlyKwh = dailyKwh * dys;
    // Annualise from the daily figure so a "20 days a month" pattern scales sensibly.
    const annualKwh = dailyKwh * dys * 12;

    const dailyCost = dailyKwh * price;
    const monthlyCost = monthlyKwh * price;
    const annualCost = annualKwh * price;

    out.monthly!.textContent = `$${fmt(monthlyCost, 2)}`;
    out.daily!.textContent = `$${fmt(dailyCost, 2)}`;
    out.annual!.textContent = `$${fmtInt(annualCost)}`;

    // Hours and days read better without forced decimals.
    const hrsLabel = fmt(hrs, hrs % 1 === 0 ? 0 : 1);
    const daysLabel = fmt(dys, 0);

    out.note!.textContent =
      w > 0
        ? `${fmtSmart(w)} W running ${hrsLabel} h/day for ${daysLabel} days uses ${fmtSmart(monthlyKwh)} kWh a month.`
        : "Enter a wattage to estimate running cost.";

    out.bdKw!.textContent = `${fmtSmart(w)} W ÷ 1,000 = ${fmt(kw, 3)} kW`;
    out.bdDailyKwh!.textContent = `${fmt(kw, 3)} × ${hrsLabel} h = ${fmtSmart(dailyKwh)} kWh`;
    out.bdMonthlyKwh!.textContent = `${fmtSmart(dailyKwh)} × ${daysLabel} days = ${fmtSmart(monthlyKwh)} kWh`;
    out.bdAnnualKwh!.textContent = `${fmtSmart(annualKwh)} kWh`;
    out.bdRate!.textContent = `$${fmt(price, 3)} per kWh`;
    out.bdAnnualCost!.textContent = `$${fmtInt(annualCost)}`;
  }

  watts.addEventListener("input", () => {
    const v = parseFloat(watts.value) || 0;
    if (v >= Number(wattsRange.min) && v <= Number(wattsRange.max)) wattsRange.value = String(v);
    calculate();
  });
  wattsRange.addEventListener("input", () => {
    watts.value = wattsRange.value;
    calculate();
  });
  [hours, days, rate].forEach((el) => el.addEventListener("input", calculate));

  resetBtn?.addEventListener("click", () => {
    watts.value = "1500";
    wattsRange.value = "1500";
    hours.value = "4";
    days.value = "30";
    rate.value = "0.17";
    calculate();
  });

  calculate();
}
