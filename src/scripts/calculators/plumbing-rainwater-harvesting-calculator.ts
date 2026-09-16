import {
  GAL_PER_SQFT_PER_INCH,
  GREYWATER_MAX_STORAGE_HOURS,
  cisternSizing,
  fmt,
  greywaterYield,
} from "@/lib/plumbing";

export function initPlumbingRainwaterHarvestingCalculator(): void {
  const method = document.getElementById("rw-method") as HTMLSelectElement | null;
  const panelRain = document.getElementById("rw-inputs-rain");
  const panelGrey = document.getElementById("rw-inputs-grey");
  const resultRain = document.getElementById("rw-result-rain");
  const resultGrey = document.getElementById("rw-result-grey");

  // Rainwater inputs
  const area = document.getElementById("rw-area") as HTMLInputElement | null;
  const areaRange = document.getElementById("rw-area-range") as HTMLInputElement | null;
  const roof = document.getElementById("rw-roof") as HTMLSelectElement | null;
  const coefficient = document.getElementById("rw-coefficient") as HTMLInputElement | null;
  const rainfall = document.getElementById("rw-rainfall") as HTMLInputElement | null;
  const events = document.getElementById("rw-events") as HTMLInputElement | null;
  const demand = document.getElementById("rw-demand") as HTMLInputElement | null;
  const drySpell = document.getElementById("rw-dry-spell") as HTMLInputElement | null;

  // Grey water inputs
  const occupants = document.getElementById("rw-occupants") as HTMLInputElement | null;
  const shower = document.getElementById("rw-src-shower") as HTMLInputElement | null;
  const lavatory = document.getElementById("rw-src-lavatory") as HTMLInputElement | null;
  const washer = document.getElementById("rw-src-washer") as HTMLInputElement | null;
  const loads = document.getElementById("rw-loads") as HTMLInputElement | null;
  const planting = document.getElementById("rw-planting") as HTMLSelectElement | null;
  const irrigation = document.getElementById("rw-irrigation") as HTMLInputElement | null;

  const resetBtn = document.getElementById("rw-reset");

  const out = {
    rTank: document.getElementById("rw-tank"),
    rNote: document.getElementById("rw-note"),
    rGoverned: document.getElementById("rw-governed"),
    rSupply: document.getElementById("rw-bd-supply"),
    rDemandStore: document.getElementById("rw-bd-demand-store"),
    rYieldStore: document.getElementById("rw-bd-yield-store"),
    rRequired: document.getElementById("rw-bd-required"),
    rCovers: document.getElementById("rw-bd-covers"),
    rBalance: document.getElementById("rw-bd-balance"),
    rPerInch: document.getElementById("rw-bd-per-inch"),
    gYield: document.getElementById("rw-grey-yield"),
    gNote: document.getElementById("rw-grey-note"),
    gStorage: document.getElementById("rw-bd-storage"),
    gArea: document.getElementById("rw-bd-irrigable"),
    gAnnual: document.getElementById("rw-bd-annual"),
    gSources: document.getElementById("rw-bd-sources"),
  };

  if (
    !method ||
    !panelRain ||
    !panelGrey ||
    !resultRain ||
    !resultGrey ||
    !area ||
    !areaRange ||
    !roof ||
    !coefficient ||
    !rainfall ||
    !events ||
    !demand ||
    !drySpell ||
    !occupants ||
    !shower ||
    !lavatory ||
    !washer ||
    !loads ||
    !planting ||
    !irrigation ||
    Object.values(out).some((el) => !el)
  ) {
    return;
  }

  function calculateRain(): void {
    const sqft = Math.max(0, parseFloat(area!.value) || 0);
    const cr = Math.max(0, Math.min(1, parseFloat(coefficient!.value) || 0));
    const inches = Math.max(0, parseFloat(rainfall!.value) || 0);
    const storms = Math.max(0, parseFloat(events!.value) || 0);
    const gpd = Math.max(0, parseFloat(demand!.value) || 0);
    const spell = Math.max(0, parseFloat(drySpell!.value) || 0);

    const r = cisternSizing({
      areaSqFt: sqft,
      periodInches: inches,
      periodDays: 30,
      coefficient: cr,
      demandGpd: gpd,
      drySpellDays: spell,
      events: storms,
    });

    out.rTank!.textContent = r.selected === null ? "over 10,000 gal" : `${fmt(r.selected, 0)} gallons`;
    out.rSupply!.textContent = `${fmt(r.supply, 0)} gal a month`;
    out.rDemandStore!.textContent = `${fmt(r.demandStorage, 0)} gal (${fmt(spell, 0)} dry days)`;
    out.rYieldStore!.textContent = `${fmt(r.yieldStorage, 0)} gal the roof can refill`;
    out.rRequired!.textContent = `${fmt(r.required, 0)} gal`;
    out.rCovers!.textContent =
      r.selected === null || !isFinite(r.daysCovered)
        ? "—"
        : `${fmt(r.daysCovered, 1)} days at ${fmt(gpd, 0)} gpd`;
    out.rPerInch!.textContent = `${fmt(sqft * GAL_PER_SQFT_PER_INCH * cr, 0)} gal per inch of rain`;

    const balance = r.supply - r.periodDemand;
    out.rBalance!.textContent =
      balance >= 0
        ? `+${fmt(balance, 0)} gal — the roof keeps up`
        : `${fmt(balance, 0)} gal — the roof cannot keep up`;

    if (r.governedBy === "demand") {
      out.rGoverned!.textContent = "Governed by the dry spell";
      out.rNote!.textContent = `Riding out ${fmt(spell, 0)} dry days at ${fmt(gpd, 0)} gpd takes ${fmt(r.demandStorage, 0)} gallons, and the roof delivers ${fmt(r.supply, 0)} in an average month — so storage, not catchment, is the limit. A bigger roof buys nothing here; a longer dry spell costs a bigger tank.`;
    } else {
      out.rGoverned!.textContent = "Governed by the roof";
      out.rNote!.textContent = `The dry spell asks for ${fmt(r.demandStorage, 0)} gallons but this catchment only delivers ${fmt(r.supply, 0)} in the design month, so a tank past ${fmt(r.required, 0)} gallons would sit part-empty. More roof, or less demand, is the fix — not more tank.`;
    }
  }

  function calculateGrey(): void {
    const rate = Math.max(0, parseFloat(irrigation!.value) || 0);
    const g = greywaterYield({
      occupants: Math.max(0, parseFloat(occupants!.value) || 0),
      sources: {
        shower: shower!.checked,
        lavatory: lavatory!.checked,
        washer: washer!.checked,
      },
      loadsPerWeek: Math.max(0, parseFloat(loads!.value) || 0),
      irrigationRate: rate,
    });

    out.gYield!.textContent = `${fmt(g.dailyYield, 1)} gpd`;
    out.gStorage!.textContent = `${fmt(g.maxStorage, 0)} gal — one day, no more`;
    out.gArea!.textContent = isFinite(g.irrigableSqFt)
      ? `${fmt(g.irrigableSqFt, 0)} ft² of landscape`
      : "—";
    out.gAnnual!.textContent = `${fmt(g.dailyYield * 365, 0)} gal a year`;
    out.gSources!.textContent = g.bySource.length
      ? g.bySource.map((s) => `${s.label} ${fmt(s.gpd, 1)}`).join(" · ")
      : "no sources selected";

    out.gNote!.textContent = g.dailyYield
      ? `${fmt(g.dailyYield, 1)} gallons a day, every day — ${fmt(g.dailyYield * 365, 0)} gallons a year. Because untreated grey water may not be held past ${GREYWATER_MAX_STORAGE_HOURS} hours, the tank is a surge vessel sized on one day's flow, not a cistern. Size the distribution field, not the storage.`
      : "Select at least one source to see the daily yield.";
  }

  function calculate(): void {
    calculateRain();
    calculateGrey();
  }

  function applyMethod(): void {
    const rain = method!.value === "rainwater";
    panelRain!.classList.toggle("hidden", !rain);
    resultRain!.classList.toggle("hidden", !rain);
    panelGrey!.classList.toggle("hidden", rain);
    resultGrey!.classList.toggle("hidden", rain);
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

  method.addEventListener("change", applyMethod);
  area.addEventListener("input", syncToRange);
  areaRange.addEventListener("input", syncFromRange);

  // The preset selects write into the editable fields beside them, so a chosen
  // preset is a starting point the user can then override — the same pattern
  // the septic and grease pages use for jurisdiction-dependent values.
  roof.addEventListener("change", () => {
    if (roof.value) coefficient.value = roof.value;
    calculate();
  });
  planting.addEventListener("change", () => {
    if (planting.value) irrigation.value = planting.value;
    calculate();
  });

  [coefficient, rainfall, events, demand, drySpell, occupants, loads, irrigation].forEach((el) =>
    el.addEventListener("input", calculate),
  );
  [shower, lavatory, washer].forEach((el) => el.addEventListener("change", calculate));

  resetBtn?.addEventListener("click", () => {
    method.value = "rainwater";
    area.value = "2000";
    areaRange.value = "2000";
    roof.value = "0.85";
    coefficient.value = "0.85";
    rainfall.value = "3.5";
    events.value = "4";
    demand.value = "60";
    drySpell.value = "21";
    occupants.value = "3";
    shower.checked = true;
    lavatory.checked = true;
    washer.checked = true;
    loads.value = "5";
    planting.value = "0.6";
    irrigation.value = "0.6";
    applyMethod();
    calculate();
  });

  applyMethod();
  calculate();
}
