# Category Brief — HVAC Wave 3 (Psychrometrics & Airflow Depth)

> Third wave: dew point/RH, sensible & latent heat (SHR), and fan affinity laws. Extends the hub from 18 to 21 tools.

---

## 1. Category

| Field | Value |
| --- | --- |
| `name` | `HVAC` |
| `slug` | `hvac` |
| `one_liner` | `Sizing, airflow, diagnostics, psychrometrics, efficiency, and cost — twenty-one free tools.` |

## 2. Authorities to cite

- ASHRAE Fundamentals — psychrometric properties, sensible/latent heat equations
- ACCA Manual D — blower performance and fan laws
- HVAC School / FieldPad — field-reference implementations

---

## 3. Calculators

### Calculator: `hvac-dew-point-calculator`

| Field | Value |
| --- | --- |
| `title` | `Dew Point Calculator` |
| `accent` | `cyan` |
| `search_question` | `What is the dew point at 75°F and 55% RH?` |
| `type` | `sizing` |

**Formula:** Magnus approximation — α = ln(RH/100) + (17.62×Tc)/(243.12+Tc); dew point °C = (243.12×α)/(17.62−α); convert to °F. Inverse: solve RH from DB + dew point.

**Inputs:** dp-mode · dp-drybulb · dp-rh · dp-dewpoint · dp-surface (optional condensation check)

**Defaults must compute to:** 75°F DB, 55% RH → ~58°F dew point

**Related:** delta-t, cfm, sensible-latent-heat, target-superheat

**CTA headline:** Know the moisture load? Quote the job in seconds.

---

### Calculator: `hvac-sensible-latent-heat-calculator`

| Field | Value |
| --- | --- |
| `title` | `Sensible & Latent Heat Calculator` |
| `accent` | `emerald` |
| `search_question` | `How much latent heat is my coil removing?` |
| `type` | `sizing` |

**Formula:** Qs = 1.08 × CFM × ΔT; Ql = 0.68 × CFM × Δgrains; Qt = Qs + Ql; SHR = Qs/Qt

**Inputs:** sl-cfm · sl-return-t · sl-supply-t · sl-return-grains · sl-supply-grains

**Defaults must compute to:** 1,200 CFM, 75→55°F, 110→75 grains → Qs≈25,920 · Ql≈28,560 · SHR≈0.48

**Related:** cfm, dew-point, delta-t, btu

**CTA headline:** Split the load? Quote the equipment in seconds.

---

### Calculator: `hvac-fan-laws-calculator`

| Field | Value |
| --- | --- |
| `title` | `Fan Laws Calculator` |
| `accent` | `blue` |
| `search_question` | `What happens to CFM if I slow the blower 10%?` |
| `type` | `sizing` |

**Formula:** CFM₂/CFM₁ = N₂/N₁; SP₂/SP₁ = (N₂/N₁)²; BHP₂/BHP₁ = (N₂/N₁)³

**Inputs:** fl-cfm1 · fl-sp1 · fl-bhp1 · fl-rpm1 · fl-rpm2

**Defaults must compute to:** 1,200 CFM, 0.50 SP, 0.75 BHP, 1,200→1,080 RPM → 1,080 CFM · 0.405 SP · 0.547 BHP

**Related:** static-pressure, cfm, duct-size, delta-t

**CTA headline:** Sized the blower change? Quote the repair in seconds.
