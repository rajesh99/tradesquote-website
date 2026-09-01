import {
  DFU_FIXTURES,
  drainCapacity,
  fmt,
  minDrainSizeApplied,
  minSlope,
  sizeLabel,
  slopeToPercent,
  type DrainApplication,
} from "@/lib/plumbing";

/** Defaults: a two-bathroom house with a laundry. */
const DEFAULT_COUNTS: Record<string, number> = {
  "bathroom-group-16": 2,
  "kitchen-sink": 1,
  dishwasher: 1,
  "clothes-washer-res": 1,
  "laundry-tray": 1,
};

export function initPlumbingDrainageFixtureUnitCalculator(): void {
  const application = document.getElementById("dfu-application") as HTMLSelectElement | null;
  const slope = document.getElementById("dfu-slope") as HTMLSelectElement | null;
  const resetBtn = document.getElementById("dfu-reset");
  const fixtureInputs = Array.from(
    document.querySelectorAll<HTMLInputElement>("[data-dfu-fixture]"),
  );

  const out = {
    total: document.getElementById("dfu-total"),
    size: document.getElementById("dfu-size"),
    note: document.getElementById("dfu-note"),
    capacity: document.getElementById("dfu-capacity"),
    wcNotice: document.getElementById("dfu-wc-notice"),
    bdFixtures: document.getElementById("dfu-bd-fixtures"),
    bdTable: document.getElementById("dfu-bd-table"),
    bdSlope: document.getElementById("dfu-bd-slope"),
    bdLargestTrap: document.getElementById("dfu-bd-largest-trap"),
    bdHeadroom: document.getElementById("dfu-bd-headroom"),
  };

  if (
    !application ||
    !slope ||
    fixtureInputs.length === 0 ||
    !out.total ||
    !out.size ||
    !out.note ||
    !out.capacity ||
    !out.wcNotice ||
    !out.bdFixtures ||
    !out.bdTable ||
    !out.bdSlope ||
    !out.bdLargestTrap ||
    !out.bdHeadroom
  ) {
    return;
  }

  /** Water closets and bathroom groups floor a building drain at 3 inches. */
  const WC_KEYS = new Set([
    "bathroom-group-16",
    "bathroom-group-over",
    "wc-private-16",
    "wc-private-over",
    "wc-public-16",
    "wc-public-over",
    "wc-flushometer-tank",
  ]);

  function calculate(): void {
    const app = application!.value as DrainApplication;
    const slopeValue = parseFloat(slope!.value) || 0.25;

    let total = 0;
    let fixtureCount = 0;
    let servesWc = false;
    let largestTrap = 0;

    fixtureInputs.forEach((input) => {
      const key = input.dataset.dfuFixture;
      if (!key) return;
      const n = Math.max(0, parseFloat(input.value) || 0);
      if (n <= 0) return;
      const fixture = DFU_FIXTURES.find((f) => f.key === key);
      if (!fixture) return;
      fixtureCount += n;
      total += n * fixture.dfu;
      if (WC_KEYS.has(key)) servesWc = true;
      if (fixture.trap !== null && fixture.trap > largestTrap) largestTrap = fixture.trap;
    });

    const result = minDrainSizeApplied(total, app, slopeValue, servesWc);
    const isBuildingDrain = app === "building-drain";

    out.total!.textContent = fmt(total, 1);
    out.size!.textContent = result.size === null ? "—" : sizeLabel(result.size);

    const capacity = result.size === null ? null : drainCapacity(result.size, app, slopeValue);
    out.capacity!.textContent = capacity === null ? "—" : `${fmt(capacity, 0)} DFU`;

    if (result.size === null) {
      out.note!.textContent =
        "The load exceeds the largest listed size for this application. Split it across more than one drain.";
    } else if (result.governedBy === "water-closet") {
      out.note!.textContent = `The table alone allows ${sizeLabel(result.fromTable ?? 0)}, but a water closet on a building drain floors it at 3 inches.`;
    } else {
      out.note!.textContent = `Smallest size in the table that carries ${fmt(total, 1)} DFU for this application.`;
    }

    out.wcNotice!.classList.toggle("hidden", result.governedBy !== "water-closet");
    out.bdFixtures!.textContent = `${fmt(fixtureCount, 0)} fixture${fixtureCount === 1 ? "" : "s"}`;
    out.bdTable!.textContent =
      result.fromTable === null ? "—" : `${sizeLabel(result.fromTable)} from the table alone`;
    out.bdSlope!.textContent = isBuildingDrain
      ? `${slopeValue} in/ft (${fmt(slopeToPercent(slopeValue), 2)}%)`
      : "not slope-dependent";
    out.bdLargestTrap!.textContent =
      largestTrap > 0 ? `${sizeLabel(largestTrap)} minimum` : "no separate trap required";
    out.bdHeadroom!.textContent =
      capacity === null ? "—" : `${fmt(capacity - total, 1)} DFU spare`;

    // Minimum slope for the chosen size is a useful nudge on gravity runs.
    if (result.size !== null && isBuildingDrain) {
      const required = minSlope(result.size);
      if (slopeValue < required) {
        out.note!.textContent += ` Note: ${sizeLabel(result.size)} needs at least ${required} in/ft under Table 704.1.`;
      }
    }
  }

  fixtureInputs.forEach((input) => input.addEventListener("input", calculate));
  application.addEventListener("change", calculate);
  slope.addEventListener("change", calculate);

  resetBtn?.addEventListener("click", () => {
    fixtureInputs.forEach((input) => {
      const key = input.dataset.dfuFixture ?? "";
      input.value = String(DEFAULT_COUNTS[key] ?? 0);
    });
    application.value = "building-drain";
    slope.value = "0.25";
    calculate();
  });

  calculate();
}
