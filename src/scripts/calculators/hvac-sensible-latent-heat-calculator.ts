function fmtBtu(n: number): string {
  return Math.round(n).toLocaleString("en-US") + " BTU/h";
}

function fmtShr(n: number): string {
  return n.toFixed(2);
}

function fmtTemp(n: number): string {
  return Math.round(n) + "°F";
}

function fmtGrains(n: number): string {
  return Math.round(n) + " gr/lb";
}

function evaluateShr(shr: number, qt: number): { status: string; causes: string } {
  if (qt <= 0) {
    return {
      status: "No load",
      causes:
        "Total coil load is zero — check that return is warmer and more humid than supply (cooling mode) and that CFM is greater than zero.",
    };
  }
  if (shr >= 0.75) {
    return {
      status: "Mostly sensible",
      causes:
        "Most capacity goes to temperature change — typical in dry climates or when latent removal is low. Confirm the coil still meets humidity targets; a high SHR can leave the space clammy in humid weather.",
    };
  }
  if (shr >= 0.6) {
    return {
      status: "Balanced",
      causes:
        "A healthy mix of sensible and latent removal — coil is splitting capacity between cooling dry-bulb temperature and pulling moisture. Typical for moderate humidity at design conditions.",
    };
  }
  if (shr >= 0.5) {
    return {
      status: "Latent-heavy",
      causes:
        "More than half the load is latent — humid return air or a wide grain depression across the coil. Expect a lower temperature split for the same total BTU; verify airflow and consider enhanced dehumidification if comfort lags.",
    };
  }
  return {
    status: "Very latent",
    causes:
      "Latent load dominates — very humid conditions, high indoor moisture, or limited sensible split. Check return humidity, ventilation loads, and that CFM is not excessive for the moisture removal needed.",
  };
}

export function initHvacSensibleLatentHeatCalculator(): void {
  const cfmInput = document.getElementById("sl-cfm") as HTMLInputElement | null;
  const returnTInput = document.getElementById("sl-return-t") as HTMLInputElement | null;
  const supplyTInput = document.getElementById("sl-supply-t") as HTMLInputElement | null;
  const returnGrainsInput = document.getElementById("sl-return-grains") as HTMLInputElement | null;
  const supplyGrainsInput = document.getElementById("sl-supply-grains") as HTMLInputElement | null;
  const resetBtn = document.getElementById("resetBtn");
  const qsEl = document.getElementById("sl-qs");
  const qlEl = document.getElementById("sl-ql");
  const qtEl = document.getElementById("sl-qt");
  const shrEl = document.getElementById("sl-shr");
  const status = document.getElementById("sl-status");
  const causes = document.getElementById("sl-causes");
  const bdCfm = document.getElementById("sl-bd-cfm");
  const bdDt = document.getElementById("sl-bd-dt");
  const bdDgrains = document.getElementById("sl-bd-dgrains");
  const bdQs = document.getElementById("sl-bd-qs");
  const bdQl = document.getElementById("sl-bd-ql");

  if (
    !cfmInput ||
    !returnTInput ||
    !supplyTInput ||
    !returnGrainsInput ||
    !supplyGrainsInput ||
    !qsEl ||
    !qlEl ||
    !qtEl ||
    !shrEl ||
    !status ||
    !causes ||
    !bdCfm ||
    !bdDt ||
    !bdDgrains ||
    !bdQs ||
    !bdQl
  ) {
    return;
  }

  function calculate(): void {
    const cfm = Math.max(0, parseFloat(cfmInput.value) || 0);
    const returnT = parseFloat(returnTInput.value) || 0;
    const supplyT = parseFloat(supplyTInput.value) || 0;
    const returnGrains = Math.max(0, parseFloat(returnGrainsInput.value) || 0);
    const supplyGrains = Math.max(0, parseFloat(supplyGrainsInput.value) || 0);

    const deltaT = returnT - supplyT;
    const deltaGrains = returnGrains - supplyGrains;

    const qs = 1.08 * cfm * deltaT;
    const ql = 0.68 * cfm * deltaGrains;
    const qt = qs + ql;
    const shr = qt > 0 ? qs / qt : 0;

    const evaluation = evaluateShr(shr, qt);

    qsEl.textContent = fmtBtu(qs);
    qlEl.textContent = fmtBtu(ql);
    qtEl.textContent = fmtBtu(qt);
    shrEl.textContent = fmtShr(shr);
    status.textContent = evaluation.status;
    causes.textContent = evaluation.causes;

    bdCfm.textContent = cfm.toLocaleString("en-US") + " CFM";
    bdDt.textContent = fmtTemp(deltaT);
    bdDgrains.textContent = fmtGrains(deltaGrains);
    bdQs.textContent = fmtBtu(qs);
    bdQl.textContent = fmtBtu(ql);
  }

  function reset(): void {
    cfmInput.value = "1200";
    returnTInput.value = "75";
    supplyTInput.value = "55";
    returnGrainsInput.value = "110";
    supplyGrainsInput.value = "75";
    calculate();
  }

  cfmInput.addEventListener("input", calculate);
  returnTInput.addEventListener("input", calculate);
  supplyTInput.addEventListener("input", calculate);
  returnGrainsInput.addEventListener("input", calculate);
  supplyGrainsInput.addEventListener("input", calculate);
  resetBtn?.addEventListener("click", reset);

  calculate();
}
