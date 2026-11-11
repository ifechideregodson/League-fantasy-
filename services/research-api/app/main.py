from fastapi import FastAPI,HTTPException,UploadFile,File,Form
from pydantic import BaseModel,Field
from app.providers import discover
from app.research import synthesize_report
from app.integrations import integration_status
from app.engines import run_gpt_researcher,run_storm,answer_paperqa

app=FastAPI(title="Aster Research API",version="0.3.0")

class SearchRequest(BaseModel):
 query:str=Field(min_length=3,max_length=500)
 limit:int=Field(default=8,ge=1,le=20)

class ReportRequest(BaseModel):
 question:str=Field(min_length=10,max_length=2000)
 limit:int=Field(default=12,ge=1,le=20)

class AgentRequest(BaseModel):
 query:str=Field(min_length=10,max_length=1000)

@app.get("/health")
async def health():
 return {"status":"ok","service":"research-api","version":"0.3.0"}

@app.get("/api/v1/capabilities")
async def capabilities():
 return {
  "academic_search":["Crossref","OpenAlex","PubMed"],
  "report_synthesis":"requires OPENAI_API_KEY",
  "pdf_full_text_qa":"PaperQA2; requires OPENAI_API_KEY and valid PDF upload",
  "agent_frameworks":["GPT Researcher","Stanford STORM"],
  "clinical_inference":"disabled",
  "integrations":integration_status()
 }

@app.get("/api/v1/integrations")
async def integrations():
 return integration_status()

@app.post("/api/v1/search")
async def search(req:SearchRequest):
 try:
  return await discover(req.query,req.limit)
 except Exception as e:
  raise HTTPException(status_code=502,detail=f"Academic provider search failed: {e}") from e

@app.post("/api/v1/reports")
async def report(req:ReportRequest):
 try:
  found=await discover(req.question,req.limit)
  if not found["sources"]:
   raise HTTPException(status_code=422,detail="No scholarly sources found; report not generated.")
  result=await synthesize_report(req.question,found["sources"])
  return {**result,"provider_errors":found["provider_errors"]}
 except HTTPException:
  raise
 except ValueError as e:
  raise HTTPException(status_code=422,detail=str(e)) from e
 except RuntimeError as e:
  raise HTTPException(status_code=503,detail=str(e)) from e
 except Exception as e:
  raise HTTPException(status_code=502,detail=f"Report generation failed: {e}") from e

@app.post("/api/v1/agents/gpt-researcher")
async def gpt_research(req:AgentRequest):
 try:
  return await run_gpt_researcher(req.query)
 except RuntimeError as e:
  raise HTTPException(status_code=503,detail=str(e)) from e
 except Exception as e:
  raise HTTPException(status_code=502,detail=f"GPT Researcher failed: {e}") from e

@app.post("/api/v1/agents/stanford-storm")
async def stanford_storm(req:AgentRequest):
 try:
  return await run_storm(req.query)
 except RuntimeError as e:
  raise HTTPException(status_code=503,detail=str(e)) from e
 except Exception as e:
  raise HTTPException(status_code=502,detail=f"Stanford STORM failed: {e}") from e

@app.post("/api/v1/papers/ask")
async def paperqa_ask(
 question:str=Form(...,min_length=5,max_length=2000),
 file:UploadFile=File(...),
):
 try:
  if file.content_type not in {"application/pdf","application/octet-stream"}:
   raise HTTPException(status_code=415,detail="Only PDF uploads are supported.")
  payload=await file.read(20*1024*1024+1)
  if len(payload)>20*1024*1024:
   raise HTTPException(status_code=413,detail="PDF exceeds the 20 MB upload limit.")
  return await answer_paperqa(payload,file.filename or "research-paper.pdf",question)
 except HTTPException:
  raise
 except ValueError as e:
  raise HTTPException(status_code=422,detail=str(e)) from e
 except RuntimeError as e:
  raise HTTPException(status_code=503,detail=str(e)) from e
 except Exception as e:
  raise HTTPException(status_code=502,detail=f"PaperQA2 analysis failed: {e}") from e
 finally:
  await file.close()
