import { UNIT_CATEGORIES, convertUnit, fmt, type UnitCategory } from "@/lib/plumbing";

/** Enough significant figures to be useful without pretending to precision. */
function smart(n: number): string {
  if (!Number.isFinite(n)) return "—";
  const abs = Math.abs(n);
  if (abs === 0) return "0";
  if (abs >= 1000) return fmt(n, 1);
  if (abs >= 10) return fmt(n, 3);
  if (abs >= 1) return fmt(n, 4);
  return fmt(n, 6);
}

export function initPlumbingUnitConverter(): void {
  const category = document.getElementById("uc-category") as HTMLSelectElement | null;
  const from = document.getElementById("uc-from") as HTMLSelectElement | null;
  const to = document.getElementById("uc-to") as HTMLSelectElement | null;
  const value = document.getElementById("uc-value") as HTMLInputElement | null;
  const swapBtn = document.getElementById("uc-swap");
  const resetBtn = document.getElementById("uc-reset");

  const out = {
    result: document.getElementById("uc-result"),
    note: document.getElementById("uc-result-note"),
    reverse: document.getElementById("uc-reverse"),
    factor: document.getElementById("uc-factor"),
    table: document.getElementById("uc-all"),
  };

  if (
    !category ||
    !from ||
    !to ||
    !value ||
    !out.result ||
    !out.note ||
    !out.reverse ||
    !out.factor ||
    !out.table
  ) {
    return;
  }

  function currentCategory() {
    return (
      UNIT_CATEGORIES.find((c) => c.key === (category!.value as UnitCategory)) ??
      UNIT_CATEGORIES[0]
    );
  }

  function fillUnits(preserveKeys = false): void {
    const cat = currentCategory();
    const prevFrom = from!.value;
    const prevTo = to!.value;
    for (const select of [from!, to!]) {
      select.innerHTML = "";
      cat.units.forEach((u) => {
        const option = document.createElement("option");
        option.value = u.key;
        option.textContent = u.label;
        select.appendChild(option);
      });
    }
    const keys = cat.units.map((u) => u.key);
    from!.value = preserveKeys && keys.includes(prevFrom) ? prevFrom : keys[0];
    to!.value = preserveKeys && keys.includes(prevTo) ? prevTo : keys[1] ?? keys[0];
  }

  function calculate(): void {
    const cat = currentCategory();
    const v = parseFloat(value!.value);
    if (!Number.isFinite(v)) {
      out.result!.textContent = "—";
      out.note!.textContent = "Enter a value to convert.";
      return;
    }

    const converted = convertUnit(cat.key, from!.value, to!.value, v);
    const fromLabel = cat.units.find((u) => u.key === from!.value)?.label ?? from!.value;
    const toLabel = cat.units.find((u) => u.key === to!.value)?.label ?? to!.value;

    out.result!.textContent = smart(converted);
    out.note!.textContent = `${smart(v)} ${fromLabel} = ${smart(converted)} ${toLabel}`;
    out.reverse!.textContent = `1 ${toLabel} = ${smart(convertUnit(cat.key, to!.value, from!.value, 1))} ${fromLabel}`;
    out.factor!.textContent =
      cat.key === "temperature"
        ? "temperature is offset-based, so there is no single multiplier"
        : `× ${smart(convertUnit(cat.key, from!.value, to!.value, 1))}`;

    // Everything in the category at once — usually the reason someone opened this.
    out.table!.innerHTML = "";
    cat.units.forEach((u) => {
      const row = document.createElement("div");
      row.className = "flex justify-between gap-3 py-1.5 border-b border-slate-100 last:border-0";
      const name = document.createElement("span");
      name.className = "text-slate-600";
      name.textContent = u.label;
      const amount = document.createElement("span");
      amount.className = "font-semibold text-slate-900 tabular-nums";
      amount.textContent = smart(convertUnit(cat.key, from!.value, u.key, v));
      row.append(name, amount);
      out.table!.appendChild(row);
    });
  }

  category.addEventListener("change", () => {
    fillUnits(false);
    calculate();
  });
  [from, to].forEach((el) => el.addEventListener("change", calculate));
  value.addEventListener("input", calculate);

  swapBtn?.addEventListener("click", () => {
    const a = from.value;
    from.value = to.value;
    to.value = a;
    calculate();
  });

  resetBtn?.addEventListener("click", () => {
    category.value = "flow";
    fillUnits(false);
    from.value = "gpm";
    to.value = "lpm";
    value.value = "10";
    calculate();
  });

  fillUnits(true);
  if (!from.value) from.value = "gpm";
  if (!to.value) to.value = "lpm";
  calculate();
}
