# Category Brief — HVAC Wave 4 (Ventilation, Humidity, Charge & Units)

> Fourth wave: ASHRAE ventilation, humidity control sizing, refrigerant line-set add-on charge, and field unit converter. Extends the hub from 21 to 25 tools.

---

## 1. Category

| Field | Value |
| --- | --- |
| `name` | `HVAC` |
| `slug` | `hvac` |
| `one_liner` | `Sizing, airflow, diagnostics, psychrometrics, ventilation, efficiency, and cost — twenty-five free tools.` |

## 2. Authorities to cite

- ASHRAE 62.1 — commercial ventilation rates
- ASHRAE 62.2 — residential whole-building ventilation
- ASHRAE Fundamentals — latent heat and psychrometric properties
- AHRI — dehumidifier/humidifier and refrigerant charging guidance
- Carrier/Trane — line-set charging tables

---

## 3. Calculators

### Calculator: `hvac-ventilation-calculator`

| Field | Value |
| --- | --- |
| `title` | `Ventilation Calculator` |
| `accent` | `teal` |
| `search_question` | `How much ventilation CFM does my home need?` |
| `type` | `sizing` |
| `card_description` | Whole-building ventilation CFM from ASHRAE 62.2 residential or 62.1 commercial rates. |

**Formula:** Residential: CFM = 0.03 × floor_area + 7.5 × (bedrooms + 1). Commercial: CFM = occupants × cfm/person + area × cfm/sqft.

**Inputs:** vent-mode · vent-area · vent-bedrooms · vent-occupants · vent-cfm-person · vent-cfm-sqft

**Defaults must compute to:** Residential 2,000 sq ft, 3 bed → 90 CFM. Commercial 10 occ @ 17.5, 1,500 sq ft @ 0.06 → 265 CFM.

**Related:** cfm, dew-point, sensible-latent-heat, duct-size

**CTA headline:** Ventilation CFM set? Quote the ERV or duct job in seconds.

---

### Calculator: `hvac-humidity-control-calculator`

| Field | Value |
| --- | --- |
| `title` | `Humidity Control Calculator` |
| `accent` | `rose` |
| `search_question` | `What size dehumidifier do I need?` |
| `type` | `sizing` |
| `card_description` | Size humidifier or dehumidifier capacity from indoor RH targets and airflow. |

**Formula:** CFM = volume × ACH ÷ 60; grains from Magnus; Ql = 0.68 × CFM × Δgrains; pints/day = Ql × 24 ÷ 12,000; gal/day = pints ÷ 8.

**Inputs:** hc-mode · hc-area · hc-ceiling · hc-ach · hc-db · hc-rh-current · hc-rh-target

**Defaults must compute to:** Dehumidify: 2,000 sq ft × 8 ft, 5 ACH, 75°F, 65→50% RH → ~28 pints/day.

**Related:** dew-point, sensible-latent-heat, cfm, delta-t

**CTA headline:** Sized the moisture fix? Quote the humidifier or dehumidifier job in seconds.

---

### Calculator: `hvac-refrigerant-charge-calculator`

| Field | Value |
| --- | --- |
| `title` | `Refrigerant Charge Calculator` |
| `accent` | `orange` |
| `search_question` | `How much refrigerant do I add for extra line set?` |
| `type` | `sizing` |
| `card_description` | Line-set add-on refrigerant charge beyond factory allowance by diameter and length. |

**Formula:** extra_length = max(0, total − included); add_on_oz = extra_length × oz_per_foot.

**Inputs:** rc-refrigerant · rc-lineset · rc-length · rc-included

**Defaults must compute to:** R-410A 3/8+3/4, 50 ft total, 15 ft included → 34 oz.

**Related:** superheat, subcooling, target-superheat, delta-t

**CTA headline:** Charge calculated? Quote the install or service call in seconds.

---

### Calculator: `hvac-unit-converter`

| Field | Value |
| --- | --- |
| `title` | `HVAC Unit Converter` |
| `accent` | `sky` |
| `search_question` | `How many BTU is 3 tons?` |
| `type` | `sizing` |
| `card_description` | Convert HVAC units — tons, BTU/h, kW, °F/°C, in. w.c./Pa, PSI/kPa. |

**Formula:** BTU/h = tons × 12,000; kW = BTU/h ÷ 3,412; °C = (°F−32)×5/9; Pa = in.w.c.×249; kPa = PSI×6.895.

**Inputs:** uc-mode · uc-value · uc-direction

**Defaults must compute to:** Capacity 3 tons → 36,000 BTU/h · 10.6 kW.

**Related:** tonnage, btu, static-pressure, cfm

**CTA headline:** Units converted? Quote the equipment job in seconds.
