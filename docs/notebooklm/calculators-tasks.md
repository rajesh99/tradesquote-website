# Technical Architecture and AI Agent Orchestration Plan for HVAC Calculator Directory

## 1. Strategic Objective and Directory Design
To establish dominant topical authority in the HVAC sector, the architectural strategy must shift from top-of-funnel informational blogging to a validated, high-utility programmatic directory. Interactive calculators serve as primary search engine optimization (SEO) anchors, effectively capturing high-intent queries from field technicians, mechanical engineers, and building planners. 

The goal of this AI orchestration plan is to build and enrich a semantic network of calculator pages based on recognized industry standards (ASHRAE, ACCA, and I=B=R), moving away from generic rules-of-thumb and keyword targeting.

## 2. Technical AI Agent Instructions and Engineering Rules of Engagement
To elevate these calculator pages into authoritative engineering tools, the AI editor and generator agents must strictly adhere to the following programmatic rules, formatting constraints, and semantic requirements.

### Phase 1: Programmatic Code Constraints
*   **Zero External Library Dependencies:** All input parsing, calculation math, unit conversions, and DOM interactions must be executed using client-side vanilla JavaScript to maximize page load speeds.
*   **Dual-Unit Execution:** Calculators must feature a responsive metric-imperial toggle. Conversions must use exact physical constants (e.g., $1 \ \text{inch} = 25.4 \ \text{mm}$; $1 \ \text{boiler horsepower} = 33,475 \ \text{BTU/hr}$).
*   **Real-Time DOM Updates:** Scripts must listen to input and change events on form fields, triggering immediate recalculations.
*   **Calculated Values Validation:** Input validators must prevent unrealistic values. If a threshold is crossed, the script must disable the output display, highlight the field, and render an inline error message.

### Phase 2: Mandatory Semantic Elements
*   **Validation Narrative:** The AI must generate technical prose explaining the physics behind the calculation (e.g., explaining how latent heat increases required cooling coil capacity) alongside the interactive widget.
*   **Referenced Standards:** The text must explicitly reference relevant codes (e.g., ACCA Manual J, S, D; ASHRAE Standard 62.1 and 62.2) to establish authority.
*   **Worked Technical Examples:** Include a step-by-step worked example calculation using standard units for user verification.
*   **Code-Injected JSON-LD Schema:** Programmatically output a standard JSON-LD schema block containing both `SoftwareApplication` and `FAQPage` markup to capture rich search results.

### Phase 3: Document Formatting Rules
1. Begin the document directly with a Level 1 Markdown heading: `# Page Title`.
2. Subsequent headings must be plain text without bolding or italics: `## Heading Text`.
3. Use LaTeX formatting strictly for all mathematical equations:
   * Inline math: `$formula$`.
   * Block equations: `$$formula$$`.
4. Write exclusively in the third person (avoid "I", "we", "our", "you").
5. Present qualitative reasoning in continuous narrative prose (avoid bulleted paragraphs except in data tables or variable lists).

---

## 3. Required Information and Sizing Constraints for Calculator Pages
To ensure the AI editor can fill in missing gaps for both existing and new calculator pages, the following mathematical models, SEO intents, and validation warnings must be injected into the respective nodes.

### 3.1 Combustion Efficiency Calculator
*   **Target SEO Keyword Intent:** Combustion efficiency Siegert formula, boiler stack loss calculator, flue gas loss calculator, boiler dry oxygen combustion.
*   **Input Variables:** Flue Gas Temperature ($t_{FG}$) range $50\text{--}600^\circ\text{C}$; Reference Combustion Air Temperature ($t_A$) range $0\text{--}50^\circ\text{C}$; Measured Flue Oxygen ($O_{2,wet}$ or $O_{2,dry}$) range $0\text{--}20.9\%$.
*   **Mathematical Models to Inject:**
    *   *Sensible Stack Gas Heat Loss:* $$q_A = (t_{FG} - t_A) \times \left( \frac{f}{21 - O_{2,dry}} \right) \quad [\%]$$.
    *   *Net Efficiency:* $$\eta_{\text{combustion}} = 100\% - q_A - L_{\text{latent}} - L_{\text{radiation}}$$ (where $L_{\text{radiation}}$ is fixed at $1.5\%$).
*   **System Warnings:**
    *   If measured oxygen $\le 1.5\%$, trigger: *"Danger: Insufficient excess combustion air. Risk of high carbon monoxide concentration and soot accumulation."*.
    *   If net stack temperature > $250^\circ\text{C}$, trigger: *"Thermal performance loss: Elevated exhaust temperatures indicate fouling on heat transfer surfaces or poor baffling."*.

### 3.2 HRV and ERV Effectiveness Calculator
*   **Target SEO Keyword Intent:** HRV ERV effectiveness formula, energy recovery wheel efficiency calculator, sensible latent air-to-air energy recovery, ASHRAE 84 ventilation recovery.
*   **Mathematical Models to Inject:**
    *   *Sensible Heat Recovery Effectiveness:* $$\varepsilon_s = \frac{V_s \times (t_1 - t_2)}{V_{min} \times (t_1 - t_3)} \times 100 \quad [\%]$$.
    *   *Total Recovered Energy:* $$Q_{total} = \varepsilon_t \times 4.5 \times V_{min} \times (h_1 - h_3)$$.
