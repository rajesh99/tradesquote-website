import {
  BTU_PER_WATT,
  SQRT3,
  WATTS_PER_HP,
  fmt,
  fmtInt,
  fmtSmart,
  type PhaseMode,
} from "@/lib/nec";

export function initElectricalUnitConverter(): void {
  const mode = document.getElementById("uc-mode") as HTMLSelectElement | null;
  const value = document.getElementById("uc-value") as HTMLInputElement | null;
  const unit = document.getElementById("uc-unit") as HTMLSelectElement | null;
  const volts = document.getElementById("uc-volts") as HTMLSelectElement | null;
  const pf = document.getElementById("uc-pf") as HTMLInputElement | null;
  const phase = document.getElementById("uc-phase") as HTMLSelectElement | null;
  const acFields = document.getElementById("uc-ac-fields");
  const resetBtn = document.getElementById("uc-reset");

  const out = {
    primary: document.getElementById("uc-primary"),
    label: document.getElementById("uc-primary-label"),
    rows: document.getElementById("uc-rows"),
    note: document.getElementById("uc-note"),
  };

  if (!mode || !value || !unit || !volts || !pf || !phase || !acFields) return;
  if (Object.values(out).some((el) => !el)) return;

  const POWER_UNITS: Record<string, { label: string; toWatts: number }> = {
    W: { label: "watts", toWatts: 1 },
    kW: { label: "kilowatts", toWatts: 1000 },
    hp: { label: "horsepower", toWatts: WATTS_PER_HP },
    "BTU/h": { label: "BTU per hour", toWatts: 1 / BTU_PER_WATT },
  };

  function row(label: string, val: string): string {
    return `<div class="flex justify-between gap-3 border-b border-slate-100 py-2 last:border-0"><span class="text-slate-600">${label}</span><span class="font-semibold text-slate-900">${val}</span></div>`;
  }

  function calculate(): void {
    const m = mode!.value;
    const v = Math.max(0, parseFloat(value!.value) || 0);
    acFields!.classList.toggle("hidden", m === "power");

    if (m === "power") {
      // Pure power conversion — no voltage or power factor involved.
      const u = POWER_UNITS[unit!.value] ?? POWER_UNITS.W;
      const watts = v * u.toWatts;
      out.primary!.textContent = `${fmtInt(watts)} W`;
      out.label!.textContent = "watts";
      out.rows!.innerHTML =
        row("Watts", `${fmtInt(watts)} W`) +
        row("Kilowatts", `${fmt(watts / 1000, 3)} kW`) +
        row("Horsepower", `${fmt(watts / WATTS_PER_HP, 3)} hp`) +
        row("BTU per hour", `${fmtInt(watts * BTU_PER_WATT)} BTU/h`) +
        row("Tons of refrigeration", `${fmt((watts * BTU_PER_WATT) / 12000, 3)} tons`);
      out.note!.textContent = `Using 1 hp = ${WATTS_PER_HP} W and 1 W = ${BTU_PER_WATT} BTU/h.`;
      return;
    }

    // Current ↔ power conversions need voltage, and AC needs power factor.
    const supply = phase!.value as PhaseMode;
    const volt = parseFloat(volts!.value) || 240;
    const powerFactor = supply === "dc" ? 1 : Math.min(1, Math.max(0.1, parseFloat(pf!.value) || 1));
    const divisor = supply === "3ph" ? SQRT3 * volt * powerFactor : volt * powerFactor;
    const vaDivisor = supply === "3ph" ? SQRT3 * volt : volt;

    if (m === "amps-to-power") {
      const watts = v * divisor;
      const va = v * vaDivisor;
      out.primary!.textContent = `${fmtInt(watts)} W`;
      out.label!.textContent = "watts";
      out.rows!.innerHTML =
        row("Real power", `${fmtInt(watts)} W · ${fmt(watts / 1000, 2)} kW`) +
        row("Apparent power", `${fmtInt(va)} VA · ${fmt(va / 1000, 2)} kVA`) +
        row("Horsepower", `${fmt(watts / WATTS_PER_HP, 2)} hp`) +
        row("BTU per hour", `${fmtInt(watts * BTU_PER_WATT)} BTU/h`);
      out.note!.textContent = `${fmtSmart(v)} A at ${volt} V${supply === "3ph" ? " three-phase" : ""}, PF ${powerFactor}.`;
      return;
    }

    // power-to-amps
    const watts = v;
    const amps = divisor > 0 ? watts / divisor : 0;
    const va = watts / powerFactor;
    out.primary!.textContent = `${fmtSmart(amps)} A`;
    out.label!.textContent = "amps";
    out.rows!.innerHTML =
      row("Line current", `${fmtSmart(amps)} A`) +
      row("Apparent power", `${fmtInt(va)} VA · ${fmt(va / 1000, 2)} kVA`) +
      row("Kilowatts", `${fmt(watts / 1000, 2)} kW`) +
      row("Horsepower", `${fmt(watts / WATTS_PER_HP, 2)} hp`);
    out.note!.textContent = `${fmtInt(watts)} W at ${volt} V${supply === "3ph" ? " three-phase" : ""}, PF ${powerFactor}.`;
  }

  [mode, unit, volts, phase].forEach((el) => el.addEventListener("change", calculate));
  [value, pf].forEach((el) => el.addEventListener("input", calculate));

  resetBtn?.addEventListener("click", () => {
    mode.value = "power";
    value.value = "1";
    unit.value = "hp";
    volts.value = "240";
    pf.value = "1";
    phase.value = "1ph";
    calculate();
  });

  calculate();
}
