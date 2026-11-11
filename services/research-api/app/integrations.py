from __future__ import annotations
import os
from typing import Any

# A capability is only marked connected when a working endpoint/model is configured.
# Repository links are discovery references, not claims that code is installed.
INTEGRATIONS: list[dict[str, Any]] = [
    {"id":"gpt-researcher","name":"GPT Researcher","kind":"agent_framework","purpose":"Autonomous web research and source gathering","homepage":"https://github.com/assafelovic/gpt-researcher","env":["GPT_RESEARCHER_URL"],"mode":"remote_service"},
    {"id":"stanford-storm","name":"Stanford STORM","kind":"agent_framework","purpose":"Multi-perspective research and report generation","homepage":"https://github.com/stanford-oval/storm","env":["STORM_URL"],"mode":"remote_service"},
    {"id":"paperqa2","name":"PaperQA2","kind":"paper_qa","purpose":"Scientific full-text PDF question answering with citations","homepage":"https://github.com/Future-House/paper-qa","env":["PAPERQA2_URL"],"mode":"remote_service"},
    {"id":"openscholar","name":"OpenScholar","kind":"academic_model","purpose":"Academic literature research and evidence-grounded answers","homepage":"https://github.com/AkariAsai/ ನೆ","env":["OPENSCHOLAR_URL"],"mode":"remote_service"},
    {"id":"openscience","name":"OpenScience","kind":"research_workbench","purpose":"Scientific research workflows, code, experiments and traceable outputs","homepage":"https://github.com/synthetic-sciences/openscience","env":["OPENSCIENCE_URL"],"mode":"remote_service"},
    {"id":"scibert","name":"SciBERT","kind":"language_model","purpose":"Scientific text understanding and classification","homepage":"https://github.com/allenai/scibert","env":["SCIBERT_MODEL_ID"],"mode":"huggingface_or_local"},
    {"id":"biogpt","name":"BioGPT","kind":"language_model","purpose":"Biomedical language processing","homepage":"https://github.com/microsoft/BioGPT","env":["BIOGPT_MODEL_ID"],"mode":"huggingface_or_local"},
    {"id":"galactica","name":"Galactica","kind":"language_model","purpose":"Scientific language and knowledge capabilities; availability and licensing must be verified before use","homepage":"https://github.com/paperswithcode/galai","env":["GALACTICA_MODEL_ID"],"mode":"huggingface_or_local"},
    {"id":"papers-with-code","name":"Papers with Code","kind":"discovery_catalog","purpose":"Research papers, benchmarks and model discovery","homepage":"https://paperswithcode.com/","env":[],"mode":"public_catalog"},
    {"id":"hugging-face","name":"Hugging Face","kind":"model_catalog","purpose":"Pretrained model discovery and integration","homepage":"https://huggingface.co/","env":["HF_TOKEN"],"mode":"hub_api"},
    {"id":"thu-keg-awesome-ai-for-research","name":"THU-KEG/Awesome-AI-for-Research","kind":"tool_catalog","purpose":"Research tool and framework discovery","homepage":"https://github.com/THU-KEG/Awesome-AI-for-Research","env":[],"mode":"public_catalog"},
]

def integration_status() -> dict[str, Any]:
    items = []
    for item in INTEGRATIONS:
        configured = all(os.getenv(name) for name in item["env"]) if item["env"] else False
        state = "configured_endpoint" if configured else ("catalogue_available" if item["mode"] == "public_catalog" else "not_connected")
        items.append({**item, "status": state})
    return {
        "integrations": items,
        "connected_count": sum(x["status"] == "configured_endpoint" for x in items),
        "catalogue_count": sum(x["status"] == "catalogue_available" for x in items),
        "note": "A configured URL or model ID is not proof of a healthy service. Health checks and real inference tests are required before marking an integration operational.",
    }
