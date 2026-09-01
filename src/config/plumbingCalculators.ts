/**
 * Plumbing calculator registry — mirrors `hvacCalculators.ts` and
 * `electricalCalculators.ts` so the shared hub components work unchanged.
 *
 * Registering a calculator takes FOUR edits, not two:
 *   1. `plumbingCalculators` below,
 *   2. a slug in one of the `plumbingCalculatorGroups`,
 *   3. a row in `plumbingCalculatorGuide`,
 *   4. the page + the script.
 *
 * The electrical category learned this the hard way: its hub renders group slug
 * lists while its badge counts the calculator array, so five registered-but-
 * ungrouped calculators silently vanished from the hub. `ungroupedPlumbing`
 * below closes that hole — the hub renders whatever lands in it, so a forgotten
 * group entry is visible instead of invisible.
 */

export type PlumbingCalculatorAccent =
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
  | "red";

export type PlumbingCalculator = {
  slug: string;
  title: string;
  description: string;
  question: string;
  accent: PlumbingCalculatorAccent;
  icon: string;
};

const ICON_CALCULATOR = `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M12 17h.01M9 14h.01M12 14h.01M15 14h.01M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>`;
const ICON_RESIZE = `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/></svg>`;
const ICON_BOLT = `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>`;
const ICON_TRENDING_DOWN = `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"/></svg>`;
const ICON_CLIPBOARD = `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>`;
const ICON_DOWNLOAD = `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>`;
const ICON_SLOPE = `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6l16 12M4 18h16"/></svg>`;
const ICON_ARROW_UP = `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18"/></svg>`;
const ICON_GAUGE = `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3v3l2.5 2.5"/></svg>`;
const ICON_PUMP = `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 21V9m0 0L7 14m5-5l5 5M5 5h14"/></svg>`;
const ICON_FLAME = `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/></svg>`;
const ICON_DROP = `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/></svg>`;
const ICON_CURRENCY = `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;
const ICON_HOME = `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>`;
const ICON_CLOCK = `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;

