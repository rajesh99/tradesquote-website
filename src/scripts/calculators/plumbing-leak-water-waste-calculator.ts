import {
  daysToWaste,
  dripsToGpd,
  fillTestGpm,
  fmt,
  gpmToGpd,
  leakCost,
  meterLeakGpm,
  usd,
  usd2,
  type LeakMethod,
  type WaterHeatFuel,
} from "@/lib/plumbing";

const DEFAULTS = {
  method: "drip" as LeakMethod,
  dpm: "60",
  oz: "16",
  secs: "30",
  gal: "2",
  mins: "30",
  gpm: "0.5",
  hot: "0",
  water: "5.5",
  sewer: "7",
  fuel: "gas",
  energy: "1.4",
  rise: "70",
  eff: "80",
};

/** The volume this page frames every leak against. */
const REFERENCE_GALLONS = 10000;

export function initPlumbingLeakWaterWasteCalculator(): void {
  const el = <T extends HTMLElement>(id: string) => document.getElementById(id) as T | null;

  const dpm = el<HTMLInputElement>("lk-dpm");
  const dpmRange = el<HTMLInputElement>("lk-dpm-range");
  const oz = el<HTMLInputElement>("lk-oz");
  const secs = el<HTMLInputElement>("lk-secs");
  const gal = el<HTMLInputElement>("lk-gal");
  const mins = el<HTMLInputElement>("lk-mins");
  const gpm = el<HTMLInputElement>("lk-gpm");
  const hot = el<HTMLInputElement>("lk-hot");
  const hotRange = el<HTMLInputElement>("lk-hot-range");
  const water = el<HTMLInputElement>("lk-water");
  const sewer = el<HTMLInputElement>("lk-sewer");
  const fuel = el<HTMLSelectElement>("lk-fuel");
  const energy = el<HTMLInputElement>("lk-energy");
  const rise = el<HTMLInputElement>("lk-rise");
  const eff = el<HTMLInputElement>("lk-eff");
  const resetBtn = el("lk-reset");

  const out = {
    cost: el("lk-cost"),
    note: el("lk-note"),
    gpd: el("lk-gpd"),
    gpy: el("lk-gpy"),
    hotcard: el("lk-hotcard"),
    hotnote: el("lk-hotnote"),
    bdWater: el("lk-bd-water"),
    bdSewer: el("lk-bd-sewer"),
    bdEnergy: el("lk-bd-energy"),
    bdMonth: el("lk-bd-month"),
    bdDays: el("lk-bd-days"),
  };

  const methodButtons = Array.from(
    document.querySelectorAll<HTMLButtonElement>("[data-leak-method]"),
  );
  const panels = Array.from(document.querySelectorAll<HTMLElement>("[data-leak-panel]"));

  if (
    !dpm || !dpmRange || !oz || !secs || !gal || !mins || !gpm ||
    !hot || !hotRange || !water || !sewer || !fuel || !energy || !rise || !eff ||
    !out.cost || !out.note || !out.gpd || !out.gpy || !out.hotcard || !out.hotnote ||
    !out.bdWater || !out.bdSewer || !out.bdEnergy || !out.bdMonth || !out.bdDays ||
    methodButtons.length === 0
  ) {
    return;
  }

  let method: LeakMethod = DEFAULTS.method;

  const ACTIVE = ["border-rose-500", "bg-rose-50", "text-rose-700"];
  const INACTIVE = ["border-slate-300", "bg-white", "text-slate-600", "hover:border-rose-300"];

  function paintMethod(): void {
    for (const btn of methodButtons) {
      const on = btn.dataset.leakMethod === method;
      btn.classList.remove(...ACTIVE, ...INACTIVE);
      btn.classList.add(...(on ? ACTIVE : INACTIVE));
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    }
    for (const panel of panels) {
      panel.classList.toggle("hidden", panel.dataset.leakPanel !== method);
    }
  }

  /** Gallons per day from whichever method is selected. */
  function currentGpd(): number {
    const num = (input: HTMLInputElement) => parseFloat(input.value) || 0;
    switch (method) {
      case "drip":
        return dripsToGpd(num(dpm!));
      case "fill":
        return gpmToGpd(fillTestGpm(num(oz!), num(secs!)));
      case "meter":
        return gpmToGpd(meterLeakGpm(num(gal!), num(mins!)));
      case "flow":
      default:
        return gpmToGpd(num(gpm!));
    }
  }

  function calculate(): void {
    const gallonsPerDay = currentGpd();
    const hotPct = Math.min(100, Math.max(0, parseFloat(hot!.value) || 0));
    const selectedFuel = (fuel!.value === "electric" ? "electric" : "gas") as WaterHeatFuel;

    const r = leakCost({
      gallonsPerDay,
      waterRatePer1000: Math.max(0, parseFloat(water!.value) || 0),
      sewerRatePer1000: Math.max(0, parseFloat(sewer!.value) || 0),
      hotFraction: hotPct / 100,
      fuel: selectedFuel,
      deltaT: Math.max(0, parseFloat(rise!.value) || 0),
      efficiency: Math.max(0.01, (parseFloat(eff!.value) || 100) / 100),
      energyRate: Math.max(0, parseFloat(energy!.value) || 0),
    });

    out.cost!.textContent = usd(r.totalCost);
    out.note!.textContent = `${fmt(r.gallonsPerYear)} gallons a year, at ${fmt(r.gallonsPerDay, 2)} gallons a day.`;
    out.gpd!.textContent = `${fmt(r.gallonsPerDay, 2)} gal`;
    out.gpy!.textContent = `${fmt(r.gallonsPerYear)} gal`;

    out.bdWater!.textContent = usd2(r.waterCost);
    out.bdSewer!.textContent = usd2(r.sewerCost);
    out.bdEnergy!.textContent = r.energyCost > 0
      ? `${usd2(r.energyCost)}  ·  ${fmt(r.energyUnits, 1)} ${r.energyUnitLabel}`
      : "—";
    out.bdMonth!.textContent = `${fmt(r.gallonsPerMonth)} gal  ·  ${usd2(r.totalCost / 12)}`;

    const days = daysToWaste(REFERENCE_GALLONS, r.gallonsPerDay);
    out.bdDays!.textContent = Number.isFinite(days)
      ? `${fmt(days, days < 10 ? 1 : 0)} days`
      : "—";

    /* The hot-water card is the point most calculators miss, so it only appears
       when it is actually saying something. */
    const showHot = r.energyCost > 0;
    out.hotcard!.classList.toggle("hidden", !showHot);
    if (showHot) {
      const coldOnly = r.waterCost + r.sewerCost;
      const multiple = coldOnly > 0 ? r.totalCost / coldOnly : 0;
      out.hotnote!.textContent =
        `${usd2(r.energyCost)} of this is energy — ${fmt(r.energyShare, 0)}% of the total, ` +
        `and ${fmt(r.energyUnits, 1)} ${r.energyUnitLabel} a year. ` +
        (multiple > 0
          ? `The same leak on the cold side would cost ${usd2(coldOnly)}, so heating it makes the leak ${fmt(multiple, 2)}x as expensive.`
          : "");
    }
  }

  /* Paired number + range inputs. */
  function pair(numberInput: HTMLInputElement, rangeInput: HTMLInputElement): void {
    numberInput.addEventListener("input", () => {
      rangeInput.value = numberInput.value;
      calculate();
    });
    rangeInput.addEventListener("input", () => {
      numberInput.value = rangeInput.value;
      calculate();
    });
  }
  pair(dpm, dpmRange);
  pair(hot, hotRange);

  for (const input of [oz, secs, gal, mins, gpm, water, sewer, energy, rise, eff]) {
    input.addEventListener("input", calculate);
  }
  fuel.addEventListener("change", calculate);

  for (const btn of methodButtons) {
    btn.addEventListener("click", () => {
      const next = btn.dataset.leakMethod as LeakMethod | undefined;
      if (!next) return;
      method = next;
      paintMethod();
      calculate();
    });
  }

  resetBtn?.addEventListener("click", () => {
    method = DEFAULTS.method;
    dpm.value = DEFAULTS.dpm;
    dpmRange.value = DEFAULTS.dpm;
    oz.value = DEFAULTS.oz;
    secs.value = DEFAULTS.secs;
    gal.value = DEFAULTS.gal;
    mins.value = DEFAULTS.mins;
    gpm.value = DEFAULTS.gpm;
    hot.value = DEFAULTS.hot;
    hotRange.value = DEFAULTS.hot;
    water.value = DEFAULTS.water;
    sewer.value = DEFAULTS.sewer;
    fuel.value = DEFAULTS.fuel;
    energy.value = DEFAULTS.energy;
    rise.value = DEFAULTS.rise;
    eff.value = DEFAULTS.eff;
    paintMethod();
    calculate();
  });

  paintMethod();
  calculate();
}
