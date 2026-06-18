function fmt(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

function usd(n: number): string {
  return "$" + fmt(n);
}

function pctFmt(p: number): string {
  return (+p.toFixed(1)).toString() + "%";
}

export function initHvacAfueSavingsCalculator(): void {
  const afueOld = document.getElementById("afue-old") as HTMLInputElement | null;
  const afueNew = document.getElementById("afue-new") as HTMLInputElement | null;
  const afueSize = document.getElementById("afue-size") as HTMLSelectElement | null;
  const afueHours = document.getElementById("afue-hours") as HTMLSelectElement | null;
  const afueRate = document.getElementById("afue-rate") as HTMLInputElement | null;
  const afueRateRange = document.getElementById("afue-rate-range") as HTMLInputElement | null;
  const resetBtn = document.getElementById("resetBtn");
  const savings = document.getElementById("afue-savings");
  const oldLabel = document.getElementById("afue-old-label");
  const newLabel = document.getElementById("afue-new-label");
  const oldCost = document.getElementById("afue-old-cost");
  const newCost = document.getElementById("afue-new-cost");
  const lifetime = document.getElementById("afue-lifetime");
  const bdOutput = document.getElementById("afue-bd-output");
  const bdOld = document.getElementById("afue-bd-old");
  const bdNew = document.getElementById("afue-bd-new");
  const bdSaved = document.getElementById("afue-bd-saved");
  const bdTenYr = document.getElementById("afue-bd-tenyr");

  if (
    !afueOld ||
    !afueNew ||
    !afueSize ||
    !afueHours ||
    !afueRate ||
    !afueRateRange ||
    !resetBtn ||
    !savings ||
    !oldLabel ||
    !newLabel ||
    !oldCost ||
    !newCost ||
    !lifetime ||
    !bdOutput ||
    !bdOld ||
    !bdNew ||
    !bdSaved ||
    !bdTenYr
  ) {
    return;
  }

  function calculate(): void {
    const oldVal = parseFloat(afueOld.value) || 0;
    const newVal = parseFloat(afueNew.value) || 0;
    const size = parseFloat(afueSize.value) || 80000;
    const hours = parseFloat(afueHours.value) || 1000;
    const rate = parseFloat(afueRate.value) || 1.5;

    if (oldVal <= 0 || newVal <= 0) return;

    const outputBtu = size * hours;
    const outputTherms = outputBtu / 100000;
    const inputThermsOld = outputTherms / (oldVal / 100);
    const inputThermsNew = outputTherms / (newVal / 100);
    const costOld = inputThermsOld * rate;
    const costNew = inputThermsNew * rate;
    const savingsVal = costOld - costNew;
    const pct = (1 - oldVal / newVal) * 100;

    savings.textContent = usd(savingsVal) + "/year";
    oldLabel.textContent = `At ${oldVal}% AFUE`;
    newLabel.textContent = `At ${newVal}% AFUE`;
    oldCost.textContent = usd(costOld) + "/yr";
    newCost.textContent = usd(costNew) + "/yr";
    lifetime.textContent =
      savingsVal >= 0
        ? `${usd(savingsVal * 15)} saved · ${pctFmt(pct)} less fuel`
        : "Higher AFUE should be the larger number";

    bdOutput.textContent = `${fmt(outputTherms)} therms`;
    bdOld.textContent = `${fmt(inputThermsOld)} therms`;
    bdNew.textContent = `${fmt(inputThermsNew)} therms`;
    bdSaved.textContent = `${fmt(inputThermsOld - inputThermsNew)} therms/yr`;
    bdTenYr.textContent = usd(savingsVal * 10);
  }

  afueRate.addEventListener("input", () => {
    afueRateRange.value = afueRate.value;
    calculate();
  });
  afueRateRange.addEventListener("input", () => {
    afueRate.value = afueRateRange.value;
    calculate();
  });

  [afueOld, afueNew, afueSize, afueHours].forEach((el) =>
    el.addEventListener("input", calculate),
  );

  resetBtn.addEventListener("click", () => {
    afueOld.value = "80";
    afueNew.value = "95";
    afueSize.value = "80000";
    afueHours.value = "1000";
    afueRate.value = "1.50";
    afueRateRange.value = "1.50";
    calculate();
  });

  calculate();
}
