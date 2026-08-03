import {
  CONDUCTOR_SIZES,
  ambientFactor,
  ampacityOf,
  bundlingFactor,
  fmt,
  nextStandardOcpd,
  smallConductorCap,
  type ConductorMaterial,
  type TempRating,
} from "@/lib/nec";

export function initElectricalAmpacityCalculator(): void {
  const gauge = document.getElementById("amp-gauge") as HTMLSelectElement | null;
  const material = document.getElementById("amp-material") as HTMLSelectElement | null;
  const insulation = document.getElementById("amp-insulation") as HTMLSelectElement | null;
  const ambientF = document.getElementById("amp-ambient") as HTMLInputElement | null;
  const ambientRange = document.getElementById("amp-ambient-range") as HTMLInputElement | null;
  const count = document.getElementById("amp-count") as HTMLInputElement | null;
  const termination = document.getElementById("amp-termination") as HTMLSelectElement | null;
  const resetBtn = document.getElementById("amp-reset");

  const out = {
    derated: document.getElementById("amp-derated"),
    base: document.getElementById("amp-base"),
    maxOcpd: document.getElementById("amp-max-ocpd"),
    note: document.getElementById("amp-note"),
    bdBase: document.getElementById("amp-bd-base"),
    bdAmbient: document.getElementById("amp-bd-ambient"),
    bdBundling: document.getElementById("amp-bd-bundling"),
    bdDerated: document.getElementById("amp-bd-derated"),
    bdTermCap: document.getElementById("amp-bd-term-cap"),
    bdSmallCap: document.getElementById("amp-bd-small-cap"),
    bdGoverning: document.getElementById("amp-bd-governing"),
  };

  if (
    !gauge ||
    !material ||
    !insulation ||
    !ambientF ||
    !ambientRange ||
    !count ||
    !termination ||
    !out.derated ||
    !out.base ||
    !out.maxOcpd ||
    !out.note ||
    !out.bdBase ||
    !out.bdAmbient ||
    !out.bdBundling ||
    !out.bdDerated ||
    !out.bdTermCap ||
    !out.bdSmallCap ||
    !out.bdGoverning
  ) {
    return;
  }

  function calculate(): void {
    const size = CONDUCTOR_SIZES.find((s) => s.label === gauge!.value);
    const mat = material!.value as ConductorMaterial;
    const insulationRating = (parseInt(insulation!.value) || 90) as TempRating;
    const termRating = (parseInt(termination!.value) || 75) as TempRating;
    const conductors = Math.max(1, parseInt(count!.value) || 1);
    const fahrenheit = parseFloat(ambientF!.value);
    const celsius = ((Number.isFinite(fahrenheit) ? fahrenheit : 86) - 32) * (5 / 9);

    const base = size ? ampacityOf(size, mat, insulationRating) : null;
    const termAmpacity = size ? ampacityOf(size, mat, termRating) : null;

    if (!size || base === null) {
      out.derated!.textContent = "—";
      out.base!.textContent = "not listed";
      out.maxOcpd!.textContent = "—";
      out.note!.textContent = `Table 310.16 does not list ${gauge!.value} in ${mat}.`;
      [out.bdBase, out.bdAmbient, out.bdBundling, out.bdDerated, out.bdTermCap, out.bdSmallCap, out.bdGoverning].forEach(
        (el) => {
          if (el) el.textContent = "—";
        },
      );
      return;
    }

    const ambient = ambientFactor(celsius, insulationRating);
    const bundling = bundlingFactor(conductors);
    const derated = base * ambient * bundling;

    // 110.14(C) — the conductor can never be used above its ampacity at the
    // temperature rating of the terminations it lands on.
    const termCap = termAmpacity ?? base;
    const usable = Math.min(derated, termCap);

    // 240.4(D) small-conductor OCPD limit, then 240.4(B) next-size-up allowance.
    const smallCap = smallConductorCap(size.label, mat);
    const nextUp = nextStandardOcpd(usable);
    const maxOcpd = smallCap === null ? nextUp : Math.min(nextUp, smallCap);

    const governing =
      derated <= termCap ? "Derating (310.15)" : `Termination rating (110.14(C), ${termRating} °C)`;

    out.derated!.textContent = `${fmt(usable)} A`;
    out.base!.textContent = `${base} A`;
    out.maxOcpd!.textContent = `${maxOcpd} A`;

    out.note!.textContent =
      derated > termCap
        ? `Derating gives ${fmt(derated)} A, but ${termRating} °C terminations cap this conductor at ${termCap} A.`
        : ambient === 1 && bundling === 1
          ? "No correction or adjustment applies at these conditions."
          : `Base ${base} A × ${ambient} ambient × ${bundling} bundling.`;

    out.bdBase!.textContent = `${base} A (${insulationRating} °C column)`;
    out.bdAmbient!.textContent = `× ${ambient} (${Math.round(celsius)} °C)`;
    out.bdBundling!.textContent = `× ${bundling} (${conductors} conductor${conductors === 1 ? "" : "s"})`;
    out.bdDerated!.textContent = `${fmt(derated)} A`;
    out.bdTermCap!.textContent = `${termCap} A (${termRating} °C)`;
    out.bdSmallCap!.textContent = smallCap === null ? "Does not apply" : `${smallCap} A max`;
    out.bdGoverning!.textContent = governing;
  }

  ambientF.addEventListener("input", () => {
    const value = parseFloat(ambientF.value) || 0;
    if (value >= Number(ambientRange.min) && value <= Number(ambientRange.max)) {
      ambientRange.value = String(value);
    }
    calculate();
  });
  ambientRange.addEventListener("input", () => {
    ambientF.value = ambientRange.value;
    calculate();
  });
  [gauge, material, insulation, termination].forEach((el) => el.addEventListener("change", calculate));
  count.addEventListener("input", calculate);

  resetBtn?.addEventListener("click", () => {
    gauge.value = "10";
    material.value = "copper";
    insulation.value = "90";
    ambientF.value = "104";
    ambientRange.value = "104";
    count.value = "6";
    termination.value = "75";
    calculate();
  });

  calculate();
}
