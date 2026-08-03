import { BOX_FILL_VOLUME, fmt, sizeLabel, smallestBoxFor } from "@/lib/nec";

export function initElectricalBoxFillCalculator(): void {
  const gauge = document.getElementById("bf-gauge") as HTMLSelectElement | null;
  const hots = document.getElementById("bf-hots") as HTMLInputElement | null;
  const neutrals = document.getElementById("bf-neutrals") as HTMLInputElement | null;
  const grounds = document.getElementById("bf-grounds") as HTMLInputElement | null;
  const clamps = document.getElementById("bf-clamps") as HTMLSelectElement | null;
  const devices = document.getElementById("bf-devices") as HTMLInputElement | null;
  const fittings = document.getElementById("bf-fittings") as HTMLInputElement | null;
  const resetBtn = document.getElementById("bf-reset");

  const out = {
    total: document.getElementById("bf-total"),
    box: document.getElementById("bf-box"),
    spare: document.getElementById("bf-spare"),
    note: document.getElementById("bf-note"),
    bdVolume: document.getElementById("bf-bd-volume"),
    bdConductors: document.getElementById("bf-bd-conductors"),
    bdGrounds: document.getElementById("bf-bd-grounds"),
    bdClamps: document.getElementById("bf-bd-clamps"),
    bdDevices: document.getElementById("bf-bd-devices"),
    bdFittings: document.getElementById("bf-bd-fittings"),
    bdTotal: document.getElementById("bf-bd-total"),
  };

  if (
    !gauge ||
    !hots ||
    !neutrals ||
    !grounds ||
    !clamps ||
    !devices ||
    !fittings ||
    !out.total ||
    !out.box ||
    !out.spare ||
    !out.note ||
    !out.bdVolume ||
    !out.bdConductors ||
    !out.bdGrounds ||
    !out.bdClamps ||
    !out.bdDevices ||
    !out.bdFittings ||
    !out.bdTotal
  ) {
    return;
  }

  function calculate(): void {
    const unit = BOX_FILL_VOLUME[gauge!.value] ?? 2.25;
    const hotCount = Math.max(0, parseInt(hots!.value) || 0);
    const neutralCount = Math.max(0, parseInt(neutrals!.value) || 0);
    const groundCount = Math.max(0, parseInt(grounds!.value) || 0);
    const deviceCount = Math.max(0, parseInt(devices!.value) || 0);
    const fittingCount = Math.max(0, parseInt(fittings!.value) || 0);
    const hasClamps = clamps!.value === "yes";

    // NEC 314.16(B)(1) — one volume per current-carrying conductor.
    const conductorVol = (hotCount + neutralCount) * unit;
    // 314.16(B)(5) — all equipment grounding conductors together count as one.
    const groundVol = groundCount > 0 ? unit : 0;
    // 314.16(B)(2) — all internal clamps together count as one.
    const clampVol = hasClamps ? unit : 0;
    // 314.16(B)(3) — each support fitting counts as two.
    const fittingVol = fittingCount * 2 * unit;
    // 314.16(B)(4) — each device yoke counts as two.
    const deviceVol = deviceCount * 2 * unit;

    const total = conductorVol + groundVol + clampVol + fittingVol + deviceVol;
    const box = smallestBoxFor(total);

    out.total!.textContent = `${fmt(total, 2)} in³`;
    out.box!.textContent = box ? box.label : "Larger than a standard box";
    out.spare!.textContent = box ? `${fmt(box.volume - total, 2)} in³` : "—";

    if (total === 0) {
      out.note!.textContent = "Add conductors and devices to calculate box fill.";
      out.note!.className = "mt-1 text-sm font-semibold text-slate-600";
    } else if (box && box.volume - total < 0.5) {
      out.note!.textContent = `${box.label} meets the minimum with almost no margin — go one size up for a workable box.`;
      out.note!.className = "mt-1 text-sm font-semibold text-amber-700";
    } else if (box) {
      out.note!.textContent = `${box.label} is the smallest listed box that satisfies 314.16.`;
      out.note!.className = "mt-1 text-sm font-semibold text-emerald-700";
    } else {
      out.note!.textContent = "Use a junction box or gang the box — this exceeds standard box volumes.";
      out.note!.className = "mt-1 text-sm font-semibold text-rose-700";
    }

    out.bdVolume!.textContent = `${fmt(unit, 2)} in³ per ${sizeLabel(gauge!.value)}`;
    out.bdConductors!.textContent = `${hotCount + neutralCount} × ${fmt(unit, 2)} = ${fmt(conductorVol, 2)} in³`;
    out.bdGrounds!.textContent =
      groundCount > 0 ? `${groundCount} grounds count as 1 × ${fmt(unit, 2)} = ${fmt(groundVol, 2)} in³` : "None";
    out.bdClamps!.textContent = hasClamps ? `1 × ${fmt(unit, 2)} = ${fmt(clampVol, 2)} in³` : "None";
    out.bdDevices!.textContent =
      deviceCount > 0 ? `${deviceCount} × 2 × ${fmt(unit, 2)} = ${fmt(deviceVol, 2)} in³` : "None";
    out.bdFittings!.textContent =
      fittingCount > 0 ? `${fittingCount} × 2 × ${fmt(unit, 2)} = ${fmt(fittingVol, 2)} in³` : "None";
    out.bdTotal!.textContent = `${fmt(total, 2)} in³`;
  }

  [gauge, clamps].forEach((el) => el.addEventListener("change", calculate));
  [hots, neutrals, grounds, devices, fittings].forEach((el) => el.addEventListener("input", calculate));

  resetBtn?.addEventListener("click", () => {
    gauge.value = "12";
    hots.value = "2";
    neutrals.value = "2";
    grounds.value = "2";
    clamps.value = "yes";
    devices.value = "1";
    fittings.value = "0";
    calculate();
  });

  calculate();
}