*   **System Warnings:**
    *   If the unbalanced flow ratio $R = \frac{|V_s - V_e|}{\max(V_s, V_e)}$ exceeds $0.10$, display: *"Unbalanced flow rate: Volumetric supply and exhaust imbalance exceeds 10%. This will distort apparent thermal effectiveness and risk building pressure issues."*.
    *   If sensible effectiveness > $95\%$, trigger: *"Thermodynamic limit error: Sensible heat exchanger effectiveness cannot exceed 95% under practical conditions."*.

### 3.3 Manual D Duct Friction Rate Calculator
*   **Target SEO Keyword Intent:** Manual D friction rate calculator, available static pressure duct design, duct friction rate formula, total effective length TEL duct.
*   **Mathematical Models to Inject:**
    *   *Available Static Pressure (ASP):* $$\text{ASP} = \text{ESP} - \text{CPL} \quad [\text{iwc}]$$.
    *   *Total Effective Length (TEL):* $$\text{TEL} = L_{\text{straight}} + \sum L_{\text{fittings\_equivalent}} \quad [\text{ft}]$$.
    *   *Friction Rate Sizing:* $$FR = \frac{\text{ASP} \times 100}{\text{TEL}} \quad [\text{iwc/100'}]$$.
*   **System Warnings:**
    *   If $FR > 0.18 \ \text{iwc/100'}$, output: *"Excessive friction rate: Friction rates above 0.18 iwc/100' will lead to high air velocities, resulting in structural noise and whistling at supply registers."*.
    *   If $FR < 0.06 \ \text{iwc/100'}$, output: *"Low friction rate: Friction rates below 0.06 iwc/100' require oversized ductwork, which increases material costs and can cause low-velocity temperature stratification."*.

### 3.4 Hydronic Boiler Sizing & EDR Calculator
*   **Target SEO Keyword Intent:** Boiler sizing EDR, hydronic radiator EDR calculator, boiler NET IBR rating, cast iron radiator BTU output.
*   **Mathematical Models to Inject:**
    *   *Delta-T Calculation:* $$\Delta T = T_{\text{supply\_average}} - T_{\text{room}} \quad [^\circ\text{F}]$$.
    *   *Boiler Net Output Requirement (Water):* $$Q_{\text{boiler, water}} = \text{Total EDR} \times 170 \times \left( \frac{\Delta T}{110} \right)^{1.3}$$.
*   **System Warnings:**
    *   If the EDR boiler size is > $140\%$ of the calculated heat loss load, warn: *"Oversizing risk: Connected radiator EDR exceeds calculated building heat loss by more than 40%. Sizing a boiler to the radiators in this scenario will cause short-cycling. Consider installing a modulating boiler or thermostatic radiator valves."*.

### 3.5 Cooling Tower Tonnage Calculator
*   **Target SEO Keyword Intent:** Cooling tower tonnage calculator, chiller heat of compression, condenser water heat rejection, cooling tower GPM delta T.
*   **Mathematical Models to Inject:**
    *   *Evaporative Heat Rejection Rate:* $$Q_{\text{rejection}} = 500 \times \text{GPM} \times (T_{\text{hot}} - T_{\text{cold}})$$.
    *   *Approach Calculation:* $$\text{Approach} = T_{\text{cold}} - WBT \quad [^\circ\text{F}]$$.
*   **System Warnings:**
    *   If Approach is $< 5^\circ\text{F}$, warn: *"Thermodynamic design error: An approach of less than 5°F is extremely difficult to achieve. Sizing a tower for this condition requires an oversized heat exchange fill area, high fan energy, and represents high operational risks."*.
    *   If the tower's heat rejection capacity ($Q_{\text{rejection}}$) is less than the evaporator load plus the heat of compression, output: *"Under-capacity warning: Tower heat rejection capacity is lower than the calculated chiller reject load. High condenser water temperatures will cause a compressor high-pressure trip."*.

### 3.6 Air Changes per Hour (ACH) Ventilation Calculator
*   **Target SEO Keyword Intent:** Air changes per hour calculator, ACH to CFM ventilation formula, ASHRAE 62.1 commercial ACH, ASHRAE 170 hospital ventilation rates.
*   **Mathematical Models to Inject:**
    *   *Imperial ACH Calculation:* $$\text{ACH} = \frac{Q \times 60}{V} \quad [1/\text{hr}]$$.
*   **System Warnings:**
    *   Cross-reference user's calculated ACH against minimum ASHRAE code requirements based on space classification. If below threshold, output: *"Non-compliant ACH rate: Calculated air exchange rate is below the minimum ASHRAE standard for this space category."*.

### 3.7 Universal Air Psychrometric Calculator
*   **Target SEO Keyword Intent:** Psychrometric calculator formulas, moist air specific enthalpy calculation, humidity ratio vapor pressure, sensible heat ratio SHR.
*   **Mathematical Models to Inject:**
    *   *Specific Enthalpy ($h$ in kJ/kg):* $$h = 1.006 \times T_{db} + \left(\frac{W}{1000}\right) \times (2501 + 1.86 \times T_{db}) \quad [\text{kJ/kg}]$$.
    *   *Humidity Ratio ($W$):* $$W = 621.945 \times \frac{P_v}{P_{atm} - P_v} \quad [\text{g/kg}]$$.
*   **System Warnings:**
    *   If a contradictory input is detected (e.g., wet-bulb > dry-bulb), trigger: *"Physical limit violation: Wet-bulb temperature cannot exceed dry-bulb temperature under stable atmospheric conditions."*.
