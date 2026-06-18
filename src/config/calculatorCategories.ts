export type CalculatorAccent =
  | "blue"
  | "amber"
  | "emerald"
  | "violet"
  | "sky"
  | "orange"
  | "slate";

export type CalculatorCategory = {
  slug: string;
  name: string;
  description: string;
  toolCount?: number;
  status: "live" | "coming-soon";
  accent: CalculatorAccent;
  icon: string;
};

export const calculatorCategories: CalculatorCategory[] = [
  {
    slug: "hvac",
    name: "HVAC",
    description:
      "Sizing, airflow, diagnostics, psychrometrics, ventilation, humidity control, efficiency, and cost — BTU load, tonnage, unit converter, heat pump & mini-split sizing, furnace BTU, CFM, duct size, Delta T, static pressure, superheat & subcooling, refrigerant charge, dew point, sensible & latent heat, fan laws, ventilation, humidity control, SEER, HSPF & AFUE savings, operating cost, replacement cost, and job pricing.",
    toolCount: 25,
    status: "live",
    accent: "blue",
    icon: `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M12 17h.01M9 14h.01M12 14h.01M15 14h.01M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>`,
  },
  {
    slug: "carpentry",
    name: "Carpentry",
    description:
      "Board feet, lumber takeoffs, framing estimates, and material quantities for carpentry jobs.",
    status: "coming-soon",
    accent: "amber",
    icon: `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>`,
  },
  {
    slug: "painting",
    name: "Painting",
    description:
      "Coverage per gallon, wall and ceiling area, and paint quantity estimates for interior and exterior jobs.",
    status: "coming-soon",
    accent: "violet",
    icon: `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/></svg>`,
  },
  {
    slug: "cleaning",
    name: "Cleaning",
    description:
      "Square-foot pricing, labor hours, and supply estimates for residential and commercial cleaning jobs.",
    status: "coming-soon",
    accent: "emerald",
    icon: `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>`,
  },
  {
    slug: "electrical",
    name: "Electrical",
    description:
      "Wire gauge, circuit load, conduit fill, and voltage drop calculators for electrical installations.",
    status: "coming-soon",
    accent: "sky",
    icon: `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>`,
  },
  {
    slug: "plumbing",
    name: "Plumbing",
    description:
      "Pipe sizing, flow rate, drainage slope, and fixture unit calculations for plumbing systems.",
    status: "coming-soon",
    accent: "orange",
    icon: `<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>`,
  },
];

export const accentStyles: Record<
  CalculatorAccent,
  {
    iconBg: string;
    iconColor: string;
    hoverBorder: string;
    hoverTitle: string;
    ctaColor: string;
  }
> = {
  blue: {
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    hoverBorder: "hover:border-blue-300",
    hoverTitle: "group-hover:text-blue-600",
    ctaColor: "text-blue-600",
  },
  amber: {
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    hoverBorder: "hover:border-amber-300",
    hoverTitle: "group-hover:text-amber-600",
    ctaColor: "text-amber-600",
  },
  emerald: {
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    hoverBorder: "hover:border-emerald-300",
    hoverTitle: "group-hover:text-emerald-600",
    ctaColor: "text-emerald-600",
  },
  violet: {
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    hoverBorder: "hover:border-violet-300",
    hoverTitle: "group-hover:text-violet-600",
    ctaColor: "text-violet-600",
  },
  sky: {
    iconBg: "bg-sky-100",
    iconColor: "text-sky-600",
    hoverBorder: "hover:border-sky-300",
    hoverTitle: "group-hover:text-sky-600",
    ctaColor: "text-sky-600",
  },
  orange: {
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    hoverBorder: "hover:border-orange-300",
    hoverTitle: "group-hover:text-orange-600",
    ctaColor: "text-orange-600",
  },
  slate: {
    iconBg: "bg-slate-200",
    iconColor: "text-slate-500",
    hoverBorder: "hover:border-slate-300",
    hoverTitle: "group-hover:text-slate-600",
    ctaColor: "text-slate-500",
  },
};
