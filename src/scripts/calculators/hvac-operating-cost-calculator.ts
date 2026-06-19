function fmt(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

function usd(n: number): string {
  return "$" + fmt(n);
}

function usd2(n: number): string {
  return "$" + n.toFixed(2);
}

export function initHvacOperatingCostCalculator(): void {
  const ocType = document.getElementById("oc-type") as HTMLSelectElement | null;
  const ocBtu = document.getElementById("oc-btu") as HTMLInputElement | null;
  const ocBtuHint = document.getElementById("oc-btu-hint");
  const ocEff = document.getElementById("oc-eff") as HTMLInputElement | null;
  const ocEffLabel = document.getElementById("oc-eff-label");
  const ocHours = document.getElementById("oc-hours") as HTMLInputElement | null;
  const ocHoursRange = document.getElementById("oc-hours-range") as HTMLInputElement | null;
  const ocDays = document.getElementById("oc-days") as HTMLInputElement | null;
  const ocElecWrap = document.getElementById("oc-elec-wrap");
  const ocElec = document.getElementById("oc-elec") as HTMLInputElement | null;
  const ocGasWrap = document.getElementById("oc-gas-wrap");
  const ocGas = document.getElementById("oc-gas") as HTMLInputElement | null;
  const resetBtn = document.getElementById("resetBtn");

  const ocYear = document.getElementById("oc-year");
  const ocHour = document.getElementById("oc-hour");
  const ocDay = document.getElementById("oc-day");
  const ocEnergy = document.getElementById("oc-energy");
  const bdPerHr = document.getElementById("oc-bd-perhr");
  const bdHours = document.getElementById("oc-bd-hours");
  const bdRate = document.getElementById("oc-bd-rate");
  const bdEnergy = document.getElementById("oc-bd-energy");

  if (
    !ocType ||
    !ocBtu ||
    !ocBtuHint ||
    !ocEff ||
    !ocEffLabel ||
    !ocHours ||
    !ocHoursRange ||
    !ocDays ||
    !ocElecWrap ||
    !ocElec ||
    !ocGasWrap ||
    !ocGas ||
    !resetBtn ||
    !ocYear ||
    !ocHour ||
    !ocDay ||
    !ocEnergy ||
    !bdPerHr ||
    !bdHours ||
    !bdRate ||
    !bdEnergy
  ) {
    return;
  }

  function effLabelFor(type: string): string {
    if (type === "ac") return "SEER";
    if (type === "hp") return "HSPF";
    if (type === "gas") return "AFUE %";
    return "Efficiency %";
  }

  function applyType(): void {
    const type = ocType.value;
    ocEffLabel.textContent = effLabelFor(type);

    if (type === "gas") {
      ocGasWrap.classList.remove("hidden");
      ocElecWrap.classList.add("hidden");
    } else {
      ocGasWrap.classList.add("hidden");
      ocElecWrap.classList.remove("hidden");
    }

    if (type === "elec") {
      ocEff.value = "100";
      ocEff.disabled = true;
    } else {
      ocEff.disabled = false;
    }
  }

  function calculate(): void {
    const type = ocType.value;
    const btu = parseFloat(ocBtu.value) || 0;
    const eff = parseFloat(ocEff.value) || 0;
    const hoursPerDay = parseFloat(ocHours.value) || 0;
    const days = parseFloat(ocDays.value) || 0;
    const elecRate = parseFloat(ocElec.value) || 0;
    const gasRate = parseFloat(ocGas.value) || 0;

    ocBtuHint.textContent = `= ${(btu / 12000).toFixed(1)} tons`;

    const annualHours = hoursPerDay * days;

    let kwhPerHr = 0;
    let thermsPerHr = 0;
    let energyUnit = "kWh";
    let costPerHour = 0;
    const isGas = type === "gas";

    if (type === "ac" || type === "hp") {
      kwhPerHr = eff > 0 ? btu / eff / 1000 : 0;
      energyUnit = "kWh";
      costPerHour = kwhPerHr * elecRate;
    } else if (type === "elec") {
      kwhPerHr = btu / 3412;
      energyUnit = "kWh";
      costPerHour = kwhPerHr * elecRate;
    } else {
      // gas
      thermsPerHr = eff > 0 ? btu / (eff / 100) / 100000 : 0;
      energyUnit = "therms";
      costPerHour = thermsPerHr * gasRate;
    }

    const energyPerHour = isGas ? thermsPerHr : kwhPerHr;
    const costDay = costPerHour * hoursPerDay;
    const costYear = costPerHour * annualHours;
    const energyYear = energyPerHour * annualHours;

    ocYear.textContent = `${usd(costYear)}/year`;
    ocHour.textContent = usd2(costPerHour);
    ocDay.textContent = usd2(costDay);
    ocEnergy.textContent = `${fmt(energyYear)} ${energyUnit}`;

    bdPerHr.textContent = isGas
      ? `${energyPerHour.toFixed(2)} ${energyUnit}/hr`
      : `${kwhPerHr.toFixed(2)} kWh/hr`;
    bdHours.textContent = `${fmt(annualHours)} hrs/yr`;
    bdRate.textContent = isGas ? `${usd2(gasRate)}/therm` : `${usd2(elecRate)}/kWh`;
    bdEnergy.textContent = `${fmt(energyYear)} ${energyUnit}/yr`;
  }

  ocType.addEventListener("change", () => {
    const type = ocType.value;
    if (type === "ac") ocEff.value = "15";
    else if (type === "hp") ocEff.value = "8.5";
    else if (type === "gas") ocEff.value = "80";
    else if (type === "elec") ocEff.value = "100";
    applyType();
    calculate();
  });

  ocHours.addEventListener("input", () => {
    ocHoursRange.value = ocHours.value;
    calculate();
  });
  ocHoursRange.addEventListener("input", () => {
    ocHours.value = ocHoursRange.value;
    calculate();
  });

  [ocBtu, ocEff, ocDays, ocElec, ocGas].forEach((el) =>
    el.addEventListener("input", calculate),
  );

  resetBtn.addEventListener("click", () => {
    ocType.value = "ac";
    ocBtu.value = "36000";
    ocEff.value = "15";
    ocHours.value = "8";
    ocHoursRange.value = "8";
    ocDays.value = "120";
    ocElec.value = "0.17";
    ocGas.value = "1.50";
    ocGasWrap.classList.add("hidden");
    ocElecWrap.classList.remove("hidden");
    applyType();
    calculate();
  });

  applyType();
  calculate();
}
