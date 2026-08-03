import {
  ampacityOf,
  egcSize,
  findSizeByAmpacity,
  fmt,
  fmtInt,
  nextStandardOcpd,
  sizeLabel,
  voltageDrop,
  type ConductorMaterial,
} from "@/lib/nec";

export function initElectricalEvChargerCalculator(): void {
  const amps = document.getElementById("ev-amps") as HTMLSelectElement | null;
  const voltage = document.getElementById("ev-voltage") as HTMLSelectElement | null;
  const material = document.getElementById("ev-material") as HTMLSelectElement | null;
  const length = document.getElementById("ev-length") as HTMLInputElement | null;
  const existingVa = document.getElementById("ev-existing-va") as HTMLInputElement | null;
  const service = document.getElementById("ev-service") as HTMLSelectElement | null;
  const resetBtn = document.getElementById("ev-reset");

  const out = {
    breaker: document.getElementById("ev-breaker"),
    conductor: document.getElementById("ev-conductor"),
    egc: document.getElementById("ev-egc"),
    verdict: document.getElementById("ev-verdict"),
    bdContinuous: document.getElementById("ev-bd-continuous"),
    bdBreaker: document.getElementById("ev-bd-breaker"),
    bdConductor: document.getElementById("ev-bd-conductor"),
    bdEgc: document.getElementById("ev-bd-egc"),
    bdDrop: document.getElementById("ev-bd-drop"),
    bdEvseVa: document.getElementById("ev-bd-evse-va"),
    bdNewTotal: document.getElementById("ev-bd-new-total"),
    bdUtilisation: document.getElementById("ev-bd-utilisation"),
  };

  if (
    !amps ||
    !voltage ||
    !material ||
    !length ||
    !existingVa ||
    !service ||
    Object.values(out).some((el) => !el)
  ) {
    return;
  }

  function calculate(): void {
    const chargerAmps = parseFloat(amps!.value) || 48;
    const volts = parseFloat(voltage!.value) || 240;
    const mat = material!.value as ConductorMaterial;
    const runFt = parseFloat(length!.value) || 0;
    const existing = Math.max(0, parseFloat(existingVa!.value) || 0);
    const serviceRating = parseInt(service!.value) || 200;

    // NEC 625.41/625.42 — EVSE is a continuous load, so conductors and the
    // overcurrent device are sized at 125% of the charger's rated output.
    const required = chargerAmps * 1.25;
    const breaker = nextStandardOcpd(required);

    const conductor = findSizeByAmpacity(breaker, mat, 75);
    const conductorAmpacity = conductor ? (ampacityOf(conductor, mat, 75) ?? 0) : 0;
    const egc = egcSize(breaker, "copper");

    const drop = conductor
      ? voltageDrop({ cmil: conductor.cmil, material: mat, amps: chargerAmps, lengthFt: runFt, phase: 1 })
      : 0;
    const dropPercent = volts > 0 ? (drop / volts) * 100 : 0;

    const evseVa = chargerAmps * volts;
    const newTotalVa = existing + evseVa;
    const newAmps = newTotalVa / 240;
    const utilisation = serviceRating > 0 ? (newAmps / serviceRating) * 100 : 0;

    out.breaker!.textContent = `${breaker} A`;
    out.conductor!.textContent = conductor ? `${sizeLabel(conductor.label)} ${mat}` : "—";
    out.egc!.textContent = `${sizeLabel(egc)} copper`;

    if (utilisation > 100) {
      out.verdict!.textContent = `Will not fit — ${fmt(newAmps)} A is ${fmt(utilisation)}% of the ${serviceRating} A service. Use a smaller charger with load management (Article 750), or upgrade the service.`;
      out.verdict!.className = "mt-1 text-sm font-semibold text-rose-700";
    } else if (utilisation > 80) {
      out.verdict!.textContent = `Fits, but tight — ${fmt(utilisation)}% of the ${serviceRating} A service. Load management is worth pricing against an upgrade.`;
      out.verdict!.className = "mt-1 text-sm font-semibold text-amber-700";
    } else {
      out.verdict!.textContent = `Fits — the charger brings the service to ${fmt(utilisation)}% of ${serviceRating} A.`;
      out.verdict!.className = "mt-1 text-sm font-semibold text-emerald-700";
    }

    out.bdContinuous!.textContent = `${chargerAmps} A × 1.25 = ${fmt(required)} A`;
    out.bdBreaker!.textContent = `${breaker} A (240.6(A))`;
    out.bdConductor!.textContent = conductor
      ? `${sizeLabel(conductor.label)} ${mat} — ${conductorAmpacity} A at 75 °C`
      : "Parallel conductors required";
    out.bdEgc!.textContent = `${sizeLabel(egc)} copper (Table 250.122)`;
    out.bdDrop!.textContent = `${fmt(dropPercent, 2)}% over ${Math.round(runFt)} ft${dropPercent > 3 ? " — over 3%, upsize" : ""}`;
    out.bdEvseVa!.textContent = `${chargerAmps} A × ${volts} V = ${fmtInt(evseVa)} VA`;
    out.bdNewTotal!.textContent = `${fmtInt(newTotalVa)} VA = ${fmt(newAmps)} A`;
    out.bdUtilisation!.textContent = `${fmt(utilisation)}% of ${serviceRating} A`;
  }

  [amps, voltage, material, service].forEach((el) => el.addEventListener("change", calculate));
  [length, existingVa].forEach((el) => el.addEventListener("input", calculate));

  resetBtn?.addEventListener("click", () => {
    amps.value = "48";
    voltage.value = "240";
    material.value = "copper";
    length.value = "60";
    existingVa.value = "24280";
    service.value = "200";
    calculate();
  });

  calculate();
}