export const plumbingCalculators: PlumbingCalculator[] = [
  {
    slug: "plumbing-water-supply-fixture-unit-calculator",
    title: "Water Supply Fixture Unit Calculator",
    description:
      "Add up the water supply fixture units for a building and convert them to probable peak demand in gpm — the number every supply pipe is sized from.",
    question: "How many fixture units is my house?",
    accent: "blue",
    icon: ICON_CALCULATOR,
  },
  {
    slug: "plumbing-pipe-size-calculator",
    title: "Water Pipe Size Calculator",
    description:
      "Size a water supply line from peak demand, available pressure, and run length — checked against both the velocity ceiling and the friction budget.",
    question: "What size water line do I need?",
    accent: "sky",
    icon: ICON_RESIZE,
  },
  {
    slug: "plumbing-pipe-velocity-calculator",
    title: "Pipe Velocity Calculator",
    description:
      "Water velocity in ft/s for any flow and pipe size, against the 8 ft/s cold and 5 ft/s hot limits that keep a system quiet and erosion-free.",
    question: "How fast is water moving in a 3/4 inch pipe?",
    accent: "cyan",
    icon: ICON_BOLT,
  },
  {
    slug: "plumbing-friction-loss-calculator",
    title: "Pipe Friction Loss Calculator",
    description:
      "Hazen-Williams pressure loss per 100 ft for copper, PEX, CPVC, PVC, and galvanized steel, plus the pressure left over for the run.",
    question: "How much pressure do I lose over 100 feet?",
    accent: "teal",
    icon: ICON_TRENDING_DOWN,
  },
  {
    slug: "plumbing-drainage-fixture-unit-calculator",
    title: "Drainage Fixture Unit Calculator",
    description:
      "Total the drainage fixture units for any set of fixtures using IPC Table 709.1, with the minimum trap size for each one.",
    question: "How many DFU is a bathroom group?",
    accent: "emerald",
    icon: ICON_CLIPBOARD,
  },
  {
    slug: "plumbing-drain-pipe-size-calculator",
    title: "Drain Pipe Size Calculator",
    description:
      "Size a building drain, sewer, horizontal branch, or stack from its DFU load using IPC Tables 710.1(1) and 710.1(2).",
    question: "What size drain pipe do I need?",
    accent: "indigo",
    icon: ICON_DOWNLOAD,
  },
  {
    slug: "plumbing-pipe-slope-calculator",
    title: "Drain Pipe Slope Calculator",
    description:
      "Minimum code slope by pipe size, total fall over any run, and the percent grade — plus what happens when a drain is laid too flat or too steep.",
    question: "What slope does a drain pipe need?",
    accent: "violet",
    icon: ICON_SLOPE,
  },
  {
    slug: "plumbing-vent-size-calculator",
    title: "Vent Pipe Size Calculator",
    description:
      "Individual and branch vent size per IPC 906.2, with the Table 909.1 maximum distance from the trap weir to the vent fitting.",
    question: "What size vent pipe do I need?",
    accent: "rose",
    icon: ICON_ARROW_UP,
  },
  {
    slug: "plumbing-water-pressure-calculator",
    title: "Water Pressure Calculator",
    description:
      "Convert psi to feet of head and back, subtract the elevation loss to the highest fixture, and check whether IPC 604.8 requires a pressure-reducing valve.",
    question: "How much pressure do I lose going up a storey?",
    accent: "amber",
    icon: ICON_GAUGE,
  },
  {
    slug: "plumbing-pump-head-calculator",
    title: "Pump Head Calculator",
    description:
      "Total dynamic head for a sump, well, or booster pump — static lift, friction head, pressure head, and velocity head added up properly.",
    question: "What head does my pump need?",
    accent: "orange",
    icon: ICON_PUMP,
  },
  {
    slug: "plumbing-water-heater-size-calculator",
    title: "Water Heater Size Calculator",
    description:
      "Peak-hour hot water demand against first-hour rating and recovery rate, to land on the tank size that actually keeps up.",
    question: "What size water heater do I need?",
    accent: "red",
    icon: ICON_FLAME,
  },
  {
    slug: "plumbing-tankless-water-heater-calculator",
    title: "Tankless Water Heater Calculator",
    description:
      "The flow a tankless unit can hold at your temperature rise, and the BTU input a target flow needs — the calculation cold climates get wrong.",
    question: "What size tankless water heater do I need?",
    accent: "blue",
    icon: ICON_DROP,
  },
  {
    slug: "plumbing-estimate-calculator",
    title: "Plumbing Estimate Calculator",
    description:
      "Price a plumbing job from labour hours, fixtures, and material, with overhead and the markup-versus-margin difference shown side by side.",
    question: "How do I price a plumbing job?",
    accent: "emerald",
    icon: ICON_CURRENCY,
  },
  {
    slug: "plumbing-repipe-cost-calculator",
    title: "Repipe Cost Calculator",
    description:
      "Whole-house repipe cost by floor area, pipe material, wall access, and storeys — the access factor moves the total more than the pipe does.",
    question: "How much does it cost to repipe a house?",
    accent: "indigo",
    icon: ICON_HOME,
  },
  {
    slug: "plumbing-water-heater-replacement-cost-calculator",
    title: "Water Heater Replacement Cost Calculator",
    description:
      "Installed cost to replace a water heater — tank or tankless, gas or electric — including the code upgrades that catch people out.",
    question: "How much does a new water heater cost installed?",
    accent: "amber",
    icon: ICON_FLAME,
  },
  {
    slug: "plumbing-labor-rate-calculator",
    title: "Plumbing Labor Rate Calculator",
    description:
      "Turn a plumber's wage into the hourly rate you have to bill — payroll burden, overhead, and billable utilisation, which matters most of all.",
    question: "What should I charge per hour as a plumber?",
    accent: "teal",
    icon: ICON_CLOCK,
  },
];

export type PlumbingCalculatorGroup = {
  label: string;
  description: string;
  slugs: string[];
};

export const plumbingCalculatorGroups: PlumbingCalculatorGroup[] = [
  {
    label: "Water Supply & Pipe Sizing",
    description:
      "Work out the demand, then size the pipe that carries it. Start at fixture units and finish with a nominal size that satisfies both velocity and pressure.",
    slugs: [
      "plumbing-water-supply-fixture-unit-calculator",
      "plumbing-pipe-size-calculator",
      "plumbing-pipe-velocity-calculator",
      "plumbing-friction-loss-calculator",
    ],
  },
  {
    label: "Drainage, Waste & Vent",
    description:
      "Gravity side of the system. Total the drainage fixture units, size the drain, set the fall, and vent it so the traps hold their seal.",
    slugs: [
      "plumbing-drainage-fixture-unit-calculator",
      "plumbing-drain-pipe-size-calculator",
      "plumbing-pipe-slope-calculator",
      "plumbing-vent-size-calculator",
    ],
  },
  {
    label: "Pressure & Pump Head",
    description:
      "Pressure is head and head is pressure. Convert between them, find what is left at the top fixture, and size a pump against the total it has to lift.",
    slugs: ["plumbing-water-pressure-calculator", "plumbing-pump-head-calculator"],
  },
  {
    label: "Water Heating",
    description:
      "Storage and tankless sized the way they actually fail — on peak-hour demand for a tank, and on temperature rise for a tankless.",
    slugs: [
      "plumbing-water-heater-size-calculator",
      "plumbing-tankless-water-heater-calculator",
    ],
  },
  {
    label: "Cost & Business",
    description:
      "What the job is worth and what it costs you to show up. Job pricing, the two biggest replacement tickets, and the rate that has to cover everything.",
    slugs: [
      "plumbing-estimate-calculator",
      "plumbing-repipe-cost-calculator",
      "plumbing-water-heater-replacement-cost-calculator",
      "plumbing-labor-rate-calculator",
    ],
  },
];

