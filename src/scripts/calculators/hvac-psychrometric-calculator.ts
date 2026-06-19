/** --------------------------------------------------------------------------
 * HVAC Psychrometric Calculator
 * Equations based on ASHRAE Fundamentals (2021) and peer-reviewed correlations.
 *
 * Unit convention:
 *   - All intermediate calculations are performed in SI.
 *   - Results are converted to IP for display when unit === "F".
 * -------------------------------------------------------------------------- */

// ---------------------------------------------------------------------------
// Core psychrometric maths
// ---------------------------------------------------------------------------

/**
 * Saturation vapour pressure using the Magnus–Antoine approximation.
 * Accurate to within ~0.3% from −40°C to 60°C.
 *
 * @param Tc Dry-bulb temperature in °C
 * @returns Saturation pressure in kPa
 */
function pSat_kPa(Tc: number): number {
  return 0.6105 * Math.exp((17.27 * Tc) / (Tc + 237.3));
}

/**
 * Humidity ratio.
 * W = 621.945 × Pv / (Patm − Pv)  [g water / kg dry air]
 *
 * @param Pv_kPa Vapour pressure in kPa
 * @param Patm_kPa Atmospheric pressure in kPa
 * @returns Humidity ratio in g/kg
 */
function humidityRatio_gkg(Pv_kPa: number, Patm_kPa: number): number {
  const denom = Patm_kPa - Pv_kPa;
  if (denom <= 0) return 0;
  return 621.945 * (Pv_kPa / denom);
}

/**
 * Specific enthalpy of moist air (SI).
 * h = 1.006 × Tc + (W/1000) × (2501 + 1.86 × Tc)  [kJ/kg dry air]
 *
 * @param Tc Dry-bulb temperature in °C
 * @param W_gkg Humidity ratio in g/kg
 * @returns Specific enthalpy in kJ/kg dry air
 */
function enthalpy_kJkg(Tc: number, W_gkg: number): number {
  return 1.006 * Tc + (W_gkg / 1000) * (2501 + 1.86 * Tc);
}

/**
 * Dew point temperature using the Magnus formula.
 * Accurate to ±0.1°C for 0–60°C, ±0.5°C for −40–0°C.
 *
 * @param Tc Dry-bulb temperature in °C
 * @param rh Relative humidity in % (0–100)
 * @returns Dew point temperature in °C
 */
function dewPoint_C(Tc: number, rh: number): number {
  if (rh <= 0) return -273.15; // effectively undefined
  const gamma = Math.log(rh / 100) + (17.625 * Tc) / (243.04 + Tc);
  return (243.04 * gamma) / (17.625 - gamma);
}

/**
 * Wet-bulb temperature using the Stull (2011) formula.
 * Accurate to ±0.3°C for 0–60°C, 5–99% RH.
 *
 * Stull, R. (2011). Wet-bulb temperature from relative humidity and air
 * temperature. Journal of Applied Meteorology and Climatology, 50(11),
 * 2267–2269. https://doi.org/10.1175/JAMC-D-11-0143.1
 *
 * @param Tc Dry-bulb temperature in °C
 * @param rh Relative humidity in % (0–100)
 * @returns Wet-bulb temperature in °C
 */
function wetBulb_C(Tc: number, rh: number): number {
  return (
    Tc * Math.atan(0.151977 * Math.sqrt(rh + 8.313659)) +
    Math.atan(Tc + rh) -
    Math.atan(rh - 1.676331) +
    0.00391838 * Math.pow(rh, 1.5) * Math.atan(0.023101 * rh) -
    4.686035
  );
}

/**
 * Specific volume of moist air (IP).
 * v = 0.3704 × (Tdb_F + 459.69) / (14.696 − Pv_psia)  [ft³/lb dry air]
 *
 * @param Tdb_F Dry-bulb temperature in °F
 * @param Pv_psia Vapour pressure in psia
 * @returns Specific volume in ft³/lb dry air
 */
function specificVolume_ft3lb(Tdb_F: number, Pv_psia: number): number {
  const denom = 14.696 - Pv_psia;
  if (denom <= 0) return 0;
  return (0.3704 * (Tdb_F + 459.69)) / denom;
}

// ---------------------------------------------------------------------------
// Unit conversion helpers
// ---------------------------------------------------------------------------

const C_to_F = (c: number): number => c * 1.8 + 32;
const F_to_C = (f: number): number => (f - 32) / 1.8;
const kPa_to_psia = (kPa: number): number => kPa / 6.89476;
const kPa_to_inHg = (kPa: number): number => kPa * 0.2953;
/** ft³/lb dry air → m³/kg dry air */
const ft3lb_to_m3kg = (v: number): number => v * 0.0624279605;
/** kJ/kg → BTU/lb */
const kJkg_to_BTUlb = (h: number): number => h * 0.429923;
/** g/kg → gr/lb  (1 g/kg = 7 gr/lb exactly by definition) */
const gkg_to_grlb = (w: number): number => w * 7;

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

function fmt(n: number, decimals = 1): string {
  return n.toFixed(decimals);
}

