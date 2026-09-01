import { SEPTIC_RETENTION_DAYS, fmt, septicSizing } from "@/lib/plumbing";

export function initPlumbingSepticTankCalculator(): void {
  const bedrooms = document.getElementById("st-bedrooms") as HTMLInputElement | null;
  const bedroomsRange = document.getElementById("st-bedrooms-range") as HTMLInputElement | null;
  const perBedroom = document.getElementById("st-per-bedroom") as HTMLInputElement | null;
  const perc = document.getElementById("st-perc") as HTMLSelectElement | null;
  const rate = document.getElementById("st-rate") as HTMLInputElement | null;
  const trench = document.getElementById("st-trench") as HTMLInputElement | null;
  const resetBtn = document.getElementById("st-reset");

  const out = {
    tank: document.getElementById("st-tank"),
    note: document.getElementById("st-note"),
    flow: document.getElementById("st-flow"),
    field: document.getElementById("st-field"),
    bdRetention: document.getElementById("st-bd-retention"),
    bdMinimum: document.getElementById("st-bd-minimum"),
    bdGoverned: document.getElementById("st-bd-governed"),
    bdTrench: document.getElementById("st-bd-trench"),
    bdRate: document.getElementById("st-bd-rate"),
  };

  if (
    !bedrooms ||
    !bedroomsRange ||
    !perBedroom ||
    !perc ||
    !rate ||
    !trench ||
    !out.tank ||
    !out.note ||
    !out.flow ||
    !out.field ||
    !out.bdRetention ||
    !out.bdMinimum ||
    !out.bdGoverned ||
    !out.bdTrench ||
    !out.bdRate
  ) {
    return;
  }

  function calculate(): void {
    const r = septicSizing({
      bedrooms: Math.max(0, parseFloat(bedrooms!.value) || 0),
      galPerBedroom: Math.max(0, parseFloat(perBedroom!.value) || 0),
      applicationRate: Math.max(0, parseFloat(rate!.value) || 0),
      trenchWidthFt: Math.max(0, parseFloat(trench!.value) || 0),
    });

    out.tank!.textContent = `${fmt(r.tank, 0)} gal`;
    out.flow!.textContent = `${fmt(r.dailyFlow, 0)} gal/day`;
    out.field!.textContent = Number.isFinite(r.leachFieldSqFt)
      ? `${fmt(r.leachFieldSqFt, 0)} ft²`
      : "—";

    out.bdRetention!.textContent = `${fmt(r.retentionTank, 0)} gal at ${SEPTIC_RETENTION_DAYS} days`;
    out.bdMinimum!.textContent = `${fmt(r.minimumTank, 0)} gal for this bedroom count`;
    out.bdGoverned!.textContent =
      r.governedBy === "minimum"
        ? "the jurisdictional minimum"
        : `${SEPTIC_RETENTION_DAYS}-day retention`;
    out.bdTrench!.textContent = Number.isFinite(r.trenchFeet)
      ? `${fmt(r.trenchFeet, 0)} ft of trench`
      : "—";
    out.bdRate!.textContent = `${fmt(parseFloat(rate!.value) || 0, 2)} gal per ft² per day`;

    out.note!.textContent =
      r.governedBy === "minimum"
        ? `${fmt(r.retentionTank, 0)} gallons would cover ${SEPTIC_RETENTION_DAYS} days of flow, but the minimum for this bedroom count is ${fmt(r.minimumTank, 0)} — so the minimum governs.`
        : `${fmt(r.dailyFlow, 0)} gallons a day over ${SEPTIC_RETENTION_DAYS} days needs ${fmt(r.retentionTank, 0)} gallons, which is past the ${fmt(r.minimumTank, 0)} gallon minimum — retention governs.`;
  }

  /** Picking a soil class writes its rate into the editable field. */
  function applyPerc(): void {
    const chosen = parseFloat(perc!.value);
    if (Number.isFinite(chosen) && chosen > 0) {
      rate!.value = String(chosen);
    }
    calculate();
  }

  function syncFromRange(): void {
    bedrooms!.value = bedroomsRange!.value;
    calculate();
  }

  function syncToRange(): void {
    const value = parseFloat(bedrooms!.value) || 0;
    if (value >= Number(bedroomsRange!.min) && value <= Number(bedroomsRange!.max)) {
      bedroomsRange!.value = String(value);
    }
    calculate();
  }

  bedrooms.addEventListener("input", syncToRange);
  bedroomsRange.addEventListener("input", syncFromRange);
  perc.addEventListener("change", applyPerc);
  [perBedroom, rate, trench].forEach((el) => el.addEventListener("input", calculate));

  resetBtn?.addEventListener("click", () => {
    bedrooms.value = "3";
    bedroomsRange.value = "3";
    perBedroom.value = "150";
    perc.value = "0.8";
    rate.value = "0.8";
    trench.value = "3";
    calculate();
  });

  calculate();
}
