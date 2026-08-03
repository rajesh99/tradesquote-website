export type ElectricalCalculatorAccent =
  | "blue"
  | "sky"
  | "cyan"
  | "teal"
  | "emerald"
  | "indigo"
  | "violet"
  | "rose"
  | "amber"
  | "orange"
  | "red"
  | "slate";

export type ElectricalCalculator = {
  slug: string;
  title: string;
  description: string;
  question: string;
  accent: ElectricalCalculatorAccent;
  icon: string;
};

export const electricalCalculators: ElectricalCalculator[] = [
  {
    slug: "electrical-wire-size-calculator",
    title: "Wire Size Calculator",
    description:
      "The AWG your circuit actually needs — sized by NEC Table 310.16 ampacity and by voltage drop, then governed by whichever one demands the larger conductor.",
    question: "What size wire do I need for 50 amps?",
    accent: "blue",
    icon: `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m4 6H4m0 0l4 4m-4-4l4-4"/></svg>`,
  },
  {
    slug: "electrical-voltage-drop-calculator",
    title: "Voltage Drop Calculator",
    description:
      "Voltage drop in volts and percent for any gauge, length, and load — plus the longest run that still lands inside the 3% recommendation.",
    question: "How much voltage drop on a 100-foot run?",
    accent: "sky",
    icon: `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"/></svg>`,
  },
  {
    slug: "electrical-ampacity-calculator",
    title: "Ampacity & Derating Calculator",
    description:
      "Derated ampacity after ambient temperature correction and conductor bundling — then capped by the 75°C termination rule and the small-conductor limits.",
    question: "How many amps can 10 AWG carry at 40°C with 6 conductors?",
    accent: "cyan",
    icon: `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>`,
  },
  {
    slug: "electrical-breaker-size-calculator",
    title: "Breaker Size Calculator",
    description:
      "The overcurrent device your load requires — continuous loads at 125%, rounded up to the next standard NEC rating, with the conductor that must match it.",
    question: "What size breaker do I need for a 40 amp load?",
    accent: "red",
    icon: `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>`,
  },
  {
    slug: "electrical-conduit-fill-calculator",
    title: "Conduit Fill Calculator",
    description:
      "NEC Chapter 9 fill percentage for EMT, PVC, RMC, and IMC — how full the raceway is, how many more conductors fit, and the next trade size up.",
    question: "How many #12 wires fit in 1/2 inch EMT?",
    accent: "teal",
    icon: `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`,
  },
  {
    slug: "electrical-box-fill-calculator",
    title: "Box Fill Calculator",
    description:
      "Cubic inches required by NEC 314.16 with conductors, clamps, devices, and grounds each counted the way the code actually counts them.",
    question: "What size box do I need for 6 wires and a receptacle?",
    accent: "teal",
    icon: `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>`,
  },
  {
    slug: "electrical-ground-wire-size-calculator",
    title: "Ground Wire Size Calculator",
    description:
      "Equipment grounding conductor from the breaker rating and grounding electrode conductor from the service conductors — two different tables, plus the electrode exceptions.",
    question: "What size ground wire for a 200 amp service?",
    accent: "emerald",
    icon: `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v10M5 15h14M7.5 18h9M10 21h4"/></svg>`,
  },
  {
    slug: "electrical-service-wire-size-calculator",
    title: "Service & Feeder Wire Size Calculator",
    description:
      "Dwelling service and feeder conductors from NEC Table 310.12 — the 83% allowance that lets 4/0 aluminum carry a 200 amp service, with the neutral and GEC to match.",
    question: "What size wire for a 200 amp service?",
    accent: "blue",
    icon: `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 21h18M5 21V7l7-4 7 4v14M9 9h1m4 0h1M9 13h1m4 0h1M9 17h1m4 0h1"/></svg>`,
  },
  {
    slug: "electrical-load-calculator",
    title: "Residential Load Calculator",
    description:
      "Whole-house calculated load in VA and amps by the NEC 220.82 optional method — general lighting, small appliance, laundry, appliances, and the largest HVAC term.",
    question: "How do I do a residential load calculation?",
    accent: "indigo",
    icon: `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>`,
  },
  {
    slug: "electrical-service-size-calculator",
    title: "Service Size Calculator",
    description:
      "Turn a calculated load into a service rating — and see exactly how much headroom is left for an EV charger, a heat pump, or an induction range.",
    question: "What size electrical service do I need?",
    accent: "indigo",
    icon: `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"/><path stroke-linecap="round" stroke-linejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"/></svg>`,
  },
  {
    slug: "electrical-ev-charger-calculator",
    title: "EV Charger Circuit Calculator",
    description:
      "EVSE circuit sized as a continuous load per NEC 625 — breaker, conductor, ground, voltage drop, and whether the existing service can actually take it.",
    question: "What size wire and breaker for a 48 amp EV charger?",
    accent: "emerald",
    icon: `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M13 8l-4 5h3l-1 4 4-5h-3l1-4z"/></svg>`,
  },
  {
    slug: "electrical-estimate-calculator",
    title: "Electrical Estimate Calculator",
    description:
      "Turn labor hours, material, and fixtures into a quoted price at your target gross margin — and see what using markup instead of margin costs you.",
    question: "How do I price an electrical job?",
    accent: "rose",
    icon: `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
  },
  {
    slug: "electrical-watts-to-amps-calculator",
    title: "Watts to Amps Calculator",
    description:
      "Convert watts to amps for DC, single-phase, and three-phase circuits — then get the breaker and conductor that current needs.",
    question: "How many amps is 1,500 watts?",
    accent: "emerald",
    icon: `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/><path stroke-linecap="round" stroke-linejoin="round" d="M3 3l18 18" opacity="0"/></svg>`,
  },
  {
    slug: "electrical-amps-to-watts-calculator",
    title: "Amps to Watts Calculator",
    description:
      "Convert amps to watts and volt-amperes, with power factor handled properly so real and apparent power are never confused.",
    question: "How many watts is 20 amps?",
    accent: "emerald",
    icon: `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11 3L4 14h7v7l7-11h-7z"/></svg>`,
  },
  {
    slug: "electrical-ohms-law-calculator",
    title: "Ohm's Law Calculator",
    description:
      "Enter any two of voltage, current, resistance, and power — the other two are solved instantly, with the formula used shown.",
    question: "What is the current if V is 120 and R is 10?",
    accent: "teal",
    icon: `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M9 17c1.5-1.5 2-3 2-5a1 1 0 112 0c0 2 .5 3.5 2 5"/></svg>`,
  },
  {
    slug: "electrical-unit-converter",
    title: "Electrical Unit Converter",
    description:
      "Convert between watts, kilowatts, horsepower, BTU per hour, volt-amperes, and amps — the units that appear on nameplates and never match.",
    question: "How many watts is 1 horsepower?",
    accent: "sky",
    icon: `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m4 6H4m0 0l4 4m-4-4l4-4"/></svg>`,
  },
  {
    slug: "electrical-kva-calculator",
    title: "kVA Calculator",
    description:
      "Apparent power, real power, and reactive power from line current or load — single-phase and three-phase, with the next standard transformer size.",
    question: "How many kVA is 100 amps at 480 volts?",
    accent: "emerald",
    icon: `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 20L20 4M4 20h16M4 20V4"/></svg>`,
  },
  {
    slug: "electrical-three-phase-power-calculator",
    title: "Three-Phase Power Calculator",
    description:
      "Line current, kW, kVA, and kVAR for balanced three-phase systems — from load, from amps, or from motor horsepower with efficiency.",
    question: "What amps does a 50 kW three-phase load draw?",
    accent: "cyan",
    icon: `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 18c2-8 4-8 6 0s4 8 6 0 2-8 4-4"/></svg>`,
  },
  {
    slug: "electrical-power-factor-calculator",
    title: "Power Factor Correction Calculator",
    description:
      "Capacitor kVAR needed to move from your current power factor to a target — with the line current saved and the demand charge it avoids.",
    question: "How much kVAR to correct 0.75 power factor to 0.95?",
    accent: "teal",
    icon: `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 17l6-6 4 4 8-8"/><path stroke-linecap="round" stroke-linejoin="round" d="M17 7h4v4"/></svg>`,
  },
  {
    slug: "electrical-kwh-cost-calculator",
    title: "kWh Cost Calculator",
    description:
      "What any appliance or circuit costs to run — daily, monthly, and annually — from its wattage, run time, and your electricity rate.",
    question: "What does a 1,500 watt heater cost to run?",
    accent: "amber",
    icon: `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
  },
  {
    slug: "electrical-panel-upgrade-cost-calculator",
    title: "Panel Upgrade Cost Calculator",
    description:
      "What a service or panel upgrade actually costs — panel, meter socket, service conductors, mast, permit, and labor, built up part by part.",
    question: "How much does a 200 amp panel upgrade cost?",
    accent: "rose",
    icon: `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>`,
  },
  {
    slug: "electrical-rewiring-cost-calculator",
    title: "Rewiring Cost Calculator",
    description:
      "Whole-house rewiring cost by square footage, wall access, and construction age — with the dollars-per-square-foot figure to sanity-check it.",
    question: "How much does it cost to rewire a house?",
    accent: "orange",
    icon: `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 21h18M5 21V7l7-4 7 4v14M10 21v-6h4v6"/></svg>`,
  },
  {
    slug: "electrical-labor-rate-calculator",
    title: "Labor Rate Calculator",
    description:
      "Your true loaded cost per billable hour from wage, burden, overhead, and unbillable time — then the rate to bill at your target margin.",
    question: "What should my hourly rate be?",
    accent: "rose",
    icon: `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
  },
];

export type ElectricalCalculatorGroup = {
  label: string;
  description: string;
  slugs: string[];
};

export const electricalCalculatorGroups: ElectricalCalculatorGroup[] = [
  {
    label: "Conductors, Raceway & Protection",
    description:
      "Size a circuit end to end — conductor gauge from ampacity and voltage drop, the breaker that protects it, the conduit and box that hold it, and the grounding conductors that go with it.",
    slugs: [
      "electrical-wire-size-calculator",
      "electrical-voltage-drop-calculator",
      "electrical-ampacity-calculator",
      "electrical-breaker-size-calculator",
      "electrical-service-wire-size-calculator",
      "electrical-ground-wire-size-calculator",
      "electrical-conduit-fill-calculator",
      "electrical-box-fill-calculator",
    ],
  },
  {
    label: "Load & Service Sizing",
    description:
      "Run the whole-house load calculation, turn it into a service rating, and check whether an EV charger fits before anyone quotes a panel upgrade.",
    slugs: [
      "electrical-load-calculator",
      "electrical-service-size-calculator",
      "electrical-ev-charger-calculator",
    ],
  },
  {
    label: "Formulas & Conversions",
    description:
      "The arithmetic behind every circuit — watts to amps and back, Ohm's law, apparent versus real power, three-phase √3 math, power-factor correction, and running cost.",
    slugs: [
      "electrical-watts-to-amps-calculator",
      "electrical-amps-to-watts-calculator",
      "electrical-ohms-law-calculator",
      "electrical-unit-converter",
      "electrical-kva-calculator",
      "electrical-three-phase-power-calculator",
      "electrical-power-factor-calculator",
      "electrical-kwh-cost-calculator",
    ],
  },
  {
    label: "Cost & Pricing",
    description:
      "Price the work once the circuit is designed — labor, material, overhead, and the margin that has to survive all of it.",
    slugs: [
      "electrical-estimate-calculator",
      "electrical-panel-upgrade-cost-calculator",
      "electrical-rewiring-cost-calculator",
      "electrical-labor-rate-calculator",
    ],
  },
];

export const electricalAccentStyles: Record<
  ElectricalCalculatorAccent,
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
    linkColor: "text-sky-600",
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
  indigo: {
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
    hoverBorder: "hover:border-indigo-300",
    hoverTitle: "group-hover:text-indigo-600",
    ctaColor: "text-indigo-600",
    linkColor: "text-indigo-600",
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
  amber: {
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    hoverBorder: "hover:border-amber-300",
    hoverTitle: "group-hover:text-amber-600",
    ctaColor: "text-amber-600",
    linkColor: "text-amber-600",
  },
  orange: {
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    hoverBorder: "hover:border-orange-300",
    hoverTitle: "group-hover:text-orange-600",
    ctaColor: "text-orange-600",
    linkColor: "text-orange-600",
  },
  red: {
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    hoverBorder: "hover:border-red-300",
    hoverTitle: "group-hover:text-red-600",
    ctaColor: "text-red-600",
    linkColor: "text-red-600",
  },
  slate: {
    iconBg: "bg-slate-200",
    iconColor: "text-slate-500",
    hoverBorder: "hover:border-slate-300",
    hoverTitle: "group-hover:text-slate-600",
    ctaColor: "text-slate-500",
    linkColor: "text-slate-600",
  },
};

export const electricalCalculatorGuide = [
  {
    question: "What gauge wire does this circuit need?",
    slug: "electrical-wire-size-calculator",
    tool: "Wire Size Calculator",
    accent: "blue" as const,
    rule: "Table 310.16 ampacity vs VD = 2×K×I×L÷CM — larger conductor wins",
  },
  {
    question: "Is this run too long for the wire I have?",
    slug: "electrical-voltage-drop-calculator",
    tool: "Voltage Drop Calculator",
    accent: "sky" as const,
    rule: "1φ: VD = 2×K×I×L÷CM · 3φ: VD = 1.732×K×I×L÷CM",
  },
  {
    question: "How many amps can this conductor really carry?",
    slug: "electrical-ampacity-calculator",
    tool: "Ampacity & Derating Calculator",
    accent: "cyan" as const,
    rule: "base × ambient (310.15(B)(1)) × bundling (310.15(C)(1)), capped by 110.14(C)",
  },
  {
    question: "What breaker protects this load?",
    slug: "electrical-breaker-size-calculator",
    tool: "Breaker Size Calculator",
    accent: "red" as const,
    rule: "non-continuous ×1.00 + continuous ×1.25 → next 240.6(A) rating",
  },
  {
    question: "What size wire for a 200 amp service?",
    slug: "electrical-service-wire-size-calculator",
    tool: "Service & Feeder Wire Size Calculator",
    accent: "blue" as const,
    rule: "Table 310.12 — dwelling conductors at 83% of the service rating",
  },
  {
    question: "What size ground wire do I need?",
    slug: "electrical-ground-wire-size-calculator",
    tool: "Ground Wire Size Calculator",
    accent: "emerald" as const,
    rule: "EGC from Table 250.122 (by OCPD) · GEC from Table 250.66 (by service conductor)",
  },
  {
    question: "How many wires fit in this conduit?",
    slug: "electrical-conduit-fill-calculator",
    tool: "Conduit Fill Calculator",
    accent: "teal" as const,
    rule: "Chapter 9 Table 1 — 53% for 1 conductor, 31% for 2, 40% for 3 or more",
  },
  {
    question: "What size box does this rough-in need?",
    slug: "electrical-box-fill-calculator",
    tool: "Box Fill Calculator",
    accent: "teal" as const,
    rule: "314.16(B) — conductors ×1, all grounds ×1, clamps ×1, each device yoke ×2",
  },
  {
    question: "What is this house's calculated electrical load?",
    slug: "electrical-load-calculator",
    tool: "Residential Load Calculator",
    accent: "indigo" as const,
    rule: "220.82 — first 10 kVA at 100%, remainder at 40%, plus the largest HVAC term",
  },
  {
    question: "Does the existing service have room for more?",
    slug: "electrical-service-size-calculator",
    tool: "Service Size Calculator",
    accent: "indigo" as const,
    rule: "amps = VA ÷ 240 → smallest standard service; flag above 80% utilisation",
  },
  {
    question: "What circuit does an EV charger need?",
    slug: "electrical-ev-charger-calculator",
    tool: "EV Charger Circuit Calculator",
    accent: "emerald" as const,
    rule: "625.41/625.42 — continuous load, conductors and OCPD at 125%",
  },
  {
    question: "What should I quote for this job? (contractors)",
    slug: "electrical-estimate-calculator",
    tool: "Electrical Estimate Calculator",
    accent: "rose" as const,
    rule: "(labor + fixtures + material + overhead) ÷ (1 − margin)",
  },
  {
    question: "How many amps does this wattage draw?",
    slug: "electrical-watts-to-amps-calculator",
    tool: "Watts to Amps Calculator",
    accent: "emerald" as const,
    rule: "DC: I = P÷V · 1φ: I = P÷(V×PF) · 3φ: I = P÷(√3×V×PF)",
  },
  {
    question: "How many watts is this current?",
    slug: "electrical-amps-to-watts-calculator",
    tool: "Amps to Watts Calculator",
    accent: "emerald" as const,
    rule: "P = V×I×PF · apparent VA = V×I (or √3×V×I)",
  },
  {
    question: "I know two of V, I, R, P — what are the others?",
    slug: "electrical-ohms-law-calculator",
    tool: "Ohm's Law Calculator",
    accent: "teal" as const,
    rule: "V = I×R · P = V×I · P = I²R · P = V²÷R",
  },
  {
    question: "How do I convert between watts, horsepower, and BTU?",
    slug: "electrical-unit-converter",
    tool: "Electrical Unit Converter",
    accent: "sky" as const,
    rule: "1 hp = 745.7 W · 1 W = 3.412 BTU/h · 1 ton = 12,000 BTU/h",
  },
  {
    question: "How many kVA is this load?",
    slug: "electrical-kva-calculator",
    tool: "kVA Calculator",
    accent: "emerald" as const,
    rule: "1φ: kVA = V×I÷1,000 · 3φ: kVA = √3×V×I÷1,000 · kW = kVA×PF",
  },
  {
    question: "What line current does a three-phase load draw?",
    slug: "electrical-three-phase-power-calculator",
    tool: "Three-Phase Power Calculator",
    accent: "cyan" as const,
    rule: "I = kW×1,000 ÷ (√3 × V × PF)",
  },
  {
    question: "How much capacitor kVAR do I need?",
    slug: "electrical-power-factor-calculator",
    tool: "Power Factor Correction Calculator",
    accent: "teal" as const,
    rule: "Qc = P × (tan φ₁ − tan φ₂), φ = arccos(PF)",
  },
  {
    question: "What does this appliance cost to run?",
    slug: "electrical-kwh-cost-calculator",
    tool: "kWh Cost Calculator",
    accent: "amber" as const,
    rule: "cost = W÷1,000 × hours × days × $/kWh",
  },
  {
    question: "How much does a panel upgrade cost?",
    slug: "electrical-panel-upgrade-cost-calculator",
    tool: "Panel Upgrade Cost Calculator",
    accent: "rose" as const,
    rule: "panel + meter + conductors×ft + mast + permit + labor, × region",
  },
  {
    question: "How much does it cost to rewire a house?",
    slug: "electrical-rewiring-cost-calculator",
    tool: "Rewiring Cost Calculator",
    accent: "orange" as const,
    rule: "sq ft × $/sq ft by access × age × storeys + panel + permit",
  },
  {
    question: "What hourly rate do I need to charge? (contractors)",
    slug: "electrical-labor-rate-calculator",
    tool: "Labor Rate Calculator",
    accent: "rose" as const,
    rule: "(wage + burden + overhead) ÷ billable hours ÷ (1 − margin)",
  },
];

export const electricalFaqs = [
  {
    question: "Are these electrical calculators really free?",
    answer:
      "Yes. All twenty-three are completely free, run instantly in your browser, and require no account or sign-up. They're planning and field-check tools built by TradesQuote, the AI estimating platform for trades businesses.",
  },
  {
    question: "Which NEC edition are these calculators based on?",
    answer:
      "The 2023 edition of NFPA 70 (the National Electrical Code), with 2026 changes noted on the pages where a rule actually moved. NEC 2026 was published in August 2025, but most states still enforce the 2020 or 2023 edition — check which cycle your jurisdiction has adopted, because local amendments override the model code either way.",
  },
  {
    question: "Which electrical calculator should I use first?",
    answer:
      "For a new circuit the order is Load → Wire → Breaker → Conduit/Box → Ground. If you already know the amps, start at the Wire Size Calculator. If you're sizing or upgrading a service, start at the Residential Load Calculator and follow it into the Service Size Calculator. If the job is an EV charger, the EV Charger Circuit Calculator does the whole chain including the panel-capacity check. If you only have a wattage or a horsepower rating to work from, convert it first with the Watts to Amps Calculator or the Unit Converter, then carry the amps into the sizing tools.",
  },
  {
    question: "Can I use these results to pull a permit or pass inspection?",
    answer:
      "Treat them as planning and verification tools, not as a submittal. They apply the same NEC tables and formulas an electrician works from, but they can't see your ambient conditions, existing conductors, terminal ratings, or local amendments. A licensed electrician and your AHJ have final say on anything installed.",
  },
  {
    question: "Is the 3% voltage drop limit actually a code requirement?",
    answer:
      "No — and this is one of the most widely repeated errors online. The 3% branch-circuit and 5% total figures appear in Informational Notes to NEC 210.19(A) and 215.2(A). Informational Notes are explanatory and not enforceable requirements. They are strong engineering practice and many jurisdictions and specifications adopt them as mandatory, so our calculators check against them by default and tell you when drop is the reason a conductor got upsized.",
  },
  {
    question: "Do these work for commercial and industrial work?",
    answer:
      "The load calculators are tuned for dwellings (NEC 220.82 optional method). The conductor, ampacity, breaker, conduit fill, box fill, and grounding calculators are code-general and work for commercial installations at the same voltages, and the three-phase, kVA, and power-factor tools are built for 208 V, 480 V, and 600 V systems. Commercial load calculations, motor circuits, transformer sizing, and available fault current are on the roadmap as separate tools.",
  },
  {
    question: "Do you have calculators for other trades?",
    answer:
      "Yes — there are thirty-two free HVAC calculators covering sizing, airflow, diagnostics, efficiency, and cost. Electrical is the second set, and calculators for plumbing, carpentry, painting, and cleaning are planned next, matching the trades TradesQuote supports for AI-powered estimating.",
  },
];
