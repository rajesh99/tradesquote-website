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

export function initHvacReplacementCostCalculator(): void {
  const sysType = document.getElementById("sysType") as HTMLSelectElement | null;
  const sysSize = document.getElementById("sysSize") as HTMLSelectElement | null;
  const sysEff = document.getElementById("sysEff") as HTMLSelectElement | null;
  const sysDuct = document.getElementById("sysDuct") as HTMLSelectElement | null;
  const sysMarket = document.getElementById("sysMarket") as HTMLSelectElement | null;
  const resetBtn = document.getElementById("resetBtn");
  const range = document.getElementById("rangeResult");
  const mid = document.getElementById("midResult");
  const perTon = document.getElementById("perTonResult");
  const bdBase = document.getElementById("bd-base");
  const bdSize = document.getElementById("bd-size");
  const bdEff = document.getElementById("bd-eff");
  const bdDuct = document.getElementById("bd-duct");
  const bdMarket = document.getElementById("bd-market");
  const bdTotal = document.getElementById("bd-total");

  if (
    !sysType ||
    !sysSize ||
    !sysEff ||
    !sysDuct ||
    !sysMarket ||
    !resetBtn ||
    !range ||
    !mid ||
    !perTon ||
    !bdBase ||
    !bdSize ||
    !bdEff ||
    !bdDuct ||
    !bdMarket ||
    !bdTotal
  ) {
    return;
  }

  function calculate(): void {
    const base = parseFloat(sysType.value) || 10500;
    const tons = parseFloat(sysSize.value) || 3;
    const sizeF = SIZE_FACTOR[sysSize.value] || 1;
    const effF = parseFloat(sysEff.value) || 1;
    const duct = parseFloat(sysDuct.value) || 0;
    const market = parseFloat(sysMarket.value) || 1;

    const total = (base * sizeF * effF + duct) * market;
    const midVal = round100(total);
    const low = round100(total * 0.85);
    const high = round100(total * 1.15);

    range.textContent = `${usd(low)} – ${usd(high)}`;
    mid.textContent = usd(midVal);
    perTon.textContent = usd(Math.round(midVal / tons));

    bdBase.textContent = usd(base);
    bdSize.textContent = `×${sizeF.toFixed(2)} (${tons} tons)`;
    bdEff.textContent = "×" + effF.toFixed(2);
    bdDuct.textContent = duct > 0 ? "+" + usd(duct) : "—";
    bdMarket.textContent = "×" + market.toFixed(2);
    bdTotal.textContent = usd(midVal);
  }

  [sysType, sysSize, sysEff, sysDuct, sysMarket].forEach((el) =>
    el.addEventListener("input", calculate),
  );

  resetBtn.addEventListener("click", () => {
    sysType.value = "10500";
    sysSize.value = "3";
    sysEff.value = "1.0";
    sysDuct.value = "0";
    sysMarket.value = "1.0";
    calculate();
  });

  calculate();
}
