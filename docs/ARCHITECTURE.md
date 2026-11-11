# Architecture

## System shape

The web application is the user-facing control plane. Research orchestration and medical inference are separate services so they can be deployed, scaled, monitored and permissioned independently.

```text
Browser
  |
  v
Next.js Web App ---- PostgreSQL (users, projects, jobs, metadata, audit)
  |                         |
  |                         +---- Private object storage (PDFs, datasets, images)
  |
  +---- Research API ---- Search providers / academic indexes / PDF retrieval
  |          |
  |          +---- Research adapters (GPT Researcher, STORM, PaperQA2, OpenScholar)
  |
  +---- Medical AI API ---- validated model registry / inference workers
               |
               +---- Existing medical-ai-analyzer service
```

## Core domains

1. Identity and access: authenticated users, roles, organization membership and project-level authorization.
2. Research projects: research question, scope, source collections, task status and generated artifacts.
3. Source library: metadata, file checksum, storage key, extraction status, page/section references and access policy.
4. Retrieval: hybrid keyword/vector retrieval with source passage provenance.
5. Research agents: adapters for planning, parallel research, synthesis and report generation.
6. Citation validation: verify every citation against a stored source and passage before publication.
7. Model registry: provider, model/version, licence, intended use, evaluation evidence and activation status.
8. Clinical workflow: patient/consent context, image asset, model run, clinician review and signed report. Keep this isolated from general web research.

## Trust boundaries

- Treat retrieved web pages, PDFs and uploaded files as untrusted data, never as executable instructions.
- Keep provider API keys server-side.
- Use private object storage and short-lived signed download links.
- Record audit events for sensitive access and clinical workflow changes.
- Do not mix patient-identifiable records into general research indexing by default.
- A model is not clinically usable merely because its weights are downloadable. Require documented validation, intended-use review, monitoring and authorized activation.

## Deployment

Deploy the web app, research API, and medical inference API as separate services. Use managed PostgreSQL and private object storage. Add a queue/worker service for long-running tasks before enabling multi-user production workloads.
