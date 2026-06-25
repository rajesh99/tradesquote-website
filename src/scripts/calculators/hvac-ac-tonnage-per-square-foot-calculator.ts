function fmt(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

function round500(n: number): number {
  return Math.round(n / 500) * 500;
}

const BTU_PER_SQFT: Record<string, number> = {
  hot: 28,
  warm: 24,
  mixed: 20,
  cool: 17,
  cold: 15,
};

export function initHvacAcTonnagePerSquareFootCalculator(): void {
  const area = document.getElementById("acsfArea") as HTMLInputElement | null;
  const climate = document.getElementById("acsfClimate") as HTMLSelectElement | null;
  const resetBtn = document.getElementById("resetBtn");
  const tonsResult = document.getElementById("tonsResult");
  const tonsExact = document.getElementById("tonsExact");
  const btuResult = document.getElementById("btuResult");
  const sqftPerTon = document.getElementById("sqftPerTon");
  const bdArea = document.getElementById("bd-area");
  const bdRate = document.getElementById("bd-rate");
  const bdBtu = document.getElementById("bd-btu");
  const bdTons = document.getElementById("bd-tons");

  if (
    !area ||
    !climate ||
    !resetBtn ||
    !tonsResult ||
    !tonsExact ||
    !btuResult ||
    !sqftPerTon ||
    !bdArea ||
    !bdRate ||
    !bdBtu ||
    !bdTons
  ) {
    return;
  }

  function calculate(): void {
    const sqft = parseFloat(area.value) || 1500;
    const rate = BTU_PER_SQFT[climate.value] || 22;
    const btu = sqft * rate;
    const tons = btu / 12000;
    const recTons = Math.round(tons * 2) / 2;
    const sqftTon = Math.round(12000 / rate);

    tonsResult.textContent = recTons.toFixed(1) + " tons";
    tonsExact.textContent = "≈ " + tons.toFixed(2) + " tons exact";
    btuResult.textContent = fmt(round500(btu)) + " BTU/hr";
    sqftPerTon.textContent = "≈ " + sqftTon + " sq ft / ton";

    bdArea.textContent = fmt(sqft) + " sq ft";
    bdRate.textContent = rate + " BTU/ft²";
    bdBtu.textContent = fmt(round500(btu)) + " BTU";
    bdTons.textContent = tons.toFixed(2) + " tons";
  }

  [area, climate].forEach((el) => el.addEventListener("input", calculate));

  resetBtn.addEventListener("click", () => {
    area.value = "1500";
    climate.value = "mixed";
    calculate();
  });

  calculate();
}
