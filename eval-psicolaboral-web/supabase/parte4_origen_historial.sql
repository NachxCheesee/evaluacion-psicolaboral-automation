-- ============================================================
-- Parte 4 - Migracion de origen y historial (AquaChile)
-- ------------------------------------------------------------
-- Ejecutar DESPUES de la version actualizada de
-- parte3_4_vistas_rpc_triggers.sql (esa version agrega las columnas
-- nuevas y reemplaza las vistas antes de eliminar las antiguas).
-- Convierte una base con el modelo antiguo:
--   - solicitudes.origen_id -> solicitudes.es_interno
--   - historial_cambios agrega solicitud_id
--   - elimina ip/user_agent de los historiales
--   - elimina origenes_solicitud
-- Es idempotente: se puede volver a ejecutar.
-- ============================================================

begin;

-- 1. Solicitudes: origen boolean ------------------------------

alter table public.solicitudes
  add column if not exists es_interno boolean;

update public.solicitudes
set es_interno = false
where es_interno is null;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'solicitudes'
      and column_name = 'origen_id'
  ) and to_regclass('public.origenes_solicitud') is not null then
    execute $sql$
      update public.solicitudes s
      set es_interno = coalesce(o.codigo = 'INTERNO', false)
      from public.origenes_solicitud o
      where s.origen_id = o.id
    $sql$;
  end if;
end
$$;

alter table public.solicitudes
  alter column es_interno set default false;

alter table public.solicitudes
  alter column es_interno set not null;

do $$
declare
  v_constraint text;
begin
  for v_constraint in
    select conname
    from pg_constraint
    where conrelid = 'public.solicitudes'::regclass
      and contype = 'f'
      and pg_get_constraintdef(oid) like '%(origen_id)%'
  loop
    execute format(
      'alter table public.solicitudes drop constraint %I',
      v_constraint
    );
  end loop;
end
$$;

drop index if exists public.idx_solicitudes_origen_id;

alter table public.solicitudes
  drop column if exists origen_id;

drop function if exists public.fn_resolver_origen(text);
drop table if exists public.origenes_solicitud;

-- 2. Historial de cambios -------------------------------------

alter table public.historial_cambios
  add column if not exists solicitud_id bigint;

update public.historial_cambios h
set solicitud_id = coalesce(
  case when h.tabla = 'solicitudes' then h.registro_id end,
  case
    when h.tabla = 'evaluaciones' then (
      select e.solicitud_id
      from public.evaluaciones e
      where e.id = h.registro_id
    )
  end,
  case
    when h.tabla = 'documentos' then (
      select d.solicitud_id
      from public.documentos d
      where d.id = h.registro_id
    )
  end,
  case
    when h.datos_nuevos->>'solicitud_id' ~ '^[0-9]+$'
      then (h.datos_nuevos->>'solicitud_id')::bigint
  end,
  case
    when h.datos_anteriores->>'solicitud_id' ~ '^[0-9]+$'
      then (h.datos_anteriores->>'solicitud_id')::bigint
  end
)
where h.solicitud_id is null;

create index if not exists idx_historial_solicitud
  on public.historial_cambios (solicitud_id, created_at desc);

alter table public.historial_cambios
  drop column if exists ip,
  drop column if exists user_agent;

-- 3. Historial de accesos -------------------------------------

alter table public.historial_accesos
  drop column if exists ip,
  drop column if exists user_agent;

commit;
