# Producción Checklist - CarShop

## 🔐 Seguridad - ANTES de hacer deploy

### Backend (Django/Render)
- [ ] Generar nuevo SECRET_KEY (no usar el de desarrollo):
  ```bash
  python manage.py shell -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
  ```

- [ ] En Render > Settings > Environment Variables, agregar:
  - `SECRET_KEY` = [tu clave generada]
  - `DEBUG` = False
  - `FRONTEND_URL` = https://car-shop-dusky.vercel.app
  - `AWS_ACCESS_KEY_ID` = [tu access key]
  - `AWS_SECRET_ACCESS_KEY` = [tu secret key]
  - `AWS_STORAGE_BUCKET_NAME` = [tu bucket para media]
  - `AWS_S3_REGION_NAME` = [tu región, ej. us-east-1]
  - `AWS_S3_CUSTOM_DOMAIN` = [opcional, CDN o dominio del bucket]

- [ ] Verificar ALLOWED_HOSTS: ✅ Ya está configurado

### Frontend (Next.js/Vercel)
- [ ] En Vercel > Settings > Environment Variables, asegurar:
  - `NEXT_PUBLIC_API_URL` = https://carshop-wg0g.onrender.com

### Base de Datos
**Actual:** SQLite (solo desarrollo)
**Recomendado para producción:**
```

### Archivos media / imágenes
**Problema:** en Render, el filesystem local no es persistente. Las imágenes subidas a `media/` se pierden.

**Solución aplicada:** el backend ahora usa S3 para `ImageField` cuando detecta estas variables:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_STORAGE_BUCKET_NAME`
- `AWS_S3_REGION_NAME`

Si están configuradas, todas las imágenes nuevas se guardan en el bucket bajo `media/`.
Si no están configuradas, en local sigue usando la carpeta `media/` normal.

**Ojo:** el bucket debe permitir lectura pública de los archivos de `media/` o exponerlos mediante CDN/custom domain. Si no, la imagen se sube pero el frontend verá `403` al intentar mostrarla.

Para copiar imágenes locales ya existentes al bucket una vez configurado S3:

```bash
python manage.py sync_media_to_storage
```
1. Cambiar a PostgreSQL
2. En settings.py:
   DATABASE_URL = os.environ.get('DATABASE_URL')
   if DATABASE_URL:
       import dj_database_url
       DATABASES['default'] = dj_database_url.config(conn_max_age=600)

3. Instalar: pip install psycopg2 dj-database-url
```

## 🚀 Deployment

### 1. Backend
```bash
cd backend
git add .
git commit -m "Security hardening: ALLOWED_HOSTS, CORS, Rate Limiting"
git push
```
Render auto-deploys al detectar cambios en el repo.

### 2. Frontend
```bash
cd frontend
npm run build  # Test local
git add .
git commit -m "Update API endpoints for production"
git push
```
Vercel auto-deploys.

### 3. Post-Deployment Testing
```bash
# Backend health check
curl https://carshop-wg0g.onrender.com/api/repuestos/

# Frontend-Backend connectivity
- Abre https://car-shop-dusky.vercel.app
- Abre DevTools > Network
- Verifica que los requests vayan a carshop-wg0g.onrender.com
- No debe haber errores de CORS
```

## 🔍 Security Verification

### Headers de Seguridad (Backend)
```bash
curl -I https://carshop-wg0g.onrender.com/api/repuestos/
# Debería ver:
# Strict-Transport-Security: max-age=31536000
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
```

### CORS Check
```bash
# El navegador puede hacer requests sin errores ERR_BLOCKED_BY_CLIENT
```

## ⚠️ Problemas Comunes

### "ERR_BLOCKED_BY_CLIENT"
- ✅ Ya resuelto: Fallback a HTTPS URL de Render

### "CORS Error"
- Verificar CORS_ALLOWED_ORIGINS en settings.py
- Verificar que el frontend está en la lista

### Secret Key not set
- Le dirá "SECRET_KEY environment variable is required"
- Agrégalo en Render settings

## 📊 Monitoreo Continuo
- Render Logs: https://dashboard.render.com
- Vercel Logs: https://vercel.com/dashboard
- Errors en DevTools del navegador
