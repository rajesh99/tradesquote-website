import { fmtInt, usd } from "@/lib/nec";

/**
 * EV charger installation cost. 2026 US market figures — ranges, not quotes.
 *
 * Conductor cost per foot tracks the circuit size the charger needs: a 48 A charger
 * is a 60 A circuit on 6 AWG, a 32 A charger a 40 A circuit on 8 AWG. The method
 * multiplier reflects labour and material difficulty rather than the wire itself.
 *
 * The service-upgrade figure deliberately matches the panel-upgrade cost calculator's
 * default total so the two tools cannot disagree.
 */
const CONDUCTOR_COST_PER_FT: Record<string, number> = {
  "32": 5,
  "40": 5,
  "48": 7,
  "60": 10,
};

const METHOD_MULTIPLIER: Record<string, number> = {
  surface: 1.0,
  fished: 1.6,
  trenched: 2.4,
};

const PANEL_WORK: Record<string, number> = {
  none: 0,
  breaker: 120,
  subpanel: 900,
  upgrade: 3060,
};

/** Receptacle or hardwire kit, box, and disconnecting means where required. */
const HARDWARE = 180;

export function initElectricalEvChargerInstallCostCalculator(): void {
  const amps = document.getElementById("ec-amps") as HTMLSelectElement | null;
  const distance = document.getElementById("ec-distance") as HTMLInputElement | null;
  const distanceRange = document.getElementById("ec-distance-range") as HTMLInputElement | null;
  const method = document.getElementById("ec-method") as HTMLSelectElement | null;
  const panel = document.getElementById("ec-panel") as HTMLSelectElement | null;
  const permit = document.getElementById("ec-permit") as HTMLInputElement | null;
  const hours = document.getElementById("ec-hours") as HTMLInputElement | null;
  const rate = document.getElementById("ec-rate") as HTMLInputElement | null;
  const region = document.getElementById("ec-region") as HTMLSelectElement | null;
  const resetBtn = document.getElementById("ec-reset");

  const out = {
    total: document.getElementById("ec-total"),
    low: document.getElementById("ec-low"),
    high: document.getElementById("ec-high"),
    note: document.getElementById("ec-note"),
    bdConductor: document.getElementById("ec-bd-conductor"),
    bdHardware: document.getElementById("ec-bd-hardware"),
    bdPanel: document.getElementById("ec-bd-panel"),
    bdPermit: document.getElementById("ec-bd-permit"),
    bdLabor: document.getElementById("ec-bd-labor"),
    bdSubtotal: document.getElementById("ec-bd-subtotal"),
    bdRegion: document.getElementById("ec-bd-region"),
  };

  if (!amps || !distance || !distanceRange || !method || !panel || !permit || !hours || !rate || !region) return;
  if (Object.values(out).some((el) => !el)) return;

  function calculate(): void {
    const chargerAmps = amps!.value;
    const runFt = Math.max(0, parseFloat(distance!.value) || 0);
    const permitFee = Math.max(0, parseFloat(permit!.value) || 0);
    const laborHours = Math.max(0, parseFloat(hours!.value) || 0);
    const laborRate = Math.max(0, parseFloat(rate!.value) || 0);
    const regionMultiplier = parseFloat(region!.value) || 1;

    const perFt = CONDUCTOR_COST_PER_FT[chargerAmps] ?? 7;
    const methodMult = METHOD_MULTIPLIER[method!.value] ?? 1;
    const conductorCost = perFt * methodMult * runFt;
    const panelCost = PANEL_WORK[panel!.value] ?? 0;
    const labor = laborHours * laborRate;

    const subtotal = conductorCost + HARDWARE + panelCost + permitFee + labor;
    const total = subtotal * regionMultiplier;

    out.total!.textContent = usd(total);
    out.low!.textContent = usd(total * 0.85);
    out.high!.textContent = usd(total * 1.15);

    if (panel!.value === "upgrade") {
      out.note!.textContent =
        "A service upgrade dominates this total. Before committing, check whether NEC 220.87 measured demand shows the existing service already has room — that frequently removes the upgrade entirely.";
    } else if (total < 500) {
      out.note!.textContent =
        "Below the usual market floor. Realistic only for a very short surface run with the breaker space already free and no permit fee.";
    } else if (total > 2500) {
      out.note!.textContent =
        "Above the commonly cited $500–$2,500 band. Long trenched runs, 60 A circuits, and subpanel work do land here legitimately.";
    } else {
      out.note!.textContent =
        "Inside the $500–$2,500 range typically published for US residential EV charger installation in 2026.";
    }

    out.bdConductor!.textContent = `${fmtInt(runFt)} ft × $${perFt}/ft × ${methodMult.toFixed(2)} = ${usd(conductorCost)}`;
    out.bdHardware!.textContent = `${usd(HARDWARE)} (receptacle or hardwire kit, box, disconnect)`;
    out.bdPanel!.textContent = panelCost > 0 ? usd(panelCost) : "Nothing needed — $0";
    out.bdPermit!.textContent = usd(permitFee);
    out.bdLabor!.textContent = `${laborHours} h × ${usd(laborRate)} = ${usd(labor)}`;
    out.bdSubtotal!.textContent = usd(subtotal);
    out.bdRegion!.textContent = `× ${regionMultiplier.toFixed(2)} = ${usd(total)}`;
  }

  distance.addEventListener("input", () => {
    const v = parseFloat(distance.value) || 0;
    if (v >= Number(distanceRange.min) && v <= Number(distanceRange.max)) distanceRange.value = String(v);
    calculate();
  });
  distanceRange.addEventListener("input", () => {
    distance.value = distanceRange.value;
    calculate();
  });
  [amps, method, panel, region].forEach((el) => el.addEventListener("change", calculate));
  [permit, hours, rate].forEach((el) => el.addEventListener("input", calculate));

  resetBtn?.addEventListener("click", () => {
    amps.value = "48";
    distance.value = "40";
    distanceRange.value = "40";
    method.value = "surface";
    panel.value = "breaker";
    permit.value = "150";
    hours.value = "6";
    rate.value = "95";
    region.value = "1";
    calculate();
  });

  calculate();
}
