import {
  MANNING_N,
  fmt,
  insideDiameter,
  manningHalfFull,
  minSlope,
  sizeLabel,
  slopeToPercent,
  totalFall,
} from "@/lib/plumbing";

export function initPlumbingPipeSlopeCalculator(): void {
  const size = document.getElementById("sl-size") as HTMLSelectElement | null;
  const run = document.getElementById("sl-run") as HTMLInputElement | null;
  const runRange = document.getElementById("sl-run-range") as HTMLInputElement | null;
  const slope = document.getElementById("sl-slope") as HTMLSelectElement | null;
  const resetBtn = document.getElementById("sl-reset");

  const out = {
    fall: document.getElementById("sl-fall"),
    verdict: document.getElementById("sl-verdict"),
    slopeUsed: document.getElementById("sl-slope-used"),
    percent: document.getElementById("sl-percent"),
    warning: document.getElementById("sl-warning"),
    bdRequired: document.getElementById("sl-bd-required"),
    bdPer10: document.getElementById("sl-bd-per-10"),
    bdVelocity: document.getElementById("sl-bd-velocity"),
    bdMinFall: document.getElementById("sl-bd-min-fall"),
    bdMaxRun: document.getElementById("sl-bd-max-run"),
  };

  if (
    !size ||
    !run ||
    !runRange ||
    !slope ||
    !out.fall ||
    !out.verdict ||
    !out.slopeUsed ||
    !out.percent ||
    !out.warning ||
    !out.bdRequired ||
    !out.bdPer10 ||
    !out.bdVelocity ||
    !out.bdMinFall ||
    !out.bdMaxRun
  ) {
    return;
  }

  function calculate(): void {
    const nominal = parseFloat(size!.value);
    const runFt = Math.max(0, parseFloat(run!.value) || 0);
    const required = minSlope(nominal);
    const chosen = slope!.value === "min" ? required : parseFloat(slope!.value);

    const fall = totalFall(chosen, runFt);
    const percent = slopeToPercent(chosen);
    const id = insideDiameter("pvc-40", nominal);
    const flow = id === null ? null : manningHalfFull(id, chosen, MANNING_N["cast-iron"]);

    out.fall!.textContent = `${fmt(fall, 1)} in`;
    out.slopeUsed!.textContent = `${chosen} in/ft`;
    out.percent!.textContent = `${fmt(percent, 2)}%`;

    const below = chosen < required - 1e-9;
    const steep = chosen > 0.5 + 1e-9;

    if (below) {
      out.verdict!.textContent = `Below the Table 704.1 minimum of ${required} in/ft for ${sizeLabel(nominal)} pipe — this will not pass inspection.`;
    } else if (steep) {
      out.verdict!.textContent = `Above 1/2 in/ft. Legal, but steep enough that liquid can outrun solids on a long run — worth avoiding where you have the choice.`;
    } else {
      out.verdict!.textContent = `Meets the Table 704.1 minimum of ${required} in/ft for ${sizeLabel(nominal)} pipe, with a self-scouring flow.`;
    }
    out.warning!.classList.toggle("hidden", !below);

    out.bdRequired!.textContent = `${required} in/ft (${fmt(slopeToPercent(required), 2)}%)`;
    out.bdPer10!.textContent = `${fmt(totalFall(chosen, 10), 2)} in per 10 ft`;
    out.bdVelocity!.textContent =
      flow === null ? "—" : `${fmt(flow.velocity, 2)} ft/s, about ${fmt(flow.gpm, 0)} gpm`;
    out.bdMinFall!.textContent = `${fmt(totalFall(required, runFt), 1)} in at the code minimum`;

    // How far this size can run before the fall eats a given depth (4 ft is a
    // common practical trench/joist limit).
    const maxRun = chosen > 0 ? 48 / chosen : 0;
    out.bdMaxRun!.textContent =
      chosen > 0 ? `${fmt(maxRun, 0)} ft before the fall reaches 4 ft` : "—";
  }

  function syncFromRange(): void {
    run!.value = runRange!.value;
    calculate();
  }

  function syncToRange(): void {
    const value = parseFloat(run!.value) || 0;
    if (value >= Number(runRange!.min) && value <= Number(runRange!.max)) {
      runRange!.value = String(value);
    }
    calculate();
  }

  run.addEventListener("input", syncToRange);
  runRange.addEventListener("input", syncFromRange);
  [size, slope].forEach((el) => el.addEventListener("change", calculate));

  resetBtn?.addEventListener("click", () => {
    size.value = "3";
    run.value = "40";
    runRange.value = "40";
    slope.value = "min";
    calculate();
  });

  calculate();
}
