# Agent instructions

## Boundaries and entrypoints

- This is a two-package monorepo: `frontend/` is the Vite/React PWA and `backend/` is the FastAPI service. Each package owns its Compose files under `.devops/docker/develop/`.
- Frontend routes are wired in `frontend/src/main.tsx`: `/`, `/login`, and `/experiences/:id` are public; `/dashboard` and `/operator/*` use `ProtectedRoute`.
- Backend currently starts in `backend/src/main.py` as a clean FastAPI base with no application endpoints yet. New features must be added as responsibility-based modules under `backend/src`.
- The public catalog is still demo data in `frontend/src/data/experiences.ts`; it is not API-backed. Route maps use `frontend/src/components/RouteMap.tsx`.

## Commands and checks

- Frontend: `cd frontend && npm install && npm run dev`. Run `npm run lint`, then `npm run build`; build runs `tsc -b` before Vite.
- The frontend dependency lockfile is `frontend/package-lock.json`; keep it synchronized with `frontend/package.json`.
- Backend: create the environment with `cd backend && python -m venv .venv && pip install -r requirements.txt`, then run `uvicorn src.main:app --reload`. The initial app does not connect to PostgreSQL until a database module and migration are introduced.
- There is no test script, backend test suite, or CI workflow. Report lint/build as checks, not tests.
- Compose syntax can be checked without starting services:
  - `docker compose -f frontend/.devops/docker/develop/docker-compose.yml -f frontend/.devops/docker/develop/docker-compose.override.yml config --quiet`
  - `docker compose -f backend/.devops/docker/develop/docker-compose.yml -f backend/.devops/docker/develop/docker-compose.override.yml config --quiet`
- Do not start, stop, recreate, or rebuild containers autonomously. If runtime checks are needed, use the Compose commands documented in `README.md`; backend runtime endpoints are `/health` and `/docs`.

## Non-obvious constraints

- Preserve `/api` in frontend requests when backend integration begins: Vite proxies it to `http://backend:8000`. The current frontend login and operator data use local mocks persisted in `localStorage`; do not treat them as real authentication or persistence.
- Backend Compose loads `backend/.env.example` (not a runtime `.env`), connects to service `db`, and persists data in `postgres_data`; never commit real credentials.
- Database schema changes must use Alembic once the first domain model is added; do not introduce `Base.metadata.create_all()` at application startup.
- Development ports are exposed only by overrides: frontend `5173`, backend `8000`, PostgreSQL `5432`. Keep them there and do not add a root Compose file.
- The frontend Compose service has a persistent `node_modules` volume. After dependency changes, use its `run --rm frontend npm install` command if the container cannot resolve the package.
- PWA assets named by `frontend/vite.config.ts` must stay in `frontend/public/`. The WhatsApp availability number remains the provisional `+57 304 453 2134`.

## Pendientes del frontend

### Backend e integración

- Reemplazar datos mock por API real.
- Implementar autenticación real y roles desde JWT.
- Persistir usuarios, reservas, rutas y perfiles.
- Validar permisos de visitantes y guías.
- Aplicar y validar la migración inicial de Alembic contra las bases existentes; todas las modificaciones futuras deben usar nuevas revisiones.

### Visitante

- Mantener el flujo basado en modales: solicitar reserva desde el detalle y consultar/cancelar reservas desde el menú de usuario, sin reintroducir un dashboard separado.
- Validar disponibilidad real de fechas y horarios.
- Evitar reservas duplicadas o fechas ya ocupadas.
- Crear registro/login real de visitantes.
- Asociar las reservas al visitante autenticado.
- Permitir recuperación de cuenta.
- Conectar cancelaciones con el backend.
- Completar estados de carga, error y confirmación.

### Guía

- **RNT:** significa Registro Nacional de Turismo; actualmente el estado es simulado. Validarlo contra la fuente oficial y manejar estados como pendiente, activo, suspendido o rechazado.
- Guardar documentos y evidencias reales del RNT.
- Conectar calendario y solicitudes con datos reales, conservando indicadores de estado y filtros.
- Agregar pruebas automatizadas.
- Revisar accesibilidad y responsive.

### Catálogo

- Reemplazar las experiencias demo de `frontend/src/data/experiences.ts` por el catálogo real.
- Cargar rutas y disponibilidad desde el backend.
- Sincronizar la información pública con las rutas administradas por el guía.
