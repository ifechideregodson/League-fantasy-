from __future__ import annotations

import importlib.util
import os
from typing import Any

INTEGRATIONS: list[dict[str, Any]] = [
    {"id":"gpt-researcher","name":"GPT Researcher","kind":"agent_framework","purpose":"Autonomous web research and source gathering","homepage":"https://github.com/assafelovic/gpt-researcher","module":"gpt_researcher","required_env":["OPENAI_API_KEY"]},
    {"id":"stanford-storm","name":"Stanford STORM","kind":"agent_framework","purpose":"Multi-perspective research and report generation","homepage":"https://github.com/stanford-oval/storm","module":"knowledge_storm","required_env":["OPENAI_API_KEY","TAVILY_API_KEY"]},
    {"id":"paperqa2","name":"PaperQA2","kind":"paper_qa","purpose":"Scientific full-text PDF question answering with citations","homepage":"https://github.com/Future-House/paper-qa","module":"paperqa","required_env":["OPENAI_API_KEY"]},
    {"id":"openscholar","name":"OpenScholar","kind":"academic_model","purpose":"Academic literature research and evidence-grounded answers","homepage":"https://github.com/AkariAsai/OpenScholar","required_env":["OPENSCHOLAR_URL"]},
    {"id":"openscience","name":"OpenScience","kind":"research_workbench","purpose":"Scientific research workflows; exact project identity must be confirmed","homepage":"https://github.com/","required_env":["OPENSCIENCE_URL"]},
    {"id":"scibert","name":"SciBERT","kind":"language_model","purpose":"Scientific text understanding and classification","homepage":"https://github.com/allenai/scibert","required_env":["SCIBERT_MODEL_ID"]},
    {"id":"biogpt","name":"BioGPT","kind":"language_model","purpose":"Biomedical language processing","homepage":"https://github.com/microsoft/BioGPT","required_env":["BIOGPT_MODEL_ID"]},
    {"id":"galactica","name":"Galactica","kind":"language_model","purpose":"Scientific language capabilities; availability and licensing must be verified","homepage":"https://github.com/paperswithcode/galai","required_env":["GALACTICA_MODEL_ID"]},
    {"id":"papers-with-code","name":"Papers with Code","kind":"discovery_catalog","purpose":"Research papers, benchmarks and model discovery","homepage":"https://paperswithcode.com/","catalogue":True},
    {"id":"hugging-face","name":"Hugging Face","kind":"model_catalog","purpose":"Pretrained model discovery and integration","homepage":"https://huggingface.co/","required_env":["HF_TOKEN"]},
    {"id":"thu-keg-awesome-ai-for-research","name":"THU-KEG/Awesome-AI-for-Research","kind":"tool_catalog","purpose":"Research tool and framework discovery","homepage":"https://github.com/THU-KEG/Awesome-AI-for-Research","catalogue":True},
]

def integration_status() -> dict[str, Any]:
    items = []
    for item in INTEGRATIONS:
        module = item.get("module")
        installed = bool(module and importlib.util.find_spec(module))
        env_ready = all(os.getenv(key) for key in item.get("required_env", []))
        if item.get("catalogue"):
            state = "catalogue_linked"
        elif installed and env_ready:
            state = "installed_and_configured"
        elif installed:
            state = "installed_missing_credentials"
        elif item.get("required_env") and all(os.getenv(key) for key in item["required_env"]):
            state = "credentials_set_package_missing"
        else:
            state = "not_configured"
        items.append({**item, "status": state, "package_installed": installed, "credentials_configured": env_ready})
    return {
        "integrations": items,
        "installed_and_configured_count": sum(x["status"] == "installed_and_configured" for x in items),
        "catalogue_count": sum(x["status"] == "catalogue_linked" for x in items),
        "note": "Installed and configured does not guarantee provider health. A real inference request is required to verify operation.",
    }
