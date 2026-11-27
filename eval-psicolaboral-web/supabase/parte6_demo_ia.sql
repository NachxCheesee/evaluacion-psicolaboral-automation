-- ============================================================
-- Parte 6 - Datos demo de compatibilidad IA (AquaChile)
-- ------------------------------------------------------------
-- Ejecutar DESPUES de parte5_ia_compatibilidad.sql.
-- Este script es opcional y está pensado para ambientes de
-- demostración o pruebas. No se incluye en parte3_completo.sql.
-- Es idempotente: se puede volver a ejecutar.
-- ============================================================

begin;

select set_config('app.skip_audit', '1', true);
select set_config('app.usuario_id', coalesce((
  select id::text from public.cuentas where correo = 'evaluador@aquachile.cl'
), ''), true);

-- 1. Perfiles IA de todos los cargos ---------------------------

update public.cargos
set perfil_ia = case nombre
  when 'Operario de Planta de Procesos' then
    'Ejecuta labores de recepción, fileteo, calibrado, empaque y control de despacho en planta de proceso. Requiere experiencia en turnos rotativos, cumplimiento de inocuidad, uso de EPP y trabajo en línea de frío. Se valoran certificaciones de manipulación de alimentos y experiencia en plantas de salmón.'
  when 'Supervisor de Cultivo Agua Mar' then
    'Supervisa cuadrillas de cultivo en centros de agua mar, control de biomasa, alimentación, limpieza de redes y registro de variables. Requiere liderazgo de equipos, conocimiento de bioseguridad, turnos en faena y capacidad para reportar desviaciones.'
  when 'Jefe de Mantención y Frío' then
    'Planifica y controla mantención preventiva y correctiva de equipos de frío, sistemas de amoniaco, bombas y cámaras. Requiere formación técnica o ingeniería, experiencia en refrigeración industrial, liderazgo de técnicos y cumplimiento de normas de seguridad.'
  when 'Técnico de Alimentación y Fotoperíodo' then
    'Opera sistemas de alimentación, registra consumo, controla fotoperíodo y apoya el monitoreo de variables productivas. Requiere formación técnica acuícola, manejo de software de alimentación, registro de datos y disponibilidad para turnos.'
  when 'Asistente de Aseguramiento de Calidad' then
    'Apoya auditorías internas, control documental, muestreos y verificación de estándares de inocuidad. Requiere formación en calidad, experiencia en plantas de alimentos, manejo de registros y capacidad de análisis.'
  when 'Operador de Grúa Horquilla y Logística' then
    'Opera grúa horquilla, realiza carga y descarga, controla inventario y apoya la logística de planta. Requiere licencia vigente, experiencia en bodega, cumplimiento de seguridad y registro de movimientos.'
  when 'Buzo Especialista en Redes y Fondeo' then
    'Realiza inspección y mantención subacuática de redes, fondeos y estructuras. Requiere certificación de buceo vigente, horas de inmersión comprobables, experiencia en centros de cultivo y cumplimiento estricto de seguridad.'
  when 'Analista de Laboratorio y Microbiología' then
    'Ejecuta análisis microbiológicos y fisicoquímicos, prepara muestras, registra resultados y apoya el control de calidad. Requiere formación profesional o técnica en laboratorio, experiencia en microbiología y manejo de equipos.'
  when 'Otro Cargo Operativo / Administrativo' then
    'Perfil operativo o administrativo de apoyo a la operación. Se evalúan experiencia previa, competencias administrativas, manejo de herramientas de oficina, organización y adaptación al cargo específico.'
  when 'Otro Cargo Operativo' then
    'Perfil operativo de apoyo a planta o terreno. Se evalúan experiencia en faena, disponibilidad para turnos, cumplimiento de seguridad y capacidad de trabajo en equipo.'
  else
    'Perfil de referencia del cargo. Se evalúan experiencia, formación, certificaciones, competencias técnicas y coherencia del CV con los requisitos declarados.'
end,
updated_at = now();

-- 2. Configuracion IA realista ----------------------------------

update public.configuracion_ia
set activo = true,
    proveedor = 'openai',
    modelo = 'gpt-4.1-mini',
    system_prompt = $prompt$
