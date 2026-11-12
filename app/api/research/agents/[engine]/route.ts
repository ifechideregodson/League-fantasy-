import { NextRequest, NextResponse } from "next/server";

const paths: Record<string,string> = {
  "gpt-researcher": "/api/v1/agents/gpt-researcher",
  "stanford-storm": "/api/v1/agents/stanford-storm",
};

export const runtime = "nodejs";

export async function POST(request: NextRequest, context: { params: Promise<{ engine: string }> }) {
  const { engine } = await context.params;
  const path = paths[engine];
  if (!path) return NextResponse.json({ error: "Unknown research engine." }, { status: 404 });

  const rawBase = process.env.RESEARCH_API_URL;
  const base = rawBase ? (rawBase.startsWith("https://") || rawBase.startsWith("http://") ? rawBase : `https://${rawBase}`) : null;
  const token = process.env.RESEARCH_API_TOKEN;
  if (!base || !token) return NextResponse.json({ error: "Research API URL or access token is not configured." }, { status: 503 });

  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON request." }, { status: 400 }); }

  try {
    const upstream = await fetch(new URL(path, base), {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(55000),
    });
    const data = await upstream.json().catch(() => ({ error: "Research engine returned invalid JSON." }));
    return NextResponse.json(data, { status: upstream.status, headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Research engine timed out or is unreachable. Free hosting may need to wake up; retry once." }, { status: 504 });
  }
}
