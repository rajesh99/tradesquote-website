export type TaxonomyFaq = {
  question: string;
  answer: string;
};

export type TaxonomyRelatedLink = {
  label: string;
  href: string;
};

export type TaxonomySeo = {
  title?: string;
  description?: string;
  intro: string[];
  faqs?: TaxonomyFaq[];
  relatedLinks?: TaxonomyRelatedLink[];
};

export const categorySeo: Record<string, TaxonomySeo> = {
  hvac: {
    title: "HVAC",
    description:
      "HVAC articles for contractors covering load calculation, tonnage, duct sizing, SEER savings, refrigerant diagnostics, and replacement cost guides.",
    intro: [
      "This HVAC category collects contractor-focused guides on sizing, airflow, efficiency ratings, and field diagnostics. Use it when you need a practical starting point for Manual J thinking, tonnage rules of thumb, duct design, or explaining cost and efficiency choices to a customer.",
      "Posts here emphasize how estimates and calculations show up on real jobs — cooling load, CFM, static pressure, AFUE and SEER tradeoffs, heat pumps in cold climates, and when a calculator is enough versus when a full ACCA workflow is required.",
      "Browse the articles below, then jump into the free HVAC calculator hub if you want interactive tools for tonnage, duct size, SEER savings, Manual J estimates, and more.",
    ],
    faqs: [
      {
        question: "What HVAC topics does this category cover?",
        answer:
          "Sizing and load calculation, ductwork and airflow, efficiency ratings (SEER, SEER2, AFUE, HSPF), refrigerant diagnostics, ventilation, humidity control, and replacement or operating cost guidance for contractors.",
      },
      {
        question: "Are these guides a substitute for Manual J or code compliance?",
        answer:
          "No. They explain concepts and estimating shortcuts so you can quote faster and communicate clearly. Final equipment selection and code compliance still require professional judgment and, when required, a full ACCA Manual J / Manual D process.",
      },
    ],
    relatedLinks: [
      { label: "HVAC calculators", href: "/calculators/hvac/" },
      { label: "HVAC AI estimator", href: "/hvac-ai-estimator" },
      { label: "All blog tags", href: "/blog/tags/" },
    ],
  },
  electrical: {
    title: "Electrical",
    description:
      "Electrical articles for contractors covering NEC basics, wire sizing, panels, load calculations, voltage drop, and estimating guidance.",
    intro: [
      "This electrical category gathers practical articles for electricians and estimators who need clear explanations of NEC concepts, conductor sizing, panel work, and job pricing — without burying the answer under marketing fluff.",
      "Expect coverage of ampacity, breaker sizing, voltage drop, service and feeder topics, GFCI/AFCI issues, and how those calculations feed into professional estimates customers can understand.",
      "When you need interactive tools, pair these articles with the electrical calculator hub for wire size, voltage drop, load calculations, and related estimators.",
    ],
    faqs: [
      {
        question: "Who are these electrical articles for?",
        answer:
          "Licensed electricians, apprentices, and trade estimators who need concise references for sizing, code-aware planning, troubleshooting context, and quoting electrical work.",
      },
      {
        question: "Do these posts replace the NEC or engineered designs?",
        answer:
          "No. They help you learn and estimate more efficiently. Always follow the applicable edition of the NEC, local amendments, manufacturer instructions, and engineered designs where required.",
      },
    ],
    relatedLinks: [
      { label: "Electrical calculators", href: "/calculators/electrical/" },
      { label: "All blog tags", href: "/blog/tags/" },
      { label: "Blog home", href: "/blog/" },
    ],
  },
};

