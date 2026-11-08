# Agent instructions

## Boundaries and entrypoints

- This is a two-package monorepo: `frontend/` is the Vite/React PWA and `backend/` is the FastAPI service; keep their Docker/Compose files in their respective `.devops/` directories.
- Frontend routes are wired in `frontend/src/main.tsx`: `/`, `/login`, and `/experiences/:id` are public; `/dashboard` and `/operator/*` use `ProtectedRoute`.
- Backend starts at `backend/app/main.py`, mounts routes below `/api/v1`, and currently exposes auth at `/api/v1/auth/*`; keep auth behavior in `backend/app/services/auth.py` rather than putting it in route handlers.

## Commands and verification

- Cuando se solicite "actualizar documentación", actualizar tanto `AGENTS.md` como `README.md` con la información verificada del cambio.
- Frontend: `cd frontend && npm install && npm run dev`; run `npm run lint` and `npm run build` (the build runs `tsc -b` before Vite).
- Frontend uses Tailwind, Lucide, React Hook Form, Zod, Leaflet and React Leaflet; public experience demo data is in `frontend/src/data/experiences.ts` and the map component is `frontend/src/components/RouteMap.tsx`.
- Backend: `cd backend && python -m venv .venv && pip install -r requirements.txt && uvicorn app.main:app --reload`.
- There is no test script, backend test suite, or CI workflow currently; do not report tests as passing when only build/lint was run. `frontend/package-lock.json` is the frontend dependency lockfile.
- Compose validation: run `docker compose -f frontend/.devops/docker/develop/docker-compose.yml -f frontend/.devops/docker/develop/docker-compose.override.yml config --quiet` and the equivalent pair under `backend/.devops/docker/develop/`.
- Do not start, stop, recreate, or rebuild containers autonomously; if needed, give the user the exact Compose command. Backend runtime checks require PostgreSQL and can use `/health` and `/docs`.

## Wiring and operational constraints

- Development ports are defined only in the override files (`5173`, `8000`, `5432`); do not move them into base Compose files or create a root Compose file.
- Backend Compose loads `backend/.env.example`, uses the `db` service for `DATABASE_URL`, and persists PostgreSQL in the `postgres_data` volume. Never commit real credentials; local non-Compose runs need a suitable `backend/.env`.
- `Base.metadata.create_all()` runs during backend startup and there are no migrations yet; schema changes need a migration workflow before being relied on.
- Vite proxies `/api` to `http://backend:8000`; preserve the `/api` prefix in frontend calls. Login expects OAuth2 form fields `username`/`password`, returns a bearer JWT, and the frontend stores it as `localStorage.access_token`.
- The public experience detail currently uses static data; WhatsApp availability links use the provisional Colombian number `+57 304 453 2134` until guide contact data is available from the API.
- The frontend Compose service mounts a persistent `node_modules` volume; after adding dependencies, rebuild and run `docker compose ... run --rm frontend npm install` if the running container cannot resolve a new package.
- PWA manifest/service-worker settings are in `frontend/vite.config.ts`; keep its referenced assets in `frontend/public/`.
