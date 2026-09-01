import { fmt, repipeCost, usd, usd2 } from "@/lib/plumbing";

export function initPlumbingRepipeCostCalculator(): void {
  const area = document.getElementById("rp-area") as HTMLInputElement | null;
  const areaRange = document.getElementById("rp-area-range") as HTMLInputElement | null;
  const materialKey = document.getElementById("rp-material") as HTMLSelectElement | null;
  const accessKey = document.getElementById("rp-access") as HTMLSelectElement | null;
  const storeys = document.getElementById("rp-storeys") as HTMLSelectElement | null;
  const bathrooms = document.getElementById("rp-bathrooms") as HTMLInputElement | null;
  const permit = document.getElementById("rp-permit") as HTMLInputElement | null;
  const drywall = document.getElementById("rp-drywall") as HTMLInputElement | null;
  const regionKey = document.getElementById("rp-region") as HTMLSelectElement | null;
  const resetBtn = document.getElementById("rp-reset");

  const out = {
    total: document.getElementById("rp-total"),
    note: document.getElementById("rp-note"),
    band: document.getElementById("rp-band"),
    perSqFt: document.getElementById("rp-per-sqft"),
    bdBase: document.getElementById("rp-bd-base"),
    bdAccess: document.getElementById("rp-bd-access"),
    bdStoreys: document.getElementById("rp-bd-storeys"),
    bdExtras: document.getElementById("rp-bd-extras"),
    bdRegion: document.getElementById("rp-bd-region"),
  };

  if (
    !area ||
    !areaRange ||
    !materialKey ||
    !accessKey ||
    !storeys ||
    !bathrooms ||
    !permit ||
    !drywall ||
    !regionKey ||
    !out.total ||
    !out.note ||
    !out.band ||
    !out.perSqFt ||
    !out.bdBase ||
    !out.bdAccess ||
    !out.bdStoreys ||
    !out.bdExtras ||
    !out.bdRegion
  ) {
    return;
  }

  function calculate(): void {
    const squareFeet = Math.max(0, parseFloat(area!.value) || 0);
    const result = repipeCost({
      squareFeet,
      materialKey: materialKey!.value,
      accessKey: accessKey!.value,
      storeys: parseFloat(storeys!.value) || 1,
      bathrooms: Math.max(0, parseFloat(bathrooms!.value) || 0),
      permit: Math.max(0, parseFloat(permit!.value) || 0),
      drywallRepair: Math.max(0, parseFloat(drywall!.value) || 0),
      regionKey: regionKey!.value,
    });

    out.total!.textContent = usd(result.total);
    out.band!.textContent = `${usd(result.low)} – ${usd(result.high)}`;
    out.perSqFt!.textContent = `${usd2(result.perSqFt)}/ft²`;

    // Show what the access choice alone is worth, since it is the biggest lever.
    const easy = repipeCost({
      squareFeet,
      materialKey: materialKey!.value,
      accessKey: "easy",
      storeys: parseFloat(storeys!.value) || 1,
      bathrooms: Math.max(0, parseFloat(bathrooms!.value) || 0),
      permit: Math.max(0, parseFloat(permit!.value) || 0),
      drywallRepair: Math.max(0, parseFloat(drywall!.value) || 0),
      regionKey: regionKey!.value,
    });
    const difficult = repipeCost({
      squareFeet,
      materialKey: materialKey!.value,
      accessKey: "difficult",
      storeys: parseFloat(storeys!.value) || 1,
      bathrooms: Math.max(0, parseFloat(bathrooms!.value) || 0),
      permit: Math.max(0, parseFloat(permit!.value) || 0),
      drywallRepair: Math.max(0, parseFloat(drywall!.value) || 0),
      regionKey: regionKey!.value,
    });

    out.note!.textContent = `Wall access alone moves this job between ${usd(easy.total)} and ${usd(difficult.total)} — a ${usd(difficult.total - easy.total)} spread on the same house.`;

    out.bdBase!.textContent = `${usd(result.base)} at ${usd2(result.perSqFtRate)}/ft²`;
    out.bdAccess!.textContent = `×${result.accessFactor} → ${usd(result.afterAccess)}`;
    out.bdStoreys!.textContent = `×${fmt(result.storeyFactor, 2)} → ${usd(result.afterStoreys)}`;
    out.bdExtras!.textContent = `${usd(result.afterBathrooms - result.afterStoreys)} extra bathrooms, plus permit and drywall`;
    out.bdRegion!.textContent = `${usd(result.total)} after the regional multiplier`;
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
  [materialKey, accessKey, storeys, regionKey].forEach((el) =>
    el.addEventListener("change", calculate),
  );
  [bathrooms, permit, drywall].forEach((el) => el.addEventListener("input", calculate));

  resetBtn?.addEventListener("click", () => {
    area.value = "1800";
    areaRange.value = "1800";
    materialKey.value = "pex";
    accessKey.value = "average";
    storeys.value = "1";
    bathrooms.value = "2";
    permit.value = "450";
    drywall.value = "1500";
    regionKey.value = "average";
    calculate();
  });

  calculate();
}
