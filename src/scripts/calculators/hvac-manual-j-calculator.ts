function fmt(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

function round500(n: number): number {
  return Math.round(n / 500) * 500;
}

type ClimateFactor = { cool: number; heat: number };

const CLIMATE: Record<string, ClimateFactor> = {
  hot: { cool: 1.3, heat: 18 },
  warm: { cool: 1.15, heat: 25 },
  mixed: { cool: 1.0, heat: 32 },
  cool: { cool: 0.88, heat: 42 },
  cold: { cool: 0.78, heat: 52 },
};
const INSUL: Record<string, number> = { poor: 1.15, average: 1.0, good: 0.88 };
const CEILING: Record<string, number> = { "8": 1.0, "9": 1.06, "10": 1.12 };
const SUN: Record<string, number> = { shaded: 0.9, average: 1.0, sunny: 1.15 };

export function initHvacManualJCalculator(): void {
  const area = document.getElementById("mjArea") as HTMLInputElement | null;
  const climate = document.getElementById("mjClimate") as HTMLSelectElement | null;
  const insul = document.getElementById("mjInsul") as HTMLSelectElement | null;
  const ceiling = document.getElementById("mjCeiling") as HTMLSelectElement | null;
  const sun = document.getElementById("mjSun") as HTMLSelectElement | null;
  const resetBtn = document.getElementById("resetBtn");
  const coolResult = document.getElementById("coolResult");
  const coolTons = document.getElementById("coolTons");
  const heatResult = document.getElementById("heatResult");
  const sysResult = document.getElementById("sysResult");
  const bdArea = document.getElementById("bd-area");
  const bdClimate = document.getElementById("bd-climate");
  const bdInsul = document.getElementById("bd-insul");
  const bdCeiling = document.getElementById("bd-ceiling");
  const bdSun = document.getElementById("bd-sun");
  const bdCool = document.getElementById("bd-cool");
  const bdHeat = document.getElementById("bd-heat");

  if (
    !area ||
    !climate ||
    !insul ||
    !ceiling ||
    !sun ||
    !resetBtn ||
    !coolResult ||
    !coolTons ||
    !heatResult ||
    !sysResult ||
    !bdArea ||
    !bdClimate ||
    !bdInsul ||
    !bdCeiling ||
    !bdSun ||
    !bdCool ||
    !bdHeat
  ) {
    return;
  }

  function calculate(): void {
    const sqft = parseFloat(area.value) || 2000;
    const cl = CLIMATE[climate.value] || CLIMATE.mixed;
    const ins = INSUL[insul.value] ?? 1;
    const ceil = CEILING[ceiling.value] ?? 1;
    const sn = SUN[sun.value] ?? 1;

    const coolBtu = sqft * 22 * cl.cool * ins * ceil * sn;
    const heatBtu = sqft * cl.heat * ins * ceil;
    const tons = coolBtu / 12000;
    const recTons = Math.round(tons * 2) / 2;

    coolResult.textContent = fmt(round500(coolBtu)) + " BTU/hr";
    coolTons.textContent = "≈ " + tons.toFixed(1) + " tons cooling";
    heatResult.textContent = fmt(round500(heatBtu)) + " BTU/hr";
    sysResult.textContent = recTons.toFixed(1) + " tons";

    bdArea.textContent = fmt(sqft) + " sq ft";
    bdClimate.textContent = "cool ×" + cl.cool.toFixed(2) + " · heat " + cl.heat + " BTU/ft²";
    bdInsul.textContent = "×" + ins.toFixed(2);
    bdCeiling.textContent = "×" + ceil.toFixed(2);
    bdSun.textContent = "×" + sn.toFixed(2);
    bdCool.textContent = fmt(round500(coolBtu)) + " BTU";
    bdHeat.textContent = fmt(round500(heatBtu)) + " BTU";
  }

  [area, climate, insul, ceiling, sun].forEach((el) =>
    el.addEventListener("input", calculate),
  );

  resetBtn.addEventListener("click", () => {
    area.value = "2000";
    climate.value = "mixed";
    insul.value = "average";
    ceiling.value = "8";
    sun.value = "average";
    calculate();
  });

  calculate();
}
