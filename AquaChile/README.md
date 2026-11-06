# AquaChile — Microservicio de Evaluaciones Psicolaborales

Backend en **Spring Boot** para el sistema de gestión de evaluaciones psicolaborales
de AquaChile. Reemplaza progresivamente el acceso directo del frontend React a
Supabase por una API REST segura con autenticación JWT y autorización por roles.

## Stack

| Componente | Versión |
|---|---|
| Java | 17 |
| Spring Boot | 4.1.2 |
| Maven | Wrapper incluido (`mvnw`) |
| Base de datos | PostgreSQL (Supabase, Session Pooler) |
| Seguridad | Spring Security + BCrypt + JWT (JJWT 0.12.6) |
| Documentación | Springdoc OpenAPI / Swagger UI |

## Estado del proyecto

- ✅ **Parte 1:** esqueleto del microservicio, dependencias, CORS, seguridad base,
  manejo global de errores y endpoint de salud.
- ✅ **Parte 2 (este commit):** conexión con Supabase, entidades JPA, login/logout
  con JWT + refresh tokens, CRUD de solicitudes y usuarios, roles con
  `@PreAuthorize`, carga de evaluación en `jsonb` y migración SQL aditiva.
- ⏳ **Parte 3:** pruebas unitarias/integración y migración del frontend al backend.

## Requisitos

- **JDK 17** (el proyecto compila con `<java.version>17</java.version>`).
- No necesitas instalar Maven: el proyecto incluye **Maven Wrapper**.
- Credenciales del **Session Pooler** de Supabase.

> Si usas otra versión de Java, el proyecto puede compilar, pero la configuración
> oficial y las pruebas se hacen con JDK 17.

## Puesta en marcha

### 1. Preparar la base de datos

En el **SQL Editor de Supabase**, ejecutar en orden:

```text
eval-psicolaboral-web/supabase/schema.sql          # solo si la BD está vacía
eval-psicolaboral-web/supabase/seed.sql            # solo si la BD está vacía
eval-psicolaboral-web/supabase/parte2_seguridad.sql
```

`parte2_seguridad.sql` es idempotente. Agrega `password_hash` a `cuentas`, lo
rellena con BCrypt, crea `refresh_tokens` y protege esa tabla con RLS. **No
elimina** la columna `password` ni las políticas `anon` actuales, para no romper
el frontend mientras se migra.

### 2. Configurar variables de entorno

```bash
cd AquaChile
cp .env.example .env      # Linux / macOS
copy .env.example .env    # Windows
```

Edita `.env` con los datos reales. Para generar un secreto JWT:

```bash
openssl rand -hex 48
```

> El proyecto carga `.env` automáticamente mediante `spring.config.import`
> desde `AquaChile/.env` o desde la raíz del repositorio (ver `application.yml`).
> El archivo está en `.gitignore` y **nunca** debe subirse al repositorio.

### 3. Ejecutar

```bash
# Windows
.\mvnw.cmd spring-boot:run

# Linux / macOS
./mvnw spring-boot:run
```

La aplicación queda en `http://localhost:8080`.

### Ejecutar desde IntelliJ IDEA

Para que IntelliJ use Java 17 y encuentre el `.env`:

1. `File` → `Project Structure` → `Project`:
   - **SDK:** JDK 17 (`C:\Program Files\Java\jdk-17` en Windows).
   - **Language level:** `17`.
2. `Settings` → `Build, Execution, Deployment` → `Build Tools` → `Maven` → `Runner`:
   - **JRE:** `Project SDK (17)`.
3. `Run` → `Edit Configurations` → `AquaChileApplication`:
   - **JRE:** `Project SDK (17)`.
   - **Working directory:** `...\evaluacion-psicolaboral-automation\AquaChile`.

El backend también carga el `.env` si la Working directory es la raíz del
repositorio, pero se recomienda apuntar a `AquaChile`.

Al arrancar, el log debe mostrar una línea como:

```text
Base de datos activa: jdbc:postgresql://... (DB_URL cargada: true)
```

