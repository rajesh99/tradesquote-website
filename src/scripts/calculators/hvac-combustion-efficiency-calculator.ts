type FuelType = "naturalGas" | "propane" | "fuelOil";
type TempUnit = "C" | "F";

interface FuelProps {
  f: number;
  latent: number;
}

const FUEL_PROPS: Record<FuelType, FuelProps> = {
  naturalGas: { f: 0.66, latent: 11.0 },
  propane: { f: 0.63, latent: 8.0 },
  fuelOil: { f: 0.68, latent: 0 },
};

function fToCelsius(f: number): number {
  return (f - 32) * (5 / 9);
}

function fmt1(n: number): string {
  return n.toFixed(1) + "%";
}

function fmt0(n: number): string {
  return Math.round(n) + "%";
}

export function initHvacCombustionEfficiencyCalculator(): void {
  const fuelSelect = document.getElementById("ce-fuel") as HTMLSelectElement | null;
  const tempUnitSelect = document.getElementById("ce-temp-unit") as HTMLSelectElement | null;
  const flueTempInput = document.getElementById("ce-flue-temp") as HTMLInputElement | null;
  const airTempInput = document.getElementById("ce-air-temp") as HTMLInputElement | null;
  const o2Input = document.getElementById("ce-o2") as HTMLInputElement | null;
  const resetBtn = document.getElementById("ce-reset");

  const resultEfficiency = document.getElementById("ce-result-efficiency");
  const resultQa = document.getElementById("ce-result-qa");
  const resultExcessAir = document.getElementById("ce-result-excess-air");

  const bdFlue = document.getElementById("ce-bd-flue");
  const bdAir = document.getElementById("ce-bd-air");
  const bdQa = document.getElementById("ce-bd-qa");
  const bdLatent = document.getElementById("ce-bd-latent");
  const bdRad = document.getElementById("ce-bd-rad");

  const warningBox = document.getElementById("ce-warning");
  const warningText = document.getElementById("ce-warning-text");

  if (
    !fuelSelect ||
    !tempUnitSelect ||
    !flueTempInput ||
    !airTempInput ||
    !o2Input ||
    !resultEfficiency ||
    !resultQa ||
    !resultExcessAir ||
    !bdFlue ||
    !bdAir ||
    !bdQa ||
    !bdLatent ||
    !bdRad ||
    !warningBox ||
    !warningText
  ) {
    return;
  }

  function calculate(): void {
    const fuel = (fuelSelect.value as FuelType) in FUEL_PROPS
      ? (fuelSelect.value as FuelType)
      : "naturalGas";
    const unit = tempUnitSelect.value as TempUnit;
    const flueTempRaw = parseFloat(flueTempInput.value) || 0;
    const airTempRaw = parseFloat(airTempInput.value) || 0;
    const o2dry = parseFloat(o2Input.value) || 0;

    const tFG_C = unit === "F" ? fToCelsius(flueTempRaw) : flueTempRaw;
    const tA_C = unit === "F" ? fToCelsius(airTempRaw) : airTempRaw;

    const { f, latent } = FUEL_PROPS[fuel];

    const divisor = 21 - o2dry;
    const qA = divisor > 0 ? (tFG_C - tA_C) * (f / divisor) : 0;
    const efficiency = Math.max(0, 100 - qA - latent - 1.5);
    const excessAir = divisor > 0 ? (o2dry / divisor) * 100 : 0;

    resultEfficiency.textContent = fmt1(efficiency);
    resultQa.textContent = fmt1(qA);
    resultExcessAir.textContent = fmt0(excessAir);

    const tempLabel = unit === "F" ? "°F" : "°C";
    bdFlue.textContent = flueTempRaw.toFixed(1) + tempLabel + " (" + tFG_C.toFixed(1) + "°C)";
    bdAir.textContent = airTempRaw.toFixed(1) + tempLabel + " (" + tA_C.toFixed(1) + "°C)";
    bdQa.textContent = fmt1(qA);
    bdLatent.textContent = fmt1(latent);
    bdRad.textContent = "1.5%";

    // Warnings — CO risk takes priority over thermal performance warning
    if (o2dry <= 1.5) {
      warningText.textContent =
        "Danger: Insufficient excess combustion air. Risk of high carbon monoxide concentration and soot accumulation.";
      warningBox.classList.remove("hidden");
    } else if (tFG_C > 250) {
      warningText.textContent =
        "Thermal performance loss: Elevated exhaust temperatures indicate fouling on heat transfer surfaces or poor baffling.";
      warningBox.classList.remove("hidden");
    } else {
      warningBox.classList.add("hidden");
    }
  }

  function reset(): void {
    fuelSelect.value = "naturalGas";
    tempUnitSelect.value = "C";
    flueTempInput.value = "180";
    airTempInput.value = "20";
    o2Input.value = "4";
    calculate();
  }

  fuelSelect.addEventListener("change", calculate);
  tempUnitSelect.addEventListener("change", calculate);
  flueTempInput.addEventListener("input", calculate);
  airTempInput.addEventListener("input", calculate);
  o2Input.addEventListener("input", calculate);
  resetBtn?.addEventListener("click", reset);

  calculate();
}
