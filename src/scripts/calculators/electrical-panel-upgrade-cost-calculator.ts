import { fmtInt, usd } from "@/lib/nec";

/**
 * Panel and breaker material cost by target service rating, and service-entrance
 * conductor cost per foot. 2026 US market figures — ranges, not quotes.
 */
const PANEL_COST: Record<string, number> = {
  "100": 400,
  "125": 500,
  "150": 600,
  "200": 900,
  "400": 2200,
};

const CONDUCTOR_COST_PER_FT: Record<string, number> = {
  "100": 6,
  "125": 8,
  "150": 9,
  "200": 12,
  "400": 28,
};

export function initElectricalPanelUpgradeCostCalculator(): void {
  const rating = document.getElementById("pu-rating") as HTMLSelectElement | null;
  const meter = document.getElementById("pu-meter") as HTMLSelectElement | null;
  const serviceType = document.getElementById("pu-service-type") as HTMLSelectElement | null;
  const length = document.getElementById("pu-length") as HTMLInputElement | null;
  const lengthRange = document.getElementById("pu-length-range") as HTMLInputElement | null;
  const permit = document.getElementById("pu-permit") as HTMLInputElement | null;
  const hours = document.getElementById("pu-hours") as HTMLInputElement | null;
  const rate = document.getElementById("pu-rate") as HTMLInputElement | null;
  const region = document.getElementById("pu-region") as HTMLSelectElement | null;
  const resetBtn = document.getElementById("pu-reset");

  const out = {
    total: document.getElementById("pu-total"),
    low: document.getElementById("pu-low"),
    high: document.getElementById("pu-high"),
    note: document.getElementById("pu-note"),
    bdPanel: document.getElementById("pu-bd-panel"),
    bdMeter: document.getElementById("pu-bd-meter"),
    bdConductors: document.getElementById("pu-bd-conductors"),
    bdMast: document.getElementById("pu-bd-mast"),
    bdPermit: document.getElementById("pu-bd-permit"),
    bdLabor: document.getElementById("pu-bd-labor"),
    bdSubtotal: document.getElementById("pu-bd-subtotal"),
    bdRegion: document.getElementById("pu-bd-region"),
  };

  if (!rating || !meter || !serviceType || !length || !lengthRange || !permit || !hours || !rate || !region) return;
  if (Object.values(out).some((el) => !el)) return;

  function calculate(): void {
    const amps = rating!.value;
    const runFt = Math.max(0, parseFloat(length!.value) || 0);
    const permitFee = Math.max(0, parseFloat(permit!.value) || 0);
    const laborHours = Math.max(0, parseFloat(hours!.value) || 0);
    const laborRate = Math.max(0, parseFloat(rate!.value) || 0);
    const regionMultiplier = parseFloat(region!.value) || 1;

    const panel = PANEL_COST[amps] ?? 900;
    const meterCost = meter!.value === "yes" ? 250 : 0;
    const conductorCost = (CONDUCTOR_COST_PER_FT[amps] ?? 12) * runFt;
    // Overhead services need a mast or riser; underground laterals do not.
    const mastCost = serviceType!.value === "overhead" ? 350 : 0;
    const labor = laborHours * laborRate;

    const subtotal = panel + meterCost + conductorCost + mastCost + permitFee + labor;
    const total = subtotal * regionMultiplier;

    out.total!.textContent = usd(total);
    out.low!.textContent = usd(total * 0.85);
    out.high!.textContent = usd(total * 1.15);

    out.note!.textContent =
      total < 1300
        ? "Below the typical market floor — check whether the scope is really this small."
        : total > 5000
          ? "Above the usual residential range. Long service runs, 400 A services, and difficult meter relocations do land here."
          : `Inside the $1,300–$5,000 range published for US residential panel and service upgrades in 2026.`;

    out.bdPanel!.textContent = `${usd(panel)} (${amps} A panel + breakers)`;
    out.bdMeter!.textContent = meterCost > 0 ? usd(meterCost) : "Reused — $0";
    out.bdConductors!.textContent = `${fmtInt(runFt)} ft × $${CONDUCTOR_COST_PER_FT[amps] ?? 12}/ft = ${usd(conductorCost)}`;
    out.bdMast!.textContent = mastCost > 0 ? `${usd(mastCost)} (overhead mast/riser)` : "Underground lateral — $0";
    out.bdPermit!.textContent = usd(permitFee);
    out.bdLabor!.textContent = `${laborHours} h × ${usd(laborRate)} = ${usd(labor)}`;
    out.bdSubtotal!.textContent = usd(subtotal);
    out.bdRegion!.textContent = `× ${regionMultiplier.toFixed(2)} = ${usd(total)}`;
  }

  length.addEventListener("input", () => {
    const v = parseFloat(length.value) || 0;
    if (v >= Number(lengthRange.min) && v <= Number(lengthRange.max)) lengthRange.value = String(v);
    calculate();
  });
  lengthRange.addEventListener("input", () => {
    length.value = lengthRange.value;
    calculate();
  });
  [rating, meter, serviceType, region].forEach((el) => el.addEventListener("change", calculate));
  [permit, hours, rate].forEach((el) => el.addEventListener("input", calculate));

  resetBtn?.addEventListener("click", () => {
    rating.value = "200";
    meter.value = "yes";
    serviceType.value = "overhead";
    length.value = "30";
    lengthRange.value = "30";
    permit.value = "250";
    hours.value = "10";
    rate.value = "95";
    region.value = "1";
    calculate();
  });

  calculate();
}
