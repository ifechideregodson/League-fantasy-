import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const rawBase = process.env.RESEARCH_API_URL;
  const base = rawBase ? (rawBase.startsWith("https://") || rawBase.startsWith("http://") ? rawBase : `https://${rawBase}`) : null;
  const token = process.env.RESEARCH_API_TOKEN;
  if (!base || !token) return NextResponse.json({ error: "Research API URL or access token is not configured." }, { status: 503 });

  const incoming = await request.formData();
  const file = incoming.get("file");
  const question = incoming.get("question");
  if (!(file instanceof File) || typeof question !== "string" || !question.trim()) {
    return NextResponse.json({ error: "A PDF file and research question are required." }, { status: 400 });
  }
  if (file.size > 20 * 1024 * 1024) return NextResponse.json({ error: "PDF exceeds the 20 MB limit." }, { status: 413 });

  const outgoing = new FormData();
  outgoing.set("file", file, file.name);
  outgoing.set("question", question);
  try {
    const upstream = await fetch(new URL("/api/v1/papers/ask", base), {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: outgoing,
      cache: "no-store",
      signal: AbortSignal.timeout(55000),
    });
    const data = await upstream.json().catch(() => ({ error: "PaperQA2 returned invalid JSON." }));
    return NextResponse.json(data, { status: upstream.status, headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "PDF analysis timed out or the research service is unreachable. Try a smaller PDF or retry after the service wakes up." }, { status: 504 });
  }
}
