from __future__ import annotations

import asyncio
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
        return {
            "engine": "GPT Researcher",
            "query": query,
            "report": str(report),
            "sources": refs if isinstance(refs, list) else [],
            "evidence_level": "web_research",
        }

    return await asyncio.wait_for(execute(), timeout=900)


async def run_storm(topic: str) -> dict[str, Any]:
    """Run Stanford's official knowledge-storm package; requires a search key."""
    _required("OPENAI_API_KEY")
    _required("TAVILY_API_KEY")
    try:
        from knowledge_storm import STORMWikiRunnerArguments, STORMWikiRunner, STORMWikiLMConfigs
        from knowledge_storm.lm import LitellmModel
        from knowledge_storm.rm import TavilySearchRM
    except ImportError as exc:
        raise RuntimeError("Stanford knowledge-storm package is not installed.") from exc

    def execute() -> dict[str, Any]:
        with tempfile.TemporaryDirectory(prefix="aster-storm-") as output:
            args = STORMWikiRunnerArguments(
                output_dir=output,
                max_conv_turn=3,
                max_perspective=3,
                search_top_k=5,
                max_thread_num=3,
            )
            lm = LitellmModel(
                model=os.getenv("STORM_MODEL", "openai/gpt-4o-mini"),
                api_key=os.environ["OPENAI_API_KEY"],
                temperature=0.2,
                max_tokens=3000,
            )
            configs = STORMWikiLMConfigs()
            configs.set_conv_simulator_lm(lm)
            configs.set_question_asker_lm(lm)
            configs.set_outline_gen_lm(lm)
            configs.set_article_gen_lm(lm)
            configs.set_article_polish_lm(lm)
            retriever = TavilySearchRM(
                tavily_search_api_key=os.environ["TAVILY_API_KEY"],
                k=args.search_top_k,
            )
            runner = STORMWikiRunner(args, configs, retriever)
            runner.run(
                topic=topic,
                do_research=True,
                do_generate_outline=True,
                do_generate_article=True,
                do_polish_article=True,
            )
            runner.post_run()
            files = [p for p in Path(output).rglob("*") if p.is_file() and p.suffix.lower() in {".md", ".txt"}]
            documents = []
            for path in files:
                try:
                    documents.append({"file": path.name, "content": path.read_text(encoding="utf-8")})
                except (OSError, UnicodeError):
                    continue
            if not documents:
                raise RuntimeError("STORM completed without producing a readable report file.")
            return {
                "engine": "Stanford STORM",
                "topic": topic,
                "report_files": documents,
                "evidence_level": "web_research",
                "note": "Review cited references in the generated report before relying on claims.",
            }

    return await asyncio.wait_for(asyncio.to_thread(execute), timeout=1800)


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
        return {
            "engine": "PaperQA2",
            "filename": safe_name,
            "question": question,
            "answer": answer,
            "evidence_level": "uploaded_pdf_full_text",
            "temporary_processing": True,
            "note": "The uploaded PDF is processed in temporary storage and deleted after the request. This endpoint does not yet retain documents or indexes.",
        }
