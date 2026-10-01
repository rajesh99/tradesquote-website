export type SearchKind = "Guide" | "FAQ" | "Page" | "Calculator";

export interface SearchDocument {
  title: string;
  url: string;
  kind: SearchKind;
  category: string;
  description: string;
  tags: string;
  text: string;
}

export interface SearchResult {
  title: string;
  url: string;
  kind: SearchKind;
  category: string;
  snippet: string;
  score: number;
}

export const SEARCH_DIALOG_LIMIT = 8;
export const SEARCH_PAGE_LIMIT = 20;

function normalize(value: string): string {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function termsOf(query: string): string[] {
  return normalize(query).split(" ").filter(Boolean);
}

function clip(value: string, max: number): string {
  const clean = value.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max).trim()}…`;
}

function windowAround(source: string, terms: string[]): string | null {
  const clean = source.replace(/\s+/g, " ").trim();
  if (!clean) return null;
  const lower = clean.toLowerCase();
  let at = -1;
  for (const term of terms) {
    const found = lower.indexOf(term);
    if (found !== -1 && (at === -1 || found < at)) at = found;
  }
  if (at === -1) return null;

  const start = Math.max(0, at - 70);
  const end = Math.min(clean.length, at + 110);
  let snippet = clean.slice(start, end).trim();
  if (start > 0) snippet = `…${snippet}`;
  if (end < clean.length) snippet = `${snippet}…`;
  return snippet;
}

function snippetFor(doc: SearchDocument, terms: string[]): string {
  return (
    windowAround(doc.text, terms) ??
    windowAround(doc.description, terms) ??
    clip(doc.description || doc.text, 180)
  );
}

export function rankSearch(
  documents: SearchDocument[],
  query: string,
  limit = SEARCH_PAGE_LIMIT,
): SearchResult[] {
  const terms = termsOf(query);
  if (terms.length === 0) return [];

  const phrase = terms.join(" ");
  const ranked: SearchResult[] = [];

  for (const doc of documents) {
    const title = normalize(doc.title);
    const description = normalize(doc.description);
    const tags = normalize(doc.tags);
    const text = normalize(doc.text);

    const matchesAll = terms.every(
      (term) =>
        title.includes(term) ||
        description.includes(term) ||
        tags.includes(term) ||
        text.includes(term),
    );
    if (!matchesAll) continue;

    let score = 0;
    for (const term of terms) {
      if (title.includes(term)) score += 20;
      if (description.includes(term)) score += 8;
      if (tags.includes(term)) score += 15;
      if (text.includes(term)) score += 2;
    }
    if (terms.length > 1 && title.includes(phrase)) score += 50;

    ranked.push({
      title: doc.title,
      url: doc.url,
      kind: doc.kind,
      category: doc.category,
      snippet: snippetFor(doc, terms),
      score,
    });
  }

  ranked.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
  return ranked.slice(0, limit);
}
