# CharAI — Copilot Instructions

## Project Overview

CharAI is a precision-agriculture web application that generates biochar prescription maps for farm fields. Users draw or upload field boundaries, provide crop and pricing info, and the system generates yield predictions and payback-period maps using terrain/DEM data and a TensorFlow ML model.

---

## Repository Layout

```
CharAI/
├── backend/          # Django REST API (Python 3.12)
├── frontend/         # React SPA (TypeScript, Vite)
├── database/         # Database provisioning scripts
├── docs/             # Design docs, logbooks, meeting notes
├── .github/          # CI/CD workflows, Copilot instructions
└── pipeline.sh       # Root deployment orchestrator
```

### Stack-Specific Instructions

Detailed conventions and context for each stack live in their own instruction files. Copilot will automatically apply them when editing files in the corresponding directories:

- **Backend**: See `.github/instructions/backend.instructions.md` (applies to `backend/**`)
- **Frontend**: See `.github/instructions/frontend.instructions.md` (applies to `frontend/**`)

---

## Testing

- **Backend**: Django `TestCase` in `core/tests.py`. Run with `python manage.py test`.
- **Frontend E2E**: Playwright tests in `frontend/tests/`. Uses `data-testid` attributes for selectors. Run with `npx playwright test`.
- **Module tests**: Individual test files in each `backend/modules/<Module>/` directory.

**Critical rule**: Any change to API payloads, form inputs, UI selectors, routes, or model fields that could break existing Playwright or Django tests **must** include corresponding test updates in the same changeset. Run `cd frontend/tests && npx playwright test` to verify before considering a task complete.

---

## Deployment

- **Frontend**: Multi-stage Docker build → Node build → Caddy serves static files.
- **Backend**: Python 3.12-slim Docker image with Gunicorn.
- **Orchestration**: `pipeline.sh` scripts at root and in each service directory. Accepts `--hosts` flag for `ALLOWED_HOSTS`.
- **Reverse proxy**: Caddy serves frontend and proxies `/api/` to the Django backend.

---

## ML / Data Pipeline

- Training scripts live in `backend/YieldPredictionModel/`. These run standalone (not via Django).
- Models are saved as `.keras` files under `YieldPredictionModel/Models/`.
- For standalone scripts, insert `backend/` into `sys.path` and call `django.setup()` before importing from `core` or `modules`.
- The pipeline: **Field GeoJSON → DEM download → GeoTIFF parse → Yield prediction → Payback period → Prescription map JSON**.

---

## General Coding Guidelines

1. **No emojis**: Never use emojis in code, comments, commit messages, documentation, or responses.
2. **Keep modules independent**: Each module under `backend/modules/` should be self-contained with its own tests.
3. **Validate at boundaries**: Serializers validate API input. Don't duplicate validation in views or services.
4. **Use existing patterns**: Follow the established APIView + serializer + service layer pattern. Don't introduce ViewSets or new paradigms without discussion.
5. **Type everything in TypeScript**: Avoid `any`. Define interfaces in `src/types/`.
6. **Test with data-testid**: Frontend E2E tests rely on `data-testid` attributes. Add them to new interactive elements.
7. **Environment variables**: Never hardcode secrets. Use `.env` + `django-environ` on the backend.
8. **Logging over print**: Use the `"charai"` logger on the backend, `console.debug` on the frontend for dev-only output.
9. **Commit messages**: Follow the conventions in `.github/instructions/commit-messages.instructions.md`.
