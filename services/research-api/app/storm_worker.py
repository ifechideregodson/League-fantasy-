from __future__ import annotations

import json
import os
import sys
import tempfile
from pathlib import Path

from knowledge_storm import STORMWikiRunnerArguments, STORMWikiRunner, STORMWikiLMConfigs
from knowledge_storm.lm import LitellmModel
from knowledge_storm.rm import TavilySearchRM


def main() -> None:
    topic = sys.argv[1]
    with tempfile.TemporaryDirectory(prefix="aster-storm-") as output:
        args = STORMWikiRunnerArguments(output_dir=output, max_conv_turn=3, max_perspective=3, search_top_k=5, max_thread_num=3)
        lm = LitellmModel(model=os.getenv("STORM_MODEL", "openai/gpt-4o-mini"), api_key=os.environ["OPENAI_API_KEY"], temperature=0.2, max_tokens=3000)
        configs = STORMWikiLMConfigs()
        configs.set_conv_simulator_lm(lm)
        configs.set_question_asker_lm(lm)
        configs.set_outline_gen_lm(lm)
        configs.set_article_gen_lm(lm)
        configs.set_article_polish_lm(lm)
        retriever = TavilySearchRM(tavily_search_api_key=os.environ["TAVILY_API_KEY"], k=args.search_top_k)
        runner = STORMWikiRunner(args, configs, retriever)
        runner.run(topic=topic, do_research=True, do_generate_outline=True, do_generate_article=True, do_polish_article=True)
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
        print(json.dumps({"engine": "Stanford STORM", "topic": topic, "report_files": documents, "evidence_level": "web_research", "note": "Review cited references in the generated report before relying on claims."}))


if __name__ == "__main__":
    main()
