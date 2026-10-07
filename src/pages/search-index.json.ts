import { getSearchDocuments } from "@/lib/search/documents";

export const prerender = true;

export async function GET() {
  const documents = await getSearchDocuments();
  return new Response(JSON.stringify(documents), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}
