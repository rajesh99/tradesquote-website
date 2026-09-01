import {
  ATMOSPHERIC_PSI,
  expansionTank,
  fmt,
  selectExpansionTank,
} from "@/lib/plumbing";

export function initPlumbingExpansionTankCalculator(): void {
  const system = document.getElementById("xt-system") as HTMLInputElement | null;
  const systemRange = document.getElementById("xt-system-range") as HTMLInputElement | null;
  const cold = document.getElementById("xt-cold") as HTMLInputElement | null;
  const hot = document.getElementById("xt-hot") as HTMLInputElement | null;
  const supply = document.getElementById("xt-supply") as HTMLInputElement | null;
  const max = document.getElementById("xt-max") as HTMLInputElement | null;
  const resetBtn = document.getElementById("xt-reset");

  const out = {
    shell: document.getElementById("xt-shell"),
    note: document.getElementById("xt-note"),
    required: document.getElementById("xt-required"),
    acceptance: document.getElementById("xt-acceptance"),
    warning: document.getElementById("xt-warning"),
    bdExpansion: document.getElementById("xt-bd-expansion"),
    bdRatio: document.getElementById("xt-bd-ratio"),
    bdAbsolute: document.getElementById("xt-bd-absolute"),
    bdPrecharge: document.getElementById("xt-bd-precharge"),
    bdWider: document.getElementById("xt-bd-wider"),
  };

  if (
    !system ||
    !systemRange ||
    !cold ||
    !hot ||
    !supply ||
    !max ||
    !out.shell ||
    !out.note ||
    !out.required ||
    !out.acceptance ||
    !out.warning ||
    !out.bdExpansion ||
    !out.bdRatio ||
    !out.bdAbsolute ||
    !out.bdPrecharge ||
    !out.bdWider
  ) {
    return;
  }

  function calculate(): void {
    const systemGallons = Math.max(0, parseFloat(system!.value) || 0);
    const coldF = parseFloat(cold!.value) || 0;
    const hotF = parseFloat(hot!.value) || 0;
    const supplyPsi = Math.max(0, parseFloat(supply!.value) || 0);
    const maxPsi = Math.max(0, parseFloat(max!.value) || 0);

    const invalid = hotF <= coldF || maxPsi <= supplyPsi;
    if (invalid) {
      out.shell!.textContent = "—";
      out.note!.textContent =
        hotF <= coldF
          ? "The hot temperature has to be above the cold inlet temperature."
          : "The maximum working pressure has to be above the pre-charge, or the tank has no room to compress into.";
      out.required!.textContent = "—";
      out.acceptance!.textContent = "—";
      out.warning!.classList.remove("hidden");
      return;
    }

    const r = expansionTank({ systemGallons, coldF, hotF, supplyPsi, maxPsi });
    const shell = selectExpansionTank(r.tankVolume);

    out.required!.textContent = `${fmt(r.tankVolume, 2)} gal`;
    out.acceptance!.textContent = `${fmt(r.acceptance, 2)} gal`;
    out.shell!.textContent = shell === null ? "—" : `${shell} gal`;
    out.warning!.classList.toggle("hidden", shell !== null);

    if (shell === null) {
      out.note!.textContent =
        "Larger than any commonly stocked residential shell. Use a commercial tank, or widen the pressure window with a lower pre-charge.";
    } else {
      out.note!.textContent = `Smallest stocked shell covering the ${fmt(r.tankVolume, 2)} gallon minimum. Pre-charge it to ${fmt(supplyPsi, 0)} psi before it sees water.`;
    }

    out.bdExpansion!.textContent = `${fmt(r.fraction * 100, 2)}% of ${fmt(systemGallons, 0)} gal`;
    out.bdRatio!.textContent = `${fmt(r.acceptanceRatio * 100, 1)}% of the shell is usable`;
    out.bdAbsolute!.textContent = `${fmt(supplyPsi + ATMOSPHERIC_PSI, 1)} → ${fmt(maxPsi + ATMOSPHERIC_PSI, 1)} psia`;
    out.bdPrecharge!.textContent = `${fmt(supplyPsi, 0)} psi, matching the supply`;

    // The pre-charge is the strongest lever, so show what dropping it 10 psi buys.
    const lower = expansionTank({
      systemGallons,
      coldF,
      hotF,
      supplyPsi: Math.max(0, supplyPsi - 10),
      maxPsi,
    });
    out.bdWider!.textContent = `${fmt(lower.tankVolume, 2)} gal at a ${fmt(Math.max(0, supplyPsi - 10), 0)} psi pre-charge`;
  }

  function syncFromRange(): void {
    system!.value = systemRange!.value;
    calculate();
  }

  function syncToRange(): void {
    const value = parseFloat(system!.value) || 0;
    if (value >= Number(systemRange!.min) && value <= Number(systemRange!.max)) {
      systemRange!.value = String(value);
    }
    calculate();
  }

  system.addEventListener("input", syncToRange);
  systemRange.addEventListener("input", syncFromRange);
  [cold, hot, supply, max].forEach((el) => el.addEventListener("input", calculate));

  resetBtn?.addEventListener("click", () => {
    system.value = "50";
    systemRange.value = "50";
    cold.value = "40";
    hot.value = "140";
    supply.value = "60";
    max.value = "80";
    calculate();
  });

  calculate();
}