Eres un analista senior de selección psicolaboral de AquaChile. Evalúa la compatibilidad entre el CV del candidato y el perfil del cargo. Analiza experiencia, formación, certificaciones, competencias técnicas y coherencia interna. No inventes información. Si detectas vacíos, contradicciones, afirmaciones no respaldadas o certificaciones ausentes, indícalo como alerta. Devuelve un porcentaje de 0 a 100, un comentario breve y objetivo, y una lista de hallazgos. No discrimines por género, edad, nacionalidad, estado civil, religión ni discapacidad.
$prompt$,
    prompt_analisis = $prompt$
Revisa el CV contra el campo perfil_ia del cargo. Identifica fortalezas, brechas y posibles inconsistencias. Considera como alerta: experiencia declarada sin fechas, certificaciones no acreditadas, cargos incompatibles con la trayectoria, cambios temporales inexplicables y datos que contradicen la postulación. Entrega compatibilidad, comentario, hallazgos, alertas y nivel de riesgo en formato JSON.
$prompt$,
    temperatura = 0.2,
    max_tokens = 1200,
    updated_by = (select id from public.cuentas where correo = 'admin@aquachile.cl'),
    updated_at = now()
where id = 1;

-- 3. Datos demo temporales --------------------------------------

create temp table if not exists tmp_demo_ia_datos (
  n smallint primary key,
  rut text not null,
  nombre text not null,
  cargo text not null,
  estado text not null,
  dias integer not null,
  compatibilidad smallint not null,
  comentario text not null,
  alerta boolean not null default false,
  resultado text,
  obs_eval text
) on commit drop;

truncate tmp_demo_ia_datos;

