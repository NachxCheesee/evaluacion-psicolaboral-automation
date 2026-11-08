import React from 'react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="min-vh-100 d-flex flex-column bg-light text-dark">
      {/* 1. NAVEGACIÓN CORPORATIVA FIJA */}
      <nav className="navbar navbar-expand-lg bg-white border-bottom sticky-top py-3">
        <div className="container">
          <Link to="/" className="navbar-brand d-flex align-items-center gap-2 text-decoration-none">
            <i className="bi bi-water text-primary fs-4"></i>
            <span className="fw-bold fs-4 text-primary tracking-tight">AquaChile</span>
            <span className="text-secondary small border-start ps-2 d-none d-sm-inline">
              Carreras & Selección
            </span>
          </Link>

          <div className="d-flex align-items-center gap-2">
            <Link to="/postular" className="btn btn-primary btn-sm px-3 fw-semibold d-flex align-items-center gap-1">
              <i className="bi bi-file-earmark-person"></i>
              <span>Postular CV</span>
            </Link>
            <Link to="/login" className="btn btn-outline-secondary btn-sm px-3 d-flex align-items-center gap-1">
              <i className="bi bi-person-lock"></i>
              <span>Portal Colaboradores</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. HERO PRINCIPAL: IMAGEN AUSTRAL CON ACCESO DIRECTO */}
      <section
        className="position-relative text-white py-5 d-flex align-items-center"
        style={{
          minHeight: '440px',
          backgroundImage: `linear-gradient(rgba(10, 25, 47, 0.78), rgba(10, 25, 47, 0.88)), url('/images/hero-aquachile.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="container py-4 text-center">
          {/* Píldora sutil con efecto vidrio translúcido */}
          <div className="badge-hero-aquachile d-inline-flex align-items-center gap-2 small fw-semibold text-uppercase mb-3">
            <i className="bi bi-award fs-6"></i>
            <span>Líder en Acuicultura Sustentable y Producción Austral</span>
          </div>

          <h1 className="display-5 fw-bold text-white mb-3" style={{ letterSpacing: '-0.5px' }}>
            Crea tu propio camino en AquaChile
          </h1>

          <p className="lead text-light-50 mx-auto mb-4" style={{ maxWidth: '680px', color: '#e2e8f0' }}>
            Súmate al equipo que alimenta al mundo desde el sur austral de Chile. Conoce nuestras convocatorias en plantas de proceso, pisciculturas y centros de cultivo.
          </p>

          <div className="d-flex justify-content-center">
            <Link to="/postular" className="btn btn-primary px-4 py-2 fw-semibold d-flex align-items-center gap-2 shadow-sm">
              <i className="bi bi-file-earmark-arrow-up"></i>
              <span>Postular mi Currículum</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. BARRA DE MÉTRICAS */}
      <section className="bg-white border-bottom py-4">
        <div className="container">
          <div className="row text-center g-3">
            <div className="col-6 col-md-3">
              <div className="fw-bold fs-4 text-primary">+5.000</div>
              <div className="text-muted small">Colaboradores en Chile</div>
            </div>
            <div className="col-6 col-md-3">
              <div className="fw-bold fs-4 text-primary">N° 2 Mundial</div>
              <div className="text-muted small">En Producción de Salmón</div>
            </div>
            <div className="col-6 col-md-3">
              <div className="fw-bold fs-4 text-primary">+40 Países</div>
              <div className="text-muted small">Mercados de Exportación</div>
            </div>
            <div className="col-6 col-md-3">
              <div className="fw-bold fs-4 text-primary">100% Digital</div>
              <div className="text-muted small">Evaluación Psicolaboral</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. ÁREAS DE TRABAJO (GRID SIMÉTRICO CON FOTOS 16:9) */}
      <section className="py-5 bg-light">
        <div className="container py-2">
          <div className="text-center mb-5">
            <span className="badge bg-primary-subtle text-primary text-uppercase fw-semibold px-3 py-1 mb-2">
              Desarrollo Profesional
            </span>
            <h2 className="fw-bold text-dark mb-2">Nuestras Principales Áreas de Faena</h2>
            <p className="text-muted mx-auto" style={{ maxWidth: '640px' }}>
              Operamos con los más altos estándares de bioseguridad, habitabilidad y tecnología en cada fase productiva.
            </p>
          </div>

          <div className="row g-4">
            {/* Foto 1: Planta de Procesos */}
            <div className="col-md-6 col-lg-4">
              <div className="card h-100 border-0 shadow-sm rounded-3 overflow-hidden bg-white">
                <div className="ratio ratio-16x9">
                  <img
                    src="/images/planta-proceso1.jpg"
                    alt="Planta de Proceso"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div className="card-body p-4">
                  <h6 className="fw-bold text-dark mb-1">Plantas de Proceso</h6>
                  <p className="text-muted small mb-0">
                    Operarios de línea, faena primaria, fileteo, calibrado y control de despacho con estándares de inocuidad internacional.
                  </p>
                </div>
              </div>
            </div>

            {/* Foto 2: Centros de Cultivo en Mar */}
            <div className="col-md-6 col-lg-4">
              <div className="card h-100 border-0 shadow-sm rounded-3 overflow-hidden bg-white">
                <div className="ratio ratio-16x9">
                  <img
                    src="/images/cultivo-mar1.jpg"
                    alt="Centros de Mar"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div className="card-body p-4">
                  <h6 className="fw-bold text-dark mb-1">Centros de Cultivo en Mar</h6>
                  <p className="text-muted small mb-0">
                    Técnicos de alimentación, asistentes de pontón, biólogos y especialistas en fotoperíodo en fiordos australes.
                  </p>
                </div>
              </div>
            </div>

            {/* Foto 3: Mantención y Frío Industrial */}
            <div className="col-md-6 col-lg-4">
              <div className="card h-100 border-0 shadow-sm rounded-3 overflow-hidden bg-white">
                <div className="ratio ratio-16x9">
                  <img
                    src="/images/mantencion-frio.jpg"
                    alt="Mantención y Frío"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div className="card-body p-4">
                  <h6 className="fw-bold text-dark mb-1">Mantención y Frío Industrial</h6>
                  <p className="text-muted small mb-0">
                    Electromecánicos, técnicos de sistemas de amoníaco, maestranza y operadores de grúa horquilla para bodegas frigoríficas.
                  </p>
                </div>
              </div>
            </div>

            {/* Foto 4: Calidad y Laboratorio */}
            <div className="col-md-6 col-lg-4">
              <div className="card h-100 border-0 shadow-sm rounded-3 overflow-hidden bg-white">
                <div className="ratio ratio-16x9">
                  <img
                    src="/images/laboratorio-calidad.jpg"
                    alt="Laboratorio y Calidad"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div className="card-body p-4">
                  <h6 className="fw-bold text-dark mb-1">Aseguramiento de Calidad y Laboratorio</h6>
                  <p className="text-muted small mb-0">
                    Microbiólogos, químicos y auditores que garantizan la trazabilidad, inocuidad y certificación para exportación.
                  </p>
                </div>
              </div>
            </div>

            {/* Foto 5: Empaque y Valor Agregado */}
            <div className="col-md-6 col-lg-4">
              <div className="card h-100 border-0 shadow-sm rounded-3 overflow-hidden bg-white">
                <div className="ratio ratio-16x9">
                  <img
                    src="/images/planta-proceso2.jpg"
                    alt="Empaque y Valor Agregado"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div className="card-body p-4">
                  <h6 className="fw-bold text-dark mb-1">Empaque y Porcionado Final</h6>
                  <p className="text-muted small mb-0">
                    Cuadrillas operativas en salas de valor agregado, etiquetado automatizado y congelamiento continuo para mercados globales.
                  </p>
                </div>
              </div>
            </div>

            {/* Foto 6: Logística Insular */}
            <div className="col-md-6 col-lg-4">
              <div className="card h-100 border-0 shadow-sm rounded-3 overflow-hidden bg-white">
                <div className="ratio ratio-16x9">
                  <img
                    src="/images/cultivo-mar2.jpg"
                    alt="Operaciones Marítimas"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div className="card-body p-4">
                  <h6 className="fw-bold text-dark mb-1">Logística Insular y Fondeo</h6>
                  <p className="text-muted small mb-0">
                    Buzos especialistas en revisión de redes, tripulación de embarcaciones de apoyo y maniobras portuarias en el archipiélago.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CULTURA Y ADN CORPORATIVO */}
      <section className="py-5 bg-white border-top border-bottom">
        <div className="container py-2">
          <div className="text-center mb-5">
            <h3 className="fw-bold text-dark mb-2">Nuestro Compromiso con las Personas</h3>
            <p className="text-muted mx-auto" style={{ maxWidth: '600px' }}>
              Bases del modelo de gestión de personas y seguridad ocupacional en AquaChile.
            </p>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 border rounded-3 p-4 bg-light text-center">
                <div className="text-primary fs-3 mb-3">
                  <i className="bi bi-shield-check"></i>
                </div>
                <h5 className="fw-bold text-dark mb-2">Seguridad Ocupacional Primero</h5>
                <p className="text-muted small mb-0">
                  Cero tolerancia a riesgos críticos. Infraestructura con estándares certificados y capacitación preventiva permanente.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 border rounded-3 p-4 bg-light text-center">
                <div className="text-primary fs-3 mb-3">
                  <i className="bi bi-people"></i>
                </div>
                <h5 className="fw-bold text-dark mb-2">Movilidad y Ascenso Interno</h5>
                <p className="text-muted small mb-0">
                  Priorizamos convocatorias internas para que operarios y asistentes técnicos accedan a cargos de supervisión y jefatura.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 border rounded-3 p-4 bg-light text-center">
                <div className="text-primary fs-3 mb-3">
                  <i className="bi bi-geo"></i>
                </div>
                <h5 className="fw-bold text-dark mb-2">Identidad Austral</h5>
                <p className="text-muted small mb-0">
                  Compromiso con el empleo local y el desarrollo sustentable junto a las comunidades de Los Lagos, Aysén y Magallanes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SEDES GEOGRÁFICAS CON FONDO AUSTRAL */}
      <section
        className="py-5 position-relative text-white"
        style={{
          backgroundImage: `linear-gradient(rgba(10, 25, 47, 0.86), rgba(10, 25, 47, 0.90)), url('/images/hero-aquachile.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="container py-3">
          <div className="text-center mb-5">
            <div className="badge-hero-aquachile d-inline-flex align-items-center gap-2 small fw-semibold text-uppercase mb-2">
              <i className="bi bi-compass"></i>
              <span>Distribución Territorial</span>
            </div>
            <h2 className="fw-bold text-white mb-2">Presencia en el Sur Austral</h2>
            <p className="mx-auto" style={{ maxWidth: '600px', color: '#cbd5e1' }}>
              Instalaciones estratégicas diseñadas para responder a la geografía y logística austral de Chile.
            </p>
          </div>

          <div className="row g-3">
            <div className="col-md-6 col-lg-3">
              <div className="card border-0 rounded-3 p-3 bg-white text-dark h-100 shadow">
                <div className="card-body p-2">
                  <span className="badge bg-primary-subtle text-primary mb-2">Casa Matriz</span>
                  <h6 className="fw-bold text-dark mb-1">Puerto Montt</h6>
                  <p className="text-muted small mb-0">
                    Sede Cardonal, Planta de Procesos Chinquihue y talleres centrales de mantenimiento.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-6 col-lg-3">
              <div className="card border-0 rounded-3 p-3 bg-white text-dark h-100 shadow">
                <div className="card-body p-2">
                  <span className="badge bg-secondary mb-2">Pisciculturas</span>
                  <h6 className="fw-bold text-dark mb-1">Chiloé y Calbuco</h6>
                  <p className="text-muted small mb-0">
                    Centros de agua dulce en Castro y Chonchi, bases de pontones y centros de mar.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-6 col-lg-3">
              <div className="card border-0 rounded-3 p-3 bg-white text-dark h-100 shadow">
                <div className="card-body p-2">
                  <span className="badge bg-secondary mb-2">Fiordos y Canales</span>
                  <h6 className="fw-bold text-dark mb-1">Región de Aysén</h6>
                  <p className="text-muted small mb-0">
                    Bases en Puerto Chacabuco y Puerto Cisnes, con habitabilidad y turnos rotativos en faena.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-6 col-lg-3">
              <div className="card border-0 rounded-3 p-3 bg-white text-dark h-100 shadow">
                <div className="card-body p-2">
                  <span className="badge bg-secondary mb-2">Zona Austral</span>
                  <h6 className="fw-bold text-dark mb-1">Magallanes</h6>
                  <p className="text-muted small mb-0">
                    Centros de cultivo de aguas frías con asiento operativo en Punta Arenas y Puerto Natales.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CALL TO ACTION FINAL (ÚNICO BOTÓN A POSTULAR) */}
      <section className="bg-white border-top py-5 text-center">
        <div className="container py-3">
          <h3 className="fw-bold text-dark mb-2">¿Listo para postular tu perfil?</h3>
          <p className="text-muted mx-auto mb-4" style={{ maxWidth: '560px' }}>
            Ingresa tus antecedentes curriculares de forma directa. El registro no requiere cuenta previa y toma menos de 2 minutos.
          </p>
          <div className="d-flex justify-content-center">
            <Link to="/postular" className="btn btn-primary px-4 py-2 fw-semibold d-flex align-items-center gap-2 shadow-sm">
              <i className="bi bi-send"></i>
              <span>Comenzar Postulación</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 8. FOOTER INSTITUCIONAL */}
      <footer className="bg-dark text-white py-4 mt-auto border-top border-secondary">
        <div className="container d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 text-center text-sm-start text-muted small">
          <div>
            <strong className="text-white">AquaChile S.A.</strong> · Sistema Centralizado de Selección y Evaluación Psicolaboral
          </div>
          <div className="text-secondary">
            © {new Date().getFullYear()} Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}