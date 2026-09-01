import {
  WATER_HEATER_UNITS,
  fmt,
  usd,
  waterHeaterCost,
  type WaterHeaterUpgradeKey,
} from "@/lib/plumbing";

export function initPlumbingWaterHeaterReplacementCostCalculator(): void {
  const unitKey = document.getElementById("whc-unit") as HTMLSelectElement | null;
  const labourRate = document.getElementById("whc-rate") as HTMLInputElement | null;
  const permit = document.getElementById("whc-permit") as HTMLInputElement | null;
  const haulAway = document.getElementById("whc-haul") as HTMLInputElement | null;
  const regionKey = document.getElementById("whc-region") as HTMLSelectElement | null;
  const resetBtn = document.getElementById("whc-reset");
  const upgradeInputs = Array.from(
    document.querySelectorAll<HTMLInputElement>("[data-whc-upgrade]"),
  );

  const out = {
    total: document.getElementById("whc-total"),
    note: document.getElementById("whc-note"),
    band: document.getElementById("whc-band"),
    unitShare: document.getElementById("whc-unit-share"),
    bdUnit: document.getElementById("whc-bd-unit"),
    bdLabour: document.getElementById("whc-bd-labour"),
    bdUpgrades: document.getElementById("whc-bd-upgrades"),
    bdFixed: document.getElementById("whc-bd-fixed"),
    bdRegion: document.getElementById("whc-bd-region"),
  };

  if (
    !unitKey ||
    !labourRate ||
    !permit ||
    !haulAway ||
    !regionKey ||
    upgradeInputs.length === 0 ||
    !out.total ||
    !out.note ||
    !out.band ||
    !out.unitShare ||
    !out.bdUnit ||
    !out.bdLabour ||
    !out.bdUpgrades ||
    !out.bdFixed ||
    !out.bdRegion
  ) {
    return;
  }

  const DEFAULT_UPGRADES = new Set(["expansionTank", "pan"]);

  function calculate(): void {
    const upgrades = upgradeInputs
      .filter((input) => input.checked)
      .map((input) => input.dataset.whcUpgrade as WaterHeaterUpgradeKey)
      .filter(Boolean);

    const result = waterHeaterCost({
      unitKey: unitKey!.value,
      labourRate: Math.max(0, parseFloat(labourRate!.value) || 0),
      permit: Math.max(0, parseFloat(permit!.value) || 0),
      haulAway: Math.max(0, parseFloat(haulAway!.value) || 0),
      upgrades,
      regionKey: regionKey!.value,
    });

    const spec = WATER_HEATER_UNITS.find((u) => u.key === unitKey!.value);

    out.total!.textContent = usd(result.total);
    out.band!.textContent = `${usd(result.low)} – ${usd(result.high)}`;
    out.unitShare!.textContent = `${fmt(result.unitShare, 0)}%`;

    out.note!.textContent =
      result.upgradeTotal > 0
        ? `${spec?.label ?? "Unit"} with ${result.upgradeLines.length} code upgrade${result.upgradeLines.length === 1 ? "" : "s"} adding ${usd(result.upgradeTotal)}. The appliance is only ${fmt(result.unitShare, 0)}% of the invoice.`
        : `${spec?.label ?? "Unit"} as a straight swap with no code upgrades. Confirm nothing is required — IPC 607.3 makes an expansion tank mandatory on a closed system.`;

    out.bdUnit!.textContent = usd(result.unit);
    out.bdLabour!.textContent = `${result.hours} h → ${usd(result.labour)}`;
    out.bdUpgrades!.textContent =
      result.upgradeLines.length > 0
        ? result.upgradeLines.map((u) => `${u.label} ${usd(u.cost)}`).join(", ")
        : "none selected";
    out.bdFixed!.textContent = `${usd(parseFloat(permit!.value) || 0)} permit + ${usd(parseFloat(haulAway!.value) || 0)} haul-away`;
    out.bdRegion!.textContent = usd(result.total);
  }

  upgradeInputs.forEach((input) => input.addEventListener("change", calculate));
  [unitKey, regionKey].forEach((el) => el.addEventListener("change", calculate));
  [labourRate, permit, haulAway].forEach((el) => el.addEventListener("input", calculate));

  resetBtn?.addEventListener("click", () => {
    unitKey.value = "tank-gas-50";
    labourRate.value = "110";
    permit.value = "200";
    haulAway.value = "60";
    regionKey.value = "average";
    upgradeInputs.forEach((input) => {
      input.checked = DEFAULT_UPGRADES.has(input.dataset.whcUpgrade ?? "");
    });
    calculate();
  });

  calculate();
}
