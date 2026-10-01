# Sistema de Gestión de Evaluaciones Psicolaborales - AquaChile

Aplicación web desarrollada en React y Vite para la gestión y seguimiento del proceso de reclutamiento y evaluación psicolaboral en AquaChile.

---

## Integrantes
* Ignacio Catalán
* Brayan Gonzalez
* Gabriel Vargas

---

## Tecnologías
* React 18
* Vite
* Bootstrap 5 / CSS3
* LocalStorage API

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
* Almacenamiento local mediante `localStorage` por el momento para conservar datos entre recargas.

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
src/
├── components/
│   ├── modals/
│   │   ├── ModalConfirmarEliminar.jsx
│   │   ├── ModalEditarCandidato.jsx
│   │   ├── ModalEditarUsuario.jsx
│   │   ├── ModalEvaluacion.jsx
│   │   └── ModalVerDetalle.jsx
│   ├── DashboardResumen.jsx
│   ├── FormularioSolicitud.jsx
│   ├── FormularioUsuario.jsx
│   ├── LoginSimulado.jsx
│   ├── Navbar.jsx
│   ├── TablaSolicitudes.jsx
│   └── TablaUsuarios.jsx
├── data/
│   └── mockData.js
├── App.jsx
├── index.css
└── main.jsx