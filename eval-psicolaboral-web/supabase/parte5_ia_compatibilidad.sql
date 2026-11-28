-- ============================================================
-- Parte 5 - Compatibilidad y analisis IA (AquaChile)
-- ------------------------------------------------------------
-- Ejecutar DESPUES de parte4_origen_historial.sql.
-- Agrega campos editables de compatibilidad, comentario IA,
-- configuracion del modelo y perfiles de cargo.
-- Es idempotente: se puede volver a ejecutar.
-- ============================================================

begin;

-- 1. Solicitudes: resultado IA ---------------------------------

alter table public.solicitudes
  add column if not exists compatibilidad_porcentaje smallint,
  add column if not exists comentario_ia_cv text,
  add column if not exists alerta_cv_inconsistente boolean not null default false,
  add column if not exists ia_analisis jsonb,
  add column if not exists ia_actualizado_por bigint references public.cuentas (id) on delete set null,
  add column if not exists ia_actualizado_at timestamptz;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'solicitudes_compatibilidad_check'
  ) then
    alter table public.solicitudes
      add constraint solicitudes_compatibilidad_check
      check (
        compatibilidad_porcentaje is null
        or compatibilidad_porcentaje between 0 and 100
      );
  end if;
end
$$;

create index if not exists idx_solicitudes_compatibilidad
  on public.solicitudes (compatibilidad_porcentaje desc);

create index if not exists idx_solicitudes_alerta_cv
  on public.solicitudes (alerta_cv_inconsistente)
  where alerta_cv_inconsistente = true;

-- 2. Cargos: perfil para comparar compatibilidad ----------------

alter table public.cargos
  add column if not exists perfil_ia text,
  add column if not exists updated_at timestamptz not null default now();

-- 3. Configuracion de IA ----------------------------------------

create table if not exists public.configuracion_ia (
  id smallint primary key default 1 check (id = 1),
  activo boolean not null default true,
  proveedor text not null default 'openai',
  modelo text not null default 'gpt-4.1-mini',
  system_prompt text not null default '',
  prompt_analisis text not null default '',
  temperatura numeric(3, 2) not null default 0.2
    check (temperatura >= 0 and temperatura <= 2),
  max_tokens integer not null default 1200
    check (max_tokens > 0),
  updated_by bigint references public.cuentas (id) on delete set null,
  updated_at timestamptz not null default now()
);

insert into public.configuracion_ia (id)
values (1)
on conflict (id) do nothing;

alter table public.configuracion_ia enable row level security;

revoke all on public.configuracion_ia from anon, authenticated;

-- 4. Helper de permisos -----------------------------------------

create or replace function public.fn_puede_editar_ia(p_usuario_id bigint)
returns boolean
language sql
stable
security definer
set search_path = public, extensions
as $$
  select exists (
    select 1
    from public.cuentas
    where id = p_usuario_id
      and upper(rol) in ('ADMIN', 'EVALUADOR', 'ANALISTA')
  );
$$;

-- 5. RPC de analisis por solicitud ------------------------------

create or replace function public.guardar_analisis_ia_solicitud(
  p_solicitud_id bigint,
  p_compatibilidad integer,
  p_comentario text,
  p_alerta boolean,
  p_analisis jsonb,
  p_usuario_id bigint
)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_filas integer;
begin
  perform set_config('app.usuario_id', coalesce(p_usuario_id::text, ''), true);

  if not public.fn_puede_editar_ia(p_usuario_id) then
    raise exception 'No autorizado para editar el analisis IA.';
  end if;

  if p_compatibilidad is not null
     and (p_compatibilidad < 0 or p_compatibilidad > 100) then
    raise exception 'La compatibilidad debe estar entre 0 y 100.';
  end if;

  update public.solicitudes
  set compatibilidad_porcentaje = p_compatibilidad,
      comentario_ia_cv = nullif(trim(p_comentario), ''),
      alerta_cv_inconsistente = coalesce(p_alerta, false),
      ia_analisis = p_analisis,
      ia_actualizado_por = p_usuario_id,
      ia_actualizado_at = now(),
      updated_at = now()
  where id = p_solicitud_id;

  get diagnostics v_filas = row_count;

  if v_filas = 0 then
    raise exception 'No existe la solicitud con id %.', p_solicitud_id;
  end if;
end;
$$;

