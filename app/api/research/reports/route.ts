import { NextRequest, NextResponse } from "next/server";
export async function POST(request:NextRequest){
 const base=process.env.RESEARCH_API_URL;
 if(!base)return NextResponse.json({error:"Research API is not configured. Set RESEARCH_API_URL in the web deployment."},{status:503});
 let body:unknown;try{body=await request.json()}catch{return NextResponse.json({error:"Invalid JSON request."},{status:400})}
 try{
  const upstream=await fetch(new URL("/api/v1/reports",base),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body),cache:"no-store",signal:AbortSignal.timeout(120000)});
  const data=await upstream.json().catch(()=>({error:"Research service returned invalid JSON."}));
  return NextResponse.json(data,{status:upstream.status,headers:{"Cache-Control":"no-store"}});
 }catch{return NextResponse.json({error:"Research service is unreachable. Check RESEARCH_API_URL and API deployment."},{status:502})}
}