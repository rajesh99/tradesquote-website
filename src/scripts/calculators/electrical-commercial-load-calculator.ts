import {
  TABLE_220_12,
  TABLE_220_42,
  TABLE_220_44,
  VA_PER_RECEPTACLE_STRAP,
  VA_PER_SHOW_WINDOW_FOOT,
  VA_PER_TRACK_2FT,
  applyDemandTiers,
  nextStandardOcpd,
  SQRT3,
  fmt,
  fmtInt,
} from "@/lib/nec";

/**
 * Commercial load calculation by the NEC Article 220 Part III standard method.
 *
 * The structure that matters: general lighting is an area calculation that then
 * gets a Table 220.42 demand factor, receptacles are counted per strap and get a
 * separate Table 220.44 demand factor, and show-window and track lighting are
 * their own per-foot rules that receive no demand factor at all. Everything else
 * lands at 100%.
 *
 * There is no commercial equivalent of 220.82 — the optional method is a
 * dwelling-only shortcut, so this is the calculation.
 */
export function initElectricalCommercialLoadCalculator(): void {
  const occupancy = document.getElementById("cl-occupancy") as HTMLSelectElement | null;
  const area = document.getElementById("cl-area") as HTMLInputElement | null;
  const vaPerFt2 = document.getElementById("cl-va-ft2") as HTMLInputElement | null;
  const straps = document.getElementById("cl-straps") as HTMLInputElement | null;
  const showWindow = document.getElementById("cl-show-window") as HTMLInputElement | null;
  const track = document.getElementById("cl-track") as HTMLInputElement | null;
  const hvac = document.getElementById("cl-hvac") as HTMLInputElement | null;
  const other = document.getElementById("cl-other") as HTMLInputElement | null;
  const system = document.getElementById("cl-system") as HTMLSelectElement | null;
  const resetBtn = document.getElementById("cl-reset");

  const out = {
    amps: document.getElementById("cl-amps"),
    service: document.getElementById("cl-service"),
    totalVa: document.getElementById("cl-total-va"),
    connected: document.getElementById("cl-connected"),
    note: document.getElementById("cl-note"),
    bdLighting: document.getElementById("cl-bd-lighting"),
    bdLightingDemand: document.getElementById("cl-bd-lighting-demand"),
    bdShowWindow: document.getElementById("cl-bd-show-window"),
    bdTrack: document.getElementById("cl-bd-track"),
    bdReceptacles: document.getElementById("cl-bd-receptacles"),
    bdReceptaclesDemand: document.getElementById("cl-bd-receptacles-demand"),
    bdHvac: document.getElementById("cl-bd-hvac"),
    bdOther: document.getElementById("cl-bd-other"),
    bdTotal: document.getElementById("cl-bd-total"),
    bdAmps: document.getElementById("cl-bd-amps"),
  };

  if (!occupancy || !area || !vaPerFt2 || !straps || !showWindow || !track || !hvac || !other || !system) return;
  if (Object.values(out).some((el) => !el)) return;

  /** Keeps the VA/ft² field in step with the occupancy chosen, but stays editable. */
  function syncVaPerFt2(): void {
    const row = TABLE_220_12.find((r) => r.key === occupancy!.value);
    if (row) vaPerFt2!.value = String(row.vaPerFt2);
  }

  function calculate(): void {
    const row = TABLE_220_12.find((r) => r.key === occupancy!.value) ?? TABLE_220_12[1];
    const sqft = Math.max(0, parseFloat(area!.value) || 0);
    const density = Math.max(0, parseFloat(vaPerFt2!.value) || 0);
    const strapCount = Math.max(0, Math.floor(parseFloat(straps!.value) || 0));
    const windowFt = Math.max(0, parseFloat(showWindow!.value) || 0);
    const trackFt = Math.max(0, parseFloat(track!.value) || 0);
    const hvacVa = Math.max(0, parseFloat(hvac!.value) || 0);
    const otherVa = Math.max(0, parseFloat(other!.value) || 0);

    // General lighting — area calculation, then the Table 220.42 tier for this occupancy.
    const lightingConnected = sqft * density;
    const demandSet = TABLE_220_42[row.demandKey];
    const lighting = applyDemandTiers(lightingConnected, demandSet.tiers);

    // Show window and track lighting: per-foot rules, no demand factor.
    const showWindowVa = windowFt * VA_PER_SHOW_WINDOW_FOOT;
    const trackVa = Math.ceil(trackFt / 2) * VA_PER_TRACK_2FT;

    // Receptacles: 180 VA per strap, then Table 220.44.
    const receptacleConnected = strapCount * VA_PER_RECEPTACLE_STRAP;
    const receptacles = applyDemandTiers(receptacleConnected, TABLE_220_44);

    const totalVa =
      lighting.demandVa + showWindowVa + trackVa + receptacles.demandVa + hvacVa + otherVa;
    const connectedVa =
      lightingConnected + showWindowVa + trackVa + receptacleConnected + hvacVa + otherVa;

    const [voltsRaw, phaseRaw] = system!.value.split(":");
    const volts = parseFloat(voltsRaw) || 208;
    const divisor = phaseRaw === "3ph" ? SQRT3 * volts : volts;
    const amps = divisor > 0 ? totalVa / divisor : 0;
    const service = nextStandardOcpd(amps);

    out.amps!.textContent = `${fmt(amps, 1)} A`;
    out.service!.textContent = service ? `${service} A` : "over 6,000 A";
    out.totalVa!.textContent = `${fmtInt(totalVa)} VA`;
    out.connected!.textContent = `${fmtInt(connectedVa)} VA`;

    const saved = connectedVa - totalVa;
    if (saved > 0) {
      out.note!.textContent = `Demand factors removed ${fmtInt(saved)} VA — ${fmt(
        (saved / connectedVa) * 100,
        0,
      )}% of the connected load. The calculated load is what the service must carry; the connected load is only what is installed.`;
    } else {
      out.note!.textContent =
        "No demand factor applied at this size. Table 220.42 gives this occupancy 100%, and the receptacle load has not yet reached the 10 kVA point where Table 220.44 starts halving it.";
    }

    out.bdLighting!.textContent = `${fmtInt(sqft)} ft² × ${density} VA/ft² = ${fmtInt(lightingConnected)} VA`;
    out.bdLightingDemand!.textContent = lighting.steps.length
      ? `${lighting.steps
          .map((s) => `${fmtInt(s.va)} @ ${s.percent}%`)
          .join(" + ")} = ${fmtInt(lighting.demandVa)} VA`
      : "0 VA";
    out.bdShowWindow!.textContent = `${fmtInt(windowFt)} ft × ${VA_PER_SHOW_WINDOW_FOOT} VA = ${fmtInt(showWindowVa)} VA`;
    out.bdTrack!.textContent = `${fmtInt(trackFt)} ft ÷ 2 × ${VA_PER_TRACK_2FT} VA = ${fmtInt(trackVa)} VA`;
    out.bdReceptacles!.textContent = `${fmtInt(strapCount)} × ${VA_PER_RECEPTACLE_STRAP} VA = ${fmtInt(receptacleConnected)} VA`;
    out.bdReceptaclesDemand!.textContent = receptacles.steps.length
      ? `${receptacles.steps
          .map((s) => `${fmtInt(s.va)} @ ${s.percent}%`)
          .join(" + ")} = ${fmtInt(receptacles.demandVa)} VA`
      : "0 VA";
    out.bdHvac!.textContent = `${fmtInt(hvacVa)} VA @ 100%`;
    out.bdOther!.textContent = `${fmtInt(otherVa)} VA @ 100%`;
    out.bdTotal!.textContent = `${fmtInt(totalVa)} VA`;
    out.bdAmps!.textContent =
      phaseRaw === "3ph"
        ? `${fmtInt(totalVa)} ÷ (1.732 × ${volts}) = ${fmt(amps, 1)} A`
        : `${fmtInt(totalVa)} ÷ ${volts} = ${fmt(amps, 1)} A`;
  }

  occupancy.addEventListener("change", () => {
    syncVaPerFt2();
    calculate();
  });
  system.addEventListener("change", calculate);
  [area, vaPerFt2, straps, showWindow, track, hvac, other].forEach((el) =>
    el.addEventListener("input", calculate),
  );

  resetBtn?.addEventListener("click", () => {
    occupancy.value = "store";
    area.value = "5000";
    vaPerFt2.value = "3";
    straps.value = "40";
    showWindow.value = "30";
    track.value = "20";
    hvac.value = "25000";
    other.value = "0";
    system.value = "208:3ph";
    calculate();
  });

  calculate();
}
