-- ============================================================
-- Parte 3 - CV en Google Drive (AquaChile)
-- ------------------------------------------------------------
-- Ejecutar DESPUÉS de schema.sql y parte2_seguridad.sql.
-- Es idempotente: se puede volver a ejecutar sin duplicar.
--
-- Agrega la columna que guarda el ID del archivo del CV en Drive.
-- cv_adjunto sigue guardando solo el nombre del archivo.
-- ============================================================

alter table public.solicitudes
  add column if not exists cv_drive_file_id text;
