from __future__ import annotations
import os
import httpx
from typing import Any

async def synthesize_report(question: str, sources: list[dict[str, Any]]) -> dict[str, Any]:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not configured. Research discovery works, but AI report synthesis is unavailable until a provider key is configured.")
    if not sources:
        raise ValueError("No scholarly sources were retrieved. A report cannot be generated without evidence.")
    evidence = []
    for i, source in enumerate(sources[:30], start=1):
        evidence.append({
            "source_id": f"S{i}",
            "title": source.get("title"),
            "authors": source.get("authors", [])[:8],
            "year": source.get("year"),
            "venue": source.get("venue"),
            "doi": source.get("doi"),
            "url": source.get("url"),
            "provider": source.get("provider"),
        })
    prompt = (
        "Write a critical, evidence-led literature synthesis answering the research question. "
        "Use only the supplied source metadata as evidence. Do not invent findings, methods, sample sizes, "
        "or conclusions not present in metadata. Metadata alone is insufficient to claim a paper's results; "
        "explicitly say when full text was not retrieved. Cite every factual literature statement using "
        "the exact source IDs such as [S1]. Include scope and limitations, disagreements only when supported, "
        "and a references list mapping source IDs to titles and DOI/URL. Never fabricate citations.\n\n"
        f"Research question: {question}\n\nSources:\n{evidence}"
    )
    async with httpx.AsyncClient(timeout=httpx.Timeout(90.0, connect=10.0)) as client:
        response = await client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={"Authorization":f"Bearer {api_key}","Content-Type":"application/json"},
            json={"model":os.getenv("OPENAI_MODEL","gpt-4o-mini"),"temperature":0.1,"messages":[
                {"role":"system","content":"You are a careful academic research assistant. Be transparent about evidence limitations."},
                {"role":"user","content":prompt}
            ]}
        )
        if response.status_code >= 400:
            raise RuntimeError(f"AI provider returned HTTP {response.status_code}: {response.text[:500]}")
        payload = response.json()
    content = payload["choices"][0]["message"]["content"]
    return {"question":question,"report":content,"sources":evidence,"model":payload.get("model"),"provider":"OpenAI","evidence_level":"metadata_only"}
