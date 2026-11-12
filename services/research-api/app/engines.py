from __future__ import annotations

import asyncio
import json
import os
import tempfile
from pathlib import Path
from typing import Any


def _required(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"{name} is required for this research engine.")
    return value


async def run_gpt_researcher(query: str) -> dict[str, Any]:
    """Run the official GPT Researcher Python SDK in a worker thread."""
    _required("OPENAI_API_KEY")
    try:
        from gpt_researcher import GPTResearcher
    except ImportError as exc:
        raise RuntimeError("GPT Researcher package is not installed.") from exc

    async def execute() -> dict[str, Any]:
        researcher = GPTResearcher(query=query, report_type="research_report")
        await researcher.conduct_research()
        report = await researcher.write_report()
        sources = getattr(researcher, "get_research_sources", None)
        refs = await sources() if callable(sources) else []
        return {"engine": "GPT Researcher", "query": query, "report": str(report), "sources": refs if isinstance(refs, list) else [], "evidence_level": "web_research"}

    return await asyncio.wait_for(execute(), timeout=900)


async def run_storm(topic: str) -> dict[str, Any]:
    """Run Stanford STORM in its own isolated Python environment."""
    _required("OPENAI_API_KEY")
    _required("TAVILY_API_KEY")
    worker_python = Path(__file__).resolve().parent.parent / ".storm-venv" / "bin" / "python"
    worker_script = Path(__file__).resolve().parent / "storm_worker.py"
    if not worker_python.exists() or not worker_script.exists():
        raise RuntimeError("Stanford STORM worker environment is not installed. Check the Render build logs.")
    process = await asyncio.create_subprocess_exec(str(worker_python), str(worker_script), topic, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE, env=os.environ.copy())
    try:
        stdout, stderr = await asyncio.wait_for(process.communicate(), timeout=1800)
    except asyncio.TimeoutError:
        process.kill()
        await process.wait()
        raise RuntimeError("Stanford STORM exceeded its 30-minute execution limit.")
    if process.returncode != 0:
        detail = stderr.decode("utf-8", errors="replace")[-4000:]
        raise RuntimeError(f"Stanford STORM worker failed: {detail}")
    try:
        return json.loads(stdout.decode("utf-8"))
    except (json.JSONDecodeError, UnicodeError) as exc:
        raise RuntimeError("Stanford STORM worker returned invalid output.") from exc


async def answer_paperqa(pdf_bytes: bytes, filename: str, question: str) -> dict[str, Any]:
    """Index one uploaded PDF with PaperQA2 and answer from its extracted evidence."""
    _required("OPENAI_API_KEY")
    try:
        from paperqa import Docs
    except ImportError as exc:
        raise RuntimeError("PaperQA2 package is not installed.") from exc
    safe_name = Path(filename).name
    if not safe_name.lower().endswith(".pdf") or not pdf_bytes.startswith(b"%PDF-"):
        raise ValueError("Upload a valid PDF file.")
    if len(pdf_bytes) > 20 * 1024 * 1024:
        raise ValueError("PDF exceeds the 20 MB upload limit.")
    with tempfile.TemporaryDirectory(prefix="aster-paperqa-") as directory:
        path = Path(directory) / safe_name
        path.write_bytes(pdf_bytes)
        docs = Docs()
        await docs.aadd(str(path))
        session = await docs.aquery(question)
        answer = str(session)
        if not answer.strip():
            raise RuntimeError("PaperQA2 returned an empty answer.")
        return {"engine": "PaperQA2", "filename": safe_name, "question": question, "answer": answer, "evidence_level": "uploaded_pdf_full_text", "temporary_processing": True, "note": "The uploaded PDF is processed in temporary storage and deleted after the request. This endpoint does not yet retain documents or indexes."}
