const FACTOR = 0.9524;
const MINIMUMS: Record<string, number> = { south: 14, north: 13.4 };
const MINIMUM_LABELS: Record<string, string> = { south: '14 SEER2', north: '13.4 SEER2' };

export function initHvacSeer2Converter(): void {
  const modeEl = document.getElementById('s2-mode') as HTMLSelectElement | null;
  const valueEl = document.getElementById('s2-value') as HTMLInputElement | null;
  const regionEl = document.getElementById('s2-region') as HTMLSelectElement | null;
  const resConverted = document.getElementById('s2-result-converted');
  const resMin = document.getElementById('s2-result-min');
  const resStatus = document.getElementById('s2-result-status');
  const resetBtn = document.getElementById('s2-reset');

  if (!modeEl || !valueEl || !regionEl || !resConverted || !resMin || !resStatus) return;

  function calculate(): void {
    const mode = modeEl.value;
    const val = parseFloat(valueEl.value) || 0;
    const region = regionEl.value;
    const converted = mode === 'seer-to-seer2' ? val * FACTOR : val / FACTOR;
    const seer2Value = mode === 'seer-to-seer2' ? converted : val;
    const min = MINIMUMS[region];
    const compliant = seer2Value >= min;
    resConverted.textContent = mode === 'seer-to-seer2'
      ? converted.toFixed(1) + ' SEER2'
      : converted.toFixed(1) + ' SEER';
    resMin.textContent = MINIMUM_LABELS[region];
    resStatus.textContent = compliant
      ? 'Meets minimum'
      : 'Below minimum — cannot be installed new';
    resStatus.className = compliant
      ? 'text-emerald-600 font-semibold'
      : 'text-red-600 font-semibold';
  }

  modeEl.addEventListener('change', calculate);
  valueEl.addEventListener('input', calculate);
  regionEl.addEventListener('change', calculate);
  resetBtn?.addEventListener('click', () => {
    modeEl.value = 'seer-to-seer2';
    valueEl.value = '16';
    regionEl.value = 'south';
    calculate();
  });
  calculate();
}