insert into tmp_demo_ia_datos (
  n, rut, nombre, cargo, estado, dias, compatibilidad,
  comentario, alerta, resultado, obs_eval
)
values
  (1, '20.111.222-3', 'Valentina Soto Contreras', 'Operario de Planta de Procesos', 'Pendiente', 3, 88, 'CV con experiencia directa en plantas de proceso y disponibilidad para turnos. Buen ajuste general al perfil.', false, null, null),
  (2, '20.111.222-3', 'Valentina Soto Contreras', 'Técnico de Alimentación y Fotoperíodo', 'En proceso', 7, 64, 'Experiencia técnica parcial; el CV no detalla manejo de fotoperíodo ni registros de alimentación. Requiere validación.', true, 'En evaluación', 'Entrevista técnica realizada; se solicitó respaldo de experiencia en fotoperíodo.'),
  (3, '20.111.222-3', 'Valentina Soto Contreras', 'Buzo Especialista en Redes y Fondeo', 'Finalizada', 12, 41, 'El CV declara experiencia en buceo, pero no adjunta certificaciones vigentes ni horas de inmersión. Alerta de inconsistencia.', true, 'No Recomendable', 'No acredita certificaciones vigentes de buceo ni horas de inmersión.'),
  (4, '19.222.333-4', 'Diego Fuentes Araya', 'Supervisor de Cultivo Agua Mar', 'En proceso', 5, 74, 'Trayectoria en cultivo y supervisión de cuadrillas. Ajuste medio para el nivel de jefatura.', false, 'En evaluación', 'Buen manejo de cultivo; se evalúa liderazgo de cuadrilla.'),
  (5, '19.222.333-4', 'Diego Fuentes Araya', 'Jefe de Mantención y Frío', 'Finalizada', 15, 58, 'Experiencia en refrigeración industrial, aunque el CV no acredita cursos de amoniaco ni mantención crítica. Alerta.', true, 'Recomendable con Observaciones', 'Experiencia en frío, pero sin respaldo de cursos de amoniaco.'),
  (6, '18.333.444-5', 'Camila Herrera León', 'Asistente de Aseguramiento de Calidad', 'Finalizada', 9, 91, 'Formación y experiencia alineadas con aseguramiento de calidad. Alto ajuste.', false, 'Recomendable', 'Perfil técnico y experiencia en auditorías alineados.'),
  (7, '18.333.444-5', 'Camila Herrera León', 'Analista de Laboratorio y Microbiología', 'En proceso', 6, 77, 'Buen manejo de técnicas de laboratorio y microbiología. Ajuste medio alto.', false, 'En evaluación', 'Buen dominio de microbiología; falta detalle de equipos.'),
  (8, '18.333.444-5', 'Camila Herrera León', 'Otro Cargo Operativo / Administrativo', 'Pendiente', 2, 55, 'Perfil administrativo genérico; el CV no evidencia experiencia operativa. Ajuste medio.', false, null, null),
  (9, '17.444.555-6', 'Jorge Mansilla Rojas', 'Operador de Grúa Horquilla y Logística', 'En proceso', 8, 83, 'Licencia y experiencia documentada en grúa horquilla. Buen ajuste.', false, 'En evaluación', 'Experiencia y licencia vigente verificadas en CV.'),
  (10, '17.444.555-6', 'Jorge Mansilla Rojas', 'Operario de Planta de Procesos', 'Pendiente', 1, 68, 'Experiencia operativa en planta, aunque el CV no detalla turnos ni certificaciones. Ajuste medio.', false, null, null),
  (11, '16.555.666-7', 'Francisca Navarro Díaz', 'Operario de Planta de Procesos', 'Finalizada', 20, 79, 'Cumple requisitos operativos y registra experiencia en plantas de proceso.', false, 'Recomendable', 'Experiencia operativa y turnos acreditados.'),
  (12, '15.666.777-8', 'Sebastián Vera Muñoz', 'Supervisor de Cultivo Agua Mar', 'Pendiente', 18, 52, 'CV con poca evidencia de liderazgo y supervisión de equipos.', false, null, null),
  (13, '14.777.888-9', 'Antonia Paredes Ruiz', 'Jefe de Mantención y Frío', 'En proceso', 22, 71, 'Experiencia en mantención y frío; falta detalle de sistemas de amoniaco.', false, 'En evaluación', 'Experiencia en mantención; se solicitó detalle de amoniaco.'),
  (14, '13.888.999-0', 'Nicolás Cárcamo Silva', 'Técnico de Alimentación y Fotoperíodo', 'Finalizada', 25, 86, 'Formación técnica y experiencia en alimentación de cultivos. Buen ajuste.', false, 'Recomendable', 'Experiencia técnica y registros de alimentación.'),
  (15, '12.999.000-1', 'Javiera Orellana Soto', 'Asistente de Aseguramiento de Calidad', 'Pendiente', 19, 66, 'Experiencia en calidad y auditorías internas. Ajuste medio.', false, null, null),
  (16, '11.000.111-2', 'Cristóbal Fuentealba Rojas', 'Operador de Grúa Horquilla y Logística', 'Finalizada', 26, 74, 'Experiencia logística y operación de grúa horquilla. Buen ajuste.', false, 'Recomendable con Observaciones', 'Experiencia logística; falta renovación de licencia.'),
  (17, '10.111.222-3', 'Constanza Alarcón Vega', 'Buzo Especialista en Redes y Fondeo', 'En proceso', 21, 49, 'CV declara buceo profesional, pero no presenta certificaciones ni bitácora. Alerta.', true, 'En evaluación', 'No adjunta certificaciones de buceo ni bitácora.'),
  (18, '9.222.333-4', 'Felipe Sandoval Márquez', 'Analista de Laboratorio y Microbiología', 'Finalizada', 28, 82, 'Perfil de laboratorio y microbiología alineado con el cargo.', false, 'Recomendable', 'Formación y experiencia en laboratorio.'),
  (19, '8.333.444-5', 'Daniela Escobar Pinto', 'Otro Cargo Operativo / Administrativo', 'Pendiente', 16, 61, 'Perfil administrativo, con poca evidencia de trabajo en terreno.', false, null, null),
  (20, '7.444.555-6', 'Ignacio Salazar Torres', 'Operario de Planta de Procesos', 'En proceso', 24, 90, 'Experiencia operativa y disponibilidad para turnos. Alto ajuste.', false, 'En evaluación', 'Alta afinidad con el perfil operativo.'),
  (21, '6.555.666-7', 'María José Gutiérrez', 'Supervisor de Cultivo Agua Mar', 'Finalizada', 30, 73, 'Experiencia en cultivo y manejo de equipos. Ajuste medio alto.', false, 'Recomendable', 'Experiencia en cultivo y liderazgo.'),
  (22, '5.666.777-8', 'Vicente Leal Herrera', 'Jefe de Mantención y Frío', 'Pendiente', 17, 57, 'CV con experiencia en frío, aunque no detalla mantención preventiva.', false, null, null),
  (23, '4.777.888-9', 'Fernanda Castillo Ríos', 'Técnico de Alimentación y Fotoperíodo', 'En proceso', 27, 81, 'Experiencia técnica en alimentación y registro de variables. Buen ajuste.', false, 'En evaluación', 'Buen manejo técnico y registro de variables.'),
  (24, '3.888.999-0', 'Matías Arancibia Pérez', 'Asistente de Aseguramiento de Calidad', 'Finalizada', 29, 69, 'Formación en calidad y experiencia en plantas. Ajuste medio.', false, 'Recomendable con Observaciones', 'Experiencia en calidad; falta detalle de auditorías.'),
  (25, '2.999.000-1', 'Sofía Vergara Núñez', 'Operador de Grúa Horquilla y Logística', 'Pendiente', 14, 76, 'Experiencia logística y manejo de inventario. Buen ajuste.', false, null, null),
  (26, '21.111.222-3', 'Tomás Cárdenas Leiva', 'Buzo Especialista en Redes y Fondeo', 'En proceso', 23, 45, 'CV sin certificaciones ni horas de inmersión. Alerta.', true, 'En evaluación', 'CV sin certificaciones ni horas de inmersión.'),
  (27, '22.222.333-4', 'Isidora Fuentes Araya', 'Analista de Laboratorio y Microbiología', 'Finalizada', 11, 88, 'Perfil de laboratorio y microbiología. Alto ajuste.', false, 'Recomendable', 'Perfil de laboratorio y microbiología.'),
  (28, '23.333.444-5', 'Benjamín Rojas Vidal', 'Otro Cargo Operativo / Administrativo', 'Pendiente', 13, 63, 'Perfil administrativo con poca experiencia operativa.', false, null, null),
  (29, '24.444.555-6', 'Amanda Pérez Lagos', 'Operario de Planta de Procesos', 'En proceso', 10, 72, 'Experiencia operativa y disponibilidad para turnos.', false, 'En evaluación', 'Experiencia operativa y disponibilidad.'),
  (30, '25.555.666-7', 'Renato Gálvez Soto', 'Supervisor de Cultivo Agua Mar', 'Finalizada', 4, 84, 'Experiencia en cultivo y supervisión de equipos. Buen ajuste.', false, 'Recomendable', 'Experiencia en cultivo y supervisión.');

