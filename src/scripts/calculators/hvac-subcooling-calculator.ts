function fmtTemp(n: number): string {
  return Math.round(n) + "°F";
}

type Metering = "txv" | "piston";

function evaluateSubcooling(
  subcooling: number,
  metering: Metering
): { status: string; target: string; range: string; causes: string } {
  if (metering === "txv") {
    const target = "8–12°F";
    const range = "8–12°F (TXV)";

    if (subcooling < 4) {
      return {
        status: "Very low",
        target,
        range,
        causes:
          "Undercharge or poor condenser rejection — not enough liquid in the line. Check for leaks before adding refrigerant.",
      };
    }
    if (subcooling < 8) {
      return {
        status: subcooling < 6 ? "Low" : "Low-normal",
        target,
        range,
        causes:
          "Below TXV target — undercharge, dirty condenser, or high ambient reducing condenser capacity. Clean the coil and verify charge.",
      };
    }
    if (subcooling <= 12) {
      return {
        status: "Healthy",
        target,
        range,
        causes:
          "Subcooling in the TXV charging band — the condenser is delivering fully condensed liquid to the metering device.",
      };
    }
    if (subcooling <= 18) {
      return {
        status: subcooling <= 15 ? "High-normal" : "High",
        target,
        range,
        causes:
          "Above TXV target — overcharge, restricted metering device, or unusually cool ambient stacking extra subcooling.",
      };
    }
    return {
      status: "Very high",
      target,
      range,
      causes:
        "Severe overcharge — excess refrigerant in the condenser. Recover to manufacturer subcooling target before returning to service.",
    };
  }

  const target = "10–15°F";
  const range = "10–15°F (piston)";

  if (subcooling < 6) {
    return {
      status: "Very low",
      target,
      range,
      causes:
        "Undercharge or condenser problem — liquid line is too warm. Verify suction superheat and look for leaks.",
    };
  }
  if (subcooling < 10) {
    return {
      status: "Low",
      target,
      range,
      causes:
        "Below piston target — undercharge or insufficient condenser capacity. Clean condenser and verify charge.",
    };
  }
  if (subcooling <= 15) {
    return {
      status: "Healthy",
      target,
      range,
      causes:
        "Subcooling within the typical piston-metering band — condenser and charge are reasonably matched.",
    };
  }
  if (subcooling <= 20) {
    return {
      status: "High",
      target,
      range,
      causes:
        "Overcharge — too much refrigerant stacked in the condenser. Adjust to manufacturer subcooling spec.",
    };
  }
  return {
    status: "Very high",
    target,
    range,
    causes:
      "Severe overcharge — recover excess refrigerant to the target subcooling before returning to service.",
  };
}

export function initHvacSubcoolingCalculator(): void {
  const satInput = document.getElementById("sc-sat") as HTMLInputElement | null;
  const liquidInput = document.getElementById("sc-liquid") as HTMLInputElement | null;
  const meter = document.getElementById("sc-meter") as HTMLSelectElement | null;
  const resetBtn = document.getElementById("resetBtn");
  const result = document.getElementById("sc-result");
  const status = document.getElementById("sc-status");
  const target = document.getElementById("sc-target");
  const causes = document.getElementById("sc-causes");
  const bdSat = document.getElementById("sc-bd-sat");
  const bdLiquid = document.getElementById("sc-bd-liquid");
  const bdSc = document.getElementById("sc-bd-sc");
  const bdTarget = document.getElementById("sc-bd-target");

  if (
    !satInput ||
    !liquidInput ||
    !meter ||
    !result ||
    !status ||
    !target ||
    !causes ||
    !bdSat ||
    !bdLiquid ||
    !bdSc ||
    !bdTarget
  ) {
    return;
  }

  function calculate(): void {
    const satTemp = parseFloat(satInput.value) || 0;
    const liquidTemp = parseFloat(liquidInput.value) || 0;
    const subcooling = satTemp - liquidTemp;

    result.textContent = fmtTemp(subcooling);

    const evaluation = evaluateSubcooling(subcooling, meter.value as Metering);
    status.textContent = evaluation.status;
    target.textContent = evaluation.target;
    causes.textContent = evaluation.causes;

    bdSat.textContent = fmtTemp(satTemp);
    bdLiquid.textContent = fmtTemp(liquidTemp);
    bdSc.textContent = fmtTemp(subcooling);
    bdTarget.textContent = evaluation.range;
  }

  function reset(): void {
    satInput.value = "95";
    liquidInput.value = "88";
    meter.value = "txv";
    calculate();
  }

  satInput.addEventListener("input", calculate);
  liquidInput.addEventListener("input", calculate);
  meter.addEventListener("change", calculate);
  resetBtn?.addEventListener("click", reset);

  calculate();
}
