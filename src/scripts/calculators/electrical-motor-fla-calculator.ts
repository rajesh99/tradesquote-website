import {
  CONDUCTOR_SIZES,
  OVERLOAD_PERCENT,
  SQRT3,
  ampacityOf,
  fmt,
  fmtSmart,
  motorConductorAmps,
  motorFlc,
  motorOverloadMax,
  motorOverloadRating,
  sizeLabel,
  type ConductorMaterial,
  type MotorPhase,
  type OverloadClass,
} from "@/lib/nec";

/**
 * Motor full-load amperes, and the one distinction the whole article turns on:
 *
 *   NEC 430.6(A)(1) — conductors and the branch-circuit protective device are
 *   sized from the TABLE full-load current (430.248 single-phase, 430.250
 *   three-phase), never from the nameplate.
 *   NEC 430.32       — the overload device is sized from the NAMEPLATE FLA.
 *
 * Motor branch circuits are routed out of 240.4(D) by 240.4(G), so the
 * small-conductor caps that limit 14/12/10 AWG elsewhere do not apply here.
 */
function motorConductor(requiredAmps: number, material: ConductorMaterial) {
  return (
    CONDUCTOR_SIZES.find((size) => {
      const amps = ampacityOf(size, material, 75);
      return amps !== null && amps >= requiredAmps;
    }) ?? null
  );
}

export function initElectricalMotorFlaCalculator(): void {
  const hp = document.getElementById("mf-hp") as HTMLSelectElement | null;
  const phase = document.getElementById("mf-phase") as HTMLSelectElement | null;
  const volts = document.getElementById("mf-volts") as HTMLSelectElement | null;
  const nameplate = document.getElementById("mf-nameplate") as HTMLInputElement | null;
  const overloadClass = document.getElementById("mf-overload-class") as HTMLSelectElement | null;
  const material = document.getElementById("mf-material") as HTMLSelectElement | null;
  const resetBtn = document.getElementById("mf-reset");

  const out = {
    flc: document.getElementById("mf-flc"),
    conductorAmps: document.getElementById("mf-conductor-amps"),
    conductor: document.getElementById("mf-conductor"),
    overload: document.getElementById("mf-overload"),
    note: document.getElementById("mf-note"),
    bdTable: document.getElementById("mf-bd-table"),
    bdNameplate: document.getElementById("mf-bd-nameplate"),
    bdConductorAmps: document.getElementById("mf-bd-conductor-amps"),
    bdConductor: document.getElementById("mf-bd-conductor"),
    bdOverload: document.getElementById("mf-bd-overload"),
    bdOverloadMax: document.getElementById("mf-bd-overload-max"),
    bdKva: document.getElementById("mf-bd-kva"),
  };

  if (!hp || !phase || !volts || !nameplate || !overloadClass || !material) return;
  if (Object.values(out).some((el) => !el)) return;

  /** The two tables list different voltages, so the voltage options follow the phase. */
  function syncVoltageOptions(): void {
    const allowed = phase!.value === "1ph" ? ["115", "200", "208", "230"] : ["200", "208", "230", "460", "575"];
    let current = volts!.value;
    Array.from(volts!.options).forEach((opt) => {
      const ok = allowed.includes(opt.value);
      opt.hidden = !ok;
      opt.disabled = !ok;
    });
    if (!allowed.includes(current)) {
      current = phase!.value === "1ph" ? "230" : "460";
      volts!.value = current;
    }
  }

  function calculate(): void {
    const mode = phase!.value as MotorPhase;
    const hpValue = parseFloat(hp!.value);
    const voltValue = parseFloat(volts!.value);
    const mat = material!.value as ConductorMaterial;
    const klass = overloadClass!.value as OverloadClass;
    const plate = Math.max(0, parseFloat(nameplate!.value) || 0);

    const tableFlc = motorFlc(hpValue, mode, voltValue);

    if (tableFlc === null) {
      out.flc!.textContent = "—";
      out.conductorAmps!.textContent = "—";
      out.conductor!.textContent = "—";
      out.overload!.textContent = "—";
      out.note!.textContent = "That horsepower and voltage combination is not listed in Table 430.248 or 430.250.";
      return;
    }

    const requiredAmps = motorConductorAmps(tableFlc);
    const conductor = motorConductor(requiredAmps, mat);
    const conductorAmpacity = conductor ? (ampacityOf(conductor, mat, 75) ?? 0) : 0;
    const overload = plate > 0 ? motorOverloadRating(plate, klass) : 0;
    const overloadCeiling = plate > 0 ? motorOverloadMax(plate, klass) : 0;
    const kva = (mode === "3ph" ? SQRT3 * voltValue * tableFlc : voltValue * tableFlc) / 1000;

    out.flc!.textContent = `${fmtSmart(tableFlc)} A`;
    out.conductorAmps!.textContent = `${fmtSmart(requiredAmps)} A`;
    out.conductor!.textContent = conductor ? `${sizeLabel(conductor.label)} ${mat}` : "—";
    out.overload!.textContent = plate > 0 ? `${fmtSmart(overload)} A` : "—";

    if (plate <= 0) {
      out.note!.textContent =
        "Enter the nameplate full-load amperes to get the overload rating. The table value above still governs the conductors and the breaker.";
    } else if (plate > tableFlc) {
      out.note!.textContent = `This nameplate reads higher than the ${fmtSmart(tableFlc)} A table value. Conductors and the breaker still come from the table (430.6(A)(1)); only the overload follows the nameplate.`;
    } else {
      const gap = ((tableFlc - plate) / plate) * 100;
      out.note!.textContent = `The table value is ${fmt(gap, 1)}% above this nameplate — normal, because Table 430.250 is deliberately conservative. Size conductors and the breaker from ${fmtSmart(tableFlc)} A, and the overload from ${fmtSmart(plate)} A.`;
    }

    out.bdTable!.textContent = `${fmtSmart(tableFlc)} A (Table ${mode === "1ph" ? "430.248" : "430.250"} at ${voltValue} V)`;
    out.bdNameplate!.textContent = plate > 0 ? `${fmtSmart(plate)} A` : "not entered";
    out.bdConductorAmps!.textContent = `${fmtSmart(tableFlc)} × 1.25 = ${fmtSmart(requiredAmps)} A`;
    out.bdConductor!.textContent = conductor
      ? `${sizeLabel(conductor.label)} ${mat} — ${conductorAmpacity} A at 75 °C`
      : "Parallel conductors required";
    out.bdOverload!.textContent =
      plate > 0
        ? `${fmtSmart(plate)} × ${OVERLOAD_PERCENT[klass].percent}% = ${fmtSmart(overload)} A`
        : "—";
    out.bdOverloadMax!.textContent = plate > 0 ? `${fmtSmart(overloadCeiling)} A (430.32(C))` : "—";
    out.bdKva!.textContent = `${fmt(kva, 2)} kVA`;
  }

  phase.addEventListener("change", () => {
    syncVoltageOptions();
    calculate();
  });
  [hp, volts, overloadClass, material].forEach((el) => el.addEventListener("change", calculate));
  nameplate.addEventListener("input", calculate);

  resetBtn?.addEventListener("click", () => {
    hp.value = "10";
    phase.value = "3ph";
    syncVoltageOptions();
    volts.value = "460";
    nameplate.value = "13";
    overloadClass.value = "serviceFactor115";
    material.value = "copper";
    calculate();
  });

  syncVoltageOptions();
  calculate();
}
