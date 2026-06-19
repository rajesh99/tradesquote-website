const SIZES = [4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 18, 20];
const CAPACITY: Record<number, number> = {
  4: 35,
  5: 60,
  6: 100,
  7: 160,
  8: 230,
  9: 320,
  10: 425,
  12: 700,
  14: 1050,
  16: 1500,
  18: 2050,
  20: 2750,
};

function fmt(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

function sizeFor(cfm: number, factor: number): number | null {
  return SIZES.find((d) => CAPACITY[d] * factor >= cfm) ?? null;
}

function velocityAt(cfm: number, d: number): number {
  const areaSqFt = Math.PI * Math.pow(d / 24, 2);
  return cfm / areaSqFt;
}

export function initHvacDuctSizeCalculator(): void {
  const cfmInput = document.getElementById("ductCfm") as HTMLInputElement | null;
  const cfmRange = document.getElementById("ductRange") as HTMLInputElement | null;
  const typeSel = document.getElementById("ductType") as HTMLSelectElement | null;

  const out = {
    size: document.getElementById("sizeResult"),
    material: document.getElementById("sizeMaterial"),
    vel: document.getElementById("velResult"),
    cap: document.getElementById("capResult"),
    altLabel: document.getElementById("altLabel"),
    alt: document.getElementById("altResult"),
    velNote: document.getElementById("velNote"),
  };

  if (
    !cfmInput ||
    !cfmRange ||
    !typeSel ||
    !out.size ||
    !out.material ||
    !out.vel ||
    !out.cap ||
    !out.altLabel ||
    !out.alt ||
    !out.velNote
  ) {
    return;
  }

  function calculate(): void {
    const cfm = parseFloat(cfmInput.value) || 0;
    const factor = parseFloat(typeSel.value) || 1;
    const isMetal = factor === 1;

    const d = sizeFor(cfm, factor);
    const altFactor = isMetal ? 0.75 : 1;
    const altD = sizeFor(cfm, altFactor);

    out.material.textContent = isMetal ? "sheet metal" : "flex duct";
    out.altLabel.textContent = isMetal ? "Same airflow in flex duct" : "Same airflow in sheet metal";

    if (!d || cfm <= 0) {
      out.size.textContent = cfm > 0 ? '20"+' : "—";
      out.vel.textContent = "—";
      out.cap.textContent = "—";
      out.alt.textContent = cfm > 0 ? "Split into multiple runs" : "—";
      out.velNote.textContent =
        cfm > 0
          ? "Over 20-inch territory — split the airflow into multiple trunks or use rectangular duct via Manual D."
          : "Enter an airflow above to size the duct.";
      return;
    }

    const vel = velocityAt(cfm, d);
    out.size.textContent = d + '"';
    out.vel.textContent = fmt(vel) + " fpm";
    out.cap.textContent = fmt(CAPACITY[d] * factor) + " CFM";
    out.alt.textContent = altD ? `${altD}" ${isMetal ? "flex duct" : "sheet metal"}` : "Multiple runs needed";
    out.velNote.textContent =
      vel > 900
        ? "Velocity is above the 900 fpm comfort threshold — consider the next size up to keep it quiet."
        : "Velocity is under the 900 fpm supply-trunk comfort threshold — this run should be quiet.";
  }

  cfmInput.addEventListener("input", () => {
    cfmRange.value = cfmInput.value;
    calculate();
  });
  cfmRange.addEventListener("input", () => {
    cfmInput.value = cfmRange.value;
    calculate();
  });
  typeSel.addEventListener("input", calculate);

  document.querySelectorAll<HTMLButtonElement>(".quickPick").forEach((btn) =>
    btn.addEventListener("click", () => {
      cfmInput.value = btn.dataset.cfm ?? "";
      cfmRange.value = btn.dataset.cfm ?? "";
      calculate();
    }),
  );

  calculate();
}