-- 4. Candidatos demo -------------------------------------------

insert into public.candidatos (
  rut, nombre_completo, nombres, email, telefono, direccion,
  estado_id, creado_por, origen_registro
)
select distinct on (public.fn_normalizar_rut(d.rut))
  d.rut,
  d.nombre,
  d.nombre,
  'demo.' || lower(regexp_replace(d.rut, '[^0-9kK]', '', 'g')) || '@aquachile.cl',
  '+56 9 ' || lpad((1000 + d.n)::text, 4, '0') || ' ' || lpad((2000 + d.n)::text, 4, '0'),
  'Direccion Demo ' || d.n || ', Puerto Montt',
  (select id from public.estados_candidato where codigo = 'NUEVO'),
  (select id from public.cuentas where correo = 'admin@aquachile.cl'),
  'DEMO_IA'
from tmp_demo_ia_datos d
order by public.fn_normalizar_rut(d.rut), d.n
on conflict (rut_normalizado) do update
set nombre_completo = excluded.nombre_completo,
    nombres = excluded.nombres,
    email = excluded.email,
    telefono = excluded.telefono,
    direccion = excluded.direccion,
    updated_at = now();

-- 5. Solicitudes demo ------------------------------------------

insert into public.solicitudes (
  codigo, rut, candidato, correo, telefono, direccion, cargo, familia_cargo,
  fecha_solicitud, solicitado_por, responsable, cv_adjunto, estado,
  observaciones, evaluacion, candidato_id, cargo_id, familia_cargo_id,
  estado_id, es_interno, solicitado_por_id, evaluador_asignado_id,
  prioridad, compatibilidad_porcentaje, comentario_ia_cv,
  alerta_cv_inconsistente, ia_analisis, ia_actualizado_por,
  ia_actualizado_at, created_at, updated_at
)
select
  'SOL-DEMO-IA-' || lpad(d.n::text, 2, '0'),
  d.rut,
  d.nombre,
  'demo.' || lower(regexp_replace(d.rut, '[^0-9kK]', '', 'g')) || '@aquachile.cl',
  '+56 9 ' || lpad((1000 + d.n)::text, 4, '0') || ' ' || lpad((2000 + d.n)::text, 4, '0'),
  'Direccion Demo ' || d.n || ', Puerto Montt',
  d.cargo,
  fc.familia_nombre,
  current_date - d.dias,
  'Carga demo IA',
  (select nombre from public.cuentas where correo = 'evaluador@aquachile.cl'),
  'CV_' || 'SOL-DEMO-IA-' || lpad(d.n::text, 2, '0') || '.pdf',
  d.estado,
  'Solicitud demo generada para pruebas de compatibilidad IA.',
  jsonb_build_object(
    'fechaEntrevista', case when d.estado = 'Pendiente' then '' else to_char(current_date - d.dias + 3, 'YYYY-MM-DD') end,
    'resultado', coalesce(d.resultado, ''),
    'observacionesEvaluador', coalesce(d.obs_eval, ''),
    'archivoTranscripcion', case when d.estado = 'Pendiente' then '' else 'Pauta_Entrevista_' || 'SOL-DEMO-IA-' || lpad(d.n::text, 2, '0') || '.pdf' end,
    'archivoInformeFinal', case when d.estado = 'Finalizada' then 'Informe_Psicolaboral_' || 'SOL-DEMO-IA-' || lpad(d.n::text, 2, '0') || '.pdf' else '' end
  ),
  c.id,
  fc.cargo_id,
  fc.familia_id,
  es.id,
  false,
  (select id from public.cuentas where correo = 'analista@aquachile.cl'),
  (select id from public.cuentas where correo = 'evaluador@aquachile.cl'),
  'MEDIA',
  d.compatibilidad,
  d.comentario,
  d.alerta,
  jsonb_build_object(
    'fuente', 'demo',
    'compatibilidad_sugerida', d.compatibilidad,
    'nivel_riesgo', case when d.alerta then 'ALTO' else 'BAJO' end,
    'hallazgos', jsonb_build_array(d.comentario),
    'alertas', case when d.alerta then jsonb_build_array('Requiere verificacion documental del CV') else '[]'::jsonb end
  ),
  (select id from public.cuentas where correo = 'evaluador@aquachile.cl'),
  now() - (d.n || ' hours')::interval,
  now() - (d.dias || ' days')::interval,
  now() - (d.dias || ' days')::interval
