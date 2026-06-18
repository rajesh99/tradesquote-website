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
    slug: "hvac-estimate-calculator",
    title: "HVAC Estimate Calculator",
    description:
      "Contractor job pricing from the bottom up — labor, equipment, materials, overhead, and true profit margin (not markup).",
    question: "What should I quote for this job?",
    accent: "rose",
    icon: `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>`,
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
];

export const hvacFaqs = [
  {
    question: "Are these HVAC calculators really free?",
    answer:
      "Yes. All eighteen are completely free, run instantly in your browser, and require no account or sign-up. They're planning and field-check tools built by TradesQuote, the AI estimating platform for trades businesses.",
  },
  {
    question: "Which HVAC calculator should I use first?",
    answer:
      "For cooling installs, the natural order is BTU → Tonnage → CFM. For field diagnostics, start with Delta T, then Static Pressure if the split is high, and Superheat or Subcooling if charge is suspect. For efficiency comparisons, use SEER (cooling), HSPF (heat pump heating), or AFUE (furnaces).",
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
