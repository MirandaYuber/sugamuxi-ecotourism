# Sugamuxi Ecoturismo Marketplace

PWA para descubrir experiencias ecoturísticas del corredor Sugamuxi – Paz de Río.

## Funcionalidad actual

- Inicio público con buscador, filtro por municipio y tarjetas de experiencias.
- Detalle de experiencia en `/experiences/:id` con galería, datos de actividad, guía, calificación y ruta sobre OpenStreetMap.
- Cambio de tema claro/oscuro persistido en `localStorage` sin flash durante la carga.
- Consulta de disponibilidad por WhatsApp al número provisional `+57 304 453 2134`.
- Panel protegido del operador en `/operator/*`, con perfil RNT, rutas, reservas y registro de puntos de recorrido en el mapa.
- El panel del operador consume el backend y ofrece un modo offline explícito persistido en `localStorage` mediante `operator_offline`.
- Las rutas se crean y editan desde un modal; sus tarjetas muestran estado por color y se pueden filtrar por nombre, municipio o estado.
- Al editar una ruta se pueden eliminar puntos del mapa individualmente desde el último punto o limpiar todo el recorrido.
- La vista de reservas incluye un calendario mensual con indicadores para guianzas confirmadas y solicitudes pendientes, una agenda del día seleccionado y una sección inferior de solicitudes pendientes filtrable por ruta.
- El detalle de cada reserva muestra los datos del visitante, mensaje, necesidades especiales y un enlace directo de WhatsApp cuando hay teléfono disponible.
- El visitante debe iniciar sesión para solicitar una reserva; el login unificado redirige visitantes y guías según su rol.
- Las reservas del visitante se consultan en un modal desde el menú de usuario o después de enviar una solicitud; no existe una vista separada de dashboard del visitante.

El catálogo público se carga desde PostgreSQL mediante `GET /api/public/routes` y `GET /api/public/routes/{id}`. `frontend/src/data/experiences.ts` contiene únicamente el tipo compartido y el formateador de precios usados por la interfaz.

El selector de tema está disponible en las vistas públicas y privadas. La preferencia se comparte entre vistas mediante `localStorage` usando la clave `sugamuxi-theme`.

## Puesta en marcha completa con Docker

### Requisitos

- Docker Engine con Docker Compose v2.
- Clonar el repositorio y ejecutar los comandos desde su raíz.
- No es necesario instalar Node.js ni Python en el host.

El frontend y el backend tienen configuraciones Compose independientes. Levanta primero la base de datos y el backend:

```bash
docker compose -f backend/.devops/docker/develop/docker-compose.yml \
  -f backend/.devops/docker/develop/docker-compose.override.yml up --build -d
```

Aplica las migraciones dentro del contenedor:

```bash
docker compose -f backend/.devops/docker/develop/docker-compose.yml \
  -f backend/.devops/docker/develop/docker-compose.override.yml run --rm backend alembic upgrade head
```

Levanta el frontend en otro terminal:

```bash
docker compose -f frontend/.devops/docker/develop/docker-compose.yml \
  -f frontend/.devops/docker/develop/docker-compose.override.yml up --build
```

URLs disponibles:

- Frontend: `http://localhost:5173`
- Backend/OpenAPI: `http://localhost:8000/docs`
- Healthcheck: `http://localhost:8000/health`
- PostgreSQL: `localhost:5432`

El Compose del backend usa el servicio `db` y el volumen persistente `postgres_data`. Las imágenes cargadas se guardan en `backend/media/` y esa carpeta está dentro del volumen montado del proyecto.

Para detener los servicios:

```bash
docker compose -f backend/.devops/docker/develop/docker-compose.yml \
  -f backend/.devops/docker/develop/docker-compose.override.yml down
docker compose -f frontend/.devops/docker/develop/docker-compose.yml \
  -f frontend/.devops/docker/develop/docker-compose.override.yml down
```

Para validar la configuración sin iniciar servicios:

```bash
docker compose -f frontend/.devops/docker/develop/docker-compose.yml \
  -f frontend/.devops/docker/develop/docker-compose.override.yml config --quiet
docker compose -f backend/.devops/docker/develop/docker-compose.yml \
  -f backend/.devops/docker/develop/docker-compose.override.yml config --quiet
```

