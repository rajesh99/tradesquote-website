function fmt(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

export function initHvacCfmCalculator(): void {
  const roomArea = document.getElementById("room-area") as HTMLInputElement | null;
  const roomRange = document.getElementById("room-range") as HTMLInputElement | null;
  const roomCeiling = document.getElementById("room-ceiling") as HTMLSelectElement | null;
  const roomType = document.getElementById("room-type") as HTMLSelectElement | null;
  const roomCfm = document.getElementById("room-cfm");
  const roomVol = document.getElementById("room-vol");
  const roomPerSqft = document.getElementById("room-persqft");
  const sysTons = document.getElementById("sys-tons") as HTMLSelectElement | null;
  const sysClimate = document.getElementById("sys-climate") as HTMLSelectElement | null;
  const sysCfm = document.getElementById("sys-cfm");
  const sysNote = document.getElementById("sys-note");

  if (
    !roomArea ||
    !roomRange ||
    !roomCeiling ||
    !roomType ||
    !roomCfm ||
    !roomVol ||
    !roomPerSqft ||
    !sysTons ||
    !sysClimate ||
    !sysCfm ||
    !sysNote
  ) {
    return;
  }

  function calcRoom(): void {
    const area = parseFloat(roomArea.value) || 0;
    const ceiling = parseFloat(roomCeiling.value) || 8;
    const ach = parseFloat(roomType.value) || 5;
    const vol = area * ceiling;
    const cfm = (vol * ach) / 60;
    roomCfm.textContent = fmt(cfm);
    roomVol.textContent = area > 0 ? fmt(vol) + " cu ft" : "—";
    roomPerSqft.textContent =
      area > 0 ? Math.round((cfm / area) * 100) / 100 + " CFM" : "—";
  }

  function calcSystem(): void {
    const tons = parseFloat(sysTons.value) || 3;
    const perTon = parseFloat(sysClimate.value) || 400;
    sysCfm.textContent = fmt(tons * perTon);
    sysNote.textContent = `${tons} tons × ${perTon} CFM/ton`;
  }

  roomArea.addEventListener("input", () => {
    roomRange.value = roomArea.value;
    calcRoom();
  });
  roomRange.addEventListener("input", () => {
    roomArea.value = roomRange.value;
    calcRoom();
  });
  roomCeiling.addEventListener("input", calcRoom);
  roomType.addEventListener("input", calcRoom);
  sysTons.addEventListener("input", calcSystem);
  sysClimate.addEventListener("input", calcSystem);

  calcRoom();
  calcSystem();
}
