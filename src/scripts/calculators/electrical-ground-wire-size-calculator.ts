import {
  TABLE_250_122,
  cmilOf,
  egcSize,
  gecSize,
  CONDUCTOR_SIZES,
  sizeLabel,
  fmt,
  type ConductorMaterial,
  type ElectrodeType,
} from "@/lib/nec";

export function initElectricalGroundWireSizeCalculator(): void {
  const mode = document.getElementById("gw-mode") as HTMLSelectElement | null;
  const ocpd = document.getElementById("gw-ocpd") as HTMLSelectElement | null;
  const material = document.getElementById("gw-material") as HTMLSelectElement | null;
  const service = document.getElementById("gw-service") as HTMLSelectElement | null;
  const serviceMaterial = document.getElementById("gw-service-material") as HTMLSelectElement | null;
  const electrode = document.getElementById("gw-electrode") as HTMLSelectElement | null;
  const upsized = document.getElementById("gw-upsized") as HTMLSelectElement | null;
  const upsizedFrom = document.getElementById("gw-upsized-from") as HTMLSelectElement | null;
  const upsizedTo = document.getElementById("gw-upsized-to") as HTMLSelectElement | null;
  const egcFields = document.getElementById("gw-egc-fields");
  const gecFields = document.getElementById("gw-gec-fields");
  const upsizeFields = document.getElementById("gw-upsize-fields");
  const resetBtn = document.getElementById("gw-reset");

  const out = {
    size: document.getElementById("gw-size"),
    table: document.getElementById("gw-table"),
    exception: document.getElementById("gw-exception"),
    note: document.getElementById("gw-note"),
    bdMode: document.getElementById("gw-bd-mode"),
    bdInput: document.getElementById("gw-bd-input"),
    bdTableSize: document.getElementById("gw-bd-table-size"),
    bdException: document.getElementById("gw-bd-exception"),
    bdUpsize: document.getElementById("gw-bd-upsize"),
    bdFinal: document.getElementById("gw-bd-final"),
  };

  if (
    !mode ||
    !ocpd ||
    !material ||
    !service ||
    !serviceMaterial ||
    !electrode ||
    !upsized ||
    !upsizedFrom ||
    !upsizedTo ||
    !egcFields ||
    !gecFields ||
    !upsizeFields ||
    !out.size ||
    !out.table ||
    !out.exception ||
    !out.note ||
    !out.bdMode ||
    !out.bdInput ||
    !out.bdTableSize ||
    !out.bdException ||
    !out.bdUpsize ||
    !out.bdFinal
  ) {
    return;
  }

  /** Smallest listed size whose circular mils meet or exceed `cmil`. */
  function sizeForCmil(cmil: number): string {
    return (CONDUCTOR_SIZES.find((s) => s.cmil >= cmil) ?? CONDUCTOR_SIZES[CONDUCTOR_SIZES.length - 1]).label;
  }

  function calculate(): void {
    const isEgc = mode!.value === "EGC";
    const mat = material!.value as ConductorMaterial;

    egcFields!.classList.toggle("hidden", !isEgc);
    upsizeFields!.classList.toggle("hidden", !isEgc);
    gecFields!.classList.toggle("hidden", isEgc);

    if (isEgc) {
      const rating = parseInt(ocpd!.value) || 20;
      const base = egcSize(rating, mat);
      const row = TABLE_250_122.find((r) => rating <= r.maxOcpd) ?? TABLE_250_122[TABLE_250_122.length - 1];

      let final = base;
      let upsizeNote = "Not applicable";

      if (upsized!.value === "yes") {
        // NEC 250.122(B) — upsize the EGC proportionally to the increase in
        // ungrounded-conductor circular mils.
        const fromCmil = cmilOf(upsizedFrom!.value);
        const toCmil = cmilOf(upsizedTo!.value);
        if (fromCmil > 0 && toCmil > fromCmil) {
          const ratio = toCmil / fromCmil;
          const requiredCmil = cmilOf(base) * ratio;
          final = sizeForCmil(requiredCmil);
          upsizeNote = `× ${fmt(ratio, 2)} → ${Math.round(requiredCmil).toLocaleString("en-US")} cmil → ${sizeLabel(final)}`;
        } else {
          upsizeNote = "No increase — ratio is 1.00";
        }
      }

      out.size!.textContent = `${sizeLabel(final)} ${mat}`;
      out.table!.textContent = "Table 250.122";
      out.exception!.textContent = "—";
      out.note!.textContent =
        final === base
          ? `A ${rating} A overcurrent device requires a ${sizeLabel(base)} ${mat} equipment grounding conductor.`
          : `Upsized ungrounded conductors force the EGC up from ${sizeLabel(base)} to ${sizeLabel(final)} per 250.122(B).`;

      out.bdMode!.textContent = "Equipment grounding conductor (EGC)";
      out.bdInput!.textContent = `${rating} A overcurrent device`;
      out.bdTableSize!.textContent = `${sizeLabel(base)} copper / ${sizeLabel(row.aluminum)} aluminum`;
      out.bdException!.textContent = "Table 250.122 has no electrode exceptions";
      out.bdUpsize!.textContent = upsizeNote;
      out.bdFinal!.textContent = `${sizeLabel(final)} ${mat}`;
      return;
    }

    const serviceLabel = service!.value;
    const serviceMat = serviceMaterial!.value as ConductorMaterial;
    const serviceCmil = cmilOf(serviceLabel);
    const electrodeType = electrode!.value as ElectrodeType;
    const result = gecSize(serviceCmil, serviceMat, mat, electrodeType);

    out.size!.textContent = `${sizeLabel(result.size)} ${mat}`;
    out.table!.textContent = "Table 250.66";
    out.exception!.textContent = result.cappedBy ?? "None applies";
    out.note!.textContent = result.cappedBy
      ? `Table 250.66 calls for ${sizeLabel(result.tableSize)}, but ${result.cappedBy} caps a conductor run to this electrode at ${sizeLabel(result.size)}.`
      : `A ${sizeLabel(serviceLabel)} ${serviceMat} service conductor requires a ${sizeLabel(result.size)} ${mat} grounding electrode conductor.`;

    out.bdMode!.textContent = "Grounding electrode conductor (GEC)";
    out.bdInput!.textContent = `${sizeLabel(serviceLabel)} ${serviceMat} (${serviceCmil.toLocaleString("en-US")} cmil)`;
    out.bdTableSize!.textContent = sizeLabel(result.tableSize);
    out.bdException!.textContent = result.cappedBy
      ? `${result.cappedBy} caps at ${sizeLabel(result.size)}`
      : "No cap applies to this electrode";
    out.bdUpsize!.textContent = "250.122(B) applies to EGCs, not GECs";
    out.bdFinal!.textContent = `${sizeLabel(result.size)} ${mat}`;
  }

  [mode, ocpd, material, service, serviceMaterial, electrode, upsized, upsizedFrom, upsizedTo].forEach((el) =>
    el.addEventListener("change", calculate),
  );

  resetBtn?.addEventListener("click", () => {
    mode.value = "EGC";
    ocpd.value = "200";
    material.value = "copper";
    service.value = "3/0";
    serviceMaterial.value = "copper";
    electrode.value = "concrete-encased";
    upsized.value = "no";
    upsizedFrom.value = "12";
    upsizedTo.value = "8";
    calculate();
  });

  calculate();
}
