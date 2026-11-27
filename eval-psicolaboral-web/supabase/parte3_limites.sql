-- ============================================================
-- Parte 3 - Límites (AquaChile)
-- ------------------------------------------------------------
-- Ejecutar DESPUÉS de schema.sql, parte2_seguridad.sql y
-- parte3_cv_drive.sql. Idempotente.
--
-- Agrega la marca de creación de cada solicitud, usada para
-- contar el máximo de postulaciones por día.
-- ============================================================

alter table public.solicitudes
  add column if not exists created_at timestamptz default now();
