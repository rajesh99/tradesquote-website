import {
  MAX_VELOCITY_COLD,
  allowableLossPer100Ft,
  availableFrictionPsi,
  fmt,
  headToPsi,
  sizeLabel,
  sizeSupplyPipe,
  type PipeMaterial,
} from "@/lib/plumbing";

export function initPlumbingPipeSizeCalculator(): void {
  const gpm = document.getElementById("ps-gpm") as HTMLInputElement | null;
  const gpmRange = document.getElementById("ps-gpm-range") as HTMLInputElement | null;
  const material = document.getElementById("ps-material") as HTMLSelectElement | null;
  const length = document.getElementById("ps-length") as HTMLInputElement | null;
  const supply = document.getElementById("ps-supply") as HTMLInputElement | null;
  const rise = document.getElementById("ps-rise") as HTMLInputElement | null;
  const fixturePsi = document.getElementById("ps-fixture-psi") as HTMLInputElement | null;
  const meter = document.getElementById("ps-meter") as HTMLInputElement | null;
  const maxVel = document.getElementById("ps-max-velocity") as HTMLSelectElement | null;
  const resetBtn = document.getElementById("ps-reset");

  const out = {
    size: document.getElementById("ps-size"),
    governed: document.getElementById("ps-governed"),
    velocity: document.getElementById("ps-velocity"),
    loss: document.getElementById("ps-loss"),
    warning: document.getElementById("ps-warning"),
    bdElevation: document.getElementById("ps-bd-elevation"),
    bdAvailable: document.getElementById("ps-bd-available"),
    bdAllowable: document.getElementById("ps-bd-allowable"),
    bdId: document.getElementById("ps-bd-id"),
    bdLossTotal: document.getElementById("ps-bd-loss-total"),
    bdArriving: document.getElementById("ps-bd-arriving"),
  };

  if (
    !gpm ||
    !gpmRange ||
    !material ||
    !length ||
    !supply ||
    !rise ||
    !fixturePsi ||
    !meter ||
    !maxVel ||
    !out.size ||
    !out.governed ||
    !out.velocity ||
    !out.loss ||
    !out.warning ||
    !out.bdElevation ||
    !out.bdAvailable ||
    !out.bdAllowable ||
    !out.bdId ||
    !out.bdLossTotal ||
    !out.bdArriving
  ) {
    return;
  }

  function calculate(): void {
    const flow = parseFloat(gpm!.value) || 0;
    const mat = material!.value as PipeMaterial;
    const developed = parseFloat(length!.value) || 0;
    const supplyPsi = parseFloat(supply!.value) || 0;
    const riseFt = parseFloat(rise!.value) || 0;
    const needPsi = parseFloat(fixturePsi!.value) || 0;
    const meterPsi = parseFloat(meter!.value) || 0;
    const velocityCap = parseFloat(maxVel!.value) || MAX_VELOCITY_COLD;

    const elevation = headToPsi(riseFt);
    const available = availableFrictionPsi({
      supplyPsi,
      highestFixtureFeet: riseFt,
      fixtureRequiredPsi: needPsi,
      meterLossPsi: meterPsi,
      otherLossPsi: 0,
    });
    const allowable = allowableLossPer100Ft(available, developed);

    out.bdElevation!.textContent = `−${fmt(elevation, 2)} psi`;
    out.bdAvailable!.textContent = `${fmt(available, 2)} psi`;
    out.bdAllowable!.textContent =
      available > 0 ? `${fmt(allowable, 2)} psi per 100 ft` : "none — budget exhausted";

    if (available <= 0) {
      out.size!.textContent = "—";
      out.governed!.textContent =
        "No pressure left for the pipe. The lift, the fixture requirement and the meter already consume the whole supply — a booster pump or a pressure increase is needed before any pipe size works.";
      out.velocity!.textContent = "—";
      out.loss!.textContent = "—";
      out.bdId!.textContent = "—";
      out.bdLossTotal!.textContent = "—";
      out.bdArriving!.textContent = "—";
      out.warning!.classList.add("hidden");
      return;
    }

    const result = sizeSupplyPipe({
      gpm: flow,
      material: mat,
      developedFeet: developed,
      availablePsi: available,
      maxVelocity: velocityCap,
    });

    if (result.size === null) {
      out.size!.textContent = "—";
      out.governed!.textContent =
        "No listed size in this material satisfies both rules. Split the load across branches, shorten the run, or move to a larger material range.";
      out.velocity!.textContent = "—";
      out.loss!.textContent = "—";
      out.bdId!.textContent = "—";
      out.bdLossTotal!.textContent = "—";
      out.bdArriving!.textContent = "—";
      out.warning!.classList.remove("hidden");
      return;
    }

    out.size!.textContent = sizeLabel(result.size);
    out.velocity!.textContent = `${fmt(result.velocity, 2)} ft/s`;
    out.loss!.textContent = `${fmt(result.lossPer100, 2)} psi`;
    out.bdId!.textContent = `${fmt(result.id, 3)} in`;
    out.bdLossTotal!.textContent = `${fmt(result.lossTotal, 2)} psi`;
    out.bdArriving!.textContent = `${fmt(supplyPsi - elevation - meterPsi - result.lossTotal, 2)} psi`;

    if (result.governedBy === "both") {
      out.governed!.textContent =
        "Both rules land on this size — the next size down fails the velocity cap and the friction budget at the same time.";
    } else if (result.governedBy === "friction") {
      out.governed!.textContent =
        "Friction governs — velocity alone would allow a smaller pipe, but the pressure budget will not carry it.";
    } else {
      out.governed!.textContent =
        "Velocity governs — the pressure budget would allow a smaller pipe, but it would be noisy and erosive.";
    }

    out.warning!.classList.toggle("hidden", result.lossTotal <= available);
  }

  function syncFromRange(): void {
    gpm!.value = gpmRange!.value;
    calculate();
  }

  function syncToRange(): void {
    const value = parseFloat(gpm!.value) || 0;
    if (value >= Number(gpmRange!.min) && value <= Number(gpmRange!.max)) {
      gpmRange!.value = String(value);
    }
    calculate();
  }

  gpm.addEventListener("input", syncToRange);
  gpmRange.addEventListener("input", syncFromRange);
  [material, maxVel].forEach((el) => el.addEventListener("change", calculate));
  [length, supply, rise, fixturePsi, meter].forEach((el) =>
    el.addEventListener("input", calculate),
  );

  resetBtn?.addEventListener("click", () => {
    gpm.value = "18";
    gpmRange.value = "18";
    material.value = "copper-l";
    length.value = "120";
    supply.value = "60";
    rise.value = "20";
    fixturePsi.value = "15";
    meter.value = "8";
    maxVel.value = "8";
    calculate();
  });

  calculate();
}
