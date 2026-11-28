-- ============================================================
-- Parte 3.5 - Validacion posterior a la migracion (AquaChile)
-- ------------------------------------------------------------
-- Ejecutar DESPUES de parte7_ofertas_postulaciones.sql.
-- Es un script de solo lectura: no modifica datos ni objetos.
-- ============================================================

begin;

-- 1. Objetos principales --------------------------------------

select 'roles' as objeto, to_regclass('public.roles') is not null as existe
union all select 'permisos', to_regclass('public.permisos') is not null
union all select 'rol_permisos', to_regclass('public.rol_permisos') is not null
union all select 'estados_solicitud', to_regclass('public.estados_solicitud') is not null
union all select 'estados_usuario', to_regclass('public.estados_usuario') is not null
union all select 'estados_candidato', to_regclass('public.estados_candidato') is not null
union all select 'familias_cargo', to_regclass('public.familias_cargo') is not null
union all select 'cargos', to_regclass('public.cargos') is not null
union all select 'resultados_evaluacion', to_regclass('public.resultados_evaluacion') is not null
union all select 'tipos_documento', to_regclass('public.tipos_documento') is not null
union all select 'tipos_entrevista', to_regclass('public.tipos_entrevista') is not null
union all select 'candidatos', to_regclass('public.candidatos') is not null
union all select 'evaluaciones', to_regclass('public.evaluaciones') is not null
union all select 'documentos', to_regclass('public.documentos') is not null
union all select 'historial_cambios', to_regclass('public.historial_cambios') is not null
union all select 'historial_estados_solicitud', to_regclass('public.historial_estados_solicitud') is not null
union all select 'vw_solicitudes_completas', to_regclass('public.vw_solicitudes_completas') is not null
union all select 'vw_usuarios_publicos', to_regclass('public.vw_usuarios_publicos') is not null
union all select 'vw_historial_solicitudes', to_regclass('public.vw_historial_solicitudes') is not null
union all select 'configuracion_ia', to_regclass('public.configuracion_ia') is not null
union all select 'ofertas', to_regclass('public.ofertas') is not null
union all select 'postulantes', to_regclass('public.postulantes') is not null
union all select 'postulaciones', to_regclass('public.postulaciones') is not null
order by objeto;

-- 2. RPC requeridas por el frontend ---------------------------

select
  p.proname as rpc,
  pg_get_function_identity_arguments(p.oid) as argumentos
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in (
    'login_usuario',
    'crear_postulacion',
    'actualizar_postulacion',
    'guardar_evaluacion',
    'eliminar_solicitud',
    'crear_usuario',
    'actualizar_usuario',
    'eliminar_usuario',
    'listar_historial',
    'guardar_analisis_ia_solicitud',
    'obtener_configuracion_ia',
    'guardar_configuracion_ia',
    'listar_cargos_ia',
    'guardar_perfil_cargo_ia'
  )
order by p.proname;

-- 3. Conteos de catalogos -------------------------------------

select 'roles' as catalogo, count(*) as registros from public.roles
union all select 'permisos', count(*) from public.permisos
union all select 'rol_permisos', count(*) from public.rol_permisos
union all select 'estados_solicitud', count(*) from public.estados_solicitud
union all select 'estados_usuario', count(*) from public.estados_usuario
union all select 'estados_candidato', count(*) from public.estados_candidato
union all select 'familias_cargo', count(*) from public.familias_cargo
union all select 'cargos', count(*) from public.cargos
union all select 'resultados_evaluacion', count(*) from public.resultados_evaluacion
union all select 'tipos_documento', count(*) from public.tipos_documento
union all select 'tipos_entrevista', count(*) from public.tipos_entrevista
order by catalogo;

-- 3.1 Columnas del esquema nuevo ------------------------------

select
  exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'solicitudes'
      and column_name = 'es_interno'
  ) as tiene_es_interno,
  not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'solicitudes'
      and column_name = 'origen_id'
  ) as sin_origen_id,
  not exists (
    select 1 from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'origenes_solicitud'
  ) as sin_tabla_origenes,
  not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'historial_cambios'
      and column_name = 'ip'
  ) as historial_sin_ip,
  not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'historial_cambios'
      and column_name = 'user_agent'
  ) as historial_sin_user_agent,
  exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'historial_cambios'
      and column_name = 'solicitud_id'
  ) as historial_con_solicitud_id,
  not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'historial_accesos'
      and column_name in ('ip', 'user_agent')
  ) as accesos_sin_ip_user_agent;

-- 3.2 Columnas del modulo IA ----------------------------------

