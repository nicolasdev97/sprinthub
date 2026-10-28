# SprintHub — Release & Deployment Checklist

> Protocolo operativo para el corte de versión, verificación previa, merge hacia ramas productivas y pruebas de humo post-despliegue.

---

| Propiedad     | Valor                        |
| ------------- | ---------------------------- |
| **Documento** | Release & Deployment Runbook |
| **Proyecto**  | SprintHub                    |
| **Versión**   | 1.0.0                        |
| **Fecha**     | Octubre 2026                 |

---

## Fase 1: Pre-Release Verification (Gate Local)

Ejecuta el gate de calidad local unificado desde la raíz del monorepo:

- [ ] **1.1 Verificación Pre-flight Completa**:

  ```bash
  npm run verify:release
  ```

  _(Ejecuta secuencialmente: `lint` → `format:check` → `typecheck` → `docs:validate` → `test:unit` → `build`)_.

- [ ] **1.2 Pruebas de Integración con Base de Datos**:

  ```bash
  npm run test:integration
  ```

  _(Verifica la ejecución de los 24 tests de integración contra PostgreSQL real)_.

- [ ] **1.3 Validación de Compilación de Contenedores de Producción**:

  ```bash
  npm run docker:build:prod
  ```

  _(Asegura que `sprinthub-backend` y `sprinthub-frontend` compilen con éxito en multi-stage standalone)_.

- [ ] **1.4 Limpieza de Workspace**:
  ```bash
  git status
  ```
  _(Confirmar que no existen archivos sin commitear, secretos ni dependencias huérfanas)_.

---

## Fase 2: Secuencia de Merges y Versionado

Sigue estrictamente el orden de integración de ramas:

- [ ] **2.1 Paso a `develop`**:
  1. Abre un Pull Request desde `feature/release-preparation` hacia `develop`.
  2. Verifica que el pipeline `SprintHub CI Pipeline` pase al 100% en verde.
  3. Solicita revisión y aprobación requerida.
  4. Realiza el merge hacia `develop`.

- [ ] **2.2 Paso a `main` (Producción)**:
  1. Abre un Pull Request desde `develop` hacia `main`.
  2. Verifica que los 4 status checks de GitHub Actions pasen exitosamente.
  3. Realiza el merge hacia `main`.

- [ ] **2.3 Creación de Release Tag (SemVer)**:
  ```bash
  git checkout main
  git pull origin main
  git tag -a v1.0.0 -m "Release v1.0.0 - SprintHub Production Launch"
  git push origin v1.0.0
  ```

---

## Fase 3: Post-Release Deployment & Smoke Testing

Una vez desplegada la release en el entorno productivo:

- [ ] **3.1 Migración de Base de Datos**:

  ```bash
  npm run db:migrate:deploy
  ```

  _(Aplica todas las migraciones pendientes de Prisma de forma determinista y segura)_.

- [ ] **3.2 Orquestación de Contenedores de Producción**:

  ```bash
  npm run docker:prod:up
  ```

- [ ] **3.3 Verificación de Salud (Healthchecks)**:
  - Base de Datos:
    ```bash
    docker exec sprinthub-prod-postgres pg_isready -U postgres -d sprinthub
    ```
  - Backend API:
    ```bash
    curl -I http://localhost:3001/api/health
    # Debe retornar HTTP/1.1 200 OK con JSON {"status":"ok", ...}
    ```
  - Swagger UI / OpenAPI:
    ```bash
    curl -I http://localhost:3001/api/docs
    # Debe responder HTTP/1.1 200 OK
    ```
  - Frontend Web Client:
    ```bash
    curl -I http://localhost:3000/
    # Debe responder HTTP/1.1 200 OK o 307 Redirect a login
    ```

- [ ] **3.4 Smoke Test Funcional E2E**:
  1. Registro de nuevo usuario / Login con credenciales de prueba.
  2. Creación de un Workspace y navegación al Dashboard.
  3. Creación de un Proyecto y visualización de columnas Kanban.
  4. Creación y cambio de estado de una Tarea (drag & drop o selector).
  5. Confirmación de eventos en tiempo real (SSE) y persistencia sin errores de consola.

---

## Fase 4: Protocolo de Rollback (Plan de Contingencia)

En caso de fallo crítico en producción:

1. **Reversión de contenedores**:
   ```bash
   npm run docker:prod:down
   # Desplegar imagen con el tag previo conocido y estable (ej. v0.9.x)
   ```
2. **Reversión Git**:
   ```bash
   git revert -m 1 <commit-hash-del-merge>
   git push origin main
   ```
