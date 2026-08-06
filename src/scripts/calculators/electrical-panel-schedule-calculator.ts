import { panelCapacity } from "@/lib/nec";

/**
 * Panel spaces, poles, and tandem breakers.
 *
 * Three numbers get confused constantly and this tool keeps them apart:
 *
 *  - **Spaces** are physical mounting positions on the busbar.
 *  - **Poles (devices)** are overcurrent devices. A tandem puts two in one space.
 *  - **The device limit** is the number the panel is listed for, printed on its
 *    label. NEC 408.54 makes exceeding it a violation, and it is a listing
 *    figure — nothing in the code derives it.
 *
 * A "30-space, 40-circuit" load centre means 30 spaces, 40 devices maximum, and
 * therefore ten of those spaces will accept a tandem. Class CTL panelboards
 * enforce that physically, with rejection features so a tandem will only seat in
 * a slot rated for one.
 */
export function initElectricalPanelScheduleCalculator(): void {
  const spaces = document.getElementById("ps-spaces") as HTMLInputElement | null;
  const maxDevices = document.getElementById("ps-max-devices") as HTMLInputElement | null;
  const tandemSlots = document.getElementById("ps-tandem-slots") as HTMLInputElement | null;
  const fullSize = document.getElementById("ps-full-size") as HTMLInputElement | null;
  const tandems = document.getElementById("ps-tandems") as HTMLInputElement | null;
  const wanted = document.getElementById("ps-wanted") as HTMLInputElement | null;
  const resetBtn = document.getElementById("ps-reset");

  const out = {
    verdict: document.getElementById("ps-verdict"),
    available: document.getElementById("ps-available"),
    spacesFree: document.getElementById("ps-spaces-free"),
    devicesUsed: document.getElementById("ps-devices-used"),
    maxPoles: document.getElementById("ps-max-poles"),
    note: document.getElementById("ps-note"),
    bdSpaces: document.getElementById("ps-bd-spaces"),
    bdDevices: document.getElementById("ps-bd-devices"),
    bdCeiling: document.getElementById("ps-bd-ceiling"),
    bdAvailable: document.getElementById("ps-bd-available"),
    bdWanted: document.getElementById("ps-bd-wanted"),
  };

  if (!spaces || !maxDevices || !tandemSlots || !fullSize || !tandems || !wanted) return;
  if (Object.values(out).some((el) => !el)) return;

  function calculate(): void {
    const spaceCount = Math.max(1, Math.floor(parseFloat(spaces!.value) || 0));
    const deviceLimit = Math.max(1, Math.floor(parseFloat(maxDevices!.value) || 0));
    const tandemCapable = Math.max(0, Math.floor(parseFloat(tandemSlots!.value) || 0));
    const fullSizeUsed = Math.max(0, Math.floor(parseFloat(fullSize!.value) || 0));
    const tandemsUsed = Math.max(0, Math.floor(parseFloat(tandems!.value) || 0));
    const polesWanted = Math.max(0, Math.floor(parseFloat(wanted!.value) || 0));

    const r = panelCapacity({
      spaces: spaceCount,
      tandemSlots: tandemCapable,
      maxDevices: deviceLimit,
      fullSizeUsed,
      tandemsUsed,
    });

    out.available!.textContent = String(r.additionalPolesAvailable);
    out.spacesFree!.textContent = String(r.spacesFree);
    out.devicesUsed!.textContent = `${r.devicesUsed} / ${deviceLimit}`;
    out.maxPoles!.textContent = String(r.maxPolesWithTandems);

    const fits = polesWanted <= r.additionalPolesAvailable;

    if (r.overDeviceLimit) {
      out.verdict!.textContent = "Over the limit";
      out.verdict!.className = "text-4xl sm:text-5xl font-extrabold tracking-tight text-red-600";
      out.note!.textContent = `${r.devicesUsed} devices in a panel listed for ${deviceLimit} is a 408.54 violation as it stands, before adding anything. A subpanel is the fix — not more tandems.`;
    } else if (r.overTandemLimit) {
      out.verdict!.textContent = "Illegal tandems";
      out.verdict!.className = "text-4xl sm:text-5xl font-extrabold tracking-tight text-red-600";
      out.note!.textContent = `${tandemsUsed} tandems in a panel that accepts ${tandemCapable} means some are in slots not listed for them. On a Class CTL panel they physically should not seat — if they did, someone filed the rejection tab off, which is a genuine hazard and an instant inspection failure.`;
    } else if (fits) {
      out.verdict!.textContent = "Room available";
      out.verdict!.className = "text-4xl sm:text-5xl font-extrabold tracking-tight text-emerald-600";
      out.note!.textContent =
        r.spacesFree >= polesWanted
          ? `${r.spacesFree} empty spaces will take the ${polesWanted} pole${
              polesWanted === 1 ? "" : "s"
            } directly, with no tandems needed.`
          : `Room exists but only by using tandems — ${r.spacesFree} space${
              r.spacesFree === 1 ? "" : "s"
            } free for ${polesWanted} poles. Check the panel label for which specific slots accept a tandem before planning on it.`;
    } else {
      out.verdict!.textContent = "Panel is full";
      out.verdict!.className = "text-4xl sm:text-5xl font-extrabold tracking-tight text-red-600";
      out.note!.textContent = `${polesWanted} pole${
        polesWanted === 1 ? "" : "s"
      } wanted, ${r.additionalPolesAvailable} available. A subpanel is almost always cheaper than a service upgrade — and a full panel says nothing about whether the service has spare capacity. Those are separate questions.`;
    }

    out.bdSpaces!.textContent = `${r.spacesUsed} of ${spaceCount} used, ${r.spacesFree} free`;
    out.bdDevices!.textContent = `${fullSizeUsed} full-size + ${tandemsUsed} tandem × 2 = ${r.devicesUsed} poles`;
    out.bdCeiling!.textContent = `min(${deviceLimit} listed, ${spaceCount} spaces + ${Math.min(
      tandemCapable,
      spaceCount,
    )} tandem gain) = ${r.maxPolesWithTandems} poles`;
    out.bdAvailable!.textContent = `${r.maxPolesWithTandems} − ${r.devicesUsed} = ${r.additionalPolesAvailable} poles`;
    out.bdWanted!.textContent = fits
      ? `${polesWanted} wanted ≤ ${r.additionalPolesAvailable} available — fits`
      : `${polesWanted} wanted > ${r.additionalPolesAvailable} available — does not fit`;
  }

  [spaces, maxDevices, tandemSlots, fullSize, tandems, wanted].forEach((el) =>
    el.addEventListener("input", calculate),
  );

  resetBtn?.addEventListener("click", () => {
    spaces.value = "30";
    maxDevices.value = "40";
    tandemSlots.value = "10";
    fullSize.value = "24";
    tandems.value = "3";
    wanted.value = "2";
    calculate();
  });

  calculate();
}
