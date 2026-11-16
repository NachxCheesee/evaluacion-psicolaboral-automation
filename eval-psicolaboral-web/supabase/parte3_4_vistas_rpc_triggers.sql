-- ============================================================
-- Parte 3.4 - Vistas, RPC, triggers y permisos (AquaChile)
-- ------------------------------------------------------------
-- Ejecutar DESPUES de parte3_3_backfill.sql.
-- El frontend usara las vistas y RPC; no accedera directamente
-- a cuentas ni a solicitudes con la anon key.
-- ============================================================

-- 1. Funciones auxiliares -------------------------------------

create or replace function public.fn_normalizar_rut(p_rut text)
returns text
language sql
immutable
as $$
  select upper(regexp_replace(coalesce(p_rut, ''), '[^0-9kK]', '', 'g'));
$$;

create or replace function public.fn_usuario_actual()
returns bigint
language sql
stable
as $$
  select nullif(current_setting('app.usuario_id', true), '')::bigint;
$$;

create or replace function public.fn_es_admin(p_usuario_id bigint)
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
      and upper(rol) = 'ADMIN'
  );
$$;

create or replace function public.fn_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.fn_auditar_cambios()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_usuario bigint := public.fn_usuario_actual();
  v_old jsonb;
  v_new jsonb;
begin
  if coalesce(current_setting('app.skip_audit', true), '0') = '1' then
    if tg_op = 'DELETE' then
      return old;
    end if;
    return new;
  end if;

  if tg_op = 'DELETE' then
    v_old := to_jsonb(old);
    insert into public.historial_cambios (
      tabla, registro_id, accion, datos_anteriores, usuario_id
    ) values (
      tg_table_name, (v_old->>'id')::bigint, 'DELETE', v_old, v_usuario
    );
    return old;
  elsif tg_op = 'UPDATE' then
    v_old := to_jsonb(old);
    v_new := to_jsonb(new);
    if v_old = v_new then
      return new;
    end if;
    insert into public.historial_cambios (
      tabla, registro_id, accion, datos_anteriores, datos_nuevos, usuario_id
    ) values (
      tg_table_name, (v_new->>'id')::bigint, 'UPDATE', v_old, v_new, v_usuario
    );
    return new;
  else
    v_new := to_jsonb(new);
    insert into public.historial_cambios (
      tabla, registro_id, accion, datos_nuevos, usuario_id
    ) values (
      tg_table_name, (v_new->>'id')::bigint, 'INSERT', v_new, v_usuario
    );
    return new;
  end if;
end;
$$;

create or replace function public.fn_auditar_cuenta()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_usuario bigint := public.fn_usuario_actual();
  v_old jsonb;
  v_new jsonb;
begin
  if coalesce(current_setting('app.skip_audit', true), '0') = '1' then
    if tg_op = 'DELETE' then
      return old;
    end if;
    return new;
  end if;

  if tg_op = 'DELETE' then
    v_old := to_jsonb(old) - 'password' - 'password_hash';
    insert into public.historial_cambios (
      tabla, registro_id, accion, datos_anteriores, usuario_id
    ) values (
      'cuentas', (v_old->>'id')::bigint, 'DELETE', v_old, v_usuario
    );
    return old;
  elsif tg_op = 'UPDATE' then
    v_old := to_jsonb(old) - 'password' - 'password_hash';
    v_new := to_jsonb(new) - 'password' - 'password_hash';
    if v_old = v_new then
      return new;
    end if;
    insert into public.historial_cambios (
      tabla, registro_id, accion, datos_anteriores, datos_nuevos, usuario_id
    ) values (
      'cuentas', (v_new->>'id')::bigint, 'UPDATE', v_old, v_new, v_usuario
    );
    return new;
  else
    v_new := to_jsonb(new) - 'password' - 'password_hash';
    insert into public.historial_cambios (
      tabla, registro_id, accion, datos_nuevos, usuario_id
    ) values (
      'cuentas', (v_new->>'id')::bigint, 'INSERT', v_new, v_usuario
    );
    return new;
  end if;
end;
$$;

create or replace function public.fn_asignar_codigo_solicitud()
returns trigger
language plpgsql
as $$
begin
  if new.codigo is null or trim(new.codigo) = '' then
    new.codigo := 'SOL-' ||
      to_char(coalesce(new.fecha_solicitud, current_date), 'YYYY') || '-' ||
      lpad(nextval('public.solicitudes_codigo_seq')::text, 5, '0');
  end if;
  return new;
end;
$$;

create or replace function public.fn_sync_solicitud_estado()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_codigo text;
begin
  if tg_op = 'INSERT' then
    if new.estado_id is null then
      select id into new.estado_id
      from public.estados_solicitud
      where codigo = case lower(trim(coalesce(new.estado, '')))
        when 'pendiente' then 'PENDIENTE'
        when 'en proceso' then 'EN_PROCESO'
        when 'finalizada' then 'FINALIZADA'
        else 'PENDIENTE'
      end;
    end if;

    if new.estado is null or trim(new.estado) = '' then
      select nombre into new.estado
      from public.estados_solicitud
      where id = new.estado_id;
    end if;
  else
    if new.estado_id is distinct from old.estado_id then
      select codigo into v_codigo
      from public.estados_solicitud
      where id = new.estado_id;

      new.estado := case v_codigo
        when 'PENDIENTE' then 'Pendiente'
        when 'EN_PROCESO' then 'En proceso'
        when 'FINALIZADA' then 'Finalizada'
        when 'CANCELADA' then 'Finalizada'
        when 'RECHAZADA' then 'Finalizada'
        else old.estado
      end;
    elsif new.estado is distinct from old.estado then
      select id into new.estado_id
      from public.estados_solicitud
      where codigo = case lower(trim(coalesce(new.estado, '')))
        when 'pendiente' then 'PENDIENTE'
        when 'en proceso' then 'EN_PROCESO'
        when 'finalizada' then 'FINALIZADA'
        else 'PENDIENTE'
      end;
    end if;
  end if;

  if new.estado_id is not null
     and exists (
       select 1 from public.estados_solicitud
       where id = new.estado_id and es_final = true
     )
     and new.fecha_cierre is null then
    new.fecha_cierre := now();
  end if;

  return new;
