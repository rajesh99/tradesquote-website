function fmt(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

function usd(n: number): string {
  return "$" + fmt(n);
}

function round50(n: number): number {
  return Math.round(n / 50) * 50;
}

export function initHvacDuctworkReplacementCostCalculator(): void {
  const home = document.getElementById("ductHome") as HTMLSelectElement | null;
  const material = document.getElementById("ductMaterial") as HTMLSelectElement | null;
  const access = document.getElementById("ductAccess") as HTMLSelectElement | null;
  const scope = document.getElementById("ductScope") as HTMLSelectElement | null;
  const market = document.getElementById("ductMarket") as HTMLSelectElement | null;
  const resetBtn = document.getElementById("resetBtn");
  const range = document.getElementById("rangeResult");
  const mid = document.getElementById("midResult");
  const perFt = document.getElementById("perFtResult");
  const bdLen = document.getElementById("bd-len");
  const bdRate = document.getElementById("bd-rate");
  const bdAccess = document.getElementById("bd-access");
  const bdScope = document.getElementById("bd-scope");
  const bdMarket = document.getElementById("bd-market");
  const bdTotal = document.getElementById("bd-total");

  if (
    !home ||
    !material ||
    !access ||
    !scope ||
    !market ||
    !resetBtn ||
    !range ||
    !mid ||
    !perFt ||
    !bdLen ||
    !bdRate ||
    !bdAccess ||
    !bdScope ||
    !bdMarket ||
    !bdTotal
  ) {
    return;
  }

  function calculate(): void {
    const ductFt = parseFloat(home.value) || 220; // estimated linear feet of duct
    const rate = parseFloat(material.value) || 28; // $ per linear foot installed
    const accessF = parseFloat(access.value) || 1; // accessibility multiplier
    const scopeF = parseFloat(scope.value) || 1; // full vs partial
    const marketF = parseFloat(market.value) || 1; // regional labor

    const effectiveFt = ductFt * scopeF;
    const total = effectiveFt * rate * accessF * marketF;
    const midVal = round50(total);
    const low = round50(total * 0.85);
    const high = round50(total * 1.15);

    range.textContent = `${usd(low)} – ${usd(high)}`;
    mid.textContent = usd(midVal);
    perFt.textContent = effectiveFt > 0 ? usd(Math.round(midVal / effectiveFt)) : "—";

    bdLen.textContent = `${Math.round(effectiveFt)} ft`;
    bdRate.textContent = usd(rate) + "/ft";
    bdAccess.textContent = "×" + accessF.toFixed(2);
    bdScope.textContent = "×" + scopeF.toFixed(2);
    bdMarket.textContent = "×" + marketF.toFixed(2);
    bdTotal.textContent = usd(midVal);
  }

  [home, material, access, scope, market].forEach((el) =>
    el.addEventListener("input", calculate),
  );

  resetBtn.addEventListener("click", () => {
    home.value = "220";
    material.value = "28";
    access.value = "1.0";
    scope.value = "1.0";
    market.value = "1.0";
    calculate();
  });

  calculate();
}
