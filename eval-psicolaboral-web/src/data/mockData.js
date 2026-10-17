export const FAMILIAS_CARGO = [
  "Operario Calificado",
  "Administrativo",
  "Técnico Especialista",
  "Jefatura / Supervisión",
  "Profesional"
];

export const CUENTAS_AUTORIZADAS = [
  {
    id: 1,
    correo: "admin@aquachile.cl",
    password: "123",
    nombre: "Administrador General",
    rol: "ADMIN",
    tituloRol: "Administrador de Sistemas RRHH",
    fechaAlta: "2026-08-01"
  },
  {
    id: 2,
    correo: "analista@aquachile.cl",
    password: "123",
    nombre: "Camila Muñoz",
    rol: "ANALISTA",
    tituloRol: "Analista de Reclutamiento",
    fechaAlta: "2026-08-15"
  },
  {
    id: 3,
    correo: "evaluador@aquachile.cl",
    password: "123",
    nombre: "María Victoria Bustamante",
    rol: "EVALUADOR",
    tituloRol: "Profesional Evaluador",
    fechaAlta: "2026-08-20"
  }
];

export const SOLICITUDES_INICIALES = [
  {
    id: 1,
    rut: "18.342.195-2",
    candidato: "Esteban Morales",
    correo: "esteban.morales@ejemplo.cl",
    telefono: "+56 9 8765 4321",
    direccion: "Av. Angelmó 1240, Puerto Montt",
    cargo: "Operador de Máquina",
    familiaCargo: "Operario Calificado",
    fechaSolicitud: "2026-09-28",
    solicitadoPor: "Camila Muñoz",
    responsable: "María Victoria Bustamante",
    cvAdjunto: "CV_Esteban_Morales.pdf",
    estado: "Pendiente",
    observaciones: "Postulante con disponibilidad inmediata para turnos rotativos en planta.",
    evaluacion: {
      fechaEntrevista: "",
      resultado: "",
      observacionesEvaluador: "",
      archivoTranscripcion: "",
      archivoInformeFinal: ""
    }
  },
  {
    id: 2,
    rut: "19.124.873-K",
    candidato: "Carolina Ríos",
    correo: "carolina.rios@ejemplo.cl",
    telefono: "+56 9 7654 3210",
    direccion: "Calle Los Notros 452, Puerto Varas",
    cargo: "Analista de Calidad",
    familiaCargo: "Técnico Especialista",
    fechaSolicitud: "2026-09-29",
    solicitadoPor: "Camila Muñoz",
    responsable: "María Victoria Bustamante",
    cvAdjunto: "CV_Carolina_Rios.pdf",
    estado: "En proceso",
    observaciones: "Experiencia previa de 3 años en plantas de salmón.",
    evaluacion: {
      fechaEntrevista: "2026-10-05",
      resultado: "En evaluación",
      observacionesEvaluador: "Entrevista en curso. Se espera consolidar notas de competencias.",
      archivoTranscripcion: "Transcripcion_Entrevista_Carolina_Rios.docx",
      archivoInformeFinal: ""
    }
  },
  {
    id: 3,
    rut: "16.482.901-5",
    candidato: "Rodrigo Valenzuela",
    correo: "rodrigo.valenzuela@ejemplo.cl",
    telefono: "+56 9 6543 2109",
    direccion: "Pasaje Alerce 88, Castro, Chiloé",
    cargo: "Supervisor de Piscicultura",
    familiaCargo: "Jefatura / Supervisión",
    fechaSolicitud: "2026-09-25",
    solicitadoPor: "Camila Muñoz",
    responsable: "María Victoria Bustamante",
    cvAdjunto: "CV_Rodrigo_Valenzuela.pdf",
    estado: "Finalizada",
    observaciones: "Postulación para centros de agua dulce.",
    evaluacion: {
      fechaEntrevista: "2026-09-27",
      resultado: "Recomendable",
      observacionesEvaluador: "Cumple con el perfil de competencias para trabajo en terreno y liderazgo.",
      archivoTranscripcion: "Transcripcion_Entrevista_Rodrigo_Valenzuela.docx",
      archivoInformeFinal: "Informe_Psicolaboral_Rodrigo_Valenzuela.pdf"
    }
  }
];