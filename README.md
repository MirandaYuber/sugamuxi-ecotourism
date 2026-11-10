# Sugamuxi Ecoturismo Marketplace

PWA para descubrir experiencias ecoturísticas del corredor Sugamuxi – Paz de Río.

## Funcionalidad actual

- Inicio público con buscador, filtro por municipio y tarjetas de experiencias.
- Detalle de experiencia en `/experiences/:id` con galería, datos de actividad, guía, calificación y ruta sobre OpenStreetMap.
- Cambio de tema claro/oscuro persistido en `localStorage` sin flash durante la carga.
- Consulta de disponibilidad por WhatsApp al número provisional `+57 304 453 2134`.
- Panel protegido del operador en `/operator/*`, con perfil RNT, rutas, reservas y registro de puntos de recorrido en el mapa.
- El panel del operador usa datos mock persistidos en `localStorage` mientras no se conecte el backend.
- Las rutas se crean y editan desde un modal; sus tarjetas muestran estado por color y se pueden filtrar por nombre, municipio o estado.
- Al editar una ruta se pueden eliminar puntos del mapa individualmente desde el último punto o limpiar todo el recorrido.
- La vista de reservas incluye un calendario mensual con indicadores para guianzas confirmadas y solicitudes pendientes, una agenda del día seleccionado y una sección inferior de solicitudes pendientes filtrable por ruta.
- El detalle de cada reserva muestra los datos del visitante, mensaje, necesidades especiales y un enlace directo de WhatsApp cuando hay teléfono disponible.
- El visitante debe iniciar sesión para solicitar una reserva; el login unificado redirige visitantes y guías según su rol.
- Las reservas del visitante se consultan en un modal desde el menú de usuario o después de enviar una solicitud; no existe una vista separada de dashboard del visitante.

Los datos de experiencias públicas son actualmente demostrativos en `frontend/src/data/experiences.ts`. La vista está preparada para reemplazarlos por la API cuando se implemente el catálogo público.

El selector de tema está disponible en las vistas públicas y privadas. La preferencia se comparte entre vistas mediante `localStorage` usando la clave `sugamuxi-theme`.

## Desarrollo con Docker

El frontend y el backend tienen configuraciones Compose independientes.

Frontend:

```bash
docker compose -f frontend/.devops/docker/develop/docker-compose.yml \
  -f frontend/.devops/docker/develop/docker-compose.override.yml up --build
```

Backend y PostgreSQL:

```bash
docker compose -f backend/.devops/docker/develop/docker-compose.yml \
  -f backend/.devops/docker/develop/docker-compose.override.yml up
```

El frontend queda en `http://localhost:5173`; el backend en `http://localhost:8000`. El Compose del backend levanta PostgreSQL con el volumen persistente `postgres_data`.

Si se agregan dependencias frontend y el volumen `node_modules` ya existe, actualízalo con:

```bash
docker compose -f frontend/.devops/docker/develop/docker-compose.yml \
  -f frontend/.devops/docker/develop/docker-compose.override.yml run --rm frontend npm install
```

## Desarrollo local y verificación

```bash
cd frontend
npm install
npm run dev
npm run lint
npm run build
```

```bash
cd backend
python -m venv .venv
pip install -r requirements.txt
uvicorn src.main:app --reload
```

El backend incluye autenticación JWT inicial en `/api/auth`: registro, login y consulta del usuario actual (`/me`). Los usuarios se persisten en PostgreSQL mediante SQLAlchemy y la migración `0001_add_auth_role` de Alembic.

El endpoint protegido `GET /api/bookings/me` devuelve las reservas del visitante autenticado desde PostgreSQL. Requiere un token Bearer de un usuario con rol `visitor` y responde con el formato estándar `{ code, message, success, data }`.

El formulario de solicitud consume `POST /api/bookings` con el mismo token. La solicitud queda asociada al visitante autenticado, se guarda con estado `pending` y calcula el total según el precio de la ruta.

El catálogo público consume estos endpoints sin autenticación:

- `GET /api/public/routes?search=&municipality=`: lista únicamente rutas activas y permite filtrar por nombre y municipio.
- `GET /api/public/routes/{id}`: obtiene el detalle de una ruta activa.

El panel del guía consume estos endpoints protegidos con rol `guide`:

- `GET /api/routes`: lista las rutas del guía autenticado.
- `POST /api/routes`: crea una ruta.
- `PATCH /api/routes/{id}`: edita una ruta propia.

El calendario y la bandeja de solicitudes del guía consumen:

- `GET /api/bookings/operator?booking_date=YYYY-MM-DD`: reservas del día seleccionado.
- `GET /api/bookings/operator/pending`: solicitudes pendientes.
- `PATCH /api/bookings/operator/{id}/status`: cambia el estado de una solicitud (`confirmed`, `rejected`, `cancelled` o `completed`).

## Pendientes actuales

- Reemplazar el catálogo demo por rutas persistidas en PostgreSQL para que las experiencias públicas puedan recibir solicitudes reales.
- Implementar `DELETE` o `PATCH /api/bookings/{id}` para que el visitante pueda cancelar sus solicitudes desde la vista.
- Permitir subir y persistir imágenes al crear o editar una ruta.
- Permitir subir y persistir una imagen de perfil del guía desde el perfil RNT.

Los errores de API del frontend se muestran como notificaciones flotantes mediante `frontend/src/components/AlertMessage.tsx`.

Ejemplo:

```bash
curl http://localhost:8000/api/bookings/me \
  -H "Authorization: Bearer <access_token>"
```

No hay suite de tests configurada actualmente. El frontend usa React, TypeScript, Vite, Tailwind CSS, React Hook Form, Zod, Leaflet y React Leaflet.

## Backend

La estructura base está preparada para organizar cada dominio dentro de `backend/src`, separando rutas HTTP, schemas/DTOs, servicios y repositorios. La autenticación inicial acepta únicamente los roles `visitor` y `guide`.