Si muestra `H2 en memoria (DB_URL cargada: false)`, el `.env` no se cargó.

## URLs útiles

| Recurso | URL |
|---|---|
| Salud | `http://localhost:8080/api/health` |
| Swagger UI | `http://localhost:8080/swagger-ui.html` |
| OpenAPI JSON | `http://localhost:8080/v3/api-docs` |

La consola H2 está deshabilitada por defecto (`H2_CONSOLE_ENABLED=false`).

## Variables de entorno

| Variable | Descripción | Ejemplo |
|---|---|---|
| `SERVER_PORT` | Puerto HTTP | `8080` |
| `CORS_ALLOWED_ORIGINS` | Orígenes del frontend, separados por coma | `http://localhost:5173` |
| `DB_URL` | JDBC del Session Pooler | `jdbc:postgresql://...:5432/postgres?sslmode=require` |
| `DB_USERNAME` | Usuario del pooler | `postgres.<project-ref>` |
| `DB_PASSWORD` | Contraseña de la base | — |
| `DB_DRIVER` | Driver JDBC | `org.postgresql.Driver` |
| `DB_POOL_SIZE` | Conexiones máximas | `5` |
| `JPA_DDL_AUTO` | Validación del esquema | `validate` |
| `JWT_SECRET` | Clave HMAC, mínimo 32 caracteres | — |
| `JWT_ACCESS_MINUTES` | Vigencia del access token | `30` |
| `JWT_REFRESH_DAYS` | Vigencia del refresh token | `7` |
| `H2_CONSOLE_ENABLED` | Consola H2 (solo desarrollo) | `false` |

## Autenticación

