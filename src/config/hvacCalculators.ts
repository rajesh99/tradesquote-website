export type HvacCalculatorAccent =
  | "blue"
  | "sky"
  | "orange"
  | "cyan"
  | "teal"
  | "emerald"
  | "violet"
  | "rose"
  | "indigo"
  | "amber"
  | "red";

export type HvacCalculator = {
  slug: string;
  title: string;
  description: string;
  question: string;
  accent: HvacCalculatorAccent;
  icon: string;
};

export const hvacCalculators: HvacCalculator[] = [
  {
    slug: "hvac-btu-calculator",
    title: "HVAC BTU Calculator",
    description:
      "The full cooling load for any room or home — adjusted for climate, sun exposure, insulation, ceiling height, and occupancy.",
    question: "What size AC do I need for 1,500 sq ft?",
    accent: "blue",
    icon: `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"/></svg>`,
  },
  {
    slug: "hvac-tonnage-calculator",
    title: "AC Tonnage Calculator",
    description:
      "Convert BTU to tons and back instantly, estimate tonnage from square footage, and decode the size hidden in any unit's model number.",
    question: "How many tons is 36,000 BTU?",
    accent: "sky",
    icon: `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m4 6H4m0 0l4 4m-4-4l4-4"/></svg>`,
  },
  {
    slug: "hvac-unit-converter",
    title: "HVAC Unit Converter",
    description:
      "Convert HVAC units in the field — tons to BTU/h and kW, Fahrenheit to Celsius, inches of water column to Pascals, and PSI to kPa.",
    question: "How many BTU is 3 tons?",
    accent: "sky",
    icon: `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m4 6H4m0 0l4 4m-4-4l4-4"/></svg>`,
  },
  {
    slug: "hvac-furnace-btu-calculator",
    title: "Furnace BTU Calculator",
    description:
      "Heating load by climate zone and insulation, converted into the furnace input size to buy using AFUE efficiency.",
    question: "What size furnace for a 2,000 sq ft house?",
    accent: "orange",
    icon: `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/><path stroke-linecap="round" stroke-linejoin="round" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"/></svg>`,
  },
  {
    slug: "hvac-heat-pump-calculator",
    title: "Heat Pump Sizing Calculator",
    description:
      "Size a heat pump for both heating and cooling — BTU and tonnage by climate zone, insulation, and ceiling height, with cold-climate balance-point guidance.",
    question: "What size heat pump do I need?",
    accent: "indigo",
    icon: `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16 3l4 4-4 4"/><path stroke-linecap="round" stroke-linejoin="round" d="M20 7H8a4 4 0 00-4 4v1"/><path stroke-linecap="round" stroke-linejoin="round" d="M8 21l-4-4 4-4"/><path stroke-linecap="round" stroke-linejoin="round" d="M4 17h12a4 4 0 004-4v-1"/></svg>`,
  },
  {
    slug: "hvac-mini-split-calculator",
    title: "Mini-Split Sizing Calculator",
    description:
      "Find the right BTU size for a ductless mini-split — per room or multi-zone — adjusted for insulation, climate, ceiling height, sun, and kitchen heat.",
    question: "What size mini-split do I need?",
    accent: "amber",
    icon: `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="7" rx="2"/><path stroke-linecap="round" stroke-linejoin="round" d="M7 16h.01M11 17h.01M15 16h.01"/></svg>`,
  },
  {
    slug: "hvac-cfm-calculator",
    title: "HVAC CFM Calculator",
    description:
      "Room airflow from volume and air changes per hour, plus the total system CFM target from tonnage (350–450 CFM per ton).",
    question: "How many CFM does this room need?",
    accent: "cyan",
    icon: `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 8h9a2.5 2.5 0 10-2.5-2.5M4 12h13a2.5 2.5 0 11-2.5 2.5M4 16h7"/></svg>`,
  },
  {
    slug: "hvac-duct-size-calculator",
    title: "Duct Size Calculator",
    description:
      "Convert CFM into the round duct diameter you need — sheet metal or flex — with a velocity check and full sizing chart.",
    question: "What size duct for 400 CFM?",
    accent: "teal",
    icon: `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>`,
  },
  {
    slug: "hvac-delta-t-calculator",
    title: "Delta T Calculator",
    description:
      "Check an AC temperature split (return minus supply, normally 16–22°F) or furnace temperature rise — and what a high or low reading means.",
    question: "What is a good Delta T for an AC?",
    accent: "violet",
    icon: `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/></svg>`,
  },
  {
    slug: "hvac-static-pressure-calculator",
    title: "Static Pressure Calculator",
    description:
      "Add supply and return static pressure readings to get total external static pressure (TESP) and compare it to the equipment's rated maximum.",
    question: "What should total static pressure be?",
    accent: "red",
    icon: `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>`,
  },
  {
    slug: "hvac-superheat-calculator",
    title: "Superheat Calculator",
    description:
      "Calculate measured superheat from suction line temperature and saturation temperature, with TXV and fixed-orifice target guidance.",
    question: "What should superheat be on my AC?",
    accent: "orange",
    icon: `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/></svg>`,
  },
  {
    slug: "hvac-subcooling-calculator",
    title: "Subcooling Calculator",
    description:
      "Calculate measured subcooling from liquid saturation temperature and liquid line temperature, with TXV charging targets.",
    question: "What should subcooling be on my AC?",
    accent: "sky",
    icon: `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>`,
  },
  {
    slug: "hvac-target-superheat-calculator",
    title: "Target Superheat Calculator",
    description:
      "Find the target superheat for a fixed-orifice system from indoor wet-bulb and outdoor dry-bulb temperatures.",
    question: "What is the target superheat for a piston meter?",
    accent: "amber",
    icon: `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>`,
  },
  {
    slug: "hvac-refrigerant-charge-calculator",
    title: "Refrigerant Charge Calculator",
    description:
      "Calculate line-set add-on refrigerant charge beyond the factory allowance — by refrigerant type, line diameters, and total run length.",
    question: "How much refrigerant do I add for extra line set?",
    accent: "orange",
    icon: `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>`,
  },
  {
    slug: "hvac-dew-point-calculator",
    title: "Dew Point Calculator",
    description:
      "Find dew point from dry-bulb temperature and relative humidity (or RH from dew point), with condensation-risk flags for ducts and surfaces.",
    question: "What is the dew point at 75°F and 55% RH?",
    accent: "cyan",
    icon: `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>`,
  },
  {
    slug: "hvac-sensible-latent-heat-calculator",
    title: "Sensible & Latent Heat Calculator",
    description:
      "Split total coil load into sensible and latent BTU/h from CFM, temperature change, and humidity ratio change — plus sensible heat ratio (SHR).",
    question: "How much latent heat is my coil removing?",
    accent: "emerald",
    icon: `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/></svg>`,
  },
  {
    slug: "hvac-fan-laws-calculator",
    title: "Fan Laws Calculator",
    description:
      "Apply fan affinity laws to predict CFM, static pressure, and brake horsepower when blower RPM changes.",
    question: "What happens to CFM if I slow the blower 10%?",
    accent: "blue",
    icon: `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>`,
  },
  {
    slug: "hvac-ventilation-calculator",
    title: "Ventilation Calculator",
    description:
      "Size whole-building ventilation CFM using ASHRAE 62.2 residential rates or ASHRAE 62.1 commercial people-and-area rates.",
    question: "How much ventilation CFM does my home need?",
    accent: "teal",
    icon: `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 8h9a2.5 2.5 0 10-2.5-2.5M4 12h13a2.5 2.5 0 11-2.5 2.5M4 16h7"/></svg>`,
  },
  {
    slug: "hvac-humidity-control-calculator",
    title: "Humidity Control Calculator",
    description:
      "Size a humidifier or dehumidifier from indoor RH targets, room volume, and airflow — latent load in BTU/h, pints/day, or gallons/day.",
    question: "What size dehumidifier do I need?",
    accent: "rose",
    icon: `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>`,
  },
  {
    slug: "hvac-seer-savings-calculator",
    title: "SEER Savings Calculator",
    description:
      "Compare two SEER ratings and see annual electricity use, yearly cost, and the 15-year savings of the more efficient unit.",
    question: "Is SEER 16 worth it over SEER 14?",
    accent: "emerald",
    icon: `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>`,
  },
  {
    slug: "hvac-hspf-savings-calculator",
    title: "HSPF Savings Calculator",
    description:
      "Compare two heat pump HSPF ratings and see annual heating electricity use, yearly cost, and 15-year savings of the more efficient unit.",
    question: "Is HSPF 10 worth it over HSPF 8?",
    accent: "indigo",
    icon: `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16 3l4 4-4 4"/><path stroke-linecap="round" stroke-linejoin="round" d="M20 7H8a4 4 0 00-4 4v1"/><path stroke-linecap="round" stroke-linejoin="round" d="M8 21l-4-4 4-4"/></svg>`,
  },
  {
    slug: "hvac-afue-savings-calculator",
    title: "AFUE Savings Calculator",
    description:
      "Compare two furnace AFUE ratings and see the annual fuel cost, dollar savings, and 15-year payoff of a higher-efficiency furnace.",
    question: "Is a 95% AFUE furnace worth it?",
    accent: "orange",
    icon: `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 5L5 19M9 6.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM20 17.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/></svg>`,
  },
  {
    slug: "hvac-operating-cost-calculator",
    title: "HVAC Operating Cost Calculator",
    description:
      "What it actually costs to run your AC, heat pump, or furnace — per hour, per day, and per year — from efficiency, runtime, and energy price.",
    question: "How much does it cost to run my AC?",
    accent: "red",
    icon: `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
  },
  {
    slug: "hvac-replacement-cost-calculator",
    title: "Replacement Cost Calculator",
    description:
      "Installed price range for a new AC, furnace, heat pump, or full system — by size, efficiency tier, ductwork, and region.",
    question: "How much does a new HVAC system cost?",
    accent: "violet",
    icon: `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
  },
  {
    slug: "hvac-ductwork-replacement-cost-calculator",
    title: "Ductwork Replacement Cost Calculator",
    description:
      "Estimate the installed cost to replace home ductwork — by home size, duct material, accessibility, and region, with a per-linear-foot breakdown.",
    question: "How much does it cost to replace ductwork?",
    accent: "violet",
    icon: `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>`,
  },
  {
    slug: "hvac-estimate-calculator",
    title: "HVAC Estimate Calculator",
    description:
      "Contractor job pricing from the bottom up — labor, equipment, materials, overhead, and true profit margin (not markup).",
    question: "What should I quote for this job?",
    accent: "rose",
    icon: `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>`,
  },
  {
    slug: "hvac-combustion-efficiency-calculator",
    title: "Combustion Efficiency Calculator",
    description: "Boiler stack loss and net combustion efficiency using the Siegert formula — from flue gas temperature, combustion air temperature, and flue oxygen percentage.",
    question: "What is my boiler's combustion efficiency?",
    accent: "orange",
    icon: `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/></svg>`,
  },
  {
    slug: "hvac-hrv-erv-effectiveness-calculator",
    title: "HRV / ERV Effectiveness Calculator",
    description: "Sensible heat recovery effectiveness (ASHRAE 84) from supply and exhaust airflow and temperatures — with flow imbalance and thermodynamic limit warnings.",
    question: "What is my HRV sensible effectiveness?",
    accent: "teal",
    icon: `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 8h9a2.5 2.5 0 10-2.5-2.5M4 12h13a2.5 2.5 0 11-2.5 2.5M4 16h7"/></svg>`,
  },
  {
    slug: "hvac-duct-friction-rate-calculator",
    title: "Duct Friction Rate Calculator",
    description: "Manual D available static pressure and design friction rate — from equipment ESP, component losses, and total effective duct length. Flags high-velocity and oversized-ductwork conditions.",
    question: "What is the Manual D friction rate for my system?",
    accent: "blue",
    icon: `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>`,
  },
  {
    slug: "hvac-boiler-sizing-edr-calculator",
    title: "Hydronic Boiler Sizing & EDR Calculator",
    description: "Net and IBR gross boiler output from connected radiator EDR and supply water temperature — with temperature correction and oversizing risk warnings.",
    question: "What boiler output do I need for my radiators?",
    accent: "amber",
    icon: `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>`,
  },
  {
    slug: "hvac-cooling-tower-tonnage-calculator",
    title: "Cooling Tower Tonnage Calculator",
    description: "Condenser water heat rejection capacity (BTU/h and tons), approach to wet-bulb, and chiller reject load — with approach and under-capacity warnings.",
    question: "How many tons can my cooling tower reject?",
    accent: "cyan",
    icon: `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>`,
  },
  {
    slug: "hvac-ach-ventilation-calculator",
    title: "ACH Ventilation Calculator",
    description: "Convert CFM to air changes per hour (or reverse) and check against ASHRAE 62.1, 62.2, and 170 minimum rates for offices, restrooms, healthcare, and residential spaces.",
    question: "How many air changes per hour does this room have?",
    accent: "emerald",
    icon: `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>`,
  },
  {
    slug: "hvac-psychrometric-calculator",
    title: "Psychrometric Calculator",
    description: "All eight moist-air properties from dry-bulb temperature and relative humidity: humidity ratio, specific enthalpy, dew point, wet-bulb temperature, vapour pressure, specific volume, and air density.",
    question: "What is the enthalpy and humidity ratio of 75°F, 50% RH air?",
    accent: "indigo",
    icon: `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>`,
  },
  {
    slug: "hvac-heat-loss-calculator",
    title: "Heat Loss Calculator",
    description: "Whole-home heating load from climate zone, square footage, insulation level, and window area — the heating counterpart to the BTU cooling load calculator.",
    question: "How many BTU of heat does my home lose per hour?",
    accent: "orange",
    icon: `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/></svg>`,
  },
  {
    slug: "hvac-amp-draw-calculator",
    title: "HVAC Amp Draw Calculator",
    description: "Estimate running amperage, minimum circuit ampacity (MCA), and maximum overcurrent protection (MOP) from system BTU/h, SEER2 rating, and supply voltage.",
    question: "What size breaker do I need for a 3-ton AC?",
    accent: "sky",
    icon: `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>`,
  },
  {
    slug: "hvac-gas-line-sizing-calculator",
    title: "Gas Line Sizing Calculator",
    description: "Pipe diameter for natural gas or LP lines from BTU/h load and pipe length — from IFGC/NFPA 54 Table 402.4 pressure-drop values.",
    question: "What size gas pipe for a 200,000 BTU furnace at 50 feet?",
    accent: "amber",
    icon: `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>`,
  },
  {
    slug: "hvac-refrigerant-pt-chart",
    title: "Refrigerant PT Chart",
    description: "Saturation pressure–temperature reference for R-410A, R-32, R-454B, and R-22 — look up by temperature or pressure with phase-state indication.",
    question: "What is the saturation pressure of R-410A at 40°F?",
    accent: "cyan",
    icon: `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>`,
  },
  {
    slug: "hvac-mixed-air-temperature-calculator",
    title: "Mixed Air Temperature Calculator",
    description: "Mixed air temperature from outdoor and return CFM and temperatures — for economizer design, AHU commissioning, and outdoor air fraction.",
    question: "What is the mixed air temperature at 20% outside air?",
    accent: "teal",
    icon: `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 8h9a2.5 2.5 0 10-2.5-2.5M4 12h13a2.5 2.5 0 11-2.5 2.5M4 16h7"/></svg>`,
  },
  {
    slug: "hvac-seer2-converter",
    title: "SEER / SEER2 Converter",
    description: "Convert between SEER and SEER2 efficiency ratings, compare to 2023 federal minimum standards, and see how the test-procedure change affects real-world comparisons.",
    question: "What is SEER 16 in SEER2?",
    accent: "emerald",
    icon: `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m4 6H4m0 0l4 4m-4-4l4-4"/></svg>`,
  },
];

