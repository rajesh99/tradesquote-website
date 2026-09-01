import {
  DRAIN_APPLICATION_LABELS,
  MANNING_N,
  drainCapacity,
  fmt,
  insideDiameter,
  manningHalfFull,
  minDrainSizeApplied,
  minSlope,
  sizeLabel,
  slopeToPercent,
  totalFall,
  type DrainApplication,
} from "@/lib/plumbing";

export function initPlumbingDrainPipeSizeCalculator(): void {
  const dfu = document.getElementById("dps-dfu") as HTMLInputElement | null;
  const dfuRange = document.getElementById("dps-dfu-range") as HTMLInputElement | null;
  const application = document.getElementById("dps-application") as HTMLSelectElement | null;
  const slope = document.getElementById("dps-slope") as HTMLSelectElement | null;
  const waterCloset = document.getElementById("dps-water-closet") as HTMLSelectElement | null;
  const runLength = document.getElementById("dps-run") as HTMLInputElement | null;
  const resetBtn = document.getElementById("dps-reset");

  const out = {
    size: document.getElementById("dps-size"),
    note: document.getElementById("dps-note"),
    capacity: document.getElementById("dps-capacity"),
    headroom: document.getElementById("dps-headroom"),
    wcNotice: document.getElementById("dps-wc-notice"),
    bdTable: document.getElementById("dps-bd-table"),
    bdMinSlope: document.getElementById("dps-bd-min-slope"),
    bdFall: document.getElementById("dps-bd-fall"),
    bdVelocity: document.getElementById("dps-bd-velocity"),
    bdNext: document.getElementById("dps-bd-next"),
  };

  if (
    !dfu ||
    !dfuRange ||
    !application ||
    !slope ||
    !waterCloset ||
    !runLength ||
    !out.size ||
    !out.note ||
    !out.capacity ||
    !out.headroom ||
    !out.wcNotice ||
    !out.bdTable ||
    !out.bdMinSlope ||
    !out.bdFall ||
    !out.bdVelocity ||
    !out.bdNext
  ) {
    return;
  }

  function calculate(): void {
    const load = Math.max(0, parseFloat(dfu!.value) || 0);
    const app = application!.value as DrainApplication;
    const slopeValue = parseFloat(slope!.value) || 0.25;
    const servesWc = waterCloset!.value === "yes";
    const run = Math.max(0, parseFloat(runLength!.value) || 0);
    const isBuildingDrain = app === "building-drain";

    const result = minDrainSizeApplied(load, app, slopeValue, servesWc);

    if (result.size === null) {
      out.size!.textContent = "—";
      out.note!.textContent = `${fmt(load, 0)} DFU exceeds the largest size listed for a ${DRAIN_APPLICATION_LABELS[app].toLowerCase()}. Split the load across more than one drain.`;
      out.capacity!.textContent = "—";
      out.headroom!.textContent = "—";
      out.wcNotice!.classList.add("hidden");
      out.bdTable!.textContent = "—";
      out.bdMinSlope!.textContent = "—";
      out.bdFall!.textContent = "—";
      out.bdVelocity!.textContent = "—";
      out.bdNext!.textContent = "—";
      return;
    }

    const capacity = drainCapacity(result.size, app, slopeValue);
    const required = minSlope(result.size);
    const effectiveSlope = isBuildingDrain ? slopeValue : required;
    const id = insideDiameter("pvc-40", result.size);
    const flow =
      id === null ? null : manningHalfFull(id, effectiveSlope, MANNING_N["cast-iron"]);

    out.size!.textContent = sizeLabel(result.size);
    out.capacity!.textContent = capacity === null ? "—" : `${fmt(capacity, 0)} DFU`;
    out.headroom!.textContent =
      capacity === null ? "—" : `${fmt(capacity - load, 0)} DFU`;

    if (result.governedBy === "water-closet") {
      out.note!.textContent = `The DFU load alone would ride ${sizeLabel(result.fromTable ?? 0)}, but a building drain serving a water closet is floored at 3 inches.`;
    } else {
      out.note!.textContent = `Smallest size in ${isBuildingDrain ? "Table 710.1(1)" : "Table 710.1(2)"} that carries ${fmt(load, 0)} DFU${isBuildingDrain ? ` at ${slopeValue} in/ft` : ""}.`;
    }
    out.wcNotice!.classList.toggle("hidden", result.governedBy !== "water-closet");

    out.bdTable!.textContent =
      result.fromTable === null ? "—" : `${sizeLabel(result.fromTable)} on load alone`;
    out.bdMinSlope!.textContent = `${required} in/ft (${fmt(slopeToPercent(required), 2)}%)`;
    out.bdFall!.textContent = `${fmt(totalFall(effectiveSlope, run), 1)} in over ${fmt(run, 0)} ft`;
    out.bdVelocity!.textContent =
      flow === null
        ? "—"
        : `${fmt(flow.velocity, 2)} ft/s, about ${fmt(flow.gpm, 0)} gpm half full`;

    const nextCapacity = drainCapacity(
      result.size === 1.5 ? 2 : result.size === 2 ? 2.5 : result.size === 2.5 ? 3 : result.size + 1,
      app,
      slopeValue,
    );
    out.bdNext!.textContent =
      nextCapacity === null ? "largest listed size" : `next size up carries ${fmt(nextCapacity, 0)} DFU`;

    if (isBuildingDrain && slopeValue < required) {
      out.note!.textContent += ` Warning: ${sizeLabel(result.size)} requires at least ${required} in/ft under Table 704.1.`;
    }
  }

  function syncFromRange(): void {
    dfu!.value = dfuRange!.value;
    calculate();
  }

  function syncToRange(): void {
    const value = parseFloat(dfu!.value) || 0;
    if (value >= Number(dfuRange!.min) && value <= Number(dfuRange!.max)) {
      dfuRange!.value = String(value);
    }
    calculate();
  }

  dfu.addEventListener("input", syncToRange);
  dfuRange.addEventListener("input", syncFromRange);
  [application, slope, waterCloset].forEach((el) => el.addEventListener("change", calculate));
  runLength.addEventListener("input", calculate);

  resetBtn?.addEventListener("click", () => {
    dfu.value = "18";
    dfuRange.value = "18";
    application.value = "building-drain";
    slope.value = "0.25";
    waterCloset.value = "yes";
    runLength.value = "40";
    calculate();
  });

  calculate();
}
