-- ============================================================
-- Parte 3.2 - Seed de catalogos (AquaChile)
-- ------------------------------------------------------------
-- Ejecutar DESPUES de parte3_1_modelo.sql.
-- Es idempotente: se puede volver a ejecutar.
-- ============================================================

begin;

-- 1. Roles ----------------------------------------------------

insert into public.roles (codigo, nombre, descripcion)
values
  ('ADMIN', 'Administrador', 'Acceso total al sistema.'),
  ('ANALISTA', 'Analista de Reclutamiento', 'Gestiona solicitudes y candidatos.'),
  ('EVALUADOR', 'Evaluador Psicolaboral', 'Realiza entrevistas y dictamenes.'),
  ('CANDIDATO', 'Candidato', 'Acceso futuro al portal de postulacion.')
on conflict (codigo) do update
set nombre = excluded.nombre,
    descripcion = excluded.descripcion;

-- 2. Permisos -------------------------------------------------

insert into public.permisos (codigo, nombre, descripcion, modulo)
values
  ('solicitudes.ver', 'Ver solicitudes', 'Consultar solicitudes y expedientes.', 'SOLICITUDES'),
  ('solicitudes.crear', 'Crear solicitudes', 'Registrar nuevas solicitudes.', 'SOLICITUDES'),
  ('solicitudes.editar', 'Editar solicitudes', 'Modificar antecedentes de una solicitud.', 'SOLICITUDES'),
  ('solicitudes.evaluar', 'Evaluar solicitudes', 'Registrar entrevista y dictamen.', 'SOLICITUDES'),
  ('solicitudes.eliminar', 'Eliminar solicitudes', 'Eliminar definitivamente una solicitud.', 'SOLICITUDES'),
  ('usuarios.ver', 'Ver usuarios', 'Consultar cuentas institucionales.', 'USUARIOS'),
  ('usuarios.crear', 'Crear usuarios', 'Crear cuentas institucionales.', 'USUARIOS'),
  ('usuarios.editar', 'Editar usuarios', 'Modificar cuentas institucionales.', 'USUARIOS'),
  ('usuarios.eliminar', 'Eliminar usuarios', 'Eliminar cuentas institucionales.', 'USUARIOS'),
  ('documentos.ver', 'Ver documentos', 'Consultar metadatos de documentos.', 'DOCUMENTOS'),
  ('documentos.subir', 'Subir documentos', 'Registrar documentos del expediente.', 'DOCUMENTOS'),
  ('documentos.descargar', 'Descargar documentos', 'Descargar documentos del expediente.', 'DOCUMENTOS'),
  ('historial.ver', 'Ver historial', 'Consultar la auditoria del sistema.', 'HISTORIAL'),
  ('catalogos.gestionar', 'Gestionar catalogos', 'Administrar cargos, estados y parametros.', 'CATALOGOS'),
  ('reportes.ver', 'Ver reportes', 'Consultar reportes y metricas.', 'REPORTES'),
  ('perfil.ver', 'Ver perfil propio', 'Consultar el perfil del candidato.', 'CANDIDATOS'),
  ('postulaciones.crear_propia', 'Crear postulacion propia', 'Postular a una vacante.', 'CANDIDATOS'),
  ('documentos.subir_propio', 'Subir documentos propios', 'Adjuntar documentos propios.', 'CANDIDATOS')
on conflict (codigo) do update
set nombre = excluded.nombre,
    descripcion = excluded.descripcion,
    modulo = excluded.modulo;

-- 3. Permisos por rol -----------------------------------------

delete from public.rol_permisos
where rol_id in (
  select id from public.roles
  where codigo in ('ADMIN', 'ANALISTA', 'EVALUADOR', 'CANDIDATO')
);

insert into public.rol_permisos (rol_id, permiso_id)
select r.id, p.id
from public.roles r
cross join public.permisos p
where r.codigo = 'ADMIN'
on conflict do nothing;

insert into public.rol_permisos (rol_id, permiso_id)
select r.id, p.id
from public.roles r
join public.permisos p on p.codigo in (
  'solicitudes.ver',
  'solicitudes.crear',
  'solicitudes.editar',
  'solicitudes.evaluar',
  'documentos.ver',
  'documentos.subir',
  'documentos.descargar',
  'historial.ver',
  'reportes.ver'
)
where r.codigo = 'EVALUADOR'
on conflict do nothing;

insert into public.rol_permisos (rol_id, permiso_id)
select r.id, p.id
from public.roles r
join public.permisos p on p.codigo in (
  'solicitudes.ver',
  'solicitudes.crear',
  'solicitudes.editar',
  'documentos.ver',
  'documentos.subir',
  'documentos.descargar'
)
where r.codigo = 'ANALISTA'
on conflict do nothing;

insert into public.rol_permisos (rol_id, permiso_id)
select r.id, p.id
from public.roles r
join public.permisos p on p.codigo in (
  'perfil.ver',
  'postulaciones.crear_propia',
  'documentos.subir_propio'
)
where r.codigo = 'CANDIDATO'
on conflict do nothing;

-- 4. Estados --------------------------------------------------

insert into public.estados_solicitud (codigo, nombre, descripcion, orden, es_final, color, activo)
values
  ('PENDIENTE', 'Pendiente', 'Solicitud recibida, sin entrevista agendada.', 1, false, 'warning', true),
  ('EN_PROCESO', 'En proceso', 'Entrevista o evaluacion en curso.', 2, false, 'info', true),
  ('FINALIZADA', 'Finalizada', 'Evaluacion cerrada con dictamen.', 3, true, 'success', true),
  ('CANCELADA', 'Cancelada', 'Solicitud cancelada. No habilitado para el backend actual.', 4, true, 'secondary', false),
  ('RECHAZADA', 'Rechazada', 'Solicitud rechazada. No habilitado para el backend actual.', 5, true, 'danger', false)
