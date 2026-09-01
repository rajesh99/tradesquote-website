import {
  FITTING_LD,
  HAZEN_WILLIAMS_C,
  fittingEquivalentFeet,
  fmt,
  frictionLossPsiPer100Ft,
  frictionLossPsiPerFoot,
  insideDiameter,
  nominalSizes,
  psiToHead,
  sizeLabel,
  velocity,
  type FittingKey,
  type PipeMaterial,
} from "@/lib/plumbing";

const DEFAULT_FITTINGS: Partial<Record<FittingKey, number>> = {
  elbow90: 6,
  teeBranch: 2,
  ballValve: 2,
};

export function initPlumbingFrictionLossCalculator(): void {
  const gpm = document.getElementById("fl-gpm") as HTMLInputElement | null;
  const gpmRange = document.getElementById("fl-gpm-range") as HTMLInputElement | null;
  const material = document.getElementById("fl-material") as HTMLSelectElement | null;
  const size = document.getElementById("fl-size") as HTMLSelectElement | null;
  const measured = document.getElementById("fl-measured") as HTMLInputElement | null;
  const resetBtn = document.getElementById("fl-reset");
  const fittingInputs = Array.from(
    document.querySelectorAll<HTMLInputElement>("[data-fl-fitting]"),
  );

  const out = {
    per100: document.getElementById("fl-per-100"),
    note: document.getElementById("fl-note"),
    total: document.getElementById("fl-total"),
    developed: document.getElementById("fl-developed"),
    bdId: document.getElementById("fl-bd-id"),
    bdC: document.getElementById("fl-bd-c"),
    bdVelocity: document.getElementById("fl-bd-velocity"),
    bdFittingFeet: document.getElementById("fl-bd-fitting-feet"),
    bdHead: document.getElementById("fl-bd-head"),
    bdNextSize: document.getElementById("fl-bd-next-size"),
  };

  if (
    !gpm ||
    !gpmRange ||
    !material ||
    !size ||
    !measured ||
    fittingInputs.length === 0 ||
    !out.per100 ||
    !out.note ||
    !out.total ||
    !out.developed ||
    !out.bdId ||
    !out.bdC ||
    !out.bdVelocity ||
    !out.bdFittingFeet ||
    !out.bdHead ||
    !out.bdNextSize
  ) {
    return;
  }

  function syncSizes(): void {
    const mat = material!.value as PipeMaterial;
    const sizes = nominalSizes(mat);
    const previous = parseFloat(size!.value);
    size!.innerHTML = "";
    sizes.forEach((n) => {
      const option = document.createElement("option");
      option.value = String(n);
      option.textContent = sizeLabel(n);
      size!.appendChild(option);
    });
    size!.value = sizes.includes(previous) ? String(previous) : String(sizes[0]);
  }

  function calculate(): void {
    const flow = parseFloat(gpm!.value) || 0;
    const mat = material!.value as PipeMaterial;
    const nominal = parseFloat(size!.value);
    const measuredFt = parseFloat(measured!.value) || 0;

    const id = insideDiameter(mat, nominal);
    if (id === null) return;
    const c = HAZEN_WILLIAMS_C[mat];

    let fittingFeet = 0;
    fittingInputs.forEach((input) => {
      const key = input.dataset.flFitting as FittingKey | undefined;
      if (!key || !(key in FITTING_LD)) return;
      const count = Math.max(0, parseFloat(input.value) || 0);
      fittingFeet += count * fittingEquivalentFeet(key, id);
    });

    const developed = measuredFt + fittingFeet;
    const per100 = frictionLossPsiPer100Ft(flow, id, c);
    const total = frictionLossPsiPerFoot(flow, id, c) * developed;
    const v = velocity(flow, id);

    out.per100!.textContent = `${fmt(per100, 2)} psi`;
    out.total!.textContent = `${fmt(total, 2)} psi`;
    out.developed!.textContent = `${fmt(developed, 1)} ft`;
    out.bdId!.textContent = `${fmt(id, 3)} in`;
    out.bdC!.textContent = String(c);
    out.bdVelocity!.textContent = `${fmt(v, 2)} ft/s`;
    out.bdFittingFeet!.textContent = `${fmt(fittingFeet, 1)} ft (${fmt(
      developed > 0 ? (fittingFeet / developed) * 100 : 0,
      0,
    )}% of the run)`;
    out.bdHead!.textContent = `${fmt(psiToHead(total), 1)} ft of head`;

    const sizes = nominalSizes(mat);
    const index = sizes.indexOf(nominal);
    if (index >= 0 && index < sizes.length - 1) {
      const nextId = insideDiameter(mat, sizes[index + 1]);
      if (nextId === null) {
        out.bdNextSize!.textContent = "—";
      } else {
        const nextPer100 = frictionLossPsiPer100Ft(flow, nextId, c);
        const cut = per100 > 0 ? (1 - nextPer100 / per100) * 100 : 0;
        out.bdNextSize!.textContent = `${sizeLabel(sizes[index + 1])} → ${fmt(nextPer100, 2)} psi/100 ft (${fmt(cut, 0)}% less)`;
      }
    } else {
      out.bdNextSize!.textContent = "largest listed size";
    }

    out.note!.textContent =
      fittingFeet > measuredFt * 0.25
        ? `Fittings add ${fmt(fittingFeet, 1)} ft of equivalent pipe — more than a quarter of the measured run, so they are not a rounding error here.`
        : `Fittings add ${fmt(fittingFeet, 1)} ft of equivalent pipe on top of the ${fmt(measuredFt, 0)} ft measured.`;
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
  material.addEventListener("change", () => {
    syncSizes();
    calculate();
  });
  size.addEventListener("change", calculate);
  measured.addEventListener("input", calculate);
  fittingInputs.forEach((input) => input.addEventListener("input", calculate));

  resetBtn?.addEventListener("click", () => {
    gpm.value = "10";
    gpmRange.value = "10";
    material.value = "copper-l";
    syncSizes();
    size.value = "0.75";
    measured.value = "100";
    fittingInputs.forEach((input) => {
      const key = input.dataset.flFitting as FittingKey | undefined;
      input.value = String(key ? (DEFAULT_FITTINGS[key] ?? 0) : 0);
    });
    calculate();
  });

  calculate();
}
