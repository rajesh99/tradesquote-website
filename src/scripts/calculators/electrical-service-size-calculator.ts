import { STANDARD_SERVICE_RATINGS, fmt, fmtInt } from "@/lib/nec";

/** Reference additions used to describe what the spare capacity actually fits. */
const ADDITIONS = [
  { label: "a 48 A EV charger", va: 11520 },
  { label: "a 40 A EV charger", va: 9600 },
  { label: "a heat pump", va: 7000 },
  { label: "an induction range", va: 12000 },
];

export function initElectricalServiceSizeCalculator(): void {
  const va = document.getElementById("ss-va") as HTMLInputElement | null;
  const vaRange = document.getElementById("ss-va-range") as HTMLInputElement | null;
  const voltage = document.getElementById("ss-voltage") as HTMLSelectElement | null;
  const existing = document.getElementById("ss-existing") as HTMLSelectElement | null;
  const future = document.getElementById("ss-future") as HTMLInputElement | null;
  const resetBtn = document.getElementById("ss-reset");

  const out = {
    service: document.getElementById("ss-service"),
    utilisation: document.getElementById("ss-utilisation"),
    headroom: document.getElementById("ss-headroom"),
    note: document.getElementById("ss-note"),
    bdAmps: document.getElementById("ss-bd-amps"),
    bdMinimum: document.getElementById("ss-bd-minimum"),
    bdExisting: document.getElementById("ss-bd-existing"),
    bdSpareVa: document.getElementById("ss-bd-spare-va"),
    bdFits: document.getElementById("ss-bd-fits"),
    bdVerdict: document.getElementById("ss-bd-verdict"),
  };

  if (
    !va ||
    !vaRange ||
    !voltage ||
    !existing ||
    !future ||
    Object.values(out).some((el) => !el)
  ) {
    return;
  }

  function calculate(): void {
    const calculatedVa = Math.max(0, parseFloat(va!.value) || 0);
    const plannedVa = Math.max(0, parseFloat(future!.value) || 0);
    const volts = parseFloat(voltage!.value) || 240;
    const existingRating = parseInt(existing!.value) || 200;

    const totalVa = calculatedVa + plannedVa;
    const amps = volts > 0 ? totalVa / volts : 0;
    const minimum = STANDARD_SERVICE_RATINGS.find((r) => r >= amps) ?? 400;
    const utilisation = existingRating > 0 ? (amps / existingRating) * 100 : 0;
    const headroomAmps = existingRating - amps;
    const headroomVa = headroomAmps * volts;

    out.service!.textContent = `${minimum} A`;
    out.utilisation!.textContent = `${fmt(utilisation)}%`;
    out.headroom!.textContent =
      headroomAmps >= 0 ? `${fmt(headroomAmps)} A` : `${fmt(Math.abs(headroomAmps))} A over`;

    if (amps === 0) {
      out.note!.textContent = "Enter a calculated load to size the service.";
      out.note!.className = "mt-1 text-sm font-semibold text-slate-600";
    } else if (utilisation > 100) {
      out.note!.textContent = `${fmt(amps)} A exceeds the ${existingRating} A service — upgrade, or add load management.`;
      out.note!.className = "mt-1 text-sm font-semibold text-rose-700";
    } else if (utilisation > 80) {
      out.note!.textContent = `${fmt(utilisation)}% of the ${existingRating} A service is used — above the 80% planning threshold, so there is little room left.`;
      out.note!.className = "mt-1 text-sm font-semibold text-amber-700";
    } else {
      out.note!.textContent = `${fmt(utilisation)}% of the ${existingRating} A service is used — comfortable headroom remains.`;
      out.note!.className = "mt-1 text-sm font-semibold text-emerald-700";
    }

    const fits = ADDITIONS.filter((a) => a.va <= headroomVa).map((a) => a.label);

    out.bdAmps!.textContent = `${fmtInt(totalVa)} ÷ ${volts} = ${fmt(amps)} A`;
    out.bdMinimum!.textContent = `${minimum} A`;
    out.bdExisting!.textContent = `${existingRating} A`;
    out.bdSpareVa!.textContent = headroomVa > 0 ? `${fmtInt(headroomVa)} VA` : "None";
    out.bdFits!.textContent = fits.length ? fits.join(", ") : "Nothing significant";
    out.bdVerdict!.textContent =
      utilisation > 100 ? "Service upgrade or load management required" : utilisation > 80 ? "Tight — plan carefully" : "Room to add load";
  }

  va.addEventListener("input", () => {
    const value = parseFloat(va.value) || 0;
    if (value >= Number(vaRange.min) && value <= Number(vaRange.max)) {
      vaRange.value = String(value);
    }
    calculate();
  });
  vaRange.addEventListener("input", () => {
    va.value = vaRange.value;
    calculate();
  });
  future.addEventListener("input", calculate);
  [voltage, existing].forEach((el) => el.addEventListener("change", calculate));

  resetBtn?.addEventListener("click", () => {
    va.value = "24280";
    vaRange.value = "24280";
    voltage.value = "240";
    existing.value = "200";
    future.value = "0";
    calculate();
  });

  calculate();
}