on conflict (codigo) do update
set nombre = excluded.nombre,
    descripcion = excluded.descripcion,
    orden = excluded.orden,
    es_final = excluded.es_final,
    color = excluded.color,
    activo = excluded.activo;

insert into public.estados_usuario (codigo, nombre, descripcion, activo)
values
  ('ACTIVO', 'Activo', 'Cuenta habilitada para iniciar sesion.', true),
  ('INACTIVO', 'Inactivo', 'Cuenta deshabilitada temporalmente.', true),
  ('BLOQUEADO', 'Bloqueado', 'Cuenta bloqueada por seguridad.', true)
on conflict (codigo) do update
set nombre = excluded.nombre,
    descripcion = excluded.descripcion,
    activo = excluded.activo;

insert into public.estados_candidato (codigo, nombre, descripcion, es_final, activo)
values
  ('NUEVO', 'Nuevo', 'Candidato registrado recientemente.', false, true),
  ('EN_EVALUACION', 'En evaluación', 'Candidato en proceso de evaluacion.', false, true),
  ('APTO', 'Apto', 'Candidato recomendable para el cargo.', true, true),
  ('NO_APTO', 'No apto', 'Candidato no recomendable para el cargo.', true, true),
  ('CONTRATADO', 'Contratado', 'Candidato seleccionado y contratado.', true, true),
  ('DESCARTADO', 'Descartado', 'Candidato descartado del proceso.', true, true)
on conflict (codigo) do update
set nombre = excluded.nombre,
    descripcion = excluded.descripcion,
    es_final = excluded.es_final,
    activo = excluded.activo;

-- 5. Familias y cargos ----------------------------------------

insert into public.familias_cargo (nombre, descripcion)
values
  ('Operario Calificado', 'Cargos operativos y de planta.'),
  ('Administrativo', 'Cargos de apoyo administrativo.'),
  ('Técnico Especialista', 'Cargos tecnicos especializados.'),
  ('Jefatura / Supervisión', 'Cargos de liderazgo y supervision.'),
  ('Profesional', 'Cargos profesionales.'),
  ('Otros', 'Cargos no clasificados.')
on conflict (nombre) do update
set descripcion = excluded.descripcion;

insert into public.cargos (familia_cargo_id, nombre)
select f.id, v.cargo
from (
  values
    ('Operario de Planta de Procesos', 'Operario Calificado'),
    ('Supervisor de Cultivo Agua Mar', 'Jefatura / Supervisión'),
    ('Jefe de Mantención y Frío', 'Jefatura / Supervisión'),
    ('Técnico de Alimentación y Fotoperíodo', 'Técnico Especialista'),
    ('Asistente de Aseguramiento de Calidad', 'Técnico Especialista'),
    ('Operador de Grúa Horquilla y Logística', 'Operario Calificado'),
    ('Buzo Especialista en Redes y Fondeo', 'Técnico Especialista'),
    ('Analista de Laboratorio y Microbiología', 'Profesional'),
    ('Otro Cargo Operativo / Administrativo', 'Otros'),
    ('Otro Cargo Operativo', 'Otros')
) as v(cargo, familia)
join public.familias_cargo f on f.nombre = v.familia
on conflict (familia_cargo_id, nombre) do nothing;

-- 6. Resultados de evaluacion ---------------------------------

insert into public.resultados_evaluacion (codigo, nombre, descripcion, es_final, activo)
values
  ('EN_EVALUACION', 'En evaluación', 'El proceso aun no tiene dictamen.', false, true),
  ('RECOMENDABLE', 'Recomendable', 'Candidato recomendable para el cargo.', true, true),
  ('RECOMENDABLE_CON_OBSERVACIONES', 'Recomendable con Observaciones', 'Candidato recomendable con observaciones.', true, true),
  ('NO_RECOMENDABLE', 'No Recomendable', 'Candidato no recomendable para el cargo.', true, true)
on conflict (codigo) do update
set nombre = excluded.nombre,
    descripcion = excluded.descripcion,
    es_final = excluded.es_final,
    activo = excluded.activo;

-- 7. Tipos de documento y entrevista --------------------------

insert into public.tipos_documento (codigo, nombre, obligatorio, activo)
values
  ('CV', 'Currículo Vitae', true, true),
  ('PAUTA_ENTREVISTA', 'Pauta de Entrevista', false, true),
  ('INFORME_PSICOLABORAL', 'Informe Psicolaboral', false, true),
  ('CERTIFICADO', 'Certificado', false, true),
  ('OTRO', 'Otro documento', false, true)
on conflict (codigo) do update
set nombre = excluded.nombre,
    obligatorio = excluded.obligatorio,
    activo = excluded.activo;

insert into public.tipos_entrevista (codigo, nombre, activo)
values
  ('PRESENCIAL', 'Presencial', true),
  ('ONLINE', 'Online', true),
  ('TELEFONICA', 'Telefónica', true)
on conflict (codigo) do update
set nombre = excluded.nombre,
    activo = excluded.activo;

-- 8. Parametros iniciales -------------------------------------

insert into public.parametros_sistema (clave, valor, descripcion)
values
  ('empresa.nombre', '"AquaChile"'::jsonb, 'Nombre de la empresa.'),
  ('solicitudes.codigo_prefijo', '"SOL"'::jsonb, 'Prefijo del codigo de solicitud.'),
  ('evaluaciones.archivos_reales', 'false'::jsonb, 'Indica si se usara Supabase Storage.')
on conflict (clave) do update
set valor = excluded.valor,
    descripcion = excluded.descripcion,
    updated_at = now();

commit;
