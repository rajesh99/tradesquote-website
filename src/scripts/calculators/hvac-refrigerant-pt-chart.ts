// Saturation data tables — temperature (°F) → psig
// Data sourced from ASHRAE 2021 and manufacturer PT charts
const PT_DATA: Record<string, { temps: number[]; psig: number[] }> = {
  r410a: {
    temps: [-40,-30,-20,-10,0,10,20,30,40,50,60,70,80,90,100,110,120,130],
    psig:  [28.2,37.0,47.7,59.4,73.0,88.4,105.7,124.9,146.1,169.3,194.6,222.0,251.5,283.2,317.2,353.5,392.3,433.6],
  },
  r32: {
    temps: [-40,-30,-20,-10,0,10,20,30,40,50,60,70,80,90,100,110,120,130],
    psig:  [21.4,30.1,40.4,52.4,66.3,82.2,100.2,120.4,142.9,167.8,195.2,224.9,257.2,291.9,329.1,368.8,411.1,455.9],
  },
  r454b: {
    temps: [-40,-30,-20,-10,0,10,20,30,40,50,60,70,80,90,100,110,120,130],
    psig:  [21.0,29.5,39.7,51.5,65.2,81.0,98.9,118.9,141.3,166.0,193.2,222.8,254.8,289.2,325.8,364.8,406.1,449.8],
  },
  r22: {
    temps: [-40,-30,-20,-10,0,10,20,30,40,50,60,70,80,90,100,110,120,130],
    psig:  [0.5,4.9,10.1,16.2,23.2,31.2,40.4,50.9,62.8,76.2,91.1,107.5,125.5,145.1,166.3,189.2,213.7,240.0],
  },
};

function interpolate(xs: number[], ys: number[], x: number): number {
  if (x <= xs[0]) return ys[0];
  if (x >= xs[xs.length-1]) return ys[ys.length-1];
  for (let i = 0; i < xs.length-1; i++) {
    if (x <= xs[i+1]) {
      const t = (x - xs[i]) / (xs[i+1] - xs[i]);
      return ys[i] + t * (ys[i+1] - ys[i]);
    }
  }
  return ys[ys.length-1];
}

function fToC(f: number): number { return (f - 32) * 5/9; }

export function initHvacRefrigerantPtChart(): void {
  const refEl = document.getElementById('pt-refrigerant') as HTMLSelectElement | null;
  const unitEl = document.getElementById('pt-unit') as HTMLSelectElement | null;
  const tempEl = document.getElementById('pt-temp') as HTMLInputElement | null;
  const resPsig = document.getElementById('pt-result-psig');
  const resBara = document.getElementById('pt-result-bara');
  const resPhase = document.getElementById('pt-result-phase');
  const resetBtn = document.getElementById('pt-reset');
  if (!refEl || !unitEl || !tempEl || !resPsig || !resBara || !resPhase) return;

  function calculate(): void {
    const ref = refEl.value;
    const unit = unitEl.value;
    const tempInput = parseFloat(tempEl.value) ?? 40;
    const tempF = unit === 'C' ? tempInput * 9/5 + 32 : tempInput;
    const data = PT_DATA[ref];
    const psig = interpolate(data.temps, data.psig, tempF);
    const bara = (psig + 14.696) * 0.068948;
    resPsig.textContent = psig.toFixed(1);
    resBara.textContent = bara.toFixed(3);
    resPhase.textContent = 'Saturated (two-phase)';
  }

  refEl.addEventListener('change', calculate);
  unitEl.addEventListener('change', calculate);
  tempEl.addEventListener('input', calculate);
  resetBtn?.addEventListener('click', () => { refEl.value = 'r410a'; unitEl.value = 'F'; tempEl.value = '40'; calculate(); });
  calculate();
}
