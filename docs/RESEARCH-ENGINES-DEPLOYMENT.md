# Research engine deployment

The research API installs the following upstream Python projects from PyPI:

- `gpt-researcher` — autonomous web research.
- `knowledge-storm` — Stanford STORM and Co-STORM.
- `paper-qa` — PaperQA2 scientific-document retrieval and question answering.

Python 3.12 is configured for the research API because current GPT Researcher setup guidance specifies Python 3.12 or later. PaperQA2 requires Python 3.11 or later.

## Required Render environment variables

Set these on the **aster-research-api** service:

| Variable | Purpose |
|---|---|
| `RESEARCH_API_TOKEN` | Shared secret; set the exact same value on both web and research API services |
| `OPENAI_API_KEY` | LLM access used by GPT Researcher, STORM, PaperQA2 and existing report synthesis |
| `TAVILY_API_KEY` | Web search retriever used by the Stanford STORM adapter |
| `OPENAI_MODEL` | Model for the existing metadata synthesis workflow |
| `STORM_MODEL` | LiteLLM model identifier for STORM; defaults to `openai/gpt-4o-mini` |
| `OPENALEX_EMAIL` | Polite-pool contact for OpenAlex |
| `CROSSREF_MAILTO` | Polite-pool contact for Crossref |

Never commit API keys to GitHub. Add them only in Render's secret environment-variable settings.

## API routes

- `GET /api/v1/integrations` — reports whether packages are installed and required credentials are present. This is configuration status, not a live inference health check.
- `POST /api/v1/agents/gpt-researcher` — JSON body: `{"query":"..." }`.
- `POST /api/v1/agents/stanford-storm` — JSON body: `{"query":"..." }`.
- `POST /api/v1/papers/ask` — multipart form fields: `file` (PDF) and `question`.

The Next.js UI is at `/research/engines`. The Next.js server proxies attach `Authorization: Bearer <RESEARCH_API_TOKEN>`. Set this secret on both Render services.

The Render Blueprint passes the API service's private `hostport`; the Next.js proxy adds `http://` when needed.

## Important operational limits

- PaperQA2 currently processes one PDF per request, up to 20 MB. The PDF is placed in a temporary directory and deleted when processing finishes. There is no durable paper library or reusable index yet.
- GPT Researcher and STORM can take several minutes and incur provider charges. Their API routes have long timeouts; verify the hosting plan's request-duration limits before production use.
- The Python research API requires a shared bearer token for `/api/v1/*`. This protects the service-to-service endpoints, but it is not end-user authentication, per-user quotas, durable job queues, or cost controls. The web application still needs user authentication and usage limits before unrestricted public launch.
- Generated reports and citations must be checked against the original source material. The engines do not provide medical diagnosis.
- Render deploys from the blueprint; dependency installation and import compatibility must be confirmed by a successful deployment and real test requests before these engines can be described as operational.
