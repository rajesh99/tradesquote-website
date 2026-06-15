function fmt(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

function fmtTons(t: number): string {
  return (Math.round(t * 100) / 100).toString();
}

function recommendTons(tonsExact: number): string {
  const std = [1, 1.5, 2, 2.5, 3, 3.5, 4, 5];
  const rec = std.find((t) => t >= tonsExact);
  return rec ? `${rec}-ton system` : "Multi-zone (5+ tons)";
}

export function initHvacTonnageCalculator(): void {
  const btuField = document.getElementById("conv-btu") as HTMLInputElement | null;
  const tonsField = document.getElementById("conv-tons") as HTMLInputElement | null;
  const convResult = document.getElementById("conv-result");

  const sqft = document.getElementById("est-sqft") as HTMLInputElement | null;
  const sqftRange = document.getElementById("est-range") as HTMLInputElement | null;
  const estClimate = document.getElementById("est-climate") as HTMLSelectElement | null;
  const estTons = document.getElementById("est-tons");
  const estBtu = document.getElementById("est-btu");
  const estSystem = document.getElementById("est-system");

  if (
    !btuField ||
    !tonsField ||
    !convResult ||
    !sqft ||
    !sqftRange ||
    !estClimate ||
    !estTons ||
    !estBtu ||
    !estSystem
  ) {
    return;
  }

  function updateConvResult(): void {
    const b = parseFloat(btuField.value);
    const t = parseFloat(tonsField.value);
    if (isFinite(b) && b > 0) {
      convResult.textContent = `${fmt(b)} BTU/hr = ${fmtTons(b / 12000)} tons`;
    } else if (isFinite(t) && t > 0) {
      convResult.textContent = `${fmtTons(t)} tons = ${fmt(t * 12000)} BTU/hr`;
    } else {
      convResult.textContent = "Enter a value above";
    }
  }

  btuField.addEventListener("input", () => {
    const b = parseFloat(btuField.value);
    tonsField.value = isFinite(b) ? String(Math.round((b / 12000) * 100) / 100) : "";
    updateConvResult();
  });

  tonsField.addEventListener("input", () => {
    const t = parseFloat(tonsField.value);
    btuField.value = isFinite(t) ? String(Math.round(t * 12000)) : "";
    updateConvResult();
  });

  function estimate(): void {
    const a = parseFloat(sqft.value) || 0;
    const c = parseFloat(estClimate.value) || 1;
    const btu = Math.round((a * 20 * c) / 500) * 500;
    const tonsExact = btu / 12000;
    estTons.textContent = (tonsExact > 0 ? tonsExact.toFixed(1) : "0") + " tons";
    estBtu.textContent = a > 0 ? fmt(btu) + " BTU/hr" : "—";
    estSystem.textContent = a > 0 ? recommendTons(tonsExact) : "—";
  }

  sqft.addEventListener("input", () => {
    sqftRange.value = sqft.value;
    estimate();
  });
  sqftRange.addEventListener("input", () => {
    sqft.value = sqftRange.value;
    estimate();
  });
  estClimate.addEventListener("input", estimate);

  updateConvResult();
  estimate();
}
