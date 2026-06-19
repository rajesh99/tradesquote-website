export function initHvacMixedAirTemperatureCalculator(): void {
  const oaCfmEl = document.getElementById('ma-oa-cfm') as HTMLInputElement | null;
  const raCfmEl = document.getElementById('ma-ra-cfm') as HTMLInputElement | null;
  const oaTempEl = document.getElementById('ma-oa-temp') as HTMLInputElement | null;
  const raTempEl = document.getElementById('ma-ra-temp') as HTMLInputElement | null;
  const resMat = document.getElementById('ma-result-mat');
  const resOaPct = document.getElementById('ma-result-oa-pct');
  const resCfm = document.getElementById('ma-result-sa-cfm');
  const resSensible = document.getElementById('ma-result-sensible');
  const warningBox = document.getElementById('ma-warning');
  const resetBtn = document.getElementById('ma-reset');

  if (!oaCfmEl || !raCfmEl || !oaTempEl || !raTempEl || !resMat || !resOaPct || !resCfm || !resSensible) return;

  function calculate(): void {
    const oaCfm = parseFloat(oaCfmEl.value) || 0;
    const raCfm = parseFloat(raCfmEl.value) || 0;
    const oaTemp = parseFloat(oaTempEl.value) || 0;
    const raTemp = parseFloat(raTempEl.value) || 75;
    const totalCfm = oaCfm + raCfm;
    if (totalCfm <= 0) return;
    const mat = (oaCfm * oaTemp + raCfm * raTemp) / totalCfm;
    const oaPct = (oaCfm / totalCfm) * 100;
    const SUPPLY_TEMP = 55;
    const sensible = 1.08 * totalCfm * Math.max(0, mat - SUPPLY_TEMP);
    resMat.textContent = mat.toFixed(1);
    resOaPct.textContent = oaPct.toFixed(1);
    resCfm.textContent = Math.round(totalCfm).toLocaleString();
    resSensible.textContent = Math.round(sensible).toLocaleString();
    if (warningBox) warningBox.classList.toggle('hidden', oaPct >= 10);
  }

  oaCfmEl.addEventListener('input', calculate);
  raCfmEl.addEventListener('input', calculate);
  oaTempEl.addEventListener('input', calculate);
  raTempEl.addEventListener('input', calculate);
  resetBtn?.addEventListener('click', () => {
    oaCfmEl.value = '400';
    raCfmEl.value = '1600';
    oaTempEl.value = '95';
    raTempEl.value = '75';
    calculate();
  });
  calculate();
}