from tmp_demo_ia_datos d
join public.candidatos c on c.rut_normalizado = public.fn_normalizar_rut(d.rut)
cross join lateral public.fn_resolver_cargo(d.cargo, null) fc
join public.estados_solicitud es on es.codigo = case d.estado
  when 'Pendiente' then 'PENDIENTE'
  when 'En proceso' then 'EN_PROCESO'
  when 'Finalizada' then 'FINALIZADA'
  else 'PENDIENTE'
end
where not exists (
  select 1 from public.solicitudes s
  where s.codigo = 'SOL-DEMO-IA-' || lpad(d.n::text, 2, '0')
);

-- 6. Documentos demo -------------------------------------------

insert into public.documentos (
  solicitud_id, candidato_id, tipo_documento_id, nombre_archivo, subido_por
)
select
  s.id,
  s.candidato_id,
  td.id,
  'CV_' || s.codigo || '.pdf',
  s.evaluador_asignado_id
from public.solicitudes s
join tmp_demo_ia_datos d
  on s.codigo = 'SOL-DEMO-IA-' || lpad(d.n::text, 2, '0')
join public.tipos_documento td on td.codigo = 'CV'
on conflict (solicitud_id, tipo_documento_id) do update
set nombre_archivo = excluded.nombre_archivo,
    candidato_id = excluded.candidato_id,
    subido_por = excluded.subido_por;