end;
$$;

create or replace function public.fn_historial_estado()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if new.estado_id is distinct from old.estado_id then
    insert into public.historial_estados_solicitud (
      solicitud_id, estado_anterior_id, estado_nuevo_id, usuario_id
    ) values (
      new.id, old.estado_id, new.estado_id, public.fn_usuario_actual()
    );
  end if;
  return new;
end;
$$;

create or replace function public.fn_sync_evaluacion_jsonb()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_solicitud_id bigint;
  v_fecha date;
  v_observaciones text;
  v_resultado text;
  v_pauta text;
  v_informe text;
begin
  if coalesce(current_setting('app.skip_sync', true), '0') = '1' then
    if tg_op = 'DELETE' then
      return old;
    end if;
    return new;
  end if;

  if tg_op = 'DELETE' then
    v_solicitud_id := old.solicitud_id;
    v_fecha := old.fecha_entrevista;
    v_observaciones := old.observaciones;
    select nombre into v_resultado
    from public.resultados_evaluacion
    where id = old.resultado_id;
  else
    v_solicitud_id := new.solicitud_id;
    v_fecha := new.fecha_entrevista;
    v_observaciones := new.observaciones;
    select nombre into v_resultado
    from public.resultados_evaluacion
    where id = new.resultado_id;
  end if;

  select nombre_archivo into v_pauta
  from public.documentos
  where solicitud_id = v_solicitud_id
    and tipo_documento_id = (select id from public.tipos_documento where codigo = 'PAUTA_ENTREVISTA');

  select nombre_archivo into v_informe
  from public.documentos
  where solicitud_id = v_solicitud_id
    and tipo_documento_id = (select id from public.tipos_documento where codigo = 'INFORME_PSICOLABORAL');

  perform set_config('app.skip_sync', '1', true);
  perform set_config('app.skip_audit', '1', true);

  update public.solicitudes
  set evaluacion = jsonb_build_object(
        'fechaEntrevista', coalesce(to_char(v_fecha, 'YYYY-MM-DD'), ''),
        'resultado', coalesce(v_resultado, ''),
        'observacionesEvaluador', coalesce(v_observaciones, ''),
        'archivoTranscripcion', coalesce(v_pauta, ''),
        'archivoInformeFinal', coalesce(v_informe, '')
      ),
      updated_at = now()
  where id = v_solicitud_id;

  perform set_config('app.skip_sync', '0', true);
  perform set_config('app.skip_audit', '0', true);

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create or replace function public.fn_sync_evaluacion_desde_solicitud()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_fecha_texto text;
  v_fecha date;
  v_resultado text;
  v_observaciones text;
  v_pauta text;
  v_informe text;
  v_resultado_id bigint;
begin
  if coalesce(current_setting('app.skip_sync', true), '0') = '1' then
    return new;
  end if;

  if new.evaluacion is not distinct from old.evaluacion then
    return new;
  end if;

  v_fecha_texto := nullif(trim(new.evaluacion->>'fechaEntrevista'), '');
  v_fecha := case
    when v_fecha_texto ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then v_fecha_texto::date
    else null
  end;

  v_resultado := nullif(trim(new.evaluacion->>'resultado'), '');
  v_observaciones := nullif(trim(new.evaluacion->>'observacionesEvaluador'), '');
  v_pauta := nullif(trim(new.evaluacion->>'archivoTranscripcion'), '');
  v_informe := nullif(trim(new.evaluacion->>'archivoInformeFinal'), '');

  select id into v_resultado_id
  from public.resultados_evaluacion
  where lower(nombre) = lower(v_resultado)
     or lower(codigo) = lower(replace(v_resultado, ' ', '_'))
  limit 1;

  perform set_config('app.skip_sync', '1', true);
  perform set_config('app.skip_audit', '1', true);

  insert into public.evaluaciones (
    solicitud_id, fecha_entrevista, resultado_id, observaciones, fecha_evaluacion
  ) values (
    new.id,
    v_fecha,
    v_resultado_id,
    v_observaciones,
    case when v_resultado_id is not null then now() else null end
  )
  on conflict (solicitud_id) do update
  set fecha_entrevista = excluded.fecha_entrevista,
      resultado_id = excluded.resultado_id,
      observaciones = excluded.observaciones,
      fecha_evaluacion = excluded.fecha_evaluacion,
      updated_at = now();

  if v_pauta is not null then
    insert into public.documentos (
      solicitud_id, candidato_id, tipo_documento_id, nombre_archivo, subido_por
    )
    select new.id, new.candidato_id, td.id, v_pauta, new.evaluador_asignado_id
    from public.tipos_documento td
    where td.codigo = 'PAUTA_ENTREVISTA'
    on conflict (solicitud_id, tipo_documento_id) do update
    set nombre_archivo = excluded.nombre_archivo,
        candidato_id = excluded.candidato_id,
        subido_por = excluded.subido_por;
  end if;

  if v_informe is not null then
    insert into public.documentos (
      solicitud_id, candidato_id, tipo_documento_id, nombre_archivo, subido_por
    )
    select new.id, new.candidato_id, td.id, v_informe, new.evaluador_asignado_id
    from public.tipos_documento td
    where td.codigo = 'INFORME_PSICOLABORAL'
    on conflict (solicitud_id, tipo_documento_id) do update
    set nombre_archivo = excluded.nombre_archivo,
        candidato_id = excluded.candidato_id,
        subido_por = excluded.subido_por;
  end if;

  perform set_config('app.skip_sync', '0', true);
  perform set_config('app.skip_audit', '0', true);

  return new;
