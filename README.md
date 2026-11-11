# Unified AI Research & Medical Intelligence Platform

A modular platform that brings together autonomous research, academic literature discovery, scientific PDF question-answering, citation-aware report writing, and a separately governed medical AI service.

## Repository layout

- `apps/web` — Next.js research workspace and administration UI.
- `services/research-api` — Python API for research orchestration and document workflows.
- `services/medical-ai` — integration boundary for the existing medical AI analyzer; clinical inference remains disabled until validated models and endpoints are explicitly registered.
- `docs` — architecture, integration and deployment notes.

## Integration strategy

This is a clean integration host, not a blind copy of third-party repositories. Upstream projects (GPT Researcher, STORM, PaperQA2, OpenScholar, OpenScience and model/tool repositories) must be integrated as separately versioned components after checking their exact upstream URLs, licences, dependency constraints, model licences and hardware requirements. Their names do not imply endorsement or that their source code has already been imported.

Existing owner projects reviewed as candidate components:
- [Medai](https://github.com/ifechideregodson/Medai) — existing clinical application and operational patterns.
- [medical-ai-analyzer](https://github.com/ifechideregodson/medical-ai-analyzer) — FastAPI/PyTorch inference service.

## Safety

- Research outputs must distinguish sourced facts, model-generated synthesis and uncertainty.
- Citations must point to retrieved source passages; never invent references.
- Medical model outputs are decision support only, not autonomous diagnosis. Require clinician review, provenance, validation and audit logging.
- Do not upload identifiable patient data to third-party research providers without appropriate consent, contracts and safeguards.
- Secrets belong in deployment environment variables, never in Git.

## Development status

Initial repository scaffold. No third-party code or pretrained weights have been copied into this repository yet.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and [docs/INTEGRATION-PLAN.md](docs/INTEGRATION-PLAN.md).