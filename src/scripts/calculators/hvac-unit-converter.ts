function fmtNum(n: number, decimals = 1): string {
  return (Math.round(n * Math.pow(10, decimals)) / Math.pow(10, decimals)).toLocaleString("en-US");
}

export function initHvacUnitConverter(): void {
  const modeSelect = document.getElementById("uc-mode") as HTMLSelectElement | null;
  const valueInput = document.getElementById("uc-value") as HTMLInputElement | null;
  const capacityFields = document.getElementById("uc-capacity-fields");
  const tempFields = document.getElementById("uc-temp-fields");
  const pressureFields = document.getElementById("uc-pressure-fields");
  const resetBtn = document.getElementById("resetBtn");
  const resultPrimary = document.getElementById("uc-result-primary");
  const resultSecondary = document.getElementById("uc-result-secondary");
  const resultTertiary = document.getElementById("uc-result-tertiary");
  const status = document.getElementById("uc-status");
  const bdInput = document.getElementById("uc-bd-input");
  const bdFormula = document.getElementById("uc-bd-formula");

  if (
    !modeSelect ||
    !valueInput ||
    !capacityFields ||
    !tempFields ||
    !pressureFields ||
    !resultPrimary ||
    !resultSecondary ||
    !resultTertiary ||
    !status ||
    !bdInput ||
    !bdFormula
  ) {
    return;
  }

  function getDirectionSelect(): HTMLSelectElement {
    const mode = modeSelect.value;
    const container =
      mode === "capacity" ? capacityFields : mode === "temperature" ? tempFields : pressureFields;
    return container.querySelector("select") as HTMLSelectElement;
  }

  function toggleMode(): void {
    const mode = modeSelect.value;
    capacityFields.classList.toggle("hidden", mode !== "capacity");
    tempFields.classList.toggle("hidden", mode !== "temperature");
    pressureFields.classList.toggle("hidden", mode !== "pressure");
    calculate();
  }

  function calculate(): void {
    const val = parseFloat(valueInput.value) || 0;
    const mode = modeSelect.value;
    const direction = getDirectionSelect().value;

    if (mode === "capacity") {
      const tons = direction === "tons" ? val : val / 12000;
      const btu = tons * 12000;
      const kw = btu / 3412;
      resultPrimary.textContent = fmtNum(tons, 2) + " tons";
      resultSecondary.textContent = fmtNum(btu, 0) + " BTU/h";
      resultTertiary.textContent = fmtNum(kw, 1) + " kW";
      bdInput.textContent = direction === "tons" ? val + " tons" : fmtNum(btu, 0) + " BTU/h";
      bdFormula.textContent = "BTU/h = tons × 12,000 · kW = BTU/h ÷ 3,412";
      status.textContent =
        "Capacity conversion — 1 ton = 12,000 BTU/h = 3.517 kW at standard conditions.";
    } else if (mode === "temperature") {
      let f: number;
      let c: number;
      if (direction === "fahrenheit") {
        f = val;
        c = ((f - 32) * 5) / 9;
      } else {
        c = val;
        f = (c * 9) / 5 + 32;
      }
      resultPrimary.textContent = fmtNum(f, 1) + "°F";
      resultSecondary.textContent = fmtNum(c, 1) + "°C";
      resultTertiary.textContent = "—";
      bdInput.textContent = direction === "fahrenheit" ? val + "°F" : val + "°C";
      bdFormula.textContent = "°C = (°F − 32) × 5/9";
      status.textContent = "Temperature conversion — use for setpoint, line-temp, and saturation checks.";
    } else {
      let inWc: number;
      let pa: number;
      let psi: number;
      let kpa: number;
      if (direction === "inwc") {
        inWc = val;
        pa = inWc * 249;
        psi = inWc * 0.0361;
        kpa = psi * 6.895;
      } else if (direction === "pa") {
        pa = val;
        inWc = pa / 249;
        psi = inWc * 0.0361;
        kpa = psi * 6.895;
      } else if (direction === "psi") {
        psi = val;
        kpa = psi * 6.895;
        inWc = psi / 0.0361;
        pa = inWc * 249;
      } else {
        kpa = val;
        psi = kpa / 6.895;
        inWc = psi / 0.0361;
        pa = inWc * 249;
      }
      resultPrimary.textContent = fmtNum(inWc, 3) + " in. w.c.";
      resultSecondary.textContent = fmtNum(pa, 0) + " Pa";
      resultTertiary.textContent = fmtNum(kpa, 2) + " kPa (" + fmtNum(psi, 2) + " PSI)";
      bdInput.textContent = val + " " + direction;
      bdFormula.textContent = "Pa = in.w.c. × 249 · kPa = PSI × 6.895";
      status.textContent =
        "Pressure conversion — in. w.c. for duct static; PSI/kPa for refrigerant side gauges.";
    }
  }

  function reset(): void {
    modeSelect.value = "capacity";
    valueInput.value = "3";
    (capacityFields.querySelector("select") as HTMLSelectElement).value = "tons";
    (tempFields.querySelector("select") as HTMLSelectElement).value = "fahrenheit";
    (pressureFields.querySelector("select") as HTMLSelectElement).value = "inwc";
    toggleMode();
  }

  modeSelect.addEventListener("change", toggleMode);
  valueInput.addEventListener("input", calculate);
  capacityFields.querySelector("select")?.addEventListener("change", calculate);
  tempFields.querySelector("select")?.addEventListener("change", calculate);
  pressureFields.querySelector("select")?.addEventListener("change", calculate);
  resetBtn?.addEventListener("click", reset);

  toggleMode();
}
