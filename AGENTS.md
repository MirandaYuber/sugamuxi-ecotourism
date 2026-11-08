# Agent instructions

## Boundaries and entrypoints

- This is a two-package monorepo: `frontend/` is the Vite/React PWA and `backend/` is the FastAPI service. Each package owns its Compose files under `.devops/docker/develop/`.
- Frontend routes are wired in `frontend/src/main.tsx`: `/`, `/login`, and `/experiences/:id` are public; `/dashboard` and `/operator/*` use `ProtectedRoute`.
- Backend starts in `backend/app/main.py`, serves health at `/health`, and mounts routers under `/api/v1` (`/auth/*` and `/operator/*`). Keep password/JWT behavior in `backend/app/services/auth.py`.
- The public catalog is still demo data in `frontend/src/data/experiences.ts`; it is not API-backed. Route maps use `frontend/src/components/RouteMap.tsx`.

## Commands and checks

- Frontend: `cd frontend && npm install && npm run dev`. Run `npm run lint`, then `npm run build`; build runs `tsc -b` before Vite.
- The frontend dependency lockfile is `frontend/package-lock.json`; keep it synchronized with `frontend/package.json`.
- Backend: create the environment with `cd backend && python -m venv .venv && pip install -r requirements.txt`, then run `uvicorn app.main:app --reload`. Local backend execution needs a `backend/.env` and reachable PostgreSQL.
- There is no test script, backend test suite, or CI workflow. Report lint/build as checks, not tests.
- Compose syntax can be checked without starting services:
  - `docker compose -f frontend/.devops/docker/develop/docker-compose.yml -f frontend/.devops/docker/develop/docker-compose.override.yml config --quiet`
  - `docker compose -f backend/.devops/docker/develop/docker-compose.yml -f backend/.devops/docker/develop/docker-compose.override.yml config --quiet`
- Do not start, stop, recreate, or rebuild containers autonomously. If runtime checks are needed, use the Compose commands documented in `README.md`; backend runtime endpoints are `/health` and `/docs`.

## Non-obvious constraints

- Preserve `/api` in frontend requests when backend integration begins: Vite proxies it to `http://backend:8000`. The current frontend login and operator data use local mocks persisted in `localStorage`; do not treat them as real authentication or persistence.
- Backend Compose loads `backend/.env.example` (not a runtime `.env`), connects to service `db`, and persists data in `postgres_data`; never commit real credentials.
- `Base.metadata.create_all()` runs during backend import/startup and no Alembic workflow exists. Do not rely on model changes for existing databases without first adding a migration workflow.
- Development ports are exposed only by overrides: frontend `5173`, backend `8000`, PostgreSQL `5432`. Keep them there and do not add a root Compose file.
- The frontend Compose service has a persistent `node_modules` volume. After dependency changes, use its `run --rm frontend npm install` command if the container cannot resolve the package.
- PWA assets named by `frontend/vite.config.ts` must stay in `frontend/public/`. The WhatsApp availability number remains the provisional `+57 304 453 2134`.

## Pendientes del frontend

- **RNT:** significa Registro Nacional de Turismo. En la interfaz, el estado puede ser `Pendiente`, `Verificado` o `Rechazado`; actualmente es un dato simulado. Falta definir el flujo y los documentos reales de verificación.
- Reemplazar los mocks de `frontend/src/features/operator/api.ts` por servicios reales cuando exista el backend, conservando la misma interfaz para no rehacer las vistas.
- Completar la experiencia del viajero en `/dashboard`, incluyendo reservas, estados, detalle y cancelación.
- Conectar el login y la sesión con autenticación real; el token actual es únicamente de demostración.
- Completar y revisar estados de carga, vacío, error y confirmación en catálogo, perfil, rutas y reservas.
- Revisar responsive, accesibilidad y navegación del panel del operador en dispositivos móviles.
- Definir qué campos y evidencias requiere el proceso de verificación RNT antes de diseñar su integración.
