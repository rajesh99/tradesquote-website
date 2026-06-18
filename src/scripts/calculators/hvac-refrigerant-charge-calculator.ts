const LINE_SET_RATES: Record<string, number> = {
  "14-12": 0.43,
  "38-58": 0.78,
  "38-34": 0.98,
  "12-78": 1.25,
};

function fmtOz(n: number): string {
  return (Math.round(n * 10) / 10).toLocaleString("en-US") + " oz";
}

function fmtLb(n: number): string {
  return (Math.round(n * 100) / 100).toLocaleString("en-US") + " lb";
}

function evaluateCharge(oz: number, extraFt: number): { status: string; note: string } {
  if (extraFt <= 0) {
    return {
      status: "No add-on needed",
      note: "Total line length is within the factory allowance — no additional charge beyond the factory charge per the nameplate.",
    };
  }
  if (oz <= 20) {
    return {
      status: "Small add-on",
      note: "Typical for a modest line-set extension — weigh in carefully and verify superheat/subcooling after charging.",
    };
  }
  if (oz <= 40) {
    return {
      status: "Moderate add-on",
      note: "Common for longer runs on split systems — charge in stages and confirm TXV superheat or piston target superheat.",
    };
  }
  return {
    status: "Large add-on",
    note: "Significant extra refrigerant — verify line sizes, weigh total charge against nameplate, and check both superheat and subcooling.",
  };
}

export function initHvacRefrigerantChargeCalculator(): void {
  const refrigerantSelect = document.getElementById("rc-refrigerant") as HTMLSelectElement | null;
  const linesetSelect = document.getElementById("rc-lineset") as HTMLSelectElement | null;
  const lengthInput = document.getElementById("rc-length") as HTMLInputElement | null;
  const includedInput = document.getElementById("rc-included") as HTMLInputElement | null;
  const resetBtn = document.getElementById("resetBtn");
  const resultOz = document.getElementById("rc-result-oz");
  const resultLb = document.getElementById("rc-result-lb");
  const resultExtra = document.getElementById("rc-result-extra");
  const resultRate = document.getElementById("rc-result-rate");
  const status = document.getElementById("rc-status");
  const bdLength = document.getElementById("rc-bd-length");
  const bdIncluded = document.getElementById("rc-bd-included");
  const bdExtra = document.getElementById("rc-bd-extra");

  if (
    !refrigerantSelect ||
    !linesetSelect ||
    !lengthInput ||
    !includedInput ||
    !resultOz ||
    !resultLb ||
    !resultExtra ||
    !resultRate ||
    !status ||
    !bdLength ||
    !bdIncluded ||
    !bdExtra
  ) {
    return;
  }

  function calculate(): void {
    const totalLength = Math.max(0, parseFloat(lengthInput.value) || 0);
    const included = Math.max(0, parseFloat(includedInput.value) || 0);
    const extraFt = Math.max(0, totalLength - included);
    const ozPerFt = LINE_SET_RATES[linesetSelect.value] ?? 0.98;
    const refrigerant = refrigerantSelect.value;
    const oz = extraFt * ozPerFt;
    const lb = oz / 16;

    const evaluation = evaluateCharge(oz, extraFt);

    resultOz.textContent = fmtOz(oz);
    resultLb.textContent = fmtLb(lb);
    resultExtra.textContent = extraFt + " ft";
    resultRate.textContent = ozPerFt + " oz/ft (" + refrigerant + ")";
    status.textContent = evaluation.status + " — " + evaluation.note;
    bdLength.textContent = totalLength + " ft";
    bdIncluded.textContent = included + " ft";
    bdExtra.textContent = extraFt + " ft";
  }

  function reset(): void {
    refrigerantSelect.value = "R-410A";
    linesetSelect.value = "38-34";
    lengthInput.value = "50";
    includedInput.value = "15";
    calculate();
  }

  refrigerantSelect.addEventListener("change", calculate);
  linesetSelect.addEventListener("change", calculate);
  lengthInput.addEventListener("input", calculate);
  includedInput.addEventListener("input", calculate);
  resetBtn?.addEventListener("click", reset);

  calculate();
}
