import {
  FHR_USABLE_FRACTION,
  STANDARD_TANK_SIZES,
  firstHourRating,
  fmt,
  peakHourDemand,
  recoveryGph,
  selectTank,
} from "@/lib/plumbing";

/** Defaults: a busy morning in a family house. */
const DEFAULT_USES: Record<string, number> = {
  shower: 3,
  dishwasher: 1,
  "clothes-washer": 1,
  "hands-face": 2,
};

export function initPlumbingWaterHeaterSizeCalculator(): void {
  const btu = document.getElementById("wh-btu") as HTMLInputElement | null;
  const efficiency = document.getElementById("wh-efficiency") as HTMLInputElement | null;
  const inlet = document.getElementById("wh-inlet") as HTMLInputElement | null;
  const outlet = document.getElementById("wh-outlet") as HTMLInputElement | null;
  const resetBtn = document.getElementById("wh-reset");
  const useInputs = Array.from(document.querySelectorAll<HTMLInputElement>("[data-wh-use]"));

  const out = {
    tank: document.getElementById("wh-tank"),
    note: document.getElementById("wh-note"),
    demand: document.getElementById("wh-demand"),
    fhr: document.getElementById("wh-fhr"),
    warning: document.getElementById("wh-warning"),
    bdRecovery: document.getElementById("wh-bd-recovery"),
    bdRise: document.getElementById("wh-bd-rise"),
    bdStorage: document.getElementById("wh-bd-storage"),
    bdHeadroom: document.getElementById("wh-bd-headroom"),
    bdNext: document.getElementById("wh-bd-next"),
  };

  if (
    !btu ||
    !efficiency ||
    !inlet ||
    !outlet ||
    useInputs.length === 0 ||
    !out.tank ||
    !out.note ||
    !out.demand ||
    !out.fhr ||
    !out.warning ||
    !out.bdRecovery ||
    !out.bdRise ||
    !out.bdStorage ||
    !out.bdHeadroom ||
    !out.bdNext
  ) {
    return;
  }

  function calculate(): void {
    const counts: Record<string, number> = {};
    useInputs.forEach((input) => {
      const key = input.dataset.whUse;
      if (!key) return;
      counts[key] = Math.max(0, parseFloat(input.value) || 0);
    });

    const demand = peakHourDemand(counts);
    const input = Math.max(0, parseFloat(btu!.value) || 0);
    const eff = Math.min(1, Math.max(0.1, (parseFloat(efficiency!.value) || 80) / 100));
    const inletT = parseFloat(inlet!.value) || 0;
    const outletT = parseFloat(outlet!.value) || 0;
    const rise = outletT - inletT;

    if (rise <= 0) {
      out.tank!.textContent = "—";
      out.note!.textContent = "The outlet temperature has to be above the inlet temperature.";
      out.demand!.textContent = `${fmt(demand, 0)} gal`;
      out.fhr!.textContent = "—";
      out.warning!.classList.add("hidden");
      return;
    }

    const recovery = recoveryGph(input, eff, rise);
    const result = selectTank(demand, input, eff, rise);

    out.demand!.textContent = `${fmt(demand, 0)} gal`;

    if (result.tank === null) {
      const largest = STANDARD_TANK_SIZES[STANDARD_TANK_SIZES.length - 1];
      out.tank!.textContent = "—";
      out.fhr!.textContent = `${fmt(result.fhr, 1)} gal`;
      out.note!.textContent = `Even a ${largest}-gallon tank at this input only reaches a ${fmt(result.fhr, 1)} gallon first-hour rating. Raise the burner input, or use two heaters or a tankless unit.`;
      out.warning!.classList.remove("hidden");
    } else {
      out.tank!.textContent = `${result.tank} gal`;
      out.fhr!.textContent = `${fmt(result.fhr, 1)} gal`;
      out.note!.textContent = `Smallest stocked tank whose first-hour rating covers a ${fmt(demand, 0)} gallon peak hour, with ${fmt(result.fhr - demand, 1)} gallons to spare.`;
      out.warning!.classList.add("hidden");
    }

    const tankForMath = result.tank ?? STANDARD_TANK_SIZES[STANDARD_TANK_SIZES.length - 1];
    out.bdRecovery!.textContent = `${fmt(recovery, 1)} gal per hour`;
    out.bdRise!.textContent = `${fmt(rise, 0)} °F (${fmt(inletT, 0)} → ${fmt(outletT, 0)})`;
    out.bdStorage!.textContent = `${fmt(FHR_USABLE_FRACTION * tankForMath, 1)} gal usable of ${tankForMath}`;
    out.bdHeadroom!.textContent =
      result.tank === null ? "none" : `${fmt(result.fhr - demand, 1)} gal`;

    const index = STANDARD_TANK_SIZES.indexOf(tankForMath);
    out.bdNext!.textContent =
      index >= 0 && index < STANDARD_TANK_SIZES.length - 1
        ? `${STANDARD_TANK_SIZES[index + 1]} gal → ${fmt(firstHourRating(STANDARD_TANK_SIZES[index + 1], recovery), 1)} gal FHR`
        : "largest stocked size";
  }

  useInputs.forEach((input) => input.addEventListener("input", calculate));
  [btu, efficiency, inlet, outlet].forEach((el) => el.addEventListener("input", calculate));

  resetBtn?.addEventListener("click", () => {
    useInputs.forEach((input) => {
      const key = input.dataset.whUse ?? "";
      input.value = String(DEFAULT_USES[key] ?? 0);
    });
    btu.value = "40000";
    efficiency.value = "80";
    inlet.value = "50";
    outlet.value = "140";
    calculate();
  });

  calculate();
}
