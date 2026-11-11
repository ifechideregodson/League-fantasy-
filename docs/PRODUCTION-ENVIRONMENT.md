# Production environment

Research API service variables:
- OPENAI_API_KEY: required for report synthesis; secret.
- OPENAI_MODEL: optional supported model name.
- OPENALEX_EMAIL: optional OpenAlex contact.
- CROSSREF_MAILTO: optional Crossref contact.

Web application:
- DATABASE_URL: PostgreSQL connection.
- AUTH_SECRET: random secret for authentication.
- RESEARCH_API_URL: deployed research API URL.
- RESEARCH_API_TOKEN: configure only after API authentication middleware is deployed.

Live now in the research API code: Crossref, OpenAlex and PubMed metadata search. AI synthesis calls the configured OpenAI API and returns a clear service error if the key is absent or provider fails. Report claims are explicitly limited to publication metadata; full text is not yet retrieved.

Not production-enabled: user authentication, persistent job/report storage, PDF full-text ingestion and Q&A, API auth/rate limits, GPT Researcher/STORM/PaperQA2/OpenScholar adapters, and clinical inference. Do not present these as operational before implementation and testing.

No sample data, fabricated outputs or mock clinical results are seeded.
