function fmtCfm(n: number): string {
  return Math.round(n).toLocaleString("en-US") + " CFM";
}

function evaluateResidential(cfm: number): { status: string; note: string } {
  if (cfm < 30) {
    return {
      status: "Very low",
      note: "Below typical whole-building minimums — verify inputs and local code; most homes need at least 30–60 CFM continuous ventilation.",
    };
  }
  if (cfm <= 90) {
    return {
      status: "Typical small home",
      note: "Falls in the common ASHRAE 62.2 range for a 1,500–2,500 sq ft home with 2–4 bedrooms — confirm with local mechanical code and balanced supply/exhaust design.",
    };
  }
  if (cfm <= 150) {
    return {
      status: "Typical mid-size home",
      note: "Reasonable whole-building ventilation rate for a larger home — pair with an ERV/HRV or balanced exhaust/supply strategy per code.",
    };
  }
  return {
    status: "High ventilation load",
    note: "Large floor area or many bedrooms drives a higher continuous rate — size the ERV/HRV and duct branches to this CFM and verify local ASHRAE 62.2 adoption.",
  };
}

function evaluateCommercial(cfm: number, occupants: number): { status: string; note: string } {
  const perPerson = occupants > 0 ? cfm / occupants : 0;
  if (cfm < 50) {
    return {
      status: "Low",
      note: "Ventilation rate is below typical office minimums — check occupancy and area inputs against ASHRAE 62.1 Table 6-1 space types.",
    };
  }
  if (perPerson >= 15 && perPerson <= 25) {
    return {
      status: "Typical office band",
      note: "People-based component dominates — common for open offices at ~17.5 CFM/person plus area ventilation. Confirm space type and local code amendments.",
    };
  }
  return {
    status: "Area-driven",
    note: "Floor-area ventilation is a significant share of total CFM — typical for low-occupancy retail or warehouse spaces. Verify space category in ASHRAE 62.1.",
  };
}

export function initHvacVentilationCalculator(): void {
  const modeSelect = document.getElementById("vent-mode") as HTMLSelectElement | null;
  const areaInput = document.getElementById("vent-area") as HTMLInputElement | null;
  const bedroomsInput = document.getElementById("vent-bedrooms") as HTMLInputElement | null;
  const occupantsInput = document.getElementById("vent-occupants") as HTMLInputElement | null;
  const cfmPersonInput = document.getElementById("vent-cfm-person") as HTMLInputElement | null;
  const cfmSqftInput = document.getElementById("vent-cfm-sqft") as HTMLInputElement | null;
  const residentialFields = document.getElementById("vent-residential-fields");
  const commercialFields = document.getElementById("vent-commercial-fields");
  const resetBtn = document.getElementById("resetBtn");
  const resultCfm = document.getElementById("vent-result-cfm");
  const resultArea = document.getElementById("vent-result-area");
  const resultPeople = document.getElementById("vent-result-people");
  const status = document.getElementById("vent-status");
  const bdFormula = document.getElementById("vent-bd-formula");
  const bdArea = document.getElementById("vent-bd-area");
  const bdPeople = document.getElementById("vent-bd-people");

  if (
    !modeSelect ||
    !areaInput ||
    !bedroomsInput ||
    !occupantsInput ||
    !cfmPersonInput ||
    !cfmSqftInput ||
    !residentialFields ||
    !commercialFields ||
    !resultCfm ||
    !resultArea ||
    !resultPeople ||
    !status ||
    !bdFormula ||
    !bdArea ||
    !bdPeople
  ) {
    return;
  }

  function toggleMode(): void {
    const isResidential = modeSelect.value === "residential";
    residentialFields.classList.toggle("hidden", !isResidential);
    commercialFields.classList.toggle("hidden", isResidential);
    calculate();
  }

  function calculate(): void {
    const area = Math.max(0, parseFloat(areaInput.value) || 0);
    let cfm = 0;
    let areaPart = 0;
    let peoplePart = 0;
    let evaluation: { status: string; note: string };

    if (modeSelect.value === "residential") {
      const bedrooms = Math.max(0, parseInt(bedroomsInput.value, 10) || 0);
      areaPart = 0.03 * area;
      peoplePart = 7.5 * (bedrooms + 1);
      cfm = areaPart + peoplePart;
      bdFormula.textContent = "ASHRAE 62.2 whole-building rate";
      evaluation = evaluateResidential(cfm);
    } else {
      const occupants = Math.max(0, parseFloat(occupantsInput.value) || 0);
      const cfmPerson = Math.max(0, parseFloat(cfmPersonInput.value) || 0);
      const cfmSqft = Math.max(0, parseFloat(cfmSqftInput.value) || 0);
      peoplePart = occupants * cfmPerson;
      areaPart = area * cfmSqft;
      cfm = peoplePart + areaPart;
      bdFormula.textContent = "ASHRAE 62.1 people + area rate";
      evaluation = evaluateCommercial(cfm, occupants);
    }

    resultCfm.textContent = fmtCfm(cfm);
    resultArea.textContent = fmtCfm(areaPart);
    resultPeople.textContent = fmtCfm(peoplePart);
    status.textContent = evaluation.status + " — " + evaluation.note;
    bdArea.textContent = fmtCfm(areaPart);
    bdPeople.textContent = fmtCfm(peoplePart);
  }

  function reset(): void {
    modeSelect.value = "residential";
    areaInput.value = "2000";
    bedroomsInput.value = "3";
    occupantsInput.value = "10";
    cfmPersonInput.value = "17.5";
    cfmSqftInput.value = "0.06";
    toggleMode();
  }

  modeSelect.addEventListener("change", toggleMode);
  areaInput.addEventListener("input", calculate);
  bedroomsInput.addEventListener("input", calculate);
  occupantsInput.addEventListener("input", calculate);
  cfmPersonInput.addEventListener("input", calculate);
  cfmSqftInput.addEventListener("input", calculate);
  resetBtn?.addEventListener("click", reset);

  toggleMode();
}