/**
 * Guard against the registered-but-ungrouped bug. The hub renders this list in
 * a trailing group, so a calculator added to `plumbingCalculators` without a
 * group entry still shows up — visibly wrong rather than silently missing.
 */
const groupedSlugs = new Set(plumbingCalculatorGroups.flatMap((g) => g.slugs));
export const ungroupedPlumbingCalculators = plumbingCalculators.filter(
  (c) => !groupedSlugs.has(c.slug),
);

export const plumbingAccentStyles: Record<
  PlumbingCalculatorAccent,
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
};

export const plumbingCalculatorGuide = [
  {
    question: "How many fixture units is this building?",
    slug: "plumbing-water-supply-fixture-unit-calculator",
    tool: "Water Supply Fixture Units",
    accent: "blue" as const,
    rule: "Add the WSFU weights, then read peak gpm off the demand curve",
  },
  {
    question: "What size water line do I need?",
    slug: "plumbing-pipe-size-calculator",
    tool: "Water Pipe Size",
    accent: "sky" as const,
    rule: "Smallest size that passes BOTH the velocity cap and the friction budget",
  },
  {
    question: "Is my pipe going to be noisy?",
    slug: "plumbing-pipe-velocity-calculator",
    tool: "Pipe Velocity",
    accent: "cyan" as const,
    rule: "V = 0.4085 x gpm / ID squared; keep under 8 ft/s cold, 5 ft/s hot",
  },
  {
    question: "How much pressure will the run cost me?",
    slug: "plumbing-friction-loss-calculator",
    tool: "Friction Loss",
    accent: "teal" as const,
    rule: "Hazen-Williams psi per 100 ft, then multiply by developed length",
  },
  {
    question: "How many DFU do these fixtures add up to?",
    slug: "plumbing-drainage-fixture-unit-calculator",
    tool: "Drainage Fixture Units",
    accent: "emerald" as const,
    rule: "IPC Table 709.1 — a bathroom group is 5 DFU at 1.6 gpf",
  },
  {
    question: "What size drain or sewer do I need?",
    slug: "plumbing-drain-pipe-size-calculator",
    tool: "Drain Pipe Size",
    accent: "indigo" as const,
    rule: "DFU into Table 710.1(1) for drains, 710.1(2) for branches and stacks",
  },
  {
    question: "How much fall does this drain need?",
    slug: "plumbing-pipe-slope-calculator",
    tool: "Drain Pipe Slope",
    accent: "violet" as const,
    rule: "1/4 in/ft up to 2-1/2 in, 1/8 in/ft for 3 to 6 in, 1/16 in/ft at 8 in",
  },
  {
    question: "What size vent, and how far can the trap sit?",
    slug: "plumbing-vent-size-calculator",
    tool: "Vent Pipe Size",
    accent: "rose" as const,
    rule: "Half the drain diameter, minimum 1-1/4 in; trap arm capped by Table 909.1",
  },
  {
    question: "Do I need a pressure-reducing valve?",
    slug: "plumbing-water-pressure-calculator",
    tool: "Water Pressure",
    accent: "amber" as const,
    rule: "0.433 psi per foot of lift; IPC 604.8 requires a PRV above 80 psi",
  },
  {
    question: "What head does the pump have to make?",
    slug: "plumbing-pump-head-calculator",
    tool: "Pump Head",
    accent: "orange" as const,
    rule: "TDH = static lift + friction + pressure + velocity head",
  },
  {
    question: "What size water heater do I need?",
    slug: "plumbing-water-heater-size-calculator",
    tool: "Water Heater Size",
    accent: "red" as const,
    rule: "Peak-hour demand against first-hour rating, not against tank gallons",
  },
  {
    question: "Will a tankless keep up in winter?",
    slug: "plumbing-tankless-water-heater-calculator",
    tool: "Tankless Water Heater",
    accent: "blue" as const,
    rule: "gpm = BTU/hr x efficiency / (500 x temperature rise)",
  },
  {
    question: "What should I quote for this job?",
    slug: "plumbing-estimate-calculator",
    tool: "Plumbing Estimate",
    accent: "emerald" as const,
    rule: "Direct cost + overhead, then divide by (1 - margin), never multiply",
  },
  {
    question: "What does a whole-house repipe cost?",
    slug: "plumbing-repipe-cost-calculator",
    tool: "Repipe Cost",
    accent: "indigo" as const,
    rule: "Dollars per square foot, driven mostly by how open the walls are",
  },
  {
    question: "What does a water heater swap cost?",
    slug: "plumbing-water-heater-replacement-cost-calculator",
    tool: "Water Heater Replacement Cost",
    accent: "amber" as const,
    rule: "Unit + labour + the code upgrades the inspector will want",
  },
  {
    question: "What hourly rate do I need to charge?",
    slug: "plumbing-labor-rate-calculator",
    tool: "Plumbing Labor Rate",
    accent: "teal" as const,
    rule: "Wage + burden + overhead, divided by BILLABLE hours, then by margin",
  },
];

