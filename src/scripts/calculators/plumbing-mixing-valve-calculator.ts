import { fmt, mixedFlow } from "@/lib/plumbing";

export function initPlumbingMixingValveCalculator(): void {
  const hot = document.getElementById("mv-hot") as HTMLInputElement | null;
  const hotRange = document.getElementById("mv-hot-range") as HTMLInputElement | null;
  const cold = document.getElementById("mv-cold") as HTMLInputElement | null;
  const mix = document.getElementById("mv-mix") as HTMLInputElement | null;
  const flow = document.getElementById("mv-flow") as HTMLInputElement | null;
  const tank = document.getElementById("mv-tank") as HTMLInputElement | null;
  const resetBtn = document.getElementById("mv-reset");

  const out = {
    hotPct: document.getElementById("mv-hot-pct"),
    note: document.getElementById("mv-note"),
    hotGpm: document.getElementById("mv-hot-gpm"),
    coldGpm: document.getElementById("mv-cold-gpm"),
    warning: document.getElementById("mv-warning"),
    bdEffective: document.getElementById("mv-bd-effective"),
    bdMultiplier: document.getElementById("mv-bd-multiplier"),
    bdColdPct: document.getElementById("mv-bd-cold-pct"),
    bdScald: document.getElementById("mv-bd-scald"),
  };

  if (
    !hot ||
    !hotRange ||
    !cold ||
    !mix ||
    !flow ||
    !tank ||
    !out.hotPct ||
    !out.note ||
    !out.hotGpm ||
    !out.coldGpm ||
    !out.warning ||
    !out.bdEffective ||
    !out.bdMultiplier ||
    !out.bdColdPct ||
    !out.bdScald
  ) {
    return;
  }

  function calculate(): void {
    const hotF = parseFloat(hot!.value) || 0;
    const coldF = parseFloat(cold!.value) || 0;
    const mixF = parseFloat(mix!.value) || 0;
    const mixedGpm = Math.max(0, parseFloat(flow!.value) || 0);
    const tankGal = Math.max(0, parseFloat(tank!.value) || 0);

    const impossible = mixF > hotF || mixF < coldF || hotF <= coldF;
    if (impossible) {
      out.hotPct!.textContent = "—";
      out.note!.textContent =
        hotF <= coldF
          ? "The stored temperature has to be above the cold inlet."
          : "The delivered temperature has to sit between the cold inlet and the stored temperature.";
      out.hotGpm!.textContent = "—";
      out.coldGpm!.textContent = "—";
      out.warning!.classList.remove("hidden");
      return;
    }
    out.warning!.classList.add("hidden");

    const r = mixedFlow({ hotF, coldF, mixF, mixedGpm });

    out.hotPct!.textContent = `${fmt(r.hotFraction * 100, 1)}%`;
    out.hotGpm!.textContent = `${fmt(r.hotGpm, 2)} gpm`;
    out.coldGpm!.textContent = `${fmt(r.coldGpm, 2)} gpm`;

    const effective = tankGal * r.storageMultiplier;
    out.bdEffective!.textContent =
      Number.isFinite(effective) && tankGal > 0
        ? `${fmt(effective, 1)} gal of tempered water from a ${fmt(tankGal, 0)} gal tank`
        : "—";
    out.bdMultiplier!.textContent = Number.isFinite(r.storageMultiplier)
      ? `${fmt(r.storageMultiplier, 2)}×`
      : "—";
    out.bdColdPct!.textContent = `${fmt(r.coldFraction * 100, 1)}% of the delivered flow`;
    out.bdScald!.textContent =
      mixF > 120
        ? `${fmt(mixF, 0)} °F delivered — above the usual 120 °F scald limit`
        : `${fmt(mixF, 0)} °F delivered — at or under the usual 120 °F limit`;

    if (r.hotFraction >= 0.999) {
      out.note!.textContent =
        "Delivering at the stored temperature means no tempering at all — the valve is doing nothing and the tank gains no effective capacity.";
    } else {
      out.note!.textContent = `Storing at ${fmt(hotF, 0)} °F and delivering ${fmt(mixF, 0)} °F makes a ${fmt(tankGal, 0)} gallon tank behave like ${fmt(effective, 1)} gallons of usable hot water.`;
    }
  }

  function syncFromRange(): void {
    hot!.value = hotRange!.value;
    calculate();
  }

  function syncToRange(): void {
    const value = parseFloat(hot!.value) || 0;
    if (value >= Number(hotRange!.min) && value <= Number(hotRange!.max)) {
      hotRange!.value = String(value);
    }
    calculate();
  }

  hot.addEventListener("input", syncToRange);
  hotRange.addEventListener("input", syncFromRange);
  [cold, mix, flow, tank].forEach((el) => el.addEventListener("input", calculate));

  resetBtn?.addEventListener("click", () => {
    hot.value = "140";
    hotRange.value = "140";
    cold.value = "50";
    mix.value = "120";
    flow.value = "2.5";
    tank.value = "50";
    calculate();
  });

  calculate();
}
