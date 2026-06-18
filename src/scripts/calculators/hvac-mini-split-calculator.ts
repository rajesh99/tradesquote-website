function fmt(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

const standardHeads = [6000, 9000, 12000, 15000, 18000, 24000, 30000, 36000];

const tonByHead: Record<number, number> = {
  6000: 0.5,
  9000: 0.75,
  12000: 1.0,
  15000: 1.25,
  18000: 1.5,
  24000: 2.0,
  30000: 2.5,
  36000: 3.0,
};

export function initHvacMiniSplitCalculator(): void {
  const area = document.getElementById("ms-area") as HTMLInputElement | null;
  const areaRange = document.getElementById("ms-areaRange") as HTMLInputElement | null;
  const insul = document.getElementById("ms-insul") as HTMLSelectElement | null;
  const climate = document.getElementById("ms-climate") as HTMLSelectElement | null;
  const ceiling = document.getElementById("ms-ceiling") as HTMLSelectElement | null;
  const sun = document.getElementById("ms-sun") as HTMLSelectElement | null;
  const kitchen = document.getElementById("ms-kitchen") as HTMLInputElement | null;
  const resetBtn = document.getElementById("resetBtn");

  const rec = document.getElementById("ms-rec");
  const load = document.getElementById("ms-load");
  const tons = document.getElementById("ms-tons");
  const covers = document.getElementById("ms-covers");
  const bdBase = document.getElementById("ms-bd-base");
  const bdClimate = document.getElementById("ms-bd-climate");
  const bdCeiling = document.getElementById("ms-bd-ceiling");
  const bdSun = document.getElementById("ms-bd-sun");
  const bdKitchen = document.getElementById("ms-bd-kitchen");
  const bdTotal = document.getElementById("ms-bd-total");

  if (
    !area ||
    !areaRange ||
    !insul ||
    !climate ||
    !ceiling ||
    !sun ||
    !kitchen ||
    !resetBtn ||
    !rec ||
    !load ||
    !tons ||
    !covers ||
    !bdBase ||
    !bdClimate ||
    !bdCeiling ||
    !bdSun ||
    !bdKitchen ||
    !bdTotal
  ) {
    return;
  }

  function calculate(): void {
    const areaVal = parseFloat(area.value) || 0;
    const basePerSqft = parseFloat(insul.value) || 25;
    const climateVal = parseFloat(climate.value) || 1;
    const ceilingF = parseFloat(ceiling.value) || 1;
    const sunVal = parseFloat(sun.value) || 1;
    const kitchenAdd = kitchen.checked ? 4000 : 0;

    const base = areaVal * basePerSqft;
    const loadRaw = base * ceilingF * climateVal * sunVal + kitchenAdd;
    const loadRounded = Math.round(loadRaw / 500) * 500;

    const head = standardHeads.find((h) => h >= loadRounded);
    const recStr = head ? `${fmt(head)} BTU` : "Multiple heads / multi-zone (36,000+ BTU)";

    rec.textContent = recStr;
    load.textContent = `${fmt(loadRounded)} BTU/hr`;
    tons.textContent = `${(loadRounded / 12000).toFixed(1)} ton`;

    if (head) {
      const headTons = tonByHead[head];
      let coversStr = `A ${fmt(head)} BTU (${headTons}-ton) single-zone head suits a room this size.`;
      if (head >= 24000) {
        coversStr += " — for one open space consider splitting into two zones.";
      }
      covers.textContent = coversStr;
    } else {
      covers.textContent =
        "This space exceeds a single head — size each room and choose a multi-zone condenser (36,000+ BTU).";
    }

    bdBase.textContent = `${fmt(base)} BTU`;
    bdClimate.textContent = `×${climateVal.toFixed(2)}`;
    bdCeiling.textContent = `×${ceilingF.toFixed(3)}`;
    bdSun.textContent = `×${sunVal.toFixed(2)}`;
    bdKitchen.textContent = kitchenAdd ? "+4,000 BTU" : "—";
    bdTotal.textContent = `${fmt(loadRounded)} BTU/hr`;
  }

  area.addEventListener("input", () => {
    areaRange.value = area.value;
    calculate();
  });
  areaRange.addEventListener("input", () => {
    area.value = areaRange.value;
    calculate();
  });

  [insul, climate, ceiling, sun, kitchen].forEach((el) =>
    el.addEventListener("input", calculate),
  );

  resetBtn.addEventListener("click", () => {
    area.value = "400";
    areaRange.value = "400";
    insul.value = "25";
    climate.value = "1.0";
    ceiling.value = "1.0";
    sun.value = "1.0";
    kitchen.checked = false;
    calculate();
  });

  calculate();
}
