import {
  HAZEN_WILLIAMS_C,
  fmt,
  frictionLossPsiPerFoot,
  insideDiameter,
  nominalSizes,
  psiToHead,
  sizeLabel,
  totalDynamicHead,
  velocity,
  velocityHead,
  type PipeMaterial,
} from "@/lib/plumbing";

export function initPlumbingPumpHeadCalculator(): void {
  const gpm = document.getElementById("ph-gpm") as HTMLInputElement | null;
  const gpmRange = document.getElementById("ph-gpm-range") as HTMLInputElement | null;
  const lift = document.getElementById("ph-lift") as HTMLInputElement | null;
  const material = document.getElementById("ph-material") as HTMLSelectElement | null;
  const size = document.getElementById("ph-size") as HTMLSelectElement | null;
  const length = document.getElementById("ph-length") as HTMLInputElement | null;
  const discharge = document.getElementById("ph-discharge") as HTMLInputElement | null;
  const resetBtn = document.getElementById("ph-reset");

  const out = {
    tdh: document.getElementById("ph-tdh"),
    note: document.getElementById("ph-note"),
    friction: document.getElementById("ph-friction"),
    velocity: document.getElementById("ph-velocity"),
    bdStatic: document.getElementById("ph-bd-static"),
    bdFrictionPsi: document.getElementById("ph-bd-friction-psi"),
    bdPressure: document.getElementById("ph-bd-pressure"),
    bdVelocityHead: document.getElementById("ph-bd-velocity-head"),
    bdShare: document.getElementById("ph-bd-share"),
  };

  if (
    !gpm ||
    !gpmRange ||
    !lift ||
    !material ||
    !size ||
    !length ||
    !discharge ||
    !out.tdh ||
    !out.note ||
    !out.friction ||
    !out.velocity ||
    !out.bdStatic ||
    !out.bdFrictionPsi ||
    !out.bdPressure ||
    !out.bdVelocityHead ||
    !out.bdShare
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
    const flow = Math.max(0, parseFloat(gpm!.value) || 0);
    const staticLift = parseFloat(lift!.value) || 0;
    const mat = material!.value as PipeMaterial;
    const nominal = parseFloat(size!.value);
    const developed = Math.max(0, parseFloat(length!.value) || 0);
    const dischargePsi = Math.max(0, parseFloat(discharge!.value) || 0);

    const id = insideDiameter(mat, nominal);
    if (id === null) return;
    const c = HAZEN_WILLIAMS_C[mat];

    const frictionPsi = frictionLossPsiPerFoot(flow, id, c) * developed;
    const frictionFt = psiToHead(frictionPsi);
    const pressureFt = psiToHead(dischargePsi);
    const v = velocity(flow, id);
    const vHead = velocityHead(v);

    const tdh = totalDynamicHead({
      staticLiftFeet: staticLift,
      frictionHeadFeet: frictionFt,
      pressureHeadFeet: pressureFt,
      velocityHeadFeet: vHead,
    });

    out.tdh!.textContent = `${fmt(tdh, 2)} ft`;
    out.friction!.textContent = `${fmt(frictionFt, 2)} ft`;
    out.velocity!.textContent = `${fmt(v, 2)} ft/s`;

    const staticShare = tdh > 0 ? (staticLift / tdh) * 100 : 0;
    const frictionShare = tdh > 0 ? (frictionFt / tdh) * 100 : 0;

    if (frictionShare > staticShare) {
      out.note!.textContent = `Friction dominates at ${fmt(frictionShare, 0)}% of the total — a bigger discharge pipe would cut the head the pump has to make.`;
    } else {
      out.note!.textContent = `Static lift dominates at ${fmt(staticShare, 0)}% of the total, so pipe size makes little difference here.`;
    }

    out.bdStatic!.textContent = `${fmt(staticLift, 1)} ft (${fmt(staticShare, 0)}%)`;
    out.bdFrictionPsi!.textContent = `${fmt(frictionPsi, 2)} psi = ${fmt(frictionFt, 2)} ft`;
    out.bdPressure!.textContent =
      dischargePsi > 0 ? `${fmt(dischargePsi, 1)} psi = ${fmt(pressureFt, 2)} ft` : "none — open discharge";
    out.bdVelocityHead!.textContent = `${fmt(vHead, 3)} ft (${fmt(tdh > 0 ? (vHead / tdh) * 100 : 0, 1)}%)`;
    out.bdShare!.textContent = `${fmt(tdh, 2)} ft total, ${fmt(tdh / 2.309, 1)} psi equivalent`;
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
  [lift, length, discharge].forEach((el) => el.addEventListener("input", calculate));

  resetBtn?.addEventListener("click", () => {
    gpm.value = "30";
    gpmRange.value = "30";
    lift.value = "12";
    material.value = "pvc-40";
    syncSizes();
    size.value = "1.5";
    length.value = "40";
    discharge.value = "0";
    calculate();
  });

  calculate();
}
