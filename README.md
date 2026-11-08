# Sistema de Gestión de Evaluaciones Psicolaborales - AquaChile

Aplicación web desarrollada en React y Vite para la postulación de candidatos externos y la administración interna del proceso de reclutamiento y evaluación psicolaboral en AquaChile.

---

## Integrantes
- Ignacio Catalán - FrontEnd
- Brayan Gonzalez - Base de datos
- Gabriel Vargas - BackEnd

---

## Tecnologías
- React 19
- Vite
- Bootstrap 5 / CSS3
- Bootstrap Icons - Iconos
- Karma + Jasmine - Testing unitario
- Supabase (PostgreSQL + API REST) — plan gratuito

---

## División de la Aplicación por Páginas

### 1. Portal Público
- **Ruta:** Vista de inicio / Postulación.
- **Objetivo:** Permite a cualquier persona postular a las faenas y plantas de AquaChile sin necesidad de iniciar sesión.
- **Campos del formulario:** Nombre, RUT, cargo, contacto, correo, ciudad/comuna, experiencia previa y CV.
- **Validaciones:**
  * Algoritmo Módulo 11 para validación estricta de RUT.
  * Formato de teléfono chileno (+56 9 o 9 dígitos).
  * Carga obligatoria de CV en formato PDF o Word (máx. 5 MB).

### 2. Acceso Institucional (Login)
- **Ruta:** `/login`
- **Objetivo:** Autenticación de funcionarios de la empresa mediante correo institucional (`@aquachile.cl`) y contraseña.
- **Funcionalidad:** Validación contra la base de datos y botones de autocompletado para pruebas rápidas.

### 3. Panel de Gestión (Cara a los usuarios de la empresa)
- **Ruta:** `/panel`
- **Objetivo:** Espacio de trabajo interno protegido según el rol de la sesión activa.
- **Pestaña Evaluaciones Psicolaborales:**
  * Tarjetas métricas con totales en tiempo real (Total, Pendientes, En proceso, Finalizadas).
  * Tabla paginada (5 registros por página) con buscador por nombre o RUT y filtros de estado.
  * Modal Ver Expediente: Antecedentes completos, estado de entrevista y descarga de archivos.
  * Modal Evaluar: Agendamiento de entrevista, emisión de dictamen final (Recomendable, Recomendable con Observaciones, No Recomendable) y gestión documental.
  * Modal Editar Candidato: Actualización de datos personales y reemplazo de CV.
  * Modal Eliminar: Confirmación de borrado de registros.
- **Pestaña Gestión de Usuarios (Visible solo para Administrador):**
  * Formulario de creación de funcionarios con confirmación obligatoria de contraseña (ingreso doble).
  * Tabla de cuentas con buscador y paginación.
  * Modal de edición de cuentas con opción de cambio de contraseña verificado.

---

## Gestión Documental
Gestión de los 3 archivos clave del proceso mediante descarga directa y menú de 3 puntos (`...`) para subir, reemplazar o quitar:
1. **Currículum Vitae (CV):** Documento inicial del postulante.
2. **Pauta de Entrevista:** Test o pauta aplicada durante la citación.
3. **Informe Psicolaboral:** Documento emitido y validado por el evaluador.

---

## Roles y Permisos

| Rol | Registrar Solicitud | Ver Expediente | Editar Candidato | Evaluar / Dictamen | Borrar Solicitud | Gestión de Usuarios |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Analista** | Sí | Sí | Sí | No | Sí | No |
| **Evaluador** | Sí | Sí | Sí | Sí | No | No |
| **Administrador** | Sí | Sí | Sí | Sí | Sí | Sí |

---

## Credenciales de Demostración

| Rol | Correo | Contraseña |
| :--- | :--- | :--- |
| **Administrador** | admin@aquachile.cl | 123 |
| **Analista** | analista@aquachile.cl | 123 |
| **Evaluador** | evaluador@aquachile.cl | 123 |

---

## Batería de Pruebas Unitarias (Testing)
Pruebas modulares sobre Jasmine y Karma con muestra dinámica (hasta 15 registros):
- **`autenticacion.test.js`:** Cuentas base, unicidad de correos, login válido/inválido y validación de contraseñas dobles.
- **`solicitudes.test.js`:** Sumatoria matemática de métricas, filtrado por estado, orden alfabético y operaciones CRUD (alta y baja).
- **`validaciones.test.js`:** Algoritmo Módulo 11 de RUT, normalización de búsqueda (sin tildes) y formato de teléfonos móviles.

Ejecución de pruebas:
```bash
npm test
```

---

## Configuración de Supabase

1. Crea un proyecto gratuito en [supabase.com](https://supabase.com).
2. Configura el archivo `.env`:
   ```env
   VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key
   ```
3. En el SQL Editor de Supabase ejecuta:
   * `supabase/schema.sql` (tablas `cuentas` y `solicitudes` + RLS).
   * `supabase/seed.sql` (datos iniciales).
4. Levanta el proyecto localmente:
   ```bash
   npm run dev
   ```