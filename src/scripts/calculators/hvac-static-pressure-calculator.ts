function fmtPressure(n: number): string {
  return n.toFixed(2) + " in. w.c.";
}

function fmtPct(n: number): string {
  return Math.round(n) + "%";
}

function evaluateTesp(tesp: number, maxTesp: number): {
  status: string;
  pct: number;
  causes: string;
} {
  const pct = maxTesp > 0 ? (tesp / maxTesp) * 100 : 0;

  if (tesp > maxTesp) {
    return {
      status: "Over limit",
      pct,
      causes:
        "TESP exceeds the equipment rating — dirty or oversized filter, collapsed flex duct, closed dampers, undersized return, or blower speed mismatch. Reduce restriction before running hard.",
    };
  }
  if (tesp > maxTesp * 0.9) {
    return {
      status: "Borderline",
      pct,
      causes:
        "Within 90–100% of the rated TESP — system is working but has little headroom. Check filter condition, return grille area, and duct transitions; a small restriction can push you over limit.",
    };
  }
  return {
    status: "Healthy",
    pct,
    causes:
      "TESP is comfortably below the equipment maximum — blower and duct system have adequate headroom for normal filter loading and seasonal changes.",
  };
}

export function initHvacStaticPressureCalculator(): void {
  const supplyInput = document.getElementById("sp-supply") as HTMLInputElement | null;
  const returnInput = document.getElementById("sp-return") as HTMLInputElement | null;
  const maxInput = document.getElementById("sp-max") as HTMLInputElement | null;
  const resetBtn = document.getElementById("resetBtn");
  const result = document.getElementById("sp-result");
  const status = document.getElementById("sp-status");
  const pct = document.getElementById("sp-pct");
  const causes = document.getElementById("sp-causes");
  const bdSupply = document.getElementById("sp-bd-supply");
  const bdReturn = document.getElementById("sp-bd-return");
  const bdTotal = document.getElementById("sp-bd-total");
  const bdMax = document.getElementById("sp-bd-max");

  if (
    !supplyInput ||
    !returnInput ||
    !maxInput ||
    !result ||
    !status ||
    !pct ||
    !causes ||
    !bdSupply ||
    !bdReturn ||
    !bdTotal ||
    !bdMax
  ) {
    return;
  }

  function calculate(): void {
    const supply = Math.max(0, parseFloat(supplyInput.value) || 0);
    const returnStatic = Math.max(0, parseFloat(returnInput.value) || 0);
    const maxTesp = Math.max(0.01, parseFloat(maxInput.value) || 0.5);
    const tesp = supply + returnStatic;

    const evaluation = evaluateTesp(tesp, maxTesp);

    result.textContent = fmtPressure(tesp);
    status.textContent = evaluation.status;
    pct.textContent = fmtPct(evaluation.pct) + " of max";
    causes.textContent = evaluation.causes;

    bdSupply.textContent = fmtPressure(supply);
    bdReturn.textContent = fmtPressure(returnStatic);
    bdTotal.textContent = fmtPressure(tesp);
    bdMax.textContent = fmtPressure(maxTesp);
  }

  function reset(): void {
    supplyInput.value = "0.25";
    returnInput.value = "0.20";
    maxInput.value = "0.5";
    calculate();
  }

  supplyInput.addEventListener("input", calculate);
  returnInput.addEventListener("input", calculate);
  maxInput.addEventListener("input", calculate);
  resetBtn?.addEventListener("click", reset);

  calculate();
}
