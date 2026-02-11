# Contributing

Flujo de trabajo recomendado:

1. Crea una rama para tu feature: `git checkout -b feat/mi-feature`
2. Mantén commits pequeños y descriptivos.
3. Añade tests si corresponde.
4. Abre un PR contra `main` y describe los cambios.

Normas importantes:
- No commitees `node_modules/`, `.venv/`, ni archivos binarios pesados.
- Usa `.gitignore` para evitar subir dependencias y archivos de entorno.

Si necesitas resetear tu copia local tras cambios forzados en `main`:

```bash
git fetch origin
git reset --hard origin/main
```
