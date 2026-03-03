# Despliegue en Render

## Configuración automática

Este proyecto está configurado para desplegarse en Render usando el archivo `render.yaml`.

## Pasos para desplegar:

1. **Crear cuenta en Render**: Ve a [render.com](https://render.com) y crea una cuenta.

2. **Conectar repositorio**: 
   - Sube tu código a GitHub, GitLab o Bitbucket
   - En Render, haz clic en "New +" y selecciona "Blueprint"
   - Conecta tu repositorio

3. **Configurar variables de entorno** (opcional):
   Render generará automáticamente `SECRET_KEY`, pero puedes añadir más variables:
   - `DEBUG=False` (recomendado para producción)
   - `ALLOWED_HOSTS` si quieres restringir hosts específicos

4. **Desplegar**: 
   Render ejecutará automáticamente:
   - `build.sh` para instalar dependencias y preparar archivos estáticos
   - `gunicorn backend_project.wsgi:application` para iniciar el servidor

## Configuración manual (alternativa)

Si prefieres configurar manualmente:

1. **Nuevo Web Service**:
   - Type: Web Service
   - Environment: Python 3
   - Build Command: `./build.sh`
   - Start Command: `gunicorn backend_project.wsgi:application`

2. **Variables de entorno**:
   - `SECRET_KEY`: (genera una clave secreta segura)
   - `DEBUG`: `False`
   - `PYTHON_VERSION`: `3.12.0`

## Características incluidas:

- ✅ **Gunicorn**: Servidor WSGI para producción
- ✅ **WhiteNoise**: Servicio de archivos estáticos
- ✅ **ALLOWED_HOSTS**: Configurado para aceptar cualquier host
- ✅ **Archivos estáticos**: Configurados con compresión y caché
- ✅ **Script de build**: Automatiza migraciones y collectstatic

## Base de datos

Esta configuración usa SQLite por defecto. Para producción, considera usar PostgreSQL:

1. En Render, crea una nueva PostgreSQL database
2. Añade estas variables de entorno:
   ```
   DATABASE_URL=<url-de-render-postgres>
   ```
3. Instala `psycopg2-binary` y actualiza settings.py para usar DATABASE_URL

## Comandos útiles:

```bash
# Probar localmente con gunicorn
gunicorn backend_project.wsgi:application

# Recolectar archivos estáticos
python manage.py collectstatic --no-input

# Ejecutar migraciones
python manage.py migrate
```
