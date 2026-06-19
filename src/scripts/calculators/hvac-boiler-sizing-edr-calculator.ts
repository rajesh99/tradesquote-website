function fmtBtu(n: number): string {
  return Math.round(n).toLocaleString() + " BTU/h";
}

function fmtTemp(n: number): string {
  return Math.round(n) + "°F";
}

function fmtPct(n: number): string {
  return Math.round(n) + "%";
}

export function initHvacBoilerSizingEdrCalculator(): void {
  const edrTotalInput = document.getElementById("edr-total") as HTMLInputElement | null;
  const supplyTempInput = document.getElementById("edr-supply-temp") as HTMLInputElement | null;
  const roomTempInput = document.getElementById("edr-room-temp") as HTMLInputElement | null;
  const heatLossInput = document.getElementById("edr-heat-loss") as HTMLInputElement | null;
  const resetBtn = document.getElementById("edr-reset");

  const resultNet = document.getElementById("edr-result-net");
  const resultDt = document.getElementById("edr-result-dt");
  const resultGross = document.getElementById("edr-result-gross");
  const resultRatio = document.getElementById("edr-result-ratio");
  const warningBox = document.getElementById("edr-warning");
  const warningText = document.getElementById("edr-warning-text");

  const bdEdr = document.getElementById("edr-bd-edr");
  const bdSupply = document.getElementById("edr-bd-supply");
  const bdRoom = document.getElementById("edr-bd-room");
  const bdDt = document.getElementById("edr-bd-dt");
  const bdNet = document.getElementById("edr-bd-net");
  const bdGross = document.getElementById("edr-bd-gross");

  if (
    !edrTotalInput ||
    !supplyTempInput ||
    !roomTempInput ||
    !heatLossInput ||
    !resultNet ||
    !resultDt ||
    !resultGross ||
    !resultRatio ||
    !warningBox ||
    !warningText ||
    !bdEdr ||
    !bdSupply ||
    !bdRoom ||
    !bdDt ||
    !bdNet ||
    !bdGross
  ) {
    return;
  }

  function calculate(): void {
    const totalEdr = parseFloat(edrTotalInput!.value) || 0;
    const supplyTemp = parseFloat(supplyTempInput!.value) || 0;
    const roomTemp = parseFloat(roomTempInput!.value) || 0;
    const heatLoss = parseFloat(heatLossInput!.value) || 0;

    const deltaT = supplyTemp - roomTemp;

    // Protect against negative or zero deltaT — output is zero if supply <= room
    const safeDeltaT = Math.max(deltaT, 0);

    // Q_net = Total_EDR × 170 × (ΔT / 110)^1.3
    const qNet = totalEdr * 170 * Math.pow(safeDeltaT / 110, 1.3);

    // Q_gross = Q_net × 1.15
    const qGross = qNet * 1.15;

    // Oversizing ratio
    const oversizingRatio = heatLoss > 0 ? (qNet / heatLoss) * 100 : 0;

    // Update main results
    resultNet!.textContent = Math.round(qNet).toLocaleString();
    resultDt!.textContent = fmtTemp(deltaT);
    resultGross!.textContent = fmtBtu(qGross);
    resultRatio!.textContent = heatLoss > 0 ? fmtPct(oversizingRatio) + " of heat loss" : "Enter heat loss to check";

    // Update breakdown
    bdEdr!.textContent = Math.round(totalEdr) + " sq ft";
    bdSupply!.textContent = fmtTemp(supplyTemp);
    bdRoom!.textContent = fmtTemp(roomTemp);
    bdDt!.textContent = fmtTemp(deltaT);
    bdNet!.textContent = fmtBtu(qNet);
    bdGross!.textContent = fmtBtu(qGross);

    // Warnings
    const warnings: string[] = [];

    if (deltaT < 20) {
      warnings.push(
        "Low ΔT: Supply water temperature is very close to room temperature. Radiators will output minimal heat at this condition — verify supply temperature setting."
      );
    }

    if (heatLoss > 0 && oversizingRatio > 140) {
      warnings.push(
        "Oversizing risk: Connected radiator EDR exceeds calculated building heat loss by more than 40%. Sizing a boiler to the radiators in this scenario will cause short-cycling. Consider installing a modulating boiler or thermostatic radiator valves."
      );
    }

    if (warnings.length > 0) {
      warningText!.textContent = warnings.join(" ");
      warningBox!.classList.remove("hidden");
    } else {
      warningBox!.classList.add("hidden");
      warningText!.textContent = "";
    }
  }

  function reset(): void {
    edrTotalInput!.value = "600";
    supplyTempInput!.value = "180";
    roomTempInput!.value = "70";
    heatLossInput!.value = "60000";
    calculate();
  }

  edrTotalInput.addEventListener("input", calculate);
  supplyTempInput.addEventListener("input", calculate);
  roomTempInput.addEventListener("input", calculate);
  heatLossInput.addEventListener("input", calculate);
  resetBtn?.addEventListener("click", reset);

  calculate();
}
