Backend Django (API) para tienda de repuestos

Instalación rápida:

1. Crear y activar virtualenv:

```bash
python -m venv .venv
source .venv/bin/activate
```
2. Instalar dependencias:

```bash
pip install -r requirements.txt
```
3. Aplicar migraciones y crear superusuario:

```bash
python manage.py migrate
python manage.py createsuperuser
```
4. Ejecutar servidor:

```bash
python manage.py runserver
```

Endpoints de autenticación:
- `POST /api/auth/register/` : registro de usuario
- `POST /api/auth/token/` : obtener pair JWT (access, refresh)
- `POST /api/auth/token/refresh/` : refrescar access
- `GET /api/auth/me/` : información del usuario autenticado

Seed / datos de ejemplo

Este proyecto incluye un comando de administración para poblar la base de datos con categorías, repuestos y usuarios de ejemplo:

```bash
python manage.py seed_db --force
```

El comando crea:
- Varias `Categoria` (Frenos, Motor, Suspensión, ...)
- Múltiples `Repuesto` por categoría con `sku`, `price`, `stock` y `image` placeholder
- Usuarios de ejemplo: `admin` (superuser `adminpass`) y `juan` (`secret`)

Admin UI
- Grappelli disponible en `/grappelli/` para una UI de administración más amigable.


