function fmtTemp(n: number): string {
  return Math.round(n) + "°F";
}

type Metering = "txv" | "fixed";

function evaluateSuperheat(
  superheat: number,
  metering: Metering
): { status: string; target: string; range: string; causes: string } {
  if (metering === "txv") {
    const target = "8–12°F";
    const range = "8–12°F (TXV)";

    if (superheat < 4) {
      return {
        status: "Very low",
        target,
        range,
        causes:
          "Overcharge, TXV stuck open, or non-condensables — liquid may reach the compressor. Verify charge and valve operation.",
      };
    }
    if (superheat < 8) {
      return {
        status: superheat < 6 ? "Low" : "Low-normal",
        target,
        range,
        causes:
          "Below TXV target — possible overcharge, restricted airflow, or a TXV feeding too much refrigerant. Add refrigerant only after confirming the target.",
      };
    }
    if (superheat <= 12) {
      return {
        status: "Healthy",
        target,
        range,
        causes:
          "Superheat in the TXV charging band — the evaporator is fully fed without flooding the suction line.",
      };
    }
    if (superheat <= 18) {
      return {
        status: superheat <= 15 ? "High-normal" : "High",
        target,
        range,
        causes:
          "Above TXV target — undercharge, restricted metering device, or low indoor airflow starving the coil.",
      };
    }
    return {
      status: "Very high",
      target,
      range,
      causes:
        "Severe undercharge or a restricted TXV — compressor damage risk from overheating gas. Do not run the system hard until charge is verified.",
    };
  }

  const target = "5–15°F";
  const range = "5–15°F (fixed orifice)";

  if (superheat < 3) {
    return {
      status: "Very low",
      target,
      range,
      causes:
        "Overcharge or flooding — liquid slugging risk. Compare to the target superheat chart for your wet-bulb and outdoor temps.",
    };
  }
  if (superheat < 5) {
    return {
      status: "Low",
      target,
      range,
      causes:
        "Below the fixed-orifice band — likely overcharge or too much airflow. Use the target superheat chart before adjusting charge.",
    };
  }
  if (superheat <= 15) {
    return {
      status: "Healthy",
      target,
      range,
      causes:
        "Superheat within the typical fixed-orifice range — charge and airflow are reasonably matched for a piston meter.",
    };
  }
  if (superheat <= 22) {
    return {
      status: "High",
      target,
      range,
      causes:
        "Undercharge or restricted orifice — the coil is starved. Confirm target superheat from indoor wet-bulb and outdoor dry-bulb before adding refrigerant.",
    };
  }
  return {
    status: "Very high",
    target,
    range,
    causes:
      "Severe undercharge — compressor overheating risk. Verify leak-free system and charge to the manufacturer chart.",
  };
}

export function initHvacSuperheatCalculator(): void {
  const satInput = document.getElementById("sh-sat") as HTMLInputElement | null;
  const suctionInput = document.getElementById("sh-suction") as HTMLInputElement | null;
  const meter = document.getElementById("sh-meter") as HTMLSelectElement | null;
  const resetBtn = document.getElementById("resetBtn");
  const result = document.getElementById("sh-result");
  const status = document.getElementById("sh-status");
  const target = document.getElementById("sh-target");
  const causes = document.getElementById("sh-causes");
  const bdSat = document.getElementById("sh-bd-sat");
  const bdSuction = document.getElementById("sh-bd-suction");
  const bdSh = document.getElementById("sh-bd-sh");
  const bdTarget = document.getElementById("sh-bd-target");

  if (
    !satInput ||
    !suctionInput ||
    !meter ||
    !result ||
    !status ||
    !target ||
    !causes ||
    !bdSat ||
    !bdSuction ||
    !bdSh ||
    !bdTarget
  ) {
    return;
  }

  function calculate(): void {
    const satTemp = parseFloat(satInput.value) || 0;
    const suctionTemp = parseFloat(suctionInput.value) || 0;
    const superheat = suctionTemp - satTemp;

    result.textContent = fmtTemp(superheat);

    const evaluation = evaluateSuperheat(superheat, meter.value as Metering);
    status.textContent = evaluation.status;
    target.textContent = evaluation.target;
    causes.textContent = evaluation.causes;

    bdSat.textContent = fmtTemp(satTemp);
    bdSuction.textContent = fmtTemp(suctionTemp);
    bdSh.textContent = fmtTemp(superheat);
    bdTarget.textContent = evaluation.range;
  }

  function reset(): void {
    satInput.value = "45";
    suctionInput.value = "55";
    meter.value = "txv";
    calculate();
  }

  satInput.addEventListener("input", calculate);
  suctionInput.addEventListener("input", calculate);
  meter.addEventListener("change", calculate);
  resetBtn?.addEventListener("click", reset);

  calculate();
}
