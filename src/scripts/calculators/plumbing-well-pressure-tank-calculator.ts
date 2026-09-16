import {
  ATMOSPHERIC_PSI,
  PRECHARGE_BELOW_CUTIN_PSI,
  fmt,
  pressureTankSizing,
} from "@/lib/plumbing";

export function initPlumbingWellPressureTankCalculator(): void {
  const gpm = document.getElementById("pt-gpm") as HTMLInputElement | null;
  const gpmRange = document.getElementById("pt-gpm-range") as HTMLInputElement | null;
  const preset = document.getElementById("pt-preset") as HTMLSelectElement | null;
  const cutIn = document.getElementById("pt-cutin") as HTMLInputElement | null;
  const cutOut = document.getElementById("pt-cutout") as HTMLInputElement | null;
  const precharge = document.getElementById("pt-precharge") as HTMLInputElement | null;
  const run = document.getElementById("pt-run") as HTMLSelectElement | null;
  const resetBtn = document.getElementById("pt-reset");

  const out = {
    tank: document.getElementById("pt-tank"),
    note: document.getElementById("pt-note"),
    fraction: document.getElementById("pt-fraction"),
    required: document.getElementById("pt-required"),
    warning: document.getElementById("pt-warning"),
    warningText: document.getElementById("pt-warning-text"),
    bdPrecharge: document.getElementById("pt-bd-precharge"),
    bdWindow: document.getElementById("pt-bd-window"),
    bdRun: document.getElementById("pt-bd-run"),
    bdTank: document.getElementById("pt-bd-tank"),
    bdDelivered: document.getElementById("pt-bd-delivered"),
    bdRuntime: document.getElementById("pt-bd-runtime"),
  };

  if (
    !gpm ||
    !gpmRange ||
    !preset ||
    !cutIn ||
    !cutOut ||
    !precharge ||
    !run ||
    !out.tank ||
    !out.note ||
    !out.fraction ||
    !out.required ||
    !out.warning ||
    !out.warningText ||
    !out.bdPrecharge ||
    !out.bdWindow ||
    !out.bdRun ||
    !out.bdTank ||
    !out.bdDelivered ||
    !out.bdRuntime
  ) {
    return;
  }

  function num(el: HTMLInputElement, min = 0): number {
    const v = parseFloat(el.value);
    return Number.isFinite(v) ? Math.max(min, v) : min;
  }

  function calculate(): void {
    const pumpGpm = num(gpm!);
    const on = num(cutIn!);
    const off = num(cutOut!);
    const pre = num(precharge!);
    const chosenRun = run!.value === "auto" ? undefined : parseFloat(run!.value);

    const r = pressureTankSizing({
      pumpGpm,
      cutInPsi: on,
      cutOutPsi: off,
      prechargePsi: pre,
      runMinutes: chosenRun,
    });

    out.tank!.textContent = r.stockedTank === null ? "—" : `${fmt(r.stockedTank, 0)} gal`;
    out.fraction!.textContent = `${fmt(r.fraction * 100, 1)}%`;
    out.required!.textContent = `${fmt(r.requiredDrawdown, 1)} gal`;

    out.bdPrecharge!.textContent = `${fmt(r.prechargePsi, 0)} psi (${fmt(r.prechargePsi + ATMOSPHERIC_PSI, 1)} absolute)`;
    out.bdWindow!.textContent = `${fmt(on + ATMOSPHERIC_PSI, 1)} → ${fmt(off + ATMOSPHERIC_PSI, 1)} psi absolute`;
    out.bdRun!.textContent = `${fmt(r.runMinutes, 2)} min${run!.value === "auto" ? ` (recommended for ${fmt(pumpGpm, 0)} gpm)` : ""}`;
    out.bdTank!.textContent = Number.isFinite(r.requiredTank)
      ? `${fmt(r.requiredTank, 1)} gal minimum shell`
      : "—";
    out.bdDelivered!.textContent =
      r.stockedTank === null ? "—" : `${fmt(r.drawdownAtStocked, 2)} gal per cycle`;
    out.bdRuntime!.textContent =
      r.stockedTank === null ? "—" : `${fmt(r.runMinutesAtStocked, 2)} min per cycle`;

    // Warnings, in priority order — the pre-charge failures matter most.
    let warning = "";
    if (off <= on) {
      warning =
        "Cut-out has to be above cut-in. A pressure switch with no span between its two settings would never let the pump stop.";
    } else if (pre >= off) {
      warning =
        "The pre-charge is at or above cut-out, so the diaphragm never moves and the tank delivers nothing. Bleed it down to about two psi below cut-in.";
    } else if (pre > on) {
      warning = `A pre-charge above cut-in empties the tank before the pump restarts, which is why the drawdown has collapsed to ${fmt(r.fraction * 100, 1)}%. Set it to about ${fmt(Math.max(0, on - PRECHARGE_BELOW_CUTIN_PSI), 0)} psi.`;
    } else if (r.stockedTank === null) {
      warning =
        "The required shell is past the largest common residential tank. Use two or more tanks in parallel, a wider pressure band, or a variable-speed pump that does not cycle.";
    }

    if (warning) {
      out.warning!.classList.remove("hidden");
      out.warningText!.textContent = warning;
    } else {
      out.warning!.classList.add("hidden");
    }

    if (r.stockedTank === null) {
      out.note!.textContent = Number.isFinite(r.requiredTank)
        ? `${fmt(r.requiredTank, 0)} gallons of shell needed — past a single stocked tank.`
        : "Check the pressure settings.";
    } else {
      out.note!.textContent = `Smallest stocked shell covering the ${fmt(r.requiredTank, 1)} gallon minimum. It delivers ${fmt(r.drawdownAtStocked, 1)} gallons a cycle — ${fmt(r.fraction * 100, 1)}% of its own volume.`;
    }
  }

  /** Re-derive the pre-charge from cut-in. Called whenever the band changes. */
  function syncPrecharge(): void {
    const on = num(cutIn!);
    precharge!.value = String(Math.max(0, on - PRECHARGE_BELOW_CUTIN_PSI));
  }

  /** Picking a stock pressure switch writes both settings, then the pre-charge. */
  function applyPreset(): void {
    const chosen = preset!.value;
    if (chosen !== "custom") {
      const [on, off] = chosen.split("/");
      cutIn!.value = on;
      cutOut!.value = off;
      syncPrecharge();
    }
    calculate();
  }

  /** Typing a band by hand drops the preset back to Custom. */
  function onBandInput(): void {
    const match = `${cutIn!.value}/${cutOut!.value}`;
    preset!.value = Array.from(preset!.options).some((o) => o.value === match) ? match : "custom";
    syncPrecharge();
    calculate();
  }

  function syncFromRange(): void {
    gpm!.value = gpmRange!.value;
    calculate();
  }

  function syncToRange(): void {
    const value = parseFloat(gpm!.value) || 0;
    if (value >= Number(gpmRange!.min) && value <= Number(gpmRange!.max)) {
      gpmRange!.value = String(value);
    }
    calculate();
  }

  gpm.addEventListener("input", syncToRange);
  gpmRange.addEventListener("input", syncFromRange);
  preset.addEventListener("change", applyPreset);
  [cutIn, cutOut].forEach((el) => el.addEventListener("input", onBandInput));
  precharge.addEventListener("input", calculate);
  run.addEventListener("change", calculate);

  resetBtn?.addEventListener("click", () => {
    gpm.value = "10";
    gpmRange.value = "10";
    preset.value = "30/50";
    cutIn.value = "30";
    cutOut.value = "50";
    precharge.value = "28";
    run.value = "auto";
    calculate();
  });

  calculate();
}
