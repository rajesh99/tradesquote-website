import { fmt, fmtInt, usd } from "@/lib/nec";

/** Base cost per square foot by how accessible the existing wiring is. */
const ACCESS_RATE: Record<string, number> = {
  easy: 4,
  average: 7,
  difficult: 12,
};

/** Older construction means cloth or knob-and-tube wiring and more remediation. */
const AGE_MULTIPLIER: Record<string, number> = {
  modern: 1.0,
  midcentury: 1.1,
  old: 1.25,
};

export function initElectricalRewiringCostCalculator(): void {
  const area = document.getElementById("rw-area") as HTMLInputElement | null;
  const areaRange = document.getElementById("rw-area-range") as HTMLInputElement | null;
  const access = document.getElementById("rw-access") as HTMLSelectElement | null;
  const age = document.getElementById("rw-age") as HTMLSelectElement | null;
  const stories = document.getElementById("rw-stories") as HTMLSelectElement | null;
  const panel = document.getElementById("rw-panel") as HTMLSelectElement | null;
  const permit = document.getElementById("rw-permit") as HTMLInputElement | null;
  const resetBtn = document.getElementById("rw-reset");

  const out = {
    total: document.getElementById("rw-total"),
    low: document.getElementById("rw-low"),
    high: document.getElementById("rw-high"),
    perSqft: document.getElementById("rw-per-sqft"),
    note: document.getElementById("rw-note"),
    bdBase: document.getElementById("rw-bd-base"),
    bdAge: document.getElementById("rw-bd-age"),
    bdStories: document.getElementById("rw-bd-stories"),
    bdWiring: document.getElementById("rw-bd-wiring"),
    bdPanel: document.getElementById("rw-bd-panel"),
    bdPermit: document.getElementById("rw-bd-permit"),
    bdTotal: document.getElementById("rw-bd-total"),
  };

  if (!area || !areaRange || !access || !age || !stories || !panel || !permit) return;
  if (Object.values(out).some((el) => !el)) return;

  function calculate(): void {
    const sqft = Math.max(0, parseFloat(area!.value) || 0);
    const rate = ACCESS_RATE[access!.value] ?? 7;
    const ageMult = AGE_MULTIPLIER[age!.value] ?? 1;
    const storyMult = stories!.value === "2" ? 1.15 : 1;
    const panelCost = panel!.value === "yes" ? 3000 : 0;
    const permitFee = Math.max(0, parseFloat(permit!.value) || 0);

    const base = sqft * rate;
    const wiring = base * ageMult * storyMult;
    const total = wiring + panelCost + permitFee;
    const perSqft = sqft > 0 ? total / sqft : 0;

    out.total!.textContent = usd(total);
    out.low!.textContent = usd(total * 0.8);
    out.high!.textContent = usd(total * 1.2);
    out.perSqft!.textContent = `$${fmt(perSqft, 2)}`;

    out.note!.textContent =
      perSqft < 5
        ? `$${fmt(perSqft, 2)}/sq ft is below the $5–$17 range published for US whole-house rewiring — realistic only for a full gut renovation with open walls.`
        : perSqft > 17
          ? `$${fmt(perSqft, 2)}/sq ft is above the usual $5–$17 band. Plaster walls, no attic or crawlspace access, and knob-and-tube removal do reach it.`
          : `$${fmt(perSqft, 2)}/sq ft sits inside the $5–$17 range published for US whole-house rewiring in 2026.`;

    out.bdBase!.textContent = `${fmtInt(sqft)} sq ft × $${rate}/sq ft = ${usd(base)}`;
    out.bdAge!.textContent = `× ${ageMult.toFixed(2)} (${age!.options[age!.selectedIndex].text})`;
    out.bdStories!.textContent = `× ${storyMult.toFixed(2)} (${stories!.value === "2" ? "two storeys" : "single storey"})`;
    out.bdWiring!.textContent = usd(wiring);
    out.bdPanel!.textContent = panelCost > 0 ? `${usd(panelCost)} (200 A service included)` : "Not included — $0";
    out.bdPermit!.textContent = usd(permitFee);
    out.bdTotal!.textContent = usd(total);
  }

  area.addEventListener("input", () => {
    const v = parseFloat(area.value) || 0;
    if (v >= Number(areaRange.min) && v <= Number(areaRange.max)) areaRange.value = String(v);
    calculate();
  });
  areaRange.addEventListener("input", () => {
    area.value = areaRange.value;
    calculate();
  });
  [access, age, stories, panel].forEach((el) => el.addEventListener("change", calculate));
  permit.addEventListener("input", calculate);

  resetBtn?.addEventListener("click", () => {
    area.value = "1800";
    areaRange.value = "1800";
    access.value = "average";
    age.value = "midcentury";
    stories.value = "1";
    panel.value = "yes";
    permit.value = "500";
    calculate();
  });

  calculate();
}
