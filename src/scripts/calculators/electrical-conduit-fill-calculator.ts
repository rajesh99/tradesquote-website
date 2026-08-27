import {
  CONDUIT_AREA,
  CONDUIT_TRADE_SIZES,
  THHN_AREA,
  XHHW_AREA,
  additionalConductorsThatFit,
  conduitFillLimit,
  fmt,
  sizeLabel,
} from "@/lib/nec";

const ROW_COUNT = 4;

export function initElectricalConduitFillCalculator(): void {
  const type = document.getElementById("cf-type") as HTMLSelectElement | null;
  const size = document.getElementById("cf-size") as HTMLSelectElement | null;
  const insulation = document.getElementById("cf-insulation") as HTMLSelectElement | null;
  const resetBtn = document.getElementById("cf-reset");

  const rows: { gauge: HTMLSelectElement; count: HTMLInputElement; area: HTMLElement }[] = [];
  for (let i = 1; i <= ROW_COUNT; i += 1) {
    const gauge = document.getElementById(`cf-gauge-${i}`) as HTMLSelectElement | null;
    const count = document.getElementById(`cf-count-${i}`) as HTMLInputElement | null;
    const area = document.getElementById(`cf-area-${i}`);
    if (!gauge || !count || !area) return;
    rows.push({ gauge, count, area });
  }

  const out = {
    percent: document.getElementById("cf-percent"),
    allowable: document.getElementById("cf-allowable"),
    used: document.getElementById("cf-used"),
    verdict: document.getElementById("cf-verdict"),
    bdConductors: document.getElementById("cf-bd-conductors"),
    bdLimit: document.getElementById("cf-bd-limit"),
    bdTotalArea: document.getElementById("cf-bd-total-area"),
    bdConduitArea: document.getElementById("cf-bd-conduit-area"),
    bdMoreFit: document.getElementById("cf-bd-more-fit"),
    bdNextSize: document.getElementById("cf-bd-next-size"),
  };

  if (
    !type ||
    !size ||
    !insulation ||
    !out.percent ||
    !out.allowable ||
    !out.used ||
    !out.verdict ||
    !out.bdConductors ||
    !out.bdLimit ||
    !out.bdTotalArea ||
    !out.bdConduitArea ||
    !out.bdMoreFit ||
    !out.bdNextSize
  ) {
    return;
  }

  function areaTable(): Record<string, number> {
    return insulation!.value === "XHHW-2" ? XHHW_AREA : THHN_AREA;
  }

  function calculate(): void {
    const areas = areaTable();
    let totalArea = 0;
    let totalCount = 0;
    let largestGauge = "";
    let largestArea = 0;

    rows.forEach((row) => {
      const count = Math.max(0, parseInt(row.count.value) || 0);
      const each = areas[row.gauge.value] ?? 0;
      const rowArea = count * each;
      totalArea += rowArea;
      totalCount += count;
      if (count > 0 && each > largestArea) {
        largestArea = each;
        largestGauge = row.gauge.value;
      }
      row.area.textContent = count > 0 ? `${rowArea.toFixed(4)} in²` : "—";
    });

    const conduitTotal = CONDUIT_AREA[type!.value]?.[size!.value] ?? 0;
    const limit = conduitFillLimit(totalCount);
    const allowable = conduitTotal * limit;
    const percent = conduitTotal > 0 ? (totalArea / conduitTotal) * 100 : 0;
    const passes = totalArea <= allowable && totalCount > 0;

    out.percent!.textContent = totalCount > 0 ? `${fmt(percent, 1)}%` : "0%";
    out.allowable!.textContent = `${allowable.toFixed(4)} in²`;
    out.used!.textContent = `${totalArea.toFixed(4)} in²`;

    if (totalCount === 0) {
      out.verdict!.textContent = "Add conductors to calculate fill.";
      out.verdict!.className = "mt-1 text-sm font-semibold text-slate-600";
    } else if (passes) {
      out.verdict!.textContent = `Within the ${Math.round(limit * 100)}% limit for ${totalCount} conductor${totalCount === 1 ? "" : "s"}.`;
      out.verdict!.className = "mt-1 text-sm font-semibold text-emerald-700";
    } else {
      out.verdict!.textContent = `Over the ${Math.round(limit * 100)}% limit — go up a trade size.`;
      out.verdict!.className = "mt-1 text-sm font-semibold text-rose-700";
    }

    out.bdConductors!.textContent = `${totalCount}`;
    out.bdLimit!.textContent = `${Math.round(limit * 100)}% (Chapter 9, Table 1)`;
    out.bdTotalArea!.textContent = `${totalArea.toFixed(4)} in²`;
    out.bdConduitArea!.textContent = `${conduitTotal.toFixed(3)} in² (100%)`;

    if (largestGauge && largestArea > 0 && passes) {
      const more = additionalConductorsThatFit(conduitTotal, totalArea, totalCount, largestArea);
      out.bdMoreFit!.textContent = `${more} more ${sizeLabel(largestGauge)}`;
    } else {
      out.bdMoreFit!.textContent = passes ? "—" : "None — already over";
    }

    const currentIndex = CONDUIT_TRADE_SIZES.indexOf(size!.value);
    const nextSize = CONDUIT_TRADE_SIZES[currentIndex + 1];
    if (!passes && nextSize) {
      const nextTotal = CONDUIT_AREA[type!.value]?.[nextSize] ?? 0;
      const nextOk = totalArea <= nextTotal * limit;
      out.bdNextSize!.textContent = nextOk
        ? `${nextSize} — ${fmt((totalArea / nextTotal) * 100, 1)}% fill`
        : `${nextSize} still over — keep going up`;
    } else {
      out.bdNextSize!.textContent = nextSize ? `${nextSize} (not needed)` : "Largest listed size";
    }
  }

  [type, size, insulation].forEach((el) => el.addEventListener("change", calculate));
  rows.forEach((row) => {
    row.gauge.addEventListener("change", calculate);
    row.count.addEventListener("input", calculate);
  });

  resetBtn?.addEventListener("click", () => {
    type.value = "EMT";
    size.value = '1/2"';
    insulation.value = "THHN";
    rows.forEach((row, index) => {
      row.gauge.value = index === 0 ? "12" : "12";
      row.count.value = index === 0 ? "4" : "0";
    });
    calculate();
  });

  calculate();
}
