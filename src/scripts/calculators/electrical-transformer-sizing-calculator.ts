import {
  TRANSFORMER_SECONDARY_MAX_PERCENT,
  findSizeByAmpacity,
  fmt,
  fmtInt,
  fmtSmart,
  nextStandardOcpd,
  nextStandardTransformerKva,
  prevStandardOcpd,
  sizeLabel,
  transformerFla,
  transformerPrimaryMaxPercent,
  typicalPercentZ,
  type MotorPhase,
} from "@/lib/nec";

/**
 * Transformer sizing and NEC 450.3(B) overcurrent protection.
 *
 * The rule people get wrong is that the primary device is NOT limited to 125% of
 * primary current in the normal case. Where secondary protection is provided at
 * no more than 125% of secondary current, Table 450.3(B) permits the primary
 * device to go to 250% — which is what lets a transformer's magnetising inrush
 * through without nuisance tripping. Primary-only protection is the restrictive
 * case, and it gets more generous as the primary current gets smaller (167%
 * below 9 A, 300% below 2 A).
 *
 * Note also that 450.3 protects the TRANSFORMER. Secondary conductors are a
 * separate problem governed by 240.21(C).
 */
export function initElectricalTransformerSizingCalculator(): void {
  const loadKva = document.getElementById("ts-load") as HTMLInputElement | null;
  const growth = document.getElementById("ts-growth") as HTMLInputElement | null;
  const growthRange = document.getElementById("ts-growth-range") as HTMLInputElement | null;
  const phase = document.getElementById("ts-phase") as HTMLSelectElement | null;
  const primaryVolts = document.getElementById("ts-primary") as HTMLSelectElement | null;
  const secondaryVolts = document.getElementById("ts-secondary") as HTMLSelectElement | null;
  const secondaryProtection = document.getElementById("ts-secondary-protection") as HTMLSelectElement | null;
  const resetBtn = document.getElementById("ts-reset");

  const out = {
    kva: document.getElementById("ts-kva"),
    primaryFla: document.getElementById("ts-primary-fla"),
    secondaryFla: document.getElementById("ts-secondary-fla"),
    primaryOcpd: document.getElementById("ts-primary-ocpd"),
    secondaryOcpd: document.getElementById("ts-secondary-ocpd"),
    note: document.getElementById("ts-note"),
    bdRequired: document.getElementById("ts-bd-required"),
    bdSelected: document.getElementById("ts-bd-selected"),
    bdPrimaryFla: document.getElementById("ts-bd-primary-fla"),
    bdSecondaryFla: document.getElementById("ts-bd-secondary-fla"),
    bdPrimaryCeiling: document.getElementById("ts-bd-primary-ceiling"),
    bdSecondaryCeiling: document.getElementById("ts-bd-secondary-ceiling"),
    bdPrimaryConductor: document.getElementById("ts-bd-primary-conductor"),
    bdSecondaryConductor: document.getElementById("ts-bd-secondary-conductor"),
    bdImpedance: document.getElementById("ts-bd-impedance"),
  };

  if (!loadKva || !growth || !growthRange || !phase || !primaryVolts || !secondaryVolts) return;
  if (!secondaryProtection) return;
  if (Object.values(out).some((el) => !el)) return;

  function calculate(): void {
    const load = Math.max(0, parseFloat(loadKva!.value) || 0);
    const growthPct = Math.min(100, Math.max(0, parseFloat(growth!.value) || 0));
    const mode = phase!.value as MotorPhase;
    const priV = parseFloat(primaryVolts!.value) || 480;
    const secV = parseFloat(secondaryVolts!.value) || 208;
    const hasSecondary = secondaryProtection!.value === "yes";

    const required = load * (1 + growthPct / 100);
    const selected = nextStandardTransformerKva(required);

    const priFla = transformerFla(selected, priV, mode);
    const secFla = transformerFla(selected, secV, mode);

    const priPercent = transformerPrimaryMaxPercent(priFla, hasSecondary);
    const priCeiling = (priFla * priPercent) / 100;
    // "Shall not exceed" — so take the largest standard rating at or below the ceiling.
    const priPick = prevStandardOcpd(priCeiling);

    const secCeiling = (secFla * TRANSFORMER_SECONDARY_MAX_PERCENT) / 100;
    // Table 450.3(B) Note 1 permits the next higher standard rating on the 125% entries.
    const secPick = nextStandardOcpd(secCeiling);

    const priConductor = findSizeByAmpacity(priPick, "copper", 75);
    const secConductor = findSizeByAmpacity(secCeiling, "copper", 75);
    const percentZ = typicalPercentZ(selected);

    out.kva!.textContent = `${fmt(selected, selected % 1 === 0 ? 0 : 1)} kVA`;
    out.primaryFla!.textContent = `${fmtSmart(priFla)} A`;
    out.secondaryFla!.textContent = `${fmtSmart(secFla)} A`;
    out.primaryOcpd!.textContent = `${priPick} A`;
    out.secondaryOcpd!.textContent = `${secPick} A`;

    const headroom = selected > 0 ? ((selected - required) / selected) * 100 : 0;
    if (load <= 0) {
      out.note!.textContent = "Enter the connected load in kVA to size the transformer.";
    } else if (hasSecondary) {
      out.note!.textContent = `With secondary protection at ${TRANSFORMER_SECONDARY_MAX_PERCENT}% of secondary current, Table 450.3(B) lets the primary device go to ${priPercent}% — ${fmtSmart(priCeiling)} A here. That headroom is what carries the magnetising inrush without nuisance tripping. The ${fmt(selected, 0)} kVA size leaves ${fmt(headroom, 0)}% spare over the ${fmt(required, 1)} kVA required.`;
    } else {
      out.note!.textContent = `Primary protection only, so the ceiling is ${priPercent}% of ${fmtSmart(priFla)} A = ${fmtSmart(priCeiling)} A. Adding secondary protection at 125% would raise the primary allowance to 250% and usually solves inrush tripping.`;
    }

    out.bdRequired!.textContent = `${fmt(load, 1)} × ${(1 + growthPct / 100).toFixed(2)} = ${fmt(required, 1)} kVA`;
    out.bdSelected!.textContent = `${fmt(selected, selected % 1 === 0 ? 0 : 1)} kVA standard size`;
    out.bdPrimaryFla!.textContent = `${fmtInt(selected * 1000)} VA ÷ (${mode === "3ph" ? "1.732 × " : ""}${priV} V) = ${fmtSmart(priFla)} A`;
    out.bdSecondaryFla!.textContent = `${fmtInt(selected * 1000)} VA ÷ (${mode === "3ph" ? "1.732 × " : ""}${secV} V) = ${fmtSmart(secFla)} A`;
    out.bdPrimaryCeiling!.textContent = `${priPercent}% × ${fmtSmart(priFla)} = ${fmtSmart(priCeiling)} A → ${priPick} A`;
    out.bdSecondaryCeiling!.textContent = `125% × ${fmtSmart(secFla)} = ${fmtSmart(secCeiling)} A → ${secPick} A (Note 1)`;
    out.bdPrimaryConductor!.textContent = priConductor
      ? `${sizeLabel(priConductor.label)} Cu for the ${priPick} A device`
      : "Parallel conductors required";
    out.bdSecondaryConductor!.textContent = secConductor
      ? `${sizeLabel(secConductor.label)} Cu for ${fmtSmart(secCeiling)} A`
      : "Parallel conductors required";
    out.bdImpedance!.textContent = `${percentZ}% typical for ${fmt(selected, 0)} kVA — use the nameplate`;
  }

  growth.addEventListener("input", () => {
    const value = parseFloat(growth.value) || 0;
    if (value >= Number(growthRange.min) && value <= Number(growthRange.max)) growthRange.value = String(value);
    calculate();
  });
  growthRange.addEventListener("input", () => {
    growth.value = growthRange.value;
    calculate();
  });
  loadKva.addEventListener("input", calculate);
  [phase, primaryVolts, secondaryVolts, secondaryProtection].forEach((el) => el.addEventListener("change", calculate));

  resetBtn?.addEventListener("click", () => {
    loadKva.value = "60";
    growth.value = "25";
    growthRange.value = "25";
    phase.value = "3ph";
    primaryVolts.value = "480";
    secondaryVolts.value = "208";
    secondaryProtection.value = "yes";
    calculate();
  });

  calculate();
}
