// Design BTU/sqft by ASHRAE climate zone
const ZONE_BTU: Record<string, number> = { '1': 25, '2': 35, '3': 45, '4': 55, '5': 70, '6': 85, '7': 100 };

export function initHvacHeatLossCalculator(): void {
  const sqftEl = document.getElementById('hl-sqft') as HTMLInputElement | null;
  const zoneEl = document.getElementById('hl-zone') as HTMLSelectElement | null;
  const insulEl = document.getElementById('hl-insulation') as HTMLSelectElement | null;
  const winEl = document.getElementById('hl-windows') as HTMLSelectElement | null;
  const resBtuh = document.getElementById('hl-result-btuh');
  const resTons = document.getElementById('hl-result-tons');
  const resKw = document.getElementById('hl-result-kw');
  const resetBtn = document.getElementById('hl-reset');

  if (!sqftEl || !zoneEl || !insulEl || !winEl || !resBtuh || !resTons || !resKw) return;

  function calculate(): void {
    const sqft = parseFloat(sqftEl.value) || 0;
    const zone = zoneEl.value;
    const insFactor = parseFloat(insulEl.value) || 1.0;
    const winFactor = parseFloat(winEl.value) || 1.0;
    const btuPerSqft = ZONE_BTU[zone] ?? 55;
    const load = sqft * btuPerSqft * insFactor * winFactor;
    const tons = load / 12000;
    const kw = load / 3412;
    resBtuh.textContent = Math.round(load).toLocaleString();
    resTons.textContent = tons.toFixed(1);
    resKw.textContent = kw.toFixed(1);
  }

  sqftEl.addEventListener('input', calculate);
  zoneEl.addEventListener('change', calculate);
  insulEl.addEventListener('change', calculate);
  winEl.addEventListener('change', calculate);
  resetBtn?.addEventListener('click', () => {
    sqftEl.value = '2000';
    zoneEl.value = '4';
    insulEl.value = '1.0';
    winEl.value = '1.0';
    calculate();
  });
  calculate();
}
