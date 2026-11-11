# Research API

## Local development

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Health check: `GET /health`

This service is currently a scaffold. Research providers and agent frameworks are not enabled until their upstream sources, licences and configuration are verified.
