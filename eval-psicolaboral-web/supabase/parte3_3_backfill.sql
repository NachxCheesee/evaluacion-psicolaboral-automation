-- ============================================================
-- Parte 3.3 - Backfill de datos existentes (AquaChile)
-- ------------------------------------------------------------
-- Ejecutar DESPUES de parte3_2_seed_catalogos.sql.
-- Convierte las cuentas y solicitudes actuales al modelo nuevo
-- sin eliminar las columnas antiguas.
-- ============================================================

begin;

-- 1. Roles y estado de las cuentas ----------------------------

update public.cuentas c
set rol_id = r.id
from public.roles r
where c.rol_id is null
  and upper(r.codigo) = upper(c.rol);

update public.cuentas c
set estado_id = e.id
from public.estados_usuario e
where c.estado_id is null
  and e.codigo = 'ACTIVO';

-- 2. Candidatos -----------------------------------------------

insert into public.candidatos (
  rut,
  nombre_completo,
  nombres,
  email,
  telefono,
  direccion,
  estado_id,
  origen_registro
)
select distinct on (upper(regexp_replace(s.rut, '[^0-9kK]', '', 'g')))
  s.rut,
  s.candidato,
  s.candidato,
  nullif(trim(s.correo), ''),
  nullif(trim(s.telefono), ''),
  nullif(trim(s.direccion), ''),
  e.id,
  'MIGRACION'
from public.solicitudes s
left join public.estados_candidato e on e.codigo = 'NUEVO'
where s.rut is not null
  and trim(s.rut) <> ''
  and not exists (
    select 1
    from public.candidatos c
    where c.rut_normalizado = upper(regexp_replace(s.rut, '[^0-9kK]', '', 'g'))
  )
order by upper(regexp_replace(s.rut, '[^0-9kK]', '', 'g')), s.id;

update public.solicitudes s
set candidato_id = c.id
from public.candidatos c
where s.candidato_id is null
  and s.rut is not null
  and trim(s.rut) <> ''
  and c.rut_normalizado = upper(regexp_replace(s.rut, '[^0-9kK]', '', 'g'));

-- 3. Familias y cargos ----------------------------------------

insert into public.familias_cargo (nombre)
select distinct trim(s.familia_cargo)
from public.solicitudes s
where nullif(trim(s.familia_cargo), '') is not null
on conflict (nombre) do nothing;

insert into public.cargos (familia_cargo_id, nombre)
select
  coalesce(f.id, otros.id),
  s.cargo
from (
  select distinct
    trim(cargo) as cargo,
    nullif(trim(familia_cargo), '') as familia
  from public.solicitudes
  where nullif(trim(cargo), '') is not null
) s
left join public.familias_cargo f on lower(f.nombre) = lower(s.familia)
cross join (
  select id from public.familias_cargo where nombre = 'Otros' limit 1
) otros
on conflict (familia_cargo_id, nombre) do nothing;

update public.solicitudes s
set
  cargo_id = c.id,
  familia_cargo_id = c.familia_cargo_id
from public.cargos c
where s.cargo_id is null
  and lower(c.nombre) = lower(trim(s.cargo));

-- 4. Estados --------------------------------------------------

update public.solicitudes s
set estado_id = e.id
from public.estados_solicitud e
where s.estado_id is null
  and e.codigo = case lower(trim(s.estado))
    when 'pendiente' then 'PENDIENTE'
    when 'en proceso' then 'EN_PROCESO'
    when 'finalizada' then 'FINALIZADA'
    else 'PENDIENTE'
  end;

-- 5. Usuarios relacionados ------------------------------------

update public.solicitudes s
set solicitado_por_id = c.id
from public.cuentas c
where s.solicitado_por_id is null
  and nullif(trim(s.solicitado_por), '') is not null
  and (
    lower(c.nombre) = lower(trim(s.solicitado_por))
    or lower(c.correo) = lower(trim(s.solicitado_por))
  );

update public.solicitudes s
set evaluador_asignado_id = c.id
from public.cuentas c
where s.evaluador_asignado_id is null
  and nullif(trim(s.responsable), '') is not null
  and (
    lower(c.nombre) = lower(trim(s.responsable))
    or lower(c.correo) = lower(trim(s.responsable))
  );

-- 6. Codigos de solicitud -------------------------------------

with numeradas as (
  select
    id,
    row_number() over (
      order by coalesce(fecha_solicitud, current_date), id
    ) as numero
  from public.solicitudes
  where codigo is null or trim(codigo) = ''
)
update public.solicitudes s
set codigo = 'SOL-' ||
  to_char(coalesce(s.fecha_solicitud, current_date), 'YYYY') || '-' ||
  lpad(n.numero::text, 5, '0')
