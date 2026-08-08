import {
  categorySeo,
  tagSeo,
  type TaxonomyFaq,
  type TaxonomyRelatedLink,
  type TaxonomySeo,
} from "@/config/blogTaxonomy";
import { humanize } from "@/lib/utils/textConverter";

export type TaxonomyPostSummary = {
  id: string;
  title: string;
  description?: string;
};

export type ResolvedTaxonomySeo = {
  title: string;
  description: string;
  intro: string[];
  faqs: TaxonomyFaq[];
  relatedLinks: TaxonomyRelatedLink[];
  featuredPosts: {
    title: string;
    description: string;
    href: string;
  }[];
};

const defaultTagLinks: TaxonomyRelatedLink[] = [
  { label: "All blog tags", href: "/blog/tags/" },
  { label: "Blog home", href: "/blog/" },
  { label: "HVAC calculators", href: "/calculators/hvac/" },
];

const defaultCategoryLinks: TaxonomyRelatedLink[] = [
  { label: "All categories", href: "/blog/categories/" },
  { label: "All blog tags", href: "/blog/tags/" },
  { label: "Blog home", href: "/blog/" },
];

function curatedFor(kind: "tag" | "category", slug: string): TaxonomySeo | undefined {
  return kind === "tag" ? tagSeo[slug] : categorySeo[slug];
}

function buildFallbackIntro(
  kind: "tag" | "category",
  title: string,
  posts: TaxonomyPostSummary[],
): string[] {
  const count = posts.length;
  const articleWord = count === 1 ? "article" : "articles";
  const kindLabel = kind === "tag" ? "tag" : "category";

  const intro: string[] = [
    `This ${kindLabel} page collects ${count} TradesQuote ${articleWord} related to ${title}. Use it to browse contractor-focused guidance on sizing, code, cost, diagnostics, and estimating without hunting through the full blog archive.`,
    `Each post below is written for people who bid and run trade work — HVAC and electrical contractors, estimators, and technicians who need clear explanations they can apply on the next job. Skim the summaries, open the guides that match your question, then follow related calculator links when you need interactive numbers.`,
  ];

  if (posts.length > 0) {
    const titles = posts
      .slice(0, 4)
      .map((post) => post.title)
      .join("; ");
    intro.push(
      `Featured reading in this collection includes: ${titles}. Open any article for full detail, examples, and links to free tools that support faster estimating.`,
    );
  } else {
    intro.push(
      `New ${title} guides will appear here as they are published. In the meantime, explore the full blog or the HVAC and electrical calculator hubs for related contractor tools.`,
    );
  }

  if (kind === "tag") {
    intro.push(
      `Looking for a broader topic? Browse all tags from the tags index, or jump to HVAC and electrical categories for curated topic hubs. TradesQuote also offers free calculators and an AI estimator when you are ready to turn a job description into a line-item quote.`,
    );
  } else {
    intro.push(
      `From here you can open individual articles, follow related tags inside each post, or move into calculator hubs for hands-on sizing and cost tools. The goal is simple: help contractors find the right reference quickly and quote with more confidence.`,
    );
  }

  return intro;
}

function buildFallbackFaqs(
  kind: "tag" | "category",
  title: string,
  count: number,
): TaxonomyFaq[] {
  return [
    {
      question: `What will I find under ${title}?`,
      answer: `This ${kind} lists ${count} published guide${count === 1 ? "" : "s"} tagged or categorized as ${title}. Topics typically include sizing, cost estimating, diagnostics, and practical contractor workflows tied to that subject.`,
    },
    {
      question: "Are these articles a substitute for code or engineered design?",
      answer:
        "No. TradesQuote guides explain concepts and estimating shortcuts so you can work faster and communicate clearly. Always follow applicable codes, manufacturer instructions, and professional engineering requirements for the job.",
    },
    {
      question: "How do these pages relate to TradesQuote tools?",
      answer:
        "Many articles link to free HVAC or electrical calculators and to TradesQuote estimating features. Use the guides to understand the topic, then use the tools to produce numbers for proposals and field checks.",
    },
  ];
}

function buildFeaturedPosts(posts: TaxonomyPostSummary[]) {
  return posts.slice(0, 6).map((post) => ({
    title: post.title,
    description:
      post.description?.trim() ||
      `Read the full ${post.title} guide on the TradesQuote blog for contractor-focused detail and related tools.`,
    href: `/blog/${post.id}`,
  }));
}

export function resolveTaxonomySeo(options: {
  kind: "tag" | "category";
  slug: string;
  posts: TaxonomyPostSummary[];
}): ResolvedTaxonomySeo {
  const { kind, slug, posts } = options;
  const displayTitle = humanize(slug);
  const curated = curatedFor(kind, slug);

  const title = curated?.title ?? displayTitle;
  const description =
    curated?.description ??
    (kind === "tag"
      ? `Articles tagged "${title}" — sizing, cost, code, diagnostics, and estimating guides for HVAC and electrical contractors.`
      : `${title} articles — sizing, cost, code, diagnostics, and estimating guides for contractors.`);

  const intro =
    curated?.intro?.length && curated.intro.length > 0
      ? curated.intro
      : buildFallbackIntro(kind, title, posts);

  const faqs =
    curated?.faqs && curated.faqs.length > 0
      ? curated.faqs
      : buildFallbackFaqs(kind, title, posts.length);

  const relatedLinks =
    curated?.relatedLinks && curated.relatedLinks.length > 0
      ? curated.relatedLinks
      : kind === "tag"
        ? defaultTagLinks
        : defaultCategoryLinks;

  return {
    title,
    description,
    intro,
    faqs,
    relatedLinks,
    featuredPosts: buildFeaturedPosts(posts),
  };
}
