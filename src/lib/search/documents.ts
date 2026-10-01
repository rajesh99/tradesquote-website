import { getCollection } from "astro:content";
import { electricalCalculators } from "@/config/electricalCalculators";
import { hvacCalculators } from "@/config/hvacCalculators";
import { plumbingCalculators } from "@/config/plumbingCalculators";
import type { SearchDocument } from "@/lib/search/rank";
import { plainify } from "@/lib/utils/textConverter";

function compact(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function guideText(body: string): string {
  const withoutImports = body.replace(/^\s*import\s.+;?\s*$/gm, " ");
  return compact(plainify(withoutImports));
}

type CalculatorEntry = {
  slug: string;
  title: string;
  description: string;
  question: string;
};

function page(doc: Omit<SearchDocument, "kind" | "tags"> & { tags?: string }): SearchDocument {
  return { ...doc, kind: "Page", tags: doc.tags ?? "" };
}

// Titles, descriptions, and short text taken from copy already on each page.
function sitePages(): SearchDocument[] {
  return [
    page({
      title: "TradesQuote — AI Estimates for Trade Contractors",
      url: "/",
      category: "",
      description:
        "TradesQuote turns your price lists and SOPs into accurate, client-ready estimates in 60 seconds. Built for HVAC, electrical, plumbing, and other trade contractors.",
      text: "AI-powered project estimation for contractors and estimators. Describe the job or attach photos. Vision AI and quality control produce professional line-item estimates. HVAC, electrical, plumbing, and other trades.",
    }),
    page({
      title: "About — TradesQuote",
      url: "/about/",
      category: "",
      description:
        "Learn why TradesQuote builds AI estimating for the trades from the ground up — so contractors send clean, line-item quotes without changing how they already work.",
      text: "Built for the trades, not adapted from generic software. Speed shouldn't cost you accuracy. HVAC, plumbing, and electrical estimates that plug into the systems contractors already run.",
    }),
    page({
      title: "Contact Us — TradesQuote",
      url: "/contact/",
      category: "",
      description:
        "Contact TradesQuote for sales, demos, billing, integrations, and partnership questions. Contractors get human replies within 24 hours on business days.",
      text: "Sales and product questions, integrations and setup, billing and account support. Simpro, Jobber, QuickBooks, Xero, and Zapier.",
    }),
    page({
      title: "Trades Blog",
      url: "/blog/",
      category: "",
      description:
        "Guides on sizing, code, field diagnostics, and estimating for HVAC and electrical contractors.",
      text: "Blog guides on HVAC and electrical sizing, code, cost, diagnostics, duct design, wire sizing, and estimating.",
    }),
    page({
      title: "Free Trade Calculators",
      url: "/calculators/",
      category: "",
      description:
        "Free online calculators for trades professionals — HVAC sizing, airflow, efficiency and cost, NEC-based electrical sizing and load calculations, and IPC-based plumbing supply, drainage and venting tools.",
      text: "HVAC, electrical, and plumbing calculators. Carpentry, painting, and cleaning coming soon.",
    }),
    page({
      title: "Free HVAC Calculators & Formulas",
      url: "/calculators/hvac/",
      category: "HVAC",
      description:
        "Free HVAC calculators — BTU sizing, tonnage, heat pump and mini-split sizing, furnace sizing, CFM, duct size, static pressure, superheat, subcooling, SEER, HSPF, operating cost, and job pricing.",
      text: "HVAC calculator hub. Manual J, BTU, tonnage, CFM, ductwork, psychrometrics, efficiency, and cost.",
    }),
    page({
      title: "Free Electrical Calculators (NEC)",
      url: "/calculators/electrical/",
      category: "Electrical",
      description:
        "Free NEC-based electrical calculators — wire size, ampacity, voltage drop, breaker sizing, load calculation, conduit and box fill, grounding, EV charger circuits, and job pricing.",
      text: "Electrical calculator hub. NEC wire size, load calculation, conduit fill, grounding, and service sizing.",
    }),
    page({
      title: "Free Plumbing Calculators (IPC)",
      url: "/calculators/plumbing/",
      category: "Plumbing",
      description:
        "Free IPC-based plumbing calculators — fixture units, pipe size, velocity, friction loss, drain slope, vents, water heaters, pump head, and job pricing.",
      text: "Plumbing calculator hub. IPC supply, drainage, venting, water heaters, and cost.",
    }),
    page({
      title: "HVAC Formula Reference",
      url: "/calculators/hvac/formulas/",
      category: "HVAC",
      description:
        "Complete HVAC formula reference: BTU load, CFM, static pressure, superheat, subcooling, SEER2, AFUE savings, fan laws, dew point, and more.",
      text: "HVAC formulas with variable definitions, normal ranges, and links to the free calculators.",
    }),
    page({
      title: "HVAC Glossary",
      url: "/calculators/hvac/glossary/",
      category: "HVAC",
      description:
        "Plain-English definitions for HVAC terms. ACH, AFUE, BTU, CFM, delta T, EER, HSPF, Manual J, SEER2, subcooling, superheat, and more.",
      text: "HVAC glossary linked to the relevant free calculators.",
    }),
    page({
      title: "Electrical Formula Reference",
      url: "/calculators/electrical/formulas/",
      category: "Electrical",
      description:
        "Complete electrical formula reference: Ohm's law, single- and three-phase power, voltage drop, ampacity derating, conduit and box fill, NEC load calculations, grounding, and contractor pricing.",
      text: "Electrical formulas with variable definitions, typical values, and free calculators.",
    }),
    page({
      title: "Electrical Glossary",
      url: "/calculators/electrical/glossary/",
      category: "Electrical",
      description:
        "Plain-English electrical glossary: ampacity, AIC, AFCI, EGC and GEC, THHN, MCA and MOCP, kVA, power factor, derating, continuous load, and more.",
      text: "Electrical glossary with NEC citations and links to free calculators.",
    }),
    page({
      title: "NEC Tables Reference",
      url: "/calculators/electrical/nec-tables/",
      category: "Electrical",
      description:
        "Free NEC lookup tables: Table 310.16 conductor ampacity, Table 310.12 dwelling services, standard OCPD ratings, ambient and bundling derating, conduit fill, box fill, and grounding tables.",
      text: "NEC tables 310.16, 310.12, 240.6(A), Chapter 9, 314.16, 250.66, and 250.122.",
    }),
    page({
      title: "Plumbing Formula Reference",
      url: "/calculators/plumbing/formulas/",
      category: "Plumbing",
      description:
        "Complete plumbing formula reference: fixture units, pipe velocity, Hazen-Williams friction loss, drain slope, Manning's equation, vent sizing, pump head, and water heater recovery.",
      text: "Plumbing formulas with IPC sections, variable definitions, and free calculators.",
    }),
    page({
      title: "Plumbing Glossary",
      url: "/calculators/plumbing/glossary/",
      category: "Plumbing",
      description:
        "Plain-English plumbing glossary from air gap and backsiphonage to trap arm, WSFU, drawdown, and wet vent, with the IPC section behind each term.",
      text: "Plumbing glossary linked to the free calculator that uses each term.",
    }),
    page({
      title: "Backflow Prevention Reference",
      url: "/calculators/plumbing/backflow-prevention/",
      category: "Plumbing",
      description:
        "Free backflow prevention reference: backpressure versus backsiphonage, hazard classes, assemblies from air gap to RPZ, and minimum air gaps.",
      text: "IPC 608 backflow assemblies, air gaps, and the device each common connection takes.",
    }),
    page({
      title: "Plumbing Formulas for Excel",
      url: "/calculators/plumbing/excel-formulas/",
      category: "Plumbing",
      description:
        "Every plumbing formula written as a Microsoft Excel formula you can paste into a cell, with IPC lookup tables and XLOOKUP versions.",
      text: "Excel formulas for pipe velocity, Hazen-Williams friction loss, drain slope, vent sizing, pump head, and water heaters.",
    }),
    page({
      title: "Plumbing Formulas for Google Sheets",
      url: "/calculators/plumbing/google-sheets-formulas/",
      category: "Plumbing",
      description:
        "Plumbing formulas that work differently in Google Sheets than in Excel: ARRAYFORMULA, QUERY, and named functions such as WSFU_TO_GPM.",
      text: "Google Sheets plumbing formulas, named functions, and the differences from Excel.",
    }),
    page({
      title: "Privacy Policy — TradesQuote",
      url: "/privacy-policy/",
      category: "",
      description:
        "Learn how Veersoft Solutions LLC collects, uses, and protects your information when you use TradesQuote.ai.",
      text: "Privacy policy. Information we collect, how we use it, Jobber integration, and your rights.",
    }),
    page({
      title: "Terms of Service — TradesQuote",
      url: "/terms-of-service/",
      category: "",
      description:
        "Read the Terms of Service for TradesQuote, outlining your rights and responsibilities when using our AI-powered quoting platform.",
      text: "Acceptance of terms, description of service, accounts, acceptable use, and contact.",
    }),
    page({
      title: "HVAC Estimating Software",
      url: "/hvac-ai-estimator/",
      category: "",
      description:
        "Stop doing HVAC estimates at 11pm. TradesQuote generates complete, line-item HVAC estimates in seconds — built on your price book. Push straight to Simpro or Jobber.",
      text: "HVAC AI estimator. Line-item estimates from your price book, pushed to Simpro or Jobber. 14-day trial.",
    }),
    page({
      title: "Simpro Integration — TradesQuote",
      url: "/simpro-integration/",
      category: "Integrations",
      description:
        "Connect TradesQuote with Simpro in minutes. Push estimates as Quotes with OAuth 2.0 — no manual re-entry, full traceability, and automatic token refresh.",
      text: "Simpro integration. Push line items, quantities, and prices into Simpro as a structured Quote.",
    }),
    page({
      title: "Jobber Integration — TradesQuote",
      url: "/getjobber-integration/",
      category: "Integrations",
      description:
        "Connect TradesQuote with Jobber in minutes. Push estimates as Quotes with OAuth 2.0 — no manual re-entry, full traceability, and automatic token refresh.",
      text: "Jobber integration. Push line items, quantities, and prices into Jobber as a structured Quote.",
    }),
    page({
      title: "QuickBooks Integration — TradesQuote",
      url: "/quickbooks-integration/",
      category: "Integrations",
      description:
        "Coming soon: Connect TradesQuote with QuickBooks Online. Push accepted estimates as invoices automatically — no double data entry, customers synced, accounting always up to date.",
      text: "QuickBooks Online integration. Accepted estimate becomes a draft invoice with line items, quantities, and prices.",
    }),
    page({
      title: "Xero Integration — TradesQuote",
      url: "/xero-integration/",
      category: "Integrations",
      description:
        "Coming soon: Connect TradesQuote with Xero. Push accepted estimates as invoices automatically — no double data entry, contacts synced, and your books always current.",
      text: "Xero integration. Accepted estimate becomes a draft invoice with every line item, quantity, and price.",
    }),
    page({
      title: "Zapier Integration — TradesQuote",
      url: "/zapier-integration/",
      category: "Integrations",
      description:
        "Coming soon: Connect TradesQuote to 7,000+ apps via Zapier. Automate your estimate workflow — trigger actions when estimates are created, accepted, or updated, no code required.",
      text: "Zapier integration. Google Sheets, Slack, HubSpot, Mailchimp, Trello, and thousands more. No developer needed.",
    }),
  ];
}

function faqDocs(): SearchDocument[] {
  const items = [
    {
      title: "What is TradesQuote and how does it work?",
      description:
        "TradesQuote.AI is an AI-powered project estimation platform designed for contractors and estimators. It generates detailed, professional line-item estimates in seconds. You simply describe the job or attach photos, and the system’s Vision AI and Quality Control Agent handle the calculations and validation.",
    },
    {
      title: "Can the AI learn my business's specific pricing?",
      description:
        "The platform features a Knowledge Base where you can upload PDFs, images, and documents related to your past projects. The AI uses this data to ensure estimates reflect your real-world pricing rather than generic averages. Additionally, the system learns from you by adapting to any manual corrections you make over time.",
    },
    {
      title: "How does the platform ensure the accuracy of its estimates?",
      description:
        "Accuracy is maintained through a multi-layered process. Vision AI analyzes project photos or image links to inform the estimate. The Knowledge Base uses your specific historical data for context. The Quality Control Agent automatically validates every estimate to check for pricing consistency and line-item accuracy.",
    },
  ];

  return items.map((item) => ({
    title: item.title,
    url: "/#faq",
    kind: "FAQ",
    category: "FAQ",
    description: item.description,
    tags: "",
    text: compact(item.description),
  }));
}

function calculatorDocs(trade: string, category: string, calculators: CalculatorEntry[]): SearchDocument[] {
  return calculators.map((calc) => ({
    title: calc.title,
    url: `/calculators/${trade}/${calc.slug}/`,
    kind: "Calculator",
    category,
    description: calc.description,
    tags: "",
    text: compact(`${calc.description} ${calc.question}`),
  }));
}

export async function getSearchDocuments(): Promise<SearchDocument[]> {
  const posts = await getCollection("posts");

  const postDocs: SearchDocument[] = posts
    .filter((post) => post.id.match(/^(?!-)/) && post.data.draft !== true)
    .map((post) => {
      const { title, description, categories, tags } = post.data;
      const body = typeof post.body === "string" ? post.body : "";
      const tagText = [...categories, ...tags].join(" ");

      return {
        title,
        url: `/blog/${post.id}/`,
        kind: "Guide",
        category: categories.join(" · "),
        description: description ?? "",
        tags: tagText,
        text: guideText(body),
      };
    });

  return [
    ...sitePages(),
    ...faqDocs(),
    ...calculatorDocs("hvac", "HVAC", hvacCalculators),
    ...calculatorDocs("electrical", "Electrical", electricalCalculators),
    ...calculatorDocs("plumbing", "Plumbing", plumbingCalculators),
    ...postDocs,
  ];
}
