# Agent instructions

## Repository shape

- This is a two-package monorepo: `frontend/` is the Vite/React PWA and `backend/` is the FastAPI service; each package owns its Compose files under `.devops/docker/develop/`.
- Frontend routing is defined in `frontend/src/main.tsx`: `/`, `/login`, and `/experiences/:id` are public; `/operator/*` is behind `ProtectedRoute` and redirects `/operator` to `/operator/dashboard`. There is no visitor dashboard route.
- The backend entrypoint is `backend/src/main.py`; authentication is under `backend/src/auth` with `/api/auth/register`, `/api/auth/login`, and `/api/auth/me`. Add other features as responsibility-based modules under `backend/src`.
- Public experiences are demo data in `frontend/src/data/experiences.ts`; visitor reservation listing is available at backend `/api/bookings/me`, while reservation creation/cancellation and operator data remain localStorage mocks.

## Commands and verification

- Cada endpoint nuevo debe implementarse junto con su consumidor en la vista o flujo frontend correspondiente; no dejar endpoints funcionales sin integración visual.
- Frontend local setup: `cd frontend && npm install`; run with `npm run dev`. Verify in this order: `npm run lint`, then `npm run build` (`build` runs `tsc -b` before `vite build`). There is no test script.
- Keep `frontend/package-lock.json` synchronized with `frontend/package.json`. If the Docker `node_modules` volume is stale after dependency changes, run `docker compose -f frontend/.devops/docker/develop/docker-compose.yml -f frontend/.devops/docker/develop/docker-compose.override.yml run --rm frontend npm install`.
- Backend local setup: `cd backend && python -m venv .venv && pip install -r requirements.txt`; run with `uvicorn src.main:app --reload`. There is no backend test suite or CI workflow.
- Check Compose configuration without starting services:
  - `docker compose -f frontend/.devops/docker/develop/docker-compose.yml -f frontend/.devops/docker/develop/docker-compose.override.yml config --quiet`
  - `docker compose -f backend/.devops/docker/develop/docker-compose.yml -f backend/.devops/docker/develop/docker-compose.override.yml config --quiet`
- Do not start, stop, recreate, or rebuild containers autonomously. Compose overrides expose frontend `5173`, backend `8000`, and PostgreSQL `5432`; there is no root Compose file.

## Non-obvious constraints

- Preserve the `/api` prefix in future frontend requests: Vite proxies it to `http://backend:8000`.
- Backend Compose loads `backend/.env.example` and the database service is named `db`; local backend settings read `.env`. Never commit real credentials.
- Once domain models are introduced, use Alembic migrations for schema changes; do not call `Base.metadata.create_all()` at application startup.
- PWA assets referenced by `frontend/vite.config.ts` belong in `frontend/public/`. The provisional WhatsApp number is `+57 304 453 2134`.
