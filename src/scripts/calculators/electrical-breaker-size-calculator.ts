import {
  findSizeByAmpacity,
  fmt,
  nextStandardOcpd,
  sizeLabel,
  smallConductorCap,
  ampacityOf,
  type ConductorMaterial,
  type TempRating,
} from "@/lib/nec";

export function initElectricalBreakerSizeCalculator(): void {
  const nonCont = document.getElementById("br-noncont") as HTMLInputElement | null;
  const cont = document.getElementById("br-cont") as HTMLInputElement | null;
  const contRange = document.getElementById("br-cont-range") as HTMLInputElement | null;
  const voltage = document.getElementById("br-voltage") as HTMLSelectElement | null;
  const material = document.getElementById("br-material") as HTMLSelectElement | null;
  const temp = document.getElementById("br-temp") as HTMLSelectElement | null;
  const resetBtn = document.getElementById("br-reset");

  const out = {
    size: document.getElementById("br-size"),
    required: document.getElementById("br-required"),
    conductor: document.getElementById("br-conductor"),
    note: document.getElementById("br-note"),
    bdNonCont: document.getElementById("br-bd-noncont"),
    bdCont: document.getElementById("br-bd-cont"),
    bdTotal: document.getElementById("br-bd-total"),
    bdStandard: document.getElementById("br-bd-standard"),
    bdConductor: document.getElementById("br-bd-conductor"),
    bdAmpacity: document.getElementById("br-bd-ampacity"),
    bdVa: document.getElementById("br-bd-va"),
  };

  if (
    !nonCont ||
    !cont ||
    !contRange ||
    !voltage ||
    !material ||
    !temp ||
    !out.size ||
    !out.required ||
    !out.conductor ||
    !out.note ||
    !out.bdNonCont ||
    !out.bdCont ||
    !out.bdTotal ||
    !out.bdStandard ||
    !out.bdConductor ||
    !out.bdAmpacity ||
    !out.bdVa
  ) {
    return;
  }

  function calculate(): void {
    const nc = Math.max(0, parseFloat(nonCont!.value) || 0);
    const c = Math.max(0, parseFloat(cont!.value) || 0);
    const volts = parseFloat(voltage!.value) || 240;
    const mat = material!.value as ConductorMaterial;
    const tempRating = (parseInt(temp!.value) || 75) as TempRating;

    // NEC 210.20(A) — continuous loads at 125%, non-continuous at 100%.
    const required = nc + c * 1.25;
    const breaker = nextStandardOcpd(required);

    // NEC 240.4 — the conductor must be protected at its ampacity.
    const conductorSize = findSizeByAmpacity(breaker, mat, tempRating);
    const conductorAmpacity = conductorSize ? (ampacityOf(conductorSize, mat, tempRating) ?? 0) : 0;
    const cap = conductorSize ? smallConductorCap(conductorSize.label, mat) : null;

    out.size!.textContent = `${breaker} A`;
    out.required!.textContent = `${fmt(required)} A`;
    out.conductor!.textContent = conductorSize ? `${sizeLabel(conductorSize.label)} ${mat}` : "—";

    if (required === 0) {
      out.note!.textContent = "Enter the load to size the breaker.";
    } else if (breaker > required) {
      out.note!.textContent = `${fmt(required)} A is not a standard rating — 240.6(A) rounds up to ${breaker} A.`;
    } else {
      out.note!.textContent = `${breaker} A is already a standard 240.6(A) rating — no rounding needed.`;
    }

    out.bdNonCont!.textContent = `${fmt(nc)} A × 1.00 = ${fmt(nc)} A`;
    out.bdCont!.textContent = `${fmt(c)} A × 1.25 = ${fmt(c * 1.25)} A`;
    out.bdTotal!.textContent = `${fmt(required)} A`;
    out.bdStandard!.textContent = `${breaker} A`;
    out.bdConductor!.textContent = conductorSize
      ? `${sizeLabel(conductorSize.label)}${cap === null ? "" : ` (240.4(D) caps at ${cap} A)`}`
      : "Parallel conductors required";
    out.bdAmpacity!.textContent = conductorSize ? `${conductorAmpacity} A at ${tempRating} °C` : "—";
    out.bdVa!.textContent = `${Math.round((nc + c) * volts).toLocaleString("en-US")} VA at ${volts} V`;
  }

  cont.addEventListener("input", () => {
    const value = parseFloat(cont.value) || 0;
    if (value >= Number(contRange.min) && value <= Number(contRange.max)) {
      contRange.value = String(value);
    }
    calculate();
  });
  contRange.addEventListener("input", () => {
    cont.value = contRange.value;
    calculate();
  });
  nonCont.addEventListener("input", calculate);
  [voltage, material, temp].forEach((el) => el.addEventListener("change", calculate));

  resetBtn?.addEventListener("click", () => {
    nonCont.value = "0";
    cont.value = "40";
    contRange.value = "40";
    voltage.value = "240";
    material.value = "copper";
    temp.value = "75";
    calculate();
  });

  calculate();
}
