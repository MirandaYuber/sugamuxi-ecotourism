# Agent instructions

## Structure and entrypoints

- This is a two-package repository: `frontend/` is the Vite/React PWA and `backend/` is the FastAPI service. Each package has its own Compose files under `.devops/docker/develop/`; there is no root Compose file.
- Frontend routes are wired in `frontend/src/main.tsx`: `/`, `/login`, and `/experiences/:id` are public; `/operator/*` requires the operator role and `/operator` redirects to `/operator/dashboard`. There is no visitor dashboard route.
- The frontend API clients are under `frontend/src/features/*/api.ts`; keep requests under `/api` because Vite proxies that prefix to `http://backend:8000`. API errors use `frontend/src/components/AlertMessage.tsx`.
- The backend app entrypoint is `backend/src/main.py`. Add domains as modules under `backend/src` and register their routers there; current auth, bookings, routes, and operator-profile routers are already registered.
- Public catalog data is now API-backed (`/api/public/routes`), while operator UI has an explicit offline toggle persisted as `operator_offline`. Do not reintroduce demo/localStorage data as the normal API path.

## Commands and verification

- Frontend: `cd frontend && npm install`; run `npm run lint` first, then `npm run build` (`build` runs `tsc -b` and `vite build`). There is no test script. Keep `package-lock.json` synchronized with `package.json`.
- Backend: `cd backend && python -m venv .venv && pip install -r requirements.txt`; run with `uvicorn src.main:app --reload`. There is no backend test suite.
- Implement each new backend endpoint together with its frontend consumer; do not leave functional API work without a visible flow.
- Database schema changes require Alembic revisions; from `backend/`, apply them with `alembic upgrade head`. Do not use `Base.metadata.create_all()` at startup.
- Validate Compose without starting services: `docker compose -f frontend/.devops/docker/develop/docker-compose.yml -f frontend/.devops/docker/develop/docker-compose.override.yml config --quiet` and `docker compose -f backend/.devops/docker/develop/docker-compose.yml -f backend/.devops/docker/develop/docker-compose.override.yml config --quiet`. Do not start, stop, recreate, or rebuild containers autonomously.
- If the frontend Docker `node_modules` volume is stale after dependency changes, run `docker compose -f frontend/.devops/docker/develop/docker-compose.yml -f frontend/.devops/docker/develop/docker-compose.override.yml run --rm frontend npm install`.

## Environment and assets

- Backend local settings read `backend/.env`; Compose loads `backend/.env.example` and the database service is named `db`. Never commit real credentials.
- PWA assets referenced by `frontend/vite.config.ts` belong in `frontend/public/`. The provisional WhatsApp number is `+57 304 453 2134`.
