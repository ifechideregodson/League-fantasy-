import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const rawBase = process.env.RESEARCH_API_URL;
  const base = rawBase
    ? (rawBase.startsWith("http://") || rawBase.startsWith("https://") ? rawBase : `https://${rawBase}`)
    : undefined;

  if (!base) {
    return NextResponse.json({ error: "Research API is not configured." }, { status: 503 });
  }

  try {
    const upstream = await fetch(new URL("/api/v1/integrations", base), {
      method: "GET",
      headers: { Authorization: `Bearer ${process.env.RESEARCH_API_TOKEN || ""}` },
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    const data = await upstream.json().catch(() => ({ error: "Research API returned invalid JSON." }));
    return NextResponse.json(data, {
      status: upstream.status,
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch {
    return NextResponse.json({ error: "Research API is unreachable. Check the Render service." }, { status: 502 });
  }
}