insert into public.documentos (
  solicitud_id, candidato_id, tipo_documento_id, nombre_archivo, subido_por
)
select
  s.id,
  s.candidato_id,
  td.id,
  'Pauta_Entrevista_' || s.codigo || '.pdf',
  s.evaluador_asignado_id
from public.solicitudes s
join tmp_demo_ia_datos d
  on s.codigo = 'SOL-DEMO-IA-' || lpad(d.n::text, 2, '0')
join public.tipos_documento td on td.codigo = 'PAUTA_ENTREVISTA'
where d.estado <> 'Pendiente'
on conflict (solicitud_id, tipo_documento_id) do update
set nombre_archivo = excluded.nombre_archivo,
    candidato_id = excluded.candidato_id,
    subido_por = excluded.subido_por;

insert into public.documentos (
  solicitud_id, candidato_id, tipo_documento_id, nombre_archivo, subido_por
)
select
  s.id,
  s.candidato_id,
  td.id,
  'Informe_Psicolaboral_' || s.codigo || '.pdf',
  s.evaluador_asignado_id
from public.solicitudes s
join tmp_demo_ia_datos d
  on s.codigo = 'SOL-DEMO-IA-' || lpad(d.n::text, 2, '0')
join public.tipos_documento td on td.codigo = 'INFORME_PSICOLABORAL'
where d.estado = 'Finalizada'
on conflict (solicitud_id, tipo_documento_id) do update
set nombre_archivo = excluded.nombre_archivo,
    candidato_id = excluded.candidato_id,
    subido_por = excluded.subido_por;

-- 7. Evaluaciones sincronizadas con el JSONB -------------------

insert into public.evaluaciones (
  solicitud_id, evaluador_id, fecha_entrevista, resultado_id,
  observaciones, fecha_evaluacion
)
select
  s.id,
  s.evaluador_asignado_id,
  current_date - d.dias + 3,
  re.id,
  d.obs_eval,
  case
    when d.resultado is not null then (current_date - d.dias + 4)::timestamptz
    else null
  end
from public.solicitudes s
join tmp_demo_ia_datos d
  on s.codigo = 'SOL-DEMO-IA-' || lpad(d.n::text, 2, '0')
left join public.resultados_evaluacion re
  on lower(re.nombre) = lower(coalesce(d.resultado, ''))
where d.estado <> 'Pendiente'
on conflict (solicitud_id) do update
set evaluador_id = excluded.evaluador_id,
    fecha_entrevista = excluded.fecha_entrevista,
    resultado_id = excluded.resultado_id,
    observaciones = excluded.observaciones,
    fecha_evaluacion = excluded.fecha_evaluacion,
    updated_at = now();

-- 8. Estados de candidato --------------------------------------

update public.candidatos c
set estado_id = ec.id,
    updated_at = now()
from (
  select
    public.fn_normalizar_rut(d.rut) as rut,
    case
      when bool_or(d.resultado in ('Recomendable', 'Recomendable con Observaciones')) then 'APTO'
      when bool_or(d.resultado = 'No Recomendable') then 'NO_APTO'
      when bool_or(d.estado = 'En proceso') then 'EN_EVALUACION'
      else 'NUEVO'
    end as codigo
  from tmp_demo_ia_datos d
  group by public.fn_normalizar_rut(d.rut)
) x
join public.estados_candidato ec on ec.codigo = x.codigo
where c.rut_normalizado = x.rut;

-- 9. Historial de cambios --------------------------------------

insert into public.historial_cambios (
  tabla, registro_id, solicitud_id, accion, datos_nuevos,
  usuario_id, motivo, created_at
)
select
  'solicitudes',
  s.id,
  s.id,
  'INSERT',
  jsonb_build_object(
    'codigo', s.codigo,
    'estado', s.estado,
    'compatibilidad_porcentaje', s.compatibilidad_porcentaje
  ),
  s.evaluador_asignado_id,
  'DEMO_IA_INSERT',
  s.created_at