export type HvacCalculatorGroup = {
  label: string;
  description: string;
  slugs: string[];
};

export const hvacCalculatorGroups: HvacCalculatorGroup[] = [
  {
    label: "Sizing",
    description: "Find the right system for any space — cooling load, heating load, tonnage, heat pump sizing, and electrical and gas service requirements.",
    slugs: [
      "hvac-btu-calculator",
      "hvac-tonnage-calculator",
      "hvac-unit-converter",
      "hvac-furnace-btu-calculator",
      "hvac-heat-pump-calculator",
      "hvac-mini-split-calculator",
      "hvac-heat-loss-calculator",
      "hvac-amp-draw-calculator",
      "hvac-gas-line-sizing-calculator",
    ],
  },
  {
    label: "Airflow & Ductwork",
    description: "Calculate CFM requirements, select duct diameters, apply fan affinity laws, and verify Manual D friction rates.",
    slugs: [
      "hvac-cfm-calculator",
      "hvac-duct-size-calculator",
      "hvac-fan-laws-calculator",
      "hvac-duct-friction-rate-calculator",
    ],
  },
  {
    label: "Diagnostics & Refrigerant",
    description: "Check temperature splits, total external static pressure, refrigerant charge, PT chart lookup, and boiler combustion efficiency.",
    slugs: [
      "hvac-delta-t-calculator",
      "hvac-static-pressure-calculator",
      "hvac-superheat-calculator",
      "hvac-subcooling-calculator",
      "hvac-target-superheat-calculator",
      "hvac-refrigerant-charge-calculator",
      "hvac-combustion-efficiency-calculator",
      "hvac-refrigerant-pt-chart",
    ],
  },
  {
    label: "Psychrometrics & Indoor Air Quality",
    description: "Dew point, sensible and latent heat, mixed air temperature, ASHRAE ventilation, humidity sizing, HRV/ERV effectiveness, and full moist-air properties.",
    slugs: [
      "hvac-dew-point-calculator",
      "hvac-sensible-latent-heat-calculator",
      "hvac-mixed-air-temperature-calculator",
      "hvac-ventilation-calculator",
      "hvac-humidity-control-calculator",
      "hvac-hrv-erv-effectiveness-calculator",
      "hvac-ach-ventilation-calculator",
      "hvac-psychrometric-calculator",
    ],
  },
  {
    label: "Efficiency & Cost",
    description: "Compare SEER/SEER2, HSPF, and AFUE ratings, calculate operating cost and replacement cost, size hydronic systems, and price contractor jobs.",
    slugs: [
      "hvac-seer-savings-calculator",
      "hvac-seer2-converter",
      "hvac-hspf-savings-calculator",
      "hvac-afue-savings-calculator",
      "hvac-operating-cost-calculator",
      "hvac-replacement-cost-calculator",
      "hvac-ductwork-replacement-cost-calculator",
      "hvac-estimate-calculator",
      "hvac-boiler-sizing-edr-calculator",
      "hvac-cooling-tower-tonnage-calculator",
    ],
  },
];