export const tagSeo: Record<string, TaxonomySeo> = {
  "ac-cost": {
    description:
      "AC cost articles for contractors covering installation pricing, replacement budgets, and how to explain cooling system costs to customers.",
    intro: [
      "AC cost tags collect guides that help contractors frame air conditioning pricing — equipment, labor, ductwork, and the extras that change a quote after the first walkthrough.",
      "Use these articles when a homeowner asks what a new system should cost, when you need language for line items, or when you want a clearer way to compare repair versus replace scenarios.",
      "Pair the reading with installation and operating-cost calculators so your estimate starts from numbers you can defend on the job.",
    ],
    faqs: [
      {
        question: "What drives AC replacement cost the most?",
        answer:
          "Tonnage and efficiency tier, duct condition, electrical upgrades, permit and disposal fees, and whether the job is a like-for-like swap or a full system redesign.",
      },
    ],
    relatedLinks: [
      { label: "AC installation cost calculator", href: "/calculators/hvac/hvac-ac-installation-cost-calculator/" },
      { label: "HVAC replacement cost calculator", href: "/calculators/hvac/hvac-replacement-cost-calculator/" },
    ],
  },
  "ac-installation": {
    description:
      "AC installation guides for contractors covering process, cost drivers, and what to include in a professional install estimate.",
    intro: [
      "AC installation articles focus on what happens between accepting the job and commissioning the system — scope, materials, labor sequencing, and the checklist items that prevent callbacks.",
      "Contractors use this tag when writing proposals, training newer techs on install expectations, or explaining to customers why two quotes for the “same tonnage” are not the same job.",
    ],
    relatedLinks: [
      { label: "AC installation cost calculator", href: "/calculators/hvac/hvac-ac-installation-cost-calculator/" },
    ],
  },
  "ac-rating": {
    description:
      "Air conditioner rating articles covering SEER, SEER2, and how efficiency ratings affect comfort, operating cost, and sales conversations.",
    intro: [
      "AC rating posts explain how efficiency labels translate into real operating cost and equipment choices. They help you talk about SEER and SEER2 without overselling numbers customers will not feel on every bill.",
      "Read these when comparing equipment tiers, estimating savings claims, or deciding what efficiency level belongs in a competitive but honest proposal.",
    ],
    relatedLinks: [
      { label: "SEER savings calculator", href: "/calculators/hvac/hvac-seer-savings-calculator/" },
    ],
  },
  "ac-tonnage": {
    description:
      "AC tonnage articles on sizing cooling capacity, square-foot rules of thumb, and when to move beyond tons-per-sq-ft shortcuts.",
    intro: [
      "AC tonnage content helps contractors size cooling capacity more carefully — including when square-foot rules of thumb are useful for a quick check and when they become a liability.",
      "These guides cover tons, BTU, room and whole-home context, and the load factors (insulation, glass, climate, occupancy) that change the answer on site.",
    ],
    faqs: [
      {
        question: "Is tons per square foot enough for final sizing?",
        answer:
          "It is a starting estimate only. Final equipment selection should account for climate, envelope, orientation, and a proper load calculation when the job requires it.",
      },
    ],
    relatedLinks: [
      { label: "Tonnage calculator", href: "/calculators/hvac/hvac-tonnage-calculator/" },
      { label: "AC tonnage per sq ft calculator", href: "/calculators/hvac/hvac-ac-tonnage-per-square-foot-calculator/" },
    ],
  },
  ac: {
    description:
      "Air conditioning articles for contractors on sizing, cost, ratings, and diagnosing common AC performance issues.",
    intro: [
      "The AC tag groups air conditioning articles that span sizing, cost, ratings, and service context. It is a broad entry point when you are not sure which narrower HVAC tag fits yet.",
      "Start here for overview pieces, then follow related tags like ac tonnage, ac cost, or refrigerant diagnostics for deeper detail.",
    ],
    relatedLinks: [
      { label: "HVAC calculators", href: "/calculators/hvac/" },
    ],
  },
  "affinity-laws": {
    description:
      "Fan affinity laws articles explaining how CFM, RPM, static pressure, and brake horsepower scale for HVAC blowers and fans.",
    intro: [
      "Affinity laws posts show how fan speed changes ripple into airflow, pressure, and power. They are useful when diagnosing blower performance, evaluating VFD changes, or explaining why “a little more speed” is not free.",
      "Use these guides with fan-laws calculators when you need quick what-if numbers before committing to a field adjustment.",
    ],
    relatedLinks: [
      { label: "Fan laws calculator", href: "/calculators/hvac/hvac-fan-laws-calculator/" },
    ],
  },
  afue: {
    description:
      "AFUE articles for furnace efficiency, savings conversations, and when a higher AFUE rating is worth the upgrade cost.",
    intro: [
      "AFUE content helps contractors translate Annual Fuel Utilization Efficiency into customer language — what the percentage means, where savings come from, and when an upgrade pays back slowly.",
      "These articles pair well with AFUE savings calculators and furnace replacement cost guides when you are building a heating proposal.",
    ],
    relatedLinks: [
      { label: "AFUE savings calculator", href: "/calculators/hvac/hvac-afue-savings-calculator/" },
      { label: "Furnace replacement cost calculator", href: "/calculators/hvac/hvac-furnace-replacement-cost-calculator/" },
    ],
  },
  "air-conditioner-size": {
    description:
      "Air conditioner size guides covering BTU, tonnage, room sizing, and whole-home cooling capacity for contractors.",
    intro: [
      "Air conditioner size articles focus on matching capacity to the space — from room BTU charts to whole-home tonnage discussions and the limits of rule-of-thumb sizing.",
      "Read them before quoting a swap that assumes the old unit was sized correctly, or when a customer asks for a bigger system because last summer felt hot.",
    ],
    relatedLinks: [
      { label: "BTU calculator", href: "/calculators/hvac/hvac-btu-calculator/" },
      { label: "Tonnage calculator", href: "/calculators/hvac/hvac-tonnage-calculator/" },
    ],
  },
  "air-conditioner": {
    description:
      "Air conditioner articles for contractors on sizing, cost, efficiency, installation, and performance troubleshooting.",
    intro: [
      "This air conditioner tag collects practical cooling-system content for field and sales teams. Topics range from how big a system should be to what it costs to run and when performance complaints point to charge, airflow, or envelope issues.",
      "Use it as a hub, then narrow into cost, tonnage, SEER, or diagnostics tags when you need a more specific answer.",
    ],
    relatedLinks: [
      { label: "HVAC calculators", href: "/calculators/hvac/" },
    ],
  },
  "ashrae-62-2": {
    description:
      "ASHRAE 62.2 ventilation articles explaining residential outdoor air requirements and how contractors apply them in practice.",
    intro: [
      "ASHRAE 62.2 posts cover residential ventilation rates, why tight homes need planned outdoor air, and how HRV/ERV choices interact with comfort and IAQ goals.",
      "Contractors reach for this tag when a retrofit makes the envelope tighter, when a customer asks about stale air, or when local code references 62.2-style ventilation.",
    ],
    relatedLinks: [
      { label: "Ventilation calculator", href: "/calculators/hvac/hvac-ventilation-calculator/" },
      { label: "ACH ventilation calculator", href: "/calculators/hvac/hvac-ach-ventilation-calculator/" },
    ],
  },
  "balance-point": {
    description:
      "Heat pump balance point articles explaining when backup heat takes over and how climate affects cold-weather performance.",
    intro: [
      "Balance point content helps explain where a heat pump’s capacity meets the building load — and what that means for backup heat, comfort, and operating cost in colder weather.",
      "Use these articles when sizing heat pumps for cold climates or when customers worry the system will “quit” below a certain outdoor temperature.",
    ],
    relatedLinks: [
      { label: "Heat pump calculator", href: "/calculators/hvac/hvac-heat-pump-calculator/" },
    ],
  },
  blower: {
    description:
      "Blower and airflow articles covering CFM, static pressure, fan laws, and diagnosing underperforming HVAC blowers.",
    intro: [
      "Blower-tagged posts connect motor speed, duct restriction, and delivered CFM. They are written for technicians who need to interpret symptoms like weak airflow, high static, or noisy fans.",
      "Combine them with static pressure and fan-laws tools when you are verifying whether the air handler can actually move the CFM the coil needs.",
    ],
    relatedLinks: [
      { label: "CFM calculator", href: "/calculators/hvac/hvac-cfm-calculator/" },
      { label: "Static pressure calculator", href: "/calculators/hvac/hvac-static-pressure-calculator/" },
    ],
  },
  "central-ac": {
    description:
      "Central air conditioning articles on sizing, ducted systems, cost, and comparing central AC to other cooling options.",
    intro: [
      "Central AC articles focus on ducted whole-home cooling — sizing, distribution, efficiency, and the install details that separate a clean quote from a problem job.",
      "They are useful when comparing central systems to mini-splits, or when explaining why duct repairs belong in the cooling proposal.",
    ],
    relatedLinks: [
      { label: "Tonnage calculator", href: "/calculators/hvac/hvac-tonnage-calculator/" },
      { label: "Duct size calculator", href: "/calculators/hvac/hvac-duct-size-calculator/" },
    ],
  },
  charge: {
    description:
      "Refrigerant charge articles on overcharge vs undercharge symptoms, weighing in charge, and related diagnostics.",
    intro: [
      "Charge-related posts help technicians reason about refrigerant quantity without guessing from suction pressure alone. Expect discussion of symptoms, measurement context, and why airflow problems get misdiagnosed as charge problems.",
      "Use alongside superheat and subcooling guides when commissioning or troubleshooting a system.",
    ],
    relatedLinks: [
      { label: "Refrigerant charge calculator", href: "/calculators/hvac/hvac-refrigerant-charge-calculator/" },
      { label: "Superheat calculator", href: "/calculators/hvac/hvac-superheat-calculator/" },
    ],
  },
  "cold-climate": {
    description:
      "Cold-climate HVAC articles on heat pump sizing, balance point, and heating performance in low outdoor temperatures.",
    intro: [
      "Cold-climate content focuses on heating capacity when outdoor temperatures drop — heat pump selection, backup strategies, and setting customer expectations honestly.",
      "Read these before quoting heat pumps in northern markets or when a homeowner has heard conflicting claims about winter performance.",
    ],
    relatedLinks: [
      { label: "Heat pump calculator", href: "/calculators/hvac/hvac-heat-pump-calculator/" },
      { label: "HSPF savings calculator", href: "/calculators/hvac/hvac-hspf-savings-calculator/" },
    ],
  },
  "commercial-hvac": {
    description:
      "Commercial HVAC articles covering load rules of thumb, tonnage per square foot, and estimating considerations for commercial spaces.",
    intro: [
      "Commercial HVAC posts highlight how commercial load and estimating differ from residential work — occupancy, ventilation, diversity, and why a single tons-per-sq-ft number is rarely enough.",
      "Use them for early budgeting conversations, then move to detailed load methods when the project requires engineered precision.",
    ],
    relatedLinks: [
      { label: "Cooling tower tonnage calculator", href: "/calculators/hvac/hvac-cooling-tower-tonnage-calculator/" },
      { label: "HVAC calculators", href: "/calculators/hvac/" },
    ],
  },
  condensation: {
    description:
      "Condensation and humidity articles explaining why moisture forms on HVAC equipment and how to diagnose related comfort issues.",
    intro: [
      "Condensation articles connect dew point, coil temperature, and building moisture to the wet spots customers notice on vents, windows, or equipment.",
      "Technicians use this tag when explaining sweaty ducts, secondary drain issues, or why oversized equipment can worsen humidity complaints.",
    ],
    relatedLinks: [
      { label: "Psychrometric calculator", href: "/calculators/hvac/hvac-psychrometric-calculator/" },
      { label: "Humidity control calculator", href: "/calculators/hvac/hvac-humidity-control-calculator/" },
    ],
  },
  "contractor-business": {
    description:
      "Contractor business articles on estimating, pricing, and running a tighter quoting process for trade companies.",
    intro: [
      "Contractor business posts focus on the office side of the trade — estimating habits, pricing clarity, and presenting professional quotes that match the quality of the fieldwork.",
      "They are written for owners and estimators who want fewer napkin quotes and more repeatable proposals.",
    ],
    relatedLinks: [
      { label: "HVAC AI estimator", href: "/hvac-ai-estimator" },
      { label: "About TradesQuote", href: "/about" },
    ],
  },
  contractor: {
    description:
      "Contractor-focused articles on estimating, customer communication, and trade workflows for HVAC and electrical shops.",
    intro: [
      "The contractor tag collects pieces aimed at people who bid and run jobs — not just technicians reading a single formula. Expect practical language around estimates, scope, and tools that speed up quoting.",
      "Browse these when you want business-facing guidance that still respects how field work actually happens.",
    ],
    relatedLinks: [
      { label: "HVAC AI estimator", href: "/hvac-ai-estimator" },
      { label: "Contact TradesQuote", href: "/contact" },
    ],
  },
  conversion: {
    description:
      "HVAC unit conversion articles for BTU, tons, CFM, and other field calculations contractors use every day.",
    intro: [
      "Conversion posts and tools help you move between common HVAC units quickly — tons and BTU, airflow metrics, and other values that show up on nameplates and load sheets.",
      "Keep this tag handy when training newer estimators who still translate units by hand.",
    ],
    relatedLinks: [
      { label: "HVAC unit converter", href: "/calculators/hvac/hvac-unit-converter/" },
    ],
  },
  "cooling-cost": {
    description:
      "Cooling cost articles on operating expenses, efficiency ratings, and how to explain summer energy bills to customers.",
    intro: [
      "Cooling cost content bridges equipment efficiency and the bill a customer sees. It helps you quantify SEER upgrades, runtime assumptions, and when envelope fixes beat equipment upsells.",
      "Use these guides with operating-cost and SEER savings calculators during proposal meetings.",
    ],
    relatedLinks: [
      { label: "Operating cost calculator", href: "/calculators/hvac/hvac-operating-cost-calculator/" },
      { label: "SEER savings calculator", href: "/calculators/hvac/hvac-seer-savings-calculator/" },
    ],
  },
  cost: {
    description:
      "Cost and pricing articles for HVAC and electrical contractors covering replacement, installation, and operating expenses.",
    intro: [
      "The cost tag aggregates pricing-oriented guides — replacement ranges, install drivers, and operating cost conversations that belong in a professional estimate.",
      "Start here when a customer asks “what does this usually run?” and you need structured talking points before producing a site-specific quote.",
    ],
    relatedLinks: [
      { label: "HVAC replacement cost calculator", href: "/calculators/hvac/hvac-replacement-cost-calculator/" },
      { label: "HVAC estimate calculator", href: "/calculators/hvac/hvac-estimate-calculator/" },
    ],
  },
  dehumidifier: {
    description:
      "Dehumidifier sizing articles for latent load, humidity complaints, and when whole-home dehumidification belongs in the proposal.",
    intro: [
      "Dehumidifier posts explain latent load in practical terms — why cold coils and short cycles leave homes clammy, and how to size supplemental dehumidification.",
      "Use them when comfort complaints persist after “the AC is working,” or when a tight, efficient home still feels sticky.",
    ],
    relatedLinks: [
      { label: "Humidity control calculator", href: "/calculators/hvac/hvac-humidity-control-calculator/" },
    ],
  },
  "delta-t": {
    description:
      "Delta T articles explaining temperature split across coils and what supply-return differentials say about system performance.",
    intro: [
      "Delta T guides help technicians interpret temperature rise and drop across heating and cooling coils. A healthy split is a quick health check — but only when airflow and measurement points are correct.",
      "Read these alongside airflow and charge diagnostics when the system “runs” but comfort or capacity still looks wrong.",
    ],
    relatedLinks: [
      { label: "Delta T calculator", href: "/calculators/hvac/hvac-delta-t-calculator/" },
    ],
  },
  nec: {
    description:
      "NEC-focused electrical articles covering code concepts contractors use for sizing, protection, and safe installations.",
    intro: [
      "NEC-tagged posts translate code concepts into jobsite language — ampacity, protection, continuous loads, and other rules that shape how you design and price electrical work.",
      "They are references for learning and estimating, not a substitute for the published code book or local amendments.",
    ],
    relatedLinks: [
      { label: "Electrical calculators", href: "/calculators/electrical/" },
      { label: "NEC tables", href: "/calculators/electrical/nec-tables/" },
    ],
  },
  "cooling-load": {
    description:
      "Cooling load articles on heat gain, Manual J concepts, and how contractors estimate cooling capacity correctly.",
    intro: [
      "Cooling load content explains how heat gains stack up — envelope, glass, infiltration, people, and equipment — and why that math matters more than a single square-foot multiplier.",
      "Use these articles when teaching load basics or when a quote depends on defending capacity choices to a skeptical customer.",
    ],
    relatedLinks: [
      { label: "Manual J calculator", href: "/calculators/hvac/hvac-manual-j-calculator/" },
      { label: "BTU calculator", href: "/calculators/hvac/hvac-btu-calculator/" },
    ],
  },
  "ac-sizing": {
    description:
      "AC sizing articles for contractors covering tonnage, BTU, square footage methods, and load-based cooling selection.",
    intro: [
      "AC sizing posts walk through capacity selection from quick checks to load-aware reasoning. They help you avoid chronic short-cycling from oversized equipment and comfort complaints from undersized systems.",
      "Combine them with tonnage and Manual J tools when the job moves from ballpark to proposal-ready.",
    ],
    relatedLinks: [
      { label: "Tonnage calculator", href: "/calculators/hvac/hvac-tonnage-calculator/" },
      { label: "Manual J calculator", href: "/calculators/hvac/hvac-manual-j-calculator/" },
    ],
  },
  "load-calculation": {
    description:
      "Load calculation articles explaining Manual J style thinking, heat gain/loss, and accurate HVAC equipment sizing.",
    intro: [
      "Load calculation articles unpack how heating and cooling loads are built — and why shortcuts sometimes work for screening but fail for final selection.",
      "Contractors use this tag when moving a team from “we always install X tons” toward documented, defensible sizing habits.",
    ],
    relatedLinks: [
      { label: "Manual J calculator", href: "/calculators/hvac/hvac-manual-j-calculator/" },
      { label: "Heat loss calculator", href: "/calculators/hvac/hvac-heat-loss-calculator/" },
    ],
  },
  btu: {
    description:
      "BTU articles for HVAC contractors covering capacity conversions, room sizing, and how BTU relates to tons.",
    intro: [
      "BTU-tagged guides keep capacity units clear — British thermal hours, tons, and the room or whole-home context where those numbers are applied.",
      "Reach for this tag when converting nameplate data, checking a room calculator result, or explaining capacity in customer-friendly terms.",
    ],
    relatedLinks: [
      { label: "BTU calculator", href: "/calculators/hvac/hvac-btu-calculator/" },
      { label: "HVAC unit converter", href: "/calculators/hvac/hvac-unit-converter/" },
    ],
  },
  sizing: {
    description:
      "Sizing articles for HVAC and electrical contractors covering equipment, conductors, ducts, and capacity selection.",
    intro: [
      "Sizing is one of the broadest tags on the blog — capacity for cooling and heating, duct dimensions, and electrical conductor or breaker choices that keep jobs safe and comfortable.",
      "Use it as a discovery tag, then follow the more specific sizing labels (ac sizing, duct sizing, wire size) for focused reading.",
    ],
    relatedLinks: [
      { label: "HVAC calculators", href: "/calculators/hvac/" },
      { label: "Electrical calculators", href: "/calculators/electrical/" },
    ],
  },
  cfm: {
    description:
      "CFM airflow articles explaining cubic feet per minute, register delivery, and how airflow ties to comfort and capacity.",
    intro: [
      "CFM posts connect design airflow to real delivery at the grille. They help diagnose rooms that never condition well and systems that look fine on paper but starve the coil.",
      "Pair them with duct sizing and static pressure resources when verifying whether the air path can support the equipment.",
    ],
    relatedLinks: [
      { label: "CFM calculator", href: "/calculators/hvac/hvac-cfm-calculator/" },
      { label: "Duct size calculator", href: "/calculators/hvac/hvac-duct-size-calculator/" },
    ],
  },
  "duct-sizing": {
    description:
      "Duct sizing articles for Manual D style thinking, friction rate, and matching ductwork to required CFM.",
    intro: [
      "Duct sizing content focuses on getting air where it needs to go without excessive noise or static pressure. Expect practical discussion of friction rate, fittings, and why undersized returns cause as many problems as undersized supplies.",
      "Use these guides with duct calculators before promising a “simple swap” on a home with marginal ductwork.",
    ],
    relatedLinks: [
      { label: "Duct size calculator", href: "/calculators/hvac/hvac-duct-size-calculator/" },
      { label: "Duct friction rate calculator", href: "/calculators/hvac/hvac-duct-friction-rate-calculator/" },
    ],
  },
  ductwork: {
    description:
      "Ductwork articles covering design, replacement cost, leakage, and airflow problems in residential HVAC systems.",
    intro: [
      "Ductwork posts cover the distribution system that often decides whether new equipment performs. Topics include redesign triggers, replacement cost drivers, and diagnosing leaky or restrictive ducts.",
      "Contractors lean on this tag when the quote must include more than a condenser and coil.",
    ],
    relatedLinks: [
      { label: "Ductwork replacement cost calculator", href: "/calculators/hvac/hvac-ductwork-replacement-cost-calculator/" },
      { label: "Duct size calculator", href: "/calculators/hvac/hvac-duct-size-calculator/" },
    ],
  },
  efficiency: {
    description:
      "Efficiency articles on SEER, SEER2, AFUE, HSPF, and how ratings affect operating cost and equipment selection.",
    intro: [
      "Efficiency-tagged articles help you compare equipment tiers without promising miracle savings. They explain rating metrics and the jobsite factors that matter as much as the sticker number.",
      "Use them when building good-better-best options that stay credible under customer scrutiny.",
    ],
    relatedLinks: [
      { label: "SEER savings calculator", href: "/calculators/hvac/hvac-seer-savings-calculator/" },
      { label: "AFUE savings calculator", href: "/calculators/hvac/hvac-afue-savings-calculator/" },
    ],
  },
  tonnage: {
    description:
      "Tonnage articles explaining cooling tons, converting BTU to tons, and choosing capacity for residential and light commercial jobs.",
    intro: [
      "Tonnage guides keep capacity math and jobsite judgment in the same conversation. You will find conversion basics plus warnings about oversized systems that cool quickly but leave humidity behind.",
      "Combine with load calculation reading when the job deserves more than a tons-per-square-foot guess.",
    ],
    relatedLinks: [
      { label: "Tonnage calculator", href: "/calculators/hvac/hvac-tonnage-calculator/" },
    ],
  },
  "manual-j": {
    description:
      "Manual J articles explaining ACCA residential load calculation concepts for accurate HVAC sizing.",
    intro: [
      "Manual J content introduces the ACCA residential load framework — room-by-room gains and losses, why defaults matter, and how results feed equipment selection.",
      "These articles support contractors who want better sizing habits and clearer documentation for permits or customer education.",
    ],
    relatedLinks: [
      { label: "Manual J calculator", href: "/calculators/hvac/hvac-manual-j-calculator/" },
      { label: "HVAC calculators", href: "/calculators/hvac/" },
    ],
  },
  airflow: {
    description:
      "Airflow articles on CFM, static pressure, duct design, and diagnosing HVAC systems that move the wrong amount of air.",
    intro: [
      "Airflow posts treat moving air as the heart of comfort and capacity. Weak airflow shows up as frozen coils, hot rooms, noise, and efficiency complaints that look like refrigerant issues at first glance.",
      "Use this tag with CFM, blower, and static pressure resources during commissioning and callbacks.",
    ],
    relatedLinks: [
      { label: "CFM calculator", href: "/calculators/hvac/hvac-cfm-calculator/" },
      { label: "Static pressure calculator", href: "/calculators/hvac/hvac-static-pressure-calculator/" },
    ],
  },
  seer: {
    description:
      "SEER efficiency articles explaining seasonal energy efficiency ratio, savings estimates, and upgrade conversations.",
    intro: [
      "SEER articles unpack seasonal efficiency for cooling equipment and how to estimate savings without overstating results. They also touch the shift toward SEER2 labeling in newer equipment conversations.",
      "Keep these handy when a customer asks whether jumping efficiency tiers is worth the price difference.",
    ],
    relatedLinks: [
      { label: "SEER savings calculator", href: "/calculators/hvac/hvac-seer-savings-calculator/" },
      { label: "SEER2 converter", href: "/calculators/hvac/hvac-seer2-converter/" },
    ],
  },
  seer2: {
    description:
      "SEER2 articles explaining the updated efficiency metric and how it compares with legacy SEER ratings.",
    intro: [
      "SEER2 posts help contractors translate the newer test procedure into sales and service conversations. Customers still say “SEER,” but nameplates and AHRI data increasingly speak SEER2.",
      "Use conversion tools carefully and focus on what the rating change means for comparing equipment apples-to-apples.",
    ],
    relatedLinks: [
      { label: "SEER2 converter", href: "/calculators/hvac/hvac-seer2-converter/" },
      { label: "SEER savings calculator", href: "/calculators/hvac/hvac-seer-savings-calculator/" },
    ],
  },
  "replacement-cost": {
    description:
      "Replacement cost articles for HVAC systems, furnaces, AC, and ductwork — written for contractor estimating conversations.",
    intro: [
      "Replacement cost guides outline the price drivers behind full-system and major-component swaps. They help you set ranges early, then refine after the site survey.",
      "Use them with replacement-cost calculators when producing first-pass budgets customers can react to before a detailed proposal.",
    ],
    relatedLinks: [
      { label: "HVAC replacement cost calculator", href: "/calculators/hvac/hvac-replacement-cost-calculator/" },
      { label: "Furnace replacement cost calculator", href: "/calculators/hvac/hvac-furnace-replacement-cost-calculator/" },
    ],
  },
  "basic-electrical-theory": {
    description:
      "Basic electrical theory articles covering volts, amps, watts, and foundational concepts electricians use on every job.",
    intro: [
      "Basic electrical theory posts refresh the fundamentals that support safer sizing and troubleshooting — relationships between voltage, current, resistance, and power.",
      "They are useful for apprentices and for estimators who want clearer intuition behind calculator outputs.",
    ],
    relatedLinks: [
      { label: "Ohm's law calculator", href: "/calculators/electrical/electrical-ohms-law-calculator/" },
      { label: "Electrical formulas", href: "/calculators/electrical/formulas/" },
    ],
  },
  ampacity: {
    description:
      "Ampacity articles explaining conductor current-carrying capacity, temperature correction, and NEC sizing context.",
    intro: [
      "Ampacity content focuses on choosing conductors that can carry load current under real installation conditions — ambient temperature, bundling, and insulation ratings included.",
      "Pair these articles with ampacity and wire-size calculators when preparing feeder or branch-circuit estimates.",
    ],
    relatedLinks: [
      { label: "Ampacity calculator", href: "/calculators/electrical/electrical-ampacity-calculator/" },
      { label: "Wire size calculator", href: "/calculators/electrical/electrical-wire-size-calculator/" },
    ],
  },
  "branch-circuit": {
    description:
      "Branch circuit articles covering receptacles, breakers, continuous loads, and practical NEC application for electricians.",
    intro: [
      "Branch-circuit posts dig into everyday circuit design — receptacle counts, breaker selection, shared neutrals, and continuous-load rules that change conductor and OCPD size.",
      "Use them when quoting residential and light commercial circuit work that must stay code-aware and priceable.",
    ],
    relatedLinks: [
      { label: "Breaker size calculator", href: "/calculators/electrical/electrical-breaker-size-calculator/" },
      { label: "Receptacle circuit calculator", href: "/calculators/electrical/electrical-receptacle-circuit-calculator/" },
    ],
  },
  "wire-size": {
    description:
      "Wire size articles for electricians covering conductor selection, voltage drop, ampacity, and estimating wire on the job.",
    intro: [
      "Wire-size guides help you pick conductors that satisfy ampacity and voltage-drop limits without guessing from memory alone.",
      "They support both learning and fast estimating when a takeoff needs defensible wire choices.",
    ],
    relatedLinks: [
      { label: "Wire size calculator", href: "/calculators/electrical/electrical-wire-size-calculator/" },
      { label: "Voltage drop calculator", href: "/calculators/electrical/electrical-voltage-drop-calculator/" },
    ],
  },
  "energy-savings": {
    description:
      "Energy savings articles explaining SEER, AFUE, HSPF upgrades and how contractors present realistic operating-cost improvements.",
    intro: [
      "Energy savings posts keep upgrade conversations grounded. They show how efficiency ratings, runtime, and utility rates combine — and where envelope or duct fixes beat equipment upgrades.",
      "Use them with savings calculators when building side-by-side options for a customer deciding between tiers.",
    ],
    relatedLinks: [
      { label: "SEER savings calculator", href: "/calculators/hvac/hvac-seer-savings-calculator/" },
      { label: "Operating cost calculator", href: "/calculators/hvac/hvac-operating-cost-calculator/" },
    ],
  },
  pricing: {
    description:
      "Pricing articles for trade contractors covering estimates, markups, and presenting clear line-item quotes.",
    intro: [
      "Pricing-tagged content focuses on how contractors turn scope into a number customers accept — line items, contingencies, and communication that reduces change-order friction later.",
      "Read these alongside product estimating tools when you want quotes that look as professional as the install.",
    ],
    relatedLinks: [
      { label: "HVAC estimate calculator", href: "/calculators/hvac/hvac-estimate-calculator/" },
      { label: "HVAC AI estimator", href: "/hvac-ai-estimator" },
    ],
  },
  "manual-d": {
    description:
      "Manual D duct design articles explaining residential duct sizing concepts for contractors and estimators.",
    intro: [
      "Manual D articles introduce residential duct design thinking — available static pressure, friction rate, and fitting losses that decide whether equipment can deliver design CFM.",
      "Use them when a system swap also needs a duct redesign conversation, not only a new outdoor unit.",
    ],
    relatedLinks: [
      { label: "Duct size calculator", href: "/calculators/hvac/hvac-duct-size-calculator/" },
      { label: "Duct friction rate calculator", href: "/calculators/hvac/hvac-duct-friction-rate-calculator/" },
    ],
  },
  "central-air": {
    description:
      "Central air articles on ducted cooling systems, sizing, cost, and performance for residential HVAC contractors.",
    intro: [
      "Central air posts cover ducted cooling as a system: equipment, air distribution, and the estimate details customers rarely see on a one-line quote.",
      "Browse this tag when comparing central systems with ductless options or when explaining why airflow work belongs in the job.",
    ],
    relatedLinks: [
      { label: "Tonnage calculator", href: "/calculators/hvac/hvac-tonnage-calculator/" },
    ],
  },
  acca: {
    description:
      "ACCA methodology articles covering Manual J, Manual D, and standards-minded HVAC design for contractors.",
    intro: [
      "ACCA-tagged content points back to industry-standard design methods contractors use for residential load and duct design. It is about building habits that hold up under inspection and customer questions.",
      "Start with Manual J and Manual D articles, then use calculators for screening numbers while you refine the full workflow.",
    ],
    relatedLinks: [
      { label: "Manual J calculator", href: "/calculators/hvac/hvac-manual-j-calculator/" },
      { label: "HVAC calculators", href: "/calculators/hvac/" },
    ],
  },
};
