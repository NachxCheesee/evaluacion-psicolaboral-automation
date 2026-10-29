# AquaChile — Microservicio de Evaluaciones Psicolaborales

Backend en **Spring Boot** para el sistema de gestión de evaluaciones psicolaborales
de AquaChile. Reemplaza progresivamente el acceso directo del frontend React a
Supabase por una API REST segura con autenticación y autorización por roles.

## Stack

| Componente | Versión |
|---|---|
| Java | 17 |
| Spring Boot | 4.1.2 |
| Maven | Wrapper incluido (`mvnw`) |
| Base de datos | PostgreSQL (Supabase) — H2 en memoria para la Parte 1 |
| Seguridad | Spring Security + BCrypt + JWT (JJWT 0.12.6) |
| Documentación | Springdoc OpenAPI / Swagger UI |

## Estado del proyecto

- ✅ **Parte 1 (este commit):** esqueleto del microservicio, dependencias, CORS,
  seguridad base, manejo global de errores y endpoint de salud.
- ⏳ **Parte 2:** conexión con Supabase (pooler), entidades, login/logout con JWT,
  CRUD de solicitudes y usuarios, roles y migraciones Flyway.
- ⏳ **Parte 3:** pruebas unitarias e integración.

## Requisitos

- JDK 17 o superior.
- No necesitas instalar Maven: el proyecto incluye **Maven Wrapper**.

## Cómo ejecutar

```bash
cd AquaChile
# Windows
.\mvnw.cmd spring-boot:run
# Linux / macOS
./mvnw spring-boot:run
```

La aplicación queda en `http://localhost:8080`.

### URLs útiles

| Recurso | URL |
|---|---|
| Salud | `http://localhost:8080/api/health` |
| Swagger UI | `http://localhost:8080/swagger-ui.html` |
| OpenAPI JSON | `http://localhost:8080/v3/api-docs` |
| Consola H2 (solo Parte 1) | `http://localhost:8080/h2-console` |

Consola H2: JDBC URL `jdbc:h2:mem:aquachile`, usuario `sa`, contraseña vacía.

## Variables de entorno

Revisa `.env.example`. En la Parte 1 no son obligatorias porque se usa H2.
En la Parte 2 se necesitan las credenciales del **Session Pooler** de Supabase
y un `JWT_SECRET` propio.

> Spring Boot no lee `.env` automáticamente: configura las variables en tu IDE,
> en Docker o expórtalas en la terminal.

## Estructura

```text
AquaChile/
├── src/main/java/cl/aquachile/evalpsi/
│   ├── AquaChileApplication.java
│   ├── config/          # Seguridad, CORS y OpenAPI
│   ├── controller/      # Endpoints REST
│   ├── dto/             # Request/Response (nunca exponer entidades)
│   ├── exception/       # Manejo global de errores
│   ├── entity/          # (Parte 2) Entidades JPA
│   ├── repository/      # (Parte 2) Repositorios
│   ├── service/         # (Parte 2) Lógica de negocio
│   └── security/        # (Parte 2) JWT y filtros
├── src/main/resources/
│   ├── application.yml
│   └── db/migration/    # (Parte 2) Migraciones Flyway
└── pom.xml
```

## Roles del sistema

| Rol | Permisos |
|---|---|
| `ANALISTA` | Consultar solicitudes y ver expedientes (solo lectura). |
| `EVALUADOR` | Gestionar solicitudes, agendar entrevistas y evaluar. |
| `ADMIN` | Todo lo anterior + gestión de usuarios institucionales. |

Los permisos se implementarán con `@PreAuthorize` en la Parte 2.
