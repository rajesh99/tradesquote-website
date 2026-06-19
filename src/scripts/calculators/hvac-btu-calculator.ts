function fmt(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

function recommendation(btu: number): string {
  if (btu <= 0) return "—";
  if (btu < 12000) {
    const sizes = [5000, 6000, 8000, 10000, 12000];
    const s = sizes.find((x) => x >= btu) || 12000;
    return `${s.toLocaleString()} BTU window or mini-split unit`;
  }
  const tons = btu / 12000;
  const std = [1, 1.5, 2, 2.5, 3, 3.5, 4, 5];
  const rec = std.find((t) => t >= tons);
  if (!rec) return "Multi-zone system or multiple units (5+ tons)";
  return `${rec}-ton AC or heat pump system`;
}

export function initHvacBtuCalculator(): void {
  const area = document.getElementById("area") as HTMLInputElement | null;
  const areaRange = document.getElementById("areaRange") as HTMLInputElement | null;
  const ceiling = document.getElementById("ceiling") as HTMLSelectElement | null;
  const climate = document.getElementById("climate") as HTMLSelectElement | null;
  const sun = document.getElementById("sun") as HTMLSelectElement | null;
  const insulation = document.getElementById("insulation") as HTMLSelectElement | null;
  const occupants = document.getElementById("occupants") as HTMLInputElement | null;
  const kitchen = document.getElementById("kitchen") as HTMLInputElement | null;
  const resetBtn = document.getElementById("resetBtn");

  const btu = document.getElementById("btuResult");
  const tons = document.getElementById("tonsResult");
  const perSqft = document.getElementById("perSqftResult");
  const unit = document.getElementById("unitResult");
  const bdBase = document.getElementById("bd-base");
  const bdClimate = document.getElementById("bd-climate");
  const bdSun = document.getElementById("bd-sun");
  const bdInsulation = document.getElementById("bd-insulation");
  const bdOccupants = document.getElementById("bd-occupants");
  const bdKitchen = document.getElementById("bd-kitchen");
  const bdTotal = document.getElementById("bd-total");

  if (
    !area ||
    !areaRange ||
    !ceiling ||
    !climate ||
    !sun ||
    !insulation ||
    !occupants ||
    !kitchen ||
    !resetBtn ||
    !btu ||
    !tons ||
    !perSqft ||
    !unit ||
    !bdBase ||
    !bdClimate ||
    !bdSun ||
    !bdInsulation ||
    !bdOccupants ||
    !bdKitchen ||
    !bdTotal
  ) {
    return;
  }

  function calculate(): void {
    const areaVal = parseFloat(area.value) || 0;
    const ceilingVal = parseFloat(ceiling.value) || 8;
    const climateVal = parseFloat(climate.value) || 1;
    const sunVal = parseFloat(sun.value) || 1;
    const insulationVal = parseFloat(insulation.value) || 1;
    const occupantsVal = parseInt(occupants.value, 10) || 0;
    const kitchenChecked = kitchen.checked;

    const ceilingFactor = ceilingVal / 8;
    const baseLoad = areaVal * 20 * ceilingFactor;
    const adjusted = baseLoad * climateVal * sunVal * insulationVal;
    const occupantAdd = Math.max(0, occupantsVal - 2) * 600;
    const kitchenAdd = kitchenChecked ? 4000 : 0;

    let total = adjusted + occupantAdd + kitchenAdd;
    total = Math.round(total / 500) * 500;

    btu.textContent = fmt(total);
    tons.textContent = (total > 0 ? (total / 12000).toFixed(1) : "0") + " tons";
    perSqft.textContent = (areaVal > 0 ? Math.round(total / areaVal) : 0) + " BTU";
    unit.textContent = recommendation(total);

    bdBase.textContent = fmt(baseLoad) + " BTU";
    bdClimate.textContent = "×" + climateVal.toFixed(2);
    bdSun.textContent = "×" + sunVal.toFixed(2);
    bdInsulation.textContent = "×" + insulationVal.toFixed(2);
    bdOccupants.textContent = occupantAdd > 0 ? "+" + fmt(occupantAdd) + " BTU" : "—";
    bdKitchen.textContent = kitchenAdd > 0 ? "+4,000 BTU" : "—";
    bdTotal.textContent = fmt(total) + " BTU/hr";
  }

  area.addEventListener("input", () => {
    areaRange.value = area.value;
    calculate();
  });
  areaRange.addEventListener("input", () => {
    area.value = areaRange.value;
    calculate();
  });

  [ceiling, climate, sun, insulation, occupants, kitchen].forEach((el) =>
    el.addEventListener("input", calculate),
  );

  resetBtn.addEventListener("click", () => {
    area.value = "600";
    areaRange.value = "600";
    ceiling.value = "8";
    climate.value = "1.0";
    sun.value = "1.0";
    insulation.value = "1.0";
    occupants.value = "2";
    kitchen.checked = false;
    calculate();
  });

  calculate();
}
