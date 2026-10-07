import type { SearchDocument } from "@/lib/search/rank";

let pending: Promise<SearchDocument[]> | null = null;

export function loadSearchIndex(): Promise<SearchDocument[]> {
  if (!pending) {
    pending = fetch("/search-index.json")
      .then((response) => {
        if (!response.ok) throw new Error("Search index failed");
        return response.json() as Promise<SearchDocument[]>;
      })
      .catch((error: unknown) => {
        pending = null;
        throw error;
      });
  }
  return pending;
}