Si se agregan dependencias frontend y el volumen `node_modules` ya existe, actualízalo con:

```bash
docker compose -f frontend/.devops/docker/develop/docker-compose.yml \
  -f frontend/.devops/docker/develop/docker-compose.override.yml run --rm frontend npm install
```

Si cambian las dependencias backend, reconstruye su imagen:

```bash
docker compose -f backend/.devops/docker/develop/docker-compose.yml \
  -f backend/.devops/docker/develop/docker-compose.override.yml build backend
```

## Verificación dentro de Docker

```bash
docker compose -f frontend/.devops/docker/develop/docker-compose.yml \
  -f frontend/.devops/docker/develop/docker-compose.override.yml run --rm frontend npm run lint
docker compose -f frontend/.devops/docker/develop/docker-compose.yml \
  -f frontend/.devops/docker/develop/docker-compose.override.yml run --rm frontend npm run build
```

El backend se verifica mediante migraciones, OpenAPI y ejecución dentro del contenedor; el frontend se verifica con `lint` y `build`.

El backend incluye autenticación JWT en `/api/auth`: registro con nombre, foto de perfil opcional y rol, login y consulta del usuario actual (`/me`). Los usuarios se persisten en PostgreSQL mediante SQLAlchemy y migraciones Alembic.

El endpoint protegido `GET /api/bookings/me` devuelve las reservas del visitante autenticado desde PostgreSQL. Requiere un token Bearer de un usuario con rol `visitor` y responde con el formato estándar `{ code, message, success, data }`.

El formulario de solicitud consume `POST /api/bookings` con el mismo token. La solicitud queda asociada al visitante autenticado, se guarda con estado `pending` y calcula el total según el precio de la ruta.

El visitante puede cancelar sus solicitudes pendientes mediante `PATCH /api/bookings/{id}`; la operación valida que la reserva le pertenezca y cambia su estado a `cancelled`.

El catálogo público consume estos endpoints sin autenticación:

- `GET /api/public/routes?search=&municipality=`: lista únicamente rutas activas y permite filtrar por nombre y municipio.
- `GET /api/public/routes/{id}`: obtiene el detalle de una ruta activa.

El panel del guía consume estos endpoints protegidos con rol `guide`:

- `GET /api/routes`: lista las rutas del guía autenticado.
- `POST /api/routes`: crea una ruta.
- `PATCH /api/routes/{id}`: edita una ruta propia.

La creación y edición de rutas acepta `multipart/form-data` con el campo `payload` (JSON de la ruta) y uno o más campos `images`. Las imágenes se guardan en `backend/media/routes/`, se sirven mediante `/media/routes/...` y sus rutas quedan persistidas en PostgreSQL. El proxy de Vite expone `/media` durante el desarrollo.

El calendario y la bandeja de solicitudes del guía consumen:

- `GET /api/bookings/operator?booking_date=YYYY-MM-DD`: reservas del día seleccionado.
- `GET /api/bookings/operator/pending`: solicitudes pendientes.
- `PATCH /api/bookings/operator/{id}/status`: cambia el estado de una solicitud (`confirmed`, `rejected`, `cancelled` o `completed`).

El registro usa `POST /api/auth/register` como `multipart/form-data` con `full_name`, `email`, `password`, `role` y la foto opcional `profile_image`. Las fotos de perfil se guardan en `backend/media/profiles/` y se sirven mediante `/media/profiles/...`.

Los errores de API del frontend se muestran como notificaciones flotantes mediante `frontend/src/components/AlertMessage.tsx`.

Ejemplo:

```bash
curl http://localhost:8000/api/bookings/me \
  -H "Authorization: Bearer <access_token>"
```

El frontend usa React, TypeScript, Vite, Tailwind CSS, React Hook Form, Zod, Leaflet y React Leaflet.

## Backend

La estructura base está preparada para organizar cada dominio dentro de `backend/src`, separando rutas HTTP, schemas/DTOs, servicios y repositorios. La autenticación acepta los roles `visitor` y `guide`. Las modificaciones de esquema deben añadirse como migraciones Alembic en `backend/migrations/versions/` y aplicarse con `alembic upgrade head` dentro del contenedor.
