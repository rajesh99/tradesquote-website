import { estimateJob, fmt, usd, usd2 } from "@/lib/plumbing";

export function initPlumbingEstimateCalculator(): void {
  const hours = document.getElementById("est-hours") as HTMLInputElement | null;
  const hoursRange = document.getElementById("est-hours-range") as HTMLInputElement | null;
  const rate = document.getElementById("est-rate") as HTMLInputElement | null;
  const fixtures = document.getElementById("est-fixtures") as HTMLInputElement | null;
  const material = document.getElementById("est-material") as HTMLInputElement | null;
  const overhead = document.getElementById("est-overhead") as HTMLInputElement | null;
  const margin = document.getElementById("est-margin") as HTMLInputElement | null;
  const resetBtn = document.getElementById("est-reset");

  const out = {
    price: document.getElementById("est-price"),
    note: document.getElementById("est-note"),
    profit: document.getElementById("est-profit"),
    breakEven: document.getElementById("est-break-even"),
    bdLabour: document.getElementById("est-bd-labour"),
    bdDirect: document.getElementById("est-bd-direct"),
    bdOverhead: document.getElementById("est-bd-overhead"),
    bdMarkup: document.getElementById("est-bd-markup"),
    bdGap: document.getElementById("est-bd-gap"),
  };

  if (
    !hours ||
    !hoursRange ||
    !rate ||
    !fixtures ||
    !material ||
    !overhead ||
    !margin ||
    !out.price ||
    !out.note ||
    !out.profit ||
    !out.breakEven ||
    !out.bdLabour ||
    !out.bdDirect ||
    !out.bdOverhead ||
    !out.bdMarkup ||
    !out.bdGap
  ) {
    return;
  }

  function calculate(): void {
    const marginPercent = Math.min(95, Math.max(0, parseFloat(margin!.value) || 0));
    const result = estimateJob({
      labourHours: Math.max(0, parseFloat(hours!.value) || 0),
      labourRate: Math.max(0, parseFloat(rate!.value) || 0),
      fixtureCost: Math.max(0, parseFloat(fixtures!.value) || 0),
      materialCost: Math.max(0, parseFloat(material!.value) || 0),
      overheadPercent: Math.max(0, parseFloat(overhead!.value) || 0),
      marginPercent,
    });

    out.price!.textContent = usd(result.price);
    out.profit!.textContent = usd(result.profit);
    out.breakEven!.textContent = usd(result.breakEven);

    const gap = result.profit - result.markupProfit;
    out.note!.textContent = `Priced at a ${fmt(marginPercent, 0)}% margin. Applying the same ${fmt(marginPercent, 0)}% as a markup instead would price at ${usd(result.markupPrice)} — ${usd(gap)} less profit on identical work.`;

    out.bdLabour!.textContent = `${usd(result.labour)} of ${usd(result.direct)} direct (${fmt(
      result.direct > 0 ? (result.labour / result.direct) * 100 : 0,
      0,
    )}%)`;
    out.bdDirect!.textContent = usd(result.direct);
    out.bdOverhead!.textContent = usd(result.overhead);
    out.bdMarkup!.textContent = `${usd(result.markupPrice)} = ${fmt(result.effectiveMargin, 1)}% margin`;
    out.bdGap!.textContent = `${usd(gap)} (${usd2(result.price / Math.max(1, parseFloat(hours!.value) || 1))} per hour billed)`;
  }

  function syncFromRange(): void {
    hours!.value = hoursRange!.value;
    calculate();
  }

  function syncToRange(): void {
    const value = parseFloat(hours!.value) || 0;
    if (value >= Number(hoursRange!.min) && value <= Number(hoursRange!.max)) {
      hoursRange!.value = String(value);
    }
    calculate();
  }

  hours.addEventListener("input", syncToRange);
  hoursRange.addEventListener("input", syncFromRange);
  [rate, fixtures, material, overhead, margin].forEach((el) =>
    el.addEventListener("input", calculate),
  );

  resetBtn?.addEventListener("click", () => {
    hours.value = "10";
    hoursRange.value = "10";
    rate.value = "110";
    fixtures.value = "850";
    material.value = "450";
    overhead.value = "15";
    margin.value = "25";
    calculate();
  });

  calculate();
}
