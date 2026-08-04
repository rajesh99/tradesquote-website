import {
  CONDUCTOR_SIZES,
  MOTOR_DEVICE_LABELS,
  OVERLOAD_PERCENT,
  TABLE_430_52,
  ampacityOf,
  egcSize,
  fmt,
  fmtSmart,
  motorConductorAmps,
  motorFlc,
  motorOcpdAbsoluteMax,
  motorOverloadMax,
  motorOverloadRating,
  prevStandardOcpd,
  sizeLabel,
  voltageDrop,
  type ConductorMaterial,
  type MotorPhase,
  type MotorProtectionDevice,
  type MotorType,
  type OverloadClass,
} from "@/lib/nec";

/**
 * The complete motor branch circuit — the one place in the NEC where the breaker
 * is deliberately far larger than the conductor's ampacity.
 *
 *   430.22  conductors at 125% of the TABLE full-load current
 *   430.52  short-circuit / ground-fault device at up to 250–300% of that current
 *   430.32  overload device at 115–125% of the NAMEPLATE amperes
 *   240.4(G) is what makes the oversized breaker legal: the overload device, not
 *            the breaker, is what protects the conductor against overload.
 *
 * Because 240.4(G) applies, the 240.4(D) small-conductor caps do not.
 */
function motorConductor(requiredAmps: number, material: ConductorMaterial) {
  return (
    CONDUCTOR_SIZES.find((size) => {
      const amps = ampacityOf(size, material, 75);
      return amps !== null && amps >= requiredAmps;
    }) ?? null
  );
}

