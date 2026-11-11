from __future__ import annotations
import os
import httpx
from typing import Any

TIMEOUT = httpx.Timeout(25.0, connect=8.0)

async def search_crossref(query: str, limit: int = 8) -> list[dict[str, Any]]:
    async with httpx.AsyncClient(timeout=TIMEOUT, headers={"User-Agent": f"AsterResearch/0.2 (mailto:{os.getenv('CROSSREF_MAILTO','')})"}) as client:
        r = await client.get("https://api.crossref.org/works", params={"query.bibliographic": query, "rows": limit})
        r.raise_for_status()
        items = r.json().get("message", {}).get("items", [])
    out = []
    for x in items:
        date = (x.get("published", {}).get("date-parts") or [[]])[0]
        out.append({
            "id": x.get("DOI") or x.get("URL"),
            "title": (x.get("title") or ["Untitled"])[0],
            "authors": [(" ".join(filter(None, [a.get("given"), a.get("family")]))).strip() for a in x.get("author", [])],
            "year": date[0] if date else None,
            "venue": (x.get("container-title") or [None])[0],
            "doi": x.get("DOI"),
            "url": x.get("URL") or (f"https://doi.org/{x['DOI']}" if x.get("DOI") else None),
            "provider": "Crossref",
        })
    return out

async def search_openalex(query: str, limit: int = 8) -> list[dict[str, Any]]:
    params = {"search": query, "per-page": limit}
    if os.getenv("OPENALEX_EMAIL"):
        params["mailto"] = os.environ["OPENALEX_EMAIL"]
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        r = await client.get("https://api.openalex.org/works", params=params)
        r.raise_for_status()
        items = r.json().get("results", [])
    out = []
    for x in items:
        authors = [a.get("author", {}).get("display_name", "") for a in x.get("authorships", [])]
        out.append({
            "id": x.get("id"),
            "title": x.get("title") or "Untitled",
            "authors": authors,
            "year": x.get("publication_year"),
            "venue": (x.get("primary_location") or {}).get("source", {}).get("display_name") if (x.get("primary_location") or {}).get("source") else None,
            "doi": x.get("doi"),
            "url": x.get("doi") or x.get("id"),
            "provider": "OpenAlex",
            "cited_by_count": x.get("cited_by_count"),
            "open_access": (x.get("open_access") or {}).get("is_oa"),
        })
    return out

async def search_pubmed(query: str, limit: int = 8) -> list[dict[str, Any]]:
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        s = await client.get("https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi", params={"db":"pubmed","term":query,"retmax":limit,"retmode":"json"})
        s.raise_for_status()
        ids = s.json().get("esearchresult", {}).get("idlist", [])
        if not ids:
            return []
        f = await client.get("https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi", params={"db":"pubmed","id":",".join(ids),"retmode":"json"})
        f.raise_for_status()
        payload = f.json().get("result", {})
    out = []
    for pmid in ids:
        x = payload.get(pmid, {})
        authors = [a.get("name","") for a in x.get("authors", [])]
        out.append({"id":f"PMID:{pmid}","title":x.get("title","Untitled"),"authors":authors,"year":(x.get("pubdate") or "")[:4],"venue":x.get("fulljournalname"),"doi":None,"url":f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/","provider":"PubMed"})
    return out

async def discover(query: str, limit: int = 8) -> dict[str, Any]:
    import asyncio
    tasks = await asyncio.gather(
        search_crossref(query, limit),
        search_openalex(query, limit),
        search_pubmed(query, limit),
        return_exceptions=True,
    )
    sources: list[dict[str, Any]] = []
    provider_errors = {}
    seen = set()
    for name, result in zip(["Crossref","OpenAlex","PubMed"], tasks):
        if isinstance(result, Exception):
            provider_errors[name] = str(result)
            continue
        for item in result:
            key = (item.get("doi") or item.get("id") or item.get("title","")).lower()
            if key and key not in seen:
                seen.add(key)
                sources.append(item)
    return {"query":query,"sources":sources,"provider_errors":provider_errors,"providers_responded":3-len(provider_errors)}