select
  exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'solicitudes'
      and column_name = 'compatibilidad_porcentaje'
  ) as tiene_compatibilidad,
  exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'solicitudes'
      and column_name = 'comentario_ia_cv'
  ) as tiene_comentario_ia,
  exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'solicitudes'
      and column_name = 'alerta_cv_inconsistente'
  ) as tiene_alerta_cv,
  exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'solicitudes'
      and column_name = 'ia_actualizado_por'
  ) as tiene_ia_actualizado_por,
  exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'solicitudes'
      and column_name = 'ia_actualizado_at'
  ) as tiene_ia_actualizado_at,
  exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'cargos'
      and column_name = 'perfil_ia'
  ) as tiene_perfil_cargo,
  exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'vw_solicitudes_completas'
      and column_name = 'compatibilidad_porcentaje'
  ) as vista_tiene_compatibilidad,
  exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'vw_solicitudes_completas'
      and column_name = 'ia_actualizado_por'
  ) as vista_tiene_ia_actualizado_por,
  exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'vw_solicitudes_completas'
      and column_name = 'ia_actualizado_at'
  ) as vista_tiene_ia_actualizado_at;

select count(*) as configuracion_ia_filas
from public.configuracion_ia;

-- 3.3 Modulo de ofertas y postulaciones -----------------------

select
  exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'solicitudes'
      and column_name = 'cv_drive_file_id'
  ) as solicitudes_con_cv_drive,
  exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'postulaciones'
      and column_name = 'solicitud_id'
  ) as postulaciones_con_solicitud,
  exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'postulaciones'
      and column_name = 'cv_drive_file_id'
  ) as postulaciones_con_cv_drive;

select 'solicitudes_compatibilidad_fuera_rango' as problema, count(*) as filas
from public.solicitudes
where compatibilidad_porcentaje is not null
  and (compatibilidad_porcentaje < 0 or compatibilidad_porcentaje > 100);

-- 4. Integridad referencial -----------------------------------

select 'solicitudes_sin_candidato' as problema, count(*) as filas
from public.solicitudes
where candidato_id is null
union all
select 'solicitudes_sin_cargo', count(*)
from public.solicitudes
where cargo_id is null
union all
select 'solicitudes_sin_estado', count(*)
from public.solicitudes
where estado_id is null
union all
select 'solicitudes_sin_origen', count(*)
from public.solicitudes
where es_interno is null
union all
select 'solicitudes_sin_codigo', count(*)
from public.solicitudes
where codigo is null or trim(codigo) = ''
union all
select 'candidatos_sin_estado', count(*)
from public.candidatos
where estado_id is null
union all
select 'cuentas_sin_rol', count(*)
from public.cuentas
where rol_id is null
union all
select 'cuentas_sin_estado', count(*)
from public.cuentas
where estado_id is null;

-- 5. Duplicados ------------------------------------------------

select
  rut_normalizado,
  count(*) as repeticiones
from public.candidatos
group by rut_normalizado
having count(*) > 1;

select
  codigo,
  count(*) as repeticiones
from public.solicitudes
where codigo is not null
group by codigo
having count(*) > 1;

-- 6. Compatibilidad con el backend Spring ---------------------

select
  estado,
  count(*) as registros
from public.solicitudes
group by estado
order by estado;

select
  count(*) as cuentas_con_password_legacy
from public.cuentas
where password is not null;

select
  count(*) as cuentas_con_hash
from public.cuentas
where password_hash is not null
  and trim(password_hash) <> '';

-- 7. Evaluaciones y documentos --------------------------------

select 'evaluaciones' as entidad, count(*) as registros from public.evaluaciones
union all select 'documentos', count(*) from public.documentos
union all select 'historial_cambios', count(*) from public.historial_cambios
union all select 'historial_estados_solicitud', count(*) from public.historial_estados_solicitud;

select
  td.codigo as tipo_documento,
  count(*) as registros
from public.documentos d
join public.tipos_documento td on td.id = d.tipo_documento_id
group by td.codigo
order by td.codigo;

-- 8. Vistas ---------------------------------------------------

select count(*) as filas_vw_solicitudes from public.vw_solicitudes_completas;

select
  id, codigo, candidato, cargo, estado, origen, emisor, resultado
from public.vw_solicitudes_completas
order by id
limit 10;

select count(*) as filas_vw_usuarios from public.vw_usuarios_publicos;

select
  id, nombre, correo, rol, estado_nombre, cardinality(permisos) as permisos
from public.vw_usuarios_publicos
order by id
limit 10;

-- 9. Permisos y RLS -------------------------------------------

select
  c.relname as tabla,
  c.relrowsecurity as rls_activo
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in (
    'cuentas', 'solicitudes', 'candidatos', 'evaluaciones', 'documentos',
    'roles', 'permisos', 'estados_solicitud', 'cargos',
    'historial_cambios', 'historial_estados_solicitud'
  )
order by c.relname;

select
  grantee,
  table_name,
  privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name in ('cuentas', 'solicitudes', 'vw_solicitudes_completas', 'vw_usuarios_publicos')
  and grantee in ('anon', 'authenticated')
order by table_name, grantee, privilege_type;

rollback;
