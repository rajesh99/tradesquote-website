const STANDARD_BREAKERS = [15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100, 110, 125, 150, 175, 200];
const PF = 0.95;
const SQRT3 = 1.732;

export function initHvacAmpDrawCalculator(): void {
  const btuhEl = document.getElementById('ad-btuh') as HTMLInputElement | null;
  const seer2El = document.getElementById('ad-seer2') as HTMLInputElement | null;
  const voltageEl = document.getElementById('ad-voltage') as HTMLSelectElement | null;
  const phaseEl = document.getElementById('ad-phase') as HTMLSelectElement | null;
  const resRla = document.getElementById('ad-result-rla');
  const resMca = document.getElementById('ad-result-mca');
  const resMop = document.getElementById('ad-result-mop');
  const resKw = document.getElementById('ad-result-kw');
  const warningBox = document.getElementById('ad-warning');
  const resetBtn = document.getElementById('ad-reset');

  if (!btuhEl || !seer2El || !voltageEl || !phaseEl || !resRla || !resMca || !resMop || !resKw) return;

  function calculate(): void {
    const btuh = parseFloat(btuhEl.value) || 0;
    const seer2 = parseFloat(seer2El.value) || 14;
    const voltage = parseFloat(voltageEl.value) || 230;
    const phase = parseInt(phaseEl.value) || 1;
    const eer = seer2 * 0.875;
    const kw = btuh / (eer * 1000);
    const watts = kw * 1000;
    const rla = phase === 1 ? watts / (voltage * PF) : watts / (SQRT3 * voltage * PF);
    const mca = rla * 1.25;
    const mopTarget = rla * 2.25;
    const mop = STANDARD_BREAKERS.find(b => b >= mopTarget) ?? STANDARD_BREAKERS[STANDARD_BREAKERS.length - 1];
    resRla.textContent = rla.toFixed(1);
    resMca.textContent = mca.toFixed(1);
    resMop.textContent = mop.toString();
    resKw.textContent = kw.toFixed(2);
    if (warningBox) warningBox.classList.toggle('hidden', rla <= 80);
  }

  btuhEl.addEventListener('input', calculate);
  seer2El.addEventListener('input', calculate);
  voltageEl.addEventListener('change', calculate);
  phaseEl.addEventListener('change', calculate);
  resetBtn?.addEventListener('click', () => {
    btuhEl.value = '36000'; seer2El.value = '16';
    voltageEl.value = '230'; phaseEl.value = '1'; calculate();
  });
  calculate();
}
