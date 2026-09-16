import {
  MAX_VELOCITY_COLD,
  MAX_VELOCITY_HOT,
  fmt,
  flowAtVelocity,
  insideDiameter,
  nominalSizes,
  sizeLabel,
  velocity,
  type PipeMaterial,
} from "@/lib/plumbing";

export function initPlumbingPipeVelocityCalculator(): void {
  const gpm = document.getElementById("pv-gpm") as HTMLInputElement | null;
  const gpmRange = document.getElementById("pv-gpm-range") as HTMLInputElement | null;
  const material = document.getElementById("pv-material") as HTMLSelectElement | null;
  const size = document.getElementById("pv-size") as HTMLSelectElement | null;
  const service = document.getElementById("pv-service") as HTMLSelectElement | null;
  const resetBtn = document.getElementById("pv-reset");

  const out = {
    velocity: document.getElementById("pv-velocity"),
    verdict: document.getElementById("pv-verdict"),
    maxFlow: document.getElementById("pv-max-flow"),
    id: document.getElementById("pv-id"),
    warning: document.getElementById("pv-warning"),
    bdLimit: document.getElementById("pv-bd-limit"),
    bdHeadroom: document.getElementById("pv-bd-headroom"),
    bdNextSize: document.getElementById("pv-bd-next-size"),
    bdOtherService: document.getElementById("pv-bd-other-service"),
  };

  if (
    !gpm ||
    !gpmRange ||
    !material ||
    !size ||
    !service ||
    !out.velocity ||
    !out.verdict ||
    !out.maxFlow ||
    !out.id ||
    !out.warning ||
    !out.bdLimit ||
    !out.bdHeadroom ||
    !out.bdNextSize ||
    !out.bdOtherService
  ) {
    return;
  }

  /** Rebuild the size list when the material changes — ranges differ. */
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

  function calculate(): void {
    const flow = parseFloat(gpm!.value) || 0;
    const mat = material!.value as PipeMaterial;
    const nominal = parseFloat(size!.value);
    const isHot = service!.value === "hot";
    const limit = isHot ? MAX_VELOCITY_HOT : MAX_VELOCITY_COLD;

    const id = insideDiameter(mat, nominal);
    if (id === null) return;

    const v = velocity(flow, id);
    const maxFlow = flowAtVelocity(limit, id);
    const otherLimit = isHot ? MAX_VELOCITY_COLD : MAX_VELOCITY_HOT;

    out.velocity!.textContent = `${fmt(v, 2)} ft/s`;
    out.maxFlow!.textContent = `${fmt(maxFlow, 1)} gpm`;
    out.id!.textContent = `${fmt(id, 3)} in`;

    const over = v > limit;
    out.verdict!.textContent = over
      ? `Over the ${limit} ft/s ${isHot ? "hot" : "cold"} limit by ${fmt(((v / limit - 1) * 100), 0)}% — expect noise, and erosion over time in copper.`
      : `Inside the ${limit} ft/s ${isHot ? "hot" : "cold"} design limit, with ${fmt(limit - v, 2)} ft/s to spare.`;
    out.warning!.classList.toggle("hidden", !over);

    out.bdLimit!.textContent = `${limit} ft/s (${isHot ? "hot" : "cold"})`;
    out.bdHeadroom!.textContent = over
      ? `over by ${fmt(flow - maxFlow, 1)} gpm`
      : `${fmt(maxFlow - flow, 1)} gpm more would fit`;

    const sizes = nominalSizes(mat);
    const index = sizes.indexOf(nominal);
    if (index >= 0 && index < sizes.length - 1) {
      const nextNominal = sizes[index + 1];
      const nextId = insideDiameter(mat, nextNominal);
      out.bdNextSize!.textContent =
        nextId === null
          ? "—"
          : `${sizeLabel(nextNominal)} would run ${fmt(velocity(flow, nextId), 2)} ft/s`;
    } else {
      out.bdNextSize!.textContent = "largest listed size";
    }

    out.bdOtherService!.textContent = `${fmt(flowAtVelocity(otherLimit, id), 1)} gpm at the ${otherLimit} ft/s ${isHot ? "cold" : "hot"} limit`;
  }

  function syncFromRange(): void {
    gpm!.value = gpmRange!.value;
    calculate();
  }

  function syncToRange(): void {
    const value = parseFloat(gpm!.value) || 0;
    if (value >= Number(gpmRange!.min) && value <= Number(gpmRange!.max)) {
      gpmRange!.value = String(value);
    }
    calculate();
  }

  gpm.addEventListener("input", syncToRange);
  gpmRange.addEventListener("input", syncFromRange);
  material.addEventListener("change", () => {
    syncSizes();
    calculate();
  });
  [size, service].forEach((el) => el.addEventListener("change", calculate));

  resetBtn?.addEventListener("click", () => {
    gpm.value = "10";
    gpmRange.value = "10";
    material.value = "copper-l";
    syncSizes();
    size.value = "0.75";
    service.value = "cold";
    calculate();
  });

  calculate();
}
