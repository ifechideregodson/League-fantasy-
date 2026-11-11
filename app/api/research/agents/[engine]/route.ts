import { NextRequest, NextResponse } from "next/server";

const paths: Record<string,string> = {
  "gpt-researcher": "/api/v1/agents/gpt-researcher",
  "stanford-storm": "/api/v1/agents/stanford-storm",
};

export async function POST(request: NextRequest, context: { params: Promise<{ engine: string }> }) {
  const { engine } = await context.params;
  const path = paths[engine];
  if (!path) return NextResponse.json({ error: "Unknown research engine." }, { status: 404 });
  const rawBase = process.env.RESEARCH_API_URL;
  const base = rawBase ? (rawBase.startsWith("http://") || rawBase.startsWith("https://") ? rawBase : `http://${rawBase}`) : undefined;
  if (!base) return NextResponse.json({ error: "Research API is not configured." }, { status: 503 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON request." }, { status: 400 }); }
  try {
    const upstream = await fetch(new URL(path, base), {
      method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.RESEARCH_API_TOKEN || ""}` },
      body: JSON.stringify(body), cache: "no-store", signal: AbortSignal.timeout(1800000),
    });
    const data = await upstream.json().catch(() => ({ error: "Research engine returned invalid JSON." }));
    return NextResponse.json(data, { status: upstream.status, headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Research engine is unreachable. Check the Python service deployment." }, { status: 502 });
  }
}
