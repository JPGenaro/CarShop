# API Documentation (resumen)

Base: `/api/`

Autenticación (JWT)
- `POST /api/auth/register/` — Registrar usuario
  - Body: `{ "username": "...", "email":"...", "password":"..." }`
- `POST /api/auth/token/` — Obtener tokens
  - Body: `{ "username":"...", "password":"..." }`
- `POST /api/auth/token/refresh/` — Refrescar token
- `GET /api/auth/me/` — Obtener información del usuario autenticado (Bearer token requerido)

Categorías
- `GET /api/categorias/` — lista (soporta `search`, `ordering`, `page`)
- `POST /api/categorias/` — crear (requiere auth)
- `GET /api/categorias/{id}/` — detalle
- `PUT/PATCH/DELETE /api/categorias/{id}/` — actualizar/borrar (requiere auth)

Repuestos
- `GET /api/repuestos/` — lista (soporta filtros vía query params):
  - `search`: texto en `name`/`description`
  - `category`: id de categoría exacta
  - `price__gte`, `price__lte`, `stock__gte`, etc.
  - `ordering`: por ejemplo `ordering=-price` para precio descendente
  - `page`: paginación
- `POST /api/repuestos/` — crear (requiere auth)
  - Body ejemplo: `{ "name": "Pastilla X", "sku":"PX-001", "price": 25.5, "stock":10, "category_id":1 }
- `GET /api/repuestos/{id}/` — detalle
- `PUT/PATCH/DELETE /api/repuestos/{id}/` — actualizar/borrar (requiere auth)
