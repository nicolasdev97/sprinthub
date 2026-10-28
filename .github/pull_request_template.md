## 📌 Descripción del Cambio

<!-- Proporciona un resumen claro y conciso de los cambios introducidos en este PR. -->

## 🔗 Issues Relacionados

<!-- Vincula el issue correspondiente (ej. Closes #123, Fixes #456, Ref #789) -->

- Closes #

## 🏷️ Tipo de Cambio

- [ ] `feat`: Nueva funcionalidad
- [ ] `fix`: Corrección de bug
- [ ] `refactor`: Refactorización de código sin cambios funcionales
- [ ] `test`: Adición o actualización de pruebas
- [ ] `docs`: Modificación o adición de documentación
- [ ] `ci`: Cambios en pipelines de GitHub Actions o workflows
- [ ] `build` / `chore`: Tareas de dependencias, scripts npm o Docker
- [ ] `perf`: Mejora de rendimiento

## 📦 Workspaces Afectados

- [ ] `apps/api` (Backend Express 5 + Prisma)
- [ ] `apps/web` (Frontend Next.js 16 + React 19)
- [ ] `root` / Infraestructura (CI/CD, Docker Compose, scripts)
- [ ] `docs` (Arquitectura, especificaciones, guías)

---

## ✅ Checklist del Autor

Por favor, asegúrate de cumplir con los siguientes puntos antes de solicitar revisión:

- [ ] **Linting**: `npm run lint` pasa sin advertencias ni errores en ambos workspaces.
- [ ] **Formato**: `npm run format:check` verifica el estilo estricto de Prettier.
- [ ] **Typecheck**: `npm run typecheck` (`tsc --noEmit`) pasa con 0 errores de tipado.
- [ ] **Tests Unitarios**: `npm run test:unit` pasa con 100% de éxito en backend y frontend.
- [ ] **Documentación OpenAPI**: Se ejecutó `npm run docs:validate` si se agregaron o cambiaron endpoints en `apps/api`.
- [ ] **Variables de Entorno**: Se documentaron nuevas variables en los archivos `.env.example` correspondientes.
- [ ] **Seguridad**: No se commitearon credenciales, secretos, API keys ni archivos sensibles (`.env`).
- [ ] **Build**: `npm run build` compila con éxito para producción sin fallos.

---

## 🧪 Instrucciones de Prueba Local

<!-- Describe los pasos detallados para que el revisor pueda probar y verificar estos cambios localmente. -->

1.
2.
3.

## 📸 Evidencias / Capturas (si aplica)

<!-- Adjunta capturas de pantalla, salidas de terminal relevantes o payloads de respuesta de la API. -->
