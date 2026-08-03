import type { ExternalResource } from "@/config/hvacExternalResources";

export type { ExternalResource };

export const ELECTRICAL_AUTHORITY_URLS = {
  necNfpa70: "https://www.nfpa.org/codes-and-standards/nfpa-70-standard-development/70",
  nfpaLink: "https://www.nfpa.org/for-professionals/nfpa-link",
  necAdoption: "https://electricaltoolbox.com/nec-adoption/",
  ieeeStandards: "https://standards.ieee.org/",
  ul: "https://www.ul.com/",
  ulProductIq: "https://productiq.ul.com/",
  neca: "https://www.necanet.org/",
  eiaElectricity: "https://www.eia.gov/electricity/monthly/",
  doeEv: "https://www.energy.gov/energysaver/electric-vehicle-charging-home",
  doeLighting: "https://www.energy.gov/energysaver/led-lighting",
  esfi: "https://www.esfi.org/",
  ies: "https://www.ies.org/",
} as const;

/** Tailwind classes for external links inside FAQ HTML strings */
export const ELECTRICAL_EXTERNAL_LINK_CLASS =
  "font-semibold text-sky-700 underline decoration-sky-300 hover:decoration-sky-600";

/** Accent classes for the ExternalResources grid on electrical pages */
export const ELECTRICAL_EXTERNAL_RESOURCE_STYLES = {
  hoverBorder: "hover:border-sky-300",
  iconBg: "bg-sky-100",
  iconColor: "text-sky-700",
  hoverTitle: "group-hover:text-sky-700",
  hoverIcon: "group-hover:text-sky-600",
};

export const DEFAULT_ELECTRICAL_EXTERNAL_RESOURCES: ExternalResource[] = [
  {
    href: ELECTRICAL_AUTHORITY_URLS.necNfpa70,
    name: "NFPA 70 (NEC)",
    description:
      "The National Electrical Code — the source for every ampacity, conduit fill, box fill, grounding, and load-calculation rule these tools apply. Free read-only access via NFPA LiNK.",
    iconPath:
      "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
  },
  {
    href: ELECTRICAL_AUTHORITY_URLS.necAdoption,
    name: "NEC Adoption by State",
    description:
      "Which code cycle your jurisdiction actually enforces. States routinely run one or two editions behind the current NEC, and local amendments override the model code.",
    iconPath:
      "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7",
  },
  {
    href: ELECTRICAL_AUTHORITY_URLS.ieeeStandards,
    name: "IEEE",
    description:
      "Institute of Electrical and Electronics Engineers — standards behind fault-current calculation, grounding practice, and power quality.",
    iconPath: "M13 10V3L4 14h7v7l9-11h-7z",
  },
  {
    href: ELECTRICAL_AUTHORITY_URLS.ul,
    name: "UL Solutions",
    description:
      "Listing and labelling, terminal temperature ratings, and interrupting ratings (AIC) — the equipment side of what the NEC allows you to install.",
    iconPath:
      "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  },
  {
    href: ELECTRICAL_AUTHORITY_URLS.neca,
    name: "NECA",
    description:
      "National Electrical Contractors Association — publisher of the Manual of Labor Units (MLU) and the National Electrical Installation Standards used in estimating.",
    iconPath:
      "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
  },
  {
    href: ELECTRICAL_AUTHORITY_URLS.eiaElectricity,
    name: "U.S. EIA",
    description:
      "Energy Information Administration — the residential and commercial electricity prices per kWh behind every operating-cost and payback figure.",
    iconPath:
      "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  },
];
