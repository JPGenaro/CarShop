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

