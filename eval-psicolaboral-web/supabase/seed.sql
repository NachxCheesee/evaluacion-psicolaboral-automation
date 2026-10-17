-- ============================================================
-- Seed de datos iniciales (equivalente a src/data/mockData.js)
-- Ejecutar DESPUÉS de schema.sql en el SQL Editor de Supabase.
-- Idempotente: re-ejecutar no duplica registros.
-- ============================================================

begin;

-- 1. Cuentas institucionales (credenciales de demostración)
insert into public.cuentas (id, correo, password, nombre, rol, titulo_rol, fecha_alta)
values
  (1, 'admin@aquachile.cl', '123', 'Administrador General', 'ADMIN', 'Administrador de Sistemas RRHH', '2026-08-01'),
  (2, 'analista@aquachile.cl', '123', 'Camila Muñoz', 'ANALISTA', 'Analista de Reclutamiento', '2026-08-15'),
  (3, 'evaluador@aquachile.cl', '123', 'María Victoria Bustamante', 'EVALUADOR', 'Profesional Evaluador', '2026-08-20')
on conflict (id) do nothing;

-- 2. Solicitudes de ejemplo (incluye la evaluación anidada)
insert into public.solicitudes (
  id, rut, candidato, correo, telefono, direccion, cargo, familia_cargo,
  fecha_solicitud, solicitado_por, responsable, cv_adjunto, estado,
  observaciones, evaluacion
)
values
  (
    1,
    '18.342.195-2',
    'Esteban Morales',
    'esteban.morales@ejemplo.cl',
    '+56 9 8765 4321',
    'Av. Angelmó 1240, Puerto Montt',
    'Operador de Máquina',
    'Operario Calificado',
    '2026-09-28',
    'Camila Muñoz',
    'María Victoria Bustamante',
    'CV_Esteban_Morales.pdf',
    'Pendiente',
    'Postulante con disponibilidad inmediata para turnos rotativos en planta.',
    jsonb_build_object(
      'fechaEntrevista', '',
      'resultado', '',
      'observacionesEvaluador', '',
      'archivoTranscripcion', '',
      'archivoInformeFinal', ''
    )
  ),
  (
    2,
    '19.124.873-K',
    'Carolina Ríos',
    'carolina.rios@ejemplo.cl',
    '+56 9 7654 3210',
    'Calle Los Notros 452, Puerto Varas',
    'Analista de Calidad',
    'Técnico Especialista',
    '2026-09-29',
    'Camila Muñoz',
    'María Victoria Bustamante',
    'CV_Carolina_Rios.pdf',
    'En proceso',
    'Experiencia previa de 3 años en plantas de salmón.',
    jsonb_build_object(
      'fechaEntrevista', '2026-10-05',
      'resultado', 'En evaluación',
      'observacionesEvaluador', 'Entrevista en curso. Se espera consolidar notas de competencias.',
      'archivoTranscripcion', 'Transcripcion_Entrevista_Carolina_Rios.docx',
      'archivoInformeFinal', ''
    )
  ),
  (
    3,
    '16.482.901-5',
    'Rodrigo Valenzuela',
    'rodrigo.valenzuela@ejemplo.cl',
    '+56 9 6543 2109',
    'Pasaje Alerce 88, Castro, Chiloé',
    'Supervisor de Piscicultura',
    'Jefatura / Supervisión',
    '2026-09-25',
    'Camila Muñoz',
    'María Victoria Bustamante',
    'CV_Rodrigo_Valenzuela.pdf',
    'Finalizada',
    'Postulación para centros de agua dulce.',
    jsonb_build_object(
      'fechaEntrevista', '2026-09-27',
      'resultado', 'Recomendable',
      'observacionesEvaluador', 'Cumple con el perfil de competencias para trabajo en terreno y liderazgo.',
      'archivoTranscripcion', 'Transcripcion_Entrevista_Rodrigo_Valenzuela.docx',
      'archivoInformeFinal', 'Informe_Psicolaboral_Rodrigo_Valenzuela.pdf'
    )
  )
on conflict (id) do nothing;

-- 3. Ajustar las secuencias para que los próximos ids no colisionen
select setval(
  pg_get_serial_sequence('public.cuentas', 'id'),
  coalesce((select max(id) from public.cuentas), 0) + 1,
  false
);
select setval(
  pg_get_serial_sequence('public.solicitudes', 'id'),
  coalesce((select max(id) from public.solicitudes), 0) + 1,
  false
);

commit;
