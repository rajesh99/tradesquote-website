import { fmt, usd } from "@/lib/nec";

export function initElectricalEstimateCalculator(): void {
  const hours = document.getElementById("est-hours") as HTMLInputElement | null;
  const hoursRange = document.getElementById("est-hours-range") as HTMLInputElement | null;
  const rate = document.getElementById("est-rate") as HTMLInputElement | null;
  const fixtures = document.getElementById("est-fixtures") as HTMLInputElement | null;
  const materialCost = document.getElementById("est-material") as HTMLInputElement | null;
  const overhead = document.getElementById("est-overhead") as HTMLInputElement | null;
  const margin = document.getElementById("est-margin") as HTMLInputElement | null;
  const marginRange = document.getElementById("est-margin-range") as HTMLInputElement | null;
  const resetBtn = document.getElementById("est-reset");

  const out = {
    price: document.getElementById("est-price"),
    profit: document.getElementById("est-profit"),
    breakEven: document.getElementById("est-break-even"),
    marginNote: document.getElementById("est-margin-note"),
    bdLabor: document.getElementById("est-bd-labor"),
    bdFixtures: document.getElementById("est-bd-fixtures"),
    bdMaterial: document.getElementById("est-bd-material"),
    bdOverhead: document.getElementById("est-bd-overhead"),
    bdBreakEven: document.getElementById("est-bd-break-even"),
    bdDivisor: document.getElementById("est-bd-divisor"),
    bdPrice: document.getElementById("est-bd-price"),
  };

  if (
    !hours ||
    !hoursRange ||
    !rate ||
    !fixtures ||
    !materialCost ||
    !overhead ||
    !margin ||
    !marginRange ||
    Object.values(out).some((el) => !el)
  ) {
    return;
  }

  function calculate(): void {
    const hoursVal = Math.max(0, parseFloat(hours!.value) || 0);
    const rateVal = Math.max(0, parseFloat(rate!.value) || 0);
    const fixturesVal = Math.max(0, parseFloat(fixtures!.value) || 0);
    const materialVal = Math.max(0, parseFloat(materialCost!.value) || 0);
    const overheadPct = Math.max(0, parseFloat(overhead!.value) || 0) / 100;
    const marginPct = Math.min(0.95, Math.max(0, parseFloat(margin!.value) || 0) / 100);

    const labor = hoursVal * rateVal;
    const direct = labor + fixturesVal + materialVal;
    const overheadAmount = direct * overheadPct;
    const breakEven = direct + overheadAmount;
    const price = marginPct < 1 ? breakEven / (1 - marginPct) : breakEven;
    const profit = price - breakEven;

    // The same number applied as markup instead of margin — the gap is the point.
    const markupPrice = breakEven * (1 + marginPct);

    out.price!.textContent = usd(price);
    out.profit!.textContent = usd(profit);
    out.breakEven!.textContent = usd(breakEven);
    out.marginNote!.textContent = `Charging ${fmt(marginPct * 100, 0)}% as markup instead of margin would price this at ${usd(markupPrice)} — ${usd(price - markupPrice)} less profit on the same job.`;

    out.bdLabor!.textContent = `${fmt(hoursVal, 1)} h × ${usd(rateVal)} = ${usd(labor)}`;
    out.bdFixtures!.textContent = usd(fixturesVal);
    out.bdMaterial!.textContent = usd(materialVal);
    out.bdOverhead!.textContent = `+ ${usd(overheadAmount)} (${fmt(overheadPct * 100, 0)}%)`;
    out.bdBreakEven!.textContent = usd(breakEven);
    out.bdDivisor!.textContent = `÷ ${(1 - marginPct).toFixed(2)}`;
    out.bdPrice!.textContent = usd(price);
  }

  function link(field: HTMLInputElement, range: HTMLInputElement): void {
    field.addEventListener("input", () => {
      const value = parseFloat(field.value) || 0;
      if (value >= Number(range.min) && value <= Number(range.max)) range.value = String(value);
      calculate();
    });
    range.addEventListener("input", () => {
      field.value = range.value;
      calculate();
    });
  }

  link(hours, hoursRange);
  link(margin, marginRange);
  [rate, fixtures, materialCost, overhead].forEach((el) => el.addEventListener("input", calculate));

  resetBtn?.addEventListener("click", () => {
    hours.value = "12";
    hoursRange.value = "12";
    rate.value = "95";
    fixtures.value = "600";
    materialCost.value = "850";
    overhead.value = "15";
    margin.value = "25";
    marginRange.value = "25";
    calculate();
  });

  calculate();
}
