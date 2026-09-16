import { PRV_THRESHOLD_PSI, fmt, headToPsi, psiToHead } from "@/lib/plumbing";

export function initPlumbingWaterPressureCalculator(): void {
  const staticPsi = document.getElementById("wp-static") as HTMLInputElement | null;
  const staticRange = document.getElementById("wp-static-range") as HTMLInputElement | null;
  const rise = document.getElementById("wp-rise") as HTMLInputElement | null;
  const friction = document.getElementById("wp-friction") as HTMLInputElement | null;
  const resetBtn = document.getElementById("wp-reset");

  const out = {
    atFixture: document.getElementById("wp-at-fixture"),
    verdict: document.getElementById("wp-verdict"),
    head: document.getElementById("wp-head"),
    elevation: document.getElementById("wp-elevation"),
    prvNotice: document.getElementById("wp-prv-notice"),
    lowNotice: document.getElementById("wp-low-notice"),
    bdStaticHead: document.getElementById("wp-bd-static-head"),
    bdElevationPsi: document.getElementById("wp-bd-elevation-psi"),
    bdFriction: document.getElementById("wp-bd-friction"),
    bdFixtureHead: document.getElementById("wp-bd-fixture-head"),
    bdStoreys: document.getElementById("wp-bd-storeys"),
  };

  if (
    !staticPsi ||
    !staticRange ||
    !rise ||
    !friction ||
    !out.atFixture ||
    !out.verdict ||
    !out.head ||
    !out.elevation ||
    !out.prvNotice ||
    !out.lowNotice ||
    !out.bdStaticHead ||
    !out.bdElevationPsi ||
    !out.bdFriction ||
    !out.bdFixtureHead ||
    !out.bdStoreys
  ) {
    return;
  }

  function calculate(): void {
    const supply = parseFloat(staticPsi!.value) || 0;
    const riseFt = Math.max(0, parseFloat(rise!.value) || 0);
    const frictionPsi = Math.max(0, parseFloat(friction!.value) || 0);

    const elevationPsi = headToPsi(riseFt);
    const atFixture = supply - elevationPsi - frictionPsi;

    out.atFixture!.textContent = `${fmt(atFixture, 2)} psi`;
    out.head!.textContent = `${fmt(psiToHead(supply), 1)} ft`;
    out.elevation!.textContent = `${fmt(elevationPsi, 2)} psi`;

    const needsPrv = supply > PRV_THRESHOLD_PSI;
    const tooLow = atFixture < 15;

    if (needsPrv) {
      out.verdict!.textContent = `Static pressure is over the ${PRV_THRESHOLD_PSI} psi threshold in IPC 604.8 — an approved pressure-reducing valve is required.`;
    } else if (tooLow) {
      out.verdict!.textContent = `Only ${fmt(atFixture, 1)} psi reaches the fixture. Most fixtures want 8–15 psi and a flushometer wants about 25, so this is marginal at best.`;
    } else {
      out.verdict!.textContent = `${fmt(atFixture, 1)} psi arrives at the fixture — comfortable for ordinary fixtures, and no pressure-reducing valve is required.`;
    }

    out.prvNotice!.classList.toggle("hidden", !needsPrv);
    out.lowNotice!.classList.toggle("hidden", needsPrv || !tooLow);

    out.bdStaticHead!.textContent = `${fmt(psiToHead(supply), 1)} ft of water column`;
    out.bdElevationPsi!.textContent = `−${fmt(elevationPsi, 2)} psi over ${fmt(riseFt, 0)} ft`;
    out.bdFriction!.textContent = frictionPsi > 0 ? `−${fmt(frictionPsi, 2)} psi` : "not included";
    out.bdFixtureHead!.textContent = `${fmt(psiToHead(atFixture), 1)} ft of head`;
    out.bdStoreys!.textContent = `${fmt(headToPsi(10), 2)} psi per 10 ft storey`;
  }

  function syncFromRange(): void {
    staticPsi!.value = staticRange!.value;
    calculate();
  }

  function syncToRange(): void {
    const value = parseFloat(staticPsi!.value) || 0;
    if (value >= Number(staticRange!.min) && value <= Number(staticRange!.max)) {
      staticRange!.value = String(value);
    }
    calculate();
  }

  staticPsi.addEventListener("input", syncToRange);
  staticRange.addEventListener("input", syncFromRange);
  [rise, friction].forEach((el) => el.addEventListener("input", calculate));

  resetBtn?.addEventListener("click", () => {
    staticPsi.value = "65";
    staticRange.value = "65";
    rise.value = "25";
    friction.value = "0";
    calculate();
  });

  calculate();
}
