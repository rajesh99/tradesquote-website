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
  "1.5": 0.85,
  "2": 0.9,
  "2.5": 0.95,
  "3": 1.0,
  "3.5": 1.08,
  "4": 1.15,
  "5": 1.25,
};

export function initHvacAcInstallationCostCalculator(): void {
  const type = document.getElementById("acType") as HTMLSelectElement | null;
  const size = document.getElementById("acSize") as HTMLSelectElement | null;
  const eff = document.getElementById("acEff") as HTMLSelectElement | null;
  const duct = document.getElementById("acDuct") as HTMLSelectElement | null;
  const project = document.getElementById("acProject") as HTMLSelectElement | null;
  const market = document.getElementById("acMarket") as HTMLSelectElement | null;
  const resetBtn = document.getElementById("resetBtn");
  const range = document.getElementById("rangeResult");
  const mid = document.getElementById("midResult");
  const perTon = document.getElementById("perTonResult");
  const bdBase = document.getElementById("bd-base");
  const bdSize = document.getElementById("bd-size");
  const bdEff = document.getElementById("bd-eff");
  const bdDuct = document.getElementById("bd-duct");
  const bdProject = document.getElementById("bd-project");
  const bdMarket = document.getElementById("bd-market");
  const bdTotal = document.getElementById("bd-total");

  if (
    !type ||
    !size ||
    !eff ||
    !duct ||
    !project ||
    !market ||
    !resetBtn ||
    !range ||
    !mid ||
    !perTon ||
    !bdBase ||
    !bdSize ||
    !bdEff ||
    !bdDuct ||
    !bdProject ||
    !bdMarket ||
    !bdTotal
  ) {
    return;
  }

  function calculate(): void {
    const base = parseFloat(type.value) || 6000;
    const tons = parseFloat(size.value) || 3;
    const sizeF = SIZE_FACTOR[size.value] || 1;
    const effF = parseFloat(eff.value) || 1;
    const ductV = parseFloat(duct.value) || 0;
    const projF = parseFloat(project.value) || 1;
    const marketF = parseFloat(market.value) || 1;

    const total = (base * sizeF * effF + ductV) * projF * marketF;
    const midVal = round100(total);
    const low = round100(total * 0.85);
    const high = round100(total * 1.15);

    range.textContent = `${usd(low)} – ${usd(high)}`;
    mid.textContent = usd(midVal);
    perTon.textContent = usd(Math.round(midVal / tons));

    bdBase.textContent = usd(base);
    bdSize.textContent = `×${sizeF.toFixed(2)} (${tons} tons)`;
    bdEff.textContent = "×" + effF.toFixed(2);
    bdDuct.textContent = ductV > 0 ? "+" + usd(ductV) : "—";
    bdProject.textContent = "×" + projF.toFixed(2);
    bdMarket.textContent = "×" + marketF.toFixed(2);
    bdTotal.textContent = usd(midVal);
  }

  [type, size, eff, duct, project, market].forEach((el) =>
    el.addEventListener("input", calculate),
  );

  resetBtn.addEventListener("click", () => {
    type.value = "6000";
    size.value = "3";
    eff.value = "1.0";
    duct.value = "0";
    project.value = "1.0";
    market.value = "1.0";
    calculate();
  });

  calculate();
}
