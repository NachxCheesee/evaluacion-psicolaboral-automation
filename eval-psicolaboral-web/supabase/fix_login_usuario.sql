-- ============================================================
-- Fix puntual: reemplazar public.login_usuario
-- ------------------------------------------------------------
-- Corrige: column reference "correo" is ambiguous
-- Ejecutar en Supabase -> SQL Editor.
-- No borra datos ni requiere volver a ejecutar toda la Parte 3.
-- ============================================================

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

notify pgrst, 'reload schema';

-- Verificacion: debe devolver true y una fila para admin.
select
  position(
    'lower(c.correo)'
    in pg_get_functiondef('public.login_usuario(text,text)'::regprocedure)
  ) > 0 as funcion_corregida;

select count(*) as coincidencias_admin
from public.login_usuario('admin@aquachile.cl', '123');