export const plumbingFaqs = [
  {
    question: "Are these plumbing calculators free?",
    answer:
      "Yes. Every one of them runs in your browser, needs no sign-up, and stores nothing. They exist because we build estimating software for trades and would rather be useful to plumbers before we ever ask for anything.",
  },
  {
    question: "Which calculator should I start with?",
    answer:
      'For a water supply job the order is <strong>fixture units → peak demand → pipe size</strong>, so start with the <a href="/calculators/plumbing/plumbing-water-supply-fixture-unit-calculator" class="font-semibold text-orange-600 underline decoration-orange-300 hover:decoration-orange-600">Water Supply Fixture Unit Calculator</a>. For a drainage job it is <strong>DFU → drain size → slope → vent</strong>, starting with the <a href="/calculators/plumbing/plumbing-drainage-fixture-unit-calculator" class="font-semibold text-orange-600 underline decoration-orange-300 hover:decoration-orange-600">Drainage Fixture Unit Calculator</a>. The "Which calculator do I need?" table above maps a question to a tool directly.',
  },
  {
    question: "Which plumbing code are these based on?",
    answer:
      'The <strong>2021 International Plumbing Code</strong>, and every page names the table or section it uses. That matters because the IPC is a model code — roughly fifteen states use the <strong>UPC</strong> or a UPC derivative such as California\'s CPC instead, and fixture-unit values and sizing tables differ between them. Confirm the edition your jurisdiction actually enforces before you pull a permit. The <a href="/calculators/plumbing/formulas" class="font-semibold text-orange-600 underline decoration-orange-300 hover:decoration-orange-600">Plumbing Formula Reference</a> lists every formula with its citation.',
  },
  {
    question: "How accurate are they compared with a full design?",
    answer:
      "Accurate enough to size a residential or light-commercial job and to sanity-check someone else's numbers, and they show their working so you can see exactly what governed. They are not a substitute for a stamped design on a large or unusual building, and they deliberately say so where the method has limits — the vent calculator, for instance, handles individual and branch vents but hands multi-storey vent stacks back to IPC Table 906.1.",
  },
  {
    question: "Do you have calculators for other trades?",
    answer:
      'Yes — there are free <a href="/calculators/hvac" class="font-semibold text-orange-600 underline decoration-orange-300 hover:decoration-orange-600">HVAC calculators</a> and <a href="/calculators/electrical" class="font-semibold text-orange-600 underline decoration-orange-300 hover:decoration-orange-600">electrical calculators</a> built the same way, on ACCA and NEC data respectively. Carpentry, painting, and cleaning are still to come.',
  },
  {
    question: "Why does gas piping sit under HVAC?",
    answer:
      'Because it is the same IFGC table either trade reads. Rather than build a second copy, the <a href="/calculators/hvac/hvac-gas-line-sizing-calculator" class="font-semibold text-orange-600 underline decoration-orange-300 hover:decoration-orange-600">Gas Line Sizing Calculator</a> is shared, and the gas-load formula on the plumbing formula reference links straight to it.',
  },
];
