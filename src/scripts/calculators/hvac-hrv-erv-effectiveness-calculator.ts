function fmtTemp(n: number): string {
  return Math.round(n) + "°F";
}

function fmtPercent(n: number, decimals = 1): string {
  return n.toFixed(decimals) + "%";
}

function getStatusLabel(effectiveness: number): string {
  if (effectiveness < 65) return "Basic";
  if (effectiveness < 75) return "Standard";
  if (effectiveness < 82) return "Good";
  if (effectiveness <= 90) return "Excellent";
  return "Premium";
}

export function initHvacHrvErvEffectivenessCalculator(): void {
  const typeSelect = document.getElementById("hrv-type") as HTMLSelectElement | null;
  const vsInput = document.getElementById("hrv-vs") as HTMLInputElement | null;
  const veInput = document.getElementById("hrv-ve") as HTMLInputElement | null;
  const t1Input = document.getElementById("hrv-t1") as HTMLInputElement | null;
  const t2Input = document.getElementById("hrv-t2") as HTMLInputElement | null;
  const t3Input = document.getElementById("hrv-t3") as HTMLInputElement | null;
  const resetBtn = document.getElementById("hrv-reset");

  const resultEffectiveness = document.getElementById("hrv-result-effectiveness");
  const resultVmin = document.getElementById("hrv-result-vmin");
  const resultBalance = document.getElementById("hrv-result-balance");
  const statusEl = document.getElementById("hrv-status");
  const warningBox = document.getElementById("hrv-warning");
  const warningText = document.getElementById("hrv-warning-text");

  const bdVs = document.getElementById("hrv-bd-vs");
  const bdVe = document.getElementById("hrv-bd-ve");
  const bdVmin = document.getElementById("hrv-bd-vmin");
  const bdT1 = document.getElementById("hrv-bd-t1");
  const bdT2 = document.getElementById("hrv-bd-t2");
  const bdT3 = document.getElementById("hrv-bd-t3");

  if (
    !typeSelect ||
    !vsInput ||
    !veInput ||
    !t1Input ||
    !t2Input ||
    !t3Input ||
    !resultEffectiveness ||
    !resultVmin ||
    !resultBalance ||
    !statusEl ||
    !warningBox ||
    !warningText ||
    !bdVs ||
    !bdVe ||
    !bdVmin ||
    !bdT1 ||
    !bdT2 ||
    !bdT3
  ) {
    return;
  }

  function calculate(): void {
    const vs = parseFloat(vsInput.value) || 0;
    const ve = parseFloat(veInput.value) || 0;
    const t1 = parseFloat(t1Input.value) || 0;
    const t2 = parseFloat(t2Input.value) || 0;
    const t3 = parseFloat(t3Input.value) || 0;

    const vmin = Math.min(vs, ve);
    const maxFlow = Math.max(vs, ve);

    // Sensible effectiveness (ASHRAE 84)
    // εs = [Vs × (t1 − t2)] / [Vmin × (t1 − t3)] × 100
    // Guard: if t1 === t3 (denominator zero) → 0%
    let effectiveness = 0;
    if (vmin > 0 && t1 !== t3) {
      effectiveness = (vs * (t1 - t2)) / (vmin * (t1 - t3)) * 100;
    }

    // Flow imbalance ratio
    const flowImbalanceRatio = maxFlow > 0 ? Math.abs(vs - ve) / maxFlow : 0;

    // Total sensible heat recovered (BTU/h)
    // Q_sensible = 1.08 × Vs × (t2 − t1)
    // (positive in heating mode where t2 > t1 from recovery perspective)
    const _qSensible = 1.08 * vs * (t2 - t1);

    // Determine warning (priority: flow imbalance first, then thermodynamic limit)
    let warningMessage = "";
    if (flowImbalanceRatio > 0.10) {
      warningMessage =
        "Unbalanced flow rate: Volumetric supply and exhaust imbalance exceeds 10%. This will distort apparent thermal effectiveness and risk building pressure issues.";
    } else if (effectiveness > 95) {
      warningMessage =
        "Thermodynamic limit error: Sensible heat exchanger effectiveness cannot exceed 95% under practical conditions.";
    }

    // Update result panel
    resultEffectiveness.textContent = fmtPercent(effectiveness);
    resultVmin.textContent = vmin + " CFM";
    resultBalance.textContent = fmtPercent(flowImbalanceRatio * 100) + " imbalance";
    statusEl.textContent = getStatusLabel(effectiveness);

    // Warning box visibility
    if (warningMessage) {
      warningText.textContent = warningMessage;
      warningBox.classList.remove("hidden");
    } else {
      warningBox.classList.add("hidden");
      warningText.textContent = "";
    }

    // Breakdown
    bdVs.textContent = vs + " CFM";
    bdVe.textContent = ve + " CFM";
    bdVmin.textContent = vmin + " CFM";
    bdT1.textContent = fmtTemp(t1);
    bdT2.textContent = fmtTemp(t2);
    bdT3.textContent = fmtTemp(t3);
  }

  function reset(): void {
    typeSelect.value = "hrv";
    vsInput.value = "150";
    veInput.value = "150";
    t1Input.value = "20";
    t2Input.value = "60";
    t3Input.value = "70";
    calculate();
  }

  typeSelect.addEventListener("change", calculate);
  vsInput.addEventListener("input", calculate);
  veInput.addEventListener("input", calculate);
  t1Input.addEventListener("input", calculate);
  t2Input.addEventListener("input", calculate);
  t3Input.addEventListener("input", calculate);
  resetBtn?.addEventListener("click", reset);

  calculate();
}
