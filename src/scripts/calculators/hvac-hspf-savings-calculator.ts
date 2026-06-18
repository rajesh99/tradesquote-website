function fmt(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

function usd(n: number): string {
  return "$" + fmt(n);
}

function pctFmt(p: number): string {
  return (+p.toFixed(1)).toString() + "%";
}

export function initHvacHspfSavingsCalculator(): void {
  const hspfOld = document.getElementById("hspf-old") as HTMLInputElement | null;
  const hspfNew = document.getElementById("hspf-new") as HTMLInputElement | null;
  const hspfTons = document.getElementById("hspf-tons") as HTMLSelectElement | null;
  const hspfHours = document.getElementById("hspf-hours") as HTMLSelectElement | null;
  const hspfRate = document.getElementById("hspf-rate") as HTMLInputElement | null;
  const hspfRateRange = document.getElementById("hspf-rate-range") as HTMLInputElement | null;
  const resetBtn = document.getElementById("resetBtn");
  const savings = document.getElementById("savingsResult");
  const oldLabel = document.getElementById("oldLabel");
  const newLabel = document.getElementById("newLabel");
  const oldCost = document.getElementById("oldCost");
  const newCost = document.getElementById("newCost");
  const lifetime = document.getElementById("lifetimeResult");
  const bdBtu = document.getElementById("bd-btu");
  const bdKwhOld = document.getElementById("bd-kwh-old");
  const bdKwhNew = document.getElementById("bd-kwh-new");
  const bdKwhSaved = document.getElementById("bd-kwh-saved");
  const bdTenYr = document.getElementById("bd-tenyr");

  if (
    !hspfOld ||
    !hspfNew ||
    !hspfTons ||
    !hspfHours ||
    !hspfRate ||
    !hspfRateRange ||
    !resetBtn ||
    !savings ||
    !oldLabel ||
    !newLabel ||
    !oldCost ||
    !newCost ||
    !lifetime ||
    !bdBtu ||
    !bdKwhOld ||
    !bdKwhNew ||
    !bdKwhSaved ||
    !bdTenYr
  ) {
    return;
  }

  function calculate(): void {
    const oldVal = parseFloat(hspfOld.value) || 0;
    const newVal = parseFloat(hspfNew.value) || 0;
    const tons = parseFloat(hspfTons.value) || 3;
    const hours = parseFloat(hspfHours.value) || 1500;
    const rate = parseFloat(hspfRate.value) || 0.17;

    if (oldVal <= 0 || newVal <= 0) return;

    const btu = tons * 12000;
    const kwhOld = (btu * hours) / (oldVal * 1000);
    const kwhNew = (btu * hours) / (newVal * 1000);
    const costOld = kwhOld * rate;
    const costNew = kwhNew * rate;
    const savingsVal = costOld - costNew;
    const pct = (1 - oldVal / newVal) * 100;

    savings.textContent = usd(savingsVal);
    oldLabel.textContent = "At HSPF " + oldVal;
    newLabel.textContent = "At HSPF " + newVal;
    oldCost.textContent = usd(costOld) + "/yr";
    newCost.textContent = usd(costNew) + "/yr";
    lifetime.textContent =
      savingsVal >= 0
        ? `${usd(savingsVal * 15)} saved · ${pctFmt(pct)} less electricity`
        : "Higher HSPF should be the larger number";

    bdBtu.textContent = fmt(btu) + " BTU/hr";
    bdKwhOld.textContent = fmt(kwhOld) + " kWh";
    bdKwhNew.textContent = fmt(kwhNew) + " kWh";
    bdKwhSaved.textContent = fmt(kwhOld - kwhNew) + " kWh/yr";
    bdTenYr.textContent = usd(savingsVal * 10);
  }

  hspfRate.addEventListener("input", () => {
    hspfRateRange.value = hspfRate.value;
    calculate();
  });
  hspfRateRange.addEventListener("input", () => {
    hspfRate.value = hspfRateRange.value;
    calculate();
  });

  [hspfOld, hspfNew, hspfTons, hspfHours].forEach((el) =>
    el.addEventListener("input", calculate),
  );

  resetBtn.addEventListener("click", () => {
    hspfOld.value = "8";
    hspfNew.value = "10";
    hspfTons.value = "3";
    hspfHours.value = "1500";
    hspfRate.value = "0.17";
    hspfRateRange.value = "0.17";
    calculate();
  });

  calculate();
}
