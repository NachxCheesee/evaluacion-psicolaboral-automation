import { cliente, resolver } from "./conexion";

const TIPOS = {
  CV: "cv_adjunto",
  PAUTA_ENTREVISTA: "entrevista_archivo",
  INFORME_PSICOLABORAL: "informe_archivo"
};

export async function listarDocumentosSolicitud(solicitudId) {
  const fila = await resolver(
    cliente()
      .from("vw_solicitudes_completas")
      .select("id, cv_adjunto, entrevista_archivo, informe_archivo")
      .eq("id", solicitudId)
      .maybeSingle()
  );

  if (!fila) return [];

  return Object.entries(TIPOS)
    .map(([codigo, campo]) => ({
      codigo,
      nombreArchivo: fila[campo]
    }))
    .filter((documento) => Boolean(documento.nombreArchivo));
}
