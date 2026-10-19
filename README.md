# Sistema de Gestión de Evaluaciones Psicolaborales - AquaChile

Aplicación web desarrollada en React y Vite para la gestión y seguimiento del proceso de reclutamiento y evaluación psicolaboral en AquaChile.

---

## Integrantes
* Ignacio Catalán
* Brayan Gonzalez
* Gabriel Vargas

---

## Tecnologías
* React 19
* Vite
* Bootstrap 5 / CSS3
* Supabase (PostgreSQL + API REST) — plan gratuito

---

## Funcionalidades

### 1. Gestión de Candidatos (CRUD)
* **Crear:** Formulario con datos del postulante (RUT, nombre, contacto, dirección, cargo) y adjunto de CV.
* **Listar y Filtrar:** Tabla paginada con buscador por nombre o RUT, filtro por estado (Pendiente, En proceso, Finalizada) y ordenamiento por fecha o nombre.
* **Ver Detalle:** Ficha con antecedentes completos, observaciones y descarga de archivos.
* **Editar:** Modificación de datos y actualización de archivos.
* **Eliminar:** Borrado de registros con modal de confirmación.

### 2. Gestión Documental
* Simulación de carga y descarga de los 3 documentos clave del proceso:
  * Currículum Vitae (CV)
  * Transcripción de entrevista
  * Informe psicolaboral final

### 3. Evaluación y Entrevistas
* Agendamiento de fecha de entrevista.
* Actualización de estados del proceso.
* Registro del dictamen final (Recomendable, Recomendable con observaciones, No recomendable).

### 4. Administración de Usuarios (Solo Admin)
* Creación de usuarios con correo institucional `@aquachile.cl`.
* Tabla con buscador y paginación para gestionar cuentas.
* Edición de datos/roles y eliminación de accesos.

### 5. Persistencia
* Los datos se almacenan en **Supabase (PostgreSQL)**: las cuentas y las solicitudes con su evaluación anidada (`jsonb`) se leen y escriben vía API REST.
* El login sigue siendo simulado (se valida contra la tabla `cuentas`); la seguridad real por roles (Supabase Auth + RLS) queda como mejora futura.
* Si la base no está configurada, la app muestra una pantalla de error con instrucciones.

---

## Configuración de Supabase (obligatoria)

1. Crea un proyecto gratuito en [supabase.com](https://supabase.com) (plan Free).
2. Copia el archivo `.env.example` como `.env` y completa con tus credenciales
   (Dashboard → *Project Settings → API*):
   ```env
   VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key
   ```
3. En el **SQL Editor** de Supabase ejecuta, en orden:
   * `supabase/schema.sql` — crea las tablas `cuentas` y `solicitudes` + RLS.
   * `supabase/seed.sql` — carga las 3 cuentas demo y las 3 solicitudes de ejemplo.
4. Levanta la app: `npm run dev`.

> El repositorio **incluye el `.env`** con la URL y la *publishable key* (clave
> pública) del proyecto Supabase, así el equipo arranca directo con `npm install`
> y `npm run dev`. Nunca suban la clave *secret* (`sb_secret_...`).
> Nota: los proyectos en el plan Free se pausan tras 1 semana sin actividad
> (se reactivan con un clic desde el dashboard).

---

## Roles y Permisos

| Rol | Permisos |
| :--- | :--- |
| **Analista** | Crear solicitudes, consultar listado y ver expedientes (solo lectura). |
| **Evaluador** | Crear solicitude, consultar listado, agendar entrevistas, evaluar candidatos, editar datos y eliminar registros. |
| **Administrador** | Mismas funciones del evaluador más la gestión completa de usuarios. |

---

## Credenciales de Demostración

| Rol | Correo | Contraseña |
| :--- | :--- | :--- |
| Administrador | admin@aquachile.cl | 123 |
| Analista | analista@aquachile.cl | 123 |
| Evaluador | evaluador@aquachile.cl | 123 |

*(La pantalla de login incluye botones para autocompletar estas cuentas).*

---

## Estructura del Proyecto

```text
supabase/
├── schema.sql              # Tablas cuentas/solicitudes + RLS
└── seed.sql                # Datos iniciales (cuentas demo y solicitudes)
src/
├── components/
│   ├── modals/
│   │   ├── ModalConfirmarEliminar.jsx
│   │   ├── ModalEditarCandidato.jsx
│   │   ├── ModalEditarUsuario.jsx
│   │   ├── ModalEvaluacion.jsx
│   │   ├── ModalGestionUsuarios.jsx
│   │   └── ModalVerDetalle.jsx
│   ├── DashboardResumen.jsx
│   ├── FormularioSolicitud.jsx
│   ├── FormularioUsuario.jsx
│   ├── LoginSimulado.jsx
│   ├── Navbar.jsx
│   ├── TablaSolicitudes.jsx
│   └── TablaUsuarios.jsx
├── data/
│   └── mockData.js         # Semilla de datos y catálogos (alimenta los tests)
├── lib/
│   └── supabaseClient.js   # Cliente de Supabase (lee el .env)
├── services/
│   ├── conexion.js         # Helper de conexión y manejo de errores
│   ├── cuentas.js          # CRUD de cuentas (login simulado)
│   └── solicitudes.js      # CRUD de solicitudes y evaluaciones
├── test/
│   └── app.test.js         # Tests unitarios (Karma + Jasmine)
├── App.jsx
├── index.css
└── main.jsx
```
