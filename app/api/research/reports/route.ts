import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function researchApiBase() {
  const value = process.env.RESEARCH_API_URL;
  if (!value) return null;
  return value.startsWith("https://") || value.startsWith("http://") ? value : `https://${value}`;
}

export async function POST(request: NextRequest) {
  const base = researchApiBase();
  const token = process.env.RESEARCH_API_TOKEN;
  if (!base || !token) {
    return NextResponse.json({ error: "Research API URL or access token is not configured." }, { status: 503 });
  }

  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON request." }, { status: 400 }); }

  try {
    const upstream = await fetch(new URL("/api/v1/reports", base), {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(55000),
    });
    const data = await upstream.json().catch(() => ({ error: "Research service returned invalid JSON." }));
    return NextResponse.json(data, { status: upstream.status, headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Research service timed out or is unreachable. The free hosting tier may need to wake up; retry once." }, { status: 504 });
  }
}
