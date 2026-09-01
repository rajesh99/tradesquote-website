import { HOURS_PER_YEAR, fmt, labourRate, usd, usd2 } from "@/lib/plumbing";

export function initPlumbingLaborRateCalculator(): void {
  const wage = document.getElementById("lr-wage") as HTMLInputElement | null;
  const wageRange = document.getElementById("lr-wage-range") as HTMLInputElement | null;
  const burden = document.getElementById("lr-burden") as HTMLInputElement | null;
  const overhead = document.getElementById("lr-overhead") as HTMLInputElement | null;
  const billable = document.getElementById("lr-billable") as HTMLInputElement | null;
  const margin = document.getElementById("lr-margin") as HTMLInputElement | null;
  const resetBtn = document.getElementById("lr-reset");

  const out = {
    rate: document.getElementById("lr-rate"),
    note: document.getElementById("lr-note"),
    loaded: document.getElementById("lr-loaded"),
    multiple: document.getElementById("lr-multiple"),
    bdWage: document.getElementById("lr-bd-wage"),
    bdBurden: document.getElementById("lr-bd-burden"),
    bdTotal: document.getElementById("lr-bd-total"),
    bdUtilisation: document.getElementById("lr-bd-utilisation"),
    bdUnbilled: document.getElementById("lr-bd-unbilled"),
  };

  if (
    !wage ||
    !wageRange ||
    !burden ||
    !overhead ||
    !billable ||
    !margin ||
    !out.rate ||
    !out.note ||
    !out.loaded ||
    !out.multiple ||
    !out.bdWage ||
    !out.bdBurden ||
    !out.bdTotal ||
    !out.bdUtilisation ||
    !out.bdUnbilled
  ) {
    return;
  }

  function calculate(): void {
    const hourlyWage = Math.max(0, parseFloat(wage!.value) || 0);
    const billableHours = Math.max(1, parseFloat(billable!.value) || 1);
    const result = labourRate({
      wage: hourlyWage,
      burdenPercent: Math.max(0, parseFloat(burden!.value) || 0),
      overheadPerTech: Math.max(0, parseFloat(overhead!.value) || 0),
      billableHours,
      marginPercent: Math.min(90, Math.max(0, parseFloat(margin!.value) || 0)),
    });

    out.rate!.textContent = `${usd2(result.billRate)}/h`;
    out.loaded!.textContent = `${usd2(result.loadedCost)}/h`;
    out.multiple!.textContent = `${fmt(result.multiple, 2)}×`;

    // What one more billable hour a day would be worth, since utilisation is the
    // strongest lever and the one shops rarely measure.
    const plusOneHourADay = labourRate({
      wage: hourlyWage,
      burdenPercent: Math.max(0, parseFloat(burden!.value) || 0),
      overheadPerTech: Math.max(0, parseFloat(overhead!.value) || 0),
      billableHours: billableHours + 240,
      marginPercent: Math.min(90, Math.max(0, parseFloat(margin!.value) || 0)),
    });

    out.note!.textContent = `At ${fmt(result.utilisation, 0)}% utilisation you have to bill ${usd2(result.billRate)}. Selling one more hour a day — 240 a year — would bring that down to ${usd2(plusOneHourADay.billRate)}.`;

    out.bdWage!.textContent = `${usd(result.baseWage)} over ${HOURS_PER_YEAR.toLocaleString("en-US")} paid hours`;
    out.bdBurden!.textContent = `${usd(result.burden)} → ${usd(result.wageWithBurden)}`;
    out.bdTotal!.textContent = `${usd(result.totalCost)} to keep this tech on the road`;
    out.bdUtilisation!.textContent = `${fmt(billableHours, 0)} billable of ${HOURS_PER_YEAR.toLocaleString("en-US")} (${fmt(result.utilisation, 0)}%)`;
    out.bdUnbilled!.textContent = `${fmt(HOURS_PER_YEAR - billableHours, 0)} hours you pay for and cannot invoice`;
  }

  function syncFromRange(): void {
    wage!.value = wageRange!.value;
    calculate();
  }

  function syncToRange(): void {
    const value = parseFloat(wage!.value) || 0;
    if (value >= Number(wageRange!.min) && value <= Number(wageRange!.max)) {
      wageRange!.value = String(value);
    }
    calculate();
  }

  wage.addEventListener("input", syncToRange);
  wageRange.addEventListener("input", syncFromRange);
  [burden, overhead, billable, margin].forEach((el) => el.addEventListener("input", calculate));

  resetBtn?.addEventListener("click", () => {
    wage.value = "38";
    wageRange.value = "38";
    burden.value = "32";
    overhead.value = "11000";
    billable.value = "1560";
    margin.value = "40";
    calculate();
  });

  calculate();
}