end;
$$;

-- 2. Helpers de negocio ---------------------------------------

create or replace function public.fn_upsert_candidato(
  p_rut text,
  p_nombre text,
  p_email text default null,
  p_telefono text default null,
  p_direccion text default null,
  p_usuario_id bigint default null
)
returns bigint
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_id bigint;
begin
  insert into public.candidatos (
    rut, nombre_completo, nombres, email, telefono, direccion,
    estado_id, creado_por, origen_registro
  ) values (
    trim(p_rut),
    trim(p_nombre),
    trim(p_nombre),
    nullif(lower(trim(p_email)), ''),
    nullif(trim(p_telefono), ''),
    nullif(trim(p_direccion), ''),
    (select id from public.estados_candidato where codigo = 'NUEVO'),
    p_usuario_id,
    'PORTAL'
  )
  on conflict (rut_normalizado) do update
  set nombre_completo = excluded.nombre_completo,
      nombres = excluded.nombres,
      email = coalesce(excluded.email, public.candidatos.email),
      telefono = coalesce(excluded.telefono, public.candidatos.telefono),
      direccion = coalesce(excluded.direccion, public.candidatos.direccion),
      updated_at = now()
  returning id into v_id;

  return v_id;
end;
$$;

create or replace function public.fn_resolver_cargo(
  p_cargo text,
  p_familia text default null
)
returns table (cargo_id bigint, familia_id bigint, familia_nombre text)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_cargo_id bigint;
  v_familia_id bigint;
  v_familia_nombre text;
begin
  select c.id, c.familia_cargo_id, f.nombre
  into v_cargo_id, v_familia_id, v_familia_nombre
  from public.cargos c
  join public.familias_cargo f on f.id = c.familia_cargo_id
  where lower(c.nombre) = lower(trim(p_cargo))
  limit 1;

  if v_cargo_id is not null then
    return query select v_cargo_id, v_familia_id, v_familia_nombre;
    return;
  end if;

  v_familia_nombre := coalesce(nullif(trim(p_familia), ''), 'Otros');

  select id into v_familia_id
  from public.familias_cargo
  where lower(nombre) = lower(v_familia_nombre)
  limit 1;

  if v_familia_id is null then
    insert into public.familias_cargo (nombre)
    values (v_familia_nombre)
    on conflict (nombre) do update set nombre = excluded.nombre
    returning id into v_familia_id;
  end if;

  insert into public.cargos (familia_cargo_id, nombre)
  values (v_familia_id, trim(p_cargo))
  on conflict (familia_cargo_id, nombre) do update
  set nombre = excluded.nombre
  returning id into v_cargo_id;

  select nombre into v_familia_nombre
  from public.familias_cargo
  where id = v_familia_id;

  return query select v_cargo_id, v_familia_id, v_familia_nombre;
end;
$$;

create or replace function public.fn_resolver_origen(p_origen text)
returns bigint
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_id bigint;
begin
  select id into v_id
  from public.origenes_solicitud
  where lower(nombre) = lower(trim(p_origen))
     or lower(codigo) = lower(replace(trim(p_origen), ' ', '_'))
  limit 1;

  if v_id is null then
    select id into v_id from public.origenes_solicitud where codigo = 'EXTERNO';
  end if;

  return v_id;
end;
$$;

create or replace function public.fn_resolver_estado(p_estado text)
returns bigint
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_id bigint;
begin
  select id into v_id
  from public.estados_solicitud
  where lower(nombre) = lower(trim(p_estado))
     or lower(codigo) = lower(replace(trim(p_estado), ' ', '_'))
  limit 1;

  if v_id is null then
    select id into v_id from public.estados_solicitud where codigo = 'PENDIENTE';
  end if;

  return v_id;
end;
$$;

-- 3. RPC de autenticacion -------------------------------------

create or replace function public.login_usuario(
  p_correo text,
  p_password text
)
returns table (
  id bigint,
  nombre text,
  correo text,
  rol text,
  titulo_rol text,
  estado text,
  permisos text[]
)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_cuenta public.cuentas%rowtype;
  v_estado_activo bigint;
