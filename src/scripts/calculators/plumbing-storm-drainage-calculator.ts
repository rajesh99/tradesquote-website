import {
  ROOF_RUNOFF_DIVISOR,
  fmt,
  roofRunoffGpm,
  sizeLabel,
  stormHorizontalCheck,
} from "@/lib/plumbing";

const CANDIDATE_SIZES = [2, 3, 4, 6];

export function initPlumbingStormDrainageCalculator(): void {
  const area = document.getElementById("sd-area") as HTMLInputElement | null;
  const areaRange = document.getElementById("sd-area-range") as HTMLInputElement | null;
  const rainfall = document.getElementById("sd-rainfall") as HTMLInputElement | null;
  const slope = document.getElementById("sd-slope") as HTMLSelectElement | null;
  const leaders = document.getElementById("sd-leaders") as HTMLInputElement | null;
  const resetBtn = document.getElementById("sd-reset");

  const out = {
    flow: document.getElementById("sd-flow"),
    note: document.getElementById("sd-note"),
    perLeader: document.getElementById("sd-per-leader"),
    suggested: document.getElementById("sd-suggested"),
    bdDivisor: document.getElementById("sd-bd-divisor"),
    bdCapacity: document.getElementById("sd-bd-capacity"),
    bdVelocity: document.getElementById("sd-bd-velocity"),
    bdHeadroom: document.getElementById("sd-bd-headroom"),
    bdDoubled: document.getElementById("sd-bd-doubled"),
  };

  if (
    !area ||
    !areaRange ||
    !rainfall ||
    !slope ||
    !leaders ||
    !out.flow ||
    !out.note ||
    !out.perLeader ||
    !out.suggested ||
    !out.bdDivisor ||
    !out.bdCapacity ||
    !out.bdVelocity ||
    !out.bdHeadroom ||
    !out.bdDoubled
  ) {
    return;
  }

  function calculate(): void {
    const sqft = Math.max(0, parseFloat(area!.value) || 0);
    const rate = Math.max(0, parseFloat(rainfall!.value) || 0);
    const slopeValue = parseFloat(slope!.value) || 0.125;
    const leaderCount = Math.max(1, parseFloat(leaders!.value) || 1);

    const total = roofRunoffGpm(sqft, rate);
    const per = total / leaderCount;

    out.flow!.textContent = `${fmt(total, 1)} gpm`;
    out.perLeader!.textContent = `${fmt(per, 1)} gpm`;
    out.bdDivisor!.textContent = `area × rate ÷ ${fmt(ROOF_RUNOFF_DIVISOR, 2)}`;

    // Smallest size whose Manning full-bore capacity covers the total flow.
    let chosen: number | null = null;
    for (const n of CANDIDATE_SIZES) {
      const c = stormHorizontalCheck(n, slopeValue);
      if (c && c.gpm >= total) {
        chosen = n;
        break;
      }
    }

    if (chosen === null) {
      out.suggested!.textContent = "over 6\"";
      out.bdCapacity!.textContent = "—";
      out.bdVelocity!.textContent = "—";
      out.bdHeadroom!.textContent = "—";
      out.note!.textContent = `${fmt(total, 1)} gpm exceeds what a 6-inch drain carries at this grade. Split the roof across more drains, or size from IPC Table 1106.3 directly.`;
    } else {
      const c = stormHorizontalCheck(chosen, slopeValue)!;
      out.suggested!.textContent = sizeLabel(chosen);
      out.bdCapacity!.textContent = `${fmt(c.gpm, 0)} gpm flowing full`;
      out.bdVelocity!.textContent = `${fmt(c.velocity, 2)} ft/s`;
      out.bdHeadroom!.textContent = `${fmt(c.gpm - total, 0)} gpm spare`;
      out.note!.textContent = `${fmt(total, 1)} gpm off ${fmt(sqft, 0)} ft² at ${fmt(rate, 1)} in/hr. A ${sizeLabel(chosen)} horizontal drain at ${slopeValue} in/ft carries ${fmt(c.gpm, 0)} gpm on the hydraulics — confirm against IPC Table 1106.3 before you build it.`;
    }

    // Storms exceed the design rate; showing double makes the margin concrete.
    const doubled = roofRunoffGpm(sqft, rate * 2);
    out.bdDoubled!.textContent = `${fmt(doubled, 1)} gpm at twice the design rate`;
  }

  function syncFromRange(): void {
    area!.value = areaRange!.value;
    calculate();
  }

  function syncToRange(): void {
    const value = parseFloat(area!.value) || 0;
    if (value >= Number(areaRange!.min) && value <= Number(areaRange!.max)) {
      areaRange!.value = String(value);
    }
    calculate();
  }

  area.addEventListener("input", syncToRange);
  areaRange.addEventListener("input", syncFromRange);
  slope.addEventListener("change", calculate);
  [rainfall, leaders].forEach((el) => el.addEventListener("input", calculate));

  resetBtn?.addEventListener("click", () => {
    area.value = "2000";
    areaRange.value = "2000";
    rainfall.value = "4";
    slope.value = "0.125";
    leaders.value = "2";
    calculate();
  });

  calculate();
}
