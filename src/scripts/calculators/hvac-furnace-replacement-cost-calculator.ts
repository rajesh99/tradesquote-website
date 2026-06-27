function fmt(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

function usd(n: number): string {
  return "$" + fmt(n);
}

function round100(n: number): number {
  return Math.round(n / 100) * 100;
}

const SIZE_FACTOR: Record<string, number> = {
  "40000": 0.9,
  "60000": 0.95,
  "80000": 1.0,
  "100000": 1.08,
  "120000": 1.15,
};

export function initHvacFurnaceReplacementCostCalculator(): void {
  const type = document.getElementById("furnType") as HTMLSelectElement | null;
  const size = document.getElementById("furnSize") as HTMLSelectElement | null;
  const eff = document.getElementById("furnEff") as HTMLSelectElement | null;
  const project = document.getElementById("furnProject") as HTMLSelectElement | null;
  const market = document.getElementById("furnMarket") as HTMLSelectElement | null;
  const resetBtn = document.getElementById("resetBtn");
  const range = document.getElementById("rangeResult");
  const mid = document.getElementById("midResult");
  const effHi = document.getElementById("effResult");
  const bdBase = document.getElementById("bd-base");
  const bdSize = document.getElementById("bd-size");
  const bdEff = document.getElementById("bd-eff");
  const bdProject = document.getElementById("bd-project");
  const bdMarket = document.getElementById("bd-market");
  const bdTotal = document.getElementById("bd-total");

  if (
    !type ||
    !size ||
    !eff ||
    !project ||
    !market ||
    !resetBtn ||
    !range ||
    !mid ||
    !effHi ||
    !bdBase ||
    !bdSize ||
    !bdEff ||
    !bdProject ||
    !bdMarket ||
    !bdTotal
  ) {
    return;
  }

  function calculate(): void {
    const base = parseFloat(type.value) || 5000;
    const sizeF = SIZE_FACTOR[size.value] || 1;
    const effF = parseFloat(eff.value) || 1;
    const projF = parseFloat(project.value) || 1;
    const marketF = parseFloat(market.value) || 1;

    const total = base * sizeF * effF * projF * marketF;
    const midVal = round100(total);
    const low = round100(total * 0.85);
    const high = round100(total * 1.15);
    const hiEff = round100(base * sizeF * 1.22 * projF * marketF);

    range.textContent = `${usd(low)} – ${usd(high)}`;
    mid.textContent = usd(midVal);
    effHi.textContent = usd(hiEff);

    bdBase.textContent = usd(base);
    bdSize.textContent = "×" + sizeF.toFixed(2);
    bdEff.textContent = "×" + effF.toFixed(2);
    bdProject.textContent = "×" + projF.toFixed(2);
    bdMarket.textContent = "×" + marketF.toFixed(2);
    bdTotal.textContent = usd(midVal);
  }

  [type, size, eff, project, market].forEach((el) =>
    el.addEventListener("input", calculate),
  );

  resetBtn.addEventListener("click", () => {
    type.value = "5000";
    size.value = "80000";
    eff.value = "1.0";
    project.value = "1.0";
    market.value = "1.0";
    calculate();
  });

  calculate();
}