export const hvacAccentStyles: Record<
  HvacCalculatorAccent,
  {
    iconBg: string;
    iconColor: string;
    hoverBorder: string;
    hoverTitle: string;
    ctaColor: string;
    linkColor: string;
  }
> = {
  blue: {
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    hoverBorder: "hover:border-blue-300",
    hoverTitle: "group-hover:text-blue-600",
    ctaColor: "text-blue-600",
    linkColor: "text-blue-600",
  },
  sky: {
    iconBg: "bg-sky-100",
    iconColor: "text-sky-600",
    hoverBorder: "hover:border-sky-300",
    hoverTitle: "group-hover:text-sky-600",
    ctaColor: "text-sky-600",
    linkColor: "text-blue-600",
  },
  orange: {
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    hoverBorder: "hover:border-orange-300",
    hoverTitle: "group-hover:text-orange-600",
    ctaColor: "text-orange-600",
    linkColor: "text-orange-600",
  },
  cyan: {
    iconBg: "bg-cyan-100",
    iconColor: "text-cyan-600",
    hoverBorder: "hover:border-cyan-300",
    hoverTitle: "group-hover:text-cyan-600",
    ctaColor: "text-cyan-600",
    linkColor: "text-cyan-600",
  },
  teal: {
    iconBg: "bg-teal-100",
    iconColor: "text-teal-600",
    hoverBorder: "hover:border-teal-300",
    hoverTitle: "group-hover:text-teal-600",
    ctaColor: "text-teal-600",
    linkColor: "text-teal-600",
  },
  emerald: {
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    hoverBorder: "hover:border-emerald-300",
    hoverTitle: "group-hover:text-emerald-600",
    ctaColor: "text-emerald-600",
    linkColor: "text-emerald-600",
  },
  violet: {
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    hoverBorder: "hover:border-violet-300",
    hoverTitle: "group-hover:text-violet-600",
    ctaColor: "text-violet-600",
    linkColor: "text-violet-600",
  },
  rose: {
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
    hoverBorder: "hover:border-rose-300",
    hoverTitle: "group-hover:text-rose-600",
    ctaColor: "text-rose-600",
    linkColor: "text-rose-600",
  },
  indigo: {
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
    hoverBorder: "hover:border-indigo-300",
    hoverTitle: "group-hover:text-indigo-600",
    ctaColor: "text-indigo-600",
    linkColor: "text-indigo-600",
  },
  amber: {
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    hoverBorder: "hover:border-amber-300",
    hoverTitle: "group-hover:text-amber-600",
    ctaColor: "text-amber-600",
    linkColor: "text-amber-600",
  },
  red: {
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    hoverBorder: "hover:border-red-300",
    hoverTitle: "group-hover:text-red-600",
    ctaColor: "text-red-600",
    linkColor: "text-red-600",
  },
};