-- 6. RPC de configuracion general -------------------------------

create or replace function public.obtener_configuracion_ia(p_usuario_id bigint)
returns table (
  id smallint,
  activo boolean,
  proveedor text,
  modelo text,
  system_prompt text,
  prompt_analisis text,
  temperatura numeric,
  max_tokens integer,
  updated_by bigint,
  updated_by_nombre text,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if not public.fn_es_admin(p_usuario_id) then
    raise exception 'Solo un administrador puede ver la configuracion IA.';
  end if;

  return query
  select
    c.id,
    c.activo,
    c.proveedor,
    c.modelo,
    c.system_prompt,
    c.prompt_analisis,
    c.temperatura,
    c.max_tokens,
    c.updated_by,
    u.nombre as updated_by_nombre,
    c.updated_at
  from public.configuracion_ia c
  left join public.cuentas u on u.id = c.updated_by
  where c.id = 1;
end;
$$;

create or replace function public.guardar_configuracion_ia(
  p_payload jsonb,
  p_usuario_id bigint
)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_anterior jsonb;
  v_nuevo jsonb;
begin
  perform set_config('app.usuario_id', coalesce(p_usuario_id::text, ''), true);

  if not public.fn_es_admin(p_usuario_id) then
    raise exception 'Solo un administrador puede editar la configuracion IA.';
  end if;

  select to_jsonb(c) into v_anterior
  from public.configuracion_ia c
  where c.id = 1;

  insert into public.configuracion_ia (id)
  values (1)
  on conflict (id) do nothing;

  update public.configuracion_ia
  set activo = coalesce((p_payload->>'activo')::boolean, activo),
      proveedor = coalesce(nullif(trim(p_payload->>'proveedor'), ''), proveedor),
      modelo = coalesce(nullif(trim(p_payload->>'modelo'), ''), modelo),
      system_prompt = coalesce(p_payload->>'system_prompt', system_prompt),
      prompt_analisis = coalesce(p_payload->>'prompt_analisis', prompt_analisis),
      temperatura = coalesce(
        nullif(p_payload->>'temperatura', '')::numeric,
        temperatura
      ),
      max_tokens = coalesce(
        nullif(p_payload->>'max_tokens', '')::integer,
        max_tokens
      ),
      updated_by = p_usuario_id,
      updated_at = now()
  where id = 1;

  select to_jsonb(c) into v_nuevo
  from public.configuracion_ia c
  where c.id = 1;

  insert into public.historial_cambios (
    tabla, registro_id, accion, datos_anteriores, datos_nuevos, usuario_id
  ) values (
    'configuracion_ia', 1, 'UPDATE', v_anterior, v_nuevo, p_usuario_id
  );
end;
$$;

-- 7. RPC de perfiles de cargo -----------------------------------

create or replace function public.listar_cargos_ia(p_usuario_id bigint)
returns table (
  id bigint,
  nombre text,
  familia_cargo_id bigint,
  familia_cargo text,
  perfil_ia text,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if not public.fn_es_admin(p_usuario_id) then
    raise exception 'Solo un administrador puede ver los perfiles IA.';
  end if;

  return query
  select
    c.id,
    c.nombre,
    c.familia_cargo_id,
    f.nombre as familia_cargo,
    c.perfil_ia,
    c.updated_at
  from public.cargos c
  left join public.familias_cargo f on f.id = c.familia_cargo_id
  order by f.nombre, c.nombre;
end;
$$;

create or replace function public.guardar_perfil_cargo_ia(
  p_cargo_id bigint,
  p_perfil_ia text,
  p_usuario_id bigint
)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_anterior jsonb;
  v_nuevo jsonb;
  v_filas integer;
begin
  perform set_config('app.usuario_id', coalesce(p_usuario_id::text, ''), true);

  if not public.fn_es_admin(p_usuario_id) then
    raise exception 'Solo un administrador puede editar los perfiles IA.';
  end if;

  select to_jsonb(c) into v_anterior
  from public.cargos c
  where c.id = p_cargo_id;

  update public.cargos
  set perfil_ia = nullif(trim(p_perfil_ia), ''),
      updated_at = now()
  where id = p_cargo_id;

  get diagnostics v_filas = row_count;

  if v_filas = 0 then
    raise exception 'No existe el cargo con id %.', p_cargo_id;
  end if;

  select to_jsonb(c) into v_nuevo
  from public.cargos c
  where c.id = p_cargo_id;

  insert into public.historial_cambios (
    tabla, registro_id, accion, datos_anteriores, datos_nuevos, usuario_id
  ) values (
    'cargos', p_cargo_id, 'UPDATE', v_anterior, v_nuevo, p_usuario_id
  );
end;
$$;

-- 8. Vista de solicitudes con datos IA --------------------------

create or replace view public.vw_solicitudes_completas as
select
  s.id,
  s.codigo,
  s.rut,
  coalesce(c.nombre_completo, s.candidato) as candidato,
  s.cargo,
  coalesce(fc.nombre, s.familia_cargo) as familia_cargo,
  coalesce(u.nombre, nullif(s.solicitado_por, ''), 'Portal Público Web') as emisor,
  case when s.es_interno then 'Interno' else 'Externo' end as origen,
  coalesce(es.nombre, s.estado) as estado,
  s.fecha_solicitud as fecha,
  coalesce(s.telefono, c.telefono) as contacto,
  coalesce(s.correo, c.email) as email,
  coalesce(s.direccion, c.direccion) as direccion,
  s.observaciones,
  coalesce(dcv.nombre_archivo, s.cv_adjunto) as cv_adjunto,
  dp.nombre_archivo as entrevista_archivo,
  di.nombre_archivo as informe_archivo,
  coalesce(re.nombre, nullif(s.evaluacion->>'resultado', '')) as resultado,
  e.fecha_entrevista,
  coalesce(e.observaciones, nullif(s.evaluacion->>'observacionesEvaluador', '')) as observaciones_evaluador,
  s.evaluacion,
  s.estado as estado_legacy,
  s.candidato_id,
  s.cargo_id,
  s.familia_cargo_id,
  s.estado_id,
  s.es_interno,
  s.solicitado_por_id,
  s.evaluador_asignado_id,
  s.prioridad,
  s.created_at,
  s.updated_at,
  s.compatibilidad_porcentaje,
  s.comentario_ia_cv,
  s.alerta_cv_inconsistente,
  s.ia_analisis,
  s.ia_actualizado_por,
  iau.nombre as ia_actualizado_por_nombre,
  s.ia_actualizado_at
from public.solicitudes s
left join public.candidatos c on c.id = s.candidato_id
left join public.familias_cargo fc on fc.id = s.familia_cargo_id
left join public.cuentas u on u.id = s.solicitado_por_id
left join public.cuentas iau on iau.id = s.ia_actualizado_por
left join public.estados_solicitud es on es.id = s.estado_id
left join public.evaluaciones e on e.solicitud_id = s.id
left join public.resultados_evaluacion re on re.id = e.resultado_id
left join public.documentos dcv
  on dcv.solicitud_id = s.id
 and dcv.tipo_documento_id = (select id from public.tipos_documento where codigo = 'CV')
left join public.documentos dp
  on dp.solicitud_id = s.id
 and dp.tipo_documento_id = (select id from public.tipos_documento where codigo = 'PAUTA_ENTREVISTA')
left join public.documentos di
  on di.solicitud_id = s.id
 and di.tipo_documento_id = (select id from public.tipos_documento where codigo = 'INFORME_PSICOLABORAL');

-- 9. Permisos ---------------------------------------------------

revoke all on function public.guardar_analisis_ia_solicitud(bigint, integer, text, boolean, jsonb, bigint) from public;
revoke all on function public.obtener_configuracion_ia(bigint) from public;
revoke all on function public.guardar_configuracion_ia(jsonb, bigint) from public;
revoke all on function public.listar_cargos_ia(bigint) from public;
revoke all on function public.guardar_perfil_cargo_ia(bigint, text, bigint) from public;

grant execute on function public.guardar_analisis_ia_solicitud(bigint, integer, text, boolean, jsonb, bigint) to anon, authenticated;
grant execute on function public.obtener_configuracion_ia(bigint) to anon, authenticated;
grant execute on function public.guardar_configuracion_ia(jsonb, bigint) to anon, authenticated;
grant execute on function public.listar_cargos_ia(bigint) to anon, authenticated;
grant execute on function public.guardar_perfil_cargo_ia(bigint, text, bigint) to anon, authenticated;

notify pgrst, 'reload schema';

commit;