from public.solicitudes s
join tmp_demo_ia_datos d
  on s.codigo = 'SOL-DEMO-IA-' || lpad(d.n::text, 2, '0')
where not exists (
  select 1 from public.historial_cambios h
  where h.tabla = 'solicitudes'
    and h.registro_id = s.id
    and h.motivo = 'DEMO_IA_INSERT'
);

insert into public.historial_cambios (
  tabla, registro_id, solicitud_id, accion, datos_anteriores,
  datos_nuevos, usuario_id, motivo, created_at
)
select
  'solicitudes',
  s.id,
  s.id,
  'UPDATE',
  jsonb_build_object('compatibilidad_porcentaje', null, 'alerta_cv_inconsistente', false),
  jsonb_build_object(
    'compatibilidad_porcentaje', s.compatibilidad_porcentaje,
    'alerta_cv_inconsistente', s.alerta_cv_inconsistente,
    'comentario_ia_cv', s.comentario_ia_cv
  ),
  s.ia_actualizado_por,
  'DEMO_IA_UPDATE',
  s.ia_actualizado_at
from public.solicitudes s
join tmp_demo_ia_datos d
  on s.codigo = 'SOL-DEMO-IA-' || lpad(d.n::text, 2, '0')
where not exists (
  select 1 from public.historial_cambios h
  where h.tabla = 'solicitudes'
    and h.registro_id = s.id
    and h.motivo = 'DEMO_IA_UPDATE'
);

insert into public.historial_cambios (
  tabla, registro_id, accion, datos_nuevos, usuario_id, motivo, created_at
)
select
  'configuracion_ia',
  1,
  'UPDATE',
  jsonb_build_object('modelo', 'gpt-4.1-mini', 'activo', true),
  (select id from public.cuentas where correo = 'admin@aquachile.cl'),
  'DEMO_IA_CONFIG',
  now()
where not exists (
  select 1 from public.historial_cambios h
  where h.tabla = 'configuracion_ia'
    and h.registro_id = 1
    and h.motivo = 'DEMO_IA_CONFIG'
);

insert into public.historial_cambios (
  tabla, registro_id, accion, datos_nuevos, usuario_id, motivo, created_at
)
select
  'cargos',
  c.id,
  'UPDATE',
  jsonb_build_object('perfil_ia', c.perfil_ia),
  (select id from public.cuentas where correo = 'admin@aquachile.cl'),
  'DEMO_IA_CARGO',
  now()
from public.cargos c
where c.perfil_ia is not null
  and not exists (
    select 1 from public.historial_cambios h
    where h.tabla = 'cargos'
      and h.registro_id = c.id
      and h.motivo = 'DEMO_IA_CARGO'
  );

-- 10. Historial de estados -------------------------------------

insert into public.historial_estados_solicitud (
  solicitud_id, estado_anterior_id, estado_nuevo_id,
  usuario_id, comentario, created_at
)
select
  s.id,
  null,
  s.estado_id,
  s.evaluador_asignado_id,
  'Carga demo IA',
  s.created_at
from public.solicitudes s
join tmp_demo_ia_datos d
  on s.codigo = 'SOL-DEMO-IA-' || lpad(d.n::text, 2, '0')
where not exists (
  select 1 from public.historial_estados_solicitud h
  where h.solicitud_id = s.id
    and h.comentario = 'Carga demo IA'
);

insert into public.historial_estados_solicitud (
  solicitud_id, estado_anterior_id, estado_nuevo_id,
  usuario_id, comentario, created_at
)
select
  s.id,
  (select id from public.estados_solicitud where codigo = 'EN_PROCESO'),
  s.estado_id,
  s.evaluador_asignado_id,
  'Cierre de evaluacion demo',
  s.updated_at
from public.solicitudes s
join tmp_demo_ia_datos d
  on s.codigo = 'SOL-DEMO-IA-' || lpad(d.n::text, 2, '0')
where d.estado = 'Finalizada'
  and not exists (
    select 1 from public.historial_estados_solicitud h
    where h.solicitud_id = s.id
      and h.comentario = 'Cierre de evaluacion demo'
  );

select set_config('app.skip_audit', '0', true);

commit;

notify pgrst, 'reload schema';
