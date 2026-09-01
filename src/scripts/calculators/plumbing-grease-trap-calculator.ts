import {
  PDI_GREASE_LB_PER_GPM,
  fmt,
  greaseInterceptorVolume,
  greaseTrapHydraulic,
} from "@/lib/plumbing";

export function initPlumbingGreaseTrapCalculator(): void {
  const method = document.getElementById("gt-method") as HTMLSelectElement | null;
  const panelHydraulic = document.getElementById("gt-inputs-hydraulic");
  const panelInterceptor = document.getElementById("gt-inputs-interceptor");
  const resultHydraulic = document.getElementById("gt-result-hydraulic");
  const resultInterceptor = document.getElementById("gt-result-interceptor");
  const resetBtn = document.getElementById("gt-reset");

  // Hydraulic (PDI) inputs
  const length = document.getElementById("gt-length") as HTMLInputElement | null;
  const width = document.getElementById("gt-width") as HTMLInputElement | null;
  const depth = document.getElementById("gt-depth") as HTMLInputElement | null;
  const compartments = document.getElementById("gt-compartments") as HTMLInputElement | null;
  const fill = document.getElementById("gt-fill") as HTMLInputElement | null;
  const period = document.getElementById("gt-period") as HTMLInputElement | null;

  // Gravity interceptor inputs
  const seats = document.getElementById("gt-seats") as HTMLInputElement | null;
  const seatsRange = document.getElementById("gt-seats-range") as HTMLInputElement | null;
  const turnover = document.getElementById("gt-turnover") as HTMLInputElement | null;
  const wastePreset = document.getElementById("gt-waste-preset") as HTMLSelectElement | null;
  const waste = document.getElementById("gt-waste") as HTMLInputElement | null;
  const retentionPreset = document.getElementById("gt-retention-preset") as HTMLSelectElement | null;
  const retention = document.getElementById("gt-retention") as HTMLInputElement | null;
  const storage = document.getElementById("gt-storage") as HTMLSelectElement | null;
  const minimum = document.getElementById("gt-minimum") as HTMLInputElement | null;

  const out = {
    flow: document.getElementById("gt-flow"),
    rating: document.getElementById("gt-rating"),
    hNote: document.getElementById("gt-h-note"),
    hBdVolume: document.getElementById("gt-bd-volume"),
    hBdDrained: document.getElementById("gt-bd-drained"),
    hBdFlow: document.getElementById("gt-bd-flow"),
    hBdCapacity: document.getElementById("gt-bd-capacity"),
    hWarning: document.getElementById("gt-h-warning"),

    size: document.getElementById("gt-size"),
    calculated: document.getElementById("gt-calculated"),
    iNote: document.getElementById("gt-i-note"),
    iBdMeals: document.getElementById("gt-bd-meals"),
    iBdCalculated: document.getElementById("gt-bd-calculated"),
    iBdMinimum: document.getElementById("gt-bd-minimum"),
    iBdGoverned: document.getElementById("gt-bd-governed"),
    iWarning: document.getElementById("gt-i-warning"),
  };

  const required = [
    method,
    panelHydraulic,
    panelInterceptor,
    resultHydraulic,
    resultInterceptor,
    length,
    width,
    depth,
    compartments,
    fill,
    period,
    seats,
    seatsRange,
    turnover,
    wastePreset,
    waste,
    retentionPreset,
    retention,
    storage,
    minimum,
    ...Object.values(out),
  ];
  if (required.some((el) => !el)) return;

  function num(el: HTMLInputElement, min = 0): number {
    const v = parseFloat(el.value);
    return Number.isFinite(v) ? Math.max(min, v) : min;
  }

  function calculateHydraulic(): void {
    const r = greaseTrapHydraulic({
      lengthIn: num(length!),
      widthIn: num(width!),
      depthIn: num(depth!),
      compartments: num(compartments!),
      fillFraction: num(fill!) / 100,
      drainPeriodMin: num(period!),
    });

    out.flow!.textContent = Number.isFinite(r.flowGpm) ? `${fmt(r.flowGpm, 1)} gpm` : "—";
    out.rating!.textContent = r.ratedGpm === null ? "—" : `${fmt(r.ratedGpm, 0)} gpm`;
    out.hBdVolume!.textContent = `${fmt(r.gallons, 2)} gal (${fmt(r.cubicInches, 0)} in³)`;
    out.hBdDrained!.textContent = `${fmt(r.drainedGallons, 2)} gal`;
    out.hBdFlow!.textContent = Number.isFinite(r.flowGpm) ? `${fmt(r.flowGpm, 2)} gpm` : "—";
    out.hBdCapacity!.textContent =
      r.capacityLb === null ? "—" : `${fmt(r.capacityLb, 0)} lb of grease`;

    if (r.ratedGpm === null) {
      out.hNote!.textContent =
        "Past the largest PDI-rated hydromechanical unit. This sink needs a gravity interceptor — switch methods above.";
      out.hWarning!.classList.remove("hidden");
    } else {
      out.hNote!.textContent = `Smallest PDI rating covering ${fmt(r.flowGpm, 1)} gpm, holding ${fmt(r.capacityLb ?? 0, 0)} lb of grease — ${PDI_GREASE_LB_PER_GPM}× the flow rating, by definition.`;
      out.hWarning!.classList.toggle("hidden", r.ratedGpm <= 50);
    }
  }

  function calculateInterceptor(): void {
    const r = greaseInterceptorVolume({
      seats: num(seats!),
      turnoverPerHour: num(turnover!),
      wasteFlowPerMeal: num(waste!),
      retentionHours: num(retention!),
      storageFactor: parseFloat(storage!.value) || 1,
      minimumGallons: num(minimum!),
    });

    out.size!.textContent = r.stocked === null ? "—" : `${fmt(r.stocked, 0)} gal`;
    out.calculated!.textContent = `${fmt(r.required, 0)} gal`;
    out.iBdMeals!.textContent = `${fmt(r.mealsPerPeakHour, 0)} meals in the peak hour`;
    out.iBdCalculated!.textContent = `${fmt(r.calculated, 0)} gal from the formula`;
    out.iBdMinimum!.textContent = `${fmt(r.minimum, 0)} gal local floor`;
    out.iBdGoverned!.textContent =
      r.governedBy === "minimum" ? "the local minimum" : "the calculated volume";

    if (r.stocked === null) {
      out.iNote!.textContent = `${fmt(r.required, 0)} gallons is past a single stocked interceptor — expect two in series or a custom vessel.`;
      out.iWarning!.classList.remove("hidden");
    } else {
      out.iWarning!.classList.add("hidden");
      out.iNote!.textContent =
        r.governedBy === "minimum"
          ? `The formula gives ${fmt(r.calculated, 0)} gallons, but the ${fmt(r.minimum, 0)} gallon local floor governs — which is the usual outcome for a small kitchen.`
          : `Smallest stocked vessel covering the ${fmt(r.required, 0)} gallon requirement, well past the ${fmt(r.minimum, 0)} gallon floor.`;
    }
  }

  function applyMethod(): void {
    const hydraulic = method!.value === "hydraulic";
    panelHydraulic!.classList.toggle("hidden", !hydraulic);
    resultHydraulic!.classList.toggle("hidden", !hydraulic);
    panelInterceptor!.classList.toggle("hidden", hydraulic);
    resultInterceptor!.classList.toggle("hidden", hydraulic);
    calculate();
  }

  function calculate(): void {
    calculateHydraulic();
    calculateInterceptor();
  }

  /** Picking a kitchen type writes its figure into the editable field. */
  function applyWastePreset(): void {
    const chosen = parseFloat(wastePreset!.value);
    if (Number.isFinite(chosen) && chosen > 0) waste!.value = String(chosen);
    calculate();
  }

  function applyRetentionPreset(): void {
    const chosen = parseFloat(retentionPreset!.value);
    if (Number.isFinite(chosen) && chosen > 0) retention!.value = String(chosen);
    calculate();
  }

  function syncFromRange(): void {
    seats!.value = seatsRange!.value;
    calculate();
  }

  function syncToRange(): void {
    const value = parseFloat(seats!.value) || 0;
    if (value >= Number(seatsRange!.min) && value <= Number(seatsRange!.max)) {
      seatsRange!.value = String(value);
    }
    calculate();
  }

  method!.addEventListener("change", applyMethod);
  [length!, width!, depth!, compartments!, fill!, period!, turnover!, waste!, retention!, minimum!].forEach(
    (el) => el.addEventListener("input", calculate),
  );
  seats!.addEventListener("input", syncToRange);
  seatsRange!.addEventListener("input", syncFromRange);
  wastePreset!.addEventListener("change", applyWastePreset);
  retentionPreset!.addEventListener("change", applyRetentionPreset);
  storage!.addEventListener("change", calculate);

  resetBtn?.addEventListener("click", () => {
    method!.value = "hydraulic";
    length!.value = "24";
    width!.value = "24";
    depth!.value = "12";
    compartments!.value = "3";
    fill!.value = "75";
    period!.value = "1";
    seats!.value = "100";
    seatsRange!.value = "100";
    turnover!.value = "1";
    wastePreset!.value = "6";
    waste!.value = "6";
    retentionPreset!.value = "2.5";
    retention!.value = "2.5";
    storage!.value = "1";
    minimum!.value = "1000";
    applyMethod();
  });

  applyMethod();
}
