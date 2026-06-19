const MIN_SUPERHEAT = 5;
const MAX_SUPERHEAT = 25;

function fmtSuperheat(n: number): string {
  const rounded = Math.round(n * 10) / 10;
  return rounded % 1 === 0 ? rounded.toString() + "°F" : rounded.toFixed(1) + "°F";
}

function targetSuperheat(wb: number, db: number): number {
  const raw = ((3 * wb) - 80 - db) / 2;
  return Math.min(MAX_SUPERHEAT, Math.max(MIN_SUPERHEAT, raw));
}

export function initHvacTargetSuperheatCalculator(): void {
  const wbInput = document.getElementById("tsh-wb") as HTMLInputElement | null;
  const dbInput = document.getElementById("tsh-db") as HTMLInputElement | null;
  const resetBtn = document.getElementById("resetBtn");
  const result = document.getElementById("tsh-result");
  const range = document.getElementById("tsh-range");
  const note = document.getElementById("tsh-note");
  const bdWb = document.getElementById("tsh-bd-wb");
  const bdDb = document.getElementById("tsh-bd-db");
  const bdFormula = document.getElementById("tsh-bd-formula");

  if (!wbInput || !dbInput || !resetBtn || !result || !range || !note || !bdWb || !bdDb || !bdFormula) {
    return;
  }

  function calculate(): void {
    const wb = parseFloat(wbInput.value) || 0;
    const db = parseFloat(dbInput.value) || 0;
    const raw = ((3 * wb) - 80 - db) / 2;
    const target = targetSuperheat(wb, db);
    const clamped = raw !== target;

    result.textContent = fmtSuperheat(target);
    range.textContent = `${MIN_SUPERHEAT}–${MAX_SUPERHEAT}°F chart range`;

    if (clamped) {
      note.textContent =
        raw < MIN_SUPERHEAT
          ? "Raw result was below the chart minimum — clamped to 5°F. Verify wet-bulb and dry-bulb readings."
          : "Raw result exceeded the chart maximum — clamped to 25°F. Check inputs or use manufacturer chart.";
    } else {
      note.textContent =
        "Charge a fixed-orifice (piston) system to this target superheat at the outdoor conditions shown.";
    }

    bdWb.textContent = wb + "°F";
    bdDb.textContent = db + "°F";
    bdFormula.textContent = `((${3} × ${wb}) − 80 − ${db}) ÷ 2 = ${fmtSuperheat(raw)}${clamped ? " → " + fmtSuperheat(target) : ""}`;
  }

  wbInput.addEventListener("input", calculate);
  dbInput.addEventListener("input", calculate);

  resetBtn.addEventListener("click", () => {
    wbInput.value = "62";
    dbInput.value = "85";
    calculate();
  });

  calculate();
}
