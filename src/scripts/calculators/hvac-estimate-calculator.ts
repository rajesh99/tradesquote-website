function fmt(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

function usd(n: number): string {
  return "$" + fmt(n);
}

export function initHvacEstimateCalculator(): void {
  const hours = document.getElementById("estHours") as HTMLInputElement | null;
  const rate = document.getElementById("estRate") as HTMLInputElement | null;
  const equip = document.getElementById("estEquip") as HTMLInputElement | null;
  const mat = document.getElementById("estMat") as HTMLInputElement | null;
  const oh = document.getElementById("estOh") as HTMLInputElement | null;
  const margin = document.getElementById("estMargin") as HTMLInputElement | null;
  const resetBtn = document.getElementById("resetBtn");

  const out = {
    price: document.getElementById("priceResult"),
    profit: document.getElementById("profitResult"),
    be: document.getElementById("beResult"),
    marginNote: document.getElementById("marginNote"),
    marginLabel: document.getElementById("marginLabel"),
    bdLabor: document.getElementById("bd-labor"),
    bdEquip: document.getElementById("bd-equip"),
    bdMat: document.getElementById("bd-mat"),
    bdOh: document.getElementById("bd-oh"),
    bdBe: document.getElementById("bd-be"),
    bdMargin: document.getElementById("bd-margin"),
    bdPrice: document.getElementById("bd-price"),
  };

  if (
    !hours ||
    !rate ||
    !equip ||
    !mat ||
    !oh ||
    !margin ||
    !resetBtn ||
    !out.price ||
    !out.profit ||
    !out.be ||
    !out.marginNote ||
    !out.marginLabel ||
    !out.bdLabor ||
    !out.bdEquip ||
    !out.bdMat ||
    !out.bdOh ||
    !out.bdBe ||
    !out.bdMargin ||
    !out.bdPrice
  ) {
    return;
  }

  function calculate(): void {
    const hoursVal = parseFloat(hours.value) || 0;
    const rateVal = parseFloat(rate.value) || 0;
    const equipVal = parseFloat(equip.value) || 0;
    const matVal = parseFloat(mat.value) || 0;
    const ohPct = (parseFloat(oh.value) || 0) / 100;
    const marginPct = (parseFloat(margin.value) || 0) / 100;

    const labor = hoursVal * rateVal;
    const direct = labor + equipVal + matVal;
    const overhead = direct * ohPct;
    const breakEven = direct + overhead;
    const price = marginPct < 1 ? breakEven / (1 - marginPct) : breakEven;
    const profit = price - breakEven;
    const markupPrice = breakEven * (1 + marginPct);

    out.marginLabel.textContent = Math.round(marginPct * 100) + "%";
    out.price.textContent = usd(price);
    out.profit.textContent = usd(profit);
    out.be.textContent = usd(breakEven);
    out.marginNote.textContent =
      marginPct > 0
        ? `${Math.round(marginPct * 100)}% true margin (markup would quote ${usd(markupPrice)})`
        : "No margin — quoting at break-even";

    out.bdLabor.textContent = usd(labor);
    out.bdEquip.textContent = usd(equipVal);
    out.bdMat.textContent = usd(matVal);
    out.bdOh.textContent = "+" + usd(overhead);
    out.bdBe.textContent = usd(breakEven);
    out.bdMargin.textContent = "÷ " + (1 - marginPct).toFixed(2);
    out.bdPrice.textContent = usd(price);
  }

  [hours, rate, equip, mat, oh, margin].forEach((el) => el.addEventListener("input", calculate));

  resetBtn.addEventListener("click", () => {
    hours.value = "16";
    rate.value = "100";
    equip.value = "4000";
    mat.value = "800";
    oh.value = "15";
    margin.value = "20";
    calculate();
  });

  calculate();
}