// ---------------------------------------------------------------------------
// Main exported function
// ---------------------------------------------------------------------------

export function initHvacPsychrometricCalculator(): void {
  // ---- DOM refs ----
  const unitSel = document.getElementById("psy-unit") as HTMLSelectElement | null;
  const tdbInput = document.getElementById("psy-tdb") as HTMLInputElement | null;
  const rhInput = document.getElementById("psy-rh") as HTMLInputElement | null;
  const patmInput = document.getElementById("psy-patm") as HTMLInputElement | null;
  const resetBtn = document.getElementById("psy-reset");

  // Result displays
  const elEnthalpy = document.getElementById("psy-result-enthalpy");
  const elUnitEnthalpy = document.getElementById("psy-unit-enthalpy");
  const elW = document.getElementById("psy-result-w");
  const elUnitW = document.getElementById("psy-unit-w");
  const elDp = document.getElementById("psy-result-dp");
  const elWb = document.getElementById("psy-result-wb");
  const elPv = document.getElementById("psy-result-pv");
  const elUnitPv = document.getElementById("psy-unit-pv");
  const elSv = document.getElementById("psy-result-sv");
  const elUnitSv = document.getElementById("psy-unit-sv");

  // Warning
  const warningBox = document.getElementById("psy-warning");
  const warningText = document.getElementById("psy-warning-text");

  // Breakdown
  const bdTdb = document.getElementById("psy-bd-tdb");
  const bdRh = document.getElementById("psy-bd-rh");
  const bdPsat = document.getElementById("psy-bd-psat");
  const bdPv = document.getElementById("psy-bd-pv");
  const bdW = document.getElementById("psy-bd-w");
  const bdH = document.getElementById("psy-bd-h");
  const bdDp = document.getElementById("psy-bd-dp");
  const bdWb = document.getElementById("psy-bd-wb");

  // Guard: bail if any critical element is missing
  if (
    !unitSel ||
    !tdbInput ||
    !rhInput ||
    !patmInput ||
    !elEnthalpy ||
    !elW ||
    !elDp ||
    !elWb ||
    !elPv ||
    !elSv
  ) {
    return;
  }

  // ---- show / hide warning ----
  function setWarning(msg: string | null): void {
    if (!warningBox || !warningText) return;
    if (msg) {
      warningText.textContent = msg;
      warningBox.classList.remove("hidden");
    } else {
      warningBox.classList.add("hidden");
      warningText.textContent = "";
    }
  }

  // ---- update input attributes when unit changes ----
  function syncTdbInputRange(): void {
    const isF = unitSel!.value === "F";
    tdbInput!.min = isF ? "-40" : "-40";
    tdbInput!.max = isF ? "140" : "60";
  }

  // ---- main calculation ----
  function calculate(): void {
    const isF = unitSel!.value === "F";
    const rh = parseFloat(rhInput!.value);
    const patm_psia = parseFloat(patmInput!.value) || 14.696;
    const tdbRaw = parseFloat(tdbInput!.value);

    // Convert dry-bulb to Celsius for all internal math
    const Tc = isF ? F_to_C(tdbRaw) : tdbRaw;
    const Tdb_F = isF ? tdbRaw : C_to_F(tdbRaw);

    // ---- RH validation ----
    if (isNaN(rh) || rh < 0 || rh > 100) {
      setWarning("Invalid: Relative humidity must be between 0% and 100%.");
    } else {
      setWarning(null);
    }

    const rhClamped = Math.max(0, Math.min(100, isNaN(rh) ? 50 : rh));

    // ---- Saturation & vapour pressure ----
    const Patm_kPa = patm_psia * 6.89476;
    const Psat_kPa = pSat_kPa(Tc);
    const Pv_kPa = (rhClamped / 100) * Psat_kPa;
    const Pv_psia = kPa_to_psia(Pv_kPa);

    // ---- Humidity ratio ----
    const W_gkg = humidityRatio_gkg(Pv_kPa, Patm_kPa);
    const W_grlb = gkg_to_grlb(W_gkg);

    // ---- Enthalpy ----
    const h_kJkg = enthalpy_kJkg(Tc, W_gkg);
    const h_BTUlb = kJkg_to_BTUlb(h_kJkg);

    // ---- Dew point ----
    const Tdp_C = dewPoint_C(Tc, rhClamped);
    const Tdp_F = C_to_F(Tdp_C);

    // ---- Wet-bulb ----
    const Twb_C = wetBulb_C(Tc, rhClamped);
    const Twb_F = C_to_F(Twb_C);

    // ---- Physical-limit check ----
    if (warningText!.textContent === "" || warningBox!.classList.contains("hidden")) {
      if (Twb_C > Tc + 0.5) {
        // Allow 0.5°C tolerance for formula edge cases near saturation
        setWarning(
          "Physical limit violation: Computed wet-bulb temperature exceeds dry-bulb. Check your inputs."
        );
      }
    }

    // ---- Specific volume ----
    const v_ft3lb = specificVolume_ft3lb(Tdb_F, Pv_psia);
    const v_m3kg = ft3lb_to_m3kg(v_ft3lb);

    // ---- Air density ----
    // ρ = (1/v) × (1 + W/1000)  [lb/ft³]  (moist air mass per ft³)
    const rho_lbft3 = v_ft3lb > 0 ? (1 / v_ft3lb) * (1 + W_gkg / 1000) : 0;
    // SI: kg/m³ = lb/ft³ × 16.0185
    const rho_kgm3 = rho_lbft3 * 16.0185;

    // ---- Update DOM ----
    if (isF) {
      // Enthalpy
      elEnthalpy!.textContent = fmt(h_BTUlb, 1);
      elUnitEnthalpy!.textContent = "BTU/lb";

      // Humidity ratio
      elW!.textContent = fmt(W_grlb, 1);
      elUnitW!.textContent = "gr/lb";

      // Dew point
      elDp!.textContent = fmt(Tdp_F, 1) + "°F";

      // Wet-bulb
      elWb!.textContent = fmt(Twb_F, 1) + "°F";

      // Vapour pressure
      elPv!.textContent = fmt(kPa_to_inHg(Pv_kPa), 4);
      elUnitPv!.textContent = "in. Hg";

      // Specific volume
      elSv!.textContent = fmt(v_ft3lb, 3);
      elUnitSv!.textContent = "ft³/lb";

      // Breakdown
      if (bdTdb) bdTdb.textContent = fmt(Tdb_F, 1) + "°F";
      if (bdRh) bdRh.textContent = fmt(rhClamped, 0) + "%";
      if (bdPsat) bdPsat.textContent = fmt(kPa_to_psia(Psat_kPa), 4) + " psia";
      if (bdPv) bdPv.textContent = fmt(Pv_psia, 4) + " psia";
      if (bdW) bdW.textContent = fmt(W_grlb, 1) + " gr/lb";
      if (bdH) bdH.textContent = fmt(h_BTUlb, 1) + " BTU/lb";
      if (bdDp) bdDp.textContent = fmt(Tdp_F, 1) + "°F";
      if (bdWb) bdWb.textContent = fmt(Twb_F, 1) + "°F";
    } else {
      // SI mode
      // Enthalpy
      elEnthalpy!.textContent = fmt(h_kJkg, 1);
      elUnitEnthalpy!.textContent = "kJ/kg";

      // Humidity ratio
      elW!.textContent = fmt(W_gkg, 2);
      elUnitW!.textContent = "g/kg";

      // Dew point
      elDp!.textContent = fmt(Tdp_C, 1) + "°C";

      // Wet-bulb
      elWb!.textContent = fmt(Twb_C, 1) + "°C";

      // Vapour pressure
      elPv!.textContent = fmt(Pv_kPa, 3);
      elUnitPv!.textContent = "kPa";

      // Specific volume
      elSv!.textContent = fmt(v_m3kg, 4);
      elUnitSv!.textContent = "m³/kg";

      // Breakdown
      if (bdTdb) bdTdb.textContent = fmt(Tc, 1) + "°C";
      if (bdRh) bdRh.textContent = fmt(rhClamped, 0) + "%";
      if (bdPsat) bdPsat.textContent = fmt(Psat_kPa, 3) + " kPa";
      if (bdPv) bdPv.textContent = fmt(Pv_kPa, 3) + " kPa";
      if (bdW) bdW.textContent = fmt(W_gkg, 2) + " g/kg";
      if (bdH) bdH.textContent = fmt(h_kJkg, 1) + " kJ/kg";
      if (bdDp) bdDp.textContent = fmt(Tdp_C, 1) + "°C";
      if (bdWb) bdWb.textContent = fmt(Twb_C, 1) + "°C";
    }
  }

  // ---- Reset ----
  function reset(): void {
    unitSel!.value = "F";
    tdbInput!.value = "75";
    rhInput!.value = "50";
    patmInput!.value = "14.696";
    syncTdbInputRange();
    setWarning(null);
    calculate();
  }

  // ---- Handle unit toggle: convert displayed Tdb to new unit ----
  function onUnitChange(): void {
    const wasF = tdbInput!.dataset.lastUnit !== "C";
    const currentVal = parseFloat(tdbInput!.value);
    if (!isNaN(currentVal)) {
      if (unitSel!.value === "C" && wasF) {
        tdbInput!.value = fmt(F_to_C(currentVal), 1);
      } else if (unitSel!.value === "F" && !wasF) {
        tdbInput!.value = fmt(C_to_F(currentVal), 1);
      }
    }
    tdbInput!.dataset.lastUnit = unitSel!.value;
    syncTdbInputRange();
    calculate();
  }

  // ---- Wire events ----
  unitSel.addEventListener("change", onUnitChange);
  tdbInput.addEventListener("input", calculate);
  rhInput.addEventListener("input", calculate);
  patmInput.addEventListener("input", calculate);
  resetBtn?.addEventListener("click", reset);

  // ---- Initial state ----
  tdbInput.dataset.lastUnit = "F";
  syncTdbInputRange();
  calculate();
}
