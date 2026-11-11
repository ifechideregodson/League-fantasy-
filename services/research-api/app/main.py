from fastapi import FastAPI,HTTPException
from pydantic import BaseModel,Field
from app.providers import discover
from app.research import synthesize_report
app=FastAPI(title="Aster Research API",version="0.2.0")
class SearchRequest(BaseModel):
 query:str=Field(min_length=3,max_length=500)
 limit:int=Field(default=8,ge=1,le=20)
class ReportRequest(BaseModel):
 question:str=Field(min_length=10,max_length=2000)
 limit:int=Field(default=12,ge=1,le=20)
@app.get("/health")
async def health():return {"status":"ok","service":"research-api","version":"0.2.0"}
@app.get("/api/v1/capabilities")
async def capabilities():return {"academic_search":["Crossref","OpenAlex","PubMed"],"report_synthesis":"requires OPENAI_API_KEY","pdf_full_text_qa":"not_enabled","agent_frameworks":[],"clinical_inference":"disabled"}
@app.post("/api/v1/search")
async def search(req:SearchRequest):
 try:return await discover(req.query,req.limit)
 except Exception as e:raise HTTPException(status_code=502,detail=f"Academic provider search failed: {e}") from e
@app.post("/api/v1/reports")
async def report(req:ReportRequest):
 try:
  found=await discover(req.question,req.limit)
  if not found["sources"]:raise HTTPException(status_code=422,detail="No scholarly sources found; report not generated.")
  result=await synthesize_report(req.question,found["sources"])
  return {**result,"provider_errors":found["provider_errors"]}
 except HTTPException:raise
 except ValueError as e:raise HTTPException(status_code=422,detail=str(e)) from e
 except RuntimeError as e:raise HTTPException(status_code=503,detail=str(e)) from e
 except Exception as e:raise HTTPException(status_code=502,detail=f"Report generation failed: {e}") from e
