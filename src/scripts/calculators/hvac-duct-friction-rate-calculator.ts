export function initHvacDuctFrictionRateCalculator(): void {
  const espInput = document.getElementById("dfr-esp") as HTMLInputElement | null;
  const cplInput = document.getElementById("dfr-cpl") as HTMLInputElement | null;
  const straightInput = document.getElementById("dfr-straight") as HTMLInputElement | null;
  const fittingsInput = document.getElementById("dfr-fittings") as HTMLInputElement | null;
  const resetBtn = document.getElementById("dfr-reset");

  const resultFr = document.getElementById("dfr-result-fr");
  const resultAsp = document.getElementById("dfr-result-asp");
  const resultTel = document.getElementById("dfr-result-tel");
  const statusEl = document.getElementById("dfr-status");
  const warningBox = document.getElementById("dfr-warning");
  const warningText = document.getElementById("dfr-warning-text");

  const bdEsp = document.getElementById("dfr-bd-esp");
  const bdCpl = document.getElementById("dfr-bd-cpl");
  const bdAsp = document.getElementById("dfr-bd-asp");
  const bdStraight = document.getElementById("dfr-bd-straight");
  const bdFittings = document.getElementById("dfr-bd-fittings");
  const bdTel = document.getElementById("dfr-bd-tel");

  if (
    !espInput ||
    !cplInput ||
    !straightInput ||
    !fittingsInput ||
    !resultFr ||
    !resultAsp ||
    !resultTel ||
    !statusEl ||
    !warningBox ||
    !warningText ||
    !bdEsp ||
    !bdCpl ||
    !bdAsp ||
    !bdStraight ||
    !bdFittings ||
    !bdTel
  ) {
    return;
  }

  function calculate(): void {
    const esp = parseFloat(espInput.value) || 0;
    const cpl = parseFloat(cplInput.value) || 0;
    const straight = parseFloat(straightInput.value) || 0;
    const fittings = parseFloat(fittingsInput.value) || 0;

    const asp = esp - cpl;
    const tel = straight + fittings;

    // Breakdown
    bdEsp.textContent = esp.toFixed(2) + " in. w.c.";
    bdCpl.textContent = cpl.toFixed(2) + " in. w.c.";
    bdAsp.textContent = asp.toFixed(2) + " in. w.c.";
    bdStraight.textContent = Math.round(straight) + " ft";
    bdFittings.textContent = Math.round(fittings) + " ft";
    bdTel.textContent = Math.round(tel) + " ft";

    // Negative ASP guard
    if (asp <= 0) {
      resultFr.textContent = "—";
      resultAsp.textContent = asp.toFixed(2) + " in. w.c.";
      resultTel.textContent = Math.round(tel) + " ft";
      statusEl.textContent = "Error";
      statusEl.className = "inline-flex items-center rounded-full bg-red-500/20 px-3 py-1 text-sm font-semibold text-white";
      warningBox.classList.remove("hidden");
      warningText.textContent =
        "Negative ASP: Component pressure losses exceed equipment static pressure. Reduce CPL or select a higher static-pressure blower.";
      return;
    }

    // TEL zero guard
    const fr = tel > 0 ? (asp * 100) / tel : 0;

    // Status classification
    let statusLabel: string;
    let statusClass: string;

    if (fr > 0.18) {
      statusLabel = "Too High";
      statusClass = "inline-flex items-center rounded-full bg-red-500/20 px-3 py-1 text-sm font-semibold text-white";
    } else if (fr >= 0.15) {
      statusLabel = "Tight";
      statusClass = "inline-flex items-center rounded-full bg-amber-400/25 px-3 py-1 text-sm font-semibold text-white";
    } else if (fr >= 0.10) {
      statusLabel = "Target";
      statusClass = "inline-flex items-center rounded-full bg-green-500/25 px-3 py-1 text-sm font-semibold text-white";
    } else if (fr >= 0.06) {
      statusLabel = "Conservative";
      statusClass = "inline-flex items-center rounded-full bg-sky-400/25 px-3 py-1 text-sm font-semibold text-white";
    } else {
      statusLabel = "Too Low";
      statusClass = "inline-flex items-center rounded-full bg-yellow-400/20 px-3 py-1 text-sm font-semibold text-white";
    }

    resultFr.textContent = fr.toFixed(3) + " in. w.c./100'";
    resultAsp.textContent = asp.toFixed(2) + " in. w.c.";
    resultTel.textContent = Math.round(tel) + " ft";
    statusEl.textContent = statusLabel;
    statusEl.className = statusClass;

    // Warnings
    if (fr > 0.18) {
      warningBox.classList.remove("hidden");
      warningText.textContent =
        "Excessive friction rate: Friction rates above 0.18 iwc/100' will lead to high air velocities, resulting in structural noise and whistling at supply registers.";
    } else if (fr < 0.06 && tel > 0) {
      warningBox.classList.remove("hidden");
      warningText.textContent =
        "Low friction rate: Friction rates below 0.06 iwc/100' require oversized ductwork, which increases material costs and can cause low-velocity temperature stratification.";
    } else {
      warningBox.classList.add("hidden");
      warningText.textContent = "";
    }
  }

  function reset(): void {
    espInput.value = "0.5";
    cplInput.value = "0.20";
    straightInput.value = "60";
    fittingsInput.value = "40";
    calculate();
  }

  espInput.addEventListener("input", calculate);
  cplInput.addEventListener("input", calculate);
  straightInput.addEventListener("input", calculate);
  fittingsInput.addEventListener("input", calculate);
  resetBtn?.addEventListener("click", reset);

  calculate();
}
