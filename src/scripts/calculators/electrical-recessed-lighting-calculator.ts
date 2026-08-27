import { fmt, fmtInt } from "@/lib/nec";

/**
 * Recessed can count, worked two independent ways:
 *
 *  1. Spacing — the trade convention is a spacing of roughly ceiling height ÷ 2,
 *     with the first row set half a spacing in from the wall. That produces a grid.
 *  2. Light level — room area × target footcandles gives the lumens the room needs;
 *     divided by the lumens each fixture delivers, that gives a count.
 *
 * Both are reported. Where they disagree, the larger count is the safer starting
 * point and the layout is then adjusted to suit the room.
 */
export function initElectricalRecessedLightingCalculator(): void {
  const length = document.getElementById("rl-length") as HTMLInputElement | null;
  const width = document.getElementById("rl-width") as HTMLInputElement | null;
  const ceiling = document.getElementById("rl-ceiling") as HTMLInputElement | null;
  const ceilingRange = document.getElementById("rl-ceiling-range") as HTMLInputElement | null;
  const lumens = document.getElementById("rl-lumens") as HTMLInputElement | null;
  const target = document.getElementById("rl-target") as HTMLSelectElement | null;
  const resetBtn = document.getElementById("rl-reset");

  const out = {
    count: document.getElementById("rl-count"),
    layout: document.getElementById("rl-layout"),
    spacing: document.getElementById("rl-spacing"),
    lumenCount: document.getElementById("rl-lumen-count"),
    note: document.getElementById("rl-note"),
    bdArea: document.getElementById("rl-bd-area"),
    bdSpacing: document.getElementById("rl-bd-spacing"),
    bdGrid: document.getElementById("rl-bd-grid"),
    bdNeeded: document.getElementById("rl-bd-needed"),
    bdLumen: document.getElementById("rl-bd-lumen"),
    bdDelivered: document.getElementById("rl-bd-delivered"),
  };

  if (!length || !width || !ceiling || !ceilingRange || !lumens || !target) return;
  if (Object.values(out).some((el) => !el)) return;

  function calculate(): void {
    const len = Math.max(1, parseFloat(length!.value) || 0);
    const wid = Math.max(1, parseFloat(width!.value) || 0);
    const ceil = Math.max(6, parseFloat(ceiling!.value) || 8);
    const perFixture = Math.max(1, parseFloat(lumens!.value) || 1);
    const footcandles = parseFloat(target!.value) || 20;

    const area = len * wid;

    // Spacing method — spacing ≈ ceiling height ÷ 2, first row half a spacing off the wall.
    const spacing = ceil / 2;
    const rows = Math.max(1, Math.round(len / spacing));
    const cols = Math.max(1, Math.round(wid / spacing));
    const spacingCount = rows * cols;

    // Light-level method.
    const lumensNeeded = area * footcandles;
    const lumenCount = Math.max(1, Math.ceil(lumensNeeded / perFixture));

    const recommended = Math.max(spacingCount, lumenCount);
    const delivered = recommended * perFixture;
    const achievedFc = area > 0 ? delivered / area : 0;

    out.count!.textContent = String(recommended);
    out.layout!.textContent = `${rows} × ${cols} grid`;
    out.spacing!.textContent = `${fmt(spacing, 1)} ft`;
    out.lumenCount!.textContent = String(lumenCount);

    if (spacingCount === lumenCount) {
      out.note!.textContent = `Both methods agree at ${recommended} fixtures — a ${rows} × ${cols} grid at ${fmt(spacing, 1)} ft spacing delivers ${fmtInt(delivered)} lumens, or about ${fmt(achievedFc, 0)} footcandles.`;
    } else if (lumenCount > spacingCount) {
      out.note!.textContent = `Light level governs: ${lumenCount} fixtures are needed for ${fmtInt(footcandles)} footcandles, more than the ${spacingCount} the spacing grid gives. Either use ${lumenCount} on a tighter grid, or keep ${spacingCount} and choose brighter trims.`;
    } else {
      out.note!.textContent = `Spacing governs: a ${rows} × ${cols} grid wants ${spacingCount} fixtures, more than the ${lumenCount} needed for light level. That is fine — it delivers about ${fmt(achievedFc, 0)} footcandles, and even coverage matters more than hitting the target exactly. Put them on a dimmer.`;
    }

    out.bdArea!.textContent = `${fmt(len, 1)} × ${fmt(wid, 1)} = ${fmtInt(area)} ft²`;
    out.bdSpacing!.textContent = `${fmt(ceil, 1)} ft ÷ 2 = ${fmt(spacing, 1)} ft`;
    out.bdGrid!.textContent = `${rows} × ${cols} = ${spacingCount} fixtures`;
    out.bdNeeded!.textContent = `${fmtInt(area)} ft² × ${fmtInt(footcandles)} fc = ${fmtInt(lumensNeeded)} lm`;
    out.bdLumen!.textContent = `${fmtInt(lumensNeeded)} ÷ ${fmtInt(perFixture)} = ${lumenCount} fixtures`;
    out.bdDelivered!.textContent = `${recommended} × ${fmtInt(perFixture)} = ${fmtInt(delivered)} lm (${fmt(achievedFc, 0)} fc)`;
  }

  ceiling.addEventListener("input", () => {
    const v = parseFloat(ceiling.value) || 0;
    if (v >= Number(ceilingRange.min) && v <= Number(ceilingRange.max)) ceilingRange.value = String(v);
    calculate();
  });
  ceilingRange.addEventListener("input", () => {
    ceiling.value = ceilingRange.value;
    calculate();
  });
  [length, width, lumens].forEach((el) => el.addEventListener("input", calculate));
  target.addEventListener("change", calculate);

  resetBtn?.addEventListener("click", () => {
    length.value = "16";
    width.value = "12";
    ceiling.value = "8";
    ceilingRange.value = "8";
    lumens.value = "650";
    target.value = "40";
    calculate();
  });

  calculate();
}
