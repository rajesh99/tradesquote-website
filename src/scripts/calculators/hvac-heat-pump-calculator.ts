function fmt(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

function round500(x: number): number {
  return Math.round(x / 500) * 500;
}

interface ClimateData {
  heat: number;
  coolF: number;
}

const CLIMATE: Record<string, ClimateData> = {
  hot: { heat: 20, coolF: 1.2 },
  warm: { heat: 25, coolF: 1.1 },
  mixed: { heat: 30, coolF: 1.0 },
  cold: { heat: 35, coolF: 0.95 },
  verycold: { heat: 40, coolF: 0.9 },
};

export function initHvacHeatPumpCalculator(): void {
  const area = document.getElementById("hp-area") as HTMLInputElement | null;
  const areaRange = document.getElementById("hp-areaRange") as HTMLInputElement | null;
  const climate = document.getElementById("hp-climate") as HTMLSelectElement | null;
  const insulation = document.getElementById("hp-insulation") as HTMLSelectElement | null;
  const ceiling = document.getElementById("hp-ceiling") as HTMLSelectElement | null;
  const resetBtn = document.getElementById("resetBtn");

  const sizeOut = document.getElementById("hp-size");
  const coolOut = document.getElementById("hp-cool");
  const heatOut = document.getElementById("hp-heat");
  const noteOut = document.getElementById("hp-note");

  const bdArea = document.getElementById("hp-bd-area");
  const bdCoolRate = document.getElementById("hp-bd-coolrate");
  const bdHeatRate = document.getElementById("hp-bd-heatrate");
  const bdCeiling = document.getElementById("hp-bd-ceiling");
  const bdInsul = document.getElementById("hp-bd-insul");

  if (
    !area ||
    !areaRange ||
    !climate ||
    !insulation ||
    !ceiling ||
    !resetBtn ||
    !sizeOut ||
    !coolOut ||
    !heatOut ||
    !noteOut ||
    !bdArea ||
    !bdCoolRate ||
    !bdHeatRate ||
    !bdCeiling ||
    !bdInsul
  ) {
    return;
  }

  function calculate(): void {
    const areaVal = parseFloat(area.value) || 0;
    const ceilingVal = parseFloat(ceiling.value) || 8;
    const insul = parseFloat(insulation.value) || 1;
    const c = CLIMATE[climate.value] || CLIMATE.mixed;
    const heat = c.heat;
    const coolF = c.coolF;

    const ceilingFactor = ceilingVal / 8;

    const coolBtu = round500(areaVal * 20 * ceilingFactor * insul * coolF);
    const heatBtu = round500(areaVal * heat * ceilingFactor * insul);
    const coolTons = coolBtu / 12000;

    const std = [1.5, 2, 2.5, 3, 3.5, 4, 5];
    const recTons = std.find((t) => t >= coolTons);
    const recLabel = recTons ? `${recTons} tons` : "5+ (multiple units)";

    const ratio = coolBtu > 0 ? heatBtu / coolBtu : 1;
    let note: string;
    if (ratio <= 1.15) {
      note =
        "Heating and cooling loads are well matched — one right-sized heat pump covers both comfortably.";
    } else if (ratio <= 1.6) {
      note =
        "Heating load is moderately higher than cooling (typical in mixed climates) — size to the cooling load shown and cover the heating shortfall with a variable-speed/cold-climate unit or modest backup heat.";
    } else {
      note =
        "Heating load far exceeds cooling (cold climate) — choose a cold-climate heat pump sized toward the heating load and/or plan auxiliary backup heat. Sizing to cooling alone leaves a gap below the balance point.";
    }

    sizeOut.textContent = recLabel;
    coolOut.textContent = `${fmt(coolBtu)} BTU`;
    heatOut.textContent = `${fmt(heatBtu)} BTU`;
    noteOut.textContent = note;

    bdArea.textContent = `${fmt(areaVal)} sq ft`;
    bdCoolRate.textContent = `20 BTU × ${coolF.toFixed(2)} climate`;
    bdHeatRate.textContent = `${heat} BTU/sq ft`;
    bdCeiling.textContent = `×${ceilingFactor.toFixed(3)}`;
    bdInsul.textContent = `×${insul.toFixed(2)}`;
  }

  area.addEventListener("input", () => {
    areaRange.value = area.value;
    calculate();
  });
  areaRange.addEventListener("input", () => {
    area.value = areaRange.value;
    calculate();
  });

  [climate, insulation, ceiling].forEach((el) => el.addEventListener("input", calculate));

  resetBtn.addEventListener("click", () => {
    area.value = "1800";
    areaRange.value = "1800";
    climate.value = "mixed";
    insulation.value = "1.0";
    ceiling.value = "8";
    calculate();
  });

  calculate();
}
