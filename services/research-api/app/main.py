from fastapi import FastAPI

app = FastAPI(
    title="Unified Research API",
    version="0.1.0",
    description="Research orchestration API scaffold",
)

@app.get("/health")
async def health():
    return {"status": "ok", "service": "research-api"}

@app.get("/api/v1/capabilities")
async def capabilities():
    return {
        "status": "scaffold",
        "capabilities": [
            "research-projects",
            "academic-source-discovery",
            "document-ingestion",
            "citation-verification",
            "agent-orchestration",
        ],
        "integrations_enabled": [],
    }
