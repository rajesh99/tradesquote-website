export type ExternalResource = {
  href: string;
  name: string;
  description: string;
  /** Inline SVG path(s) for the icon — uses a 24×24 viewBox */
  iconPath: string;
};

export const HVAC_AUTHORITY_URLS = {
  accaManualD: "https://www.acca.org/resource/manual-d-residential-duct-systems",
  accaManualJ: "https://www.acca.org/standards/technical-manuals/manual-j",
  accaManualS: "https://www.acca.org/standards/technical-manuals/manual-s",
  ashraeVentilation: "https://www.ashrae.org/technical-resources/bookstore/standards-62-1-62-2",
  doeHeatingCooling: "https://www.energy.gov/energysaver/heating-cooling",
  doeAirSourceHeatPumps: "https://www.energy.gov/energysaver/air-source-heat-pumps",
  doeCentralAc: "https://www.energy.gov/energysaver/central-air-conditioning",
  doeDuctSealing: "https://www.energy.gov/energysaver/minimizing-energy-losses-ducts",
  energystarHvac: "https://www.energystar.gov/products/heating_cooling",
  energystarColdClimateHp:
    "https://www.energystar.gov/products/air_source_heat_pumps/key-product-criteria",
  pnnlColdClimateHpSizing:
    "https://basc.pnnl.gov/resource-guides/cold-climate-heat-pump-sizing-and-selection",
  ahri: "https://www.ahrinet.org",
  smacna: "https://www.smacna.org",
} as const;

/** Tailwind classes for external links in FAQ HTML strings */
export const HVAC_EXTERNAL_LINK_CLASS =
  "font-semibold text-cyan-700 underline decoration-cyan-300 hover:decoration-cyan-600";

export const DEFAULT_HVAC_EXTERNAL_RESOURCES: ExternalResource[] = [
  {
    href: "https://www.acca.org",
    name: "ACCA",
    description:
      "Air Conditioning Contractors of America — publisher of Manual D (duct design), Manual J (load calculation), and Manual S (equipment selection).",
    iconPath:
      "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
  },
  {
    href: "https://www.ashrae.org",
    name: "ASHRAE",
    description:
      "Sets ventilation minimums in Standard 62.1 (commercial) and 62.2 (residential), plus energy standards (90.1) and the HVAC Fundamentals Handbook.",
    iconPath:
      "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
  },
  {
    href: HVAC_AUTHORITY_URLS.energystarHvac,
    name: "ENERGY STAR",
    description:
      "EPA program rating HVAC efficiency — SEER2, HSPF2, and EER2. Certified equipment must meet verified airflow and capacity specs.",
    iconPath:
      "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
  },
  {
    href: HVAC_AUTHORITY_URLS.doeHeatingCooling,
    name: "U.S. Dept. of Energy",
    description:
      "EnergySaver guides explain cooling load basics, ACH, duct sealing, and proper equipment sizing in plain language — good reading for homeowners.",
    iconPath:
      "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  },
  {
    href: HVAC_AUTHORITY_URLS.ahri,
    name: "AHRI",
    description:
      "Air-Conditioning, Heating & Refrigeration Institute — certifies equipment ratings (tonnage, airflow, efficiency) so published specs match real-world performance.",
    iconPath:
      "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  },
  {
    href: HVAC_AUTHORITY_URLS.smacna,
    name: "SMACNA",
    description:
      "Sheet Metal & Air Conditioning Contractors' National Association — duct construction and leakage standards that Manual D duct designs are built around.",
    iconPath:
      "M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4",
  },
];

/** CFM / airflow / ACH — HVAC CFM Calculator */
export const CFM_CALCULATOR_EXTERNAL_RESOURCES: ExternalResource[] = [
  {
    href: HVAC_AUTHORITY_URLS.accaManualD,
    name: "ACCA Manual D",
    description:
      "Residential duct-system design standard — turns CFM targets into duct diameters, friction rates, and register sizes after room and tonnage airflow are known.",
    iconPath:
      "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
  },
  {
    href: HVAC_AUTHORITY_URLS.ashraeVentilation,
    name: "ASHRAE 62.1 & 62.2",
    description:
      "Ventilation standards that define minimum outdoor-air CFM and air-change requirements for residential (62.2) and commercial (62.1) buildings.",
    iconPath:
      "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
  },
  {
    href: HVAC_AUTHORITY_URLS.smacna,
    name: "SMACNA",
    description:
      "Duct construction, sealing, and leakage standards — the physical specs Manual D airflow designs must meet in the field.",
    iconPath:
      "M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4",
  },
  {
    href: HVAC_AUTHORITY_URLS.doeAirSourceHeatPumps,
    name: "U.S. DOE — Airflow per Ton",
    description:
      "Energy Saver guidance on the 350–450 CFM-per-ton design range, why humid climates run lower airflow, and how low CFM hurts coil performance.",
    iconPath:
      "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  },
  {
    href: HVAC_AUTHORITY_URLS.doeDuctSealing,
    name: "U.S. DOE — Duct Airflow Losses",
    description:
      "How leaky or undersized ducts reduce delivered CFM at registers — and why sealed, balanced ductwork is required to hit design airflow.",
    iconPath:
      "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  },
  {
    href: HVAC_AUTHORITY_URLS.ahri,
    name: "AHRI",
    description:
      "Certifies rated blower airflow and capacity at standard test conditions — so published CFM and tonnage specs match real equipment performance.",
    iconPath:
      "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  },
];

/** Heat pump sizing / load calculation — Heat Pump Sizing Calculator */
export const HEAT_PUMP_CALCULATOR_EXTERNAL_RESOURCES: ExternalResource[] = [
  {
    href: HVAC_AUTHORITY_URLS.accaManualJ,
    name: "ACCA Manual J",
    description:
      "Residential load-calculation standard — the BTU-per-sq-ft and climate-zone method contractors use for permit-grade heating and cooling sizing.",
    iconPath:
      "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
  },
  {
    href: HVAC_AUTHORITY_URLS.accaManualS,
    name: "ACCA Manual S",
    description:
      "Equipment-selection protocol — matches Manual J loads to a heat pump model that delivers the right capacity at design conditions.",
    iconPath:
      "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
  },
  {
    href: HVAC_AUTHORITY_URLS.doeAirSourceHeatPumps,
    name: "U.S. DOE — Heat Pump Systems",
    description:
      "Energy Saver guide to air-source heat pump sizing, efficiency, supplemental heat, and the airflow each ton of capacity needs.",
    iconPath:
      "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  },
  {
    href: HVAC_AUTHORITY_URLS.energystarColdClimateHp,
    name: "ENERGY STAR — Cold-Climate HPs",
    description:
      "Cold-climate heat pump criteria: HSPF2 ≥ 8.5, ≥70% heating capacity at 5°F, and COP ≥ 1.75 — the spec this calculator flags in northern zones.",
    iconPath:
      "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
  },
  {
    href: HVAC_AUTHORITY_URLS.pnnlColdClimateHpSizing,
    name: "PNNL Building America",
    description:
      "Cold-climate heat pump sizing and selection guide — balance-point analysis, backup-heat strategies, and climate-zone equipment choices.",
    iconPath:
      "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
  },
  {
    href: HVAC_AUTHORITY_URLS.ahri,
    name: "AHRI",
    description:
      "Directory of certified heat pump ratings — heating and cooling capacity, HSPF2/SEER2, and low-ambient performance at standard test points.",
    iconPath:
      "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  },
];
