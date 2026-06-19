function fmtBtu(n: number): string {
  return Math.round(n).toLocaleString();
}

function fmtTons(n: number): string {
  return n.toFixed(1) + " tons";
}

function fmtApproach(n: number): string {
  return n.toFixed(1) + "°F";
}

function fmtTemp(n: number): string {
  return Math.round(n) + "°F";
}

export function initHvacCoolingTowerTonnageCalculator(): void {
  const gpmInput = document.getElementById("ct-gpm") as HTMLInputElement | null;
  const hotInput = document.getElementById("ct-hot") as HTMLInputElement | null;
  const coldInput = document.getElementById("ct-cold") as HTMLInputElement | null;
  const wbtInput = document.getElementById("ct-wbt") as HTMLInputElement | null;
  const chillerTonsInput = document.getElementById("ct-chiller-tons") as HTMLInputElement | null;
  const copInput = document.getElementById("ct-cop") as HTMLInputElement | null;
  const resetBtn = document.getElementById("ct-reset");

  const resultRejection = document.getElementById("ct-result-rejection");
  const resultTons = document.getElementById("ct-result-tons");
  const resultApproach = document.getElementById("ct-result-approach");
  const resultRequired = document.getElementById("ct-result-required");
  const statusEl = document.getElementById("ct-status");
  const warningBox = document.getElementById("ct-warning");
  const warningText = document.getElementById("ct-warning-text");

  const bdGpm = document.getElementById("ct-bd-gpm");
  const bdRange = document.getElementById("ct-bd-range");
  const bdRejection = document.getElementById("ct-bd-rejection");
  const bdApproach = document.getElementById("ct-bd-approach");
  const bdRequired = document.getElementById("ct-bd-required");

  if (
    !gpmInput ||
    !hotInput ||
    !coldInput ||
    !wbtInput ||
    !chillerTonsInput ||
    !copInput ||
    !resultRejection ||
    !resultTons ||
    !resultApproach ||
    !resultRequired ||
    !statusEl ||
    !warningBox ||
    !warningText ||
    !bdGpm ||
    !bdRange ||
    !bdRejection ||
    !bdApproach ||
    !bdRequired
  ) {
    return;
  }

  function calculate(): void {
    const gpm = parseFloat(gpmInput!.value) || 0;
    const tHot = parseFloat(hotInput!.value) || 0;
    const tCold = parseFloat(coldInput!.value) || 0;
    const wbt = parseFloat(wbtInput!.value) || 0;
    const chillerTons = parseFloat(chillerTonsInput!.value) || 0;
    const cop = parseFloat(copInput!.value) || 1;

    const tempRange = tHot - tCold;
    const qRejection = 500 * gpm * tempRange;
    const towerTons = qRejection / 12000;
    const approach = tCold - wbt;

    const qChillerBtu = chillerTons * 12000;
    const qCompression = qChillerBtu / cop;
    const qRequired = qChillerBtu + qCompression;
    const requiredTons = qRequired / 12000;

    // Update main result displays
    resultRejection!.textContent = fmtBtu(qRejection);
    resultTons!.textContent = fmtTons(towerTons);
    resultApproach!.textContent = fmtApproach(approach);
    resultRequired!.textContent = fmtTons(requiredTons);

    // Update breakdown
    bdGpm!.textContent = gpm.toLocaleString() + " GPM";
    bdRange!.textContent = fmtTemp(tempRange);
    bdRejection!.textContent = fmtBtu(qRejection) + " BTU/h";
    bdApproach!.textContent = fmtApproach(approach);
    bdRequired!.textContent = fmtBtu(qRequired) + " BTU/h";

    // Determine warnings — collect all that apply
    const warnings: string[] = [];

    if (approach < 5) {
      warnings.push(
        "Thermodynamic design error: An approach of less than 5°F is extremely difficult to achieve. Sizing a tower for this condition requires an oversized heat exchange fill area, high fan energy, and represents high operational risks."
      );
    }

    if (qRejection < qRequired) {
      warnings.push(
        "Under-capacity warning: Tower heat rejection capacity is lower than the calculated chiller reject load. High condenser water temperatures will cause a compressor high-pressure trip."
      );
    }

    // Determine status
    let status: string;
    if (approach < 5) {
      status = "Approach Too Tight";
    } else if (qRejection < qRequired) {
      status = "Under-Capacity";
    } else {
      status = "Adequate";
    }

    statusEl!.textContent = status;

    // Show/hide warning box
    if (warnings.length > 0) {
      warningBox!.classList.remove("hidden");
      warningText!.textContent = warnings.join(" ");
    } else {
      warningBox!.classList.add("hidden");
      warningText!.textContent = "—";
    }
  }

  function reset(): void {
    gpmInput!.value = "300";
    hotInput!.value = "95";
    coldInput!.value = "85";
    wbtInput!.value = "78";
    chillerTonsInput!.value = "200";
    copInput!.value = "5.0";
    calculate();
  }

  gpmInput.addEventListener("input", calculate);
  hotInput.addEventListener("input", calculate);
  coldInput.addEventListener("input", calculate);
  wbtInput.addEventListener("input", calculate);
  chillerTonsInput.addEventListener("input", calculate);
  copInput.addEventListener("input", calculate);
  resetBtn?.addEventListener("click", reset);

  calculate();
}