export const hvacCalculatorGuide = [
  {
    question: "What size AC do I need?",
    slug: "hvac-btu-calculator",
    tool: "BTU Calculator",
    accent: "blue" as const,
    rule: "~20 BTU per sq ft, adjusted for climate, sun & insulation",
  },
  {
    question: "How many tons is X BTU? / What tonnage for my house?",
    slug: "hvac-tonnage-calculator",
    tool: "Tonnage Calculator",
    accent: "blue" as const,
    rule: "1 ton = 12,000 BTU/hr",
  },
  {
    question: "Convert tons, BTU/h, °F, or static pressure units?",
    slug: "hvac-unit-converter",
    tool: "HVAC Unit Converter",
    accent: "sky" as const,
    rule: "tons × 12,000 = BTU/h · °C = (°F−32)×5/9 · Pa = in.w.c.×249",
  },
  {
    question: "What size furnace do I need?",
    slug: "hvac-furnace-btu-calculator",
    tool: "Furnace BTU Calculator",
    accent: "orange" as const,
    rule: "30–60 BTU per sq ft by climate, ÷ AFUE for input size",
  },
  {
    question: "What size heat pump do I need?",
    slug: "hvac-heat-pump-calculator",
    tool: "Heat Pump Sizing Calculator",
    accent: "indigo" as const,
    rule: "Size to cooling tons; check heating load & balance point",
  },
  {
    question: "What size ductless mini-split for this room?",
    slug: "hvac-mini-split-calculator",
    tool: "Mini-Split Sizing Calculator",
    accent: "amber" as const,
    rule: "20–30 BTU/sq ft per zone, rounded to the nearest head",
  },
  {
    question: "How much airflow does this room / system need?",
    slug: "hvac-cfm-calculator",
    tool: "CFM Calculator",
    accent: "cyan" as const,
    rule: "volume × ACH ÷ 60 · 400 CFM per ton",
  },
  {
    question: "What size duct does that airflow need?",
    slug: "hvac-duct-size-calculator",
    tool: "Duct Size Calculator",
    accent: "teal" as const,
    rule: "smallest diameter whose capacity ≥ CFM (flex −25%)",
  },
  {
    question: "Is my AC temperature split healthy?",
    slug: "hvac-delta-t-calculator",
    tool: "Delta T Calculator",
    accent: "violet" as const,
    rule: "cooling split 16–22°F · furnace rise 40–70°F",
  },
  {
    question: "Is my duct system restricting airflow?",
    slug: "hvac-static-pressure-calculator",
    tool: "Static Pressure Calculator",
    accent: "red" as const,
    rule: "TESP = supply static + |return static| ≤ nameplate max",
  },
  {
    question: "Is my refrigerant charge correct (suction side)?",
    slug: "hvac-superheat-calculator",
    tool: "Superheat Calculator",
    accent: "orange" as const,
    rule: "superheat = suction line temp − saturation temp",
  },
  {
    question: "Is my refrigerant charge correct (liquid side)?",
    slug: "hvac-subcooling-calculator",
    tool: "Subcooling Calculator",
    accent: "sky" as const,
    rule: "subcooling = saturation temp − liquid line temp",
  },
  {
    question: "What superheat should a fixed-orifice system target?",
    slug: "hvac-target-superheat-calculator",
    tool: "Target Superheat Calculator",
    accent: "amber" as const,
    rule: "((3 × indoor WB) − 80 − outdoor DB) ÷ 2",
  },
  {
    question: "How much refrigerant for extra line set length?",
    slug: "hvac-refrigerant-charge-calculator",
    tool: "Refrigerant Charge Calculator",
    accent: "orange" as const,
    rule: "(total length − factory allowance) × oz/ft by line size",
  },
  {
    question: "What is the dew point / RH for this air sample?",
    slug: "hvac-dew-point-calculator",
    tool: "Dew Point Calculator",
    accent: "cyan" as const,
    rule: "Magnus approximation from dry-bulb + RH (or inverse)",
  },
  {
    question: "How is coil load split between sensible and latent heat?",
    slug: "hvac-sensible-latent-heat-calculator",
    tool: "Sensible & Latent Heat Calculator",
    accent: "emerald" as const,
    rule: "Qs = 1.08×CFM×ΔT · Ql = 0.68×CFM×Δgrains · SHR = Qs/Qt",
  },
  {
    question: "What happens to CFM and static pressure if RPM changes?",
    slug: "hvac-fan-laws-calculator",
    tool: "Fan Laws Calculator",
    accent: "blue" as const,
    rule: "CFM ∝ RPM · SP ∝ RPM² · BHP ∝ RPM³",
  },
  {
    question: "How much whole-building ventilation CFM is required?",
    slug: "hvac-ventilation-calculator",
    tool: "Ventilation Calculator",
    accent: "teal" as const,
    rule: "62.2: 0.03×area + 7.5×(beds+1) · 62.1: occ×cfm/person + area×cfm/sqft",
  },
  {
    question: "What size humidifier or dehumidifier do I need?",
    slug: "hvac-humidity-control-calculator",
    tool: "Humidity Control Calculator",
    accent: "rose" as const,
    rule: "Ql = 0.68×CFM×Δgrains · pints/day = Ql×24÷12,000",
  },
  {
    question: "Is the higher-efficiency unit worth the price?",
    slug: "hvac-seer-savings-calculator",
    tool: "SEER Savings Calculator",
    accent: "emerald" as const,
    rule: "% saved = 1 − (old SEER ÷ new SEER)",
  },
  {
    question: "Is a higher-efficiency heat pump worth it for heating?",
    slug: "hvac-hspf-savings-calculator",
    tool: "HSPF Savings Calculator",
    accent: "indigo" as const,
    rule: "% saved = 1 − (old HSPF ÷ new HSPF)",
  },
  {
    question: "Is a higher-efficiency furnace worth it?",
    slug: "hvac-afue-savings-calculator",
    tool: "AFUE Savings Calculator",
    accent: "orange" as const,
    rule: "% saved = 1 − (old AFUE ÷ new AFUE)",
  },
  {
    question: "What does it cost to run my system?",
    slug: "hvac-operating-cost-calculator",
    tool: "Operating Cost Calculator",
    accent: "red" as const,
    rule: "BTU ÷ efficiency × hours × energy price",
  },
  {
    question: "How much will the replacement cost?",
    slug: "hvac-replacement-cost-calculator",
    tool: "Replacement Cost Calculator",
    accent: "violet" as const,
    rule: "base price × size × efficiency + ducts, × regional labor",
  },
  {
    question: "What should I quote for this job? (contractors)",
    slug: "hvac-estimate-calculator",
    tool: "HVAC Estimate Calculator",
    accent: "rose" as const,
    rule: "(labor + equipment + materials + overhead) ÷ (1 − margin)",
  },
  {
    question: "What is my boiler's combustion efficiency?",
    slug: "hvac-combustion-efficiency-calculator",
    tool: "Combustion Efficiency Calculator",
    accent: "orange" as const,
    rule: "η = 100% − qA − L_latent − 1.5% radiation (Siegert formula)",
  },
  {
    question: "What is my HRV or ERV's sensible effectiveness?",
    slug: "hvac-hrv-erv-effectiveness-calculator",
    tool: "HRV / ERV Effectiveness Calculator",
    accent: "teal" as const,
    rule: "εs = Vs×(t₁−t₂) / [Vmin×(t₁−t₃)] × 100 (ASHRAE 84)",
  },
  {
    question: "What friction rate should I use for Manual D duct sizing?",
    slug: "hvac-duct-friction-rate-calculator",
    tool: "Duct Friction Rate Calculator",
    accent: "blue" as const,
    rule: "FR = (ASP × 100) / TEL · target 0.06–0.18 iwc/100'",
  },
  {
    question: "What boiler output does my hydronic radiator system need?",
    slug: "hvac-boiler-sizing-edr-calculator",
    tool: "Hydronic Boiler Sizing & EDR Calculator",
    accent: "amber" as const,
    rule: "Q = EDR × 170 × (ΔT/110)^1.3 · gross = net × 1.15",
  },
  {
    question: "How many tons can my cooling tower reject?",
    slug: "hvac-cooling-tower-tonnage-calculator",
    tool: "Cooling Tower Tonnage Calculator",
    accent: "cyan" as const,
    rule: "Q = 500 × GPM × ΔT · approach = T_cold − WBT ≥ 5°F",
  },
  {
    question: "How many air changes per hour does this space have?",
    slug: "hvac-ach-ventilation-calculator",
    tool: "ACH Ventilation Calculator",
    accent: "emerald" as const,
    rule: "ACH = (CFM × 60) / volume · check ASHRAE 62.1 / 62.2 / 170",
  },
  {
    question: "What are all the psychrometric properties of this air sample?",
    slug: "hvac-psychrometric-calculator",
    tool: "Psychrometric Calculator",
    accent: "indigo" as const,
    rule: "W = 621.945×Pv/(Patm−Pv) · h = 0.240×T + (W/7000)×(1061+0.444×T)",
  },
];

