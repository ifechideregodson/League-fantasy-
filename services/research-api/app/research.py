from __future__ import annotations
import os,httpx
from typing import Any

async def synthesize_report(question:str,sources:list[dict[str,Any]])->dict[str,Any]:
 key=os.getenv("OPENAI_API_KEY")
 if not key:raise RuntimeError("OPENAI_API_KEY is not configured. Academic search remains available; AI synthesis is disabled until configured.")
 if not sources:raise ValueError("No scholarly sources were retrieved; no report was generated.")
 evidence=[{"source_id":f"S{i}","title":s.get("title"),"authors":s.get("authors",[])[:8],"year":s.get("year"),"venue":s.get("venue"),"doi":s.get("doi"),"url":s.get("url"),"provider":s.get("provider")} for i,s in enumerate(sources[:30],1)]
 prompt=("Produce a critical evidence-led literature synthesis. Use only supplied metadata. Do not invent findings, sample sizes, methods or conclusions. Metadata alone does not establish paper results: explicitly disclose that full text was not retrieved. Cite factual claims with exact IDs [S1]. Include limitations and references mapping IDs to source titles and DOI/URLs. Never fabricate citations.\nResearch question: "+question+"\nSources: "+str(evidence))
 async with httpx.AsyncClient(timeout=httpx.Timeout(90,connect=10)) as c:
  r=await c.post("https://api.openai.com/v1/chat/completions",headers={"Authorization":f"Bearer {key}"},json={"model":os.getenv("OPENAI_MODEL","gpt-4o-mini"),"temperature":0.1,"messages":[{"role":"system","content":"You are a careful academic research assistant. State evidence limits."},{"role":"user","content":prompt}]})
  if r.status_code>=400:raise RuntimeError(f"AI provider returned HTTP {r.status_code}: {r.text[:400]}")
  data=r.json()
 return {"question":question,"report":data["choices"][0]["message"]["content"],"sources":evidence,"model":data.get("model"),"provider":"OpenAI","evidence_level":"metadata_only"}
