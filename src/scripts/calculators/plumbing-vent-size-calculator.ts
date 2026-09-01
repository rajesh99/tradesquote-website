import {
  TABLE_909_1,
  VENT_LENGTH_UPSIZE_FEET,
  fmt,
  sizeLabel,
  totalFall,
  trapArmMaxFeet,
  ventSize,
} from "@/lib/plumbing";

export function initPlumbingVentSizeCalculator(): void {
  const drain = document.getElementById("vs-drain") as HTMLSelectElement | null;
  const length = document.getElementById("vs-length") as HTMLInputElement | null;
  const lengthRange = document.getElementById("vs-length-range") as HTMLInputElement | null;
  const trapArm = document.getElementById("vs-trap-arm") as HTMLInputElement | null;
  const resetBtn = document.getElementById("vs-reset");

  const out = {
    size: document.getElementById("vs-size"),
    note: document.getElementById("vs-note"),
    trapMax: document.getElementById("vs-trap-max"),
    trapVerdict: document.getElementById("vs-trap-verdict"),
    trapWarning: document.getElementById("vs-trap-warning"),
    bdHalf: document.getElementById("vs-bd-half"),
    bdFloor: document.getElementById("vs-bd-floor"),
    bdUpsize: document.getElementById("vs-bd-upsize"),
    bdSlope: document.getElementById("vs-bd-slope"),
    bdFall: document.getElementById("vs-bd-fall"),
  };

  if (
    !drain ||
    !length ||
    !lengthRange ||
    !trapArm ||
    !out.size ||
    !out.note ||
    !out.trapMax ||
    !out.trapVerdict ||
    !out.trapWarning ||
    !out.bdHalf ||
    !out.bdFloor ||
    !out.bdUpsize ||
    !out.bdSlope ||
    !out.bdFall
  ) {
    return;
  }

  function calculate(): void {
    const drainSize = parseFloat(drain!.value);
    const developed = Math.max(0, parseFloat(length!.value) || 0);
    const armFeet = Math.max(0, parseFloat(trapArm!.value) || 0);

    const result = ventSize(drainSize, developed);
    const armMax = trapArmMaxFeet(drainSize);
    const row = TABLE_909_1.find((r) => r.size === drainSize);

    out.size!.textContent = sizeLabel(result.size);
    out.note!.textContent = result.upsized
      ? `Developed length is over ${VENT_LENGTH_UPSIZE_FEET} ft, so IPC 906.2 adds one nominal size for the entire run — half the drain would otherwise be ${sizeLabel(result.halfDrain < 1.25 ? 1.25 : result.halfDrain)}.`
      : `Half the ${sizeLabel(drainSize)} drain it serves, subject to the 1-1/4 inch floor, under IPC 906.2.`;

    out.trapMax!.textContent = armMax === null ? "not listed" : `${armMax} ft`;

    if (armMax === null) {
      out.trapVerdict!.textContent =
        "Table 909.1 does not list a trap arm limit at this size — check the code for the fixture drain in question.";
      out.trapWarning!.classList.add("hidden");
    } else if (armFeet > armMax) {
      out.trapVerdict!.textContent = `Trap arm is ${fmt(armFeet - armMax, 1)} ft too long — the trap will siphon. Move the vent closer or add one.`;
      out.trapWarning!.classList.remove("hidden");
    } else {
      out.trapVerdict!.textContent = `Trap arm has ${fmt(armMax - armFeet, 1)} ft of slack against the ${armMax} ft Table 909.1 limit.`;
      out.trapWarning!.classList.add("hidden");
    }

    out.bdHalf!.textContent = `${fmt(result.halfDrain, 3)} in`;
    out.bdFloor!.textContent = result.halfDrain < 1.25 ? "1-1/4 in floor applied" : "floor not needed";
    out.bdUpsize!.textContent = result.upsized
      ? `yes — over ${VENT_LENGTH_UPSIZE_FEET} ft`
      : `no — under ${VENT_LENGTH_UPSIZE_FEET} ft`;
    out.bdSlope!.textContent = row ? `${row.slope} in/ft` : "—";
    out.bdFall!.textContent = row
      ? `${fmt(totalFall(row.slope, armFeet), 2)} in over the trap arm`
      : "—";
  }

  function syncFromRange(): void {
    length!.value = lengthRange!.value;
    calculate();
  }

  function syncToRange(): void {
    const value = parseFloat(length!.value) || 0;
    if (value >= Number(lengthRange!.min) && value <= Number(lengthRange!.max)) {
      lengthRange!.value = String(value);
    }
    calculate();
  }

  length.addEventListener("input", syncToRange);
  lengthRange.addEventListener("input", syncFromRange);
  drain.addEventListener("change", calculate);
  trapArm.addEventListener("input", calculate);

  resetBtn?.addEventListener("click", () => {
    drain.value = "3";
    length.value = "30";
    lengthRange.value = "30";
    trapArm.value = "6";
    calculate();
  });

  calculate();
}
