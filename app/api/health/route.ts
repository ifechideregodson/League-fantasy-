import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "aster-research-web",
    databaseConfigured: Boolean(process.env.DATABASE_URL),
    researchApiConfigured: Boolean(process.env.RESEARCH_API_URL),
    timestamp: new Date().toISOString()
  });
}