begin
  select c.* into v_cuenta
  from public.cuentas c
  where lower(c.correo) = lower(trim(p_correo))
  limit 1;

  if not found then
    return;
  end if;

  select eu.id into v_estado_activo
  from public.estados_usuario eu
  where eu.codigo = 'ACTIVO'
  limit 1;

  if v_cuenta.estado_id is not null
     and v_cuenta.estado_id <> v_estado_activo then
    return;
  end if;

  if v_cuenta.password_hash is not null and trim(v_cuenta.password_hash) <> '' then
    if crypt(p_password, v_cuenta.password_hash) <> v_cuenta.password_hash then
      return;
    end if;
  elsif v_cuenta.password is not null and v_cuenta.password = p_password then
    update public.cuentas c
    set password_hash = crypt(p_password, gen_salt('bf', 10)),
        updated_at = now()
    where c.id = v_cuenta.id;
  else
    return;
  end if;

  update public.cuentas c
  set ultimo_acceso = now(),
      updated_at = now()
  where c.id = v_cuenta.id;

  return query
  select
    c.id,
    c.nombre,
    c.correo,
    c.rol,
    c.titulo_rol,
    coalesce(eu.nombre, 'Activo')::text,
    coalesce(
      array_agg(p.codigo order by p.codigo) filter (where p.codigo is not null),
      '{}'::text[]
    )
  from public.cuentas c
  left join public.estados_usuario eu on eu.id = c.estado_id
  left join public.roles r on r.id = c.rol_id
  left join public.rol_permisos rp on rp.rol_id = r.id
  left join public.permisos p on p.id = rp.permiso_id and p.activo = true
  where c.id = v_cuenta.id
  group by c.id, c.nombre, c.correo, c.rol, c.titulo_rol, eu.nombre;
end;
$$;

-- 4. RPC de solicitudes ---------------------------------------

