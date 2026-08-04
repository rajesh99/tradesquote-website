import { fmt, fmtInt } from "@/lib/nec";

/**
 * How many outlets or fixtures may share one branch circuit.
 *
 * The honest answer splits on occupancy:
 *
 *  - **Dwelling units** — the NEC sets NO maximum. 220.14(J) deems the general
 *    lighting load computed at 3 VA/ft² (220.12) to include all general-use
 *    receptacle outlets of 20 A or less, so there is no per-receptacle VA figure to
 *    divide by and no count limit exists. We say so rather than inventing a number,
 *    and report the 8–10 trade convention separately.
 *  - **Non-dwelling** — 220.14(I) assigns 180 VA to each single or multiple
 *    receptacle on one strap or yoke, which does produce a hard number.
 *
 * The 210.23(A) load limits apply either way and are reported alongside.
 */
const CONVENTION_MIN = 8;
const CONVENTION_MAX = 10;

export function initElectricalReceptacleCircuitCalculator(): void {
  const occupancy = document.getElementById("rc-occupancy") as HTMLSelectElement | null;
  const rating = document.getElementById("rc-rating") as HTMLSelectElement | null;
  const volts = document.getElementById("rc-volts") as HTMLSelectElement | null;
  const continuous = document.getElementById("rc-continuous") as HTMLSelectElement | null;
  const va = document.getElementById("rc-va") as HTMLInputElement | null;
  const vaRange = document.getElementById("rc-va-range") as HTMLInputElement | null;
  const resetBtn = document.getElementById("rc-reset");

  const out = {
    count: document.getElementById("rc-count"),
    countLabel: document.getElementById("rc-count-label"),
    circuitVa: document.getElementById("rc-circuit-va"),
    usableVa: document.getElementById("rc-usable-va"),
    note: document.getElementById("rc-note"),
    bdCircuit: document.getElementById("rc-bd-circuit"),
    bdContinuous: document.getElementById("rc-bd-continuous"),
    bdUsable: document.getElementById("rc-bd-usable"),
    bdPerOutlet: document.getElementById("rc-bd-per-outlet"),
    bdCount: document.getElementById("rc-bd-count"),
    bdLimits: document.getElementById("rc-bd-limits"),
  };

  if (!occupancy || !rating || !volts || !continuous || !va || !vaRange) return;
  if (Object.values(out).some((el) => !el)) return;

  function calculate(): void {
    const amps = parseFloat(rating!.value) || 20;
    const voltage = parseFloat(volts!.value) || 120;
    const perOutlet = Math.max(1, parseFloat(va!.value) || 180);
    const isContinuous = continuous!.value === "yes";
    const isDwelling = occupancy!.value === "dwelling";

    const circuitVa = amps * voltage;
    const usableVa = isContinuous ? circuitVa * 0.8 : circuitVa;
    const count = Math.floor(usableVa / perOutlet);

    // 210.23(A) — what may be connected, regardless of how many outlets there are.
    const portableLimit = amps * 0.8;
    const fastenedLimit = amps * 0.5;

    if (isDwelling) {
      out.count!.textContent = "No limit";
      out.countLabel!.textContent = `Convention: ${CONVENTION_MIN}–${CONVENTION_MAX}`;
      out.note!.textContent = `In a dwelling the NEC sets no maximum number of general-use receptacles on a branch circuit — 220.14(J) already counts them inside the 3 VA/ft² general lighting load, so there is no per-receptacle figure to divide by. Most electricians install ${CONVENTION_MIN}–${CONVENTION_MAX} per 20 A circuit as a working habit. What is limited is the load: ${fmt(portableLimit, 1)} A for one portable appliance and ${fmt(fastenedLimit, 1)} A for fastened-in-place equipment sharing the circuit.`;
      out.bdCount!.textContent = "Not limited by count — 220.14(J)";
      out.bdPerOutlet!.textContent = "Not applicable in a dwelling";
    } else {
      out.count!.textContent = String(count);
      out.countLabel!.textContent = count === 1 ? "outlet" : "outlets";
      out.note!.textContent = `A ${fmtInt(amps)} A, ${fmtInt(voltage)} V circuit is ${fmtInt(circuitVa)} VA. At ${fmtInt(perOutlet)} VA per strap under 220.14(I) that permits ${count} outlets${isContinuous ? ", after the 80% continuous-load reduction" : ""}. A duplex receptacle counts once; a four-plex on two straps counts twice.`;
      out.bdCount!.textContent = `${fmtInt(usableVa)} ÷ ${fmtInt(perOutlet)} = ${count} outlets`;
      out.bdPerOutlet!.textContent = `${fmtInt(perOutlet)} VA per strap`;
    }

    out.circuitVa!.textContent = `${fmtInt(circuitVa)} VA`;
    out.usableVa!.textContent = `${fmtInt(usableVa)} VA`;

    out.bdCircuit!.textContent = `${fmtInt(amps)} A × ${fmtInt(voltage)} V = ${fmtInt(circuitVa)} VA`;
    out.bdContinuous!.textContent = isContinuous ? "× 0.80 continuous" : "× 1.00 non-continuous";
    out.bdUsable!.textContent = `${fmtInt(usableVa)} VA`;
    out.bdLimits!.textContent = `${fmt(portableLimit, 1)} A portable · ${fmt(fastenedLimit, 1)} A fastened`;
  }

  va.addEventListener("input", () => {
    const v = parseFloat(va.value) || 0;
    if (v >= Number(vaRange.min) && v <= Number(vaRange.max)) vaRange.value = String(v);
    calculate();
  });
  vaRange.addEventListener("input", () => {
    va.value = vaRange.value;
    calculate();
  });
  [occupancy, rating, volts, continuous].forEach((el) => el.addEventListener("change", calculate));

  resetBtn?.addEventListener("click", () => {
    occupancy.value = "non-dwelling";
    rating.value = "20";
    volts.value = "120";
    continuous.value = "no";
    va.value = "180";
    vaRange.value = "180";
    calculate();
  });

  calculate();
}
