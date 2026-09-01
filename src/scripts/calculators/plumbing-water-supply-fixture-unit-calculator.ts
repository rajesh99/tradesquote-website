import {
  WSFU_FIXTURES,
  fmt,
  wsfuToGpm,
  type SupplyControl,
} from "@/lib/plumbing";

/** Defaults: a typical two-bathroom house on flush-tank water closets. */
const DEFAULT_COUNTS: Record<string, number> = {
  "bathroom-group-tank": 2,
  "kitchen-sink-private": 1,
  "dishwasher-private": 1,
  "clothes-washer-private": 1,
  "hose-bibb": 2,
};

export function initPlumbingWaterSupplyFixtureUnitCalculator(): void {
  const control = document.getElementById("wsfu-control") as HTMLSelectElement | null;
  const resetBtn = document.getElementById("wsfu-reset");
  const fixtureInputs = Array.from(
    document.querySelectorAll<HTMLInputElement>("[data-wsfu-fixture]"),
  );

  const out = {
    total: document.getElementById("wsfu-total"),
    demand: document.getElementById("wsfu-demand"),
    note: document.getElementById("wsfu-note"),
    cold: document.getElementById("wsfu-cold"),
    hot: document.getElementById("wsfu-hot"),
    bdFixtures: document.getElementById("wsfu-bd-fixtures"),
    bdTotal: document.getElementById("wsfu-bd-total"),
    bdPerFu: document.getElementById("wsfu-bd-per-fu"),
    bdOther: document.getElementById("wsfu-bd-other"),
  };

  if (
    !control ||
    fixtureInputs.length === 0 ||
    !out.total ||
    !out.demand ||
    !out.note ||
    !out.cold ||
    !out.hot ||
    !out.bdFixtures ||
    !out.bdTotal ||
    !out.bdPerFu ||
    !out.bdOther
  ) {
    return;
  }

  function readCounts(): Record<string, number> {
    const counts: Record<string, number> = {};
    fixtureInputs.forEach((input) => {
      const key = input.dataset.wsfuFixture;
      if (!key) return;
      counts[key] = Math.max(0, parseFloat(input.value) || 0);
    });
    return counts;
  }

  function calculate(): void {
    const counts = readCounts();
    const mode = control!.value as SupplyControl;

    let total = 0;
    let cold = 0;
    let hot = 0;
    let fixtureCount = 0;
    WSFU_FIXTURES.forEach((f) => {
      const n = counts[f.key] ?? 0;
      if (n <= 0) return;
      fixtureCount += n;
      total += n * f.total;
      cold += n * f.cold;
      hot += n * f.hot;
    });

    const demand = wsfuToGpm(total, mode);
    const other = wsfuToGpm(total, mode === "valve" ? "tank" : "valve");

    out.total!.textContent = fmt(total, 1);
    out.demand!.textContent = total > 0 ? `${fmt(demand, 1)} gpm` : "—";
    out.cold!.textContent = fmt(cold, 1);
    out.hot!.textContent = fmt(hot, 1);

    if (total <= 0) {
      out.note!.textContent = "Add at least one fixture to see the peak demand.";
    } else {
      out.note!.textContent =
        mode === "valve"
          ? "Flushometer-valve system — valves draw hard and briefly, so demand runs well above a tank system."
          : "Flush-tank system — tanks refill slowly, so peak demand is far below the sum of the fixture flows.";
    }

    out.bdFixtures!.textContent = `${fmt(fixtureCount, 0)} fixture${fixtureCount === 1 ? "" : "s"}`;
    out.bdTotal!.textContent = `${fmt(total, 1)} WSFU`;
    out.bdPerFu!.textContent =
      total > 0 ? `${fmt(demand / total, 2)} gpm per fixture unit` : "—";
    out.bdOther!.textContent =
      total > 0
        ? `${fmt(other, 1)} gpm on a ${mode === "valve" ? "flush-tank" : "flushometer-valve"} system`
        : "—";
  }

  fixtureInputs.forEach((input) => input.addEventListener("input", calculate));
  control.addEventListener("change", calculate);

  resetBtn?.addEventListener("click", () => {
    fixtureInputs.forEach((input) => {
      const key = input.dataset.wsfuFixture ?? "";
      input.value = String(DEFAULT_COUNTS[key] ?? 0);
    });
    control.value = "tank";
    calculate();
  });

  calculate();
}
