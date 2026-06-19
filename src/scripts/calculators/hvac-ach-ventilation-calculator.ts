type SpaceKey =
  | "general"
  | "bedroom"
  | "classroom"
  | "restroom"
  | "kitchen"
  | "laboratory"
  | "hospital_ward"
  | "hospital_or"
  | "hospital_iso"
  | "parking";

const SPACE_MAP: Record<SpaceKey, { name: string; minAch: number }> = {
  general: { name: "General office / commercial", minAch: 4 },
  bedroom: { name: "Residential bedroom", minAch: 0.35 },
  classroom: { name: "Classroom / conference room", minAch: 4 },
  restroom: { name: "Restroom / toilet room", minAch: 10 },
  kitchen: { name: "Commercial kitchen", minAch: 12 },
  laboratory: { name: "Laboratory / clean room", minAch: 6 },
  hospital_ward: { name: "Hospital patient room", minAch: 2 },
  hospital_or: { name: "Operating room", minAch: 20 },
  hospital_iso: { name: "Isolation room", minAch: 12 },
  parking: { name: "Parking garage", minAch: 1.5 },
};

function fmtAch(n: number): string {
  return n.toFixed(1);
}

function fmtCfm(n: number): string {
  return Math.round(n) + " CFM";
}

function fmtVolume(n: number): string {
  return n.toLocaleString("en-US") + " ft³";
}

export function initHvacAchVentilationCalculator(): void {
  const modeEl = document.getElementById("ach-mode") as HTMLSelectElement | null;
  const lengthEl = document.getElementById("ach-length") as HTMLInputElement | null;
  const widthEl = document.getElementById("ach-width") as HTMLInputElement | null;
  const heightEl = document.getElementById("ach-height") as HTMLInputElement | null;
  const cfmEl = document.getElementById("ach-cfm") as HTMLInputElement | null;
  const targetEl = document.getElementById("ach-target") as HTMLInputElement | null;
  const spaceEl = document.getElementById("ach-space") as HTMLSelectElement | null;
  const resetBtn = document.getElementById("ach-reset");

  const cfmField = document.getElementById("ach-cfm-field");
  const targetField = document.getElementById("ach-target-field");

  const resultMainEl = document.getElementById("ach-result-main");
  const resultUnitEl = document.getElementById("ach-result-unit");
  const resultLabelEl = document.getElementById("ach-result-label");
  const resultVolumeEl = document.getElementById("ach-result-volume");
  const resultMinEl = document.getElementById("ach-result-min");
  const complianceEl = document.getElementById("ach-compliance");
  const warningEl = document.getElementById("ach-warning");
  const warningTextEl = document.getElementById("ach-warning-text");

  const bdDimsEl = document.getElementById("ach-bd-dims");
  const bdVolumeEl = document.getElementById("ach-bd-volume");
  const bdCfmEl = document.getElementById("ach-bd-cfm");
  const bdAchEl = document.getElementById("ach-bd-ach");
  const bdMinEl = document.getElementById("ach-bd-min");

  if (
    !modeEl ||
    !lengthEl ||
    !widthEl ||
    !heightEl ||
    !cfmEl ||
    !targetEl ||
    !spaceEl ||
    !cfmField ||
    !targetField ||
    !resultMainEl ||
    !resultUnitEl ||
    !resultLabelEl ||
    !resultVolumeEl ||
    !resultMinEl ||
    !complianceEl ||
    !warningEl ||
    !warningTextEl ||
    !bdDimsEl ||
    !bdVolumeEl ||
    !bdCfmEl ||
    !bdAchEl ||
    !bdMinEl
  ) {
    return;
  }

  function updateModeVisibility(): void {
    const isCfmToAch = modeEl!.value === "cfmToAch";
    cfmField!.classList.toggle("hidden", !isCfmToAch);
    targetField!.classList.toggle("hidden", isCfmToAch);
  }

  function calculate(): void {
    const length = parseFloat(lengthEl!.value) || 0;
    const width = parseFloat(widthEl!.value) || 0;
    const height = parseFloat(heightEl!.value) || 0;
    const volume = length * width * height;

    const spaceKey = (spaceEl!.value || "general") as SpaceKey;
    const spaceInfo = SPACE_MAP[spaceKey] ?? SPACE_MAP.general;
    const minAch = spaceInfo.minAch;

    const isCfmToAch = modeEl!.value === "cfmToAch";

    let ach: number;
    let cfm: number;

    if (isCfmToAch) {
      cfm = parseFloat(cfmEl!.value) || 0;
      ach = volume > 0 ? (cfm * 60) / volume : 0;
    } else {
      const targetAch = parseFloat(targetEl!.value) || 0;
      ach = targetAch;
      cfm = volume > 0 ? (targetAch * volume) / 60 : 0;
    }

    // Update results panel label and main number
    if (isCfmToAch) {
      resultLabelEl!.textContent = "Air changes per hour";
      resultMainEl!.textContent = fmtAch(ach);
      resultUnitEl!.textContent = "ACH";
    } else {
      resultLabelEl!.textContent = "Required airflow";
      resultMainEl!.textContent = Math.round(cfm).toString();
      resultUnitEl!.textContent = "CFM";
    }

    resultVolumeEl!.textContent = fmtVolume(volume);
    resultMinEl!.textContent = minAch + " ACH";

    // Compliance check
    const compliant = ach >= minAch;

    if (compliant) {
      complianceEl!.textContent = "Compliant";
      complianceEl!.className =
        "inline-flex items-center gap-1.5 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold text-white";
      warningEl!.classList.add("hidden");
    } else {
      complianceEl!.textContent = "Non-compliant";
      complianceEl!.className =
        "inline-flex items-center gap-1.5 rounded-full bg-red-500/30 border border-red-300/40 px-4 py-2 text-sm font-semibold text-red-100";
      warningTextEl!.textContent =
        `Non-compliant ACH rate: Calculated air exchange rate of ${fmtAch(ach)} ACH is below the minimum ASHRAE standard of ${minAch} ACH for this space category.`;
      warningEl!.classList.remove("hidden");
    }

    // Breakdown
    bdDimsEl!.textContent = `${length} × ${width} × ${height} ft`;
    bdVolumeEl!.textContent = fmtVolume(volume);
    bdCfmEl!.textContent = fmtCfm(cfm);
    bdAchEl!.textContent = fmtAch(ach) + " ACH";
    bdMinEl!.textContent = minAch + " ACH";
  }

  function reset(): void {
    modeEl!.value = "cfmToAch";
    lengthEl!.value = "20";
    widthEl!.value = "15";
    heightEl!.value = "9";
    cfmEl!.value = "200";
    targetEl!.value = "6";
    spaceEl!.value = "general";
    updateModeVisibility();
    calculate();
  }

  modeEl.addEventListener("change", () => {
    updateModeVisibility();
    calculate();
  });
  lengthEl.addEventListener("input", calculate);
  widthEl.addEventListener("input", calculate);
  heightEl.addEventListener("input", calculate);
  cfmEl.addEventListener("input", calculate);
  targetEl.addEventListener("input", calculate);
  spaceEl.addEventListener("change", calculate);
  resetBtn?.addEventListener("click", reset);

  updateModeVisibility();
  calculate();
}