export const hvacFaqs = [
  {
    question: "Are these HVAC calculators really free?",
    answer:
      "Yes. All thirty-two are completely free, run instantly in your browser, and require no account or sign-up. They're planning and field-check tools built by TradesQuote, the AI estimating platform for trades businesses.",
  },
  {
    question: "Which HVAC calculator should I use first?",
    answer:
      "For cooling installs, the natural order is BTU → Tonnage → CFM. For code ventilation, use the Ventilation Calculator after CFM targets. For field diagnostics, start with Delta T, then Static Pressure if the split is high, Superheat or Subcooling if charge is suspect, and the Refrigerant Charge Calculator for long line sets. For moisture and coil load, use Dew Point and Sensible & Latent Heat; for humidifier or dehumidifier sizing, use Humidity Control. For combustion and boiler work, use Combustion Efficiency and Hydronic Boiler EDR. For air quality and ventilation compliance, use the ACH Calculator. For psychrometric analysis, use the Psychrometric Calculator.",
  },
  {
    question: "Are the results accurate enough to buy equipment?",
    answer:
      "They give reliable planning estimates using the same rules of thumb contractors start with. Before purchasing or pulling permits, confirm final sizing with a full ACCA Manual J load calculation and Manual D duct design, which account for windows, orientation, infiltration, and duct losses.",
  },
  {
    question: "What are Manual J and Manual D?",
    answer:
      "They're the ACCA design standards used across the US industry. Manual J is the room-by-room heating and cooling load calculation; Manual D is the duct design method that turns airflow targets into duct sizes. Permits and equipment warranties typically require them.",
  },
  {
    question: "Do these calculators work for commercial buildings?",
    answer:
      "They're tuned for residential and light-commercial spaces. Large commercial buildings have ventilation codes, occupancy loads, and zoning requirements that need engineering-grade load calculations — treat results there as rough first approximations only.",
  },
  {
    question: "Will calculators for other trades be added?",
    answer:
      "Yes. HVAC is the first set — calculators for carpentry, painting, cleaning, electrical, and plumbing are planned next, matching the trades TradesQuote supports for AI-powered estimating.",
  },
];
