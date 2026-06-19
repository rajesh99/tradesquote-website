function fmtTemp(n: number): string {
  return Math.round(n) + "°F";
}

type Mode = "cooling" | "heating";
type Humidity = "low" | "normal" | "high";

function evaluateCooling(diff: number, rh: Humidity): {
  status: string;
  target: string;
  range: string;
  causes: string;
} {
  const targets: Record<Humidity, string> = {
    low: "18–22°F",
    normal: "18–20°F",
    high: "15–18°F",
  };
  const range = "16–22°F";

  if (diff < 14) {
    return {
      status: "Low",
      target: targets[rh],
      range,
      causes: "Low refrigerant or leak, dirty evaporator coil, or too much airflow — verify charge and coil condition.",
    };
  }
  if (diff < 16) {
    const okInHumid = rh === "high";
    return {
      status: okInHumid ? "Low-normal" : "Low-normal",
      target: targets[rh],
      range,
      causes: okInHumid
        ? "Often acceptable in humid conditions — more capacity goes to dehumidification. Verify charge if split stays low."
        : "Slightly below typical — check airflow and refrigerant charge, especially if the home feels warm or clammy.",
    };
  }
  if (diff <= 22) {
    return {
      status: "Healthy",
      target: targets[rh],
      range,
      causes:
        rh === "high"
          ? "A split in the healthy band for humid air — good airflow and charge for the moisture load."
          : "A 16–22°F split with average humidity means good airflow and a proper refrigerant charge — no action needed.",
    };
  }
  if (diff <= 25) {
    return {
      status: "High",
      target: targets[rh],
      range,
      causes: "Restricted airflow — dirty filter, closed or blocked vents, undersized or leaky ducts, or blower speed set too low.",
    };
  }
  return {
    status: "Very high",
    target: targets[rh],
    range,
    causes: "Severe airflow restriction — check filter, blower, and ductwork before running the system hard.",
  };
}

function evaluateHeating(diff: number): {
  status: string;
  target: string;
  range: string;
  causes: string;
} {
  const target = "40–70°F";
  const range = "40–70°F (nameplate)";

  if (diff < 30) {
    return {
      status: "Low",
      target,
      range,
      causes: "Too much airflow or too little heat — check blower speed, firing rate, and that the furnace matches the duct system.",
    };
  }
  if (diff < 40) {
    return {
      status: "Low-normal",
      target,
      range,
      causes: "Below typical nameplate rise — verify airflow is not excessive and compare to the equipment label.",
    };
  }
  if (diff <= 70) {
    return {
      status: "Healthy",
      target,
      range,
      causes: "Temperature rise within the usual nameplate range — airflow and heat output are well matched.",
    };
  }
  if (diff <= 80) {
    return {
      status: "High",
      target,
      range,
      causes: "Restricted return or supply airflow — dirty filter, blocked vents, or blower set too low. Overheating risk if it persists.",
    };
  }
  return {
    status: "Very high",
    target,
    range,
    causes: "Dangerously high rise — restricted airflow or over-firing. Shut down and check filter, blower, and ductwork.",
  };
}

export function initHvacDeltaTCalculator(): void {
  const mode = document.getElementById("dt-mode") as HTMLSelectElement | null;
  const returnInput = document.getElementById("dt-return") as HTMLInputElement | null;
  const supplyInput = document.getElementById("dt-supply") as HTMLInputElement | null;
  const rh = document.getElementById("dt-rh") as HTMLSelectElement | null;
  const resetBtn = document.getElementById("resetBtn");
  const label = document.getElementById("dt-label");
  const result = document.getElementById("dt-result");
  const status = document.getElementById("dt-status");
  const target = document.getElementById("dt-target");
  const causes = document.getElementById("dt-causes");
  const bdReturn = document.getElementById("dt-bd-return");
  const bdSupply = document.getElementById("dt-bd-supply");
  const bdDiff = document.getElementById("dt-bd-diff");
  const bdRange = document.getElementById("dt-bd-range");
  const rhField = rh?.closest("div");

  if (
    !mode ||
    !returnInput ||
    !supplyInput ||
    !rh ||
    !label ||
    !result ||
    !status ||
    !target ||
    !causes ||
    !bdReturn ||
    !bdSupply ||
    !bdDiff ||
    !bdRange
  ) {
    return;
  }

  function setRhVisible(): void {
    if (rhField) {
      rhField.classList.toggle("hidden", mode.value === "heating");
    }
  }

  function calculate(): void {
    const returnTemp = parseFloat(returnInput.value) || 0;
    const supplyTemp = parseFloat(supplyInput.value) || 0;
    const isCooling = (mode.value as Mode) === "cooling";
    const diff = isCooling ? returnTemp - supplyTemp : supplyTemp - returnTemp;

    label.textContent = isCooling ? "Temperature split" : "Temperature rise";
    result.textContent = fmtTemp(diff);

    const evaluation = isCooling
      ? evaluateCooling(diff, rh.value as Humidity)
      : evaluateHeating(diff);

    status.textContent = evaluation.status;
    target.textContent = evaluation.target;
    causes.textContent = evaluation.causes;

    bdReturn.textContent = fmtTemp(returnTemp);
    bdSupply.textContent = fmtTemp(supplyTemp);
    bdDiff.textContent = fmtTemp(diff);
    bdRange.textContent = evaluation.range;
  }

  function reset(): void {
    mode.value = "cooling";
    returnInput.value = "75";
    supplyInput.value = "56";
    rh.value = "normal";
    setRhVisible();
    calculate();
  }

  mode.addEventListener("change", () => {
    setRhVisible();
    calculate();
  });
  returnInput.addEventListener("input", calculate);
  supplyInput.addEventListener("input", calculate);
  rh.addEventListener("change", calculate);
  resetBtn?.addEventListener("click", reset);

  setRhVisible();
  calculate();
}