create or replace function public.crear_postulacion(
  p_payload jsonb,
  p_usuario_id bigint default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_rut text := trim(coalesce(p_payload->>'rut', ''));
  v_nombre text := trim(coalesce(p_payload->>'candidato', ''));
  v_cargo text := trim(coalesce(p_payload->>'cargo', ''));
  v_familia text := nullif(trim(p_payload->>'familiaCargo'), '');
  v_email text := nullif(trim(p_payload->>'email'), '');
  v_telefono text := nullif(trim(p_payload->>'contacto'), '');
  v_direccion text := nullif(trim(p_payload->>'direccion'), '');
  v_observaciones text := nullif(trim(p_payload->>'observaciones'), '');
  v_cv text := nullif(trim(p_payload->>'cvArchivo'), '');
  v_origen text := coalesce(nullif(trim(p_payload->>'origen'), ''), 'Externo');
  v_fecha_texto text := nullif(trim(p_payload->>'fecha'), '');
  v_fecha date;
  v_candidato_id bigint;
  v_cargo_id bigint;
  v_familia_id bigint;
  v_familia_nombre text;
  v_estado_id bigint;
  v_origen_id bigint;
  v_solicitud_id bigint;
  v_codigo text;
  v_usuario_nombre text;
begin
  if v_rut = '' or v_nombre = '' or v_cargo = '' then
    raise exception 'RUT, nombre y cargo son obligatorios.';
  end if;

  v_fecha := case
    when v_fecha_texto ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then v_fecha_texto::date
    else current_date
  end;

  perform set_config('app.usuario_id', coalesce(p_usuario_id::text, ''), true);

  select nombre into v_usuario_nombre
  from public.cuentas
  where id = p_usuario_id;

  v_candidato_id := public.fn_upsert_candidato(
    v_rut, v_nombre, v_email, v_telefono, v_direccion, p_usuario_id
  );

  select fc.cargo_id, fc.familia_id, fc.familia_nombre
  into v_cargo_id, v_familia_id, v_familia_nombre
  from public.fn_resolver_cargo(v_cargo, v_familia) fc;

  v_estado_id := public.fn_resolver_estado('Pendiente');
  v_origen_id := public.fn_resolver_origen(v_origen);

  insert into public.solicitudes (
    rut, candidato, correo, telefono, direccion, cargo, familia_cargo,
    fecha_solicitud, solicitado_por, responsable, cv_adjunto, estado,
    observaciones, evaluacion, candidato_id, cargo_id, familia_cargo_id,
    estado_id, origen_id, solicitado_por_id, prioridad, created_at, updated_at
  ) values (
    v_rut, v_nombre, v_email, v_telefono, v_direccion, v_cargo, v_familia_nombre,
    v_fecha, coalesce(v_usuario_nombre, 'Portal Público Web'), null, v_cv, 'Pendiente',
    v_observaciones,
    jsonb_build_object(
      'fechaEntrevista', '',
      'resultado', '',
      'observacionesEvaluador', '',
      'archivoTranscripcion', '',
      'archivoInformeFinal', ''
    ),
    v_candidato_id, v_cargo_id, v_familia_id, v_estado_id, v_origen_id,
    p_usuario_id, 'MEDIA', now(), now()
  )
  returning id, codigo into v_solicitud_id, v_codigo;

  if v_cv is not null then
    insert into public.documentos (
      solicitud_id, candidato_id, tipo_documento_id, nombre_archivo, subido_por
    )
    select v_solicitud_id, v_candidato_id, td.id, v_cv, p_usuario_id
    from public.tipos_documento td
    where td.codigo = 'CV'
    on conflict (solicitud_id, tipo_documento_id) do update
    set nombre_archivo = excluded.nombre_archivo,
        candidato_id = excluded.candidato_id,
        subido_por = excluded.subido_por;
  end if;

  return jsonb_build_object('id', v_solicitud_id, 'codigo', v_codigo);
end;
$$;

create or replace function public.actualizar_postulacion(
  p_payload jsonb,
  p_usuario_id bigint default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_solicitud_id bigint := (p_payload->>'id')::bigint;
  v_rut_actual text;
  v_nombre_actual text;
  v_correo_actual text;
  v_telefono_actual text;
  v_direccion_actual text;
  v_cargo_actual text;
  v_familia_actual text;
  v_origen_actual text;
  v_candidato_id bigint;
  v_rut text;
  v_nombre text;
  v_correo text;
  v_telefono text;
  v_direccion text;
  v_cargo text;
  v_familia text;
  v_origen text;
  v_cv text;
  v_cargo_id bigint;
  v_familia_id bigint;
  v_familia_nombre text;
  v_origen_id bigint;
begin
  if v_solicitud_id is null then
    raise exception 'Falta el id de la solicitud.';
  end if;

  select
    s.rut, s.candidato, s.correo, s.telefono, s.direccion, s.cargo,
    s.familia_cargo, o.nombre, s.candidato_id
  into
    v_rut_actual, v_nombre_actual, v_correo_actual, v_telefono_actual,
    v_direccion_actual, v_cargo_actual, v_familia_actual, v_origen_actual,
    v_candidato_id
  from public.solicitudes s
  left join public.origenes_solicitud o on o.id = s.origen_id
  where s.id = v_solicitud_id;

  if not found then
    raise exception 'No existe la solicitud con id %.', v_solicitud_id;
  end if;

  perform set_config('app.usuario_id', coalesce(p_usuario_id::text, ''), true);

  v_rut := coalesce(nullif(trim(p_payload->>'rut'), ''), v_rut_actual);
  v_nombre := coalesce(nullif(trim(p_payload->>'candidato'), ''), v_nombre_actual);
  v_correo := coalesce(nullif(trim(p_payload->>'email'), ''), v_correo_actual);
  v_telefono := coalesce(nullif(trim(p_payload->>'contacto'), ''), v_telefono_actual);
  v_direccion := coalesce(nullif(trim(p_payload->>'direccion'), ''), v_direccion_actual);
  v_cargo := coalesce(nullif(trim(p_payload->>'cargo'), ''), v_cargo_actual);
  v_familia := coalesce(nullif(trim(p_payload->>'familiaCargo'), ''), v_familia_actual);
  v_origen := coalesce(nullif(trim(p_payload->>'origen'), ''), v_origen_actual, 'Externo');
  v_cv := nullif(trim(p_payload->>'cvArchivo'), '');

  if v_candidato_id is null then
    v_candidato_id := public.fn_upsert_candidato(
      v_rut, v_nombre, v_correo, v_telefono, v_direccion, p_usuario_id
    );
  else
    update public.candidatos
    set rut = v_rut,
        nombre_completo = v_nombre,
        nombres = v_nombre,
        email = v_correo,
        telefono = v_telefono,
        direccion = v_direccion,
        updated_at = now()
    where id = v_candidato_id;
  end if;

  select fc.cargo_id, fc.familia_id, fc.familia_nombre
  into v_cargo_id, v_familia_id, v_familia_nombre
  from public.fn_resolver_cargo(v_cargo, v_familia) fc;

  v_origen_id := public.fn_resolver_origen(v_origen);

  update public.solicitudes
  set rut = v_rut,
      candidato = v_nombre,
      correo = v_correo,
      telefono = v_telefono,
      direccion = v_direccion,
      cargo = v_cargo,
      familia_cargo = v_familia_nombre,
      observaciones = nullif(trim(p_payload->>'observaciones'), ''),
      candidato_id = v_candidato_id,
      cargo_id = v_cargo_id,
      familia_cargo_id = v_familia_id,
      origen_id = v_origen_id,
      updated_at = now()
  where id = v_solicitud_id;

  if p_payload ? 'cvArchivo' then
    if v_cv is null then
      delete from public.documentos
      where solicitud_id = v_solicitud_id
        and tipo_documento_id = (select id from public.tipos_documento where codigo = 'CV');
    else
      insert into public.documentos (
        solicitud_id, candidato_id, tipo_documento_id, nombre_archivo, subido_por
      )
      select v_solicitud_id, v_candidato_id, td.id, v_cv, p_usuario_id
      from public.tipos_documento td
      where td.codigo = 'CV'
      on conflict (solicitud_id, tipo_documento_id) do update
      set nombre_archivo = excluded.nombre_archivo,
          candidato_id = excluded.candidato_id,
          subido_por = excluded.subido_por;
    end if;
  end if;

  return jsonb_build_object('id', v_solicitud_id);
end;
$$;

create or replace function public.guardar_evaluacion(
  p_solicitud_id bigint,
  p_usuario_id bigint,
  p_fecha_entrevista date,
  p_resultado text,
  p_observaciones text,
  p_estado text,
  p_entrevista_archivo text,
  p_informe_archivo text,
  p_cv_archivo text
)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_candidato_id bigint;
  v_resultado_id bigint;
  v_resultado_codigo text;
  v_estado_texto text;
  v_estado_id bigint;
  v_estado_candidato text;
begin
  perform set_config('app.usuario_id', coalesce(p_usuario_id::text, ''), true);

  if not exists (
    select 1 from public.cuentas
    where id = p_usuario_id and upper(rol) in ('ADMIN', 'EVALUADOR')
  ) then
    raise exception 'No autorizado para guardar evaluaciones.';
  end if;

  select candidato_id into v_candidato_id
  from public.solicitudes
  where id = p_solicitud_id;

  if not found then
    raise exception 'No existe la solicitud con id %.', p_solicitud_id;
  end if;

  if nullif(trim(p_resultado), '') is not null then
    select id, codigo into v_resultado_id, v_resultado_codigo
    from public.resultados_evaluacion
    where lower(nombre) = lower(trim(p_resultado))
       or lower(codigo) = lower(replace(trim(p_resultado), ' ', '_'))
    limit 1;
  end if;

  if p_cv_archivo is not null then
    if trim(p_cv_archivo) = '' then
      delete from public.documentos
      where solicitud_id = p_solicitud_id
        and tipo_documento_id = (select id from public.tipos_documento where codigo = 'CV');
    else
      insert into public.documentos (
        solicitud_id, candidato_id, tipo_documento_id, nombre_archivo, subido_por
      )
      select p_solicitud_id, v_candidato_id, td.id, trim(p_cv_archivo), p_usuario_id
      from public.tipos_documento td
      where td.codigo = 'CV'
      on conflict (solicitud_id, tipo_documento_id) do update
      set nombre_archivo = excluded.nombre_archivo,
          candidato_id = excluded.candidato_id,
          subido_por = excluded.subido_por;
    end if;
  end if;

  if p_entrevista_archivo is not null then
    if trim(p_entrevista_archivo) = '' then
      delete from public.documentos
      where solicitud_id = p_solicitud_id
        and tipo_documento_id = (select id from public.tipos_documento where codigo = 'PAUTA_ENTREVISTA');
    else
      insert into public.documentos (
        solicitud_id, candidato_id, tipo_documento_id, nombre_archivo, subido_por
      )
      select p_solicitud_id, v_candidato_id, td.id, trim(p_entrevista_archivo), p_usuario_id
      from public.tipos_documento td
      where td.codigo = 'PAUTA_ENTREVISTA'
      on conflict (solicitud_id, tipo_documento_id) do update
      set nombre_archivo = excluded.nombre_archivo,
          candidato_id = excluded.candidato_id,
          subido_por = excluded.subido_por;
    end if;
  end if;

  if p_informe_archivo is not null then
    if trim(p_informe_archivo) = '' then
      delete from public.documentos
      where solicitud_id = p_solicitud_id
        and tipo_documento_id = (select id from public.tipos_documento where codigo = 'INFORME_PSICOLABORAL');
    else
      insert into public.documentos (
        solicitud_id, candidato_id, tipo_documento_id, nombre_archivo, subido_por
      )
      select p_solicitud_id, v_candidato_id, td.id, trim(p_informe_archivo), p_usuario_id
      from public.tipos_documento td
      where td.codigo = 'INFORME_PSICOLABORAL'
      on conflict (solicitud_id, tipo_documento_id) do update
      set nombre_archivo = excluded.nombre_archivo,
          candidato_id = excluded.candidato_id,
          subido_por = excluded.subido_por;
    end if;
  end if;

  insert into public.evaluaciones (
    solicitud_id, evaluador_id, fecha_entrevista, resultado_id,
    observaciones, fecha_evaluacion
  ) values (
    p_solicitud_id, p_usuario_id, p_fecha_entrevista, v_resultado_id,
    nullif(trim(p_observaciones), ''),
    case when v_resultado_id is not null then now() else null end
  )
  on conflict (solicitud_id) do update
  set evaluador_id = excluded.evaluador_id,
      fecha_entrevista = excluded.fecha_entrevista,
      resultado_id = excluded.resultado_id,
      observaciones = excluded.observaciones,
      fecha_evaluacion = excluded.fecha_evaluacion,
      updated_at = now();

  v_estado_texto := nullif(trim(p_estado), '');

  if v_estado_texto is null then
    if v_resultado_id is not null then
      v_estado_texto := 'Finalizada';
    elsif p_fecha_entrevista is not null then
      v_estado_texto := 'En proceso';
    end if;
  end if;

  if v_estado_texto is not null then
    v_estado_id := public.fn_resolver_estado(v_estado_texto);
    update public.solicitudes
    set estado_id = v_estado_id,
        updated_at = now()
    where id = p_solicitud_id;
  end if;

  if v_resultado_codigo is not null and v_candidato_id is not null then
    v_estado_candidato := case v_resultado_codigo
      when 'RECOMENDABLE' then 'APTO'
      when 'RECOMENDABLE_CON_OBSERVACIONES' then 'APTO'
      when 'NO_RECOMENDABLE' then 'NO_APTO'
      when 'EN_EVALUACION' then 'EN_EVALUACION'
      else 'NUEVO'
    end;

    update public.candidatos
    set estado_id = (select id from public.estados_candidato where codigo = v_estado_candidato),
        updated_at = now()
    where id = v_candidato_id;
  end if;
end;
$$;

create or replace function public.eliminar_solicitud(
  p_id bigint,
  p_usuario_id bigint
)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  perform set_config('app.usuario_id', coalesce(p_usuario_id::text, ''), true);

  if not public.fn_es_admin(p_usuario_id) then
    raise exception 'Solo un administrador puede eliminar solicitudes.';
  end if;

  delete from public.solicitudes where id = p_id;
end;
$$;

-- 5. RPC de usuarios ------------------------------------------

create or replace function public.crear_usuario(
  p_nombre text,
  p_correo text,
  p_rol text,
  p_password text,
  p_usuario_id bigint
)
returns bigint
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_id bigint;
  v_rol text := upper(trim(p_rol));
  v_rol_id bigint;
  v_estado_id bigint;
begin
  perform set_config('app.usuario_id', coalesce(p_usuario_id::text, ''), true);

  if not public.fn_es_admin(p_usuario_id) then
    raise exception 'Solo un administrador puede crear usuarios.';
  end if;

  select id into v_rol_id from public.roles where codigo = v_rol;
  if v_rol_id is null then
    raise exception 'Rol no valido: %', p_rol;
  end if;

  select id into v_estado_id from public.estados_usuario where codigo = 'ACTIVO';

  insert into public.cuentas (
    correo, password, password_hash, nombre, rol, titulo_rol,
    fecha_alta, rol_id, estado_id, created_at, updated_at
  ) values (
    lower(trim(p_correo)), null,
    crypt(p_password, gen_salt('bf', 10)),
    trim(p_nombre), v_rol, null,
    current_date, v_rol_id, v_estado_id, now(), now()
  )
  returning id into v_id;

  return v_id;
end;
$$;

create or replace function public.actualizar_usuario(
  p_id bigint,
  p_nombre text,
  p_correo text,
  p_rol text,
  p_password text,
  p_usuario_id bigint
)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_rol text := upper(trim(p_rol));
  v_rol_id bigint;
begin
  perform set_config('app.usuario_id', coalesce(p_usuario_id::text, ''), true);

  if not public.fn_es_admin(p_usuario_id) then
    raise exception 'Solo un administrador puede editar usuarios.';
  end if;

  select id into v_rol_id from public.roles where codigo = v_rol;
  if v_rol_id is null then
    raise exception 'Rol no valido: %', p_rol;
  end if;

  if nullif(trim(p_password), '') is not null then
    update public.cuentas
    set nombre = trim(p_nombre),
        correo = lower(trim(p_correo)),
        rol = v_rol,
        rol_id = v_rol_id,
        password = null,
        password_hash = crypt(p_password, gen_salt('bf', 10)),
        updated_at = now()
    where id = p_id;
  else
    update public.cuentas
    set nombre = trim(p_nombre),
        correo = lower(trim(p_correo)),
        rol = v_rol,
        rol_id = v_rol_id,
        updated_at = now()
    where id = p_id;
  end if;
end;
$$;

create or replace function public.eliminar_usuario(
  p_id bigint,
  p_usuario_id bigint
)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  perform set_config('app.usuario_id', coalesce(p_usuario_id::text, ''), true);

  if not public.fn_es_admin(p_usuario_id) then
    raise exception 'Solo un administrador puede eliminar usuarios.';
  end if;

  if p_id = p_usuario_id then
    raise exception 'No puedes eliminar tu propia cuenta en sesion.';
  end if;

  delete from public.cuentas where id = p_id;
end;
$$;

-- 6. RPC de historial -----------------------------------------

create or replace function public.listar_historial(
  p_tabla text default null,
  p_registro_id bigint default null,
  p_limit integer default 100
)
returns table (
  id bigint,
  tabla text,
  registro_id bigint,
  accion text,
  datos_anteriores jsonb,
  datos_nuevos jsonb,
  usuario_id bigint,
  usuario_nombre text,
  created_at timestamptz
)
language sql
security definer
set search_path = public, extensions
as $$
  select
    h.id,
    h.tabla,
    h.registro_id,
    h.accion,
    h.datos_anteriores,
    h.datos_nuevos,
    h.usuario_id,
    u.nombre as usuario_nombre,
    h.created_at
  from public.historial_cambios h
  left join public.cuentas u on u.id = h.usuario_id
  where (p_tabla is null or h.tabla = p_tabla)
    and (p_registro_id is null or h.registro_id = p_registro_id)
  order by h.created_at desc
  limit least(greatest(coalesce(p_limit, 100), 1), 500);
$$;

-- 7. Vistas ---------------------------------------------------

create or replace view public.vw_solicitudes_completas as
select
  s.id,
  s.codigo,
  s.rut,
  coalesce(c.nombre_completo, s.candidato) as candidato,
  s.cargo,
  coalesce(fc.nombre, s.familia_cargo) as familia_cargo,
  coalesce(u.nombre, nullif(s.solicitado_por, ''), 'Portal Público Web') as emisor,
  coalesce(o.nombre, 'Externo') as origen,
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
  s.origen_id,
  s.solicitado_por_id,
  s.evaluador_asignado_id,
  s.prioridad,
  s.created_at,
  s.updated_at
from public.solicitudes s
left join public.candidatos c on c.id = s.candidato_id
left join public.familias_cargo fc on fc.id = s.familia_cargo_id
left join public.cuentas u on u.id = s.solicitado_por_id
left join public.origenes_solicitud o on o.id = s.origen_id
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

create or replace view public.vw_usuarios_publicos as
select
  c.id,
  c.nombre,
  c.correo,
  c.rol,
  c.titulo_rol,
  c.fecha_alta,
  c.rol_id,
  r.nombre as rol_nombre,
  c.estado_id,
  eu.nombre as estado_nombre,
  c.ultimo_acceso,
  coalesce(
    array_agg(p.codigo order by p.codigo) filter (where p.codigo is not null),
    '{}'::text[]
  ) as permisos
from public.cuentas c
left join public.roles r on r.id = c.rol_id
left join public.estados_usuario eu on eu.id = c.estado_id
left join public.rol_permisos rp on rp.rol_id = r.id
left join public.permisos p on p.id = rp.permiso_id and p.activo = true
group by
  c.id, c.nombre, c.correo, c.rol, c.titulo_rol, c.fecha_alta,
  c.rol_id, r.nombre, c.estado_id, eu.nombre, c.ultimo_acceso;

create or replace view public.vw_historial_solicitudes as
select
  h.id,
  h.tabla,
  h.registro_id,
  h.accion,
  h.datos_anteriores,
  h.datos_nuevos,
  h.usuario_id,
  u.nombre as usuario_nombre,
  h.created_at
from public.historial_cambios h
left join public.cuentas u on u.id = h.usuario_id
where h.tabla = 'solicitudes';

-- 8. Triggers -------------------------------------------------

drop trigger if exists trg_cuentas_updated_at on public.cuentas;
create trigger trg_cuentas_updated_at
before update on public.cuentas
for each row execute function public.fn_set_updated_at();

drop trigger if exists trg_candidatos_updated_at on public.candidatos;
create trigger trg_candidatos_updated_at
before update on public.candidatos
for each row execute function public.fn_set_updated_at();

drop trigger if exists trg_solicitudes_updated_at on public.solicitudes;
create trigger trg_solicitudes_updated_at
before update on public.solicitudes
for each row execute function public.fn_set_updated_at();

drop trigger if exists trg_evaluaciones_updated_at on public.evaluaciones;
create trigger trg_evaluaciones_updated_at
before update on public.evaluaciones
for each row execute function public.fn_set_updated_at();

drop trigger if exists trg_parametros_updated_at on public.parametros_sistema;
create trigger trg_parametros_updated_at
before update on public.parametros_sistema
for each row execute function public.fn_set_updated_at();

drop trigger if exists trg_solicitudes_codigo on public.solicitudes;
create trigger trg_solicitudes_codigo
before insert on public.solicitudes
for each row execute function public.fn_asignar_codigo_solicitud();

drop trigger if exists trg_solicitudes_estado on public.solicitudes;
create trigger trg_solicitudes_estado
before insert or update of estado, estado_id on public.solicitudes
for each row execute function public.fn_sync_solicitud_estado();

drop trigger if exists trg_solicitudes_historial_estado on public.solicitudes;
create trigger trg_solicitudes_historial_estado
after update of estado, estado_id on public.solicitudes
for each row execute function public.fn_historial_estado();

drop trigger if exists trg_evaluaciones_sync_jsonb on public.evaluaciones;
create trigger trg_evaluaciones_sync_jsonb
after insert or update or delete on public.evaluaciones
for each row execute function public.fn_sync_evaluacion_jsonb();

drop trigger if exists trg_solicitudes_sync_evaluacion on public.solicitudes;
create trigger trg_solicitudes_sync_evaluacion
after update of evaluacion on public.solicitudes
for each row execute function public.fn_sync_evaluacion_desde_solicitud();

drop trigger if exists trg_audit_cuentas on public.cuentas;
create trigger trg_audit_cuentas
after insert or update or delete on public.cuentas
for each row execute function public.fn_auditar_cuenta();

drop trigger if exists trg_audit_candidatos on public.candidatos;
create trigger trg_audit_candidatos
after insert or update or delete on public.candidatos
for each row execute function public.fn_auditar_cambios();

drop trigger if exists trg_audit_solicitudes on public.solicitudes;
create trigger trg_audit_solicitudes
after insert or update or delete on public.solicitudes
for each row execute function public.fn_auditar_cambios();

drop trigger if exists trg_audit_evaluaciones on public.evaluaciones;
create trigger trg_audit_evaluaciones
after insert or update or delete on public.evaluaciones
for each row execute function public.fn_auditar_cambios();

drop trigger if exists trg_audit_documentos on public.documentos;
create trigger trg_audit_documentos
after insert or update or delete on public.documentos
for each row execute function public.fn_auditar_cambios();

-- 9. Permisos -------------------------------------------------

revoke all on public.cuentas from anon;
revoke all on public.solicitudes from anon;
revoke all on public.cuentas from authenticated;
revoke all on public.solicitudes from authenticated;

drop policy if exists "anon CRUD cuentas" on public.cuentas;
drop policy if exists "anon CRUD solicitudes" on public.solicitudes;

grant usage on schema public to anon, authenticated;

grant select on public.roles to anon, authenticated;
grant select on public.permisos to anon, authenticated;
grant select on public.rol_permisos to anon, authenticated;
grant select on public.estados_solicitud to anon, authenticated;
grant select on public.estados_usuario to anon, authenticated;
grant select on public.estados_candidato to anon, authenticated;
grant select on public.familias_cargo to anon, authenticated;
grant select on public.cargos to anon, authenticated;
grant select on public.resultados_evaluacion to anon, authenticated;
grant select on public.origenes_solicitud to anon, authenticated;
grant select on public.tipos_documento to anon, authenticated;
grant select on public.tipos_entrevista to anon, authenticated;

grant select on public.vw_solicitudes_completas to anon, authenticated;
grant select on public.vw_usuarios_publicos to anon, authenticated;
grant select on public.vw_historial_solicitudes to anon, authenticated;

revoke all on function public.login_usuario(text, text) from public;
revoke all on function public.crear_postulacion(jsonb, bigint) from public;
revoke all on function public.actualizar_postulacion(jsonb, bigint) from public;
revoke all on function public.guardar_evaluacion(bigint, bigint, date, text, text, text, text, text, text) from public;
revoke all on function public.eliminar_solicitud(bigint, bigint) from public;
revoke all on function public.crear_usuario(text, text, text, text, bigint) from public;
revoke all on function public.actualizar_usuario(bigint, text, text, text, text, bigint) from public;
revoke all on function public.eliminar_usuario(bigint, bigint) from public;
revoke all on function public.listar_historial(text, bigint, integer) from public;

grant execute on function public.login_usuario(text, text) to anon, authenticated;
grant execute on function public.crear_postulacion(jsonb, bigint) to anon, authenticated;
grant execute on function public.actualizar_postulacion(jsonb, bigint) to anon, authenticated;
grant execute on function public.guardar_evaluacion(bigint, bigint, date, text, text, text, text, text, text) to anon, authenticated;
grant execute on function public.eliminar_solicitud(bigint, bigint) to anon, authenticated;
grant execute on function public.crear_usuario(text, text, text, text, bigint) to anon, authenticated;
grant execute on function public.actualizar_usuario(bigint, text, text, text, text, bigint) to anon, authenticated;
grant execute on function public.eliminar_usuario(bigint, bigint) to anon, authenticated;
grant execute on function public.listar_historial(text, bigint, integer) to anon, authenticated;
