Frontend Next.js + Tailwind para Carshop

Instalación y ejecución:

```bash
cd frontend
npm install
npm run dev
```

Notas:
- El frontend hace peticiones a `http://127.0.0.1:8000/api/` por defecto. Asegúrate de tener el backend Django en `localhost:8000`.
- Páginas incluidas: `/` lista de repuestos, `/repuestos/[id]` detalle.

Configuración de API base

Si tu backend corre en otra URL, crea `frontend/.env.local` con:

```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

Filtros y búsqueda

La lista de repuestos soporta filtros del backend (search, category, ordering, page). La UI puede añadirse usando query params en las peticiones.

