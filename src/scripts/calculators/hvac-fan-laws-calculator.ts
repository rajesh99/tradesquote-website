function fmtCfm(n: number): string {
  return Math.round(n).toLocaleString("en-US") + " CFM";
}

function fmtPressure(n: number): string {
  return n.toFixed(2) + " in. w.c.";
}

function fmtBhp(n: number): string {
  return n.toFixed(2) + " BHP";
}

function fmtRatio(n: number): string {
  return n.toFixed(2);
}

function evaluateSpeedChange(ratio: number): { status: string; note: string } {
  if (ratio >= 0.98 && ratio <= 1.02) {
    return {
      status: "Baseline",
      note: "RPM is essentially unchanged — CFM, static pressure, and brake horsepower stay at the known operating point.",
    };
  }
  if (ratio < 0.85) {
    return {
      status: "Large slowdown",
      note: "A major RPM reduction cuts CFM sharply and drops static pressure — verify delivered airflow still meets tonnage and room targets before leaving the blower at this speed.",
    };
  }
  if (ratio < 1) {
    return {
      status: "Speed reduced",
      note: "Slower blower speed lowers CFM and static pressure proportionally — useful when TESP is borderline, but confirm the coil still gets enough airflow for capacity and dehumidification.",
    };
  }
  if (ratio <= 1.15) {
    return {
      status: "Speed increased",
      note: "Higher RPM raises CFM and static pressure — watch TESP against the nameplate limit; power draw rises with the cube of speed.",
    };
  }
  return {
    status: "Large speed-up",
    note: "A significant RPM increase can push static pressure past the equipment rating and overload the motor — measure TESP and amp draw before running at this speed.",
  };
}

export function initHvacFanLawsCalculator(): void {
  const cfm1Input = document.getElementById("fl-cfm1") as HTMLInputElement | null;
  const sp1Input = document.getElementById("fl-sp1") as HTMLInputElement | null;
  const bhp1Input = document.getElementById("fl-bhp1") as HTMLInputElement | null;
  const rpm1Input = document.getElementById("fl-rpm1") as HTMLInputElement | null;
  const rpm2Input = document.getElementById("fl-rpm2") as HTMLInputElement | null;
  const resetBtn = document.getElementById("resetBtn");
  const cfm2 = document.getElementById("fl-cfm2");
  const sp2 = document.getElementById("fl-sp2");
  const bhp2 = document.getElementById("fl-bhp2");
  const ratioEl = document.getElementById("fl-ratio");
  const status = document.getElementById("fl-status");
  const bdCfm1 = document.getElementById("fl-bd-cfm1");
  const bdSp1 = document.getElementById("fl-bd-sp1");
  const bdBhp1 = document.getElementById("fl-bd-bhp1");
  const bdRatio = document.getElementById("fl-bd-ratio");

  if (
    !cfm1Input ||
    !sp1Input ||
    !bhp1Input ||
    !rpm1Input ||
    !rpm2Input ||
    !cfm2 ||
    !sp2 ||
    !bhp2 ||
    !ratioEl ||
    !status ||
    !bdCfm1 ||
    !bdSp1 ||
    !bdBhp1 ||
    !bdRatio
  ) {
    return;
  }

  function calculate(): void {
    const cfm1 = Math.max(0, parseFloat(cfm1Input.value) || 0);
    const sp1 = Math.max(0, parseFloat(sp1Input.value) || 0);
    const bhp1 = Math.max(0, parseFloat(bhp1Input.value) || 0);
    const rpm1 = Math.max(1, parseFloat(rpm1Input.value) || 1);
    const rpm2 = Math.max(0, parseFloat(rpm2Input.value) || 0);

    const ratio = rpm2 / rpm1;
    const cfm2Val = cfm1 * ratio;
    const sp2Val = sp1 * ratio * ratio;
    const bhp2Val = bhp1 * ratio * ratio * ratio;

    const evaluation = evaluateSpeedChange(ratio);

    cfm2.textContent = fmtCfm(cfm2Val);
    sp2.textContent = fmtPressure(sp2Val);
    bhp2.textContent = fmtBhp(bhp2Val);
    ratioEl.textContent = fmtRatio(ratio);
    status.textContent = evaluation.status + " — " + evaluation.note;

    bdCfm1.textContent = fmtCfm(cfm1);
    bdSp1.textContent = fmtPressure(sp1);
    bdBhp1.textContent = fmtBhp(bhp1);
    bdRatio.textContent = fmtRatio(ratio) + " (RPM₂ ÷ RPM₁)";
  }

  function reset(): void {
    cfm1Input.value = "1200";
    sp1Input.value = "0.50";
    bhp1Input.value = "0.75";
    rpm1Input.value = "1200";
    rpm2Input.value = "1080";
    calculate();
  }

  cfm1Input.addEventListener("input", calculate);
  sp1Input.addEventListener("input", calculate);
  bhp1Input.addEventListener("input", calculate);
  rpm1Input.addEventListener("input", calculate);
  rpm2Input.addEventListener("input", calculate);
  resetBtn?.addEventListener("click", reset);

  calculate();
}
