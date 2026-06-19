function fmt(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

const STD_SIZES = [40000, 60000, 80000, 100000, 120000, 140000];

function recommendation(inputBtu: number): string {
  if (inputBtu <= 0) return "—";
  const std = STD_SIZES.find((s) => s >= inputBtu);
  if (!std) return "Two-stage system or multiple furnaces (140k+)";
  return `${std.toLocaleString("en-US")} BTU input furnace`;
}

export function initHvacFurnaceBtuCalculator(): void {
  const area = document.getElementById("area") as HTMLInputElement | null;
  const areaRange = document.getElementById("areaRange") as HTMLInputElement | null;
  const climate = document.getElementById("climate") as HTMLSelectElement | null;
  const insulation = document.getElementById("insulation") as HTMLSelectElement | null;
  const afue = document.getElementById("afue") as HTMLSelectElement | null;
  const resetBtn = document.getElementById("resetBtn");
  const load = document.getElementById("loadResult");
  const input = document.getElementById("inputResult");
  const perSqft = document.getElementById("perSqftResult");
  const unit = document.getElementById("unitResult");
  const bdBase = document.getElementById("bd-base");
  const bdInsulation = document.getElementById("bd-insulation");
  const bdLoad = document.getElementById("bd-load");
  const bdAfue = document.getElementById("bd-afue");
  const bdInput = document.getElementById("bd-input");

  if (
    !area ||
    !areaRange ||
    !climate ||
    !insulation ||
    !afue ||
    !resetBtn ||
    !load ||
    !input ||
    !perSqft ||
    !unit ||
    !bdBase ||
    !bdInsulation ||
    !bdLoad ||
    !bdAfue ||
    !bdInput
  ) {
    return;
  }

  function calculate(): void {
    const areaVal = parseFloat(area.value) || 0;
    const factor = parseFloat(climate.value) || 45;
    const insulationVal = parseFloat(insulation.value) || 1;
    const afueVal = parseFloat(afue.value) || 0.95;

    const baseLoad = areaVal * factor;
    let loadVal = baseLoad * insulationVal;
    loadVal = Math.round(loadVal / 500) * 500;
    const inputExact = loadVal / afueVal;
    const inputRounded = Math.round(inputExact / 500) * 500;

    load.textContent = fmt(loadVal);
    input.textContent = fmt(inputRounded) + " BTU";
    perSqft.textContent = (areaVal > 0 ? Math.round(loadVal / areaVal) : 0) + " BTU";
    unit.textContent = recommendation(inputExact);

    bdBase.textContent = fmt(baseLoad) + " BTU";
    bdInsulation.textContent = "×" + insulationVal.toFixed(2);
    bdLoad.textContent = fmt(loadVal) + " BTU/hr";
    bdAfue.textContent = "÷ " + afueVal.toFixed(2);
    bdInput.textContent = fmt(inputRounded) + " BTU/hr";
  }

  area.addEventListener("input", () => {
    areaRange.value = area.value;
    calculate();
  });
  areaRange.addEventListener("input", () => {
    area.value = areaRange.value;
    calculate();
  });

  [climate, insulation, afue].forEach((el) => el.addEventListener("input", calculate));

  resetBtn.addEventListener("click", () => {
    area.value = "1500";
    areaRange.value = "1500";
    climate.value = "45";
    insulation.value = "1.0";
    afue.value = "0.95";
    calculate();
  });

  calculate();
}
