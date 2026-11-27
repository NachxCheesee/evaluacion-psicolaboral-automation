import { cliente, resolver } from "./conexion";
import { FAMILIAS_CARGO } from "../data/mockData";

export const CATALOGOS_DEMO = {
  cargos: FAMILIAS_CARGO.map((nombre, indice) => ({
    id: indice + 1,
    nombre,
    familiaCargoId: null,
    familiaCargo: "Otros"
  })),
  cargosNombres: [...FAMILIAS_CARGO],
  familias: [{ id: 1, nombre: "Otros" }],
  roles: [
    { codigo: "ADMIN", nombre: "Administrador" },
    { codigo: "ANALISTA", nombre: "Analista de Reclutamiento" },
    { codigo: "EVALUADOR", nombre: "Evaluador Psicolaboral" }
  ],
  resultados: [
    { codigo: "EN_EVALUACION", nombre: "En evaluación" },
    { codigo: "RECOMENDABLE", nombre: "Recomendable" },
    {
      codigo: "RECOMENDABLE_CON_OBSERVACIONES",
      nombre: "Recomendable con Observaciones"
    },
    { codigo: "NO_RECOMENDABLE", nombre: "No Recomendable" }
  ],
  estadosSolicitud: [
    { codigo: "PENDIENTE", nombre: "Pendiente" },
    { codigo: "EN_PROCESO", nombre: "En proceso" },
    { codigo: "FINALIZADA", nombre: "Finalizada" }
  ],
  estadosUsuario: [
    { codigo: "ACTIVO", nombre: "Activo" },
    { codigo: "INACTIVO", nombre: "Inactivo" },
    { codigo: "BLOQUEADO", nombre: "Bloqueado" }
  ],
  tiposDocumento: [
    { codigo: "CV", nombre: "Currículo Vitae" },
    { codigo: "PAUTA_ENTREVISTA", nombre: "Pauta de Entrevista" },
    { codigo: "INFORME_PSICOLABORAL", nombre: "Informe Psicolaboral" }
  ],
  tiposEntrevista: [
    { codigo: "PRESENCIAL", nombre: "Presencial" },
    { codigo: "ONLINE", nombre: "Online" },
    { codigo: "TELEFONICA", nombre: "Telefónica" }
  ]
};

export async function listarCatalogos() {
  const [
    roles,
    permisos,
    familias,
    cargos,
    resultados,
    estadosSolicitud,
    estadosUsuario,
    tiposDocumento,
    tiposEntrevista
  ] = await Promise.all([
    resolver(cliente().from("roles").select("id, codigo, nombre, descripcion").eq("activo", true).order("nombre")),
    resolver(cliente().from("permisos").select("id, codigo, nombre, modulo").eq("activo", true).order("codigo")),
    resolver(cliente().from("familias_cargo").select("id, nombre").eq("activo", true).order("nombre")),
    resolver(cliente().from("cargos").select("id, nombre, familia_cargo_id").eq("activo", true).order("nombre")),
    resolver(
      cliente()
        .from("resultados_evaluacion")
        .select("id, codigo, nombre")
        .eq("activo", true)
        .order("nombre")
    ),
    resolver(
      cliente()
        .from("estados_solicitud")
        .select("id, codigo, nombre, orden, color")
        .eq("activo", true)
        .order("orden")
    ),
    resolver(cliente().from("estados_usuario").select("id, codigo, nombre").eq("activo", true).order("nombre")),
    resolver(cliente().from("tipos_documento").select("id, codigo, nombre").eq("activo", true).order("nombre")),
    resolver(cliente().from("tipos_entrevista").select("id, codigo, nombre").eq("activo", true).order("nombre"))
  ]);

  const familiasPorId = new Map((familias || []).map((familia) => [familia.id, familia.nombre]));
  const cargosMapeados = (cargos || []).map((cargo) => ({
    id: cargo.id,
    nombre: cargo.nombre,
    familiaCargoId: cargo.familia_cargo_id,
    familiaCargo: familiasPorId.get(cargo.familia_cargo_id) || "Otros"
  }));

  return {
    roles: roles || [],
    permisos: permisos || [],
    familias: familias || [],
    cargos: cargosMapeados,
    cargosNombres: cargosMapeados.map((cargo) => cargo.nombre),
    resultados: resultados || [],
    estadosSolicitud: estadosSolicitud || [],
    estadosUsuario: estadosUsuario || [],
    tiposDocumento: tiposDocumento || [],
    tiposEntrevista: tiposEntrevista || []
  };
}
