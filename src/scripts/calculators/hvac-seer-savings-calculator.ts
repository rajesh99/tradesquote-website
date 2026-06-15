function fmt(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

function usd(n: number): string {
  return "$" + fmt(n);
}

function pctFmt(p: number): string {
  return (+p.toFixed(1)).toString() + "%";
}

export function initHvacSeerSavingsCalculator(): void {
  const seerOld = document.getElementById("seer-old") as HTMLInputElement | null;
  const seerNew = document.getElementById("seer-new") as HTMLInputElement | null;
  const seerTons = document.getElementById("seer-tons") as HTMLSelectElement | null;
  const seerHours = document.getElementById("seer-hours") as HTMLSelectElement | null;
  const seerRate = document.getElementById("seer-rate") as HTMLInputElement | null;
  const seerRateRange = document.getElementById("seer-rate-range") as HTMLInputElement | null;
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
    !seerOld ||
    !seerNew ||
    !seerTons ||
    !seerHours ||
    !seerRate ||
    !seerRateRange ||
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
    const oldVal = parseFloat(seerOld.value) || 0;
    const newVal = parseFloat(seerNew.value) || 0;
    const tons = parseFloat(seerTons.value) || 3;
    const hours = parseFloat(seerHours.value) || 1200;
    const rate = parseFloat(seerRate.value) || 0.17;

    if (oldVal <= 0 || newVal <= 0) return;

    const btu = tons * 12000;
    const kwhOld = (btu * hours) / (oldVal * 1000);
    const kwhNew = (btu * hours) / (newVal * 1000);
    const costOld = kwhOld * rate;
    const costNew = kwhNew * rate;
    const savingsVal = costOld - costNew;
    const pct = (1 - oldVal / newVal) * 100;

    savings.textContent = usd(savingsVal);
    oldLabel.textContent = "At SEER " + oldVal;
    newLabel.textContent = "At SEER " + newVal;
    oldCost.textContent = usd(costOld) + "/yr";
    newCost.textContent = usd(costNew) + "/yr";
    lifetime.textContent =
      savingsVal >= 0
        ? `${usd(savingsVal * 15)} saved · ${pctFmt(pct)} less electricity`
        : "Higher SEER should be the larger number";

    bdBtu.textContent = fmt(btu) + " BTU/hr";
    bdKwhOld.textContent = fmt(kwhOld) + " kWh";
    bdKwhNew.textContent = fmt(kwhNew) + " kWh";
    bdKwhSaved.textContent = fmt(kwhOld - kwhNew) + " kWh/yr";
    bdTenYr.textContent = usd(savingsVal * 10);
  }

  seerRate.addEventListener("input", () => {
    seerRateRange.value = seerRate.value;
    calculate();
  });
  seerRateRange.addEventListener("input", () => {
    seerRate.value = seerRateRange.value;
    calculate();
  });

  [seerOld, seerNew, seerTons, seerHours].forEach((el) =>
    el.addEventListener("input", calculate),
  );

  resetBtn.addEventListener("click", () => {
    seerOld.value = "10";
    seerNew.value = "16";
    seerTons.value = "3";
    seerHours.value = "1200";
    seerRate.value = "0.17";
    seerRateRange.value = "0.17";
    calculate();
  });

  calculate();
}
