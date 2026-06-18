function fToC(f: number): number {
  return ((f - 32) * 5) / 9;
}

function grainsFromRh(dbF: number, rh: number): number {
  const tc = fToC(dbF);
  const es = 6.112 * Math.exp((17.67 * tc) / (tc + 243.5));
  const e = (rh / 100) * es;
  const p = 1013.25;
  const w = 0.622 * e / (p - e);
  return w * 7000;
}

function fmtBtu(n: number): string {
  return Math.round(n).toLocaleString("en-US") + " BTU/h";
}

function fmtPints(n: number): string {
  return Math.round(n).toLocaleString("en-US") + " pints/day";
}

function fmtGal(n: number): string {
  return (Math.round(n * 10) / 10).toLocaleString("en-US") + " gal/day";
}

function fmtGrains(n: number): string {
  return Math.round(n) + " gr/lb";
}

function evaluateCapacity(pintsPerDay: number, mode: string): { status: string; note: string } {
  if (pintsPerDay <= 0) {
    return {
      status: "No moisture change",
      note: "Current and target RH are the same — no latent load to add or remove.",
    };
  }
  if (mode === "dehumidify") {
    if (pintsPerDay <= 20) {
      return {
        status: "Portable range",
        note: "A mid-size portable dehumidifier (20–30 pint/day class) may suffice for a single zone or basement.",
      };
    }
    if (pintsPerDay <= 50) {
      return {
        status: "Whole-home range",
        note: "Typical whole-home or large basement load — look at 50–70 pint/day rated units or ducted dehumidification.",
      };
    }
    return {
      status: "Heavy latent load",
      note: "High moisture removal demand — consider ducted dehumidifier, enhanced ventilation, and source control; verify with a full load analysis.",
    };
  }
  if (pintsPerDay <= 8) {
    return {
      status: "Small humidifier",
      note: "Low add-on moisture — a room or small bypass humidifier may cover this load.",
    };
  }
  return {
    status: "Whole-home humidifier",
    note: "Higher moisture addition — size a whole-home bypass or steam humidifier to this gallons/day target and verify against furnace airflow.",
  };
}

export function initHvacHumidityControlCalculator(): void {
  const modeSelect = document.getElementById("hc-mode") as HTMLSelectElement | null;
  const areaInput = document.getElementById("hc-area") as HTMLInputElement | null;
  const ceilingInput = document.getElementById("hc-ceiling") as HTMLInputElement | null;
  const achInput = document.getElementById("hc-ach") as HTMLInputElement | null;
  const dbInput = document.getElementById("hc-db") as HTMLInputElement | null;
  const rhCurrentInput = document.getElementById("hc-rh-current") as HTMLInputElement | null;
  const rhTargetInput = document.getElementById("hc-rh-target") as HTMLInputElement | null;
  const resetBtn = document.getElementById("resetBtn");
  const resultCapacity = document.getElementById("hc-result-capacity");
  const resultQl = document.getElementById("hc-result-ql");
  const resultCfm = document.getElementById("hc-result-cfm");
  const resultGrains = document.getElementById("hc-result-grains");
  const status = document.getElementById("hc-status");
  const bdVolume = document.getElementById("hc-bd-volume");
  const bdCfm = document.getElementById("hc-bd-cfm");
  const bdQl = document.getElementById("hc-bd-ql");

  if (
    !modeSelect ||
    !areaInput ||
    !ceilingInput ||
    !achInput ||
    !dbInput ||
    !rhCurrentInput ||
    !rhTargetInput ||
    !resultCapacity ||
    !resultQl ||
    !resultCfm ||
    !resultGrains ||
    !status ||
    !bdVolume ||
    !bdCfm ||
    !bdQl
  ) {
    return;
  }

  function calculate(): void {
    const area = Math.max(0, parseFloat(areaInput.value) || 0);
    const ceiling = Math.max(1, parseFloat(ceilingInput.value) || 8);
    const ach = Math.max(0, parseFloat(achInput.value) || 0);
    const db = parseFloat(dbInput.value) || 75;
    const rhCurrent = Math.min(100, Math.max(0, parseFloat(rhCurrentInput.value) || 0));
    const rhTarget = Math.min(100, Math.max(0, parseFloat(rhTargetInput.value) || 0));
    const mode = modeSelect.value;

    const volume = area * ceiling;
    const cfm = (volume * ach) / 60;
    const grainsCurrent = grainsFromRh(db, rhCurrent);
    const grainsTarget = grainsFromRh(db, rhTarget);
    const deltaGrains = Math.abs(grainsCurrent - grainsTarget);
    const ql = 0.68 * cfm * deltaGrains;
    const pintsPerDay = (ql * 24) / 12000;
    const galPerDay = pintsPerDay / 8;

    const evaluation = evaluateCapacity(pintsPerDay, mode);

    resultQl.textContent = fmtBtu(ql);
    resultCfm.textContent = Math.round(cfm).toLocaleString("en-US") + " CFM";
    resultGrains.textContent = fmtGrains(deltaGrains);
    resultCapacity.textContent =
      mode === "dehumidify" ? fmtPints(pintsPerDay) : fmtGal(galPerDay);
    status.textContent = evaluation.status + " — " + evaluation.note;
    bdVolume.textContent = Math.round(volume).toLocaleString("en-US") + " cu ft";
    bdCfm.textContent = Math.round(cfm).toLocaleString("en-US") + " CFM";
    bdQl.textContent = fmtBtu(ql);
  }

  function reset(): void {
    modeSelect.value = "dehumidify";
    areaInput.value = "2000";
    ceilingInput.value = "8";
    achInput.value = "5";
    dbInput.value = "75";
    rhCurrentInput.value = "65";
    rhTargetInput.value = "50";
    calculate();
  }

  modeSelect.addEventListener("change", calculate);
  areaInput.addEventListener("input", calculate);
  ceilingInput.addEventListener("input", calculate);
  achInput.addEventListener("input", calculate);
  dbInput.addEventListener("input", calculate);
  rhCurrentInput.addEventListener("input", calculate);
  rhTargetInput.addEventListener("input", calculate);
  resetBtn?.addEventListener("click", reset);

  calculate();
}