### Login

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"correo":"admin@aquachile.cl","password":"123"}'
```

Respuesta:

```json
{
  "accessToken": "eyJ...",
  "refreshToken": "R1sj...",
  "tokenType": "Bearer",
  "expiresIn": 1800,
  "usuario": {
    "id": 1,
    "correo": "admin@aquachile.cl",
    "nombre": "Administrador General",
    "rol": "ADMIN",
    "tituloRol": "Administrador de Sistemas RRHH",
    "fechaAlta": "2026-08-01"
  }
}
```

Cada petición protegida debe enviar:

```http
Authorization: Bearer <accessToken>
```

- `POST /api/auth/refresh` renueva los tokens. El refresh token usado se revoca
  y se entrega uno nuevo (rotación).
- `POST /api/auth/logout` revoca el refresh token. Es público porque el propio
  refresh token es la credencial.
- `GET /api/auth/me` devuelve la cuenta autenticada.

## Endpoints

### Autenticación

| Método | Ruta | Acceso |
|---|---|---|
| `POST` | `/api/auth/login` | Público |
| `POST` | `/api/auth/refresh` | Público |
| `POST` | `/api/auth/logout` | Público (requiere refresh token) |
| `GET` | `/api/auth/me` | Autenticado |

### Solicitudes

| Método | Ruta | Acceso |
|---|---|---|
| `GET` | `/api/solicitudes` | Todos los roles |
| `GET` | `/api/solicitudes/{id}` | Todos los roles |
| `POST` | `/api/solicitudes` | Todos los roles |
| `PUT` | `/api/solicitudes/{id}` | `ADMIN`, `EVALUADOR` |
| `PATCH` | `/api/solicitudes/{id}/evaluacion` | `ADMIN`, `EVALUADOR` |
| `DELETE` | `/api/solicitudes/{id}` | `ADMIN`, `EVALUADOR` |

Parámetros del listado:

```text
?busqueda=texto&estado=En proceso&page=0&size=10&sort=fechaSolicitud&direction=desc
```

`estado` acepta `Pendiente`, `En proceso`, `Finalizada` o `TODOS`.
`sort` acepta `id`, `fechaSolicitud`, `candidato`, `cargo` y `estado`.

### Usuarios (solo `ADMIN`)

| Método | Ruta |
|---|---|
| `GET` | `/api/usuarios` |
| `POST` | `/api/usuarios` |
| `PUT` | `/api/usuarios/{id}` |
| `DELETE` | `/api/usuarios/{id}` |

### Catálogos (autenticado)

| Ruta | Contenido |
|---|---|
| `/api/catalogos/familias-cargo` | Familias de cargo |
| `/api/catalogos/estados` | Estados de solicitud |
| `/api/catalogos/resultados` | Resultados de evaluación |
| `/api/catalogos/roles` | Roles del sistema |

## Roles

| Rol | Permisos |
|---|---|
| `ANALISTA` | Consultar solicitudes y crear nuevas. No edita, evalúa ni elimina. |
| `EVALUADOR` | Todo lo anterior + editar, evaluar y eliminar solicitudes. |
| `ADMIN` | Todo lo anterior + gestión de usuarios institucionales. |

## Estructura

```text
AquaChile/
├── src/main/java/cl/aquachile/evalpsi/
│   ├── AquaChileApplication.java
│   ├── config/          # Seguridad, CORS, JWT y OpenAPI
│   ├── controller/      # Endpoints REST
│   ├── dto/             # Request/Response (nunca se exponen entidades)
│   ├── enums/           # Roles, estados y resultados
│   ├── exception/       # Manejo global de errores
│   ├── mapper/          # Entidad ↔ DTO
│   ├── model/           # Entidades JPA
│   ├── repository/      # Repositorios Spring Data
│   ├── security/        # JWT, filtro y respuestas 401/403
│   └── service/         # Lógica de negocio
├── src/main/resources/application.yml
├── .env.example
└── pom.xml
```

## Notas de seguridad y compatibilidad

- `cuentas.password` se conserva temporalmente porque el frontend actual todavía
  la usa. El backend autentica con `password_hash` (BCrypt) y, si una cuenta
  antigua no tiene hash, lo genera en su primer login exitoso.
- Los refresh tokens se guardan **hasheados** (SHA-256) y se rotan en cada uso.
- `refresh_tokens` tiene RLS activo y permisos revocados para `anon` y
  `authenticated`.
- Las políticas `anon CRUD` de `cuentas` y `solicitudes` siguen activas para no
  romper el frontend. En la Parte 3, cuando React consuma esta API, se deben
  eliminar y quitar la columna `password` (el SQL está comentado al final de
  `parte2_seguridad.sql`).
- El access token es stateless: si se elimina una cuenta, su token sigue válido
  hasta que expire (30 minutos por defecto).

## Solución de problemas

### El login responde 500 y el log dice "H2 en memoria"

Significa que el backend no encontró el `.env` y arrancó con la base H2 de
respaldo, que no tiene las tablas de Supabase.

1. Revisa la línea `Base de datos activa:` en el log.
2. En IntelliJ, configura la **Working directory** en la carpeta `AquaChile`
   (o en la raíz del repositorio).
3. Confirma que existe `AquaChile/.env` y que tiene `DB_URL`.
4. Detén y vuelve a iniciar la aplicación.

El log correcto debe decir:

```text
Base de datos activa: jdbc:postgresql://... (DB_URL cargada: true)
```

### El login responde 401

Las credenciales son incorrectas o la cuenta no existe. Prueba con las cuentas
del `seed.sql` (`admin@aquachile.cl` / `123`).

### El login responde 403

El usuario existe y la contraseña es correcta, pero su rol no tiene permiso
para esa operación.

## Compilar y ejecutar el JAR

```bash
./mvnw -B -DskipTests package
java -jar target/aquachile-0.0.1-SNAPSHOT.jar
```

## Pruebas

La Parte 3 agregará pruebas automatizadas. En la Parte 2 se verificó manualmente:

- Login correcto/incorrecto y `/api/auth/me`.
- Listado, creación, edición, evaluación y eliminación de solicitudes.
- Restricciones por rol (`ANALISTA` recibe 403 al editar o listar usuarios).
- CRUD de usuarios y respuestas sin contraseñas.
- Rotación de refresh token y revocación en logout.
- Persistencia y lectura del bloque `evaluacion` en `jsonb`.
