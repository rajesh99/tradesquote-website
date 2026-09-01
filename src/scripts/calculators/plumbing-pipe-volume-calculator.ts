import {
  fmt,
  gallonsPerFoot,
  insideDiameter,
  nominalSizes,
  pipeVolume,
  sizeLabel,
  type PipeMaterial,
} from "@/lib/plumbing";

export function initPlumbingPipeVolumeCalculator(): void {
  const material = document.getElementById("pvol-material") as HTMLSelectElement | null;
  const size = document.getElementById("pvol-size") as HTMLSelectElement | null;
  const length = document.getElementById("pvol-length") as HTMLInputElement | null;
  const lengthRange = document.getElementById("pvol-length-range") as HTMLInputElement | null;
  const flow = document.getElementById("pvol-flow") as HTMLInputElement | null;
  const custom = document.getElementById("pvol-custom-id") as HTMLInputElement | null;
  const resetBtn = document.getElementById("pvol-reset");

  const out = {
    gallons: document.getElementById("pvol-gallons"),
    note: document.getElementById("pvol-note"),
    litres: document.getElementById("pvol-litres"),
    purge: document.getElementById("pvol-purge"),
    bdId: document.getElementById("pvol-bd-id"),
    bdPerFoot: document.getElementById("pvol-bd-per-foot"),
    bdCubic: document.getElementById("pvol-bd-cubic"),
    bdWeight: document.getElementById("pvol-bd-weight"),
    bdNext: document.getElementById("pvol-bd-next"),
  };

  if (
    !material ||
    !size ||
    !length ||
    !lengthRange ||
    !flow ||
    !custom ||
    !out.gallons ||
    !out.note ||
    !out.litres ||
    !out.purge ||
    !out.bdId ||
    !out.bdPerFoot ||
    !out.bdCubic ||
    !out.bdWeight ||
    !out.bdNext
  ) {
    return;
  }

  function syncSizes(): void {
    const mat = material!.value as PipeMaterial;
    const sizes = nominalSizes(mat);
    const previous = parseFloat(size!.value);
    size!.innerHTML = "";
    sizes.forEach((n) => {
      const option = document.createElement("option");
      option.value = String(n);
      option.textContent = sizeLabel(n);
      size!.appendChild(option);
    });
    size!.value = sizes.includes(previous) ? String(previous) : String(sizes[0]);
  }

  /** A typed custom bore overrides the material and size pickers. */
  function activeId(): { id: number; source: string } | null {
    const typed = parseFloat(custom!.value);
    if (Number.isFinite(typed) && typed > 0) {
      return { id: typed, source: "custom bore" };
    }
    const mat = material!.value as PipeMaterial;
    const nominal = parseFloat(size!.value);
    const id = insideDiameter(mat, nominal);
    if (id === null) return null;
    return { id, source: `${sizeLabel(nominal)} nominal` };
  }

  function calculate(): void {
    const active = activeId();
    if (!active) return;
    const lengthFt = Math.max(0, parseFloat(length!.value) || 0);
    const gpm = Math.max(0, parseFloat(flow!.value) || 0);

    const r = pipeVolume(active.id, lengthFt);
    const purgeMin = r.minutesToPurge(gpm);

    out.gallons!.textContent = `${fmt(r.gallons, 2)} gal`;
    out.litres!.textContent = `${fmt(r.litres, 1)} L`;
    out.purge!.textContent = Number.isFinite(purgeMin)
      ? purgeMin < 1
        ? `${fmt(purgeMin * 60, 0)} sec`
        : `${fmt(purgeMin, 2)} min`
      : "—";

    out.bdId!.textContent = `${fmt(active.id, 3)} in (${active.source})`;
    out.bdPerFoot!.textContent = `${fmt(r.perFoot, 4)} gal per foot`;
    out.bdCubic!.textContent = `${fmt(r.cubicFeet, 3)} ft³`;
    out.bdWeight!.textContent = `${fmt(r.weightLb, 1)} lb of water`;

    const mat = material!.value as PipeMaterial;
    const sizes = nominalSizes(mat);
    const index = sizes.indexOf(parseFloat(size!.value));
    if (index >= 0 && index < sizes.length - 1) {
      const nextId = insideDiameter(mat, sizes[index + 1]);
      out.bdNext!.textContent =
        nextId === null
          ? "—"
          : `${sizeLabel(sizes[index + 1])} holds ${fmt(gallonsPerFoot(nextId) * lengthFt, 2)} gal`;
    } else {
      out.bdNext!.textContent = "largest listed size";
    }

    out.note!.textContent = Number.isFinite(purgeMin)
      ? `At ${fmt(gpm, 1)} gpm the tap runs ${purgeMin < 1 ? `${fmt(purgeMin * 60, 0)} seconds` : `${fmt(purgeMin, 2)} minutes`} before the water standing in this run has been pushed out.`
      : `Enter a flow rate to see how long it takes to clear the run.`;
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
  material.addEventListener("change", () => {
    syncSizes();
    calculate();
  });
  size.addEventListener("change", calculate);
  [flow, custom].forEach((el) => el.addEventListener("input", calculate));

  resetBtn?.addEventListener("click", () => {
    material.value = "copper-l";
    syncSizes();
    size.value = "0.75";
    length.value = "50";
    lengthRange.value = "50";
    flow.value = "2";
    custom.value = "";
    calculate();
  });

  calculate();
}
