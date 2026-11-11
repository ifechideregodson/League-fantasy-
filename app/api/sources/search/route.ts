import { NextRequest, NextResponse } from "next/server";

type CrossrefItem = {
  DOI?: string;
  title?: string[];
  author?: Array<{ given?: string; family?: string }>;
  published?: { "date-parts"?: number[][] };
  "container-title"?: string[];
  URL?: string;
  publisher?: string;
  type?: string;
};

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim();
  const rawLimit = Number(request.nextUrl.searchParams.get("limit") ?? "10");

  if (!query || query.length < 3) {
    return NextResponse.json({ error: "Enter a search phrase of at least 3 characters." }, { status: 400 });
  }
  if (query.length > 240) {
    return NextResponse.json({ error: "Search phrase is too long." }, { status: 400 });
  }

  const limit = Number.isFinite(rawLimit) ? Math.min(20, Math.max(1, Math.floor(rawLimit))) : 10;
  const url = new URL("https://api.crossref.org/works");
  url.searchParams.set("query.bibliographic", query);
  url.searchParams.set("rows", String(limit));
  url.searchParams.set("select", "DOI,title,author,published,container-title,URL,publisher,type");

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": `AsterResearch/0.1 (mailto:${process.env.CROSSREF_MAILTO || "research-contact@example.invalid"})`
      },
      next: { revalidate: 300 }
    });
    if (!response.ok) {
      return NextResponse.json({ error: "The scholarly search provider is temporarily unavailable." }, { status: 502 });
    }

    const payload = await response.json() as { message?: { items?: CrossrefItem[]; "total-results"?: number } };
    const items = (payload.message?.items ?? []).map((item) => {
      const dateParts = item.published?.["date-parts"]?.[0] ?? [];
      const year = dateParts[0] ?? null;
      const authors = (item.author ?? []).map((author) => [author.given, author.family].filter(Boolean).join(" ")).filter(Boolean);
      return {
        doi: item.DOI ?? null,
        title: item.title?.[0] ?? "Untitled scholarly work",
        authors,
        year,
        journal: item["container-title"]?.[0] ?? null,
        publisher: item.publisher ?? null,
        type: item.type ?? null,
        url: item.URL ?? (item.DOI ? `https://doi.org/${item.DOI}` : null)
      };
    });

    return NextResponse.json({
      provider: "Crossref",
      query,
      count: items.length,
      results: items
    }, { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } });
  } catch {
    return NextResponse.json({ error: "Unable to reach the scholarly search provider. Please try again." }, { status: 502 });
  }
}
