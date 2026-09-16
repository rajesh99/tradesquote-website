import { fmt, tanklessBtuRequired, tanklessGpm } from "@/lib/plumbing";

export function initPlumbingTanklessWaterHeaterCalculator(): void {
  const btu = document.getElementById("tl-btu") as HTMLInputElement | null;
  const btuRange = document.getElementById("tl-btu-range") as HTMLInputElement | null;
  const efficiency = document.getElementById("tl-efficiency") as HTMLInputElement | null;
  const inlet = document.getElementById("tl-inlet") as HTMLInputElement | null;
  const target = document.getElementById("tl-target") as HTMLInputElement | null;
  const wanted = document.getElementById("tl-wanted") as HTMLInputElement | null;
  const resetBtn = document.getElementById("tl-reset");

  const out = {
    gpm: document.getElementById("tl-gpm"),
    note: document.getElementById("tl-note"),
    rise: document.getElementById("tl-rise"),
    required: document.getElementById("tl-required"),
    warning: document.getElementById("tl-warning"),
    bdOutput: document.getElementById("tl-bd-output"),
    bdFixtures: document.getElementById("tl-bd-fixtures"),
    bdSummer: document.getElementById("tl-bd-summer"),
    bdWinter: document.getElementById("tl-bd-winter"),
    bdShortfall: document.getElementById("tl-bd-shortfall"),
  };

  if (
    !btu ||
    !btuRange ||
    !efficiency ||
    !inlet ||
    !target ||
    !wanted ||
    !out.gpm ||
    !out.note ||
    !out.rise ||
    !out.required ||
    !out.warning ||
    !out.bdOutput ||
    !out.bdFixtures ||
    !out.bdSummer ||
    !out.bdWinter ||
    !out.bdShortfall
  ) {
    return;
  }

  function calculate(): void {
    const input = Math.max(0, parseFloat(btu!.value) || 0);
    const eff = Math.min(1, Math.max(0.1, (parseFloat(efficiency!.value) || 95) / 100));
    const inletT = parseFloat(inlet!.value) || 0;
    const targetT = parseFloat(target!.value) || 0;
    const wantedGpm = Math.max(0, parseFloat(wanted!.value) || 0);
    const rise = targetT - inletT;

    out.rise!.textContent = `${fmt(rise, 0)} °F`;

    if (rise <= 0) {
      out.gpm!.textContent = "—";
      out.note!.textContent = "The target temperature has to be above the inlet temperature.";
      out.required!.textContent = "—";
      out.warning!.classList.add("hidden");
      return;
    }

    const flow = tanklessGpm(input, eff, rise);
    const required = tanklessBtuRequired(wantedGpm, rise, eff);
    const short = wantedGpm > flow;

    out.gpm!.textContent = `${fmt(flow, 2)} gpm`;
    out.required!.textContent = `${fmt(required, 0)} BTU/h`;

    out.note!.textContent = short
      ? `Short of the ${fmt(wantedGpm, 1)} gpm you asked for by ${fmt(wantedGpm - flow, 2)} gpm at this temperature rise.`
      : `Covers the ${fmt(wantedGpm, 1)} gpm you asked for with ${fmt(flow - wantedGpm, 2)} gpm to spare at this rise.`;
    out.warning!.classList.toggle("hidden", !short);

    out.bdOutput!.textContent = `${fmt(input * eff, 0)} BTU/h delivered of ${fmt(input, 0)} input`;
    out.bdFixtures!.textContent = `${fmt(flow / 2.0, 1)} showers at 2.0 gpm, or ${fmt(flow / 1.5, 1)} at 1.5`;

    // Same unit, warm and cold inlet, so the seasonal swing is visible.
    const summerRise = Math.max(1, targetT - 70);
    const winterRise = Math.max(1, targetT - 40);
    const summer = tanklessGpm(input, eff, summerRise);
    const winter = tanklessGpm(input, eff, winterRise);
    out.bdSummer!.textContent = `${fmt(summer, 2)} gpm at a 70 °F inlet`;
    out.bdWinter!.textContent = `${fmt(winter, 2)} gpm at a 40 °F inlet`;
    out.bdShortfall!.textContent =
      summer > 0 ? `${fmt((1 - winter / summer) * 100, 0)}% less in winter` : "—";
  }

  function syncFromRange(): void {
    btu!.value = btuRange!.value;
    calculate();
  }

  function syncToRange(): void {
    const value = parseFloat(btu!.value) || 0;
    if (value >= Number(btuRange!.min) && value <= Number(btuRange!.max)) {
      btuRange!.value = String(value);
    }
    calculate();
  }

  btu.addEventListener("input", syncToRange);
  btuRange.addEventListener("input", syncFromRange);
  [efficiency, inlet, target, wanted].forEach((el) => el.addEventListener("input", calculate));

  resetBtn?.addEventListener("click", () => {
    btu.value = "199000";
    btuRange.value = "199000";
    efficiency.value = "95";
    inlet.value = "50";
    target.value = "120";
    wanted.value = "4";
    calculate();
  });

  calculate();
}