from numeradas n
where s.id = n.id;

do $$
declare
  v_next bigint;
  v_last bigint;
  v_called boolean;
begin
  select coalesce(max((regexp_match(codigo, '([0-9]+)$'))[1]::bigint), 0) + 1
  into v_next
  from public.solicitudes
  where codigo ~ '^SOL-[0-9]{4}-[0-9]+$';

  select last_value, is_called
  into v_last, v_called
  from public.solicitudes_codigo_seq;

  if v_called then
    v_next := greatest(v_next, v_last + 1);
  else
    v_next := greatest(v_next, v_last);
  end if;

  perform setval('public.solicitudes_codigo_seq', v_next, false);
end
$$;

-- 7. Documentos desde los campos antiguos ---------------------

insert into public.documentos (
  solicitud_id,
  candidato_id,
  tipo_documento_id,
  nombre_archivo,
  subido_por
)
select
  s.id,
  s.candidato_id,
  td.id,
  trim(s.cv_adjunto),
  s.solicitado_por_id
from public.solicitudes s
join public.tipos_documento td on td.codigo = 'CV'
where nullif(trim(s.cv_adjunto), '') is not null
on conflict (solicitud_id, tipo_documento_id) do update
set nombre_archivo = excluded.nombre_archivo,
    candidato_id = excluded.candidato_id;

insert into public.documentos (
  solicitud_id,
  candidato_id,
  tipo_documento_id,
  nombre_archivo,
  subido_por
)
select
  s.id,
  s.candidato_id,
  td.id,
  trim(s.evaluacion->>'archivoTranscripcion'),
  s.evaluador_asignado_id
from public.solicitudes s
join public.tipos_documento td on td.codigo = 'PAUTA_ENTREVISTA'
where nullif(trim(s.evaluacion->>'archivoTranscripcion'), '') is not null
on conflict (solicitud_id, tipo_documento_id) do update
set nombre_archivo = excluded.nombre_archivo,
    candidato_id = excluded.candidato_id;

insert into public.documentos (
  solicitud_id,
  candidato_id,
  tipo_documento_id,
  nombre_archivo,
  subido_por
)
select
  s.id,
  s.candidato_id,
  td.id,
  trim(s.evaluacion->>'archivoInformeFinal'),
  s.evaluador_asignado_id
from public.solicitudes s
join public.tipos_documento td on td.codigo = 'INFORME_PSICOLABORAL'
where nullif(trim(s.evaluacion->>'archivoInformeFinal'), '') is not null
on conflict (solicitud_id, tipo_documento_id) do update
set nombre_archivo = excluded.nombre_archivo,
    candidato_id = excluded.candidato_id;

-- 8. Evaluaciones desde el JSONB ------------------------------

insert into public.evaluaciones (
  solicitud_id,
  evaluador_id,
  fecha_entrevista,
  resultado_id,
  observaciones,
  fecha_evaluacion
)
select
  s.id,
  s.evaluador_asignado_id,
  case
    when nullif(trim(s.evaluacion->>'fechaEntrevista'), '') ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
      then (s.evaluacion->>'fechaEntrevista')::date
    else null
  end,
  re.id,
  nullif(trim(s.evaluacion->>'observacionesEvaluador'), ''),
  case
    when nullif(trim(s.evaluacion->>'resultado'), '') is not null then now()
    else null
  end
from public.solicitudes s
left join public.resultados_evaluacion re
  on lower(re.nombre) = lower(nullif(trim(s.evaluacion->>'resultado'), ''))
where s.evaluacion is not null
on conflict (solicitud_id) do update
set evaluador_id = excluded.evaluador_id,
    fecha_entrevista = excluded.fecha_entrevista,
    resultado_id = excluded.resultado_id,
    observaciones = excluded.observaciones,
    fecha_evaluacion = excluded.fecha_evaluacion,
    updated_at = now();

-- 9. Estados de candidato segun resultado ---------------------

update public.candidatos c
set estado_id = e.id,
    updated_at = now()
from public.solicitudes s
join public.evaluaciones ev on ev.solicitud_id = s.id
join public.resultados_evaluacion re on re.id = ev.resultado_id
join public.estados_candidato e on e.codigo = case re.codigo
  when 'RECOMENDABLE' then 'APTO'
  when 'RECOMENDABLE_CON_OBSERVACIONES' then 'APTO'
  when 'NO_RECOMENDABLE' then 'NO_APTO'
  when 'EN_EVALUACION' then 'EN_EVALUACION'
  else 'NUEVO'
end
where c.id = s.candidato_id
  and c.estado_id is distinct from e.id;

commit;
