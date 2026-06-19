// IFGC Table 402.4 — Natural gas, 0.5 in.w.c. drop, 0.60 SG, Schedule 40 IPS
// Each pipe size: [10, 20, 30, 50, 75, 100, 150, 200] ft → capacity in 1000 BTU/h
const NG_TABLE: Record<string, { lengths: number[]; caps: number[] }> = {
  '1/2"':   { lengths: [10,20,30,50,75,100,150,200], caps: [103,72,58,44,36,31,25,21] },
  '3/4"':   { lengths: [10,20,30,50,75,100,150,200], caps: [199,138,112,85,69,59,48,41] },
  '1"':     { lengths: [10,20,30,50,75,100,150,200], caps: [372,258,209,159,129,111,90,77] },
  '1-1/4"': { lengths: [10,20,30,50,75,100,150,200], caps: [673,468,379,289,235,202,163,140] },
  '1-1/2"': { lengths: [10,20,30,50,75,100,150,200], caps: [1000,693,562,428,348,300,242,208] },
  '2"':     { lengths: [10,20,30,50,75,100,150,200], caps: [1902,1319,1070,815,662,571,461,396] },
};
const PIPE_SIZES = ['1/2"','3/4"','1"','1-1/4"','1-1/2"','2"'];
const LP_FACTOR = 0.634;
const MED_FACTOR = 2.0;

function interpolateCap(lengths: number[], caps: number[], length: number): number {
  if (length <= lengths[0]) return caps[0];
  if (length >= lengths[lengths.length-1]) return caps[caps.length-1];
  for (let i = 0; i < lengths.length - 1; i++) {
    if (length <= lengths[i+1]) {
      const t = (length - lengths[i]) / (lengths[i+1] - lengths[i]);
      return caps[i] + t * (caps[i+1] - caps[i]);
    }
  }
  return caps[caps.length-1];
}

export function initHvacGasLineSizingCalculator(): void {
  const loadEl = document.getElementById('gl-load') as HTMLInputElement | null;
  const lengthEl = document.getElementById('gl-length') as HTMLInputElement | null;
  const gasEl = document.getElementById('gl-gas') as HTMLSelectElement | null;
  const pressureEl = document.getElementById('gl-pressure') as HTMLSelectElement | null;
  const resSize = document.getElementById('gl-result-size');
  const resCap = document.getElementById('gl-result-capacity');
  const resVel = document.getElementById('gl-result-velocity');
  const warningBox = document.getElementById('gl-warning');
  const resetBtn = document.getElementById('gl-reset');

  if (!loadEl || !lengthEl || !gasEl || !pressureEl || !resSize || !resCap || !resVel) return;

  function calculate(): void {
    const loadBtuh = parseFloat(loadEl.value) || 0;
    const length = parseFloat(lengthEl.value) || 50;
    const isLp = gasEl.value === 'lp';
    const isMed = pressureEl.value === 'med';
    const loadK = loadBtuh / 1000;

    let selectedSize = '';
    let selectedCap = 0;

    for (const size of PIPE_SIZES) {
      const row = NG_TABLE[size];
      let cap = interpolateCap(row.lengths, row.caps, length);
      if (isLp) cap *= LP_FACTOR;
      if (isMed) cap *= MED_FACTOR;
      if (cap >= loadK) {
        selectedSize = size;
        selectedCap = cap * 1000;
        break;
      }
    }

    if (!selectedSize) {
      selectedSize = '> 2" — consult engineer';
      selectedCap = 0;
    }

    resSize.textContent = selectedSize;
    resCap.textContent = selectedCap > 0 ? Math.round(selectedCap).toLocaleString() : 'N/A';
    const vel = selectedCap > 0 ? (loadBtuh / 1020) / 0.005 : 0;
    resVel.textContent = selectedCap > 0 ? Math.round(vel).toString() : 'N/A';

    if (warningBox) warningBox.classList.toggle('hidden', selectedSize !== '> 2" — consult engineer');
  }

  loadEl.addEventListener('input', calculate);
  lengthEl.addEventListener('input', calculate);
  gasEl.addEventListener('change', calculate);
  pressureEl.addEventListener('change', calculate);
  resetBtn?.addEventListener('click', () => {
    loadEl.value = '200000'; lengthEl.value = '50';
    gasEl.value = 'ng'; pressureEl.value = 'low'; calculate();
  });
  calculate();
}
