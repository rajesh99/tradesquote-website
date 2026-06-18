# Category Brief — HVAC Wave 2 (Diagnostic & Charge Tools)

> Second wave of HVAC calculators: field diagnostics (Delta T, static pressure) and refrigerant charge tools, plus HSPF savings. Wave 1 (12 sizing/cost tools) is complete. These six pages extend the hub to 18 tools.

---

## 1. Category

| Field | Value | Notes |
| --- | --- | --- |
| `name` | `HVAC` | Display name (existing category) |
| `slug` | `hvac` | URL segment + config prefix |
| `accent` | `blue` | Category-card accent |
| `one_liner` | `Sizing, airflow, diagnostics, efficiency, and cost — eighteen free tools.` | Updated hub meta |
| `hero_intro` | Wave 2 adds technician field-check tools: temperature split, static pressure, superheat/subcooling, and heat-pump HSPF savings. |
| `order_hint` | For diagnostics: Delta T → Static Pressure → Superheat/Subcooling. For charge on fixed orifice: Target Superheat → Superheat. |

## 2. Authorities to cite

- U.S. DOE / ENERGY STAR — HVAC Quality Installation (airflow & charge verification)
- ACCA Manual D — duct design and static pressure limits
- HVAC School — Delta T, superheat, subcooling field guidance
- AHRI / manufacturer charging charts — TXV and fixed-orifice targets
- U.S. EIA — electricity rates for HSPF savings defaults

---

## 3. Calculators

### Calculator: `hvac-delta-t-calculator`

| Field | Value |
| --- | --- |
| `title` | `Delta T Calculator` |
| `accent` | `violet` |
| `search_question` | `What is a good Delta T for an AC?` |
| `type` | `sizing` |
| `card_description` | Check AC temperature split or furnace temperature rise and what a high or low reading means. |

**Formula:** cooling ΔT = return − supply (16–22°F healthy); heating rise = supply − return (40–70°F nameplate).

**Inputs:** dt-mode · dt-return · dt-supply · dt-rh (cooling only)

**Defaults must compute to:** 75°F return, 56°F supply → 19°F Healthy

**CTA headline:** Diagnosed the system? Quote the fix in seconds.

---

### Calculator: `hvac-static-pressure-calculator`

| Field | Value |
| --- | --- |
| `title` | `Static Pressure Calculator` |
| `accent` | `red` |
| `search_question` | `What should total static pressure be?` |
| `type` | `sizing` |
| `card_description` | Add supply and return static pressure to get TESP and compare to equipment max. |

**Formula:** TESP = supply static + return static (return as positive magnitude in in. w.c.)

**Inputs:** sp-supply · sp-return · sp-max (nameplate max, default 0.5)

**Defaults must compute to:** 0.25 + 0.20 = 0.45 in. w.c. → Healthy (under 0.5 max)

**Sources:** ACCA Manual D · ENERGY STAR QI · manufacturer nameplate TESP

**CTA headline:** Found the restriction? Quote the duct fix in seconds.

---

### Calculator: `hvac-superheat-calculator`

| Field | Value |
| --- | --- |
| `title` | `Superheat Calculator` |
| `accent` | `orange` |
| `search_question` | `What should superheat be on my AC?` |
| `type` | `sizing` |
| `card_description` | Measured superheat from suction line and saturation temps, with TXV and piston guidance. |

**Formula:** superheat = suction line temp − saturation temp at suction pressure

**Inputs:** sh-sat · sh-suction · sh-meter (TXV vs fixed orifice)

**Defaults must compute to:** 45°F sat, 55°F suction → 10°F → Healthy (TXV target 8–12°F)

**Sources:** HVAC School · manufacturer TXV/piston charging charts

**CTA headline:** Charge verified? Quote the service call in seconds.

---

### Calculator: `hvac-subcooling-calculator`

| Field | Value |
| --- | --- |
| `title` | `Subcooling Calculator` |
| `accent` | `sky` |
| `search_question` | `What should subcooling be on my AC?` |
| `type` | `sizing` |
| `card_description` | Measured subcooling from liquid saturation and liquid line temps, with TXV targets. |

**Formula:** subcooling = liquid line saturation temp − liquid line temp

**Inputs:** sc-sat · sc-liquid · sc-meter (TXV vs piston)

**Defaults must compute to:** 95°F sat, 88°F liquid → 7°F → Low-normal (TXV target 8–12°F)

**Sources:** HVAC School · manufacturer subcooling charts

**CTA headline:** Liquid side looks off? Quote the repair in seconds.

---

### Calculator: `hvac-target-superheat-calculator`

| Field | Value |
| --- | --- |
| `title` | `Target Superheat Calculator` |
| `accent` | `amber` |
| `search_question` | `What is the target superheat for a piston meter?` |
| `type` | `sizing` |
| `card_description` | Target superheat for fixed-orifice systems from indoor wet-bulb and outdoor dry-bulb. |

**Formula:** target SH = ((3 × indoor WB) − 80 − outdoor DB) ÷ 2, clamped 5–25°F

**Inputs:** tsh-wb · tsh-db

**Defaults must compute to:** WB 62°F, DB 85°F → 10.5°F

**Sources:** Carrier/Trane charging chart approximation · HVAC School

**CTA headline:** Know the target? Quote the tune-up in seconds.

---

### Calculator: `hvac-hspf-savings-calculator`

| Field | Value |
| --- | --- |
| `title` | `HSPF Savings Calculator` |
| `accent` | `indigo` |
| `search_question` | `Is HSPF 10 worth it over HSPF 8?` |
| `type` | `comparison/cost` |
| `card_description` | Compare two HSPF ratings for heat pump heating — annual cost and 15-year savings. |

**Formula:** kWh = (tons × 12,000 × heating hrs) ÷ (HSPF × 1,000); % saved = 1 − (old HSPF ÷ new HSPF)

**Inputs:** hspf-old · hspf-new · hspf-tons · hspf-hours · hspf-rate

**Defaults must compute to:** HSPF 8→10, 3 tons, 1,500 hrs, $0.17/kWh → ~$230/yr saved

**Sources:** U.S. DOE heat pump efficiency · U.S. EIA electricity rates

**CTA headline:** Selling the heat pump upgrade? Quote it in seconds.