export function initElectricalMotorCircuitCalculator(): void {
  const hp = document.getElementById("mcc-hp") as HTMLSelectElement | null;
  const phase = document.getElementById("mcc-phase") as HTMLSelectElement | null;
  const volts = document.getElementById("mcc-volts") as HTMLSelectElement | null;
  const nameplate = document.getElementById("mcc-nameplate") as HTMLInputElement | null;
  const motorType = document.getElementById("mcc-motor-type") as HTMLSelectElement | null;
  const device = document.getElementById("mcc-device") as HTMLSelectElement | null;
  const overloadClass = document.getElementById("mcc-overload-class") as HTMLSelectElement | null;
  const material = document.getElementById("mcc-material") as HTMLSelectElement | null;
  const length = document.getElementById("mcc-length") as HTMLInputElement | null;
  const lengthRange = document.getElementById("mcc-length-range") as HTMLInputElement | null;
  const resetBtn = document.getElementById("mcc-reset");

  const out = {
    ocpd: document.getElementById("mcc-ocpd"),
    conductor: document.getElementById("mcc-conductor"),
    overload: document.getElementById("mcc-overload"),
    egc: document.getElementById("mcc-egc"),
    note: document.getElementById("mcc-note"),
    bdFlc: document.getElementById("mcc-bd-flc"),
    bdConductorAmps: document.getElementById("mcc-bd-conductor-amps"),
    bdConductor: document.getElementById("mcc-bd-conductor"),
    bdOcpdCeiling: document.getElementById("mcc-bd-ocpd-ceiling"),
    bdOcpdPick: document.getElementById("mcc-bd-ocpd-pick"),
    bdOcpdMax: document.getElementById("mcc-bd-ocpd-max"),
    bdOverload: document.getElementById("mcc-bd-overload"),
    bdEgc: document.getElementById("mcc-bd-egc"),
    bdDrop: document.getElementById("mcc-bd-drop"),
  };

  if (!hp || !phase || !volts || !nameplate || !motorType || !device || !overloadClass) return;
  if (!material || !length || !lengthRange) return;
  if (Object.values(out).some((el) => !el)) return;

  function syncVoltageOptions(): void {
    const allowed = phase!.value === "1ph" ? ["115", "200", "208", "230"] : ["200", "208", "230", "460", "575"];
    Array.from(volts!.options).forEach((opt) => {
      const ok = allowed.includes(opt.value);
      opt.hidden = !ok;
      opt.disabled = !ok;
    });
    if (!allowed.includes(volts!.value)) volts!.value = phase!.value === "1ph" ? "230" : "460";
  }

  /** Single-phase motors take the single-phase row of Table 430.52. */
  function syncMotorTypeOptions(): void {
    const single = phase!.value === "1ph";
    Array.from(motorType!.options).forEach((opt) => {
      const isSingle = opt.value === "singlePhase";
      opt.hidden = single ? !isSingle && opt.value !== "dc" : isSingle;
      opt.disabled = opt.hidden;
    });
    if (motorType!.selectedOptions[0]?.disabled) motorType!.value = single ? "singlePhase" : "designB";
  }

  function calculate(): void {
    const mode = phase!.value as MotorPhase;
    const hpValue = parseFloat(hp!.value);
    const voltValue = parseFloat(volts!.value);
    const mat = material!.value as ConductorMaterial;
    const type = motorType!.value as MotorType;
    const dev = device!.value as MotorProtectionDevice;
    const klass = overloadClass!.value as OverloadClass;
    const plate = Math.max(0, parseFloat(nameplate!.value) || 0);
    const runFt = Math.max(0, parseFloat(length!.value) || 0);

    const flc = motorFlc(hpValue, mode, voltValue);
    if (flc === null) {
      out.note!.textContent = "That horsepower and voltage combination is not listed in Table 430.248 or 430.250.";
      return;
    }

    const requiredAmps = motorConductorAmps(flc);
    const conductor = motorConductor(requiredAmps, mat);
    const conductorAmpacity = conductor ? (ampacityOf(conductor, mat, 75) ?? 0) : 0;

    const percent = TABLE_430_52[type][dev];
    const ceiling = (flc * percent) / 100;
    const pick = prevStandardOcpd(ceiling);
    const absoluteMax = motorOcpdAbsoluteMax(flc, dev);

    const overload = plate > 0 ? motorOverloadRating(plate, klass) : 0;
    const egc = egcSize(pick, "copper");

    const drop = conductor
      ? voltageDrop({
          cmil: conductor.cmil,
          material: mat,
          amps: flc,
          lengthFt: runFt,
          phase: mode === "3ph" ? 3 : 1,
        })
      : 0;
    const dropPercent = voltValue > 0 ? (drop / voltValue) * 100 : 0;

    out.ocpd!.textContent = `${pick} A`;
    out.conductor!.textContent = conductor ? `${sizeLabel(conductor.label)} ${mat}` : "—";
    out.overload!.textContent = plate > 0 ? `${fmtSmart(overload)} A` : "—";
    out.egc!.textContent = `${sizeLabel(egc)} copper`;

    const ratio = conductorAmpacity > 0 ? pick / conductorAmpacity : 0;
    if (ratio > 1) {
      out.note!.textContent = `That is a ${pick} A device protecting a conductor rated ${conductorAmpacity} A — ${fmt(ratio, 1)}× its ampacity, and entirely correct. 240.4(G) routes motor circuits to 430.52, and the ${fmtSmart(overload)} A overload device is what protects the conductor.`;
    } else {
      out.note!.textContent = `The ${pick} A device sits within the conductor's ${conductorAmpacity} A ampacity here. The overload device still has to be set from the nameplate, not the breaker.`;
    }

    out.bdFlc!.textContent = `${fmtSmart(flc)} A (Table ${mode === "1ph" ? "430.248" : "430.250"})`;
    out.bdConductorAmps!.textContent = `${fmtSmart(flc)} × 1.25 = ${fmtSmart(requiredAmps)} A`;
    out.bdConductor!.textContent = conductor
      ? `${sizeLabel(conductor.label)} ${mat} — ${conductorAmpacity} A at 75 °C`
      : "Parallel conductors required";
    out.bdOcpdCeiling!.textContent = `${percent}% × ${fmtSmart(flc)} = ${fmtSmart(ceiling)} A`;
    out.bdOcpdPick!.textContent = `${pick} A — ${MOTOR_DEVICE_LABELS[dev]}`;
    out.bdOcpdMax!.textContent = `${fmtSmart(absoluteMax)} A if it will not start`;
    out.bdOverload!.textContent =
      plate > 0
        ? `${fmtSmart(plate)} × ${OVERLOAD_PERCENT[klass].percent}% = ${fmtSmart(overload)} A (max ${fmtSmart(motorOverloadMax(plate, klass))} A)`
        : "enter the nameplate FLA";
    out.bdEgc!.textContent = `${sizeLabel(egc)} copper (Table 250.122, by the ${pick} A device)`;
    out.bdDrop!.textContent = `${fmt(dropPercent, 2)}% over ${Math.round(runFt)} ft${dropPercent > 3 ? " — over 3%, upsize" : ""}`;
  }

  length.addEventListener("input", () => {
    const value = parseFloat(length.value) || 0;
    if (value >= Number(lengthRange.min) && value <= Number(lengthRange.max)) lengthRange.value = String(value);
    calculate();
  });
  lengthRange.addEventListener("input", () => {
    length.value = lengthRange.value;
    calculate();
  });
  phase.addEventListener("change", () => {
    syncVoltageOptions();
    syncMotorTypeOptions();
    calculate();
  });
  [hp, volts, motorType, device, overloadClass, material].forEach((el) => el.addEventListener("change", calculate));
  nameplate.addEventListener("input", calculate);

  resetBtn?.addEventListener("click", () => {
    hp.value = "10";
    phase.value = "3ph";
    syncVoltageOptions();
    syncMotorTypeOptions();
    volts.value = "460";
    nameplate.value = "13";
    motorType.value = "designB";
    device.value = "inverseTime";
    overloadClass.value = "serviceFactor115";
    material.value = "copper";
    length.value = "100";
    lengthRange.value = "100";
    calculate();
  });

  syncVoltageOptions();
  syncMotorTypeOptions();
  calculate();
}
