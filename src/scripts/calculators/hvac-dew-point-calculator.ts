type Mode = "dewpoint" | "rh";

function fToC(f: number): number {
  return ((f - 32) * 5) / 9;
}

function cToF(c: number): number {
  return (c * 9) / 5 + 32;
}

function dewPointFromRh(dbF: number, rh: number): number {
  const tc = fToC(dbF);
  const a = Math.log(rh / 100) + (17.62 * tc) / (243.12 + tc);
  const dewC = (243.12 * a) / (17.62 - a);
  return cToF(dewC);
}

function rhFromDewPoint(dbF: number, dewF: number): number {
  const tc = fToC(dbF);
  const dewC = fToC(dewF);
  const aDew = (17.62 * dewC) / (243.12 + dewC);
  const lnRh = aDew - (17.62 * tc) / (243.12 + tc);
  return Math.min(100, Math.max(0, 100 * Math.exp(lnRh)));
}

function fmtTemp(n: number): string {
  return Math.round(n) + "°F";
}

function fmtRh(n: number): string {
  return Math.round(n) + "% RH";
}

function evaluateRh(rh: number): { status: string; note: string } {
  if (rh < 30) {
    return {
      status: "Dry",
      note: "Below 30% RH — static, dry air. May feel uncomfortable and stress wood or finishes.",
    };
  }
  if (rh <= 50) {
    return {
      status: "Comfortable",
      note: "30–50% RH is the typical indoor comfort band — good for occupants and building materials.",
    };
  }
  if (rh <= 60) {
    return {
      status: "Humid",
      note: "50–60% RH — elevated moisture load. Coil may run longer to dehumidify; watch for duct sweating in unconditioned spaces.",
    };
  }
  return {
    status: "Very humid",
    note: "Over 60% RH — high latent load and condensation risk on cool surfaces. Verify ventilation and coil capacity.",
  };
}

function evaluateCondensation(surfaceF: number | null, dewF: number): string {
  if (surfaceF === null || surfaceF <= 0) {
    return "Enter a surface temperature to check for condensation risk.";
  }
  if (surfaceF <= dewF) {
    return `Condensation risk — surface (${fmtTemp(surfaceF)}) is at or below the dew point (${fmtTemp(dewF)}).`;
  }
  const margin = surfaceF - dewF;
  if (margin < 5) {
    return `Borderline — surface is only ${Math.round(margin)}°F above dew point. Insulate or raise surface temp to prevent sweating.`;
  }
  return `No condensation — surface is ${Math.round(margin)}°F above the dew point.`;
}

export function initHvacDewPointCalculator(): void {
  const modeSelect = document.getElementById("dp-mode") as HTMLSelectElement | null;
  const drybulbInput = document.getElementById("dp-drybulb") as HTMLInputElement | null;
  const rhInput = document.getElementById("dp-rh") as HTMLInputElement | null;
  const dewpointInInput = document.getElementById("dp-dewpoint-in") as HTMLInputElement | null;
  const surfaceInput = document.getElementById("dp-surface") as HTMLInputElement | null;
  const resetBtn = document.getElementById("resetBtn");
  const resultLabel = document.getElementById("dp-result-label");
  const result = document.getElementById("dp-result");
  const secondaryLabel = document.getElementById("dp-secondary-label");
  const secondary = document.getElementById("dp-secondary");
  const condensation = document.getElementById("dp-condensation");
  const status = document.getElementById("dp-status");
  const bdDrybulb = document.getElementById("dp-bd-drybulb");
  const bdValue = document.getElementById("dp-bd-value");
  const bdSurface = document.getElementById("dp-bd-surface");
  const bdNote = document.getElementById("dp-bd-note");
  const rhField = rhInput?.closest("div");
  const dewpointInField = dewpointInInput?.closest("div");

  if (
    !modeSelect ||
    !drybulbInput ||
    !rhInput ||
    !dewpointInInput ||
    !surfaceInput ||
    !result ||
    !secondary ||
    !condensation ||
    !status ||
    !bdDrybulb ||
    !bdValue ||
    !bdSurface ||
    !bdNote
  ) {
    return;
  }

  function setModeFields(): void {
    const isDewpointMode = modeSelect.value === "dewpoint";
    rhField?.classList.toggle("hidden", !isDewpointMode);
    dewpointInField?.classList.toggle("hidden", isDewpointMode);
  }

  function parseSurface(): number | null {
    const raw = surfaceInput.value.trim();
    if (raw === "") return null;
    const val = parseFloat(raw);
    return Number.isFinite(val) ? val : null;
  }

  function calculate(): void {
    const dbF = parseFloat(drybulbInput.value) || 0;
    const isDewpointMode = (modeSelect.value as Mode) === "dewpoint";

    let dewF: number;
    let rh: number;

    if (isDewpointMode) {
      rh = Math.min(100, Math.max(0, parseFloat(rhInput.value) || 0));
      dewF = dewPointFromRh(dbF, rh);
      resultLabel && (resultLabel.textContent = "Dew point");
      secondaryLabel && (secondaryLabel.textContent = "Relative humidity");
      result.textContent = fmtTemp(dewF);
      secondary.textContent = fmtRh(rh);
    } else {
      dewF = parseFloat(dewpointInInput.value) || 0;
      rh = rhFromDewPoint(dbF, dewF);
      resultLabel && (resultLabel.textContent = "Relative humidity");
      secondaryLabel && (secondaryLabel.textContent = "Dew point");
      result.textContent = fmtRh(rh);
      secondary.textContent = fmtTemp(dewF);
    }

    const evaluation = evaluateRh(rh);
    status.textContent = evaluation.status;
    condensation.textContent = evaluateCondensation(parseSurface(), dewF);

    bdDrybulb.textContent = fmtTemp(dbF);
    bdValue.textContent = isDewpointMode ? fmtTemp(dewF) : fmtRh(rh);
    const surface = parseSurface();
    bdSurface.textContent = surface !== null ? fmtTemp(surface) : "—";
    bdNote.textContent = evaluation.note;
  }

  function reset(): void {
    modeSelect.value = "dewpoint";
    drybulbInput.value = "75";
    rhInput.value = "55";
    dewpointInInput.value = "58";
    surfaceInput.value = "";
    setModeFields();
    calculate();
  }

  modeSelect.addEventListener("change", () => {
    setModeFields();
    calculate();
  });
  drybulbInput.addEventListener("input", calculate);
  rhInput.addEventListener("input", calculate);
  dewpointInInput.addEventListener("input", calculate);
  surfaceInput.addEventListener("input", calculate);
  resetBtn?.addEventListener("click", reset);

  setModeFields();
  calculate();
}
