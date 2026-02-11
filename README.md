# Carshop — Tienda de repuestos (Frontend: Next.js, Backend: Django)

Proyecto ejemplo: backend en Django + Django REST Framework y frontend en Next.js + Tailwind.

Resumen rápido
- Backend: `backend/` (Django, DRF, JWT auth, filtros/paginación, admin con Grappelli)
- Frontend: `frontend/` (Next.js + Tailwind, páginas para listar y ver repuestos)

Requisitos locales
- Python 3.10+ (recomendado)
- Node.js 16+ / npm
- Git

Instalación y ejecución (desarrollo)

1) Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser   # opcional
python manage.py seed_db --force   # pobla DB con datos de ejemplo
python manage.py runserver
```

Admin: http://127.0.0.1:8000/grappelli/  (o `/admin/`)

API base: `http://127.0.0.1:8000/api/`

2) Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend disponible en: http://localhost:3000/

Variables de entorno (opcional)
- `backend/.env` puede contener `DJANGO_SECRET_KEY`, `DEBUG=0|1`.
- `frontend/.env.local` puede contener `NEXT_PUBLIC_API_URL` si cambias la URL del backend.

Endpoints principales (resumen)
- `POST /api/auth/register/` — registrar usuario
- `POST /api/auth/token/` — obtener `access` y `refresh`
- `POST /api/auth/token/refresh/` — refrescar token
- `GET /api/auth/me/` — info usuario autenticado
- `GET/POST /api/categorias/` — CRUD categorías
- `GET/POST /api/repuestos/` — CRUD repuestos (soporta filtros, búsqueda, orden, paginación)

Ejemplos rápidos (curl)

Obtener tokens (login):
```bash
curl -X POST http://127.0.0.1:8000/api/auth/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"juan","password":"secret"}'
```

Listar repuestos con búsqueda y orden:
```bash
curl "http://127.0.0.1:8000/api/repuestos/?search=freno&ordering=-price"
```

Contribuir
- Ver `CONTRIBUTING.md` para flujo de trabajo y normas.

Licencia
- (Añadir licencia si hace falta)
