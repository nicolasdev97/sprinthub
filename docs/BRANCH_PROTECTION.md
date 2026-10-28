# SprintHub — Branch Protection & Repository Governance

> Especificación formal de reglas de protección de ramas, requisitos de revisión y gates de integración continua para el repositorio **SprintHub**.

---

| Propiedad      | Valor                                        |
| -------------- | -------------------------------------------- |
| **Documento**  | Branch Protection & Governance Policy        |
| **Proyecto**   | SprintHub                                    |
| **Versión**    | 1.0.0                                        |
| **Estado**     | Aprobado                                     |
| **Ramas Core** | `main` (Producción), `develop` (Integración) |

---

## 1. Estrategia de Ramas

SprintHub implementa una versión adaptada y disciplinada de **GitFlow**:

```
feature/* ──┐
bugfix/*  ──┼──> [PR + CI Gate] ──> develop ──> [PR + Release Gate] ──> main (v1.0.0)
hotfix/*  ─────────────────────────────────────────────────────────────┘
```

- **`main`**: Rama de producción de máxima estabilidad. El código aquí refleja exactamente lo desplegado en producción.
- **`develop`**: Rama principal de integración continua. Agrupa features completadas antes de preparar una versión de release.
- **`feature/*`**, **`bugfix/*`**, **`chore/*`**: Ramas de trabajo efímeras creadas desde `develop`.

---

## 2. Reglas de Protección para `main` (Producción)

En GitHub (**Settings → Branches → Add branch protection rule**):

| Parámetro                                                            | Configuración                                                                                                                                   | Justificación                                                          |
| :------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------- |
| **Branch name pattern**                                              | `main`                                                                                                                                          | Rama productiva raíz.                                                  |
| **Require a pull request before merging**                            | **Habilitado**                                                                                                                                  | Prohíbe cualquier `git push` directo a producción.                     |
| **Require approvals**                                                | **Mínimo 1 aprobación**                                                                                                                         | Revisión obligatoria por el Tech Lead / Peer Reviewer.                 |
| **Dismiss stale pull request approvals when new commits are pushed** | **Habilitado**                                                                                                                                  | Invalida aprobaciones previas si se agregan nuevos commits al PR.      |
| **Require status checks to pass before merging**                     | **Habilitado** (Strict)                                                                                                                         | Todo commit debe compilar y pasar la suite de pruebas.                 |
| **Require branches to be up to date before merging**                 | **Habilitado**                                                                                                                                  | Garantiza que el código fue probado contra el estado actual de `main`. |
| **Status checks obligatorios requeridos**                            | - `Lint, Format & Typecheck`<br>- `Backend Unit & Integration Tests`<br>- `Frontend Unit & Component Tests`<br>- `Production Build (API & Web)` | Los 4 jobs del workflow `ci.yml` deben estar en verde.                 |
| **Do not allow bypassing the above settings**                        | **Habilitado**                                                                                                                                  | Aplica las reglas estrictamente a administradores y dueños del repo.   |
| **Block force pushes**                                               | **Habilitado** (`--force` bloqueado)                                                                                                            | Previene sobreescritura accidental del historial git.                  |
| **Block branch deletions**                                           | **Habilitado**                                                                                                                                  | Impide la eliminación accidental de la rama de producción.             |

---

## 3. Reglas de Protección para `develop` (Integración)

| Parámetro                                        | Configuración           | Justificación                                      |
| :----------------------------------------------- | :---------------------- | :------------------------------------------------- |
| **Branch name pattern**                          | `develop`               | Rama de staging / integración.                     |
| **Require a pull request before merging**        | **Habilitado**          | Todo cambio ingresa por Pull Request auditado.     |
| **Require approvals**                            | **Mínimo 1 aprobación** | Validación cruzada de código.                      |
| **Dismiss stale pull request approvals**         | **Habilitado**          | Asegura revisión del último estado de la rama.     |
| **Require status checks to pass before merging** | **Habilitado** (Strict) | Mismos status checks requeridos que en `main`.     |
| **Block force pushes**                           | **Habilitado**          | Preserva la integridad del histórico colaborativo. |
| **Block branch deletions**                       | **Habilitado**          | Protege la rama base de desarrollo continuo.       |

---

## 4. Política de Merges

- Para ramas `feature/*` hacia `develop`: **Squash and Merge** o **Rebase and Merge** (manteniendo un historial lineal y limpio).
- Para `develop` hacia `main`: **Create a Merge Commit** (preserva el historial de integración de la versión completa).
- Los títulos de PR y commits deben seguir estrictamente la convención:
  `<type>(<scope>): <short description in lowercase>`
