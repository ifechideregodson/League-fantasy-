# Integration plan

## Phase 0 — repository and security foundation
- Establish this monorepo as the integration host.
- Add CI, dependency pinning, secret scanning and environment validation.
- Define common job, source, citation and model-registry contracts.

## Phase 1 — web workspace
- Authentication and role-based access.
- Research projects, document library, job history and report viewer.
- PostgreSQL persistence and private file storage.

## Phase 2 — literature and PDF research
- Add academic search adapters (for example, Crossref, OpenAlex and PubMed where appropriate).
- Add PDF ingestion, text extraction, chunking and source-level citations.
- Integrate PaperQA2 only after confirming upstream repository, licence and runtime requirements.

## Phase 3 — research agents
- Add GPT Researcher and STORM as isolated adapters/workers.
- Add OpenScholar capabilities where the upstream implementation and model licence permit.
- Require evidence-backed citations and a review step before export.

## Phase 4 — scientific and biomedical models
- Evaluate SciBERT and BioGPT checkpoints against task-specific benchmarks.
- Treat Galactica as an experimental research reference, not a production dependency.
- Record model cards, weights licence, version, evaluation and hardware needs.

## Phase 5 — medical service connection
- Connect the existing medical-ai-analyzer API through an authenticated service-to-service interface.
- Preserve its model provenance, confidence, limitations and clinician review flow.
- Do not activate any clinical inference endpoint without validated model evidence and explicit administrator approval.

## Phase 6 — deployment and operations
- Deploy web, research API, worker and medical API separately.
- Add queue monitoring, logs, backups, rate limits, retention controls and incident procedures.

## Required before importing upstream source
For each upstream project, verify the exact official repository URL, licence, commit/tag, supported Python/Node versions, dependency conflicts, model/data terms and GPU requirements. Prefer adapter-based integration or pinned submodules over merging incompatible dependency trees.
